import { SendMessageCommand, SendMessageResult } from '@aws-sdk/client-sqs';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { getFormattedDynamoDbItems } from '@ip-logger/core/utils';
import { AWS, DOMAINS_TABLE_NAME } from '@ip-logger/core/constants';

export const handler = async (): Promise<SendMessageResult[]> => {
  const domainsData = await AWS.dynamoDbClient.send(
    new ScanCommand({ TableName: DOMAINS_TABLE_NAME })
  );

  const domainItems = getFormattedDynamoDbItems<{ domain: string }>(
    domainsData
  );

  return Promise.all(
    domainItems.map(({ domain }) =>
      AWS.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: process.env.QUEUE_URL,
          MessageBody: domain,
        })
      )
    )
  );
};
