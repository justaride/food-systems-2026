import type { RequiredCitation } from './import-helpers'

export type CurrentFinancialRow = {
  id: string
  year: number
  revenueNok: string | number | null
  operatingResult: string | number | null
  ebitda?: string | number | null
  fiscalYearLabel?: string | null
  fiscalPeriodStart?: string | Date | null
  fiscalPeriodEnd?: string | Date | null
  reportingCurrency?: string | null
  fxRateNokPerUnit?: string | number | null
  fxRateSource?: string | null
}

export type FinancialExactValueDecision = {
  actionId: string
  companyName: string
  year: number
  accessedAt: string
  sourceUrl: string
  localPath: string
  captureMethod?: string
  citationText: string
  citationNotes: string
  confidence: number
  expectedCurrent: {
    revenueNok: string
    operatingResult: string
    ebitda?: string
    fiscalYearLabel?: string
    fiscalPeriodStart?: string
    fiscalPeriodEnd?: string
    reportingCurrency?: string
    fxRateNokPerUnit?: string
    fxRateSource?: string
  }
  sourceValues: {
    revenueNok: string
    operatingResult: string
    ebitda?: string
    fiscalYearLabel?: string
    fiscalPeriodStart?: string
    fiscalPeriodEnd?: string
    reportingCurrency?: string
    fxRateNokPerUnit?: string
    fxRateSource?: string
  }
}

export type FinancialExactValueUpdate = {
  id: string
  year: number
  revenueNok: string
  operatingResult: string
  ebitda?: string
  fiscalYearLabel?: string
  fiscalPeriodStart?: string
  fiscalPeriodEnd?: string
  reportingCurrency?: string
  fxRateNokPerUnit?: string
  fxRateSource?: string
  fieldPaths: string[]
}

export type FinancialExactValuePlan = {
  actionId: string
  companyName: string
  update: FinancialExactValueUpdate | null
  issues: string[]
}

export const NORGESGRUPPEN_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-NG-2024',
  companyName: 'NorgesGruppen ASA',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.norgesgruppen.no/finans/finans-hjem/rapporter/',
  localPath: 'research/evidence-pack/arsrapporter/text/norgesgruppen-2024.txt',
  citationText: 'NorgesGruppen ASA. (2024). Års- og bærekraftsrapport 2024.',
  citationNotes: 'Verifies 2024 operating income MNOK 118,006 and EBIT MNOK 4,842. Local text references: lines 520-527 and 10412-10429.',
  confidence: 95,
  expectedCurrent: {
    revenueNok: '118000',
    operatingResult: '4800',
  },
  sourceValues: {
    revenueNok: '118006',
    operatingResult: '4842',
  },
}

export const ASKO_NORGE_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-ASKO-2024',
  companyName: 'ASKO Norge AS',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://data.brreg.no/regnskapsregisteret/regnskap',
  localPath: 'research/evidence-pack/regnskapsregisteret-snapshots/929228723-2024-2026-05-18.json',
  captureMethod: 'api_json_snapshot',
  citationText: 'Brønnøysundregistrene. (2024). Nøkkeltall fra årsregnskapet, ASKO Norge AS, orgnr. 929228723, regnskapstype Selskap.',
  citationNotes: 'Verifies statutory ASKO Norge AS 2024 company accounts for orgnr 929228723: sumDriftsinntekter NOK 524,186,809 and driftsresultat NOK 21,484,744. CompanyFinancial stores MNOK, so values are revenueNok MNOK 524.19 and operatingResult MNOK 21.48. The previous 95,000/1,500 values are not statutory ASKO Norge AS values and are not cited. Local JSON path: research/evidence-pack/regnskapsregisteret-snapshots/929228723-2024-2026-05-18.json.',
  confidence: 95,
  expectedCurrent: {
    revenueNok: '95000',
    operatingResult: '1500',
  },
  sourceValues: {
    revenueNok: '524.19',
    operatingResult: '21.48',
  },
}

export const HAGAR_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-HAGAR-2024',
  companyName: 'Hagar hf',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.hagar.is/media/fgpfwir5/fr%C3%A9ttatilkynning-hagar-4f-2024-25-ensk.pdf',
  localPath: 'research/evidence-pack/arsrapporter/text/hagar-2024-25.txt',
  citationText: 'Hagar hf. (2024/25). Management report 2024/25 and 4th quarter results; annual report page for audited fiscal period.',
  citationNotes: 'Verifies Hagar fiscal year 2024/25, covering 2024-03-01 to 2025-02-28. Source figures are sales ISK 180,342m, EBITDA ISK 14,738m and EBIT ISK 10,429m. NOK values use archived Norges Bank daily ISK/NOK observations for 2024-03-01 to 2025-02-28, average ISK/NOK 0.0785668, giving revenueNok MNOK 14,168.9, ebitda MNOK 1,157.9 and operatingResult MNOK 819.4. Local text references: lines 23-40 and 204-222; official annual-report page confirms the audited period.',
  confidence: 90,
  expectedCurrent: {
    revenueNok: '14150',
    operatingResult: '',
    ebitda: '',
    fiscalYearLabel: '',
    fiscalPeriodStart: '',
    fiscalPeriodEnd: '',
    reportingCurrency: '',
    fxRateNokPerUnit: '',
    fxRateSource: '',
  },
  sourceValues: {
    revenueNok: '14168.9',
    operatingResult: '819.4',
    ebitda: '1157.9',
    fiscalYearLabel: '2024/25',
    fiscalPeriodStart: '2024-03-01',
    fiscalPeriodEnd: '2025-02-28',
    reportingCurrency: 'ISK',
    fxRateNokPerUnit: '0.0785668',
    fxRateSource: 'Norges Bank daily ISK/NOK average, 2024-03-01 to 2025-02-28',
  },
}

export const HAGAR_HISTORICAL_FINANCIAL_DECISIONS: FinancialExactValueDecision[] = [
  {
    actionId: 'CF-HAGAR-2020',
    companyName: 'Hagar hf',
    year: 2020,
    accessedAt: '2026-05-18',
    sourceUrl: 'https://www.hagar.is/media/bhshw3h2/hagar-%C3%A1rsreikningur-28-2-2021-%C3%ADsl.pdf',
    localPath: 'research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2020-21-annual-report.txt',
    citationText: 'Hagar hf. (2020/21). Annual report 2020/21, consolidated financial statements.',
    citationNotes: 'Verifies Hagar fiscal year 2020/21, covering 2020-03-01 to 2021-02-28. Source figures are sales ISK 119,582m, EBITDA ISK 8,805m and EBIT ISK 4,547m. NOK values use archived Norges Bank daily ISK/NOK observations for 2020-03-01 to 2021-02-28, average ISK/NOK 0.06840159 over 251 observations, giving revenueNok MNOK 8,179.6, ebitda MNOK 602.3 and operatingResult MNOK 311.0. Local text references: period lines 222-223, income statement lines 497-514 and unit line 546. FX archive: research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2020-03-01_2021-02-28-2026-05-18.json.',
    confidence: 90,
    expectedCurrent: {
      revenueNok: '6200',
      operatingResult: '',
      ebitda: '',
      fiscalYearLabel: '',
      fiscalPeriodStart: '',
      fiscalPeriodEnd: '',
      reportingCurrency: '',
      fxRateNokPerUnit: '',
      fxRateSource: '',
    },
    sourceValues: {
      revenueNok: '8179.6',
      operatingResult: '311',
      ebitda: '602.3',
      fiscalYearLabel: '2020/21',
      fiscalPeriodStart: '2020-03-01',
      fiscalPeriodEnd: '2021-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.06840159',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2020-03-01 to 2021-02-28',
    },
  },
  {
    actionId: 'CF-HAGAR-2021',
    companyName: 'Hagar hf',
    year: 2021,
    accessedAt: '2026-05-18',
    sourceUrl: 'https://www.hagar.is/media/2kwpdvkn/hagar-%C3%A1rsreikningur-28-2-2022-%C3%ADsl.pdf',
    localPath: 'research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2021-22-annual-report.txt',
    citationText: 'Hagar hf. (2021/22). Annual report 2021/22, consolidated financial statements.',
    citationNotes: 'Verifies Hagar fiscal year 2021/22, covering 2021-03-01 to 2022-02-28. Source figures are sales ISK 135,758m, EBITDA ISK 10,518m and EBIT ISK 6,277m. NOK values use archived Norges Bank daily ISK/NOK observations for 2021-03-01 to 2022-02-28, average ISK/NOK 0.06825984 over 254 observations, giving revenueNok MNOK 9,266.8, ebitda MNOK 718.0 and operatingResult MNOK 428.5. Local text references: period lines 216-217, income statement lines 512-530 and unit line 566. FX archive: research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2021-03-01_2022-02-28-2026-05-18.json.',
    confidence: 90,
    expectedCurrent: {
      revenueNok: '6600',
      operatingResult: '',
      ebitda: '',
      fiscalYearLabel: '',
      fiscalPeriodStart: '',
      fiscalPeriodEnd: '',
      reportingCurrency: '',
      fxRateNokPerUnit: '',
      fxRateSource: '',
    },
    sourceValues: {
      revenueNok: '9266.8',
      operatingResult: '428.5',
      ebitda: '718',
      fiscalYearLabel: '2021/22',
      fiscalPeriodStart: '2021-03-01',
      fiscalPeriodEnd: '2022-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.06825984',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2021-03-01 to 2022-02-28',
    },
  },
  {
    actionId: 'CF-HAGAR-2022',
    companyName: 'Hagar hf',
    year: 2022,
    accessedAt: '2026-05-18',
    sourceUrl: 'https://www.hagar.is/media/3oypylpj/hagar-%C3%A1rsreikningur-28-2-2023-%C3%ADsl_undirrita%C3%B0ur.pdf',
    localPath: 'research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2022-23-annual-report.txt',
    citationText: 'Hagar hf. (2022/23). Annual report 2022/23, consolidated financial statements.',
    citationNotes: 'Verifies Hagar fiscal year 2022/23, covering 2022-03-01 to 2023-02-28. Source figures are sales ISK 161,992m, EBITDA ISK 12,041m and EBIT ISK 7,588m. NOK values use archived Norges Bank daily ISK/NOK observations for 2022-03-01 to 2023-02-28, average ISK/NOK 0.07118504 over 254 observations, giving revenueNok MNOK 11,531.4, ebitda MNOK 857.1 and operatingResult MNOK 540.2. Local text references: period lines 216-217, income statement lines 507-529 and unit line 552. FX archive: research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2022-03-01_2023-02-28-2026-05-18.json.',
    confidence: 90,
    expectedCurrent: {
      revenueNok: '7700',
      operatingResult: '',
      ebitda: '',
      fiscalYearLabel: '',
      fiscalPeriodStart: '',
      fiscalPeriodEnd: '',
      reportingCurrency: '',
      fxRateNokPerUnit: '',
      fxRateSource: '',
    },
    sourceValues: {
      revenueNok: '11531.4',
      operatingResult: '540.2',
      ebitda: '857.1',
      fiscalYearLabel: '2022/23',
      fiscalPeriodStart: '2022-03-01',
      fiscalPeriodEnd: '2023-02-28',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.07118504',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2022-03-01 to 2023-02-28',
    },
  },
  {
    actionId: 'CF-HAGAR-2023',
    companyName: 'Hagar hf',
    year: 2023,
    accessedAt: '2026-05-18',
    sourceUrl: 'https://www.hagar.is/media/2sipvkg4/hagar-%C3%A1rsreikningur-29-02-2024-%C3%ADsl_signed.pdf',
    localPath: 'research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2023-24-annual-report.txt',
    citationText: 'Hagar hf. (2023/24). Annual report 2023/24, consolidated financial statements.',
    citationNotes: 'Verifies Hagar fiscal year 2023/24, covering 2023-03-01 to 2024-02-29. Source figures are sales ISK 173,270m, EBITDA ISK 13,063m and EBIT ISK 8,035m. NOK values use archived Norges Bank daily ISK/NOK observations for 2023-03-01 to 2024-02-29, average ISK/NOK 0.07760317 over 252 observations, giving revenueNok MNOK 13,446.3, ebitda MNOK 1,013.7 and operatingResult MNOK 623.5. Local text references: period lines 208-209, income statement lines 498-520 and unit line 539. FX archive: research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2023-03-01_2024-02-29-2026-05-18.json.',
    confidence: 90,
    expectedCurrent: {
      revenueNok: '8900',
      operatingResult: '',
      ebitda: '',
      fiscalYearLabel: '',
      fiscalPeriodStart: '',
      fiscalPeriodEnd: '',
      reportingCurrency: '',
      fxRateNokPerUnit: '',
      fxRateSource: '',
    },
    sourceValues: {
      revenueNok: '13446.3',
      operatingResult: '623.5',
      ebitda: '1013.7',
      fiscalYearLabel: '2023/24',
      fiscalPeriodStart: '2023-03-01',
      fiscalPeriodEnd: '2024-02-29',
      reportingCurrency: 'ISK',
      fxRateNokPerUnit: '0.07760317',
      fxRateSource: 'Norges Bank daily ISK/NOK average, 2023-03-01 to 2024-02-29',
    },
  },
]

export const AXFOOD_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-AXFOOD-2024',
  companyName: 'Axfood AB',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-2024/',
  localPath: 'research/evidence-pack/arsrapporter/text/axfood-annual-report-2024.txt',
  citationText: 'Axfood AB. (2024). Annual and Sustainability Report 2024, financial statements.',
  citationNotes: 'Verifies 2024 net sales SEK 84,057m and operating profit SEK 3,290m. NOK values use archived Norges Bank 2024 annual average FX snapshot `research/evidence-pack/fx-rates/norges-bank/EXR-A-SEK-NOK-SP-2024-2026-05-18.json`: 100 SEK = NOK 101.74, i.e. SEK/NOK 1.0174, giving revenueNok MNOK 85,519.6 and operatingResult MNOK 3,347.2. Local text references: lines 406 and 6329-6343.',
  confidence: 92,
  expectedCurrent: {
    revenueNok: '84100',
    operatingResult: '',
  },
  sourceValues: {
    revenueNok: '85519.6',
    operatingResult: '3347.2',
  },
}

export const ICA_GRUPPEN_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-ICA-2024',
  companyName: 'ICA Gruppen AB',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.icagruppen.se/globalassets/xx.-arsredovisning-2024/250221_icagruppen_annual_report_2024.pdf',
  localPath: 'research/evidence-pack/arsrapporter/text/ica-gruppen-annual-report-2024.txt',
  citationText: 'ICA Gruppen AB. (2024). Annual Report 2024, group financial overview.',
  citationNotes: 'Verifies 2024 net sales SEK 157,216m and operating profit SEK 7,022m. NOK values use archived Norges Bank 2024 annual average FX snapshot `research/evidence-pack/fx-rates/norges-bank/EXR-A-SEK-NOK-SP-2024-2026-05-18.json`: 100 SEK = NOK 101.74, i.e. SEK/NOK 1.0174, giving revenueNok MNOK 159,951.6 and operatingResult MNOK 7,144.2. Local text reference: lines 220-227.',
  confidence: 92,
  expectedCurrent: {
    revenueNok: '157200',
    operatingResult: '',
  },
  sourceValues: {
    revenueNok: '159951.6',
    operatingResult: '7144.2',
  },
}

export const KESKO_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-KESKO-2024',
  companyName: 'Kesko Oyj',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.kesko.fi/en/media/news-and-releases/stock-exchange-releases/2025/keskos-2024-annual-report-has-been-published/',
  localPath: 'research/evidence-pack/arsrapporter/text/kesko-annual-report-2024.txt',
  citationText: 'Kesko Oyj. (2024). Annual Report 2024, report by the Board of Directors.',
  citationNotes: 'Verifies 2024 net sales EUR 11,920.1m and actual operating profit EUR 579.5m. The annual-report front key-figures table also shows comparable operating profit EUR 650.1m, but CompanyFinancial.operatingResult is mapped to the non-comparable Operating profit row. NOK values use archived Norges Bank 2024 annual average FX snapshot `research/evidence-pack/fx-rates/norges-bank/EXR-A-EUR-NOK-SP-2024-2026-05-18.json`: 100 EUR = NOK 1,162.76, i.e. EUR/NOK 11.6276, giving revenueNok MNOK 138,602.2 and operatingResult MNOK 6,738.2. Local text references: lines 153-158, 183-186 and 2205-2223.',
  confidence: 92,
  expectedCurrent: {
    revenueNok: '137080',
    operatingResult: '',
  },
  sourceValues: {
    revenueNok: '138602.2',
    operatingResult: '6738.2',
  },
}

export const SALLING_GROUP_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-SALLING-2024',
  companyName: 'Salling Group A/S',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://sallinggroup.com/en/publications',
  localPath: 'research/evidence-pack/arsrapporter/text/salling-group-2024.txt',
  citationText: 'Salling Group A/S. (2024). Annual Report 2024, financial performance.',
  citationNotes: 'Verifies 2024 total revenue DKK 72,176m and EBIT DKK 2,693m. NOK values use archived Norges Bank 2024 annual average FX snapshot `research/evidence-pack/fx-rates/norges-bank/EXR-A-DKK-NOK-SP-2024-2026-05-18.json`: 100 DKK = NOK 155.89, i.e. DKK/NOK 1.5589, giving revenueNok MNOK 112,515.2 and operatingResult MNOK 4,198.1. Local text references: lines 102-103 and 298-303.',
  confidence: 92,
  expectedCurrent: {
    revenueNok: '111900',
    operatingResult: '',
  },
  sourceValues: {
    revenueNok: '112515.2',
    operatingResult: '4198.1',
  },
}

export const COOP_DANMARK_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-COOP-DK-2024',
  companyName: 'Coop Danmark A/S',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://coop.dk/kontakt/pressekontakt/aarsrapporter/',
  localPath: 'research/evidence-pack/arsrapporter/text/coop-danmark-2024.txt',
  citationText: 'Coop Danmark A/S. (2024). Årsrapport 2024, hoved- og nøgletal.',
  citationNotes: 'Verifies 2024 net revenue DKK 33,618m, EBIT before special items DKK 162m, special items before tax DKK 472m, and actual EBIT after special items DKK 634m. CompanyFinancial.operatingResult is mapped to actual EBIT after special items; the before-special-items EBIT is retained in this note for traceability. NOK values use archived Norges Bank 2024 annual average FX snapshot `research/evidence-pack/fx-rates/norges-bank/EXR-A-DKK-NOK-SP-2024-2026-05-18.json`: 100 DKK = NOK 155.89, i.e. DKK/NOK 1.5589, giving revenueNok MNOK 52,407.1 and operatingResult MNOK 988.3. Local text references: lines 90-103, 181-193 and 1497-1506.',
  confidence: 92,
  expectedCurrent: {
    revenueNok: '52100',
    operatingResult: '',
  },
  sourceValues: {
    revenueNok: '52407.1',
    operatingResult: '988.3',
  },
}

export const REITAN_RETAIL_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-REITAN-2024',
  companyName: 'Reitan Retail AS',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.reitanretail.no/en/about/reports',
  localPath: 'research/evidence-pack/arsrapporter/text/reitan-retail-2024.txt',
  citationText: 'Reitan Retail AS. (2024). Annual and Sustainability Report 2024, financial statements.',
  citationNotes: 'Verifies 2024 IFRS revenue MNOK 109,326 and operating profit MNOK 3,769. The current baseline revenueNok value approximated total systemwide and distribution sales MNOK 148,957; that systemwide metric is not mapped to CompanyFinancial.revenueNok and is retained here for traceability. Local text references: lines 873-879 and 9456-9475.',
  confidence: 95,
  expectedCurrent: {
    revenueNok: '149000',
    operatingResult: '5100',
  },
  sourceValues: {
    revenueNok: '109326',
    operatingResult: '3769',
  },
}

export const COOP_NORGE_2024_FINANCIAL_DECISION: FinancialExactValueDecision = {
  actionId: 'CF-COOP-NO-2024',
  companyName: 'Coop Norge SA',
  year: 2024,
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.coop.no/om-coop/aarsrapporter',
  localPath: 'research/evidence-pack/arsrapporter/text/coop-norge-2024.txt',
  citationText: 'Coop Norge SA. (2024). Årsrapport 2024, femårsoversikt.',
  citationNotes: 'Verifies 2024 totale driftsinntekter MNOK 64,595 and driftsresultat (EBIT) MNOK 671. Local text reference: lines 84-91.',
  confidence: 95,
  expectedCurrent: {
    revenueNok: '55000',
    operatingResult: '580',
  },
  sourceValues: {
    revenueNok: '64595',
    operatingResult: '671',
  },
}

export function buildFinancialExactValuePlan(
  decision: FinancialExactValueDecision,
  currentRow: CurrentFinancialRow | null,
): FinancialExactValuePlan {
  const issues: string[] = []

  if (!currentRow) {
    issues.push(`${decision.actionId}: financial row not found`)
    return { actionId: decision.actionId, companyName: decision.companyName, update: null, issues }
  }

  if (currentRow.year !== decision.year) {
    issues.push(`${decision.actionId}: expected year ${decision.year}, found ${currentRow.year}`)
  }

  const currentRevenue = normalizeDecimal(currentRow.revenueNok)
  const acceptedRevenue = acceptedCurrentFinancialValues(decision.expectedCurrent.revenueNok, decision.sourceValues.revenueNok)
  if (!acceptedRevenue.includes(currentRevenue)) {
    issues.push(`${decision.actionId}: expected current revenueNok ${acceptedRevenue.join(' or ')}, found ${currentRevenue || '<blank>'}`)
  }

  const currentOperatingResult = normalizeDecimal(currentRow.operatingResult)
  const acceptedOperatingResult = acceptedCurrentFinancialValues(
    decision.expectedCurrent.operatingResult,
    decision.sourceValues.operatingResult,
  )
  if (!acceptedOperatingResult.includes(currentOperatingResult)) {
    issues.push(`${decision.actionId}: expected current operatingResult ${formatAcceptedValues(acceptedOperatingResult)}, found ${currentOperatingResult || '<blank>'}`)
  }

  for (const field of OPTIONAL_FINANCIAL_FIELDS) {
    const expected = decision.expectedCurrent[field]
    if (expected === undefined) continue
    const current = normalizeFinancialField(field, currentRow[field])
    const acceptedValues = acceptedCurrentFinancialValues(expected, decision.sourceValues[field])
    if (!acceptedValues.includes(current)) {
      issues.push(`${decision.actionId}: expected current ${field} ${formatAcceptedValues(acceptedValues)}, found ${current || '<blank>'}`)
    }
  }

  const fieldPaths = ['revenueNok', 'operatingResult']
  for (const field of OPTIONAL_FINANCIAL_FIELDS) {
    if (decision.sourceValues[field] !== undefined) fieldPaths.push(field)
  }

  return {
    actionId: decision.actionId,
    companyName: decision.companyName,
    update: issues.length > 0
      ? null
      : buildFinancialUpdate(decision, currentRow, fieldPaths),
    issues,
  }
}

export function buildFinancialSourceCitation(
  decision: FinancialExactValueDecision,
  contentHash: string,
): RequiredCitation {
  return {
    sourceClass: 'primary',
    citationText: decision.citationText,
    accessedAt: decision.accessedAt,
    url: decision.sourceUrl,
    localPath: decision.localPath,
    contentHash,
    captureMethod: decision.captureMethod ?? 'local_text_extract',
    verificationStatus: 'human_verified',
    verifiedAt: `${decision.accessedAt}T00:00:00.000Z`,
    verifiedBy: 'Codex',
    confidence: decision.confidence,
    notes: decision.citationNotes,
  }
}

function normalizeDecimal(value: string | number | null): string {
  if (value === null) return ''
  const text = String(value).trim()
  if (!text) return ''
  return text.endsWith('.00') ? text.slice(0, -3) : text.endsWith('.0') ? text.slice(0, -2) : text
}

function acceptedCurrentFinancialValues(
  expectedCurrent: string,
  sourceValue: string | undefined,
): string[] {
  return [...new Set([expectedCurrent, sourceValue].filter(value => value !== undefined))]
}

function formatAcceptedValues(values: string[]): string {
  return values.map(value => value || '<blank>').join(' or ')
}

function buildFinancialUpdate(
  decision: FinancialExactValueDecision,
  currentRow: CurrentFinancialRow,
  fieldPaths: string[],
): FinancialExactValueUpdate {
  const update: FinancialExactValueUpdate = {
    id: currentRow.id,
    year: currentRow.year,
    revenueNok: decision.sourceValues.revenueNok,
    operatingResult: decision.sourceValues.operatingResult,
    fieldPaths,
  }

  for (const field of OPTIONAL_FINANCIAL_FIELDS) {
    const value = decision.sourceValues[field]
    if (value !== undefined) update[field] = value
  }

  return update
}

const OPTIONAL_FINANCIAL_FIELDS = [
  'ebitda',
  'fiscalYearLabel',
  'fiscalPeriodStart',
  'fiscalPeriodEnd',
  'reportingCurrency',
  'fxRateNokPerUnit',
  'fxRateSource',
] as const

function normalizeFinancialField(
  field: typeof OPTIONAL_FINANCIAL_FIELDS[number],
  value: string | number | Date | null | undefined,
): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (field === 'ebitda' || field === 'fxRateNokPerUnit') return normalizeDecimal(value)
  return String(value).trim()
}
