import os
import json
from datetime import datetime, timezone
import traceback
from billing_service import BillingService


# Environment variables
TABLE_SMARTPC_PRICING = os.environ['TABLE_SMARTPC_INSTANCE_PRICING']
TABLE_SMARTPC_CONFIG = os.environ['TABLE_SMARTPC_CONFIG']
TABLE_SMARTPC_EVENTS = os.environ['TABLE_SMARTPC_EVENTS']
TABLE_SMARTPC_BILLING_PLAN = os.environ['TABLE_SMARTPC_BILLING_PLAN']

TABLE_SMARTPC_IPS = os.environ['TABLE_SMARTPC_IPS']
TABLE_USERDATA = os.environ['TABLE_USERDATA']
TABLE_SMARTPC_STORAGE_PRICING = os.environ['TABLE_SMARTPC_STORAGE_PRICING']


AWS_REGION = os.environ['AWSREGION']

secret_name = os.environ.get("STRIPE_SECRET_NAME", "stripe/api_key")


def lambda_handler(event, context):
    """Main Lambda handler function."""
    now = datetime.now(timezone.utc)
    print(f"Billing Lambda execution started at {now.isoformat()}")

    try:
        # Initialize services
        billing_service = BillingService(region=AWS_REGION, secret_name=secret_name)
        data_service = billing_service.data_service

        # Load reference data
        print("Loading pricing and config data...")
        pricing_data = data_service.get_all_items(TABLE_SMARTPC_PRICING)
        storage_pricing_data = data_service.get_all_items(TABLE_SMARTPC_STORAGE_PRICING)
        config_data = data_service.get_all_items(TABLE_SMARTPC_CONFIG)
        config_map = {item['configId']: item for item in config_data}

        # Get non terminated instances
        non_terminated_instances = data_service.get_non_terminted_instances()
        print(f"Found {len(non_terminated_instances)} non terminated instances.")

        # Process each instance
        processed_count = 0

        for instance in non_terminated_instances:
            processed_count += 1
            try:
                success = billing_service.process_instance_billing(
                    instance, config_map, pricing_data, storage_pricing_data, now
                )
                if success:
                    print(f"Billing processed successfully for instance {instance['resourceId']}")
                else:
                    print(f"No billing action needed for instance {instance['resourceId']}")

            except Exception as e:
                print(f"Failed to process instance {instance.get('resourceId', 'unknown')}: {e}")
                continue

        print(f"Processed {processed_count} instances.")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Billing job completed.',
                'processed': processed_count
            })
        }

    except Exception as e:
        print(f"[ERROR] Lambda execution failed: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Billing job failed.',
                'error': str(e)
            })
        }