import boto3
import json

dynamodb = boto3.resource("dynamodb")
instance_table = dynamodb.Table("SmartPCInstancePricing")
storage_table = dynamodb.Table("SmartPCSSDPricing")

def lambda_handler(event, context):
    try:
        # Handle preflight OPTIONS request
        if event.get("httpMethod") == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "POST,OPTIONS"
                },
                "body": json.dumps({}),
            }

        # Parse body
        body = event.get("body", {})
        if isinstance(body, str):
            body = json.loads(body)

        config_id = body.get("configId")
        storage_size = body.get("storageSize")
        region = body.get("region") or "us-east-1"

        if not (config_id and storage_size):
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing configId or storageSize"}),
            }

        # Get instance pricing
        instance_data = instance_table.get_item(Key={"configId": config_id}).get("Item")
        if not instance_data:
            return {
                "statusCode": 404,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Instance config not found"}),
            }

        # Get storage pricing
        storage_resp = storage_table.scan(
            FilterExpression="#r = :r AND size = :s",
            ExpressionAttributeNames={"#r": "region"},
            ExpressionAttributeValues={":r": region, ":s": int(storage_size)},
        )
        storage_items = storage_resp.get("Items", [])
        if not storage_items:
            return {
                "statusCode": 404,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Storage size not found"}),
            }

        storage_data = storage_items[0]

        #old calculation

        # total_hourly = float(instance_data["pricePerHour"]) + float(storage_data["totalPricePerHour"])
        # total_daily = float(instance_data["pricePerDay"]) + float(storage_data["totalPricePerDay"])
        # total_monthly = float(instance_data["pricePerMonth"]) + float(storage_data["totalPricePerMonth"])


        ssd_hourly = float(storage_data["pricePerGBHour"]) * int(storage_size)
        ssd_daily = float(storage_data["pricePerGBDay"]) * int(storage_size)
        ssd_monthly = float(storage_data["pricePerGBMonth"]) * int(storage_size)

        total_hourly = float(instance_data["pricePerHour"]) + ssd_hourly
        total_daily = float(instance_data["pricePerDay"]) + ssd_daily
        total_monthly = float(instance_data["pricePerMonth"]) + ssd_monthly


        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "instance": {
                    "configId": config_id,
                    "pricePerHour": float(instance_data["pricePerHour"]),
                    "pricePerDay": float(instance_data["pricePerDay"]),
                    "pricePerMonth": float(instance_data["pricePerMonth"]),
                },
                # "storage": {
                #     "size": storage_size,
                #     "pricePerHour": float(storage_data["totalPricePerHour"]),
                #     "pricePerDay": float(storage_data["totalPricePerDay"]),
                #     "pricePerMonth": float(storage_data["totalPricePerMonth"]),
                # },
                "storage": {
                    "size": int(storage_size),
                    "pricePerHour": round(ssd_hourly, 4),
                    "pricePerDay": round(ssd_daily, 4),
                    "pricePerMonth": round(ssd_monthly, 2),
                },

                "total": {
                    "pricePerHour": round(total_hourly, 4),
                    "pricePerDay": round(total_daily, 4),
                    "pricePerMonth": round(total_monthly, 2),
                }
            })
        }

    except Exception as e:
        print("Error:", e)
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": "Internal server error", "details": str(e)}),
        }

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",  # Or restrict to your frontend domain
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
    }
