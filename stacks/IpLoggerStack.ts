import { StackContext, Function } from 'sst/constructs';

export function IpLoggerStack({ stack }: StackContext) {
  new Function(stack, 'ip-logger-scraper', {
    handler: 'packages/functions/src/lambda.handler',
    runtime: 'nodejs20.x',
    functionName: 'ip-logger-scraper',
  });
}
