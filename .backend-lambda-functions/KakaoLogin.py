import json
import logging
import urllib.request
import urllib.parse
import os
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta, timezone
import uuid

logger = logging.getLogger()
logger.setLevel(logging.INFO)

KAKAO_CLIENT_ID = os.environ.get('KAKAO_CLIENT_ID')
KAKAO_REDIRECT_URI = os.environ.get('KAKAO_REDIRECT_URI')

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

tz = timezone(timedelta(hours=9))

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    logger.info(f"HTTP Method: {http_method}")
    
    if http_method != 'POST':
        return create_response(400, {'error': f'Unsupported HTTP method: {http_method}. Only POST is supported.'})
    try:
        body = json.loads(event['body'])
        auth_code = body.get('code')
        device_token = body.get('deviceToken')
        
        if not auth_code:
            raise ValueError("No authorization code provided in the request body")
        
        # Exchange auth code for tokens
        tokens = exchange_code_for_tokens(auth_code)
        
        # Get user info using access token
        kakao_user_info = get_user_info(tokens['access_token'])
        
        # Save or update user in DynamoDB
        user = save_user_to_db(kakao_user_info, tokens, device_token)
        
        return create_response(200, {
            'message': 'Login successful',
            'user': user,
            'tokens': tokens  # Be cautious about returning tokens to the frontend
        })
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return create_response(500, {'error': str(e)})



def exchange_code_for_tokens(auth_code):
    url = 'https://kauth.kakao.com/oauth/token'
    data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'client_id': KAKAO_CLIENT_ID,
        'redirect_uri': KAKAO_REDIRECT_URI,
        'code': auth_code
    }).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())



def get_user_info(access_token):
    url = 'https://kapi.kakao.com/v2/user/me'
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {access_token}')
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())



def save_user_to_db(kakao_user_info, tokens, device_token):
    try:
        kakao_id = str(kakao_user_info['id'])
        current_time = datetime.now(tz=tz).isoformat()

        # Check if a user with this Kakao ID already exists
        existing_user = get_user_by_kakao_id(kakao_id)

        if existing_user:
            # User exists, update their information
            user = update_existing_user(existing_user['user_id'], kakao_user_info, tokens, device_token, current_time)
        else:
            # New user, create a new entry
            user = create_new_user(kakao_id, kakao_user_info, tokens, device_token, current_time)

        return user
    except ClientError as e:
        logger.error(f"Error saving user to DynamoDB: {e}")
        raise



def get_user_by_kakao_id(kakao_id):
    try:
        response = users_table.query(
            IndexName='KakaoIdIndex',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('kakao_id').eq(kakao_id)
        )
        items = response.get('Items', [])
        return items[0] if items else None
    except ClientError as e:
        logger.error(f"Error querying user by Kakao ID: {e}")
        raise



def update_existing_user(user_id, kakao_user_info, tokens, device_token, current_time):
    try:
        expiration_time = datetime.now(tz=tz) + timedelta(seconds=tokens['expires_in'])
        
        update_expression = "SET nickname = :n, email = :e, profile_image_url = :p, " \
                            "thumbnail_image_url = :t, access_token = :a, " \
                            "refresh_token = :r, token_expires_at = :te, " \
                            "last_login = :l, updated_at = :u, id_token = :id"
        
        expression_attribute_values = {
            ':n': kakao_user_info['properties'].get('nickname', ''),
            ':e': kakao_user_info['kakao_account'].get('email', ''),
            ':p': kakao_user_info['properties'].get('profile_image', ''),
            ':t': kakao_user_info['properties'].get('thumbnail_image', ''),
            ':a': tokens['access_token'],
            ':r': tokens['refresh_token'],
            ':te': expiration_time.isoformat(),
            ':l': current_time,
            ':u': current_time,
            ':id': tokens['id_token'] # Add ID token
        }
        
        if device_token:
            update_expression += ", device_token = :dt"
            expression_attribute_values[':dt'] = device_token
        
        response = users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )
        return response['Attributes']
    except ClientError as e:
        logger.error(f"Error updating existing user: {e}")
        raise



def create_new_user(kakao_id, kakao_user_info, tokens, device_token, current_time):
    try:
        user_id = str(uuid.uuid4())
        expiration_time = datetime.now(tz=tz) + timedelta(seconds=tokens['expires_in'])
        
        item = {
            'user_id': user_id,
            'kakao_id': kakao_id,
            'nickname': kakao_user_info['properties'].get('nickname', ''),
            'email': kakao_user_info['kakao_account'].get('email', ''),
            'profile_image_url': kakao_user_info['properties'].get('profile_image', ''),
            'thumbnail_image_url': kakao_user_info['properties'].get('thumbnail_image', ''),
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'id_token': tokens['id_token'],  # Add ID token
            'token_expires_at': expiration_time.isoformat(),
            'last_login': current_time,
            'created_at': current_time,
            'updated_at': current_time
        }
        
        if device_token:
            item['device_token'] = device_token
        
        users_table.put_item(Item=item)
        return item
    except ClientError as e:
        logger.error(f"Error creating new user: {e}")
        raise



def create_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://allsuri-test.netlify.app',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(body)
    }
