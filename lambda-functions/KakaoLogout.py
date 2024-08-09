import json
import logging
import urllib.request
import os
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    logger.info(f"HTTP Method: {http_method}")
    
    if http_method == 'OPTIONS':
        return create_response(200, {})
    
    if http_method != 'POST':
        return create_response(400, {'error': f'Unsupported HTTP method: {http_method}. Only POST is supported.'})
    
    try:
        # Log headers for debugging
        headers = event.get('headers', {})
        logger.info(f"Received headers: {json.dumps(headers)}")
        
        # Extract the access token from the Authorization header
        auth_header = headers.get('Authorization', '') or headers.get('authorization', '')
        logger.info(f"Authorization header: {auth_header}")
        
        if not auth_header:
            raise ValueError("No Authorization header found")
        
        if not auth_header.lower().startswith('bearer '):
            raise ValueError("Invalid Authorization header format")
        
        access_token = auth_header.split(' ', 1)[1]
        logger.info(f"Extracted access token: {access_token[:10]}...") # Log first 10 chars for security

        # Find the user by access token
        user = get_user_by_access_token(access_token)
        if not user:
            return create_response(401, {'error': 'Invalid or expired token'})

        # Invalidate the user's tokens
        invalidate_user_tokens(user['user_id'])

        # Optionally, revoke the Kakao token
        revoke_kakao_token(access_token)

        return create_response(200, {'message': 'Logout successful'})
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return create_response(400, {'error': str(ve)})
    except Exception as e:
        logger.error(f"Error processing logout request: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def get_user_by_access_token(access_token):
    try:
        response = users_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('access_token').eq(access_token)
        )
        items = response.get('Items', [])
        return items[0] if items else None
    except ClientError as e:
        logger.error(f"Error querying user by access token: {e}")
        raise

def invalidate_user_tokens(user_id):
    try:
        current_time = datetime.now().isoformat()
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression="SET access_token = :a, refresh_token = :r, id_token = :id, token_expires_at = :te, updated_at = :u",
            ExpressionAttributeValues={
                ':a': '',
                ':r': '',
                ':id': '',  # Clear ID token
                ':te': current_time,
                ':u': current_time
            }
        )
    except ClientError as e:
        logger.error(f"Error invalidating user tokens: {e}")
        raise

def revoke_kakao_token(access_token):
    try:
        url = 'https://kapi.kakao.com/v1/user/logout'
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        req = urllib.request.Request(url, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        logger.error(f"Error revoking Kakao token: {e}")
        # We don't raise here because this is optional and shouldn't break the logout process

def create_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://allsuri-test.netlify.app',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': json.dumps(body)
    }