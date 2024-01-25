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

type IDInput = {
    id: string;
};
type GetCreditCardByIdInput = {
    pathParameters: IDInput;
};
export type GetCreditCardByIdEvent = Omit<APIGatewayProxyEvent, 'pathParameters'> & GetCreditCardByIdInput;

export type APIEvent = APIGatewayProxyEvent | GetCreditCardByIdEvent;
