"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayChunkToHexString = exports.amountToTxAmountV2 = exports.bigIntMin = exports.bigIntMax = void 0;
const bigIntMax = (arr) => {
    return arr.reduce((max, e) => {
        return e > max ? e : max;
    }, arr[0]);
};
exports.bigIntMax = bigIntMax;
const bigIntMin = (arr) => {
    return arr.reduce((min, e) => {
        return e > min ? e : min;
    }, arr[0]);
};
exports.bigIntMin = bigIntMin;
function amountToTxAmountV2(number) {
    const sign = number >> 127n << 47n;
    const fraction = number - sign;
    const fractionLength = BigInt(fraction.toString(2).length);
    const bias = (1n << 5n) - 1n;
    const exp = fractionLength - 28n + bias;
    const modNumber = (fractionLength > 0n) ? 1n << (fractionLength - 1n) : 1n;
    const modifiedFraction = fraction % modNumber;
    const modifiedFractionLength = (fractionLength > 0n) ? fractionLength - 1n : 0n;
    const finalFraction = (modifiedFractionLength < 41n)
        ? modifiedFraction << (41n - modifiedFractionLength)
        : modifiedFraction >> (modifiedFractionLength - 41n);
    const retVal = sign + (exp << 41n) + finalFraction;
    return retVal;
}
exports.amountToTxAmountV2 = amountToTxAmountV2;
function arrayChunkToHexString(arr, pad) {
    const hex = arr.map((e) => {
        return BigInt(e).toString(16).padStart(pad, '0');
    }).join('');
    return hex;
}
exports.arrayChunkToHexString = arrayChunkToHexString;
