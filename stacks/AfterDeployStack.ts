import { dependsOn, StackContext, Script, use } from 'sst/constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IpLoggerStack } from './IpLoggerStack';

export function AfterDeployStack({ app, stack }: StackContext) {
  const { domainsTable } = use(IpLoggerStack);
  dependsOn(IpLoggerStack);
  if (app.stage === 'dev') {
    const script = new Script(stack, 'AfterDeployDev', {
      onCreate: 'packages/scripts/src/index.prePopulateDomainsTable',
    });
    script.attachPermissions([
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [domainsTable.tableArn],
      }),
    ]);
  }
  if (app.stage === 'prod') {
    const script = new Script(stack, 'AfterDeployProd', {
      onCreate: 'packages/scripts/src/index.restoreBackups',
    });
    script.attachPermissions([
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
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
          'dynamodb:DescribeTable',
        ],
        resources: [
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/ip-logger-domains-table-${app.stage}`,
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/ip-logger-ips-table-${app.stage}`,
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/ip-logger-domains-table-${app.stage}/backup/*`,
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/ip-logger-ips-table-${app.stage}/backup/*`,
        ],
      }),
    ]);
  }
}
