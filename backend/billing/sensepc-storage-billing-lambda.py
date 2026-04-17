import boto3
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_CEILING, ROUND_FLOOR, ROUND_HALF_UP
import os
import json
import stripe
from typing import List, Dict, Optional, Tuple

# Environment variables
TABLE_SMARTPC_STORAGE_METADATA = os.environ['TABLE_SMARTPC_STORAGE_METADATA']
TABLE_SMARTPC_STORAGE_BILLING = os.environ['TABLE_SMARTPC_STORAGE_BILLING']
TABLE_SMARTPC_STORAGE_PRICING = os.environ['TABLE_SMARTPC_STORAGE_PRICING']
TABLE_SMARTPC_STORAGE_CASHBACK_PRICING = os.environ['TABLE_SMARTPC_STORAGE_CASHBACK_PRICING']
TABLE_SMARTPC_STORAGE_JOB_HISTORY = os.environ['TABLE_SMARTPC_STORAGE_JOB_HISTORY']
TABLE_SMARTPC_WALLET = os.environ['TABLE_SMARTPC_WALLET']
TABLE_SMARTPC_NOTIFICATION = os.environ.get('TABLE_SMARTPC_NOTIFICATION', 'SmartPC-Notification')
TABLE_SMARTPC_USER = os.environ.get('TABLE_SMARTPC_USER', 'senseminder-user')
TABLE_SMARTPC_USER_AUDIT = os.environ.get('TABLE_SMARTPC_USER_AUDIT', 'SmartPCUserAudit')

NOTIFICATION_LAMBDA = os.environ['NOTIFICATION_LAMBDA_NAME']
SECRET_NAME = os.environ.get("STRIPE_SECRET_NAME", "stripe/api_key")
AWS_REGION = os.environ['AWSREGION']
BILLING_CYCLE_DAYS = int(os.environ.get("BILLING_CYCLE_DAYS", "30"))
JOB_NAME = "daily-storage-billing"
METADATA_USERID_INDEX_NAME = "userId-index"

# Auto-recharge processing fee configuration
PROCESSING_FEE_ENABLED = os.environ.get("PROCESSING_FEE_ENABLED", "true").lower() == "true"
PROCESSING_FEE_PERCENTAGE = Decimal(os.environ.get("PROCESSING_FEE_PERCENTAGE", "1"))  # percentage for non-US cards
NO_PROCESSING_FEE_COUNTRIES = os.environ.get("ALLOWED_COUNTRIES", "US").split(",")  # comma-separated country codes

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
lambda_client = boto3.client('lambda', region_name=AWS_REGION)

# DynamoDB tables
metadata_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_METADATA)
billing_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_BILLING)
pricing_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_PRICING)
cashback_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_CASHBACK_PRICING)
job_history_table = dynamodb.Table(TABLE_SMARTPC_STORAGE_JOB_HISTORY)
wallet_table = dynamodb.Table(TABLE_SMARTPC_WALLET)
user_table = dynamodb.Table(TABLE_SMARTPC_USER)
events_table = dynamodb.Table(TABLE_SMARTPC_USER_AUDIT)
notifications_table = dynamodb.Table(TABLE_SMARTPC_NOTIFICATION)


class WalletBalance:
    """Represents wallet balance components"""
    def __init__(self, balance: Decimal, cashback: Decimal, promo_balance: Decimal):
        self.balance = balance
        self.cashback = cashback
        self.promo_balance = promo_balance
        
    
    def get_total(self) -> Decimal:
        """Get total available balance"""
        return self.balance + self.cashback + self.promo_balance
    
    def is_sufficient(self, amount: Decimal) -> bool:
        """Check if total balance is sufficient for the amount"""
        return self.get_total() >= amount

class BillingResult:
    """Represents billing calculation result"""
    def __init__(self, peak_storage: int, net_storage: Decimal, bill_gb: Decimal, 
                 billing_amount: Decimal):
        self.peak_storage = peak_storage
        self.net_storage = net_storage
        self.bill_gb = bill_gb
        self.billing_amount = billing_amount
        self.promo_deduction = Decimal("0.00")
        self.cashback_deduction = Decimal("0.00")
        self.balance_deduction = Decimal("0.00")


def format_decimal_str(value: Decimal) -> str:
    """Format a numeric value to a string with exactly two decimal places.
    """
    # Convert to Decimal reliably
    if not isinstance(value, Decimal):
        value = Decimal(str(value))

    # Quantize with ROUND_HALF_UP for standard rounding (0.5 rounds up)
    return str(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))

def lambda_handler(event, context):
    """Main Lambda handler"""
    try:
        owner_team_map = build_owner_team_map()
        pricing_tiers = get_all_pricing_tiers()
        
        successful_teams = 0
        total_members_processed = 0
        failed_teams = 0
        
        for owner_id, team_members in owner_team_map.items():
            try:
                team_size = len(team_members)
                print(f"Processing team {successful_teams + 1}/{len(owner_team_map)} - Owner: {owner_id}, Members: {team_members} (Total: {team_size})")
                
                process_team_billing(owner_id, team_members, pricing_tiers)
                
                successful_teams += 1
                total_members_processed += team_size
                print(f"Team {owner_id} processed successfully")
                
            except Exception as team_error:
                print(f"Error processing team for owner {owner_id}: {team_error}")
                failed_teams += 1
                # Continue with other teams instead of failing completely
                continue

        print(f"Billing completed: {successful_teams} teams processed successfully, {failed_teams} teams failed, total members processed: {total_members_processed}")
    
    except Exception as e:
        print(f"Error in lambda_handler: {e}")
        raise

# ============= STRIPE CONFIGURATION =============

def get_stripe_api_key(secret_name: str, region_name: str = "us-east-1") -> str:
    """Retrieve Stripe API key from AWS Secrets Manager"""
    client = boto3.client("secretsmanager", region_name=region_name)
    
    try:
        response = client.get_secret_value(SecretId=secret_name)
        secret_string = response.get("SecretString")
        
        if not secret_string:
            raise ValueError("SecretString is empty or not found.")
        
        secret_data = json.loads(secret_string)
        return secret_data.get("stripe_secret_key")
    
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        raise

# Initialize Stripe
stripe.api_key = get_stripe_api_key(SECRET_NAME, AWS_REGION)

# ============= DATA RETRIEVAL FUNCTIONS =============

def get_all_users() -> List[str]:
    """Retrieve all unique user IDs from metadata table"""
    user_ids = set()
    last_evaluated_key = None

    while True:
        scan_params = {
            'IndexName': METADATA_USERID_INDEX_NAME,
            'ProjectionExpression': 'userId'
        }
        
        if last_evaluated_key:
            scan_params['ExclusiveStartKey'] = last_evaluated_key

        response = metadata_table.scan(**scan_params)

        for item in response['Items']:
            user_ids.add(item['userId'])

        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break

    return list(user_ids)

def get_all_pricing_tiers() -> List[Dict]:
    """Retrieve all pricing tiers sorted by lower limit"""
    response = pricing_table.scan()
    return sorted(response['Items'], key=lambda x: Decimal(x['lowerLimit']))

def get_last_billing(user_id: str) -> Optional[Dict]:
    """Get the most recent billing record for a user"""
    response = billing_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id),
        ScanIndexForward=False,
        Limit=1
    )
    return response['Items'][0] if response['Items'] else None

def get_user_files(user_id: str) -> List[Dict]:
    """Get all files for a user"""
    response = metadata_table.query(
        IndexName=METADATA_USERID_INDEX_NAME,
        KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
    )
    return response['Items']

def get_wallet_balance(user_id: str) -> WalletBalance:
    """Get wallet balance components for a user"""
    wallet = wallet_table.get_item(Key={'userId': user_id}).get('Item', {})
    
    balance = Decimal(wallet.get('balance', '0'))
    cashback = Decimal(wallet.get('cashback', '0'))
    promo_balance = Decimal(wallet.get('promoBalance', '0'))
    
    return WalletBalance(balance, cashback, promo_balance)

# ============= BILLING CALCULATION FUNCTIONS =============

def round_storage_gb(peak_storage_bytes: int) -> Decimal:
    """Round storage to nearest GB with 0.5 threshold"""
    gb_value = Decimal(peak_storage_bytes) / Decimal(1024 ** 3)
    fraction = gb_value - gb_value.quantize(Decimal('1.'), rounding=ROUND_FLOOR)

    if fraction <= Decimal('0.5'):
        return gb_value.quantize(Decimal('1.'), rounding=ROUND_FLOOR)
    else:
        return gb_value.quantize(Decimal('1.'), rounding=ROUND_CEILING)

def compute_peak_storage(files: List[Dict], start_time: datetime, 
                        end_time: datetime, net_storage: Decimal) -> Tuple[int, Decimal]:
    """Calculate peak storage usage and current net storage within time period"""
    timepoints = []

    for file_info in files:
        created = datetime.fromisoformat(file_info['createdAt']).replace(tzinfo=timezone.utc)
        deleted = (datetime.fromisoformat(file_info['deletedAt']).replace(tzinfo=timezone.utc) 
                  if file_info.get('deletedAt') else None)
        
        print(f'File: {file_info["fileName"]}, created: {created}, deleted: {deleted}')
        
        # Skip files created before billing period
        if deleted and deleted < start_time:
            continue

        # Add creation event if within period
        if 'size' in file_info and file_info['size']:
            if created < end_time:
                timepoints.append((created, int(file_info['size'])))
            
            # Add deletion event if within period
            if deleted and deleted < end_time:
                timepoints.append((deleted, -int(file_info['size'])))

    print(f'Timepoints: {timepoints}')
    
    # Sort by timestamp and calculate peak
    timepoints.sort()
    peak = 0
    current = 0
    
    for _, size_change in timepoints:
        current += size_change
        peak = max(peak, current)
    
    print(f'Peak: {peak}, current net storage: {current}')
    return int(peak), current

def calculate_billing_amount(total_gb: Decimal, pricing_tiers: List[Dict]) -> Decimal:
    """Calculate billing amount based on storage and pricing tiers"""
    max_upper_limit = Decimal('-1')
    max_tier = None

    # Find matching tier
    for tier in pricing_tiers:
        lower = Decimal(tier['lowerLimit'])
        upper = Decimal(tier['upperLimit'])
        price = Decimal(tier['pricePerGB'])

        if lower <= total_gb <= upper:
            return (price).quantize(Decimal('0.01'))

        if upper > max_upper_limit:
            max_upper_limit = upper
            max_tier = tier

    # Use highest tier if storage exceeds all limits
    if total_gb > max_upper_limit and max_tier:
        return (Decimal(max_tier['pricePerGB'])).quantize(Decimal('0.01'))

    return Decimal('0.00')

# ============= BILLING PROCESSING FUNCTIONS =============

def should_process_billing(user_id: str, start_time: datetime) -> bool:
    """Check if user should be billed based on billing cycle"""
    now = datetime.now(timezone.utc)
    days_elapsed = (now - start_time).days
    
    if days_elapsed < BILLING_CYCLE_DAYS:
        print(f'Billing cycle not completed for user {user_id}, days: {days_elapsed}')
        return False
    
    return True

def calculate_team_billing(owner_id: str, team_members: List[str], start_time: datetime, 
                          net_storage: Decimal, pricing_tiers: List[Dict]) -> BillingResult:
    """Calculate billing for a user"""
    now = datetime.now(timezone.utc)
    end_time = start_time + timedelta(days=BILLING_CYCLE_DAYS)
    
    print(f'Billing period: {start_time} to {end_time}')
    
    files = get_team_files(team_members)
    print(f'User {owner_id} has {len(files)} files')
    
    peak_storage, current_net_storage = compute_peak_storage(files, start_time, end_time, net_storage)
    
    bill_gb = round_storage_gb(peak_storage)
    billing_amount = calculate_billing_amount(bill_gb, pricing_tiers)
    billing_amount = billing_amount.quantize(Decimal('0.01'))
    
    print(f'Peak storage: {peak_storage}, Billable GB: {bill_gb}')
    
    return BillingResult(peak_storage, current_net_storage, bill_gb, billing_amount)

def deduct_from_wallet(wallet_balance: WalletBalance, billing_amount: Decimal, user_id: str, billing_result: BillingResult) -> WalletBalance:
    """Deduct billing amount from wallet balances in order: promo -> cashback -> balance"""
    remaining_amount = billing_amount
    
    # Deduct from promo_balance first
    promo_deduction = min(wallet_balance.promo_balance, remaining_amount)
    wallet_balance.promo_balance -= promo_deduction
    billing_result.promo_deduction = promo_deduction 
    remaining_amount -= promo_deduction
    if promo_deduction > 0:
        log_notification(user_id, f"Promo balance of ${promo_deduction} used for billing.", "info", "Promotional Balance used", "storage-billing-alert")
        log_promo_deductions(user_id, promo_deduction, JOB_NAME, "SUCCESS")
    
    # Then from cashback
    if remaining_amount > 0:
        cashback_deduction = min(wallet_balance.cashback, remaining_amount)
        wallet_balance.cashback -= cashback_deduction
        billing_result.cashback_deduction = cashback_deduction 
        remaining_amount -= cashback_deduction
        if cashback_deduction > 0:
            log_notification(user_id, f"Cashback balance of ${cashback_deduction} used for billing.", "info", "Cashback Balance used", "storage-billing-alert")
            log_cashback_deductions(user_id, cashback_deduction, JOB_NAME, "SUCCESS")
    
    # Finally from balance
    if remaining_amount > 0:
        balance_deduction = min(wallet_balance.balance, remaining_amount)
        wallet_balance.balance -= balance_deduction
        billing_result.balance_deduction = balance_deduction
        if balance_deduction > 0:
            log_notification(user_id, f"Wallet balance of ${balance_deduction} used for billing.", "info", "Wallet Deduction", "storage-billing-alert")
            log_deductions(user_id, balance_deduction, JOB_NAME, "SUCCESS")


    return wallet_balance

def attempt_auto_recharge(user_id: str, wallet_info: Dict, required_amount: Decimal,
                         current_balance: Decimal) -> bool:
    """Attempt auto recharge if enabled and configured"""
    auto_recharge = wallet_info.get('autoRecharge', 'false')
    print(f"Auto recharge setting for user {user_id}: {auto_recharge}")

    # Handle both boolean True and string "true"
    if auto_recharge not in [True, "true"]:
        print(f"Auto recharge not enabled for user {user_id}")
        return False
    
    stripe_account_id = wallet_info.get('stripeAccountId')
    if not stripe_account_id:
        print(f"No stripe account ID for user {user_id}")
        return False
    
    auto_recharge_amount = wallet_info.get('autoRechargeAmount', '0')
    
    # Use last successful recharge amount if no auto recharge amount set
    if not auto_recharge_amount or Decimal(auto_recharge_amount) <= 0:
        auto_recharge_amount = get_last_successful_wallet_recharge(stripe_account_id)
    
    recharge_amount = max(Decimal(str(auto_recharge_amount)), required_amount) - current_balance
    
    print(f"Attempting auto recharge for user {user_id}: {recharge_amount}")
    
    return auto_recharge_wallet(user_id, recharge_amount, stripe_account_id, current_balance)

def process_wallet_payment(user_id: str, billing_result: BillingResult) -> bool:
    """Process wallet payment including auto-recharge if needed"""

    billing_amount = billing_result.billing_amount
    if billing_amount <= Decimal('0.00'):
        # No payment needed, just update cashback
        return True
    
    # Get current wallet state
    wallet_info = wallet_table.get_item(Key={'userId': user_id}).get('Item', {})
    wallet_balance = get_wallet_balance(user_id)
    
    print(f'Current wallet - Balance: {wallet_balance.balance}, Cashback: {wallet_balance.cashback}, Promo: {wallet_balance.promo_balance}')
    
    # Check if sufficient funds available
    if not wallet_balance.is_sufficient(billing_amount):
        # Try auto recharge
        auto_recharge_success = attempt_auto_recharge(
            user_id, wallet_info, billing_amount, wallet_balance.get_total()
        )
        
        if not auto_recharge_success:
            print(f'Insufficient balance for user {user_id}: {wallet_balance.get_total()} < {billing_amount}')
            log_notification(user_id, f"Insufficient balance for billing of ${billing_amount}. Please recharge your wallet.", "error", "Insufficient Balance", "storage-billing-alert")
            log_job_history(user_id, datetime.now(timezone.utc), billing_amount, JOB_NAME, low_balance=True)
            send_insufficient_balance_notification(user_id, billing_amount, 'SMART_STORAGE_IN_SUFFICIENT_FUND', datetime.now(timezone.utc).isoformat())
            return False
        
        # Refresh wallet balance after recharge
        wallet_balance = get_wallet_balance(user_id)
        print(f'Balance after auto recharge: {wallet_balance.get_total()}')
    
    # Deduct from wallet balances
    updated_balance = deduct_from_wallet(wallet_balance, billing_amount, user_id, billing_result)
    
    # Update wallet in database
    update_wallet_balances(user_id, updated_balance)
    
    print(f'Payment processed - New balance: {updated_balance.balance}, Promo: {updated_balance.promo_balance}')
    return True

def update_wallet_balances(user_id: str, wallet_balance: Optional[WalletBalance]):
    """Update wallet balances in DynamoDB"""
    
    update_expression = "SET updatedTimestamp = :t, balance = :b, promoBalance = :p, cashback = :c"
    expression_values = {}
    expression_values[':t'] = datetime.now(timezone.utc).isoformat()
    # Ensure amounts are stored with two decimal places
    expression_values[':b'] = format_decimal_str(wallet_balance.balance)
    expression_values[':p'] = format_decimal_str(wallet_balance.promo_balance)
    expression_values[':c'] = format_decimal_str(wallet_balance.cashback)
    
    print(f'Updating wallet for user {user_id}: {expression_values}')
    
    wallet_table.update_item(
        Key={'userId': user_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values
    )
    


def save_billing_record(user_id: str, billing_result: BillingResult, 
                       start_time: datetime, end_time: datetime):
    """Save billing record to database"""
    billing_table.put_item(Item={
        'userId': user_id,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'billingAmount': format_decimal_str(billing_result.billing_amount),
        'startTime': start_time.isoformat(),
        'endTime': end_time.isoformat(),
        'maxStorage': billing_result.peak_storage,
        'netStorage': str(billing_result.net_storage),
        'billingPlan': 'monthly',
        'promoDeduction': format_decimal_str(billing_result.promo_deduction),
        'cashbackDeduction': format_decimal_str(billing_result.cashback_deduction),
        'balanceDeduction': format_decimal_str(billing_result.balance_deduction)
    })

def process_team_billing(owner_id: str, team_members: List[str], pricing_tiers: List[Dict]):
    """Main function to process billing for a team user"""
    try:
        now = datetime.now(timezone.utc)
        print(f"Processing billing for owner {owner_id}, date: {now}")

        
        # Get user's last billing entry
        last_billing = get_last_billing(owner_id)

        if last_billing:
            start_time = datetime.fromisoformat(last_billing['endTime'])
            net_storage = Decimal(last_billing.get('netStorage', 0))
        else:
            # First billing cycle - find first upload date
            net_storage = Decimal('0')
            files = get_team_files(team_members)
            print(f'User {owner_id} has {len(files)} files')
            
            if not files:
                    print(f'No files uploaded by user {owner_id}, skipping')
                    return
            
            start_time = min(
                datetime.fromisoformat(f['createdAt']).replace(tzinfo=timezone.utc) 
                for f in files
            )

        print(f'Billing start time: {start_time}')

        # Check if billing cycle is complete
        if not should_process_billing(owner_id, start_time):
            return

        # Calculate billing
        billing_result = calculate_team_billing(
            owner_id, team_members, start_time, net_storage, pricing_tiers
        )

        print(f'Billing result: - {billing_result.billing_amount}')
        # Process payment
        payment_success = process_wallet_payment(
            owner_id, billing_result
        )
        print(f'Payment success: {payment_success}')

        if payment_success:
            # Save billing record
            end_time = start_time + timedelta(days=BILLING_CYCLE_DAYS)
            save_billing_record(owner_id, billing_result, start_time, end_time)
            log_job_history(owner_id, now, billing_result.billing_amount, JOB_NAME)

        print(f'Completed processing for user {owner_id}')

    except Exception as e:
        print(f'Error processing user {owner_id}: {e}')
        

# ============= STRIPE AND PAYMENT FUNCTIONS =============

def get_last_successful_wallet_recharge(stripe_account_id: str) -> Decimal:
    """Get the amount of the last successful wallet recharge"""
    try:
        payment_intents = stripe.PaymentIntent.list(
            limit=100,
            customer=stripe_account_id
        )

        for pi in payment_intents.auto_paging_iter():
            if (pi.status == "succeeded" and 
                pi.metadata.get("type") in ["WALLET_RECHARGE", "AUTO_WALLET_RECHARGE"]):
                return Decimal(str(pi.amount)) / 100  # Convert cents to dollars

        print(f"No successful wallet recharges found for {stripe_account_id}")
        return Decimal("0.00")

    except Exception as e:
        print(f"Error fetching last wallet recharge for {stripe_account_id}: {e}")
        return Decimal("0.00")

def get_default_or_first_payment_method(stripe_customer_id: str) -> str:
    """Get default payment method or first available one"""
    try:
        # Check for default payment method
        customer = stripe.Customer.retrieve(stripe_customer_id)
        default_payment_method = customer.get("invoice_settings", {}).get("default_payment_method")

        if default_payment_method:
            return default_payment_method

        # Get first available payment method
        payment_methods = stripe.PaymentMethod.list(
            customer=stripe_customer_id,
            type="card",
            limit=1
        )

        if payment_methods.data:
            return payment_methods.data[0].id

        raise Exception("No payment method found for customer.")

    except Exception as e:
        print(f"Error fetching payment method: {e}")
        raise

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

def auto_recharge_wallet(user_id: str, recharge_amount: Decimal,
                        stripe_account_id: str, current_balance: Decimal) -> bool:
    """Perform auto recharge of wallet"""
    try:
        payment_method_id = get_default_or_first_payment_method(stripe_account_id)
        # Retrieve payment method to determine card country and display
        payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
        payment_method_display = get_payment_method_display(payment_method_id)

        # Determine card country (try common locations)
        card_country = None
        card = payment_method.get('card') or {}
        if card:
            card_country = card.get('country')
        if not card_country:
            billing_address = payment_method.get('billing_details', {}).get('address', {})
            card_country = billing_address.get('country')

        # Compute processing fee if enabled and card country is not in allowed list
        processing_fee = Decimal('0.00')
        if PROCESSING_FEE_ENABLED:
            if not card_country or card_country.strip().upper() not in NO_PROCESSING_FEE_COUNTRIES:
                processing_fee = (recharge_amount * PROCESSING_FEE_PERCENTAGE) / Decimal("100")
                processing_fee = processing_fee.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        charge_amount = (recharge_amount + processing_fee).quantize(Decimal('0.01'))
        amount_cents = int(charge_amount * 100)

        print(f"Auto recharging {user_id}: wallet amount ${recharge_amount}, processing fee ${processing_fee}, charging ${charge_amount} using {payment_method_id}")
        card_country = card_country or "UNKNOWN"
        # Create and confirm payment intent for total charge (recharge + processing fee)
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            customer=stripe_account_id,
            payment_method=payment_method_id,
            off_session=True,
            confirm=True,
            metadata={
                "type": "AUTO_WALLET_RECHARGE", 
                      "cardCountry": card_country,
                      "processingFee": str(processing_fee)
                      }
        )

        # Update wallet balance only with the recharge amount (processing fee is not added to wallet)
        new_balance = current_balance + recharge_amount
        wallet_table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET balance = :b, updatedTimestamp = :u",
            ExpressionAttributeValues={
                ":b": format_decimal_str(new_balance),
                ":u": datetime.now(timezone.utc).isoformat()
            }
        )

        # Log with processing fee info
        log_recharge_wallet(user_id, float(recharge_amount), payment_method_id, payment_intent.id, "SUCCESS", payment_method_display=payment_method_display, card_country=card_country, processing_fee=processing_fee)
        content = f"Your wallet has been auto-recharged with ${recharge_amount}."
        if processing_fee > 0:
            content = f"Wallet recharge of ${recharge_amount} was successful (${processing_fee} processing fee applied). New balance: ${new_balance}"
        print(f"Auto recharge content: {content}")
        log_notification(user_id, content, "info", "Wallet Recharged", "wallet-alert")
        print(f"Auto recharge successful for {user_id}. New balance: {new_balance}")
        return True

    except stripe.error.StripeError as e:
        error_msg = e.user_message or str(e)
        print(f"Stripe error for {user_id}: {error_msg}")
        log_recharge_wallet(user_id, float(recharge_amount), "", None, "FAILED", error=error_msg)
        log_notification(user_id, f"Auto-recharging of ${recharge_amount} failed.", "error", "Auto-Recharge Failed", "wallet-alert")
        return False

    except Exception as e:
        error_msg = str(e)
        print(f"Error auto recharging {user_id}: {error_msg}")
        log_notification(user_id, f"Auto-recharging of ${recharge_amount} failed.", "error", "Auto-Recharge Failed", "wallet-alert")
        log_recharge_wallet(user_id, float(recharge_amount), "", None, "FAILED", error=error_msg)
        return False

# ============= LOGGING AND NOTIFICATION FUNCTIONS =============

def log_job_history(user_id: str, timestamp: datetime, amount: Decimal, 
                   job_name: str, low_balance: bool = False):
    """Log job execution to history table"""
    entry = {
        'userId': user_id,
        'timestamp': timestamp.isoformat(),
        'billingAmount': format_decimal_str(amount),
        'jobName': job_name,
        'status': 'INSUFFICIENT_BALANCE' if low_balance else 'SUCCESS'
    }
    
    if low_balance:
        entry['lastLowBalanceAlert'] = timestamp.isoformat()
    
    job_history_table.put_item(Item=entry)

def send_insufficient_balance_notification(user_id: str, billing_amount: Decimal, 
                                         action: str, target_date: str):
    """Send notification for insufficient balance"""
    payload = {
        'billing_amount': format_decimal_str(billing_amount),
        'user_id': user_id,
        'action': action,
        'target_date': target_date
    }
    
    lambda_client.invoke(
        FunctionName=NOTIFICATION_LAMBDA,
        InvocationType='Event',
        Payload=json.dumps(payload)
    )

def log_event(user_id: str, event_type: str, details: Dict, status: str = "SUCCESS"):
    """Log event to audit table"""
    item = {
        'userId': user_id,
        'eventTimestamp': datetime.now(timezone.utc).isoformat(),
        'eventType': event_type,
        'details': details,
        'status': status
    }
    events_table.put_item(Item=item)

def log_recharge_wallet(user_id: str, amount: float, payment_method_id: str, payment_intent_id: Optional[str] = None,
                       status: str = "SUCCESS", error: str = None, payment_method_display: Optional[str] = None,
                       card_country: str = None, processing_fee: Optional[Decimal] = None):
    """Log wallet recharge event

    `amount` may be a float or Decimal; store as 2-decimal string.
    """
    # Ensure Decimal formatting
    amt_dec = Decimal(str(amount)) if not isinstance(amount, Decimal) else amount
    details = {
        "amount": format_decimal_str(amt_dec),
        "paymentMethodId": payment_method_id,
        "rechargeType": "AUTO_RECHARGE"
    }
    if payment_intent_id:
        details["paymentIntentId"] = payment_intent_id

    if payment_method_display:
        details["paymentMethodDisplay"] = payment_method_display

    if processing_fee and isinstance(processing_fee, Decimal):
        details["processingFee"] = format_decimal_str(processing_fee)
    if card_country:
        details["cardCountry"] = card_country

    if error:
        details["error"] = error

    log_event(user_id, "RECHARGE_WALLET", details, status)

def log_promo_deductions(user_id: str, amount: Decimal, instance_id: str, 
                        status: str = "SUCCESS", err: str = None):
    # normalize amount to Decimal and format
    details = {
        "amount": format_decimal_str(amount),
        "instanceId": instance_id
    }
    if err:
        details["error"] = err
    log_event(user_id, "PROMO_DEDUCTION", details, status)

def log_cashback_deductions(user_id: str, amount: Decimal, instance_id: str, 
                            status: str = "SUCCESS", err: str = None):
    details = {
        "amount": format_decimal_str(amount),
        "instanceId": instance_id
    }
    if err:
        details["error"] = err
    log_event(user_id, "CASHBACK_DEDUCTION", details, status)

def log_deductions(user_id: str, amount: Decimal, instance_id: str, 
                            status: str = "SUCCESS", err: str = None):
    details = {
        "amount": format_decimal_str(amount),
        "instanceId": instance_id
    }
    if err:
        details["error"] = err
    log_event(user_id, "BALANCE_DEDUCTION", details, status)
    
def log_notification(user_id: str, content: str, severity: str, title: str = "Notification", type: str = "storage-billing"):
        now = datetime.now(timezone.utc).isoformat()
        item = {
            "userId": user_id,
            "timestamp": now,
            "content": content,
            "route": "/dashboard/billing",
            "severity": severity,
            "title": title,
            "type": type
        }
        notifications_table.put_item(Item=item)

def build_owner_team_map() -> Dict[str, List[str]]:
    """
    Build a map of owner_id to list of team members (including owner).
    
    Logic:
    1. Scan all users from senseminder-user table
    2. For each user, determine their effective owner_id:
       - If role='owner' OR owner_id is empty/missing: user_id becomes the owner_id
       - If role='admin'/'member' AND owner_id exists: use the owner_id
    3. Group all users under their respective owners
    
    Returns:
    Dict[str, List[str]]: {owner_id: [list_of_team_member_ids_including_owner]}
    
    Example output:
    {
        'owner123': ['owner123', 'admin456', 'member789'],
        'owner999': ['owner999']  # Owner with no team
    }
    """
    owner_team_map = {}
    processed_users = set()
    
    try:
        print("Building owner team map from senseminder-user table...")
        
        # Scan the user table to get all users with pagination
        scan_params = {
            'ProjectionExpression': 'id, owner_id, #role',
            'ExpressionAttributeNames': {'#role': 'role'}  # role is reserved keyword
        }
        
        all_users = []
        
        while True:
            response = user_table.scan(**scan_params)
            all_users.extend(response.get('Items', []))
            
            # Handle pagination
            if 'LastEvaluatedKey' not in response:
                break
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
        
        print(f"Found {len(all_users)} total users in the system")
        
        # First pass: Identify all owners and initialize their teams
        owners_found = set()
        
        for user in all_users:
            user_id = user.get('id')
            owner_id = user.get('owner_id')
            role = user.get('role', '').lower()
            
            if not user_id:
                print(f"Skipping user with missing id: {user}")
                continue
            
            # Determine if this user is an effective owner
            is_owner = False
            effective_owner_id = None
            
            if role == 'owner':
                # Explicit owner role
                is_owner = True
                effective_owner_id = user_id
                print(f"User {user_id} is explicit owner")
            elif not owner_id or owner_id.strip() == '':
                # No owner_id means this user is an owner
                is_owner = True
                effective_owner_id = user_id
                print(f"User {user_id} has no owner_id, treating as owner")
            else:
                # User has owner_id and is admin/member
                effective_owner_id = owner_id
                print(f"User {user_id} (role: {role}) belongs to owner {owner_id}")
            
            # Initialize owner's team if not exists
            if effective_owner_id not in owner_team_map:
                owner_team_map[effective_owner_id] = []
                if is_owner:
                    owners_found.add(effective_owner_id)
            
            # Add user to their owner's team
            if user_id not in owner_team_map[effective_owner_id]:
                owner_team_map[effective_owner_id].append(user_id)
                processed_users.add(user_id)
        
        print(f"Owners found: {owners_found}")
        print(f"Processed users: {len(processed_users)}")
        
        # Validate and clean up the mapping
        validated_map = {}
        
        for owner_id, team_members in owner_team_map.items():
            if not team_members:
                print(f"Warning: Owner {owner_id} has no team members, skipping")
                continue
            
            # Ensure owner is in their own team list
            if owner_id not in team_members:
                print(f"Adding owner {owner_id} to their own team")
                team_members.append(owner_id)
            
            # Remove duplicates and sort
            unique_members = list(set(team_members))
            validated_map[owner_id] = sorted(unique_members)
            
            print(f"Owner {owner_id} team: {validated_map[owner_id]} ({len(unique_members)} members)")
        
        print(f"Final owner team map: {len(validated_map)} teams")
        return validated_map
        
    except Exception as e:
        print(f"Error building owner team map: {e}")
        print("Returning empty map - will fall back to individual billing")
        return {}

def build_owner_team_map() -> Dict[str, List[str]]:
    """
    Build a map of owner_id to list of team members (including owner).
    
    Logic:
    1. Scan all users from senseminder-user table
    2. For each user, determine their effective owner_id:
       - If role='owner' OR owner_id is empty/missing: user_id becomes the owner_id
       - If role='admin'/'member' AND owner_id exists: use the owner_id
    3. Group all users under their respective owners
    
    Returns:
    Dict[str, List[str]]: {owner_id: [list_of_team_member_ids_including_owner]}
    
    Example output:
    {
        'owner123': ['owner123', 'admin456', 'member789'],
        'owner999': ['owner999']  # Owner with no team
    }
    """
    owner_team_map = {}
    processed_users = set()
    
    try:
        print("Building owner team map from senseminder-user table...")
        
        # Scan the user table to get all users with pagination
        scan_params = {
            'ProjectionExpression': 'id, owner_id, #role',
            'ExpressionAttributeNames': {'#role': 'role'}  # role is reserved keyword
        }
        
        all_users = []
        
        while True:
            response = user_table.scan(**scan_params)
            all_users.extend(response.get('Items', []))
            
            # Handle pagination
            if 'LastEvaluatedKey' not in response:
                break
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
        
        print(f"Found {len(all_users)} total users in the system")
        
        # First pass: Identify all owners and initialize their teams
        owners_found = set()
        
        for user in all_users:
            user_id = user.get('id')
            owner_id = user.get('owner_id')
            role = user.get('role', '').lower()
            
            if not user_id:
                print(f"Skipping user with missing id: {user}")
                continue
            
            # Determine if this user is an effective owner
            is_owner = False
            effective_owner_id = None
            
            if role == 'owner':
                # Explicit owner role
                is_owner = True
                effective_owner_id = user_id
                print(f"User {user_id} is explicit owner")
            elif not owner_id or owner_id.strip() == '':
                # No owner_id means this user is an owner
                is_owner = True
                effective_owner_id = user_id
                print(f"User {user_id} has no owner_id, treating as owner")
            else:
                # User has owner_id and is admin/member
                effective_owner_id = owner_id
                print(f"User {user_id} (role: {role}) belongs to owner {owner_id}")
            
            # Initialize owner's team if not exists
            if effective_owner_id not in owner_team_map:
                owner_team_map[effective_owner_id] = []
                if is_owner:
                    owners_found.add(effective_owner_id)
            
            # Add user to their owner's team
            if user_id not in owner_team_map[effective_owner_id]:
                owner_team_map[effective_owner_id].append(user_id)
                processed_users.add(user_id)
        
        print(f"Owners found: {owners_found}")
        print(f"Processed users: {len(processed_users)}")
        
        # Validate and clean up the mapping
        validated_map = {}
        
        for owner_id, team_members in owner_team_map.items():
            if not team_members:
                print(f"Warning: Owner {owner_id} has no team members, skipping")
                continue
            
            # Ensure owner is in their own team list
            if owner_id not in team_members:
                print(f"Adding owner {owner_id} to their own team")
                team_members.append(owner_id)
            
            # Remove duplicates and sort
            unique_members = list(set(team_members))
            validated_map[owner_id] = sorted(unique_members)
            
            print(f"Owner {owner_id} team: {validated_map[owner_id]} ({len(unique_members)} members)")
        
        print(f"Final owner team map: {len(validated_map)} teams")
        return validated_map
        
    except Exception as e:
        print(f"Error building owner team map: {e}")
        print("Returning empty map - will fall back to individual billing")
        return {}
    
def get_team_files(team_members: List[str]) -> List[Dict]:
    """
    Get all files for all team members combined.
    
    Args:
        team_members: List of user IDs in the team
    
    Returns:
        List[Dict]: Combined list of all files from all team members
    """
    all_files = []
    file_count_by_user = {}
    
    for user_id in team_members:
        try:
            user_files = get_user_files(user_id)
            file_count_by_user[user_id] = len(user_files)
            all_files.extend(user_files)
            
            print(f"User {user_id}: {len(user_files)} files")
            
        except Exception as e:
            print(f"Error getting files for user {user_id}: {e}")
            file_count_by_user[user_id] = 0
    
    print(f"Team file summary: {file_count_by_user}")
    print(f"Total team files: {len(all_files)}")
    
    # Log team storage breakdown
    total_size = sum(int(f.get('size', 0)) for f in all_files if f.get('size'))
    total_size_gb = total_size / (1024 ** 3)
    print(f"Total team storage: {total_size_gb:.2f} GB")
    
    return all_files
    