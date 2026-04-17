import json
import os
import boto3
from datetime import datetime
from decimal import Decimal

region = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=region)
wallet_table = dynamodb.Table("SmartPCWallet")
audit_table = dynamodb.Table("SmartPCUserAudit")

def lambda_handler(event, context):
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})
    
    try:
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')

        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        print(f"User ID: {user_id}")
        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})
        
        if not is_action_allowed(user_role):
            return _response(403, {"message": "Members are not allowed to retrieve recharge history"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        params = event.get("queryStringParameters") or {}
        print(f"Query params : {params}")
        start_date = params.get("startDate")
        end_date = params.get("endDate")
        page_size = min(int(params.get("pageSize", "10")), 100)
        last_evaluated_key = params.get("lastEvaluatedKey")

        # Build DynamoDB query expression
        key_condition_expr = "userId = :userId"
        expr_attr_values = {
            ":userId": owner_id,
            ":status_success": "SUCCESS",
            ":status_processed": "PROCESSED",
            ":recharge": "RECHARGE_WALLET",
            ":refund": "REFUND_PROCESSED",
            ":cashback": "CASHBACK_ADDED",
            ":promo": "PROMO_BALANCE_ADDED"
        }

        # Add date range filtering if provided
        if start_date and end_date:
            try:
                start_datetime = datetime.fromisoformat(start_date).replace(hour=0, minute=0, second=0, microsecond=0)
                end_datetime = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, microsecond=999999)
                key_condition_expr += " AND eventTimestamp BETWEEN :start_date AND :end_date"
                expr_attr_values[":start_date"] = start_datetime.isoformat()
                expr_attr_values[":end_date"] = end_datetime.isoformat()
            except Exception:
                return _response(400, {"error": "Invalid date format. Use YYYY-MM-DD"})
        elif start_date:
            try:
                start_datetime = datetime.fromisoformat(start_date).replace(hour=0, minute=0, second=0, microsecond=0)
                key_condition_expr += " AND eventTimestamp >= :start_date"
                expr_attr_values[":start_date"] = start_datetime.isoformat()
            except Exception:
                return _response(400, {"error": "Invalid date format. Use YYYY-MM-DD"})
        elif end_date:
            try:
                end_datetime = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, microsecond=999999)
                key_condition_expr += " AND eventTimestamp <= :end_date"
                expr_attr_values[":end_date"] = end_datetime.isoformat()
            except Exception:
                return _response(400, {"error": "Invalid date format. Use YYYY-MM-DD"})

        # Add filter for event types and status
        filter_expr = "#status IN (:status_success, :status_processed) AND (eventType = :recharge OR eventType = :refund OR eventType = :cashback OR eventType = :promo)"

        # Build query parameters with filter and limit
        query_params = {
            "KeyConditionExpression": key_condition_expr,
            "FilterExpression": filter_expr,
            "ExpressionAttributeValues": expr_attr_values,
            "ExpressionAttributeNames": {"#status": "status"},
            "ScanIndexForward": False  # Sort in descending order (newest first)
        }

        if last_evaluated_key:
            query_params["ExclusiveStartKey"] = json.loads(last_evaluated_key)

        print(f"Query params: {json.dumps(query_params, default=str)}")

        # Fetch records from DynamoDB (single query)
        response = audit_table.query(**query_params)
        items = response.get("Items", [])

        print(f" Returned after filter: {len(items)}")

        # Process items (limit to page_size)
        result = []
        has_more = False
        for record in items:
            if len(result) >= page_size:
                has_more = True
                break
            try:
                processed_record = process_audit_record(record)
                if processed_record:
                    result.append(processed_record)
            except Exception as e:
                print(f"Error processing record: {e}")
                continue

        print(f"Returning {len(result)} processed records")

        # Prepare pagination response
        next_key = None
        if len(result) > 0 and has_more:
            last_record = result[-1]
            next_key = json.dumps({
                "userId": last_record["userId"],
                "eventTimestamp": last_record["eventTimestamp"]
            })

        return _response(200, {
            "history": result,
            "hasMore": has_more,
            "lastEvaluatedKey": next_key
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return _response(500, {"error": str(e)})

def process_audit_record(record):
    """
    Process a single audit record and extract required fields based on event type
    """
    event_type = record.get("eventType")
    event_timestamp = record.get("eventTimestamp")
    user_id = record.get("userId")
    details = record.get("details", {})

    # Handle both string and dict for details
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except json.JSONDecodeError:
            print(f"Failed to parse details JSON: {details}")
            details = {}
    elif not isinstance(details, dict):
        details = {}

    # Extract amount based on event type
    amount = None
    if event_type == "RECHARGE_WALLET":
        amount = details.get("amount")
    elif event_type == "REFUND_PROCESSED":
        amount = details.get("amountProcessed")
    elif event_type == "CASHBACK_ADDED":
        amount = details.get("cashback_earned")
    elif event_type == "PROMO_BALANCE_ADDED":
        amount = details.get("amount")

    # Return the record with required fields
    return {
        "userId": user_id,
        "eventTimestamp": event_timestamp,
        "eventType": event_type,
        "amount": amount,
        "details": details
    }

def _json_safe(o):
    if isinstance(o, Decimal):
        return int(o) if o % 1 == 0 else float(o)
    if isinstance(o, dict):
        return {k: _json_safe(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_json_safe(v) for v in o]
    return o

def _response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        "body": json.dumps(_json_safe(body)),
    }

def is_action_allowed(role):
    """
    Checks if the current user is owner and admin
    - Returns True if user has owner role and admin role
    - Returns False  
    """
    print("[DEBUG] Checking access control for role:", role)
    if not role:
        print("[DEBUG] No user identity provided — Stop here")
        return False

    # Resolve ownerId based on role
    return True if role == "owner" or role == "admin" else False

def get_owner_id(claims):
    role = claims.get('custom:role') or claims.get('role')
    if role != "owner":
        return claims.get("custom:ownerid")
    else:
        return claims.get("sub")