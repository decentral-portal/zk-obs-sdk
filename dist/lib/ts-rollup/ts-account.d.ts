/// <reference types="node" />
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxTransferRequest, TsTxDepositRequest, TsTxAuctionLendNonSignatureRequest, TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionBorrowRequest, TsTxAuctionLendRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionCancelRequest } from '../ts-types/ts-req-types';
import { TsTokenAddress } from '../ts-types/ts-types';
export declare class TsRollupSigner {
    private signer;
    get tsPubKey(): [bigint, bigint];
    constructor(priv: Buffer);
    get tsAddr(): string;
    signPoseidonMessageHash(msgHash: bigint): EdDSASignaturePayload;
    verifySignature(msgHash: bigint, signature: EdDSASignaturePayload): boolean;
    prepareTxWithdraw(nonce: bigint, L2Address: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxWithdrawRequest;
    prepareTxTransfer(nonce: bigint | number, fromAddr: bigint, toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxTransferRequest;
    prepareTxDeposit(toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxDepositRequest;
    prepareTxAuctionPlaceLend(data: Exclude<TsTxAuctionLendNonSignatureRequest, 'L2AddrTo'>): TsTxAuctionLendRequest;
    prepareTxAuctionPlaceBorrow(data: Exclude<TsTxAuctionBorrowNonSignatureRequest, 'L2AddrTo'>): TsTxAuctionBorrowRequest;
    prepareTxAuctionCancel(data: Exclude<TsTxAuctionCancelNonSignatureRequest, 'L2AddrFrom'>): TsTxAuctionCancelRequest;
}
