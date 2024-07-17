import {
  RestoreTableFromBackupCommand,
  ListBackupsCommand,
  DeleteTableCommand,
  waitUntilTableNotExists,
  BackupTypeFilter,
} from '@aws-sdk/client-dynamodb';
import {
  AWS,
  DOMAINS_TABLE_NAME,
  IPS_TABLE_NAME,
} from '@ip-logger/core/constants';

const restoreBackups = async () => {
  const restoreBackupResponses = await Promise.all(
    [DOMAINS_TABLE_NAME, IPS_TABLE_NAME].map(async (tableName) => {
      const { BackupSummaries: backups = [] } = await AWS.dynamoDbClient.send(
        new ListBackupsCommand({
          TableName: tableName,
          BackupType: BackupTypeFilter.ALL,
        })
      );

      const [{ BackupArn: latestBackupArn } = { BackupArn: false }] =
        backups.sort(
          (a, b) =>
            new Date(b.BackupCreationDateTime).valueOf() -
            new Date(a.BackupCreationDateTime).valueOf()
        ); // get most recent backup

      console.log('latestBackupArn', latestBackupArn);

      if (typeof latestBackupArn === 'string') {
        await AWS.dynamoDbClient.send(
          new DeleteTableCommand({
            TableName: tableName,
          })
        ); // delete newly created empty table as there is backup

        await waitUntilTableNotExists(
          {
            client: AWS.dynamoDbClient,
            maxWaitTime: 30,
          },
          { TableName: tableName }
        );

        return await AWS.dynamoDbClient.send(
          new RestoreTableFromBackupCommand({
            TargetTableName: tableName,
            BackupArn: latestBackupArn,
          })
        );
      }

      return `'${tableName}' table not restored as no backup was available`;
    })
  );
  console.log('restoreBackupResponses', restoreBackupResponses);
  return restoreBackupResponses;
};

export default restoreBackups;
