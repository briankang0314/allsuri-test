import json
import logging
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table('Orders')
applications_table = dynamodb.Table('Applications')

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
            return create_response(400, {'error': 'Missing order_id in request body'})

        # Delete the order and its applications
        result = delete_order_and_applications(user_id, order_id)
        
        if result:
            return create_response(200, {'message': 'Order and associated applications deleted successfully'})
        else:
            return create_response(404, {'error': 'Order not found or user not authorized to delete this order'})
    except Exception as e:
        logger.error(f"Error processing order deletion: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def delete_order_and_applications(user_id, order_id):
    try:
        # Query the order using the order_id
        response = orders_table.query(
            KeyConditionExpression=Key('order_id').eq(order_id),
            Limit=1
        )
        
        if not response['Items']:
            logger.warning(f"Order not found: {order_id}")
            return False
        
        order = response['Items'][0]
        
        if order['user_id'] != user_id:
            logger.warning(f"User {user_id} not authorized to delete order {order_id}")
            return False
        
        # Delete associated applications
        delete_applications(order_id)
        
        # Delete the order
        orders_table.delete_item(
            Key={
                'order_id': order_id,
                'created_at': order['created_at']
            }
        )
        logger.info(f"Order deleted successfully: {order_id}")
        return True
    except ClientError as e:
        logger.error(f"Error deleting order and applications: {e}")
        raise

def delete_applications(order_id):
    try:
        # Query all applications for this order
        response = applications_table.query(
            IndexName='OrderApplicationsIndex',  # Assume we have a GSI on order_id
            KeyConditionExpression=Key('order_id').eq(order_id)
        )
        
        applications = response['Items']
        
        # Delete each application
        with applications_table.batch_writer() as batch:
            for application in applications:
                # Assuming the Applications table has a composite key of 'application_id' and 'created_at'
                # Adjust these key names if they're different in your table
                batch.delete_item(
                    Key={
                        'application_id': application['application_id'],
                        'created_at': application['created_at']
                    }
                )
        
        logger.info(f"Deleted {len(applications)} applications for order {order_id}")
    except ClientError as e:
        logger.error(f"Error deleting applications for order {order_id}: {e}")
        logger.error(f"Application structure: {json.dumps(applications[0]) if applications else 'No applications found'}")
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