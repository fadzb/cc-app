import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const dyn = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://docker.for.mac.localhost:8000') });
const tableName: string = process.env.CARDS_TABLE;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        try {
            const tablesList = await dyn.listTables({ Limit: 10 }).promise();
            if (!tablesList.TableNames?.length) {
                return {
                    statusCode: 404,
                    body: 'No local DynamoDB tables found. Please create with cmd provided.',
                };
            }

            // lambda start
            const params = {
                TableName: 'CardsTable',
                // KeyConditionExpression: `#pk = :pk`,
                // ExpressionAttributeNames: {
                //     '#pk': '__typename',
                // },
                // ExpressionAttributeValues: {
                //     ':pk': 'Credit',
                //     ':deleted': 0,
                // },
            };
            const { Items = [] } = await dyn.scan(params).promise();
            console.log(Items);
            // lambda end

            response = {
                statusCode: 200,
                body: JSON.stringify(Items),
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
