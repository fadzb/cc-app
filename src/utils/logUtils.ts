import { APIGatewayProxyResult } from 'aws-lambda';
import { APIEvent } from '../types';

// Wrapper around logging functions to easily implement better observability in future
export const logger = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

// All log statements are written to CloudWatch
export const logResponse = ({ event, response }: { event: APIEvent; response: APIGatewayProxyResult }) =>
    logger.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
