import { Wallet, utils } from 'ethers';
import { EdDSA } from '../../lib/eddsa';
import { tsPubKeyTypeConverter, uint8ArrayToBigint, eddsaSigTypeConverter } from '../../lib/helper';
import { TsRollupSigner } from '../../lib/ts-rollup/ts-account';
import { RESERVED_ACCOUNTS } from '../../lib/ts-rollup/ts-env';
import { encodeTxAuctionCancelMessage } from '../../lib/ts-rollup/ts-tx-helper';
import { TsTxRegisterRequest, TsTxDepositRequest, TsTxWithdrawNonSignatureRequest, TsTxTransferNonSignatureRequest, TsTxAuctionLendNonSignatureRequest, TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionCancelRequest, ITxRequest } from '../../lib/ts-types/ts-req-types';
import { TsTxType, TsSystemAccountAddress, TsTokenAddress } from '../../lib/ts-types/ts-types';
import { getPrivByIndex } from './test-config';
import { TX_TYPES, authTypedData, getWdTypedData, getTrfTypedData, getAuctionLendTypedData, getAuctionBorrowTypedData, getAuctionCancelTypedData } from './test-helper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const circomlibjs = require('circomlibjs');
const signers: TsRollupSigner[] = [];
const privateKeys: Uint8Array[] = [];
export function getP4TxData(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const txData = require(`../test-case/${name}`);
  return txData;
}
export async function parseTxRawData(txData: any) {
  const regTxs: TsTxRegisterRequest[] = [];
  const normalTxs: ITxRequest[] = [];
  for (let i = 0; i < txData.length; i++) {
    if(txData[i].type === TX_TYPES.REGISTER) {
      regTxs.push(txData[i] as any);  
    } else {
      normalTxs.push(txData[i] as any);
    }
  }
  for (let i = 0; i < regTxs.length; i++) {
    regTxs[i] = await genRegisterReq(regTxs[i] as TsTxRegisterRequest);
  }
  for (let i = 0; i < normalTxs.length; i++) {
    const type = (normalTxs[i] as any).type;
    switch (type) {
      case TX_TYPES.DEPOSIT:
        normalTxs[i] = await depositReq(normalTxs[i] as any);
        break;
      case TX_TYPES.WITHDRAW:
        normalTxs[i] = await withdrawReq(normalTxs[i] as any);
        break;
      case TX_TYPES.TRANSFER:
        normalTxs[i] = await transferReq(normalTxs[i] as any);
        break;
      case TX_TYPES.AUCTION_LEND:
        normalTxs[i] = await auctionLendReq(normalTxs[i] as any);
        break;
      case TX_TYPES.AUCTION_BORROW:
        normalTxs[i] = await auctionBorrowReq(normalTxs[i] as any);
        break;
      case TX_TYPES.AUCTION_CANCEL:
        normalTxs[i] = await auctionCancelReq(normalTxs[i] as any);
        break;
      default:
        throw new Error('initial: unknown tx type');
        break;
    }
  }
  return {
    regTxs,
    normalTxs,
  };
}

async function genTsSigner(privateKey: Uint8Array) {
  const wallet = new Wallet(privateKey);

  // L1 signature for tsKeyPair
  const signature = await wallet._signTypedData(
    authTypedData.domain,
    authTypedData.types,
    authTypedData.value
  );

  const tsPrivKey = utils.keccak256(signature);
  const tsPrivKeyBuf = Buffer.from(tsPrivKey.replace('0x', ''), 'hex');
  const signer = new TsRollupSigner(tsPrivKeyBuf);
  return signer;
}

async function genRegisterReq(obj: TsTxRegisterRequest): Promise<TsTxRegisterRequest> {
  // const privateKey = utils.randomBytes(32); // ETH private key
  const privateKey = getPrivByIndex(Number(obj.L2AddrFrom), -Number(RESERVED_ACCOUNTS));
  const signer = await genTsSigner(privateKey);
  privateKeys[Number(obj.L2AddrFrom)] = privateKey;
  signers[Number(obj.L2AddrFrom)] = signer;
  const tsPubKey = tsPubKeyTypeConverter(signer.tsPubKey);
  const tsPubKeyStr = tsPubKey.map((x: Uint8Array) => EdDSA.babyJub.F.toObject(x).toString()) as [string, string];
  const { L2AddrFrom, L2TokenAddr, amount } = obj;
  const req = {
    reqType: TsTxType.REGISTER,
    L2AddrFrom: L2AddrFrom,
    L2TokenAddr: L2TokenAddr,
    tsPubKey: tsPubKeyStr, // [babyjub.x, babyjub.y]
    amount: amount,
  };
  return req;
}

function depositReq(obj: TsTxDepositRequest) {
  const { L2AddrFrom, L2AddrTo, L2TokenAddr, amount } = obj;
  const dpReq = {
    reqType: TsTxType.DEPOSIT,
    L2AddrFrom: L2AddrFrom,
    L2AddrTo: L2AddrTo,
    L2TokenAddr: L2TokenAddr,
    amount: amount,
  };
  return dpReq;
}

async function withdrawReq(obj: TsTxWithdrawNonSignatureRequest) {
  const { L2AddrFrom, L2AddrTo, L2TokenAddr, amount } = obj;
  const signer = signers[Number(L2AddrFrom)];
  const wallet = new Wallet(privateKeys[Number(L2AddrFrom)]);
  const nonce = obj.nonce as string;
  const req = signer.prepareTxWithdraw(
    BigInt(nonce),
    BigInt(L2AddrFrom),
    L2TokenAddr,
    BigInt(amount)
  );
  const TypedData = getWdTypedData(L2AddrFrom, L2AddrTo, L2TokenAddr, amount, nonce);
  
  const ecdsaSig = await wallet._signTypedData(
    TypedData.domain,
    TypedData.types,
    TypedData.value
  );

  const trfReq = {
    ...req,
    ecdsaSig: ecdsaSig,
  };
  return trfReq;
}

async function transferReq(obj: TsTxTransferNonSignatureRequest) {
  const { L2AddrFrom, L2AddrTo, L2TokenAddr, amount } = obj;
  const signer = signers[Number(L2AddrFrom)];
  const wallet = new Wallet(privateKeys[Number(L2AddrFrom)]);
  const nonce = obj.nonce as string;
  const req = signer.prepareTxTransfer(
    BigInt(nonce),
    BigInt(L2AddrFrom),
    BigInt(L2AddrTo),
    L2TokenAddr,
    BigInt(amount)
  );
  const TypedData = getTrfTypedData(L2AddrFrom, L2AddrTo, L2TokenAddr, amount, nonce);

  const ecdsaSig = await wallet._signTypedData(
    TypedData.domain,
    TypedData.types,
    TypedData.value
  );

  const trfReq = {
    ...req,
    ecdsaSig: ecdsaSig,
  };
  return trfReq;
}

async function auctionLendReq(obj: TsTxAuctionLendNonSignatureRequest) {
  const { L2AddrFrom, L2TokenAddrLending, lendingAmt, nonce, maturityDate, expiredTime, interest} = obj;
  const signerLend = signers[Number(L2AddrFrom)];
  const tx = signerLend.prepareTxAuctionPlaceLend({
    reqType: TsTxType.AUCTION_LEND,
    L2AddrFrom: L2AddrFrom,
    L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
    L2TokenAddrLending: L2TokenAddrLending,
    lendingAmt,
    nonce,
    maturityDate,
    expiredTime,
    interest,
  });

  const auctionLendTypedData = getAuctionLendTypedData(L2AddrFrom, L2TokenAddrLending, lendingAmt, nonce, maturityDate, expiredTime, interest);
  const walletLend = new Wallet(privateKeys[Number(L2AddrFrom)]);
  const ecdsaSig = await walletLend._signTypedData(
    auctionLendTypedData.domain,
    auctionLendTypedData.types,
    auctionLendTypedData.value
  );
  tx.ecdsaSig = ecdsaSig;

  return tx;
}

async function auctionBorrowReq(obj: TsTxAuctionBorrowNonSignatureRequest) {
  const { L2AddrFrom, L2TokenAddrBorrowing, borrowingAmt, nonce, maturityDate, expiredTime, interest} = obj;
  const L2TokenAddrCollateral = obj.L2TokenAddrCollateral as TsTokenAddress;
  const collateralAmt = obj.collateralAmt as string;
  const signerBorrow = signers[Number(L2AddrFrom)];
  const walletBorrow = new Wallet(privateKeys[Number(L2AddrFrom)]);
  const req = signerBorrow.prepareTxAuctionPlaceBorrow({
    reqType: TsTxType.AUCTION_BORROW,
    L2AddrFrom: L2AddrFrom,
    L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
    L2TokenAddrBorrowing: L2TokenAddrBorrowing,
    borrowingAmt,
    L2TokenAddrCollateral,
    collateralAmt,
    nonce,
    maturityDate,
    expiredTime,
    interest,
  });
  
  const TypedDataBorrow = getAuctionBorrowTypedData(L2AddrFrom, L2TokenAddrCollateral, collateralAmt, nonce, maturityDate, expiredTime, interest, L2TokenAddrBorrowing, borrowingAmt);
  const ecdsaSigBorrow = await walletBorrow._signTypedData(
    TypedDataBorrow.domain,
    TypedDataBorrow.types,
    TypedDataBorrow.value
  );

  const auctionBorrowReq: TsTxAuctionBorrowRequest = {
    ...req,
    ecdsaSig: ecdsaSigBorrow,
  };
  return auctionBorrowReq;
}

async function auctionCancelReq(obj: TsTxAuctionCancelNonSignatureRequest) {
  const { L2AddrTo, L2TokenAddrRefunded, amount, nonce, orderLeafId} = obj;
  const signerCancel = signers[Number(L2AddrTo)];
  const walletCancel = new Wallet(privateKeys[Number(L2AddrTo)]);
  const cancelReqNonSig: TsTxAuctionCancelNonSignatureRequest = {
    reqType: TsTxType.AUCTION_CANCEL,
    L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR,
    L2AddrTo: L2AddrTo,
    L2TokenAddrRefunded: L2TokenAddrRefunded,
    amount: amount,
    nonce: nonce,
    orderLeafId: orderLeafId,
  };

  const poseidonCancel = await circomlibjs.buildPoseidon();
  const msgHashCancel = uint8ArrayToBigint(
    poseidonCancel(encodeTxAuctionCancelMessage(cancelReqNonSig))
  );

  const eddsaSigCancel = eddsaSigTypeConverter(signerCancel.signPoseidonMessageHash(msgHashCancel));
  const cancelTypedData = getAuctionCancelTypedData(L2AddrTo, L2TokenAddrRefunded, amount, nonce, orderLeafId);
  const ecdsaSigCancel = await walletCancel._signTypedData(
    cancelTypedData.domain,
    cancelTypedData.types,
    cancelTypedData.value
  );
  const cancelReqSignature: TsTxAuctionCancelRequest = {
    reqType: TsTxType.AUCTION_CANCEL,
    L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR,
    L2AddrTo: L2AddrTo,
    L2TokenAddrRefunded: L2TokenAddrRefunded,
    amount: amount,
    nonce: nonce,
    orderLeafId: orderLeafId,
    eddsaSig: eddsaSigCancel,
    ecdsaSig: ecdsaSigCancel,
  };
  return cancelReqSignature;
}