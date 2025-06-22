import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import zipfile
import tempfile
import os
import uuid

# Initialize AWS clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
bucket_table = dynamodb.Table('SmartPCBuckets')
file_metadata_table = dynamodb.Table('SmartPCStorageMetadata')

def lambda_handler(event, context):
    try:
        # Log the received event
        print("Full Event:", json.dumps(event, indent=2))

        # Parse routeKey for matching HTTP method and path
        route_key = event.get('routeKey', '')
        print(f"Route Key: {route_key}")

        if route_key == "POST /upload":
            return handle_upload(event)
        
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

        elif route_key == "POST /move":
            return handle_move_or_copy(event, operation="move")
        
        elif route_key == "POST /copy":
            return handle_move_or_copy(event, operation="copy")

        elif route_key == "GET /usage":
            return handle_usage(event)

        elif route_key == "GET /download-folder":
            return handle_download_folder(event)
        
        else:
            return response(400, {'message': 'Invalid HTTP method or path'})

    except ClientError as e:
        print(f"AWS Error: {e}")
        return response(500, {'message': 'AWS Error', 'error': str(e)})
    except Exception as e:
        print(f"Error: {e}")
        return response(500, {'message': 'Internal server error', 'error': str(e)})

# ----------------------------------------------------------------
# ✅ EXISTING FUNCTIONS (uploaded/download/list/delete single)
# ----------------------------------------------------------------

def handle_upload(event):
    body = json.loads(event['body']) if 'body' in event else event
    region = body.get('region')
    file_name = body.get('fileName')
    file_type = body.get('fileType', 'application/octet-stream')
    user_id = body.get('userId')
    file_size = body.get('size')
    status = body.get('status', 'private')
    starred = body.get('starred', False)
    folder = body.get('folder', '').strip().strip('/')  # Normalize folder input

    if not region or not file_name or not user_id:
        return response(400, {'message': 'Region, fileName, and userId are required.'})

    # Get bucket name from region
    bucket_response = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_response:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_response['Item']['bucketName']

    # Handle duplicate file name by auto-renaming
    base_name, ext = file_name.rsplit('.', 1) if '.' in file_name else (file_name, '')
    counter = 1
    final_file_name = file_name

    # Build initial key with uploads/ always present
    if folder:
        key = f"{user_id}/uploads/{folder}/{final_file_name}"
    else:
        key = f"{user_id}/uploads/{final_file_name}"

    print(f"Initial S3 Key: {key}")

    existing_item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    while existing_item:
        final_file_name = f"{base_name} ({counter}).{ext}" if ext else f"{base_name} ({counter})"
        if folder:
            key = f"{user_id}/uploads/{folder}/{final_file_name}"
        else:
            key = f"{user_id}/uploads/{final_file_name}"
        existing_item = file_metadata_table.get_item(Key={'id': key}).get('Item')
        counter += 1

    # Generate pre-signed URL
    params = {
        'Bucket': bucket_name,
        'Key': key,
        'ContentType': file_type,
    }
    print(f"Generating pre-signed URL with Bucket: {bucket_name}, Key: {key}, ContentType: {file_type}")
    upload_url = s3.generate_presigned_url('put_object', Params=params, ExpiresIn=3600)

    # Save metadata to DynamoDB
    file_metadata_table.put_item(
        Item={
            'id': key,
            'bucket': bucket_name,
            'fileName': final_file_name,
            'fileType': file_type,
            'region': region,
            'userId': user_id,
            'size': file_size,
            'status': status,
            'starred': starred,
            'createdAt': datetime.utcnow().isoformat(),
            'folder': folder
        }
    )

    print(f"Metadata saved to DynamoDB: {key}")
    return response(200, {
        'uploadUrl': upload_url,
        'finalFileName': final_file_name
    })

def handle_download(event):
    query = event.get('queryStringParameters', {}) or {}
    region    = query.get('region')
    user_id   = query.get('userId')
    file_name = query.get('fileName')
    folder    = query.get('folder')   # optional: e.g., "pdf/reports"
    raw_key   = query.get('key')      # optional: full S3 key/id

    # 1. Validate input
    if not region or not user_id or (not file_name and not raw_key):
        return response(400, {
            'message': 'region, userId, and fileName or key are required.'
        })

    # 2. Look up the bucket for the region
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket for region {region}'})
    bucket = bucket_resp['Item']['bucketName']

    # 3. Build the full S3 key
    if raw_key:
        key = raw_key
    else:
        folder_path = folder.strip('/') + '/' if folder else ''
        key = f"{user_id}/uploads/{folder_path}{file_name}"

    download_name = key.split('/')[-1]  # use last part of key for filename

    # 4. Generate a presigned URL
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

import math
from datetime import datetime, timedelta
import boto3

def handle_list(event):
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        region = query_params.get('region')
        user_id = query_params.get('userId')
        filter_type = query_params.get('type')        # Optional: 'folder'
        folder = query_params.get('folder')           # Folder path provided (like "b/")
        sort_by = query_params.get('sortBy', 'date')  # Optional: 'name', 'size', 'date'
        sort_order = query_params.get('sortOrder', 'asc')
        search_term = query_params.get('search')      # Optional: search term
        recursive = query_params.get('recursive', 'false').lower() == 'true'
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 20))

        if not region or not user_id:
            return response(400, {'message': 'Region and userId are required.'})

        print(f"Querying files for userId: {user_id} in region: {region}")
        response_db = file_metadata_table.query(
            IndexName='userId-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )

        files = response_db.get('Items', [])
        if not files:
            return response(404, {'message': 'No files found for the given userId.'})

        files = [item for item in files if item.get('region') == region]

        # === Filtering Logic ===
        if filter_type:
            filter_type = filter_type.lower()
            if 'image' in filter_type:
                files = [f for f in files if f.get('fileType', '').startswith('image/')]
            elif 'video' in filter_type:
                files = [f for f in files if f.get('fileType', '').startswith('video/')]
            elif 'audio' in filter_type:
                files = [f for f in files if f.get('fileType', '').startswith('audio/')]
            elif 'document' in filter_type:
                files = [f for f in files if f.get('fileType', '').startswith('application/')]
            elif 'folder' in filter_type:
                files = [f for f in files if f.get('fileType') == 'folder']
            elif 'starred' in filter_type:
                files = [f for f in files if f.get('starred', False)]
            elif 'share' in filter_type:
                files = [f for f in files if f.get('status') == 'shared' or f.get('shared', False)]
            elif 'recent' in filter_type:
                one_day_ago = datetime.utcnow() - timedelta(days=1)
                files = [f for f in files if 'createdAt' in f and datetime.fromisoformat(f['createdAt']) > one_day_ago]
            elif 'today' in filter_type:
                today = datetime.utcnow().date()
                files = [f for f in files if 'createdAt' in f and datetime.fromisoformat(f['createdAt']).date() == today]
            elif 'week' in filter_type:
                seven_days_ago = datetime.utcnow() - timedelta(days=7)
                files = [f for f in files if 'createdAt' in f and datetime.fromisoformat(f['createdAt']) > seven_days_ago]
        else:
            # Folder filtering
            if folder:
                folder = folder.strip('/') + '/'
                folder_prefix = f"{user_id}/uploads/{folder}"
                folder_id = folder_prefix

                if recursive:
                    files = [f for f in files if f['id'].startswith(folder_prefix) and f['id'] != folder_id]
                else:
                    files = [f for f in files if f['id'].startswith(folder_prefix)
                             and f['id'] != folder_id
                             and f['id'][len(folder_prefix):].count('/') <= 1]
            else:
                base_prefix = f"{user_id}/uploads/"
                files = [f for f in files if f['id'].startswith(base_prefix)
                         and '/' not in f['id'][len(base_prefix):].strip('/')]

        # Search
        if search_term:
            search_term = search_term.lower()
            files = [f for f in files if search_term in f.get('fileName', '').lower()]

        # === Separate folders and files ===
        folders = [f for f in files if f.get('fileType') == 'folder']
        regular_files = [f for f in files if f.get('fileType') != 'folder']

        # === Sort folders and files ===
        def sort_key(item):
            if sort_by == 'name':
                return item.get('fileName', '').lower()
            elif sort_by == 'size':
                return int(item.get('size', 0))
            elif sort_by == 'date':
                return item.get('createdAt', '')
            return ''

        reverse = sort_order.lower() == 'desc'

        # Sort folders first
        folders.sort(key=sort_key, reverse=reverse)
        regular_files.sort(key=sort_key, reverse=reverse)

        # Combine folders and files: folders come first
        sorted_files = folders + regular_files

        # Pagination Logic
        total = len(sorted_files)
        total_pages = math.ceil(total / limit)
        if page < 1 or page > total_pages:
            return response(400, {'message': f"Invalid page {page}. Total pages: {total_pages}"})

        start = (page - 1) * limit
        end = start + limit
        paginated_files = sorted_files[start:end]

        # Preview URLs
        for f in paginated_files:
            if f.get('fileType') != 'folder':
                try:
                    f['previewUrl'] = s3.generate_presigned_url(
                        'get_object',
                        Params={
                            'Bucket': f['bucket'],
                            'Key': f['id'],
                            'ResponseContentDisposition': 'inline'
                        },
                        ExpiresIn=300
                    )
                except Exception as e:
                    print(f"Preview URL error for {f['id']}: {e}")

        return response(200, {
            'files': paginated_files,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': total_pages,
                'hasNext': page < total_pages,
                'hasPrevious': page > 1
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
            return response(404, {'message': 'No folders found for the given userId.'})

        # Filter folders in the given region
        folders = [
            f for f in items
            if f.get('region') == region and f.get('fileType') == 'folder'
        ]

        # Build a nested tree
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
                    current[part] = {
                        'name': part,
                        'path': path_acc,
                        'children': {}
                    }
                current = current[part]['children']

        def flatten_tree(node_dict):
            return [
                {
                    'name': node['name'],
                    'path': node['path'],
                    'children': flatten_tree(node['children'])
                }
                for node in node_dict.values()
            ]

        hierarchy = flatten_tree(tree)

        return response(200, {'folders': hierarchy})

    except Exception as e:
        print(f"Error in handle_hierarchy: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})


def handle_delete(event):
    query = event.get('queryStringParameters', {}) or {}
    region    = query.get('region')
    user_id   = query.get('userId')
    file_name = query.get('fileName')
    folder    = query.get('folder')  # e.g. "pdf"
    raw_key   = query.get('key')     # the full id from metadata

    if not region or not user_id or (not file_name and not raw_key):
        return response(400, {
            'message': 'region, userId, and fileName or key are required.'
        })

    # Lookup bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    # Construct the full key
    if raw_key:
        key = raw_key
    else:
        prefix = f"{user_id}/uploads/"
        if folder:
            prefix += folder.strip('/') + '/'
        key = prefix + file_name

    # Check if it's a folder
    is_folder = key.endswith('/')
    if not is_folder:
        # Look up metadata to confirm if it's a folder
        item = file_metadata_table.get_item(Key={'id': key}).get('Item')
        if item and item.get('fileType') == 'folder':
            is_folder = True
            key += '/'

    if is_folder:
        # Delete all items under the folder path
        try:
            scan_result = file_metadata_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
            )
            items_to_delete = scan_result.get('Items', [])
        except ClientError as e:
            print(f"Failed to scan for folder contents under {key}: {e}")
            return response(500, {'message': 'Failed to retrieve folder contents'})

        for item in items_to_delete:
            sub_key = item['id']
            try:
                s3.delete_object(Bucket=bucket_name, Key=sub_key)
            except ClientError as e:
                print(f"Failed to delete S3 object {sub_key}: {e}")
            try:
                file_metadata_table.delete_item(Key={'id': sub_key})
            except ClientError as e:
                print(f"Failed to delete metadata for {sub_key}: {e}")
            print(f"Deleted item in folder: {sub_key}")

        # Delete the folder entry itself
        try:
            s3.delete_object(Bucket=bucket_name, Key=key)
        except ClientError as e:
            print(f"Failed to delete S3 folder object {key}: {e}")
        try:
            file_metadata_table.delete_item(Key={'id': key})
        except ClientError as e:
            print(f"Failed to delete folder metadata {key}: {e}")
        print(f"Deleted folder: {key}")

        return response(200, {'message': 'Folder and contents deleted successfully'})

    else:
        # Delete a single file
        try:
            s3.delete_object(Bucket=bucket_name, Key=key)
        except ClientError as e:
            print(f"Failed to delete S3 object {key}: {e}")
            return response(404, {'message': 'File not found or could not be deleted.'})

        try:
            file_metadata_table.delete_item(Key={'id': key})
        except ClientError as e:
            print(f"Failed to delete metadata for {key}: {e}")
        return response(200, {'message': 'File deleted successfully'})

def handle_usage(event):
    query_params = event.get('queryStringParameters', {})
    user_id = query_params.get('userId')

    if not user_id:
        return response(400, {'message': 'userId is required.'})

    try:
        response_db = file_metadata_table.query(
            IndexName='userId-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )

        files = response_db.get('Items', [])

        total_bytes = sum(
            int(f.get('size', 0))  # cast to int safely
            for f in files
            if f.get('fileType') != 'folder'
        )

        return response(200, {
            'userId': user_id,
            'totalBytes': total_bytes,
            'totalMB': round(total_bytes / (1024 * 1024), 2)
        })

    except Exception as e:
        print(f"Error in handle_usage: {e}")
        return response(500, {'message': 'Internal Server Error', 'error': str(e)})

# ----------------------------------------------------------------
# ✅ NEW FUNCTIONS (multiple delete, create folder, star, share, move/copy)
# ----------------------------------------------------------------


def handle_download_folder(event):
    query = event.get('queryStringParameters', {}) or {}
    region = query.get('region')
    user_id = query.get('userId')
    folder = query.get('folder')  # e.g. "sub" or "reports/2024"

    if not region or not user_id or not folder:
        return response(400, {'message': 'region, userId, and folder are required.'})

    # Get bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    prefix = f"{user_id}/uploads/{folder.strip('/')}/"
    clean_folder_name = folder.strip('/').replace('/', '_')

    try:
        # List all objects and collect folder paths
        objects = []
        folders = set()
        paginator = s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            objects.extend(page.get('Contents', []))
            for obj in page.get('Contents', []):
                key = obj['Key']
                if key.endswith('/'):
                    # Folder marker
                    folders.add(key)
                else:
                    # Add all parent folders
                    parts = key[len(f"{user_id}/uploads/"):].split('/')[:-1]
                    path_acc = ""
                    for part in parts:
                        path_acc = f"{path_acc}{part}/"
                        folders.add(f"{user_id}/uploads/{path_acc}")

        if not objects and not folders:
            return response(404, {'message': 'Folder is empty or does not exist.'})

        # Create ZIP
        tmp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(tmp_dir, f"{clean_folder_name}.zip")

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            # Add empty folders and all folders we collected
            for f in folders:
                rel_folder = f[len(f"{user_id}/uploads/"):]
                if not rel_folder.endswith('/'):
                    rel_folder += '/'
                zinfo = zipfile.ZipInfo(rel_folder)
                zipf.writestr(zinfo, '')

            # Add files
            for obj in objects:
                key = obj['Key']
                if key.endswith('/'):
                    continue  # skip folder markers

                rel_path = key[len(f"{user_id}/uploads/"):]
                tmp_file = os.path.join(tmp_dir, str(uuid.uuid4()))
                s3.download_file(bucket_name, key, tmp_file)
                zipf.write(tmp_file, arcname=rel_path)
                os.remove(tmp_file)

        # Upload ZIP
        zip_key = f"{user_id}/downloads/{clean_folder_name}.zip"
        s3.upload_file(zip_path, bucket_name, zip_key)

        # Generate presigned URL
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': zip_key},
            ExpiresIn=3600
        )

        print(f"Folder {folder} zipped and uploaded as {zip_key}")
        return response(200, {'downloadUrl': presigned_url})

    except Exception as e:
        print(f"Error downloading folder: {e}")
        return response(500, {'message': 'Error creating ZIP', 'error': str(e)})


def handle_delete_multiple(event):
    body = json.loads(event.get('body', '{}'))
    region  = body.get('region')
    user_id = body.get('userId')
    items   = body.get('fileNames', [])  # can be strings or dicts

    if not region or not user_id or not items:
        return response(400, {
            'message': 'region, userId, and fileNames are required.'
        })

    # Lookup bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    for it in items:
        if isinstance(it, dict):
            raw_key  = it.get('key')
            file_name = it.get('fileName')
            folder    = it.get('folder')
        else:
            raw_key  = None
            file_name = it
            folder    = None

        # Determine full key
        if raw_key:
            key = raw_key
        else:
            prefix = f"{user_id}/uploads/"
            if folder:
                prefix += folder.strip('/') + '/'
            key = prefix + file_name

        # Check if it's a folder
        is_folder = key.endswith('/')
        if not is_folder:
            # Look up metadata to check if it's a folder
            item = file_metadata_table.get_item(Key={'id': key}).get('Item')
            if item and item.get('fileType') == 'folder':
                is_folder = True
                key += '/'

        if is_folder:
            # Fetch all files under the folder path
            scan_result = file_metadata_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
            )
            items_to_delete = scan_result.get('Items', [])

            for sub_item in items_to_delete:
                sub_key = sub_item['id']
                try:
                    s3.delete_object(Bucket=bucket_name, Key=sub_key)
                except ClientError as e:
                    print(f"Failed to delete S3 object {sub_key}: {e}")
                try:
                    file_metadata_table.delete_item(Key={'id': sub_key})
                except ClientError as e:
                    print(f"Failed to delete metadata for {sub_key}: {e}")
                print(f"Deleted (folder content): {sub_key}")

            # Delete the folder itself
            try:
                s3.delete_object(Bucket=bucket_name, Key=key)
            except ClientError as e:
                print(f"Failed to delete folder object {key}: {e}")
            try:
                file_metadata_table.delete_item(Key={'id': key})
            except ClientError as e:
                print(f"Failed to delete folder metadata {key}: {e}")
            print(f"Deleted folder: {key}")

        else:
            # Delete a single file
            try:
                s3.delete_object(Bucket=bucket_name, Key=key)
            except ClientError as e:
                print(f"Failed to delete S3 object {key}: {e}")
            try:
                file_metadata_table.delete_item(Key={'id': key})
            except ClientError as e:
                print(f"Failed to delete metadata for {key}: {e}")
            print(f"Deleted file: {key}")

    return response(200, {'message': 'Files and folders deleted successfully'})

def handle_create_folder(event):
    body = json.loads(event['body'])
    region = body.get('region')
    user_id = body.get('userId')
    folder_name = body.get('folderName', '').strip().strip('/')

    if not region or not user_id or not folder_name:
        return response(400, {'message': 'region, folderName, and userId are required.'})

    # Get bucket for region
    bucket_response = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_response:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_response['Item']['bucketName']

    key = f"{user_id}/uploads/{folder_name}/"
    print(f"Attempting to create folder with S3 key: {key}")

    # Check if folder already exists in metadata
    existing = file_metadata_table.get_item(Key={'id': key}).get('Item')
    if existing:
        return response(409, {'message': 'Folder already exists.'})

    try:
        # Create empty object in S3 to represent folder
        s3.put_object(Bucket=bucket_name, Key=key)

        # Save metadata
        file_metadata_table.put_item(
            Item={
                'id': key,
                'bucket': bucket_name,
                'fileName': folder_name.split('/')[-1],  # just the folder's name
                'fileType': 'folder',
                'region': region,
                'userId': user_id,
                'createdAt': datetime.utcnow().isoformat(),
                'folder': '/'.join(folder_name.split('/')[:-1])  # parent path if nested
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
    raw_key   = body.get('key')       # full id, if client provides it
    file_name = body.get('fileName')  # e.g. "doc.pdf" or folder name
    folder    = body.get('folder')    # e.g. "myFolder" (no slashes)

    if not region or not user_id or (not raw_key and not file_name):
        return response(400, {
            'message': 'region, userId, and fileName or key are required.'
        })

    # Determine key
    if raw_key:
        key = raw_key
    else:
        prefix = f"{user_id}/uploads/"
        if folder:
            prefix += folder.strip('/') + '/'
        key = prefix + file_name

    # Get metadata
    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    is_folder = item and item.get('fileType') == 'folder'

    # If folder and not ending with '/', fix it
    if is_folder and not key.endswith('/'):
        key += '/'

    keys_to_update = []

    if is_folder:
        # Scan all items under this folder
        scan = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
        )
        items = scan.get('Items', [])
        keys_to_update = [i['id'] for i in items]

        # Also include the folder itself
        keys_to_update.append(key)
    else:
        keys_to_update.append(key)

    # Batch update
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
        'message': f"{'Folder and contents' if is_folder else 'File'} {'starred' if starred else 'unstarred'} successfully",
        'updatedItems': keys_to_update
    })

def handle_share(event):
    body = json.loads(event.get('body', '{}'))
    region      = body.get('region')
    user_id     = body.get('userId')
    raw_key     = body.get('key')         # full S3 key if you have it
    file_name   = body.get('fileName')    # e.g. "file.pdf"
    folder      = body.get('folder')      # e.g. "myFolder"
    permissions = body.get('permissions', 'view')
    expiry      = body.get('expiry', '7days')
    password    = body.get('password', '')

    if not region or not user_id or (not raw_key and not file_name):
        return response(400, {
            'message': 'region, userId, and fileName or key are required.'
        })

    # Determine full key
    if raw_key:
        key = raw_key
    else:
        prefix = f"{user_id}/uploads/"
        if folder:
            prefix += folder.strip('/') + '/'
        key = prefix + file_name

    # Lookup bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    # Determine if this is a folder
    item = file_metadata_table.get_item(Key={'id': key}).get('Item')
    is_folder = item and item.get('fileType') == 'folder'
    if is_folder and not key.endswith('/'):
        key += '/'

    # Expiry in seconds
    expiry_map = {
        '1day': 86400,
        '7days': 604800,
        '30days': 2592000,
        'never': 315360000
    }
    expiry_seconds = expiry_map.get(expiry, expiry_map['7days'])

    keys_to_update = []
    if is_folder:
        # Scan all nested items in the folder
        scan = file_metadata_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(key)
        )
        nested_items = scan.get('Items', [])
        keys_to_update = [item['id'] for item in nested_items]
        keys_to_update.append(key)  # include the folder itself
    else:
        keys_to_update = [key]

    # Update metadata for all applicable items
    for k in keys_to_update:
        try:
            file_metadata_table.update_item(
                Key={'id': k},
                UpdateExpression=(
                    "SET #s = :s, sharePermissions = :p, "
                    "shareExpiry = :e, sharePassword = :pw"
                ),
                ExpressionAttributeNames={'#s': 'shared'},
                ExpressionAttributeValues={
                    ':s': True,
                    ':p': permissions,
                    ':e': expiry,
                    ':pw': password
                }
            )
        except ClientError as e:
            print(f"Metadata update error for {k}: {e}")

    # Generate a share URL only for files, not folders
    share_url = None
    if not is_folder:
        try:
            share_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': key},
                ExpiresIn=expiry_seconds
            )
        except ClientError as e:
            print(f"Presign error for {key}: {e}")
            return response(404, {'message': 'File not found or inaccessible.'})

    return response(200, {
        'message': f'{"Folder and contents" if is_folder else "File"} shared successfully.',
        'shareLink': share_url,
        'id': key,
        'permissions': permissions,
        'expiry': expiry
    })

def handle_share_multiple(event):
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('userId')
    items = body.get('items', [])

    if not user_id or not items:
        return response(400, {'message': 'userId and items are required'})

    try:
        # Create a temporary ZIP file
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, f"{uuid.uuid4()}.zip")

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for item in items:
                if item.endswith('/'):
                    # It's a folder - list all objects in the folder
                    s3_objects = s3.list_objects_v2(Bucket=user_id, Prefix=item)
                    for obj in s3_objects.get('Contents', []):
                        key = obj['Key']
                        download_path = os.path.join(temp_dir, os.path.basename(key))
                        s3.download_file(user_id, key, download_path)
                        zipf.write(download_path, arcname=key)
                else:
                    # It's a file
                    download_path = os.path.join(temp_dir, os.path.basename(item))
                    s3.download_file(user_id, item, download_path)
                    zipf.write(download_path, arcname=item)

        # Upload ZIP to S3 in a "shared" location
        shared_bucket = 'your-shared-bucket'  # replace this
        zip_file_key = f"shared/{uuid.uuid4()}.zip"
        s3.upload_file(zip_path, shared_bucket, zip_file_key)

        # Generate a presigned URL for download
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': shared_bucket, 'Key': zip_file_key},
            ExpiresIn=3600  # 1 hour
        )

        return response(200, {'shareable_link': presigned_url})

    except Exception as e:
        print(f"Error in handle_share_multiple: {e}")
        return response(500, {'message': 'Internal server error', 'error': str(e)})

def handle_move_or_copy(event, operation):
    body = json.loads(event['body'])
    region = body.get('region')
    user_id = body.get('userId')
    source_file_names = body.get('sourceFileNames', [])
    destination_folder = body.get('destinationFolder')

    if not region or not user_id or not source_file_names or not destination_folder:
        return response(400, {
            'message': 'region, userId, sourceFileNames, and destinationFolder are required.'
        })

    # 1. Lookup bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    moved = []

    for source_name in source_file_names:
        # Detect if source is a folder
        source_key = f"{user_id}/uploads/{source_name}"
        if not source_key.endswith('/'):
            # Check if it's a folder in metadata
            item = file_metadata_table.get_item(Key={'id': source_key}).get('Item')
            if item and item.get('fileType') == 'folder':
                source_key += '/'

        # Get all items under this folder (if it's a folder)
        if source_key.endswith('/'):
            # Query all items with this prefix
            scan_result = file_metadata_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('id').begins_with(source_key)
            )
            items_to_copy = scan_result.get('Items', [])

            for item in items_to_copy:
                rel_path = item['id'][len(source_key):]
                dest_key = f"{user_id}/uploads/{destination_folder.strip('/')}/{source_name.strip('/')}/{rel_path}"

                # Copy file/folder in S3
                try:
                    s3.copy_object(
                        Bucket=bucket_name,
                        CopySource={'Bucket': bucket_name, 'Key': item['id']},
                        Key=dest_key
                    )
                except ClientError as e:
                    print(f"Error copying {item['id']} → {dest_key}: {e}")
                    continue

                # Copy metadata
                new_meta = {
                    **item,
                    'id': dest_key,
                    'fileName': dest_key.split('/')[-2 if dest_key.endswith('/') else -1],
                    'createdAt': datetime.utcnow().isoformat(),
                }
                file_metadata_table.put_item(Item=new_meta)

            # Delete originals if moving
            if operation == "move":
                for item in items_to_copy:
                    try:
                        s3.delete_object(Bucket=bucket_name, Key=item['id'])
                        file_metadata_table.delete_item(Key={'id': item['id']})
                    except ClientError as e:
                        print(f"Error deleting {item['id']}: {e}")

            moved.append(source_name)

        else:
            # Handle regular files as before
            # Ensure only filename is used, stripping any prefix
            filename_only = source_name.split('/')[-1]
            base_name, ext = filename_only.rsplit('.', 1) if '.' in filename_only else (filename_only, '')
            counter = 0
            while True:
                suffix = f" ({counter})" if counter else ""
                dest_file = f"{base_name}{suffix}{f'.{ext}' if ext else ''}"
                dest_key = f"{user_id}/uploads/{destination_folder.strip('/')}/{dest_file}"
                if not file_metadata_table.get_item(Key={'id': dest_key}).get('Item'):
                    break
                counter += 1


            try:
                s3.copy_object(
                    Bucket=bucket_name,
                    CopySource={'Bucket': bucket_name, 'Key': source_key},
                    Key=dest_key
                )
                original = file_metadata_table.get_item(Key={'id': source_key}).get('Item', {})
                if original:
                    new_meta = {
                        **original,
                        'id': dest_key,
                        'fileName': dest_file,
                        'createdAt': datetime.utcnow().isoformat(),
                    }
                    file_metadata_table.put_item(Item=new_meta)

                if operation == "move":
                    s3.delete_object(Bucket=bucket_name, Key=source_key)
                    file_metadata_table.delete_item(Key={'id': source_key})
                moved.append(dest_file)
            except ClientError as e:
                print(f"Error copying {source_key} → {dest_key}: {e}")
                continue

    return response(200, {
        'message': f'Files {operation}d successfully',
        'movedFiles': moved
    })

# ----------------------------------------------------------------

def response(status_code, body):
    return {
        'statusCode': status_code,
        'body': json.dumps(body)
    }def handle_download_folder(event):
    query = event.get('queryStringParameters', {}) or {}
    region = query.get('region')
    user_id = query.get('userId')
    folder = query.get('folder')  # e.g. "sub" or "reports/2024"

    if not region or not user_id or not folder:
        return response(400, {'message': 'region, userId, and folder are required.'})

    # Get bucket
    bucket_resp = bucket_table.get_item(Key={'region': region})
    if 'Item' not in bucket_resp:
        return response(404, {'message': f'No bucket found for region: {region}'})
    bucket_name = bucket_resp['Item']['bucketName']

    prefix = f"{user_id}/uploads/{folder.strip('/')}/"
    clean_folder_name = folder.strip('/').replace('/', '_')

    try:
        # List all objects in the folder
        objects = []
        paginator = s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            objects.extend(page.get('Contents', []))

        if not objects:
            return response(404, {'message': 'Folder is empty or does not exist.'})

        # Create ZIP in tmp
        tmp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(tmp_dir, f"{clean_folder_name}.zip")

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for obj in objects:
                key = obj['Key']
                if key.endswith('/'):
                    continue  # Skip S3 folder markers

                rel_path = key[len(prefix):]
                tmp_file = os.path.join(tmp_dir, str(uuid.uuid4()))
                s3.download_file(bucket_name, key, tmp_file)
                zipf.write(tmp_file, arcname=os.path.join(clean_folder_name, rel_path))
                os.remove(tmp_file)

        # Upload ZIP to S3 with folder-based name
        zip_key = f"{user_id}/downloads/{clean_folder_name}.zip"
        s3.upload_file(zip_path, bucket_name, zip_key)

        # Generate pre-signed URL
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': zip_key},
            ExpiresIn=3600
        )

        print(f"Folder {folder} zipped and uploaded as {zip_key}")
        return response(200, {'downloadUrl': presigned_url})

    except Exception as e:
        print(f"Error downloading folder: {e}")
        return response(500, {'message': 'Error creating ZIP', 'error': str(e)})
