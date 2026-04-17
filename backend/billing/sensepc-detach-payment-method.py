import os
import json
import boto3
import stripe
from boto3.dynamodb.conditions import Key

# Initialize Stripe
secret_name = os.environ.get("STRIPE_SECRET_NAME", "stripe/api_key")
region = os.environ.get("AWS_REGION", "us-east-1")

def get_stripe_api_key(secret_name: str, region_name: str = "us-east-1") -> str:
    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
        secret_string = response.get("SecretString")
        if secret_string:
            secret_data = json.loads(secret_string)
            return secret_data.get("stripe_secret_key")
        else:
            raise ValueError("SecretString is empty or not found.")
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        raise

# Get secret key
stripe.api_key = get_stripe_api_key(secret_name, region)

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name=region)
wallet_table = dynamodb.Table("SmartPCWallet")

def lambda_handler(event, context):

    method = event.get("httpMethod")
    if method == "OPTIONS":
        return _response(200, {})

    try:
        print(f"Raw event: {json.dumps(event)}")

        # Extract user identity
        claims = event["requestContext"]["authorizer"]["claims"]
        user_id = claims.get("sub")
        user_email = claims.get("email")
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        if not user_id or not user_email:
            return _response(400, {"error": "Missing identity information from token"})

        if not is_owner_role(user_role):
            return _response(403, {"message": "Members and Admins are not allowed to delete Payment methods"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Parse body
        body = {}
        if event.get("body"):
            body = json.loads(event["body"])
        payment_method_id = body.get("paymentMethodId")

        if not payment_method_id:
            return _response(400, {"error": "Missing paymentMethodId in request body"})

        # Fetch wallet info
        response = wallet_table.get_item(Key={"userId": owner_id})
        item = response.get("Item")
        if not item:
            return _response(404, {"error": "User not found"})

        stripe_account_id = item.get("stripeAccountId")
        if not stripe_account_id:
            return _response(400, {"error": "Stripe account not linked for this user"})

        # Check if autoRecharge is enabled
        auto_recharge = item.get("autoRecharge", False)
        print(f"AutoRecharge status: {auto_recharge}")

        # Check if payment method belongs to this customer before detaching
        pm = stripe.PaymentMethod.retrieve(payment_method_id)
        if pm.customer != stripe_account_id:
            return _response(403, {"error": "Payment method does not belong to this user"})

        # If autoRecharge is enabled, check if this is the default payment method
        if auto_recharge:
            customer = stripe.Customer.retrieve(stripe_account_id)
            default_payment_method = customer.get("invoice_settings", {}).get("default_payment_method")

            print(f"Default payment method: {default_payment_method}")
            print(f"Payment method to delete: {payment_method_id}")

            if default_payment_method == payment_method_id:
                return _response(400, {
                    "error": "Cannot delete default payment method while auto-recharge is enabled",
                    "message": "This is your default payment method and auto-recharge is currently enabled. To delete this card, please either:\n1. Disable auto-recharge for your account, or\n2. Add a new payment method and set it as default before deleting this one.",
                    "autoRechargeEnabled": True,
                    "isDefaultCard": True
                })

        # Detach payment method from Stripe
        detached = stripe.PaymentMethod.detach(payment_method_id)
        print(f"Detached Payment Method: {detached}")

        return _response(200, {
            "message": "Payment method deleted successfully",
            "paymentMethodId": payment_method_id
        })

    except Exception as e:
        print(f"Error: {e}")
        return _response(500, {"error": str(e)})


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def is_owner_role(role):
    """
    Checks if the current user is owner
    - Returns True if user has owner role
    - Returns False  
    """
    print("[DEBUG] Checking access control for role:", role)
    if not role:
        print("[DEBUG] No user identity provided — Stop here")
        return False

    # Resolve ownerId based on role
    return True if role == "owner" else False

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")