import { BigNumber, utils } from 'ethers';
const LEAF_NUMBERS = 1000000;
import { MerkleTree, createHash } from '@guildofweavers/merkle';

(async function main() {
  const start = Date.now();
  const datas: Buffer[] = [];
  for (let index = 0; index < LEAF_NUMBERS; index++) {
    const hexStr = utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'uint256'],
      [generateRandomEthAddress(), generateRandomNumber(5), generateRandomNumber(10)]);
    const data = hexStringToBuffer(hexStr);
    datas.push(data);
  }
  const hash = createHash('sha256');
  const tree = MerkleTree.create(datas, hash);

  console.log('Merkle tree root:', uint8ArrayToHexString(tree.root));
  console.log(`LeafNumbers=${LEAF_NUMBERS}, Time=${Date.now() - start}ms`);

})().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});

function keccak256ToBytes(data: Uint8Array) {
  return utils.arrayify(utils.keccak256(data));
}

function hexStringToUint8Array(hexString: string) {
  return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

function hexStringToBuffer(hexString: string) {
  return Buffer.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

function generateRandomNumber(len: number) {
  const number = uint8ArrayToHexString(utils.randomBytes(len));
  return number;
}

function generateRandomEthAddress() {
  const address = uint8ArrayToHexString(utils.randomBytes(20));
  return address;
}

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return '0x' + Array.from(uint8Array).map(x => x.toString(16).padStart(2, '0')).join('');
}