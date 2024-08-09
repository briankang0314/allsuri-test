import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import uuid

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table('Orders')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user information from the authorizer context
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        # Parse the request body
        body = json.loads(event['body'])
        logger.info(f"Request body: {body}")
        
        # Create the order
        order = create_order(user_id, body)
        logger.info(f"Order created: {order['order_id']}")
        
        return create_response(200, {'message': 'Order created successfully', 'order': order})
    except Exception as e:
        logger.error(f"Error processing order submission: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def get_user_by_access_token(access_token):
    try:
        logger.info("Querying user by access token")
        response = users_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('access_token').eq(access_token)
        )
        items = response.get('Items', [])
        if items:
            logger.info(f"User found with id: {items[0]['user_id']}")
        else:
            logger.warning("No user found with the given access token")
        return items[0] if items else None
    except ClientError as e:
        logger.error(f"Error querying user by access token: {e}")
        raise

def create_order(user_id, order_data):
    try:
        order_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'order_id': order_id,
            'user_id': user_id,
            'title': order_data['title'],
            'category': order_data['category'],
            'region': order_data['region'],
            'city': order_data['city'],
            'fee': order_data['fee'],
            'description': order_data['description'],
            'status': 'open',
            'created_at': current_time,
            'updated_at': current_time
        }
        
        orders_table.put_item(Item=item)
        return item
    except ClientError as e:
        logger.error(f"Error creating new order: {e}")
        raise

def create_response(status_code, body):
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