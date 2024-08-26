import json
import logging
import urllib.request
import urllib.parse
import os
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

logger = logging.getLogger()
logger.setLevel(logging.INFO)

KAKAO_CLIENT_ID = os.environ.get('KAKAO_CLIENT_ID')

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    
    if http_method == 'OPTIONS':
        return create_response(200, {})
    
    if http_method != 'POST':
        return create_response(400, {'error': f'Unsupported HTTP method: {http_method}. Only POST is supported.'})
    
    try:
        body = json.loads(event['body'])
        refresh_token = body.get('refresh_token')
        
        if not refresh_token:
            raise ValueError("No refresh token provided in the request body")
        
        # Get new tokens from Kakao
        new_tokens = refresh_kakao_token(refresh_token)
        
        # Update user in DynamoDB
        user = update_user_tokens(refresh_token, new_tokens)
        
        return create_response(200, {
            'message': 'Token refresh successful',
            'tokens': new_tokens
        })
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return create_response(500, {'error': str(e)})

def refresh_kakao_token(refresh_token):
    url = 'https://kauth.kakao.com/oauth/token'
    data = urllib.parse.urlencode({
        'grant_type': 'refresh_token',
        'client_id': KAKAO_CLIENT_ID,
        'refresh_token': refresh_token
    }).encode()
    
    req = urllib.request.Request(url, data=data, method='POST')
    with urllib.request.urlopen(req) as response:
        tokens = json.loads(response.read().decode())
    
    # If a new refresh token is not provided, use the old one
    if 'refresh_token' not in tokens:
        tokens['refresh_token'] = refresh_token
    
    return tokens

def update_user_tokens(old_refresh_token, new_tokens):
    try:
        # Find the user by the old refresh token
        response = users_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('refresh_token').eq(old_refresh_token)
        )
        items = response.get('Items', [])
        if not items:
            raise ValueError("No user found with the provided refresh token")
        
        user = items[0]
        user_id = user['user_id']
        
        current_time = datetime.now().isoformat()
        expiration_time = (datetime.now() + timedelta(seconds=new_tokens['expires_in'])).isoformat()
        
        # Prepare update expression and attribute values
        update_expression = "SET access_token = :a, token_expires_at = :te, updated_at = :u"
        expression_attribute_values = {
            ':a': new_tokens['access_token'],
            ':te': expiration_time,
            ':u': current_time
        }
        
        # Update refresh token if a new one was provided
        if 'refresh_token' in new_tokens:
            update_expression += ", refresh_token = :r"
            expression_attribute_values[':r'] = new_tokens['refresh_token']
        
        # Update refresh token expiration if provided
        if 'refresh_token_expires_in' in new_tokens:
            refresh_expiration_time = (datetime.now() + timedelta(seconds=new_tokens['refresh_token_expires_in'])).isoformat()
            update_expression += ", refresh_token_expires_at = :rte"
            expression_attribute_values[':rte'] = refresh_expiration_time
        
        # Update ID token if provided
        if 'id_token' in new_tokens:
            update_expression += ", id_token = :id"
            expression_attribute_values[':id'] = new_tokens['id_token']
        
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        
        return user
    except ClientError as e:
        logger.error(f"Error updating user tokens: {e}")
        raise

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
    