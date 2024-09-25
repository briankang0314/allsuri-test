import boto3
import json

def lambda_handler(event, context):
    print(event['requestContext']['connectionId'])
    
    TheClient = boto3.client('apigatewaymanagementapi', endpoint_url = 'https://5wwtnwo70e.execute-api.ap-southeast-2.amazonaws.com/production/')
    TheClient.post_to_connection(ConnectionId = event['requestContext']['connectionId'], Data = '1111111111111')
    
    return {'statusCode':200}