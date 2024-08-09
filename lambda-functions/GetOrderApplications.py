import json
import logging
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
applications_table = dynamodb.Table('Applications')
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
        order_id = body.get('order_id')

        if not order_id:
            return create_response(400, {'error': 'Missing order_id in request body'})

        # Fetch applications for the given order
        applications = get_order_applications(order_id)
        
        # Fetch and add applicant details to each application
        applications_with_details = add_applicant_details(applications)

        return create_response(200, {
            'success': True,
            'applications': applications_with_details
        })
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def get_order_applications(order_id):
    try:
        response = applications_table.query(
            IndexName='OrderApplicationsIndex',
            KeyConditionExpression=Key('order_id').eq(order_id)
        )
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error querying applications: {str(e)}")
        raise

def add_applicant_details(applications):
    for app in applications:
        try:
            user_response = users_table.get_item(
                Key={'user_id': app['applicant_id']}
            )
            user = user_response.get('Item', {})
            
            # Add relevant user information to the application
            app['applicant_name'] = user.get('nickname', 'Unknown')
            app['applicant_image'] = user.get('profile_image_url', '')
            
            # Remove sensitive information
            app.pop('applicant_id', None)
        except Exception as e:
            logger.error(f"Error fetching user details: {str(e)}")
            app['applicant_name'] = 'Unknown'
            app['applicant_image'] = ''

    return applications

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