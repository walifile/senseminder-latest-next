import json
import boto3
import os
import re
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Attr
import decimal
import logging
import traceback

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Environment variables
TICKETS_TABLE = dynamodb.Table(os.environ.get('TICKETS_TABLE', 'SmartPCSupportTickets'))
MESSAGES_TABLE = dynamodb.Table(os.environ.get('MESSAGES_TABLE', 'SmartPCSupportMessages'))
ATTACHMENTS_BUCKET = os.environ['ATTACHMENTS_BUCKET']
if not ATTACHMENTS_BUCKET:
    raise RuntimeError("Missing required env var: ATTACHMENTS_BUCKET")
NOTIF_TABLE = boto3.resource("dynamodb").Table("SMS-Notification")
INTERNAL_USER_TABLE = boto3.resource('dynamodb').Table('senseminder-user')

# ---- logging config ----
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()  # INFO|WARNING|ERROR
logger = logging.getLogger()
logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

def put_notification(user_id: str, notif_type: str, ticket_id: str, content: str, route: str):
    now = utc_now_iso()  # use your existing utc_now_iso()
    NOTIF_TABLE.put_item(Item={
        "userId": user_id,
        "timestamp": now,
        "type": notif_type,
        "ticketId": ticket_id,
        "content": content,
        "route": route,
    })


def utc_now_iso():
    # ISO 8601 with explicit UTC "Z"
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def _event_brief(ev):
    rc = (ev.get("requestContext") or {})
    http = (rc.get("http") or {})
    return {
        "method": http.get("method") or ev.get("httpMethod"),
        "rawPath": ev.get("rawPath") or http.get("path") or ev.get("path"),
        "stage": rc.get("stage"),
        "hasHeaders": bool(ev.get("headers")),
        "hasBody": ev.get("body") is not None,
        "isB64": bool(ev.get("isBase64Encoded")),
    }

# --------------------------------------------
# Main Handler
# --------------------------------------------

def lambda_handler(event, context):
    try:
        # minimal success log at the very end (see below)
        # normalize headers
        event['headers'] = {k.lower(): v for k, v in (event.get('headers') or {}).items()}

        # HTTP API v2.0 shape
        method = event['requestContext']['http']['method']
        raw_path = event.get('rawPath') or event['requestContext']['http'].get('path') or '/'
        path = _strip_stage_prefix(raw_path, event)

        # CORS preflight
        if method == 'OPTIONS':
            # no body dump, quiet success
            return response(200, {'message': 'CORS preflight allowed'}, event)

        # ---- your existing router below unchanged, but pass `event` to response() ----
        if method == 'GET' and path == '/tickets':
            return list_tickets(event)

        if method == 'GET' and path.startswith('/ticket/') and not path.endswith('/messages'):
            ticket_id = path.split('/')[-1]
            return get_ticket(ticket_id, event)

        if method == 'POST' and path == '/ticket':
            return create_ticket(event)

        if method == 'PATCH' and path.endswith('/status'):
            ticket_id = path.split('/')[-2]
            return update_ticket_status(ticket_id, event)
        
        if method == 'PATCH' and path.endswith('/priority'):
            ticket_id = path.split('/')[-2]
            return update_ticket_priority(ticket_id, event)

        if method == 'PATCH' and path.endswith('/assign'):
            ticket_id = path.split('/')[-2]
            return assign_ticket(ticket_id, event)

        if method == 'GET' and path.endswith('/messages'):
            ticket_id = path.split('/')[-2]
            return get_ticket_messages(ticket_id, event)

        if method == 'POST' and path.endswith('/message'):
            ticket_id = path.split('/')[-2]
            return post_message(ticket_id, event)

        if method == 'POST' and path.endswith('/presign-upload'):
            ticket_id = path.split('/')[-2]
            return generate_presigned_upload(ticket_id, event)

        if method == 'POST' and path == '/presign-upload-2':
            return generate_presigned_upload_without_ticket(event)

        if method == 'POST' and path.endswith('/presign-download'):
            ticket_id = path.split('/')[-2]
            return generate_presigned_download(ticket_id, event)

        return response(404, {'error': 'Route not found', 'path': path}, event)

    except Exception as e:
        # VERBOSE on error: brief event snapshot + stack trace
        logger.exception({
            "msg": "Unhandled exception in handler",
            "eventBrief": _event_brief(event),
            "topKeys": list(event.keys())
        })
        # Return sanitized error (details in logs)
        return response(500, {'error': 'Internal server error'}, event)

def list_tickets(event):
    auth_user = get_authenticated_user(event)
    res = TICKETS_TABLE.scan()
    items = res.get('Items', [])

    for t in items:
        if 'userId' not in t:
            print(f"⚠️ Skipping malformed ticket: {t}")

    user_tickets = [t for t in items if t.get('userId') == auth_user]
    return response(200, {"tickets": user_tickets}, event)

def get_ticket(ticket_id, event):
    auth_user = get_authenticated_user(event)
    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')

    if not ticket:
        return response(404, {'error': 'Ticket not found'})

    if ticket['userId'] != auth_user:
        return response(403, {'error': 'Unauthorized access'})

    return response(200, ticket)

def create_ticket(event):
    body = json.loads(event['body'])
    auth_user = get_authenticated_user(event)

    if body.get('userId') != auth_user:
        return response(403, {'error': 'userId mismatch'})

    # ticket_id = f"TKT-{int(datetime.utcnow().timestamp())}"
    # now = datetime.utcnow().isoformat()

    # item = {
    #     'ticketId': ticket_id,
    #     'userId': auth_user,
    #     'subject': body['subject'],
    #     'description': body['description'],
    #     'status': 'open',
    #     'priority': body.get('priority', 'medium'),
    #     'category': body.get('category', 'General'),
    #     'assignedTo': 'Unassigned',
    #     'createdAt': now,
    #     'lastUpdated': now,
    #     'attachments': body.get('attachments', []),
    #     'email': body.get('email'),
    #     'role': body.get('role')
    # }
    # Lookup owner_id if role is not owner
    role = body.get('role', 'member')
    email = body.get('email', '')

    # owner_id = ""  # fallback to self
    # if role != "owner" and email:
    #     user_record = INTERNAL_USER_TABLE.get_item(Key={'email': email}).get('Item')
    #     if user_record and "owner_id" in user_record:
    #         owner_id = user_record["owner_id"]
    # Default to self so ownerId is never empty
    owner_id = auth_user
    # organization = ""  
    # if role != "owner" and email:
    #     user_record = INTERNAL_USER_TABLE.get_item(Key={'email': email}).get('Item')
    #     if user_record and user_record.get("owner_id"):
    #         owner_id = user_record["owner_id"]
    organization = ""
    if email:
        user_record = INTERNAL_USER_TABLE.get_item(Key={'email': email}).get('Item')
        if user_record:
            organization = user_record.get("organization", "")
            if role != "owner" and user_record.get("owner_id"):
                owner_id = user_record["owner_id"]

    ticket_id = f"TKT-{int(datetime.now(timezone.utc).timestamp())}"
    now = utc_now_iso()
    item = {
        'ticketId': ticket_id,
        'userId': auth_user,
        'subject': body['subject'],
        'description': body['description'],
        'status': 'open',
        'priority': body.get('priority', 'medium'),
        'category': body.get('category', 'General'),
        'assignedTo': 'Unassigned',
        'createdAt': now,
        'lastUpdated': now,
        'attachments': body.get('attachments', []),
        'email': email,
        'role': role,
        'ownerId': owner_id,  # New field
        'organization': organization

        
    }


    TICKETS_TABLE.put_item(Item=item)


    # insert global notification
    try:
        NOTIF_TABLE.put_item(Item={
            "userId": "GLOBAL",
            "timestamp": now,
            "type": "ticket-created",
            "ticketId": ticket_id,
            "content": f"A new support ticket was created: {ticket_id}",
            "route": f"/support/ticket/{ticket_id}"
        })
        print(f"Global notification inserted for ticket {ticket_id}")
    except Exception as e:
        print(f"Failed to insert global notification: {str(e)}")

    return response(201, {'ticketId': ticket_id})


def update_ticket_status(ticket_id, event):
    body = json.loads(event['body'])
    new_status = body.get('status')
    if not new_status:
        return response(400, {'error': 'Missing status'})

    auth_user = get_authenticated_user(event)
    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
    if not ticket:
        return response(404, {'error': 'Ticket not found'})

    current_status = ticket.get('status', 'open')
    if current_status == 'closed':
        return response(403, {'error': 'Cannot update a closed ticket'})

    #  Optional: Prevent user from setting other statuses
    user_id = ticket.get('userId')
    if auth_user == user_id and new_status != 'resolved':
        return response(403, {'error': 'Users can only mark tickets as resolved'})

    TICKETS_TABLE.update_item(
        Key={'ticketId': ticket_id},
        UpdateExpression='SET #s = :s, lastUpdated = :lu',
        ExpressionAttributeNames={'#s': 'status'},
        ExpressionAttributeValues={':s': new_status, ':lu': utc_now_iso()}
    )
    return response(200, {'message': 'Status updated'})


def assign_ticket(ticket_id, event):
    body = json.loads(event['body'])
    assignee = body.get('assignedTo')
    if not assignee:
        return response(400, {'error': 'Missing assignedTo'})

    TICKETS_TABLE.update_item(
        Key={'ticketId': ticket_id},
        UpdateExpression='SET assignedTo = :a, lastUpdated = :lu',
        ExpressionAttributeValues={':a': assignee, ':lu': utc_now_iso()}
    )
    return response(200, {'message': 'Agent assigned'})

# --------------------------------------------
# Message Functions
# --------------------------------------------

def get_ticket_messages(ticket_id, event):
    auth_user = get_authenticated_user(event)
    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')

    if not ticket or ticket['userId'] != auth_user:
        return response(403, {'error': 'Unauthorized access'})

    res = MESSAGES_TABLE.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("ticketId").eq(ticket_id),
        ScanIndexForward=True,
    )

    #  Filter out internal notes
    # messages = [m for m in res.get('Items', []) if m.get('type') != 'internal-note']
    def clean_decimals(obj):
        if isinstance(obj, list):
            return [clean_decimals(i) for i in obj]
        if isinstance(obj, dict):
            return {k: clean_decimals(v) for k, v in obj.items()}
        if isinstance(obj, decimal.Decimal):
            return float(obj) if obj % 1 else int(obj)
        return obj

    # In get_ticket_messages()
    messages = [m for m in res.get('Items', []) if m.get('type') != 'internal-note']
    messages = clean_decimals(messages)

    return response(200, messages)

# def post_message(ticket_id, event):
#     auth_user = get_authenticated_user(event)
#     body = json.loads(event['body'])

#     ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
#     if not ticket:
#         return response(404, {'error': 'Ticket not found'})

#     if ticket['userId'] != auth_user and body.get('senderType') != 'agent':
#         return response(403, {'error': 'Unauthorized to post on this ticket'})

#     now = datetime.utcnow().isoformat()
#     message = {
#         'ticketId': ticket_id,
#         'timestamp': now,
#         'messageId': f"MSG-{int(datetime.utcnow().timestamp())}",
#         'senderId': auth_user,
#         'senderType': body.get('senderType', 'customer'),
#         'type': body.get('type', 'message'),
#         'content': body['content'],
#         'attachments': body.get('attachments', [])
#     }

#     MESSAGES_TABLE.put_item(Item=message)
#     send_message_to_subscribers(ticket_id, message)
#     try:
#         print(f"Attempting to send message to subscribers. Ticket: {ticket_id}")
#         print(f"Message Payload: {json.dumps(message)}")
#         send_message_to_subscribers(ticket_id, message)
#         print(f"Message dispatched to subscribers for ticket {ticket_id}")
#     except Exception as e:
#         print(f"Failed to send message to WebSocket subscribers: {str(e)}")


#     return response(201, {'messageId': message['messageId']})



def post_message(ticket_id, event):
    auth_user = get_authenticated_user(event)
    body = json.loads(event['body'])

    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
    if not ticket:
        return response(404, {'error': 'Ticket not found'})

    if ticket['userId'] != auth_user and body.get('senderType') != 'agent':
        return response(403, {'error': 'Unauthorized to post on this ticket'})

    if ticket.get("status") == "closed":
        return response(403, {'error': 'Ticket is closed and cannot be replied to'})

    now = utc_now_iso()
    message = {
        'ticketId': ticket_id,
        'timestamp': now,
        'messageId': f"MSG-{int(datetime.now(timezone.utc).timestamp())}",
        'senderId': auth_user,
        'senderType': body.get('senderType', 'customer'),
        'type': body.get('type', 'message'),
        'content': body['content'],
        'attachments': body.get('attachments', [])
    }

    MESSAGES_TABLE.put_item(Item=message)


    # fetch ticket once (you already have `ticket`)
    assignee = ticket.get("assignedTo")
    if assignee and assignee != "Unassigned":
        put_notification(
            user_id=assignee,
            notif_type="ticket-reply",
            ticket_id=ticket_id,
            content=f"New reply on ticket {ticket_id}",
            route=f"/support/ticket/{ticket_id}",
        )
    else:
        put_notification(
            user_id="GLOBAL",
            notif_type="ticket-reply",
            ticket_id=ticket_id,
            content=f"New reply on unassigned ticket {ticket_id}",
            route=f"/support/ticket/{ticket_id}",
        )


    # Determine new status
    current_status = ticket.get("status", "open")
    new_status = current_status
    if current_status == "resolved":
        new_status = "in-progress"

    # Update ticket with lastUpdated and possibly status
    update_expr = 'SET lastUpdated = :lu'
    expr_values = {':lu': now}

    if new_status != current_status:
        update_expr += ', #s = :s'
        expr_values[':s'] = new_status
        expr_names = {'#s': 'status'}
    else:
        expr_names = {}

    # TICKETS_TABLE.update_item(
    #     Key={'ticketId': ticket_id},
    #     UpdateExpression=update_expr,
    #     ExpressionAttributeNames=expr_names,
    #     ExpressionAttributeValues=expr_values
    # )
    update_args = {
    'Key': {'ticketId': ticket_id},
    'UpdateExpression': update_expr,
    'ExpressionAttributeValues': expr_values
    }

    if expr_names:
        update_args['ExpressionAttributeNames'] = expr_names

    TICKETS_TABLE.update_item(**update_args)


    # Send WebSocket notification
    try:
        send_message_to_subscribers(ticket_id, message)
    except Exception as e:
        print(f"WebSocket dispatch failed: {str(e)}")

    return response(201, {'messageId': message['messageId']})


# --------------------------------------------
# S3 Upload (Presigned URL)
# --------------------------------------------

def generate_presigned_upload(ticket_id, event):
    auth_user = get_authenticated_user(event)
    body = json.loads(event['body'])

    file_name = body.get('fileName')
    file_type = body.get('fileType')
    file_size = body.get('fileSize')

    ALLOWED_TYPES = ["image/png", "image/jpeg"]
    MAX_SIZE_BYTES = 3 * 1024 * 1024

    if not file_name or not file_type or file_size is None:
        return response(400, {'error': 'Missing fileName, fileType, or fileSize'})

    if file_type.lower() not in ALLOWED_TYPES:
        return response(400, {'error': 'Only PNG and JPEG screenshots are allowed'})

    if file_size > MAX_SIZE_BYTES:
        return response(400, {'error': 'File size exceeds 3MB limit'})

    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
    if not ticket or ticket['userId'] != auth_user:
        return response(403, {'error': 'Unauthorized to upload to this ticket'})

    safe_name = sanitize_filename(file_name)
    object_key = f"{ticket_id}/{datetime.now(timezone.utc).timestamp()}_{safe_name}"

    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': ATTACHMENTS_BUCKET,
                'Key': object_key,
                'ContentType': file_type
            },
            ExpiresIn=300
        )

        return response(200, {
            'uploadUrl': presigned_url,
            'fileKey': object_key
        })

    except Exception as e:
        return response(500, {'error': str(e)})

# --------------------------------------------
# Helpers
# --------------------------------------------
def _strip_stage_prefix(raw_path, event):
    """Strip the actual API Gateway stage prefix, if present."""
    rc = (event.get('requestContext') or {})
    stage = rc.get('stage')
    if not stage:
        return raw_path
    prefix = f'/{stage}'
    if raw_path == prefix:
        return '/'
    if raw_path.startswith(prefix + '/'):
        return raw_path[len(prefix):]  # keep leading '/'
    return raw_path

def get_authenticated_user(event):
    return (event.get('headers') or {}).get('x-user-id')

def sanitize_filename(filename):
    name = os.path.basename(filename)
    name = re.sub(r'[^A-Za-z0-9._-]', '_', name)
    name = re.sub(r'_+', '_', name)
    return name[:50]

def response(status, body, event=None):
    # Quiet success: one-line structured INFO
    if status < 400:
        logger.info({
            "status": status,
            "route": (_event_brief(event).get("rawPath") if event else None),
            "method": (_event_brief(event).get("method") if event else None)
        })
    else:
        # Verbose on errors: include body (safe), brief event info
        logger.warning({
            "status": status,
            "body": body,
            "eventBrief": (_event_brief(event) if event else None)
        })

    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,x-user-id',
            'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }

def generate_presigned_download(ticket_id, event):
    body = json.loads(event['body'])
    file_key = body.get("fileKey")
    if not file_key:
        return response(400, {"error": "Missing fileKey"})

    user_id = event['headers'].get('x-user-id')
    if not user_id:
        return response(403, {"error": "Missing user identity"})

    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
    if not ticket:
        return response(404, {"error": "Ticket not found"})

    if ticket.get("userId") != user_id:
        return response(403, {"error": "Unauthorized: not your ticket"})

    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': ATTACHMENTS_BUCKET,
                'Key': file_key,
                'ResponseContentDisposition': f'attachment; filename="{os.path.basename(file_key)}"'
            },
            ExpiresIn=300
        )
        return response(200, {"downloadUrl": url})
    except Exception as e:
        return response(500, {"error": str(e)})



def generate_presigned_upload_without_ticket(event):
    auth_user = get_authenticated_user(event)
    body = json.loads(event['body'])

    file_name = body.get('fileName')
    file_type = body.get('fileType')
    file_size = body.get('fileSize')

    ALLOWED_TYPES = ["image/png", "image/jpeg"]
    MAX_SIZE_BYTES = 3 * 1024 * 1024

    if not file_name or not file_type or file_size is None:
        return response(400, {'error': 'Missing fileName, fileType, or fileSize'})

    if file_type.lower() not in ALLOWED_TYPES:
        return response(400, {'error': 'Only PNG and JPEG allowed'})

    if file_size > MAX_SIZE_BYTES:
        return response(400, {'error': 'File size exceeds 3MB limit'})

    safe_name = sanitize_filename(file_name)
    object_key = f"temp/{datetime.now(timezone.utc).timestamp()}_{safe_name}"

    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': ATTACHMENTS_BUCKET,
                'Key': object_key,
                'ContentType': file_type
            },
            ExpiresIn=300
        )
        return response(200, {
            'uploadUrl': presigned_url,
            'fileKey': object_key
        })
    except Exception as e:
        return response(500, {'error': str(e)})


def update_ticket_priority(ticket_id, event):
    body = json.loads(event['body'])
    new_priority = body.get('priority')
    if new_priority not in ['low', 'medium', 'high']:
        return response(400, {'error': 'Invalid priority value'})

    auth_user = get_authenticated_user(event)
    ticket = TICKETS_TABLE.get_item(Key={'ticketId': ticket_id}).get('Item')
    if not ticket or ticket['userId'] != auth_user:
        return response(403, {'error': 'Unauthorized'})

    if ticket.get("status") == "closed":
        return response(403, {'error': 'Cannot update closed ticket'})

    TICKETS_TABLE.update_item(
        Key={'ticketId': ticket_id},
        UpdateExpression='SET priority = :p, lastUpdated = :lu',
        ExpressionAttributeValues={
            ':p': new_priority,
            ':lu': utc_now_iso()
        }
    )

    return response(200, {'message': 'Priority updated'})
