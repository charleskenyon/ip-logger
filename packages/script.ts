import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { AWS, DOMAINS_TABLE_NAME } from '@ip-logger/core/constants';

const prePopulateDomainsTable = async () => {
  const putItemResponse = await AWS.dynamoDbClient.send(
    new PutItemCommand({
      TableName: DOMAINS_TABLE_NAME,
      Item: {
        domain: { S: 'google.com' },
      },
    })
  );
  console.log('putItemResponse', putItemResponse);
  return putItemResponse;
};

export { prePopulateDomainsTable };
