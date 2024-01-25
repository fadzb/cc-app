import AWS from 'aws-sdk';
import { logger } from './logUtils';

/**
 * @returns the database client for the application
 */
export const getDbClient = () => {
    return new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://docker.for.mac.localhost:8000'),
    });
};

/**
 * Scan table to return all items
 * @param dbClient the database client to use for the operation
 * @param {AWS.DynamoDB.Types.ScanInput} params the parameters used for the operation
 * @returns a Promise that resolves to a list of Items found in the table
 */
export const scan = ({ dbClient, params }: { dbClient: AWS.DynamoDB; params: AWS.DynamoDB.Types.ScanInput }) => {
    return dbClient.scan(params).promise();
};

/**
 * Creates a new item, or replaces an old item with a new item.
 * @param dbClient the database client to use for the operation
 * @param {AWS.DynamoDB.Types.PutItemInput} params the parameters used for the operation
 * @returns a Promise that resolves to a list of Items found in the table
 */
export const putItem = ({ dbClient, params }: { dbClient: AWS.DynamoDB; params: AWS.DynamoDB.Types.PutItemInput }) => {
    return dbClient.putItem(params).promise();
};

/**
 * Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
 * @param dbClient the database client to use for the operation
 * @param {AWS.DynamoDB.Types.UpdateItemInput} params the parameters used for the operation
 * @returns a Promise that resolves to a list of Items found in the table
 */
export const updateItem = ({
    dbClient,
    params,
}: {
    dbClient: AWS.DynamoDB;
    params: AWS.DynamoDB.Types.UpdateItemInput;
}) => {
    return dbClient.updateItem(params).promise();
};

/**
 * Queries for item by partition key value (and sort key if supported)
 * @param dbClient the database client to use for the operation
 * @param {AWS.DynamoDB.Types.QueryInput} params the parameters used for the operation
 * @returns a Promise that resolves to a list of Items found in the table
 */
export const query = ({ dbClient, params }: { dbClient: AWS.DynamoDB; params: AWS.DynamoDB.Types.QueryInput }) => {
    return dbClient.query(params).promise();
};
