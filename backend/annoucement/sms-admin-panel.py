import json
import os
import time
import uuid
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

import boto3
from boto3.dynamodb.conditions import Attr, Key


ANNOUNCEMENTS_TABLE = os.environ.get("ANNOUNCEMENTS_TABLE", "sensepc_announcements")
ANNOUNCEMENTS_INDEX = os.environ.get("ANNOUNCEMENTS_INDEX", "status-start-index")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(ANNOUNCEMENTS_TABLE)

VALID_STATUS = {"unpublished", "published"}
VALID_PLACEMENT = {"public", "dashboard", "all"}
VALID_SEVERITY = {"normal", "info", "success", "warning", "critical"}
VALID_AUDIENCE = {"all", "logged_in"}


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
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
        },
        "body": json.dumps(to_json_safe(body)),
    }


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    raw_body = event.get("body")
    if not raw_body:
        return {}
    if isinstance(raw_body, dict):
        return raw_body
    return json.loads(raw_body)


def query_params(event: Dict[str, Any]) -> Dict[str, str]:
    return event.get("queryStringParameters") or {}


def extract_route_info(event: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    raw_path = (event.get("rawPath") or event.get("path") or "").split("?")[0].rstrip("/")
    segments = [segment for segment in raw_path.split("/") if segment]

    if "announcements" not in segments:
        return False, None

    idx = segments.index("announcements")
    if idx == len(segments) - 1:
        return True, None
    return True, segments[idx + 1]


def as_int(value: Any, default: int = 0) -> int:
    if value is None:
        return default
    if isinstance(value, bool):
        return default
    return int(value)


def as_optional_int(value: Any) -> Optional[int]:
    if value in (None, "", 0):
        return None
    return int(value)


def normalize_routes(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(route).strip() for route in value if str(route).strip()]
    if isinstance(value, str):
        return [route.strip() for route in value.split(",") if route.strip()]
    return []


def normalize_placement(value: Any) -> Optional[str]:
    placement = str(value or "").strip().lower()
    if placement in VALID_PLACEMENT:
        return placement
    if placement in {"global_top", "page_inline"}:
        return "public"
    if placement == "dashboard_top":
        return "dashboard"
    return None


def normalize_status(value: Any) -> Optional[str]:
    status = str(value or "").strip().lower()
    if status in VALID_STATUS:
        return status
    if status in {"draft", "archived"}:
        return "unpublished"
    return None


def normalize_category(value: Any) -> str:
    category = str(value or "").strip()
    return category or "Update"


def serialize_item(item: Dict[str, Any]) -> Dict[str, Any]:
    serialized = to_json_safe(item)
    serialized["status"] = normalize_status(serialized.get("status")) or "unpublished"
    serialized["placement"] = normalize_placement(serialized.get("placement")) or "public"
    serialized["category"] = normalize_category(serialized.get("category"))
    return serialized


def validate_fields(payload: Dict[str, Any], is_patch: bool = False) -> Optional[str]:
    required = ["title", "message", "start_at"]
    if not is_patch:
        for field in required:
            if field not in payload or payload[field] in ("", None):
                return f"{field} is required"

    if "status" in payload:
        normalized_status = normalize_status(payload["status"])
        if not normalized_status:
            return "status must be unpublished or published"
        payload["status"] = normalized_status
    if "placement" in payload:
        normalized_placement = normalize_placement(payload["placement"])
        if not normalized_placement:
            return "placement must be public, dashboard, or all"
        payload["placement"] = normalized_placement
    if "severity" in payload and payload["severity"] not in VALID_SEVERITY:
        return "severity must be normal, info, success, warning, or critical"
    if "category" in payload:
        payload["category"] = normalize_category(payload["category"])
    if "audience_type" in payload and payload["audience_type"] not in VALID_AUDIENCE:
        return "audience_type must be all or logged_in"
    if "end_at" in payload and payload.get("end_at") not in (None, ""):
        if int(payload["end_at"]) <= int(payload.get("start_at", 0)):
            return "end_at must be greater than start_at"
    return None


def to_item(payload: Dict[str, Any], announcement_id: Optional[str] = None) -> Dict[str, Any]:
    current_ms = now_ms()
    status = normalize_status(payload.get("status")) or "unpublished"
    start_at = as_int(payload.get("start_at"), current_ms)

    return {
        "announcement_id": announcement_id or str(uuid.uuid4()),
        "title": str(payload.get("title", "")).strip(),
        "message": str(payload.get("message", "")).strip(),
        "severity": payload.get("severity", "normal"),
        "category": normalize_category(payload.get("category")),
        "placement": payload.get("placement", "public"),
        "status": status,
        "priority": as_int(payload.get("priority"), 0),
        "start_at": start_at,
        "end_at": as_optional_int(payload.get("end_at")),
        "dismissible": bool(payload.get("dismissible", True)),
        "version": as_int(payload.get("version"), 1),
        "cta_label": str(payload.get("cta_label", "")).strip(),
        "cta_url": str(payload.get("cta_url", "")).strip(),
        "routes_include": normalize_routes(payload.get("routes_include")),
        "routes_exclude": normalize_routes(payload.get("routes_exclude")),
        "audience_type": payload.get("audience_type", "all"),
        "audience_values": payload.get("audience_values", []),
        "created_at": as_int(payload.get("created_at"), current_ms),
        "updated_at": current_ms,
        "gsi1pk": status,
        "gsi1sk": start_at,
    }


def unpublish_other_announcements(
    current_announcement_id: str, current_ms: int
) -> None:
    response = table.query(
        IndexName=ANNOUNCEMENTS_INDEX,
        KeyConditionExpression=Key("gsi1pk").eq("published"),
        ScanIndexForward=False,
        Limit=200,
    )
    items = response.get("Items", [])

    for item in items:
        announcement_id = item.get("announcement_id")
        if not announcement_id or announcement_id == current_announcement_id:
            continue

        if normalize_status(item.get("status")) != "published":
            continue

        current_version = as_int(item.get("version"), 1)
        table.update_item(
            Key={"announcement_id": announcement_id},
            UpdateExpression=(
                "SET #status = :unpublished, gsi1pk = :unpublished, "
                "updated_at = :updated_at, #version = :version"
            ),
            ExpressionAttributeNames={"#status": "status", "#version": "version"},
            ExpressionAttributeValues={
                ":unpublished": "unpublished",
                ":updated_at": current_ms,
                ":version": current_version + 1,
            },
        )


def list_announcements(event: Dict[str, Any]) -> Dict[str, Any]:
    params = query_params(event)
    requested_status = normalize_status(params.get("status")) if params.get("status") else None
    placement = params.get("placement")
    limit = max(1, min(int(params.get("limit", "100")), 200))

    if requested_status == "published":
        response = table.query(
            IndexName=ANNOUNCEMENTS_INDEX,
            KeyConditionExpression=Key("gsi1pk").eq("published"),
            Limit=limit,
            ScanIndexForward=False,
        )
        items = response.get("Items", [])
    elif requested_status == "unpublished":
        response = table.scan(
            FilterExpression=Attr("status").is_in(["unpublished", "draft", "archived"]),
            Limit=limit,
        )
        items = response.get("Items", [])
    else:
        response = table.scan(Limit=limit)
        items = response.get("Items", [])

    normalized_placement = normalize_placement(placement) if placement else None
    if normalized_placement:
        items = [
            item
            for item in items
            if normalize_placement(item.get("placement")) == normalized_placement
        ]

    for item in items:
        item["status"] = normalize_status(item.get("status")) or "unpublished"
        item["placement"] = normalize_placement(item.get("placement")) or "public"

    items.sort(key=lambda item: int(item.get("updated_at", 0)), reverse=True)
    return respond(200, {"items": [serialize_item(item) for item in items[:limit]]})


def create_announcement(event: Dict[str, Any]) -> Dict[str, Any]:
    payload = parse_body(event)
    error = validate_fields(payload, is_patch=False)
    if error:
        return respond(400, {"error": error})

    item = to_item(payload)
    table.put_item(Item=item)

    current_ms = now_ms()
    if normalize_status(item.get("status")) == "published":
        unpublish_other_announcements(item["announcement_id"], current_ms)

    return respond(201, serialize_item(item))


def update_announcement(announcement_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    existing = table.get_item(Key={"announcement_id": announcement_id}).get("Item")
    if not existing:
        return respond(404, {"error": "announcement_not_found"})

    payload = parse_body(event)
    merged = {**existing, **payload}

    if "version" not in payload:
        merged["version"] = int(existing.get("version", 1)) + 1

    error = validate_fields(merged, is_patch=True)
    if error:
        return respond(400, {"error": error})

    item = to_item(merged, announcement_id=announcement_id)
    item["created_at"] = int(existing.get("created_at", now_ms()))
    table.put_item(Item=item)

    current_ms = now_ms()
    if normalize_status(item.get("status")) == "published":
        unpublish_other_announcements(item["announcement_id"], current_ms)

    return respond(200, serialize_item(item))


def delete_announcement(announcement_id: str) -> Dict[str, Any]:
    table.delete_item(Key={"announcement_id": announcement_id})
    return respond(200, {"ok": True})


def lambda_handler(event, _context):
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "GET"
    ).upper()

    if method == "OPTIONS":
        return respond(200, {"ok": True})

    route_match, announcement_id = extract_route_info(event)
    if not route_match:
        return respond(404, {"error": "route_not_found"})

    try:
        if method == "GET" and not announcement_id:
            return list_announcements(event)

        if method == "POST" and not announcement_id:
            return create_announcement(event)

        if method == "PATCH" and announcement_id:
            return update_announcement(announcement_id, event)

        if method == "DELETE" and announcement_id:
            return delete_announcement(announcement_id)

        return respond(405, {"error": "method_not_allowed"})
    except Exception as error:
        return respond(500, {"error": "internal_error", "message": str(error)})
