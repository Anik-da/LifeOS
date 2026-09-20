import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'LifeOS';

const client = new DynamoDBClient({ region });
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export function getTableName(tableName: string): string {
  return `${tablePrefix}-${tableName}`;
}

export const db = {
  async put(tableName: string, item: Record<string, any>): Promise<void> {
    const fullTableName = getTableName(tableName);
    await docClient.send(new PutCommand({ TableName: fullTableName, Item: item }));
  },

  async get(tableName: string, key: Record<string, any>): Promise<any> {
    const fullTableName = getTableName(tableName);
    const result = await docClient.send(new GetCommand({ TableName: fullTableName, Key: key }));
    return result.Item;
  },

  async queryByUserId(tableName: string, userId: string): Promise<any[]> {
    const fullTableName = getTableName(tableName);
    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: fullTableName,
          KeyConditionExpression: 'userId = :uid',
          ExpressionAttributeValues: { ':uid': userId },
        })
      );
      return result.Items || [];
    } catch {
      // Fallback for scanning if single table index or missing key
      try {
        const scanResult = await docClient.send(
          new ScanCommand({
            TableName: fullTableName,
            FilterExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
          })
        );
        return scanResult.Items || [];
      } catch {
        return [];
      }
    }
  },

  async updateStatus(tableName: string, userId: string, id: string, status: string): Promise<void> {
    const fullTableName = getTableName(tableName);
    await docClient.send(
      new UpdateCommand({
        TableName: fullTableName,
        Key: { userId, id },
        UpdateExpression: 'SET #st = :st, updatedAt = :u',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: { ':st': status, ':u': new Date().toISOString() },
      })
    );
  },

  async delete(tableName: string, key: Record<string, any>): Promise<void> {
    const fullTableName = getTableName(tableName);
    await docClient.send(new DeleteCommand({ TableName: fullTableName, Key: key }));
  },
};
