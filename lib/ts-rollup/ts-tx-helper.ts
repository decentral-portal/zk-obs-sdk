import { BigNumber, ethers } from 'ethers';
import { TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionLendNonSignatureRequest, TsTxDepositNonSignatureRequest, TsTxDepositRequest, TsTxRegisterRequest, TsTxTransferNonSignatureRequest, TsTxTransferRequest } from '../ts-types/ts-req-types';
import { CHUNK_BYTES_SIZE, MAX_CHUNKS_BYTES_PER_REQ, TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../ts-types/ts-types';

// [L2AddrFrom, L2AddrTo, L2TokenAddr, tokenAmt, nonce, arg0, arg1, arg2, arg3, arg4]
export type TsTxRequestDatasType = [
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint 
]; 

export type TsTxAuctionRequestDatasType = [
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint, 
  bigint,
]; 


export function encodeTxDepositMessage(txDepositReq: TsTxDepositNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.DEPOSIT),
    BigInt(txDepositReq.L2AddrTo),
    BigInt(txDepositReq.L2TokenAddr),
    BigInt(txDepositReq.amount),
    0n,
    0n, 0n, 0n, 0n, 0n, 
  ];
}

export function encodeTxTransferMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.TRANSFER),
    BigInt(txTransferReq.L2AddrFrom),
    BigInt(txTransferReq.L2TokenAddr),
    BigInt(txTransferReq.txAmount || 0),
    BigInt(txTransferReq.nonce),
    BigInt(txTransferReq.L2AddrTo),
    0n, 0n, 0n, 0n,
  ];
}

export function encodeTxWithdrawMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.WITHDRAW),
    BigInt(txTransferReq.L2AddrFrom),
    BigInt(txTransferReq.L2TokenAddr),
    BigInt(txTransferReq.amount),
    BigInt(txTransferReq.nonce),
    0n, 0n, 0n, 0n, 0n,
  ];
}

export function encodeTxAuctionLendMessage(txAuctionLendReq: TsTxAuctionLendNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_LEND),
    BigInt(txAuctionLendReq.L2AddrFrom),
    BigInt(txAuctionLendReq.L2TokenAddrLending),
    BigInt(txAuctionLendReq.lendingAmt),
    BigInt(txAuctionLendReq.nonce),
    BigInt(txAuctionLendReq.maturityDate),
    BigInt(txAuctionLendReq.expiredTime),
    BigInt(txAuctionLendReq.interest),
    0n, 0n,
    // txId,
  ];
}

export function encodeTxAuctionBorrowMessage(txAuctionBorrowReq: TsTxAuctionBorrowNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_BORROW),
    BigInt(txAuctionBorrowReq.L2AddrFrom),
    BigInt(txAuctionBorrowReq.L2TokenAddrCollateral),
    BigInt(txAuctionBorrowReq.collateralAmt),
    BigInt(txAuctionBorrowReq.nonce),
    BigInt(txAuctionBorrowReq.maturityDate),
    BigInt(txAuctionBorrowReq.expiredTime),
    BigInt(txAuctionBorrowReq.interest),
    BigInt(txAuctionBorrowReq.L2TokenAddrBorrowing),
    BigInt(txAuctionBorrowReq.borrowingAmt),
    // txId,
  ];
}

export function encodeTxAuctionCancelMessage(txAuctionCancelReq: TsTxAuctionCancelNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_CANCEL),
    BigInt(txAuctionCancelReq.L2AddrTo),
    BigInt(txAuctionCancelReq.L2TokenAddrRefunded),
    BigInt(txAuctionCancelReq.amount),
    BigInt(txAuctionCancelReq.nonce),
    BigInt(txAuctionCancelReq.orderLeafId),
    0n, 0n, 0n, 0n,
    // txId,
  ];
}

export function getEmptyRegisterTx() {
  const req: TsTxRegisterRequest = {
    L1Addr: '0x00',
    reqType: TsTxType.REGISTER,
    L2AddrFrom: TsSystemAccountAddress.BURN_ADDR,
    L2TokenAddr: TsTokenAddress.Unknown,
    tsPubKey: [ '0', '0' ],
    amount: '0',
  };
  return req;
}

export function getEmptyMainTx() {
  const req: TsTxDepositRequest = {
    reqType: TsTxType.DEPOSIT,
    L2AddrFrom: TsSystemAccountAddress.MINT_ADDR,
    L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
    L2TokenAddr: TsTokenAddress.Unknown,
    amount: '0',
    nonce: '0',
    eddsaSig: {
      R8: ['0', '0'],
      S: '0'
    }
  };
  return req;
}


export function encodeRChunkBuffer(txTransferReq: TsTxTransferRequest) {
  if(!txTransferReq.L2TokenLeafIdFrom) {
    throw new Error('L2TokenLeafIdFrom is required');
  }
  switch (txTransferReq.reqType) {
    case TsTxType.REGISTER:
      if(!txTransferReq.hashedTsPubKey) {
        throw new Error('hashedTsPubKey is required');
      }
      const out_r = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint16', 'uint128', 'uint160',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.L2AddrTo),
          BigNumber.from(txTransferReq.L2TokenAddr),
          BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
          BigNumber.from(txTransferReq.amount),
          BigNumber.from(txTransferReq.hashedTsPubKey),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: out_r,
        isCritical: true,
      };
    case TsTxType.DEPOSIT:
      const out_d = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint16', 'uint128',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.L2AddrTo),
          BigNumber.from(txTransferReq.L2TokenAddr),
          BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
          BigNumber.from(txTransferReq.amount),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.from(out_d, 'hex'),
        isCritical: true,
      };
    case TsTxType.WITHDRAW:
      const out_w = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint16', 'uint48', 'uint32', 'uint16',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.L2AddrFrom),
          BigNumber.from(txTransferReq.L2TokenAddr),
          BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
          BigNumber.from(txTransferReq.amount),
          BigNumber.from(txTransferReq.L2AddrTo),
          BigNumber.from(txTransferReq.L2TokenLeafIdTo),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.from(out_w, 'hex'),
        isCritical: true,
      };
    case TsTxType.FORCE_WITHDRAW:
      const out_fw = Buffer.concat([
        padAndToBuffer(txTransferReq.reqType, 1),
        padAndToBuffer(txTransferReq.L2AddrFrom, 4),
        padAndToBuffer(txTransferReq.L2TokenAddr, 2),
        padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2),padAndToBuffer(txTransferReq.amount, 16),
      ], CHUNK_BYTES_SIZE * 5);
      return {
        r_chunks: Buffer.concat([out_fw], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: out_fw,
        isCritical: true,
      };
    case TsTxType.TRANSFER:
      if(!txTransferReq.L2TokenLeafIdTo) {
        throw new Error('L2TokenLeafIdTo is required');
      }
      console.log({
        txTransferReq
      });
      console.log({
        raw: [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.L2AddrFrom),
          BigNumber.from(txTransferReq.L2TokenAddr),
          BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
          BigNumber.from(txTransferReq.txAmount),
          BigNumber.from(txTransferReq.L2AddrTo),
          BigNumber.from(txTransferReq.L2TokenLeafIdTo),
        ]
      });
      const out_t = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint16', 'uint48', 'uint32', 'uint16',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.L2AddrFrom),
          BigNumber.from(txTransferReq.L2TokenAddr),
          BigNumber.from(txTransferReq.L2TokenLeafIdFrom),
          BigNumber.from(txTransferReq.txAmount),
          BigNumber.from(txTransferReq.L2AddrTo),
          BigNumber.from(txTransferReq.L2TokenLeafIdTo),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_t, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.from(out_t, 'hex'),
        isCritical: true,
      };
    case TsTxType.AUCTION_LEND:
      const out_al = Buffer.concat([
        padAndToBuffer(txTransferReq.reqType, 1),
        padAndToBuffer(txTransferReq.L2AddrFrom, 4),
        padAndToBuffer(txTransferReq.L2TokenAddr, 2),
        padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2),padAndToBuffer(txTransferReq.amount, 16),
      ], CHUNK_BYTES_SIZE * 3);
      return {
        r_chunks: Buffer.concat([out_al], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: out_al,
        isCritical: false,
      };
    case TsTxType.AUCTION_BORROW:
      const out_ab = Buffer.concat([
        padAndToBuffer(txTransferReq.reqType, 1),
        padAndToBuffer(txTransferReq.L2AddrFrom, 4),
        padAndToBuffer(txTransferReq.L2TokenAddr, 2),
        padAndToBuffer(txTransferReq.L2TokenLeafIdFrom, 2),padAndToBuffer(txTransferReq.amount, 16),
      ], CHUNK_BYTES_SIZE * 3);
      return {
        r_chunks: Buffer.concat([out_ab], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: out_ab,
        isCritical: false,
      };
    // TODO: add more tx types
    case TsTxType.UNKNOWN:
    default:
      return {
        r_chunks: Buffer.concat([
          padAndToBuffer(txTransferReq.reqType, 1),
        ], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([
          padAndToBuffer(txTransferReq.reqType, 1),
        ], CHUNK_BYTES_SIZE * 1),
        isCritical: false,
      };
  }
  
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