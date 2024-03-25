import type { SSTConfig } from 'sst';
import { IpLoggerStack } from './stacks/IpLoggerStack';

const config: SSTConfig = {
  // config(input) {
  config() {
    return {
      name: 'ip-logger',
      region: 'eu-west-2',
    };
  },
  stacks(app) {
    app.stack(IpLoggerStack);
  },
};

export default config;
