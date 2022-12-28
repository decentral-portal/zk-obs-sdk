/// <reference types="node" />
import { TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionLendNonSignatureRequest, TsTxDepositNonSignatureRequest, TsTxDepositRequest, TsTxRegisterRequest, TsTxTransferNonSignatureRequest, TsTxTransferRequest } from '../ts-types/ts-req-types';
export type TsTxRequestDatasType = [
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
export type TsTxAuctionRequestDatasType = [
    bigint,
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
export declare function encodeTxDepositMessage(txDepositReq: TsTxDepositNonSignatureRequest): TsTxRequestDatasType;
export declare function encodeTxTransferMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType;
export declare function encodeTxWithdrawMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType;
export declare function encodeTxAuctionLendMessage(txAuctionLendReq: TsTxAuctionLendNonSignatureRequest): TsTxRequestDatasType;
export declare function encodeTxAuctionBorrowMessage(txAuctionBorrowReq: TsTxAuctionBorrowNonSignatureRequest): TsTxRequestDatasType;
export declare function encodeTxAuctionCancelMessage(txAuctionCancelReq: TsTxAuctionCancelNonSignatureRequest): TsTxRequestDatasType;
export declare function getEmptyRegisterTx(): TsTxRegisterRequest;
export declare function getEmptyMainTx(): TsTxDepositRequest;
export declare function encodeRChunkBuffer(txTransferReq: TsTxTransferRequest): {
    r_chunks: Buffer;
    o_chunks: string;
    isCritical: boolean;
} | {
    r_chunks: Buffer;
    o_chunks: Buffer;
    isCritical: boolean;
};
export declare function toHexString(value: string | bigint | number | Buffer | Uint8Array): string;
export declare function padAndToBuffer(value: string, bytes: number): Buffer;
export declare function toBigIntChunkArray(data: Buffer, chunkBytesSize: number): bigint[];
export declare function bigint_to_chunk_array(x: bigint, chunkBits: bigint): bigint[];
