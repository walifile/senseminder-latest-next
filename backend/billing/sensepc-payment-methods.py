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
dynamodb = boto3.resource('dynamodb', region_name=region)
wallet_table = dynamodb.Table('SmartPCWallet')

def lambda_handler(event, context):

    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})

    
    try:
        print(f"Raw event: {json.dumps(event)}")
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')
        firstName = claims.get('custom:firstName') or claims.get('firstName')
        
        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})

        print(f"User ID: {user_id}")

        if not is_action_allowed(user_role):
            return _response(403, {"message": "Members are not allowed to retrieve Payment methods"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Fetch user wallet info from DynamoDB
        response = wallet_table.get_item(Key={'userId': owner_id})
        item = response.get('Item')
        if not item:
            return _response(404, {'error': 'User not found'})

        stripe_account_id = item.get('stripeAccountId')
        print(f"stripe_account_id {stripe_account_id}")
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
        # Fetch customer details from Stripe
        customer = stripe.Customer.retrieve(stripe_account_id)
        print(f"Stripe Customer: {customer}")

        # Fetch all card-type payment methods
        payment_methods = stripe.PaymentMethod.list(
            customer=stripe_account_id,
            type="card"
        )
        print(f"Stripe Payment Methods: {payment_methods}")
        
        # Retrieve default payment method ID from customer
        default_pm_id = customer.get('invoice_settings', {}).get('default_payment_method')
        print(f"Default Payment Method ID: {default_pm_id}")

        # Get full default payment method object (optional but more useful)
        default_payment_method = None
        if default_pm_id:
            default_payment_method = stripe.PaymentMethod.retrieve(default_pm_id)

        print(f"Default Payment Method: {default_payment_method}")
        return _response(200, {
            'userId': owner_id,
            'paymentMethods': payment_methods.data,
            'defaultPaymentMethod': default_payment_method
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

def is_action_allowed(role):
    """
    Checks if the current user is owner and admin
    - Returns True if user has owner role and admin role
    - Returns False  
    """
    print("[DEBUG] Checking access control for role:", role)
    if not role:
        print("[DEBUG] No user identity provided — Stop here")
        return False

    # Resolve ownerId based on role
    return True if role == "owner" or role == "admin" else False

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")