import json
import os
import boto3
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr
from typing import List, Dict

region = os.environ.get("AWS_REGION", "us-east-1")
IS_JOB_ENABLED = os.environ.get("IS_JOB_ENABLED", "false")

dynamodb = boto3.resource("dynamodb", region_name=region)
ssm = boto3.client("ssm", region_name=region)

wallet_table = dynamodb.Table("SmartPCWallet")
billing_table = dynamodb.Table("SmartPCBilling")
storage_billing_table = dynamodb.Table("SmartPCStorageBilling")
notifications_table = dynamodb.Table("SmartPC-Notification")
events_table = dynamodb.Table("SmartPCUserAudit")
cashback_table = dynamodb.Table("SmartPCStorageCashbackPricing")
user_table = dynamodb.Table("senseminder-user")
cashback_job_table = dynamodb.Table("SmartPCCashbackJob")

def lambda_handler(event, context):
    try:
        if IS_JOB_ENABLED == "false":
            print("Cashback job is disabled by feature flag. Exiting.")
            return _response(200, {"message": "Cashback job disabled"})
        
        now =  datetime.now(timezone.utc)
        job_id = str(uuid.uuid4())
        cashback_rules = get_all_cashback_rules()

        owners = get_unique_owners()
        for owner in owners:
            owner_id = owner.get("id")
            created_at_str = owner.get("createdAt")
            print(f"Processing cashback for owner: {owner_id}, createdAt: {created_at_str}")

            start_date : datetime = None
            end_date : datetime = None
            last_job = get_last_job(owner_id)

            if last_job:
                last_period_end = datetime.fromisoformat(last_job["periodEnd"])
                start_date = last_period_end + timedelta(seconds=5)
            else:
                if created_at_str:
                    try:
                        created_at = datetime.fromisoformat(created_at_str)
                        if (now - created_at).days > 30:
                            start_date = now - timedelta(days=30)
                        else:
                            start_date = created_at
                    except Exception as parse_err:
                        print(f"[WARN] Failed to parse createdAt for owner {owner_id}: {parse_err}")
                else:
                    print(f"[WARN] No createdAt found for owner {owner_id}, defaulting to 30 days ago.")
                    # No previous job — determine start_date based on account creation
                    now = datetime.now(timezone.utc)
                    start_date = now - timedelta(days=30)

            end_date = start_date + timedelta(days=30)
            print(f"Calculating period for owner {owner_id}: {start_date} → {end_date} diff: {(now - start_date).days} days")

            # If account is older than 30 days, start from createdAt date
            if (now - start_date).days < 30:
                # Skip if already processed for this start_date
                print(f"Skipping owner {owner_id}: already processed this period. ")
                continue

            # Process cashback
            process_cashback_for_owner(owner_id, start_date, end_date, job_id, now, cashback_rules)

        return _response(200, {"message": "Cashback calculation completed", "job_id": job_id})
        
    except Exception as e:
        print(f"Error: {e}")
        return _response(500, {"error": str(e)})

def has_existing_job(user_id: str, start_date: datetime) -> bool:
    """Check cashback table for overlapping period jobs"""
    start_iso = start_date.isoformat()
    
    try:
        response = cashback_job_table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            FilterExpression=Attr("periodEnd").gte(start_iso)
        )
        existing = response.get("Items", [])
        return len(existing) > 0
    except Exception as e:
        print(f"Error checking existing jobs: {e}")
        return False
    
def get_last_job(user_id: str):
    """Get the most recent cashback job for a user"""
    try:
        response = cashback_job_table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            ScanIndexForward=False, 
            Limit=1
        )
        items = response.get("Items", [])
        return items[0] if items else None
    except Exception as e:
        print(f"Error getting last job for {user_id}: {e}")
        return None
    
def process_cashback_for_owner(owner_id, start_date, end_date, job_id, now: datetime, cashback_rules: List[Dict]):
    print(f"Calculating cashback for Owner ID: {owner_id}")

    current_total = Decimal("0.00")
    
    # Query both billing tables for the user
    billing_records = get_billing_records(owner_id, start_date.isoformat(), end_date.isoformat())
    storage_billing_records = get_storage_billing_records(owner_id, start_date.isoformat(), end_date.isoformat())
    
    print(f"Found {len(billing_records)} billing records and {len(storage_billing_records)} storage billing records for user {owner_id} between {start_date} and {end_date}")
    billing_basis: str = ""

    # Process billing records
    for record in billing_records:
        billing_amount = Decimal(record.get('billingAmount', '0'))
        current_total += billing_amount
        billing_basis = "SmartPC"
    
    print(f"Total billing for user {owner_id} before storage: ${current_total}")
    # Process storage billing records
    for record in storage_billing_records:
        billing_amount = Decimal(record.get('billingAmount', '0'))
        current_total += billing_amount
        billing_basis = billing_basis + " + Storage" if billing_basis else "Storage"
    
    print(f"Total billing for user {owner_id} after storage: ${current_total}")
    if current_total > Decimal('0.00'):
        cashback = calculate_cashback(current_total, cashback_rules)
        print(f"Calculated cashback for user {owner_id}: ${cashback} on billing of ${current_total}")
        if cashback > Decimal('0.00'):
            update_wallet_cashback(owner_id, cashback, now, job_id, start_date, end_date, billing_basis)
            record_cashback_job(owner_id, start_date.isoformat(), end_date.isoformat(), job_id, "SUCCESS", cashback)
            print(f"User {owner_id} got cashback of: ${cashback} for total billing of ${current_total}")
        else:
            print(f"User {owner_id} did not qualify for cashback on billing of ${current_total}")
            record_cashback_job(owner_id, start_date.isoformat(), end_date.isoformat(), job_id, "NO_CASHBACK")
    else:
        print(f"No billing found for user {owner_id} between {start_date} and {end_date}")
        record_cashback_job(owner_id, start_date.isoformat(), end_date.isoformat(), job_id, "NO_ACTIVITY")
        
def record_cashback_job(user_id: str, start_date: str, end_date: str, job_id: str, status: str, cashback: Decimal = Decimal("0.00")):
    """Record cashback job to SmartPCCashbackJob table"""
    item = {
        "jobId": job_id,
        "userId": user_id,
        "cashback": str(cashback),
        "periodStart": start_date,
        "periodEnd": end_date,
        "status": status,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    cashback_job_table.put_item(Item=item)

def update_wallet_cashback(user_id: str, new_cashback: Decimal, now: datetime, job_id: str, start_date, end_date, billing_basis: str = "storage"):
    
    wallet_cashback = get_wallet_cashback(user_id)

    total_cashback = wallet_cashback + new_cashback
    update_expression = "SET updatedTimestamp = :t, cashback = :c"
    expression_values = {}
    expression_values[':t'] = datetime.now(timezone.utc).isoformat()
    expression_values[':c'] = str(total_cashback)

    print(f'Updating wallet for user {user_id}: {expression_values}')
    
    wallet_table.update_item(
        Key={'userId': user_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values
    )

    if new_cashback > 0:
        log_notification(user_id, f"Cashback of ${new_cashback} added to your wallet.", "info", "Cashback Added", "wallet-alert")
        log_event(user_id, "CASHBACK_ADDED", {
            "user_id": user_id,
            "billing_start_date": start_date.isoformat(),
            "billing_end_date": end_date.isoformat(),
            "cashback_earned": str(new_cashback),
            "basis": str(billing_basis),
            "posted_at": now.isoformat(),
            "job_id": job_id
        })
    
def get_wallet_cashback(user_id: str) -> Decimal:
    """Get wallet balance components for a user"""
    wallet = wallet_table.get_item(Key={'userId': user_id}).get('Item', {})
    
    cashback = Decimal(wallet.get('cashback', '0'))
    
    return cashback


def get_billing_records(user_id, start_date, end_date):
    """Query SmartPCBilling table for user's billing records between start_date and end_date."""
    try:
        response = billing_table.query(
            IndexName='userId-timestamp-index',  # GSI on userId + timestamp
            KeyConditionExpression=Key('userId').eq(user_id) & Key('timestamp').between(start_date, end_date),
            ScanIndexForward=True  # Sort by timestamp ascending
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying billing table: {e}")
        # Fallback to scan if index missing
        return scan_billing_records(billing_table, user_id, start_date, end_date)


def get_storage_billing_records(user_id, start_date, end_date):
    """Query SmartPCStorageBilling table for user's storage billing records between start_date and end_date."""
    try:
        response = storage_billing_table.query(
            KeyConditionExpression=Key('userId').eq(user_id) & Key('timestamp').between(start_date, end_date),
            ScanIndexForward=True  # Sort by timestamp ascending
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying storage billing table: {e}")
        # Fallback to scan if index missing
        return scan_billing_records(storage_billing_table, user_id, start_date, end_date)

def scan_billing_records(table, user_id, start_date, end_date):
    """Fallback scan when GSI is unavailable."""
    try:
        response = table.scan(
            FilterExpression=Attr('userId').eq(user_id) & Attr('timestamp').between(start_date, end_date)
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error scanning table {table.name}: {e}")
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


def log_event(user_id: str, event_type: str, details: Dict, status: str = "SUCCESS"):
    """Log event to audit table"""
    item = {
        'userId': user_id,
        'eventTimestamp': datetime.now(timezone.utc).isoformat(),
        'eventType': event_type,
        'details': details,
        'status': status
    }
    events_table.put_item(Item=item)
    
def log_notification(user_id: str, content: str, severity: str, title: str = "Notification", type: str = "cashback-calculator"):
        now = datetime.now(timezone.utc).isoformat()
        item = {
            "userId": user_id,
            "timestamp": now,
            "content": content,
            "route": "/dashboard/billing",
            "severity": severity,
            "title": title,
            "type": type
        }
        notifications_table.put_item(Item=item)

def calculate_cashback(billing_amount: Decimal, 
                      cashback_rules: List[Dict]) -> Decimal:
    """Calculate cashback amount based on storage and rules"""
    for rule in cashback_rules:
        if Decimal(rule['lowerLimit']) <= billing_amount <= Decimal(rule['upperLimit']):
            percentage = Decimal(rule['cashbackPercentage']) / 100
            return (billing_amount * percentage).quantize(Decimal('0.01'))

    return Decimal('0.00')

def get_all_cashback_rules() -> List[Dict]:
    """Retrieve all cashback rules sorted by lower limit"""
    response = cashback_table.scan()
    return sorted(response['Items'], key=lambda x: Decimal(x['lowerLimit']))


def get_unique_owners() -> List[Dict[str, str]]:
    """
    Returns a list of unique owner users with their createdAt timestamps.
    """
    processed_users = {}
    
    try:
        print("Getting unique owners for cashback calculation")
        
        # Scan parameters with createdAt included
        scan_params = {
            'ProjectionExpression': 'id, owner_id, #role, createdAt',
            'ExpressionAttributeNames': {'#role': 'role'}
        }
        
        while True:
            response = user_table.scan(**scan_params)
            all_users = response.get('Items', [])
            
            for user in all_users:
                user_id = user.get('id')
                owner_id = user.get('owner_id')
                role = user.get('role', '').lower()
                created_at = user.get('createdAt')
                
                if not user_id:
                    print(f"Skipping user with missing id: {user}")
                    continue
                
                # Determine if this user is an effective owner
                if role == 'owner' or (not owner_id or owner_id.strip() == ''):
                    processed_users[user_id] = created_at
            
            # Handle pagination
            if 'LastEvaluatedKey' not in response:
                break
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
        
        print(f"Processed owners: {len(processed_users)}")
        # Return as list of dicts for clarity
        return [{"id": uid, "createdAt": created_at} for uid, created_at in processed_users.items()]
        
    except Exception as e:
        print(f"Error getting owner ids: {e}")
        return []
