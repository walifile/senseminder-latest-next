import json
import os
import uuid
import base64
from discount_campaign_service import (
    campaigns_table,
    get_campaign,
    list_campaigns,
    normalize_plan_type,
    serialize_campaign,
    validate_campaign_payload,
    utc_now_ms,
)


def campaigns_response(items: list[dict], status_code: int = 200):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json",
        },
        "body": json.dumps({"items": items}),
    }


def _response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
    }


def _load_body(event: dict) -> dict:
    body = event.get("body") or {}
    if event.get("isBase64Encoded") and isinstance(body, str):
        body = base64.b64decode(body).decode("utf-8")
    if isinstance(body, str):
        return json.loads(body or "{}")
    return body


def _require_admin_claims(event: dict) -> dict:
    request_context = (event or {}).get("requestContext") or {}
    authorizer = request_context.get("authorizer") or {}
    claims = authorizer.get("claims") or ((authorizer.get("jwt") or {}).get("claims"))
    if not claims:
        raise PermissionError("Missing auth claims")
    return claims


def _public_active_response(plan_type: str | None):
    items = list_campaigns(status="published", plan_type=plan_type)
    active = [item for item in items if item.get("isActive")]
    active.sort(key=lambda item: (float(item.get("discountPercent") or 0), int(item.get("startAt") or 0)), reverse=True)
    return campaigns_response(active)


def _request_method(event: dict) -> str:
    return (
        event.get("httpMethod")
        or (((event.get("requestContext") or {}).get("http") or {}).get("method"))
        or "GET"
    ).upper()


def _request_path(event: dict) -> str:
    return (
        event.get("path")
        or event.get("rawPath")
        or (((event.get("requestContext") or {}).get("http") or {}).get("path"))
        or ""
    ).rstrip("/")


def lambda_handler(event, context):
    method = _request_method(event)
    if method == "OPTIONS":
        return _response(200, {})

    path_parameters = event.get("pathParameters") or {}
    campaign_id = path_parameters.get("campaignId") or path_parameters.get("id")
    params = event.get("queryStringParameters") or {}
    path = _request_path(event)
    plan_type = params.get("planType")

    if method == "GET" and (params.get("active") == "true" or path.endswith("/active")):
        normalized_plan = normalize_plan_type(plan_type) if plan_type else None
        return _public_active_response(normalized_plan)

    try:
        claims = _require_admin_claims(event)
    except PermissionError:
        if method == "GET":
            normalized_plan = normalize_plan_type(plan_type) if plan_type else None
            return _public_active_response(normalized_plan)
        return _response(401, {"message": "Unauthorized"})

    actor = claims.get("email") or claims.get("sub") or "unknown"

    try:
        if method == "GET":
            if campaign_id:
                item = get_campaign(campaign_id)
                if not item:
                    return _response(404, {"message": "Campaign not found"})
                return _response(200, item)

            status = params.get("status")
            normalized_status = None if not status or status == "all" else normalize_status(status)
            normalized_plan = normalize_plan_type(plan_type) if plan_type and plan_type != "all" else None
            return campaigns_response(list_campaigns(status=normalized_status, plan_type=normalized_plan))

        if method == "POST":
            payload = validate_campaign_payload(_load_body(event), partial=False)
            now_ms = utc_now_ms()
            item = {
                "campaignId": str(uuid.uuid4()),
                "createdAt": now_ms,
                "createdBy": actor,
                **payload,
            }
            campaigns_table.put_item(Item=item)
            return _response(201, serialize_campaign(item))

        if method == "PATCH":
            if not campaign_id:
                return _response(400, {"message": "campaignId is required"})
            existing = campaigns_table.get_item(Key={"campaignId": campaign_id}).get("Item")
            if not existing:
                return _response(404, {"message": "Campaign not found"})
            payload = validate_campaign_payload(_load_body(event), partial=True)
            payload["updatedBy"] = actor
            updated = {**existing, **payload}
            campaigns_table.put_item(Item=updated)
            return _response(200, serialize_campaign(updated))

        if method == "DELETE":
            if not campaign_id:
                return _response(400, {"message": "campaignId is required"})
            campaigns_table.delete_item(Key={"campaignId": campaign_id})
            return _response(200, {"ok": True})

        return _response(405, {"message": "Method not allowed"})
    except ValueError as error:
        return _response(400, {"message": str(error)})
    except Exception as error:
        print(f"[ERROR] discount campaigns failed: {error}")
        return _response(500, {"message": "Internal server error", "error": str(error)})


handler = lambda_handler
