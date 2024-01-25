import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/get-credit-cards-by-id/event.json';

import { expect, describe, it } from '@jest/globals';

const mockQueryPromise: any = jest.fn(() => ({ Items: [] }));
const mockQuery = jest.fn(() => ({
    promise: mockQueryPromise,
}));

jest.mock('aws-sdk', () => ({
    DynamoDB: jest.fn(() => ({
        query: mockQuery,
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

import { lambdaHandler } from '../index';

describe('GET /credit-cards/{id}', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toBeUndefined();
    });

    it('verifies successful response with item found', async () => {
        const mockedItems = [{ cardId: 'cardId', name: 'Paddy', cardLimit: 100, cardType: 'Visa' }];
        mockQueryPromise.mockReturnValueOnce({ Items: mockedItems });

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(mockedItems[0]));
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
