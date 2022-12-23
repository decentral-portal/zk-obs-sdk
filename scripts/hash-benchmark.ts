import { keccak256 } from 'ethers/lib/utils';
import {MiMC7_91} from '../lib/mimc-hash-dp';
import { hexToUint8Array } from '../lib/helper';
import { dpPoseidonHash } from '../lib/poseidon-hash-dp';
const mimc7 = new MiMC7_91();
const FF = require('ffjavascript');

const circom_tester = require('circom_tester');
const wasm_tester = circom_tester.wasm;

const INPUT_BITS = 256;
const OUTPUT_BITS = 256;
const F_BN128 = FF.Scalar.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);
const MaxUint8ArrayLength = hexToUint8Array('0x'+F_BN128.toString(16)).length;


// TODO: , Poseidon, Pedersen


function hashKeccak(input: Uint8Array): Uint8Array {
  const r =  keccak256(input);
  return hexToUint8Array(r);
}

function hashMimc(input: bigint[]): Uint8Array {
  const r = mimc7.multiHash(input);
  return bigintToUint8Array(r);
}

// function hashPosidonHash(input: Uint8Array): Uint8Array {
//     const r = dpPoseidonHash(input);

//     hexToUint8Array
//     return hexToUint8Array(r);
// }
console.log({
  test: uint8ArrayToBinary(hexToUint8Array('0x'+F_BN128.toString(16)))
});
function chunkUint8Array(input: Uint8Array ): bigint[] {
  const chunks: bigint[] = [];
  for (let i = 0; i < input.length; i += MaxUint8ArrayLength) {
    const chunk = input.slice(i, i + MaxUint8ArrayLength);
    chunks.push(FF.utils.leBuff2int(chunk));
  }
  return chunks;
}

// function uint8ArrayToBigint(input: Uint8Array): bigint {
//     return 
// }

function bigintToUint8Array(r: bigint): Uint8Array {
  const hex = r.toString(16);
  const buf = Buffer.from(hex, 'hex');
  return new Uint8Array(buf);
}

function uint8ArrayToBinary(input: Uint8Array) {
  return Array.from(input).map(x => x.toString(2).padStart(8, '0')).join('');
}

