import os
import json
import boto3
import stripe
from datetime import datetime

# Initialize Strip
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
            return _response(403, {"message": "Members and Admins are not allowed to set default payment method"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Parse request body
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body)

        print(f"Event body: {body}")
        payment_method_id = body.get('paymentMethodId')

        if not owner_id or not payment_method_id:
            return _response(400, {'error': 'userId and paymentMethodId are required'})

        # Fetch user wallet info from DynamoDB
        response = wallet_table.get_item(Key={'userId': owner_id})
        item = response.get('Item')
        if not item:
            return _response(404, {'error': 'User not found'})

        stripe_account_id = item.get('stripeAccountId')
        if not stripe_account_id:
            return _response(400, {'error': 'stripeAccountId not found for user'})

        # Attach the payment method to the customer if not already
        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=stripe_account_id
        )

        # Set it as default
        stripe.Customer.modify(
            stripe_account_id,
            invoice_settings={
                'default_payment_method': payment_method_id
            }
        )
        log_set_default_payment_method(owner_id, payment_method_id)
        return _response(200, {
            'message': 'Default payment method updated successfully',
            'userId': owner_id,
            'defaultPaymentMethod': payment_method_id
        })

    except stripe.error.InvalidRequestError as e:
        print(f"InvalidRequestError: {str(e)}")
        log_set_default_payment_method(owner_id, payment_method_id, status="FAILED", err=str(e))
        return _response(400, {'error': f'Stripe error: {str(e)}'})
    except Exception as e:
        print(f"Error: {str(e)}")
        log_set_default_payment_method(owner_id, payment_method_id, status="FAILED", err=str(e))
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

def log_set_default_payment_method(user_id: str, payment_method_id: str, status: str = "SUCCESS", err: str = None):
    details = {
        "paymentMethodId": payment_method_id
    }

    if err:
        details["error"] = err

    log_event(
        user_id=user_id,
        event_type="SET_DEFAULT_PAYMENT_METHOD",
        status=status,
        details=details
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