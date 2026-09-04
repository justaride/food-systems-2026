/**
 * Repairs the nine CompanyFinancial rows used by the Nordic C1 margin pass.
 *
 * Safety contract:
 * - dry-run is the default
 * - every row must match either the exact known production pre-state or the
 *   exact final state
 * - --apply writes all required changes in one bounded transaction and reads
 *   every row back before commit
 * - verificationStatus/verifiedAt stay null; this operation does not grant
 *   human-review authority
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  NORDIC_FINANCIAL_2025_ROWS,
  companyFinancialDataForRow,
} from './import-nordic-financials-2025'
import { resolveCompanyFinancialSourceLocator } from '../src/lib/row-source-locators'

type NumericLike = number | { toString(): string } | null

export type NordicMarginUnitData = {
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  ebitda: number | null
  source: string
  fiscalYearLabel: string | null
  fiscalPeriodStart: string | null
  fiscalPeriodEnd: string | null
  reportingCurrency: string | null
  unitScale: number
  amountUnitNote: string | null
  fxRateNokPerUnit: number | null
  fxRateSource: string | null
  verificationStatus: string | null
  verifiedAt: string | null
}

export type NordicMarginUnitTarget = {
  orgNr: string
  expectedCompanyName: string
  year: number
  expectedSourceLocator: string
  expectedCurrentData: NordicMarginUnitData
  finalData: NordicMarginUnitData
}

type CompanyLookup = {
  id: string
  name: string
  orgNr: string | null
}

export type FinancialLookup = {
  id: string
  companyId: string
  year: number
  revenueNok: NumericLike
  operatingResult: NumericLike
  operatingMargin: NumericLike
  ebitda: NumericLike
  source: string | null
  fiscalYearLabel: string | null
  fiscalPeriodStart: Date | string | null
  fiscalPeriodEnd: Date | string | null
  reportingCurrency: string | null
  unitScale: number
  amountUnitNote: string | null
  fxRateNokPerUnit: NumericLike
  fxRateSource: string | null
  verificationStatus: string | null
  verifiedAt: Date | string | null
}

export type PlannedNordicMarginUnitRepair = {
  action: 'update' | 'unchanged'
  company: CompanyLookup
  financial: FinancialLookup
  target: NordicMarginUnitTarget
}

const NOK_MILLION_UNIT_SCALE = 1_000_000
const FX_ISK_NOK_2024_25 = 0.0785668
const HAGAR_SOURCE =
  'Hagar Annual Report 2024/25. ISK 180342m sales; ISK 10429m EBIT; Norges Bank 2024-03-01..2025-02-28 average ISK/NOK'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function complete2025Data(row: (typeof NORDIC_FINANCIAL_2025_ROWS)[number]): NordicMarginUnitData {
  return {
    ...companyFinancialDataForRow(row),
    ebitda: null,
    fiscalYearLabel: null,
    fiscalPeriodStart: null,
    fiscalPeriodEnd: null,
  }
}

const NORDIC_2025_UNIT_TARGETS: NordicMarginUnitTarget[] = NORDIC_FINANCIAL_2025_ROWS.map(
  (row) => {
    const finalData = complete2025Data(row)
    return {
      orgNr: row.orgNr,
      expectedCompanyName: row.expectedCompanyName,
      year: row.year,
      expectedSourceLocator: row.expectedSourceLocator,
      expectedCurrentData: {
        ...finalData,
        unitScale: 1,
        amountUnitNote: null,
      },
      finalData,
    }
  },
)

export const NORDIC_MARGIN_UNIT_TARGETS: NordicMarginUnitTarget[] = [
  ...NORDIC_2025_UNIT_TARGETS,
  {
    orgNr: 'FI-0110456-8',
    expectedCompanyName: 'Kesko Oyj',
    year: 2024,
    expectedSourceLocator: 'document:evidence-pack/arsrapporter/kesko-annual-report-2024',
    expectedCurrentData: {
      revenueNok: 137080,
      operatingResult: null,
      operatingMargin: 5.5,
      ebitda: null,
      source: 'Kesko Annual Report 2024. EUR 11.92B, 1 EUR ≈ 11.5 NOK',
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      unitScale: 1,
      amountUnitNote: null,
      fxRateNokPerUnit: null,
      fxRateSource: null,
      verificationStatus: null,
      verifiedAt: null,
    },
    finalData: {
      revenueNok: 137080,
      operatingResult: null,
      operatingMargin: 5.5,
      ebitda: null,
      source: 'Kesko Annual Report 2024. EUR 11.92B, 1 EUR ≈ 11.5 NOK',
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      unitScale: NOK_MILLION_UNIT_SCALE,
      amountUnitNote: 'NOK millions; legacy approximate FX conversion retained from source label',
      fxRateNokPerUnit: null,
      fxRateSource: null,
      verificationStatus: null,
      verifiedAt: null,
    },
  },
  {
    orgNr: 'FI-0116323-9',
    expectedCompanyName: 'SOK (S Group)',
    year: 2024,
    expectedSourceLocator:
      'https://s-ryhma.fi/en/news/s-groups-investments-in-finland-nearly-eur-1-billi/7chnW0iL7yorOogGzyYcSa',
    expectedCurrentData: {
      revenueNok: 164450,
      operatingResult: null,
      operatingMargin: 3.5,
      ebitda: null,
      source: 'SOK Financial Statements Bulletin 2024. EUR 14.3B (retail sales), 1 EUR ≈ 11.5 NOK',
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      unitScale: 1,
      amountUnitNote: null,
      fxRateNokPerUnit: null,
      fxRateSource: null,
      verificationStatus: null,
      verifiedAt: null,
    },
    finalData: {
      revenueNok: 164450,
      operatingResult: null,
      operatingMargin: 3.5,
      ebitda: null,
      source: 'SOK Financial Statements Bulletin 2024. EUR 14.3B (retail sales), 1 EUR ≈ 11.5 NOK',
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      unitScale: NOK_MILLION_UNIT_SCALE,
      amountUnitNote: 'NOK millions; legacy approximate FX conversion retained from source label',
      fxRateNokPerUnit: null,
      fxRateSource: null,
      verificationStatus: null,
      verifiedAt: null,
    },
  },
  {
    orgNr: 'IS-670203-2120',
    expectedCompanyName: 'Hagar hf',
    year: 2024,
    expectedSourceLocator: 'document:evidence-pack/arsrapporter/hagar-2024-25',
    expectedCurrentData: {
      revenueNok: 14150,
      operatingResult: null,
      operatingMargin: null,
      ebitda: null,
      source: 'Hagar hf Annual Report 2024. EUR ~1.23B, 1 EUR ≈ 11.5 NOK',
      fiscalYearLabel: null,
      fiscalPeriodStart: null,
      fiscalPeriodEnd: null,
      reportingCurrency: null,
      unitScale: 1,
      amountUnitNote: null,
      fxRateNokPerUnit: null,
      fxRateSource: null,
      verificationStatus: null,
      verifiedAt: null,
    },
    finalData: {
      revenueNok: round2(180342 * FX_ISK_NOK_2024_25),
      operatingResult: round2(10429 * FX_ISK_NOK_2024_25),
      operatingMargin: round2((10429 / 180342) * 100),
      ebitda: round2(14738 * FX_ISK_NOK_2024_25),
      source: HAGAR_SOURCE,
      fiscalYearLabel: '2024/25',
      fiscalPeriodStart: '2024-03-01T00:00:00.000Z',
      fiscalPeriodEnd: '2025-02-28T00:00:00.000Z',
      reportingCurrency: 'ISK',
      unitScale: NOK_MILLION_UNIT_SCALE,
      amountUnitNote:
        'NOK millions; ISK millions converted with documented fiscal-period ISK/NOK average',
      fxRateNokPerUnit: FX_ISK_NOK_2024_25,
      fxRateSource:
        'Norges Bank EXR/B.ISK.NOK.SP arithmetic average, 2024-03-01..2025-02-28, 250 observations, fetched 2026-05-18',
      verificationStatus: null,
      verifiedAt: null,
    },
  },
]

export function parseApplyMode(argv: string[] = process.argv.slice(2)): boolean {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Use either --apply or --dry-run, not both')
  return apply
}

function numeric(value: NumericLike): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function iso(value: Date | string | null): string | null {
  if (value === null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function canonicalData(data: NordicMarginUnitData | FinancialLookup): NordicMarginUnitData {
  return {
    revenueNok: numeric(data.revenueNok),
    operatingResult: numeric(data.operatingResult),
    operatingMargin: numeric(data.operatingMargin),
    ebitda: numeric(data.ebitda),
    source: data.source ?? '',
    fiscalYearLabel: data.fiscalYearLabel,
    fiscalPeriodStart: iso(data.fiscalPeriodStart),
    fiscalPeriodEnd: iso(data.fiscalPeriodEnd),
    reportingCurrency: data.reportingCurrency,
    unitScale: data.unitScale,
    amountUnitNote: data.amountUnitNote,
    fxRateNokPerUnit: numeric(data.fxRateNokPerUnit),
    fxRateSource: data.fxRateSource,
    verificationStatus: data.verificationStatus,
    verifiedAt: iso(data.verifiedAt),
  }
}

function dataEquals(left: NordicMarginUnitData | FinancialLookup, right: NordicMarginUnitData): boolean {
  return JSON.stringify(canonicalData(left)) === JSON.stringify(canonicalData(right))
}

export function buildNordicMarginUnitRepairPlan(
  companies: CompanyLookup[],
  financials: FinancialLookup[],
) {
  const companiesByOrgNr = new Map(
    companies.flatMap((company) => (company.orgNr ? [[company.orgNr, company] as const] : [])),
  )
  const financialsByKey = new Map(
    financials.map((financial) => [`${financial.companyId}:${financial.year}`, financial] as const),
  )
  const planned: PlannedNordicMarginUnitRepair[] = []
  const missingCompanies: string[] = []
  const missingFinancials: string[] = []
  const identityMismatches: string[] = []
  const contractMismatches: string[] = []

  for (const target of NORDIC_MARGIN_UNIT_TARGETS) {
    const company = companiesByOrgNr.get(target.orgNr)
    if (!company) {
      missingCompanies.push(target.orgNr)
      continue
    }
    if (company.name !== target.expectedCompanyName) {
      identityMismatches.push(
        `${target.orgNr}: expected ${target.expectedCompanyName}, found ${company.name}`,
      )
      continue
    }
    const financial = financialsByKey.get(`${company.id}:${target.year}`)
    if (!financial) {
      missingFinancials.push(`${target.orgNr}:${target.year}`)
      continue
    }

    if (dataEquals(financial, target.finalData)) {
      planned.push({ action: 'unchanged', company, financial, target })
    } else if (dataEquals(financial, target.expectedCurrentData)) {
      planned.push({ action: 'update', company, financial, target })
    } else {
      contractMismatches.push(`${target.orgNr}:${target.year}`)
    }
  }

  return {
    planned,
    missingCompanies,
    missingFinancials,
    identityMismatches,
    contractMismatches,
    totals: {
      targets: NORDIC_MARGIN_UNIT_TARGETS.length,
      eligible: planned.length,
      updates: planned.filter((item) => item.action === 'update').length,
      unchanged: planned.filter((item) => item.action === 'unchanged').length,
      missingCompanies: missingCompanies.length,
      missingFinancials: missingFinancials.length,
      identityMismatches: identityMismatches.length,
      contractMismatches: contractMismatches.length,
    },
  }
}

export function assertPersistedNordicMarginUnitRows(
  expected: PlannedNordicMarginUnitRepair[],
  actual: FinancialLookup[],
) {
  const actualById = new Map(actual.map((row) => [row.id, row]))
  const matches = expected.every((item) => {
    const row = actualById.get(item.financial.id)
    return row !== undefined && row.year === item.target.year && dataEquals(row, item.target.finalData)
  })
  if (!matches || actual.length !== expected.length) {
    throw new Error('persisted Nordic margin unit rows differ from the exact plan')
  }
}

export async function runNordicMarginUnitRepair(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const apply = parseApplyMode(argv)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  try {
    const orgNrs = NORDIC_MARGIN_UNIT_TARGETS.map((target) => target.orgNr)
    const companies = await prisma.company.findMany({
      where: { orgNr: { in: orgNrs } },
      select: { id: true, name: true, orgNr: true },
    })
    const companyIds = companies.map((company) => company.id)
    const [financials, documents] = await Promise.all([
      prisma.companyFinancial.findMany({
        where: {
          companyId: { in: companyIds },
          OR: [{ year: 2024 }, { year: 2025 }],
        },
        select: {
          id: true,
          companyId: true,
          year: true,
          revenueNok: true,
          operatingResult: true,
          operatingMargin: true,
          ebitda: true,
          source: true,
          fiscalYearLabel: true,
          fiscalPeriodStart: true,
          fiscalPeriodEnd: true,
          reportingCurrency: true,
          unitScale: true,
          amountUnitNote: true,
          fxRateNokPerUnit: true,
          fxRateSource: true,
          verificationStatus: true,
          verifiedAt: true,
        },
      }),
      prisma.document.findMany({ select: { id: true, slug: true } }),
    ])
    const plan = buildNordicMarginUnitRepairPlan(companies, financials)
    const failures = [
      ...plan.missingCompanies,
      ...plan.missingFinancials,
      ...plan.identityMismatches,
      ...plan.contractMismatches,
    ]
    if (failures.length > 0) {
      throw new Error(`Nordic margin unit repair contract failed: ${failures.join(', ')}`)
    }

    const documentRefs = new Set(
      documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
    )
    const provenanceGaps = plan.planned.filter((item) => {
      const locator = resolveCompanyFinancialSourceLocator(
        {
          source: item.target.finalData.source,
          year: item.target.year,
          company: { orgNr: item.target.orgNr },
        },
        documentRefs,
      )
      return locator !== item.target.expectedSourceLocator
    })
    if (provenanceGaps.length > 0) {
      throw new Error(
        `Nordic margin unit source locator contract failed: ${provenanceGaps.map((item) => item.target.orgNr).join(', ')}`,
      )
    }

    console.log(
      `[nordic-margin-financial-units] ${apply ? 'apply' : 'dry-run'}: ` +
        `eligible=${plan.totals.eligible}/${plan.totals.targets}, ` +
        `updates=${plan.totals.updates}, unchanged=${plan.totals.unchanged}`,
    )
    for (const item of plan.planned) {
      console.log(
        `  [${apply ? item.action.toUpperCase() : `DRY ${item.action.toUpperCase()}`}] ` +
          `${item.company.name} (${item.target.orgNr}) ${item.target.year}`,
      )
    }

    if (apply) {
      await prisma.$transaction(async (transaction) => {
        for (const item of plan.planned) {
          if (item.action !== 'update') continue
          await transaction.companyFinancial.update({
            where: { id: item.financial.id },
            data: {
              ...item.target.finalData,
              fiscalPeriodStart: item.target.finalData.fiscalPeriodStart
                ? new Date(item.target.finalData.fiscalPeriodStart)
                : null,
              fiscalPeriodEnd: item.target.finalData.fiscalPeriodEnd
                ? new Date(item.target.finalData.fiscalPeriodEnd)
                : null,
              verifiedAt: item.target.finalData.verifiedAt
                ? new Date(item.target.finalData.verifiedAt)
                : null,
            },
          })
        }
        const persisted = await transaction.companyFinancial.findMany({
          where: { id: { in: plan.planned.map((item) => item.financial.id) } },
          select: {
            id: true,
            companyId: true,
            year: true,
            revenueNok: true,
            operatingResult: true,
            operatingMargin: true,
            ebitda: true,
            source: true,
            fiscalYearLabel: true,
            fiscalPeriodStart: true,
            fiscalPeriodEnd: true,
            reportingCurrency: true,
            unitScale: true,
            amountUnitNote: true,
            fxRateNokPerUnit: true,
            fxRateSource: true,
            verificationStatus: true,
            verifiedAt: true,
          },
        })
        assertPersistedNordicMarginUnitRows(plan.planned, persisted)
      }, { maxWait: 20_000, timeout: 120_000 })
    }

    const summary = {
      ...plan.totals,
      provenanceRowsVerified: plan.planned.length,
      persistedRowsVerified: apply ? plan.planned.length : 0,
      applied: apply,
    }
    console.log(JSON.stringify(summary, null, 2))
    return summary
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  runNordicMarginUnitRepair().catch((error) => {
    console.error('[nordic-margin-financial-units] failed:', error)
    process.exit(1)
  })
}
