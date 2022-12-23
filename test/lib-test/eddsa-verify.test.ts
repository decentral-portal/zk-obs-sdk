import { assert } from 'chai';
import { Wallet, utils } from 'ethers';
import { stringToUint8Array, uint8ArrayToHexString } from '../../lib/helper';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const circomlibjs = require('circomlibjs');

describe('EdDSAVerify', async function () {
  const privateKey = utils.randomBytes(32);
  const wallet = new Wallet(privateKey);
  const typeData = {
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
      Action: 'Register on Term Structure',
    },
  };

  // L1 signature for tsKeyPair
  const signature = await wallet._signTypedData(
    typeData.domain,
    typeData.types,
    typeData.value
  );

  const eddsa = await circomlibjs.buildEddsa();
  // const tsPrivKey = utils.keccak256(signature);
  const tsPrivKeyBuffer = Buffer.from(utils.keccak256(signature), 'hex');
  const tsPubKey = eddsa.prv2pub(tsPrivKeyBuffer);

  // msg format
  const msg = 'Register on Term Structure';
  const msgUint8Array = stringToUint8Array(msg);
  const msgString = uint8ArrayToHexString(msgUint8Array);
  const msgBigInt = BigInt(msgString);
  const F = eddsa.babyJub.F;
  const msgBuf = F.e(msgBigInt);

  // sign msg for circom verify
  const tsSig = eddsa.signPoseidon(tsPrivKeyBuffer, msgBuf);
  const isSign = eddsa.verifyPoseidon(msgBuf, tsSig, tsPubKey);
  console.log('isSign', isSign);
  assert(eddsa.verifyPoseidon(msgBuf, tsSig, tsPubKey));
});