import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from botocore.exceptions import ClientError
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Attr 
from collections import defaultdict
dynamodb = boto3.resource("dynamodb")
#ec2 = boto3.client("ec2")

user_data_table = dynamodb.Table("SmartPC-UserData")
schedule_table = dynamodb.Table("SmartPC-Instance-Schedules")
user_info_table = dynamodb.Table("senseminder-user")
assignment_table = dynamodb.Table("SmartPC_ManagePCAssignments")
billing_plan_table = dynamodb.Table("SmartPCBillingPlan")

def get_ec2_client(region: str):
    try:
        ec2_client = boto3.client(
            "ec2",
            region_name=region
        )
        return ec2_client
    except Exception:
        raise RuntimeError(
            f"Unexpected error while initializing EC2 client in region '{region}'."
        )


def get_region_by_instance_id(instance_id: str):
    """
    Fallback helper if region is ever missing from instance row
    """
    response = user_data_table.query(
        KeyConditionExpression=Key("instanceId").eq(instance_id)
    )
    items = response.get("Items", [])
    return items[0].get("region") if items else None


def decimal_converter(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError


def get_latest_billing_plan(instance_id: str):
    """
    Fetch the latest billing plan for an instance from SmartPCBillingPlan table.
    Uses timestamp sort key in descending order to get the newest record.
    """
    try:
        response = billing_plan_table.query(
            KeyConditionExpression=Key("instanceId").eq(instance_id),
            ScanIndexForward=False, 
            Limit=1
        )
        items = response.get("Items", [])
        if not items:
            print(f"No billing plan found for {instance_id}")
            return None
        return items[0].get("billingPlan")
    except Exception as e:
        print(f"Failed to fetch billing plan for {instance_id}: {e}")
        return None




def lambda_handler(event, context):
    print("Lambda triggered. Event received:", json.dumps(event))

    try:
        user_id = event.get("queryStringParameters", {}).get("userId")
        if not user_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing userId parameter"})}

        # Get role and owner_id from senseminder-user table
        user_info_response = user_info_table.scan(
            FilterExpression=Key("id").eq(user_id)
        )
        user_items = user_info_response.get("Items", [])
        user_info = user_items[0] if user_items else None

        if user_info:
            role = user_info.get("role", "").lower()
            print(f"User role: {role}")

            if role == "admin":
                owner_id = user_info.get("owner_id")
                if owner_id:
                    print(f"Admin detected. Using owner_id {owner_id} instead of admin id.")
                    user_id = owner_id
                else:
                    print("Admin has no owner_id, using own userId.")
            elif role == "member":
                owner_id = user_info.get("owner_id")
                if not owner_id:
                    print("Member has no owner_id. Returning empty list.")
                    return {
                        "statusCode": 200,
                        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                        "body": json.dumps([])
                    }

                assignment_response = assignment_table.query(
                    KeyConditionExpression=Key("ownerId").eq(owner_id)
                )
                assignments = assignment_response.get("Items", [])
                assigned_instance_ids = [
                    item["instanceId"] for item in assignments if item.get("memberId") == user_id
                ]

                if not assigned_instance_ids:
                    print("No instance assigned to this member.")
                    return {
                        "statusCode": 200,
                        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                        "body": json.dumps([])
                    }

                print(f"Member assigned instanceIds: {assigned_instance_ids}")

                user_response = user_data_table.query(
                    IndexName="UserIdIndex",
                    KeyConditionExpression=Key("userId").eq(owner_id)
                )
                all_instances = user_response.get("Items", [])
                instances = [inst for inst in all_instances if inst["instanceId"] in assigned_instance_ids]
            else:
                print("Other role detected. Proceeding with original user_id.")
                instances = []
        else:
            print("User not found in senseminder-user table.")
            instances = []

        if not user_info or role != "member":
            print(f"Fetching instances for userId: {user_id}")
            user_response = user_data_table.query(
                IndexName="UserIdIndex",
                KeyConditionExpression=Key("userId").eq(user_id)
            )
            instances = user_response.get("Items", [])

        if not instances:
            print("No instances found.")
            return {"statusCode": 200, "body": json.dumps([])}

        # instance_ids = [inst["instanceId"] for inst in instances]
        # instance_data_map, valid_instance_ids = {}, []
        instances_by_region = defaultdict(list)
        for inst in instances:
            instance_id = inst.get("instanceId")
            region = inst.get("region") or get_region_by_instance_id(instance_id)

            if instance_id and region:
                instances_by_region[region].append(instance_id)

        instance_data_map = {}
        valid_instance_ids = []
        try:
            for region, instance_ids in instances_by_region.items():
                ec2 = get_ec2_client(region)
                ec2_response = ec2.describe_instances(InstanceIds=instance_ids)

                for reservation in ec2_response.get("Reservations", []):
                    for ec2_instance in reservation.get("Instances", []):
                        instance_id = ec2_instance["InstanceId"]
                        valid_instance_ids.append(instance_id)

                        instance_state = ec2_instance["State"]["Name"]

                        # Fetch real-time health check status
                        status_response = ec2.describe_instance_status(
                            InstanceIds=[instance_id],
                            IncludeAllInstances=True
                        )
                        status_checks = status_response.get("InstanceStatuses", [])
                        is_initialized = False

                        if status_checks:
                            instance_status = status_checks[0]
                            sys_status = instance_status.get("SystemStatus", {}).get("Status", "")
                            inst_status = instance_status.get("InstanceStatus", {}).get("Status", "")
                            if sys_status == "ok" and inst_status == "ok":
                                is_initialized = True

                        # Adjust status to match AWS Console behavior
                        if instance_state == "running" and not is_initialized:
                            instance_state = "initializing"

                        instance_data_map[instance_id] = {
                            "instanceId": instance_id,
                            "state": instance_state,
                            "instanceType": ec2_instance.get("InstanceType", "unknown"),
                            "launchTime": str(ec2_instance.get("LaunchTime", "unknown")),
                            "publicIpAddress": ec2_instance.get("PublicIpAddress", "N/A"),
                            "privateIpAddress": ec2_instance.get("PrivateIpAddress", "N/A"),
                            "tags": ec2_instance.get("Tags", []),
                        }

                    # # Sync state to DynamoDB
                    # user_data_table.update_item(
                    #     Key={"userId": user_id, "instanceId": instance_id},
                    #     UpdateExpression="SET #st = :s",
                    #     ExpressionAttributeNames={"#st": "status"},
                    #     ExpressionAttributeValues={":s": instance_state}
                    # )

        except Exception as e:
            print(f"Error describing EC2 instances: {str(e)}")
            return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

        filtered_instances = [inst for inst in instances if inst["instanceId"] in valid_instance_ids]

        # for inst in filtered_instances:
        #     schedule_response = schedule_table.query(
        #         KeyConditionExpression=Key("instanceId").eq(inst["instanceId"])
        #     )
        #     inst["schedules"] = schedule_response.get("Items", [])
        #     inst.update(instance_data_map.get(inst["instanceId"], {}))


        for inst in filtered_instances:
            instance_id = inst["instanceId"]
            instance_state = instance_data_map.get(instance_id, {}).get("state", "unknown")

            # Add schedules
            schedule_response = schedule_table.query(
                KeyConditionExpression=Key("instanceId").eq(instance_id)
            )
            inst["schedules"] = schedule_response.get("Items", [])

            # Add live EC2 data (state, IP, tags, etc.)
            inst.update(instance_data_map.get(instance_id, {}))

            # Add the latest billing plan
            billing_plan = get_latest_billing_plan(instance_id)
            if billing_plan:
                inst["billingPlan"] = billing_plan

            # ✅ Safe DynamoDB update using item’s real keys (avoids duplicates)
            item_user_id = inst["userId"]
            item_instance_id = inst["instanceId"]

            try:
                user_data_table.update_item(
                    Key={"userId": item_user_id, "instanceId": item_instance_id},
                    UpdateExpression="SET #st = :s, lastSeenAt = :ts",
                    ExpressionAttributeNames={"#st": "status"},
                    ExpressionAttributeValues={
                        ":s": instance_state,
                        ":ts": datetime.now(timezone.utc).isoformat()
                    },
                    ConditionExpression="attribute_exists(userId) AND attribute_exists(instanceId)"
                )
            except ClientError as e:
                if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    print(f"[WARN] Missing SmartPC-UserData for {item_instance_id} under {item_user_id}. Skipping update.")
                else:
                    raise

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(filtered_instances, default=decimal_converter)
        }

    except Exception as e:
        print("Unhandled exception:", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
