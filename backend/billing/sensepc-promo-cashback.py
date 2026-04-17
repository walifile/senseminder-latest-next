
import os
import json
import boto3
import random
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, List

from boto3.dynamodb.conditions import Key  # ✅ needed for query

dynamodb = boto3.resource("dynamodb")

# Tables
WALLET_TABLE = dynamodb.Table(os.environ["WALLET_TABLE_NAME"])
CLAIMS_TABLE = dynamodb.Table(os.environ["PROMO_CLAIMS_TABLE_NAME"])
USER_TABLE = dynamodb.Table(os.environ["USER_TABLE_NAME"])
AUDIT_TABLE = dynamodb.Table(os.environ["USER_AUDIT_TABLE_NAME"])

# Active sessions
ACTIVE_SESSIONS_TABLE = dynamodb.Table(os.environ["ACTIVE_SESSIONS_TABLE_NAME"])

CLAIMS_IP_GSI_NAME = os.environ.get("PROMO_CLAIMS_IP_GSI_NAME", "gsi_ip_claims")

# Env Config
PROMO_ENABLED = os.environ.get("PROMO_ENABLED", "false").lower() == "true"
PROMO_ID = os.environ.get("PROMO_ID")
PROMO_LOWER = int(os.environ.get("PROMO_LOWER_BOUND"))
PROMO_UPPER = int(os.environ.get("PROMO_UPPER_BOUND"))
PROMO_START = os.environ.get("PROMO_START_DATE") 
PROMO_END = os.environ.get("PROMO_END_DATE")      
PROMO_CAMPAIGN_NAME = os.environ.get("PROMO_CAMPAIGN_NAME", "Joining Promo code")


def lambda_handler(event, context):
    try:
        method = event.get("httpMethod")
        path = event.get("path", "")

        if method == "OPTIONS":
            return {"statusCode": 200, "headers": cors_headers(), "body": ""}

        headers = cors_headers()

        claims = event["requestContext"]["authorizer"]["claims"]
        user_id = claims.get("sub")
        email = claims.get("email")

        if not user_id or not email:
            return resp(headers, 401, {"message": "Unauthorized: missing user info"})

        now = datetime.now(timezone.utc)
        start_dt = datetime.fromisoformat(PROMO_START.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(PROMO_END.replace("Z", "+00:00"))

        user_item = USER_TABLE.get_item(Key={"email": email}).get("Item")
        if not user_item:
            return resp(headers, 404, {"message": "User profile not found"})

        signup_dt = datetime.fromisoformat(user_item["createdAt"].replace("Z", "+00:00"))
        role = user_item.get("role")

        if role in ["admin", "member"]:
            return resp(headers, 403, {"message": "Forbidden: Not eligible for promos"})

        if method == "GET" and path.endswith("/promo"):
            return handle_get(headers, user_id, signup_dt, now, start_dt, end_dt)

        if method == "POST" and path.endswith("/promo"):
            return handle_post(headers, user_id, email, signup_dt, now, start_dt, end_dt)

        return resp(headers, 404, {"message": "Route not found"})

    except Exception as e:
        return resp(cors_headers(), 500, {"message": str(e)})


def handle_get(headers, user_id, signup_dt, now, start_dt, end_dt):
    if not PROMO_ENABLED:
        return with_wallet_balance(headers, user_id, False, "Promo disabled")

    if now < start_dt:
        return with_wallet_balance(headers, user_id, False, "Campaign not started yet")

    if now > end_dt:
        return with_wallet_balance(headers, user_id, False, "Campaign ended")

    if signup_dt < start_dt or signup_dt > end_dt:
        return with_wallet_balance(headers, user_id, False, "Signed up outside campaign window")

    existing = CLAIMS_TABLE.get_item(
        Key={"userId": user_id, "promoId": PROMO_ID}
    ).get("Item")
    if existing:
        return with_wallet_balance(headers, user_id, False, "Already redeemed")

    latest_ip = get_latest_active_session_ip(user_id)
    if latest_ip:
        if ip_already_claimed(latest_ip):
            return with_wallet_balance(headers, user_id, False, "Promo already claimed from this IP")

    return resp(headers, 200, {
        "eligible": True,
        "reason": "Promo available",
        "promoBalance": 0
    })


def handle_post(headers, user_id, email, signup_dt, now, start_dt, end_dt):
    if not PROMO_ENABLED:
        return resp(headers, 400, {"message": "Promo is disabled"})

    if now < start_dt or now > end_dt:
        return resp(headers, 400, {"message": "Promo not active"})

    if signup_dt < start_dt or signup_dt > end_dt:
        return resp(headers, 400, {"message": "Not eligible for this campaign"})

    existing = CLAIMS_TABLE.get_item(
        Key={"userId": user_id, "promoId": PROMO_ID}
    ).get("Item")
    if existing:
        return resp(headers, 400, {"message": "Promo already redeemed"})

    latest_ip = get_latest_active_session_ip(user_id)
    if latest_ip:
        if ip_already_claimed(latest_ip):
            return resp(headers, 400, {"message": "Promo already claimed from this IP"})

    amount = random.randint(PROMO_LOWER, PROMO_UPPER)
    ts = datetime.now(timezone.utc).isoformat()

    WALLET_TABLE.update_item(
        Key={"userId": user_id},
        UpdateExpression=(
            "SET promoBalance = if_not_exists(promoBalance, :zero) + :amt, "
            "updatedTimestamp = :ts"
        ),
        ExpressionAttributeValues={
            ":zero": Decimal(0),
            ":amt": Decimal(amount),
            ":ts": ts
        }
    )

    claim_item = {
        "userId": user_id,
        "promoId": PROMO_ID,
        "claimedAt": ts,
        "amount": Decimal(amount),
        "email": email,
    }
    if latest_ip:
        claim_item["ip"] = latest_ip 

    CLAIMS_TABLE.put_item(
        Item=claim_item,
        ConditionExpression="attribute_not_exists(userId) AND attribute_not_exists(promoId)"
    )

    try:
        log_promo_claim(user_id=user_id, amount=amount, status="SUCCESS")
    except Exception as e:
        print(f"[WARN] Failed to write promo audit log: {e}")

    return resp(headers, 200, {
        "message": "Promo redeemed successfully",
        "amountAdded": amount,
        "promoId": PROMO_ID,
        "ipStored": latest_ip if latest_ip else None  
    })


def get_latest_active_session_ip(user_id: str) -> Optional[str]:
    """
    Reads ACTIVE_SESSIONS_TABLE for a userId, picks the latest item by createdAt,
    and returns its ip. If no sessions or ip is missing, returns None.
    """
    try:
        q = ACTIVE_SESSIONS_TABLE.query(
            KeyConditionExpression=Key("userId").eq(user_id)
        )
        items: List[Dict[str, Any]] = q.get("Items", []) or []
        if not items:
            return None

        def parse_created_at(it: Dict[str, Any]) -> datetime:
            raw = it.get("createdAt")
            if not raw or not isinstance(raw, str):
                return datetime.fromtimestamp(0, tz=timezone.utc)
            try:
                dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
            except Exception:
                return datetime.fromtimestamp(0, tz=timezone.utc)

        latest = max(items, key=parse_created_at)
        ip = latest.get("ip")
        if isinstance(ip, str) and ip.strip():
            return ip.strip()
        return None
    except Exception as e:
        print(f"[WARN] Failed to read latest active session IP for userId={user_id}: {e}")
        return None


def ip_already_claimed(ip: str) -> bool:
    """
    Checks if Promo Claims table already has ANY item with this ip using GSI gsi_ip_claims.
    Returns True if at least one claim exists for the IP.
    """
    try:
        res = CLAIMS_TABLE.query(
            IndexName=CLAIMS_IP_GSI_NAME,
            KeyConditionExpression=Key("ip").eq(ip),
            Limit=1
        )
        return (res.get("Count", 0) or 0) > 0
    except Exception as e:
        # safer: don't block eligibility if lookup fails
        print(f"[WARN] Failed IP claims lookup for ip={ip}: {e}")
        return False


def with_wallet_balance(headers, user_id, eligible, reason):
    wallet = WALLET_TABLE.get_item(Key={"userId": user_id}).get("Item")
    balance = wallet.get("promoBalance", 0) if wallet else 0
    return resp(headers, 200, {
        "eligible": eligible,
        "reason": reason,
        "promoBalance": float(balance)
    })


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


def resp(headers, code, body):
    return {"statusCode": code, "headers": headers, "body": json.dumps(body)}


def log_promo_claim(user_id: str, amount: int, status: str = "SUCCESS"):
    """
    Writes to SmartPCUserAudit (env-driven) using the EXACT format expected:
      - PK: userId
      - SK: eventTimestamp (ISO string)
      - eventType: 'PROMO_BALANCE_ADDED'
      - details: { campaign: <name>, amount: <Number> }
      - status: 'SUCCESS' | 'FAILED'
    """
    event_timestamp = datetime.now().isoformat()
    AUDIT_TABLE.put_item(
        Item={
            "userId": user_id,
            "eventTimestamp": event_timestamp,
            "eventType": "PROMO_BALANCE_ADDED",
            "details": {
                "campaign": PROMO_CAMPAIGN_NAME,
                "amount": Decimal(amount),
            },
            "status": status,
        }
    )

