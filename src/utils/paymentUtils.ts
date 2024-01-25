import Stripe from 'stripe';

/**
 * @returns the payment client for the application
 */
export const getPaymentClient = ({ apiKey }: { apiKey: string }) => {
    return new Stripe(apiKey);
};

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

export const createCard = ({ paymentClient, cardholderId }: { paymentClient: Stripe; cardholderId: string }) => {
    return paymentClient.issuing.cards.create({
        cardholder: cardholderId,
        type: 'virtual',
        currency: 'eur',
        status: 'active',
    });
};

// export const issueTransaction = ({ paymentClient, amount, originalCardNumber }) => {
//     return paymentClient.testHelpers.issuing.transactions.createForceCapture({
//         amount,
//         card: originalCardNumber,
//     });
// };
