export declare const LEN_OF_REQUEST = 10;
export declare const CHUNK_BYTES_SIZE = 5;
export declare const CHUNK_BITS_SIZE: number;
export declare const MIN_CHUNKS_PER_REQ = 3;
export declare const MAX_CHUNKS_PER_REQ = 9;
export declare const MAX_CHUNKS_BYTES_PER_REQ: number;
export declare function getOChunksSize(batchSize: number): number;
export declare enum TsSystemAccountAddress {
    BURN_ADDR = "0",
    MINT_ADDR = "0",
    WITHDRAW_ADDR = "0",
    AUCTION_ADDR = "0"
}
export declare const TsDefaultValue: {
    NONCE_ZERO: string;
    BIGINT_DEFAULT_VALUE: bigint;
    STRING_DEFAULT_VALUE: string;
    ADDRESS_DEFAULT_VALUE: string;
};
export declare enum TsTxType {
    UNKNOWN = "0",
    REGISTER = "1",
    DEPOSIT = "2",
    TRANSFER = "3",
    WITHDRAW = "4",
    FORCE_WITHDRAW = "4",
    AUCTION_LEND = "5",
    AUCTION_BORROW = "6",
    AUCTION_CANCEL = "7"
}
export declare const TsDeciaml: {
    TS_TOKEN_AMOUNT_DEC: number;
    TS_INTEREST_DEC: number;
};
export declare const TsTxTypeLengthMap: {
    [key in TsTxType]: number;
};
export declare const TsTxCalldataNum: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
};
export declare enum TsTokenAddress {
    Unknown = "0",
    WETH = "6",
    WBTC = "7",
    USDT = "8",
    USDC = "9",
    DAI = "10",
    TslETH20221231 = "46",
    TslBTC20221231 = "47",
    TslUSDT20221231 = "48",
    TslUSDC20221231 = "49",
    TslDAI20221231 = "50"
}
export interface TsTokenInfo {
    tokenAddr: TsTokenAddress;
    amount: bigint;
    lockAmt: bigint;
}
