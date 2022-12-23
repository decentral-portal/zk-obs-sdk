// author @rayhuang
import {sign, Point} from '@noble/secp256k1';
import {resolve} from 'path';
import fs from 'fs';
import {poseidon} from '@big-whale-labs/poseidon';
import {
  privateKeyToAddress,
  bigint_to_hex,
  hexToDec,
  bigint_to_tuple,
  privKeyStringToBigInt,
  Uint8Array_to_bigint
} from '../lib/helper';
import {TsMerkleTree} from '../lib/merkle-tree-dp';
import {MiMC7_91} from '../lib/mimc-hash-dp';
import {BigNumber, BytesLike} from 'ethers';
import { dpPoseidonHash } from '../lib/poseidon-hash-dp';

const MINT_ACCOUNT_PRIV = '0x0681dbf5798741016f88482f601e223de4237da0c80c743d908eb59772780afd';
const BURN_ACCOUNT_ADDR = '0x00';

const ACCOUNT_DEPTH = 24; // bits
const num = 4;
const ACCOUNT_START_INDEX = 2;
// const hashFunc: (val: BytesLike | BytesLike[]) => string = poseidonHash;
const hashFunc: (val: BytesLike | BytesLike[]) => string = dpMimc;

const outputPath = hashFunc === poseidonHash
  ? '../circuits/signup_poseidon_circuit.json'
  : '../circuits/signup_circuit.json';

const signup_id: string[] = new Array(num);
const signup_addr: string[] = new Array(num);
const signup_acc_root_flow: string[] = new Array(num + 1);
const signup_proof: string[][] = new Array(num);
const signup_r: string[][] = new Array(num);
const signup_s: string[][] = new Array(num);
const signup_sig_pubkey: string[][][] = new Array(num);
const mintAddr = privateKeyToAddress(MINT_ACCOUNT_PRIV);
const initLeafs: string[] = [mintAddr, BURN_ACCOUNT_ADDR];

const MIMC_HASH = new MiMC7_91();

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
async function main() {
  console.time('genSignupData');
  const initAccLeafs = toAccountLeafs(initLeafs);
  const mkTree = new TsMerkleTree(initAccLeafs, ACCOUNT_DEPTH, hashFunc);

  signup_acc_root_flow[0] = hexToDec(mkTree.getRoot());

  for (let i = 0; i < num; i++) {
    signup_id[i] = i === 0
      ? BigNumber
        .from(i + ACCOUNT_START_INDEX)
        .toString()
      : '0';
    const privateKey = i === 0
      ? '0xef9c1cfb8bc3ab95ab61b66602f5a160f20975c26b290c4a54552de0ee8acdc5'
      : MINT_ACCOUNT_PRIV; //genEthereumPrivateKey();
    // console.log("privateKey: ", privateKey);
    const address = privateKeyToAddress(privateKey);
    // console.log("address: ", address);
    const addressDecimal = hexToDec(address);
    // console.log('addressDecimal: ', addressDecimal);
    signup_addr[i] = addressDecimal;
    if (i === 0) {
      mkTree.updateLeafNode(i + 2, toAccountLeaf(address));
      signup_acc_root_flow[i + 1] = hexToDec(mkTree.getRoot());
      const proof = mkTree.getProof(i + 2);
      signup_proof[i] = proof.map((x) => hexToDec(x));
    } else {
      signup_acc_root_flow[i + 1] = hexToDec(mkTree.getRoot());
      const proof = mkTree.getProof(0);
      signup_proof[i] = proof.map((x) => hexToDec(x));
    }

    const pubkey: Point = Point.fromPrivateKey(
      BigInt(BigNumber.from(privateKey).toString())
    );
    signup_sig_pubkey[i] = [
      bigint_to_tuple(pubkey.x).map((x) => x.toString()),
      bigint_to_tuple(pubkey.y).map((x) => x.toString())
    ];

    // const msgHex = stringToUint8Array('signup');
    const msgHex = '7369676E7570';
    const privKeyBigInt = privKeyStringToBigInt(privateKey);
    const signature: Uint8Array = await sign(msgHex, privKeyBigInt, {
      canonical: true,
      der: false
    });
    const r: Uint8Array = signature.slice(0, 32);
    const r_bigint: bigint = Uint8Array_to_bigint(r);
    const r_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(r_bigint);
    signup_r[i] = r_tuple
      .toString()
      .split(',');
    const s: Uint8Array = signature.slice(32, 64);
    const s_bigint: bigint = Uint8Array_to_bigint(s);
    const s_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(s_bigint);
    signup_s[i] = s_tuple
      .toString()
      .split(',');

  }
  console.timeEnd('genSignupData');

  outputJsonfile();
}

function outputJsonfile() {
  const obj = {
    signup_id: signup_id,
    signup_addr: signup_addr,
    signup_acc_root_flow: signup_acc_root_flow,
    signup_proof: signup_proof,
    signup_sig_r: signup_r,
    signup_sig_s: signup_s,
    signup_sig_pubkey: signup_sig_pubkey
  };
  const json = JSON.stringify(obj, null, 4);
  fs.writeFileSync(resolve(__dirname, outputPath), json);
}

function toAccountLeaf(addr : string): string {
  return hashFunc([addr, '0', '0']);
}

function toAccountLeafs(addrList : string[]): string[] {
  return addrList.map(x => toAccountLeaf(x));
}

function poseidonHash(val : BytesLike | BytesLike[]): string {
  if (val instanceof Array) {
    const inputs = val.map((v : any) => BigInt(v));
    return bigint_to_hex(dpPoseidonHash(inputs, false));
  }
  return  bigint_to_hex(dpPoseidonHash([BigInt(val.toString())], false));
}

function dpMimc(val: BytesLike[] | BytesLike): string {
  if (val instanceof Array) {
    return bigint_to_hex(MIMC_HASH.multiHash(val.map((v : any) => BigInt(v))));
  }
  return bigint_to_hex(MIMC_HASH.hash(BigInt(val.toString())));
}
