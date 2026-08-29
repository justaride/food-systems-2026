/**
 * Imports curated 2025 Nordic grocery financial rows.
 *
 * Safety contract:
 * - dry-run is the default and writes nothing
 * - use --apply for CompanyFinancial upserts
 * - missing company org numbers fail before any write
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { millionNokToRawNok } from '../src/lib/queries/financial-units'

export const NORDIC_FINANCIALS_2025_VERIFIED_AT = new Date('2026-07-02T00:00:00.000Z')

const SEK_NOK_2025 = 1.05883984
const DKK_NOK_2025 = 1.57002151

const FX_SOURCE_SEK =
  'Norges Bank EXR/B.SEK.NOK.SP arithmetic average, 2025-01-01..2025-12-31, 251 observations, fetched 2026-07-02'
const FX_SOURCE_DKK =
  'Norges Bank EXR/B.DKK.NOK.SP arithmetic average, 2025-01-01..2025-12-31, 251 observations, fetched 2026-07-02'
const FX_SOURCE_NOK = 'Reported directly in NOK by Reitan Retail Annual Report 2025'

export type NordicFinancial2025Row = {
  orgNr: string
  year: 2025
  /** MNOK, som i kildeoppstillingene. Skrives til DB i rå NOK. */
  revenueNok: number
  /** MNOK, som i kildeoppstillingene. Skrives til DB i rå NOK. */
  operatingResult: number
  operatingMargin: number
  reportingCurrency: 'SEK' | 'DKK' | 'NOK'
  fxRateNokPerUnit: number
  fxRateSource: string
  source: string
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
    year: 2025,
    revenueNok: 150781.97,
    operatingResult: 5726.21,
    operatingMargin: 3.8,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'ICA Gruppen Annual Report 2025. SEK 142403m net sales; SEK 5408m operating profit excl. items; Norges Bank 2025 average SEK/NOK',
  },
  {
    orgNr: 'SE-556542-5353',
    year: 2025,
    revenueNok: 94397.69,
    operatingResult: 3782.18,
    operatingMargin: 4.01,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'Axfood Annual and Sustainability Report 2025. SEK 89152m net sales; SEK 3572m adjusted operating profit; Norges Bank 2025 average SEK/NOK',
  },
  {
    orgNr: 'SE-702001-3469',
    year: 2025,
    revenueNok: 38517.42,
    operatingResult: -322.95,
    operatingMargin: -0.84,
    reportingCurrency: 'SEK',
    fxRateNokPerUnit: SEK_NOK_2025,
    fxRateSource: FX_SOURCE_SEK,
    source:
      'Coop Sverige/KF Annual Report 2025. SEK 36377m net sales; SEK -305m operating result; Norges Bank 2025 average SEK/NOK',
  },
  {
    orgNr: 'DK-35954716',
    year: 2025,
    revenueNok: 130575.55,
    operatingResult: 5094.72,
    operatingMargin: 3.9,
    reportingCurrency: 'DKK',
    fxRateNokPerUnit: DKK_NOK_2025,
    fxRateSource: FX_SOURCE_DKK,
    source:
      'Salling Group Key Figures 2025. DKK 83168m revenue; DKK 3245m EBIT; Norges Bank 2025 average DKK/NOK',
  },
  {
    orgNr: 'DK-26259495',
    year: 2025,
    revenueNok: 51127.75,
    operatingResult: -337.55,
    operatingMargin: -0.66,
    reportingCurrency: 'DKK',
    fxRateNokPerUnit: DKK_NOK_2025,
    fxRateSource: FX_SOURCE_DKK,
    source:
      'Coop Danmark Annual Report 2025. DKK 32565m net sales; DKK -215m operating result; Norges Bank 2025 average DKK/NOK',
  },
  {
    orgNr: 'DK-14705627',
    year: 2025,
    revenueNok: 45239,
    operatingResult: 1518,
    operatingMargin: 3.36,
    reportingCurrency: 'NOK',
    fxRateNokPerUnit: 1,
    fxRateSource: FX_SOURCE_NOK,
    source:
      'Reitan Retail Annual Report 2025. REMA 1000 Denmark segment: NOK 45239m revenue; NOK 1518m operating profit',
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
    // Radene over står i MNOK; kolonnen er rå NOK. Se `prisma/schema.prisma`.
    revenueNok: millionNokToRawNok(row.revenueNok),
    operatingResult: millionNokToRawNok(row.operatingResult),
    operatingMargin: row.operatingMargin,
    reportingCurrency: row.reportingCurrency,
    fxRateNokPerUnit: row.fxRateNokPerUnit,
    fxRateSource: row.fxRateSource,
    source: row.source,
    verificationStatus: 'human_verified',
    verifiedAt: NORDIC_FINANCIALS_2025_VERIFIED_AT,
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

  for (const row of NORDIC_FINANCIAL_2025_ROWS) {
    const company = companiesByOrgNr.get(row.orgNr)
    if (!company) {
      missingCompanyOrgNrs.push(row.orgNr)
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
    totals: {
      rows: NORDIC_FINANCIAL_2025_ROWS.length,
      planned: planned.length,
      missingCompanies: missingCompanyOrgNrs.length,
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
    const companies = await prisma.company.findMany({
      where: { orgNr: { in: orgNrs } },
      select: { id: true, name: true, orgNr: true },
    })

    const initialPlan = buildNordicFinancial2025Plan(companies)
    if (initialPlan.missingCompanyOrgNrs.length > 0) {
      throw new Error(`Missing companies for orgNr: ${initialPlan.missingCompanyOrgNrs.join(', ')}`)
    }

    const existingFinancials = await prisma.companyFinancial.findMany({
      where: {
        year: 2025,
        companyId: { in: initialPlan.planned.map((row) => row.company.id) },
      },
      select: { companyId: true, year: true },
    })
    const plan = buildNordicFinancial2025Plan(companies, existingFinancials)

    console.log(
      `[nordic-financials-2025] ${apply ? 'apply' : 'dry-run'}: ` +
        `${plan.totals.planned}/${plan.totals.rows} rows, ` +
        `creates=${plan.totals.creates}, updates=${plan.totals.updates}`,
    )

    for (const item of plan.planned) {
      const label = `${item.company.name} (${item.company.orgNr}) ${item.row.year}`
      if (!apply) {
        console.log(`  [DRY ${item.action.toUpperCase()}] ${label}: revenueNok=${item.row.revenueNok}`)
        continue
      }
      await prisma.companyFinancial.upsert({
        where: { companyId_year: { companyId: item.company.id, year: item.row.year } },
        update: companyFinancialDataForRow(item.row),
        create: {
          companyId: item.company.id,
          year: item.row.year,
          ...companyFinancialDataForRow(item.row),
        },
      })
      console.log(`  [${item.action.toUpperCase()}] ${label}: revenueNok=${item.row.revenueNok}`)
    }

    return plan.totals
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
