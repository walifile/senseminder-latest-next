import json
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Attr, Key


dynamodb = boto3.resource("dynamodb")
ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION"))

USER_TABLE_NAME = os.environ.get("USER_TABLE_NAME", "senseminder-user")
QUOTA_TABLE_NAME = os.environ.get("QUOTA_TABLE_NAME", "SmartPCUserQuota")
STORAGE_USAGE_TABLE_NAME = os.environ.get("STORAGE_USAGE_TABLE_NAME", "SmartPCStorageUsage")
PC_EVENTS_TABLE_NAME = os.environ.get("PC_EVENTS_TABLE_NAME", "SmartPCEvents")
USER_OWNER_INDEX = os.environ.get("USER_OWNER_INDEX", "owner_id-index")
DCV_SESSIONS_TABLE_NAME = os.environ.get("DCV_SESSIONS_TABLE_NAME", "SmartPCDCVSessions")
DCV_SESSIONS_USER_INDEX = os.environ.get("DCV_SESSIONS_USER_INDEX", "userId-instanceId-index")
REQUEST_TO_EMAIL = os.environ.get("MONITORING_LIMIT_REQUEST_TO_EMAIL")
REQUEST_FROM_EMAIL = os.environ.get("MONITORING_REQUEST_FROM_EMAIL")
LIMIT_REQUEST_TABLE_NAME = os.environ.get("MONITORING_LIMIT_REQUEST_TABLE_NAME", "SensePC-MonitoringLimitRequests")

BUSINESS_CONTRACT_TABLE_NAME = os.environ.get(
    "BUSINESS_CONTRACT_TABLE_NAME",
    "sensepc-business-contract",
)

BUSINESS_PC_USAGE_TABLE_NAME = os.environ.get(
    "BUSINESS_PC_USAGE_TABLE_NAME",
    "sensepc-business-pc-usage",
)

ACTIVE_SESSIONS_TABLE_NAME = os.environ.get("ACTIVE_SESSIONS_TABLE_NAME", "SmartPC-Active-Sessions")

user_table = dynamodb.Table(USER_TABLE_NAME)
quota_table = dynamodb.Table(QUOTA_TABLE_NAME)
storage_usage_table = dynamodb.Table(STORAGE_USAGE_TABLE_NAME)
pc_events_table = dynamodb.Table(PC_EVENTS_TABLE_NAME)
active_sessions_table = dynamodb.Table(ACTIVE_SESSIONS_TABLE_NAME)

business_contract_table = dynamodb.Table(
    BUSINESS_CONTRACT_TABLE_NAME
)
business_pc_usage_table = dynamodb.Table(
    BUSINESS_PC_USAGE_TABLE_NAME
)
dcv_sessions_table = dynamodb.Table(DCV_SESSIONS_TABLE_NAME)
limit_request_table = dynamodb.Table(LIMIT_REQUEST_TABLE_NAME)

GB = 1024 ** 3
KB = 1024


def format_storage_bytes(value):
    """
    Convert raw bytes into a compact, human-friendly storage representation.
    Returns numeric values in multiple units plus a ready-to-render display string.
    """
    raw_bytes = int(value or 0)
    units = [
        ("TB", 1024 ** 4),
        ("GB", GB),
        ("MB", 1024 ** 2),
        ("KB", KB),
        ("B", 1),
    ]

    if raw_bytes <= 0:
        return {
            "bytes": 0,
            "value": 0,
            "unit": "B",
            "display": "0 B",
        }

    for unit_name, factor in units:
        if raw_bytes >= factor or unit_name == "B":
            value_in_unit = raw_bytes / factor
            if unit_name == "B":
                display_value = f"{int(value_in_unit)}"
            else:
                display_value = f"{value_in_unit:.2f}".rstrip("0").rstrip(".")
            return {
                "bytes": raw_bytes,
                "value": round(value_in_unit, 2),
                "unit": unit_name,
                "display": f"{display_value} {unit_name}",
            }

    return {
        "bytes": raw_bytes,
        "value": raw_bytes,
        "unit": "B",
        "display": f"{raw_bytes} B",
    }


def headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, authorization",
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
    authorizer = event.get("requestContext", {}).get("authorizer", {}) or {}
    return (
        authorizer.get("claims")
        or authorizer.get("jwt", {}).get("claims")
        or {}
    )


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
    candidate_ids = [user_id]
    try:
        user_item = user_table.query(
            IndexName="id-index",
            KeyConditionExpression=Key("id").eq(user_id),
            Limit=1,
        ).get("Items", [])
        if user_item:
            owner_id = user_item[0].get("owner_id") or user_item[0].get("ownerid")
            if owner_id and owner_id not in candidate_ids:
                candidate_ids.append(owner_id)
    except Exception:
        pass

    used_storage_display = None
    for candidate_id in candidate_ids:
        fallback_storage = get_latest_storage_usage(candidate_id)
        if fallback_storage and fallback_storage.get("usedStorageDisplay") not in (None, "0 B"):
            used_storage_display = fallback_storage["usedStorageDisplay"]
            break

    if not used_storage_display:
        used_storage_display = "0 B"

    return {
        "usedStorageDisplay": used_storage_display,
    }


def get_latest_storage_usage(user_id):
    try:
        response = storage_usage_table.scan(FilterExpression=Attr("userId").eq(user_id))
        items = response.get("Items", []) or []
        if not items:
            return None

        def sort_key(item):
            return (
                str(item.get("updatedAt") or ""),
                str(item.get("month") or ""),
                str(item.get("userMonth") or ""),
            )

        latest = next(
            (item for item in sorted(items, key=sort_key, reverse=True) if int(item.get("currentBytes", 0) or 0) > 0),
            None,
        )
        if not latest:
            return None

        current_bytes = int(latest.get("currentBytes", 0) or 0)
        total_display = format_storage_bytes(current_bytes)
        return {
            "usedStorageDisplay": total_display["display"],
        }
    except Exception as exc:
        print(f"[WARN] Storage usage lookup failed for userId={user_id}: {exc}")
        return None


def enrich_user_payload(item):
    payload = build_user_payload(item)
    user_id = payload.get("userId")
    if user_id:
        payload["quota"] = get_user_quota(user_id)
        payload["lastSeenAt"] = get_latest_active_session_last_seen(user_id) or payload.get("lastSeenAt")
    return payload


def get_latest_active_session_last_seen(user_id):
    try:
        response = active_sessions_table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            ScanIndexForward=False,
            Limit=1,
        )
        items = response.get("Items", []) or []
        if not items:
            return None
        latest = items[0]
        return latest.get("lastSeen") or latest.get("updatedAt") or latest.get("createdAt")
    except Exception as exc:
        print(f"[WARN] SmartPC-Active-Sessions query failed for userId={user_id}: {exc}")
        return None


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
    cloud_used_display = get_latest_storage_usage(owner_id)
    if not cloud_used_display:
        cloud_used_display = {"display": "0 B"}
    return {
        "pcLimit": 0,
        "pcUsedCount": 0,
        "cloudUsedDisplay": cloud_used_display["display"],
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
            "totalUsageHours": item.get("totalUsageHours"),
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



def format_duration_seconds(total_seconds):
    total_seconds = int(total_seconds or 0)

    if total_seconds <= 0:
        return "0m"

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60

    if hours and minutes:
        return f"{hours}h {minutes}m"

    if hours:
        return f"{hours}h"

    return f"{minutes}m"


def get_business_pc_usage_items(owner_id):
    """
    Returns all business PC usage rows for this owner/business account.
    Includes running, stopped, and deleted PCs.
    """
    items = []

    query_kwargs = {
        "KeyConditionExpression": Key("accountId").eq(owner_id)
    }

    while True:
        response = business_pc_usage_table.query(**query_kwargs)
        items.extend(response.get("Items", []) or [])

        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break

        query_kwargs["ExclusiveStartKey"] = last_key

    return items


def build_business_pc_usage(owner_id, contracts):
    """
    Builds per-PC total runtime list from sensepc-business-pc-usage.
    totalRuntimeSeconds means total running time since PC creation.
    """
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    contract_by_id = {
        str(contract.get("contractId")): contract
        for contract in contracts
        if contract.get("contractId")
    }

    usage_items = get_business_pc_usage_items(owner_id)

    pc_usage = []

    for item in usage_items:
        consumed_seconds = int(item.get("consumedSeconds", 0) or 0)
        running_since_raw = item.get("runningSince")
        status = str(item.get("status") or "").lower()

        current_session_seconds = 0

        if running_since_raw:
            running_since = _parse_iso_datetime(running_since_raw)

            if running_since:
                current_session_seconds = max(
                    int((now - running_since).total_seconds()),
                    0
                )

        total_runtime_seconds = consumed_seconds + current_session_seconds

        contract_id = str(item.get("contractId") or "")
        contract = contract_by_id.get(contract_id, {})

        pc_usage.append({
            "instanceId": item.get("instanceId"),
            "systemName": item.get("systemName", ""),
            "contractId": contract_id,
            "contractName": contract.get("contractName", ""),
            "configId": item.get("configId", ""),

            "status": status,
            "consumedSeconds": consumed_seconds,

            "currentSessionSeconds": current_session_seconds,
            "currentSessionDisplay": format_duration_seconds(
                current_session_seconds
            ),

            "totalRuntimeSeconds": total_runtime_seconds,
            "totalRuntimeDisplay": format_duration_seconds(
                total_runtime_seconds
            ),

            "createdAt": item.get("createdAt"),
            "updatedAt": item.get("updatedAt"),
            "deletedAt": item.get("deletedAt"),
        })

    pc_usage.sort(
        key=lambda row: str(row.get("createdAt") or ""),
        reverse=True
    )

    return pc_usage


def build_business_contract_usage(contracts, pc_usage):
    """
    Builds contract-level usage summary using PC runtime data.
    """
    usage_by_contract = {}

    for pc in pc_usage:
        contract_id = str(pc.get("contractId") or "")

        if not contract_id:
            continue

        usage_by_contract[contract_id] = (
            usage_by_contract.get(contract_id, 0)
            + int(pc.get("totalRuntimeSeconds", 0) or 0)
        )

    contract_usage = []

    for contract in contracts:
        contract_id = str(contract.get("contractId") or "")
        total_usage_hours = contract.get("totalUsageHours", 0) or 0

        try:
            total_seconds = int(Decimal(str(total_usage_hours)) * Decimal(3600))
        except Exception:
            total_seconds = 0

        used_seconds = usage_by_contract.get(contract_id, 0)
        remaining_seconds = max(total_seconds - used_seconds, 0)

        contract_usage.append({
            "contractId": contract_id,
            "contractName": contract.get("contractName", ""),
            "status": contract.get("status"),
            "configId": contract.get("configId"),

            "totalUsageHours": total_usage_hours,
            "totalUsageSeconds": total_seconds,
            "totalUsageDisplay": format_duration_seconds(total_seconds),

            "usedSeconds": used_seconds,
            "usedDisplay": format_duration_seconds(used_seconds),

            "remainingSeconds": remaining_seconds,
            "remainingDisplay": format_duration_seconds(remaining_seconds),
        })

    return contract_usage




def parse_datetime(value):
    from datetime import datetime, timezone

    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def get_pc_session_history(instance_id, limit=7):
    items = []
    try:
        query_kwargs = {
            "KeyConditionExpression": Key("instanceId").eq(instance_id),
            "ScanIndexForward": True,
        }

        while True:
            response = pc_events_table.query(**query_kwargs)
            items.extend(response.get("Items", []) or [])

            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break

            query_kwargs["ExclusiveStartKey"] = last_key
    except Exception as exc:
        print(f"[WARN] SmartPCEvents query failed for instanceId={instance_id}: {exc}")
        try:
            scan_kwargs = {
                "FilterExpression": Attr("instanceId").eq(instance_id),
            }

            while True:
                response = pc_events_table.scan(**scan_kwargs)
                items.extend(response.get("Items", []) or [])

                last_key = response.get("LastEvaluatedKey")
                if not last_key:
                    break

                scan_kwargs["ExclusiveStartKey"] = last_key
        except Exception as scan_exc:
            print(f"[WARN] SmartPCEvents scan failed for instanceId={instance_id}: {scan_exc}")
            return []

    if not items:
        return []

    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=7)
    start_actions = {"create", "start", "restart", "started", "restarted"}
    stop_actions = {"stop", "stopped", "delete", "terminate", "terminated", "deleted"}
    rows = []
    current_start = None

    def normalize_action(value):
        return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")

    items.sort(key=lambda item: str(item.get("timestamp") or ""))

    for item in items:
        event_time = _parse_iso_datetime(item.get("timestamp"))
        if not event_time or event_time < cutoff:
            continue

        action = normalize_action(item.get("action"))
        action_token = action.split("_")[-1] if action else ""

        if action in start_actions or action_token in start_actions:
            current_start = event_time
        elif (action in stop_actions or action_token in stop_actions) and current_start:
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


def build_history_sources(pc_usage):
    """
    PC list for session history, taken from the business usage table —
    covers running, stopped, and deleted PCs without any upstream API call.
    """
    sources = {}

    for usage in (pc_usage or []):
        instance_id = usage.get("instanceId")
        if instance_id and instance_id not in sources:
            sources[instance_id] = {
                "instanceId": instance_id,
                "systemName": usage.get("systemName", ""),
                "region": "",
            }

    return list(sources.values())


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


def query_params(event):
    return event.get("queryStringParameters") or {}


def request_path(event):
    path = event.get("path") or event.get("rawPath") or ""
    stage = (event.get("requestContext") or {}).get("stage") or ""
    if stage:
        prefix = f"/{stage}"
        if path == prefix:
            return "/"
        if path.startswith(prefix + "/"):
            return path[len(prefix):]
    return path


def request_method(event):
    return (
        event.get("httpMethod")
        or (event.get("requestContext") or {}).get("http", {}).get("method")
        or ""
    ).upper()


def save_limit_request(item):
    limit_request_table.put_item(Item=item)


def mark_limit_request_email_status(owner_id, created_at, email_status, error_message=None):
    update_expression = "SET emailStatus = :emailStatus"
    values = {":emailStatus": email_status}

    if error_message:
        update_expression += ", emailError = :emailError"
        values[":emailError"] = str(error_message)[:500]

    limit_request_table.update_item(
        Key={"ownerId": owner_id, "createdAt": created_at},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=values,
    )


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

    org_users = get_org_users(owner_id, requester_email, groups)
    quota = get_owner_quota(owner_id)
    contracts = get_owner_contracts(owner_id, groups)
    pc_usage = build_business_pc_usage(owner_id, contracts)
    contract_usage = build_business_contract_usage(contracts, pc_usage)

    # PC counts come from the business usage table — no upstream API call.
    live_usage = [item for item in pc_usage if not item.get("deletedAt")]
    total_pc_count = len(live_usage)
    active_pc_count = sum(1 for item in live_usage if item.get("status") == "running")

    org_user_ids = [user.get("userId") for user in org_users if user.get("userId")]
    active_session_count = get_active_session_count_from_dcv_sessions(org_user_ids)
    pc_history = get_pc_history(build_history_sources(pc_usage))

    summary = {
        "activePcCount": active_pc_count,
        "activeSessionCount": active_session_count if active_session_count is not None else 0,
        "pcUsedCount": total_pc_count,
        "pcLimit": quota["pcLimit"],
        "cloudUsedDisplay": quota["cloudUsedDisplay"],
    }

    return response(
        200,
        {
          "summary": summary,
          "users": org_users,
          "contracts": contracts,
          "pcUsage": pc_usage,
          "contractUsage": contract_usage,
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

    current_limit = quota["pcLimit"] if request_type == "pc_limit" else 0
    if requested_limit <= current_limit:
        return response(400, {"message": "Requested limit must be greater than the current limit."})

    created_at = datetime.now(timezone.utc).isoformat()
    request_item = {
        "ownerId": owner_id,
        "createdAt": created_at,
        "requestId": str(uuid.uuid4()),
        "requesterEmail": requester_email,
        "requesterRole": "admin" if "admin" in groups else "owner",
        "requestType": request_type,
        "requestedLimit": requested_limit,
        "currentLimit": current_limit,
        "reason": reason,
        "contactEmail": contact_email,
        "status": "submitted",
        "emailStatus": "pending",
    }

    try:
        save_limit_request(request_item)
    except Exception as exc:
        print(f"Failed to save monitoring limit request: {exc}")
        return response(500, {"message": "Unable to submit the request right now."})

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
        mark_limit_request_email_status(owner_id, created_at, "sent")
    except Exception as exc:
        print(f"Failed to send monitoring limit request email: {exc}")
        try:
            mark_limit_request_email_status(owner_id, created_at, "failed", exc)
        except Exception as update_exc:
            print(f"Failed to update monitoring request email status: {update_exc}")
        return response(500, {"message": "Unable to submit the request right now."})

    return response(
        200,
        {
            "message": "Limit increase request submitted successfully.",
            "request": {**request_item, "emailStatus": "sent"},
        },
    )


def handle_limit_requests_get(event, claims, groups):
    if not any(group in groups for group in ("owner", "admin")):
        return response(403, {"message": "Not authorized to view limit requests."})

    params = query_params(event)
    requester_sub = claims.get("sub")
    owner_id = (params.get("accountId") or params.get("ownerId") or "").strip()

    if "admin" not in groups:
        owner_id = requester_sub

    if not owner_id:
        return response(400, {"message": "accountId is required."})

    result = limit_request_table.query(
        KeyConditionExpression=Key("ownerId").eq(owner_id),
        ScanIndexForward=False,
        Limit=100,
    )

    return response(
        200,
        {
            "accountId": owner_id,
            "requests": result.get("Items", []),
            "count": result.get("Count", 0),
        },
    )


def lambda_handler(event, context):
    try:
        method = request_method(event)
        path = request_path(event)
        if method == "OPTIONS":
            return {"statusCode": 200, "headers": headers(), "body": ""}

        claims = get_claims(event)
        groups = normalize_groups(claims.get("cognito:groups"))

        if not claims.get("sub"):
            return response(401, {"message": "Unauthorized"})

        if method == "GET" and (
            path.endswith("/limit-requests")
            or path.endswith("/monitoring-limit-requests")
        ):
            return handle_limit_requests_get(event, claims, groups)

        if method == "GET":
            return handle_get(event, claims, groups)

        if method == "POST":
            body = parse_body(event)
            if (body.get("action") or "").strip().lower() == "limit-increase":
                return handle_limit_request(event, claims, groups)
            return response(400, {"message": "Unsupported action."})

        return response(405, {"message": "Method not allowed."})
    except Exception as exc:
        print(f"Unhandled monitoring error: {exc}")
        return response(500, {"message": "Internal server error."})

