from stripe_service import StripeService
import stripe
import boto3
import os
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from typing import Optional
from audit_service import AuditService
from data_service import WalletInfo
from notification_service import NotificationService
from billing_calculation_service import BillingPeriodResult, format_decimal_str


# Auto-recharge processing fee configuration
PROCESSING_FEE_ENABLED = os.environ.get("PROCESSING_FEE_ENABLED", "true").lower() == "true"
PROCESSING_FEE_PERCENTAGE = Decimal(os.environ.get("PROCESSING_FEE_PERCENTAGE", "1"))  # percentage for non-US cards
NO_PROCESSING_FEE_COUNTRIES = [c.strip().upper() for c in os.environ.get("ALLOWED_COUNTRIES", "US").split(",")]


class WalletService:
    def __init__(self, stripe_service: StripeService, notification_service: NotificationService, region: str, wallet_table_name: str):
        self.stripe_service = stripe_service
        self.notification_service = notification_service
        self.dynamodb = boto3.resource("dynamodb", region_name=region)
        self.wallet_table_name = wallet_table_name
    
    def get_payment_method_display(self, payment_method_id: str) -> Optional[str]:
   
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
        
    def auto_recharge_wallet(self, user_id: str, recharge_amount: Decimal, stripe_account_id: str, 
                           current_balance: Decimal) -> bool:
        try:
            payment_method_id = self.stripe_service.get_default_or_first_payment_method(stripe_account_id)
            payment_method_display = self.get_payment_method_display(payment_method_id)

            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)

            # determine processing fee applicability
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
                print(f"Processing fee enabled. Card country: {card_country}")
                if not card_country or card_country.strip().upper() not in NO_PROCESSING_FEE_COUNTRIES:
                    processing_fee = (recharge_amount * PROCESSING_FEE_PERCENTAGE) / Decimal("100")
                    processing_fee = processing_fee.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            print(f"Processing fee of {format_decimal_str(processing_fee)} will be applied to the recharge amount of {format_decimal_str(recharge_amount)}.")

            total_charge = (recharge_amount + processing_fee).quantize(Decimal('0.01'))
            amount = int(total_charge * 100)

            print(f"Auto recharging {user_id}: wallet amount ${recharge_amount}, processing fee ${processing_fee}, charging ${total_charge} using {payment_method_id}")
            card_country = card_country or "UNKNOWN"
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
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

            # credit only the requested recharge amount to the wallet (processing fee is charged but not credited)
            new_balance = current_balance + recharge_amount
            wallet_table = self.dynamodb.Table(self.wallet_table_name)
            wallet_table.update_item(
                Key={"userId": user_id},
                UpdateExpression="SET balance = :b, updatedTimestamp = :u",
                ExpressionAttributeValues={
                    ":b": format_decimal_str(new_balance),
                    ":u": datetime.now(timezone.utc).isoformat()
                }
            )
            
            AuditService.log_recharge_wallet(user_id, recharge_amount, payment_method_id, payment_intent.id, "SUCCESS", payment_method_display=payment_method_display, card_country=card_country, processing_fee=processing_fee)
            content = f"Your wallet has been auto-recharged with ${recharge_amount}."
            if processing_fee > 0:
                content = f"Wallet recharge of ${recharge_amount} was successful (${processing_fee} processing fee applied). New balance: ${new_balance}"
            print(f"Auto recharge content: {content}")
    
            self.notification_service.log_notification(user_id, content, "info", "Wallet Recharged", "wallet-alert")
            print(f"Recharged user {user_id} successfully. New balance: {new_balance}")
            return True
        except Exception as ex:
            print(f"Error recharging user {user_id}: {str(ex)}")
            AuditService.log_recharge_wallet(user_id, recharge_amount, "", None, "FAILED", err=str(ex))
            self.notification_service.log_notification(
                user_id,
                f"Auto-recharge of ${recharge_amount} failed.", "error", f"Auto recharge failed", "billing-alert")
            return False

    def deduct_from_wallet(self, user_id: str, wallet_info: WalletInfo, billing_amount: Decimal, system_name: str, instance_id: str, billing_result: BillingPeriodResult) -> bool:
        """Deduct billing amount from wallet, prioritizing promo balance, then cashback, then wallet balance."""
        remaining_amount = billing_amount
        new_balance = wallet_info.balance
        new_promo_balance = wallet_info.promo_balance
        new_cashback_balance = wallet_info.cashback

        # Step 1: Deduct from promo balance first
        if wallet_info.promo_balance > 0 and remaining_amount > 0:
            promo_deduction = min(wallet_info.promo_balance, remaining_amount)
            new_promo_balance = wallet_info.promo_balance - promo_deduction
            billing_result.promo_deduction = promo_deduction
            remaining_amount -= promo_deduction
            
            # Log promo deduction
            AuditService.log_promo_deductions(user_id, promo_deduction, instance_id, "SUCCESS")
            self.notification_service.log_notification(user_id, f"Promo balance of ${format_decimal_str(promo_deduction)} used for billing '{system_name}' PC.", "info", "Promotional Balance used", "billing-alert")

        # Step 2: Deduct from cashback balance next
        if wallet_info.cashback > 0 and remaining_amount > 0:
            cashback_deduction = min(wallet_info.cashback, remaining_amount)
            new_cashback_balance = wallet_info.cashback - cashback_deduction
            billing_result.cashback_deduction = cashback_deduction
            remaining_amount -= cashback_deduction
            
            # Log cashback deduction
            AuditService.log_cashback_deductions(user_id, cashback_deduction, instance_id, "SUCCESS")
            self.notification_service.log_notification(user_id, f"Cashback balance of ${format_decimal_str(cashback_deduction)} used for billing '{system_name}' PC.", "info", "Cashback Balance used", "billing-alert")

        # Step 3: Deduct remaining amount from wallet balance
        if remaining_amount > 0:
            new_balance = wallet_info.balance - remaining_amount
            billing_result.balance_deduction = remaining_amount

        # Update wallet in database
        wallet_table = self.dynamodb.Table(self.wallet_table_name)
        wallet_table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET balance = :b, promoBalance = :pb, cashback = :cb, updatedTimestamp = :t',
            ExpressionAttributeValues={
                ':b': Decimal(format_decimal_str(new_balance)),
                ':pb': Decimal(format_decimal_str(new_promo_balance)),
                ':cb': Decimal(format_decimal_str(new_cashback_balance)),
                ':t': datetime.now(timezone.utc).isoformat()
            }
        )
        if remaining_amount > 0:
            AuditService.log_deductions(user_id, (wallet_info.balance - remaining_amount), instance_id, "SUCCESS")
            self.notification_service.log_notification(user_id, f"${format_decimal_str(remaining_amount)} deducted from wallet for '{system_name}' PC.", "info", "Wallet Deduction", "billing-alert")    
        

        return True

    def deduct_ami_storage(self, user_id: str, wallet_info: WalletInfo, total_amount: Decimal, template_count: int) -> dict:
        """Deduct AMI template storage cost from wallet."""
        if total_amount <= 0:
            return {"promo_deduction": Decimal('0'), "cashback_deduction": Decimal('0'), "balance_deduction": Decimal('0')}

        remaining_amount = total_amount
        new_balance = wallet_info.balance
        new_promo_balance = wallet_info.promo_balance
        new_cashback_balance = wallet_info.cashback
        
        promo_deduction = Decimal('0')
        cb_deduction = Decimal('0')

        # Step 1: Promo balance
        if wallet_info.promo_balance > 0 and remaining_amount > 0:
            promo_deduction = min(wallet_info.promo_balance, remaining_amount)
            new_promo_balance = wallet_info.promo_balance - promo_deduction
            remaining_amount -= promo_deduction
            AuditService.log_promo_deductions(user_id, promo_deduction, "AMI_TEMPLATES", "SUCCESS")

        # Step 2: Cashback
        if wallet_info.cashback > 0 and remaining_amount > 0:
            cb_deduction = min(wallet_info.cashback, remaining_amount)
            new_cashback_balance = wallet_info.cashback - cb_deduction
            remaining_amount -= cb_deduction
            AuditService.log_cashback_deductions(user_id, cb_deduction, "AMI_TEMPLATES", "SUCCESS")

        # Step 3: Main balance
        if remaining_amount > 0:
            new_balance = wallet_info.balance - remaining_amount

        # Update DynamoDB
        wallet_table = self.dynamodb.Table(self.wallet_table_name)
        wallet_table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET balance = :b, promoBalance = :pb, cashback = :cb, updatedTimestamp = :t',
            ExpressionAttributeValues={
                ':b': Decimal(format_decimal_str(new_balance)),
                ':pb': Decimal(format_decimal_str(new_promo_balance)),
                ':cb': Decimal(format_decimal_str(new_cashback_balance)),
                ':t': datetime.now(timezone.utc).isoformat()
            }
        )

        if remaining_amount > 0:
            AuditService.log_deductions(user_id, (wallet_info.balance - remaining_amount), "AMI_TEMPLATES", "SUCCESS")

        return {
            "promo_deduction": promo_deduction,
            "cashback_deduction": cb_deduction,
            "balance_deduction": total_amount - promo_deduction - cb_deduction
        }