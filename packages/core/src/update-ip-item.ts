import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { AWS, IPS_TABLE_NAME } from '@ip-logger/core/constants';
import * as R from 'ramda';

const updateIpItem = R.curry((date: Date, domain: string, ip: string) => {
  return AWS.dynamoDbClient.send(
    new UpdateItemCommand({
      ExpressionAttributeValues: {
        ':date': {
          S: date.toLocaleString(),
        },
        ':inc': {
          N: '1',
        },
      },
      Key: {
        ip: {
          S: ip,
        },
        domain: {
          S: domain,
        },
      },
      ReturnValues: 'ALL_NEW',
      TableName: IPS_TABLE_NAME,
      UpdateExpression:
        'SET dateAdded = if_not_exists(dateAdded, :date), dateUpdated = :date ADD returnCount :inc',
    })
  );
});

export default updateIpItem;
