import { dependsOn, StackContext, Script } from 'sst/constructs';
import { IpLoggerStack } from './IpLoggerStack';

export function AfterDeployStack({ app, stack }: StackContext) {
  dependsOn(IpLoggerStack);
  if (app.stage === 'dev') {
    const script = new Script(stack, 'AfterDeployDev', {
      onCreate: 'packages/script.prePopulateDomainsTable',
    });
    script.attachPermissions(['dynamodb:PutItem']);
  }
  if (app.stage === 'prod') {
    const script = new Script(stack, 'AfterDeployProd', {
      onCreate: 'packages/script.restoreBackups',
    });
    script.attachPermissions([
      'dynamodb:ListBackups',
      'dynamodb:RestoreTableFromBackup',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
      'dynamodb:GetItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:BatchWriteItem',
      'dynamodb:DeleteTable',
    ]);
  }
}
