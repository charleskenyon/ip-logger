import { StackContext, Function, Table, Queue } from 'sst/constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

const dynamoDbBaseSettings = {
  removalPolicy: RemovalPolicy.DESTROY,
  billingMode: dynamodb.BillingMode.PROVISIONED,
  readCapacity: 1,
  writeCapacity: 1,
};

export function IpLoggerStack({ stack }: StackContext) {
  new Table(stack, 'Domains', {
    fields: {
      domain: 'string',
    },
    primaryIndex: { partitionKey: 'domain' },
    cdk: {
      table: {
        ...dynamoDbBaseSettings,
        tableName: 'ip-logger-domains-table',
      },
    },
  });

  new Table(stack, 'Ips', {
    fields: {
      ip: 'string',
      domain: 'string',
    },
    primaryIndex: { partitionKey: 'ip', sortKey: 'domain' },
    cdk: {
      table: {
        removalPolicy: RemovalPolicy.DESTROY,
        tableName: 'ip-logger-ips-table',
        billingMode: dynamodb.BillingMode.PROVISIONED,
        readCapacity: 1,
        writeCapacity: 1,
      },
    },
  });

  const domainsQueue = new Queue(stack, 'DomainsQueue', {
    cdk: {
      queue: {
        queueName: 'ip-logger-domains-queue',
      },
    },
  });

  const iteratorLambda = new Function(stack, 'IteratorLambda', {
    handler: 'packages/functions/src/iterator.handler',
    runtime: 'nodejs20.x',
    functionName: 'ip-logger-iterator-lambda',
    environment: {
      QUEUE_URL: domainsQueue.queueUrl,
    },
  });

  iteratorLambda.attachPermissions(['dynamodb:Scan', 'sqs:SendMessage']);

  domainsQueue.attachPermissions([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(iteratorLambda.role.roleArn)],
      actions: ['sqs:SendMessage'],
      resources: [domainsQueue.queueArn],
    }),
  ]);

  new Function(stack, 'ScraperLambda', {
    handler: 'packages/functions/src/scraper.handler',
    runtime: 'nodejs20.x',
    functionName: 'ip-logger-scraper-lambda',
    environment: {
      QUEUE_URL: domainsQueue.queueUrl,
    },
  });
}

// https://glastonbury.seetickets.com/content/extras

// add xray, backup table before destruction
