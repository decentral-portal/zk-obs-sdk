"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EddsaSigner = exports.asyncEdDSA = exports.EdDSA = void 0;
const circomlibjs = require('circomlibjs');
const ff = require('ffjavascript');
exports.asyncEdDSA = circomlibjs.buildEddsa();
(async function () {
    exports.EdDSA = await exports.asyncEdDSA;
})();
class EddsaSigner {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.publicKey = (privateKey.length === 0) ? [
            new Uint8Array(), new Uint8Array()
        ] : exports.EdDSA.prv2pub(privateKey);
    }
    static toObject(i) {
        return exports.EdDSA.babyJub.F.toObject(i);
    }
    static toE(i) {
        return exports.EdDSA.babyJub.F.e(i);
    }
    signPoseidon(msgHash) {
        const msgField = exports.EdDSA.babyJub.F.e(msgHash);
        const signature = exports.EdDSA.signPoseidon(this.privateKey, msgField);
        return signature;
    }
    static verify(msgHash, signature, publicKey) {
        return exports.EdDSA.verifyPoseidon(Uint8Array, signature, publicKey);
    }
}
exports.EddsaSigner = EddsaSigner;
