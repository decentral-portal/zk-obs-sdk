"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txTypeToDataLength = exports.toTreeLeaf = exports.txToCircuitInput = exports.tsHashFunc = void 0;
const helper_1 = require("../helper");
const poseidon_hash_dp_1 = require("../poseidon-hash-dp");
const ts_types_1 = require("../ts-types/ts-types");
const exclude = {};
exports.tsHashFunc = poseidonHash;
function txToCircuitInput(obj, initData = {}) {
    const result = initData;
    Object.keys(obj).forEach((key) => {
        if (exclude[key]) {
            return;
        }
        const item = obj[key];
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push((0, helper_1.recursiveToString)(item));
    });
    return result;
}
exports.txToCircuitInput = txToCircuitInput;
function toTreeLeaf(inputs) {
    return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)(inputs));
}
exports.toTreeLeaf = toTreeLeaf;
function txTypeToDataLength(type) {
    return ts_types_1.TsTxTypeLengthMap[type];
}
exports.txTypeToDataLength = txTypeToDataLength;
function poseidonHash(val) {
    if (val instanceof Array) {
        const inputs = val.map((v) => BigInt(v));
        return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)(inputs));
    }
    return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)([BigInt(val.toString())]));
}
