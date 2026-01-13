import os
import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Attr

cognito = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
USER_POOL_ID = os.environ['USER_POOL_ID']
TABLE_NAME = os.environ['USER_TABLE_NAME']
table = dynamodb.Table(TABLE_NAME)

SENSEMINDER_TABLE_NAME = "senseminder-user"
sense_table = dynamodb.Table(SENSEMINDER_TABLE_NAME)

def lambda_handler(event, context):
    try:
        method = event.get("httpMethod")

        # CORS preflight
        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": ""
            }

        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }

        # Authentication
        claims = event['requestContext']['authorizer']['claims']
        creator_email = claims.get('email')
        creator_sub = claims.get('sub')

        # Extract groups (comma-separated string)
        creator_groups_raw = claims.get('cognito:groups', '')
        if isinstance(creator_groups_raw, str):
            creator_groups = [g.strip().lower() for g in creator_groups_raw.split(',')]
        else:
            creator_groups = []

        # Determine owner_id based on group
        if 'admin' in creator_groups:
            owner_id = claims.get('custom:ownerid', creator_sub)
        else:
            owner_id = creator_sub

        if method == 'GET':
            if 'member' in creator_groups:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'message': 'Not authorized to view users.'})
                }

            response = table.scan()
            users = [item for item in response.get('Items', []) if item.get('owner_id') == owner_id]

            users_with_status = []
            for user in users:
                try:
                    cognito_res = cognito.admin_get_user(
                        UserPoolId=USER_POOL_ID,
                        Username=user['email']
                    )
                    user_status = cognito_res.get('UserStatus')
                    if user_status == 'CONFIRMED':
                        status = 'active'
                    elif user_status == 'FORCE_CHANGE_PASSWORD':
                        status = 'pending'
                    else:
                        status = user_status.lower()
                except Exception as e:
                    status = 'unknown'

                user['status'] = status
                users_with_status.append(user)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'users': users_with_status})
            }

        if method == 'DELETE':
            body = json.loads(event['body'])
            target_email = body.get('email')
            target_role = body.get('role')

            target_user = table.get_item(Key={'email': target_email}).get('Item')
            target_user_id = target_user.get('id') if target_user else None

            if not target_user:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found.'})
                }

            target_owner_id = target_user.get('owner_id')
            if target_owner_id != owner_id:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'message': 'Forbidden: Cannot delete user from another tenant.'})
                }

            if 'owner' in creator_groups:
                pass
            elif 'admin' in creator_groups and target_role == 'member':
                pass
            else:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'message': 'Not authorized to delete this user.'})
                }

            cognito.admin_remove_user_from_group(
                UserPoolId=USER_POOL_ID,
                Username=target_email,
                GroupName=target_role
            )
            cognito.admin_delete_user(
                UserPoolId=USER_POOL_ID,
                Username=target_email
            )
            if target_user_id:
                assignment_table = dynamodb.Table('SmartPC_ManagePCAssignments')
                response = assignment_table.scan(
                    FilterExpression=Attr('memberId').eq(target_user_id)
                )
                items_to_delete = response.get('Items', [])
                for item in items_to_delete:
                    assignment_table.delete_item(
                        Key={
                            'ownerId': item['ownerId'],
                            'instanceId': item['instanceId']
                        }
                    )
            table.delete_item(Key={'email': target_email})

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'User deleted successfully.'})
            }

        if method == 'POST':
            body = json.loads(event['body'])
            name = body.get('name', '').strip()
            email = body.get('email', '').strip()
            role = body.get('role', '').strip().lower()
            group = body.get('group', '').strip()

            name_parts = name.split()
            firstName = name_parts[0] if len(name_parts) > 0 else ''
            lastName = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

            allowed_roles = ['admin', 'member']
            if not name or not email or not role or role not in allowed_roles:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing or invalid fields.'})
                }

            if 'owner' in creator_groups and role in ['admin', 'member']:
                pass
            elif 'admin' in creator_groups and role == 'member':
                pass
            else:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'message': 'Not authorized to create this user role.'})
                }


            if 'owner' in creator_groups:
                lookup_id = creator_sub
            else:
                lookup_id = claims.get('custom:ownerid')
                
            try:
                res = sense_table.scan(
                    FilterExpression=Attr('id').eq(lookup_id)
                )
                items = res.get('Items', [])
                org_record = items[0] if items else {}
                organization = org_record.get('organization', '')
                print(f"Fetched org from senseminder-user for id={lookup_id}: '{organization}'")
            except Exception as e:
                print(f"Error fetching organization for id {lookup_id}: {e}")
                organization = ""
            print(f"ORG from senseminder-user for {lookup_id} is: '{organization}'")

            response = cognito.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'custom:firstName', 'Value': firstName},
                    {'Name': 'email_verified', 'Value': 'false'},
                    {'Name': 'custom:role', 'Value': role},
                    {'Name': 'custom:ownerid', 'Value': owner_id},
                    
                ],
                ClientMetadata={
                    'organization': organization
                },
                DesiredDeliveryMediums=['EMAIL']
            )

            cognito.admin_add_user_to_group(
                UserPoolId=USER_POOL_ID,
                Username=email,
                GroupName=role
            )

            user_attrs = response.get('User', {}).get('Attributes', [])
            user_id = next((attr['Value'] for attr in user_attrs if attr['Name'] == 'sub'), '')

            now_iso = datetime.utcnow().isoformat() + 'Z'
            dynamo_item = {
                "email": email,
                "country": "",
                "createdAt": now_iso,
                "firstName": firstName,
                "lastName": lastName,
                "id": user_id,
                "organization": organization,
                "phoneNumber": "",
                "role": role,
                "owner_id": owner_id,
                "federatedUser": True,
                "firstLogin": True,
                "group": group
            }
            table.put_item(Item=dynamo_item)

            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'message': 'User created and invited successfully.'})
            }

        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': f'Method {method} not allowed.'})
        }

    except Exception as e:
        print('Exception:', str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Error: ' + str(e)})
        }
