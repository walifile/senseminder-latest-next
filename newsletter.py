import json
import boto3
import re
import os
import logging
from datetime import datetime
import uuid

# Logger setup
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# # Config
# TABLE_NAME = os.environ.get("NEWSLETTER_TABLE", "SmartPCNewsletterSubscribers")
# SES_REGION = "us-east-1"
# FROM_EMAIL = "super-admin@senseminder.com"
# BASE_UNSUBSCRIBE_URL = "https://smartpc.cloud/"

# Config from environment
TABLE_NAME = os.environ["NEWSLETTER_TABLE"]
SES_REGION = os.environ["SES_REGION"]
FROM_EMAIL = os.environ["FROM_EMAIL"]
BASE_UNSUBSCRIBE_URL = os.environ["BASE_UNSUBSCRIBE_URL"]

# AWS Clients
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)
ses = boto3.client("ses", region_name=SES_REGION)

EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
def validate_email(email: str) -> bool:
    return re.match(EMAIL_REGEX, email or "") is not None

def build_response(status_code: int, message: str, data=None):
    body = {"message": message}
    if data:
        body["data"] = data
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }

# Welcome email for signup
def send_welcome_email(to_email: str, unsubscribe_url: str):
    subject = "Welcome to SmartPC — Your Journey Begins Here!"
    body_html = f"""
    <html>
    <body style='font-family: Arial, sans-serif; color: #333;'>
        <h1 style='color: #0d6efd;'>Welcome to SmartPC!</h1>
        <p>We're thrilled to have you join our community. 🚀</p>
        <p>As a SmartPC member, you will receive exclusive updates, valuable tips, and exciting offers tailored just for you. We’re committed to enhancing your experience.</p>
        <p>Let’s start this journey with a bang!</p>
        <hr>
        <p style='font-size: 0.9em; color: #888;'>
            If you prefer not to receive our updates, you can <a href='{unsubscribe_url}'>unsubscribe</a> at any time.
        </p>
    </body>
    </html>
    """
    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Html": {"Data": body_html}},
        }
    )

# Subscription confirmation email for newsletter only
def send_newsletter_email(to_email: str, unsubscribe_url: str):
    subject = "Subscription Confirmed — Welcome to the SmartPC Newsletter!"
    body_html = f"""
    <html>
    <body style='font-family: Arial, sans-serif; color: #333;'>
        <h1 style='color: #0d6efd;'>You're All Set!</h1>
        <p>Thank you for subscribing to the SmartPC Newsletter! 🎉</p>
        <p>We're excited to have you on board. Get ready for exclusive updates, helpful insights, and special offers designed to elevate your SmartPC experience.</p>
        <p>Stay tuned for exciting news coming your way!</p>
        <hr>
        <p style='font-size: 0.9em; color: #888;'>
            If you wish to stop receiving our emails, simply click <a href='{unsubscribe_url}'>here to unsubscribe</a>.
        </p>
    </body>
    </html>
    """
    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Html": {"Data": body_html}},
        }
    )

def lambda_handler(event, context):
    try:
        route_key = event.get("routeKey", "")
        logger.info(f"Incoming routeKey: {route_key}")
        logger.info("Full event: %s", json.dumps(event))

        # === POST /subscribe ===
        if route_key == "POST /subscribe":
            body = json.loads(event.get("body", "{}"))
            email = (body.get("email") or "").strip().lower()
            location = body.get("location", {}) or {}
            signup = body.get("signup", False)  # New flag to differentiate signup

            if not validate_email(email):
                return build_response(400, "Invalid email format.")

            existing = table.get_item(Key={"email": email})
            if "Item" in existing:
                return build_response(409, "Email is already subscribed.")

            unsubscribe_token = str(uuid.uuid4())
            unsubscribe_url = f"{BASE_UNSUBSCRIBE_URL}?email={email}&token={unsubscribe_token}"

            # Send welcome email for signup or subscription confirmation for newsletter
            if signup:
                send_welcome_email(email, unsubscribe_url)  # Welcome email for signup
            else:
                send_newsletter_email(email, unsubscribe_url)  # Subscription email for newsletter

            # Store user subscription data
            table.put_item(Item={
                "email": email,
                "country": location.get("country", "Unknown"),
                "city": location.get("city", "Unknown"),
                "ip": location.get("ip", "Unknown"),
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "unsubscribeToken": unsubscribe_token,
            })

            return build_response(200, "Subscription successful. Welcome email sent." if signup else "Subscription successful.")

        # === GET /unsubscribe ===
        elif route_key == "GET /unsubscribe":
            params = event.get("queryStringParameters") or {}
            email = (params.get("email") or "").strip().lower()
            token = (params.get("token") or "").strip()

            if not email or not token:
                return build_response(400, "Missing email or token.")

            if not validate_email(email):
                return build_response(400, "Invalid email format.")

            item = table.get_item(Key={"email": email}).get("Item")
            if not item:
                return build_response(404, "Subscriber not found.")

            if item.get("unsubscribeToken") != token:
                return build_response(403, "Invalid unsubscribe token.")

            table.delete_item(Key={"email": email})
            return build_response(200, "You have been unsubscribed successfully.")

        # === Default: Not Found ===
        else:
            return build_response(404, "Invalid route or method.")

    except Exception as e:
        logger.exception("Error in Lambda")
        return build_response(500, "Internal server error.")
