import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
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
        application_id = body.get('application_id')

        # Verify the user owns the order
        if not verify_order_ownership(user_id, order_id):
            return create_response(403, {'success': False, 'message': 'You do not own this order'})

        # Accept the application
        accept_application(order_id, application_id)

        # Update order status to closed
        update_order_status(order_id, 'closed')

        # Reject all other applications
        reject_other_applications(order_id, application_id)

        return create_response(200, {'success': True, 'message': 'Application accepted and order closed'})
    except Exception as e:
        logger.error(f"Error processing application acceptance: {str(e)}")
        return create_response(500, {'success': False, 'error': 'Internal server error'})

def verify_order_ownership(user_id, order_id):
    try:
        # Query the UserOrdersIndex to get all orders for the user
        response = orders_table.query(
            IndexName='UserOrdersIndex',
            KeyConditionExpression='user_id = :user_id',
            ExpressionAttributeValues={
                ':user_id': user_id
            }
        )
        
        # Check if any of the returned orders match the order_id we're looking for
        for order in response.get('Items', []):
            if order['order_id'] == order_id:
                return True
        
        logger.warning(f"No order found with id {order_id} for user {user_id}")
        return False
    except ClientError as e:
        logger.error(f"Error verifying order ownership: {e}")
        raise

def accept_application(order_id, application_id):
    try:
        # First, query the application to get its full details
        response = applications_table.query(
            KeyConditionExpression='application_id = :application_id',
            ExpressionAttributeValues={':application_id': application_id},
            Limit=1
        )
        
        if not response['Items']:
            raise ValueError(f"No application found with id {application_id}")
        
        application = response['Items'][0]
        created_at = application['created_at']
        
        # Now update the application with both primary key attributes
        applications_table.update_item(
            Key={
                'application_id': application_id,
                'created_at': created_at
            },
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'accepted',
                ':updated_at': datetime.now().isoformat()
            }
        )
    except ClientError as e:
        logger.error(f"Error accepting application: {e}")
        raise

def update_order_status(order_id, status):
    try:
        # Query to get the full order details
        response = orders_table.query(
            KeyConditionExpression='order_id = :order_id',
            ExpressionAttributeValues={':order_id': order_id},
            Limit=1
        )
        
        if not response['Items']:
            raise ValueError(f"No order found with id {order_id}")
        
        order = response['Items'][0]
        created_at = order['created_at']
        
        # Update the order with both primary key attributes
        orders_table.update_item(
            Key={
                'order_id': order_id,
                'created_at': created_at
            },
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': status,
                ':updated_at': datetime.now().isoformat()
            }
        )
    except ClientError as e:
        logger.error(f"Error updating order status: {e}")
        raise

def reject_other_applications(order_id, accepted_application_id):
    try:
        response = applications_table.query(
            IndexName='OrderApplicationsIndex',
            KeyConditionExpression='order_id = :order_id',
            ExpressionAttributeValues={':order_id': order_id}
        )
        
        for application in response['Items']:
            if application['application_id'] != accepted_application_id:
                applications_table.update_item(
                    Key={
                        'application_id': application['application_id'],
                        'created_at': application['created_at']
                    },
                    UpdateExpression='SET #status = :status, updated_at = :updated_at',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={
                        ':status': 'rejected',
                        ':updated_at': datetime.now().isoformat()
                    }
                )
    except ClientError as e:
        logger.error(f"Error rejecting other applications: {e}")
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