import json
import logging
import time
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table('Orders')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    start_time = time.time()
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user information from the authorizer context
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        # Extract parameters from the event body
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        page = int(body.get('page', 1))
        limit = int(body.get('limit', 10))
        filters = body.get('filters', {})
        logger.info(f"Applying filters: {filters}")
        sort = body.get('sort', 'created_at')

        if action not in ['get_orders', 'get_my_orders']:
            return create_response(400, {'success': False, 'error': 'Invalid action parameter'})

        # Fetch order posts with pagination, filtering, and sorting
        fetch_start_time = time.time()
        if action == 'get_my_orders':
            order_posts, total_count = get_my_order_posts(user_id, page, limit, filters, sort)
        else:
            order_posts, total_count = get_order_posts(page, limit, filters, sort)
        fetch_end_time = time.time()
        logger.info(f"Fetched {len(order_posts)} order posts in {fetch_end_time - fetch_start_time:.2f} seconds")
        
        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        end_time = time.time()
        logger.info(f"Total lambda execution time: {end_time - start_time:.2f} seconds")

        return create_response(200, {
            'success': True,
            'message': 'Order posts fetched successfully',
            'orders': order_posts,
            'currentPage': page,
            'totalPages': total_pages,
            'totalCount': total_count,
            'executionTime': end_time - start_time
        })
    except Exception as e:
        logger.error(f"Error processing order posts fetch: {str(e)}", exc_info=True)
        return create_response(500, {'success': False, 'error': 'Internal server error'})

def get_last_evaluated_key(page, limit, index_name, key_condition_expression):
    if page <= 1:
        return None
    
    last_page = page - 1
    start_key = None
    
    for _ in range(last_page):
        query_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'ScanIndexForward': False,
            'Limit': limit
        }
        
        if start_key:
            query_params['ExclusiveStartKey'] = start_key
        
        response = orders_table.query(**query_params)
        start_key = response.get('LastEvaluatedKey')
        
        if not start_key:
            break
    
    return start_key

def get_order_posts(page, limit, filters, sort):
    try:
        start_time = time.time()
        logger.info(f"Fetching order posts for page {page} with limit {limit}, filters {filters}, and sort {sort}")

        # Determine which index to use based on filters
        if filters.get('region'):
            index_name = 'RegionCreatedIndex'
            key_condition_expression = Key('region').eq(filters['region'])
        else:
            index_name = 'OrderCreatedIndex'
            # Default to 'open' unless 'closed' is explicitly requested
            status_to_query = 'closed' if filters.get('status') == 'closed' else 'open'
            key_condition_expression = Key('status').eq(status_to_query)

        query_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'ScanIndexForward': False,  # This will sort in descending order (newest first)
            'Limit': limit
        }

        # Apply additional filters
        filter_expression = None
        for key, value in filters.items():
            if value and key not in ['region', 'status']:
                if filter_expression is None:
                    filter_expression = Attr(key).eq(value)
                else:
                    filter_expression &= Attr(key).eq(value)

        # If we're using RegionCreatedIndex, we need to filter by status
        if index_name == 'RegionCreatedIndex':
            status_filter = 'closed' if filters.get('status') == 'closed' else 'open'
            if filter_expression is None:
                filter_expression = Attr('status').eq(status_filter)
            else:
                filter_expression &= Attr('status').eq(status_filter)

        if filter_expression:
            query_params['FilterExpression'] = filter_expression

        # Calculate ExclusiveStartKey for pagination
        if page > 1:
            last_evaluated_key = get_last_evaluated_key(page, limit, index_name, key_condition_expression)
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

        response = orders_table.query(**query_params)

        items = response['Items']

        # Process and format the order posts
        formatted_posts = format_order_posts(items, sort)

        # Get total count of filtered orders
        count_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'Select': 'COUNT'
        }
        if filter_expression:
            count_params['FilterExpression'] = filter_expression
        total_count = orders_table.query(**count_params)['Count']

        # Additional sorting if needed (e.g., by fee)
        if sort == 'fee':
            formatted_posts.sort(key=lambda x: float(x['fee']), reverse=True)

        end_time = time.time()
        logger.info(f"Fetched {len(items)} order posts in {end_time - start_time:.2f} seconds")

        return formatted_posts, total_count
    except ClientError as e:
        logger.error(f"Error fetching order posts: {e}")
        raise

def get_last_evaluated_key_for_user(user_id, page, limit, index_name, filters):
    if page <= 1:
        return None

    last_page = page - 1
    start_key = None

    key_condition_expression = Key('user_id').eq(user_id)

    filter_expression = None
    for key, value in filters.items():
        if value and key != 'status':  # We'll handle status separately
            if filter_expression is None:
                filter_expression = Attr(key).eq(value)
            else:
                filter_expression &= Attr(key).eq(value)

    # Handle status filter
    status_filter = 'closed' if filters.get('status') == 'closed' else 'open'
    if filter_expression is None:
        filter_expression = Attr('status').eq(status_filter)
    else:
        filter_expression &= Attr('status').eq(status_filter)

    for _ in range(last_page):
        query_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'FilterExpression': filter_expression,
            'ScanIndexForward': False,
            'Limit': limit
        }

        if start_key:
            query_params['ExclusiveStartKey'] = start_key

        response = orders_table.query(**query_params)
        start_key = response.get('LastEvaluatedKey')

        if not start_key:
            break

    return start_key

def get_my_order_posts(user_id, page, limit, filters, sort):
    try:
        start_time = time.time()
        logger.info(f"Fetching order posts for user {user_id}, page {page} with limit {limit}, filters {filters}, and sort {sort}")

        # Always use UserOrdersIndex as the base index
        index_name = 'UserOrdersIndex'

        # Prepare key condition expression
        key_condition_expression = Key('user_id').eq(user_id)

        # Prepare filter expression
        filter_expression = None
        for key, value in filters.items():
            if value and key != 'status':  # We'll handle status separately
                if filter_expression is None:
                    filter_expression = Attr(key).eq(value)
                else:
                    filter_expression &= Attr(key).eq(value)

        # Handle status filter
        status_filter = 'closed' if filters.get('status') == 'closed' else 'open'
        if filter_expression is None:
            filter_expression = Attr('status').eq(status_filter)
        else:
            filter_expression &= Attr('status').eq(status_filter)

        # Query parameters
        query_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'FilterExpression': filter_expression,
            'ScanIndexForward': False,  # This will sort in descending order (newest first)
            'Limit': limit
        }

        # Calculate ExclusiveStartKey for pagination
        if page > 1:
            last_evaluated_key = get_last_evaluated_key_for_user(user_id, page, limit, index_name, filters)
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

        # Perform the query
        response = orders_table.query(**query_params)

        items = response['Items']

        # Process and format the order posts
        formatted_posts = format_order_posts(items, sort)

        # Get total count of user's filtered orders
        count_params = {
            'IndexName': index_name,
            'KeyConditionExpression': key_condition_expression,
            'FilterExpression': filter_expression,
            'Select': 'COUNT'
        }
        total_count = orders_table.query(**count_params)['Count']

        # Additional sorting if needed (e.g., by fee)
        if sort == 'fee':
            formatted_posts.sort(key=lambda x: float(x['fee']), reverse=True)

        end_time = time.time()
        logger.info(f"get_my_order_posts completed in {end_time - start_time:.2f} seconds")

        return formatted_posts, total_count
    except ClientError as e:
        logger.error(f"Error fetching user's order posts: {e}", exc_info=True)
        raise

def format_order_posts(order_posts, sort='created_at'):
    formatted_posts = []
    for order in order_posts:
        formatted_post = {
            'order_id': order['order_id'],
            'user_id': order['user_id'],
            'title': order['title'],
            'category': order['category'],
            'location': f"{order['city']}, {order['region']}",
            'fee': float(order['fee']) if isinstance(order['fee'], Decimal) else order['fee'],
            'description': order['description'],
            'status': order['status'],
            'created_at': order['created_at'],
            'updated_at': order['updated_at'],
            'applicants_count': order.get('applicants_count', 0)
        }
        formatted_posts.append(formatted_post)
    
    # Only sort if it's not the default 'created_at' sort
    if sort == 'fee':
        formatted_posts.sort(key=lambda x: x['fee'], reverse=True)
    
    return formatted_posts

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
    logger.info(f"Response created: {json.dumps(response, cls=DecimalEncoder)}")
    return response