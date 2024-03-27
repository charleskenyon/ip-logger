import { StackContext, Function, Table, Queue } from 'sst/constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export function IpLoggerStack({ stack }: StackContext) {
  new Table(stack, 'Domains', {
    fields: {
      url: 'string',
    },
    primaryIndex: { partitionKey: 'url' },
    cdk: {
      table: {
        removalPolicy: RemovalPolicy.DESTROY,
        tableName: 'ip-logger-domains-table',
      },
    },
  });

  const urlsQueue = new Queue(stack, 'UrlsQueue', {
    cdk: {
      queue: {
        queueName: 'ip-logger-urls-queue',
      },
    },
  });

  const iteratorLambda = new Function(stack, 'IteratorLambda', {
    handler: 'packages/functions/src/iterator.handler',
    runtime: 'nodejs20.x',
    functionName: 'ip-logger-iterator',
    environment: {
      QUEUE_URL: urlsQueue.queueUrl,
    },
  });

  iteratorLambda.attachPermissions(['dynamodb:Scan', 'sqs:SendMessage']);

  urlsQueue.attachPermissions([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(iteratorLambda.role.roleArn)],
      actions: ['sqs:SendMessage'],
      resources: [urlsQueue.queueArn],
    }),
  ]);
}

// https://glastonbury.seetickets.com/content/extras
