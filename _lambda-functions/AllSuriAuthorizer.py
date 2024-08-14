import json
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    print(f"Event: {json.dumps(event)}")
    
    # Extract the Authorization header from the identitySource
    if not event.get('identitySource') or len(event['identitySource']) == 0:
        raise Exception('Unauthorized: Missing identity source')
    
    auth_header = event['identitySource'][0]
    
    if not auth_header.lower().startswith('bearer '):
        raise Exception('Unauthorized: Invalid token format')
    
    # Extract the token
    token = auth_header.split(' ')[1]
    
    try:
        # Query the Users table to find a user with this access token
        response = users_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('access_token').eq(token)
        )
        users = response.get('Items', [])
        
        if not users:
            raise Exception('Unauthorized: Invalid token')
        
        user = users[0]
        
        # Generate the IAM policy
        policy = generate_policy(user['user_id'], 'Allow', event['routeArn'])
        
        # Add user information to the context
        context = {
            'user_id': user['user_id'],
            'email': user.get('email', ''),
            'nickname': user.get('nickname', '')
        }
        
        policy['context'] = context
        
        return policy
    except Exception as e:
        print(f"Error: {str(e)}")
        raise Exception('Unauthorized')

def generate_policy(principal_id, effect, resource):
    return {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
    }