# ===================== Following configuration will be changed

SOURCE_REGION = "us-east-1"  # It is constant
DEST_REGION = "us-east-2"

VPC_ID = "vpc-0a68fee94d02e8451"
SUBNET_VM_JSON = {
    "subnet-080968d41bb93ed22": 5,
    "subnet-0bbf370b2a4f8db58": 3,
    "subnet-0e6e2048637107beb": 3
}
AVAILABILITY_ZONE = [
    "us-west-2a-sub",
    "us-west-2b-sub",
    "us-west-2c-sub"
]
SECURITY_GROUP_ID = "sg-06abda305a71b1c02"

# ==============================

import boto3
import copy
from botocore.exceptions import ClientError, WaiterError
from boto3.dynamodb.conditions import Key

dynamodb_client = boto3.client("dynamodb", region_name=SOURCE_REGION)
dynamodb_resource = boto3.resource("dynamodb", region_name=SOURCE_REGION)
ec2_source = boto3.client("ec2", region_name=SOURCE_REGION)
ec2_dest = boto3.client("ec2", region_name=DEST_REGION)

SUBNET_VM_COUNTS_TABLE_NAME = "SubnetVMCounts"
CONFIG_TABLE = "SmartPCConfig"
INSTANCE_PRICING_TABLE = "SmartPCInstancePricing"
SSD_PRICING_TABLE = "SmartPCSSDPricing"

pricing_table = dynamodb_resource.Table(INSTANCE_PRICING_TABLE)
config_table = dynamodb_resource.Table(CONFIG_TABLE)
ssd_pricing_table = dynamodb_resource.Table(SSD_PRICING_TABLE)

# =============================== For debug ==============

STARTED_AMI_COPIES = []
SUCCESSFUL_AMI_COPIES = []
FAILED_AMI_COPIES = []


# ========================================================


# VM count table preparation
def put_single_subnet_vm_count(
        region: str,
        subnet_id: str,
        vm_count: int
):
    """
    Put one subnet VM count into DynamoDB
    """

    dynamodb_client.put_item(
        TableName=SUBNET_VM_COUNTS_TABLE_NAME,
        Item={
            "region": {"S": region},
            "subnetId": {"S": subnet_id},
            "vmCount": {"N": str(vm_count)}
        }
    )


def put_subnet_vm_counts(region: str, subnet_vm_json_data: dict):
    for subnet_id, vm_count in subnet_vm_json_data.items():
        put_single_subnet_vm_count(
            region=region,
            subnet_id=subnet_id,
            vm_count=vm_count
        )


def get_all_config_items():
    items = []

    response = config_table.scan()

    def filter_items(raw_items):
        # keep only items with region == us-east-1
        return [
            item for item in raw_items
            if item.get("region") == SOURCE_REGION
        ]

    items.extend(filter_items(response.get("Items", [])))

    while "LastEvaluatedKey" in response:
        response = config_table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(filter_items(response.get("Items", [])))

    return items


# Existing AMI Name
def get_existing_ami_name(ami_id):
    response = ec2_source.describe_images(
        ImageIds=[ami_id]
    )

    images = response.get("Images", [])
    if not images:
        raise ValueError(f"AMI not found: {ami_id}")

    return images[0]["Name"]


def copy_ami(source_ami_id, name, source_region=SOURCE_REGION):
    try:
        response = ec2_dest.copy_image(
            SourceImageId=source_ami_id,
            SourceRegion=source_region,
            Name=name
        )
        dest_ami_id = response["ImageId"]

        print(f"AMI copy initiated. Destination AMI ID: {dest_ami_id}")
        STARTED_AMI_COPIES.append(source_ami_id)
        waiter = ec2_dest.get_waiter("image_available")
        print(f"Waiting for AMI {dest_ami_id} to be available...")

        waiter.wait(
            ImageIds=[dest_ami_id],
            WaiterConfig={
                "Delay": 300,
                "MaxAttempts": 15  # ~30 minutes
            }
        )

        print(f"AMI {dest_ami_id} is ready")
        SUCCESSFUL_AMI_COPIES.append(source_ami_id)
        return dest_ami_id

    except WaiterError as e:
        print(
            f"[TIMEOUT] AMI copy did not complete in time. "
            f"Source AMI: {source_ami_id}"
        )
        FAILED_AMI_COPIES.append(source_ami_id)
        return None

    except ClientError as e:
        print(
            f"[ERROR] AMI copy failed. "
            f"Source AMI: {source_ami_id} | Error: {e}"
        )
        FAILED_AMI_COPIES.append(source_ami_id)
        return None


# AMI already copied in destination region
def ami_already_copied(ami_name):
    response = ec2_dest.describe_images(
        Owners=["self"],  # only check your account
        Filters=[{"Name": "name", "Values": [ami_name]}]
    )

    images = response.get("Images", [])
    if images:
        # Return the existing AMI ID
        images.sort(key=lambda x: x["CreationDate"], reverse=True)
        return images[0]["ImageId"]
    return None


# ===== CREATE NEW CONFIG ITEM =====
def create_new_config_item(old_item, new_ami_id, new_vpc_id, security_group_id, availability_zone):
    # Make a deep copy of the old item
    new_item = copy.deepcopy(old_item)

    # Update AMI, VPC, and Subnets
    new_item['amiId'] = new_ami_id
    new_item['vpcId'] = new_vpc_id
    new_item['subnetIds'] = availability_zone
    new_item['securityGroupId'] = security_group_id
    new_item['region'] = DEST_REGION
    new_item['GPK1'] = DEST_REGION
    new_item['GSK1'] = old_item['configId']
    # Generate a new configId for uniqueness
    new_item['configId'] = f"{old_item['configId']}_{DEST_REGION}"

    # Put the new item into DynamoDB
    config_table.put_item(Item=new_item)
    print(f"Created new config item: {new_item['configId']}")
    return new_item['configId']


def get_instance_pricing_by_config_id(config_id):
    response = pricing_table.get_item(
        Key={"configId": config_id}
    )

    item = response.get("Item")
    return item


def insert_new_instance_pricing(
        old_pricing_item,
        new_config_id,
        new_region
):
    new_item = copy.deepcopy(old_pricing_item)

    # update required fields
    new_item["configId"] = new_config_id
    new_item["region"] = new_region

    pricing_table.put_item(Item=new_item)


def get_ssd_pricing_by_region(region):
    items = []

    response = ssd_pricing_table.query(
        KeyConditionExpression=Key("region").eq(region)
    )
    items.extend(response.get("Items", []))

    while "LastEvaluatedKey" in response:
        response = ssd_pricing_table.query(
            KeyConditionExpression=Key("region").eq(region),
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response.get("Items", []))

    return items


def insert_ssd_pricing_for_new_region(
        ssd_items,
        new_region
):
    for ssd_item in ssd_items:
        print(
            f"Processing volumeType={ssd_item['volumeType']} "
            f"size={ssd_item['size']}"
        )

        # create new item for another region
        new_item = ssd_item.copy()
        new_item["region"] = new_region

        ssd_pricing_table.put_item(
            Item=new_item
        )


# ===== MAIN =====
def main():
    # 1. region, subnet wise vm count data insertion
    put_subnet_vm_counts(region=DEST_REGION, subnet_vm_json_data=SUBNET_VM_JSON)

    # SSD pricing
    ssd_pricing_items = get_ssd_pricing_by_region(SOURCE_REGION)
    if ssd_pricing_items is not None:
        insert_ssd_pricing_for_new_region(ssd_pricing_items, DEST_REGION)

    # 2. Take all config data for region us-east-1
    configs = get_all_config_items()

    for config in configs:
        config_id = config.get("configId")
        source_ami_id = config.get("amiId")
        print(f"\nProcessing Config: {config_id} | AMI: {source_ami_id}")

        # Instance pricing
        pricing_item = get_instance_pricing_by_config_id(config_id)

        # Take ami_name from source region
        ami_name = get_existing_ami_name(source_ami_id)

        # check ami already copied or not
        existing_ami_id = ami_already_copied(ami_name)

        if existing_ami_id is None:
            # Copy AMI to new region
            new_ami_id = copy_ami(source_ami_id, ami_name)

            if new_ami_id is None:
                print(
                    f"Skipping config {config_id} due to AMI copy failure. "
                    f"AMI: {source_ami_id}"
                )
                continue
            # Create new config item with new AMI, VPC, and Subnets
            new_config_id = create_new_config_item(config, new_ami_id, VPC_ID, SECURITY_GROUP_ID, AVAILABILITY_ZONE)

            if pricing_item is not None:
                insert_new_instance_pricing(pricing_item, new_config_id, DEST_REGION)
        else:
            # Create new config item with new AMI, VPC, and Subnets
            new_config_id = create_new_config_item(config, existing_ami_id, VPC_ID, SECURITY_GROUP_ID,
                                                   AVAILABILITY_ZONE)
            if pricing_item is not None:
                insert_new_instance_pricing(pricing_item, new_config_id, DEST_REGION)
    print("\n================ SUMMARY ================")

    print("\nFailed / Timed-out AMIs:")
    for item in FAILED_AMI_COPIES:
        print(item)


if __name__ == "__main__":
    main()
