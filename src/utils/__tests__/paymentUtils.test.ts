import { expect, describe, it } from '@jest/globals';
import { createCard, createCardHolder, getPaymentClient, issueCharge, issueCredit } from '../paymentUtils';

const mockCardholdersCreate = jest.fn(() => ({ id: 'cardholderId' }));
const mockCardsCreate = jest.fn(() => ({ id: 'originalCardNumber' }));
const mockCreateForceCapture = jest.fn(() => ({ id: 'chargeTransactionId' }));
const mockCreateUnlinkedRefund = jest.fn(() => ({ id: 'creditTransactionId' }));

const paymentClient: any = {
    issuing: {
        cardholders: { create: mockCardholdersCreate },
        cards: { create: mockCardsCreate },
    },
    testHelpers: {
        issuing: {
            transactions: {
                createForceCapture: mockCreateForceCapture,
                createUnlinkedRefund: mockCreateUnlinkedRefund,
            },
        },
    },
};

const mockStripe = jest.fn(() => paymentClient);
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        mockStripe,
    }));
});

describe('paymentUtils', function () {
    describe('getPaymentClient', function () {
        it('verifies client is returned', () => {
            const result = getPaymentClient({ apiKey: '' });

            expect(result).toEqual({ mockStripe: mockStripe });
        });
    });

    describe('createCardHolder', function () {
        it('verifies cardholder details are returned', () => {
            const name = 'Paddy';

            const result = createCardHolder({ paymentClient, name });

            expect(mockCardholdersCreate).toHaveBeenCalledWith({
                name,
                email: 'john.doe@example.com',
                phone_number: '+18008675309',
                status: 'active',
                type: 'individual',
                individual: {
                    first_name: 'John',
                    last_name: 'Doe',
                    dob: {
                        day: 1,
                        month: 11,
                        year: 1981,
                    },
                },
                billing: {
                    address: {
                        line1: '123 Main Street',
                        city: 'Dublin',
                        state: 'IE',
                        postal_code: 'D01ABCD',
                        country: 'IE',
                    },
                },
            });
            expect(result).toEqual({ id: 'cardholderId' });
        });
    });

    describe('createCard', function () {
        it('verifies card details are returned', () => {
            const cardholderId = 'cardholderId';

            const result = createCard({ paymentClient, cardholderId });

            expect(mockCardsCreate).toHaveBeenCalledWith({
                cardholder: cardholderId,
                type: 'virtual',
                currency: 'eur',
                status: 'active',
            });
            expect(result).toEqual({ id: 'originalCardNumber' });
        });
    });

    describe('issueCharge', function () {
        it('verifies charge transaction details are returned', () => {
            const amount = 10;
            const originalCardNumber = 'originalCardNumber';

            const result = issueCharge({ paymentClient, amount, originalCardNumber });

            expect(mockCreateForceCapture).toHaveBeenCalledWith({
                amount,
                card: originalCardNumber,
            });
            expect(result).toEqual({ id: 'chargeTransactionId' });
        });
    });

    describe('issueCredit', function () {
        it('verifies credit transaction details are returned', () => {
            const amount = 10;
            const originalCardNumber = 'originalCardNumber';

            const result = issueCredit({ paymentClient, amount, originalCardNumber });

            expect(mockCreateUnlinkedRefund).toHaveBeenCalledWith({
                amount,
                card: originalCardNumber,
            });
            expect(result).toEqual({ id: 'creditTransactionId' });
        });
    });
});
