import os
import boto3
from datetime import datetime, timedelta
from typing import Optional


HOURLY_GRACE_PERIOD_IN_MINS = int(os.environ['HOURLY_GRACE_PERIOD_IN_MINS'])


class GracePeriodService:
    @staticmethod
    def should_send_advance_alert(plan_type: str, running_duration: timedelta) -> bool:
        if plan_type == 'hourly':
            return running_duration >= timedelta(minutes=55)
        elif plan_type == 'daily':
            return running_duration >= timedelta(hours=23)
        elif plan_type == 'monthly':
            return running_duration >= timedelta(days=27)
        return False

    @staticmethod
    def should_alert_again(plan_type: str, last_alerted_on: Optional[datetime], now: datetime) -> bool:
        if plan_type == 'monthly' and last_alerted_on:
            return now.date() != last_alerted_on.date()
        return last_alerted_on is None

    @staticmethod
    def grace_expired(plan_type: str, grace_start: str, now: datetime) -> bool:
        grace_start_dt = datetime.fromisoformat(grace_start)
        if plan_type == 'hourly':
            return now >= grace_start_dt + timedelta(minutes=HOURLY_GRACE_PERIOD_IN_MINS)
        return False

    @staticmethod
    def deletion_due(grace_start: str, now: datetime) -> bool:
        grace_start_dt = datetime.fromisoformat(grace_start)
        return now >= grace_start_dt + timedelta(days=3)