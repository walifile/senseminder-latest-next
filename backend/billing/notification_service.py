from datetime import datetime, timezone
import boto3
import json

class NotificationService:
    def __init__(self, region_name: str, 
                 notifications_table_name: str,
                 notification_lambda_name: str):
        self.dynamodb = boto3.resource('dynamodb', region_name=region_name)
        self.notifications_table = self.dynamodb.Table(notifications_table_name)
        self.lambda_client = boto3.client('lambda', region_name=region_name)
        self.notification_lambda_name = notification_lambda_name

    def notify(self, instance_id: str, user_id: str, target_date: str, action: str = 'LOW_BALANCE_WARNING', **kwargs):
        base_url = kwargs.get("base_url")
        system_name = kwargs.get("system_name")
        alert_hour = kwargs.get("alert_hour")
        payload = {
            'instance_id': instance_id,
            'user_id': user_id,
            'action': action,
            'target_date': target_date
        }
        if base_url:
            payload['base_url'] = base_url
        if system_name:
            payload['system_name'] = system_name
        if alert_hour:
            payload['alert_hour'] = alert_hour

        self.lambda_client.invoke(
            FunctionName=self.notification_lambda_name,
            InvocationType='Event',
            Payload=json.dumps(payload)
        )

    def log_notification(self, user_id: str, content: str, severity: str, title: str = "Notification", type: str = "general"):
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
        self.notifications_table.put_item(Item=item)