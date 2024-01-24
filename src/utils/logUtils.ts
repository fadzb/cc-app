import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// All log statements are written to CloudWatch
export const logResponse = ({ event, response }: { event: APIGatewayProxyEvent; response: APIGatewayProxyResult }) =>
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
