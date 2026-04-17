import base64
import json
import logging
import os
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Attr


logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ["NEWSLETTER_TABLE"]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def build_response(status_code: int, message: str, data=None):
    body = {"message": message}
    if data is not None:
        body["data"] = data
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        "body": json.dumps(body),
    }


def decimal_to_native(value):
    if isinstance(value, list):
        return [decimal_to_native(v) for v in value]
    if isinstance(value, dict):
        return {k: decimal_to_native(v) for k, v in value.items()}
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    return value


def get_route_key(event):
    route_key = event.get("routeKey")
    if route_key:
        return route_key

    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", event.get("httpMethod", ""))
    )
    path = event.get("rawPath") or event.get("resource") or event.get("path") or ""
    return f"{method} {path}".strip()


def parse_bool(value):
    if value is None or value == "":
        return None
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes"}:
        return True
    if normalized in {"0", "false", "no"}:
        return False
    raise ValueError(f"Invalid boolean value: {value}")


def parse_date_start(value):
    if not value:
        return None
    return datetime.fromisoformat(f"{value}T00:00:00+00:00")


def parse_date_end(value):
    if not value:
        return None
    return datetime.fromisoformat(f"{value}T23:59:59.999999+00:00")


def parse_created_at(value):
    if not value:
        return None

    normalized = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def encode_token(payload):
    if not payload:
        return None
    encoded = json.dumps(payload)
    return base64.urlsafe_b64encode(encoded.encode("utf-8")).decode("utf-8")


def decode_token(token):
    if not token:
        return None
    try:
        payload = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        return json.loads(payload)
    except Exception as exc:
        raise ValueError("Invalid nextToken value.") from exc


def normalize_subscriber(item):
    data = decimal_to_native(item)
    location_complete = all(
        str(data.get(field, "")).strip()
        and str(data.get(field, "")).strip().lower() != "unknown"
        for field in ("country", "city")
    )
    subscription_type = data.get("subscriptionType")
    if not subscription_type:
        subscription_type = "signup" if data.get("signup") is True else "newsletter"

    return {
        "email": data.get("email", ""),
        "country": data.get("country", "Unknown"),
        "city": data.get("city", "Unknown"),
        "ip": data.get("ip", "Unknown"),
        "createdAt": data.get("createdAt", ""),
        "unsubscribeToken": data.get("unsubscribeToken", ""),
        "subscriptionType": subscription_type,
        "locationComplete": location_complete,
    }


def build_scan_filter(params):
    filters = []

    country = (params.get("country") or "").strip()
    if country:
        filters.append(Attr("country").eq(country))

    city = (params.get("city") or "").strip()
    if city:
        filters.append(Attr("city").eq(city))

    has_location = params.get("hasLocation")
    if has_location is True:
        filters.append(
            Attr("country").exists()
            & Attr("city").exists()
            & Attr("country").ne("Unknown")
            & Attr("city").ne("Unknown")
        )
    elif has_location is False:
        filters.append(
            Attr("country").not_exists()
            | Attr("city").not_exists()
            | Attr("country").eq("Unknown")
            | Attr("city").eq("Unknown")
        )

    subscription_type = (params.get("subscriptionType") or "").strip().lower()
    if subscription_type in {"signup", "newsletter"}:
        filters.append(Attr("subscriptionType").eq(subscription_type))

    if not filters:
        return None

    expression = filters[0]
    for current in filters[1:]:
        expression = expression & current
    return expression


def list_subscribers(query_params):
    limit = max(1, min(int(query_params.get("limit", "25")), 100))
    token_payload = decode_token(query_params.get("nextToken")) or {}
    offset = int(token_payload.get("offset", 0))
    created_from = parse_date_start(query_params.get("createdFrom"))
    created_to = parse_date_end(query_params.get("createdTo"))

    filter_expression = build_scan_filter(
        {
            "country": query_params.get("country"),
            "city": query_params.get("city"),
            "hasLocation": parse_bool(query_params.get("hasLocation")),
            "subscriptionType": query_params.get("subscriptionType"),
        }
    )

    scan_kwargs = {}
    if filter_expression is not None:
        scan_kwargs["FilterExpression"] = filter_expression

    collected = []
    response = table.scan(**scan_kwargs)
    items = response.get("Items", [])

    while True:
        for item in items:
            normalized = normalize_subscriber(item)
            created_at = parse_created_at(normalized.get("createdAt"))

            if created_from and (created_at is None or created_at < created_from):
                continue
            if created_to and (created_at is None or created_at > created_to):
                continue

            query_text = (query_params.get("q") or "").strip().lower()
            if query_text:
                haystack = " ".join(
                    [
                        str(normalized.get("email", "")).lower(),
                        str(normalized.get("country", "")).lower(),
                        str(normalized.get("city", "")).lower(),
                        str(normalized.get("ip", "")).lower(),
                    ]
                )
                if query_text not in haystack:
                    continue

            collected.append(normalized)

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        response = table.scan(**scan_kwargs, ExclusiveStartKey=last_evaluated_key)
        items = response.get("Items", [])

    collected.sort(key=lambda item: item.get("createdAt", ""), reverse=True)
    page_items = collected[offset : offset + limit]
    next_offset = offset + limit
    next_token = encode_token({"offset": next_offset}) if next_offset < len(collected) else None

    return build_response(
        200,
        "Newsletter subscribers fetched successfully.",
        data={
            "items": page_items,
            "nextToken": next_token,
            "count": len(page_items),
            "totalCount": len(collected),
        },
    )


def get_stats():
    total = 0
    missing_location = 0
    newsletter_only = 0
    signup_total = 0
    country_counts = {}

    response = table.scan()
    items = response.get("Items", [])

    while True:
        for item in items:
            normalized = normalize_subscriber(item)
            total += 1

            if not normalized["locationComplete"]:
                missing_location += 1

            if normalized["subscriptionType"] == "signup":
                signup_total += 1
            else:
                newsletter_only += 1

            country = normalized.get("country") or "Unknown"
            country_counts[country] = country_counts.get(country, 0) + 1

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        response = table.scan(ExclusiveStartKey=last_evaluated_key)
        items = response.get("Items", [])

    top_countries = sorted(
        [{"country": country, "count": count} for country, count in country_counts.items()],
        key=lambda item: item["count"],
        reverse=True,
    )[:5]

    return build_response(
        200,
        "Newsletter statistics fetched successfully.",
        data={
            "totalSubscribers": total,
            "missingLocationCount": missing_location,
            "completeLocationCount": max(total - missing_location, 0),
            "newsletterOnlyCount": newsletter_only,
            "signupCount": signup_total,
            "topCountries": top_countries,
        },
    )


def lambda_handler(event, context):
    del context
    try:
        route_key = get_route_key(event)
        logger.info("Incoming routeKey: %s", route_key)
        logger.info("Full event: %s", json.dumps(event))

        if route_key == "OPTIONS /admin/newsletter/subscribers":
            return build_response(200, "OK")

        if route_key == "OPTIONS /admin/newsletter/stats":
            return build_response(200, "OK")

        if route_key == "GET /admin/newsletter/subscribers":
            query_params = event.get("queryStringParameters") or {}
            return list_subscribers(query_params)

        if route_key == "GET /admin/newsletter/stats":
            return get_stats()

        return build_response(404, "Invalid route or method.")
    except ValueError as exc:
        logger.exception("Validation error in newsletter admin lambda")
        return build_response(400, str(exc))
    except Exception:
        logger.exception("Error in newsletter admin lambda")
        return build_response(500, "Internal server error.")
