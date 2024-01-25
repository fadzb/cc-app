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

jest.mock('uuid', () => ({ v4: () => 'uuid' }));

import { lambdaHandler } from '../index';

describe('POST /credit-cards', function () {
    it('verifies successful response', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ cardId: 'uuid', name: 'Paddy', cardLimit: '1000' }));
    });

    it('verifies validation error if cardholder name is empty', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), name: undefined }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'name is a required field' }));
    });

    it('verifies validation error if cardholder credit limit is negative', async () => {
        const result: APIGatewayProxyResult = await lambdaHandler({
            ...event,
            body: JSON.stringify({ ...JSON.parse(event.body), cardLimit: -1000 }),
        });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({ message: 'cardLimit must be a positive number' }));
    });

    // it('verifies validation error if id in URL path is invalid', async () => {
    //     const result: APIGatewayProxyResult = await lambdaHandler({
    //         ...event,
    //         body: JSON.stringify({ ...JSON.parse(event.body), cardLimit: -1000 }),
    //     });

    //     expect(result.statusCode).toEqual(500);
    //     expect(result.body).toEqual(JSON.stringify({ message: 'name is a required field' }));
    // });
});
