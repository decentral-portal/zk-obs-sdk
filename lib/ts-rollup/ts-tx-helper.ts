import { BigNumber, ethers } from 'ethers';
import { TsTxDepositNonSignatureRequest, TsTxDepositRequest, TsTxLimitEndNonSignatureRequest, TsTxLimitEndRequest, TsTxLimitExchangeNonSignatureRequest, TsTxLimitExchangeRequest, TsTxLimitOrderNonSignatureRequest, TsTxLimitOrderRequest, TsTxLimitStartNonSignatureRequest, TsTxLimitStartRequest, TsTxMarketEndNonSignatureRequest, TsTxMarketEndRequest, TsTxMarketExchangeNonSignatureRequest, TsTxMarketExchangeRequest, TsTxMarketOrderNonSignatureRequest, TsTxMarketOrderRequest, TsTxRegisterRequest, TsTxWithdrawNonSignatureRequest, TsTxWithdrawRequest } from '../ts-types/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../ts-types/ts-types';

// [L2AddrFrom, L2AddrTo, L2TokenAddr, tokenAmt, nonce, arg0, arg1, arg2, arg3, arg4]
export type TsTxRequestDataType = [
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint,
];

export function encodeTxRegisterMessage(txRegisterReq: TsTxRegisterRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.REGISTER),
    0n,
    BigInt(txRegisterReq.tokenId),
    BigInt(txRegisterReq.stateAmt),
    BigInt(txRegisterReq.nonce),
    BigInt(txRegisterReq.sender),
    BigInt(txRegisterReq.tsAddr),
    0n, 0n, 0n,
  ];
}

export function encodeTxDepositMessage(txDepositReq: TsTxDepositRequest | TsTxDepositNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.DEPOSIT),
    0n,
    BigInt(txDepositReq.tokenId),
    BigInt(txDepositReq.stateAmt),
    BigInt(txDepositReq.nonce),
    BigInt(txDepositReq.sender),
    0n, 0n, 0n, 0n,
  ];
}

export function encodeTxWithdrawMessage(txWithdrawReq: TsTxWithdrawRequest | TsTxWithdrawNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.WITHDRAW),
    BigInt(txWithdrawReq.sender),
    BigInt(txWithdrawReq.tokenId),
    BigInt(txWithdrawReq.stateAmt),
    BigInt(txWithdrawReq.nonce),
    0n, 0n, 0n, 0n, 0n,
  ];
}

export function encodeTxLimitOrderMessage(txLimitOrderReq: TsTxLimitOrderRequest | TsTxLimitOrderNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.LIMIT_ORDER),
    BigInt(txLimitOrderReq.sender),
    BigInt(txLimitOrderReq.sellTokenId),
    BigInt(txLimitOrderReq.sellAmt),
    BigInt(txLimitOrderReq.nonce),
    0n, 0n, 
    BigInt(txLimitOrderReq.buyTokenId),
    BigInt(txLimitOrderReq.buyAmt),
    0n,
  ]
}

export function encodeTxLimitStartMessage(txLimitStartReq: TsTxLimitStartRequest | TsTxLimitStartNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.LIMIT_START),
    0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
    BigInt(txLimitStartReq.orderLeafId),
    
  ]
}

export function encodeTxLimitExchangeMessage(txLimitExchangeReq: TsTxLimitExchangeRequest | TsTxLimitExchangeNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.LIMIT_EXCHANGE),
    0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
    BigInt(txLimitExchangeReq.orderLeafId),
    
  ]
}

export function encodeTxLimitEndMessage(txLimitEndReq: TsTxLimitEndRequest | TsTxLimitEndNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.LIMIT_END),
    0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
    BigInt(txLimitEndReq.orderLeafId),
    
  ]
}

export function encodeTxMarketOrderMessage(txMarketOrderReq: TsTxMarketOrderRequest | TsTxMarketOrderNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.MARKET_ORDER),
    BigInt(txMarketOrderReq.sender),
    BigInt(txMarketOrderReq.sellTokenId),
    BigInt(txMarketOrderReq.sellAmt),
    BigInt(txMarketOrderReq.nonce),
    0n, 0n, 
    BigInt(txMarketOrderReq.buyTokenId),
    0n, 0n,
  ]
}

export function encodeTxMarketExchangeMessage(txMarketExchangeReq: TsTxMarketExchangeRequest | TsTxMarketExchangeNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.MARKET_EXCHANGE),
    0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
    BigInt(txMarketExchangeReq.orderLeafId),
    
  ]
}

export function encodeTxMarketEndMessage(txMarketEndReq: TsTxMarketEndRequest | TsTxMarketEndNonSignatureRequest): TsTxRequestDataType {
  return [
    BigInt(TsTxType.MARKET_END),
    0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n,
    BigInt(txMarketEndReq.orderLeafId),
    
  ]
}

function padHexByBytes(hex: string, bytes: number): string {
  // hex = hex.slice(2);
  if(hex.length % 2 !== 0) throw new Error('hex should be even length');
  if(hex.length / 2 > bytes) throw new Error('hex should be less than bytes');
  const padding = '0'.repeat(bytes * 2 - hex.length);
  return padding + hex;
}

export function toHexString(value: string | bigint | number | Buffer | Uint8Array) {
  if(typeof value === 'string') {
    if(/^0x/.test(value)) return value;
    return BigInt(value).toString(16);
  }
  if(typeof value === 'number') {
    return value.toString(16);
  }
  if(typeof value === 'bigint') {
    return value.toString(16);
  }
  if(value instanceof Buffer) {
    return value.toString('hex');
  }
  if(value instanceof Uint8Array) {
    return Buffer.from(value).toString('hex');
  }
  throw new Error('value should be string, number, bigint, Buffer or Uint8Array');
}

export function padAndToBuffer(value: string, bytes: number): Buffer {
  const hexString = toHexString(value);
  const buffer = Buffer.from(/^0x/.test(hexString) ? hexString.slice(2) : hexString, 'hex');
  return Buffer.concat([buffer], bytes);
}

export function toBigIntChunkArray(data: Buffer, chunkBytesSize: number): bigint[] {
  const result: bigint[] = [];
  const uint8arr = new Uint8Array(data);
  for (let i = 0; i < uint8arr.length; i += chunkBytesSize) {
    const chunk = uint8arr.slice(i, i + chunkBytesSize);
    result.push(BigInt('0x' + Buffer.from(chunk).toString('hex')));
  }
  return result;
}

export function bigint_to_chunk_array(x: bigint, chunkBits: bigint) {
  const mod = 2n ** BigInt(chunkBits);

  const ret: bigint[] = [];
  let x_temp: bigint = x;
  while(x_temp > 0n) {
    ret.push(x_temp % mod);
    x_temp = x_temp >> chunkBits;
  }
  return ret;
}
// 12345 6789abcdef
// => [6789abcdef, 12345]