import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import os
from urllib.parse import unquote

# Initialize DynamoDB resource
region = os.environ["AWS_REGION_NAME"]
dynamodb = boto3.resource('dynamodb', region_name=region)
billing_table = dynamodb.Table('SmartPCStorageBilling')

def lambda_handler(event, context):
    
    method = event.get("httpMethod")
    # Handle CORS
    if method == "OPTIONS":
        return _response(200, {})

    try:
        print(f"Raw event: {json.dumps(event)}")
        # Extract user identity from Cognito token claims
        claims = event['requestContext']['authorizer']['claims']
        user_email = claims.get('email')
        user_role = claims.get('custom:role') or claims.get('role')  # use custom if defined
        user_id = claims.get('sub')
        
        if not user_email or not user_role or not user_id:
            return _response(400, {"message": "Missing identity information from token"})

        if not user_id:
            return _response(400, {'error': 'Missing userId in request'})

        print(f"User ID: {user_id}")

        if not is_action_allowed(user_role):
            return _response(403, {"message": "Members are not allowed to retrieve storage usage history"})
        
        owner_id = get_owner_id(claims)
        print(f"Owner ID: {owner_id}")

        # Parse query parameters
        params = event.get('queryStringParameters', {}) or {}
        
        start_date = params.get("startDate")
        end_date = params.get("endDate")
        page_size = min(int(params.get("pageSize", "10")), 100)
        last_evaluated_key_param = params.get("lastEvaluatedKey")
        
        # Parse lastEvaluatedKey
        last_evaluated_key = None
        if last_evaluated_key_param:
            try:
                # URL decode and parse JSON
                decoded_key = unquote(last_evaluated_key_param)
                last_evaluated_key = json.loads(decoded_key)
                print(f"Parsed lastEvaluatedKey: {last_evaluated_key}")
                
                # Validate the key structure
                required_fields = ['userId', 'timestamp']
                if not all(field in last_evaluated_key for field in required_fields):
                    print(f"Invalid lastEvaluatedKey structure. Expected fields: {required_fields}")
                    return _response(400, {
                        'error': 'Invalid lastEvaluatedKey format',
                        'message': 'lastEvaluatedKey must contain userId and timestamp'
                    })
                    
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"Error parsing lastEvaluatedKey: {str(e)}")
                return _response(400, {
                    'error': 'Invalid lastEvaluatedKey format',
                    'message': 'lastEvaluatedKey must be a valid JSON string'
                })
               
               
        print(f"Searching for userId: {owner_id}, last_evaluated_key: {last_evaluated_key}, start_date: {start_date}, end_date: {end_date}, page_size: {page_size}")
        
        # Build the key condition expression
        key_condition = Key('userId').eq(owner_id)
        
        # Add timestamp range conditions if provided
        if start_date and end_date:
            try:
                # Validate date formats
                print(f"Added date range filter: {start_date} to {end_date}")
                datetime.strptime(start_date, '%Y-%m-%d')
                datetime.strptime(end_date, '%Y-%m-%d')
                # Convert to full timestamp range for the day
                start_timestamp = f"{start_date}T00:00:00"
                end_timestamp = f"{end_date}T23:59:59"
                print(f"Added date range filter: {start_timestamp} to {end_timestamp}")
                key_condition = key_condition & Key('timestamp').between(start_timestamp, end_timestamp)
            except ValueError:
                return _response(400,
                    {
                        'error': 'Invalid date format',
                        'message': 'Please provide dates in ISO format (YYYY-MM-DD)'
                    })
        elif start_date:
            try:
                print(f"Added start date filter: {start_date}")
                datetime.strptime(start_date, '%Y-%m-%d')
                start_timestamp = f"{start_date}T00:00:00"
                key_condition = key_condition & Key('timestamp').gte(start_timestamp)
            except ValueError:
                return _response(400,
                    {
                        'error': 'Invalid startDate format',
                        'message': 'Please provide startDate in ISO format (YYYY-MM-DD)'
                    })
        elif end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
                end_timestamp = f"{end_date}T23:59:59"
                key_condition = key_condition & Key('timestamp').lte(end_timestamp)
                print(f"Added end date filter: {end_date}")
            except ValueError:
                return _response(400,
                    {
                        'error': 'Invalid endDate format',
                        'message': 'Please provide endDate in ISO format (YYYY-MM-DD)'
                    })
        
        # Build query parameters
        query_kwargs = {
            'KeyConditionExpression': key_condition,
            'Limit': page_size,
            'ScanIndexForward': False  # descending order
        }

        if last_evaluated_key:
            query_kwargs['ExclusiveStartKey'] = last_evaluated_key
            print(f"Using pagination token for next page")
                
        
        # Execute query
        print(f"Executing query with parameters: {query_kwargs}")
        response = billing_table.query(**query_kwargs)
        
        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey')
        
        # Prepare response
        result = {
            'count': len(items),
            'items': items,
            'lastEvaluatedKey': last_evaluated_key if last_evaluated_key else None,
            'hasMore': bool(last_evaluated_key),
            'filters': {
                'startDate': start_date,
                'endDate': end_date,
                'pageSize': page_size
            }
        }
        
        print(f"Found {len(items)} items for userId: {owner_id}")
        
        return _response(200, result)
        
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return _response(500,{
                'error': 'Internal server error',
                'message': str(e)
            })
    

def _response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, default=str)
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