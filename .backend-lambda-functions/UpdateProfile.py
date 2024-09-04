import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user information from the authorizer context
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
        logger.info(f"Authenticated user: {user_id}")

        # Parse the request body
        body = json.loads(event['body'])
        profile_data = body.get('profile_data', {})

        # Update the user profile
        updated_profile = update_user_profile(user_id, profile_data)
        
        return create_response(200, {'success': True, 'profile': updated_profile})

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def update_user_profile(user_id, profile_data):
    try:
        update_expression = "set "
        expression_attribute_values = {':updated_at': datetime.now().isoformat()}
        expression_attribute_names = {'#updated_at': 'updated_at'}

        for key, value in profile_data.items():
            if key not in ['user_id', 'email', 'created_at']:  # Protect certain fields from updates
                update_expression += f"#{key} = :{key}, "
                expression_attribute_values[f":{key}"] = value
                expression_attribute_names[f"#{key}"] = key

        update_expression += "#updated_at = :updated_at"

        response = users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="ALL_NEW"
        )
        
        updated_profile = response['Attributes']
        
        # Remove sensitive information before returning
        updated_profile.pop('access_token', None)
        updated_profile.pop('refresh_token', None)
        
        return updated_profile
    except ClientError as e:
        logger.error(f"Error updating user profile: {e}")
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