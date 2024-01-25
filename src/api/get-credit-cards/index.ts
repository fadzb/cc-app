import { validateParams } from './../../utils/authUtils';
import { buildResponse, handleErrors } from './../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';
import { getDbClient, scan } from '../../utils/dbUtils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as yup from 'yup';

const cardsTableName = process.env.CARDS_TABLE as string;

const dbClient = getDbClient();
const schema = yup.object({});

/**
 * Fetches all registered credit card accounts.
 * Usage: curl http://localhost:3000/credit-cards
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        validateParams({ schema, params: event });

        const params = {
            TableName: cardsTableName,
            FilterExpression: 'attribute_not_exists(deleted)',
        };
        const { Items = [] } = await scan({ dbClient, params });

        response = buildResponse({ statusCode: 200, body: { items: Items } });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
