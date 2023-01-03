"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigint_to_chunk_array = exports.toBigIntChunkArray = exports.padAndToBuffer = exports.toHexString = exports.encodeTxMarketEndMessage = exports.encodeTxMarketExchangeMessage = exports.encodeTxMarketOrderMessage = exports.encodeTxLimitEndMessage = exports.encodeTxLimitExchangeMessage = exports.encodeTxLimitStartMessage = exports.encodeTxLimitOrderMessage = exports.encodeTxWithdrawMessage = exports.encodeTxDepositMessage = exports.encodeTxRegisterMessage = void 0;
const ts_types_1 = require("../ts-types/ts-types");
function encodeTxRegisterMessage(txRegisterReq) {
    return [
        BigInt(ts_types_1.TsTxType.REGISTER),
        0n,
        BigInt(txRegisterReq.tokenId),
        BigInt(txRegisterReq.stateAmt),
        0n,
        BigInt(txRegisterReq.sender),
        BigInt(txRegisterReq.tsAddr),
        0n, 0n, 0n,
    ];
}
exports.encodeTxRegisterMessage = encodeTxRegisterMessage;
function encodeTxDepositMessage(txDepositReq) {
    return [
        BigInt(ts_types_1.TsTxType.DEPOSIT),
        0n,
        BigInt(txDepositReq.tokenId),
        BigInt(txDepositReq.stateAmt),
        BigInt(txDepositReq.nonce),
        BigInt(txDepositReq.sender),
        0n, 0n, 0n, 0n,
    ];
}
exports.encodeTxDepositMessage = encodeTxDepositMessage;
function encodeTxWithdrawMessage(txWithdrawReq) {
    return [
        BigInt(ts_types_1.TsTxType.WITHDRAW),
        BigInt(txWithdrawReq.sender),
        BigInt(txWithdrawReq.tokenId),
        BigInt(txWithdrawReq.stateAmt),
        BigInt(txWithdrawReq.nonce),
        0n, 0n, 0n, 0n, 0n,
    ];
}
exports.encodeTxWithdrawMessage = encodeTxWithdrawMessage;
function encodeTxLimitOrderMessage(txLimitOrderReq) {
    return [
        BigInt(ts_types_1.TsTxType.LIMIT_ORDER),
        BigInt(txLimitOrderReq.sender),
        BigInt(txLimitOrderReq.sellTokenId),
        BigInt(txLimitOrderReq.sellAmt),
        BigInt(txLimitOrderReq.nonce),
        0n, 0n,
        BigInt(txLimitOrderReq.buyTokenId),
        BigInt(txLimitOrderReq.buyAmt),
        0n,
    ];
}
exports.encodeTxLimitOrderMessage = encodeTxLimitOrderMessage;
function encodeTxLimitStartMessage(txLimitStartReq) {
    return [
        BigInt(ts_types_1.TsTxType.LIMIT_START),
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
        BigInt(txLimitStartReq.orderLeafId),
    ];
}
exports.encodeTxLimitStartMessage = encodeTxLimitStartMessage;
function encodeTxLimitExchangeMessage(txLimitExchangeReq) {
    return [
        BigInt(ts_types_1.TsTxType.LIMIT_EXCHANGE),
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
        BigInt(txLimitExchangeReq.orderLeafId),
    ];
}
exports.encodeTxLimitExchangeMessage = encodeTxLimitExchangeMessage;
function encodeTxLimitEndMessage(txLimitEndReq) {
    return [
        BigInt(ts_types_1.TsTxType.LIMIT_END),
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
        BigInt(txLimitEndReq.orderLeafId),
    ];
}
exports.encodeTxLimitEndMessage = encodeTxLimitEndMessage;
function encodeTxMarketOrderMessage(txMarketOrderReq) {
    return [
        BigInt(ts_types_1.TsTxType.MARKET_ORDER),
        BigInt(txMarketOrderReq.sender),
        BigInt(txMarketOrderReq.sellTokenId),
        BigInt(txMarketOrderReq.sellAmt),
        BigInt(txMarketOrderReq.nonce),
        0n, 0n,
        BigInt(txMarketOrderReq.buyTokenId),
        0n, 0n,
    ];
}
exports.encodeTxMarketOrderMessage = encodeTxMarketOrderMessage;
function encodeTxMarketExchangeMessage(txMarketExchangeReq) {
    return [
        BigInt(ts_types_1.TsTxType.MARKET_EXCHANGE),
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
        BigInt(txMarketExchangeReq.orderLeafId),
    ];
}
exports.encodeTxMarketExchangeMessage = encodeTxMarketExchangeMessage;
function encodeTxMarketEndMessage(txMarketEndReq) {
    return [
        BigInt(ts_types_1.TsTxType.MARKET_END),
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
        BigInt(txMarketEndReq.orderLeafId),
    ];
}
exports.encodeTxMarketEndMessage = encodeTxMarketEndMessage;
function padHexByBytes(hex, bytes) {
    // hex = hex.slice(2);
    if (hex.length % 2 !== 0)
        throw new Error('hex should be even length');
    if (hex.length / 2 > bytes)
        throw new Error('hex should be less than bytes');
    const padding = '0'.repeat(bytes * 2 - hex.length);
    return padding + hex;
}
function toHexString(value) {
    if (typeof value === 'string') {
        if (/^0x/.test(value))
            return value;
        return BigInt(value).toString(16);
    }
    if (typeof value === 'number') {
        return value.toString(16);
    }
    if (typeof value === 'bigint') {
        return value.toString(16);
    }
    if (value instanceof Buffer) {
        return value.toString('hex');
    }
    if (value instanceof Uint8Array) {
        return Buffer.from(value).toString('hex');
    }
    throw new Error('value should be string, number, bigint, Buffer or Uint8Array');
}
exports.toHexString = toHexString;
function padAndToBuffer(value, bytes) {
    const hexString = toHexString(value);
    const buffer = Buffer.from(/^0x/.test(hexString) ? hexString.slice(2) : hexString, 'hex');
    return Buffer.concat([buffer], bytes);
}
exports.padAndToBuffer = padAndToBuffer;
function toBigIntChunkArray(data, chunkBytesSize) {
    const result = [];
    const uint8arr = new Uint8Array(data);
    for (let i = 0; i < uint8arr.length; i += chunkBytesSize) {
        const chunk = uint8arr.slice(i, i + chunkBytesSize);
        result.push(BigInt('0x' + Buffer.from(chunk).toString('hex')));
    }
    return result;
}
exports.toBigIntChunkArray = toBigIntChunkArray;
function bigint_to_chunk_array(x, chunkBits) {
    const mod = 2n ** BigInt(chunkBits);
    const ret = [];
    let x_temp = x;
    while (x_temp > 0n) {
        ret.push(x_temp % mod);
        x_temp = x_temp >> chunkBits;
    }
    return ret;
}
exports.bigint_to_chunk_array = bigint_to_chunk_array;
// 12345 6789abcdef
// => [6789abcdef, 12345]
