import { promisify } from 'util';
import { resolve } from 'dns';
import { UpdateItemOutput } from '@aws-sdk/client-dynamodb';
import type { SQSEvent } from 'aws-lambda';
import updateIpItem from '@ip-logger/core/update-ip-item';
import { deleteMessage } from '@ip-logger/core/utils';

const dnsResolveP = promisify(resolve);

export const handler = async (event: SQSEvent): Promise<UpdateItemOutput[]> => {
  const {
    Records: [{ body: domain, receiptHandle }],
  } = event;

  const ips = await dnsResolveP(domain);
  const date = new Date();

  const updateResponse = Promise.all(
    ips.map(updateIpItem(date, domain) as (ip: string) => UpdateItemOutput)
  );

  receiptHandle && (await deleteMessage(process.env.QUEUE_URL, receiptHandle));
  return updateResponse;
};
