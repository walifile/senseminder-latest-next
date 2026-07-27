import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional, Set

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource("dynamodb")

BUCKETS_TABLE = dynamodb.Table(os.environ.get("STORAGE_BUCKETS_TABLE_NAME", "SmartPCBuckets"))
METADATA_TABLE = dynamodb.Table(os.environ.get("STORAGE_METADATA_TABLE_NAME", "SmartPCStorageMetadata"))
USAGE_TABLE = dynamodb.Table(os.environ.get("STORAGE_USAGE_TABLE_NAME", "SmartPCStorageUsage"))
USER_REGION_TABLE = dynamodb.Table(os.environ.get("USER_STORAGE_REGION_TABLE_NAME", "SmartPCUserStorageRegion"))
USER_TABLE = dynamodb.Table(os.environ.get("USER_TABLE_NAME", "senseminder-user"))

ADMIN_GROUPS = {"admin", "owner", "Admin", "Owner"}
ADMIN_ROLES = {"admin", "owner"}
LEGACY_REGION_MAP = {"virginia": "us-east-1", "oregon": "us-west-2"}


def lambda_handler(event, context):
    try:
        method = _request_method(event)
        if method == "OPTIONS":
            return _response(204, {})
        if method != "GET":
            return _response(405, {"message": "Method not allowed"})

        claims = _get_claims(event)
        requester_id = claims.get("sub") or _query(event).get("requesterId")
        requester_email = claims.get("email")
        requester_groups = _get_groups(claims)
        custom_role = str(claims.get("custom:role") or "").strip().lower()
        db_role = resolve_requester_role(requester_email, requester_id)
        is_admin = (
            bool(ADMIN_GROUPS.intersection(requester_groups))
            or custom_role in ADMIN_ROLES
            or db_role in ADMIN_ROLES
        )
        print(
            "[DEBUG] admin-check "
            f"raw_claims={json.dumps(claims, default=str)} "
            f"requester_groups={requester_groups} custom_role={custom_role!r} "
            f"db_role={db_role!r} is_admin={is_admin}"
        )

        params = _query(event)
        scope = (params.get("scope") or "me").strip().lower()
        target_user_id = (params.get("userId") or requester_id or "").strip()

        if scope == "all":
            # API Gateway already restricts this route to the admin Cognito
            # pool, so any request that reaches here is already an admin —
            # no additional in-code role/group check needed.
            return _response(200, build_all_storage_summary())

        if not target_user_id:
            return _response(401, {"message": "Missing user identity."})
        if requester_id and target_user_id != requester_id and not is_admin:
            return _response(403, {"message": "You can only view your own storage usage."})

        return _response(
            200,
            build_user_storage_summary(
                target_user_id,
                include_global=False,
                requester_email=requester_email,
            ),
        )
    except Exception as exc:
        print(f"[ERROR] storage info failed: {exc}")
        return _response(500, {"message": "Internal server error", "error": str(exc)})


def build_all_storage_summary() -> Dict[str, Any]:
    bucket_regions = load_storage_regions()
    active_items = scan_active_metadata()
    usage_rows = scan_usage_rows()
    user_email_map = fetch_user_email_map({item.get("userId") for item in active_items if item.get("userId")})

    summary = aggregate_metadata(active_items, bucket_regions, usage_rows, user_email_map)
    summary["scope"] = "all"
    summary["generatedAt"] = now_iso()
    summary["regionCatalog"] = bucket_regions
    return summary


def build_user_storage_summary(user_id: str, include_global: bool = False, requester_email: Optional[str] = None) -> Dict[str, Any]:
    active_items = query_user_active_metadata(user_id)
    usage_rows = query_user_usage_rows(user_id)
    stored_region = get_user_storage_region(user_id)
    user_email_map = {user_id: requester_email} if requester_email else fetch_user_email_map({user_id})
    bucket_regions = load_storage_regions()

    summary = aggregate_metadata(active_items, bucket_regions, usage_rows, user_email_map)
    user_summary = summary["users"][0] if summary["users"] else empty_user_summary(user_id, user_email_map.get(user_id), stored_region)

    return {
        "scope": "me",
        "generatedAt": now_iso(),
        "summary": {
            "totalBytes": user_summary["totalBytes"],
            "totalDisplay": user_summary["totalDisplay"],
            "activeFileCount": user_summary["activeFileCount"],
            "folderCount": user_summary["folderCount"],
            "regionCount": len(user_summary["regions"]),
            "currentMonthBytes": user_summary.get("currentMonthBytes", 0),
            "currentMonthDisplay": format_bytes(user_summary.get("currentMonthBytes", 0)),
        },
        "user": user_summary,
        "regions": user_summary["regions"],
        "regionCatalog": bucket_regions if include_global else [],
    }


def aggregate_metadata(
    active_items: List[Dict[str, Any]],
    bucket_regions: List[Dict[str, Any]],
    usage_rows: List[Dict[str, Any]],
    user_email_map: Dict[str, Optional[str]],
) -> Dict[str, Any]:
    region_map: Dict[str, Dict[str, Any]] = {}
    for bucket in bucket_regions:
        region = normalize_region(bucket.get("region")) or "unknown"
        region_map[region] = {
            "region": region,
            "label": bucket.get("label") or region,
            "shortLabel": bucket.get("shortLabel") or bucket.get("label") or region,
            "bucketName": bucket.get("bucketName"),
            "totalBytes": 0,
            "totalDisplay": "0 B",
            "activeFileCount": 0,
            "folderCount": 0,
            "userCount": 0,
        }

    user_map: Dict[str, Dict[str, Any]] = {}
    region_users: Dict[str, Set[str]] = {}

    for item in active_items:
        user_id = str(item.get("userId") or "").strip()
        if not user_id:
            continue
        region = normalize_region(item.get("region")) or "unknown"
        file_type = str(item.get("fileType") or "").lower()
        is_folder = file_type == "folder"
        size = 0 if is_folder else parse_size_bytes(item.get("size"))

        if region not in region_map:
            region_map[region] = {
                "region": region,
                "label": region,
                "shortLabel": region,
                "bucketName": item.get("bucket"),
                "totalBytes": 0,
                "totalDisplay": "0 B",
                "activeFileCount": 0,
                "folderCount": 0,
                "userCount": 0,
            }

        region_entry = region_map[region]
        region_entry["totalBytes"] += size
        region_entry["activeFileCount"] += 0 if is_folder else 1
        region_entry["folderCount"] += 1 if is_folder else 0
        region_users.setdefault(region, set()).add(user_id)

        user_entry = user_map.setdefault(
            user_id,
            {
                "userId": user_id,
                "email": user_email_map.get(user_id),
                "totalBytes": 0,
                "totalDisplay": "0 B",
                "activeFileCount": 0,
                "folderCount": 0,
                "lastUpdatedAt": None,
                "currentMonthBytes": 0,
                "currentMonthDisplay": "0 B",
                "peakMonthBytes": 0,
                "peakMonthDisplay": "0 B",
                "regions": [],
                "_regions": {},
            },
        )
        user_entry["totalBytes"] += size
        user_entry["activeFileCount"] += 0 if is_folder else 1
        user_entry["folderCount"] += 1 if is_folder else 0
        user_entry["lastUpdatedAt"] = latest_iso(user_entry.get("lastUpdatedAt"), item.get("updatedAt") or item.get("createdAt"))

        user_region = user_entry["_regions"].setdefault(
            region,
            {
                "region": region,
                "label": region_entry.get("label") or region,
                "totalBytes": 0,
                "totalDisplay": "0 B",
                "activeFileCount": 0,
                "folderCount": 0,
            },
        )
        user_region["totalBytes"] += size
        user_region["activeFileCount"] += 0 if is_folder else 1
        user_region["folderCount"] += 1 if is_folder else 0

    latest_usage_by_user: Dict[str, Dict[str, Any]] = {}
    for row in usage_rows:
        user_id = str(row.get("userId") or "").strip()
        if not user_id:
            user_month = str(row.get("userMonth") or "")
            user_id = user_month.split("#", 1)[0] if "#" in user_month else ""
        if not user_id:
            continue
        current = latest_usage_by_user.get(user_id)
        if current is None or str(row.get("month") or row.get("userMonth") or "") > str(current.get("month") or current.get("userMonth") or ""):
            latest_usage_by_user[user_id] = row

    for user_id, row in latest_usage_by_user.items():
        user_entry = user_map.setdefault(user_id, empty_user_summary(user_id, user_email_map.get(user_id), None))
        user_entry["currentMonthBytes"] = parse_size_bytes(row.get("currentBytes"))
        user_entry["currentMonthDisplay"] = format_bytes(user_entry["currentMonthBytes"])
        user_entry["peakMonthBytes"] = parse_size_bytes(row.get("peakBytes"))
        user_entry["peakMonthDisplay"] = format_bytes(user_entry["peakMonthBytes"])

    for region, users in region_users.items():
        region_map[region]["userCount"] = len(users)

    for region_entry in region_map.values():
        region_entry["totalDisplay"] = format_bytes(region_entry["totalBytes"])

    users = []
    for user_entry in user_map.values():
        regions = list(user_entry.pop("_regions", {}).values())
        for user_region in regions:
            user_region["totalDisplay"] = format_bytes(user_region["totalBytes"])
        regions.sort(key=lambda item: item["totalBytes"], reverse=True)
        user_entry["regions"] = regions
        user_entry["totalDisplay"] = format_bytes(user_entry["totalBytes"])
        users.append(user_entry)

    users.sort(key=lambda item: item["totalBytes"], reverse=True)
    regions = sorted(region_map.values(), key=lambda item: item["totalBytes"], reverse=True)

    total_bytes = sum(region["totalBytes"] for region in regions)
    return {
        "summary": {
            "totalBytes": total_bytes,
            "totalDisplay": format_bytes(total_bytes),
            "activeFileCount": sum(region["activeFileCount"] for region in regions),
            "folderCount": sum(region["folderCount"] for region in regions),
            "userCount": len(users),
            "regionCount": len([region for region in regions if region["totalBytes"] > 0]),
        },
        "regions": regions,
        "users": users,
    }


def empty_user_summary(user_id: str, email: Optional[str], stored_region: Optional[str]) -> Dict[str, Any]:
    return {
        "userId": user_id,
        "email": email,
        "totalBytes": 0,
        "totalDisplay": "0 B",
        "activeFileCount": 0,
        "folderCount": 0,
        "lastUpdatedAt": None,
        "currentMonthBytes": 0,
        "currentMonthDisplay": "0 B",
        "peakMonthBytes": 0,
        "peakMonthDisplay": "0 B",
        "regions": ([{"region": stored_region, "label": stored_region, "totalBytes": 0, "totalDisplay": "0 B", "activeFileCount": 0, "folderCount": 0}] if stored_region else []),
        "_regions": {},
    }


def scan_active_metadata() -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    params = {
        "ProjectionExpression": "id, userId, #r, #b, fileType, size, isDeleted, createdAt, updatedAt",
        "ExpressionAttributeNames": {"#r": "region", "#b": "bucket"},
    }
    while True:
        res = METADATA_TABLE.scan(**params)
        items.extend([item for item in res.get("Items", []) if not item.get("isDeleted")])
        last_key = res.get("LastEvaluatedKey")
        if not last_key:
            break
        params["ExclusiveStartKey"] = last_key
    return items


def query_user_active_metadata(user_id: str) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    params = {
        "IndexName": "userId-index",
        "KeyConditionExpression": Key("userId").eq(user_id),
        "ProjectionExpression": "id, userId, #r, #b, fileType, size, isDeleted, createdAt, updatedAt",
        "ExpressionAttributeNames": {"#r": "region", "#b": "bucket"},
    }
    while True:
        res = METADATA_TABLE.query(**params)
        items.extend([item for item in res.get("Items", []) if not item.get("isDeleted")])
        last_key = res.get("LastEvaluatedKey")
        if not last_key:
            break
        params["ExclusiveStartKey"] = last_key
    return items


def scan_usage_rows() -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    params = {"ProjectionExpression": "userMonth, userId, #m, currentBytes, peakBytes, updatedAt", "ExpressionAttributeNames": {"#m": "month"}}
    while True:
        res = USAGE_TABLE.scan(**params)
        items.extend(res.get("Items", []))
        last_key = res.get("LastEvaluatedKey")
        if not last_key:
            break
        params["ExclusiveStartKey"] = last_key
    return items


def query_user_usage_rows(user_id: str) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    for row in scan_usage_rows():
        if str(row.get("userId") or "") == user_id or str(row.get("userMonth") or "").startswith(f"{user_id}#"):
            items.append(row)
    return items


def load_storage_regions() -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    params = {}
    while True:
        res = BUCKETS_TABLE.scan(**params)
        items.extend(res.get("Items", []))
        last_key = res.get("LastEvaluatedKey")
        if not last_key:
            break
        params["ExclusiveStartKey"] = last_key

    regions = []
    for item in items:
        region = normalize_region(item.get("region"))
        if not region:
            continue
        regions.append(
            {
                "region": region,
                "label": item.get("label") or region,
                "shortLabel": item.get("shortLabel") or item.get("label") or region,
                "bucketName": item.get("bucketName"),
                "enabled": item.get("enabled", True),
                "order": int(item.get("order", 999) or 999),
            }
        )
    regions.sort(key=lambda item: (item["order"], item["label"]))
    return regions


def get_user_storage_region(user_id: str) -> Optional[str]:
    try:
        item = USER_REGION_TABLE.get_item(Key={"userId": user_id}).get("Item")
        return normalize_region(item.get("region")) if item else None
    except Exception as exc:
        print(f"[WARN] user region lookup failed for userId={user_id}: {exc}")
        return None


def resolve_requester_role(email: Optional[str], user_id: Optional[str]) -> Optional[str]:
    """
    Look up the requester's `role` attribute from USER_TABLE (same table/shape
    used by other lambdas, e.g. promo-cashback and sms-manage-user-profile),
    since this app's admin status is stored there rather than in Cognito
    Groups. Tries by email (the table's primary key) first, falling back to
    the id-index GSI when the JWT doesn't carry an email claim.
    """
    item = None
    if email:
        try:
            item = USER_TABLE.get_item(Key={"email": email}).get("Item")
        except Exception as exc:
            print(f"[WARN] role lookup by email failed for email={email}: {exc}")
    if not item and user_id:
        try:
            res = USER_TABLE.query(IndexName="id-index", KeyConditionExpression=Key("id").eq(user_id), Limit=1)
            items = res.get("Items") or []
            item = items[0] if items else None
        except Exception as exc:
            print(f"[WARN] role lookup by id failed for userId={user_id}: {exc}")
    role = str((item or {}).get("role") or "").strip().lower()
    return role or None


def fetch_user_email_map(user_ids: Set[str]) -> Dict[str, Optional[str]]:
    result: Dict[str, Optional[str]] = {}
    for user_id in [uid for uid in user_ids if uid]:
        result[user_id] = None
        try:
            res = USER_TABLE.query(IndexName="id-index", KeyConditionExpression=Key("id").eq(user_id), Limit=1)
            if res.get("Items"):
                result[user_id] = res["Items"][0].get("email")
        except Exception as exc:
            print(f"[WARN] user lookup failed for userId={user_id}: {exc}")
    return result


def _get_claims(event: Dict[str, Any]) -> Dict[str, Any]:
    authorizer = (event.get("requestContext") or {}).get("authorizer") or {}
    return authorizer.get("claims") or (authorizer.get("jwt") or {}).get("claims") or {}


def _get_groups(claims: Dict[str, Any]) -> Set[str]:
    raw = claims.get("cognito:groups") or claims.get("groups") or ""
    if isinstance(raw, list):
        return {str(value) for value in raw}
    return {part.strip() for part in str(raw).replace("[", "").replace("]", "").replace('"', "").split(",") if part.strip()}


def _query(event: Dict[str, Any]) -> Dict[str, str]:
    return event.get("queryStringParameters") or {}


def _request_method(event: Dict[str, Any]) -> str:
    return event.get("httpMethod") or ((event.get("requestContext") or {}).get("http") or {}).get("method") or ""


def normalize_region(region: Any) -> str:
    value = str(region or "").strip().lower()
    return LEGACY_REGION_MAP.get(value, value)


def parse_size_bytes(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, Decimal):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    text = str(value).strip().lower()
    if not text:
        return 0
    import re

    match = re.match(r"^([\d.]+)\s*(b|kb|kib|mb|mib|gb|gib|tb|tib)?$", text)
    if not match:
        try:
            return int(float(text))
        except Exception:
            return 0
    number = float(match.group(1))
    unit = match.group(2) or "b"
    multipliers = {
        "b": 1,
        "kb": 1000,
        "kib": 1024,
        "mb": 1000 ** 2,
        "mib": 1024 ** 2,
        "gb": 1000 ** 3,
        "gib": 1024 ** 3,
        "tb": 1000 ** 4,
        "tib": 1024 ** 4,
    }
    return int(number * multipliers[unit])


def format_bytes(value: Any) -> str:
    size = parse_size_bytes(value)
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    amount = float(size)
    unit_index = 0
    while amount >= 1024 and unit_index < len(units) - 1:
        amount /= 1024
        unit_index += 1
    if unit_index == 0:
        return f"{int(amount)} B"
    return f"{amount:.2f}".rstrip("0").rstrip(".") + f" {units[unit_index]}"


def latest_iso(current: Optional[str], candidate: Optional[str]) -> Optional[str]:
    if not candidate:
        return current
    if not current:
        return str(candidate)
    return str(candidate) if str(candidate) > str(current) else current


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _json_default(value):
    if isinstance(value, Decimal):
        as_float = float(value)
        return int(as_float) if as_float.is_integer() else as_float
    if isinstance(value, set):
        return list(value)
    return str(value)


def _response(status_code: int, body: Dict[str, Any]):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,authorization,x-user-id",
        },
        "body": json.dumps(body, default=_json_default),
    }
