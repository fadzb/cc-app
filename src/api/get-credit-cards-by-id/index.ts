import { validateParams } from '../../utils/authUtils';
import { buildResponse, handleErrors } from '../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';
import { getDbClient, query } from '../../utils/dbUtils';
import { APIGatewayProxyResult } from 'aws-lambda';
import * as yup from 'yup';
import { GetCreditCardByIdEvent } from '../../types';

const cardsTableName = process.env.CARDS_TABLE as string;

const dbClient = getDbClient();
const schema = yup.object({
    pathParameters: yup.object({
        id: yup.string().required().uuid(),
    }),
});

/**
 * Fetches credit card accounts by id
 * Usage: curl http://localhost:3000/credit-cards/{id}
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: GetCreditCardByIdEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        validateParams({ schema, params: event });

        const {
            pathParameters: { id },
        } = event;

        const params = {
            TableName: cardsTableName,
            KeyConditionExpression: '#cardId = :cardId',
            ExpressionAttributeValues: { ':cardId': { S: id } },
            ExpressionAttributeNames: { '#cardId': 'cardId' },
        };

        const { Items = [] } = await query({ dbClient, params });
        const [result] = Items;

        response = buildResponse({ statusCode: 200, body: result });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
