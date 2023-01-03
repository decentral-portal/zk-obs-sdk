"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsTokenAddress = exports.TsDeciaml = exports.TsTxType = exports.TsDefaultValue = exports.TsSystemAccountAddress = exports.getOChunksSize = exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ = exports.MIN_CHUNKS_PER_REQ = exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE = exports.LEN_OF_REQUEST = void 0;
exports.LEN_OF_REQUEST = 10;
exports.CHUNK_BYTES_SIZE = 12;
exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE * 8;
exports.MIN_CHUNKS_PER_REQ = 3;
exports.MAX_CHUNKS_PER_REQ = 9;
exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ * exports.CHUNK_BYTES_SIZE;
function getOChunksSize(batchSize) {
    return exports.MAX_CHUNKS_PER_REQ * batchSize;
}
exports.getOChunksSize = getOChunksSize;
var TsSystemAccountAddress;
(function (TsSystemAccountAddress) {
    TsSystemAccountAddress["BURN_ADDR"] = "0";
    TsSystemAccountAddress["MINT_ADDR"] = "0";
    TsSystemAccountAddress["WITHDRAW_ADDR"] = "0";
    TsSystemAccountAddress["AUCTION_ADDR"] = "0";
})(TsSystemAccountAddress = exports.TsSystemAccountAddress || (exports.TsSystemAccountAddress = {}));
exports.TsDefaultValue = {
    NONCE_ZERO: '0',
    BIGINT_DEFAULT_VALUE: 0n,
    STRING_DEFAULT_VALUE: '0',
    ADDRESS_DEFAULT_VALUE: '0x00',
};
var TsTxType;
(function (TsTxType) {
    TsTxType["UNKNOWN"] = "0";
    TsTxType["REGISTER"] = "1";
    TsTxType["DEPOSIT"] = "2";
    TsTxType["WITHDRAW"] = "3";
    TsTxType["LIMIT_ORDER"] = "4";
    TsTxType["LIMIT_START"] = "5";
    TsTxType["LIMIT_EXCHANGE"] = "6";
    TsTxType["LIMIT_END"] = "7";
    TsTxType["MARKET_ORDER"] = "8";
    TsTxType["MARKET_EXCHANGE"] = "9";
    TsTxType["MARKET_END"] = "10";
    TsTxType["CANCEL_ORDER"] = "11";
})(TsTxType = exports.TsTxType || (exports.TsTxType = {}));
exports.TsDeciaml = {
    TS_TOKEN_AMOUNT_DEC: 18,
    TS_INTEREST_DEC: 6,
};
var TsTokenAddress;
(function (TsTokenAddress) {
    TsTokenAddress["UNKNOWN"] = "0";
    TsTokenAddress["WETH"] = "1";
    TsTokenAddress["USD"] = "2";
})(TsTokenAddress = exports.TsTokenAddress || (exports.TsTokenAddress = {}));
