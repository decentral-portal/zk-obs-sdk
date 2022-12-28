import { BytesLike } from 'ethers';
import { TsTxType } from '../ts-types/ts-types';
export declare const tsHashFunc: typeof poseidonHash;
export declare function txToCircuitInput(obj: any, initData?: any): any;
export declare function toTreeLeaf(inputs: bigint[]): string;
export declare function txTypeToDataLength(type: TsTxType): number;
declare function poseidonHash(val: BytesLike | BytesLike[]): string;
export {};
