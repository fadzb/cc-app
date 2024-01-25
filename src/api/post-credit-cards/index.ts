import { CreditCardInput } from './../../types.d';
import { getDbClient, putItem } from './../../utils/dbUtils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import * as yup from 'yup';
import { validateEvent } from '../../utils/authUtils';
import { buildResponse, handleErrors } from '../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';

const cardsTableName = process.env.CARDS_TABLE as string;

const dbClient = getDbClient();
const schema = yup.object({
    name: yup.string().required(),
    cardLimit: yup.number().positive(),
    cardType: yup.string(),
});

/**
 * Creates new credit card account
 * Usage: curl -d '{"name":"Paddy", "cardType":"Visa", "cardLimit":"1000"}' -H "Content-Type: application/json" -X POST http://localhost:3000/credit-cards
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        if (!event.body) {
            throw Error('No event body');
        }

        const parsedData = JSON.parse(event.body);
        validateEvent({ schema, event: parsedData });

        const { name, cardLimit, cardType }: CreditCardInput = parsedData;

        const cardId = uuid();
        const Item = {
            cardId: { S: cardId },
            cardType: { S: cardType },
            name: { S: name },
            cardLimit: { S: `${cardLimit}` },
        };

        const params = {
            TableName: cardsTableName,
            Item,
        };

        await putItem({ dbClient, params });

        response = buildResponse({ statusCode: 200, body: { cardId, name, cardLimit } });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
