import { APIGatewayProxyResult } from 'aws-lambda';
import getCreditCardsEvent from '../../../../events/getCreditCardsEvent.json';

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
        const result: APIGatewayProxyResult = await lambdaHandler(getCreditCardsEvent);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify([]));
    });

    it('verifies successful response with items', async () => {
        const mockedItems = [{ cardId: 'cardId', name: 'Paddy', limit: 100, __typename: 'Credit', cardType: 'Visa' }];
        mockScanPromise.mockReturnValueOnce({ Items: mockedItems });

        const result: APIGatewayProxyResult = await lambdaHandler(getCreditCardsEvent);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(mockedItems));
    });
});
