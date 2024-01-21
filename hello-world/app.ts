import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import dynamodb from 'aws-sdk/clients/dynamodb';
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName: string = process.env.CARDS_TABLE;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        try {
            const params = {
                TableName: tableName,
                IndexName: 'type-index',
                KeyConditionExpression: `#pk = :pk`,
                ExpressionAttributeNames: {
                    '#pk': 'type',
                },
                ExpressionAttributeValues: {
                    ':pk': 'Credit',
                    ':deleted': 0,
                },
            };

            const result = await docClient.query(params).promise();

            response = {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (ResourceNotFoundException) {
            response = {
                statusCode: 404,
                body: 'Unable to call DynamoDB. Table resource not found.',
            };
        }

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err: unknown) {
        console.error(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'some error happened',
            }),
        };
    }

    return response;
};
