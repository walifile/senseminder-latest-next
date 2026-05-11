# NOTE:
# This helper is shared by the discount-related billing Lambdas and may be
# Current known usage:
# - sensepc_discount_campaigns.py
# - sensepc-add-billing-plan.py
# - sensepc-pricing-calculator.py
# - billing_service.py (used by sensepc-billing-lambda.py)
# If discount campaign logic changes here, sync the same change to every
# dependent Lambda repo/package before deployment.

import os
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

import boto3

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


def normalize_optional_text(value):
    text = (value or "").strip()
    return text or None


def validate_campaign_payload(payload: dict, partial: bool = False) -> dict:
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
        result["bannerText"] = normalize_optional_text(payload.get("bannerText"))

    if "description" in payload or not partial:
        result["description"] = normalize_optional_text(payload.get("description"))

    result["updatedAt"] = current_ms
    return result
