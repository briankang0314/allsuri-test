import json
import logging
import os
import boto3
from botocore.exceptions import ClientError
import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

# Initialize Firebase Admin SDK
logger.info("Initializing Firebase Admin SDK")
firebase_cred_json = json.loads(os.environ['FIREBASE_CREDENTIALS'])
cred = credentials.Certificate(firebase_cred_json)
firebase_admin.initialize_app(cred)
logger.info("Firebase Admin SDK initialized successfully")

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract and validate the authorization token
        auth_header = event.get('headers', {}).get('Authorization')
        logger.info(f"Authorization header: {auth_header}")
        
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("No valid token provided in Authorization header")
            return create_response(401, {'error': 'Unauthorized - No valid token provided'})
        
        token = auth_header.split(' ')[1]
        logger.info(f"Extracted token: {token[:10]}...") # Log first 10 characters of token for security
        
        # Validate the token
        logger.info("Validating token")
        user = validate_token(token)
        if not user:
            logger.warning("Invalid token - user not found")
            return create_response(401, {'error': 'Unauthorized - Invalid token'})
        logger.info(f"Token validated successfully for user: {user['user_id']}")
        
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        title = body.get('title')
        message_body = body.get('body')
        
        logger.info(f"Parsed request body - user_id: {user_id}, title: {title}, body: {message_body[:50]}...")
        
        if not all([user_id, title, message_body]):
            logger.warning("Missing required parameters in request body")
            return create_response(400, {'error': 'Missing required parameters'})
        
        # Ensure the token belongs to the user trying to send the notification
        if user['user_id'] != user_id:
            logger.warning(f"Token user_id ({user['user_id']}) does not match request user_id ({user_id})")
            return create_response(403, {'error': 'Forbidden - Token does not match user_id'})
        
        if 'device_token' not in user:
            logger.warning(f"Device token not found for user: {user_id}")
            return create_response(404, {'error': 'Device token not found for user'})
        
        device_token = user['device_token']
        logger.info(f"Retrieved device token for user: {user_id}")
        
        # Send the push notification
        logger.info(f"Sending Firebase message to user: {user_id}")
        send_firebase_message(device_token, title, message_body)
        
        logger.info("Push notification sent successfully")
        return create_response(200, {'success': True, 'message': 'Push notification sent successfully'})
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return create_response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        logger.error(f"Error sending push notification: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})

def get_user(user_id):
    logger.info(f"Fetching user data for user_id: {user_id}")
    try:
        response = users_table.get_item(Key={'user_id': user_id})
        user = response.get('Item')
        if user:
            logger.info(f"User data retrieved successfully for user_id: {user_id}")
        else:
            logger.warning(f"No user found for user_id: {user_id}")
        return user
    except ClientError as e:
        logger.error(f"Error fetching user: {e}", exc_info=True)
        raise

def send_firebase_message(token, title, body):
    logger.info(f"Preparing Firebase message - title: {title}, body: {body[:50]}...")
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=token,
    )
    
    try:
        logger.info("Sending Firebase message")
        response = messaging.send(message)
        logger.info(f"Successfully sent message: {response}")
    except messaging.ApiCallError as e:
        logger.error(f"Error sending Firebase message: {e.code} - {e.message}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error sending Firebase message: {str(e)}", exc_info=True)
        raise

def validate_token(token):
    logger.info("Validating token in DynamoDB")
    try:
        response = users_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('access_token').eq(token)
        )
        items = response.get('Items', [])
        if items:
            logger.info(f"Token validated successfully, user found: {items[0]['user_id']}")
        else:
            logger.warning("No user found for the provided token")
        return items[0] if items else None
    except ClientError as e:
        logger.error(f"Error validating token: {e}", exc_info=True)
        return None

def create_response(status_code, body):
    logger.info(f"Creating response - status_code: {status_code}, body: {json.dumps(body)}")
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://allsuri-test.netlify.app',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        'body': json.dumps(body)
    }