import json
import logging
import requests
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from datetime import datetime
import uuid
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
orders_table = dynamodb.Table('Orders')
users_table = dynamodb.Table('Users')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user information from the authorizer context
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        # Parse the request body
        body = json.loads(event['body'])
        logger.info(f"Request body: {json.dumps(body, cls=DecimalEncoder)}")
        
        # Check if application already exists
        existing_application = check_existing_application(user_id, body['order_id'])
        logger.info(f"Existing application check result: {existing_application}")
        if existing_application:
            logger.info("Application already exists, returning 400 response")
            return create_response(400, {
                'success': False,
                'message': 'You have already applied to this order.'
            })
        
        # Create the application
        application = create_application(user_id, body)
        logger.info(f"Application created: {json.dumps(application, cls=DecimalEncoder)}")
        
        # Update the order's applicant count
        update_result = update_order_applicant_count(body['order_id'])
        logger.info(f"Order applicant count update result: {json.dumps(update_result, cls=DecimalEncoder)}")
        
        response = create_response(200, {
            'success': True,
            'message': 'Application submitted successfully', 
            'application': application
        })
        logger.info(f"Returning successful response: {json.dumps(response, cls=DecimalEncoder)}")
        return response
    except Exception as e:
        logger.error(f"Error processing application submission: {str(e)}")
        error_response = create_response(500, {'success': False, 'error': 'Internal server error'})
        logger.info(f"Returning error response: {json.dumps(error_response, cls=DecimalEncoder)}")
        return error_response

def check_existing_application(user_id, order_id):
    logger.info(f"Checking existing application for user_id: {user_id}, order_id: {order_id}")
    try:
        response = applications_table.query(
            IndexName='UserOrderIndex',
            KeyConditionExpression=Key('applicant_id').eq(user_id) & Key('order_id').eq(order_id),
            Limit=1
        )
        logger.info(f"Existing application query response: {json.dumps(response, cls=DecimalEncoder)}")
        return len(response['Items']) > 0
    except ClientError as e:
        logger.error(f"Error checking existing application: {e}")
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

def create_application(user_id, application_data):
    logger.info(f"Creating application for user_id: {user_id}")
    logger.info(f"Application data: {json.dumps(application_data, cls=DecimalEncoder)}")
    try:
        application_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        # Process estimated completion time
        estimated_completion = application_data['estimated_completion']
        if estimated_completion == 'custom':
            estimated_completion = application_data['customEstimatedTime']
        
        item = {
            'application_id': application_id,
            'order_id': application_data['order_id'],
            'applicant_id': user_id,
            'applicantName': application_data['applicantName'],
            'location': application_data['location'],
            'availability': application_data['availability'],
            'estimated_completion': estimated_completion,
            'introduction': application_data['introduction'],
            'equipment': application_data['equipment'],
            'otherEquipment': application_data.get('otherEquipment', ''),
            'questions': application_data['questions'],
            'status': 'pending',
            'created_at': current_time,
            'updated_at': current_time
        }
        
        logger.info(f"Putting item in applications table: {json.dumps(item, cls=DecimalEncoder)}")
        applications_table.put_item(Item=item)
        
        order = get_order(application_data['order_id'])
        logger.info(f"Retrieved order: {json.dumps(order, cls=DecimalEncoder)}")
        if order:
            send_push_notification(
                order['user_id'],
                '새로운 지원서 도착',
                f'귀하의 오더 "{order["title"]}"에 새로운 지원서가 도착했습니다.'
            )
        
        return item
    except ClientError as e:
        logger.error(f"Error creating new application: {e}")
        raise

def get_order(order_id):
    logger.info(f"Fetching order with order_id: {order_id}")
    try:
        response = orders_table.query(
            KeyConditionExpression=Key('order_id').eq(order_id),
            Limit=1
        )
        logger.info(f"Order query response: {json.dumps(response, cls=DecimalEncoder)}")
        return response['Items'][0] if response['Items'] else None
    except ClientError as e:
        logger.error(f"Error fetching order: {e}")
        return None

def update_order_applicant_count(order_id):
    logger.info(f"Updating applicants_count for order_id: {order_id}")
    try:
        # Query the order to get its created_at value
        query_response = orders_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('order_id').eq(order_id),
            Limit=1
        )
        logger.info(f"Order query response: {json.dumps(query_response, cls=DecimalEncoder)}")

        if not query_response['Items']:
            logger.error(f"Order with id {order_id} not found")
            raise Exception(f"Order with id {order_id} not found")

        order_item = query_response['Items'][0]
        created_at = order_item['created_at']

        logger.info(f"Current order item: {json.dumps(order_item, cls=DecimalEncoder)}")

        # Now attempt the update with both partition key and sort key
        response = orders_table.update_item(
            Key={
                'order_id': order_id,
                'created_at': created_at
            },
            UpdateExpression='SET applicants_count = if_not_exists(applicants_count, :zero) + :inc',
            ExpressionAttributeValues={':inc': 1, ':zero': 0},
            ReturnValues='UPDATED_NEW'
        )
        
        logger.info(f"Order update response: {json.dumps(response, cls=DecimalEncoder)}")
        
        updated_count = response['Attributes'].get('applicants_count')
        logger.info(f"Updated applicants_count for order {order_id}: {updated_count}")
        
        if updated_count == 1:
            logger.info(f"First application received for order {order_id}")
        
        return response['Attributes']
    except ClientError as e:
        logger.error(f"ClientError in update_order_applicant_count: {str(e)}")
        logger.error(f"Error code: {e.response['Error']['Code']}")
        logger.error(f"Error message: {e.response['Error']['Message']}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in update_order_applicant_count: {str(e)}")
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

def create_response(status_code, body):
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://allsuri-test.netlify.app',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        'body': json.dumps(body)
    }
    logger.info(f"Creating response: {json.dumps(response, cls=DecimalEncoder)}")
    return response