import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/put-credit-cards-by-id/event.json';

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

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('PUT /credit-cards/${id}', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toBeUndefined();
    });

    it('verifies successful response with updated item when found', async () => {
        const item = { cardId: 'cardId', name: 'Paddy', cardLimit: 100, cardType: 'Visa' };
        mockUpdateItemPromise.mockReturnValueOnce({ Attributes: item });

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(item));
    });

    it('verifies validation error if cardholder updated credit limit is negative', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), cardLimit: -1000 }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'cardLimit must be a positive number' }));
    });
});
