import os
import json
import boto3
from datetime import datetime, timezone

# Environment variables
region = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource('dynamodb', region_name=region)
resource_tracking_table = dynamodb.Table('SmartPCResourceTracking')
events_table = dynamodb.Table('SmartPCUserAudit')

def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    owner_id = "unknown"
    try:
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')

        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})

        print(f"User ID: {user_id}")
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        if method == "GET":
            params = event.get("queryStringParameters") or {}
            print(f"Query params : {params}")
            instance_id = params.get("instanceId", "")
            if not instance_id:
                return _response(404, {"error": "Instance not found"})
            instance_data = resource_tracking_table.get_item(Key={"resourceId": instance_id, "resourceType": "instance"}).get("Item")
            if not instance_data:
                return _response(404, {"error": "Instance not found"})


            autoRenew = instance_data.get("autoRenew", True)
            print(f"Auto Renew: {autoRenew}")
            
            return _response(200, {
                "autoRenew": autoRenew
            })

        # Parse and validate input
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)
        print(f"Body: {body}")

        autoRenew = body.get("autoRenew", False)
        instance_id = body.get("instanceId", "")


        # Retrieve user from DynamoDB
        instance_data = resource_tracking_table.get_item(Key={"resourceId": instance_id, "resourceType": "instance"}).get("Item")
        if not instance_data:
            return _response(404, {"error": "Instance not found"})

        # Update balance in DynamoDB
        update_expr = "SET autoRenew = :a, updatedTimestamp = :u"
        expr_attr_values = {
            ":a": bool(autoRenew),
            ":u": datetime.now(timezone.utc).isoformat()
        }

        resource_tracking_table.update_item(
            Key={"resourceId": instance_id, "resourceType": "instance"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values
        )

        log_event(owner_id, "AUTO_RENEW_UPDATE", {"autoRecharge": autoRenew, "instanceId": instance_id})

        return _response(200, {
            "message": "Renew flag updated successfully",
            "autoRenew": autoRenew
        })

    except Exception as e:
        print(f"Error: {e}")
        log_event(owner_id, "AUTO_RENEW_UPDATE", {"autoRecharge": autoRenew, "instanceId": instance_id, "error": str(e)}, status="FAILED")
        return _response(500, {"error": str(e)})


def _response(status_code, body):
    return {
        "statusCode": status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        "body": json.dumps(body)
    }


def log_event(user_id: str, event_type: str, details: dict, status: str = "SUCCESS"):
    event_timestamp = datetime.now(timezone.utc).isoformat()
    
    item = {
        'userId': user_id,
        'eventTimestamp': str(event_timestamp),
        'eventType': event_type,
        'details': details,
        'status': status
    }

    events_table.put_item(Item=item)


def is_owner_role(role):
    """
    Checks if the current user is owner
    - Returns True if user has owner role
    - Returns False  
    """
    print("[DEBUG] Checking access control for role:", role)
    if not role:
        print("[DEBUG] No user identity provided — Stop here")
        return False

    # Resolve ownerId based on role
    return True if role == "owner" else False

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")
    