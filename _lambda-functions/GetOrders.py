import json
import logging
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
        sort = body.get('sort', 'created_at')

        if action not in ['get_orders', 'get_my_orders']:
            return create_response(400, {'success': False, 'error': 'Invalid action parameter'})

        # Fetch order posts with pagination, filtering, and sorting
        if action == 'get_my_orders':
            order_posts, total_count = get_my_order_posts(user_id, page, limit, filters, sort)
        else:
            order_posts, total_count = get_order_posts(page, limit, filters, sort)
        
        logger.info(f"Fetched {len(order_posts)} order posts")
        
        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        return create_response(200, {
            'success': True,
            'message': 'Order posts fetched successfully',
            'orders': order_posts,
            'currentPage': page,
            'totalPages': total_pages,
            'totalCount': total_count
        })
    except Exception as e:
        logger.error(f"Error processing order posts fetch: {str(e)}", exc_info=True)
        return create_response(500, {'success': False, 'error': 'Internal server error'})

from boto3.dynamodb.conditions import Key, Attr

from boto3.dynamodb.conditions import Attr

def get_order_posts(page, limit, filters, sort):
    try:
        logger.info(f"Fetching order posts for page {page} with limit {limit}, filters {filters}, and sort {sort}")

        index_name = 'OrderCreatedIndex'
        scan_params = {
            'IndexName': index_name,
            'Limit': 1000  # Adjust based on your needs and DynamoDB limits
        }

        order_posts = []
        while True:
            response = orders_table.scan(**scan_params)
            order_posts.extend(response.get('Items', []))
            
            if 'LastEvaluatedKey' not in response:
                break
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']

        # Sort, filter, and paginate as before
        order_posts.sort(key=lambda x: x['created_at'], reverse=True)
        filtered_posts = [
            order for order in order_posts
            if all(order.get(key) == value for key, value in filters.items() if value)
        ]
        if sort == 'fee':
            filtered_posts.sort(key=lambda x: float(x['fee']), reverse=True)

        start = (page - 1) * limit
        end = start + limit
        paginated_posts = filtered_posts[start:end]

        formatted_posts = format_order_posts(paginated_posts, sort)
        total_count = len(filtered_posts)
        
        return formatted_posts, total_count
    except ClientError as e:
        logger.error(f"Error fetching order posts: {e}", exc_info=True)
        raise


def get_my_order_posts(user_id, page, limit, filters, sort):
    try:
        logger.info(f"Fetching order posts for user {user_id}, page {page} with limit {limit}, filters {filters}, and sort {sort}")
        
        # Calculate the start index for pagination
        start_index = (page - 1) * limit

        # Prepare key condition expression
        key_condition_expression = Key('user_id').eq(user_id)

        # Prepare filter expression
        filter_expression = None
        for key, value in filters.items():
            if value:
                if filter_expression is None:
                    filter_expression = Attr(key).eq(value)
                else:
                    filter_expression &= Attr(key).eq(value)

        # Query parameters
        query_params = {
            'IndexName': 'UserOrdersIndex',
            'KeyConditionExpression': key_condition_expression,
            'ScanIndexForward': False,  # This will sort in descending order (newest first)
            'Limit': limit
        }

        if filter_expression:
            query_params['FilterExpression'] = filter_expression

        # Implement pagination logic
        if start_index > 0:
            # We need to get the last evaluated key from the previous query
            for _ in range(start_index // limit):
                response = orders_table.query(**query_params)
                last_evaluated_key = response.get('LastEvaluatedKey')
                if not last_evaluated_key:
                    break
            
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

        # Perform the query
        response = orders_table.query(**query_params)
        
        order_posts = response.get('Items', [])
        
        # Process and format the order posts
        formatted_posts = format_order_posts(order_posts, sort)
        
        # Get total count of user's filtered orders
        count_params = {
            'IndexName': 'UserOrdersIndex',
            'KeyConditionExpression': key_condition_expression,
            'Select': 'COUNT'
        }
        if filter_expression:
            count_params['FilterExpression'] = filter_expression
        total_count = orders_table.query(**count_params)['Count']
        
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