import { PutCreditCardByIdEvent } from '../../types';
import { getDbClient, updateItem } from '../../utils/dbUtils';
import { APIGatewayProxyResult } from 'aws-lambda';
import * as yup from 'yup';
import { validateParams } from '../../utils/authUtils';
import { buildResponse, handleErrors } from '../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';

const cardsTableName = process.env.CARDS_TABLE as string;

const dbClient = getDbClient();

const eventSchema = yup.object({
    pathParameters: yup.object({
        id: yup.string().required().uuid(),
    }),
});

/**
 * Soft deletes an existing Credit Card account by id
 * Usage: curl -X DELETE http://localhost:3000/credit-cards/${id}
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: PutCreditCardByIdEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        validateParams({ schema: eventSchema, params: event });

        const {
            pathParameters: { id },
        } = event;

        const params = {
            TableName: cardsTableName,
            Key: { cardId: { S: id } },
            ConditionExpression: 'attribute_exists(cardId) and attribute_not_exists(deleted)',
            UpdateExpression: 'set deleted = :deleted',
            ExpressionAttributeValues: { ':deleted': { N: '1' } },
            ReturnValues: 'ALL_NEW',
        };

        const { Attributes } = await updateItem({ dbClient, params });

        response = buildResponse({ statusCode: 200, body: Attributes });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
