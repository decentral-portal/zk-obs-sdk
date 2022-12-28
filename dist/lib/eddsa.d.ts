/// <reference types="node" />
import { EdDSAPublicKeyType, EdDSASignaturePayload } from './ts-types/eddsa-types';
export declare let EdDSA: any;
export declare const asyncEdDSA: any;
export declare class EddsaSigner {
    private privateKey;
    publicKey: EdDSAPublicKeyType;
    constructor(privateKey: Buffer);
    static toObject(i: Uint8Array): bigint;
    static toE(i: bigint): Uint8Array;
    signPoseidon(msgHash: bigint): EdDSASignaturePayload;
    static verify(msgHash: Uint8Array, signature: EdDSASignaturePayload, publicKey: EdDSAPublicKeyType): boolean;
}
