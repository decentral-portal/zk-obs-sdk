"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigint_to_chunk_array = exports.toBigIntChunkArray = exports.padAndToBuffer = exports.toHexString = exports.encodeRChunkBuffer = exports.getEmptyMainTx = exports.getEmptyRegisterTx = exports.encodeTxAuctionCancelMessage = exports.encodeTxAuctionBorrowMessage = exports.encodeTxAuctionLendMessage = exports.encodeTxWithdrawMessage = exports.encodeTxTransferMessage = exports.encodeTxDepositMessage = void 0;
const ethers_1 = require("ethers");
const ts_types_1 = require("../ts-types/ts-types");
function encodeTxDepositMessage(txDepositReq) {
    return [
        BigInt(ts_types_1.TsTxType.DEPOSIT),
        BigInt(txDepositReq.L2AddrTo),
        BigInt(txDepositReq.L2TokenAddr),
        BigInt(txDepositReq.amount),
        0n,
        0n, 0n, 0n, 0n, 0n,
    ];
}
exports.encodeTxDepositMessage = encodeTxDepositMessage;
function encodeTxTransferMessage(txTransferReq) {
    return [
        BigInt(ts_types_1.TsTxType.TRANSFER),
        BigInt(txTransferReq.L2AddrFrom),
        BigInt(txTransferReq.L2TokenAddr),
        BigInt(txTransferReq.txAmount || 0),
        BigInt(txTransferReq.nonce),
        BigInt(txTransferReq.L2AddrTo),
        0n, 0n, 0n, 0n,
    ];
}
exports.encodeTxTransferMessage = encodeTxTransferMessage;
function encodeTxWithdrawMessage(txTransferReq) {
    return [
        BigInt(ts_types_1.TsTxType.WITHDRAW),
        BigInt(txTransferReq.L2AddrFrom),
        BigInt(txTransferReq.L2TokenAddr),
        BigInt(txTransferReq.amount),
        BigInt(txTransferReq.nonce),
        0n, 0n, 0n, 0n, 0n,
    ];
}
exports.encodeTxWithdrawMessage = encodeTxWithdrawMessage;
function encodeTxAuctionLendMessage(txAuctionLendReq) {
    return [
        BigInt(ts_types_1.TsTxType.AUCTION_LEND),
        BigInt(txAuctionLendReq.L2AddrFrom),
        BigInt(txAuctionLendReq.L2TokenAddrLending),
        BigInt(txAuctionLendReq.lendingAmt),
        BigInt(txAuctionLendReq.nonce),
        BigInt(txAuctionLendReq.maturityDate),
        BigInt(txAuctionLendReq.expiredTime),
        BigInt(txAuctionLendReq.interest),
        0n, 0n,
        // txId,
    ];
}
exports.encodeTxAuctionLendMessage = encodeTxAuctionLendMessage;
function encodeTxAuctionBorrowMessage(txAuctionBorrowReq) {
    return [
        BigInt(ts_types_1.TsTxType.AUCTION_BORROW),
        BigInt(txAuctionBorrowReq.L2AddrFrom),
        BigInt(txAuctionBorrowReq.L2TokenAddrCollateral),
        BigInt(txAuctionBorrowReq.collateralAmt),
        BigInt(txAuctionBorrowReq.nonce),
        BigInt(txAuctionBorrowReq.maturityDate),
        BigInt(txAuctionBorrowReq.expiredTime),
        BigInt(txAuctionBorrowReq.interest),
        BigInt(txAuctionBorrowReq.L2TokenAddrBorrowing),
        BigInt(txAuctionBorrowReq.borrowingAmt),
        // txId,
    ];
}
exports.encodeTxAuctionBorrowMessage = encodeTxAuctionBorrowMessage;
function encodeTxAuctionCancelMessage(txAuctionCancelReq) {
    return [
        BigInt(ts_types_1.TsTxType.AUCTION_CANCEL),
        BigInt(txAuctionCancelReq.L2AddrTo),
        BigInt(txAuctionCancelReq.L2TokenAddrRefunded),
        BigInt(txAuctionCancelReq.amount),
        BigInt(txAuctionCancelReq.nonce),
        BigInt(txAuctionCancelReq.orderLeafId),
        0n, 0n, 0n, 0n,
        // txId,
    ];
}
exports.encodeTxAuctionCancelMessage = encodeTxAuctionCancelMessage;
function getEmptyRegisterTx() {
    const req = {
        L1Addr: '0x00',
        reqType: ts_types_1.TsTxType.REGISTER,
        L2AddrFrom: ts_types_1.TsSystemAccountAddress.BURN_ADDR,
        L2TokenAddr: ts_types_1.TsTokenAddress.Unknown,
        tsPubKey: ['0', '0'],
        amount: '0',
    };
    return req;
}
exports.getEmptyRegisterTx = getEmptyRegisterTx;
function getEmptyMainTx() {
    const req = {
        reqType: ts_types_1.TsTxType.DEPOSIT,
        L2AddrFrom: ts_types_1.TsSystemAccountAddress.MINT_ADDR,
        L2AddrTo: ts_types_1.TsSystemAccountAddress.WITHDRAW_ADDR,
        L2TokenAddr: ts_types_1.TsTokenAddress.Unknown,
        amount: '0',
        nonce: '0',
        eddsaSig: {
            R8: ['0', '0'],
            S: '0'
        }
    };
    return req;
}
exports.getEmptyMainTx = getEmptyMainTx;
function encodeRChunkBuffer(txTransferReq) {
    if (!txTransferReq.L2TokenLeafIdFrom) {
        throw new Error('L2TokenLeafIdFrom is required');
    }
    switch (txTransferReq.reqType) {
        case ts_types_1.TsTxType.REGISTER:
            if (!txTransferReq.hashedTsPubKey) {
                throw new Error('hashedTsPubKey is required');
            }
            const out_r = ethers_1.ethers.utils.solidityPack(['uint8', 'uint32', 'uint16', 'uint16', 'uint128', 'uint160',], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.L2AddrTo),
                ethers_1.BigNumber.from(txTransferReq.L2TokenAddr),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
                ethers_1.BigNumber.from(txTransferReq.amount),
                ethers_1.BigNumber.from(txTransferReq.hashedTsPubKey),
            ]).replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: out_r,
                isCritical: true,
            };
        case ts_types_1.TsTxType.DEPOSIT:
            const out_d = ethers_1.ethers.utils.solidityPack(['uint8', 'uint32', 'uint16', 'uint16', 'uint128',], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.L2AddrTo),
                ethers_1.BigNumber.from(txTransferReq.L2TokenAddr),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
                ethers_1.BigNumber.from(txTransferReq.amount),
            ]).replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.from(out_d, 'hex'),
                isCritical: true,
            };
        case ts_types_1.TsTxType.WITHDRAW:
            const out_w = ethers_1.ethers.utils.solidityPack(['uint8', 'uint32', 'uint16', 'uint16', 'uint48', 'uint32', 'uint16',], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.L2AddrFrom),
                ethers_1.BigNumber.from(txTransferReq.L2TokenAddr),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
                ethers_1.BigNumber.from(txTransferReq.amount),
                ethers_1.BigNumber.from(txTransferReq.L2AddrTo),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdTo),
            ]).replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.from(out_w, 'hex'),
                isCritical: true,
            };
        case ts_types_1.TsTxType.FORCE_WITHDRAW:
            const out_fw = Buffer.concat([
                padAndToBuffer(txTransferReq.reqType, 1),
                padAndToBuffer(txTransferReq.L2AddrFrom, 4),
                padAndToBuffer(txTransferReq.L2TokenAddr, 2),
                padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2), padAndToBuffer(txTransferReq.amount, 16),
            ], ts_types_1.CHUNK_BYTES_SIZE * 5);
            return {
                r_chunks: Buffer.concat([out_fw], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: out_fw,
                isCritical: true,
            };
        case ts_types_1.TsTxType.TRANSFER:
            if (!txTransferReq.L2TokenLeafIdTo) {
                throw new Error('L2TokenLeafIdTo is required');
            }
            console.log({
                txTransferReq
            });
            console.log({
                raw: [
                    ethers_1.BigNumber.from(txTransferReq.reqType),
                    ethers_1.BigNumber.from(txTransferReq.L2AddrFrom),
                    ethers_1.BigNumber.from(txTransferReq.L2TokenAddr),
                    ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
                    ethers_1.BigNumber.from(txTransferReq.txAmount),
                    ethers_1.BigNumber.from(txTransferReq.L2AddrTo),
                    ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdTo),
                ]
            });
            const out_t = ethers_1.ethers.utils.solidityPack(['uint8', 'uint32', 'uint16', 'uint16', 'uint48', 'uint32', 'uint16',], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.L2AddrFrom),
                ethers_1.BigNumber.from(txTransferReq.L2TokenAddr),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
                ethers_1.BigNumber.from(txTransferReq.txAmount),
                ethers_1.BigNumber.from(txTransferReq.L2AddrTo),
                ethers_1.BigNumber.from(txTransferReq.L2TokenLeafIdTo),
            ]).replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_t, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.from(out_t, 'hex'),
                isCritical: true,
            };
        case ts_types_1.TsTxType.AUCTION_LEND:
            const out_al = Buffer.concat([
                padAndToBuffer(txTransferReq.reqType, 1),
                padAndToBuffer(txTransferReq.L2AddrFrom, 4),
                padAndToBuffer(txTransferReq.L2TokenAddr, 2),
                padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2), padAndToBuffer(txTransferReq.amount, 16),
            ], ts_types_1.CHUNK_BYTES_SIZE * 3);
            return {
                r_chunks: Buffer.concat([out_al], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: out_al,
                isCritical: false,
            };
        case ts_types_1.TsTxType.AUCTION_BORROW:
            const out_ab = Buffer.concat([
                padAndToBuffer(txTransferReq.reqType, 1),
                padAndToBuffer(txTransferReq.L2AddrFrom, 4),
                padAndToBuffer(txTransferReq.L2TokenAddr, 2),
                padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2), padAndToBuffer(txTransferReq.amount, 16),
            ], ts_types_1.CHUNK_BYTES_SIZE * 3);
            return {
                r_chunks: Buffer.concat([out_ab], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: out_ab,
                isCritical: false,
            };
        // TODO: add more tx types
        case ts_types_1.TsTxType.UNKNOWN:
        default:
            return {
                r_chunks: Buffer.concat([
                    padAndToBuffer(txTransferReq.reqType, 1),
                ], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([
                    padAndToBuffer(txTransferReq.reqType, 1),
                ], ts_types_1.CHUNK_BYTES_SIZE * 1),
                isCritical: false,
            };
    }
}
exports.encodeRChunkBuffer = encodeRChunkBuffer;
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
