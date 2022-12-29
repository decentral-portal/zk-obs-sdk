import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from './ts-types';

export type TsApiResponsePayload<T> = {
    status: number,
    data: T,
    error?: string,
}

export type EdDSASignatureRequestType = {
    R8: [string, string],
    S: string
}

export interface ITxRequest {
    reqType: TsTxType;
}

export interface TsTxSignaturePayload {
    eddsaSig: EdDSASignatureRequestType;
    ecdsaSig?: string;
}

/** Client Request Types */

/** Register */
export interface TsTxRegisterRequest extends ITxRequest {
  tokenId: TsTokenAddress;
  stateAmt: string;
  nonce: string;
  sender: string;
  tsAddr: string;
}

/** Deposit */
export interface TsTxDepositNonSignatureRequest extends ITxRequest {
  tokenId: TsTokenAddress;
  stateAmt: string;
  nonce: string;
  sender: string;
}
export interface TsTxDepositRequest extends TsTxDepositNonSignatureRequest, TsTxSignaturePayload {
}

/** Withdraw */
export interface TsTxWithdrawNonSignatureRequest extends ITxRequest {
  sender: string;
  tokenId: TsTokenAddress;
  stateAmt: string;
  nonce: string;
}
export interface TsTxWithdrawRequest extends TsTxWithdrawNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
  buyAmt: string;
}
export interface TsTxLimitOrderRequest extends TsTxLimitOrderNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitStartNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitStartRequest extends TsTxLimitStartNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitExchangeRequest extends TsTxLimitExchangeNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitEndRequest extends TsTxLimitEndNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
  buyAmt: string;
}
export interface TsTxMarketOrderRequest extends TsTxMarketOrderNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketExchangeRequest extends TsTxMarketExchangeNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketEndRequest extends TsTxMarketEndNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxCancelOrderNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxCancelOrderRequest extends TsTxCancelOrderNonSignatureRequest, TsTxSignaturePayload { }

