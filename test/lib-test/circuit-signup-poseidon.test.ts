import { assert } from 'chai';


describe('Test signup', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let circuit: any;
  before(async () => {
    // circuit = await circuitTest.setup('signup_poseidon_circuit');
  });
    
  it('signup use Poseidon hash exactly', async () => {
    const witness = await circuit.calculateWitness({
      'signup_id': [
        '2',
        '0'
      ],
      'signup_addr': [
        '612116737818198673100608113976422912972744834021',
        '1310493399860389086979543935370217960294635520952'
      ],
      'signup_acc_root_flow': [
        '12353478131394870250054591020566570259693411020722139344157949387336093141943',
        '15841537389653915790425276869533893687612981352099078454425750979158189099014',
        '15841537389653915790425276869533893687612981352099078454425750979158189099014'
      ],
      'signup_proof': [
        [
          '0',
          '14096328259338913426248994406746138475586983801725564091431728196842020803785',
          '7423237065226347324353380772367382631490014989348495481811164164159255474657',
          '11286972368698509976183087595462810875513684078608517520839298933882497716792',
          '3607627140608796879659380071776844901612302623152076817094415224584923813162',
          '19712377064642672829441595136074946683621277828620209496774504837737984048981',
          '20775607673010627194014556968476266066927294572720319469184847051418138353016',
          '3396914609616007258851405644437304192397291162432396347162513310381425243293'
        ],
        [
          '5317387130258456662214331362918410991734007599705406860481038345552731150762',
          '5820276068822036051468048571943690671207726292265578860108763608815512423983',
          '7423237065226347324353380772367382631490014989348495481811164164159255474657',
          '11286972368698509976183087595462810875513684078608517520839298933882497716792',
          '3607627140608796879659380071776844901612302623152076817094415224584923813162',
          '19712377064642672829441595136074946683621277828620209496774504837737984048981',
          '20775607673010627194014556968476266066927294572720319469184847051418138353016',
          '3396914609616007258851405644437304192397291162432396347162513310381425243293'
        ]
      ],
      'signup_sig_r': [
        [
          '7679528967345590321',
          '17134252034004675845',
          '13279411368338531502',
          '18217236153993146731'
        ],
        [
          '3556292682124033096',
          '8981818097794335428',
          '16916033084146679037',
          '17230468214961971077'
        ]
      ],
      'signup_sig_s': [
        [
          '8171301918727219290',
          '10902969151945152687',
          '1333397353363360743',
          '4264710327993467518'
        ],
        [
          '7856227857870397950',
          '5851268608778258645',
          '14343087373997536525',
          '2476390366922871723'
        ]
      ],
      'signup_sig_pubkey': [
        [
          [
            '16804385549982555077',
            '3920854992064381535',
            '1586485347428709813',
            '8209959530981713128'
          ],
          [
            '3874041196259189735',
            '385915469216516112',
            '15552102440625277982',
            '14745741968673857008'
          ]
        ],
        [
          [
            '482975190653471539',
            '2018645448764533705',
            '9084884480332441506',
            '11899593063715546051'
          ],
          [
            '14355541702293811113',
            '7376154053999903259',
            '15013645199718238028',
            '11534811758607038078'
          ]
        ]
      ]
    }, true);

    assert.equal(witness[0], 1n);

  });

});