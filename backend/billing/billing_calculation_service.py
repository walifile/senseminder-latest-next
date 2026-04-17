from decimal import Decimal
from typing import Dict, Any, List, Tuple, Optional
from decimal import Decimal, ROUND_DOWN
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


def format_decimal_str(value: Decimal) -> str:
    """Format a numeric value to a string with exactly two decimal places.
    """
    # Convert to Decimal reliably
    if not isinstance(value, Decimal):
        value = Decimal(str(value))

    # Quantize with ROUND_DOWN to truncate without rounding
    return str(value.quantize(Decimal('0.01'), rounding=ROUND_DOWN))


@dataclass
class BillingPeriodResult:
    bill_cpu: bool
    billing_started: bool
    instance_running_duration: timedelta
    storage_running_duration: timedelta
    instance_cost: Decimal
    storage_cost: Decimal
    instance_minutes: Decimal
    storage_minutes: Decimal
    promo_deduction: Decimal = Decimal("0.00")
    cashback_deduction: Decimal = Decimal("0.00")
    balance_deduction: Decimal = Decimal("0.00")

class BillingCalculationService:

    @staticmethod
    def get_last_instance_status(events: List[Dict[str, Any]]) -> Optional[str]:
        """
        Determine the last known status of the instance based on its events.
        Returns "running", "stopped", or None if no valid events exist.
        """
        if not events:
            return None
        
        valid_actions = {
            'start', 'create',
            'stopped', 'terminate', 'delete',
            'terminated', 'deleted', 'stop'
        }

        # Filter only relevant events
        filtered_events = [
            e for e in events
            if e.get('action', '').lower() in valid_actions
        ]

        if not filtered_events:
            return None

        # Sort events by timestamp
        latest_event = max(filtered_events, key=lambda e: BillingCalculationService.to_utc_datetime(e['timestamp']))
        action = latest_event.get('action', '').lower()

        if action in ('start', 'create'):
            return "running"
        elif action in ('stopped', 'terminate', 'delete', 'terminated', 'deleted', 'stop'):
            return "stopped"
        else:
            return None

    @staticmethod
    def get_billing_period(plan_type: str) -> timedelta:
        plan_type = plan_type.strip().lower()
        if plan_type == 'hourly':
            return timedelta(hours=1)
        elif plan_type == 'daily':
            return timedelta(days=1)
        elif plan_type == 'monthly':
            return timedelta(days=30)
        else:
            raise ValueError(f"Unknown plan type: {plan_type}")

    @staticmethod
    def get_billing_due_time(plan_type: str, last_job_duration: timedelta, now: datetime) -> datetime:
        billing_period = BillingCalculationService.get_billing_period(plan_type)
        remaining_duration = billing_period - last_job_duration
        return now + remaining_duration

    @staticmethod
    def to_utc_datetime(dt_str: str) -> datetime:
        """Convert ISO string to UTC-aware datetime (even if naive)."""
        if dt_str is not None:
            dt = datetime.fromisoformat(dt_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        return None
    
    @staticmethod
    def check_billing_periods(billing_plan_type: str, last_job_start_timestamp: datetime, 
                            events: List[Dict[str, Any]], 
                            now: datetime) -> BillingPeriodResult:
        
        bill_cpu = False
        billing_started = False
        storage_running_duration = now - last_job_start_timestamp
        instance_running_time = storage_running_duration

        print(f"Checking billing periods for plan: {billing_plan_type}, instance running duration: {instance_running_time}, last job instance timestamp: {last_job_start_timestamp}, now: {now}")
        if billing_plan_type == 'hourly':
            current_instance_state = BillingCalculationService.get_last_instance_status(events)
            print(f"Instance current instance state: {current_instance_state}")
            if current_instance_state == "running":
                print("The instance is currently running.")
                bill_cpu = True
            if storage_running_duration >= timedelta(hours=1):
                billing_started = True
        elif billing_plan_type == 'daily':
            if storage_running_duration >= timedelta(days=1):
                bill_cpu = True
                billing_started = True
        elif billing_plan_type == 'monthly':
            if storage_running_duration >= timedelta(days=30):
                bill_cpu = True
                billing_started = True

        print(f"Billing started - Instance: {bill_cpu}, Storage: {billing_started}")
        return BillingPeriodResult(
            bill_cpu=bill_cpu,
            billing_started=billing_started,
            instance_running_duration=instance_running_time,
            storage_running_duration=storage_running_duration,
            instance_cost=Decimal("0.0"),
            storage_cost=Decimal("0.0"),
            instance_minutes=Decimal(instance_running_time.total_seconds()) / Decimal(60),
            storage_minutes=Decimal(storage_running_duration.total_seconds()) / Decimal(60)
        )

    @staticmethod
    def get_billing_plan_pricing(billing_plan_type: str, pricing_match: Dict[str, Any], 
                               storage_pricing_match: Dict[str, Any], storage_size: int, 
                               bill_cpu: bool) -> Tuple[Decimal, Decimal]:
        instance_cost = Decimal("0.0")
        storage_cost = Decimal("0.0")
        
        if billing_plan_type == 'hourly':
            if bill_cpu:
                instance_cost = Decimal(pricing_match['pricePerHour'])
            storage_cost = Decimal(storage_pricing_match['pricePerGBHour']) * Decimal(storage_size)
        elif billing_plan_type == 'daily':
            instance_cost = Decimal(pricing_match['pricePerDay'])
            storage_cost = Decimal(storage_pricing_match['pricePerGBDay']) * Decimal(storage_size)
        elif billing_plan_type == 'monthly':
            instance_cost = Decimal(pricing_match['pricePerMonth'])
            storage_cost = Decimal(storage_pricing_match['pricePerGBMonth']) * Decimal(storage_size)

        return instance_cost, storage_cost