import json
import os
import time
from decimal import Decimal
from typing import Any, Dict, List

import boto3
from boto3.dynamodb.conditions import Attr, Key


ANNOUNCEMENTS_TABLE = os.environ.get("ANNOUNCEMENTS_TABLE", "sensepc_announcements")
ANNOUNCEMENTS_INDEX = os.environ.get("ANNOUNCEMENTS_INDEX", "status-start-index")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(ANNOUNCEMENTS_TABLE)


def now_ms() -> int:
    return int(time.time() * 1000)


def to_json_safe(value: Any) -> Any:
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    if isinstance(value, list):
        return [to_json_safe(v) for v in value]
    if isinstance(value, dict):
        return {k: to_json_safe(v) for k, v in value.items()}
    return value


def respond(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        "body": json.dumps(to_json_safe(body)),
    }


def normalize_path(path: str) -> str:
    if not path:
        return "/"
    if path != "/" and path.endswith("/"):
        return path[:-1]
    return path


def route_match(pathname: str, include: List[str], exclude: List[str]) -> bool:
    path = normalize_path(pathname)

    if exclude and any(path.startswith(normalize_path(p)) for p in exclude):
        return False

    if not include:
        return True

    return any(path.startswith(normalize_path(p)) for p in include)


def audience_match(item: Dict[str, Any], is_authenticated: bool) -> bool:
    audience_type = item.get("audience_type", "all")
    if audience_type == "all":
        return True
    if audience_type == "logged_in":
        return is_authenticated
    return False


def get_query_params(event: Dict[str, Any]) -> Dict[str, str]:
    return event.get("queryStringParameters") or {}


def normalize_scope(value: str) -> str:
    if value in ("dashboard", "dashboard_top"):
        return "dashboard"
    return "public"


def normalize_item_placement(value: Any) -> str:
    placement = str(value or "").strip().lower()
    if placement in ("public", "dashboard", "all"):
        return placement
    if placement == "dashboard_top":
        return "dashboard"
    return "public"


def normalize_category(value: Any) -> str:
    category = str(value or "").strip()
    return category or "Update"


def serialize_item(item: Dict[str, Any]) -> Dict[str, Any]:
    serialized = to_json_safe(item)
    serialized["category"] = normalize_category(serialized.get("category"))
    return serialized


def fetch_announcements(current_ms: int) -> List[Dict[str, Any]]:
    # Query by status + start_at if index exists.
    try:
        resp = table.query(
            IndexName=ANNOUNCEMENTS_INDEX,
            KeyConditionExpression=Key("gsi1pk").eq("published") & Key("gsi1sk").lte(current_ms),
            ScanIndexForward=False,
            Limit=100,
        )
        return resp.get("Items", [])
    except Exception:
        # Fallback to scan in case index is not created yet.
        resp = table.scan(
            FilterExpression=Attr("status").eq("published") & Attr("start_at").lte(current_ms),
            Limit=100,
        )
        return resp.get("Items", [])


def lambda_handler(event, _context):
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "GET"
    ).upper()

    if method == "OPTIONS":
        return respond(200, {"ok": True})

    if method != "GET":
        return respond(405, {"error": "method_not_allowed"})

    params = get_query_params(event)
    scope = normalize_scope(params.get("placement", "public"))
    path = normalize_path(params.get("path", "/"))
    is_authenticated = params.get("auth", "0") == "1"
    current_ms = now_ms()

    items = fetch_announcements(current_ms)
    active = []

    for item in items:
        item_placement = normalize_item_placement(item.get("placement"))
        if item_placement not in ("all", scope):
            continue

        end_at = item.get("end_at")
        if end_at and int(end_at) < current_ms:
            continue

        include = item.get("routes_include") or []
        exclude = item.get("routes_exclude") or []
        if not route_match(path, include, exclude):
            continue

        if not audience_match(item, is_authenticated):
            continue

        active.append(item)

    active.sort(
        key=lambda x: int(x.get("updated_at", 0)),
        reverse=True,
    )

    return respond(200, {"items": [serialize_item(item) for item in active[:1]]})
