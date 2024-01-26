import { expect, describe, it } from '@jest/globals';

jest.mock('../../utils/logUtils', () => ({
    ...jest.requireActual('../../utils/logUtils'),
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import { decipherText, encipherText } from '../cryptoUtils';

describe('cryptoUtils', function () {
    describe('encipherText', function () {
        it('verifies cipher is returned', () => {
            const result = encipherText({ secretAlgorithm: 'aes256', secretKey: 'key', plainText: 'text' });

            expect(result).toEqual('95a63709756c4d83809f31fd77512606');
        });
    });

    describe('decipherText', function () {
        it('verifies plaintext is returned', () => {
            const result = decipherText({
                secretAlgorithm: 'aes256',
                secretKey: 'key',
                cipherText: '95a63709756c4d83809f31fd77512606',
            });

            expect(result).toEqual('text');
        });

        it('verifies error is handled', () => {
            const result = decipherText({ secretAlgorithm: 'aes256', secretKey: 'key', cipherText: '' });

            expect(result).toEqual('');
        });
    });
});
