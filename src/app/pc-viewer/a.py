# import json
# import boto3
# from boto3.dynamodb.conditions import Key
# from decimal import Decimal

# dynamodb = boto3.resource("dynamodb")
# ec2 = boto3.client("ec2")

# user_data_table = dynamodb.Table("SmartPC-UserData")
# schedule_table = dynamodb.Table("InstanceSchedules")
# user_info_table = dynamodb.Table("senseminder-user")  # New: senseminder-user table

# def decimal_converter(obj):
#     if isinstance(obj, Decimal):
#         return int(obj) if obj % 1 == 0 else float(obj)
#     raise TypeError

# def lambda_handler(event, context):
#     print("Lambda triggered. Event received:", json.dumps(event))

#     try:
#         user_id = event.get("queryStringParameters", {}).get("userId")
#         if not user_id:
#             print("Missing userId in query parameters.")
#             return {"statusCode": 400, "body": json.dumps({"error": "Missing userId parameter"})}
        
#         # STEP 1: Get role from senseminder-user (using scan since id is not the primary key)
#         user_info_response = user_info_table.scan(
#             FilterExpression=Key("id").eq(user_id)
#         )
#         user_items = user_info_response.get("Items", [])
#         user_info = user_items[0] if user_items else None

#         if user_info:
#             role = user_info.get("role", "").lower()
#             print(f"User role found: {role}")

#             if role == "admin":
#                 owner_id = user_info.get("owner_id")
#                 if owner_id:
#                     print(f"Admin detected. Replacing user_id {user_id} with owner_id {owner_id}")
#                     user_id = owner_id
#                 else:
#                     print("Admin has no owner_id, using original user_id.")
#             elif role == "member":
#                 print("Member detected. Returning no PC data.")
#                 return {
#                     "statusCode": 200,
#                     "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
#                     "body": json.dumps([])  # Return empty list for member
#                 }
#             else:
#                 print("User is not admin/member. Proceeding with original user_id.")
#         else:
#             print("User not found in senseminder-user table. Proceeding with original user_id.")

#         print(f"Fetching instances for userId: {user_id}")
#         user_response = user_data_table.query(
#             IndexName="UserIdIndex", KeyConditionExpression=Key("userId").eq(user_id)
#         )
#         instances = user_response.get("Items", [])

#         if not instances:
#             print(f"No instances found for userId: {user_id}")
#             return {"statusCode": 404, "body": json.dumps({"error": "No instances found for the given userId"})}

#         print(f"Found {len(instances)} instance(s) for userId: {user_id}")
#         instance_ids = [instance["instanceId"] for instance in instances]
#         valid_instance_ids, invalid_instance_ids, instance_data_map = [], [], {}

#         try:
#             print(f"Describing EC2 instances: {instance_ids}")
#             ec2_response = ec2.describe_instances(InstanceIds=instance_ids)
            
#             for reservation in ec2_response.get("Reservations", []):
#                 for ec2_instance in reservation.get("Instances", []):
#                     instance_id = ec2_instance["InstanceId"]
#                     valid_instance_ids.append(instance_id)

#                     instance_state = ec2_instance["State"]["Name"]
#                     print(f"Instance {instance_id} state: {instance_state}")

#                     status_response = ec2.describe_instance_status(InstanceIds=[instance_id])
#                     status_checks = status_response.get("InstanceStatuses", [])

#                     is_initialized = any(
#                         "Status" in check and check["Status"] == "ok"
#                         for instance_status in status_checks
#                         for check in [
#                             instance_status.get("SystemStatus", {}),
#                             instance_status.get("InstanceStatus", {})
#                         ]
#                     )

#                     if instance_state == "running" and not is_initialized:
#                         print(f"Instance {instance_id} is running but not initialized. Marking as 'initializing'")
#                         instance_state = "initializing"

#                     instance_data_map[instance_id] = {
#                         "instanceId": instance_id,
#                         "state": instance_state,
#                         "instanceType": ec2_instance.get("InstanceType", "unknown"),
#                         "launchTime": str(ec2_instance.get("LaunchTime", "unknown")),
#                         "publicIpAddress": ec2_instance.get("PublicIpAddress", "N/A"),
#                         "privateIpAddress": ec2_instance.get("PrivateIpAddress", "N/A"),
#                         "tags": ec2_instance.get("Tags", []),
#                     }

#                     print(f"Updating DynamoDB with new status for instance {instance_id}: {instance_state}")
#                     user_data_table.update_item(
#                         Key={"userId": user_id, "instanceId": instance_id},
#                         UpdateExpression="SET #st = :new_state",
#                         ExpressionAttributeNames={"#st": "status"},
#                         ExpressionAttributeValues={":new_state": instance_state}
#                     )

#         except Exception as e:
#             error_message = str(e)
#             print(f"Error describing EC2 instances: {error_message}")
#             if "InvalidInstanceID.NotFound" in error_message:
#                 invalid_instance_ids = [inst for inst in instance_ids if inst in error_message]
#             else:
#                 return {"statusCode": 500, "body": json.dumps({"error": "Error fetching EC2 data", "details": error_message})}

#         for invalid_id in invalid_instance_ids:
#             print(f"Deleting invalid instance record: {invalid_id}")
#             user_data_table.delete_item(Key={"userId": user_id, "instanceId": invalid_id})

#         filtered_instances = [inst for inst in instances if inst["instanceId"] in valid_instance_ids]

#         print("Fetching schedules for valid instances...")
#         schedules = {}
#         for instance_id in valid_instance_ids:
#             schedule_response = schedule_table.query(
#                 KeyConditionExpression=Key("instanceId").eq(instance_id)
#             )
#             schedules[instance_id] = schedule_response.get("Items", [])
#             print(f"Fetched {len(schedules[instance_id])} schedules for instance {instance_id}")

#         result = []
#         for instance in filtered_instances:
#             instance_id = instance["instanceId"]
#             instance["schedules"] = schedules.get(instance_id, [])
#             instance.update(instance_data_map.get(instance_id, {}))
#             result.append(instance)

#         print(f"Returning result for {len(result)} instance(s)")
#         return {
#             "statusCode": 200,
#             "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
#             "body": json.dumps(result, default=decimal_converter)
#         }
#     except Exception as e:
#         print("Unhandled exception occurred:", str(e))
#         return {"statusCode": 500, "body": json.dumps({"error": "Error fetching data", "details": str(e)})}

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

                # Fetch assigned instances for this member
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

                # Fetch instance details from SmartPC-UserData using owner_id
                user_response = user_data_table.query(
                    IndexName="UserIdIndex",
                    KeyConditionExpression=Key("userId").eq(owner_id)
                )
                all_instances = user_response.get("Items", [])

                # Filter only those that match assigned_instance_ids
                instances = [
                    inst for inst in all_instances if inst["instanceId"] in assigned_instance_ids
                ]
            else:
                print("Other role detected. Proceeding with original user_id.")
                instances = []
        else:
            print("User not found in senseminder-user table.")
            instances = []

        # If instances not already populated (admin or other role)
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
                    status_response = ec2.describe_instance_status(InstanceIds=[instance_id])
                    status_checks = status_response.get("InstanceStatuses", [])

                    is_initialized = any(
                        "Status" in check and check["Status"] == "ok"
                        for instance_status in status_checks
                        for check in [
                            instance_status.get("SystemStatus", {}),
                            instance_status.get("InstanceStatus", {})
                        ]
                    )

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

                    # Update instance state in SmartPC-UserData
                    user_data_table.update_item(
                        Key={"userId": user_id, "instanceId": instance_id},
                        UpdateExpression="SET #st = :s",
                        ExpressionAttributeNames={"#st": "status"},
                        ExpressionAttributeValues={":s": instance_state}
                    )

        except Exception as e:
            print(f"Error describing EC2 instances: {str(e)}")
            return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

        # Filter and enrich instances
        filtered_instances = [inst for inst in instances if inst["instanceId"] in valid_instance_ids]

        # Attach schedules
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
