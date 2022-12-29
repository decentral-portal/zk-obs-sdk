"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsRollupSigner = void 0;
const eddsa_1 = require("../eddsa");
const poseidon_hash_dp_1 = require("../poseidon-hash-dp");
const ts_types_1 = require("../ts-types/ts-types");
const ts_tx_helper_1 = require("./ts-tx-helper");
const ts_helper_1 = require("./ts-helper");
class TsRollupSigner {
    signer;
    get tsPubKey() {
        const pub = this.signer.publicKey.map(x => BigInt(eddsa_1.EddsaSigner.toObject(x).toString()));
        return [
            pub[0], pub[1],
        ];
    }
    constructor(priv) {
        this.signer = new eddsa_1.EddsaSigner(priv);
    }
    get tsAddr() {
        const raw = BigInt((0, ts_helper_1.tsHashFunc)(this.tsPubKey.map(v => v.toString())));
        const hash = raw % BigInt(2 ** 160);
        return `0x${hash.toString(16).padStart(40, '0')}`;
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
    prepareTxDeposit(tokenId, amount, sender) {
        const req = {
            reqType: ts_types_1.TsTxType.DEPOSIT,
            tokenId: tokenId,
            stateAmt: amount.toString(),
            nonce: '0',
            sender: sender.toString(),
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
    prepareTxWithdraw(sender, tokenId, amount, nonce) {
        const req = {
            reqType: ts_types_1.TsTxType.WITHDRAW,
            sender: sender.toString(),
            tokenId: tokenId,
            stateAmt: amount.toString(),
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
    prepareTxOrder(marketType, sender, sellTokenId, sellAmt, nonce, buyTokenId, buyAmt) {
        const req = {
            reqType: marketType,
            sender: sender.toString(),
            sellTokenId: sellTokenId,
            sellAmt: sellAmt.toString(),
            nonce: nonce.toString(),
            buyTokenId: buyTokenId,
            buyAmt: buyAmt.toString(),
        };
        let msgHash;
        if (marketType === ts_types_1.TsTxType.LIMIT_ORDER) {
            msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxLimitOrderMessage)(req));
        }
        else {
            msgHash = (0, poseidon_hash_dp_1.dpPoseidonHash)((0, ts_tx_helper_1.encodeTxMarketOrderMessage)(req));
        }
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
