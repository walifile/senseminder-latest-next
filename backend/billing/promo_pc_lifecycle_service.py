import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple

PROMO_INSTANCE_TERMINATION_DEADLINE_HOURS = int(float(os.environ.get('TERMINATION_DEADLINE_IN_HOURS', 24)))

def parse_alert_schedule():
    raw = os.environ.get("PROMO_ALERT_SCHEDULE_HOURS", "12,18")
    try:
        values = sorted(set(int(x.strip()) for x in raw.split(",")))
        return values
    except Exception as e:
        print(e)
        return [12, 18]

PROMO_ALERT_SCHEDULE_HOURS = parse_alert_schedule() # this is done if anyone give 18,12 in configuration it will create problem. TO avoid this I made this function

class PromoInstancePolicyService:

    @staticmethod
    def get_termination_deadline_hours() -> int:
        return PROMO_INSTANCE_TERMINATION_DEADLINE_HOURS

    @staticmethod
    def get_alert_schedule_hours() -> list:
        return PROMO_ALERT_SCHEDULE_HOURS

    @staticmethod
    def to_utc_datetime(value) -> datetime:

        if isinstance(value, str):
            dt = datetime.fromisoformat(value)
        else:
            dt = value

        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)

        return dt.astimezone(timezone.utc)


    @staticmethod
    def is_promo_only_instance_wallet_not_recharged(billing_data: Dict[str, Any], wallet_info) -> bool:

        promo_deduction = float(billing_data.get('promoDeduction', 0) or 0)
        balance_deduction = float(billing_data.get('balanceDeduction', 0) or 0)
        balance = float(wallet_info.balance or 0)
        # promoBalance = float(wallet_info.promo_balance or 0)
        print(f"promo_deduction {promo_deduction} balance_deduction {balance_deduction} balance {balance}")
        is_promo_used_instance_wallet_not_recharged = (promo_deduction > 0 and balance_deduction == 0 and balance == 0)
        print(f"is_promo_used_instance_wallet_not_recharged {is_promo_used_instance_wallet_not_recharged}")
        return is_promo_used_instance_wallet_not_recharged


    @staticmethod
    def get_end_time_if_stopped_pc(events) -> Optional[datetime]:
        if not events:
            return None

        for event in reversed(events):
            print(f"promo balance action {event.get('action')}")
            if event.get("action") in ["stopped", "stop"]:
                return PromoInstancePolicyService.to_utc_datetime(
                    event.get("timestamp")
                )

        return None


    @staticmethod
    def should_send_alert(end_time, now, alerts_sent: list) -> Optional[int]:
        end_time = PromoInstancePolicyService.to_utc_datetime(end_time)
        now = PromoInstancePolicyService.to_utc_datetime(now)

        for hour in PROMO_ALERT_SCHEDULE_HOURS:
            if hour in alerts_sent:
                continue

            alert_time = end_time + timedelta(hours=hour)

            # No window needed
            if now >= alert_time:
                return hour

        return None


    @staticmethod
    def get_promo_termination_time(end_time) -> bool:
        end_time = PromoInstancePolicyService.to_utc_datetime(end_time)
        termination_time = end_time + timedelta(hours=PROMO_INSTANCE_TERMINATION_DEADLINE_HOURS)
        return termination_time

    @staticmethod
    def is_promo_instance_due_for_termination(end_time, now) -> bool:
        end_time = PromoInstancePolicyService.to_utc_datetime(end_time)
        now = PromoInstancePolicyService.to_utc_datetime(now)

        termination_time = PromoInstancePolicyService.get_promo_termination_time(end_time)
        print(f"termination_time {termination_time} and now {now}")

        if not termination_time:
            return False

        return now >= termination_time