import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildFinancialMissingMetadata,
  buildFinancialUpsertData,
  classifyFinancialBackfillTarget,
  financialMissingDisplay,
  isNorwegianFinancialStatementTarget,
  selectLatestCompanyStatement,
} from '../../src/lib/financial-backfill'

describe('financial backfill helpers', () => {
  it('targets only live Norwegian AS/ASA rows with BRREG organization numbers', () => {
    assert.equal(
      isNorwegianFinancialStatementTarget({
        orgNr: '815664582',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: null,
      }),
      true,
    )

    assert.equal(
      classifyFinancialBackfillTarget({
        orgNr: 'NO-LIDL',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: { status: 'exited' },
      }).reason,
      'synthetic_orgnr',
    )

    assert.equal(
      classifyFinancialBackfillTarget({
        orgNr: 'DK-35954716',
        country: 'DK',
        legalForm: 'A/S',
        isResearchConstruct: false,
        metadata: null,
      }).reason,
      'foreign_registry',
    )

    assert.equal(
      classifyFinancialBackfillTarget({
        orgNr: '999320600',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: { brregStatus: 'slettet:2025-11-08' },
      }).reason,
      'deregistered',
    )
  })

  it('merges explicit financial missing reason metadata without deleting existing metadata', () => {
    assert.deepEqual(
      buildFinancialMissingMetadata(
        { source: 'company-extraction-candidate', aliases: ['Banan II'] },
        {
          reason: 'regnskapsregisteret_no_accounts',
          source: 'https://data.brreg.no/regnskapsregisteret/regnskap/816488362?regnskapstype=SELSKAP',
          checkedAt: '2026-06-11T00:00:00.000Z',
          note: 'BRREG returned no company accounts',
        },
      ),
      {
        source: 'company-extraction-candidate',
        aliases: ['Banan II'],
        financials: {
          missingReason: 'regnskapsregisteret_no_accounts',
          missingReasonSource: 'https://data.brreg.no/regnskapsregisteret/regnskap/816488362?regnskapstype=SELSKAP',
          missingReasonCheckedAt: '2026-06-11T00:00:00.000Z',
          missingReasonNote: 'BRREG returned no company accounts',
        },
      },
    )
  })

  it('selects the newest company statement and maps it to deterministic CompanyFinancial data', () => {
    const statement = selectLatestCompanyStatement([
      {
        id: 12,
        regnskapstype: 'SELSKAP',
        virksomhet: { organisasjonsnummer: '815664582' },
        regnskapsperiode: { fraDato: '2023-01-01', tilDato: '2023-12-31' },
        valuta: 'NOK',
        resultatregnskapResultat: {
          driftsresultat: {
            driftsresultat: 20,
            driftsinntekter: { sumDriftsinntekter: 100 },
          },
        },
        egenkapitalGjeld: {
          egenkapital: { sumEgenkapital: 40 },
        },
        eiendeler: { sumEiendeler: 200 },
      },
      {
        id: 13,
        regnskapstype: 'SELSKAP',
        virksomhet: { organisasjonsnummer: '815664582' },
        regnskapsperiode: { fraDato: '2024-01-01', tilDato: '2024-12-31' },
        valuta: 'NOK',
        resultatregnskapResultat: {
          driftsresultat: {
            driftsresultat: 25,
            driftsinntekter: { sumDriftsinntekter: 125 },
          },
        },
        egenkapitalGjeld: {
          egenkapital: { sumEgenkapital: 50 },
        },
        eiendeler: { sumEiendeler: 250 },
      },
    ], '815664582')

    assert.equal(statement?.id, 13)
    assert.deepEqual(buildFinancialUpsertData('company-1', statement!, '2026-06-11T00:00:00.000Z'), {
      companyId: 'company-1',
      year: 2024,
      revenueNok: 125,
      operatingResult: 25,
      operatingMargin: 20,
      ebitda: null,
      equityRatio: 20,
      groupEmployees: null,
      source: 'Regnskapsregisteret 2024',
      fiscalYearLabel: '2024',
      fiscalPeriodStart: new Date('2024-01-01T00:00:00.000Z'),
      fiscalPeriodEnd: new Date('2024-12-31T00:00:00.000Z'),
      reportingCurrency: 'NOK',
      fxRateNokPerUnit: 1,
      fxRateSource: 'NOK',
      verificationStatus: 'machine_verified',
      verifiedAt: new Date('2026-06-11T00:00:00.000Z'),
    })
  })

  it('keeps out-of-range derived ratios null so narrow Decimal fields do not overflow', () => {
    const data = buildFinancialUpsertData(
      'company-1',
      {
        id: 14,
        regnskapstype: 'SELSKAP',
        virksomhet: { organisasjonsnummer: '814055922' },
        regnskapsperiode: { fraDato: '2024-01-01', tilDato: '2024-12-31' },
        valuta: 'NOK',
        resultatregnskapResultat: {
          driftsresultat: {
            driftsresultat: -1_545_277,
            driftsinntekter: { sumDriftsinntekter: 1_989 },
          },
        },
        egenkapitalGjeld: {
          egenkapital: { sumEgenkapital: 353_411_990 },
        },
        eiendeler: { sumEiendeler: 697_509_811 },
      },
      '2026-06-11T00:00:00.000Z',
    )

    assert.equal(data.operatingMargin, null)
    assert.equal(data.equityRatio, 50.67)
  })

  it('shows explicit non-applicable labels for marked financial gaps', () => {
    assert.deepEqual(
      financialMissingDisplay({ financials: { missingReason: 'foreign_registry' } }),
      { missingValueReason: 'not_applicable', label: 'Utenlandsk register' },
    )
    assert.deepEqual(
      financialMissingDisplay({ financials: { missingReason: 'synthetic_orgnr' } }),
      { missingValueReason: 'no_matching_record', label: 'Uten BRREG-match' },
    )
    assert.deepEqual(
      financialMissingDisplay({ financials: { missingReason: 'regnskapsregisteret_unsupported_accounts' } }),
      { missingValueReason: 'no_financial_row', label: 'Ikke støttet regnskap' },
    )
  })
})
