import { Wallet, utils } from 'ethers';
const circomlibjs = require('circomlibjs');
import { bigint_to_Uint8Array, bufferToBigInt, objectToHexString, stringToUint8Array } from '../lib/helper';
const privateKey = utils.randomBytes(32); // ETH private key
const wallet = new Wallet(privateKey);

register();
// transfer();

async function authenticate() {
  const typedData = {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Authenticate on Term Structure',
    },
  };

  // L1 signature for tsKeyPair
  const signature = await wallet._signTypedData(
    typedData.domain,
    typedData.types,
    typedData.value
  );

  const eddsa = await circomlibjs.buildEddsa();
  const tsPrivKey = utils.keccak256(signature);
  console.log('tsPrivKey', tsPrivKey);
  const tsPrivKeyBuf = Buffer.from(tsPrivKey.replace('0x', ''), 'hex');
  const tsPubKeyUint8Array = eddsa.prv2pub(tsPrivKeyBuf);
  const tsPubKey = tsPubKeyUint8Array.map((x: Uint8Array) => eddsa.babyJub.F.toObject(x).toString());
  console.log('tsPubKey', tsPubKey);

  return { eddsa, tsPrivKey, tsPubKey };
}

async function register() {
  const { eddsa, tsPrivKey, tsPubKey } = await authenticate();

  const txInfo = {
    exp: 'exp',
  };

  // msg format
  // TODO: encode txInfo
  const msg = objectToHexString(txInfo);
  const msgBigInt = BigInt(msg);
  const F = eddsa.babyJub.F;
  const msgBuf = F.e(msgBigInt);

  // sign msg for circom verify
  const tsPrivKeyBuf = Buffer.from(tsPrivKey, 'hex');
  const tsPubKeyUint8Array = tsPubKey.map((x: string) => eddsa.babyJub.F.e(BigInt(x)));
  const tsSig = eddsa.signPoseidon(tsPrivKeyBuf, msgBuf);
  const isSign = eddsa.verifyPoseidon(msgBuf, tsSig, tsPubKeyUint8Array);
  console.log('isSign', isSign);
}

async function transfer() {
  const { eddsa, tsPrivKey, tsPubKey } = await authenticate();

  // example tx
  const txInfo = {
    L2AddrFrom: '0x0000000000000000000000000000000000000000',
    L2AddrTo: '0x0000000000000000000000000000000000000000',
    L2TokenId: '0',
    amount: '0',
    nonce: '0',
  };

  // msg format
  // TODO: encode txInfo
  const msg = objectToHexString(txInfo);
  const msgBigInt = BigInt(msg);
  const F = eddsa.babyJub.F;
  const msgBuf = F.e(msgBigInt);

  // eddsa sign msg for circom verify
  const tsPrivKeyBuf = Buffer.from(tsPrivKey, 'hex');
  const tsPubKeyUint8Array = tsPubKey.map((x: string) => eddsa.babyJub.F.e(BigInt(x)));
  const tsSig = eddsa.signPoseidon(tsPrivKeyBuf, msgBuf);
  const isSign = eddsa.verifyPoseidon(msgBuf, tsSig, tsPubKeyUint8Array);
  console.log('isSign', isSign);

  // ecdsa sign msg for backend verify
  // example typedData
  const typedData = {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'L2AddrFrom', type: 'string' },
        { name: 'L2AddrTo', type: 'string' },
        { name: 'L2TokenId', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'nonce', type: 'string' },
      ],
    },
    value: txInfo
  };

  // L1 signature for tsKeyPair
  const signature = await wallet._signTypedData(
    typedData.domain,
    typedData.types,
    typedData.value
  );
  console.log('signature', signature);
}