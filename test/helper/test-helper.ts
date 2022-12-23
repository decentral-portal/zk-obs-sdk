import fs from 'fs';
import { TsRollupConfigType } from '../../lib/ts-rollup/ts-rollup';
import { TsDefaultValue, TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../../lib/ts-types/ts-types';
export class CircuitInputsExporter {

  config: any;
  mainSuffix: any;
  registerSuffix: any;
  outputPath: any;
  circuitMainPath: any;
  // circuitRegisterPath: any;
  mainCircuitName: any;
  // registerCircuitName: any;
  constructor(
    _mainCircuitName: any,
    // _registerCircuitName: any,
    _config: any,
    _mainSuffix: any,
    _registerSuffix: any,
    _outputPath: any,
    _circuitMainPath: any,
    // _circuitRegisterPath: any,
  ) {
    this.mainCircuitName = _mainCircuitName;
    // this.registerCircuitName = _registerCircuitName;
    this.config = _config;
    this.mainSuffix = _mainSuffix;
    this.registerSuffix = _registerSuffix;
    this.outputPath = _outputPath;
    this.circuitMainPath = _circuitMainPath;
    // this.circuitRegisterPath = _circuitRegisterPath;
  }
  fileLogs: Array<{
    circuitName: string;
    name: string;
    path: string;
  }> = [];
  exportInputs(_name: string, inputs: any, circuitName: string) {
    const name = `${this.fileLogs.length}_${_name}`;
    const path = `${this.outputPath}/${name}-inputs.json`;
    if (!fs.existsSync(this.outputPath)){
      const pathname = this.outputPath.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
      fs.mkdirSync(pathname, { recursive: true });
    }
    fs.writeFileSync(path, JSON.stringify(inputs, null, 2));
    this.fileLogs.push({
      circuitName,
      name,
      path
    });
  }

  exportOthers(name: string, data: object) {
    fs.writeFileSync(`${this.outputPath}/${name}.json`, JSON.stringify(data, null, 2));
  }

  exportInfo(data: any = {}) {
    const info = {
      mainCircuitName: this.mainCircuitName,
      // registerCircuitName: this.registerCircuitName,
      config: this.config,
      mainSuffix: this.mainSuffix,
      registerSuffix: this.registerSuffix,
      outputPath: this.outputPath,
      circuitMainPath: this.circuitMainPath,
      // circuitRegisterPath: this.circuitRegisterPath,
      fileLogs: this.fileLogs,
      metadata: {
        TsSystemAccountAddress: TsSystemAccountAddress,
        TsTokenAddress: TsTokenAddress,
        TsDefaultValue: TsDefaultValue,
        TsTxType: TsTxType,
      },
      ...data,
    };
    fs.writeFileSync(`${this.outputPath}/info.json`, JSON.stringify(info, null, 2));
  }
}


export const TX_TYPES = {
  REGISTER: 'register',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRANSFER: 'transfer',
  AUCTION_LEND: 'auctionLend',
  AUCTION_BORROW: 'auctionBorrow',
  AUCTION_CANCEL: 'auctionCancel',
};

export const authTypedData = {
  domain: {
    name: 'Term Structure',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000'
  },
  types: {
    Main: [
      { name: 'Authentication', type: 'string' },
      { name: 'Action', type: 'string' },
    ],
  },
  value: {
    Authentication: 'Term Structure',
    Action: 'Authenticate on Term Structure',
  },
};

export const getWdTypedData = (L2AddrFrom: string, L2AddrTo: string, L2TokenAddr: string, amount: string, nonce: string) => {
  return {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
        { name: 'Sender', type: 'string' },
        { name: 'Receiver', type: 'string' },
        { name: 'Token', type: 'string' },
        { name: 'Amount', type: 'string' },
        { name: 'Nonce', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Withdraw Request',
      Sender: L2AddrFrom,
      Receiver: L2AddrTo,
      Token: L2TokenAddr,
      Amount: amount,
      Nonce: nonce,
    }
  };
};

export const getTrfTypedData = (L2AddrFrom: string, L2AddrTo: string, L2TokenAddr: string, amount: string, nonce: string) => {
  return {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
        { name: 'Sender', type: 'string' },
        { name: 'Receiver', type: 'string' },
        { name: 'Token', type: 'string' },
        { name: 'Amount', type: 'string' },
        { name: 'Nonce', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Transfer Request',
      Sender: L2AddrFrom,
      Receiver: L2AddrTo,
      Token: L2TokenAddr,
      Amount: amount,
      Nonce: nonce,
    }
  };
};

export const getAuctionLendTypedData = (L2AddrFrom: string, L2TokenAddrLending: string, lendingAmt: string, nonce: string, maturityDate: string, expiredTime: string, interest: string) => {
  return {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
        { name: 'L2AddrSender', type: 'string' },
        { name: 'L2AddrReceiver', type: 'string' },
        { name: 'L2TokenAddrLending', type: 'string' },
        { name: 'LendingAmount', type: 'string' },
        { name: 'Nonce', type: 'string' },
        { name: 'MaturityDate', type: 'string' },
        { name: 'ExpiredTime', type: 'string' },
        { name: 'Interest', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Place Auction Lend Request',
      L2AddrSender: L2AddrFrom,
      L2AddrReceiver: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddrLending: L2TokenAddrLending,
      LendingAmount: lendingAmt,
      Nonce: nonce,
      MaturityDate: maturityDate,
      ExpiredTime: expiredTime,
      Interest: interest,
    }
  };
};

export const getAuctionBorrowTypedData = (L2AddrFrom: string, L2TokenAddrCollateral: string, collateralAmt: string, nonce: string, maturityDate: string, expiredTime: string, interest: string, L2TokenAddrBorrowing: string, borrowingAmt: string) => {
  return {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
        { name: 'L2AddrSender', type: 'string' },
        { name: 'L2AddrReceiver', type: 'string' },
        { name: 'L2TokenAddrCollateral', type: 'string' },
        { name: 'CollateralAmount', type: 'string' },
        { name: 'Nonce', type: 'string' },
        { name: 'MaturityDate', type: 'string' },
        { name: 'ExpiredTime', type: 'string' },
        { name: 'Interest', type: 'string' },
        { name: 'L2TokenAddrBorrowing', type: 'string' },
        { name: 'BorrowingAmount', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Place Auction Borrow Request',
      L2AddrSender: L2AddrFrom,
      L2AddrReceiver: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddrCollateral: L2TokenAddrCollateral,
      CollateralAmount: collateralAmt,
      Nonce: nonce,
      MaturityDate: maturityDate,
      ExpiredTime: expiredTime,
      Interest: interest,
      L2TokenAddrBorrowing: L2TokenAddrBorrowing,
      BorrowingAmount: borrowingAmt,
    }
  };
};

export const getAuctionCancelTypedData = (L2AddrTo: string, L2TokenAddrRefunded: string, amount: string, nonce: string, orderLeafId: string) => {
  return {
    domain: {
      name: 'Term Structure',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    types: {
      Main: [
        { name: 'Authentication', type: 'string' },
        { name: 'Action', type: 'string' },
        { name: 'L2AddrSender', type: 'string' },
        { name: 'L2AddrReceiver', type: 'string' },
        { name: 'L2TokenAddrRefunded', type: 'string' },
        { name: 'Amount', type: 'string' },
        { name: 'Nonce', type: 'string' },
        { name: 'OrderId', type: 'string' },
      ],
    },
    value: {
      Authentication: 'Term Structure',
      Action: 'Cancel Auction Order Request',
      L2AddrSender: TsSystemAccountAddress.AUCTION_ADDR,
      L2AddrReceiver: L2AddrTo,
      L2TokenAddrRefunded: L2TokenAddrRefunded,
      Amount: amount,
      Nonce: nonce,
      OrderId: orderLeafId,
    }
  };
};


export function createMainCircuit(circuitMainPath: string, config: TsRollupConfigType) {
  console.log('createMainCircuit', circuitMainPath);
  if(!fs.existsSync(circuitMainPath)) {
    const pathArr = circuitMainPath.split('/');
    pathArr.pop();
    fs.mkdirSync(pathArr.join('/'), { recursive: true });
  }
  fs.writeFileSync(circuitMainPath, 
    `pragma circom 2.1.2;

include "../../circuits/phase5/normal.circom";  
component main = Normal(${config.order_tree_height},${config.l2_acc_addr_size},${config.token_tree_height});
`);
  return circuitMainPath;
}

export function createMainCircuitV4(circuitMainPath: string, config: TsRollupConfigType) {
  console.log('createMainCircuit', circuitMainPath);
  if(!fs.existsSync(circuitMainPath)) {
    const pathArr = circuitMainPath.split('/');
    pathArr.pop();
    fs.mkdirSync(pathArr.join('/'), { recursive: true });
  }
  fs.writeFileSync(circuitMainPath, 
    `pragma circom 2.1.2;

include "../../circuits/phase4/normal.circom";  
component main { public [tokenLeafIdFrom, tokenLeafIdTo, txL2AddrFrom, txL2AddrTo, txL2TokenAddr, txAmount] } = Normal(${config.normal_batch_height},${config.l2_acc_addr_size},${config.token_tree_height},${config.order_tree_height});
`);
  return circuitMainPath;
}
export function createRegisterCircuitV4(circuitRegisterPath: string, config: TsRollupConfigType) {
  console.log('createRegisterCircuit', circuitRegisterPath);
  if(!fs.existsSync(circuitRegisterPath)) {
    const pathArr = circuitRegisterPath.split('/');
    pathArr.pop();
    fs.mkdirSync(pathArr.join('/'), { recursive: true });
  }
  fs.writeFileSync(circuitRegisterPath, 
    `pragma circom 2.1.2;

include "../../circuits/phase4/register.circom";  
component main { public [L2Addr, tsPubKey, L2TokenAddr, amount] }  = Register(${config.register_batch_size},${config.l2_acc_addr_size},${config.token_tree_height});
`);
  return circuitRegisterPath;
}