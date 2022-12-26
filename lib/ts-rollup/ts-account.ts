import { EddsaSigner } from '../eddsa';
import { dpPoseidonHash } from '../poseidon-hash-dp';
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxWithdrawNonSignatureRequest, TsTxTransferRequest, TsTxDepositRequest, TsTxDepositNonSignatureRequest, TsTxAuctionLendNonSignatureRequest, TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionBorrowRequest, TsTxAuctionLendRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionCancelRequest, TsTxRegisterRequest } from '../ts-types/ts-req-types';
import { TsTokenAddress, TsSystemAccountAddress, TsTxType } from '../ts-types/ts-types';
import { encodeTxDepositMessage, encodeTxTransferMessage, encodeTxAuctionLendMessage, encodeTxAuctionBorrowMessage, encodeTxWithdrawMessage, encodeTxAuctionCancelMessage } from './ts-tx-helper';
import { amountToTxAmountV2 } from '../bigint-helper';

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

  prepareTxWithdraw(nonce: bigint, L2Address: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxWithdrawRequest {
    const req: TsTxWithdrawNonSignatureRequest = {
      reqType: TsTxType.WITHDRAW,
      L2AddrFrom: L2Address.toString(),
      L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
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

  prepareTxTransfer(nonce: bigint | number, fromAddr: bigint, toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxTransferRequest {
    const req = {
      reqType: TsTxType.TRANSFER,
      L2AddrFrom: fromAddr.toString(),
      L2AddrTo: toAddr.toString(),
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
      nonce: nonce.toString(),
      txAmount: amountToTxAmountV2(amount).toString(),
    };
    console.log({
      amount,
      txAmount: req.txAmount,
    });
    const msgHash = dpPoseidonHash(encodeTxTransferMessage(req));
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

  prepareTxDeposit(toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxDepositRequest {
    const req: TsTxDepositNonSignatureRequest = {
      reqType: TsTxType.DEPOSIT,
      L2AddrFrom: TsSystemAccountAddress.MINT_ADDR,
      L2AddrTo: toAddr.toString(),
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
      nonce: '0',
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

  prepareTxAuctionPlaceLend(data: Exclude<TsTxAuctionLendNonSignatureRequest, 'L2AddrTo'>): TsTxAuctionLendRequest {
    const req: TsTxAuctionLendNonSignatureRequest = {
      ...data,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionLendMessage(req));
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

  prepareTxAuctionPlaceBorrow(data: Exclude<TsTxAuctionBorrowNonSignatureRequest,  'L2AddrTo'>): TsTxAuctionBorrowRequest {
    const req: TsTxAuctionBorrowNonSignatureRequest = {
      ...data,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionBorrowMessage(req));
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

  prepareTxAuctionCancel(data: Exclude<TsTxAuctionCancelNonSignatureRequest,  'L2AddrFrom'>): TsTxAuctionCancelRequest {
    const req: TsTxAuctionCancelNonSignatureRequest = {
      ...data,
      L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionCancelMessage(req));
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