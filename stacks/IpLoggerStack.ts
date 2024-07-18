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

export function IpLoggerStack({ app, stack }: StackContext) {
  const isProd = app.stage === 'prod';

  stack.setDefaultFunctionProps({
    runtime: 'nodejs20.x',
  });

  const domainsTable = new Table(stack, 'Domains', {
    fields: {
      domain: 'string',
    },
    primaryIndex: { partitionKey: 'domain' },
    cdk: {
      table: {
        ...dynamoDbBaseSettings,
        tableName: `ip-logger-domains-table-${app.stage}`,
        pointInTimeRecovery: isProd ? true : false,
      },
    },
  });

  const ipsTable = new Table(stack, 'Ips', {
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
        tableName: `ip-logger-ips-table-${app.stage}`,
        pointInTimeRecovery: isProd ? true : false,
      },
    },
  });

  const domainsQueue = new Queue(stack, 'DomainsQueue', {
    cdk: {
      queue: {
        queueName: `ip-logger-domains-queue-${app.stage}`,
      },
    },
  });

  const iteratorLambda = new Cron(stack, 'IteratorLambda', {
    schedule: 'rate(10 minutes)',
    enabled: isProd ? true : false,
    cdk: {
      rule: {
        ruleName: 'ip-logger-iterator-lambda-cron',
      },
    },
    job: {
      function: {
        handler: 'packages/functions/src/iterator.handler',
        functionName: `ip-logger-iterator-lambda-${app.stage}`,
        environment: {
          QUEUE_URL: domainsQueue.queueUrl,
        },
      },
    },
  });

  iteratorLambda.jobFunction.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:Scan'],
      resources: [domainsTable.tableArn],
    })
  );

  iteratorLambda.jobFunction.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sqs:SendMessage'],
      resources: [domainsQueue.queueArn],
    })
  );

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
    functionName: `ip-logger-scraper-lambda-${app.stage}`,
    bind: [domainsQueue],
    environment: {
      QUEUE_URL: domainsQueue.queueUrl,
    },
  });

  scraperLambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:UpdateItem'],
      resources: [ipsTable.tableArn],
    })
  );

  scraperLambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sqs:DeleteMessage'],
      resources: [domainsQueue.queueArn],
    })
  );

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

  return {
    domainsTable,
  };
}
