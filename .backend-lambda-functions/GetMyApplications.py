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
        page = int(body.get('page', 1))
        limit = int(body.get('limit', 10))
        filters = body.get('filters', {})
        sort = body.get('sort', 'created_at')
        logger.info(f"Request parameters: page={page}, limit={limit}, filters={filters}, sort={sort}")

        # Fetch applications for the given user
        applications, total_count = get_user_applications(user_id, page, limit, filters, sort)
        logger.info(f"Retrieved {len(applications)} applications")

        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        response = create_response(200, {
            'success': True,
            'applications': applications,
            'currentPage': page,
            'totalPages': total_pages,
            'totalCount': total_count
        })
        logger.info(f"Returning successful response: {json.dumps(response, cls=DecimalEncoder)}")
        return response

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        error_response = create_response(500, {'success': False, 'error': 'Internal server error'})
        logger.info(f"Returning error response: {json.dumps(error_response, cls=DecimalEncoder)}")
        return error_response

def get_user_applications(user_id, page, limit, filters, sort):
    logger.info(f"Fetching applications for user_id: {user_id}")
    try:
        key_condition_expression = Key('applicant_id').eq(user_id)

        query_params = {
            'IndexName': 'UserOrderIndex',
            'KeyConditionExpression': key_condition_expression,
            'ScanIndexForward': False,  # Sort in descending order
            'Limit': limit,
            'FilterExpression': Attr('status').ne('withdrawn')  # Exclude withdrawn applications
        }

        # Apply additional filters
        filter_expression = Attr('status').ne('withdrawn')
        for key, value in filters.items():
            if value:
                filter_expression &= Attr(key).eq(value)

        query_params['FilterExpression'] = filter_expression

        # Apply pagination
        if page > 1:
            last_evaluated_key = get_last_evaluated_key(user_id, page, limit, filters)
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

        response = applications_table.query(**query_params)

        applications = response.get('Items', [])
        logger.info(f"Retrieved {len(applications)} applications")

        # Fetch order details for each application
        applications_with_order_details = add_order_details(applications)

        # Sort applications based on the requested sort parameter
        if sort == 'status':
            # Define a custom sorting order for status
            status_order = {'accepted': 0, 'pending': 1, 'rejected': 2}
            applications_with_order_details.sort(key=lambda x: status_order.get(x['status'], 3))
        elif sort == 'created_at':
            applications_with_order_details.sort(key=lambda x: x['created_at'], reverse=True)

        # Get total count
        total_count = get_total_count(user_id, filters)

        return applications_with_order_details, total_count
    except ClientError as e:
        logger.error(f"Error querying applications: {e}")
        raise

def get_last_evaluated_key(user_id, page, limit, filters):
    if page <= 1:
        return None
    
    last_page = page - 1
    start_key = None
    
    key_condition_expression = Key('applicant_id').eq(user_id)
    
    for _ in range(last_page):
        query_params = {
            'IndexName': 'UserOrderIndex',
            'KeyConditionExpression': key_condition_expression,
            'ScanIndexForward': False,
            'Limit': limit
        }
        
        if filters:
            filter_expression = None
            for key, value in filters.items():
                if value:
                    if filter_expression is None:
                        filter_expression = Key(key).eq(value)
                    else:
                        filter_expression &= Key(key).eq(value)
            if filter_expression:
                query_params['FilterExpression'] = filter_expression
        
        if start_key:
            query_params['ExclusiveStartKey'] = start_key
        
        response = applications_table.query(**query_params)
        start_key = response.get('LastEvaluatedKey')
        
        if not start_key:
            break
    
    return start_key

def add_order_details(applications):
    for app in applications:
        order = get_order(app['order_id'])
        if order:
            app['order_title'] = order.get('title', 'Unknown')
            app['order_status'] = order.get('status', 'Unknown')
        else:
            app['order_title'] = 'Unknown'
            app['order_status'] = 'Unknown'
    return applications

def get_order(order_id):
    logger.info(f"Fetching order with order_id: {order_id}")
    try:
        response = orders_table.query(
            KeyConditionExpression=Key('order_id').eq(order_id),
            Limit=1
        )
        return response['Items'][0] if response['Items'] else None
    except ClientError as e:
        logger.error(f"Error fetching order: {e}")
        return None

def get_total_count(user_id, filters):
    try:
        key_condition_expression = Key('applicant_id').eq(user_id)
        
        query_params = {
            'IndexName': 'UserOrderIndex',
            'KeyConditionExpression': key_condition_expression,
            'Select': 'COUNT'
        }

        if filters:
            filter_expression = None
            for key, value in filters.items():
                if value:
                    if filter_expression is None:
                        filter_expression = Key(key).eq(value)
                    else:
                        filter_expression &= Key(key).eq(value)
            if filter_expression:
                query_params['FilterExpression'] = filter_expression

        response = applications_table.query(**query_params)
        return response['Count']
    except ClientError as e:
        logger.error(f"Error getting total count: {e}")
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
        'body': json.dumps(body, cls=DecimalEncoder)
    }
    logger.info(f"Creating response: {json.dumps(response, cls=DecimalEncoder)}")
    return response