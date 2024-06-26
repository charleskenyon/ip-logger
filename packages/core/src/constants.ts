import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const AWS = {
  sqsClient: new SQSClient({ region: 'eu-west-2' }),
  dynamoDbClient: new DynamoDBClient({ region: 'eu-west-2' }),
};

const DOMAINS_TABLE_NAME = 'ip-logger-domains-table';
const IPS_TABLE_NAME = 'ip-logger-ips-table';

export { AWS, DOMAINS_TABLE_NAME, IPS_TABLE_NAME };
