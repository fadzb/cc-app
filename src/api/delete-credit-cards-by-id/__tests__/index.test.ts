import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/DELETE-credit-cards-by-id/event.json';

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

describe('DELETE /credit-cards/${id}', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toBeUndefined();
    });

    it('verifies successful response with deleted item when found', async () => {
        const item = {
            cardId: { S: 'cardId' },
            name: { S: 'Paddy' },
            cardLimit: { N: 100 },
            cardType: { s: 'Visa' },
            deleted: { N: 1 },
        };
        mockUpdateItemPromise.mockReturnValueOnce({ Attributes: item });

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(item));
    });

    it('verifies validation error if id in URL path is invalid', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            pathParameters: { id: 'INVALID' },
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'pathParameters.id must be a valid UUID' }));
    });
});
