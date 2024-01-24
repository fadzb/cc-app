import { APIGatewayProxyEvent } from 'aws-lambda';
import { AnyObjectSchema } from 'yup';

/**
 * Validate the event to ensure API is called with correct parameters. Throws error upon failure.
 * @param {AnyObjectSchema} schema contains the validations to enforce.
 * @param {APIGatewayProxyEvent} event the event to validate
 */
export const validateEvent = ({ schema, event }: { schema: AnyObjectSchema; event: APIGatewayProxyEvent }) => {
    schema.validateSync(event);
};
