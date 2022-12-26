"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dpPoseidonHash = void 0;
const poseidon_1 = require("@big-whale-labs/poseidon");
class dpPoseidonCache {
    static getCache(x) {
        if (x instanceof Array) {
            const key = x.join();
            return dpPoseidonCache.getCache(key);
        }
        return dpPoseidonCache
            .cache
            .get(x);
    }
    static setCache(x, v) {
        if (x instanceof Array) {
            const key = x.join();
            dpPoseidonCache.setCache(key, v);
            return;
        }
        dpPoseidonCache
            .cache
            .set(x, v);
    }
}
dpPoseidonCache.cache = new Map();
function dpPoseidonHash(inputs, isDpEnabled = true) {
    if (isDpEnabled) {
        const cache = dpPoseidonCache.getCache(inputs);
        if (cache) {
            return cache;
        }
    }
    const res = (0, poseidon_1.poseidon)(inputs);
    if (isDpEnabled) {
        dpPoseidonCache.setCache(inputs, res);
    }
    return res;
}
exports.dpPoseidonHash = dpPoseidonHash;
