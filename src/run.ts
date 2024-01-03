import fs from 'fs';
import { func1 } from './module';

const test = (): void => console.log('working');
test();

const nvm = fs.readFileSync('.nvmrc', 'utf-8');

console.log(nvm);

func1();
