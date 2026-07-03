import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  parseRegnskapRecord,
  pickBestPerYear,
  computeMargin,
  isRegistrySourced,
  isNokReported,
  buildSourceString,
  fitsDecimal15_2,
  fitsDecimal5_2,
  HOLDING_CONSOLIDATED_ORGNRS,
  type BrregRegnskap,
} from '../../scripts/import-brreg-financials'

// Ekte responser fra Regnskapsregisteret, hentet 2026-06-16 (forkortet).
const REMA_2025: BrregRegnskap = {
  regnskapstype: 'SELSKAP',
  regnskapsperiode: { fraDato: '2025-01-01', tilDato: '2025-12-31' },
  valuta: 'NOK',
  virksomhet: { organisasjonsnummer: '982254604', organisasjonsform: 'AS', morselskap: false },
  resultatregnskapResultat: {
    aarsresultat: 309034000,
    driftsresultat: {
      driftsresultat: 970235000,
      driftsinntekter: { sumDriftsinntekter: 5889627000 },
    },
  },
}

const NORGESGRUPPEN_2024: BrregRegnskap = {
  regnskapstype: 'SELSKAP',
  regnskapsperiode: { fraDato: '2024-01-01', tilDato: '2024-12-31' },
  valuta: 'NOK',
  virksomhet: { organisasjonsnummer: '819731322', organisasjonsform: 'ASA', morselskap: true },
  resultatregnskapResultat: {
    aarsresultat: 1728978000,
    driftsresultat: {
      driftsresultat: -230445000,
      driftsinntekter: { sumDriftsinntekter: 589728000 },
    },
  },
}

describe('parseRegnskapRecord', () => {
  it('trekker ut omsetning, driftsresultat, margin og år fra ekte REMA-record', () => {
    const p = parseRegnskapRecord(REMA_2025)!
    assert.equal(p.year, 2025)
    assert.equal(p.regnskapstype, 'SELSKAP')
    assert.equal(p.revenueNok, 5889627000)
    assert.equal(p.operatingResult, 970235000)
    assert.equal(p.operatingMargin, 16.47) // 970235000 / 5889627000
    assert.equal(p.reportingCurrency, 'NOK')
    assert.equal(p.fiscalPeriodStart, '2025-01-01')
    assert.equal(p.fiscalPeriodEnd, '2025-12-31')
    assert.equal(p.fiscalYearLabel, null) // kalenderår → ingen label
  })

  it('håndterer negativt driftsresultat (NorgesGruppen-holding)', () => {
    const p = parseRegnskapRecord(NORGESGRUPPEN_2024)!
    assert.equal(p.year, 2024)
    assert.equal(p.revenueNok, 589728000)
    assert.equal(p.operatingMargin, -39.08) // -230445000 / 589728000
  })

  it('knytter avvikende regnskapsår til avslutningsåret og setter label', () => {
    const p = parseRegnskapRecord({
      regnskapsperiode: { fraDato: '2024-03-01', tilDato: '2025-02-28' },
      resultatregnskapResultat: { driftsresultat: { driftsinntekter: { sumDriftsinntekter: 100 } } },
    })!
    assert.equal(p.year, 2025)
    assert.equal(p.fiscalYearLabel, '2024/2025')
  })

  it('returnerer null når regnskapsperiode mangler', () => {
    assert.equal(parseRegnskapRecord({ regnskapstype: 'SELSKAP' }), null)
  })

  it('tåler manglende resultattall (revenue/result = null)', () => {
    const p = parseRegnskapRecord({ regnskapsperiode: { tilDato: '2024-12-31' } })!
    assert.equal(p.year, 2024)
    assert.equal(p.revenueNok, null)
    assert.equal(p.operatingResult, null)
    assert.equal(p.operatingMargin, null)
  })
})

describe('computeMargin', () => {
  it('regner ut prosent med 2 desimaler', () => {
    assert.equal(computeMargin(1000, 165), 16.5)
  })
  it('returnerer null ved 0 eller manglende omsetning', () => {
    assert.equal(computeMargin(0, 100), null)
    assert.equal(computeMargin(null, 100), null)
    assert.equal(computeMargin(1000, null), null)
  })
})

describe('pickBestPerYear', () => {
  it('foretrekker KONSERN over SELSKAP for samme år, uavhengig av rekkefølge', () => {
    const selskap: BrregRegnskap = {
      regnskapstype: 'SELSKAP',
      regnskapsperiode: { tilDato: '2024-12-31' },
      resultatregnskapResultat: { driftsresultat: { driftsinntekter: { sumDriftsinntekter: 100 } } },
    }
    const konsern: BrregRegnskap = {
      regnskapstype: 'KONSERN',
      regnskapsperiode: { tilDato: '2024-12-31' },
      resultatregnskapResultat: { driftsresultat: { driftsinntekter: { sumDriftsinntekter: 9000 } } },
    }
    const a = pickBestPerYear([selskap, konsern])
    assert.equal(a.get(2024)!.regnskapstype, 'KONSERN')
    assert.equal(a.get(2024)!.revenueNok, 9000)

    const b = pickBestPerYear([konsern, selskap])
    assert.equal(b.get(2024)!.regnskapstype, 'KONSERN')
    assert.equal(b.get(2024)!.revenueNok, 9000)
  })

  it('beholder flere år som separate rader', () => {
    const m = pickBestPerYear([REMA_2025, NORGESGRUPPEN_2024])
    assert.equal(m.size, 2)
    assert.ok(m.has(2025))
    assert.ok(m.has(2024))
  })
})

describe('skrivepolitikk-helpere', () => {
  it('isRegistrySourced skiller importerens egne rader fra kuraterte', () => {
    assert.equal(isRegistrySourced('Regnskapsregisteret (Brønnøysund) API regnskap/982254604, regnskapsår 2025, hentet 2026-06-16'), true)
    assert.equal(isRegistrySourced('Årsrapport 2024'), false)
    assert.equal(isRegistrySourced(null), false)
  })
  it('buildSourceString returnerer direkte Regnskapsregisteret-lokator', () => {
    const s = buildSourceString('982254604', 2025, '2026-06-16')
    assert.equal(s, 'https://data.brreg.no/regnskapsregisteret/regnskap/982254604')
  })
  it('isNokReported slipper bare NOK gjennom til revenueNok (Mowi EUR blokkeres)', () => {
    assert.equal(isNokReported('NOK'), true)
    assert.equal(isNokReported(null), true)
    assert.equal(isNokReported('EUR'), false)
    assert.equal(isNokReported('USD'), false)
  })
  it('fitsDecimal15_2 stopper tall som ikke passer i CompanyFinancial Decimal(15,2)', () => {
    assert.equal(fitsDecimal15_2(9_999_999_999_999), true)
    assert.equal(fitsDecimal15_2(-9_999_999_999_999), true)
    assert.equal(fitsDecimal15_2(10_000_000_000_000), false)
    assert.equal(fitsDecimal15_2(null), true)
  })
  it('fitsDecimal5_2 stopper marginer som ikke passer i CompanyFinancial Decimal(5,2)', () => {
    assert.equal(fitsDecimal5_2(999.99), true)
    assert.equal(fitsDecimal5_2(-999.99), true)
    assert.equal(fitsDecimal5_2(1000), false)
    assert.equal(fitsDecimal5_2(null), true)
  })
})

describe('HOLDING_CONSOLIDATED_ORGNRS', () => {
  it('dekker de børsnoterte/holding-mødrene som ikke skal klobbes', () => {
    for (const org of ['819731322', '910747711', '960514718', '975350940', '929975200', '964118191']) {
      assert.ok(HOLDING_CONSOLIDATED_ORGNRS.has(org), `mangler ${org}`)
    }
  })
})

describe('import-renhet', () => {
  it('kjører ikke main ved import', async () => {
    const logs: string[] = []
    const orig = console.log
    console.log = (...a: unknown[]) => logs.push(a.join(' '))
    try {
      await import(`../../scripts/import-brreg-financials?test=${Date.now()}`)
      await new Promise((r) => setTimeout(r, 150))
      assert.deepEqual(logs, [])
    } finally {
      console.log = orig
    }
  })
})
