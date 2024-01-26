import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/post-credit-cards-credit/event.json';

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

const mockDecipherText = jest.fn();
jest.mock('../../../utils/cryptoUtils', () => ({
    ...jest.requireActual('../../../utils/cryptoUtils'),
    decipherText: mockDecipherText,
}));

const mockTransaction = { amount: 10, currency: 'eur' };
const mockPaymentClient = {};
const mockGetPaymentClient = jest.fn(() => mockPaymentClient);
const mockIssueCredit = jest.fn(() => mockTransaction);
jest.mock('../../../utils/paymentUtils', () => ({
    ...jest.requireActual('../../../utils/paymentUtils'),
    getPaymentClient: mockGetPaymentClient,
    issueCredit: mockIssueCredit,
}));

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('POST /credit-cards/{originalCardNumber}/credit', function () {
    it('verifies successful response', async () => {
        const originalCardNumberPlaintext = 'plainText';
        mockDecipherText.mockReturnValueOnce(originalCardNumberPlaintext);

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(mockIssueCredit).toHaveBeenCalledWith({
            amount: JSON.parse(event.body).amount,
            originalCardNumber: originalCardNumberPlaintext,
            paymentClient: mockPaymentClient,
        });
        expect(mockDecipherText).toHaveBeenCalledWith({
            secretAlgorithm: 'secretAlgorithm',
            secretKey: 'secretKey',
            cipherText: event.pathParameters.originalCardNumber,
        });
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify({
                message: `Account successfully credited for ${mockTransaction.amount} ${mockTransaction.currency}`,
            }),
        );
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

    it('verifies payment error if issuing the charge fails', async () => {
        mockIssueCredit.mockReturnValueOnce(null as any);

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'Invalid card details' }));
    });
});
