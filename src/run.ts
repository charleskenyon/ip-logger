import fs from 'fs';
import { func1, nums } from './module';

// const test = (): void => console.log('working');
// test();

// const nvm = fs.readFileSync('.nvmrc', 'utf-8');

// console.log(nvm);

// func1();

// console.log(nums.reduce((a, b) => a + b, 0));

export const handler = async () => {
  return {
    statusCode: 200,
    body: `${func1()}, ${nums.reduce((a, b) => a + b, 0)}`,
  };
};
