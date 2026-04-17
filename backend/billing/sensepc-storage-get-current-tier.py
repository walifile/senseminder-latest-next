import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal, ROUND_CEILING, ROUND_FLOOR
from datetime import datetime, timezone

region = os.environ.get("AWS_REGION", "us-east-1")
TABLE_SMARTPC_STORAGE_PRICING = os.environ.get("TABLE_SMARTPC_STORAGE_PRICING", "SmartPCStoragePricing")
TABLE_SMARTPC_STORAGE_METADATA = os.environ.get('TABLE_SMARTPC_STORAGE_METADATA', 'SmartPCStorageMetadata')
METADATA_USERID_INDEX_NAME = "userId-index"

dynamodb = boto3.resource("dynamodb", region_name=region)
pricing_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_PRICING)
metadata_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_METADATA)

def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    try:
        # Extract user identity from Cognito token claim
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
            return _response(403, {"message": "Members are not allowed to retrieve current storage tier"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        pricing_tiers = get_all_pricing_tiers()
        files = get_user_files(owner_id)
        lastFileRegion = get_last_file_region(files)
        pricing_tier = identify_pricing_tier(files, pricing_tiers)

        response_data = {
            "lastFileRegion": lastFileRegion,
            "tier": pricing_tier
        } 
        print(f"Pricing tier response: {response_data}")
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
        'body': json.dumps(body, default=str)
    }

def parse_iso_to_utc(dt_str: str) -> datetime:
    """
    Parse an ISO-8601 string that may be 'naive' or 'aware' and return a UTC-aware datetime.
    Handles trailing 'Z' as well.
    """
    if not dt_str:
        return None
    # Normalize 'Z' to '+00:00' so fromisoformat accepts it
    s = dt_str.replace('Z', '+00:00')
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        # Naive -> assume UTC
        return dt.replace(tzinfo=timezone.utc)
    # Aware -> convert to UTC
    return dt.astimezone(timezone.utc)

def get_all_pricing_tiers():
    response = pricing_table.scan()
    pricing_tiers = sorted(response['Items'], key=lambda x: Decimal(x['lowerLimit']))
    return pricing_tiers

def identify_pricing_tier(files, pricing_tiers):
    print(f"finding storage tier for {len(files)} files")
    
    current_net_storage = compute_storage(files)
    print(f' current net storage: {current_net_storage}')
    bill_gb = round_storage_gb(current_net_storage)
    print(f'Billable storage : {bill_gb}')
    pricing_tier = find_pricing_tier(bill_gb, pricing_tiers)
    print(f'Pricing tier :', pricing_tier)
    return pricing_tier


# def get_user_files(user_id):
#     response = metadata_table.query(
#         IndexName=METADATA_USERID_INDEX_NAME,
#         KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
#     )
#     return response['Items']

def _discover_table_keys(table_name: str):
    """Return a list of key attr names in order [HASH, (RANGE?)]"""
    desc = dynamodb.meta.client.describe_table(TableName=table_name)
    ks = desc["Table"]["KeySchema"]
    hash_key = next(k["AttributeName"] for k in ks if k["KeyType"] == "HASH")
    range_key = next((k["AttributeName"] for k in ks if k["KeyType"] == "RANGE"), None)
    return [hash_key] + ([range_key] if range_key else [])

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

def get_user_files(user_id: str):
    """
    Query the userId-only GSI and return whatever it projects.
    - No BatchGet (avoids ValidationException).
    - Full pagination (fetches all pages).
    - Logs how many items are missing 'size' so you can validate the index projection.
    """
    items = []
    last_evaluated_key = None
    pages = 0

    try:
        while True:
            kwargs = {
                "IndexName": METADATA_USERID_INDEX_NAME,
                "KeyConditionExpression": Key("userId").eq(user_id),
            }
            if last_evaluated_key:
                kwargs["ExclusiveStartKey"] = last_evaluated_key

            resp = metadata_table.query(**kwargs)
            page_items = resp.get("Items", [])
            items.extend(page_items)
            pages += 1

            last_evaluated_key = resp.get("LastEvaluatedKey")
            if not last_evaluated_key:
                break

        if not items:
            print(f"[INFO] GSI '{METADATA_USERID_INDEX_NAME}' returned 0 items for userId={user_id}")
            return items

        total = len(items)
        missing_size = sum(1 for it in items if "size" not in it)
        if missing_size:
            print(
                f"[INFO] GSI '{METADATA_USERID_INDEX_NAME}' items missing 'size': "
                f"{missing_size}/{total}. Projection likely KEYS_ONLY or missing 'size' in INCLUDE."
            )
        else:
            print(
                f"[DEBUG] GSI '{METADATA_USERID_INDEX_NAME}' returned {total} items across {pages} page(s); "
                f"all include 'size'."
            )
        return items

    except ClientError as e:
        # Never 500 the request because of metadata reads: return what we have.
        print(f"[WARN] Query on GSI '{METADATA_USERID_INDEX_NAME}' failed: {str(e)}")
        return items

# def compute_storage(files):
#     timepoints = []

#     for f in files:
#         created = datetime.fromisoformat(f['createdAt']).replace(tzinfo=timezone.utc)
#         deleted = datetime.fromisoformat(f['deletedAt']).replace(tzinfo=timezone.utc) if f.get('deletedAt') else None
#         print(f'filename : {f['fileName']}, created: {created}, deleted: {deleted}')
#         timepoints.append((created, int(f['size'])))
#         if deleted:
#             timepoints.append((deleted, -int(f['size'])))

#     print(f'timepoints: {timepoints}')
#     timepoints.sort()
#     current = 0
#     for _, size_change in timepoints:
#         current += size_change
#     print(f'current net storage: {current}')
#     return current

def _to_int_size(v):
    # Accept Decimal/str/int; treat missing/invalid as 0
    try:
        return int(v)
    except Exception:
        return 0

def compute_storage(files):
    timepoints = []
    for f in files:
        created = parse_iso_to_utc(f.get('createdAt'))
        deleted = parse_iso_to_utc(f.get('deletedAt')) if f.get('deletedAt') else None
        sz = _to_int_size(f.get('size') or f.get('fileSize') or f.get('contentLength'))

        # Skip if we don’t even have a created time
        if not created:
            print("Skipping item without createdAt:", f.get('fileName') or f)
            continue

        # If size is 0/missing, skip (or include—your call)
        if sz <= 0:
            print("Skipping item with missing/zero size:", f.get('fileName') or f)
            continue

        timepoints.append((created, sz))
        if deleted:
            timepoints.append((deleted, -sz))

    timepoints.sort()
    current = 0
    for _, delta in timepoints:
        current += delta
    print(f'current net storage: {current}')
    return current

def round_storage_gb(peak_storage_bytes):
    gb_value = Decimal(peak_storage_bytes) / Decimal(1024 ** 3)
    fraction = gb_value - gb_value.quantize(Decimal('1.'), rounding=ROUND_FLOOR)

    if fraction <= Decimal('0.5'):
        return gb_value.quantize(Decimal('1.'), rounding=ROUND_FLOOR)
    else:
        return gb_value.quantize(Decimal('1.'), rounding=ROUND_CEILING)


def find_pricing_tier(billable_gb, pricing_tiers):
    """
    Given billable GB and a list of pricing_tiers (sorted by lowerLimit),
    return the matching tier. Defaults to Tier 1 if nothing matches.
    """
    for tier in pricing_tiers:
        lower = int(tier.get("lowerLimit", 0))
        upper = int(tier.get("upperLimit", 0))

        if lower <= billable_gb <= upper:
            return tier

    # default fallback (Tier 1)
    return next((t for t in pricing_tiers if t.get("tier") == 1), pricing_tiers[0])


def get_last_file_region(files):
    
    if not files:
        return 'virginia'  # no files for this user

    # # Sort files by createdAt (ISO timestamp string → datetime)
    # files.sort(key=lambda x: datetime.fromisoformat(x['createdAt']), reverse=True)

    # Always compare UTC-aware datetimes
    files.sort(
        key=lambda x: parse_iso_to_utc(x.get('createdAt')),
        reverse=True
    )

    # Pick region of the latest file
    region = files[0].get('region')
    return region if region else 'virginia'  # default to virginia if not set


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