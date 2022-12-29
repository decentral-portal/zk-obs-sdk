/// <reference types="node" />
import { EdDSAPublicKeyType, EdDSASignaturePayload } from './ts-types/eddsa-types';
import { EdDSASignatureRequestType } from './ts-types/ts-req-types';
export declare const hexToDec: (hex: string) => string;
export declare const privateKeyToAddress: (_privateKey: string) => string;
export declare function genEthereumPrivateKey(): string;
export declare function stringToUint8Array(str: string): Uint8Array;
export declare function bigint_to_Uint8Array(x: bigint): Uint8Array;
export declare function Uint8Array_to_bigint(x: Uint8Array): bigint;
export declare function privKeyStringToBigInt(privKeyHex: string): bigint;
export declare function bufferToDec(buffer: Buffer): string;
export declare function bufferIsEmpty(buffer: Buffer): boolean;
export declare function hexToUint8Array(hex: string): Uint8Array;
export declare function bigint_to_tuple(x: bigint): [bigint, bigint, bigint, bigint];
export declare function bigint_to_hex(x: bigint): string;
export declare function objectToHexString(obj: object): string;
export declare function uint8ArrayToBuffer(acc1PrivateKey: Uint8Array): Buffer;
export declare function hexToBuffer(L2MintAccountPriv: string): Buffer;
export declare function recursiveToString(data: any): any;
export declare function uint8ArrayToBigint(uint8Array: Uint8Array, numberOfBits?: number): bigint;
export declare function bigintToUint8Array(value: bigint, numberOfBits?: number): Uint8Array;
export declare function bigintToHexString(value: bigint, numberOfBits?: number): string;
export declare function uint8ArrayToHexString(array: Uint8Array): string;
export declare const eddsaSigTypeConverter: (sig: EdDSASignaturePayload) => EdDSASignatureRequestType;
export declare const tsPubKeyTypeConverter: (tsPubKey: [bigint, bigint]) => EdDSAPublicKeyType;
export declare function bufferToBigInt(buffer: Buffer): bigint;