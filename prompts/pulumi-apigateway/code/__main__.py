import pulumi
import pulumi_aws as aws

# Create the API Gateway REST API
rest_api = aws.apigateway.RestApi(
    'pingpong-api',
    description='API Gateway with a ping-pong endpoint',
)

# Create the /ping resource
ping_resource = aws.apigateway.Resource(
    'ping-resource',
    rest_api=rest_api.id,
    parent_id=rest_api.root_resource_id,
    path_part='ping',
)

# Create the GET method for /ping
ping_method = aws.apigateway.Method(
    'ping-method',
    rest_api=rest_api.id,
    resource_id=ping_resource.id,
    http_method='GET',
    authorization='NONE',
)

# Create the mock integration for /ping
ping_integration = aws.apigateway.Integration(
    'ping-integration',
    rest_api=rest_api.id,
    resource_id=ping_resource.id,
    http_method=ping_method.http_method,
    type='MOCK',
    request_templates={
        'application/json': '{"statusCode": 200}'
    },
)

# Create the 200 response for the GET method
ping_response = aws.apigateway.MethodResponse(
    'ping-response',
    rest_api=rest_api.id,
    resource_id=ping_resource.id,
    http_method=ping_method.http_method,
    status_code='200',
    response_models={
        'application/json': 'Empty',
    },
)

# Integration response to return 'pong'
ping_integration_response = aws.apigateway.IntegrationResponse(
    'ping-integration-response',
    rest_api=rest_api.id,
    resource_id=ping_resource.id,
    http_method=ping_method.http_method,
    status_code='200',
    response_templates={
        'application/json': '"pong"',
    },
)

# Deploy the API
deployment = aws.apigateway.Deployment(
    'pingpong-deployment',
    rest_api=rest_api.id,
    triggers={
        'redeployment': pulumi.Output.concat(ping_method.id, ping_integration.id, ping_response.id, ping_integration_response.id),
    },
)

# Create a stage
stage = aws.apigateway.Stage(
    'pingpong-stage',
    rest_api=rest_api.id,
    deployment=deployment.id,
    stage_name='dev',
)

# Export the invoke URL
pulumi.export('invoke_url', pulumi.Output.concat('https://', rest_api.id, '.execute-api.', aws.config.region, '.amazonaws.com/', stage.stage_name, '/ping')) 