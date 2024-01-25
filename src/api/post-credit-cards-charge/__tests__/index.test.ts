import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/post-credit-cards-charge/event.json';

import { expect, describe, it } from '@jest/globals';

const mockUpdateItemPromise = jest.fn(() => ({}));
const mockUpdateItem = jest.fn(() => ({
    promise: mockUpdateItemPromise,
}));

jest.mock('aws-sdk', () => ({
    DynamoDB: jest.fn(() => ({
        updateItem: mockUpdateItem,
    })),
    Endpoint: jest.fn(() => ''),
}));

jest.mock('../../../utils/logUtils', () => ({
    ...jest.requireActual('../../../utils/logUtils'),
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

const mockTransaction = { id: 'transactionId' };
const mockPaymentClient = {};
const mockGetPaymentClient = jest.fn(() => mockPaymentClient);
const mockissueCharge = jest.fn(() => mockTransaction);
jest.mock('../../../utils/paymentUtils', () => ({
    getPaymentClient: mockGetPaymentClient,
    issueCharge: mockissueCharge,
}));

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('POST /credit-cards/{originalCardNumber}/charge', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(mockTransaction));
    });

    it('verifies validation error if cardholder updated credit limit is negative', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), amount: -10 }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'amount must be a positive number' }));
    });

    it('verifies validation error if originalCardNumber in URL path is invalid', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            pathParameters: { originalCardNumber: null },
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(
            JSON.stringify({ message: 'pathParameters.originalCardNumber is a required field' }),
        );
    });
});
