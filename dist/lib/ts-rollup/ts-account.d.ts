/// <reference types="node" />
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxDepositRequest, TsTxLimitOrderRequest, TsTxMarketOrderRequest } from '../ts-types/ts-req-types';
import { TsTokenAddress } from '../ts-types/ts-types';
export declare class TsRollupSigner {
    private signer;
    get tsPubKey(): [bigint, bigint];
    constructor(priv: Buffer);
    get tsAddr(): string;
    signPoseidonMessageHash(msgHash: bigint): EdDSASignaturePayload;
    verifySignature(msgHash: bigint, signature: EdDSASignaturePayload): boolean;
    prepareTxDeposit(tokenId: TsTokenAddress, amount: bigint, sender: bigint): TsTxDepositRequest;
    prepareTxWithdraw(sender: bigint, tokenId: TsTokenAddress, amount: bigint, nonce: bigint): TsTxWithdrawRequest;
    prepareTxLimitOrder(sender: bigint, sellTokenId: TsTokenAddress, sellAmt: bigint, nonce: bigint, buyTokenId: TsTokenAddress, buyAmt: bigint): TsTxLimitOrderRequest;
    prepareMarketOrder(sender: bigint, sellTokenId: TsTokenAddress, sellAmt: bigint, nonce: bigint, buyTokenId: TsTokenAddress, buyAmt: bigint): TsTxMarketOrderRequest;
}
