import { hexToBuffer, hexToUint8Array, uint8ArrayToHexString } from '../../lib/helper';
import { TsRollupConfigType } from '../../lib/ts-rollup/ts-rollup';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import PrivMap from './test-privkey.json';

dotenv.config({path: '.env.local'});
dotenv.config();

export const isTestCircuitRun = Boolean(process.env.TEST_IS_CIRCUIT_RUN);
export const acc1Priv = hexToBuffer('389983c47980ada5320c1ca357e002e249e1083d7f3ce5d4f47cb3f6a18ca3b5');
export const acc2Priv = hexToBuffer('32ec42f0a7699647f3047bd233b6d6562922de2e10ebc2d487c4ebb8fdebcbe4');

export function exportInputFile(circuitInputJsonPath: string, data: any, namespace = '') {
  const path = namespace ? circuitInputJsonPath.replace('.json', `_${namespace}.json`) : circuitInputJsonPath;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`output input file: ${path}`);
}
// console.log(JSON.stringify(new Array(250).fill(0).map((_,idx) => '0x'+uint8ArrayToHexString(ethers.utils.randomBytes(32)))));



export function getPrivByIndex(index: number, offset = 0) {
  const priv = PrivMap[index + offset];
  if(!priv) {
    throw new Error(`priv not found, index: ${index+offset}`);
  }
  return hexToUint8Array(priv);
}