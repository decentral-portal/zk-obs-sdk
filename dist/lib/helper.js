"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToBigInt = exports.tsPubKeyTypeConverter = exports.eddsaSigTypeConverter = exports.uint8ArrayToHexString = exports.bigintToHexString = exports.bigintToUint8Array = exports.uint8ArrayToBigint = exports.recursiveToString = exports.hexToBuffer = exports.uint8ArrayToBuffer = exports.objectToHexString = exports.bigint_to_hex = exports.bigint_to_tuple = exports.hexToUint8Array = exports.bufferIsEmpty = exports.bufferToDec = exports.privKeyStringToBigInt = exports.Uint8Array_to_bigint = exports.bigint_to_Uint8Array = exports.stringToUint8Array = exports.genEthereumPrivateKey = exports.privateKeyToAddress = exports.hexToDec = void 0;
const ethers_1 = require("ethers");
const eddsa_1 = require("./eddsa");
const NumberOfBits = 256;
const hexToDec = (hex) => {
    return ethers_1.BigNumber.from(hex).toString();
};
exports.hexToDec = hexToDec;
const privateKeyToAddress = (_privateKey) => {
    const address = ethers_1.utils.computeAddress(_privateKey);
    return address;
};
exports.privateKeyToAddress = privateKeyToAddress;
function genEthereumPrivateKey() {
    const privateKey = uint8ArrayToHexString(ethers_1.utils.randomBytes(32));
    return privateKey;
}
exports.genEthereumPrivateKey = genEthereumPrivateKey;
function stringToUint8Array(str) {
    const ret = new Uint8Array(str.length);
    for (let idx = 0; idx < str.length; idx++) {
        ret[idx] = str.charCodeAt(idx);
    }
    return ret;
}
exports.stringToUint8Array = stringToUint8Array;
function bigint_to_Uint8Array(x) {
    const ret = new Uint8Array(32);
    for (let idx = 31; idx >= 0; idx--) {
        ret[idx] = Number(x % 256n);
        x = x / 256n;
    }
    return ret;
}
exports.bigint_to_Uint8Array = bigint_to_Uint8Array;
function Uint8Array_to_bigint(x) {
    let ret = 0n;
    for (let idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}
exports.Uint8Array_to_bigint = Uint8Array_to_bigint;
function privKeyStringToBigInt(privKeyHex) {
    const privKeyBytes = ethers_1.utils.arrayify(privKeyHex);
    const privKeyNum = Uint8Array_to_bigint(privKeyBytes);
    return privKeyNum;
}
exports.privKeyStringToBigInt = privKeyStringToBigInt;
function bufferToDec(buffer) {
    const hex = bufferIsEmpty(buffer) ? '0x0' : '0x' + buffer.toString('hex');
    return ethers_1.BigNumber.from(hex).toString();
}
exports.bufferToDec = bufferToDec;
function bufferIsEmpty(buffer) {
    return buffer.length === 0;
}
exports.bufferIsEmpty = bufferIsEmpty;
function hexToUint8Array(hex) {
    return ethers_1.utils.arrayify(hex);
}
exports.hexToUint8Array = hexToUint8Array;
function bigint_to_tuple(x) {
    const mod = 2n ** 64n;
    const ret = [0n, 0n, 0n, 0n];
    let x_temp = x;
    for (let idx = 0; idx < ret.length; idx++) {
        ret[idx] = x_temp % mod;
        x_temp = x_temp / mod;
    }
    return ret;
}
exports.bigint_to_tuple = bigint_to_tuple;
function bigint_to_hex(x) {
    return '0x' + x.toString(16);
}
exports.bigint_to_hex = bigint_to_hex;
function objectToHexString(obj) {
    const hex = ethers_1.utils.hexlify(ethers_1.utils.toUtf8Bytes(JSON.stringify(obj)));
    return hex;
}
exports.objectToHexString = objectToHexString;
function uint8ArrayToBuffer(acc1PrivateKey) {
    return Buffer.from(acc1PrivateKey);
}
exports.uint8ArrayToBuffer = uint8ArrayToBuffer;
function hexToBuffer(L2MintAccountPriv) {
    L2MintAccountPriv = L2MintAccountPriv.replace('0x', '');
    return Buffer.from(L2MintAccountPriv, 'hex');
}
exports.hexToBuffer = hexToBuffer;
function recursiveToString(data) {
    if (data instanceof Array) {
        return data.map(t => recursiveToString(t));
    }
    if (typeof data === 'bigint') {
        return data.toString(10);
        // return bigintToDecString(data);
    }
    if (typeof data === 'string') {
        if (/[0-9A-Fa-f]{6}/g.test(data) || /^0x/g.test(data)) {
            return (0, exports.hexToDec)(data);
        }
        return data;
    }
    return data.toString();
}
exports.recursiveToString = recursiveToString;
function uint8ArrayToBigint(uint8Array, numberOfBits = NumberOfBits) {
    return BigInt('0x' + Buffer.from(uint8Array).toString('hex'));
}
exports.uint8ArrayToBigint = uint8ArrayToBigint;
function bigintToUint8Array(value, numberOfBits = NumberOfBits) {
    if (numberOfBits % 8)
        throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
    const valueAsHexString = bigintToHexString(value, numberOfBits);
    return hexStringToUint8Array(valueAsHexString);
}
exports.bigintToUint8Array = bigintToUint8Array;
function bigintToHexString(value, numberOfBits = NumberOfBits) {
    if (numberOfBits % 8)
        throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
    const valueToSerialize = twosComplement(value, numberOfBits);
    return unsignedBigintToHexString(valueToSerialize, numberOfBits);
}
exports.bigintToHexString = bigintToHexString;
function validateAndNormalizeHexString(hex) {
    const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
    if (match === null)
        throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
    if (match.length % 2)
        throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
    return `0x${match[1]}`;
}
function uint8ArrayToHexString(array) {
    const hexStringFromByte = (byte) => ('00' + byte.toString(16)).slice(-2);
    const appendByteToString = (value, byte) => value + hexStringFromByte(byte);
    return array.reduce(appendByteToString, '');
}
exports.uint8ArrayToHexString = uint8ArrayToHexString;
function hexStringToUint8Array(hex) {
    const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
    if (match === null)
        throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
    if (match.length % 2)
        throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
    const normalized = match[1];
    const byteLength = normalized.length / 2;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; ++i) {
        bytes[i] = (Number.parseInt(`${normalized[i * 2]}${normalized[i * 2 + 1]}`, 16));
    }
    return bytes;
}
function unsignedBigintToHexString(value, bits) {
    const byteSize = bits / 8;
    const hexStringLength = byteSize * 2;
    return ('0'.repeat(hexStringLength) + value.toString(16)).slice(-hexStringLength);
}
function twosComplement(value, numberOfBits = NumberOfBits) {
    const mask = 2n ** (BigInt(numberOfBits) - 1n) - 1n;
    return (value & mask) - (value & ~mask);
}
const eddsaSigTypeConverter = (sig) => {
    return {
        R8: [eddsa_1.EddsaSigner.toObject(sig.R8[0]).toString(), eddsa_1.EddsaSigner.toObject(sig.R8[1]).toString()],
        S: sig.S.toString(),
    };
};
exports.eddsaSigTypeConverter = eddsaSigTypeConverter;
const tsPubKeyTypeConverter = (tsPubKey) => {
    return [eddsa_1.EddsaSigner.toE(tsPubKey[0]), eddsa_1.EddsaSigner.toE(tsPubKey[1])];
};
exports.tsPubKeyTypeConverter = tsPubKeyTypeConverter;
exports.default = {
    hexToDec: exports.hexToDec,
    genEthereumPrivateKey,
    privateKeyToAddress: exports.privateKeyToAddress,
    uint8ArrayToHexString,
    stringToUint8Array,
    bigint_to_Uint8Array,
    Uint8Array_to_bigint,
    privKeyStringToBigInt,
    bufferToDec,
    bufferIsEmpty,
    hexToUint8Array,
    bigint_to_tuple,
    bigint_to_hex,
    objectToHexString,
    uint8ArrayToBuffer,
    hexToBuffer,
    uint8ArrayToBigint,
    recursiveToString,
    eddsaSigTypeConverter: exports.eddsaSigTypeConverter,
};
function bufferToBigInt(buffer) {
    return BigInt('0x' + buffer.toString('hex'));
}
exports.bufferToBigInt = bufferToBigInt;
