import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/post-credit-cards/event.json';

import { expect, describe, it } from '@jest/globals';

const mockPutItemPromise = jest.fn();
const mockPutItem = jest.fn(() => ({
    promise: mockPutItemPromise,
}));

jest.mock('aws-sdk', () => ({
    DynamoDB: jest.fn(() => ({
        putItem: mockPutItem,
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

const mockEncipherText = jest.fn();
jest.mock('../../../utils/cryptoUtils', () => ({
    encipherText: mockEncipherText,
}));

const mockPaymentClient = {};
const mockCardholderId = 'mockCardholderId';
const mockOriginalCardNumber = 'mockOriginalCardNumber';
const mockGetPaymentClient = jest.fn(() => mockPaymentClient);
const mockCreateCardHolder = jest.fn(() => ({ id: mockCardholderId }));
const mockCreateCard = jest.fn(() => ({ id: mockOriginalCardNumber }));
jest.mock('../../../utils/paymentUtils', () => ({
    getPaymentClient: mockGetPaymentClient,
    createCardHolder: mockCreateCardHolder,
    createCard: mockCreateCard,
}));

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('POST /credit-cards', function () {
    it('verifies successful response after creating card', async () => {
        const originalCardNumberCiphertext = 'cipherText';
        mockEncipherText.mockReturnValueOnce(originalCardNumberCiphertext);

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(mockCreateCardHolder).toHaveBeenCalledWith({ paymentClient: mockPaymentClient, name: 'Paddy' });
        expect(mockCreateCard).toHaveBeenCalledWith({
            paymentClient: mockPaymentClient,
            cardholderId: mockCardholderId,
        });
        expect(mockEncipherText).toHaveBeenCalledWith({
            secretAlgorithm: 'secretAlgorithm',
            secretKey: 'secretKey',
            plainText: mockOriginalCardNumber,
        });
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify({
                cardId: 'uuid',
                cardType: 'Visa',
                name: 'Paddy',
                cardLimit: '1000',
                originalCardNumber: originalCardNumberCiphertext,
            }),
        );
    });

    it('verifies validation error if cardholder name is empty', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), name: undefined }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'name is a required field' }));
    });

    it('verifies validation error if credit limit is negative', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), cardLimit: -1000 }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'cardLimit must be a positive number' }));
    });

    it('verifies validation error if card type is invalid', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), cardType: 'INVALID' }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(
            JSON.stringify({ message: 'cardType must be one of the following values: Visa, Mastercard' }),
        );
    });
});
