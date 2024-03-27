import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import {
  SendMessageBatchCommand,
  SendMessageBatchResult,
} from '@aws-sdk/client-sqs';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { getFormattedDynamoDbItems } from '@ip-logger/core/utils';
import { AWS, DOMAINS_TABLE_NAME } from '@ip-logger/core/constants';

export const handler = async (): Promise<SendMessageBatchResult[]> => {
  const domainsData = await AWS.dynamoDbClient.send(
    new ScanCommand({ TableName: DOMAINS_TABLE_NAME })
  );

  const domainItems = getFormattedDynamoDbItems<{ url: string }>(domainsData);
  const batchedDomainItems = R.splitEvery(10, domainItems);

  return Promise.all(
    batchedDomainItems.map((domainItems) =>
      AWS.sqsClient.send(
        new SendMessageBatchCommand({
          QueueUrl: process.env.QUEUE_URL,
          Entries: domainItems.map(({ url }) => ({
            Id: uuidv4(),
            MessageBody: url,
          })),
        })
      )
    )
  );
};
