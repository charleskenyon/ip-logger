import { StackContext, Function } from 'sst/constructs';

export function IpLoggerStack({ stack }: StackContext) {
  new Function(stack, 'ip-logger-scraper', {
    handler: 'src/lambda.handler',
  });
}
