import { APIGatewayProxyResult } from 'aws-lambda';
import event from '../../../../events/get-credit-cards/event.json';

import { expect, describe, it } from '@jest/globals';

const mockScanPromise: any = jest.fn(() => ({ Items: [] }));
const mockScan = jest.fn(() => ({
    promise: mockScanPromise,
}));

// const mockLogResponse = jest.fn();
// jest.mock('../../../utils/logUtils', () => ({
//     ...jest.requireActual('../../../utils/logUtils'),
//     logResponse: mockLogResponse,
// }));

jest.mock('aws-sdk', () => ({
    DynamoDB: jest.fn(() => ({
        scan: mockScan,
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

    it('verifies validation error if event is empty', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(null as any);

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'this cannot be null' }));
    });
});
