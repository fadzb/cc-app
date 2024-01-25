type CardType = 'Mastercard' | 'Visa';

export type CreditCard = {
    cardId: string;
    name: string;
    cardLimit: number;
    cardType: CardType;
    deleted?: boolean;
};

export type CreditCardInput = {
    name: string;
    cardLimit?: number;
    cardType?: string;
};

type PostCreditCardInput = {
    body: string;
};
export type PostCreditCardEvent = Omit<APIGatewayProxyEvent, 'body'> & PostCreditCardInput;

type IDInput = {
    id: string;
};
type GetCreditCardByIdInput = {
    pathParameters: IDInput;
};
export type GetCreditCardByIdEvent = Omit<APIGatewayProxyEvent, 'pathParameters'> & GetCreditCardByIdInput;

type CardLimitInput = {
    cardLimit: number;
};
type PutCreditCardByIdInput = {
    body: CardLimitInput;
};
export type PutCreditCardByIdEvent = Omit<APIGatewayProxyEvent, 'pathParameters', 'body'> &
    GetCreditCardByIdInput &
    PutCreditCardByIdInput;

export type APIEvent = APIGatewayProxyEvent | PostCreditCardEvent | GetCreditCardByIdEvent | PutCreditCardByIdEvent;
