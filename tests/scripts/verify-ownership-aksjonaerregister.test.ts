import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  resolveColumns,
  parseAksjonaerCsv,
  aggregateOwnership,
  compareToExpected,
  EXPECTED_OWNERS,
  type ExpectedOwner,
} from '../../scripts/verify-ownership-aksjonaerregister'

// Syntetisk uttrekk i Aksjonærregisterets form (semikolon, header-styrt).
// Austevoll eier 52,7 % av Lerøy (summert over to aksjeklasser); Laco eier
// 52,7 % av Austevoll; NorgesGruppen eier 100 % av ASKO.
const CSV = [
  'Orgnr;Selskap;Aksjeklasse;Navn aksjonær;Fødselsår/orgnr;Postnr/sted;Landkode;Antall aksjer;Antall aksjer selskap',
  '975350940;LERØY SEAFOOD GROUP ASA;A;Austevoll Seafood ASA;929975200;5392 Storebø;NOR;50000;100000',
  '975350940;LERØY SEAFOOD GROUP ASA;B;Austevoll Seafood ASA;929975200;5392 Storebø;NOR;2700;100000',
  '975350940;LERØY SEAFOOD GROUP ASA;A;Folketrygdfondet;971524141;0124 Oslo;NOR;10000;100000',
  '929975200;AUSTEVOLL SEAFOOD ASA;A;Laco AS;937305354;5392 Storebø;NOR;105400;200000',
  '929975200;AUSTEVOLL SEAFOOD ASA;A;DNB Bank ASA;984851006;0021 Oslo;NOR;20000;200000',
  '929228723;ASKO NORGE AS;A;NorgesGruppen ASA;819731322;0484 Oslo;NOR;1000;1000',
  'IKKEORG;SkalHoppesOver;A;Tull;0;;;5;5',
].join('\n')

describe('resolveColumns', () => {
  it('finner kolonneindekser fra header-nøkkelord', () => {
    const c = resolveColumns(CSV.split('\n')[0].split(';'))
    assert.equal(c.orgNr, 0)
    assert.equal(c.selskap, 1)
    assert.equal(c.navn, 3)
    assert.equal(c.holderShares, 7) // "Antall aksjer" uten "selskap"
    assert.equal(c.totalShares, 8) // "Antall aksjer selskap"
  })
})

describe('parseAksjonaerCsv', () => {
  it('parser rader og hopper over ikke-9-sifret orgnr', () => {
    const rows = parseAksjonaerCsv(CSV)
    assert.equal(rows.length, 6) // 7 datarader minus "IKKEORG"
    const first = rows[0]
    assert.equal(first.companyOrgNr, '975350940')
    assert.equal(first.holderName, 'Austevoll Seafood ASA')
    assert.equal(first.holderShares, 50000)
    assert.equal(first.companyTotalShares, 100000)
  })
})

describe('aggregateOwnership', () => {
  it('summerer aksjer per eier over aksjeklasser og regner ut prosent', () => {
    const agg = aggregateOwnership(parseAksjonaerCsv(CSV))
    const leroy = agg.get('975350940')!
    assert.equal(leroy.totalShares, 100000)
    // Austevoll: 50000 + 2700 = 52700 → 52,70 %
    assert.equal(leroy.holders[0].name, 'Austevoll Seafood ASA')
    assert.equal(leroy.holders[0].shares, 52700)
    assert.equal(leroy.holders[0].pct, 52.7)
    assert.equal(leroy.holders[0].isCompany, true)
    // Sortert synkende → Folketrygdfondet (10 %) etter Austevoll
    assert.equal(leroy.holders[1].pct, 10)
  })
})

describe('compareToExpected', () => {
  const agg = aggregateOwnership(parseAksjonaerCsv(CSV))
  const expected: ExpectedOwner[] = [
    { orgNr: '975350940', company: 'Lerøy', form: 'ASA', expectedOwner: 'Austevoll Seafood ASA', expectedPct: 52.7 },
    { orgNr: '929975200', company: 'Austevoll', form: 'ASA', expectedOwner: 'Laco AS', expectedPct: 52.7 },
    { orgNr: '929228723', company: 'ASKO', form: 'AS', expectedOwner: 'NorgesGruppen', expectedPct: 100 },
    { orgNr: '936560288', company: 'Coop Norge SA', form: 'SA', expectedOwner: 'Samvirkelagene', expectedPct: 100 },
    { orgNr: '999999999', company: 'Mangler', form: 'AS', expectedOwner: 'Noen', expectedPct: 50 },
    { orgNr: '975350940', company: 'Lerøy feil-%', form: 'ASA', expectedOwner: 'Austevoll Seafood ASA', expectedPct: 80 },
  ]
  const v = compareToExpected(agg, expected)

  it('bekrefter eier + prosent innen toleranse', () => {
    assert.equal(v[0].verdict, 'bekreftet')
    assert.equal(v[0].actualTopPct, 52.7)
    assert.equal(v[1].verdict, 'bekreftet') // Laco 52,7 %
    assert.equal(v[2].verdict, 'bekreftet') // NorgesGruppen 100 %
  })

  it('flagger samvirke (SA) som N/A — bekreftet av form', () => {
    assert.equal(v[3].applicable, false)
    assert.match(v[3].verdict, /samvirke/)
  })

  it('flagger manglende selskap og %-avvik', () => {
    assert.match(v[4].verdict, /mangler i uttrekket/)
    assert.equal(v[5].ownerMatch, true)
    assert.equal(v[5].pctWithinTolerance, false) // forventet 80, funnet 52,7
    assert.match(v[5].verdict, /% avvik/)
  })
})

describe('EXPECTED_OWNERS (innebygd målliste)', () => {
  it('dekker AP-5-konsernene med 4 samvirke flagget som SA', () => {
    assert.equal(EXPECTED_OWNERS.length, 13)
    assert.equal(EXPECTED_OWNERS.filter(e => e.form === 'SA').length, 4)
    // Lerøy/Austevoll-kjeden er med for ultimate-sporing.
    assert.ok(EXPECTED_OWNERS.some(e => e.orgNr === '975350940' && /Austevoll/.test(e.expectedOwner)))
    assert.ok(EXPECTED_OWNERS.some(e => e.orgNr === '929975200' && /Laco/.test(e.expectedOwner)))
  })
})

describe('import-renhet', () => {
  it('kjører ikke main ved import', async () => {
    const logs: string[] = []
    const orig = console.log
    console.log = (...a: unknown[]) => logs.push(a.join(' '))
    try {
      await import(`../../scripts/verify-ownership-aksjonaerregister?test=${Date.now()}`)
      await new Promise(r => setTimeout(r, 150))
      assert.deepEqual(logs, [])
    } finally {
      console.log = orig
    }
  })
})
