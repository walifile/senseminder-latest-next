import json
import os
from decimal import Decimal
from urllib import error, parse, request

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource("dynamodb")
ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION"))

USER_TABLE_NAME = os.environ.get("USER_TABLE_NAME", "senseminder-user")
QUOTA_TABLE_NAME = os.environ.get("QUOTA_TABLE_NAME", "SmartPCUserQuota")
PC_EVENTS_TABLE_NAME = os.environ.get("PC_EVENTS_TABLE_NAME", "SmartPCEvents")
USER_OWNER_INDEX = os.environ.get("USER_OWNER_INDEX", "owner_id-index")
FETCH_PC_URL = os.environ.get("FETCH_PC_URL")
DCV_SESSIONS_TABLE_NAME = os.environ.get("DCV_SESSIONS_TABLE_NAME", "SmartPCDCVSessions")
DCV_SESSIONS_USER_INDEX = os.environ.get("DCV_SESSIONS_USER_INDEX", "userId-instanceId-index")
REQUEST_TO_EMAIL = os.environ.get("MONITORING_LIMIT_REQUEST_TO_EMAIL")
REQUEST_FROM_EMAIL = os.environ.get("MONITORING_REQUEST_FROM_EMAIL")

BUSINESS_CONTRACT_TABLE_NAME = os.environ.get(
    "BUSINESS_CONTRACT_TABLE_NAME",
    "sensepc-business-contract",
)

user_table = dynamodb.Table(USER_TABLE_NAME)
quota_table = dynamodb.Table(QUOTA_TABLE_NAME)
pc_events_table = dynamodb.Table(PC_EVENTS_TABLE_NAME)

business_contract_table = dynamodb.Table(
    BUSINESS_CONTRACT_TABLE_NAME
)
dcv_sessions_table = dynamodb.Table(DCV_SESSIONS_TABLE_NAME)

GB = 1024 ** 3


def headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }



def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": headers(),
        "body": json.dumps(body, default=decimal_to_native),
    }


def decimal_to_native(value):
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    raise TypeError


def normalize_groups(raw_groups):
    if isinstance(raw_groups, list):
        return [str(group).strip().lower() for group in raw_groups if str(group).strip()]
    if isinstance(raw_groups, str):
        return [group.strip().lower() for group in raw_groups.split(",") if group.strip()]
    return []


def get_claims(event):
    return event.get("requestContext", {}).get("authorizer", {}).get("claims", {}) or {}


def get_bearer_token(event):
    incoming_headers = event.get("headers") or {}
    auth_header = incoming_headers.get("Authorization") or incoming_headers.get("authorization")
    if not auth_header:
        return None
    if auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return auth_header.strip()




def build_user_payload(item):
    user_id = item.get("id")
    return {
        "userId": user_id,
        "id": user_id,
        "email": item.get("email"),
        "firstName": item.get("firstName", ""),
        "lastName": item.get("lastName", ""),
        "role": item.get("role", "member"),
        "status": item.get("status", "active"),
        "organization": item.get("organization", ""),
        "country": item.get("country", ""),
        "phoneNumber": item.get("phoneNumber", ""),
        "createdAt": item.get("createdAt", ""),
        "lastSeenAt": item.get("lastSeenAt", ""),
    }


def get_user_quota(user_id):
    item = quota_table.get_item(Key={"userId": user_id}).get("Item") or {}
    storage_quota = int(item.get("storageQuota", 0) or 0)
    used_storage = int(item.get("usedStorage", 0) or 0)
    return {
        "quota": int(item.get("quota", 0) or 0),
        "storageQuotaBytes": storage_quota,
        "storageQuotaGB": round(storage_quota / GB, 2) if storage_quota else 0,
        "usedCount": int(item.get("usedCount", 0) or 0),
        "usedStorageBytes": used_storage,
        "usedStorageGB": round(used_storage / GB, 2) if used_storage else 0,
    }


def enrich_user_payload(item):
    payload = build_user_payload(item)
    user_id = payload.get("userId")
    if user_id:
        payload["quota"] = get_user_quota(user_id)
    return payload


def get_org_users(owner_id, requester_email, groups):
    if "member" in groups and "owner" not in groups and "admin" not in groups:
        item = user_table.get_item(Key={"email": requester_email}).get("Item")
        return [enrich_user_payload(item)] if item else []

    users = []
    query_response = user_table.query(
        IndexName=USER_OWNER_INDEX,
        KeyConditionExpression=Key("owner_id").eq(owner_id),
    )
    users.extend(query_response.get("Items", []))

    while "LastEvaluatedKey" in query_response:
        query_response = user_table.query(
            IndexName=USER_OWNER_INDEX,
            KeyConditionExpression=Key("owner_id").eq(owner_id),
            ExclusiveStartKey=query_response["LastEvaluatedKey"],
        )
        users.extend(query_response.get("Items", []))

    return [enrich_user_payload(user) for user in users]


def get_owner_quota(owner_id):
    item = quota_table.get_item(Key={"userId": owner_id}).get("Item") or {}
    return {
        "pcLimit": int(item.get("quota", 0) or 0),
        "pcUsedCount": int(item.get("usedCount", 0) or 0),
        "cloudLimitBytes": int(item.get("storageQuota", 0) or 0),
        "cloudUsedBytes": int(item.get("usedStorage", 0) or 0),
    }


def get_owner_contracts(owner_id, groups):
    """
    Returns contract information for owners and admins.
    Members receive an empty list.
    """
    if "owner" not in groups and "admin" not in groups:
        return []

    contracts = []

    query_response = business_contract_table.query(
        KeyConditionExpression=Key("accountId").eq(owner_id)
    )

    items = query_response.get("Items", [])

    while "LastEvaluatedKey" in query_response:
        query_response = business_contract_table.query(
            KeyConditionExpression=Key("accountId").eq(owner_id),
            ExclusiveStartKey=query_response["LastEvaluatedKey"],
        )
        items.extend(query_response.get("Items", []))

    for item in items:
        contracts.append({
            "contractId": item.get("contractId"),
            "contractName": item.get("contractName"),
            "status": item.get("status"),
            "configId": item.get("configId"),
            "pcCount": item.get("pcCount"),
            "startDate": item.get("startDate"),
            "endDate": item.get("endDate"),
            "region": item.get("region"),
            "dailyUsageHoursPerPc": item.get("dailyUsageHoursPerPc"),
            "monthlyUsageHoursPerPc": item.get("monthlyUsageHoursPerPc"),
            "storageSizeGb": item.get("storageSizeGb"),
            "operatingSystem": item.get("operatingSystem"),
            "cpuCores": item.get("cpuCores"),
            "ramGb": item.get("ramGb"),
            "gpuEnabled": item.get("gpuEnabled"),
        })

    return contracts


def _parse_iso_datetime(value):
    if not value:
        return None
    try:
        normalized = str(value).replace("Z", "+00:00")
        parsed = parse_datetime(normalized)
        return parsed
    except Exception:
        return None


def parse_datetime(value):
    from datetime import datetime, timezone

    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def get_pc_session_history(instance_id, limit=7):
    try:
        response = pc_events_table.query(
            KeyConditionExpression=Key("instanceId").eq(instance_id),
            ScanIndexForward=True,
        )
    except Exception:
        return []

    items = response.get("Items", [])
    if not items:
        return []

    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=7)
    start_actions = {"create", "start", "restart", "started", "restarted"}
    stop_actions = {"stop", "stopped", "delete", "terminate", "terminated", "deleted"}
    rows = []
    current_start = None

    for item in items:
        event_time = _parse_iso_datetime(item.get("timestamp"))
        if not event_time or event_time < cutoff:
            continue

        action = str(item.get("action", "")).lower()
        if action in start_actions:
            current_start = event_time
        elif action in stop_actions and current_start:
            duration_hours = (event_time - current_start).total_seconds() / 3600
            rows.append({
                "startTime": current_start.isoformat(),
                "endTime": event_time.isoformat(),
                "durationHours": round(duration_hours, 2),
                "state": "completed",
            })
            current_start = None

    if current_start:
        duration_hours = (now - current_start).total_seconds() / 3600
        rows.append({
            "startTime": current_start.isoformat(),
            "endTime": now.isoformat(),
            "durationHours": round(duration_hours, 2),
            "state": "running",
        })

    rows.sort(key=lambda row: row.get("startTime", ""), reverse=True)
    return rows[:limit]


def get_pc_history(pc_items):
    history = []
    for item in pc_items:
        instance_id = item.get("instanceId")
        if not instance_id:
            continue

        for row in get_pc_session_history(instance_id):
            history.append({
                "instanceId": instance_id,
                "systemName": item.get("systemName", ""),
                "region": item.get("region", ""),
                **row,
            })

    history.sort(key=lambda row: row.get("startTime", ""), reverse=True)
    return history



def request_json(url, method="GET", token=None, params=None):
    if not url:
        return None

    full_url = url
    if params:
        query_string = parse.urlencode({key: value for key, value in params.items() if value is not None})
        separator = "&" if "?" in url else "?"
        full_url = f"{url}{separator}{query_string}"

    req = request.Request(full_url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with request.urlopen(req, timeout=15) as res:
            payload = res.read().decode("utf-8")
            return json.loads(payload) if payload else None
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        print(f"Upstream HTTPError for {full_url}: {exc.code} {body}")
    except Exception as exc:
        print(f"Upstream request failed for {full_url}: {exc}")

    return None


def get_active_pc_count(owner_id, token):
    raw = request_json(FETCH_PC_URL, token=token, params={"userId": owner_id})
    if not isinstance(raw, list):
        return None, None

    total_count = len(raw)
    running_count = sum(1 for item in raw if str(item.get("state", "")).lower() == "running")
    return total_count, running_count


def get_active_session_count_from_dcv_sessions(user_ids):
    if not user_ids:
        return 0

    from datetime import datetime, timezone

    now_ts = int(datetime.now(timezone.utc).timestamp())
    active_session_ids = set()

    for user_id in user_ids:
        if not user_id:
            continue

        try:
            query_kwargs = {
                "IndexName": DCV_SESSIONS_USER_INDEX,
                "KeyConditionExpression": Key("userId").eq(user_id),
            }

            while True:
                response = dcv_sessions_table.query(**query_kwargs)
                items = response.get("Items", []) or []

                for item in items:
                    session_id = item.get("sessionId")
                    occupied = item.get("occupied", True)

                    try:
                        expires_at = int(item.get("expiresAt", 0) or 0)
                    except (TypeError, ValueError):
                        expires_at = 0

                    if session_id and occupied is not False and expires_at > now_ts:
                        active_session_ids.add(str(session_id))

                last_key = response.get("LastEvaluatedKey")
                if not last_key:
                    break

                query_kwargs["ExclusiveStartKey"] = last_key
        except Exception as exc:
            print(f"[WARN] SmartPCDCVSessions query failed for userId={user_id}: {exc}")
            continue

    return len(active_session_ids)


def parse_body(event):
    raw = event.get("body")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def send_limit_increase_email(owner_id, requester_email, requester_role, request_type, requested_limit, current_limit, reason, contact_email):
    if not REQUEST_TO_EMAIL or not REQUEST_FROM_EMAIL:
        raise ValueError("Monitoring request email configuration is missing.")

    limit_label = "Sense PC limit" if request_type == "pc_limit" else "Sense Cloud limit"
    unit_label = "PCs" if request_type == "pc_limit" else "GB"
    subject = f"[Monitoring] {limit_label} increase request"
    message = (
        f"Requester role: {requester_role}\n"
        f"Owner ID: {owner_id}\n"
        f"Requester email: {requester_email}\n"
        f"Contact email: {contact_email}\n"
        f"Request type: {request_type}\n"
        f"Current limit: {current_limit} {unit_label}\n"
        f"Requested limit: {requested_limit} {unit_label}\n\n"
        f"Reason:\n{reason}\n"
    )

    ses.send_email(
        Source=REQUEST_FROM_EMAIL,
        Destination={"ToAddresses": [REQUEST_TO_EMAIL]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": message}},
        },
        ReplyToAddresses=[contact_email],
    )


def handle_get(event, claims, groups):
    requester_sub = claims.get("sub")
    requester_email = claims.get("email")
    owner_id = claims.get("custom:ownerid", requester_sub) if "admin" in groups else requester_sub
    token = get_bearer_token(event)

    org_users = get_org_users(owner_id, requester_email, groups)
    quota = get_owner_quota(owner_id)
    contracts = get_owner_contracts(owner_id, groups)
    pc_items = request_json(FETCH_PC_URL, token=token, params={"userId": owner_id}) or []
    if isinstance(pc_items, list):
        total_pc_count = len(pc_items)
        active_pc_count = sum(1 for item in pc_items if str(item.get("state", "")).lower() == "running")
    else:
        total_pc_count, active_pc_count = None, None
    org_user_ids = [user.get("userId") for user in org_users if user.get("userId")]
    active_session_count = get_active_session_count_from_dcv_sessions(org_user_ids)
    pc_history = get_pc_history(pc_items if isinstance(pc_items, list) else [])

    summary = {
        "activePcCount": active_pc_count if active_pc_count is not None else quota["pcUsedCount"],
        "activeSessionCount": active_session_count if active_session_count is not None else 0,
        "pcUsedCount": quota["pcUsedCount"] if quota["pcUsedCount"] else (total_pc_count or 0),
        "pcLimit": quota["pcLimit"],
        "cloudUsedBytes": quota["cloudUsedBytes"],
        "cloudLimitBytes": quota["cloudLimitBytes"],
    }

    return response(
        200,
        {
          "summary": summary,
          "users": org_users,
          "contracts": contracts,
          "pcHistory": pc_history,
          "viewer": {
              "role": "admin" if "admin" in groups else "owner" if "owner" in groups else "member",
              "scope": "organization" if "admin" in groups or "owner" in groups else "self",
          },
        },
    )


def handle_limit_request(event, claims, groups):
    if not any(group in groups for group in ("owner", "admin")):
        return response(403, {"message": "Not authorized to request a limit increase."})

    body = parse_body(event)
    request_type = (body.get("requestType") or "").strip().lower()
    requested_limit = body.get("requestedLimit")
    reason = (body.get("reason") or "").strip()
    contact_email = (body.get("contactEmail") or "").strip()

    if request_type not in ("pc_limit", "cloud_limit"):
        return response(400, {"message": "Invalid requestType."})

    try:
        requested_limit = int(requested_limit)
    except (TypeError, ValueError):
        return response(400, {"message": "requestedLimit must be a valid number."})

    if requested_limit <= 0:
        return response(400, {"message": "requestedLimit must be greater than zero."})

    if not reason:
        return response(400, {"message": "Reason is required."})

    if not contact_email or "@" not in contact_email:
        return response(400, {"message": "A valid contact email is required."})

    requester_sub = claims.get("sub")
    requester_email = claims.get("email")
    owner_id = claims.get("custom:ownerid", requester_sub) if "admin" in groups else requester_sub
    quota = get_owner_quota(owner_id)

    current_limit = quota["pcLimit"] if request_type == "pc_limit" else int(quota["cloudLimitBytes"] / GB) if quota["cloudLimitBytes"] else 0
    if requested_limit <= current_limit:
        return response(400, {"message": "Requested limit must be greater than the current limit."})

    try:
        send_limit_increase_email(
            owner_id=owner_id,
            requester_email=requester_email,
            requester_role="admin" if "admin" in groups else "owner",
            request_type=request_type,
            requested_limit=requested_limit,
            current_limit=current_limit,
            reason=reason,
            contact_email=contact_email,
        )
    except Exception as exc:
        print(f"Failed to send monitoring limit request email: {exc}")
        return response(500, {"message": "Unable to submit the request right now."})

    return response(200, {"message": "Limit increase request submitted successfully."})


def lambda_handler(event, context):
    method = event.get("httpMethod")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": headers(), "body": ""}

    claims = get_claims(event)
    groups = normalize_groups(claims.get("cognito:groups"))

    if not claims.get("sub"):
        return response(401, {"message": "Unauthorized"})

    if method == "GET":
        return handle_get(event, claims, groups)

    if method == "POST":
        body = parse_body(event)
        if (body.get("action") or "").strip().lower() == "limit-increase":
            return handle_limit_request(event, claims, groups)
        return response(400, {"message": "Unsupported action."})

    return response(405, {"message": "Method not allowed."})
