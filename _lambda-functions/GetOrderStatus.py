import json
import logging
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table('Orders')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user information from the authorizer context
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        # Parse the request body
        body = json.loads(event['body'])
        order_id = body.get('order_id')

        if not order_id:
            return create_response(400, {'success': False, 'message': 'order_id is required'})

        # Fetch the order status
        order_status = get_order_status(order_id)

        if order_status is None:
            return create_response(404, {'success': False, 'message': 'Order not found'})

        return create_response(200, {'success': True, 'status': order_status})
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return create_response(500, {'success': False, 'message': 'Internal server error'})

def get_order_status(order_id):
    try:
        response = orders_table.query(
            KeyConditionExpression='order_id = :order_id',
            ExpressionAttributeValues={':order_id': order_id},
            ProjectionExpression='#status',
            ExpressionAttributeNames={'#status': 'status'},
            Limit=1
        )

        items = response.get('Items', [])
        if items:
            return items[0]['status']
        else:
            return None
    except ClientError as e:
        logger.error(f"Error querying order status: {e}")
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