/// <reference types="node" />
import { TsTxDepositNonSignatureRequest, TsTxDepositRequest, TsTxLimitEndNonSignatureRequest, TsTxLimitEndRequest, TsTxLimitExchangeNonSignatureRequest, TsTxLimitExchangeRequest, TsTxLimitOrderNonSignatureRequest, TsTxLimitOrderRequest, TsTxLimitStartNonSignatureRequest, TsTxLimitStartRequest, TsTxMarketEndNonSignatureRequest, TsTxMarketEndRequest, TsTxMarketExchangeNonSignatureRequest, TsTxMarketExchangeRequest, TsTxMarketOrderNonSignatureRequest, TsTxMarketOrderRequest, TsTxRegisterRequest, TsTxWithdrawNonSignatureRequest, TsTxWithdrawRequest } from '../ts-types/ts-req-types';
export type TsTxRequestDataType = [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint
];
export declare function encodeTxRegisterMessage(txRegisterReq: TsTxRegisterRequest): TsTxRequestDataType;
export declare function encodeTxDepositMessage(txDepositReq: TsTxDepositRequest | TsTxDepositNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxWithdrawMessage(txWithdrawReq: TsTxWithdrawRequest | TsTxWithdrawNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxLimitOrderMessage(txLimitOrderReq: TsTxLimitOrderRequest | TsTxLimitOrderNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxLimitStartMessage(txLimitStartReq: TsTxLimitStartRequest | TsTxLimitStartNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxLimitExchangeMessage(txLimitExchangeReq: TsTxLimitExchangeRequest | TsTxLimitExchangeNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxLimitEndMessage(txLimitEndReq: TsTxLimitEndRequest | TsTxLimitEndNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxMarketOrderMessage(txMarketOrderReq: TsTxMarketOrderRequest | TsTxMarketOrderNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxMarketExchangeMessage(txMarketExchangeReq: TsTxMarketExchangeRequest | TsTxMarketExchangeNonSignatureRequest): TsTxRequestDataType;
export declare function encodeTxMarketEndMessage(txMarketEndReq: TsTxMarketEndRequest | TsTxMarketEndNonSignatureRequest): TsTxRequestDataType;
export declare function toHexString(value: string | bigint | number | Buffer | Uint8Array): string;
export declare function padAndToBuffer(value: string, bytes: number): Buffer;
export declare function toBigIntChunkArray(data: Buffer, chunkBytesSize: number): bigint[];
export declare function bigint_to_chunk_array(x: bigint, chunkBits: bigint): bigint[];
