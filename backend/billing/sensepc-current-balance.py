import json
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr

region = os.environ.get("AWS_REGION", "us-east-1")
dynamodb = boto3.resource("dynamodb", region_name=region)
wallet_table = dynamodb.Table("SmartPCWallet")
events_table = dynamodb.Table('SmartPCUserAudit')

def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    try:
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')

        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        print(f"User ID: {user_id}")
        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})

        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")
        
        wallet_response = wallet_table.get_item(Key={"userId": owner_id})
        wallet_data = wallet_response.get("Item")
        balance = 0.0
        last_recharge_amount = None
        last_recharge_timestamp = None
        if wallet_data and "balance" in wallet_data:
            balance = wallet_data["balance"]
            recharge = get_last_successful_wallet_recharge(owner_id)
            if recharge:
                print("Last successful recharge:", recharge["details"]["amount"])
                last_recharge_amount = recharge["details"].get("amount")
                last_recharge_timestamp = recharge.get("eventTimestamp")
            else:
                print("No successful recharge found.")

        response_data = {
            "balance": float(balance),
            "lastRecharge": {
                "amount": last_recharge_amount,
                "timestamp": last_recharge_timestamp
            }
        }    
        print(f"Balance: {response_data}")
        return _response(200, response_data)

    except Exception as e:
        print(f"Error: {str(e)}")
        return _response(500, {"error": str(e)})

def _response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }

def get_last_successful_wallet_recharge(user_id: str):
    
    # Query items sorted by eventTimestamp in descending order
    response = events_table.query(
        KeyConditionExpression=Key('userId').eq(user_id),
        FilterExpression=Attr('eventType').eq('RECHARGE_WALLET') & Attr('status').eq('SUCCESS'),
        ScanIndexForward=False,  # Descending order
        Limit=1
    )

    items = response.get('Items', [])
    return items[0] if items else None

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")