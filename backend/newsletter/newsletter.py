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

"""
Newsletter subscription Lambda utilities

Modern, mobile-friendly HTML emails using your purple→blue brand gradient.
Production sender details are sourced from environment variables with safe defaults.
"""

# Required config from environment
TABLE_NAME = os.environ["NEWSLETTER_TABLE"]
SES_REGION = os.environ["SES_REGION"]

# Sender and brand configuration (with sensible production defaults)
FROM_EMAIL = os.environ.get("FROM_EMAIL", "no-reply@sensepc.com")
REPLY_TO_EMAIL = os.environ.get("REPLY_TO_EMAIL", "support@sensepc.com")
BRAND_NAME = os.environ.get("BRAND_NAME", "Sense PC")
WEBSITE_URL = os.environ.get("WEBSITE_URL", "https://sensepc.com")

# Branding and layout controls
PRIMARY_COLOR = os.environ.get("PRIMARY_COLOR", "#7C3AED")  # violet
EMAIL_BG_COLOR = os.environ.get("EMAIL_BG_COLOR", "#0B0E26")  # dark navy to match sample
CARD_BG_COLOR = os.environ.get("CARD_BG_COLOR", "#11143A")
TEXT_COLOR = os.environ.get("TEXT_COLOR", "#E5E7EB")
MUTED_COLOR = os.environ.get("MUTED_COLOR", "#A3A7C0")
BRAND_DARK = os.environ.get("BRAND_DARK", "#F9FAFB")
LOGO_URL = os.environ.get("LOGO_URL", "")
BRAND_TEXT_HTML = os.environ.get("BRAND_TEXT_HTML", "")
VIEW_IN_BROWSER_URL = os.environ.get("VIEW_IN_BROWSER_URL", "")
ADDRESS_LINE = os.environ.get("ADDRESS_LINE", "")  # Optional compliance footer address

# Gradient brand colors (purple → blue)
GRADIENT_START = os.environ.get("GRADIENT_START", "#C026D3")
GRADIENT_END = os.environ.get("GRADIENT_END", "#2563EB")

# Unsubscribe base URL (defaults to brand website if not provided)
BASE_UNSUBSCRIBE_URL = os.environ.get("BASE_UNSUBSCRIBE_URL", f"{WEBSITE_URL}/unsubscribe")

# Optional social links (leave blank if not applicable)
SOCIAL_LINKEDIN = os.environ.get("SOCIAL_LINKEDIN", "")
SOCIAL_X = os.environ.get("SOCIAL_X", "")  # X/Twitter
SOCIAL_YOUTUBE = os.environ.get("SOCIAL_YOUTUBE", "")
SOCIAL_FACEBOOK = os.environ.get("SOCIAL_FACEBOOK", "")
SOCIAL_INSTAGRAM = os.environ.get("SOCIAL_INSTAGRAM", "")

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


def _social_links_html() -> str:
    def icon_link(href: str, label: str, abbr: str) -> str:
        circle = (
            f"<span style='display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;"
            f"border-radius:50%;background:linear-gradient(90deg,{GRADIENT_START},{GRADIENT_END});"
            f"color:#ffffff;font-size:12px;font-weight:700;font-family:Arial,Helvetica,sans-serif;margin-right:8px'>"
            f"{abbr}</span>"
        )
        return (
            f"<a href='{href}' target='_blank' style='text-decoration:none;color:{MUTED_COLOR};margin:0 6px;"
            f"vertical-align:middle'>{circle}<span style='vertical-align:middle'>{label}</span></a>"
        )

    links = []
    if SOCIAL_LINKEDIN:
        links.append(icon_link(SOCIAL_LINKEDIN, "LinkedIn", "in"))
    if SOCIAL_X:
        links.append(icon_link(SOCIAL_X, "X", "X"))
    if SOCIAL_YOUTUBE:
        links.append(icon_link(SOCIAL_YOUTUBE, "YouTube", "YT"))
    if SOCIAL_FACEBOOK:
        links.append(icon_link(SOCIAL_FACEBOOK, "Facebook", "f"))
    if SOCIAL_INSTAGRAM:
        links.append(icon_link(SOCIAL_INSTAGRAM, "Instagram", "ig"))
    if not links:
        return ""
    return f"<div style='margin-top:8px;text-align:center'>{''.join(links)}</div>"


def _brand_text_html() -> str:
    if BRAND_TEXT_HTML:
        return BRAND_TEXT_HTML
    name = BRAND_NAME or "SensePC"
    parts = name.split()
    if len(parts) >= 2:
        left = parts[0]
        right = " ".join(parts[1:])
    else:
        mid = max(1, len(name)//2)
        left, right = name[:mid], name[mid:]
    return (
        f"<div style='font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;'>"
        f"<span style='color:{GRADIENT_START}'>{left}</span><span style='color:{GRADIENT_END}'>{right}</span>"
        f"</div>"
    )


def _wrap_email_html(title: str, content_html: str, unsubscribe_url: str, preheader: str = "") -> str:
    footer_social = _social_links_html()
    if LOGO_URL:
        logo_block = f"<img src='{LOGO_URL}' alt='{BRAND_NAME} logo' width='140' style='display:block;height:auto;border:0;outline:none;text-decoration:none;'>"
    else:
        logo_block = _brand_text_html()
    view_online = (
        f"<a href='{VIEW_IN_BROWSER_URL}' target='_blank' style='color:{MUTED_COLOR};text-decoration:underline;'>View in browser</a>"
        if VIEW_IN_BROWSER_URL else ""
    )
    preheader_html = (
        f"<div style=\"display:none;max-height:0px;overflow:hidden;font-size:1px;line-height:1px;color:{EMAIL_BG_COLOR};opacity:0;\">{preheader}</div>"
        if preheader else ""
    )
    return f"""
    <!DOCTYPE html>
    <html lang=\"en\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
        <title>{title}</title>
      </head>
      <body style=\"margin:0;padding:0;background-color:{EMAIL_BG_COLOR};\">
        {preheader_html}
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:{EMAIL_BG_COLOR};\">
          <tr>
            <td align=\"center\" style=\"padding:24px;\">
              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:640px;background-color:{CARD_BG_COLOR};border-radius:12px;overflow:hidden;\">
                <tr>
                  <td style=\"padding:20px 24px 0 24px;\">
                    <table role=\"presentation\" width=\"100%\">
                      <tr>
                        <td align=\"left\">{logo_block}</td>
                        <td align=\"right\" style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{MUTED_COLOR};\">{view_online}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:8px 24px 0 24px;\">
                    <div style=\"font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.35;color:{BRAND_DARK};font-weight:700;\">{title}</div>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:12px 24px 0 24px;\">
                    <hr style=\"border:none;height:1px;background:#27314D;\" />
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:12px 24px 4px 24px;\">
                    <div style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:{TEXT_COLOR};\">{content_html}</div>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:8px 24px 24px 24px;\">
                    <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\">
                      <tr>
                        <td align=\"center\" bgcolor=\"{PRIMARY_COLOR}\" style=\"border-radius:8px;\">
                          <a href=\"{WEBSITE_URL}\" target=\"_blank\" style=\"display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;background:linear-gradient(90deg,{GRADIENT_START},{GRADIENT_END});border-radius:8px;\">Visit Our Website</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style=\"max-width:640px;margin-top:16px;color:{MUTED_COLOR};font-family:Arial,Helvetica,sans-serif;font-size:12px;\">
                <div style=\"text-align:center;\">
                  <a href=\"{WEBSITE_URL}\" target=\"_blank\" style=\"color:{MUTED_COLOR};text-decoration:none;\">{WEBSITE_URL}</a>
                  {footer_social}
                </div>
                <div style=\"text-align:center;margin-top:8px;\">You are receiving this because you subscribed to updates from {BRAND_NAME}. If you no longer wish to receive these emails, you can <a href=\"{unsubscribe_url}\" style=\"color:{MUTED_COLOR};\">unsubscribe</a> at any time.</div>
                <div style=\"text-align:center;margin-top:8px;\">© {datetime.utcnow().year} {BRAND_NAME}. All rights reserved.</div>
                {f'<div style=\\"text-align:center;margin-top:4px;\\">{ADDRESS_LINE}</div>' if ADDRESS_LINE else ''}
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


# Welcome email for signup
def send_welcome_email(to_email: str, unsubscribe_url: str):
    subject = f"Welcome to {BRAND_NAME} - Your Journey Begins Here!"
    preheader = "Tips, updates, and resources to get started."
    content = (
        f"<p>We're excited to have you join our community.</p>"
        f"<p>As a {BRAND_NAME} subscriber, you'll occasionally receive:</p>"
        f"<ul style='padding-left:20px;margin:12px 0;'>"
        f"<li>Product updates and announcements</li>"
        f"<li>Best practices and how-tos</li>"
        f"<li>Early access invitations</li>"
        f"</ul>"
        f"<p>Need help? Reply to this email or visit <a href='{WEBSITE_URL}' style='color:{GRADIENT_END};text-decoration:underline;'>{WEBSITE_URL}</a>.</p>"
    )
    body_html = _wrap_email_html(subject, content, unsubscribe_url, preheader=preheader)
    body_text = (
        f"Welcome to {BRAND_NAME}\n\n"
        f"You'll receive occasional updates, tips, and invites.\n"
        f"Visit us: {WEBSITE_URL}\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )
    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [to_email]},
        ReplyToAddresses=[REPLY_TO_EMAIL] if REPLY_TO_EMAIL else [],
        Message={
            "Subject": {"Data": subject},
            "Body": {
                "Html": {"Data": body_html},
                "Text": {"Data": body_text},
            },
        },
    )

# Subscription confirmation email for newsletter only
def send_newsletter_email(to_email: str, unsubscribe_url: str):
    subject = f"Subscription Confirmed - Welcome to the {BRAND_NAME} Newsletter!"
    preheader = "You're on the list for useful, occasional updates."
    content = (
        f"<p>Thanks for subscribing to the {BRAND_NAME} newsletter.</p>"
        f"<p>Expect concise updates and resources to help you get more from {BRAND_NAME}:</p>"
        f"<ul style='padding-left:20px;margin:12px 0;'>"
        f"<li>New features and improvements</li>"
        f"<li>Tips, guides, and case studies</li>"
        f"<li>Invites to webinars and previews</li>"
        f"</ul>"
    )
    body_html = _wrap_email_html("You're all set!", content, unsubscribe_url, preheader=preheader)
    body_text = (
        f"You're subscribed to the {BRAND_NAME} newsletter.\n"
        f"We'll send useful updates from time to time.\n"
        f"Visit us: {WEBSITE_URL}\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )
    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [to_email]},
        ReplyToAddresses=[REPLY_TO_EMAIL] if REPLY_TO_EMAIL else [],
        Message={
            "Subject": {"Data": subject},
            "Body": {
                "Html": {"Data": body_html},
                "Text": {"Data": body_text},
            },
        },
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
                "signup": bool(signup),
                "subscriptionType": "signup" if signup else "newsletter",
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

    except Exception:
        logger.exception("Error in Lambda")
        return build_response(500, "Internal server error.")
