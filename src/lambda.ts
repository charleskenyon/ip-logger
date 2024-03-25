import { func1, nums } from './module';

export const handler = async () => {
  return {
    statusCode: 200,
    body: `working!!, ${func1()}`,
    nums,
  };
};
