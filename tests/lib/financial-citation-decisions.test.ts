import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ASKO_NORGE_2024_FINANCIAL_DECISION,
  AXFOOD_2024_FINANCIAL_DECISION,
  COOP_DANMARK_2024_FINANCIAL_DECISION,
  COOP_NORGE_2024_FINANCIAL_DECISION,
  HAGAR_HISTORICAL_FINANCIAL_DECISIONS,
  HAGAR_2024_FINANCIAL_DECISION,
  ICA_GRUPPEN_2024_FINANCIAL_DECISION,
  KESKO_2024_FINANCIAL_DECISION,
  NORGESGRUPPEN_2024_FINANCIAL_DECISION,
  REITAN_RETAIL_2024_FINANCIAL_DECISION,
  SALLING_GROUP_2024_FINANCIAL_DECISION,
  buildFinancialExactValuePlan,
  buildFinancialSourceCitation,
} from '../../scripts/lib/financial-citation-decisions'

describe('financial citation decisions', () => {
  it('plans NorgesGruppen exact MNOK updates from reviewed annual-report values', () => {
    const plan = buildFinancialExactValuePlan(NORGESGRUPPEN_2024_FINANCIAL_DECISION, {
      id: 'fin-ng',
      year: 2024,
      revenueNok: '118000',
      operatingResult: '4800',
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-ng',
      year: 2024,
      revenueNok: '118006',
      operatingResult: '4842',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('refuses to plan if the current financial row no longer matches the reviewed packet baseline', () => {
    const plan = buildFinancialExactValuePlan(NORGESGRUPPEN_2024_FINANCIAL_DECISION, {
      id: 'fin-ng',
      year: 2024,
      revenueNok: '118007',
      operatingResult: '4800',
    })

    assert.deepEqual(plan.update, null)
    assert.deepEqual(plan.issues, [
      'CF-NG-2024: expected current revenueNok 118000 or 118006, found 118007',
    ])
  })

  it('builds a primary-source citation for NorgesGruppen annual-report financial fields', () => {
    const citation = buildFinancialSourceCitation(NORGESGRUPPEN_2024_FINANCIAL_DECISION, 'sha256-text')

    assert.equal(citation.sourceClass, 'primary')
    assert.equal(citation.accessedAt, '2026-05-18')
    assert.equal(citation.url, 'https://www.norgesgruppen.no/finans/finans-hjem/rapporter/')
    assert.equal(citation.localPath, 'research/evidence-pack/arsrapporter/text/norgesgruppen-2024.txt')
    assert.equal(citation.contentHash, 'sha256-text')
    assert.equal(citation.verificationStatus, 'human_verified')
  })

  it('builds a primary-source citation for ASKO registry JSON snapshots', () => {
    const citation = buildFinancialSourceCitation(ASKO_NORGE_2024_FINANCIAL_DECISION, 'sha256-json')

    assert.equal(citation.sourceClass, 'primary')
    assert.equal(citation.captureMethod, 'api_json_snapshot')
    assert.equal(citation.url, 'https://data.brreg.no/regnskapsregisteret/regnskap')
    assert.equal(citation.localPath, 'research/evidence-pack/regnskapsregisteret-snapshots/929228723-2024-2026-05-18.json')
    assert.equal(citation.contentHash, 'sha256-json')
  })

  it('plans Axfood FX-adjusted NOK revenue and operating profit', () => {
    const plan = buildFinancialExactValuePlan(AXFOOD_2024_FINANCIAL_DECISION, {
      id: 'fin-axfood',
      year: 2024,
      revenueNok: '84100',
      operatingResult: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-axfood',
      year: 2024,
      revenueNok: '85519.6',
      operatingResult: '3347.2',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans ICA Gruppen FX-adjusted NOK revenue and operating profit', () => {
    const plan = buildFinancialExactValuePlan(ICA_GRUPPEN_2024_FINANCIAL_DECISION, {
      id: 'fin-ica',
      year: 2024,
      revenueNok: '157200',
      operatingResult: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.equal(plan.update?.revenueNok, '159951.6')
    assert.equal(plan.update?.operatingResult, '7144.2')
  })

  it('plans Salling Group FX-adjusted NOK revenue and EBIT', () => {
    const plan = buildFinancialExactValuePlan(SALLING_GROUP_2024_FINANCIAL_DECISION, {
      id: 'fin-salling',
      year: 2024,
      revenueNok: '111900',
      operatingResult: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.equal(plan.update?.revenueNok, '112515.2')
    assert.equal(plan.update?.operatingResult, '4198.1')
  })

  it('plans Coop Norge exact MNOK operating income and EBIT updates', () => {
    const plan = buildFinancialExactValuePlan(COOP_NORGE_2024_FINANCIAL_DECISION, {
      id: 'fin-coop-no',
      year: 2024,
      revenueNok: '55000',
      operatingResult: '580',
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-coop-no',
      year: 2024,
      revenueNok: '64595',
      operatingResult: '671',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans Kesko NOK revenue and actual operating profit from the annual-report table', () => {
    const plan = buildFinancialExactValuePlan(KESKO_2024_FINANCIAL_DECISION, {
      id: 'fin-kesko',
      year: 2024,
      revenueNok: '137080',
      operatingResult: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-kesko',
      year: 2024,
      revenueNok: '138602.2',
      operatingResult: '6738.2',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans Coop Danmark NOK revenue and actual EBIT after special items', () => {
    const plan = buildFinancialExactValuePlan(COOP_DANMARK_2024_FINANCIAL_DECISION, {
      id: 'fin-coop-dk',
      year: 2024,
      revenueNok: '52100',
      operatingResult: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-coop-dk',
      year: 2024,
      revenueNok: '52407.1',
      operatingResult: '988.3',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans Reitan Retail IFRS revenue and operating profit instead of systemwide sales', () => {
    const plan = buildFinancialExactValuePlan(REITAN_RETAIL_2024_FINANCIAL_DECISION, {
      id: 'fin-reitan',
      year: 2024,
      revenueNok: '149000',
      operatingResult: '5100',
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-reitan',
      year: 2024,
      revenueNok: '109326',
      operatingResult: '3769',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans ASKO Norge statutory company financials from Bronnoysund registry values', () => {
    const plan = buildFinancialExactValuePlan(ASKO_NORGE_2024_FINANCIAL_DECISION, {
      id: 'fin-asko',
      year: 2024,
      revenueNok: '95000',
      operatingResult: '1500',
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-asko',
      year: 2024,
      revenueNok: '524.19',
      operatingResult: '21.48',
      fieldPaths: ['revenueNok', 'operatingResult'],
    })
  })

  it('plans Hagar fiscal-year financials with explicit period metadata and EBITDA', () => {
    const plan = buildFinancialExactValuePlan(HAGAR_2024_FINANCIAL_DECISION, {
      id: 'fin-hagar',
      year: 2024,
      revenueNok: '14150',
      operatingResult: null,
      ebitda: null,
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      fxRateNokPerUnit: null,
      fxRateSource: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-hagar',
      year: 2024,
      revenueNok: '14168.9',
      operatingResult: '819.4',
      ebitda: '1157.9',
      fiscalYearLabel: '2024/25',
      fiscalPeriodStart: '2024-03-01',
      fiscalPeriodEnd: '2025-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.0785668',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2024-03-01 to 2025-02-28',
      fieldPaths: [
        'revenueNok',
        'operatingResult',
        'ebitda',
        'fiscalYearLabel',
        'fiscalPeriodStart',
        'fiscalPeriodEnd',
        'reportingCurrency',
        'fxRateNokPerUnit',
        'fxRateSource',
      ],
    })
  })

  it('can re-plan already-applied Hagar fiscal-year financials', () => {
    const plan = buildFinancialExactValuePlan(HAGAR_2024_FINANCIAL_DECISION, {
      id: 'fin-hagar',
      year: 2024,
      revenueNok: '14168.9',
      operatingResult: '819.4',
      ebitda: '1157.9',
      fiscalYearLabel: '2024/25',
      fiscalPeriodStart: '2024-03-01',
      fiscalPeriodEnd: '2025-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.0785668',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2024-03-01 to 2025-02-28',
    })

    assert.deepEqual(plan.issues, [])
    assert.equal(plan.update?.id, 'fin-hagar')
    assert.equal(plan.update?.revenueNok, '14168.9')
    assert.equal(plan.update?.operatingResult, '819.4')
    assert.equal(plan.update?.ebitda, '1157.9')
  })

  it('plans Hagar historical fiscal-year financials with period FX metadata', () => {
    const plan = buildFinancialExactValuePlan(HAGAR_HISTORICAL_FINANCIAL_DECISIONS[0], {
      id: 'fin-hagar-2020',
      year: 2020,
      revenueNok: '6200',
      operatingResult: null,
      ebitda: null,
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      fxRateNokPerUnit: null,
      fxRateSource: null,
    })

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.update, {
      id: 'fin-hagar-2020',
      year: 2020,
      revenueNok: '8179.6',
      operatingResult: '311',
      ebitda: '602.3',
      fiscalYearLabel: '2020/21',
      fiscalPeriodStart: '2020-03-01',
      fiscalPeriodEnd: '2021-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.06840159',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2020-03-01 to 2021-02-28',
      fieldPaths: [
        'revenueNok',
        'operatingResult',
        'ebitda',
        'fiscalYearLabel',
        'fiscalPeriodStart',
        'fiscalPeriodEnd',
        'reportingCurrency',
        'fxRateNokPerUnit',
        'fxRateSource',
      ],
    })
  })

  it('can re-plan already-applied Hagar historical financials', () => {
    for (const decision of HAGAR_HISTORICAL_FINANCIAL_DECISIONS) {
      const plan = buildFinancialExactValuePlan(decision, {
        id: `fin-hagar-${decision.year}`,
        year: decision.year,
        revenueNok: decision.sourceValues.revenueNok,
        operatingResult: decision.sourceValues.operatingResult,
        ebitda: decision.sourceValues.ebitda,
        fiscalYearLabel: decision.sourceValues.fiscalYearLabel,
        fiscalPeriodStart: decision.sourceValues.fiscalPeriodStart,
        fiscalPeriodEnd: decision.sourceValues.fiscalPeriodEnd,
        reportingCurrency: decision.sourceValues.reportingCurrency,
        fxRateNokPerUnit: decision.sourceValues.fxRateNokPerUnit,
        fxRateSource: decision.sourceValues.fxRateSource,
      })

      assert.deepEqual(plan.issues, [])
      assert.equal(plan.update?.id, `fin-hagar-${decision.year}`)
    }
  })
})
