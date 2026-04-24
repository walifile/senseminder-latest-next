import os
import boto3
from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from data_service import DataService, WalletInfo
from stripe_service import StripeService
from billing_calculation_service import BillingCalculationService, BillingPeriodResult, format_decimal_str
from notification_service import NotificationService
from instance_management_service import InstanceManagementService
from wallet_service import WalletService
from grace_period_service import GracePeriodService
from promo_pc_lifecycle_service import PromoInstancePolicyService
from discount_campaign_service import apply_campaign_discount
from dataclasses import dataclass
import traceback


@dataclass
class InstanceBillingData:
    instance_id: str
    user_id: str
    system_name: str
    config_id: str
    region_code: str
    storage_size: int
    plan_type: str
    pc_config: Dict[str, Any]
    events: List[Dict[str, Any]]
    billing_plan: Dict[str, Any]
    pricing_match: Dict[str, Any]
    storage_pricing_match: Dict[str, Any]
    default_auto_recharge_amount: Decimal = Decimal("20.0")
    auto_renew: bool = True


TABLE_SMARTPC_WALLET = os.environ['TABLE_SMARTPC_WALLET']
TABLE_SMARTPC_NOTIFICATION = os.environ['TABLE_SMARTPC_NOTIFICATION']
NOTIFICATION_LAMBDA_NAME = os.environ['NOTIFICATION_LAMBDA_NAME']
VM_MAINTAINANCE_LAMBDA_NAME = os.environ['VM_MAINTAINANCE_LAMBDA_NAME']
TABLE_JOB_HISTORY = os.environ['TABLE_JOB_HISTORY']
TABLE_SMARTPC_BILLING = os.environ['TABLE_SMARTPC_BILLING']
TABLE_SMARTPC_RESOURCE = os.environ['TABLE_SMARTPC_RESOURCE']
FRONTEND_URL = os.environ.get("FRONTEND_URL")

class BillingService:
    def __init__(self, region: str, secret_name: str):
        self.data_service = DataService(region)
        self.stripe_service = StripeService(region=region, secret_name=secret_name)
        self.calculation_service = BillingCalculationService()
        self.notification_service = NotificationService(region_name=region, notifications_table_name=TABLE_SMARTPC_NOTIFICATION, notification_lambda_name=NOTIFICATION_LAMBDA_NAME)
        self.wallet_service = WalletService(self.stripe_service, self.notification_service, region, TABLE_SMARTPC_WALLET)
        self.instance_mgmt_service = InstanceManagementService(region_name=region, vm_maintainance_lamda_name=VM_MAINTAINANCE_LAMBDA_NAME)
        self.grace_period_service = GracePeriodService()
        self.promo_instance_policy_service = PromoInstancePolicyService()
        self.dynamodb = boto3.resource("dynamodb", region_name=region)

    def prepare_instance_data(self, instance: Dict[str, Any], config_map: Dict[str, Any], 
                            pricing_data: List[Dict[str, Any]], 
                            storage_pricing_data: List[Dict[str, Any]]) -> Optional[InstanceBillingData]:
        """Prepare all necessary data for billing an instance."""
        instance_id = instance['resourceId']
        
        try:
            # Get basic instance info
            config_id = instance['configId']
            region_code = instance.get('region')
            if not region_code:
                print(f"No region code found for instance {instance_id}")
                return None

            pc_config = config_map.get(config_id)
            if not pc_config:
                print(f"No config found for instance {instance_id}")
                return None

            # Get events and check for termination
            events = self.data_service.get_instance_events(instance_id)
            event_types = [e['action'] for e in events]
            if any(e in ['terminate', 'delete'] for e in event_types):
                print(f"Instance {instance_id} has termination event, skipping")
                return None

            # Get billing plan
            billing_plan = self.data_service.get_billing_plan(instance_id)
            if not billing_plan:
                print(f"No billing plan found for instance {instance_id}")
                return None

            # Get user info
            user_id, system_name = self.data_service.get_user_id_and_system_name(instance_id)
            if not user_id:
                print(f"No user ID found for instance {instance_id}")
                return None

            # Get pricing info
            storage_size = int(instance.get('storageSize', 0))

            pricing_match = next(
                (p for p in pricing_data if p['region'] == region_code and p['configId'] == config_id),
                None
            )
            storage_pricing_match = next(
                (s for s in storage_pricing_data if s['region'] == region_code and s.get('size') == storage_size),
                None
            )

            if not pricing_match or not storage_pricing_match:
                print(f"No pricing match found for instance {instance_id}")
                return None

            default_auto_recharge_amount = Decimal(os.environ.get('DEFAULT_AUTO_RECHARGE_AMOUNT', '20.0'))

            return InstanceBillingData(
                instance_id=instance_id,
                user_id=user_id,
                system_name=system_name,
                config_id=config_id,
                region_code=region_code,
                storage_size=storage_size,
                plan_type=billing_plan['billingPlan'],
                pc_config=pc_config,
                events=events,
                billing_plan=billing_plan,
                pricing_match=pricing_match,
                storage_pricing_match=storage_pricing_match,
                default_auto_recharge_amount=default_auto_recharge_amount,
                auto_renew=instance.get('autoRenew', True)
            )
        except Exception as e:
            print(f"Error preparing data for instance {instance_id}: {e}")
            return None

    def get_billing_timestamps(self, get_last_billing) -> Tuple[datetime, datetime, str]:
        """Get the timestamps for the last billing job."""
        last_job_timestamp = None
        last_billing_plan = None
        last_job_start_timestamp = None

        if get_last_billing:
            last_job_timestamp = get_last_billing.get('endTime')
            last_job_start_timestamp = get_last_billing.get('startTime')
            last_billing_plan = get_last_billing.get('billingPlan')
        
        return BillingCalculationService.to_utc_datetime(last_job_timestamp), BillingCalculationService.to_utc_datetime(last_job_start_timestamp), last_billing_plan


    def handle_advance_alert_for_grace_period(self, billing_data: InstanceBillingData, billing_result: BillingPeriodResult,
                           wallet_info: WalletInfo, now: datetime, last_billing_plan: str, job_history:Optional[Dict[str, Any]]) -> bool:
        """Handle advance billing alerts for instances nearing billing period."""
        advance_alert = False
        last_job_duration = None

        if not billing_result.billing_started:
            if self.grace_period_service.should_send_advance_alert(last_billing_plan, billing_result.storage_running_duration):
                advance_alert = True
                last_job_duration = billing_result.storage_running_duration

        if not advance_alert:
            return False

        # Check if we need to send alert
        alert_info = job_history if job_history else {}
        last_alert_str = alert_info.get('lastLowBalanceAlert')
        last_alerted_on = datetime.fromisoformat(last_alert_str) if last_alert_str else None

        instance_cost, storage_cost = self.calculation_service.get_billing_plan_pricing(
            billing_data.plan_type, billing_data.pricing_match, 
            billing_data.storage_pricing_match, billing_data.storage_size, 
            billing_result.bill_cpu
        )
        would_be_billing_amount = instance_cost + storage_cost

        if wallet_info.total_balance < would_be_billing_amount and \
           self.grace_period_service.should_alert_again(billing_data.plan_type, last_alerted_on, now):
            
            auto_recharge_success = self.try_auto_recharge(
                billing_data, wallet_info, would_be_billing_amount
            )
            
            if not auto_recharge_success:
                target_date = self.calculation_service.get_billing_due_time(
                    billing_data.plan_type, last_job_duration, now
                ).strftime('%Y-%m-%d %H:%M:%S')
                
                self.notification_service.notify(billing_data.system_name, billing_data.user_id, target_date)
                self.save_alert_record(billing_data, now, would_be_billing_amount, 'LOW_BALANCE_ALERT_SENT')
                self.notification_service.log_notification(
                    billing_data.user_id, 
                    f"Low balance alert for '{billing_data.system_name}' PC. Please recharge your wallet to avoid interruption.",
                    "warning", "Low balance alert", "billing-alert"
                )
                return True

        return False

    def try_auto_recharge(self, billing_data: InstanceBillingData, wallet_info: WalletInfo, 
                         required_amount: Decimal) -> bool:
        """Attempt auto-recharge if enabled."""
        
        if wallet_info.auto_recharge not in [True, "true"]:
            print(f"Auto recharge not enabled for user {billing_data.user_id}")
            return False

        auto_recharge_amount = Decimal(wallet_info.auto_recharge_amount) if wallet_info.auto_recharge_amount else Decimal("0.0")
        
        if auto_recharge_amount <= 0:
            last_recharge = self.stripe_service.get_last_successful_wallet_recharge(wallet_info.stripe_account_id)
            auto_recharge_amount = last_recharge

        recharge_amount = max(auto_recharge_amount, required_amount, billing_data.default_auto_recharge_amount)
        print(f"Attempting auto-recharge of ${recharge_amount} for user {billing_data.user_id}")                
        success = self.wallet_service.auto_recharge_wallet(
            billing_data.user_id, recharge_amount, wallet_info.stripe_account_id, wallet_info.balance
        )
        
        return success

    def save_alert_record(self, billing_data: InstanceBillingData, now: datetime, billing_amount: Decimal, status: str):
        """Save alert record to job history."""
        job_table = self.dynamodb.Table(TABLE_JOB_HISTORY)
        item = {
            'instanceId': billing_data.instance_id,
            'jobName': 'BILLING_JOB',
            'timestamp': now.isoformat(),
            'lastLowBalanceAlert': now.isoformat(),
            'status': status,
            'billingPlan': billing_data.plan_type
        }

        # Add billingAmount only if provided
        if billing_amount is not None:
            item['billingAmount'] = format_decimal_str(billing_amount)

        # Save to DynamoDB
        job_table.put_item(Item=item)

    def process_billing_cycle(self, billing_data: InstanceBillingData, billing_result: BillingPeriodResult, 
                            wallet_info: WalletInfo, now: datetime, last_billing_plan: str, last_job_ts: datetime) -> bool:
        """Process completed billing cycle."""
        if not (billing_result.billing_started):
            return False

        instance_cost = storage_cost = Decimal("0.0")
        auto_renew = billing_data.auto_renew
        target_plan = billing_data.plan_type
        if not auto_renew:
            # Auto-renew OFF → convert monthly/daily to hourly
            if target_plan in ["monthly", "daily"]:
                print(f"[{billing_data.instance_id}] Auto-renew OFF and plan type is {billing_data.plan_type} — converting plan type to hourly.")

                # Convert the plan in DynamoDB (if applicable)
                self.data_service.add_billing_plan(billing_data.instance_id, "hourly", now)

                self.notification_service.log_notification(
                    billing_data.user_id,
                    f"'{billing_data.system_name}' PC downgraded to hourly billing as Auto-renew is OFF.",
                    "warning", "PC downgraded", "billing-alert"
                )
                # Update in-memory data
                billing_data.plan_type = "hourly"

                
        instance_cost, storage_cost = self.calculation_service.get_billing_plan_pricing(
            billing_data.plan_type, billing_data.pricing_match, 
            billing_data.storage_pricing_match, billing_data.storage_size, 
            billing_result.bill_cpu
        )
        
        instance_cost = Decimal(format_decimal_str(instance_cost))
        storage_cost = Decimal(format_decimal_str(storage_cost))
        billing_amount = instance_cost + storage_cost
        billing_amount = Decimal(format_decimal_str(billing_amount))
        discount_details = apply_campaign_discount(billing_amount, billing_data.plan_type)
        final_billing_amount = Decimal(str(discount_details["final_amount"]))
        print(f"Instance {billing_data.instance_id} billing amount: Instance cost: {instance_cost}, Storage cost: {storage_cost}")

        # Try auto-recharge if insufficient funds
        current_wallet = wallet_info
        auto_recharge_success = False
        if current_wallet.total_balance < final_billing_amount:
            auto_recharge_success = self.try_auto_recharge(billing_data, current_wallet, final_billing_amount)
            if auto_recharge_success:
                current_wallet = self.data_service.get_wallet_info(billing_data.user_id)

        if current_wallet.total_balance >= final_billing_amount:
            return self.complete_billing_transaction(
                billing_data, billing_result, current_wallet, final_billing_amount,
                instance_cost, storage_cost, now, last_job_ts, discount_details
            )
        else:
            return self.handle_insufficient_funds(
                billing_data,
                final_billing_amount,
                now,
                current_wallet,
                storage_cost,
                instance_cost,
                billing_result,
                target_plan,
                auto_recharge_success,
            )

    def complete_billing_transaction(self, billing_data: InstanceBillingData, billing_result: BillingPeriodResult,
                                   wallet_info: WalletInfo, billing_amount: Decimal, instance_cost: Decimal,
                                   storage_cost: Decimal, now: datetime, last_job_ts: datetime,
                                   discount_details: Optional[Dict[str, Any]] = None) -> bool:
        """Complete the billing transaction."""
        
        
        # Deduct from wallet
        self.wallet_service.deduct_from_wallet(billing_data.user_id, wallet_info, billing_amount, billing_data.system_name, billing_data.instance_id, billing_result)

        if discount_details and Decimal(str(discount_details.get("discount_amount", 0))) > 0:
            self.notification_service.log_notification(
                billing_data.user_id,
                f"{discount_details.get('campaign_name')} applied a ${format_decimal_str(Decimal(str(discount_details['discount_amount'])))} discount on '{billing_data.system_name}' PC.",
                "success",
                "Campaign discount applied",
                "billing-alert",
            )

        # Record billing
        self.record_billing_transaction(
            billing_data, billing_result, billing_amount, instance_cost, storage_cost, now, last_job_ts, discount_details
        )

        # Update job history
        self.update_job_history(billing_data, billing_result, now, billing_amount, last_job_ts)

        print(f"Instance {billing_data.instance_id} billing completed.")
        return True

    def record_billing_transaction(self, billing_data: InstanceBillingData, billing_result: BillingPeriodResult,
                                 billing_amount: Decimal, instance_cost: Decimal, storage_cost: Decimal,
                                 now: datetime, last_job_ts: datetime,
                                 discount_details: Optional[Dict[str, Any]] = None):
        """Record billing transaction in billing table."""
        billing_table = self.dynamodb.Table(TABLE_SMARTPC_BILLING)
        
        # Determine time ranges based on billing type
        start_time = last_job_ts.isoformat()
        end_time = (last_job_ts + timedelta(hours=1)).isoformat()
        billing_plan = billing_data.plan_type
        if billing_plan == 'daily':
            end_time = (last_job_ts + timedelta(days=1)).isoformat()
        elif billing_plan == 'monthly':
            end_time = (last_job_ts + timedelta(days=30)).isoformat()
        
        current_instance_state = BillingCalculationService.get_last_instance_status(billing_data.events)
        discount_details = discount_details or {}
        original_billing_amount = Decimal(str(discount_details.get("base_amount", billing_amount)))
        discount_amount = Decimal(str(discount_details.get("discount_amount", 0)))
        discount_percent = Decimal(str(discount_details.get("discount_percent", 0)))

        billing_item = {
            'instanceId': billing_data.instance_id,
            'systemName': billing_data.system_name,
            'userId': billing_data.user_id,
            'timestamp': now.isoformat(),
            'updatedTimestamp': now.isoformat(),
            'billingAmount': format_decimal_str(billing_amount),
            'originalBillingAmount': format_decimal_str(original_billing_amount),
            'discountAmount': format_decimal_str(discount_amount),
            'discountPercent': format_decimal_str(discount_percent),
            'discountCampaignId': discount_details.get('campaign_id') or '',
            'discountCampaignName': discount_details.get('campaign_name') or '',
            'instanceCost': format_decimal_str(instance_cost),
            'storageCost': format_decimal_str(storage_cost),
            'startTime': start_time,
            'endTime': end_time,
            'storageBillingStartTime': start_time,
            'storageBillingEndTime': end_time,
            'billingPlan': billing_data.plan_type,
            'promoDeduction': format_decimal_str(billing_result.promo_deduction),
            'cashbackDeduction': format_decimal_str(billing_result.cashback_deduction),
            'balanceDeduction': format_decimal_str(billing_result.balance_deduction),
            'systemStatus': current_instance_state
        }
        
        billing_table.put_item(Item=billing_item)


    def update_job_history(self, billing_data: InstanceBillingData, billing_result: BillingPeriodResult,
                          now: datetime, billing_amount: Decimal, last_period_end: datetime):
        """Update job history with billing completion."""
        job_table = self.dynamodb.Table(TABLE_JOB_HISTORY)
        
        if billing_result.billing_started:
            end_time = (last_period_end + timedelta(hours=1)).isoformat()
            billing_plan = billing_data.plan_type
            if billing_plan == 'daily':
                end_time = (last_period_end + timedelta(days=1)).isoformat()
            elif billing_plan == 'monthly':
                end_time = (last_period_end + timedelta(days=30)).isoformat()

            job_table.put_item(Item={
                'instanceId': billing_data.instance_id,
                'jobName': 'BILLING_JOB',
                'timestamp': now.isoformat(),
                'status': 'COMPLETED',
                'billingPlan': billing_data.plan_type,
                'periodEndTimeStamp': end_time,
                'billingAmount': format_decimal_str(billing_amount)
            })

    def handle_insufficient_funds(self, billing_data: InstanceBillingData, billing_amount: Decimal, 
                                now: datetime, wallet_info: WalletInfo, storage_cost: Decimal, instance_cost: Decimal,
                                billing_result: BillingPeriodResult, target_billing_plan: str, auto_recharge_success: bool) -> bool:
        """Handle insufficient funds scenario."""
        print(f"[{billing_data.instance_id}] Insufficient funds for user {billing_data.user_id}")
        
        # # Handle insufficient balance based on auto-renew flag
        current_instance_state = BillingCalculationService.get_last_instance_status(billing_data.events)

        # converted monthly/daily to hourly in case of insufficient funds
        if target_billing_plan in ["monthly", "daily"]:
            print(f"[{billing_data.instance_id}] Auto-renew OFF. PC downgraded to hourly as Auto-renew is OFF — stopping instance (no new cycle) due to insufficient funds.")
            try:
                if current_instance_state != 'stopped':
                    self.instance_mgmt_service.stop_instance(billing_data.instance_id, billing_data.user_id, billing_data.region_code)
                self.save_job_record(billing_data, now, 'INSTANCE_STOPPED_DUE_TO_INSUFFICIENT_FUNDS')
                self.notification_service.log_notification(
                    billing_data.user_id,
                    f"'{billing_data.system_name}' PC stopped due to insufficient balance.",
                    "critical", "PC instance stopped", "billing-alert"
                )
                self.notification_service.notify(billing_data.system_name, billing_data.user_id, 
                                            now.isoformat(), action='PC_STOPPED_DUE_TO_IN_SUFFICIENT_FUND')
            except Exception as e:
                print(f"Failed to stop instance {billing_data.instance_id}: {e}")
            return False


        # Get current instance status
        resource_table = self.dynamodb.Table(TABLE_SMARTPC_RESOURCE)
        instance_response = resource_table.get_item(
            Key={'resourceId': billing_data.instance_id, 'resourceType': 'instance'}
        )
        instance = instance_response.get('Item', {})
        grace_start = instance.get('grace_start')

        if not grace_start:
            # Start grace period
            grace_start = now.isoformat()
            self.notification_service.notify(billing_data.system_name, billing_data.user_id, 
                                            grace_start, action='IN_SUFFICIENT_FUND')
            
            resource_table.update_item(
                Key={'resourceId': billing_data.instance_id, 'resourceType': 'instance'},
                UpdateExpression="SET grace_start = :g",
                ExpressionAttributeValues={':g': grace_start}
            )
            
            self.save_job_record(billing_data, now, 'IN_SUFFICIENT_FUND', billing_amount)
        else:
            self.handle_grace_period_actions(billing_data, instance, grace_start, now)

        return False

        

    def handle_grace_period_actions(self, billing_data: InstanceBillingData, instance: Dict[str, Any],
                                  grace_start: str, now: datetime):
        """Handle actions during grace period."""
        
        instance_status = instance.get('status')
        # Stop instance if grace expired and still running
        if (instance_status == 'running' and 
            self.grace_period_service.grace_expired(billing_data.plan_type, grace_start, now)):
            
            try:
                self.instance_mgmt_service.stop_instance(billing_data.instance_id, billing_data.user_id, billing_data.region_code)
                self.save_job_record(billing_data, now, 'INSTANCE_STOPPED_DUE_TO_INSUFFICIENT_FUNDS')
                self.notification_service.log_notification(
                        billing_data.user_id,
                        f"'{billing_data.system_name}' PC stopped due to insufficient balance after grace period.",
                        "critical", "Instance stopped due to insufficient balance", "billing-alert"
                    )
                self.notification_service.notify(billing_data.system_name, billing_data.user_id, 
                                                now.isoformat(), action='PC_STOPPED_DUE_TO_IN_SUFFICIENT_FUND')
                print(f"Instance {billing_data.instance_id} stopped due to insufficient funds after grace.")
            except Exception as e:
                print(f"Failed to stop instance {billing_data.instance_id}: {e}")

        
        # # Delete instance if deletion period reached
        # if self.grace_period_service.deletion_due(grace_start, now):
        #     try:
        #         self.instance_mgmt_service.delete_instance(
        #             billing_data.instance_id, billing_data.user_id,
        #             'Deleting instance due to prolonged non-payment', billing_data.region_code
        #         )
        #         self.save_job_record(billing_data, now, 'INSTANCE_DELETED')
        #         print(f"Instance {billing_data.instance_id} deleted due to prolonged non-payment.")
        #     except Exception as e:
        #         print(f"Failed to delete instance {billing_data.instance_id}: {e}")

        

    def save_job_record(self, billing_data: InstanceBillingData, now: datetime,
                       status: str, billing_amount: Decimal = None):
        """Save job record to history."""
        job_table = self.dynamodb.Table(TABLE_JOB_HISTORY)
        item = {
            'instanceId': billing_data.instance_id,
            'jobName': 'BILLING_JOB',
            'timestamp': now.isoformat(),
            'status': status,
            'billingPlan': billing_data.plan_type
        }
        if billing_amount:
            item['billingAmount'] = format_decimal_str(billing_amount)

        job_table.put_item(Item=item)

    def process_instance_billing(self, instance: Dict[str, Any], config_map: Dict[str, Any],
                               pricing_data: List[Dict[str, Any]], 
                               storage_pricing_data: List[Dict[str, Any]], now: datetime) -> bool:
        """Main method to process billing for a single instance."""
        try:
            # Prepare instance data
            billing_data = self.prepare_instance_data(instance, config_map, pricing_data, storage_pricing_data)
            if not billing_data:
                return False

            print(f"Processing instance {billing_data.instance_id}")
            current_instance_state = BillingCalculationService.get_last_instance_status(billing_data.events)
            last_job_run_status = None
            job_history = self.data_service.get_job_history(billing_data.instance_id)
        
            if job_history:
                last_job_run_status = job_history.get('status')
            
            if current_instance_state == 'stopped' and last_job_run_status in ['INSTANCE_STOPPED_DUE_TO_INSUFFICIENT_FUNDS']:
                print(f"Instance {billing_data.instance_id} is stopped due to insufficient funds. Skipping billing.")
                return False
            # get last billing data
            last_billing_data = self.data_service.get_last_billing(billing_data.instance_id)
            # Get billing timestamps
            last_job_ts, last_job_start_timestamp, last_billing_plan = \
                self.get_billing_timestamps(last_billing_data)

            if not last_job_ts:
                print(f"No valid timestamps found for instance {billing_data.instance_id}")
                return False
            
            print(f"Instance {billing_data.instance_id} last job timestamp: {last_job_ts}, last job start timestamp: {last_job_start_timestamp}, last billing plan: {last_billing_plan}")
            if not last_billing_plan:
                last_billing_plan = billing_data.plan_type
                print(f"Instance {billing_data.instance_id} no last billing plan found, defaulting to current plan: {last_billing_plan}")

            

            # Check billing periods and calculate costs
            billing_result = self.calculation_service.check_billing_periods(
                last_billing_plan, last_job_start_timestamp, billing_data.events, now
            )

            print(f"Instance {billing_data.instance_id} billing period started: "
                  f"Bill cpu: {billing_result.bill_cpu}, "
                  f"Billing started: {billing_result.billing_started}")

            # Get wallet info
            wallet_info = self.data_service.get_wallet_info(billing_data.user_id)
            if not wallet_info:
                print(f"No wallet found for user {billing_data.user_id}")
                return False

            # Handle advance alerts
            self.handle_advance_alert_for_grace_period(billing_data, billing_result, wallet_info, now, last_billing_plan, job_history)
            self.process_promo_instance_policy(billing_data, last_billing_data, wallet_info, now)

            if not billing_result.billing_started:
                print(f"Instance {billing_data.instance_id} billing not started. Skipping further processing.")
                return False
            
            # Process billing cycle if due
            return self.process_billing_cycle(billing_data, billing_result, wallet_info, now, last_billing_plan, last_job_ts)

        except Exception as e:
            print(f"[ERROR] Exception processing instance {instance.get('resourceId', 'unknown')}: {e}")
            traceback.print_exc()
            return False

    def process_promo_instance_policy(self, billing_data: InstanceBillingData, last_billing_data: Optional[Dict[str, Any]],
            wallet_info: WalletInfo, now: datetime):

        end_time = self.promo_instance_policy_service.get_end_time_if_stopped_pc(billing_data.events)
        print(f"end time {end_time} in process_promo_instance_policy")
        print(f"billing_data.events {billing_data.events}")
        if not end_time:
            return

        # Send stop_time to both functions
        self.handle_promo_advance_alert( billing_data, last_billing_data, wallet_info, now, end_time)
        self.terminate_promo_instance_if_due(billing_data, last_billing_data, wallet_info, now, end_time)


    def handle_promo_advance_alert(self, billing_data: InstanceBillingData,
            last_billing_data: Optional[Dict[str, Any]], wallet_info: WalletInfo, now: datetime, end_time: datetime) -> bool:
        # Check if promo-only stopped instance and wallet not recharged
        print(f"handle_promo_advance_alert billing_data {billing_data}")
        print(f"end_time {end_time}")

        if not end_time:
            return False

        if not self.promo_instance_policy_service.is_promo_only_instance_wallet_not_recharged(last_billing_data, wallet_info):
            return False

        # Get resource table + current alert state
        resource_table = self.dynamodb.Table(TABLE_SMARTPC_RESOURCE)

        instance_response = resource_table.get_item(
            Key={'resourceId': billing_data.instance_id, 'resourceType': 'instance'}
        )

        instance = instance_response.get('Item', {})
        alerts_sent = instance.get('promo_alerts_sent', [])

        print(f"alerts_sent for {billing_data.instance_id}: {alerts_sent}")

        #  Check if alert should be sent
        alert_hour = self.promo_instance_policy_service.should_send_alert(
            end_time, now, alerts_sent
        )
        print(f"alert_hour {alert_hour}")
        if not alert_hour:
            return False

        print(f"Sending promo alert for {billing_data.instance_id} at {alert_hour}h")

        deadline = self.promo_instance_policy_service.get_termination_deadline_hours()
        schedule = self.promo_instance_policy_service.get_alert_schedule_hours()
        target_date = self.promo_instance_policy_service.get_promo_termination_time(end_time).strftime(
            '%Y-%m-%d %H:%M:%S')
        # Send notification
        if schedule[0] and int(alert_hour) == schedule[0]:
            self.notification_service.log_notification(
                billing_data.user_id,
                f"Recharge your wallet within {deadline-alert_hour} hours to start {billing_data.system_name} again and avoid permanent deletion.",
                "warning", f"PC termination in {deadline-alert_hour} hours", "billing-alert")
            self.notification_service.notify(billing_data.instance_id, billing_data.user_id, target_date,
                                             'PROMO_PC_TERMINATION_12H', base_url=FRONTEND_URL,
                                             system_name=billing_data.system_name, alert_hour=alert_hour)

        elif len(schedule) > 1 and int(alert_hour) == schedule[1]:
            self.notification_service.log_notification(
                billing_data.user_id,
                f"Recharge your wallet now to prevent permanent deletion of {billing_data.system_name} and its data.",
                "warning", f"Final reminder: termination in {deadline-alert_hour} hours", "billing-alert")
            self.notification_service.notify(billing_data.instance_id, billing_data.user_id, target_date,
                                         'PROMO_PC_TERMINATION_6H_FINAL', base_url=FRONTEND_URL,
                                         system_name=billing_data.system_name, alert_hour=alert_hour)
        # Save to job history (optional but keeps consistency)
        self.save_alert_record(billing_data, now, None, f'PROMO_ALERT_{alert_hour}H_SENT')

        # Update resource table (prevent duplicate alerts)
        resource_table.update_item(
            Key={'resourceId': billing_data.instance_id, 'resourceType': 'instance'},
            UpdateExpression="""
                SET promo_alerts_sent = list_append(if_not_exists(promo_alerts_sent, :empty), :new)
            """,
            ExpressionAttributeValues={
                ':new': [alert_hour],
                ':empty': []
            }
        )

        return True


    def terminate_promo_instance_if_due( self, billing_data: InstanceBillingData, last_billing_data: Optional[Dict[str, Any]],
            wallet_info: WalletInfo, now: datetime, end_time: datetime):
        print(f"terminate_promo_instance_if_due last_billing_data {last_billing_data} end_time {end_time}")

        if not end_time:
            return

        if not self.promo_instance_policy_service.is_promo_only_instance_wallet_not_recharged(last_billing_data, wallet_info):
            return

        # Idempotency check using events (VERY IMPORTANT)
        event_types = [e.get('action') for e in billing_data.events]

        if any(e in ['terminate', 'delete'] for e in event_types):
            print(f"Instance {billing_data.instance_id} already deleted/terminated. Skipping.")
            return

        # Check if termination time reached
        if not self.promo_instance_policy_service.is_promo_instance_due_for_termination(end_time, now):
            return

        try:
            # Step 1: Delete instance
            self.instance_mgmt_service.delete_instance(
                billing_data.instance_id,
                billing_data.user_id,
                'Deleting instance due to promo balance stopped PC and wallet not recharged',
                billing_data.region_code
            )

            print(f"Instance {billing_data.instance_id} deleted successfully")

            # Step 2: Send FINAL notification (only after successful delete)
            self.notification_service.log_notification(
                billing_data.user_id,
                f"{billing_data.system_name} has been permanently terminated due to insufficient balance. All data stored on this PC has been permanently deleted and cannot be recovered.",
                "critical",
                "PC permanently terminated",
                "billing-alert"
            )

            # trigger email
            self.notification_service.notify(
                billing_data.instance_id,
                billing_data.user_id,
                now.isoformat(),
                action='PROMO_PC_TERMINATED',
                system_name=billing_data.system_name,
                base_url=FRONTEND_URL
            )

            # Step 3: Save job history
            self.save_job_record(
                billing_data,
                now,
                'INSTANCE_DELETED_FOR_PROMO_PC_WALLET_NOT_RECHARGED'
            )

            print(
                f"Instance {billing_data.instance_id} deleted and user notified (promo not recharged)."
            )

        except Exception as e:
            print(f"Failed to delete instance {billing_data.instance_id}: {e}")

