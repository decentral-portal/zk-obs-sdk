/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { BigNumber, utils } from 'ethers';
import { describe } from 'mocha';
import { sign } from '@noble/secp256k1';

const privkeys: Array<bigint> = [88549154299169935420064281163296845505587953610183896504176354567359434168161n,
  //    37706893564732085918706190942542566344879680306879183356840008504374628845468n,
  //    90388020393783788847120091912026443124559466591761394939671630294477859800601n,
  //    110977009687373213104962226057480551605828725303063265716157300460694423838923n
];


describe('ECDSAVerify', function () {
  this.timeout(1000 * 1000);

  // privkey, msghash, pub0, pub1
  const test_cases: Array<[bigint, bigint, bigint, bigint]> = [];

  for (let idx = 0; idx < privkeys.length; idx++) {
    // var pubkey: Point = Point.fromPrivateKey(privkeys[idx]);
    const message = utils.hashMessage('hello');
    console.log({message});
    // test_cases.push([privkeys[idx], msghash_bigint, pubkey.x, pubkey.y]);
  }

  let circuit: any;
  before(async function () {
    // circuit = await circuitTest.setup('ecdsa_verify');
  });

  const test_ecdsa_verify = function (test_case: [bigint, bigint, bigint, bigint]) {
    const privkey = test_case[0];
    const msghash_bigint = test_case[1];
    const pub0 = test_case[2];
    const pub1 = test_case[3];

    const msghash: Uint8Array = bigint_to_Uint8Array(msghash_bigint);

    it('Testing correct sig: privkey: ' + privkey + ' msghash: ' + msghash_bigint + ' pub0: ' + pub0 + ' pub1: ' + pub1, async function() {
      const startTime = new Date().getTime();
      const sig: Uint8Array = await sign(msghash, bigint_to_Uint8Array(privkey), {canonical: true, der: false});
      // in compact format: r (big-endian), 32-bytes + s (big-endian), 32-bytes
      const r: Uint8Array = sig.slice(0, 32);
      const r_bigint: bigint = Uint8Array_to_bigint(r);
      const s: Uint8Array = sig.slice(32, 64);
      const s_bigint:bigint = Uint8Array_to_bigint(s);
      console.log({
        sig: BigNumber.from(Uint8Array_to_bigint(sig)).toHexString(), r, s
      });

      const r_array: bigint[] = bigint_to_array(64, 4, r_bigint);
      const s_array: bigint[] = bigint_to_array(64, 4, s_bigint);
      const msghash_array: bigint[] = bigint_to_array(64, 4, msghash_bigint);
      const pub0_array: bigint[] = bigint_to_array(64, 4, pub0);
      const pub1_array: bigint[] = bigint_to_array(64, 4, pub1);
      const res = 1n;
      const input = {
        'r': r_array,
        's': s_array,
        'msghash': msghash_array,
        'pubkey': [pub0_array, pub1_array]
      };
      console.log({
        input
      });

      const witness = await circuit.calculateWitness();
      expect(witness[1]).to.equal(res);
      await circuit.checkConstraints(witness);
      console.log(`end time: ${new Date().getTime() - startTime} ms`);

    });

    it('Testing incorrect sig: privkey: ' + privkey + ' msghash: ' + msghash_bigint + ' pub0: ' + pub0 + ' pub1: ' + pub1, async function() {
      // in compact format: r (big-endian), 32-bytes + s (big-endian), 32-bytes
      const sig: Uint8Array = await sign(msghash, bigint_to_Uint8Array(privkey), {canonical: true, der: false});
      const r: Uint8Array = sig.slice(0, 32);
      const r_bigint: bigint = Uint8Array_to_bigint(r);
      const s: Uint8Array = sig.slice(32, 64);
      const s_bigint:bigint = Uint8Array_to_bigint(s);

      const r_array: bigint[] = bigint_to_array(64, 4, r_bigint + 1n);
      const s_array: bigint[] = bigint_to_array(64, 4, s_bigint);
      const msghash_array: bigint[] = bigint_to_array(64, 4, msghash_bigint);
      const pub0_array: bigint[] = bigint_to_array(64, 4, pub0);
      const pub1_array: bigint[] = bigint_to_array(64, 4, pub1);
      const res = 0n;

      const witness = await circuit.calculateWitness({'r': r_array,
        's': s_array,
        'msghash': msghash_array,
        'pubkey': [pub0_array, pub1_array]});
      expect(witness[1]).to.equal(res);
      await circuit.checkConstraints(witness);
    });
  };
  test_cases.forEach(test_ecdsa_verify);
});


// describe("PubkeyToEthAddr", function() {
//   before(async function () {
//     circuit = await circuitTest.setup('ecdsa_verify');
//   });
// })



function padToEven (value: any) {
  if (typeof value !== 'string') {
    throw new Error(`while padding to even, value must be string, is currently ${typeof value}, while padToEven.`);
  }
  
  if (value.length % 2) {
    value = `0${value}`;
  }
  
  return value;
}


function stripHexPrefix (value: any) {
  if (typeof value !== 'string') {
    return value;
  }
  
  return isHexPrefixed(value) ? value.slice(2) : value;
}
  
function isHexPrefixed (value: any) {
  if (typeof value !== 'string') {
    throw new Error('value must be type \'string\', is currently type ' + (typeof value) + ', while checking isHexPrefixed.');
  }
  
  return value.slice(0, 2) === '0x';
}


function intToBuffer (i: number) {
  const hex = intToHex(i);
  return Buffer.from(padToEven(hex.slice(2)), 'hex');
}


function intToHex (i: number) {
  const hex = i.toString(16);
  return `0x${hex}`;
}



function bigint_to_array(n: number, k: number, x: bigint) {
  let mod = 1n;
  for (let idx = 0; idx < n; idx++) {
    mod = mod * 2n;
  }

  const ret: bigint[] = [];
  let x_temp: bigint = x;
  for (let idx = 0; idx < k; idx++) {
    ret.push(x_temp % mod);
    x_temp = x_temp / mod;
  }
  return ret;
}

// converts x = sum of a[i] * 2 ** (small_stride * i) for 0 <= 2 ** small_stride - 1
//      to:     sum of a[i] * 2 ** (stride * i)



// bigendian
function bigint_to_Uint8Array(x: bigint) {
  const ret: Uint8Array = new Uint8Array(32);
  for (let idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}

// bigendian
function Uint8Array_to_bigint(x: Uint8Array) {
  let ret = 0n;
  for (let idx = 0; idx < x.length; idx++) {
    ret = ret * 256n;
    ret = ret + BigInt(x[idx]);
  }
  return ret;
}
