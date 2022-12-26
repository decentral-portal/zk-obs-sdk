"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const poseidon_hash_dp_1 = require("../../lib/poseidon-hash-dp");
describe('Test Poseidon', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let circuit;
    before(async () => {
        // circuit = await circuitTest.setup('poseidon-test');
    });
    it('Poseidon hash exactly', async () => {
        const witness = await circuit.calculateWitness({
            signup_addr: '612116737818198673100608113976422912972744834021',
        }, true);
        const expected = poseidonHash([
            '612116737818198673100608113976422912972744834021',
            '0',
            '0',
        ]);
        chai_1.assert.equal(witness[1], expected);
    });
});
function poseidonHash(arr) {
    const r = (0, poseidon_hash_dp_1.dpPoseidonHash)(arr.map((v) => BigInt(v)), false);
    return r.toString();
}
