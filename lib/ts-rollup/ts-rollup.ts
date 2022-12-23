import { recursiveToString } from '../helper';
import { TsMerkleTree } from '../merkle-tree-dp';
import { TsRollupCircuitInputItemType, TsRollupCircuitInputType } from '../ts-types/ts-circuit-types';
import { TsAccountLeafType, TsTokenLeafType } from '../ts-types/ts-merkletree.types';
import { TsTxWithdrawRequest, TsTxTransferRequest, TsTxRegisterRequest, TsTxDepositNonSignatureRequest, TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest, TsTxDepositRequest, ITxRequest, TsTxTransferNonSignatureRequest } from '../ts-types/ts-req-types';
import { CHUNK_BITS_SIZE, CHUNK_BYTES_SIZE, getOChunksSize, LEN_OF_REQUEST, MAX_CHUNKS_PER_REQ, TsDefaultValue, TsSystemAccountAddress, TsTokenAddress, TsTokenInfo, TsTxType } from '../ts-types/ts-types';
import { TsRollupAccount, TsRollupSigner } from './ts-account';
import { ITsAuctionOrder, TsAuctionLendOrder, TsAuctionEmptyOrder, TsAuctionBorrowOrder } from './ts-auction-order';
import { RESERVED_ACCOUNTS } from './ts-env';
import { toTreeLeaf, tsHashFunc } from './ts-helper';
import { bigint_to_chunk_array, encodeRChunkBuffer, encodeTokenLeaf, encodeTxTransferMessage, getEmptyMainTx, getEmptyRegisterTx, toBigIntChunkArray, txsToRollupCircuitInput } from './ts-tx-helper';

export type TsRollupConfigType = {
    normal_batch_height: number,
    register_batch_size: number,
    l2_acc_addr_size: number,
    l2_token_addr_size: number,
    token_tree_height: number,
    order_tree_height: number,
    isPendingRollup: boolean,

    auction_market_count: number,
    auction_lender_count: number,
    auction_borrower_count: number,
}

interface CircuitAccountTxPayload { 
  r_accountLeafId: any[],
  r_oriAccountLeaf: Array<TsAccountLeafType>,
  r_newAccountLeaf: Array<TsAccountLeafType>,
  r_accountRootFlow: any[],
  r_accountMkPrf: Array<string[]>,
  r_tokenLeafId: string[],
  r_oriTokenLeaf: TsTokenLeafType[],
  r_newTokenLeaf: TsTokenLeafType[],
  r_tokenRootFlow: Array<string[]>,
  r_tokenMkPrf: Array< string[]>
}
interface CircuitOrderTxPayload { 
  r_orderLeafId: string[],
  r_oriOrderLeaf: Array<string[] | bigint[]>,
  r_newOrderLeaf: Array<string[] | bigint[]>,
  r_orderRootFlow: string[],
  r_orderMkPrf: Array<string[]>,
}

export enum RollupStatus {
    Unknown = 0,
    Idle,
    Running,
}

export enum RollupCircuitType {
  Unknown = 0,
  Register = 1,
  Transfer = 2,
}

export class RollupCore {
  // TODO: amt_size, l2_token_addr_size
  public config: TsRollupConfigType = {
    normal_batch_height: 0,
    register_batch_size: 1,
    l2_acc_addr_size: 12,
    l2_token_addr_size: 8,
    token_tree_height: 8,
    order_tree_height: 24,
    isPendingRollup: false,
    auction_market_count: 1,
    auction_lender_count: 100,
    auction_borrower_count: 100,
  };
  get txNormalPerBatch() {
    return 2 ** this.config.normal_batch_height;
  }
  get txRegisterPerBatch() {
    return this.config.register_batch_size;
  }

  public get stateRoot() {
    return tsHashFunc([this.auctionOrderTree.getRoot(), this.mkAccountTree.getRoot(), `0x${this.txId.toString()}`]);
  }
  public rollupStatus: RollupStatus = RollupStatus.Idle;

  // TODO: account state in Storage
  public accountList: TsRollupAccount[] = [];
  public mkAccountTree!: TsMerkleTree;
  get currentAccountAddr() {
    return this.accountList.length;
  }

  // TODO: auction order in Storage
  // leafId = 0 always be empty
  private auctionOrderMap: {[k: number | string]: ITsAuctionOrder} = {};
  public auctionOrderTree!: TsMerkleTree;
  private currentAuctionOrderId = 1; // 0 is default empty order

  /** Block information */
  public blockNumber = 0n;
  public txId = 0n;
  private currentTxLogs: any[] = [];
  private currentAccountRootFlow: bigint[] = [];
  private currentAuctionOrderRootFlow: bigint[] = [];
  /** Transaction Information */
  private currentAccountReqIndex = 0;
  private currentAccountPayload: CircuitAccountTxPayload = this.prepareTxAccountPayload();
  private currentOrderPayload: CircuitOrderTxPayload = this.prepareTxOrderPayload();


  private blockLogs: Map<string, {
        logs: any[],
        accountRootFlow: bigint[]
        auctionOrderRootFlow: bigint[]
    }> = new Map();
  // TODO: add rollup circuit logs
  public defaultTokenLeaf: [bigint, bigint, bigint] = [0n, 0n, 0n];
  public defaultTokenTree!: TsMerkleTree;
  public defaultTokenRoot!: bigint;
  public defaultAccountLeafData!: [bigint, bigint, bigint];
  public defaultOrder = new TsAuctionEmptyOrder();
  public defailtOrderLeafHash = this.defaultOrder.encodeOrderLeaf();
  constructor(config: Partial<TsRollupConfigType>) {
    this.config = {...this.config, ...config};
        
    this.defaultTokenTree = new TsMerkleTree(
      [],
      this.config.token_tree_height, tsHashFunc,
      toTreeLeaf(this.defaultTokenLeaf)
    );
    this.defaultTokenRoot = BigInt(this.defaultTokenTree.getRoot());
    this.defaultAccountLeafData = [0n, 0n, this.defaultTokenRoot];
    this.initAccountTree();
    this.initAuctionOrderTree();

  }

  private initAccountTree() {
    this.mkAccountTree = new TsMerkleTree(
      this.accountList.map(a => toTreeLeaf(a.encodeAccountLeaf())),
      this.config.l2_acc_addr_size, tsHashFunc,
      toTreeLeaf(this.defaultAccountLeafData)
    );

    /**
     * Initial system accounts
     * 0: L2BurnAccount
     * 1: L2MintAccount
     * 2: L2AuctionAccount
     * ~100: RESERVED_ACCOUNTS, reserve system accounts 
     */
    const systemAccountNum = Number(RESERVED_ACCOUNTS);
    for (let index = 0; index < systemAccountNum; index++) {
      // INFO: Default token Tree
      this.addAccount(index, new TsRollupAccount(
        [{
          tokenAddr: TsTokenAddress.Unknown,
          amount: 0n,
          lockAmt: 0n,
        }],
        this.config.token_tree_height,
        [0n, 0n],
      ));
    }

    // TODO: initial registered accounts from storage.
  }

  private initAuctionOrderTree() {
    this.auctionOrderMap[0] = this.defaultOrder;
    this.auctionOrderTree = new TsMerkleTree(
      Object.entries(this.auctionOrderMap).sort((a, b) => Number(a[0]) - Number(b[0])).map((o) => o[1].encodeOrderLeaf()),
      this.config.order_tree_height,
      tsHashFunc,
      this.defailtOrderLeafHash
    );
  }

  /** Auction */
  getOrderMap() {
    return this.auctionOrderMap;
  }

  getAuctionOrder(orderId: number): ITsAuctionOrder {
    return this.auctionOrderMap[orderId] || new TsAuctionEmptyOrder() ;
  }

  async addAuctionOrder(reqType: TsTxType, txId: bigint, req: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest): Promise<number> {
    const time = Date.now();
    if(reqType === TsTxType.AUCTION_LEND) {
      const orderId = this.currentAuctionOrderId;
      const order = new TsAuctionLendOrder(orderId, txId, req as TsTxAuctionLendRequest, time);
      this.updateAccountToken(BigInt(req.L2AddrFrom), order.L2TokenAddrLending as TsTokenAddress, -order.lendingAmt, true);
      // TODO: wrap auctio order tree logic;
      const leaf = order.encodeOrderLeaf();
      this.auctionOrderMap[orderId] = order;
      this.auctionOrderTree.updateLeafNode(orderId, leaf);
      this.currentAuctionOrderId++;
      return orderId;
    } 
    if(reqType === TsTxType.AUCTION_BORROW) {
      const orderId = this.currentAuctionOrderId;
      const order = new TsAuctionBorrowOrder(orderId, txId, req as TsTxAuctionBorrowRequest, time);
      this.updateAccountToken(BigInt(req.L2AddrFrom), order.L2TokenAddrCollateral as TsTokenAddress, -order.collateralAmt, true);
      // TODO: wrap auctio order tree logic;
      const leaf = order.encodeOrderLeaf();
      this.auctionOrderMap[orderId] = order;
      this.auctionOrderTree.updateLeafNode(orderId, leaf);
      this.currentAuctionOrderId++;
      return orderId;
    }
    throw new Error(`Invalid auction reqType (${reqType})`);
  }

  async cancelAuctionOrder(reqType: TsTxType, req: TsTxAuctionCancelRequest): Promise<number> {
    if(reqType === TsTxType.AUCTION_CANCEL) {
      const _req = req as TsTxAuctionCancelRequest;
      const orderId = Number(_req.orderLeafId);
      const order = this.auctionOrderMap[orderId];
      if(!order) {
        throw new Error(`auction order id=${orderId} not found`);
      }
      // check all order parameter are same
      if(order.reqType === TsTxType.AUCTION_LEND) {
        const _order = order as TsAuctionLendOrder;
        if(
          _order.L2AddrFrom !== BigInt(_req.L2AddrTo)
          || _order.L2AddrTo !== String(_req.L2AddrFrom)
          || _order.L2TokenAddrLending !== _req.L2TokenAddrRefunded as TsTokenAddress
          || _order.lendingAmt !== BigInt(_req.amount)
        ) {
          console.error({
            _order,
            _req,
          });
          throw new Error(`auction lend order id=${orderId} parameter not match`);
        }
      }
      if(order.reqType === TsTxType.AUCTION_BORROW) {
        const _order = order as TsAuctionBorrowOrder;
        if(
          _order.L2AddrFrom !== BigInt(_req.L2AddrTo)
          || _order.L2AddrTo !== String(_req.L2AddrFrom)
          || _order.L2TokenAddrCollateral !== _req.L2TokenAddrRefunded as TsTokenAddress
          || _order.collateralAmt !== BigInt(_req.amount)
        ) {
          console.error({
            _order,
            _req,
          });
          throw new Error(`auction lend order id=${orderId} parameter not match`);
        }
      }
      this.updateAccountToken(BigInt(_req.L2AddrTo), _req.L2TokenAddrRefunded as TsTokenAddress, BigInt(_req.amount), true);
      const newOrder = new TsAuctionEmptyOrder();
      this.auctionOrderMap[orderId] = newOrder;
      this.auctionOrderTree.updateLeafNode(orderId, newOrder.encodeOrderLeaf());
      return orderId;
    }
    throw new Error(`Invalid auction reqType (${reqType})`);
  }

  /** Account */
  getAccount(accAddr: bigint): TsRollupAccount | null {
    const acc = this.accountList[Number(accAddr)];

    if(!acc) {
      return null;
    }
    // TODO: need to Throw error?
    // throw new Error('Account not found');
    // }

    return acc;
  }

  getAccountProof(accAddr: bigint) {
    return this.mkAccountTree.getProof(Number(accAddr));
  }

  addAccount(l2addr: number, account: TsRollupAccount): number {
    if(this.currentAccountAddr !== 0 && l2addr.toString() === TsSystemAccountAddress.BURN_ADDR) {
      // TODO: for empty main tx request
      return 0;
    }
    if(this.currentAccountAddr !== l2addr) {
      throw new Error(`addAccount: l2addr=${l2addr} not match l2 account counter (${this.currentAccountAddr})`);
    }
    this.accountList.push(account);
    account.setAccountAddress(BigInt(l2addr));
    this.mkAccountTree.updateLeafNode(
      this.currentAccountAddr - 1,
      toTreeLeaf(account.encodeAccountLeaf()),
    );
    return l2addr;
  }

  private updateAccountToken(accountId: bigint, tokenAddr: TsTokenAddress, tokenAmt: bigint, isAuction: boolean) {
    const acc = this.getAccount(accountId);
    if(!acc) {
      throw new Error(`updateAccountToken: account id=${accountId} not found`);
    }
    const newTokenRoot = acc.updateToken(tokenAddr, tokenAmt, isAuction);
    this.mkAccountTree.updateLeafNode(
      Number(accountId),
      toTreeLeaf(acc.encodeAccountLeaf()),
    );
    return {
      newTokenRoot,
    };
  }

  /** Rollup trace */
  private addFirstRootFlow() {
    if(this.currentAccountRootFlow.length !== 0 
      || this.currentAuctionOrderRootFlow.length !== 0) {
      throw new Error('addFirstRootFlow must run on new block');
    }
    this.addAccountRootFlow();
    this.addOrderRootFlow();
  }

  private flushBlock(blocknumber: bigint) {
    if(this.blockLogs.has(blocknumber.toString())) {
      throw new Error(`Block ${blocknumber} already exist`);
    }
    const logs = {...this.currentTxLogs};
    const accountRootFlow = [...this.currentAccountRootFlow];
    const auctionOrderRootFlow = [...this.currentAuctionOrderRootFlow];
    this.blockNumber = blocknumber;
    this.currentAccountRootFlow = [];
    this.currentAuctionOrderRootFlow = [];
    this.currentTxLogs = [];

    this.currentAccountReqIndex = 0;
    this.currentAccountPayload = this.prepareTxAccountPayload();
    this.currentOrderPayload = this.prepareTxOrderPayload();


    this.blockLogs.set(blocknumber.toString(), {
      logs,
      accountRootFlow,
      auctionOrderRootFlow,
    });
  }

  private addAccountRootFlow() {
    this.currentAccountRootFlow.push(BigInt(this.mkAccountTree.getRoot()));
  }

  private addOrderRootFlow() {
    this.currentAuctionOrderRootFlow.push(BigInt(this.auctionOrderTree.getRoot()));
  }

  private addTxLogs(detail: any) {
    this.currentTxLogs.push(detail);
  }

  /** Rollup Transaction */
  // TODO: refactor method to retrict RollupCircuitType
  async startRollup(callback: (that: RollupCore, blockNumber: bigint) => Promise<void>, rollupType: RollupCircuitType): Promise<{
    blockNumber: bigint,
    inputs?: TsRollupCircuitInputType,
  }> {
    const perBatch = rollupType === RollupCircuitType.Register ? this.txRegisterPerBatch : this.txNormalPerBatch;
    if(this.config.isPendingRollup) {
      // TODO: dangerous: need handle concurrent requests
      const newBlockNumber = this.blockNumber + 1n;
      this.addFirstRootFlow();
      await callback(this, newBlockNumber);
      this.flushBlock(newBlockNumber);
      return {
        blockNumber: newBlockNumber,
      };
    } else {
      if(this.rollupStatus === RollupStatus.Running) {
        throw new Error('Rollup is running');
      }
      this.rollupStatus = RollupStatus.Running;

      const newBlockNumber = this.blockNumber + 1n;
      this.addFirstRootFlow();
      // TODO: rollback state if callback failed
      await callback(this, newBlockNumber);
      if(this.currentTxLogs.length !== perBatch) {
        // TODO: handle empty transactions
        // throw new Error(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
        console.warn(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
        const emptyTxNum = perBatch - this.currentTxLogs.length;
        for(let i = 0; i < emptyTxNum; i++) {
          rollupType === RollupCircuitType.Register
            ? await this.doRegister(getEmptyRegisterTx())
            : await this.doDeposit(getEmptyMainTx());
        }
      }

      this.addAccountRootFlow();
      this.addOrderRootFlow();
      // const circuitInputs = exportTransferCircuitInput(this.currentTxLogs, this.txId, this.currentAccountRootFlow, this.currentAuctionOrderRootFlow);
      const circuitInputs = txsToRollupCircuitInput(this.currentTxLogs) as any;
      // TODO: type check

      circuitInputs['o_chunks'] = circuitInputs['o_chunks'].flat();
      circuitInputs['isCriticalChunk'] = circuitInputs['isCriticalChunk'].flat();

      circuitInputs['oriTxNum'] = this.txId.toString();
      circuitInputs['accountRootFlow'] = this.currentAccountRootFlow.map(x => recursiveToString(x));
      circuitInputs['orderRootFlow'] = this.currentAuctionOrderRootFlow.map(x => recursiveToString(x));
      this.txId = this.txId + BigInt(this.currentTxLogs.length);
      this.flushBlock(newBlockNumber);
      this.rollupStatus = RollupStatus.Idle;

      return {
        blockNumber: newBlockNumber,
        inputs: circuitInputs,
      };
    }
  }

  private prepareTxAccountPayload() {
    return {
      r_accountLeafId: [],
      r_oriAccountLeaf: [],
      r_newAccountLeaf: [],
      r_accountRootFlow: [],
      r_accountMkPrf: [],
      r_tokenLeafId: [],
      r_oriTokenLeaf: [],
      r_newTokenLeaf: [],
      r_tokenRootFlow: [],
      r_tokenMkPrf: [],
    } as CircuitAccountTxPayload;
  }

  private accountBeforeUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if(!account) {
      this.currentAccountPayload.r_accountLeafId.push(accountLeafId);
  
      this.currentAccountPayload.r_oriAccountLeaf.push(this.defaultAccountLeafData);
      this.currentAccountPayload.r_accountRootFlow.push([
        this.mkAccountTree.getRoot()
      ]);
      this.currentAccountPayload.r_accountMkPrf.push(this.getAccountProof(accountLeafId));
      this.currentAccountPayload.r_tokenRootFlow.push([
        `0x${this.defaultTokenRoot.toString(16)}`
      ]);
      
      this.currentAccountPayload.r_tokenLeafId.push('0x00');
      this.currentAccountPayload.r_oriTokenLeaf.push(this.defaultTokenLeaf);
      this.currentAccountPayload.r_tokenMkPrf.push(this.defaultTokenTree.getProof(0));
    } else {

      const tokenInfo = account.getTokenLeaf(tokenAddr);
      this.currentAccountPayload.r_accountLeafId.push(accountLeafId);
  
      this.currentAccountPayload.r_oriAccountLeaf.push(account.encodeAccountLeaf());
      this.currentAccountPayload.r_accountRootFlow.push([
        this.mkAccountTree.getRoot()
      ]);
      this.currentAccountPayload.r_accountMkPrf.push(this.getAccountProof(accountLeafId));
      this.currentAccountPayload.r_tokenRootFlow.push([
        account.getTokenRoot()
      ]);
      
      this.currentAccountPayload.r_tokenLeafId.push(tokenInfo.leafId.toString());
      this.currentAccountPayload.r_oriTokenLeaf.push(encodeTokenLeaf(tokenInfo.leaf));
      this.currentAccountPayload.r_tokenMkPrf.push(account.tokenTree.getProof(tokenInfo.leafId));
    }

  }


  private accountAfterUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if(!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const tokenInfo = account.getTokenLeaf(tokenAddr);
    const idx = this.currentAccountPayload.r_accountRootFlow.length -1;
    this.currentAccountPayload.r_newAccountLeaf.push(account.encodeAccountLeaf());
    this.currentAccountPayload.r_accountRootFlow[idx].push(
      this.mkAccountTree.getRoot()
    );
    this.currentAccountPayload.r_newTokenLeaf.push(encodeTokenLeaf(tokenInfo.leaf));

    this.currentAccountPayload.r_tokenRootFlow[idx].push(
      account.getTokenRoot()
    );

  }

  private orderBeforeUpdate(orderLeafId: number) {
    this.currentOrderPayload.r_orderLeafId.push(orderLeafId.toString());

    this.currentOrderPayload.r_oriOrderLeaf.push(this.getAuctionOrder(orderLeafId).encode());
    this.currentOrderPayload.r_orderRootFlow.push(
      BigInt(this.auctionOrderTree.getRoot()).toString()
    );
    this.currentOrderPayload.r_orderMkPrf.push(this.auctionOrderTree.getProof(orderLeafId));

  }

  private orderAfterUpdate(orderLeafId: number) {
    this.currentOrderPayload.r_newOrderLeaf.push(this.getAuctionOrder(orderLeafId).encode());
    this.currentOrderPayload.r_orderRootFlow.push(
      BigInt(this.auctionOrderTree.getRoot()).toString()
    );
  }

  private prepareTxOrderPayload() {
    return {
      r_orderLeafId: [],
      r_oriOrderLeaf: [],
      r_newOrderLeaf: [],
      r_orderRootFlow: [],
      r_orderMkPrf: [],
    } as CircuitOrderTxPayload;
  }

  private async _normalCircuit(reqType: TsTxType, txTransferReq: TsTxTransferRequest, reqData: bigint[], rawReq: {[k: string]: string}) {
    if(!txTransferReq.eddsaSig) {
      throw new Error('Signature is undefined');
    }
    const txId = this.txId + BigInt(this.currentTxLogs.length);
    const txTo = BigInt(txTransferReq.L2AddrTo);
    const txAmount = BigInt(txTransferReq.amount);
    const txL2TokenAddr = BigInt(txTransferReq.L2TokenAddr);

    const isAuction = reqType === TsTxType.AUCTION_LEND || reqType === TsTxType.AUCTION_BORROW || reqType === TsTxType.AUCTION_CANCEL;
    let orderLeafId = 0;
    switch (reqType) {
      case TsTxType.AUCTION_LEND:
      case TsTxType.AUCTION_BORROW:
        orderLeafId = this.currentAuctionOrderId;
        break;
      case TsTxType.AUCTION_CANCEL:
        orderLeafId = Number(reqData[6]);
        break;
      default:
        orderLeafId = 0;
        break;
    }
    // const from = this.getAccount(BigInt(txTransferReq.L2AddrTo));
    // const txNonce = from.isNormalAccount ? BigInt(txTransferReq.nonce) : 0n;
    // const to = this.getAccount(BigInt(txTransferReq.L2AddrTo));

    // const txTransfer = new RollupTxTransfer(reqType, from, to, txTransferReq.L2TokenAddr, BigInt(txTransferReq.amount), BigInt(txTransferReq.nonce), args, txTransferReq.eddsaSig);
    // const txBaseDatas = txTransfer.encodeCircuitInputData(isAuction);        

    // UpdateState Procedures:
    // 1. Extract Sender merkle proof
    // const r_oriAccountLeaf = [
    //   from.encodeAccountLeaf() // , to.encodeAccountLeaf(),
    // ];
    // const r_newAccountLeaf = [];
    // const r_accountRootFlow: [ string[], string[] ] = [
    //   [], // sender
    //   [], // receiver
    // ];
    // r_accountRootFlow[0].push(this.mkAccountTree.getRoot());

    // const oriTokenRootFrom = from.getTokenRoot(); //*
    // const tokenMerkleProofFrom = from.tokenTree.getProof(from.getTokenLeafId(txTransferReq.L2TokenAddr));
    // // const oriOrderLeaf = this.auctionOrderTree.getLeaf(orderLeafId);
    // const orderMerkleProofTo = this.auctionOrderTree.getProof(orderLeafId);
    // // const fromTokenInfo = from.getTokenLeaf(txL2TokenAddr.toString() as TsTokenAddress);
    // // const r_oriTokenLeaf = [
    // //   encodeTokenLeaf(fromTokenInfo.leaf)
    // // ];
    // const r_oriOrderLeaf = this.getAuctionOrder(orderLeafId).encode();
    // for (let index = reqData.length; index < LEN_OF_REQUEST; index++) {
    //   reqData.push(TsDefaultValue.BIGINT_DEFAULT_VALUE);
    // }
    // txTransferReq.L2TokenLeafIdFrom = fromTokenInfo.leafId.toString();

    // const accountMerkleProofFrom = this.getAccountProof(from.L2Address);

    // 2. SENDER: update sender Leaf
    // let newTokenRootFrom: string;
    // if(from.isNormalAccount) {
    //   // const newNonceFrom = from.isNormalAccount ? txNonce + 1n : 0n;
    //   // from.updateNonce(newNonceFrom);
    //   if(isAuction && reqType !== TsTxType.AUCTION_CANCEL) {
    //     await this.addAuctionOrder(reqType, txId, rawReq as unknown as TsTxAuctionLendRequest | TsTxAuctionBorrowRequest);
    //   } else {
    //     // this.updateAccountToken(txL2TokenAddr, from.getTokenLeaf(txTransferReq.L2TokenAddr).leaf.tokenAddr, - txAmount, false);
    //   }
    //   newTokenRootFrom = from.getTokenRoot();
    // } else {
    //   newTokenRootFrom = oriTokenRootFrom;
    // }

    
    // 3. SENDER: add RootFlow
    // r_newAccountLeaf.push(from.encodeAccountLeaf());
    // r_accountRootFlow[1].push(this.mkAccountTree.getRoot());
    // this.addAccountRootFlow();
    // const r_newTokenLeaf = [encodeTokenLeaf(from.getTokenLeaf(txTransferReq.L2TokenAddr).leaf)];
    // const r_newOrderLeaf = this.getAuctionOrder(orderLeafId).encode();


    // 4. RECEIVER: Extract receiver merkle proof
    // const accountMerkleProofTo = this.getAccountProof(txTo);
    // const oriTokenRootTo = to.getTokenRoot();
    // const tokenMerkleProofTo = to.tokenTree.getProof(to.getTokenLeafId(txTransferReq.L2TokenAddr));
    // const toTokenInfo = to.getTokenLeaf(txL2TokenAddr.toString() as TsTokenAddress);
    // txTransferReq.L2TokenLeafIdTo = toTokenInfo.leafId.toString();

    // 5. RECEIVER: update receiver Lea
    // let newTokenRootTo: string;
    // if(to.isNormalAccount) {
    //   if(isAuction && reqType === TsTxType.AUCTION_CANCEL) {
    //     await this.cancelAuctionOrder(reqType, rawReq as unknown as TsTxAuctionCancelRequest);
    //   } else {
    //     const newL2TokenAddrTo = to.isNormalAccount ? txTransferReq.L2TokenAddr : TsTokenAddress.Unknown;
    //     this.updateAccountToken(txTo, newL2TokenAddrTo, txAmount, false);
    //   }
    //   newTokenRootTo = to.getTokenRoot();
    // } else {
    //   newTokenRootTo = oriTokenRootTo;
    // }
        
    // 6. RECEIVER: add RootFlow
    // r_oriTokenLeaf.push(encodeTokenLeaf(toTokenInfo.leaf));

    // r_oriAccountLeaf.push(to.encodeAccountLeaf());
    // r_newAccountLeaf.push(to.encodeAccountLeaf());
    // r_newAccountLeaf.push(to.encodeAccountLeaf());

    // r_accountRootFlow[0].push(this.mkAccountTree.getRoot());
    // r_accountRootFlow[1].push(this.mkAccountTree.getRoot());
    // r_accountRootFlow[1].push(this.mkAccountTree.getRoot());
    // const r_newTokenLeaf = [];
    // r_newTokenLeaf.push(encodeTokenLeaf(to.getTokenLeaf(txTransferReq.L2TokenAddr).leaf));
    // r_newTokenLeaf.push(encodeTokenLeaf(to.getTokenLeaf(txTransferReq.L2TokenAddr).leaf));

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

    /**
     * Current: 
     *  l2ReqData: stateAmount
     *  l1ReqData: stateAmount
     *  calldata: follow reqData
     *  tokenLeadf: stateAmount
     * 
     * Next:
     *  l2ReqData: txAmount
     *  l1ReqData: stateAmount
     *  calldata: follow reqData
     *  tokenLeadf: stateAmount
     */
    const tx = {
      reqData, // TODO:
      // tsPubKey: from.tsPubKey,
      sigR: txTransferReq.eddsaSig.R8,
      sigS: txTransferReq.eddsaSig.S,

      // r_accountLeafId: isCritical ? [ to.L2Address, to.L2Address] : [ from.L2Address, to.L2Address],
      // r_oriAccountLeaf,
      // r_newAccountLeaf,
      // r_accountRootFlow,
      // r_accountMkPrf: [accountMerkleProofFrom, accountMerkleProofTo,],

      // r_tokenLeafId: [fromTokenInfo.leafId, toTokenInfo.leafId],
      // r_oriTokenLeaf,
      // r_newTokenLeaf,
      // r_tokenRootFlow: [
      //   [oriTokenRootFrom, newTokenRootTo],
      //   [newTokenRootTo, newTokenRootTo],
      // ],
      // r_tokenMkPrf: [
      //   [tokenMerkleProofFrom, tokenMerkleProofTo],
      // ],

      // r_orderLeafId: [orderLeafId],
      // r_oriOrderLeaf,
      // r_newOrderLeaf,
      // r_orderRootFlow: [
      //   this.currentAuctionOrderRootFlow[0], this.currentAuctionOrderRootFlow[1]
      // ],
      // r_orderMkPrf: [
      //   [orderMerkleProofTo,]
      // ],


      // accountRootFlow,
      // orderRootFlow,
    };
    this.addTxLogs(tx);

    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private getTxChunks(txTransferReq: TsTxTransferRequest) {
    const { r_chunks, o_chunks, isCritical } = encodeRChunkBuffer(txTransferReq);
    const o_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + o_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE)).reverse();
    const r_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + r_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE)).reverse();
    const fillNoopTimes = getOChunksSize(this.txNormalPerBatch) - o_chunks_bigint.length;
    for (let index = 0; index < fillNoopTimes; index++) {
      o_chunks_bigint.push(0n);
    }
    const isCriticalChunk = o_chunks_bigint.map(_ => 0n);
    if (isCritical) {
      isCriticalChunk[0] = 1n;
    }

    console.log({
      r_chunks,
      r_chunks_bigint,
      o_chunks_bigint,
    });
    return { r_chunks_bigint, o_chunks_bigint, isCriticalChunk };
  }

  async doTransaction(req: ITxRequest) {
    switch (req.reqType) {
      case TsTxType.REGISTER:
        return this.doRegister(req as TsTxRegisterRequest);
      case TsTxType.DEPOSIT:
        return this.doDeposit(req as TsTxDepositRequest);
      case TsTxType.TRANSFER:
        return this.doTransfer(req as TsTxTransferRequest);
      // case TsTxType.WITHDRAW:
      //   return this.doWithdraw(req as TsTxWithdrawRequest);
      // case TsTxType.AUCTION_LEND:
      //   return this.doAuctionLend(req as TsTxAuctionLendRequest);
      // case TsTxType.AUCTION_BORROW:
      //   return this.doAuctionBorrow(req as TsTxAuctionBorrowRequest);
      // case TsTxType.AUCTION_CANCEL:
      //   return this.doAuctionCancel(req as TsTxAuctionCancelRequest);
      case TsTxType.UNKNOWN:
      default:
        throw new Error(`Unknown request type reqType=${req.reqType}`);
        break;
    }
  }

  private async doDeposit(req: TsTxDepositNonSignatureRequest) {
    // TODO: valid toAddr have not been added in AccountTree;
    const mintSinger = new TsRollupSigner(Buffer.from('0x00'));
    const txTransferReq: TsTxTransferRequest = mintSinger.prepareTxDeposit(BigInt(req.L2AddrTo), req.L2TokenAddr, BigInt(req.amount));    

    const reqData = [
      BigInt(TsTxType.DEPOSIT), 
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.L2TokenAddr),
      BigInt(req.amount),
      BigInt(0),
      BigInt(req.L2AddrTo),

      0n, 0n, 0n, 0n,
    ];
    const orderLeafId = 0;
    const depositL2Addr = BigInt(req.L2AddrTo);
    const depositAccount = this.getAccount(depositL2Addr);
    if(!depositAccount) {
      throw new Error(`Deposit account not found L2Addr=${depositL2Addr}`);
    }
    const tokenInfo = depositAccount.getTokenLeaf(txTransferReq.L2TokenAddr);
    txTransferReq.L2TokenLeafIdFrom = tokenInfo.leafId.toString();

    this.accountBeforeUpdate(depositL2Addr, req.L2TokenAddr);
    this.orderBeforeUpdate(orderLeafId);
    
    this.updateAccountToken(depositL2Addr, depositAccount.getTokenLeaf(txTransferReq.L2TokenAddr).leaf.tokenAddr, BigInt(req.amount), false);

    this.accountAfterUpdate(depositL2Addr, req.L2TokenAddr);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountBeforeUpdate(depositL2Addr, req.L2TokenAddr);
    this.accountAfterUpdate(depositL2Addr, req.L2TokenAddr);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

    const tx =  {
      reqData,
      tsPubKey: mintSinger.tsPubKey, // Deposit tx not need signature
      sigR: txTransferReq.eddsaSig.R8,
      sigS: txTransferReq.eddsaSig.S,

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;

  }

  private async doTransfer(txTransferReq: TsTxTransferRequest) {
    console.log('doTransfer', txTransferReq);
    const reqData = encodeTxTransferMessage(txTransferReq);
    const orderLeafId = 0;
    const transferL2AddrFrom = BigInt(txTransferReq.L2AddrFrom);
    const transferL2AddrTo = BigInt(txTransferReq.L2AddrTo);
    const from = this.getAccount(transferL2AddrFrom);
    const to = this.getAccount(transferL2AddrTo);
    if(!from || !to) {
      throw new Error(`Deposit account not found L2Addr=${from}`);
    }
    const tokenInfoFrom = from.getTokenLeaf(txTransferReq.L2TokenAddr);
    const tokenInfoTo = to.getTokenLeaf(txTransferReq.L2TokenAddr);
    const newNonce = from.nonce + 1n;
    // txTransferReq.txAmount = 
    txTransferReq.L2TokenLeafIdFrom = tokenInfoFrom.leafId.toString();
    txTransferReq.L2TokenLeafIdTo = tokenInfoTo.leafId.toString();
   
    this.accountBeforeUpdate(transferL2AddrFrom, txTransferReq.L2TokenAddr);
    this.updateAccountToken(transferL2AddrFrom, txTransferReq.L2TokenAddr, -BigInt(txTransferReq.amount), false);
    from.updateNonce(newNonce);
    this.accountAfterUpdate(transferL2AddrFrom, txTransferReq.L2TokenAddr);

    this.accountBeforeUpdate(transferL2AddrTo, txTransferReq.L2TokenAddr);
    this.updateAccountToken(transferL2AddrTo, txTransferReq.L2TokenAddr, BigInt(txTransferReq.amount), false);
    this.accountAfterUpdate(transferL2AddrTo, txTransferReq.L2TokenAddr);

    this.orderBeforeUpdate(orderLeafId);
    this.orderAfterUpdate(orderLeafId);


    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

    console.log({
      reqData
    });

    const tx =  {
      reqData,
      tsPubKey: from.tsPubKey, // Deposit tx not need signature
      sigR: txTransferReq.eddsaSig.R8,
      sigS: txTransferReq.eddsaSig.S,

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private async doRegister(req: TsTxRegisterRequest): Promise<object> {
    const tokenInfos: TsTokenInfo[] = req.L2TokenAddr !== TsTokenAddress.Unknown && Number(req.amount) > 0
      ? [{
        tokenAddr: req.L2TokenAddr as TsTokenAddress,
        amount: BigInt(req.amount),
        lockAmt: 0n,
      }]
      : [];
    const registerAccount = new TsRollupAccount(
      tokenInfos,
      this.config.token_tree_height,
      [BigInt(req.tsPubKey[0]), BigInt(req.tsPubKey[1])],
    );
    const orderLeafId = 0;
    const registerL2Addr = BigInt(req.L2AddrFrom);
    const hashedTsPubKey = registerAccount.hashedTsPubKey;
    const L2TokenLeafIdFrom = registerAccount.getTokenLeafId(req.L2TokenAddr);
    const reqData = [
      BigInt(TsTxType.REGISTER), 
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.L2TokenAddr),
      BigInt(req.amount),
      BigInt(0),
      registerL2Addr,
      hashedTsPubKey,

      0n, 0n, 0n, 
    ];
    const txTransferReq: TsTxTransferRequest = {
      reqType: req.reqType,
      L2AddrFrom: TsSystemAccountAddress.MINT_ADDR,
      L2AddrTo: req.L2AddrFrom,
      L2TokenAddr: req.L2TokenAddr,
      amount: req.amount,
      nonce: '0',
      hashedTsPubKey,
      L2TokenLeafIdFrom: L2TokenLeafIdFrom.toString(),
      eddsaSig: {
        R8: ['0', '0'],
        S: '0'
      }
    };

    this.accountBeforeUpdate(registerL2Addr, req.L2TokenAddr);
    this.orderBeforeUpdate(orderLeafId);

    /** update state */
    this.addAccount(Number(req.L2AddrFrom), registerAccount);

    this.accountAfterUpdate(registerL2Addr, req.L2TokenAddr);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountBeforeUpdate(registerL2Addr, req.L2TokenAddr);
    this.accountAfterUpdate(registerL2Addr, req.L2TokenAddr);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

    const tx = {
      reqData,
      tsPubKey: registerAccount.tsPubKey, 
      sigR: txTransferReq.eddsaSig.R8, // register account no need sig
      sigS: txTransferReq.eddsaSig.S,       // register account no need sig

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

}

