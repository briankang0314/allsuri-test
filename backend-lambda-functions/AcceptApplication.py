import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import requests
from urllib.parse import quote

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
orders_table = dynamodb.Table('Orders')
users_table = dynamodb.Table('Users')

SENDBIRD_API_TOKEN = '7e37ae92fe49e7cde3242e4556ec933c13d0734d'
SENDBIRD_APP_ID = '9C4825FA-714B-49B2-B75A-72E9E5632578'
SENDBIRD_API_URL = f'https://api-{SENDBIRD_APP_ID}.sendbird.com/v3'

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

        # Accept the application and get order details
        accepted_application, order = accept_application(order_id, application_id)

        # Update order status to closed
        update_order_status(order_id, order['created_at'], 'closed')

        # Reject all other applications
        reject_other_applications(order_id, application_id)
        
        # Create Sendbird channel
        channel = create_sendbird_channel(order['user_id'], accepted_application['applicant_id'], order_id)
        
        if channel:
            # Store the channel URL in your order or application record
            update_order_with_channel(order_id, order['created_at'], channel['channel_url'])
            
            # Log the response data
            response_data = {
                'message': 'Application accepted successfully',
                'order_id': order_id,
                'application_id': application_id,
                'sendbird_channel_url': channel['channel_url']
            }
            logger.info(f"Sending response to client: {json.dumps(response_data, indent=2)}")
        else:
            logger.warning(f"Failed to create Sendbird channel for order {order_id}")

        # Send push notification to the accepted applicant
        send_push_notification(
            accepted_application['applicant_id'],
            '지원서 수락',
            f'귀하의 지원서가 오더 "{accepted_application["order_title"]}"에 수락되었습니다.'
        )

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
        # First, get the order details
        order = get_order(order_id)
        if not order:
            raise ValueError(f"No order found with id {order_id}")
        
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
        
        # Get the order details to include the order title in the notification
        order_title = order['title'] if order else "Unknown Order"
        
        # Now update the application with both primary key attributes
        updated_application = applications_table.update_item(
            Key={
                'application_id': application_id,
                'created_at': created_at
            },
            UpdateExpression='SET #status = :status, updated_at = :updated_at, order_title = :order_title',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'accepted',
                ':updated_at': datetime.now().isoformat(),
                ':order_title': order_title
            },
            ReturnValues='ALL_NEW'
        )
        
        return updated_application['Attributes'], order
    except ClientError as e:
        logger.error(f"Error accepting application: {e}")
        raise

def update_order_status(order_id, created_at, status):
    try:
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
        logger.info(f"Updated status of order {order_id} to {status}")
    except ClientError as e:
        logger.error(f"Error updating order status: {e}")
        raise

def update_order_with_channel(order_id, created_at, channel_url):
    try:
        orders_table.update_item(
            Key={
                'order_id': order_id,
                'created_at': created_at
            },
            UpdateExpression='SET sendbird_channel_url = :channel_url, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':channel_url': channel_url,
                ':updated_at': datetime.now().isoformat()
            }
        )
        logger.info(f"Updated order {order_id} with Sendbird channel URL: {channel_url}")
    except ClientError as e:
        logger.error(f"Error updating order with channel URL: {e}")
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
                rejected_application = applications_table.update_item(
                    Key={
                        'application_id': application['application_id'],
                        'created_at': application['created_at']
                    },
                    UpdateExpression='SET #status = :status, updated_at = :updated_at',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={
                        ':status': 'rejected',
                        ':updated_at': datetime.now().isoformat()
                    },
                    ReturnValues='ALL_NEW'
                )
                
                # Send push notification to rejected applicants
                send_push_notification(
                    rejected_application['Attributes']['applicant_id'],
                    '지원서 거절',
                    f'죄송합니다. 귀하의 지원서가 오더 "{rejected_application["Attributes"].get("order_title", "Unknown Order")}"에 거절되었습니다.'
                )
    except ClientError as e:
        logger.error(f"Error rejecting other applications: {e}")
        raise

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

def create_sendbird_channel(poster_id, applicant_id, order_id):
    url = f"{SENDBIRD_API_URL}/group_channels"
    headers = {
        "Content-Type": "application/json",
        "Api-Token": SENDBIRD_API_TOKEN
    }
    
    # URL encode the user IDs
    encoded_poster_id = quote(poster_id, safe='')
    encoded_applicant_id = quote(applicant_id, safe='')
    
    data = {
        "user_ids": [encoded_poster_id, encoded_applicant_id],
        "name": f"Order {order_id}",
        "channel_url": f"order_{order_id}",
        "is_distinct": True,
        "custom_type": "order_chat",
        "data": json.dumps({"order_id": order_id})
    }
    
    logger.info(f"Creating Sendbird channel with data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        channel_data = response.json()
        logger.info(f"Sendbird channel created successfully: {json.dumps(channel_data, indent=2)}")
        return channel_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to create Sendbird channel: {str(e)}")
        return None

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