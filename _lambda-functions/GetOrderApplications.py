import json
import logging
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
users_table = dynamodb.Table('Users')
orders_table = dynamodb.Table('Orders')

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
        order_id = body.get('order_id')
        logger.info(f"Request body: {json.dumps(body, cls=DecimalEncoder)}")

        if not order_id:
            logger.error("Missing order_id in request body")
            return create_response(400, {'success': False, 'error': 'Missing order_id in request body'})

        # Fetch applications for the given order
        applications = get_order_applications(order_id)
        logger.info(f"Retrieved applications: {json.dumps(applications, cls=DecimalEncoder)}")
        
        # Fetch and add applicant details to each application
        applications_with_details = add_applicant_details(applications)
        logger.info(f"Applications with details: {json.dumps(applications_with_details, cls=DecimalEncoder)}")

        # Fetch order details
        order = get_order(order_id)
        if not order:
            logger.error(f"Order with id {order_id} not found")
            return create_response(404, {'success': False, 'error': 'Order not found'})

        # Check if the authenticated user is the order owner
        if user_id != order['user_id']:
            logger.error(f"User {user_id} is not authorized to view applications for order {order_id}")
            return create_response(403, {'success': False, 'error': 'Not authorized to view these applications'})

        response = create_response(200, {
            'success': True,
            'applications': applications_with_details
        })
        logger.info(f"Returning successful response: {json.dumps(response, cls=DecimalEncoder)}")
        return response

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        error_response = create_response(500, {'success': False, 'error': 'Internal server error'})
        logger.info(f"Returning error response: {json.dumps(error_response, cls=DecimalEncoder)}")
        return error_response

def get_order_applications(order_id):
    logger.info(f"Fetching applications for order_id: {order_id}")
    try:
        response = applications_table.query(
            IndexName='OrderApplicationsIndex',
            KeyConditionExpression=Key('order_id').eq(order_id),
            FilterExpression=Attr('status').ne('withdrawn')  # Exclude withdrawn applications
        )
        logger.info(f"Applications query response: {json.dumps(response, cls=DecimalEncoder)}")
        return response.get('Items', [])
    except ClientError as e:
        logger.error(f"Error querying applications: {e}")
        raise

def add_applicant_details(applications):
    logger.info("Adding applicant details to applications")
    for app in applications:
        try:
            user = get_user(app['applicant_id'])
            if user:
                app['applicant_name'] = user.get('nickname', 'Unknown')
                app['applicant_image'] = user.get('profile_image_url', '')
            else:
                app['applicant_name'] = 'Unknown'
                app['applicant_image'] = ''
            
            # Remove sensitive information
            app.pop('applicant_id', None)
        except Exception as e:
            logger.error(f"Error fetching user details: {str(e)}")
            app['applicant_name'] = 'Unknown'
            app['applicant_image'] = ''

    return applications

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

def create_response(status_code, body):
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://allsuri-test.netlify.app',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }
    logger.info(f"Creating response: {json.dumps(response, cls=DecimalEncoder)}")
    return response