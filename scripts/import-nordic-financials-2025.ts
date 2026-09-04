/**
 * Imports curated 2025 Nordic grocery financial rows.
 *
 * Safety contract:
 * - dry-run is the default and writes nothing
 * - --apply creates exactly six absent CompanyFinancial rows and refuses updates
 * - missing company org numbers fail before any write
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resolveCompanyFinancialSourceLocator } from '../src/lib/row-source-locators'

const SEK_NOK_2025 = 1.05883984
const DKK_NOK_2025 = 1.57002151

const FX_SOURCE_SEK =
  'Norges Bank EXR/B.SEK.NOK.SP arithmetic average, 2025-01-01..2025-12-31, 251 observations, fetched 2026-07-02'
const FX_SOURCE_DKK =
  'Norges Bank EXR/B.DKK.NOK.SP arithmetic average, 2025-01-01..2025-12-31, 251 observations, fetched 2026-07-02'
const FX_SOURCE_NOK = 'Reported directly in NOK by Reitan Retail Annual Report 2025'

export type NordicFinancial2025Row = {
  orgNr: string
  expectedCompanyName: string
  year: 2025
  revenueNok: number
  operatingResult: number
  operatingMargin: number
  reportingCurrency: 'SEK' | 'DKK' | 'NOK'
  fxRateNokPerUnit: number
  fxRateSource: string
  source: string
  expectedSourceLocator: string
}

type CompanyLookup = {
  id: string
  name: string
  orgNr: string | null
}

type ExistingFinancial = {
  companyId: string
  year: number
}

export type NordicFinancial2025PlannedRow = {
  action: 'create' | 'update'
  company: CompanyLookup
  row: NordicFinancial2025Row
}

export const NORDIC_FINANCIAL_2025_ROWS: NordicFinancial2025Row[] = [
  {
    orgNr: 'SE-556048-2837',
    expectedCompanyName: 'ICA Gruppen AB',
    year: 2025,
    revenueNok: 150781.97,
    operatingResult: 5726.21,
    operatingMargin: 3.8,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'ICA Gruppen Annual Report 2025. SEK 142403m net sales; SEK 5408m operating profit excl. items; Norges Bank 2025 average SEK/NOK',
    expectedSourceLocator: 'https://www.icagruppen.se/en/annual-report-2025/',
  },
  {
    orgNr: 'SE-556542-5353',
    expectedCompanyName: 'Axfood AB',
    year: 2025,
    revenueNok: 94397.69,
    operatingResult: 3782.18,
    operatingMargin: 4.01,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'Axfood Annual and Sustainability Report 2025. SEK 89152m net sales; SEK 3572m adjusted operating profit; Norges Bank 2025 average SEK/NOK',
    expectedSourceLocator:
      'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-20252/',
  },
  {
    orgNr: 'SE-702001-3469',
    expectedCompanyName: 'Coop Sverige AB',
    year: 2025,
    revenueNok: 38517.42,
    operatingResult: -322.95,
    operatingMargin: -0.84,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'Coop Sverige/KF Annual Report 2025. SEK 36377m net sales; SEK -305m operating result; Norges Bank 2025 average SEK/NOK',
    expectedSourceLocator: 'https://kf.se/wp-content/uploads/2026/03/kf-arsredovisning-2025.pdf',
  },
  {
    orgNr: 'DK-35954716',
    expectedCompanyName: 'Salling Group A/S',
    year: 2025,
    revenueNok: 130575.55,
    operatingResult: 5094.72,
    operatingMargin: 3.9,
    reportingCurrency: 'DKK',
    fxRateNokPerUnit: DKK_NOK_2025,
    fxRateSource: FX_SOURCE_DKK,
    source:
      'Salling Group Key Figures 2025. DKK 83168m revenue; DKK 3245m EBIT; Norges Bank 2025 average DKK/NOK',
    expectedSourceLocator: 'https://sallinggroup.com/en/stores/key-figures',
  },
  {
    orgNr: 'DK-26259495',
    expectedCompanyName: 'Coop Danmark A/S',
    year: 2025,
    revenueNok: 51127.75,
    operatingResult: -337.55,
    operatingMargin: -0.66,
    reportingCurrency: 'DKK',
    fxRateNokPerUnit: DKK_NOK_2025,
    fxRateSource: FX_SOURCE_DKK,
    source:
      'Coop Danmark Annual Report 2025. DKK 32565m net sales; DKK -215m operating result; Norges Bank 2025 average DKK/NOK',
    expectedSourceLocator: 'https://coop.dk/media/hv1lo4bk/coop-danmark-aarsrapport-2025.pdf',
  },
  {
    orgNr: 'DK-14705627',
    expectedCompanyName: 'REMA 1000 A/S',
    year: 2025,
    revenueNok: 45239,
    operatingResult: 1518,
    operatingMargin: 3.36,
    reportingCurrency: 'NOK',
    fxRateNokPerUnit: 1,
    fxRateSource: FX_SOURCE_NOK,
    source:
      'Reitan Retail Annual Report 2025. REMA 1000 Denmark segment: NOK 45239m revenue; NOK 1518m operating profit',
    expectedSourceLocator: 'https://www.reitanretail.no/en/about/reports',
  },
]

export function parseApplyMode(argv: string[] = process.argv.slice(2)): boolean {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Use either --apply or --dry-run, not both')
  return apply
}

export function companyFinancialDataForRow(row: NordicFinancial2025Row) {
  return {
    revenueNok: row.revenueNok,
    operatingResult: row.operatingResult,
    operatingMargin: row.operatingMargin,
    reportingCurrency: row.reportingCurrency,
    fxRateNokPerUnit: row.fxRateNokPerUnit,
    fxRateSource: row.fxRateSource,
    source: row.source,
    // Numeric rows are imported as internal evidence only. Human review is a
    // separate authority action and must never be manufactured by this script.
    verificationStatus: null,
    verifiedAt: null,
  }
}

type PersistedNordicFinancial2025Row = ReturnType<typeof companyFinancialDataForRow> & {
  year: number
  company: { orgNr: string | null }
}

function numeric(value: number | { toString(): string } | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function canonicalFinancialRow(row: NordicFinancial2025PlannedRow | PersistedNordicFinancial2025Row) {
  if ('row' in row) {
    const data = companyFinancialDataForRow(row.row)
    return {
      orgNr: row.row.orgNr,
      year: row.row.year,
      revenueNok: data.revenueNok,
      operatingResult: data.operatingResult,
      operatingMargin: data.operatingMargin,
      reportingCurrency: data.reportingCurrency,
      fxRateNokPerUnit: data.fxRateNokPerUnit,
      fxRateSource: data.fxRateSource,
      source: data.source,
      verificationStatus: data.verificationStatus,
      verifiedAt: data.verifiedAt,
    }
  }
  return {
    orgNr: row.company.orgNr,
    year: row.year,
    revenueNok: numeric(row.revenueNok),
    operatingResult: numeric(row.operatingResult),
    operatingMargin: numeric(row.operatingMargin),
    reportingCurrency: row.reportingCurrency,
    fxRateNokPerUnit: numeric(row.fxRateNokPerUnit),
    fxRateSource: row.fxRateSource,
    source: row.source,
    verificationStatus: row.verificationStatus,
    verifiedAt: row.verifiedAt,
  }
}

export function assertPersistedNordicFinancial2025Rows(
  expected: NordicFinancial2025PlannedRow[],
  actual: PersistedNordicFinancial2025Row[],
) {
  const sorted = (rows: Array<NordicFinancial2025PlannedRow | PersistedNordicFinancial2025Row>) =>
    rows.map(canonicalFinancialRow).sort((a, b) => String(a.orgNr).localeCompare(String(b.orgNr)))
  if (JSON.stringify(sorted(expected)) !== JSON.stringify(sorted(actual))) {
    throw new Error('persisted Nordic 2025 financial rows differ from the exact plan')
  }
}

function financialKey(companyId: string, year: number): string {
  return `${companyId}:${year}`
}

export function buildNordicFinancial2025Plan(
  companies: CompanyLookup[],
  existingFinancials: ExistingFinancial[] = [],
) {
  const companiesByOrgNr = new Map(companies.flatMap((company) => (company.orgNr ? [[company.orgNr, company]] : [])))
  const existingKeys = new Set(existingFinancials.map((row) => financialKey(row.companyId, row.year)))
  const planned: NordicFinancial2025PlannedRow[] = []
  const missingCompanyOrgNrs: string[] = []
  const companyIdentityMismatches: string[] = []

  for (const row of NORDIC_FINANCIAL_2025_ROWS) {
    const company = companiesByOrgNr.get(row.orgNr)
    if (!company) {
      missingCompanyOrgNrs.push(row.orgNr)
      continue
    }
    if (company.name !== row.expectedCompanyName) {
      companyIdentityMismatches.push(
        `${row.orgNr}: expected ${row.expectedCompanyName}, found ${company.name}`,
      )
      continue
    }
    planned.push({
      action: existingKeys.has(financialKey(company.id, row.year)) ? 'update' : 'create',
      company,
      row,
    })
  }

  return {
    planned,
    missingCompanyOrgNrs,
    companyIdentityMismatches,
    totals: {
      rows: NORDIC_FINANCIAL_2025_ROWS.length,
      planned: planned.length,
      missingCompanies: missingCompanyOrgNrs.length,
      identityMismatches: companyIdentityMismatches.length,
      creates: planned.filter((row) => row.action === 'create').length,
      updates: planned.filter((row) => row.action === 'update').length,
    },
  }
}

export async function runNordicFinancial2025Import(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const apply = parseApplyMode(argv)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const orgNrs = NORDIC_FINANCIAL_2025_ROWS.map((row) => row.orgNr)
    const [companies, documents] = await Promise.all([
      prisma.company.findMany({
        where: { orgNr: { in: orgNrs } },
        select: { id: true, name: true, orgNr: true },
      }),
      prisma.document.findMany({ select: { id: true, slug: true } }),
    ])

    const initialPlan = buildNordicFinancial2025Plan(companies)
    if (initialPlan.missingCompanyOrgNrs.length > 0) {
      throw new Error(`Missing companies for orgNr: ${initialPlan.missingCompanyOrgNrs.join(', ')}`)
    }
    if (initialPlan.companyIdentityMismatches.length > 0) {
      throw new Error(`Company identity mismatch: ${initialPlan.companyIdentityMismatches.join(', ')}`)
    }

    const existingFinancials = await prisma.companyFinancial.findMany({
      where: {
        year: 2025,
        companyId: { in: initialPlan.planned.map((row) => row.company.id) },
      },
      select: { companyId: true, year: true },
    })
    const plan = buildNordicFinancial2025Plan(companies, existingFinancials)
    const documentRefs = new Set(
      documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
    )
    const provenanceGaps = plan.planned.filter((item) => {
      const resolved = resolveCompanyFinancialSourceLocator(
        { source: item.row.source, year: item.row.year, company: { orgNr: item.row.orgNr } },
        documentRefs,
      )
      return resolved !== item.row.expectedSourceLocator
    })
    if (provenanceGaps.length > 0) {
      throw new Error(
        `Nordic 2025 source locator contract mismatch: ${provenanceGaps.map((item) => item.row.orgNr).join(', ')}`,
      )
    }

    console.log(
      `[nordic-financials-2025] ${apply ? 'apply' : 'dry-run'}: ` +
        `${plan.totals.planned}/${plan.totals.rows} rows, ` +
        `creates=${plan.totals.creates}, updates=${plan.totals.updates}`,
    )

    for (const item of plan.planned) {
      const label = `${item.company.name} (${item.company.orgNr}) ${item.row.year}`
      if (!apply) {
        console.log(`  [DRY ${item.action.toUpperCase()}] ${label}: revenueNok=${item.row.revenueNok}`)
      }
    }

    if (apply) {
      if (plan.totals.creates !== NORDIC_FINANCIAL_2025_ROWS.length || plan.totals.updates !== 0) {
        throw new Error('refusing Nordic 2025 financial apply unless all six rows are absent')
      }
      await prisma.$transaction(async (transaction) => {
        for (const item of plan.planned) {
          await transaction.companyFinancial.create({
            data: {
              companyId: item.company.id,
              year: item.row.year,
              ...companyFinancialDataForRow(item.row),
            },
          })
        }
        const persisted = await transaction.companyFinancial.findMany({
          where: {
            year: 2025,
            companyId: { in: plan.planned.map((item) => item.company.id) },
          },
          select: {
            year: true,
            revenueNok: true,
            operatingResult: true,
            operatingMargin: true,
            reportingCurrency: true,
            fxRateNokPerUnit: true,
            fxRateSource: true,
            source: true,
            verificationStatus: true,
            verifiedAt: true,
            company: { select: { orgNr: true } },
          },
        })
        assertPersistedNordicFinancial2025Rows(plan.planned, persisted)
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
  runNordicFinancial2025Import().catch((error) => {
    console.error('[nordic-financials-2025] failed:', error)
    process.exit(1)
  })
}
