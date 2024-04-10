import * as R from 'ramda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DeleteMessageCommand } from '@aws-sdk/client-sqs';
import type { ScanOutput } from '@aws-sdk/client-dynamodb';
import { AWS } from './constants';

const getFormattedDynamoDbItems = R.pipe(
  R.prop('Items'),
  R.map(unmarshall)
) as <T>(data: ScanOutput) => T[];

const deleteMessage = (queuUrl: string, receiptHandle: string) =>
  AWS.sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: queuUrl,
      ReceiptHandle: receiptHandle,
    })
  );

export { getFormattedDynamoDbItems, deleteMessage };
