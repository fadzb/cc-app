import { APIGatewayProxyResult } from 'aws-lambda';
import { logger } from './logUtils';

/**
 * @param {number} statusCode standardized HTTP status code to respond with
 * @param {any} body the content of the response that will be stringified
 * @returns the response to return to the client
 */
export const buildResponse = ({ statusCode, body }: { statusCode: number; body: unknown }) =>
    ({
        statusCode,
        body: JSON.stringify(body),
    } as APIGatewayProxyResult);

export const handleErrors = (err: unknown) => {
    logger.error(err);

    if (!(err instanceof Error)) {
        return buildResponse({ statusCode: 500, body: { message: 'Unknown error' } });
    }

    if (err.name === 'ResourceNotFoundException') {
        return buildResponse({
            statusCode: 404,
            body: { message: 'Unable to call DynamoDB. Table resource not found.' },
        });
    }

    return buildResponse({
        statusCode: 500,
        body: { message: err.message },
    });
};
