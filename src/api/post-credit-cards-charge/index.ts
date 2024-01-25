import { getPaymentClient, issueTransaction } from './../../utils/paymentUtils';
import { PutCreditCardByIdEvent } from '../../types';
import { getDbClient, updateItem } from '../../utils/dbUtils';
import { APIGatewayProxyResult } from 'aws-lambda';
import * as yup from 'yup';
import { validateParams } from '../../utils/authUtils';
import { buildResponse, handleErrors } from '../../utils/lambdaUtils';
import { logResponse } from '../../utils/logUtils';
import Stripe from 'stripe';

const cardsTableName = process.env.CARDS_TABLE as string;
const paymentApiKey = process.env.PAYMENT_API_KEY as string;

const paymentClient = getPaymentClient({ apiKey: paymentApiKey });
const dbClient = getDbClient();

const eventSchema = yup.object({
    pathParameters: yup.object({
        originalCardNumber: yup.string().required().uuid(),
    }),
    body: yup.string().required(),
});
const inputSchema = yup.object({
    amount: yup.number().required().positive(),
});

/**
 * Charge the credit card account by the amount provided
 * Usage: curl -d '{"amount":"10"}' -H "Content-Type: application/json" -X POST http://localhost:3000/credit-cards/{originalCardNumber}/charge
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: PutCreditCardByIdEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        validateParams({ schema: eventSchema, params: event });

        const {
            pathParameters: { originalCardNumber },
        } = event;

        const parsedInput = JSON.parse(event.body);
        validateParams({ schema: inputSchema, params: parsedInput });

        const { amount } = parsedInput;

        // const transaction = await issueTransaction({ paymentClient, amount, originalCardNumber });

        // Stripe API
        // curl https://api.stripe.com/v1/test_helpers/issuing/transactions/create_force_capture \
        //   -u "sk_test_51OcUVmGvZEhgb569B2TZnzYL4sCVMENfCi5VHRlJyVj1ZdBOmE36X89WeMz6C5R4NirUUiNMM3rckct5B3UWqHOX009ncctnnE:" \
        //   -d amount=1000 \
        //   -d card=ic_1OcUfzGvZEhgb569EVyWWSUS

        // const params = {
        //     TableName: cardsTableName,
        //     Key: { cardId: { S: originalCardNumber } },
        //     ConditionExpression: 'attribute_exists(cardId) and attribute_not_exists(deleted)',
        //     UpdateExpression: 'set cardLimit = :cardLimit',
        //     ExpressionAttributeValues: { ':cardLimit': { N: `${cardLimit}` } },
        //     ReturnValues: 'ALL_NEW',
        // };

        // const { Attributes } = await updateItem({ dbClient, params });

        response = buildResponse({ statusCode: 200, body: {} });
    } catch (err: unknown) {
        return handleErrors(err);
    }

    logResponse({ event, response });
    return response;
};
