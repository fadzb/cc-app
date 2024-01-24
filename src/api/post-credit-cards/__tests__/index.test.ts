import { APIGatewayProxyResult } from 'aws-lambda';
import postCreditCardsEvent from '../../../../events/postCreditCardsEvent.json';

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

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('POST /credit-cards', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(postCreditCardsEvent);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ cardId: 'uuid', name: 'Paddy', cardLimit: '1000' }));
    });
});
