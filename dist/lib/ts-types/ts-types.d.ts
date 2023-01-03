export declare const LEN_OF_REQUEST = 10;
export declare const CHUNK_BYTES_SIZE = 12;
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
    WITHDRAW = "3",
    LIMIT_ORDER = "4",
    LIMIT_START = "5",
    LIMIT_EXCHANGE = "6",
    LIMIT_END = "7",
    MARKET_ORDER = "8",
    MARKET_EXCHANGE = "9",
    MARKET_END = "10",
    CANCEL_ORDER = "11"
}
export declare const TsDeciaml: {
    TS_TOKEN_AMOUNT_DEC: number;
    TS_INTEREST_DEC: number;
};
export declare enum TsTokenAddress {
    UNKNOWN = "0",
    WETH = "1",
    USD = "2"
}
export interface TsTokenInfo {
    amount: bigint;
    lockAmt: bigint;
}
