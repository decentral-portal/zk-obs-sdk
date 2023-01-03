export const LEN_OF_REQUEST = 10;
export const CHUNK_BYTES_SIZE = 12;
export const CHUNK_BITS_SIZE = CHUNK_BYTES_SIZE * 8;
export const MIN_CHUNKS_PER_REQ = 3;
export const MAX_CHUNKS_PER_REQ = 9;
export const MAX_CHUNKS_BYTES_PER_REQ = MAX_CHUNKS_PER_REQ * CHUNK_BYTES_SIZE;
export function getOChunksSize(batchSize: number) {
  return MAX_CHUNKS_PER_REQ * batchSize;
}

export enum TsSystemAccountAddress {
  BURN_ADDR = '0',
  MINT_ADDR = '0',
  WITHDRAW_ADDR = '0',
  AUCTION_ADDR = '0',
}

export const TsDefaultValue = {
  NONCE_ZERO: '0',
  BIGINT_DEFAULT_VALUE: 0n,
  STRING_DEFAULT_VALUE: '0',
  ADDRESS_DEFAULT_VALUE: '0x00',
};

export enum TsTxType {
  UNKNOWN = '0',
  REGISTER = '1',
  DEPOSIT = '2',
  WITHDRAW = '3',
  LIMIT_ORDER = '4',
  LIMIT_START = '5',
  LIMIT_EXCHANGE = '6',
  LIMIT_END = '7',
  MARKET_ORDER = '8',
  MARKET_EXCHANGE = '9',
  MARKET_END = '10',
  CANCEL_ORDER = '11'
}

export const TsDeciaml = {
  TS_TOKEN_AMOUNT_DEC: 18,
  TS_INTEREST_DEC: 6,
};

export enum TsTokenAddress {
  UNKNOWN = '0',
  WETH = '1',
  USD = '2',
}

export interface TsTokenInfo {
    amount: bigint;
    lockAmt: bigint;
}
