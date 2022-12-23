import { assert } from 'chai';
import { dpPoseidonHash } from '../../lib/poseidon-hash-dp';


describe('Test Poseidon', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let circuit: any;
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

    assert.equal(witness[1], expected);

  });

});
function poseidonHash(arr : string[]): string {
  const r = dpPoseidonHash(arr.map((v : string) => BigInt(v)), false);
  return r.toString();
}