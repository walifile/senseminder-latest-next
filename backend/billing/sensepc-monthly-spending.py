import json
import os
import boto3
from datetime import datetime, timedelta
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

region = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=region)
wallet_table = dynamodb.Table("SmartPCWallet")
billing_table = dynamodb.Table("SmartPCBilling")
storage_billing_table = dynamodb.Table("SmartPCStorageBilling")

def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    try:
        print(f"Event: {json.dumps(event)}")
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

        if not is_action_allowed(user_role):
            return _response(403, {"message": "Members are not allowed to retrieve monthly spendings"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        current_total = Decimal("0.00")
        last_total = Decimal("0.00")
        lifetime_total = Decimal("0.00")

        # Calculate date ranges for current and last month
        now = datetime.now()
        first_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        first_of_last_month = (first_of_this_month - timedelta(days=1)).replace(day=1)
        
        # Convert to ISO format strings for comparison
        current_month_start = first_of_this_month.isoformat()
        last_month_start = first_of_last_month.isoformat()

        # Query both billing tables for the user
        billing_records = get_billing_records(owner_id, last_month_start)
        storage_billing_records = get_storage_billing_records(owner_id, last_month_start)

        # Also get lifetime records (all records for user) with pagination
        all_billing_records = get_all_billing_records(owner_id)
        all_storage_records = get_all_storage_billing_records(owner_id)
        
        # Process billing records
        for record in billing_records:
            timestamp = record.get('timestamp')
            billing_amount = Decimal(record.get('billingAmount', '0'))
            
            if timestamp >= current_month_start:
                current_total += billing_amount
            else:
                last_total += billing_amount

        # Process storage billing records
        for record in storage_billing_records:
            timestamp = record.get('timestamp')
            billing_amount = Decimal(record.get('billingAmount', '0'))
            
            if timestamp >= current_month_start:
                current_total += billing_amount
            else:
                last_total += billing_amount
        
        # Compute lifetime from all records
        for record in all_billing_records:
            billing_amount = Decimal(str(record.get('billingAmount', '0')))
            lifetime_total += billing_amount

        for record in all_storage_records:
            billing_amount = Decimal(str(record.get('billingAmount', '0')))
            lifetime_total += billing_amount

        # Compute % change
        if last_total == 0:
            percent_change = 100.0 if current_total > 0 else 0.0
        else:
            percent_change = float(((current_total - last_total) / last_total) * 100)

        return _response(200, {
            "currentMonth": f"{current_total:.2f}",
            "lastMonth": f"{last_total:.2f}",
            "percentChange": round(percent_change, 2),
            "trend": "increase" if percent_change > 0 else ("decrease" if percent_change < 0 else "no change"),
            "lifetimeTotal": f"{lifetime_total:.2f}"
        })

    except Exception as e:
        print(f"Error: {e}")
        return _response(500, {"error": str(e)})

def get_billing_records(user_id, start_date):
    """Query SmartPCbilling table for user's billing records since start_date"""
    try:
        response = billing_table.query(
            IndexName='userId-timestamp-index',  # Assuming there's a GSI on userId and timestamp
            KeyConditionExpression=Key('userId').eq(user_id) & Key('timestamp').gte(start_date),
            ScanIndexForward=True  # Sort by timestamp ascending
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying billing table: {e}")
        # If GSI doesn't exist, fall back to scan (less efficient)
        return scan_billing_records(billing_table, user_id, start_date)

def get_storage_billing_records(user_id, start_date):
    """Query SmartPCStorageBilling table for user's billing records since start_date"""
    try:
        response = storage_billing_table.query(
            KeyConditionExpression=Key('userId').eq(user_id) & Key('timestamp').gte(start_date),
            ScanIndexForward=True  # Sort by timestamp ascending
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying storage billing table: {e}")
        # If GSI doesn't exist, fall back to scan (less efficient)
        return scan_billing_records(storage_billing_table, user_id, start_date)

def scan_billing_records(table, user_id, start_date):
    """Fallback method using scan if GSI is not available"""
    try:
        response = table.scan(
            FilterExpression=Key('userId').eq(user_id) & Key('timestamp').gte(start_date)
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error scanning billing table: {e}")
        return []

# -------------------------
#  lifetime helpers (paginated)
# -------------------------

def get_all_billing_records(user_id):
    """
    Returns ALL billing records for a user (paginated query if GSI exists, otherwise paginated scan).
    """
    try:
        # Query by userId on GSI (no timestamp lower bound)
        response = billing_table.query(
            IndexName='userId-timestamp-index',
            KeyConditionExpression=Key('userId').eq(user_id),
            ScanIndexForward=True
        )
        items = response.get('Items', [])
        while 'LastEvaluatedKey' in response:
            response = billing_table.query(
                IndexName='userId-timestamp-index',
                KeyConditionExpression=Key('userId').eq(user_id),
                ExclusiveStartKey=response['LastEvaluatedKey'],
                ScanIndexForward=True
            )
            items.extend(response.get('Items', []))
        return items
    except Exception as e:
        print(f"Error querying all billing records via GSI (falling back to scan): {e}")
        # fall back to paginated scan
        return scan_all_billing_records(billing_table, user_id)


def get_all_storage_billing_records(user_id):
    """
    Returns ALL storage billing records for a user (paginated query if key allows, otherwise paginated scan).
    """
    try:
        # If table's primary key supports userId as partition, we can query directly
        response = storage_billing_table.query(
            KeyConditionExpression=Key('userId').eq(user_id),
            ScanIndexForward=True
        )
        items = response.get('Items', [])
        while 'LastEvaluatedKey' in response:
            response = storage_billing_table.query(
                KeyConditionExpression=Key('userId').eq(user_id),
                ExclusiveStartKey=response['LastEvaluatedKey'],
                ScanIndexForward=True
            )
            items.extend(response.get('Items', []))
        return items
    except Exception as e:
        print(f"Error querying all storage billing records via primary key (falling back to scan): {e}")
        return scan_all_billing_records(storage_billing_table, user_id)

def scan_all_billing_records(table, user_id):
    """
    Paginated scan to return all items for a user (fallback when no suitable query exists).
    """
    try:
        items = []
        scan_kwargs = {
            'FilterExpression': Attr('userId').eq(user_id)
        }
        response = table.scan(**scan_kwargs)
        items.extend(response.get('Items', []))
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'], **scan_kwargs)
            items.extend(response.get('Items', []))
        return items
    except Exception as e:
        print(f"Error scanning table for all billing records: {e}")
        return []
    
def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }

def is_action_allowed(role):
    """
    Checks if the current user is owner and admin
    - Returns True if user has owner role and admin role
    - Returns False  
    """
    print("[DEBUG] Checking access control for role:", role)
    if not role:
        print("[DEBUG] No user identity provided — Stop here")
        return False

    # Resolve ownerId based on role
    return True if role == "owner" or role == "admin" else False

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")