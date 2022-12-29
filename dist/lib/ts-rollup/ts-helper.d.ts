import { BytesLike } from 'ethers';
export declare const tsHashFunc: typeof poseidonHash;
export declare function txToCircuitInput(obj: any, initData?: any): any;
export declare function toTreeLeaf(inputs: bigint[]): string;
declare function poseidonHash(val: BytesLike | BytesLike[]): string;
export {};
