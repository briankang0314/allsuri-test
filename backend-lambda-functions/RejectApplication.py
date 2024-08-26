import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
orders_table = dynamodb.Table('Orders')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        body = json.loads(event['body'])
        order_id = body.get('order_id')
        application_id = body.get('application_id')

        # Get the order details including created_at
        order = get_order(order_id)
        if not order:
            return create_response(404, {'success': False, 'message': 'Order not found'})

        if not verify_order_ownership(user_id, order_id):
            return create_response(403, {'success': False, 'message': 'You do not own this order'})

        rejected_application = reject_application(order_id, application_id)
        update_order_applicant_count(order_id, order['created_at'], -1)

        # Send push notification to the rejected applicant
        send_push_notification(
            rejected_application['applicant_id'],
            '지원서 거절',
            f'죄송합니다. 귀하의 지원서가 오더 "{order["title"]}"에 거절되었습니다.'
        )

        return create_response(200, {'success': True, 'message': 'Application rejected successfully'})
    except Exception as e:
        logger.error(f"Error processing application rejection: {str(e)}")
        return create_response(500, {'success': False, 'error': 'Internal server error'})

def get_order(order_id):
    try:
        response = orders_table.query(
            KeyConditionExpression='order_id = :order_id',
            ExpressionAttributeValues={':order_id': order_id},
            Limit=1
        )
        return response['Items'][0] if response['Items'] else None
    except ClientError as e:
        logger.error(f"Error getting order: {e}")
        raise

def update_order_applicant_count(order_id, created_at, change):
    try:
        orders_table.update_item(
            Key={
                'order_id': order_id,
                'created_at': created_at
            },
            UpdateExpression='SET applicants_count = if_not_exists(applicants_count, :zero) + :change',
            ExpressionAttributeValues={':change': change, ':zero': 0},
            ReturnValues='UPDATED_NEW'
        )
        
        logger.info(f"Updated applicants_count for order {order_id}")
        
    except ClientError as e:
        logger.error(f"Error updating order applicant count: {e}")
        raise

def verify_order_ownership(user_id, order_id):
    try:
        # First, query the main table to get the created_at value
        response = orders_table.query(
            KeyConditionExpression='order_id = :order_id',
            ExpressionAttributeValues={':order_id': order_id},
            Limit=1
        )
        
        if not response['Items']:
            logger.warning(f"No order found with id {order_id}")
            return False
        
        created_at = response['Items'][0]['created_at']
        
        # Now query the UserOrdersIndex with all required key schema elements
        response = orders_table.query(
            IndexName='UserOrdersIndex',
            KeyConditionExpression='user_id = :user_id AND created_at = :created_at',
            ExpressionAttributeValues={
                ':user_id': user_id,
                ':created_at': created_at
            }
        )
        
        # Check if the order belongs to the user
        for item in response.get('Items', []):
            if item['order_id'] == order_id:
                return True
        
        logger.warning(f"Order with id {order_id} does not belong to user {user_id}")
        return False
    except ClientError as e:
        logger.error(f"Error verifying order ownership: {e}")
        raise

def reject_application(order_id, application_id):
    try:
        # First, get the application to retrieve its created_at timestamp
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
        updated_application = applications_table.update_item(
            Key={
                'application_id': application_id,
                'created_at': created_at
            },
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'rejected',
                ':updated_at': datetime.now().isoformat()
            },
            ReturnValues='ALL_NEW'
        )
        
        return updated_application['Attributes']
    except ClientError as e:
        logger.error(f"Error rejecting application: {e}")
        raise

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

def send_push_notification(user_id, title, body):
    logger.info(f"Sending push notification to user_id: {user_id}")
    logger.info(f"Notification title: {title}")
    logger.info(f"Notification body: {body}")
    try:
        user = get_user(user_id)
        if not user or 'device_token' not in user:
            logger.error(f"Failed to send push notification: No device token for user {user_id}")
            return
        device_token = user['device_token']
        notification_data = {
            'title': title,
            'body': body,
            'device_token': device_token
        }
        headers = {
            'Authorization': f"Bearer {user['access_token']}",
            'Content-Type': 'application/json'
        }
        url = 'https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/SendPush'
        
        logger.info("Full request details:")
        logger.info(f"URL: {url}")
        logger.info(f"Method: POST")
        logger.info(f"Headers: {json.dumps(headers, indent=2)}")
        logger.info(f"Body: {json.dumps(notification_data, indent=2)}")
        
        response = requests.post(url, json=notification_data, headers=headers)
        
        logger.info(f"Push notification request sent. Status code: {response.status_code}")
        logger.info(f"Push notification response headers: {json.dumps(dict(response.headers), indent=2)}")
        response.raise_for_status()
        logger.info(f"Push notification sent successfully: {response.status_code}")
        logger.info(f"Push notification response: {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending push notification: {str(e)}")
        if e.response:
            logger.error(f"Response status code: {e.response.status_code}")
            logger.error(f"Response headers: {json.dumps(dict(e.response.headers), indent=2)}")
            logger.error(f"Response body: {e.response.text}")

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