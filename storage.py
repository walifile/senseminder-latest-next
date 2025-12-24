import json
try:
    from decimal import Decimal  # for JSON-safe conversion
except Exception:
    Decimal = None
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta, timezone
import zipfile
import tempfile
import os
import uuid
import math
import re

# Initialize AWS clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
bucket_table = dynamodb.Table('SmartPCBuckets')
file_metadata_table = dynamodb.Table('SmartPCStorageMetadata')
usage_table = dynamodb.Table('SmartPCStorageUsage')  # NEW: monthly usage table
shares_table = dynamodb.Table('SmartPCShares')  # NEW: share control table
TTL_DAYS = 60
MAX_STORAGE_BYTES = 1024 ** 4  # 1 TB per-user limit

# ------------ Helpers (NEW) ------------
def _iso_now():
    return datetime.now(timezone.utc).isoformat()

def _parse_created_at(item: dict):
    """Return a timezone-aware datetime for the item's createdAt field."""
    if not isinstance(item, dict):
        return None
    created = item.get('createdAt')
    if not created:
        return None

    if isinstance(created, datetime):
        dt = created
    elif isinstance(created, str):
        created = created.strip()
        if not created:
            return None
        if created.endswith('Z'):
            created = f"{created[:-1]}+00:00"
        try:
            dt = datetime.fromisoformat(created)
        except Exception:
            return None
    else:
        return None

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

def _month_key(dt=None):
    dt = dt or datetime.now(timezone.utc)
    return dt.strftime('%Y-%m')

def _usage_pk(user_id, dt=None):
    return f"{user_id}#{_month_key(dt)}"

def _ensure_usage_row(user_id: str):
    """Create the monthly usage row if missing (idempotent)."""
    pk = _usage_pk(user_id)
    usage_table.update_item(
        Key={'userMonth': pk},
        UpdateExpression="""
          SET userId = if_not_exists(userId, :uid),
              #m = if_not_exists(#m, :mon),
              currentBytes = if_not_exists(currentBytes, :z),
              peakBytes = if_not_exists(peakBytes, :z),
              updatedAt = :now
        """,
        ExpressionAttributeNames={'#m': 'month'},
        ExpressionAttributeValues={
            ':uid': user_id, ':mon': _month_key(), ':z': 0, ':now': _iso_now()
        }
    )

def _update_usage_bytes(user_id: str, delta_bytes: int):
    """Apply +/- delta to currentBytes; never let it go below zero. Bump peak on increases."""
    _ensure_usage_row(user_id)
    pk = _usage_pk(user_id)
    delta = int(delta_bytes or 0)

    if delta >= 0:
        # Atomic ADD for increments
        updated = usage_table.update_item(
            Key={'userMonth': pk},
            UpdateExpression="SET currentBytes = currentBytes + :d, updatedAt = :now",
            ExpressionAttributeValues={':d': delta, ':now': _iso_now()},
            ReturnValues='ALL_NEW'
        )['Attributes']
        cur = int(updated.get('currentBytes', 0))
        peak = int(updated.get('peakBytes', 0))
        if cur > peak:
            usage_table.update_item(
                Key={'userMonth': pk},
                UpdateExpression="SET peakBytes = :p, updatedAt = :now",
                ExpressionAttributeValues={':p': cur, ':now': _iso_now()}
            )
    else:
        # SAFE DECREMENT: read, clamp to zero, then SET
        # (prevents negatives when deleting legacy/uncounted files or on double-deletes)
        current_item = usage_table.get_item(Key={'userMonth': pk}).get('Item', {})
        cur = int(current_item.get('currentBytes', 0))
        new_cur = cur + delta  # delta is negative
        if new_cur < 0:
            new_cur = 0
        usage_table.update_item(
            Key={'userMonth': pk},
            UpdateExpression="SET currentBytes = :c, updatedAt = :now",
            ExpressionAttributeValues={':c': new_cur, ':now': _iso_now()}
        )

def _soft_delete_item(item: dict):
    """Mark a metadata row as deleted and set TTL (60 days after deletedAt)."""
    deleted_at = _iso_now()
    ttl_val = _ttl_from_iso(deleted_at, TTL_DAYS)  # epoch seconds

    file_metadata_table.update_item(
        Key={'id': item['id']},
        UpdateExpression="SET isDeleted = :t, deletedAt = :d, #ttl = :ttl",
        ExpressionAttributeNames={'#ttl': 'ttl'}, 
        ExpressionAttributeValues={
            ':t': True,
            ':d': deleted_at,
            ':ttl': ttl_val
        }
    )



def _normalize_size_bytes(val):
    """
    Convert common size formats to bytes.
    Accepts: int/float bytes, or strings like '1.74 MB', '1.2MiB', '153 KB', '102400'.
    """
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        s = val.strip().lower()
        m = re.match(r'^([\d\.]+)\s*(b|kb|kib|mb|mib|gb|gib)?$', s)
        if m:
            num = float(m.group(1))
            unit = (m.group(2) or 'b')
            mult = {
                'b': 1,
                'kb': 1000,    'kib': 1024,
                'mb': 1000**2, 'mib': 1024**2,
                'gb': 1000**3, 'gib': 1024**3,
            }[unit]
            return int(num * mult)
        if s.isdigit():
            return int(s)
    try:
        return int(val)
    except Exception:
        return 0

def _size_to_int(val):
    """Robustly turn stored size (str/int/Decimal/'1.7 MB') into int bytes for sorting/math."""
    try:
        from decimal import Decimal
        if isinstance(val, Decimal):
            return int(val)
    except Exception:
        pass
    return _normalize_size_bytes(val)


def _get_user_storage_bytes(user_id: str) -> int:
    """Return the total bytes stored for a user (ignoring folders and soft-deleted files)."""
    response_db = file_metadata_table.query(
        IndexName='userId-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
    )
    files = response_db.get('Items', []) or []

    total_bytes = 0
    for f in files:
        if f.get('fileType') == 'folder' or f.get('isDeleted'):
            continue
        total_bytes += _size_to_int(f.get('size', 0))
    return total_bytes


def resolve_key_from_item(it, user_id: str):
    """
    Return (is_folder: bool, key_or_prefix: str|None) for a single 'items' entry.
    Supports:
      - string full keys or folder prefixes (ending with '/')
      - dicts: { key }  OR  { fileName, folder? }  OR  { folder }
    """
    if isinstance(it, dict):
        raw_key   = it.get('key')
        file_name = it.get('fileName')
        folder    = (it.get('folder') or '').strip().strip('/')

        if raw_key:
            # use as-is; detect folder by trailing slash
            return (raw_key.endswith('/'), raw_key)

        if file_name:
            if folder:
                return (False, f"{user_id}/uploads/{folder}/{file_name}")
            return (False, f"{user_id}/uploads/{file_name}")

        if folder:
            return (True, f"{user_id}/uploads/{folder}/")

        return (False, None)

    # string case
    s = (it or '').strip()
    if not s:
        return (False, None)
    if s.endswith('/'):
        return (True, s)  # folder prefix
    if s.startswith(f"{user_id}/"):
        return (False, s)  # full key already
    return (False, f"{user_id}/uploads/{s}")  # file in uploads root


def add_file_to_zip(s3_key: str, *, bucket_name: str, uploads_prefix: str,
                    temp_dir: str, zipf, added_keys: set):
    """Add a single S3 object to the open ZipFile, preserving path relative to uploads_prefix."""
    if not s3_key or s3_key.endswith('/'):
        return
    if s3_key in added_keys:
        return

    # ensure it exists
    try:
        s3.head_object(Bucket=bucket_name, Key=s3_key)
    except Exception as e:
        print(f"[share-multiple] skip missing: {s3_key} ({e})")
        return

    # relative path inside zip (strip 'userId/uploads/' if present)
    rel = s3_key[len(uploads_prefix):] if s3_key.startswith(uploads_prefix) else s3_key

    tmp_file = os.path.join(temp_dir, uuid.uuid4().hex)
    s3.download_file(bucket_name, s3_key, tmp_file)
    zipf.write(tmp_file, arcname=rel)
    os.remove(tmp_file)
    added_keys.add(s3_key)

def _split_name_ext(filename: str):
    """Return (base, ext) where ext includes the leading dot or ''."""
    if not filename:
        return filename, ''
    if '.' not in filename or filename.startswith('.'):
        return filename, ''
    base, ext = filename.rsplit('.', 1)
    return base, f'.{ext}'

def _strip_existing_counter(base: str):
    """
    'wali (1)' -> ('wali', 1)
    'wali(3)'  -> ('wali', 3)
    'wali'     -> ('wali', None)
    """
    m = re.match(r'^(.*?)[\s]*\((\d+)\)\s*$', base)
    if not m:
        return base, None
    core = m.group(1).rstrip()
    n = int(m.group(2))
    return core, n

def _exists_in_metadata(key: str) -> bool:
    return bool(file_metadata_table.get_item(Key={'id': key}).get('Item'))

def _exists_in_s3(bucket_name: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket_name, Key=key)
        return True
    except Exception:
        return False

def _key_conflicts(bucket_name: str, key: str) -> bool:
    # Treat as conflict if present in metadata (any state) OR present in S3
    return _exists_in_metadata(key) or _exists_in_s3(bucket_name, key)

def _ensure_unique_file_key(bucket_name: str, dest_folder_prefix: str, desired_filename: str):
    """
    Given a destination folder prefix (ends with '/') and a desired filename,
    return (final_filename, final_key) that does not conflict.
    """
    dest_folder_prefix = dest_folder_prefix if dest_folder_prefix.endswith('/') else dest_folder_prefix + '/'
    base, ext = _split_name_ext(desired_filename)
    core, n0 = _strip_existing_counter(base)

    # Try the plain core first if original didn't already contain a number.
    if n0 is None:
        key0 = f"{dest_folder_prefix}{core}{ext}"
        if not _key_conflicts_live(bucket_name, key0):
            return f"{core}{ext}", key0
        start = 1
    else:
        # If user is moving 'wali (1).png', start checking from 1, 2, 3... (not '(1)(1)')
        start = max(1, n0)  # start from its number or 1

    # Find the next available "core (i).ext"
    i = start
    while True:
        cand_name = f"{core} ({i}){ext}"
        cand_key = f"{dest_folder_prefix}{cand_name}"
        if not _key_conflicts_live(bucket_name, cand_key):
            return cand_name, cand_key
        i += 1

def _ensure_unique_folder_key(bucket_name: str, dest_parent_prefix: str, folder_name: str):
    """
    Ensure a unique folder key '.../FolderName/' under dest_parent_prefix (which ends with '/').
    Returns (final_folder_name, final_folder_key_with_trailing_slash).
    """
    dest_parent_prefix = dest_parent_prefix if dest_parent_prefix.endswith('/') else dest_parent_prefix + '/'
    base = folder_name.strip('/')

    core, n0 = _strip_existing_counter(base)
    # Try core/ first if no number embedded
    if n0 is None:
        key0 = f"{dest_parent_prefix}{core}/"
        if not _key_conflicts_live(bucket_name, key0):
            return core, key0
        start = 1
    else:
        start = max(1, n0)

    i = start
    while True:
        cand_name = f"{core} ({i})"
        cand_key = f"{dest_parent_prefix}{cand_name}/"
        if not _key_conflicts_live(bucket_name, cand_key):
            return cand_name, cand_key
        i += 1

def _key_conflicts_live(bucket_name: str, key: str) -> bool:
    """
    Return True if the key is 'taken' by a live (not soft-deleted) metadata row
    OR if the object already exists in S3. Soft-deleted metadata is ignored.
    """
    meta = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if meta and not meta.get('isDeleted'):
        return True
    # If no live metadata, consider it taken only if the object is really in S3
    return _exists_in_s3(bucket_name, key)


def _ttl_from_iso(iso_str: str, days: int = TTL_DAYS) -> int:
    """
    Returns epoch SECONDS for iso_str + days.
    Accepts '...Z' or '+00:00' variants. Falls back to now() if parse fails.
    """
    try:
        # Normalize 'Z' to '+00:00' for fromisoformat
        s = iso_str.replace('Z', '+00:00')
        base = datetime.fromisoformat(s)
        if base.tzinfo is None:
            base = base.replace(tzinfo=timezone.utc)
    except Exception:
        base = datetime.now(timezone.utc)
    return int((base + timedelta(days=days)).timestamp())


def _active_share_keys_for_user(user_id: str):
    """Return (exact_keys, folder_prefixes) for ACTIVE, non-expired shares."""
    exact = set()
    prefixes = set()
    try:
        now_epoch = int(datetime.now(timezone.utc).timestamp())
        # Scan by owner; for scale, add a GSI on ownerUserId
        resp = shares_table.scan(
            FilterExpression=(
                boto3.dynamodb.conditions.Attr('ownerUserId').eq(user_id) &
                boto3.dynamodb.conditions.Attr('status').eq('active')
            )
        )
        for it in resp.get('Items', []) or []:
            exp = it.get('expiresAt')
            try:
                exp_i = int(exp) if exp is not None else None
            except Exception:
                try:
                    exp_i = int(float(exp))
                except Exception:
                    exp_i = None
            if exp_i is not None and now_epoch > exp_i:
                continue
            ok = (it.get('objectKey') or '').strip()
            if not ok:
                continue
            base = ok.rstrip('/')
            exact.add(ok)
            exact.add(base)
            share_type = (it.get('type') or '').strip().lower()
            if share_type == 'folder' or ok.endswith('/'):
                prefixes.add(base + '/')
    except Exception as e:
        print(f"_active_share_keys_for_user error for {user_id}: {e}")
    return exact, prefixes


def _has_active_share_for_key(folder_key: str) -> bool:
    """Return True if an ACTIVE, non-expired share exists for folder_key.
    Accepts both with and without trailing slash to tolerate legacy records.
    """
    try:
        base = folder_key.rstrip('/')
        candidates = {base, base + '/', folder_key}
        now_epoch = int(datetime.now(timezone.utc).timestamp())
        for ok in candidates:
            try:
                resp = shares_table.scan(
                    FilterExpression=(
                        boto3.dynamodb.conditions.Attr('objectKey').eq(ok) &
                        boto3.dynamodb.conditions.Attr('status').eq('active')
                    )
                )
            except Exception as e:
                print(f"shares scan error for {ok}: {e}")
                continue
            for it in (resp.get('Items') or []):
                exp = it.get('expiresAt')
                try:
                    exp_i = int(exp) if exp is not None else None
                except Exception:
                    try:
                        exp_i = int(float(exp))
                    except Exception:
                        exp_i = None
                if exp_i is None or now_epoch <= exp_i:
                    return True
        return False
    except Exception as e:
        print(f"_has_active_share_for_key error: {e}")
        return False


# ---------------------------------------

def lambda_handler(event, context):
    try:
        print("Full Event:", json.dumps(event, indent=2))
        route_key = event.get('routeKey', '')
        print(f"Route Key: {route_key}")

        if route_key == "POST /upload":
            return handle_upload(event)
        elif route_key == "POST /upload-complete":
            return handle_upload_complete(event)
        elif route_key == "GET /download":
            return handle_download(event)
        elif route_key == "GET /list":
            return handle_list(event)
        elif route_key == "GET /list-hierarchy":
            return handle_hierarchy(event)
        elif route_key == "DELETE /delete":
            return handle_delete(event)
        elif route_key == "POST /delete-multiple":
            return handle_delete_multiple(event)
        elif route_key == "POST /create-folder":
            return handle_create_folder(event)
        elif route_key == "POST /star":
            return handle_star(event, starred=True)
        elif route_key == "POST /unstar":
            return handle_star(event, starred=False)
        elif route_key == "POST /share":
            return handle_share(event)
        elif route_key == "POST /share-multiple":
            return handle_share_multiple(event)
        elif route_key == "GET /public-shared-list":
            return handle_public_shared_list(event)
        elif route_key == "POST /move":
            return handle_move_or_copy(event, operation="move")
        elif route_key == "POST /copy":
            return handle_move_or_copy(event, operation="copy")
        elif route_key == "POST /rename":
            return handle_rename(event)
        elif route_key == "GET /usage":
            return handle_usage(event)
        elif route_key == "GET /download-folder":
            return handle_download_folder(event)
        elif route_key == "GET /shares":
            return handle_list_shares(event)
        elif route_key == "GET /shares/{shareId}":
            return handle_share_info(event)
        elif route_key == "GET /shares/{shareId}/download":
            return handle_share_download(event)
        elif route_key == "POST /shares/{shareId}/cancel":
            return handle_cancel_share(event)
        else:
            return response(400, {'message': 'Invalid HTTP method or path'})

    except ClientError as e:
        print(f"AWS Error: {e}")
        return response(500, {'message': 'AWS Error', 'error': str(e)})
    except Exception as e:
        print(f"Error: {e}")
        return response(500, {'message': 'Internal server error', 'error': str(e)})

# ----------------------------------------------------------------
# ✅ Upload / Download / List / Hierarchy
# ----------------------------------------------------------------

def handle_upload(event):
    body = json.loads(event['body']) if 'body' in event else event
    region = body.get('region')
    file_name = body.get('fileName')
    file_type = body.get('fileType', 'application/octet-stream')
    user_id = body.get('userId')

    # normalize size → bytes (safe for '1.74 MB', 102400, etc.)
    file_size_raw = body.get('size')
    file_size_bytes = _normalize_size_bytes(file_size_raw)

    status = body.get('status', 'private')
    starred = body.get('starred', False)
    folder = body.get('folder', '').strip().strip('/')

    if not region or not file_name or not user_id:
        return response(400, {'message': 'Region, fileName, and userId are required.'})

    # Resolve bucket
    bucket_response = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_response:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_response['Item']['bucketName']

    # Enforce per-user storage limit (1 TB)
    try:
        current_bytes = _get_user_storage_bytes(user_id)
    except Exception as e:
        print(f"Failed to calculate usage for {user_id}: {e}")
        return response(500, {'message': 'Unable to verify storage quota. Please try again later.'})

    if current_bytes + file_size_bytes > MAX_STORAGE_BYTES:
        return response(403, {
            'message': 'Storage limit exceeded. Delete files or upgrade your plan before uploading.',
            'currentBytes': current_bytes,
            'maxBytes': MAX_STORAGE_BYTES
        })

    # Build initial key
    base_name, ext = file_name.rsplit('.', 1) if '.' in file_name else (file_name, '')
    counter = 1
    final_file_name = file_name
    key = f"{user_id}/uploads/{folder}/{final_file_name}" if folder else f"{user_id}/uploads/{final_file_name}"
    print(f"Initial S3 Key: {key}")

    # Auto-rename loop (ignores soft-deleted metadata, still checks S3)
    while _key_conflicts_live(bucket_name, key):
        if ext:
            final_file_name = f"{base_name} ({counter}).{ext}"
        else:
            final_file_name = f"{base_name} ({counter})"
        key = f"{user_id}/uploads/{folder}/{final_file_name}" if folder else f"{user_id}/uploads/{final_file_name}"
        counter += 1

    # Presigned upload URL
    params = {'Bucket': bucket_name, 'Key': key, 'ContentType': file_type}
    print(f"Generating pre-signed URL with Bucket: {bucket_name}, Key: {key}, ContentType: {file_type}")
    upload_url = s3.generate_presigned_url('put_object', Params=params, ExpiresIn=3600)

    return response(200, {
        'uploadUrl': upload_url,
        'finalFileName': final_file_name,
        'key': key
    })

def handle_upload_complete(event):
    body = json.loads(event['body']) if 'body' in event else event
    region = body.get('region')
    file_name = body.get('fileName')
    user_id = body.get('userId')
    status = 'private'
    starred = False
    key = (body.get('key') or '').strip()

    if not region or not user_id:
        return response(400, {'message': 'Region and userId are required.'})

    if not key:
        if not file_name:
            return response(400, {'message': 'fileName or key is required.'})
        folder = body.get('folder', '').strip().strip('/')
        key = f"{user_id}/uploads/{folder}/{file_name}" if folder else f"{user_id}/uploads/{file_name}"
    else:
        # Derive folder + file name from key to avoid mismatched metadata
        rel = key[len(f"{user_id}/uploads/"):]
        if '/' in rel:
            folder, file_name = rel.rsplit('/', 1)
        else:
            folder, file_name = '', rel

    if not key.startswith(f"{user_id}/uploads/"):
        return response(400, {'message': 'Invalid key.'})

    bucket_response = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_response:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_response['Item']['bucketName']

    try:
        head = s3.head_object(Bucket=bucket_name, Key=key)
    except Exception as e:
        print(f"Upload complete head_object failed for {key}: {e}")
        return response(404, {'message': 'Uploaded object not found. Please retry upload.'})
    file_size_bytes = int(head.get('ContentLength') or 0)
    file_type = head.get('ContentType') or 'application/octet-stream'

    existing = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if existing and not existing.get('isDeleted'):
        return response(200, {
            'message': 'Upload already completed.',
            'finalFileName': existing.get('fileName', file_name)
        })

    # Re-check quota using actual object size
    try:
        current_bytes = _get_user_storage_bytes(user_id)
    except Exception as e:
        print(f"Failed to calculate usage for {user_id}: {e}")
        return response(500, {'message': 'Unable to verify storage quota. Please try again later.'})

    if current_bytes + file_size_bytes > MAX_STORAGE_BYTES:
        try:
            s3.delete_object(Bucket=bucket_name, Key=key)
        except Exception as e:
            print(f"Failed to delete over-quota upload {key}: {e}")
        return response(403, {
            'message': 'Storage limit exceeded. Delete files or upgrade your plan before uploading.',
            'currentBytes': current_bytes,
            'maxBytes': MAX_STORAGE_BYTES
        })

    file_metadata_table.put_item(
        Item={
            'id': key,
            'bucket': bucket_name,
            'fileName': file_name or key.split('/')[-1],
            'fileType': file_type,
            'region': region,
            'userId': user_id,
            'size': str(file_size_bytes),
            'status': status,
            'starred': starred,
            'createdAt': _iso_now(),
            'folder': folder,
            'isDeleted': False,
            'deletedAt': None,
        }
    )

    try:
        _update_usage_bytes(user_id, file_size_bytes)
    except Exception as e:
        print(f"Usage update failed on upload complete: {e}")

    print(f"Metadata saved to DynamoDB: {key}")
    return response(200, {'message': 'Upload completed', 'finalFileName': file_name})

def handle_download(event):
    query = event.get('queryStringParameters', {}) or {}
    region = query.get('region')
    user_id = query.get('userId')
    file_name = query.get('fileName')
    folder = query.get('folder')   # optional
    raw_key = query.get('key')     # optional

    if not region or not user_id or (not file_name and not raw_key):
        return response(400, {'message': 'region, userId, and fileName or key are required.'})

    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket for region {region}'})
    bucket = bucket_resp['Item']['bucketName']

    key = raw_key if raw_key else f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"
    download_name = key.split('/')[-1]

    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ResponseContentType': 'application/octet-stream',
                'ResponseContentDisposition': f'attachment; filename="{download_name}"'
            },
            ExpiresIn=3600
        )
    except ClientError as e:
        print(f"Presign error for {key}: {e}")
        return response(404, {'message': 'File not found or inaccessible.'})

    return response(200, {'downloadUrl': url})

def handle_list(event):
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        region = query_params.get('region')
        user_id = query_params.get('userId')
        filter_type = query_params.get('type')
        folder = query_params.get('folder')
        sort_by = query_params.get('sortBy', 'date')
        sort_order = query_params.get('sortOrder', 'desc')
        search_term = query_params.get('search')
        recursive = query_params.get('recursive', 'false').lower() == 'true'
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 20))
        modified_filter = (query_params.get('modified') or '').strip().lower()
        now_utc = datetime.now(timezone.utc)

        if not region or not user_id:
            return response(400, {'message': 'Region and userId are required.'})

        print(f"Querying files for userId: {user_id} in region: {region}")
        response_db = file_metadata_table.query(
            IndexName='userId-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )
        files = response_db.get('Items', [])
        if not files:
            return response(200, {'files': [], 'pagination': {'page': 1, 'limit': limit, 'total': 0, 'pages': 1, 'hasNext': False, 'hasPrevious': False}})

        # Region filter + hide soft-deleted
        files = [item for item in files if item.get('region') == region and not item.get('isDeleted')]

        def _filter_items_by_created(items, predicate):
            filtered = []
            for entry in items:
                created_dt = _parse_created_at(entry)
                if created_dt and predicate(created_dt):
                    filtered.append(entry)
            return filtered

        # Derive accurate 'shared' based on active share records (covers cancel/expiry)
        try:
            active_share_keys, active_share_prefixes = _active_share_keys_for_user(user_id)
            def _is_shared_key(k: str) -> bool:
                if not k:
                    return False
                if k in active_share_keys or k.rstrip('/') in active_share_keys:
                    return True
                for sk in active_share_prefixes:
                    if k.startswith(sk):
                        return True
                return False
            for it in files:
                k = it.get('id') or ''
                derived = _is_shared_key(k)
                it['shared'] = bool(derived)
                if not derived and it.get('status') == 'shared':
                    it['status'] = 'private'
        except Exception as e:
            print(f"derive shared failed: {e}")

        # Apply folder scoping when a folder is selected, even with filters.
        if folder:
            folder = folder.strip('/') + '/'
            folder_prefix = f"{user_id}/uploads/{folder}"
            folder_id = folder_prefix
            if recursive:
                files = [f for f in files if f['id'].startswith(folder_prefix) and f['id'] != folder_id]
            else:
                files = [
                    f for f in files
                    if f['id'].startswith(folder_prefix)
                    and f['id'] != folder_id
                    and '/' not in f['id'][len(folder_prefix):].strip('/')
                ]
        elif not filter_type:
            base_prefix = f"{user_id}/uploads/"
            files = [
                f for f in files
                if f['id'].startswith(base_prefix)
                and '/' not in f['id'][len(base_prefix):].strip('/')
            ]

        if filter_type and not folder:
            ft = filter_type.lower()
            if 'image' in ft:
                files = [f for f in files if f.get('fileType', '').startswith('image/')]
            elif 'video' in ft:
                files = [f for f in files if f.get('fileType', '').startswith('video/')]
            elif 'audio' in ft:
                files = [f for f in files if f.get('fileType', '').startswith('audio/')]
            elif 'document' in ft:
                files = [f for f in files if f.get('fileType', '').startswith('application/')]
            elif 'folder' in ft:
                # If a folder is selected, show all items inside it (not just folders).
                files = [f for f in files if f.get('fileType') == 'folder']
            elif 'starred' in ft:
                files = [f for f in files if f.get('starred', False)]
            elif 'share' in ft:
                # Treat shared strictly by the 'shared' flag to avoid stale 'status' values
                files = [f for f in files if bool(f.get('shared', False))]
            elif 'recent' in ft:
                one_day_ago = now_utc - timedelta(days=1)
                files = _filter_items_by_created(files, lambda created: created > one_day_ago)
            elif 'today' in ft:
                today = now_utc.date()
                files = _filter_items_by_created(files, lambda created: created.date() == today)
            elif 'week' in ft:
                seven_days_ago = now_utc - timedelta(days=7)
                files = _filter_items_by_created(files, lambda created: created > seven_days_ago)
            elif 'month' in ft:
                thirty_days_ago = now_utc - timedelta(days=30)
                files = _filter_items_by_created(files, lambda created: created > thirty_days_ago)

        if modified_filter:
            if 'today' in modified_filter:
                today = now_utc.date()
                files = _filter_items_by_created(files, lambda created: created.date() == today)
            elif 'week' in modified_filter:
                seven_days_ago = now_utc - timedelta(days=7)
                files = _filter_items_by_created(files, lambda created: created > seven_days_ago)
            elif 'month' in modified_filter:
                thirty_days_ago = now_utc - timedelta(days=30)
                files = _filter_items_by_created(files, lambda created: created > thirty_days_ago)

        if search_term:
            st = search_term.lower()
            files = [f for f in files if st in f.get('fileName', '').lower()]

        folders = [f for f in files if f.get('fileType') == 'folder']
        regular_files = [f for f in files if f.get('fileType') != 'folder']

        def sort_key(item):
            if sort_by == 'name':
                return item.get('fileName', '').lower()
            elif sort_by == 'size':
                return _size_to_int(item.get('size', 0))
            elif sort_by == 'date':
                return item.get('createdAt', '')
            return ''

        reverse = sort_order.lower() == 'desc'
        folders.sort(key=sort_key, reverse=reverse)
        regular_files.sort(key=sort_key, reverse=reverse)
        sorted_files = folders + regular_files

        total = len(sorted_files)
        total_pages = max(1, math.ceil(total / limit))
        if page < 1 or page > total_pages:
            return response(400, {'message': f"Invalid page {page}. Total pages: {total_pages}"})

        start = (page - 1) * limit
        end = start + limit
        paginated_files = sorted_files[start:end]

        # Ensure JSON-safe + consistent 'size' type for UI
        for f in paginated_files:
            # cast any legacy non-string sizes (e.g., Decimal/int) to string bytes
            if 'size' in f and not isinstance(f['size'], (str, type(None))):
                try:
                    f['size'] = str(_size_to_int(f['size']))
                except Exception:
                    f['size'] = "0"

            if f.get('fileType') != 'folder':
                try:
                    f['previewUrl'] = s3.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': f['bucket'], 'Key': f['id'], 'ResponseContentDisposition': 'inline'},
                        ExpiresIn=300
                    )
                except Exception as e:
                    print(f"Preview URL error for {f['id']}: {e}")

        return response(200, {
            'files': paginated_files,
            'pagination': {
                'page': page, 'limit': limit, 'total': total, 'pages': total_pages,
                'hasNext': page < total_pages, 'hasPrevious': page > 1
            }
        })

    except Exception as e:
        print(f"Error in handle_list: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})



def handle_hierarchy(event):
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        region = query_params.get('region')
        user_id = query_params.get('userId')

        if not region or not user_id:
            return response(400, {'message': 'Region and userId are required.'})

        response_db = file_metadata_table.query(
            IndexName='userId-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )
        items = response_db.get('Items', [])
        if not items:
            return response(200, {'folders': []})

        # Region + not deleted
        folders = [
            f for f in items
            if f.get('region') == region and f.get('fileType') == 'folder' and not f.get('isDeleted')
        ]

        tree = {}
        base_prefix = f"{user_id}/uploads/"

        for folder in folders:
            full_path = folder['id']
            relative_path = full_path[len(base_prefix):].strip('/')
            parts = relative_path.split('/')

            current = tree
            path_acc = base_prefix

            for part in parts:
                path_acc += part + '/'
                if part not in current:
                    current[part] = {'name': part, 'path': path_acc, 'children': {}}
                current = current[part]['children']

        def flatten_tree(node_dict):
            return [
                {'name': node['name'], 'path': node['path'], 'children': flatten_tree(node['children'])}
                for node in node_dict.values()
            ]

        return response(200, {'folders': flatten_tree(tree)})

    except Exception as e:
        print(f"Error in handle_hierarchy: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})

# ----------------------------------------------------------------
# ❗ DELETE = Soft delete in DynamoDB + Delete bytes from S3 + Usage delta (CHANGED)
# ----------------------------------------------------------------

def handle_delete(event):
    query = event.get('queryStringParameters', {}) or {}
    region    = query.get('region')
    user_id   = query.get('userId')
    file_name = query.get('fileName')
    folder    = query.get('folder')
    raw_key   = query.get('key')

    if not region or not user_id or (not file_name and not raw_key):
        return response(400, {'message': 'region, userId, and fileName or key are required.'})

    # Bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    # Target key
    key = raw_key if raw_key else f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"

    # Metadata (must exist)
    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if not item:
        return response(404, {'message': 'Item not found'})

    # Soft-delete helper (uses the shared _soft_delete_item which sets #ttl)
    def _soft_delete_once(meta):
        if meta.get('isDeleted'):
            return False
        _soft_delete_item(meta)
        return True

    # Folder branch
    if item.get('fileType') == 'folder':
        folder_key = key if key.endswith('/') else key + '/'

        # Soft-delete folder record (no size subtraction for marker)
        _soft_delete_once(item)

        # Soft-delete children; sum sizes of files we newly delete
        total_decrement = 0
        scan = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(folder_key)
        )
        for ch in scan.get('Items', []):
            if _soft_delete_once(ch) and ch.get('fileType') != 'folder':
                try:
                    sz = int(ch.get('size', 0) or 0)
                except Exception:
                    sz = 0
                total_decrement += sz
                try:
                    s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                except Exception as e:
                    print(f"S3 delete failed: {ch['id']} -> {e}")

        if total_decrement:
            _update_usage_bytes(user_id, -total_decrement)

        # Best-effort: remove folder marker
        try:
            s3.delete_object(Bucket=bucket_name, Key=folder_key)
        except Exception as e:
            print(f"Failed to delete S3 folder marker {folder_key}: {e}")

        return response(200, {'message': 'Folder soft-deleted successfully'})

    # File branch
    if _soft_delete_once(item):
        try:
            sz = int(item.get('size', 0) or 0)
        except Exception:
            sz = 0
        if sz:
            _update_usage_bytes(user_id, -sz)
        try:
            s3.delete_object(Bucket=bucket_name, Key=key)
        except Exception as e:
            print(f"S3 delete failed: {e}")

    return response(200, {'message': 'File soft-deleted successfully'})

# ----------------------------------------------------------------
# 📊 Usage (CHANGED): returns current & peak for this month
# ----------------------------------------------------------------

def handle_usage(event):
    query_params = event.get('queryStringParameters', {}) or {}
    user_id = query_params.get('userId')

    if not user_id:
        return response(400, {'message': 'userId is required.'})

    try:
        total_bytes = _get_user_storage_bytes(user_id)
        return response(200, {
            'userId': user_id,
            'totalBytes': total_bytes,
            'totalMB': round(total_bytes / (1024 * 1024), 2)
        })

    except Exception as e:
        print(f"Error in handle_usage: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})


# ----------------------------------------------------------------
# The rest of your handlers (download folder, bulk delete, create folder, star/share, move/copy)
# Updated where needed to respect soft-delete & usage
# ----------------------------------------------------------------

def handle_download_folder(event):
    query = event.get('queryStringParameters', {}) or {}
    region = query.get('region')
    user_id = query.get('userId')  # optional for public
    folder = query.get('folder')   # for private download
    key = query.get('key')         # for public shared download

    if not region:
        return response(400, {'message': 'region is required.'})

    if not key and (not user_id or not folder):
        return response(400, {'message': 'Either key (for public) or userId + folder (for private) is required.'})

    if key:
        prefix = key.rstrip('/') + '/'
        parts = key.strip('/').split('/')
        user_id = parts[0]
        clean_folder_name = parts[-1]
        # Public path: only allow if an active share exists for this folder key
        if not _has_active_share_for_key(key):
            return response(410, {'message': 'This shared link is expired or revoked.'})
    else:
        prefix = f"{user_id}/uploads/{folder.strip('/')}/"
        clean_folder_name = folder.strip('/').replace('/', '_')

    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    try:
        objects = []
        folders = set()
        paginator = s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            contents = page.get('Contents', [])
            if not contents:
                continue
            for obj in contents:
                k = obj['Key']
                if k.endswith('/'):
                    folders.add(k)
                else:
                    objects.append(obj)
                    rel_parents = k[len(f"{user_id}/uploads/"):].split('/')[:-1]
                    path_acc = ""
                    for p in rel_parents:
                        path_acc += p + '/'
                        folders.add(f"{user_id}/uploads/{path_acc}")

        if not objects and not folders:
            return response(404, {'message': 'Folder is empty or does not exist.'})

        tmp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(tmp_dir, f"{clean_folder_name}.zip")

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for f in folders:
                rel_folder = f[len(f"{user_id}/uploads/"):]
                if not rel_folder.endswith('/'):
                    rel_folder += '/'
                zinfo = zipfile.ZipInfo(rel_folder)
                zipf.writestr(zinfo, '')
            for obj in objects:
                k = obj['Key']
                if k.endswith('/'):
                    continue
                rel_path = k[len(f"{user_id}/uploads/"):]
                tmp_file = os.path.join(tmp_dir, str(uuid.uuid4()))
                s3.download_file(bucket_name, k, tmp_file)
                zipf.write(tmp_file, arcname=rel_path)
                os.remove(tmp_file)

        zip_key = f"{user_id}/downloads/{clean_folder_name}.zip"
        s3.upload_file(zip_path, bucket_name, zip_key)
        presigned_url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': zip_key}, ExpiresIn=3600)

        print(f"Folder zipped: {zip_key}")
        return response(200, {'downloadUrl': presigned_url})

    except Exception as e:
        print(f"Error creating ZIP: {e}")
        return response(500, {'message': 'Error creating ZIP', 'error': str(e)})


def handle_delete_multiple(event):
    body = json.loads(event.get('body', '{}'))
    region  = body.get('region')
    user_id = body.get('userId')
    items   = body.get('fileNames', [])  # strings or { key | fileName, folder }

    if not region or not user_id or not items:
        return response(400, {'message': 'region, userId, and fileNames are required.'})

    # Bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    total_decrement = 0               # sum of file sizes we actually delete
    processed_keys = set()            # avoid double-processing in a single request

    # Soft-delete a metadata row only once; return True if we just marked it deleted
    def _soft_delete_once(meta):
        k = meta['id']
        if k in processed_keys:
            return False
        processed_keys.add(k)
        if meta.get('isDeleted'):
            return False
        _soft_delete_item(meta)  # sets isDeleted, deletedAt, ttl
        return True

    for it in items:
        if isinstance(it, dict):
            raw_key   = it.get('key')
            file_name = it.get('fileName')
            folder    = it.get('folder')
        else:
            raw_key   = None
            file_name = it
            folder    = None

        # Target key
        key = raw_key if raw_key else f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"

        # Metadata (must exist to know size/type)
        item = file_metadata_table.get_item(Key={'id': key}).get('Item')
        if not item:
            print(f"[delete-multiple] Skip missing item: {key}")
            continue

        # Folder branch
        if item.get('fileType') == 'folder':
            folder_key = key if key.endswith('/') else key + '/'

            # Soft-delete folder record (no size decrement for folder placeholder)
            _soft_delete_once(item)

            # Soft-delete children; sum sizes ONLY for files we newly delete
            scan_result = file_metadata_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(folder_key)
            )
            for ch in scan_result.get('Items', []):
                if _soft_delete_once(ch):
                    if ch.get('fileType') != 'folder':
                        # subtract file bytes
                        try:
                            sz = int(ch.get('size', 0) or 0)
                        except Exception:
                            sz = 0
                        total_decrement += sz
                        # delete file object in S3 (best-effort)
                        try:
                            s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                        except Exception as e:
                            print(f"[delete-multiple] Failed S3 delete {ch['id']}: {e}")
                    else:
                        # best-effort delete sub-folder marker
                        try:
                            key_to_del = ch['id'] if ch['id'].endswith('/') else ch['id'] + '/'
                            s3.delete_object(Bucket=bucket_name, Key=key_to_del)
                        except Exception as e:
                            print(f"[delete-multiple] Failed to delete sub-folder marker {ch['id']}: {e}")

            # Best-effort: remove the S3 folder marker for the root folder
            try:
                s3.delete_object(Bucket=bucket_name, Key=folder_key)
            except Exception as e:
                print(f"[delete-multiple] Failed to delete folder marker {folder_key}: {e}")

        # File branch
        else:
            if _soft_delete_once(item):
                try:
                    sz = int(item.get('size', 0) or 0)
                except Exception:
                    sz = 0
                total_decrement += sz
                try:
                    s3.delete_object(Bucket=bucket_name, Key=key)
                except Exception as e:
                    print(f"[delete-multiple] Failed S3 delete {key}: {e}")

    # One safe decrement (your _update_usage_bytes clamps to >= 0)
    if total_decrement:
        try:
            _update_usage_bytes(user_id, -total_decrement)
        except Exception as e:
            print(f"[delete-multiple] Usage update failed: {e}")

    return response(200, {
        'message': 'Files and folders soft-deleted successfully',
        'bytesSubtracted': total_decrement
    })


def handle_create_folder(event):
    body = json.loads(event['body'])
    region = body.get('region')
    user_id = body.get('userId')
    folder_name = body.get('folderName', '').strip().strip('/')

    if not region or not user_id or not folder_name:
        return response(400, {'message': 'region, folderName, and userId are required.'})

    bucket_response = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_response:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_response['Item']['bucketName']

    key = f"{user_id}/uploads/{folder_name}/"
    print(f"Attempting to create folder with S3 key: {key}")

    existing = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if existing and not existing.get('isDeleted'):
        return response(409, {'message': 'Folder already exists.'})

    try:
        s3.put_object(Bucket=bucket_name, Key=key)
        file_metadata_table.put_item(
            Item={
                'id': key,
                'bucket': bucket_name,
                'fileName': folder_name.split('/')[-1],
                'fileType': 'folder',
                'region': region,
                'userId': user_id,
                'createdAt': _iso_now(),
                'folder': '/'.join(folder_name.split('/')[:-1]),
                'isDeleted': False,
                'deletedAt': None
            }
        )
        print(f"Folder created successfully: {key}")
        return response(200, {'message': 'Folder created successfully'})
    except Exception as e:
        print(f"Error creating folder: {e}")
        return response(500, {'message': 'Error creating folder', 'error': str(e)})

def handle_star(event, starred=True):
    body = json.loads(event.get('body', '{}'))
    region    = body.get('region')
    user_id   = body.get('userId')
    raw_key   = body.get('key')
    file_name = body.get('fileName')
    folder    = body.get('folder')

    if not region or not user_id or (not raw_key and not file_name):
        return response(400, {'message': 'region, userId, and fileName or key are required.'})

    key = raw_key if raw_key else f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"

    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    is_folder = item and item.get('fileType') == 'folder'

    if is_folder and not key.endswith('/'):
        key += '/'

    keys_to_update = []
    if item and not item.get('isDeleted'):
        # Only update the selected item (no recursive star/unstar).
        keys_to_update.append(key)

    for k in keys_to_update:
        try:
            file_metadata_table.update_item(
                Key={'id': k},
                UpdateExpression="SET starred = :s",
                ExpressionAttributeValues={":s": starred}
            )
        except ClientError as e:
            print(f"Error updating starred for {k}: {e}")

    return response(200, {
        'message': f"{'Folder' if is_folder else 'File'} {'starred' if starred else 'unstarred'} successfully",
        'updatedItems': keys_to_update
    })

def handle_share(event):
    body = json.loads(event.get('body', '{}'))
    region = body.get('region')
    user_id = body.get('userId')
    raw_key = body.get('key')
    file_name = body.get('fileName')
    folder = body.get('folder')
    permissions = body.get('permissions', 'view')
    expiry = body.get('expiry', '7days')
    password = body.get('password', '')

    if not region or not user_id:
        return response(400, {'message': 'region and userId are required.'})

    if raw_key:
        key = raw_key
    elif file_name:
        key = f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"
    elif folder:
        key = f"{user_id}/uploads/{folder.strip('/')}/"
    else:
        return response(400, {'message': 'Either key, fileName, or folder must be provided.'})

    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if not item or item.get('isDeleted'):
        return response(404, {'message': 'Item not found or is deleted'})

    is_folder = item.get('fileType') == 'folder'
    if is_folder and not key.endswith('/'):
        key += '/'

    expiry_map = {
        '1min': 60,
        '1minute': 60,
        '60s': 60,
        '1day': 86400,
        '7days': 604800,
        '30days': 2592000,
        'never': 315360000,
    }
    expiry_seconds = expiry_map.get(expiry, expiry_map['7days'])

    keys_to_update = []
    if is_folder:
        scan = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
        )
        nested_items = [i for i in scan.get('Items', []) if not i.get('isDeleted')]
        keys_to_update = [i['id'] for i in nested_items]
        keys_to_update.append(key)
    else:
        keys_to_update = [key]

    for k in keys_to_update:
        try:
            file_metadata_table.update_item(
                Key={'id': k},
                UpdateExpression=(
                    "SET #s = :s, sharePermissions = :p, shareExpiry = :e, sharePassword = :pw"
                ),
                ExpressionAttributeNames={'#s': 'shared'},
                ExpressionAttributeValues={':s': True, ':p': permissions, ':e': expiry, ':pw': password}
            )
        except ClientError as e:
            print(f"Metadata update error for {k}: {e}")

    if is_folder:
        # Create a cancellable share record for folders too
        now_epoch = int(datetime.now(timezone.utc).timestamp())
        expires_at = now_epoch + (expiry_seconds if expiry != 'never' else 315360000)
        share_id = str(uuid.uuid4())
        ttl_epoch = expires_at + 300
        shares_table.put_item(Item={
            'shareId': share_id,
            'type': 'folder',
            'ownerUserId': user_id,
            'bucket': bucket_name,
            'objectKey': key,  # folder prefix with trailing '/'
            'permissions': permissions,
            'status': 'active',
            'createdAt': _iso_now(),
            'expiresAt': expires_at,
            'ttl': ttl_epoch,
        })
        # Keep existing viewer path but return shareId for cancel support
        share_url = f"/shared-folder-viewer?key={key}"
    else:
        # Create a cancellable share record and return API-gated link
        now_epoch = int(datetime.now(timezone.utc).timestamp())
        expires_at = now_epoch + (expiry_seconds if expiry != 'never' else 315360000)
        share_id = str(uuid.uuid4())

        # Persist share record (TTL slightly after expiry for auto-removal)
        ttl_epoch = expires_at + 300
        shares_table.put_item(Item={
            'shareId': share_id,
            'type': 'file',
            'ownerUserId': user_id,
            'bucket': bucket_name,
            'objectKey': key,
            'permissions': permissions,
            'status': 'active',
            'createdAt': _iso_now(),
            'expiresAt': expires_at,
            'ttl': ttl_epoch,
        })

        # API download endpoint that mints a very short presigned URL per request
        # Note: API base path is handled by API Gateway; we return a relative path for the UI to absolve
        share_url = f"/shares/{share_id}/download"

    return response(200, {
        'message': f'{"Folder and contents" if is_folder else "File"} shared successfully.',
        'shareLink': share_url,
        'id': share_id,
        'permissions': permissions,
        'expiry': expiry
    })

def handle_share_download(event):
    """GET /shares/{shareId}/download -> 302 redirect to short-lived S3 URL.
    Supports query param `disposition=inline|attachment` (default attachment).
    """
    params = (event.get('pathParameters') or {})
    share_id = params.get('shareId')
    if not share_id:
        return response(400, {'message': 'shareId is required'})

    # Load share record
    item = shares_table.get_item(Key={'shareId': share_id}, ConsistentRead=True).get('Item')
    if not item:
        return response(404, {'message': 'Share not found'})

    # Check status and expiry
    status = item.get('status', 'active')
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    expires_at = int(item.get('expiresAt', 0) or 0)
    if status != 'active' or (expires_at and now_epoch > expires_at):
        return response(410, {'message': 'Share is expired or revoked'})

    bucket = item.get('bucket')
    key = item.get('objectKey')
    if not bucket or not key:
        return response(500, {'message': 'Share is misconfigured'})

    # Determine content disposition
    q = event.get('queryStringParameters') or {}
    disp = (q.get('disposition') or 'attachment').lower()
    if disp not in ('inline', 'attachment'):
        disp = 'attachment'
    filename = key.rstrip('/').split('/')[-1]
    content_disp = f"{disp}; filename=\"{filename}\""

    # Mint a very short presigned URL (2 minutes)
    try:
        presigned = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ResponseContentDisposition': content_disp,
            },
            ExpiresIn=120
        )
    except ClientError as e:
        print(f"Presign error for share {share_id}: {e}")
        return response(404, {'message': 'File not found or inaccessible.'})

    return {'statusCode': 302, 'headers': {'Location': presigned}}

def handle_cancel_share(event):
    """POST /shares/{shareId}/cancel -> revoke share and optionally clear shared flag on metadata."""
    params = (event.get('pathParameters') or {})
    share_id = params.get('shareId')
    if not share_id:
        # Also support body-driven cancellation as a fallback
        try:
            body = json.loads(event.get('body', '{}'))
        except Exception:
            body = {}
        share_id = body.get('shareId')
    if not share_id:
        return response(400, {'message': 'shareId is required'})

    # Load share (catch table-not-found or permission errors explicitly)
    try:
        item = shares_table.get_item(Key={'shareId': share_id}).get('Item')
    except ClientError as e:
        print(f"Cancel share get_item error {share_id}: {e}")
        code = e.response.get('Error', {}).get('Code', '')
        if code in ('ResourceNotFoundException', 'AccessDeniedException', 'AccessDenied'):
            return response(500, {'message': 'Share store not available', 'code': code})
        return response(500, {'message': 'AWS Error', 'code': code})

    if not item:
        return response(404, {'message': 'Share not found'})

    if item.get('status') != 'active':
        return response(409, {'message': f"Share already {item.get('status')}"})

    now_iso = _iso_now()
    # Mark revoked and pull TTL forward for quick removal (guard that item exists)
    try:
        shares_table.update_item(
            Key={'shareId': share_id},
            UpdateExpression="SET #s=:rev, cancelledAt=:c, #ttl=:ttlv",
            ExpressionAttributeNames={'#s': 'status', '#ttl': 'ttl'},
            ExpressionAttributeValues={
                ':rev': 'revoked',
                ':c': now_iso,
                ':ttlv': int(datetime.now(timezone.utc).timestamp()) + 300
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr('shareId').exists()
        )
    except ClientError as e:
        print(f"Cancel share update error {share_id}: {e}")
        code = e.response.get('Error', {}).get('Code', '')
        if code == 'ConditionalCheckFailedException':
            return response(404, {'message': 'Share not found'})
        if code in ('AccessDeniedException', 'AccessDenied'):
            return response(403, {'message': 'Access denied to cancel share'})
        return response(500, {'message': 'Failed to cancel share'})

    # Best-effort: clear shared markers on the object (and nested items for folders)
    try:
        key = item.get('objectKey')
        if key:
            if key.endswith('/'):
                # Folder: clear shared on the folder itself and all descendants
                # Clear root folder
                try:
                    file_metadata_table.update_item(
                        Key={'id': key},
                        UpdateExpression="SET #st=:priv REMOVE shared, sharePermissions, sharePassword, shareExpiry",
                        ExpressionAttributeNames={'#st': 'status'},
                        ExpressionAttributeValues={':priv': 'private'}
                    )
                except Exception as e2:
                    print(f"Failed to clear shared on folder root {key}: {e2}")
                # Clear children
                scan = file_metadata_table.scan(
                    FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
                )
                for it in scan.get('Items', []):
                    try:
                        file_metadata_table.update_item(
                            Key={'id': it['id']},
                            UpdateExpression="SET #st=:priv REMOVE shared, sharePermissions, sharePassword, shareExpiry",
                            ExpressionAttributeNames={'#st': 'status'},
                            ExpressionAttributeValues={':priv': 'private'}
                        )
                    except Exception as e3:
                        print(f"Failed to clear shared on child {it.get('id')}: {e3}")
            else:
                # Single file
                meta = file_metadata_table.get_item(Key={'id': key}).get('Item')
                if meta:
                    file_metadata_table.update_item(
                        Key={'id': key},
                        UpdateExpression="SET #st=:priv REMOVE shared, sharePermissions, sharePassword, shareExpiry",
                        ExpressionAttributeNames={'#st': 'status'},
                        ExpressionAttributeValues={':priv': 'private'}
                    )
    except Exception as e:
        print(f"Failed to clear shared markers for {item.get('objectKey')}: {e}")

    # Defense-in-depth: revoke any other active share records for the same objectKey
    try:
        obj_key = item.get('objectKey')
        if obj_key:
            scan = shares_table.scan(
                FilterExpression=(
                    boto3.dynamodb.conditions.Attr('objectKey').eq(obj_key) &
                    boto3.dynamodb.conditions.Attr('status').eq('active')
                )
            )
            for other in scan.get('Items', []) or []:
                sid = other.get('shareId')
                if not sid or sid == share_id:
                    continue
                try:
                    shares_table.update_item(
                        Key={'shareId': sid},
                        UpdateExpression="SET #s=:rev, cancelledAt=:c, #ttl=:ttlv",
                        ExpressionAttributeNames={'#s': 'status', '#ttl': 'ttl'},
                        ExpressionAttributeValues={
                            ':rev': 'revoked',
                            ':c': now_iso,
                            ':ttlv': int(datetime.now(timezone.utc).timestamp()) + 300
                        }
                    )
                except Exception as e2:
                    print(f"Failed to revoke sibling share {sid}: {e2}")
    except Exception as e:
        print(f"Sibling share revoke scan failed: {e}")

    return response(200, {'message': 'Share cancelled', 'shareId': share_id})

def handle_list_shares(event):
    """GET /shares?key=<objectKey> -> returns active shares for an objectKey."""
    query = event.get('queryStringParameters', {}) or {}
    object_key = query.get('key') or query.get('objectKey')
    if not object_key:
        return response(400, {'message': 'key (objectKey) is required'})

    # There is no PK on objectKey; in simple setups, a scan with filter is acceptable at low scale.
    resp = shares_table.scan(
        FilterExpression=(
            boto3.dynamodb.conditions.Attr('objectKey').eq(object_key) &
            boto3.dynamodb.conditions.Attr('status').eq('active')
        )
    )
    items = resp.get('Items', [])
    # Return only minimal info
    out = []
    for it in items:
        exp = it.get('expiresAt')
        try:
            exp_val = int(exp) if exp is not None else None
        except Exception:
            # Fallback if Decimal or non-int
            try:
                exp_val = int(float(exp))
            except Exception:
                exp_val = None
        out.append({
            'shareId': it.get('shareId'),
            'type': it.get('type'),
            'expiresAt': exp_val,
            'status': it.get('status'),
        })
    return response(200, {'items': out})

def handle_share_info(event):
    """GET /shares/{shareId} -> share metadata for public info page."""
    params = (event.get('pathParameters') or {})
    share_id = params.get('shareId')
    if not share_id:
        return response(400, {'message': 'shareId is required'})

    item = shares_table.get_item(Key={'shareId': share_id}, ConsistentRead=True).get('Item')
    if not item:
        return response(404, {'message': 'Share not found'})

    now_epoch = int(datetime.now(timezone.utc).timestamp())
    expires_at = int(item.get('expiresAt', 0) or 0)
    status = item.get('status', 'active')
    is_expired = bool(expires_at and now_epoch > expires_at)

    # Try to resolve presentable name
    display_name = None
    try:
        fk = item.get('objectKey')
        meta = file_metadata_table.get_item(Key={'id': fk}).get('Item')
        display_name = meta.get('fileName') if meta else (fk.rstrip('/').split('/')[-1] if fk else None)
    except Exception:
        pass

    return response(200, {
        'shareId': share_id,
        'type': item.get('type'),
        'status': 'expired' if is_expired else status,
        'expiresAt': expires_at,
        'name': display_name,
    })

def handle_share_multiple(event):
    body = json.loads(event.get('body', '{}'))
    region  = body.get('region')
    user_id = body.get('userId')
    items   = body.get('items', [])  # strings or dicts: { key? | fileName?, folder? }

    if not region or not user_id or not items:
        return response(400, {'message': 'region, userId and items are required'})

    # Resolve bucket from region
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    # Build ZIP workspace
    temp_dir = tempfile.mkdtemp()
    zip_name = f"share-{uuid.uuid4().hex}.zip"
    zip_path = os.path.join(temp_dir, zip_name)

    added_keys = set()
    uploads_prefix = f"{user_id}/uploads/"

    try:
        with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
            # Iterate requested items
            for it in items:
                is_folder, key_or_prefix = resolve_key_from_item(it, user_id)
                if not key_or_prefix:
                    continue

                if is_folder:
                    # list all objects under the folder prefix
                    prefix = key_or_prefix if key_or_prefix.endswith('/') else key_or_prefix + '/'
                    paginator = s3.get_paginator('list_objects_v2')
                    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
                        for obj in (page.get('Contents') or []):
                            k = obj.get('Key')
                            if k and not k.endswith('/'):
                                add_file_to_zip(
                                    k,
                                    bucket_name=bucket_name,
                                    uploads_prefix=uploads_prefix,
                                    temp_dir=temp_dir,
                                    zipf=zipf,
                                    added_keys=added_keys
                                )
                else:
                    add_file_to_zip(
                        key_or_prefix,
                        bucket_name=bucket_name,
                        uploads_prefix=uploads_prefix,
                        temp_dir=temp_dir,
                        zipf=zipf,
                        added_keys=added_keys
                    )

        # Upload ZIP to same regional bucket under user downloads
        zip_s3_key = f"{user_id}/downloads/{zip_name}"
        s3.upload_file(zip_path, bucket_name, zip_s3_key)

        # Presigned link for download
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': zip_s3_key,
                'ResponseContentDisposition': f'attachment; filename=\"{zip_name}\"'
            },
            ExpiresIn=3600
        )

        return response(200, {'shareable_link': presigned_url})

    except Exception as e:
        print(f"Error in handle_share_multiple: {e}")
        return response(500, {'message': 'Internal server error', 'error': str(e)})

def handle_public_shared_list(event):
    try:
        query = event.get('queryStringParameters', {}) or {}
        region = query.get('region')
        key = query.get('key', '').rstrip('/') + '/'

        if not region or not key:
            return response(400, {'message': 'region and key are required.'})

        # Require an active share for this folder
        if not _has_active_share_for_key(key):
            return response(410, {'message': 'This shared link is expired or revoked.'})

        bucket_resp = bucket_table.get_item(Key={'region': region})
        if 'Item' not in bucket_resp:
            return response(404, {'message': f'No bucket found for region: {region}'})
        bucket_name = bucket_resp['Item']['bucketName']

        scan = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
        )
        items = [it for it in scan.get('Items', []) if not it.get('isDeleted')]

        prefix_len = len(key)
        immediate_files = []
        for item in items:
            remaining = item['id'][prefix_len:]
            if remaining and '/' not in remaining.strip('/'):
                entry = {
                    'fileName': item.get('fileName'),
                    'fileType': item.get('fileType'),
                    'createdAt': item.get('createdAt'),
                    'id': item.get('id'),
                    'size': int(item.get('size', 0)),
                    'starred': item.get('starred', False),
                    'shared': item.get('shared', False),
                }
                if item.get('fileType') != 'folder':
                    try:
                        entry['previewUrl'] = s3.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': bucket_name, 'Key': item['id']},
                            ExpiresIn=300
                        )
                    except ClientError as e:
                        print(f"Error generating URL for {item['id']}: {e}")
                        entry['previewUrl'] = None
                immediate_files.append(entry)

        if not immediate_files:
            return response(404, {'message': 'No files found in this shared folder.'})

        return response(200, {'files': immediate_files})

    except Exception as e:
        print(f"Error in handle_public_shared_list: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})

def handle_move_or_copy(event, operation):
    body = json.loads(event['body'])
    region = body.get('region')
    user_id = body.get('userId')
    source_file_names = body.get('sourceFileNames', [])
    destination_folder = body.get('destinationFolder', '').strip('/')

    if not region or not user_id or not source_file_names or destination_folder is None:
        return response(400, {'message': 'region, userId, sourceFileNames, and destinationFolder are required.'})

    # Resolve bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    # Destination prefix (folder)
    dest_folder_prefix = f"{user_id}/uploads/{destination_folder}/" if destination_folder else f"{user_id}/uploads/"

    moved = []
    total_added = 0  # for copy only

    for source_name in source_file_names:
        # Full source key (as stored in metadata)
        source_key = f"{user_id}/uploads/{source_name}".rstrip('/')

        src_meta = file_metadata_table.get_item(Key={'id': source_key}).get('Item')
        if not src_meta:
            # Folder markers are stored with trailing '/', so try that if not found
            source_key = f"{source_key}/"
            src_meta = file_metadata_table.get_item(Key={'id': source_key}).get('Item')
        if not src_meta or src_meta.get('isDeleted'):
            print(f"[move/copy] Skip missing/deleted: {source_key}")
            continue

        is_folder = (src_meta.get('fileType') == 'folder')

        # ---------------------
        # FOLDER BRANCH
        # ---------------------
        if is_folder:
            src_root = source_key if source_key.endswith('/') else source_key + '/'
            # Determine destination root folder name and key (unique)
            src_folder_name = src_root.rstrip('/').split('/')[-1]
            dest_root_name, dest_root_key = _ensure_unique_folder_key(bucket_name, dest_folder_prefix, src_folder_name)

            # Ensure the folder marker exists at destination
            try:
                s3.put_object(Bucket=bucket_name, Key=dest_root_key)
            except Exception as e:
                print(f"[move/copy] Failed to create folder marker {dest_root_key}: {e}")

            # Write/overwrite the folder metadata at destination
            new_folder_meta = {
                **src_meta,
                'id': dest_root_key,
                'fileName': dest_root_name,
                'createdAt': _iso_now(),
                'isDeleted': False,
                'deletedAt': None
            }
            file_metadata_table.put_item(Item=new_folder_meta)

            # Iterate all children
            scan_result = file_metadata_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(src_root)
            )
            for ch in scan_result.get('Items', []):
                if ch.get('isDeleted'):
                    continue
                rel_path = ch['id'][len(src_root):]  # path inside the folder
                dest_child_key = f"{dest_root_key}{rel_path}"

                if ch.get('fileType') == 'folder':
                    # ensure folder marker
                    if not dest_child_key.endswith('/'):
                        dest_child_key += '/'
                    try:
                        s3.put_object(Bucket=bucket_name, Key=dest_child_key)
                    except Exception as e:
                        print(f"[move/copy] Failed to create sub-folder marker {dest_child_key}: {e}")

                    # write destination metadata
                    new_meta = {
                        **ch,
                        'id': dest_child_key,
                        'fileName': dest_child_key.rstrip('/').split('/')[-1],
                        'createdAt': _iso_now(),
                        'isDeleted': False,
                        'deletedAt': None
                    }
                    file_metadata_table.put_item(Item=new_meta)

                    if operation == "move":
                        # best-effort delete original marker & soft-delete original metadata with TTL
                        try:
                            s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                        except Exception as e:
                            print(f"[move/copy] Failed to delete src sub-folder marker {ch['id']}: {e}")
                        _soft_delete_item(ch)

                else:
                    # file: copy/move the object
                    try:
                        s3.copy_object(
                            Bucket=bucket_name,
                            CopySource={'Bucket': bucket_name, 'Key': ch['id']},
                            Key=dest_child_key
                        )
                    except Exception as e:
                        print(f"[move/copy] Failed S3 copy {ch['id']} -> {dest_child_key}: {e}")
                        continue

                    # write destination metadata
                    new_meta = {
                        **ch,
                        'id': dest_child_key,
                        'fileName': dest_child_key.split('/')[-1],
                        'createdAt': _iso_now(),
                        'isDeleted': False,
                        'deletedAt': None
                    }
                    file_metadata_table.put_item(Item=new_meta)

                    if operation == "copy":
                        try:
                            total_added += int(ch.get('size', 0) or 0)
                        except Exception:
                            pass

                    if operation == "move":
                        # delete original object & soft-delete original metadata with TTL
                        try:
                            s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                        except Exception as e:
                            print(f"[move/copy] Failed S3 delete {ch['id']}: {e}")
                        _soft_delete_item(ch)

            # For move: soft delete the original folder root metadata and best-effort delete marker
            if operation == "move":
                _soft_delete_item({'id': src_root})
                try:
                    s3.delete_object(Bucket=bucket_name, Key=src_root)
                except Exception as e:
                    print(f"[move/copy] Failed to delete src folder marker {src_root}: {e}")

            moved.append(src_folder_name if operation == "move" else dest_root_name)
            continue

        # ---------------------
        # FILE BRANCH
        # ---------------------
        filename_only = source_name.split('/')[-1]
        # Find a unique destination file key in the destination folder
        final_name, dest_key = _ensure_unique_file_key(bucket_name, dest_folder_prefix, filename_only)

        # Copy/move the object
        try:
            s3.copy_object(Bucket=bucket_name, CopySource={'Bucket': bucket_name, 'Key': source_key}, Key=dest_key)
        except Exception as e:
            print(f"[move/copy] Failed S3 copy {source_key} -> {dest_key}: {e}")
            continue

        # Write new metadata
        new_meta = {
            **src_meta,
            'id': dest_key,
            'fileName': final_name,
            'createdAt': _iso_now(),
            'isDeleted': False,
            'deletedAt': None
        }
        file_metadata_table.put_item(Item=new_meta)

        if operation == "copy":
            try:
                total_added += int(src_meta.get('size', 0) or 0)
            except Exception:
                pass

        if operation == "move":
            # delete source object & soft-delete original metadata with TTL
            try:
                s3.delete_object(Bucket=bucket_name, Key=source_key)
            except Exception as e:
                print(f"[move/copy] Failed S3 delete {source_key}: {e}")
            _soft_delete_item(src_meta)

        moved.append(final_name)

    # Update usage for copy (move does not change usage)
    if operation == "copy" and total_added:
        try:
            _update_usage_bytes(user_id, total_added)
        except Exception as e:
            print(f"[move/copy] Usage update failed (copy): {e}")

    return response(200, {'message': f'Files {operation}d successfully', 'movedFiles': moved})

# ----------------------------------------------------------------

def handle_rename(event):
    body = json.loads(event.get('body', '{}'))
    region = body.get('region')
    user_id = body.get('userId')
    new_name = (body.get('newName') or '').strip()
    raw_key = (body.get('key') or '').strip()
    file_name = body.get('fileName')
    folder = body.get('folder')

    if not region or not user_id or not new_name:
        return response(400, {'message': 'region, userId, and newName are required.'})

    if '/' in new_name:
        return response(400, {'message': 'newName must not contain "/".'})

    # Resolve source key
    if raw_key:
        key = raw_key
    else:
        if not file_name:
            return response(400, {'message': 'key or fileName is required.'})
        key = f"{user_id}/uploads/{(folder.strip('/') + '/' if folder else '')}{file_name}"

    # Fetch metadata (folders may have trailing slash)
    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if not item and not key.endswith('/'):
        key = f"{key}/"
        item = file_metadata_table.get_item(Key={'id': key}).get('Item')

    if not item or item.get('isDeleted'):
        return response(404, {'message': 'Item not found'})

    is_folder = item.get('fileType') == 'folder'
    current_name = item.get('fileName') or key.rstrip('/').split('/')[-1]
    if new_name == current_name:
        return response(200, {'message': 'No change', 'newKey': key, 'newName': current_name})

    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    def _update_share_keys(old_prefix: str, new_prefix: str):
        """Update active share records from old key/prefix to new key/prefix."""
        try:
            scan = shares_table.scan(
                FilterExpression=(
                    boto3.dynamodb.conditions.Attr('ownerUserId').eq(user_id) &
                    boto3.dynamodb.conditions.Attr('status').eq('active')
                )
            )
            for it in scan.get('Items', []) or []:
                ok = (it.get('objectKey') or '').strip()
                if not ok:
                    continue
                if ok == old_prefix:
                    new_key = new_prefix
                elif old_prefix.endswith('/') and ok.startswith(old_prefix):
                    new_key = f"{new_prefix}{ok[len(old_prefix):]}"
                else:
                    continue
                try:
                    shares_table.update_item(
                        Key={'shareId': it['shareId']},
                        UpdateExpression="SET objectKey = :k",
                        ExpressionAttributeValues={':k': new_key}
                    )
                except Exception as e:
                    print(f"[rename] Failed to update share {it.get('shareId')}: {e}")
        except Exception as e:
            print(f"[rename] Share update scan failed: {e}")

    if is_folder:
        src_root = key if key.endswith('/') else key + '/'
        parent_prefix = src_root.rstrip('/').rsplit('/', 1)[0] + '/'
        dest_root_name, dest_root_key = _ensure_unique_folder_key(bucket_name, parent_prefix, new_name)
        if dest_root_key == src_root:
            return response(200, {'message': 'No change', 'newKey': src_root, 'newName': dest_root_name})

        try:
            s3.put_object(Bucket=bucket_name, Key=dest_root_key)
        except Exception as e:
            print(f"[rename] Failed to create folder marker {dest_root_key}: {e}")

        new_folder_meta = {
            **item,
            'id': dest_root_key,
            'fileName': dest_root_name,
            'createdAt': _iso_now(),
            'isDeleted': False,
            'deletedAt': None
        }
        file_metadata_table.put_item(Item=new_folder_meta)

        scan_result = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(src_root)
        )
        for ch in scan_result.get('Items', []):
            if ch.get('isDeleted'):
                continue
            rel_path = ch['id'][len(src_root):]
            dest_child_key = f"{dest_root_key}{rel_path}"

            if ch.get('fileType') == 'folder':
                if not dest_child_key.endswith('/'):
                    dest_child_key += '/'
                try:
                    s3.put_object(Bucket=bucket_name, Key=dest_child_key)
                except Exception as e:
                    print(f"[rename] Failed to create sub-folder marker {dest_child_key}: {e}")

                new_meta = {
                    **ch,
                    'id': dest_child_key,
                    'fileName': dest_child_key.rstrip('/').split('/')[-1],
                    'createdAt': _iso_now(),
                    'isDeleted': False,
                    'deletedAt': None
                }
                file_metadata_table.put_item(Item=new_meta)

                try:
                    s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                except Exception as e:
                    print(f"[rename] Failed to delete src folder marker {ch['id']}: {e}")
                _soft_delete_item(ch)
            else:
                try:
                    s3.copy_object(
                        Bucket=bucket_name,
                        CopySource={'Bucket': bucket_name, 'Key': ch['id']},
                        Key=dest_child_key
                    )
                except Exception as e:
                    print(f"[rename] Failed S3 copy {ch['id']} -> {dest_child_key}: {e}")
                    continue

                new_meta = {
                    **ch,
                    'id': dest_child_key,
                    'fileName': dest_child_key.split('/')[-1],
                    'createdAt': _iso_now(),
                    'isDeleted': False,
                    'deletedAt': None
                }
                file_metadata_table.put_item(Item=new_meta)

                try:
                    s3.delete_object(Bucket=bucket_name, Key=ch['id'])
                except Exception as e:
                    print(f"[rename] Failed S3 delete {ch['id']}: {e}")
                _soft_delete_item(ch)

        _soft_delete_item(item)
        try:
            s3.delete_object(Bucket=bucket_name, Key=src_root)
        except Exception as e:
            print(f"[rename] Failed to delete src folder marker {src_root}: {e}")

        _update_share_keys(src_root, dest_root_key)
        return response(200, {'message': 'Folder renamed', 'newKey': dest_root_key, 'newName': dest_root_name})

    # File rename
    source_key = key
    parent_prefix = source_key.rsplit('/', 1)[0] + '/'
    final_name, dest_key = _ensure_unique_file_key(bucket_name, parent_prefix, new_name)
    if dest_key == source_key:
        return response(200, {'message': 'No change', 'newKey': source_key, 'newName': final_name})

    try:
        s3.copy_object(
            Bucket=bucket_name,
            CopySource={'Bucket': bucket_name, 'Key': source_key},
            Key=dest_key
        )
    except Exception as e:
        print(f"[rename] Failed S3 copy {source_key} -> {dest_key}: {e}")
        return response(500, {'message': 'Rename failed'})

    new_meta = {
        **item,
        'id': dest_key,
        'fileName': final_name,
        'createdAt': _iso_now(),
        'isDeleted': False,
        'deletedAt': None
    }
    file_metadata_table.put_item(Item=new_meta)

    try:
        s3.delete_object(Bucket=bucket_name, Key=source_key)
    except Exception as e:
        print(f"[rename] Failed S3 delete {source_key}: {e}")
    _soft_delete_item(item)

    _update_share_keys(source_key, dest_key)
    return response(200, {'message': 'File renamed', 'newKey': dest_key, 'newName': final_name})

def _json_default(o):
    try:
        if Decimal is not None and isinstance(o, Decimal):
            # Prefer int when it is whole, otherwise float
            n = float(o)
            return int(n) if n.is_integer() else n
    except Exception:
        pass
    return str(o)

def response(status_code, body):
    return {'statusCode': status_code, 'body': json.dumps(body, default=_json_default)}
