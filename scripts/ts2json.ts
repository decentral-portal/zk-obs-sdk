// main.js

import {createGenerator} from 'ts-json-schema-generator';
import fs from 'fs';
import path from 'path';

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: path.resolve(__dirname, '../lib/ts-types/**/*.ts'),
  tsconfig: path.resolve(__dirname, '../tsconfig.json'),
  type: '*', // Or <type-name> if you want to generate schema for that one type only
};

const output_path = path.resolve(__dirname, '../lib/ts-types/schema.json');
try {
  const schema = createGenerator(config).createSchema(config.type);
  const schemaString = JSON.stringify(schema, null, 2);
  fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
  });
} catch (error: any) {
  console.error(error?.message);
}