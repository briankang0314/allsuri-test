import json
import logging
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
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
        application_id = body.get('application_id')

        if not application_id:
            return create_response(400, {'success': False, 'error': 'Missing application_id in request body'})

        # Fetch the application
        application = get_application(application_id)
        if not application:
            return create_response(404, {'success': False, 'error': 'Application not found'})

        # Verify that the application belongs to the authenticated user
        if application['applicant_id'] != user_id:
            return create_response(403, {'success': False, 'error': 'You are not authorized to withdraw this application'})

        # Check if the application is still pending
        if application['status'] != 'pending':
            return create_response(400, {'success': False, 'error': 'Only pending applications can be withdrawn'})

        # Update the application status
        update_application_status(application_id, 'withdrawn')

        # Decrease the applicants_count for the associated order
        decrease_order_applicant_count(application['order_id'])

        return create_response(200, {
            'success': True,
            'message': 'Application withdrawn successfully'
        })

    except Exception as e:
        logger.error(f"Error processing application withdrawal: {str(e)}")
        return create_response(500, {'success': False, 'error': 'Internal server error'})

def get_application(application_id):
    try:
        response = applications_table.query(
            KeyConditionExpression=Key('application_id').eq(application_id),
            Limit=1
        )
        return response['Items'][0] if response['Items'] else None
    except ClientError as e:
        logger.error(f"Error fetching application: {e}")
        raise

def update_application_status(application_id, new_status):
    try:
        # First, fetch the full key for the application
        application = get_application(application_id)
        if not application:
            raise Exception(f"Application with id {application_id} not found")

        # Now update the application using the full key
        applications_table.update_item(
            Key={
                'application_id': application_id,
                'created_at': application['created_at']
            },
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': new_status, ':updated_at': datetime.now().isoformat()}
        )
    except ClientError as e:
        logger.error(f"Error updating application status: {e}")
        raise

def decrease_order_applicant_count(order_id):
    try:
        # Query the order to get its created_at value
        order_response = orders_table.query(
            KeyConditionExpression=Key('order_id').eq(order_id),
            Limit=1
        )
        
        if not order_response['Items']:
            logger.error(f"Order with id {order_id} not found")
            raise Exception(f"Order with id {order_id} not found")

        order_item = order_response['Items'][0]
        created_at = order_item['created_at']

        # Update the order's applicants_count
        orders_table.update_item(
            Key={'order_id': order_id, 'created_at': created_at},
            UpdateExpression='SET applicants_count = if_not_exists(applicants_count, :zero) - :dec',
            ExpressionAttributeValues={':dec': 1, ':zero': 0},
            ConditionExpression='applicants_count > :zero'
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            logger.warning(f"Applicants count for order {order_id} is already 0 or doesn't exist")
        else:
            logger.error(f"Error decreasing order applicant count: {e}")
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
        'body': json.dumps(body, cls=DecimalEncoder)
    }