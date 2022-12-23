import { messagePrefix } from '@ethersproject/hash';
import { getPublicKey, sign, Point } from '@noble/secp256k1';
import { BigNumber, ethers, utils } from 'ethers';
import { Bytes, concat } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';

const MESSAGE = 'hello';
const msgArr = [
  toUtf8Bytes(messagePrefix),
  toUtf8Bytes(String(MESSAGE.length)),
  toUtf8Bytes(MESSAGE)
];
console.log(msgArr);
const msg_encode = concat(msgArr);
const msgHash = utils.hashMessage(MESSAGE);
const privkeys: Array<bigint> = [
  88549154299169935420064281163296845505587953610183896504176354567359434168161n,
];


async function main() {
  const inputs = [];
  for (let idx = 0; idx < privkeys.length; idx++) {
    const privkey = privkeys[idx];
    const pubkey: Point = Point.fromPrivateKey(privkey);
    const msgHashUint8Array = bigint_to_Uint8Array(126896544052592n);
    const signature: Uint8Array = await sign(msgHashUint8Array, bigint_to_Uint8Array(privkey), { canonical: true, der: false });
    const r: Uint8Array = signature.slice(0, 32);
    const r_bigint: bigint = Uint8Array_to_bigint(r);
    const s: Uint8Array = signature.slice(32, 64);
    const s_bigint: bigint = Uint8Array_to_bigint(s);
    const input = {
      MESSAGE,
      msg_encode,
      msg_encode_len: msg_encode.length,
      msgHash,
      msgHashUint8Array,
      privkey,
      pubkey,
      signature,
      // r,
      // s,
      r_bigint,
      s_bigint,
    };
    inputs.push(input);
  }
  console.log(JSON.stringify(inputs, (key, value) => {
    if (value instanceof Uint8Array) {
      const arr = [];
      for (let i = 0; i < value.length; i++) {
        arr.push(value[i]);
      }
      return arr;
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => { console.error(error); process.exit(1); });

function bigint_to_Uint8Array(x: bigint) {
  const ret: Uint8Array = new Uint8Array(32);
  for (let idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}
function Uint8Array_to_bigint(x: Uint8Array) {
  let ret = 0n;
  for (let idx = 0; idx < x.length; idx++) {
    ret = ret * 256n;
    ret = ret + BigInt(x[idx]);
  }
  return ret;
}
