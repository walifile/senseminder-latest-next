import boto3
REGION = "us-east-1"
USER_POOL_ID = "us-east-1_vgBCKmL0c"  # for sms         us-east-1_CXnb2zxW8
CLIENT_ID = "2lknj90rkjmtkcnph06q6r93ug"  # for sms     6cv0c7j0o9jbbn5n0moang0117
AUTHORIZER_NAME = "CognitoAuthorizer"
apigw = boto3.client("apigatewayv2", region_name=REGION)

API_IDS_FOR_AUTHORIZATION_CREATION = [
    # "3vtjt7ugh2",
    # "30zi3v2wnf",
    # "sx6x319uq1",
    # "ydgjuusszh",
    # "ib7da6yyvf",
    # "e33pomxauh",
    # "hxmwrrakc6"
    # "bijv5mqt5l"
    # "lul5oxdwic"
    # "vj9idlbwf7"
#    "4oacxj1xyk"
]
API_IDS_FOR_AUTHORIZATION_ATTACHMENT = [
    # "3vtjt7ugh2",
    # "30zi3v2wnf",
    # "sx6x319uq1",
    # "ib7da6yyvf",
    # "e33pomxauh",
    # "hxmwrrakc6",
    # today 
    # "bijv5mqt5l",
    # "hxmwrrakc6",
    # "lul5oxdwic"
    # "vj9idlbwf7"
    # "ydgjuusszh"
    # "4oacxj1xyk"
]


API_IDS_FOR_AUTHORIZATION_DETACHMENT = [
    # "bijv5mqt5l",
    # "hxmwrrakc6",
    # "lul5oxdwic"
    "vj9idlbwf7"
    # "ydgjuusszh"
]



def create_authorizer(api_id):
    response = apigw.create_authorizer(
        ApiId=api_id,
        Name=AUTHORIZER_NAME,
        AuthorizerType="JWT",
        IdentitySource=["$request.header.Authorization"],
        JwtConfiguration={
            "Audience": [CLIENT_ID],
            "Issuer": f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}",
        },
    )
    print("Authorizer created:", response["AuthorizerId"])
    return response["AuthorizerId"]


def get_all_routes(api_id):
    routes = []
    response = apigw.get_routes(ApiId=api_id)

    routes.extend(response["Items"])
    while "NextToken" in response:
        response = apigw.get_routes(ApiId=api_id, NextToken=response["NextToken"])
        routes.extend(response["Items"])

    return routes


def attach_authorizer_to_routes(api_id, authorizer_id):
    routes = get_all_routes(api_id)

    for route in routes:
        route_id = route["RouteId"]
        route_key = route["RouteKey"]

        if "OPTIONS" in route_key:
            continue

        print(f"Securing route {route_key}")

        apigw.update_route(
            ApiId=api_id,
            RouteId=route_id,
            AuthorizationType="JWT",
            AuthorizerId=authorizer_id,
        )

def detach_authorizer_from_routes(api_id):
    routes = get_all_routes(api_id)

    for route in routes:
        route_id = route["RouteId"]
        route_key = route["RouteKey"]

        if "OPTIONS" in route_key:
            continue

        print(f"Removing auth from route {route_key}")

        apigw.update_route(
            ApiId=api_id,
            RouteId=route_id,
            AuthorizationType="NONE",
        )

def get_authorizer_id_by_name(api_id, authorizer_name="CognitoAuthorizer"):
    response = apigw.get_authorizers(ApiId=api_id)
    for auth in response["Items"]:
        if auth["Name"] == authorizer_name:
            return auth["AuthorizerId"]
    raise ValueError(f"Authorizer '{authorizer_name}' not found in API {api_id}")


def main():
    for api_id in API_IDS_FOR_AUTHORIZATION_CREATION:
        create_authorizer(api_id)

    for api_id in API_IDS_FOR_AUTHORIZATION_ATTACHMENT:
        authorizer_id = get_authorizer_id_by_name(api_id)
        attach_authorizer_to_routes(api_id, authorizer_id)

    for api_id in API_IDS_FOR_AUTHORIZATION_DETACHMENT:
        detach_authorizer_from_routes(api_id)


if __name__ == "__main__":
    main()
