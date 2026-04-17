import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from typing import Dict, Any, List, Optional, Tuple
import os
from dataclasses import dataclass
from datetime import datetime

TABLE_SMARTPC_PRICING = os.environ['TABLE_SMARTPC_INSTANCE_PRICING']
TABLE_SMARTPC_CONFIG = os.environ['TABLE_SMARTPC_CONFIG']
TABLE_SMARTPC_RESOURCE = os.environ['TABLE_SMARTPC_RESOURCE']
TABLE_SMARTPC_EVENTS = os.environ['TABLE_SMARTPC_EVENTS']
TABLE_SMARTPC_BILLING_PLAN = os.environ['TABLE_SMARTPC_BILLING_PLAN']
TABLE_SMARTPC_WALLET = os.environ['TABLE_SMARTPC_WALLET']
TABLE_SMARTPC_IPS = os.environ['TABLE_SMARTPC_IPS']
TABLE_SMARTPC_BILLING = os.environ['TABLE_SMARTPC_BILLING']
TABLE_JOB_HISTORY = os.environ['TABLE_JOB_HISTORY']
TABLE_USERDATA = os.environ['TABLE_USERDATA']
TABLE_SMARTPC_STORAGE_PRICING = os.environ['TABLE_SMARTPC_STORAGE_PRICING']
TABLE_SMARTPC_NOTIFICATION = os.environ.get('TABLE_SMARTPC_NOTIFICATION', 'SmartPC-Notification')
TABLE_SENSEPC_TEMPLATES = os.environ.get('TABLE_SENSEPC_TEMPLATES', 'SensePCTemplates')

@dataclass
class WalletInfo:
    balance: Decimal
    promo_balance: Decimal
    total_balance: Decimal
    auto_recharge: str
    auto_recharge_amount: str
    stripe_account_id: str
    cashback: Decimal    

class DataService:
    def __init__(self, region_name: str):
        self.dynamodb = boto3.resource("dynamodb", region_name=region_name)

    def get_all_items(self, table_name: str) -> List[Dict[str, Any]]:
        table = self.dynamodb.Table(table_name)
        response = table.scan()
        items = response['Items']
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
        return items

    def get_non_terminted_instances(self) -> List[Dict[str, Any]]:
        resource_table = self.dynamodb.Table(TABLE_SMARTPC_RESOURCE)
        return resource_table.scan(
            FilterExpression=Attr('status').ne('terminated') & Attr('status').ne('deleted')
        )['Items']

    def get_active_templates(self) -> List[Dict[str, Any]]:
        templates_table = self.dynamodb.Table(TABLE_SENSEPC_TEMPLATES)
        try:
            return templates_table.scan(
                FilterExpression=Attr('state').ne('deleted')
            ).get('Items', [])
        except Exception as e:
            print(f"Error fetching active templates: {e}")
            return []

    def get_instance_events(self, instance_id: str) -> List[Dict[str, Any]]:
        events_table = self.dynamodb.Table(TABLE_SMARTPC_EVENTS)
        return events_table.query(
            KeyConditionExpression=Key('instanceId').eq(instance_id)
        )['Items']

    def get_billing_plan(self, instance_id: str) -> Optional[Dict[str, Any]]:
        billing_plan_table = self.dynamodb.Table(TABLE_SMARTPC_BILLING_PLAN)
        response = billing_plan_table.query(
            KeyConditionExpression=Key('instanceId').eq(instance_id),
            ScanIndexForward=False,
            Limit=1
        )
        billing_plans = response.get('Items', [])
        return billing_plans[0] if billing_plans else None

    def add_billing_plan(self, instance_id: str, new_plan: str, now: datetime):
        """Update the billing plan for an instance."""
        billing_plan_table = self.dynamodb.Table(TABLE_SMARTPC_BILLING_PLAN)
        billing_plan_table.put_item(Item={
                "instanceId": instance_id,
                "timestamp": now.isoformat(),
                "billingPlan": new_plan
            })
        
        print(f"Updated billing plan for {instance_id} to {new_plan}.")
        
    def get_user_id_and_system_name(self, instance_id: str) -> Tuple[Optional[str], Optional[str]]:
        ips_table = self.dynamodb.Table(TABLE_SMARTPC_IPS)
        ip_info = ips_table.get_item(Key={'instanceId': instance_id})
        item = ip_info.get('Item', {})
        return item.get('userId'), item.get('systemName')

    def get_last_billing(self, instance_id: str) -> Optional[Dict[str, Any]]:
        billing_table = self.dynamodb.Table(TABLE_SMARTPC_BILLING)
        response = billing_table.query(
            KeyConditionExpression=Key('instanceId').eq(instance_id),
            ScanIndexForward=False,
            Limit=1
        )
        billings = response.get('Items', [])
        return billings[0] if billings else None

    def get_job_history(self, instance_id: str) -> Optional[Dict[str, Any]]:
        job_table = self.dynamodb.Table(TABLE_JOB_HISTORY)
        response = job_table.query(
            KeyConditionExpression=Key('instanceId').eq(instance_id),
            ScanIndexForward=False
        )
        items = response.get('Items', [])
        return items[0] if items else None

    def get_wallet_info(self, user_id: str) -> Optional[WalletInfo]:
        wallet_table = self.dynamodb.Table(TABLE_SMARTPC_WALLET)
        response = wallet_table.get_item(Key={'userId': user_id})
        if 'Item' not in response:
            return None
        
        wallet = response['Item']
        return WalletInfo(
            balance=Decimal(str(wallet.get("balance", 0))),
            promo_balance=Decimal(str(wallet.get("promoBalance", 0))),
            total_balance=Decimal(str(wallet.get("balance", 0))) + Decimal(str(wallet.get("promoBalance", 0))) + Decimal(str(wallet.get("cashback", 0))),
            auto_recharge=wallet.get('autoRecharge', 'false'),
            auto_recharge_amount=wallet.get('autoRechargeAmount', '0'),
            stripe_account_id=wallet.get('stripeAccountId', ''),
            cashback=Decimal(str(wallet.get('cashback', 0)))
        )