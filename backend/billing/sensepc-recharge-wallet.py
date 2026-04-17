import os
import json
import boto3
from boto3.dynamodb.conditions import Key
import stripe
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from datetime import datetime
from typing import Optional

# Environment variables
region = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource('dynamodb', region_name=region)
wallet_table = dynamodb.Table('SmartPCWallet')
events_table = dynamodb.Table('SmartPCUserAudit')
notifications_table = dynamodb.Table('SmartPC-Notification')
user_table = dynamodb.Table('senseminder-user')

MIN_RECHARGE_AMOUNT = Decimal(os.environ.get("MIN_RECHARGE_AMOUNT", "20"))  # USD
PROCESSING_FEE_ENABLED = os.environ.get("PROCESSING_FEE_ENABLED", "true").lower() == "true"
PROCESSING_FEE_PERCENTAGE = Decimal(os.environ.get("PROCESSING_FEE_PERCENTAGE", "1"))  # percentage for non-US cards
NO_PROCESSING_FEE_COUNTRIES = os.environ.get("NO_PROCESSING_FEE_COUNTRIES", "US").split(",")  # comma-separated country codes

secret_name = os.environ.get("STRIPE_SECRET_NAME", "stripe/api_key")

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


def lambda_handler(event, context):
    # Initialize variables for exception handlers to prevent NameError
    owner_id = None
    amount = None
    payment_method_id = ""
    payment_method_display = None

    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
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
            return _response(403, {"message": "Members and Admins are not allowed to recharge Wallets"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Parse and validate input
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)
        print(f"Body: {body}")

        amount = body.get("amount")
        currency = body.get("currency", "usd")
        autoRecharge = body.get("autoRecharge", None)

        if not amount:
            return _response(400, {"error": "amount is required"})

        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, TypeError):
            return _response(400, {"error": "Invalid amount format"})
        
        if amount < MIN_RECHARGE_AMOUNT:
            return _response(400, {"error": f"Minimum recharge amount is ${MIN_RECHARGE_AMOUNT}"})

        # Retrieve user from DynamoDB
        response = user_table.query(
            IndexName="id-index",
            KeyConditionExpression=Key("id").eq(owner_id)
        )

        user_items = response.get("Items", [])
        wallet_data = wallet_table.get_item(Key={"userId": owner_id}).get("Item")

        if not user_items:
            return _response(404, {"error": "User not found"})

        if not wallet_data:
            return _response(404, {"error": "User wallet not found"})
        
        user_data = user_items[0]
        user_email = user_data.get("email")
        stripe_account_id = wallet_data.get("stripeAccountId")
        has_paid = wallet_data.get("hasPaid", False)
        has_paid_user_data = user_data.get("hasPaid", False)
        if not stripe_account_id:
            return _response(400, {"error": "No Stripe account linked with this user"})

        try:
            payment_method_id = get_default_or_first_payment_method(stripe_account_id)
        except Exception as e:
            return _response(400, {"error": str(e)})
        
        print(f"Payment method ID: {payment_method_id}")
        payment_method_display = get_payment_method_display(payment_method_id)
        
        # Calculate processing fee based on card country
        amount_to_charge, card_country = calculate_processing_fee(amount, payment_method_id)
        processing_fee = amount_to_charge - amount
        
        # Create a PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount_to_charge * 100),  # amount in cents
            currency=currency,
            customer=stripe_account_id,
            payment_method=payment_method_id,
            off_session=True,
            confirm=True,  # charge immediately
            metadata={
                "type": "WALLET_RECHARGE",
                "cardCountry": card_country,
                "processingFee": str(processing_fee)
            }
        )

        # Update balance in DynamoDB
        current_balance = Decimal(str(wallet_data.get("balance", 0)))
        new_balance = current_balance + amount
        print(f"New balance: {new_balance}")
        print(f"Current balance: {current_balance}")

        update_expr = "SET balance = :b, updatedTimestamp = :u"
        expr_attr_values = {
            ":b": new_balance,
            ":u": datetime.now().isoformat()
        }

        if not has_paid:
            update_expr += ", hasPaid = :hp"
            expr_attr_values[":hp"] = True

        if autoRecharge is not None and autoRecharge == True:  # only update if field is passed
            update_expr += ", autoRecharge = :a, autoRechargeAmount = :aa"
            expr_attr_values[":a"] = bool(autoRecharge)
            expr_attr_values[":aa"] = amount

        wallet_table.update_item(
            Key={"userId": owner_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values
        )

        # Only update if not already paid
        if not has_paid_user_data:
            user_table.update_item(
                Key={
                    "email": user_email
                },
                UpdateExpression="SET hasPaid = :hp",
                ExpressionAttributeValues={
                    ":hp": True
                }
            )

        log_recharge_wallet(owner_id, amount, payment_method_id, payment_intent.id, "SUCCESS", payment_method_display=payment_method_display, card_country=card_country, processing_fee=processing_fee)
        log_recharge_notification(owner_id, amount, new_balance, card_country, processing_fee)
        return _response(200, {
            "message": "Recharge successful",
            "paymentIntentId": payment_intent.id,
            "newBalance": str(new_balance)
        })

    except stripe.error.CardError as e:
        print(f"Stripe CardError: {e}")
        log_recharge_wallet(owner_id, amount, payment_method_id, None, status="FAILED", err = str(e))
        return _response(402, {"error": e.user_message or str(e)})
    except Exception as e:
        print(f"Error: {e}")
        log_recharge_wallet(owner_id, amount, payment_method_id, None, status="FAILED", err = str(e))
        return _response(500, {"error": str(e)})

def get_payment_method_display(payment_method_id: str) -> Optional[str]:
   
    try:
        if not payment_method_id:
            return None

        payment_method = stripe.PaymentMethod.retrieve(payment_method_id)

        if not payment_method or payment_method.type != "card":
            return None

        card = payment_method.get("card", {})
        if not card:
            return None

        brand = card.get("brand", "").capitalize()
        last4 = card.get("last4", "")

        if not brand or not last4:
            return None

        return f"{brand} **** {last4}"

    except Exception as e:
        print(f"Error retrieving payment method display for {payment_method_id}: {e}")
        return None

def get_card_country(payment_method_id: str) -> Optional[str]:
    """
    Retrieves the country code of the card associated with the payment method.
    Returns the country code (e.g., 'US', 'GB') or None if unable to retrieve.
    """
    try:
        if not payment_method_id:
            return None

        payment_method = stripe.PaymentMethod.retrieve(payment_method_id)

        if not payment_method or payment_method.type != "card":
            return None

        card = payment_method.get("card", {})
        if not card:
            return None

        country = card.get("country")
        return country.upper() if country else None

    except Exception as e:
        print(f"Error retrieving card country for {payment_method_id}: {e}")
        return None

def calculate_processing_fee(amount: Decimal, payment_method_id: str) -> tuple[Decimal, str]:
    """
    Calculates processing fee for non-allowed country cards if enabled.
    Returns tuple of (total_amount_with_fee, country_code)
    """
    if not PROCESSING_FEE_ENABLED:
        return amount, "US"

    card_country = get_card_country(payment_method_id)
    if not card_country:
        print(f"Could not determine card country, assuming US")
        return amount, "US"

    # Check if country is in allowed list
    if card_country.upper() in NO_PROCESSING_FEE_COUNTRIES:
        return amount, card_country

    # Calculate processing fee for non-allowed countries
    processing_fee = (amount * PROCESSING_FEE_PERCENTAGE) / Decimal("100")
    processing_fee = processing_fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)  # round to 2 decimal places
    total_amount = (amount + processing_fee).quantize(Decimal('0.01'))
    
    print(f"Card country: {card_country}, Processing fee ({PROCESSING_FEE_PERCENTAGE}%): ${processing_fee}, Total amount: ${total_amount}")
    return total_amount, card_country

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

def log_recharge_wallet(user_id: str, amount: float, payment_method_id: str, payment_intent_id: Optional[str] = None, status: str = "SUCCESS", err: str = None, payment_method_display: Optional[str] = None, card_country: Optional[str] = None, processing_fee: Decimal = Decimal("0")):
    details = {
        "amount": str(amount),
        "paymentMethodId": payment_method_id
    }
    if payment_intent_id:
        details["paymentIntentId"] = payment_intent_id
    if payment_method_display:
        details["paymentMethodDisplay"] = payment_method_display
    if card_country:
        details["cardCountry"] = card_country
    if processing_fee > 0:
        details["processingFee"] = str(processing_fee)

    if err:
        details["error"] = err
    log_event(
        user_id=user_id,
        event_type="RECHARGE_WALLET",
        details=details,
        status=status
    )


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

def get_default_or_first_payment_method(stripe_customer_id: str) -> str:
    try:
        # Fetch the customer to check default payment method
        customer = stripe.Customer.retrieve(stripe_customer_id)
        default_payment_method = customer.get("invoice_settings", {}).get("default_payment_method")

        if default_payment_method:
            return default_payment_method

        # If no default is set, list all and return the first one
        payment_methods = stripe.PaymentMethod.list(
            customer=stripe_customer_id,
            type="card",
            limit=1
        )
        if payment_methods.data:
            return payment_methods.data[0].id

        raise Exception("No payment method found. Please add a payment method to your account.")

    except Exception as e:
        print(f"Error fetching payment method: {e}")
        raise

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
    

def log_recharge_notification(user_id: str, amount: Decimal, new_balance: Decimal, card_country: Optional[str] = None, processing_fee: Decimal = Decimal("0")):
    now = datetime.now().isoformat()
    
    # Build notification content
    content = f"Wallet recharge of ${amount} was successful. New balance: ${new_balance}"
    if processing_fee > 0:
        content = f"Wallet recharge of ${amount} was successful (${processing_fee} processing fee applied). New balance: ${new_balance}"
    
    item = {
        "userId": user_id,
        "timestamp": now,
        "content": content,
        "route": "/dashboard/billing",
        "severity": "info",
        "title": "Wallet Recharge Successful",
        "type": "recharge-success"
    }
    notifications_table.put_item(Item=item)