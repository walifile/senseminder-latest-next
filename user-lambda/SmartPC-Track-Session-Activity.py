import json
import os
import boto3
import urllib.request
import uuid
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr

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
                # Get any unclaimed sessions for user (don’t rely on sort-key order)
                response = table.query(
                    KeyConditionExpression=Key("userId").eq(user_id),
                    FilterExpression=Attr("occupied").not_exists() | Attr("occupied").eq(False),
                    ScanIndexForward=False,
                    Limit=25,  # evaluates up to 25 items, returns only matching unclaimed ones
                )
                sessions = response.get("Items", [])

                # Pick the first available unclaimed session
                unclaimed = sessions[0] if sessions else None

                if not unclaimed:
                    print(
                        f"[CLAIM] No unclaimed session available for user: {user_id}"
                    )
                    session_id = str(uuid.uuid4())
                    now = datetime.utcnow().isoformat()
                    location = get_geo_from_ip(ip) if ip else {}

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

                session_id = unclaimed["sessionId"]
                now = datetime.utcnow().isoformat()
                location = get_geo_from_ip(ip) if ip else {}

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
                    "ExpressionAttributeValues": {
                        **expr_values,
                        ":false": False,
                    },
                    "ConditionExpression": "attribute_not_exists(occupied) OR occupied = :false",
                }

                if expr_names:
                    update_params["ExpressionAttributeNames"] = expr_names

                try:
                    table.update_item(**update_params)
                except ClientError as e:
                    if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
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

            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key("userId").eq(
                    user_id
                ),
                ScanIndexForward=False,
                Limit=5,
            )
            sessions = response.get("Items", [])
            sorted_sessions = sorted(
                sessions, key=lambda x: x.get("lastSeen", ""), reverse=True
            )

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
