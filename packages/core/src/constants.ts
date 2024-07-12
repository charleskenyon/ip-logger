import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

const isDev = process.env.SST_STAGE === 'dev';
const region = 'eu-west-2';

const AWS = {
  sqsClient: isDev
    ? new SQSClient({ region })
    : AWSXRay.captureAWSv3Client(new SQSClient({ region })),
  dynamoDbClient: isDev
    ? new DynamoDBClient({ region })
    : AWSXRay.captureAWSv3Client(new DynamoDBClient({ region })),
};

const DOMAINS_TABLE_NAME = `ip-logger-domains-table-${process.env.SST_STAGE}`;
const IPS_TABLE_NAME = `ip-logger-ips-table-${process.env.SST_STAGE}`;

export { AWS, DOMAINS_TABLE_NAME, IPS_TABLE_NAME };
