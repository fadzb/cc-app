import { AnyObjectSchema } from 'yup';

/**
 * Validate the event params to ensure API is called with correct parameters. Throws error upon failure.
 * @param {AnyObjectSchema} schema contains the validations to enforce.
 * @param {APIGatewayProxyEvent} params to validate
 */
export const validateParams = ({ schema, params }: { schema: AnyObjectSchema; params: unknown }) => {
    schema.validateSync(params);
};
