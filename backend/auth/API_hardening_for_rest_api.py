import boto3

REGION = "us-east-1"
USER_POOL_ARN = "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_vgBCKmL0c" # sms     arn:aws:cognito-idp:us-east-1:463470969252:userpool/us-east-1_CXnb2zxW8
AUTHORIZER_NAME = "CognitoAuthorizer"
STAGE_NAME = "dev"

apigw = boto3.client("apigateway", region_name=REGION)

API_IDS_FOR_AUTHORIZER_CREATION = [
    # "ib7da6yyvf"
    # "558xjerom8"

]

API_IDS_FOR_AUTHORIZER_ATTACHMENT = [
    # "ib7da6yyvf"
    # today 
    "558xjerom8"

]

API_IDS_FOR_AUTHORIZER_DETACHMENT = [
    # "ib7da6yyvf"
    # "558xjerom8"
]

def create_authorizer(api_id):
    response = apigw.create_authorizer(
        restApiId=api_id,
        name=AUTHORIZER_NAME,
        type="COGNITO_USER_POOLS",
        providerARNs=[USER_POOL_ARN],
        identitySource="method.request.header.Authorization",
    )
    print(f"[{api_id}] Authorizer created: {response['id']}")
    return response["id"]


def get_authorizer_id_by_name(api_id):
    response = apigw.get_authorizers(restApiId=api_id)
    for item in response["items"]:
        if item["name"] == AUTHORIZER_NAME:
            return item["id"]
    raise ValueError(f"Authorizer not found in API {api_id}")


def get_all_resources(api_id):
    resources = []
    response = apigw.get_resources(restApiId=api_id)
    resources.extend(response["items"])

    while "position" in response:
        response = apigw.get_resources(restApiId=api_id, position=response["position"])
        resources.extend(response["items"])

    return resources


def attach_authorizer_to_all_methods(api_id, authorizer_id):
    resources = get_all_resources(api_id)

    for res in resources:
        if "resourceMethods" not in res:
            continue

        for method in res["resourceMethods"].keys():
            if method == "OPTIONS":
                continue

            print(f"[{api_id}] Securing {method} {res['path']}")

            apigw.update_method(
                restApiId=api_id,
                resourceId=res["id"],
                httpMethod=method,
                patchOperations=[
                    {"op": "replace", "path": "/authorizationType", "value": "COGNITO_USER_POOLS"},
                    {"op": "replace", "path": "/authorizerId", "value": authorizer_id},
                ],
            )

def detach_authorizer_from_all_methods(api_id):
    resources = get_all_resources(api_id)

    for res in resources:
        if "resourceMethods" not in res:
            continue

        for method in res["resourceMethods"].keys():
            if method == "OPTIONS":
                continue

            print(f"[{api_id}] Removing auth {method} {res['path']}")

            current = apigw.get_method(
                restApiId=api_id,
                resourceId=res["id"],
                httpMethod=method,
            )

            patch_ops = [
                {"op": "replace", "path": "/authorizationType", "value": "NONE"},
            ]

            if current.get("authorizerId"):
                patch_ops.append({"op": "replace", "path": "/authorizerId", "value": ""})

            request_params = current.get("requestParameters") or {}
            if "method.request.header.Authorization" in request_params:
                patch_ops.append(
                    {
                        "op": "replace",
                        "path": "/requestParameters/method.request.header.Authorization",
                        "value": "false",
                    }
                )

            apigw.update_method(
                restApiId=api_id,
                resourceId=res["id"],
                httpMethod=method,
                patchOperations=patch_ops,
            )

def deploy_api(api_id):
    apigw.create_deployment(
        restApiId=api_id,
        stageName=STAGE_NAME,
        description="Deployment after attaching Cognito authorizer",
    )
    print(f"[{api_id}] Deployed to stage {STAGE_NAME}")

def main():
    for api_id in API_IDS_FOR_AUTHORIZER_CREATION:
        create_authorizer(api_id)

    for api_id in API_IDS_FOR_AUTHORIZER_DETACHMENT:
        detach_authorizer_from_all_methods(api_id)
        deploy_api(api_id)

    for api_id in API_IDS_FOR_AUTHORIZER_ATTACHMENT:
        authorizer_id = get_authorizer_id_by_name(api_id)
        attach_authorizer_to_all_methods(api_id, authorizer_id)
        deploy_api(api_id)

if __name__ == "__main__":
    main()
