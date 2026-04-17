import os
import json
import boto3
import stripe
from boto3.dynamodb.conditions import Key
from datetime import datetime
from botocore.exceptions import ClientError
from typing import Dict
from decimal import Decimal

# Initialize Stripe
secret_name = os.environ.get("STRIPE_SECRET_NAME", "stripe/api_key")
region = os.environ.get("AWS_REGION", "us-east-1")

ADD_PROMO_BALANCE_ON_ACC_CREATION = os.environ.get("ADD_PROMO_BALANCE_ON_ACC_CREATION", "0")
TABLE_SMARTPC_USER_AUDIT = os.environ.get('TABLE_SMARTPC_USER_AUDIT', 'SmartPCUserAudit')

ssm_client = boto3.client("ssm", region_name=region)
# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=region)
wallet_table = dynamodb.Table('SmartPCWallet')
events_table = dynamodb.Table(TABLE_SMARTPC_USER_AUDIT)

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


def get_promo_balance() -> Decimal:
    """Fetch promo balance from Parameter Store, fallback to env var."""
    try:
        if ADD_PROMO_BALANCE_ON_ACC_CREATION.lower() != "1":
            print("Promo balance addition on account creation is disabled.")
            return Decimal("0.0")
        response = ssm_client.get_parameter(Name="/promocode/amount")
        value = response["Parameter"]["Value"]
        print(f"Fetched promo_balance from Parameter Store: {value}")
        return Decimal(value)
    except ClientError as e:
        if e.response["Error"]["Code"] == "ParameterNotFound":
            fallback = os.environ.get("PROMO_AMOUNT", "5.0")
            print(f"Parameter not found. Falling back to env: {fallback}")
            return Decimal(fallback)
        else:
            raise


def create_wallet_record(user_id: str) -> dict:
    """Create a new wallet record in DynamoDB"""
    current_timestamp = datetime.now().isoformat()
    promo_balance = get_promo_balance()
    print(f"Using promo balance: {promo_balance}")
    wallet_item = {
        'userId': user_id,
        'autoRecharge': 'false',
        'balance': Decimal("0"),
        'cashback': Decimal("0.00"),
        'stripeAccountId': '',
        "promoBalance": promo_balance,
        'timestamp': current_timestamp,
        'updatedTimestamp': current_timestamp,
        'sortKey': 'ALL'
    }
    
    try:
        wallet_table.put_item(Item=wallet_item)
        print(f"Created new wallet record for user: {user_id}")
        if promo_balance and promo_balance > 0:
            log_event(user_id, "PROMO_BALANCE_ADDED", {"amount": promo_balance, "campaign": "Joining Promo code" })
            
        return wallet_item
    except Exception as e:
        print(f"Error creating wallet record: {e}")
        raise

def log_event(user_id: str, event_type: str, details: Dict, status: str = "SUCCESS"):
    """Log event to audit table"""
    item = {
        'userId': user_id,
        'eventTimestamp': datetime.now().isoformat(),
        'eventType': event_type,
        'details': details,
        'status': status
    }
    events_table.put_item(Item=item)


def lambda_handler(event, context):

    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})

    
    try:
        print(f"Raw event: {json.dumps(event)}")
        # Extract user identity from Cognito token claims.
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')
        firstName = claims.get('custom:firstName') or claims.get('firstName')
        
        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})
        
        if not is_owner_role(user_role):
            return _response(403, {"message": "Members and Admins are not allowed to add Payment methods"})
        
        print(f"User ID: {user_id}")

        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")
        
        
        # Fetch user wallet info from DynamoDB
        response = wallet_table.get_item(Key={'userId': owner_id})
        item = response.get('Item')
        # If wallet doesn't exist, create a new one
        if not item:
            print(f"Wallet not found for user {owner_id}. Creating new wallet record...")
            item = create_wallet_record(owner_id)

        stripe_account_id = item.get('stripeAccountId')
        if not stripe_account_id:
            print("No Stripe Customer ID found. Creating new customer...")

            # Create Stripe Customer
            customer = stripe.Customer.create(
                email=user_email,
                name=firstName
            )
            stripe_account_id = customer.id

            # Save stripeAccountId to DynamoDB
            wallet_table.update_item(
                Key={'userId': owner_id},
                UpdateExpression='SET stripeAccountId = :val1',
                ExpressionAttributeValues={':val1': stripe_account_id}
            ) 

            print(f"Created new Stripe customer: {stripe_account_id}")

        if not stripe_account_id:
            return _response(400, {'error': 'stripeAccountId not found for user'})

        print(f"Stripe Account ID: {stripe_account_id}")
        print(f"Raw event: {json.dumps(event)}")
        body = json.loads(event.get("body") or "{}")
        payment_method_id = body.get("paymentMethodId")
        set_as_default = body.get("setAsDefault", True)
        print(f"payment_method_id: ${payment_method_id}")
        
        if not payment_method_id:
            return _response(400, {"error": "Missing paymentMethodId in request body"})

        # Attach payment method to customer
        attached_pm = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=stripe_account_id
        )
        print(f"attached_pm: ${attached_pm}")
        if set_as_default:
            stripe.Customer.modify(
                stripe_account_id,
                invoice_settings={"default_payment_method": payment_method_id}
            )

        return _response(200, {
            "message": "Payment method added successfully",
            "paymentMethod": attached_pm
        })

    except Exception as e:
        return _response(500, {'error': str(e)})

def _response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
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