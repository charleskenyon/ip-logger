import type { SSTConfig } from 'sst';
import { IpLoggerStack, AfterDeployStack } from './stacks';

const config: SSTConfig = {
  config() {
    return {
      name: 'ip-logger',
      region: 'eu-west-2',
    };
  },
  stacks(app) {
    app.stack(IpLoggerStack);
    app.stack(AfterDeployStack);
  },
};

export default config;
