import json
import boto3
import os
from decimal import Decimal, ROUND_HALF_UP

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from boto3.dynamodb.conditions import Key

from discount_campaign_service import apply_campaign_discount

region = os.environ.get("AWS_REGION", "us-east-1")
billing_plan_table_name = os.environ.get("PLAN_TABLE_NAME", "SmartPCBillingPlan")
wallet_table_name = os.environ.get("WALLET_TABLE_NAME", "SmartPCWallet")
audit_table_name = os.environ.get("AUDIT_TABLE_NAME", "SmartPCUserAudit")
billing_table_name = os.environ.get("BILLING_TABLE_NAME", "SmartPCBilling")
events_table_name = os.environ.get("EVENTS_TABLE_NAME", "SmartPCEvents")
MIN_RECHARGE_AMOUNT = Decimal(os.environ.get("MIN_RECHARGE_AMOUNT", "20"))
DAILY_MAX_UPTIME = int(os.environ.get("DAILY_MAX_UPTIME", "10"))
MONTHLY_MAX_UPTIME = int(os.environ.get("MONTHLY_MAX_UPTIME", "300"))

instance_pricing_table_name = os.environ.get("INSTANCE_PRICING_TABLE_NAME", "SmartPCInstancePricing")
ssd_pricing_table_name = os.environ.get("SSD_PRICING_TABLE_NAME", "SmartPCSSDPricing")
config_table_name = os.environ.get("CONFIG_TABLE_NAME", "SmartPCConfig")
resource_table_name = os.environ.get("RESOURCE_TABLE_NAME", "SmartPCResourceTracking")
notification_table_name = os.environ.get("NOTIFICATION_TABLE_NAME", "SmartPC-Notification")


dynamodb = boto3.resource("dynamodb", region_name=region)
billing_plan_table = dynamodb.Table(billing_plan_table_name)
wallet_table = dynamodb.Table(wallet_table_name)


VALID_PLANS = ["hourly", "daily", "monthly"]
PLAN_PRIORITY = {"hourly": 1, "daily": 2, "monthly": 3}


def format_decimal_str(value: Decimal) -> str:
    """Format a numeric value to a string with exactly two decimal places.
    """
    # Convert to Decimal reliably
    if not isinstance(value, Decimal):
        value = Decimal(str(value))

    # Quantize with ROUND_DOWN to truncate without rounding
    return str(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def lambda_handler(event, context):
    method = event.get("httpMethod", "")
    if method == "OPTIONS":
        return _response(200, {})

    if method != "POST":
        return _response(405, {"error": "Method not allowed"})

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
        discount_details = None

        body = json.loads(event.get("body", "{}"))
        instance_id = body.get("instanceId")

        new_plan = body.get("billingPlan")

        if not instance_id or not new_plan:
            return _response(400, {"error": "Missing 'instanceId' or 'billingPlan'"})
        if new_plan not in VALID_PLANS:
            return _response(400, {"error": f"Invalid billing plan. Must be one of {VALID_PLANS}"})

        # Check if instance belongs to the authenticated user
        ip_table = dynamodb.Table("SmartPCIPs")
        ip_response = ip_table.get_item(Key={"instanceId": instance_id})
        ip_item = ip_response.get("Item")

        if not ip_item or ip_item.get("userId") != owner_id:
            return _response(403, {"error": "Unauthorized: This instance does not belong to you."})
        
        previous_plan = None
        previous_plan = get_current_billing_plan(instance_id)
        print(f'New plan : {new_plan}, old plan : {previous_plan}')
        
        current_instance_state = get_last_instance_status(instance_id)
        if current_instance_state == 'stopped':
            return _response(402, {"error": "Please start the instance to change the billing plan"})

        change_type = determine_change(previous_plan, new_plan)
        print(f"Change type: {change_type}")

        # --- Billing logic for upgrades ---
        if change_type in ("upgrade", "initial"):
            # upgrade to higher plan immediately
            instance = get_instance(instance_id)
            config_id = instance.get('configId')
            storage_size = instance.get('storageSize', 0)
            system_name = instance.get('systemName', 'System-Name')
            status = instance.get('status', 'running')
            instance_region = instance.get('region')
            instance_price, storage_price = get_upgrade_pricing(config_id, instance_region, new_plan, storage_size, status)
        
            instance_price = instance_price.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            storage_price = storage_price.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            total_price = instance_price + storage_price
            discount_details = apply_campaign_discount(total_price, new_plan)

            if not deduct_wallet_balance(owner_id, discount_details, instance_id, system_name, new_plan, instance_price, storage_price):
                return _response(402, {"error": "Insufficient funds to upgrade plan"})

        print(f"Recording new billing plan '{new_plan}' for instance '{instance_id}'")
        current_date_time = datetime.utcnow().isoformat()
        if new_plan != previous_plan:
            # Insert new plan
            plan_item = {
                "instanceId": instance_id,
                "timestamp": current_date_time,
                "billingPlan": new_plan
            }

            # Add maxUptime for daily and monthly plans
            if new_plan == 'daily':
                plan_item['maxUptime'] = DAILY_MAX_UPTIME
            elif new_plan == 'monthly':
                plan_item['maxUptime'] = MONTHLY_MAX_UPTIME

            billing_plan_table.put_item(Item=plan_item)
            print(f"Inserted new billing plan '{new_plan}' for instance '{instance_id}'")

        result = {
            "instanceId": instance_id,
            "newPlan": new_plan,
            "timestamp": current_date_time,
            "previousPlan": previous_plan,
            "change": determine_change(previous_plan, new_plan),
            "discount": discount_details if change_type in ("upgrade", "initial") else None
        }

        return _response(200, result)

    except Exception as e:
        print(f"Error: {e}")
        return _response(500, {"error": str(e)})

def determine_change(previous, new):
    if not previous:
        return "initial"
    prev_level = PLAN_PRIORITY.get(previous)
    new_level = PLAN_PRIORITY.get(new)
    if new_level > prev_level:
        return "upgrade"
    elif new_level < prev_level:
        return "downgrade"
    else:
        return "no change"

def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")
    
def deduct_wallet_balance(user_id, charge_details, instance_id, system_name="", new_plan="", instance_price=Decimal('0'), storage_price=Decimal('0')) -> bool:
    """Deduct from promo -> cashback -> wallet and record campaign-aware billing."""
    amount = Decimal(str(charge_details["final_amount"]))
    original_amount = Decimal(str(charge_details.get("base_amount", charge_details["final_amount"])))
    discount_amount = Decimal(str(charge_details.get("discount_amount", 0)))
    discount_percent = Decimal(str(charge_details.get("discount_percent", 0)))
    campaign_id = charge_details.get("campaign_id")
    campaign_name = charge_details.get("campaign_name")
    print(f"deduct_wallet_balance: {amount}")
    res = wallet_table.get_item(Key={"userId": user_id})
    wallet = res.get("Item")
    if not wallet:
        return False

    promo = Decimal(str(wallet.get("promoBalance", 0)))
    cashback = Decimal(str(wallet.get("cashback", 0)))
    current_balance = Decimal(str(wallet.get("balance", 0)))
    total = promo + cashback + current_balance
    promo_deducted = cashback_deducted = balance_deducted = Decimal('0')

    if total < amount:
        return False

    remaining = amount
    if promo > 0:
        promo_deducted = min(promo, remaining)
        promo -= promo_deducted
        remaining -= promo_deducted
    if remaining > 0 and cashback > 0:
        cashback_deducted = min(cashback, remaining)
        cashback -= cashback_deducted
        remaining -= cashback_deducted
    if remaining > 0 and current_balance > 0:
        balance_deducted = min(remaining, current_balance)
        remaining -= balance_deducted
        current_balance -= balance_deducted

    wallet_table.update_item(
        Key={"userId": user_id},
        UpdateExpression="set promoBalance=:p, cashback=:c, balance=:w, updatedTimestamp=:u",
        ExpressionAttributeValues={
            ":p": Decimal(format_decimal_str(promo)),
            ":c": Decimal(format_decimal_str(cashback)),
            ":w": Decimal(format_decimal_str(current_balance)),
            ":u": datetime.now(timezone.utc).isoformat()
        }
    )

    if promo_deducted > 0:
        log_deductions(user_id, promo_deducted, instance_id, "PROMO_DEDUCTION")
        log_notification(user_id, f"Promo balance of ${format_decimal_str(promo_deducted)} used for billing '{system_name}' PC.", "info", "Promotional Balance used", "billing-alert")
    if cashback_deducted > 0:
        log_deductions(user_id, cashback_deducted, instance_id, "CASHBACK_DEDUCTION")
        log_notification(user_id, f"Cashback balance of ${format_decimal_str(cashback_deducted)} used for billing '{system_name}' PC.", "info", "Cashback Balance used", "billing-alert")
    if balance_deducted > 0:
        log_deductions(user_id, balance_deducted, instance_id, "BALANCE_DEDUCTION")
        log_notification(user_id, f"${format_decimal_str(balance_deducted)} deducted from wallet for '{system_name}' PC.", "info", "Wallet Deduction", "billing-alert")
    if campaign_name and discount_amount > 0:
        log_notification(user_id, f"{campaign_name} applied a ${format_decimal_str(discount_amount)} discount on '{system_name}' PC.", "success", "Campaign discount applied", "billing-alert")

    current_instance_state = get_last_instance_status(instance_id)
    start_time = datetime.now(timezone.utc)
    pc_billing_table = dynamodb.Table(billing_table_name)
    pc_billing_table.put_item(Item={
        "instanceId": instance_id,
        "userId": user_id,
        "systemName": system_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "billingAmount": format_decimal_str(amount),
        "originalBillingAmount": format_decimal_str(original_amount),
        "discountAmount": format_decimal_str(discount_amount),
        "discountPercent": format_decimal_str(discount_percent),
        "discountCampaignId": campaign_id or "",
        "discountCampaignName": campaign_name or "",
        "billingPlan": new_plan,
        "instanceCost": format_decimal_str(instance_price),
        "storageCost": format_decimal_str(storage_price),
        "startTime": start_time.isoformat(),
        "endTime": calculate_end_time(start_time, new_plan).isoformat(),
        'promoDeduction': format_decimal_str(promo_deducted),
        'cashbackDeduction': format_decimal_str(cashback_deducted),
        'balanceDeduction': format_decimal_str(balance_deducted),
        'systemStatus': current_instance_state
    })
    print(f"[BILLING] Logged billing for instance {instance_id}")

    update_expr = "SET autoRenew = :a, updatedTimestamp = :u"
    expr_attr_values = {
        ":a": bool(True),
        ":u": datetime.now(timezone.utc).isoformat()
    }
    resource_tracking_table = dynamodb.Table(resource_table_name)
    resource_tracking_table.update_item(
        Key={"resourceId": instance_id, "resourceType": "instance"},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_attr_values
    )
    log_notification(
        user_id,
        f"Auto-renew turned on for {system_name} PC.",
        "info", "Auto-recharge turned on", "billing-alert"
    )
    log_billing_event(user_id, "AUTO_RENEW_UPDATE", {"autoRenew": True, "instanceId": instance_id})

    return True

def calculate_end_time(start_time, billing_plan):
    if billing_plan.lower() == "hourly":
        end_time = start_time + timedelta(hours=1)
    elif billing_plan.lower() == "daily":
        end_time = start_time + timedelta(days=1)
    elif billing_plan.lower() == "weekly":
        end_time = start_time + timedelta(weeks=1)
    elif billing_plan.lower() == "monthly":
        end_time = start_time + timedelta(days=30)
    else:
        end_time = start_time
    return end_time

def get_upgrade_pricing(config_id, region, billing_plan, storage_size, status):
    instance_pricing_table = dynamodb.Table(instance_pricing_table_name)
    storage_pricing_table = dynamodb.Table(ssd_pricing_table_name)

    # Fetch instance pricing
    instance_data = instance_pricing_table.scan(
        FilterExpression=Key('configId').eq(config_id) & Key('region').eq(region)
    )['Items']
    if not instance_data:
        raise Exception(f"No instance pricing found for configId: {config_id} and region: {region}")
    instance_price_row = instance_data[0]

    # Fetch storage pricing (we'll just pick the first match for region)
    storage_data = storage_pricing_table.scan(
        FilterExpression=Key('region').eq(region) & Key('size').eq(storage_size)
    )['Items']
    if not storage_data:
        raise Exception(f"No storage pricing found for region: {region}")
    storage_price_row = storage_data[0]

    instance_price = storage_price = Decimal("0.0")
    # Pricing logic
    if billing_plan == 'hourly':
        if status == 'running':
            instance_price = Decimal(str(instance_price_row['pricePerHour']))
        storage_price = Decimal(str(storage_price_row['pricePerGBHour'])) * Decimal(storage_size)
    elif billing_plan == 'daily':
        instance_price = Decimal(str(instance_price_row['pricePerDay']))
        storage_price = Decimal(str(storage_price_row['pricePerGBDay'])) * Decimal(storage_size)
    elif billing_plan == 'monthly':
        instance_price = Decimal(str(instance_price_row['pricePerMonth']))
        storage_price = Decimal(str(storage_price_row['pricePerGBMonth'])) * Decimal(storage_size)
    else:
        raise Exception("Invalid billing plan")

    return instance_price, storage_price

def log_deductions(user_id: str, amount: Decimal, instance_id: str,
                            event_type: str, status: str = "SUCCESS", err: str = None):
    details = {
        "amount": format_decimal_str(amount),
        "instanceId": instance_id
    }
    if err:
        details["error"] = err
    log_billing_event(user_id, event_type, details, status)
    

def log_billing_event(user_id: str, event_type: str, details: Dict, status: str = "SUCCESS"):
    """Log event to audit table"""
    item = {
        'userId': user_id,
        'eventTimestamp': datetime.now().isoformat(),
        'eventType': event_type,
        'details': details,
        'status': status
    }
    events_table = dynamodb.Table(audit_table_name)
    events_table.put_item(Item=item)

def get_instance(instance_id: str) -> List[Dict[str, Any]]:
        resource_table = dynamodb.Table(resource_table_name)
        response = resource_table.get_item(Key={'resourceId': instance_id, 'resourceType': 'instance'})

        return response.get('Item')

def log_notification(user_id: str, content: str, severity: str, title: str = "Notification", type: str = "general"):
        notifications_table = dynamodb.Table(notification_table_name)
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

def get_current_billing_plan(instance_id: str):
    try:
        billing_table = dynamodb.Table(billing_table_name)
        response = billing_table.query(
            KeyConditionExpression=Key("instanceId").eq(instance_id),
            ScanIndexForward=False,  # latest first
            Limit=1
        )

        items = response.get("Items", [])
        if not items:
            print(f"No billing record found for instance {instance_id}")
            return None

        billing_record = items[0]
        plan = billing_record.get("billingPlan", "").lower()
        return plan

    except Exception as e:
        print(f"Failed to fetch billing plan for {instance_id}: {e}")
        return None
    

def get_last_instance_status(instance_id) -> Optional[str]:
    events_table = dynamodb.Table(events_table_name)
    events = events_table.query(
        KeyConditionExpression=Key('instanceId').eq(instance_id)
    )['Items']

    if not events:
        return None
    
    valid_actions = {
        'start', 'create',
        'stopped', 'terminate', 'delete',
        'terminated', 'deleted', 'stop'
    }

    # Filter only relevant events
    filtered_events = [
        e for e in events
        if e.get('action', '').lower() in valid_actions
    ]

    if not filtered_events:
        return None

    # Sort events by timestamp
    latest_event = max(filtered_events, key=lambda e: to_utc_datetime(e['timestamp']))
    action = latest_event.get('action', '').lower()

    if action in ('start', 'create'):
        return "running"
    elif action in ('stopped', 'terminate', 'delete', 'terminated', 'deleted', 'stop'):
        return "stopped"
    else:
        return None
    
def to_utc_datetime(dt_str: str) -> datetime:
    """Convert ISO string to UTC-aware datetime (even if naive)."""
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def to_decimal_3(value):
    """Round a numeric value to max 3 decimal places and return Decimal."""
    return Decimal(str(round(Decimal(value), 3)))
