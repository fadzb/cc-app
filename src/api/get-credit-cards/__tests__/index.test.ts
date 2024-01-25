import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/get-credit-cards/event.json';

import { expect, describe, it } from '@jest/globals';

const mockScanPromise: any = jest.fn(() => ({ Items: [] }));
const mockScan = jest.fn(() => ({
    promise: mockScanPromise,
}));

jest.mock('aws-sdk', () => ({
    DynamoDB: jest.fn(() => ({
        scan: mockScan,
    })),
    Endpoint: jest.fn(() => ''),
}));

import { lambdaHandler } from '../index';

describe('GET /credit-cards', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ items: [] }));
    });

    it('verifies successful response with items', async () => {
        const mockedItems = [{ cardId: 'cardId', name: 'Paddy', cardLimit: 100, cardType: 'Visa' }];
        mockScanPromise.mockReturnValueOnce({ Items: mockedItems });

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ items: mockedItems }));
    });
});
