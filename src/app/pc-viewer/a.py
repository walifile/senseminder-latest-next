#after adding the admin member logic here. slight change is added in the lambda handler


import os
import boto3
# import base64
import json
import random
from datetime import datetime
import time
import jwt
from boto3.dynamodb.conditions import Key

# Initialize AWS clients
ec2 = boto3.client('ec2')
dynamodb = boto3.resource('dynamodb')
cognito_idp = boto3.client('cognito-idp')
# stepfunctions_client = boto3.client('stepfunctions')

# DynamoDB table names
DYNAMODB_CONFIG_TABLE = "SmartPCConfig"
DYNAMODB_EVENTS_TABLE = "SmartPCEvents"
DYNAMODB_KEYS_TABLE = "SmartPCKeys"
DYNAMODB_IPS_TABLE = "SmartPCIPs"
DYNAMODB_STATUS_TABLE = "SmartPCStatus"
DYNAMODB_SUBNET_COUNTS_TABLE = "SubnetVMCounts"
DYNAMODB_RESOURCE_TRACKING_TABLE = "SmartPCResourceTracking"
DYNAMODB_USER_PC_DATA_TABLE = "SmartPC-UserData"
DYNAMODB_ASSIGNMENT_TABLE="SmartPC_ManagePCAssignments"

# Environment variables
STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN")

# # Lambda function name
# def invoke_smart_target_balancer(instance_id, action):
#     try:
#         lambda_client.invoke(
#             FunctionName=os.environ['SMART_BALANCER_FUNCTION'],
#             InvocationType="Event",
#             Payload=json.dumps({"action": action, "instanceId": instance_id}).encode()
#         )
#         print(f"Invoked SmartTargetBalancer for action '{action}' on instance '{instance_id}'")
#     except Exception as e:
#         print(f"Failed to invoke SmartTargetBalancer: {e}")

# Helper function to trigger Step Function for create/delete
def trigger_step_function(input_payload):
    if not STATE_MACHINE_ARN:
        raise Exception("Missing STATE_MACHINE_ARN environment variable")

    response = stepfunctions_client.start_execution(
        stateMachineArn=STATE_MACHINE_ARN,
        input=json.dumps(input_payload)
    )
    print(f"Step Function triggered: {response['executionArn']}")
    return {
        "statusCode": 202,
        "body": json.dumps({
            "message": "VM operation triggered successfully",
            "executionArn": response['executionArn']
        })
    }

# Lambda function name
LAMBDA_NAME = "vm_management_svc"

def retry_with_backoff(func, max_retries=3, delay=1, *args, **kwargs):
    """Retry a function with exponential backoff."""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(delay * (2 ** attempt))
            else:
                raise e

def update_resource_status(instance_id, status):
    """
    Updates the resource status in both SmartPCStatus and SmartPCResourceTracking tables.
    """
    try:
        if not instance_id:
            raise Exception("Missing or invalid instanceId for updating resource status")

        # Prepare the item for SmartPCStatus table
        status_item = {
            "instanceId": instance_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        print(f"DEBUG: Writing resource status to SmartPCStatus: {status_item}")

        # Update SmartPCStatus table
        status_table = dynamodb.Table(DYNAMODB_STATUS_TABLE)
        status_table.put_item(Item=status_item)
        print(f"Resource status updated successfully in SmartPCStatus: {status_item}")

    except Exception as e:
        print(f"Error updating resource status: {e}")
        raise


def create_key_pair(instance_id):
    """
    Creates a key pair for the EC2 instance and stores it in DynamoDB and SmartPCResourceTracking.
    """
    try:
        # Generate a unique key name using the instance ID
        key_name = f"{instance_id}-key"

        # Create the key pair using EC2
        print(f"Creating key pair: {key_name}")
        response = ec2.create_key_pair(KeyName=key_name)

        # Save the private key material to the SmartPCKeys table
        keys_table = dynamodb.Table(DYNAMODB_KEYS_TABLE)
        keys_table.put_item(
            Item={
                "instanceId": instance_id,  # Associate with the EC2 instance
                "keyName": key_name,
                "keyMaterial": response['KeyMaterial'],
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        # # Log the key pair in resource tracking
        # log_resource_tracking(
        #     resource_id=key_name,
        #     resource_type="keyPair",
        #     associated_instance_id=instance_id,
        #     status="created"
        # )

        print(f"Key pair created and stored: {key_name}")
        return key_name
    except Exception as e:
        print(f"Error creating key pair: {e}")
        raise

def check_resource_status(instance_id):
    """Retrieve the current status of an EC2 instance."""
    try:
        response = ec2.describe_instance_status(InstanceIds=[instance_id])
        if not response['InstanceStatuses']:
            update_resource_status(instance_id, "not found or terminated")
            return {
                "statusCode": 404,
                "body": json.dumps({"message": f"Instance {instance_id} not found or terminated"})
            }

        instance_status = response['InstanceStatuses'][0]
        state = instance_status['InstanceState']['Name']
        system_status = instance_status['SystemStatus']['Status']
        instance_status_desc = instance_status['InstanceStatus']['Status']

        # Log the current status
        update_resource_status(instance_id, state)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "instanceId": instance_id,
                "state": state,
                "systemStatus": system_status,
                "instanceStatus": instance_status_desc
            })
        }
    except Exception as e:
        print(f"Error retrieving status for instance {instance_id}: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to retrieve instance status", "error": str(e)})
        }

def decode_jwt(token):
    try:
        # Decode the JWT token without verifying the signature
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        print(f"Decoded token: {decoded_token}")
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token format")
    except Exception as e:
        print(f"Error decoding JWT token: {e}")
        raise

def verify_user(decoded_token):
    try:
        # Check if the user is confirmed
        # if decoded_token.get('email_verified') != 'true':
        #     raise Exception("User's email is not verified.")
        
        # Check if the user is confirmed
        if decoded_token.get('cognito:groups') is None:
            raise Exception("User is not part of any group.")
        
        return True
    except Exception as e:
        print(f"Error verifying user: {e}")
        raise

def update_user_data_status(instance_id, status):
    """
    Updates the status attribute in the SmartPC-UserData table based on the instanceId.
    """
    try:
        user_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)

        # Query the table to find the item with the given instanceId
        response = user_data_table.query(
            KeyConditionExpression=Key('instanceId').eq(instance_id)
        )

        items = response.get('Items', [])

        if not items:
            print(f"No entry found for instanceId: {instance_id} in SmartPC-UserData.")
            return

        # Update the status attribute for each matching item
        for item in items:
            user_id = item['userId']
            user_data_table.update_item(
                Key={"instanceId": instance_id, "userId": user_id},
                UpdateExpression="SET #status = :status",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={":status": status}
            )
            print(f"Status updated successfully in SmartPC-UserData for instanceId: {instance_id}, userId: {user_id}")

    except Exception as e:
        print(f"Error updating status in SmartPC-UserData for instanceId {instance_id}: {e}")
        raise

def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response()
    try:
        # Parse 'body' from the event
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        # Extract token and user identity (for all actions) this part is added for the start/stop :assignment system check
        sub = role = owner_id = None  # defaults for system calls

        auth_header = event.get('headers', {}).get('authorization', '')
        if auth_header.startswith('Bearer ') or auth_header.startswith('bearer '):
            token = auth_header.split(' ')[1]
        else:
            token = auth_header

        if token:
            try:
                decoded_token = decode_jwt(token)
                sub = decoded_token.get("sub")
                role = decoded_token.get("custom:role")
                token_owner_id = decoded_token.get("custom:ownerid")

                owner_id = sub if role == "owner" else token_owner_id
                print(f"[DEBUG] Authenticated user: sub={sub}, role={role}, owner_id={owner_id}")
            except Exception as e:
                print(f"[DEBUG] Token decode failed or not present: {e}")
        
        # Extract token and user identity (for all actions) this part is added for the start/stop :assignment system check


        print(f"Received event: {event}")
        action = body.get('action')
        instance_id = body.get('instanceId')
        config_id = body.get('configId')
        # ami_id = body.get('amiId')
        system_name = body.get('systemName')
        region = body.get('region')
        storage_size_input = body.get('storageSize')

        # Authenticate user for create/delete actions
        user_id = None
        if action in ["create", "delete"]:
            auth_header = event.get('headers', {}).get('authorization', '')

            if auth_header.startswith('Bearer ') or auth_header.startswith('bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header

            decoded_token = decode_jwt(token)
            role = decoded_token.get("custom:role")
            owner_id = decoded_token.get("custom:ownerid")
            sub = decoded_token.get("sub")


            if not verify_user(decoded_token):
                return {
                    "statusCode": 403,
                    "body": json.dumps({"message": "User verification failed"})
                }


            if role == "member":
                return {
                    "statusCode": 403,
                    "body": json.dumps({"message": "Members are not allowed to create or delete instances"})
                }
            elif role == "admin":
                if not owner_id:
                    return {
                        "statusCode": 400,
                        "body": json.dumps({"message": "Missing custom:ownerid for admin user"})
                    }
                user_id = owner_id
            else:
                user_id = sub

            print(f"User ID: {user_id}")
            body['userId'] = user_id

        # Validate common parameters
        if not system_name and action not in ["checkStatus"] and not instance_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Missing required fields"})
            }

        # Handle actions
        # if action == "create":
        #     if not region or not config_id or not ami_id or not user_id:
        #         return {
        #             "statusCode": 400,
        #             "body": json.dumps({"message": "Missing region, configId, amiId, or userId"})
        #         }
        #     return create_instance(config_id, ami_id, system_name, region, user_id)
        if action == "create":
            if not region or not config_id or not user_id or not storage_size_input:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"message": "Missing region, configId, storageSize, or userId"})
                }

            try:
                storage_size_input = int(storage_size_input)
            except ValueError:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"message": "Invalid storageSize format, must be an integer"})
                }

            return create_instance(config_id, system_name, region, user_id, storage_size_input)

        elif action == "delete":
            if not region or not user_id:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"message": "Missing region or userId for delete action"})
                }
            return delete_instance(instance_id, system_name, region, user_id)

        elif action == "checkStatus":
            return check_resource_status(instance_id)

        elif action == "start":
            return start_instance(instance_id, system_name, sub, role, owner_id)

        elif action == "stop":
            return stop_instance(instance_id, system_name, sub, role, owner_id)

        else:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Invalid action"})
            }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error", "error": str(e)})
        }

# Additional Functions for SmartPCIPs and SmartPCResourceTracking
def store_instance_ips(instance_id, system_name, private_ip, public_ip, user_id):
    """Store private and public IPs of an instance in the SmartPCIPs table."""
    ips_table = dynamodb.Table(DYNAMODB_IPS_TABLE)
    ips_table.put_item(
        Item={
            "instanceId": instance_id,
            "userId": user_id,
            "systemName": system_name,
            "privateIp": private_ip,
            "publicIp": public_ip,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

def update_resource_tracking(resource_id, status, resource_type="EC2"):
    """
    Updates the resource tracking status in SmartPCResourceTracking table.
    """
    try:
        if not resource_id:
            raise Exception("Missing or invalid resourceId for updating resource tracking")

        item = {
            "resourceId": resource_id,
            "resourceType": resource_type,  # Include resourceType
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        print(f"DEBUG: Writing resource status to SmartPCResourceTracking: {item}")

        tracking_table = dynamodb.Table(DYNAMODB_RESOURCE_TRACKING_TABLE)
        tracking_table.put_item(Item=item)

        print(f"Resource tracking updated successfully: {item}")
    except Exception as e:
        print(f"Error updating resource tracking: {e}")
        raise

def delete_resource_tracking(resource_id, resource_type="EC2"):
    """
    Remove a resource from the SmartPCResourceTracking table after deletion.
    """
    try:
        tracking_table = dynamodb.Table(DYNAMODB_RESOURCE_TRACKING_TABLE)
        print(f"Deleting resource tracking entry for resourceId: {resource_id} and resourceType: {resource_type}")
        tracking_table.delete_item(
            Key={
                "resourceId": resource_id,
                "resourceType": resource_type  # Include sort key if it exists
            }
        )
        print(f"Resource tracking entry deleted successfully: resourceId={resource_id}, resourceType={resource_type}")
    except Exception as e:
        print(f"Error deleting resource tracking entry: {e}")
        raise

def delete_dcv_session_entry(user_id, instance_id):
    """
    Deletes the DCV session entry from SmartPCDCVSessions table using the userId and instanceId.
    """
    try:
        dcv_sessions_table = dynamodb.Table('SmartPCDCVSessions')

        # Query using GSI
        response = dcv_sessions_table.query(
            IndexName="userId-instanceId-index",
            KeyConditionExpression=Key('userId').eq(user_id) & Key('instanceId').eq(instance_id)
        )

        items = response.get('Items', [])
        if not items:
            print(f"No DCV session found for userId: {user_id} and instanceId: {instance_id}")
            return

        # Delete all matching session entries
        for item in items:
            print(f"Deleting DCV session: {item}")
            dcv_sessions_table.delete_item(
                Key={
                    'sessionId': item['sessionId']  # Assuming 'sessionId' is the primary key
                }
            )
            print(f"DCV session deleted: {item['sessionId']}")

    except Exception as e:
        print(f"Error deleting DCV session for userId {user_id} and instanceId {instance_id}: {e}")
        raise

def log_resource_tracking(resource_id, resource_type, associated_instance_id=None, status="created", **additional_fields):
    """
    Logs created resources and their associations in the SmartPCResourceTracking table.
    Allows optional additional fields for flexibility.
    """
    try:
        tracking_table = dynamodb.Table(DYNAMODB_RESOURCE_TRACKING_TABLE)
        
        # Base item to log
        item = {
            "resourceId": resource_id,
            "resourceType": resource_type,
            "associatedInstanceId": associated_instance_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add any additional fields passed to the function
        if additional_fields:
            item.update(additional_fields)
        
        # Write the item to the DynamoDB table
        tracking_table.put_item(Item=item)
        print(f"DEBUG: Resource tracking logged: {item}")
    except Exception as e:
        print(f"Error logging resource tracking: {e}")
        raise

def log_event(instance_id, system_name, action):
    try:
        # Construct the item
        item = {
            "instanceId": instance_id,
            "systemName": system_name,
            "action": action,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Debug log for the item
        print(f"DEBUG: Writing item to SmartPCEvents: {item}")

        # Perform the put_item operation
        events_table = dynamodb.Table(DYNAMODB_EVENTS_TABLE)
        events_table.put_item(Item=item)

        print(f"Event logged successfully: instanceId={instance_id}, action={action}")
    except Exception as e:
        print(f"Error logging event: {e}")
        raise

def validate_instance_type(ami_id, instance_type):
    """
    Validates if the given instance type is compatible with the AMI.
    """
    # Example list of compatible instance types for Nitro/UEFI
    compatible_types = ["c6a.large", "c6a.xlarge", "c6a.2xlarge", "c6a.4xlarge"]
    if instance_type not in compatible_types:
        raise Exception(f"Instance type {instance_type} is not compatible with AMI {ami_id}. "
                        f"Supported types: {', '.join(compatible_types)}")

def update_subnet_vm_count(region, subnet_id, increment=True):
    """
    Ensures vmCount exists and performs safe increment or decrement without going negative.
    """
    try:
        subnet_table = dynamodb.Table(DYNAMODB_SUBNET_COUNTS_TABLE)

        if increment:
            update_expression = "SET vmCount = if_not_exists(vmCount, :zero) + :val"
            expression_attribute_values = {
                ":val": 1,
                ":zero": 0
            }
        else:
            # Subtract safely, avoid going below zero
            response = subnet_table.get_item(
                Key={"region": region, "subnetId": subnet_id}
            )
            current = response.get("Item", {}).get("vmCount", 0)
            new_count = max(current - 1, 0)

            update_expression = "SET vmCount = :newVal"
            expression_attribute_values = {
                ":newVal": new_count
            }

        subnet_table.update_item(
            Key={"region": region, "subnetId": subnet_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        print(f"Subnet VM count updated for subnetId: {subnet_id}, new value: {expression_attribute_values}")
    except Exception as e:
        print(f"Error updating subnet VM count for subnetId {subnet_id}: {e}")
        raise

def check_user_quota(user_id):
    try:
        table = dynamodb.Table("SmartPCUserQuota")
        response = table.get_item(Key={"userId": user_id})
        item = response.get("Item")

        if not item:
            return False

        quota = int(item.get("quota", 0))
        used = int(item.get("usedCount", 0))

        return used < quota
    except Exception as e:
        print(f"Error checking user quota: {e}")
        return False

def increment_user_quota_usage(user_id):
    try:
        table = dynamodb.Table("SmartPCUserQuota")
        table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET usedCount = if_not_exists(usedCount, :start) + :inc",
            ExpressionAttributeValues={
                ":start": 0,
                ":inc": 1
            }
        )
    except Exception as e:
        print(f"Error incrementing quota usage: {e}")

def decrement_user_quota_usage(user_id):
    try:
        table = dynamodb.Table("SmartPCUserQuota")
        table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET usedCount = if_not_exists(usedCount, :start) - :dec",
            ExpressionAttributeValues={
                ":start": 0,
                ":dec": 1
            }
        )
        print(f"Quota decremented successfully for userId: {user_id}")
    except Exception as e:
        print(f"Error decrementing quota usage: {e}")

def create_instance(config_id, system_name, region, user_id, storage_size_input):
    instance_id = None
    key_name = None
    subnet_id = None
    private_ip = None
    public_ip = None
    try:
        # Check user quota before proceeding
        if not check_user_quota(user_id):
            return {
                "statusCode": 403,
                "body": json.dumps({"message": "Quota exceeded. Please request an increase to create more SmartPCs."})
            }
        # Check if the same system name exists for this user
        user_pc_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        response = user_pc_data_table.scan(
            FilterExpression=Key("userId").eq(user_id)
        )
        existing = response.get("Items", [])
        for item in existing:
            if item.get("systemName", "").lower() == system_name.lower():
                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "message": f"You already have a SmartPC named '{system_name}'. Please choose a different name."
                    })
                }

        # Get the least-used subnet
        subnet_id, current_count = get_least_used_subnet(region)

        # Fetch configuration details using only configId
        config_table = dynamodb.Table(DYNAMODB_CONFIG_TABLE)
        config_response = config_table.query(
            KeyConditionExpression=Key("configId").eq(config_id)
        )
        items = config_response.get("Items", [])
        if not items:
            raise Exception(f"No configuration found for configId: {config_id}")

        config = items[0]
        ami_id = config['amiId']
        machine_type = config['machineType']
        allowed_sizes = config.get('storageSize', [])

        # Validate against allowed sizes
        # Validate against allowed sizes
        if isinstance(allowed_sizes, str):
            allowed_sizes = [int(allowed_sizes.replace("GB", "").strip())]
        elif isinstance(allowed_sizes, list):
            allowed_sizes = [int(s.replace("GB", "").strip()) if isinstance(s, str) else s for s in allowed_sizes]

        if storage_size_input not in allowed_sizes:
            raise Exception(f"Invalid storage size {storage_size_input}GB. Allowed: {allowed_sizes}")

        security_group_id = config.get('securityGroupId')
        iam_instance_profile = config['iamInstanceProfile']

        if not security_group_id:
            raise Exception(f"Default security group not defined for configId: {config_id}")

        # Validate instance type compatibility
        validate_instance_type(ami_id, machine_type)

        # Launch the EC2 instance with the pre-created security group
        ec2_params = {
            "IamInstanceProfile": {
                "Name": iam_instance_profile
            },
            "ImageId": ami_id,
            "InstanceType": machine_type,
            "MinCount": 1,
            "MaxCount": 1,
            "NetworkInterfaces": [
                {
                    "AssociatePublicIpAddress": True,
                    "DeviceIndex": 0,
                    "SubnetId": subnet_id,
                    "Groups": [security_group_id]  # Use the pre-created security group
                }
            ],
            "TagSpecifications": [
                {
                    "ResourceType": "instance",
                    "Tags": [{"Key": "Name", "Value": system_name}]
                }
            ],
            "BlockDeviceMappings": [
                {
                    "DeviceName": "/dev/sda1",
                    "Ebs": {
                        "VolumeSize": int(storage_size_input),
                        "VolumeType": "gp3"
                    }
                }
            ]
        }
        print(f"Launching instance with params: {ec2_params}")
        launch_result = ec2.run_instances(**ec2_params)

        # Extract instance details
        instance = launch_result['Instances'][0]
        instance_id = instance['InstanceId']
        private_ip = instance['PrivateIpAddress']
        public_ip = instance.get('PublicIpAddress')

        print(f"Instance launched: instanceId={instance_id}, privateIp={private_ip}, publicIp={public_ip}")

        # Create a key pair after instance launch
        key_name = create_key_pair(instance_id)

        # Store IPs in DynamoDB
        store_instance_ips(instance_id, system_name, private_ip, public_ip, user_id)

        # Log the event
        log_event(instance_id, system_name, "create")
        update_resource_status(instance_id, "running")
        

        # Log instance in resource tracking
        log_resource_tracking(
            resource_id=instance_id,
            resource_type="instance",
            status="running",
            associated_instance_id=instance_id,
            subnetId=subnet_id,  # Add subnetId to tracking
            configId=config_id,
            storageSize=int(storage_size_input),
            region=region
        )

        # Store data in user-pc-data table
        user_pc_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        user_pc_data_table.put_item(
            Item={
                "instanceId": instance_id,
                "userId": user_id,
                "systemName": system_name,
                "privateIp": private_ip,
                "publicIp": public_ip,
                "subnetId": subnet_id,
                "region": region,
                "status": "running",  # Initial status
                "createdAt": datetime.utcnow().isoformat(),
                "configId": config_id,
                "storageSize": int(storage_size_input)
            }
        )

        # Increment quota usage
        increment_user_quota_usage(user_id)

        # Increment VM count for the subnet
        update_subnet_vm_count(region, subnet_id, increment=True)
       
        # Store default idle timeout (360 min)
        try:
            idle_timeout_table = dynamodb.Table("SmartPC-Idle-Timeout")
            idle_timeout_table.put_item(
                Item={
                    "instanceId": instance_id,
                    "timeout": 360  # Default timeout in minutes
                }
            )
            print(f"Default idle timeout set for instance: {instance_id}")
        except Exception as e:
            print(f"Failed to insert default idle timeout: {e}")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Instance created successfully",
                "instanceId": instance_id,
                "subnetId": subnet_id,
                "privateIp": private_ip,
                "publicIp": public_ip
            })
        }

    except Exception as e:
        print(f"Error during instance creation: {e}")

        # Cleanup logic
        if instance_id:
            print(f"Terminating orphaned instance: {instance_id}")
            try:
                ec2.terminate_instances(InstanceIds=[instance_id])
                log_event(instance_id, system_name, "cleanup:terminate")
            except Exception as cleanup_error:
                print(f"Failed to terminate instance: {cleanup_error}")

        if private_ip or public_ip:
            print(f"Removing orphaned IPs for instance: {instance_id}")
            try:
                remove_instance_ips(instance_id)
            except Exception as cleanup_error:
                print(f"Failed to remove IPs from SmartPCIPs: {cleanup_error}")

        if key_name:
            print(f"Deleting orphaned key pair: {key_name}")
            try:
                ec2.delete_key_pair(KeyName=key_name)
                keys_table = dynamodb.Table(DYNAMODB_KEYS_TABLE)
                keys_table.delete_item(Key={"instanceId": instance_id})
                log_event(key_name, system_name, "cleanup:delete_key_pair")
            except Exception as cleanup_error:
                print(f"Failed to delete key pair: {cleanup_error}")

        if subnet_id:
            print(f"Decrementing VM count for subnet: {subnet_id}")
            try:
                update_subnet_vm_count(region, subnet_id, increment=False)
            except Exception as cleanup_error:
                print(f"Failed to decrement subnet VM count: {cleanup_error}")

        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to create instance", "error": str(e)})
        }

def stop_instance(instance_id, system_name, sub=None, role=None, owner_id=None):
    """
    Stops the EC2 instance and logs the event, while preserving full resource tracking metadata.
    """
    if sub and role and owner_id:
            print("[DEBUG] Performing assignment check before stopping instance")
            allowed = is_user_allowed_to_control_instance(sub, role, owner_id, instance_id)
            if not allowed:
                print("[DEBUG] Access denied: user not authorized to stop instance")
                return {
                    "statusCode": 403,
                    "body": json.dumps({
                        "message": "This PC is assigned to a member. Please unassign if you want to start it."
                    })
                }
    try:
        # Stop the instance
        ec2.stop_instances(InstanceIds=[instance_id])
        print(f"Instance {instance_id} stopped successfully.")

        # Log the event
        log_event(instance_id, system_name, "stop")

        # Update resource status in SmartPCStatus
        update_resource_status(instance_id, "stopped")

        # Update status in SmartPC-UserData
        update_user_data_status(instance_id, "stopped")

        # Fetch metadata from SmartPC-UserData
        user_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        user_data_resp = user_data_table.scan(
            FilterExpression=Key("instanceId").eq(instance_id)
        )
        user_items = user_data_resp.get("Items", [])
        if not user_items:
            raise Exception(f"No user data found for instanceId: {instance_id}")

        user_item = user_items[0]
        subnet_id = user_item.get("subnetId")
        config_id = user_item.get("configId")
        user_id = user_item.get("userId")
        storage_size = user_item.get("storageSize")
        region = user_item.get("region")

        if not config_id:
            raise Exception(f"Missing configId in user data for instanceId: {instance_id}")

        # # Fetch storageSize from SmartPCConfig table using configId
        # config_table = dynamodb.Table(DYNAMODB_CONFIG_TABLE)
        # config_resp = config_table.query(
        #     KeyConditionExpression=Key("configId").eq(config_id)
        # )
        # config_items = config_resp.get("Items", [])
        # if not config_items:
        #     raise Exception(f"No config found for configId: {config_id}")

        # storage_size_raw = config_items[0].get("storageSize", "0GB")
        # storage_size = int(storage_size_raw.replace("GB", "").strip())

        # Log full resource tracking entry with status=stopped
        log_resource_tracking(
            resource_id=instance_id,
            resource_type="instance",
            status="stopped",
            associated_instance_id=instance_id,
            subnetId=subnet_id,
            configId=config_id,
            storageSize=storage_size,
            region=region
        )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f"Instance {instance_id} stopped successfully"
            })
        }

    except Exception as e:
        print(f"Error stopping instance {instance_id}: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": f"Failed to stop instance {instance_id}",
                "error": str(e)
            })
        }

def start_instance(instance_id, system_name, sub=None, role=None, owner_id=None):
    """
    Starts the EC2 instance and logs the event, while preserving full resource tracking metadata.
    """

    if sub and role and owner_id:
        print("[DEBUG] Performing assignment check before starting instance")
        allowed = is_user_allowed_to_control_instance(sub, role, owner_id, instance_id)
        if not allowed:
            print("[DEBUG] Access denied: user not authorized to stop instance")
            return {
                "statusCode": 403,
                "body": json.dumps({
                    "message": "This PC is assigned to a member. Please unassign if you want to start it."
                })
            }


    try:
        # Start the instance
        ec2.start_instances(InstanceIds=[instance_id])
        print(f"Instance {instance_id} started successfully.")

        # Log the event
        log_event(instance_id, system_name, "start")

        # Update resource status in SmartPCStatus
        update_resource_status(instance_id, "running")

        # Update status in SmartPC-UserData
        update_user_data_status(instance_id, "running")

        # Fetch metadata from SmartPC-UserData
        user_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        user_data_resp = user_data_table.scan(
            FilterExpression=Key("instanceId").eq(instance_id)
        )
        user_items = user_data_resp.get("Items", [])
        if not user_items:
            raise Exception(f"No user data found for instanceId: {instance_id}")

        user_item = user_items[0]
        subnet_id = user_item.get("subnetId")
        config_id = user_item.get("configId")
        user_id = user_item.get("userId")
        storage_size = user_item.get("storageSize")
        region = user_item.get("region")

        if not config_id:
            raise Exception(f"Missing configId in user data for instanceId: {instance_id}")

        # # Fetch storageSize from SmartPCConfig table using configId
        # config_table = dynamodb.Table(DYNAMODB_CONFIG_TABLE)
        # config_resp = config_table.query(
        #     KeyConditionExpression=Key("configId").eq(config_id)
        # )
        # config_items = config_resp.get("Items", [])
        # if not config_items:
        #     raise Exception(f"No config found for configId: {config_id}")

        # storage_size_raw = config_items[0].get("storageSize", "0GB")
        # storage_size = int(storage_size_raw.replace("GB", "").strip())

        # Log full resource tracking entry with status=running
        log_resource_tracking(
            resource_id=instance_id,
            resource_type="instance",
            status="running",
            associated_instance_id=instance_id,
            subnetId=subnet_id,
            configId=config_id,
            storageSize=storage_size,
            region=region
        )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f"Instance {instance_id} started successfully"
            })
        }

    except Exception as e:
        print(f"Error starting instance {instance_id}: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": f"Failed to start instance {instance_id}",
                "error": str(e)
            })
        }

def get_least_used_subnet(region):
    """
    Query the SubnetVMCounts table to find the least-loaded subnet in the given region.
    """
    subnet_table = dynamodb.Table(DYNAMODB_SUBNET_COUNTS_TABLE)
    response = subnet_table.query(
        KeyConditionExpression="#region = :region",
        ExpressionAttributeNames={"#region": "region"},  # Alias for reserved keyword
        ExpressionAttributeValues={":region": region}
    )
    subnets = response.get('Items', [])

    if not subnets:
        raise Exception(f"No subnets found in region: {region}")

    subnets.sort(key=lambda x: int(x['vmCount']))
    least_used_subnet = subnets[0]

    return least_used_subnet['subnetId'], int(least_used_subnet['vmCount'])

def store_instance_ips(instance_id, system_name, private_ip, public_ip, user_id):
    """
    Stores the private and public IP addresses of the VM in DynamoDB.
    """
    try:
        # Ensure all required fields are included
        item = {
            "instanceId": instance_id,  # Required partition key
            "userId": user_id,  # Required sort key
            "systemName": system_name,
            "privateIp": private_ip if private_ip else "N/A",  # Handle None values
            "publicIp": public_ip if public_ip else "N/A",    # Handle None values
            "timestamp": datetime.utcnow().isoformat()
        }

        # Debug log the item
        print(f"DEBUG: Writing instance IPs to SmartPCIPs: {item}")

        # Store the item in the SmartPCIPs table
        ips_table = dynamodb.Table(DYNAMODB_IPS_TABLE)
        ips_table.put_item(Item=item)

        print(f"Instance IPs stored successfully: {item}")
    except Exception as e:
        print(f"Error storing instance IPs: {e}")
        raise

def remove_instance_ips(instance_id):
    """
    Removes the private and public IP addresses of the VM from the SmartPCIPs table.
    """
    try:
        ips_table = dynamodb.Table(DYNAMODB_IPS_TABLE)
        ips_table.delete_item(Key={"instanceId": instance_id})
        print(f"IPs removed successfully for instanceId: {instance_id}")
    except Exception as e:
        print(f"Error removing IPs for instanceId {instance_id}: {e}")
        raise

def get_subnet_for_instance(instance_id):
    """
    Fetches the subnet ID associated with a given instance ID from SmartPCResourceTracking.
    If not found, fetches directly from the EC2 API.
    """
    try:
        # Attempt to retrieve the subnet ID from SmartPCResourceTracking
        tracking_table = dynamodb.Table(DYNAMODB_RESOURCE_TRACKING_TABLE)
        response = tracking_table.get_item(Key={"resourceId": instance_id, "resourceType": "instance"})

        if "Item" in response and "subnetId" in response["Item"]:
            return response["Item"]["subnetId"]

        # Fallback: Fetch from EC2 API
        print(f"Subnet ID not found in ResourceTracking table. Fetching from EC2 for instanceId: {instance_id}")
        instance_details = ec2.describe_instances(InstanceIds=[instance_id])
        subnet_id = instance_details['Reservations'][0]['Instances'][0]['SubnetId']
        return subnet_id
    except Exception as e:
        print(f"Error fetching subnet for instance {instance_id}: {e}")
        raise Exception(f"No subnetId found for instanceId: {instance_id}")

def decrement_vm_count(instance_id, region):
    """
    Decrements the VM count for the subnet associated with the instance.
    """
    try:
        # Fetch the subnet ID from SmartPCIPs table
        ips_table = dynamodb.Table(DYNAMODB_IPS_TABLE)
        response = ips_table.get_item(Key={"instanceId": instance_id})

        if "Item" not in response:
            raise Exception(f"Instance ID {instance_id} not found in SmartPCIPs table")

        subnet_id = response["Item"]["subnetId"]
        print(f"Decrementing VM count for subnet: {subnet_id}")

        # Decrement the VM count in SubnetVMCounts table
        subnet_table = dynamodb.Table(DYNAMODB_SUBNET_COUNTS_TABLE)
        subnet_table.update_item(
            Key={"region": region, "subnetId": subnet_id},
            UpdateExpression="SET vmCount = vmCount - :decrement",
            ExpressionAttributeValues={":decrement": 1}
        )
        print(f"VM count decremented for subnet: {subnet_id}")
    except Exception as e:
        print(f"Error decrementing VM count: {e}")
        raise

def delete_instance(instance_id, system_name, region, user_id):
    """
    Deletes an EC2 instance and associated resources (key pair, tracking data, etc.).
    """
    try:
        # Terminate the EC2 instance
        print(f"Terminating instance: {instance_id}")
        ec2.terminate_instances(InstanceIds=[instance_id])
        print(f"Instance {instance_id} termination triggered.")

        # Update status in SmartPCStatus
        update_resource_status(instance_id, "terminated")

        # Fetch metadata from SmartPC-UserData
        user_data_table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        user_data_resp = user_data_table.scan(
            FilterExpression=Key("instanceId").eq(instance_id)
        )
        user_items = user_data_resp.get("Items", [])
        if not user_items:
            raise Exception(f"No user data found for instanceId: {instance_id}")

        user_item = user_items[0]
        subnet_id = user_item.get("subnetId")
        config_id = user_item.get("configId")
        storage_size = user_item.get("storageSize")
        region = user_item.get("region")

        if not config_id:
            raise Exception(f"Missing configId in user data for instanceId: {instance_id}")

        # # Fetch storageSize from SmartPCConfig table
        # config_table = dynamodb.Table(DYNAMODB_CONFIG_TABLE)
        # config_resp = config_table.query(
        #     KeyConditionExpression=Key("configId").eq(config_id)
        # )
        # config_items = config_resp.get("Items", [])
        # if not config_items:
        #     raise Exception(f"No config found for configId: {config_id}")

        # storage_size_raw = config_items[0].get("storageSize", "0GB")
        # storage_size = int(storage_size_raw.replace("GB", "").strip())

        # Log full resource tracking entry with status=terminated
        log_resource_tracking(
            resource_id=instance_id,
            resource_type="instance",
            status="terminated",
            associated_instance_id=instance_id,
            subnetId=subnet_id,
            configId=config_id,
            storageSize=storage_size,
            region=region
        )

        # Decrement VM count for the associated subnet
        if subnet_id:
            update_subnet_vm_count(region, subnet_id, increment=False)
            print(f"VM count decremented successfully for subnet: {subnet_id}")

        # Delete the associated key pair using delete_key_pair
        try:
            print(f"Deleting associated key pair for instanceId: {instance_id}")
            delete_key_pair(instance_id)
        except Exception as e:
            print(f"Error deleting key pair for instance {instance_id}: {e}")

        # Log the deletion event
        log_event(instance_id, system_name, "delete")

        # # Update status in SmartPC-UserData
        # update_user_data_status(instance_id, "terminated")

        # # Delete the resource tracking entry (optional cleanup)
        # try:
        #     print(f"Deleting resource tracking entry for instanceId: {instance_id}")
        #     delete_resource_tracking(instance_id)
        # except Exception as e:
        #     print(f"Error deleting resource tracking entry: {e}")

        # Delete the DCV session entry
        try:
            print(f"Deleting DCV session for instanceId: {instance_id}")
            delete_dcv_session_entry(user_id, instance_id)
        except Exception as e:
            print(f"Error deleting DCV session entry: {e}")

        # Delete the instance entry from SmartPC-UserData table
        try:
            print(f"Deleting instance entry from SmartPC-UserData table for instanceId: {instance_id}")
            for item in user_items:
                primary_key = {k: item[k] for k in item.keys() if k in ["userId", "instanceId"]}
                user_data_table.delete_item(Key=primary_key)
                print(f"Deleted entry: {primary_key} from SmartPC-UserData")
        except Exception as e:
            print(f"Error deleting instance entry from SmartPC-UserData table: {e}")
        

        # Delete the entry from SmartPC_ManagePCAssignments table
        try:
            print(f"Deleting instance assignment for instanceId: {instance_id} under ownerId: {user_id}")
            assignment_table = dynamodb.Table(DYNAMODB_ASSIGNMENT_TABLE)
            assignment_table.delete_item(
                Key={
                    "ownerId": user_id,
                    "instanceId": instance_id
                }
            )
            print(f"Assignment entry deleted from SmartPC_ManagePCAssignments.")
        except Exception as e:
            print(f"Error deleting assignment entry from SmartPC_ManagePCAssignments: {e}")

        # Decrement user's quota usage
        try:
            decrement_user_quota_usage(user_id)
        except Exception as e:
            print(f"Failed to decrement quota usage for user {user_id}: {e}")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": f"Instance {instance_id} deleted successfully."})
        }

    except Exception as e:
        print(f"Failed to delete instance {instance_id}: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Failed to delete instance {instance_id}.", "error": str(e)})
        }

def delete_key_pair(instance_id):
    """
    Deletes the key pair associated with the given instance_id and removes it from the SmartPCKeys table.
    """
    try:
        # Fetch the key pair details from the SmartPCKeys table
        keys_table = dynamodb.Table(DYNAMODB_KEYS_TABLE)
        response = keys_table.get_item(Key={"instanceId": instance_id})

        if 'Item' not in response:
            print(f"No key pair found for instanceId: {instance_id}")
            return

        key_name = response['Item']['keyName']

        # Delete the key pair from EC2
        print(f"Deleting key pair from EC2: {key_name}")
        ec2.delete_key_pair(KeyName=key_name)

        # Remove the key pair record from the DynamoDB table
        print(f"Deleting key pair from SmartPCKeys table: {key_name}")
        keys_table.delete_item(Key={"instanceId": instance_id})

        print(f"Key pair deleted successfully: {key_name}")
    except Exception as e:
        print(f"Error deleting key pair for instance {instance_id}: {e}")
        raise

def update_resource_tracking_status(resource_id, status, resource_type):
    """
    Updates the status of a resource in the SmartPCResourceTracking table.
    """
    try:
        if not resource_id:
            raise Exception("Missing or invalid resourceId for updating resource tracking status")

        # Prepare the item to update
        item = {
            "resourceId": resource_id,
            "resourceType": resource_type,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        print(f"DEBUG: Updating resource status in SmartPCResourceTracking: {item}")

        # Update the resource tracking table
        tracking_table = dynamodb.Table(DYNAMODB_RESOURCE_TRACKING_TABLE)
        tracking_table.put_item(Item=item)

        print(f"Resource tracking updated successfully: {item}")
    except Exception as e:
        print(f"Error updating resource tracking status for resourceId {resource_id}: {e}")
        raise

def is_system_name_unique_for_user(system_name, user_id):
    """
    Checks if the given systemName already exists for the given userId in SmartPC-UserData.
    Returns True if unique, False if already used.
    """
    try:
        table = dynamodb.Table(DYNAMODB_USER_PC_DATA_TABLE)
        response = table.query(
            IndexName="userId-systemName-index",  # assumes GSI on (userId, systemName)
            KeyConditionExpression=Key("userId").eq(user_id) & Key("systemName").eq(system_name)
        )
        items = response.get("Items", [])
        return len(items) == 0
    except Exception as e:
        print(f"[ERROR] Uniqueness check failed for userId={user_id}, systemName='{system_name}': {e}")
        raise




# This function checks if the current user is authorized to control (start/stop) the PC,
# based on whether the instance is assigned and who it is assigned to.

def is_user_allowed_to_control_instance(sub, role, token_owner_id, instance_id):
    """
    Checks if the current user is allowed to control (start/stop) a PC.
    - Returns True if access is allowed
    - Returns False if blocked (assigned to someone else)
    """

    print("[DEBUG] Checking access control for instance:", instance_id)
    print(f"[DEBUG] sub: {sub}, role: {role}, token_owner_id: {token_owner_id}")

    try:
        # Handle system/infrastructure calls (no identity)
        if not sub or not role:
            print("[DEBUG] No user identity provided — assuming system call. Allowing access.")
            return True

        # Resolve ownerId based on role
        owner_id = sub if role == "owner" else token_owner_id
        print(f" [DEBUG] Resolved owner_id: {owner_id}")

        # Access the assignment table
        dynamodb = boto3.resource("dynamodb")
        assignment_table = dynamodb.Table("SmartPC_ManagePCAssignments")

        response = assignment_table.query(
            KeyConditionExpression=Key("ownerId").eq(owner_id) & Key("instanceId").eq(instance_id)
        )
        items = response.get("Items", [])
        print(f"[DEBUG] Assignment query result: {items}")

        if not items:
            print("[DEBUG] Instance is not assigned — allowing access.")
            return True  # Not assigned, allow access

        assignment = items[0]
        assigned_to = assignment.get("memberId")
        print(f"[DEBUG] Instance is assigned to memberId: {assigned_to}")

        if role == "member" and assigned_to == sub:
            print("[DEBUG] Member is correctly assigned — allowing access.")
            return True

        print(" [DEBUG] Access denied — user is not the assigned member.")
        print(" [DEBUG] Access denied — user is not the assigned member.")
        print(f"[DEBUG] BLOCKING start: user {sub} with role {role} tried accessing assigned PC {instance_id}")

        return False
        

    except Exception as e:
        print(f"[ERROR] Failed during access check: {str(e)}")
        return False  # Deny on error for safety
