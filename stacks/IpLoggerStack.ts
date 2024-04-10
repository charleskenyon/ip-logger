import { StackContext, Function, Table, Queue, Cron } from 'sst/constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const dynamoDbBaseSettings = {
  removalPolicy: RemovalPolicy.DESTROY,
  billingMode: dynamodb.BillingMode.PROVISIONED,
  readCapacity: 1,
  writeCapacity: 1,
};

export function IpLoggerStack({ stack }: StackContext) {
  stack.setDefaultFunctionProps({
    runtime: 'nodejs20.x',
  });

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
      dateAdded: 'string',
      dateUpdated: 'string',
      returnCount: 'number',
    },
    primaryIndex: { partitionKey: 'ip', sortKey: 'domain' },
    cdk: {
      table: {
        ...dynamoDbBaseSettings,
        tableName: 'ip-logger-ips-table',
      },
    },
  });

  const domainsQueue = new Queue(stack, 'DomainsQueue', {
    // add consumer and function (scraper) inline
    cdk: {
      queue: {
        queueName: 'ip-logger-domains-queue',
      },
    },
  });

  const iteratorLambda = new Cron(stack, 'IteratorLambda', {
    schedule: 'rate(1 minute)',
    cdk: {
      rule: {
        ruleName: 'ip-logger-iterator-lambda-cron',
      },
    },
    job: {
      function: {
        handler: 'packages/functions/src/iterator.handler',
        functionName: 'ip-logger-iterator-lambda',
        environment: {
          QUEUE_URL: domainsQueue.queueUrl,
        },
      },
    },
  });

  iteratorLambda.attachPermissions(['dynamodb:Scan', 'sqs:SendMessage']);

  domainsQueue.attachPermissions([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.ArnPrincipal(iteratorLambda.jobFunction.role.roleArn),
      ],
      actions: ['sqs:SendMessage'],
      resources: [domainsQueue.queueArn],
    }),
  ]);

  const scraperLambda = new Function(stack, 'ScraperLambda', {
    handler: 'packages/functions/src/scraper.handler',
    functionName: 'ip-logger-scraper-lambda',
    bind: [domainsQueue],
    environment: {
      QUEUE_URL: domainsQueue.queueUrl,
    },
  });

  scraperLambda.attachPermissions(['dynamodb:UpdateItem', 'sqs:DeleteMessage']); // lock down to specific table and queue

  domainsQueue.attachPermissions([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(scraperLambda.role.roleArn)],
      actions: ['sqs:DeleteMessage'],
      resources: [domainsQueue.queueArn],
    }),
  ]);

  scraperLambda.addEventSource(
    new SqsEventSource(domainsQueue.cdk.queue, {
      batchSize: 1,
    })
  );
}

// queue.addConsumer(props.stack, "src/function.handler");

// https://glastonbury.seetickets.com

// TODOadd xray, backup table before destruction, add dev env
