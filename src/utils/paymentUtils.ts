import Stripe from 'stripe';

export const PaymentError = {
    INVALID_CARD_DETAILS: 'Invalid card details',
};

/**
 *
 * @param {string} apiKey used to access the payment client
 * @returns the payment client for the application
 */
export const getPaymentClient = ({ apiKey }: { apiKey: string }) => {
    return new Stripe(apiKey);
};

/**
 * @param {Stripe} paymentClient the Stripe client used to issue cards and transactions
 * @param {string} name the name of the cardholder. Other details are hardcoded for easier testing.
 * @returns cardholder details needed to issue a card
 */
export const createCardHolder = ({ paymentClient, name }: { paymentClient: Stripe; name: string }) => {
    return paymentClient.issuing.cardholders.create({
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
};

/**
 * @param {Stripe} paymentClient the Stripe client used to issue cards and transactions
 * @param {string} cardholderId Used to map card to cardholder. Other details are hardcoded for easier testing.
 * @returns card details needed to issue a transaction
 */
export const createCard = ({ paymentClient, cardholderId }: { paymentClient: Stripe; cardholderId: string }) => {
    return paymentClient.issuing.cards.create({
        cardholder: cardholderId,
        type: 'virtual',
        currency: 'eur',
        status: 'active',
    });
};

/**
 * @param {Stripe} paymentClient the Stripe client used to issue cards and transactions
 * @param {string} amount to charge the card
 * @param {string} originalCardNumber used to identify the card to charge
 * @returns transaction details returned from payment gateway
 */
export const issueCharge = ({
    paymentClient,
    amount,
    originalCardNumber,
}: {
    paymentClient: Stripe;
    amount: number;
    originalCardNumber: string;
}) => {
    return paymentClient.testHelpers.issuing.transactions.createForceCapture({
        amount,
        card: originalCardNumber,
    });
};

/**
 * @param {Stripe} paymentClient the Stripe client used to issue cards and transactions
 * @param {string} amount to credit the card
 * @param {string} originalCardNumber used to identify the card to credit
 * @returns transaction details returned from payment gateway
 */
export const issueCredit = ({
    paymentClient,
    amount,
    originalCardNumber,
}: {
    paymentClient: Stripe;
    amount: number;
    originalCardNumber: string;
}) => {
    return paymentClient.testHelpers.issuing.transactions.createUnlinkedRefund({
        amount,
        card: originalCardNumber,
    });
};
