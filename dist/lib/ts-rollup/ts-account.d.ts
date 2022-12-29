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
    prepareTxDeposit(tokenId: TsTokenAddress, amount: string, sender: string): TsTxDepositRequest;
    prepareTxWithdraw(sender: string, tokenId: TsTokenAddress, amount: string, nonce: string): TsTxWithdrawRequest;
    prepareTxLimitOrder(sender: string, sellTokenId: TsTokenAddress, sellAmt: string, nonce: string, buyTokenId: TsTokenAddress, buyAmt: string): TsTxLimitOrderRequest;
    prepareTxMarketOrder(sender: string, sellTokenId: TsTokenAddress, sellAmt: string, nonce: string, buyTokenId: TsTokenAddress): TsTxMarketOrderRequest;
}
