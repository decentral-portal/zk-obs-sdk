import { EddsaSigner } from '../eddsa';
import { dpPoseidonHash } from '../poseidon-hash-dp';
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxWithdrawNonSignatureRequest, TsTxDepositRequest, TsTxDepositNonSignatureRequest, TsTxLimitOrderRequest, TsTxLimitOrderNonSignatureRequest, TsTxMarketOrderRequest, TsTxMarketOrderNonSignatureRequest } from '../ts-types/ts-req-types';
import { TsTokenAddress, TsTxType } from '../ts-types/ts-types';
import { encodeTxDepositMessage, encodeTxLimitOrderMessage, encodeTxMarketOrderMessage, encodeTxWithdrawMessage } from './ts-tx-helper';
import { amountToTxAmountV2 } from '../bigint-helper';
import { tsHashFunc } from './ts-helper';

export class TsRollupSigner {
  private signer: EddsaSigner;
  get tsPubKey(): [bigint, bigint] {
    const pub = this.signer.publicKey.map(x => BigInt(EddsaSigner.toObject(x).toString()));
    return [
      pub[0], pub[1],
    ];
  }

  constructor(priv: Buffer, ) {
    this.signer = new EddsaSigner(priv);
  }

  public get tsAddr() {
    const raw = BigInt(tsHashFunc(this.tsPubKey.map(v => v.toString())));
    const hash = raw % BigInt(2 ** 160);
    return `0x${hash.toString(16).padStart(40, '0')}`;
  }

  signPoseidonMessageHash(msgHash: bigint) {
    return this.signer.signPoseidon(msgHash);
  }

  verifySignature(msgHash: bigint, signature: EdDSASignaturePayload) {
    const tsPubKey: [Uint8Array, Uint8Array] = [
      EddsaSigner.toE(this.tsPubKey[0]),
      EddsaSigner.toE(this.tsPubKey[1]),
    ];
    return EddsaSigner.verify(EddsaSigner.toE(msgHash), signature, tsPubKey);
  }
  
  prepareTxDeposit(tokenId: TsTokenAddress, amount: bigint, sender: bigint): TsTxDepositRequest {
    const req: TsTxDepositNonSignatureRequest = {
      reqType: TsTxType.DEPOSIT,
      tokenId: tokenId,
      stateAmt: amount.toString(),
      nonce: '0',
      sender: sender.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTxDepositMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxWithdraw(sender: bigint, tokenId: TsTokenAddress, amount: bigint, nonce: bigint): TsTxWithdrawRequest {
    const req: TsTxWithdrawNonSignatureRequest = {
      reqType: TsTxType.WITHDRAW,
      sender: sender.toString(),
      tokenId: tokenId,
      stateAmt: amount.toString(),
      nonce: nonce.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTxWithdrawMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);
    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxOrder(marketType: TsTxType.LIMIT_ORDER | TsTxType.MARKET_ORDER, sender: bigint, sellTokenId: TsTokenAddress, sellAmt: bigint, nonce: bigint, buyTokenId: TsTokenAddress, buyAmt: bigint): TsTxLimitOrderRequest | TsTxMarketOrderRequest {
    const req: TsTxLimitOrderNonSignatureRequest | TsTxLimitOrderNonSignatureRequest = {
      reqType: marketType,
      sender: sender.toString(),
      sellTokenId: sellTokenId,
      sellAmt: sellAmt.toString(),
      nonce: nonce.toString(),
      buyTokenId: buyTokenId,
      buyAmt: buyAmt.toString(),
    };
    let msgHash: bigint;
    if(marketType === TsTxType.LIMIT_ORDER) {
      msgHash = dpPoseidonHash(encodeTxLimitOrderMessage(req));
    } else {
      msgHash = dpPoseidonHash(encodeTxMarketOrderMessage(req));
    }
    const eddsaSig = this.signPoseidonMessageHash(msgHash);
    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }
}