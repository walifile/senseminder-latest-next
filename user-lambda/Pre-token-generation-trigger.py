# def lambda_handler(event, context):
#     user_attributes = event['request']['userAttributes']
#     role = user_attributes.get('custom:role')

#     if role:
#         event['response'] = {
#             'claimsOverrideDetails': {
#                 'claimsToAddOrOverride': {
#                     'custom:role': role
#                 }
#             }
#         }

#     return event


# def lambda_handler(event, context):
#     user_attributes = event['request']['userAttributes']

#     role = user_attributes.get('custom:role')
#     first_name = user_attributes.get('custom:firstName')
#     last_name = user_attributes.get('custom:lastName')

#     claims_to_add = {}

#     if role:
#         claims_to_add['custom:role'] = role
#     if first_name:
#         claims_to_add['custom:firstName'] = first_name
#     if last_name:
#         claims_to_add['custom:lastName'] = last_name

#     if claims_to_add:
#         event['response'] = {
#             'claimsOverrideDetails': {
#                 'claimsToAddOrOverride': claims_to_add
#             }
#         }

#     return event



# import boto3
# import os

# dynamodb = boto3.resource("dynamodb")
# USER_TABLE = os.environ.get("USER_TABLE_NAME", "senseminder-user")

# def lambda_handler(event, context):
#     user_attrs = event["request"]["userAttributes"]
#     email = user_attrs.get("email")

#     claims_to_add = {}

#     # Always include these attributes if present
#     role = user_attrs.get("custom:role")
#     first_name = user_attrs.get("custom:firstName")
#     last_name = user_attrs.get("custom:lastName")

#     if role:
#         claims_to_add["custom:role"] = role
#     if first_name:
#         claims_to_add["custom:firstName"] = first_name
#     if last_name:
#         claims_to_add["custom:lastName"] = last_name

#     # Default: everyone is onboarded = true
#     claims_to_add["custom:onboarded"] = "true"

#     try:
#         # Look up the user in senseminder-user table
#         table = dynamodb.Table(USER_TABLE)
#         resp = table.get_item(Key={"email": email})
#         record = resp.get("Item")

#         if record:
#             is_federated = record.get("federatedUser", False)
#             first_login = record.get("firstLogin", False)

#             # Special case: federated + firstLogin=true → not onboarded
#             if is_federated and first_login is True:
#                 claims_to_add["custom:onboarded"] = "false"

#     except Exception as e:
#         print(f"[PreToken] DynamoDB lookup failed for email {email}: {str(e)}")
#         # Fail safe: keep custom:onboarded = true

#     # Inject claims into the ID token
#     event["response"] = {
#         "claimsOverrideDetails": {
#             "claimsToAddOrOverride": claims_to_add
#         }
#     }

#     return event




import boto3
import os

dynamodb = boto3.resource("dynamodb")
USER_TABLE = os.environ.get("USER_TABLE_NAME", "senseminder-user")

def lambda_handler(event, context):
    user_attrs = event["request"]["userAttributes"]
    email = user_attrs.get("email")

    claims_to_add = {}

    # Always include these attributes if present
    role = user_attrs.get("custom:role")

    if role:
        claims_to_add["custom:role"] = role

    # Default: everyone is onboarded = true
    claims_to_add["custom:onboarded"] = "true"

    try:
        # Look up the user in senseminder-user table
        table = dynamodb.Table(USER_TABLE)
        resp = table.get_item(Key={"email": email})
        record = resp.get("Item")

        if record:
            is_federated = record.get("federatedUser", False)
            first_login = record.get("firstLogin", False)
            # Special case: federated + firstLogin=true → not onboarded
            if is_federated and first_login is True:
                claims_to_add["custom:onboarded"] = "false"

    except Exception as e:
        print(f"[PreToken] DynamoDB lookup failed for email {email}: {str(e)}")
        # Fail safe: keep custom:onboarded = true

    # Inject claims into the ID token
    event["response"] = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": claims_to_add
        }
    }

    return event
