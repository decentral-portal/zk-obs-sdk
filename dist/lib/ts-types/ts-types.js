"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsTokenAddress = exports.TsTxCalldataNum = exports.TsTxTypeLengthMap = exports.TsDeciaml = exports.TsTxType = exports.TsDefaultValue = exports.TsSystemAccountAddress = exports.getOChunksSize = exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ = exports.MIN_CHUNKS_PER_REQ = exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE = exports.LEN_OF_REQUEST = void 0;
exports.LEN_OF_REQUEST = 10;
exports.CHUNK_BYTES_SIZE = 5;
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
    TsTxType["TRANSFER"] = "3";
    TsTxType["WITHDRAW"] = "4";
    TsTxType["FORCE_WITHDRAW"] = "4";
    TsTxType["AUCTION_LEND"] = "5";
    TsTxType["AUCTION_BORROW"] = "6";
    TsTxType["AUCTION_CANCEL"] = "7";
})(TsTxType = exports.TsTxType || (exports.TsTxType = {}));
exports.TsDeciaml = {
    TS_TOKEN_AMOUNT_DEC: 18,
    TS_INTEREST_DEC: 6,
};
exports.TsTxTypeLengthMap = {
    // TODO: define the data length for each tx type
    //! Need to check again
    [TsTxType.UNKNOWN]: 0,
    [TsTxType.REGISTER]: 0,
    [TsTxType.DEPOSIT]: 5,
    [TsTxType.TRANSFER]: 5,
    [TsTxType.WITHDRAW]: 5,
    [TsTxType.AUCTION_LEND]: 7,
    [TsTxType.AUCTION_BORROW]: 9,
    [TsTxType.AUCTION_CANCEL]: 6,
};
exports.TsTxCalldataNum = {
    [TsTxType.REGISTER]: 5,
    [TsTxType.DEPOSIT]: 6,
    [TsTxType.TRANSFER]: 6,
    [TsTxType.WITHDRAW]: 6,
    [TsTxType.AUCTION_LEND]: 0,
    [TsTxType.AUCTION_BORROW]: 0,
    [TsTxType.AUCTION_CANCEL]: 0, // TODO: check
};
var TsTokenAddress;
(function (TsTokenAddress) {
    TsTokenAddress["Unknown"] = "0";
    TsTokenAddress["WETH"] = "6";
    TsTokenAddress["WBTC"] = "7";
    TsTokenAddress["USDT"] = "8";
    TsTokenAddress["USDC"] = "9";
    TsTokenAddress["DAI"] = "10";
    // TODO: TSL Token mapping
    TsTokenAddress["TslETH20221231"] = "46";
    TsTokenAddress["TslBTC20221231"] = "47";
    TsTokenAddress["TslUSDT20221231"] = "48";
    TsTokenAddress["TslUSDC20221231"] = "49";
    TsTokenAddress["TslDAI20221231"] = "50";
})(TsTokenAddress = exports.TsTokenAddress || (exports.TsTokenAddress = {}));
