import boto3
from boto3.dynamodb.conditions import Attr

TABLE_NAME = "SmartPCConfig"
SOURCE_REGION = "us-east-1"

dynamodb_resource = boto3.resource("dynamodb", region_name=SOURCE_REGION)
table = dynamodb_resource.Table(TABLE_NAME)


def extract_gsk1(config_id: str, region: str) -> str:
    if "_" not in config_id:
        return config_id

    base, suffix = config_id.rsplit("_", 1)
    return base if suffix == region else config_id


def add_gpk1_gsk1():
    scan_kwargs = {
        "FilterExpression": Attr("GPK1").not_exists() | Attr("GSK1").not_exists()
    }

    updated = 0

    while True:
        response = table.scan(**scan_kwargs)

        for item in response.get("Items", []):
            region = item.get("region")
            config_id = item.get("configId")

            if not region or not config_id:
                continue

            gpk1 = region
            gsk1 = extract_gsk1(config_id, region)

            key = {
                k["AttributeName"]: item[k["AttributeName"]]
                for k in table.key_schema
            }

            table.update_item(
                Key=key,
                UpdateExpression="SET GPK1 = :gpk1, GSK1 = :gsk1",
                ExpressionAttributeValues={
                    ":gpk1": gpk1,
                    ":gsk1": gsk1
                }
            )

            updated += 1
            print(f"Updated {key} → GPK1={gpk1}, GSK1={gsk1}")

        if "LastEvaluatedKey" not in response:
            break

        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    print(f"\nTotal items updated: {updated}")


if __name__ == "__main__":
    add_gpk1_gsk1()
