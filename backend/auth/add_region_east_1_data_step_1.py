import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

CONFIG_TABLE_NAME = "SmartPCConfig"
SOURCE_REGION = "us-east-1"

dynamodb_resource = boto3.resource("dynamodb", region_name=SOURCE_REGION)
table = dynamodb_resource.Table(CONFIG_TABLE_NAME)


def add_region_if_missing(region):
    scan_kwargs = {
        "FilterExpression": Attr("region").not_exists()
    }

    updated_count = 0
    skipped_count = 0
    updated_keys = []

    while True:
        response = table.scan(**scan_kwargs)

        for item in response.get("Items", []):
            key = {
                key_def["AttributeName"]: item[key_def["AttributeName"]]
                for key_def in table.key_schema
            }

            config_id = item.get("configId")

            try:
                table.update_item(
                    Key=key,
                    UpdateExpression="SET #r = :r, #gpk = :r, #gsk = :cfg",
                    ExpressionAttributeNames={
                        "#r": "region",
                        "#gpk": "GPK1",
                        "#gsk": "GSK1"
                    },
                    ExpressionAttributeValues={
                        ":r": region,
                        ":cfg": config_id
                    },
                    # 🔒 Only update if region still does not exist
                    ConditionExpression=Attr("region").not_exists()
                )

                updated_count += 1
                updated_keys.append(key)

            except ClientError as e:
                if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    skipped_count += 1
                else:
                    raise

        if "LastEvaluatedKey" not in response:
            break

        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    # ===== Summary =====
    print("\n====== UPDATE SUMMARY ======")
    print(f"Region value set to: {region}")
    print(f"GPK1 value set to  : {region}")
    print("GSK1 value set to  : configId")
    print(f"\nItems successfully updated: {updated_count}")
    print(f"Items skipped (already had region): {skipped_count}")

    if updated_keys:
        print("\nKeys of updated items:")
        for k in updated_keys:
            print(k)

    print("================================")


if __name__ == "__main__":
    region_var = "us-east-1"
    add_region_if_missing(region_var)
