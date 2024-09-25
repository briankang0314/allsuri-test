import boto3
import json

def lambda_handler(event, context):
    
    print(event)
     
    if 'queryStringParameters' in event:
        print(event['queryStringParameters'])
        
    return {'statusCode':200}