/**
 * Adds method metadata to CountryMetric rows and derives selected company-level
 * operating margin CountryMetric rows from CompanyFinancial.
 *
 * Safety contract:
 * - dry-run is the default and writes nothing
 * - use --apply for CountryMetric upsert/update
 * - method-label verification runs before reporting success
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export type JsonRecord = Record<string, unknown>

export const COUNTRY_METRIC_HARMONIZATION_PASS = 'country-metric-harmonization-2026-07-02'
export const RELEVANT_COUNTRY_METRIC_TYPES = [
  'selfSufficiency',
  'marketShare',
  'retailerShare',
  'hhi',
  'margin',
]

export type DerivedMarginTarget = {
  country: string
  companyName: string
  year: number
  sourceUrl: string
}

export type FinancialForDerivedMargin = {
  revenueNok: number | { toString(): string } | null
  operatingResult: number | { toString(): string } | null
  operatingMargin: number | { toString(): string } | null
  source: string | null
  verificationStatus: string | null
  company: {
    name: string
    orgNr: string | null
    country: string | null
  }
}

export type CountryMetricMethodRow = {
  id?: string
  country: string
  metricType: string
  category: string
  year: string
  source: string
  metadata: unknown
}

export type CountryMetricWriteData = {
  country: string
  metricType: string
  category: string
  value: number
  unit: string
  year: string
  source: string
  subtitle: string
  metadata: JsonRecord
}

export const DERIVED_MARGIN_TARGETS: DerivedMarginTarget[] = [
  {
    country: 'SE',
    companyName: 'ICA Gruppen AB',
    year: 2025,
    sourceUrl: 'https://www.icagruppen.se/en/annual-report-2025/',
  },
  {
    country: 'SE',
    companyName: 'Axfood AB',
    year: 2025,
    sourceUrl: 'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-20252/',
  },
  {
    country: 'SE',
    companyName: 'Coop Sverige AB',
    year: 2025,
    sourceUrl: 'https://kf.se/wp-content/uploads/2026/03/kf-arsredovisning-2025.pdf',
  },
  {
    country: 'DK',
    companyName: 'Salling Group A/S',
    year: 2025,
    sourceUrl: 'https://sallinggroup.com/en/stores/key-figures',
  },
  {
    country: 'DK',
    companyName: 'Coop Danmark A/S',
    year: 2025,
    sourceUrl: 'https://coop.dk/media/hv1lo4bk/coop-danmark-aarsrapport-2025.pdf',
  },
  {
    country: 'DK',
    companyName: 'REMA 1000 A/S',
    year: 2025,
    sourceUrl: 'https://www.reitanretail.no/en/about/reports',
  },
  {
    country: 'FI',
    companyName: 'Kesko Oyj',
    year: 2024,
    sourceUrl: 'document:evidence-pack/arsrapporter/kesko-annual-report-2024',
  },
  {
    country: 'FI',
    companyName: 'SOK (S Group)',
    year: 2024,
    sourceUrl: 'https://s-ryhma.fi/en/news/s-groups-investments-in-finland-nearly-eur-1-billi/7chnW0iL7yorOogGzyYcSa',
  },
  {
    country: 'IS',
    companyName: 'Hagar hf',
    year: 2024,
    sourceUrl: 'document:evidence-pack/arsrapporter/hagar-2024-25',
  },
]

export function parseApplyMode(argv: string[] = process.argv.slice(2)): boolean {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Use either --apply or --dry-run, not both')
  return apply
}

export function metadataRecord(metadata: unknown): JsonRecord {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? { ...(metadata as JsonRecord) }
    : {}
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function sourceQuality(source: string | null | undefined): string {
  const normalized = source?.toLowerCase() ?? ''
  if (normalized.includes('est.')) return 'estimate_label'
  if (normalized.includes('beregnet')) return 'derived'
  if (normalized.includes('unverified')) return 'unverified_label'
  return 'source_label'
}

export function methodLabelForMetric(metricType: string, category: string): string | null {
  const normalizedCategory = category.toLowerCase()

  if (metricType === 'selfSufficiency') {
    if (/(kalor|kalorit)/.test(normalizedCategory)) {
      return 'caloric_self_sufficiency_percent_national_method'
    }
    if (/(fisk|sjavar|sjávar|seafood)/.test(normalizedCategory)) {
      return 'seafood_or_fish_self_sufficiency_percent_not_feed_adjusted'
    }
    return 'commodity_self_sufficiency_percent_domestic_production_over_consumption'
  }

  if (metricType === 'marketShare') {
    return 'store_format_share_of_grocery_turnover_percent'
  }

  if (metricType === 'retailerShare') {
    return 'retailer_turnover_share_percent'
  }

  if (metricType === 'hhi') {
    return 'derived_hhi_sum_of_squared_retailer_turnover_shares'
  }

  if (metricType === 'margin') {
    return 'operating_margin_percent_operating_result_over_revenue'
  }

  return null
}

export function buildCountryMetricMethodMetadata(row: CountryMetricMethodRow): JsonRecord | null {
  const methodLabel = methodLabelForMetric(row.metricType, row.category)
  if (!methodLabel) return null

  const metadata = metadataRecord(row.metadata)
  return {
    ...metadata,
    methodLabel,
    methodScope:
      metadata.methodScope ??
      (row.metricType === 'hhi'
        ? 'derived_from_same_country_retailer_share_rows'
        : 'country_metric_harmonized_snapshot'),
    sourceQuality: metadata.sourceQuality ?? sourceQuality(row.source),
    harmonizationPass: COUNTRY_METRIC_HARMONIZATION_PASS,
  }
}

export function buildDerivedMarginMetricData(
  target: DerivedMarginTarget,
  financial: FinancialForDerivedMargin | null,
): { data: CountryMetricWriteData | null; skipped: string | null } {
  if (!financial) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: missing CompanyFinancial`,
    }
  }

  const revenue = financial.revenueNok === null ? null : Number(financial.revenueNok)
  const operatingResult =
    financial.operatingResult === null ? null : Number(financial.operatingResult)
  const explicitMargin =
    financial.operatingMargin === null ? null : Number(financial.operatingMargin)
  const calculatedMargin =
    explicitMargin ?? (revenue && operatingResult !== null ? round2((operatingResult / revenue) * 100) : null)

  if (calculatedMargin === null || !Number.isFinite(calculatedMargin)) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: no margin numerator/denominator`,
    }
  }

  return {
    data: {
      country: target.country,
      metricType: 'margin',
      category: financial.company.name,
      value: calculatedMargin,
      unit: '%',
      year: String(target.year),
      source: financial.source ?? 'CompanyFinancial derived margin',
      subtitle: 'Operating margin derived from CompanyFinancial revenue and operating result',
      metadata: {
        sourceUrl: target.sourceUrl,
        methodLabel: 'operating_margin_percent_operating_result_over_revenue',
        methodScope: 'company_level_latest_verified_or_available_financial_row',
        harmonizationPass: COUNTRY_METRIC_HARMONIZATION_PASS,
        derivedFrom: 'CompanyFinancial',
        companyOrgNr: financial.company.orgNr,
        companyCountry: financial.company.country,
        revenueNok: revenue,
        operatingResultNok: operatingResult,
        operatingMarginSource:
          explicitMargin === null
            ? 'calculated_from_revenue_and_operating_result'
            : 'companyFinancial.operatingMargin',
        companyFinancialVerificationStatus: financial.verificationStatus,
        companyFinancialSource: financial.source,
      },
    },
    skipped: null,
  }
}

export function findMethodLabelGaps(rows: CountryMetricMethodRow[]) {
  return rows.filter((row) => {
    const metadata = metadataRecord(row.metadata)
    return typeof metadata.methodLabel !== 'string' || !metadata.methodLabel.trim()
  })
}

async function fetchFinancialForTarget(
  prisma: PrismaClient,
  target: DerivedMarginTarget,
): Promise<FinancialForDerivedMargin | null> {
  return prisma.companyFinancial.findFirst({
    where: {
      year: target.year,
      company: {
        country: target.country,
        name: target.companyName,
      },
    },
    include: {
      company: {
        select: {
          name: true,
          orgNr: true,
          country: true,
        },
      },
    },
  })
}

async function readCountryMetricMethodRows(prisma: PrismaClient): Promise<CountryMetricMethodRow[]> {
  return prisma.countryMetric.findMany({
    where: { metricType: { in: RELEVANT_COUNTRY_METRIC_TYPES } },
    select: {
      id: true,
      country: true,
      metricType: true,
      category: true,
      year: true,
      source: true,
      metadata: true,
    },
    orderBy: [{ country: 'asc' }, { metricType: 'asc' }, { category: 'asc' }, { year: 'asc' }],
  })
}

export async function runCountryMetricHarmonization(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const apply = parseApplyMode(argv)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const marginPlans = await Promise.all(
      DERIVED_MARGIN_TARGETS.map(async (target) => ({
        target,
        ...(buildDerivedMarginMetricData(target, await fetchFinancialForTarget(prisma, target))),
      })),
    )

    const countryMetricRows = await readCountryMetricMethodRows(prisma)
    const metadataPlans = countryMetricRows.flatMap((row) => {
      const metadata = buildCountryMetricMethodMetadata(row)
      return metadata && row.id ? [{ id: row.id, row, metadata }] : []
    })
    const simulatedRows = countryMetricRows.map((row) => ({
      ...row,
      metadata: buildCountryMetricMethodMetadata(row) ?? row.metadata,
    }))
    const simulatedMissing = findMethodLabelGaps(simulatedRows)

    if (simulatedMissing.length > 0) {
      for (const row of simulatedMissing.slice(0, 20)) {
        console.error(`methodLabel missing: ${row.country}/${row.metricType}/${row.category}/${row.year}`)
      }
      throw new Error(`CountryMetric methodLabel missing on ${simulatedMissing.length} rows after planned harmonization`)
    }

    const marginData = marginPlans.flatMap((plan) => (plan.data ? [plan.data] : []))

    console.log(
      `[country-metric-harmonization] ${apply ? 'apply' : 'dry-run'}: ` +
        `derivedMargins=${marginData.length}/${DERIVED_MARGIN_TARGETS.length}, ` +
        `methodMetadataRows=${metadataPlans.length}`,
    )
    const skipped = marginPlans.flatMap((plan) => (plan.skipped ? [plan.skipped] : []))
    for (const message of skipped) console.log(`  [SKIP] ${message}`)

    if (apply) {
      for (const data of marginData) {
        await prisma.countryMetric.upsert({
          where: {
            country_metricType_category_year: {
              country: data.country,
              metricType: data.metricType,
              category: data.category,
              year: data.year,
            },
          },
          update: data,
          create: data,
        })
      }

      for (const plan of metadataPlans) {
        await prisma.countryMetric.update({
          where: { id: plan.id },
          data: { metadata: plan.metadata },
        })
      }

      const verifiedRows = await readCountryMetricMethodRows(prisma)
      const missing = findMethodLabelGaps(verifiedRows)
      if (missing.length > 0) throw new Error(`CountryMetric methodLabel missing on ${missing.length} rows`)
    }

    const summary = {
      derivedMarginRowsPlanned: marginData.length,
      derivedMarginRowsSkipped: skipped,
      countryMetricRowsLabelled: metadataPlans.length,
      methodLabelVerifiedRows: simulatedRows.length,
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
  runCountryMetricHarmonization().catch((error) => {
    console.error('[country-metric-harmonization] failed:', error)
    process.exit(1)
  })
}
