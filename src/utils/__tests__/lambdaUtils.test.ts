import { expect, describe, it } from '@jest/globals';

jest.mock('../../utils/logUtils', () => ({
    ...jest.requireActual('../../utils/logUtils'),
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import { handleErrors } from '../lambdaUtils';

describe('lambdaUtils', function () {
    describe('handleErrors', function () {
        it('verifies unknown error is handled', () => {
            const result = handleErrors('');

            expect(result.statusCode).toEqual(500);
            expect(result.body).toEqual(JSON.stringify({ message: 'Unknown error' }));
        });

        it('verifies ConditionalCheckFailedException is handled', () => {
            const err = new Error();
            err.name = 'ConditionalCheckFailedException';

            const result = handleErrors(err);

            expect(result.statusCode).toEqual(404);
            expect(result.body).toEqual(JSON.stringify({ message: 'Item not found within Table.' }));
        });

        it('verifies ResourceNotFoundException is handled', () => {
            const err = new Error();
            err.name = 'ResourceNotFoundException';

            const result = handleErrors(err);

            expect(result.statusCode).toEqual(404);
            expect(result.body).toEqual(
                JSON.stringify({
                    message:
                        'Unable to call DynamoDB: Table resource not found. Ensure the local DB server is running and the table has been created using the AWS CLI.',
                }),
            );
        });

        it('verifies standard error is handled', () => {
            const err = new Error('Error message');

            const result = handleErrors(err);

            expect(result.statusCode).toEqual(500);
            expect(result.body).toEqual(
                JSON.stringify({
                    message: 'Error message',
                }),
            );
        });
    });
});
