export type CreditCardInput = {
    name: string;
    cardLimit?: number;
    cardType?: string;
};

export type CreditCard = {
    cardId: string;
    name: string;
    cardLimit: number;
    balance: number;
    cardType: string;
    deleted?: boolean;
};
