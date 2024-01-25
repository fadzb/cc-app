import Stripe from 'stripe';

/**
 * @returns the payment client for the application
 */
export const getPaymentClient = ({ apiKey }: { apiKey: string }) => {
    return new Stripe(apiKey);
};

export const issueTransaction = ({ paymentClient, amount, originalCardNumber }) => {
    return paymentClient.testHelpers.issuing.transactions.createForceCapture({
        amount,
        card: originalCardNumber,
    });
};
