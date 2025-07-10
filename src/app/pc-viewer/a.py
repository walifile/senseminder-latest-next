import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
ec2 = boto3.client("ec2")

user_data_table = dynamodb.Table("SmartPC-UserData")
schedule_table = dynamodb.Table("InstanceSchedules")
user_info_table = dynamodb.Table("senseminder-user")
assignment_table = dynamodb.Table("SmartPC_ManagePCAssignments")

def decimal_converter(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

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

        instance_ids = [inst["instanceId"] for inst in instances]
        instance_data_map, valid_instance_ids = {}, []

        try:
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

                    # Sync state to DynamoDB
                    user_data_table.update_item(
                        Key={"userId": user_id, "instanceId": instance_id},
                        UpdateExpression="SET #st = :s",
                        ExpressionAttributeNames={"#st": "status"},
                        ExpressionAttributeValues={":s": instance_state}
                    )

        except Exception as e:
            print(f"Error describing EC2 instances: {str(e)}")
            return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

        filtered_instances = [inst for inst in instances if inst["instanceId"] in valid_instance_ids]

        for inst in filtered_instances:
            schedule_response = schedule_table.query(
                KeyConditionExpression=Key("instanceId").eq(inst["instanceId"])
            )
            inst["schedules"] = schedule_response.get("Items", [])
            inst.update(instance_data_map.get(inst["instanceId"], {}))

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(filtered_instances, default=decimal_converter)
        }

    except Exception as e:
        print("Unhandled exception:", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
