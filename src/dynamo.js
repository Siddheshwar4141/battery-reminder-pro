import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from './config.js';

const client = new DynamoDBClient({ region: config.aws.region });
const docClient = DynamoDBDocumentClient.from(client);

export async function fetchStaleLocks(sinceDate) {
  const result = await docClient.send(new ScanCommand({ TableName: 'locks' }));
  return (result.Items || []).filter(item => {
    const ts = new Date(item.last_battery_checked || 0);
    return ts < sinceDate;
  });
}
