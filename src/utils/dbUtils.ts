import AWS from 'aws-sdk';

/**
 * @returns the database client for the application
 */
export const getDbClient = () => {
    return new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://docker.for.mac.localhost:8000'),
    });
};

/**
 * Scan table using the provided database client to return all items
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
