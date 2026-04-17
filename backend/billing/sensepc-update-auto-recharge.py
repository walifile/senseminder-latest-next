import os
import json
import boto3
import stripe
from decimal import Decimal, InvalidOperation
from datetime import datetime

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

dynamodb = boto3.resource('dynamodb', region_name=region)
wallet_table = dynamodb.Table('SmartPCWallet')
events_table = dynamodb.Table('SmartPCUserAudit')



def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    owner_id = "unknown"
    try:
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')

        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})

        print(f"User ID: {user_id}")
        if not is_owner_role(user_role):
            return _response(403, {"message": "Members and Admins are not allowed to update auto recharge settings"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Parse and validate input
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)
        print(f"Body: {body}")

        autoRecharge = body.get("autoRecharge", False)
        autoRechargeAmount = body.get("autoRechargeAmount", "0")


        # Retrieve user from DynamoDB
        wallet_data = wallet_table.get_item(Key={"userId": owner_id}).get("Item")
        if not wallet_data:
            return _response(404, {"error": "User wallet not found"})

        # Validate payment method exists if enabling auto-recharge
        if autoRecharge:
            stripe_account_id = wallet_data.get("stripeAccountId")

            if not stripe_account_id:
                return _response(400, {
                    "error": "Cannot enable auto-recharge",
                    "message": "No payment method found. Please add a payment method before enabling auto-recharge."
                })

            try:
                # Retrieve payment methods from Stripe
                payment_methods = stripe.PaymentMethod.list(
                    customer=stripe_account_id,
                    type="card"
                )
                print(f"payment_methods: {payment_methods}")
                if not payment_methods.data or len(payment_methods.data) == 0:
                    return _response(400, {
                        "error": "Cannot enable auto-recharge",
                        "message": "No payment method found. Please add a payment method before enabling auto-recharge."
                    })

                print(f"Found {len(payment_methods.data)} payment method(s) for customer {stripe_account_id}")
            except stripe.error.StripeError as e:
                print(f"Stripe error while fetching payment methods: {e}")
                return _response(400, {
                    "error": "Cannot enable auto-recharge",
                    "message": "Failed to verify payment method. Please try again later."
                })

        # Update balance in DynamoDB table

        update_expr = "SET autoRecharge = :a, autoRechargeAmount = :aa, updatedTimestamp = :u"
        expr_attr_values = {
            ":a": bool(autoRecharge),
            ":aa": Decimal(autoRechargeAmount),
            ":u": datetime.now().isoformat()
        }

        wallet_table.update_item(
            Key={"userId": owner_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values
        )

        log_event(owner_id, "AUTO_RECHARGE_UPDATE", {"autoRecharge": autoRecharge})

        return _response(200, {
            "message": "Recharge successful",
            "autoRecharge": autoRecharge
        })

    except Exception as e:
        print(f"Error: {e}")
        log_event(owner_id, "AUTO_RECHARGE_UPDATE", {"error": str(e)}, status="FAILED")
        return _response(500, {"error": str(e)})


def _response(status_code, body):
    return {
        "statusCode": status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        "body": json.dumps(body)
    }


def log_event(user_id: str, event_type: str, details: dict, status: str = "SUCCESS"):
    event_timestamp = datetime.now().isoformat()
    
    item = {
        'userId': user_id,
        'eventTimestamp': str(event_timestamp),
        'eventType': event_type,
        'details': details,
        'status': status
    }

    events_table.put_item(Item=item)


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