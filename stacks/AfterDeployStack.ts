import { dependsOn, StackContext, Script } from 'sst/constructs';
import { IpLoggerStack } from './IpLoggerStack';

export function AfterDeployStack({ app, stack }: StackContext) {
  dependsOn(IpLoggerStack);
  if (app.stage === 'dev') {
    const script = new Script(stack, 'AfterDeploy', {
      onCreate: 'packages/script.prePopulateDomainsTable',
    });
    script.attachPermissions(['dynamodb:PutItem']);
  }
}
