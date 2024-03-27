import * as R from 'ramda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { ScanOutput } from '@aws-sdk/client-dynamodb';

const getFormattedDynamoDbItems = R.pipe(
  R.prop('Items'),
  R.map(unmarshall)
) as <T>(data: ScanOutput) => T[];

export { getFormattedDynamoDbItems };
