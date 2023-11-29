import fs from 'fs';

const test = (): void => console.log('working');
test();

const nvm = fs.readFileSync('.nvmrc');

console.log(nvm);
