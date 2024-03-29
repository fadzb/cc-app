import { CreditCardInput, PostCreditCardEvent } from './../../types.d';
import { getDbClient, putItem } from './../../utils/dbUtils';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import * as yup from 'yup';
import { validateParams } from '../../utils/authUtils';
import { buildResponse, handleErrors } from '../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';
import { createCard, createCardHolder, getPaymentClient } from '../../utils/paymentUtils';
import { encipherText } from '../../utils/cryptoUtils';

const cardsTableName = process.env.CARDS_TABLE as string;
const secretAlgorithm = process.env.SECRET_ALGORITHM as string;
const secretKey = process.env.SECRET_KEY as string;
const paymentApiKey = process.env.PAYMENT_API_KEY as string;

const paymentClient = getPaymentClient({ apiKey: paymentApiKey });
const dbClient = getDbClient();

const eventSchema = yup.object({
    body: yup.string().required(),
});
const inputSchema = yup.object({
    name: yup.string().required(),
    cardLimit: yup.number().positive(),
    cardType: yup.string().oneOf(['Visa', 'Mastercard']),
});

/**
 * Creates new credit card account
 * Usage: curl -d '{"name":"Paddy", "cardType":"Visa", "cardLimit":"1000"}' -H "Content-Type: application/json" -X POST http://localhost:3000/credit-cards
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: PostCreditCardEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        validateParams({ schema: eventSchema, params: event });

        const parsedInput: CreditCardInput = JSON.parse(event.body);
        validateParams({ schema: inputSchema, params: parsedInput });

        const { name, cardLimit, cardType } = parsedInput;

        const { id: cardholderId } = await createCardHolder({ paymentClient, name });
        const { id: originalCardNumberPlaintext } = await createCard({ paymentClient, cardholderId });

        const originalCardNumberCiphertext = encipherText({
            secretAlgorithm,
            secretKey,
            plainText: originalCardNumberPlaintext,
        });

        const cardId = uuid();
        const Item = {
            cardId: { S: cardId },
            cardType: { S: cardType },
            name: { S: name },
            cardLimit: { N: `${cardLimit}` },
            originalCardNumber: { S: originalCardNumberCiphertext },
        };

        const params = {
            TableName: cardsTableName,
            Item,
            ConditionExpression: 'attribute_not_exists(cardId) and attribute_not_exists(deleted)',
        };

        await putItem({ dbClient, params });

        response = buildResponse({
            statusCode: 200,
            body: { cardId, cardType, name, cardLimit, originalCardNumber: originalCardNumberCiphertext },
        });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
