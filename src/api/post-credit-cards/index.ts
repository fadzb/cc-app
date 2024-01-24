import { getDbClient } from './../../utils/dbUtils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

const dynamoClient = getDbClient();
const tableName = process.env.CARDS_TABLE as string;
const __TYPENAME = 'Credit';

/**
 * Usage: curl curl -d '{"name":"Paddy", "limit":"1000"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:3000/credit-cards
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        try {
            // const tablesList = await documentClient.listTables({ Limit: 10 }).promise();
            // if (!tablesList.TableNames?.length) {
            //     return {
            //         statusCode: 404,
            //         body: 'No local DynamoDB tables found. Execute "docker run -p 8000:8000 amazon/dynamodb-local".',
            //     };
            // }
            if (!tableName) {
                return {
                    statusCode: 404,
                    body: 'Missing env variables.',
                };
            }

            if (!event.body) {
                throw Error('No params provided.'); // TODO: handle better
            }

            const { name, limit } = JSON.parse(event.body);
            const cardId = uuid();
            const Item = {
                cardId: { S: cardId },
                __typename: { S: __TYPENAME },
                name: { S: name },
                limit: { N: limit },
            };

            const params = {
                TableName: tableName,
                Item: Item,
            };

            await dynamoClient.putItem(params).promise();

            response = {
                statusCode: 200,
                body: JSON.stringify({ cardId, name, limit }),
            };
        } catch (ResourceNotFoundException) {
            response = {
                statusCode: 404,
                body: 'Unable to call DynamoDB. Table resource not found.',
            };
        }

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
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
