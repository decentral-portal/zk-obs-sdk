"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsRollupSigner = void 0;
const eddsa_1 = require("../eddsa");
const poseidon_hash_dp_1 = require("../poseidon-hash-dp");
const ts_types_1 = require("../ts-types/ts-types");
const ts_tx_helper_1 = require("./ts-tx-helper");
const bigint_helper_1 = require("../bigint-helper");
class TsRollupSigner {
    get tsPubKey() {
        const pub = this.signer.publicKey.map(x => BigInt(eddsa_1.EddsaSigner.toObject(x).toString()));
        return [
            pub[0], pub[1],
        ];
    }
    constructor(priv) {
        this.signer = new eddsa_1.EddsaSigner(priv);
    }
    signPoseidonMessageHash(msgHash) {
        return this.signer.signPoseidon(msgHash);
    }
    verifySignature(msgHash, signature) {
        const tsPubKey = [
            eddsa_1.EddsaSigner.toE(this.tsPubKey[0]),
            eddsa_1.EddsaSigner.toE(this.tsPubKey[1]),
        ];
        return eddsa_1.EddsaSigner.verify(eddsa_1.EddsaSigner.toE(msgHash), signature, tsPubKey);
    }
    prepareTxWithdraw(nonce, L2Address, tokenAddr, amount) {
        const req = {
            reqType: ts_types_1.TsTxType.WITHDRAW,
            L2AddrFrom: L2Address.toString(),
            L2AddrTo: ts_types_1.TsSystemAccountAddress.WITHDRAW_ADDR,
            L2TokenAddr: tokenAddr,
            amount: amount.toString(),
            nonce: nonce.toString(),
        };
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxWithdrawMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
    prepareTxTransfer(nonce, fromAddr, toAddr, tokenAddr, amount) {
        const req = {
            reqType: ts_types_1.TsTxType.TRANSFER,
            L2AddrFrom: fromAddr.toString(),
            L2AddrTo: toAddr.toString(),
            L2TokenAddr: tokenAddr,
            amount: amount.toString(),
            nonce: nonce.toString(),
            txAmount: (0, bigint_helper_1.amountToTxAmountV2)(amount).toString(),
        };
        console.log({
            amount,
            txAmount: req.txAmount,
        });
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxTransferMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
    prepareTxDeposit(toAddr, tokenAddr, amount) {
        const req = {
            reqType: ts_types_1.TsTxType.DEPOSIT,
            L2AddrFrom: ts_types_1.TsSystemAccountAddress.MINT_ADDR,
            L2AddrTo: toAddr.toString(),
            L2TokenAddr: tokenAddr,
            amount: amount.toString(),
            nonce: '0',
        };
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxDepositMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
    prepareTxAuctionPlaceLend(data) {
        const req = {
            ...data,
            L2AddrTo: ts_types_1.TsSystemAccountAddress.AUCTION_ADDR
        };
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxAuctionLendMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
    prepareTxAuctionPlaceBorrow(data) {
        const req = {
            ...data,
            L2AddrTo: ts_types_1.TsSystemAccountAddress.AUCTION_ADDR
        };
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxAuctionBorrowMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
    prepareTxAuctionCancel(data) {
        const req = {
            ...data,
            L2AddrFrom: ts_types_1.TsSystemAccountAddress.AUCTION_ADDR
        };
        const msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxAuctionCancelMessage)(req));
        const eddsaSig = this.signPoseidonMessageHash(msgHash);
        return {
            ...req,
            eddsaSig: {
                S: eddsaSig.S.toString(),
                R8: [
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
                    eddsa_1.EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
                ]
            },
        };
    }
}
exports.TsRollupSigner = TsRollupSigner;
