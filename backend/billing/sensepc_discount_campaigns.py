import json
import os
import uuid
import base64
import boto3
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

region = os.environ.get("AWS_REGION", "us-east-1")
table_name = os.environ.get("DISCOUNT_CAMPAIGN_TABLE_NAME", "SmartPCDiscountCampaigns")

dynamodb = boto3.resource("dynamodb", region_name=region)
campaigns_table = dynamodb.Table(table_name)

VALID_PLAN_TYPES = {"hourly", "daily", "monthly"}
VALID_STATUSES = {"published", "archived"}


def utc_now_ms() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def decimal_to_float(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, list):
        return [decimal_to_float(item) for item in value]
    if isinstance(value, dict):
        return {key: decimal_to_float(item) for key, item in value.items()}
    return value


def normalize_plan_type(value: str) -> str:
    plan_type = (value or "").strip().lower()
    if plan_type not in VALID_PLAN_TYPES:
        raise ValueError(f"Invalid planType '{value}'. Expected one of {sorted(VALID_PLAN_TYPES)}")
    return plan_type


def normalize_status(value: str) -> str:
    status = (value or "published").strip().lower()
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{value}'. Expected one of {sorted(VALID_STATUSES)}")
    return status


def quantize_money(value) -> Decimal:
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def campaign_is_active(campaign: dict, at_ms: int | None = None) -> bool:
    current_ms = at_ms or utc_now_ms()
    if (campaign.get("status") or "archived").lower() != "published":
        return False
    start_at = int(campaign.get("startAt") or 0)
    end_at = int(campaign.get("endAt") or 0)
    if start_at and current_ms < start_at:
        return False
    if end_at and current_ms > end_at:
        return False
    return True


def serialize_campaign(item: dict, at_ms: int | None = None) -> dict:
    serialized = decimal_to_float(dict(item))
    serialized["isActive"] = campaign_is_active(serialized, at_ms)
    return serialized


def list_campaigns(status: str | None = None, plan_type: str | None = None) -> list[dict]:
    response = campaigns_table.scan()
    items = response.get("Items", [])
    while response.get("LastEvaluatedKey"):
        response = campaigns_table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    normalized_status = (status or "").strip().lower() or None
    normalized_plan = (plan_type or "").strip().lower() or None

    filtered = []
    for item in items:
        current_status = (item.get("status") or "archived").lower()
        current_plan = (item.get("planType") or "").lower()
        if normalized_status and current_status != normalized_status:
            continue
        if normalized_plan and current_plan != normalized_plan:
            continue
        filtered.append(serialize_campaign(item))

    filtered.sort(key=lambda item: int(item.get("createdAt") or 0), reverse=True)
    return filtered


def get_campaign(campaign_id: str) -> dict | None:
    item = campaigns_table.get_item(Key={"campaignId": campaign_id}).get("Item")
    if not item:
        return None
    return serialize_campaign(item)


def get_active_campaign(plan_type: str, at_ms: int | None = None) -> dict | None:
    normalized_plan = normalize_plan_type(plan_type)
    current_ms = at_ms or utc_now_ms()
    candidates = [
        item for item in list_campaigns(status="published", plan_type=normalized_plan)
        if campaign_is_active(item, current_ms)
    ]
    if not candidates:
        return None

    candidates.sort(
        key=lambda item: (
            float(item.get("discountPercent") or 0),
            int(item.get("startAt") or 0),
            int(item.get("createdAt") or 0),
        ),
        reverse=True,
    )
    return candidates[0]


def apply_campaign_discount(amount, plan_type: str, at_ms: int | None = None) -> dict:
    base_amount = quantize_money(amount)
    campaign = get_active_campaign(plan_type, at_ms)
    if not campaign:
        return {
            "base_amount": float(base_amount),
            "discount_amount": 0.0,
            "final_amount": float(base_amount),
            "discount_percent": 0.0,
            "campaign_id": None,
            "campaign_name": None,
            "banner_text": None,
            "plan_type": normalize_plan_type(plan_type),
        }

    discount_percent = Decimal(str(campaign.get("discountPercent") or 0))
    discount_amount = quantize_money(base_amount * discount_percent / Decimal("100"))
    final_amount = quantize_money(base_amount - discount_amount)

    return {
        "base_amount": float(base_amount),
        "discount_amount": float(discount_amount),
        "final_amount": float(final_amount),
        "discount_percent": float(discount_percent),
        "campaign_id": campaign.get("campaignId"),
        "campaign_name": campaign.get("name"),
        "banner_text": campaign.get("bannerText"),
        "plan_type": campaign.get("planType"),
    }


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


def _normalize_optional_text(value):
    text = (value or "").strip()
    return text or None


def _validate_payload(payload: dict, partial: bool = False) -> dict:
    current_ms = utc_now_ms()
    result = {}

    if not partial or "name" in payload:
        name = (payload.get("name") or "").strip()
        if not name:
            raise ValueError("Campaign name is required")
        result["name"] = name

    if not partial or "planType" in payload:
        result["planType"] = normalize_plan_type(payload.get("planType"))

    if not partial or "discountPercent" in payload:
        discount_percent = Decimal(str(payload.get("discountPercent")))
        if discount_percent <= 0 or discount_percent >= 100:
            raise ValueError("discountPercent must be greater than 0 and less than 100")
        result["discountPercent"] = Decimal(str(discount_percent))

    if not partial or "status" in payload:
        result["status"] = normalize_status(payload.get("status"))

    if not partial or "startAt" in payload:
        start_at = int(payload.get("startAt") or 0)
        if start_at <= 0:
            raise ValueError("startAt is required")
        result["startAt"] = start_at

    if not partial or "endAt" in payload:
        raw_end_at = payload.get("endAt")
        end_at = int(raw_end_at) if raw_end_at not in (None, "") else None
        result["endAt"] = end_at

    final_start = result.get("startAt")
    final_end = result.get("endAt")
    if final_start and final_end and final_end <= final_start:
        raise ValueError("endAt must be after startAt")

    if "bannerText" in payload or not partial:
        result["bannerText"] = _normalize_optional_text(payload.get("bannerText"))

    if "description" in payload or not partial:
        result["description"] = _normalize_optional_text(payload.get("description"))

    result["updatedAt"] = current_ms
    return result


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
            payload = _validate_payload(_load_body(event), partial=False)
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
            payload = _validate_payload(_load_body(event), partial=True)
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
