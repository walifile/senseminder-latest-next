import json
import os
import boto3
import urllib.request
import uuid
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("SmartPC-Active-Sessions")

# Read allowed origins from env (comma-separated)
_raw_origins = os.environ.get("CORS_ALLOW_ORIGIN", "*")

ALLOWED_ORIGINS = [
    o.strip() for o in _raw_origins.split(",") if o.strip()
]

# If nothing valid, default to ["*"]
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["*"]

SESSION_DEDUPE_SECONDS = int(os.environ.get("SESSION_DEDUPE_SECONDS", "60"))


def lambda_handler(event, context):
    method = (
        event.get("httpMethod")
        or event.get("requestContext", {}).get("http", {}).get("method")
    )

    # Get request origin (case-insensitive header)
    headers_in = event.get("headers") or {}
    request_origin = (
        headers_in.get("origin")
        or headers_in.get("Origin")
        or headers_in.get("ORIGIN")
    )

    # CORS preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(request_origin),
            "body": "",
        }

    try:
        headers = cors_headers(request_origin)

        # ---- Auth / user ----
        authorizer = event.get("requestContext", {}).get("authorizer", {}) or {}
        claims = (
            authorizer.get("claims")
            or authorizer.get("jwt", {}).get("claims")
            or {}
        )
        user_id = claims.get("sub") or claims.get("cognito:username")
        if not user_id:
            print("[AUTH] Missing user_id in authorizer claims")
            return {
                "statusCode": 401,
                "headers": headers,
                "body": json.dumps({"message": "Unauthorized"}),
            }

        print(f"[EVENT] Received {method} request from user: {user_id}")

        # ---- POST: claim / heartbeat ----
        if method == "POST":
            body = json.loads(event.get("body", "{}") or "{}")
            print(f"[REQUEST] Body from frontend: {body}")

            mode = body.get("mode")
            ip = body.get("ip")
            device_name = body.get("deviceName")

            # ---------- CLAIM ----------
            if mode == "claim":
                sessions = list_user_sessions(user_id)
                now_dt = datetime.utcnow()
                now = now_dt.isoformat()
                location = get_geo_from_ip(ip) if ip else {}

                recent_match = None
                if SESSION_DEDUPE_SECONDS > 0:
                    recent_match = find_recent_session(
                        sessions, device_name, ip, now_dt, SESSION_DEDUPE_SECONDS
                    )

                unclaimed = None
                if not recent_match:
                    unclaimed = next(
                        (s for s in sessions if not s.get("occupied")),
                        None,
                    )

                if recent_match:
                    session_id = recent_match.get("sessionId")
                elif unclaimed:
                    session_id = unclaimed["sessionId"]
                else:
                    session_id = str(uuid.uuid4())

                    item = {
                        "userId": user_id,
                        "sessionId": session_id,
                        "occupied": True,
                        "lastSeen": now,
                    }
                    if ip:
                        item["ip"] = ip
                    if device_name:
                        item["deviceName"] = device_name
                    if location:
                        item["location"] = location

                    try:
                        table.put_item(Item=item)
                    except ClientError as e:
                        print(f"[CLAIM][ERROR] Failed to create session: {e}")
                        raise

                    print(
                        f"[CLAIM] Created session: {session_id} for user: {user_id} from {ip} | device: {device_name}"
                    )
                    return {
                        "statusCode": 200,
                        "headers": headers,
                        "body": json.dumps(
                            {
                                "message": "Session created successfully",
                                "sessionId": session_id,
                            }
                        ),
                    }

                update_expr = "SET occupied = :occ, lastSeen = :now"
                expr_values = {
                    ":occ": True,
                    ":now": now,
                }
                expr_names = {}

                if ip:
                    update_expr += ", ip = :ip"
                    expr_values[":ip"] = ip
                if device_name:
                    update_expr += ", deviceName = :device"
                    expr_values[":device"] = device_name
                if location:
                    update_expr += ", #loc = :loc"
                    expr_values[":loc"] = location
                    expr_names["#loc"] = "location"

                update_params = {
                    "Key": {"userId": user_id, "sessionId": session_id},
                    "UpdateExpression": update_expr,
                    "ExpressionAttributeValues": expr_values,
                }

                if expr_names:
                    update_params["ExpressionAttributeNames"] = expr_names

                if not recent_match and unclaimed:
                    update_params["ExpressionAttributeValues"][":false"] = False
                    update_params["ConditionExpression"] = (
                        "attribute_not_exists(occupied) OR occupied = :false"
                    )

                try:
                    table.update_item(**update_params)
                except ClientError as e:
                    if (
                        e.response["Error"]["Code"]
                        == "ConditionalCheckFailedException"
                    ):
                        # Someone else claimed in the tiny window between query & update
                        print(
                            f"[CLAIM] Conditional check failed for user {user_id}, session {session_id} "
                            f"(likely already claimed by another device)."
                        )
                        return bad_request(
                            "Session is no longer available to claim.", headers
                        )
                    print(f"[CLAIM][ERROR] {e}")
                    raise

                print(
                    f"[CLAIM] user: {user_id} claimed session: {session_id} from {ip} | device: {device_name}"
                )
                return {
                    "statusCode": 200,
                    "headers": headers,
                    "body": json.dumps(
                        {
                            "message": "Session claimed successfully",
                            "sessionId": session_id,
                        }
                    ),
                }

            # ---------- HEARTBEAT ----------
            elif mode == "heartbeat":
                session_id = body.get("sessionId")
                if not session_id:
                    print("[HEARTBEAT] Missing sessionId in heartbeat request")
                    return bad_request("Missing sessionId", headers)

                location = get_geo_from_ip(ip) if ip else {}

                update_expr = "SET lastSeen = :now"
                expr_values = {
                    ":now": datetime.utcnow().isoformat(),
                    ":occupied": True,
                }
                expr_names = {}

                if ip:
                    update_expr += ", ip = :ip"
                    expr_values[":ip"] = ip
                if device_name:
                    update_expr += ", deviceName = :device"
                    expr_values[":device"] = device_name
                if location:
                    update_expr += ", #loc = :loc"
                    expr_values[":loc"] = location
                    expr_names["#loc"] = "location"

                update_params = {
                    "Key": {"userId": user_id, "sessionId": session_id},
                    "UpdateExpression": update_expr,
                    "ExpressionAttributeValues": expr_values,
                    "ConditionExpression": "occupied = :occupied",
                }

                if expr_names:
                    update_params["ExpressionAttributeNames"] = expr_names

                try:
                    table.update_item(**update_params)
                except ClientError as e:
                    if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                        print(
                            f"[HEARTBEAT] Conditional check failed for user {user_id}, "
                            f"session {session_id} (either not found or not occupied=True)."
                        )
                        return {
                            "statusCode": 200,
                            "headers": headers,
                            "body": json.dumps(
                                {
                                    "message": "Session is not active or not claimed. Please refresh your browser or reconnect.",
                                    "code": "SESSION_NOT_ACTIVE",
                                }
                            ),
                        }
                    print(f"[HEARTBEAT][ERROR] {e}")
                    raise

                print(
                    f"[HEARTBEAT] session updated for user: {user_id}, session: {session_id}"
                )
                return {
                    "statusCode": 200,
                    "headers": headers,
                    "body": json.dumps({"message": "Session updated successfully"}),
                }

            # ---------- INVALID MODE ----------
            else:
                print(f"[ERROR] Invalid mode: {mode}")
                return bad_request(
                    "Invalid mode. Use 'claim' or 'heartbeat'.", headers
                )

        # ---- GET: list sessions ----
        elif method == "GET":
            print(f"[GET] Fetching sessions for user: {user_id}")

            sessions = list_user_sessions(user_id)
            sorted_sessions = sorted(
                sessions, key=lambda x: x.get("lastSeen", ""), reverse=True
            )
            sorted_sessions = sorted_sessions[:5]

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(sorted_sessions, default=str),
            }

        # ---- Other methods ----
        else:
            return {
                "statusCode": 405,
                "headers": headers,
                "body": json.dumps({"message": "Method not allowed"}),
            }

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(request_origin),
            "body": json.dumps({"message": str(e)}),
        }


def get_geo_from_ip(ip: str):
    try:
        with urllib.request.urlopen(f"https://ipapi.co/{ip}/json/", timeout=3) as response:
            data = json.loads(response.read())
            return {
                "city": data.get("city"),
                "country": data.get("country_name"),
                "region": data.get("region"),
                "latitude": Decimal(str(data.get("latitude", 0.0))),
                "longitude": Decimal(str(data.get("longitude", 0.0))),
                "isp": data.get("org"),
            }
    except Exception as e:
        print(f"[GEO] Failed to fetch location for IP {ip}: {e}")
        return {}


def cors_headers(request_origin: str | None):
    """
    Returns CORS headers based on:
    - ALLOWED_ORIGINS env (comma-separated)
    - Incoming request Origin header
    """
    # If wildcard is allowed anywhere, just return '*'
    if "*" in ALLOWED_ORIGINS:
        allow_origin = "*"
    else:
        if request_origin and request_origin in ALLOWED_ORIGINS:
            # Echo back the matching origin
            allow_origin = request_origin
        else:
            # Fallback: use the first configured origin, or '*'
            allow_origin = ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "*"

    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Methods": "POST,GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


def bad_request(message: str, headers: dict):
    return {
        "statusCode": 400,
        "headers": headers,
        "body": json.dumps({"message": message}),
    }


def list_user_sessions(user_id: str):
    items = []
    last_key = None

    while True:
        params = {
            "KeyConditionExpression": Key("userId").eq(user_id),
        }
        if last_key:
            params["ExclusiveStartKey"] = last_key

        response = table.query(**params)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break

    return items


def find_recent_session(
    sessions: list,
    device_name: str | None,
    ip: str | None,
    now_dt: datetime,
    window_seconds: int,
):
    if not sessions or window_seconds <= 0:
        return None

    for item in sorted(
        sessions, key=lambda x: x.get("lastSeen", ""), reverse=True
    ):
        last_seen = parse_last_seen(item.get("lastSeen"))
        if not last_seen:
            continue

        if (now_dt - last_seen).total_seconds() > window_seconds:
            continue

        if is_same_client(item, device_name, ip):
            return item

    return None


def parse_last_seen(value):
    if not value:
        return None
    if isinstance(value, (int, float)):
        return datetime.utcfromtimestamp(value)
    if isinstance(value, str):
        try:
            clean = value[:-1] if value.endswith("Z") else value
            return datetime.fromisoformat(clean)
        except ValueError:
            return None
    return None


def is_same_client(item: dict, device_name: str | None, ip: str | None):
    item_device = item.get("deviceName")
    item_ip = item.get("ip")

    if ip == "unknown":
        ip = None
    if item_ip == "unknown":
        item_ip = None

    if device_name and item_device and ip and item_ip:
        return device_name == item_device and ip == item_ip
    if device_name and item_device:
        return device_name == item_device
    if ip and item_ip:
        return ip == item_ip
    return False
