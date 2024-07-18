# ip-logger

IP scraper that uses AWS lambda, SQS and dyanmodb to scrape IPs for a certain domain over time.

`npm run dev` - deploy dev environment and debug with [SST Live Lambda](https://docs.sst.dev/live-lambda-development)

`npm run deploy` - deploy prod stack. Post deploy job will restore dynamodb tables from backups if available

`npm run remove` - delete prod stack
