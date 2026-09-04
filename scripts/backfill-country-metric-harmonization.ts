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
import { resolveCompanyFinancialSourceLocator } from '../src/lib/row-source-locators'

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
  orgNr: string
  year: number
  expectedSourceLocator: string
  expectedSource: string
  expectedVerificationStatus: 'human_verified' | null
  expectedVerifiedAt: string | null
  expectedMargin: number
}

export type FinancialForDerivedMargin = {
  revenueNok: number | { toString(): string } | null
  operatingResult: number | { toString(): string } | null
  operatingMargin: number | { toString(): string } | null
  source: string | null
  verificationStatus: string | null
  verifiedAt: Date | string | null
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
    orgNr: 'SE-556048-2837',
    year: 2025,
    expectedSourceLocator: 'https://www.icagruppen.se/en/annual-report-2025/',
    expectedSource:
      'ICA Gruppen Annual Report 2025. SEK 142403m net sales; SEK 5408m operating profit excl. items; Norges Bank 2025 average SEK/NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
    expectedMargin: 3.8,
  },
  {
    country: 'SE',
    companyName: 'Axfood AB',
    orgNr: 'SE-556542-5353',
    year: 2025,
    expectedSourceLocator: 'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-20252/',
    expectedSource:
      'Axfood Annual and Sustainability Report 2025. SEK 89152m net sales; SEK 3572m adjusted operating profit; Norges Bank 2025 average SEK/NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
    expectedMargin: 4.01,
  },
  {
    country: 'SE',
    companyName: 'Coop Sverige AB',
    orgNr: 'SE-702001-3469',
    year: 2025,
    expectedSourceLocator: 'https://kf.se/wp-content/uploads/2026/03/kf-arsredovisning-2025.pdf',
    expectedSource:
      'Coop Sverige/KF Annual Report 2025. SEK 36377m net sales; SEK -305m operating result; Norges Bank 2025 average SEK/NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
    expectedMargin: -0.84,
  },
  {
    country: 'DK',
    companyName: 'Salling Group A/S',
    orgNr: 'DK-35954716',
    year: 2025,
    expectedSourceLocator: 'https://sallinggroup.com/en/stores/key-figures',
    expectedSource: 'https://sallinggroup.com/en/stores/key-figures',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-03T00:00:00.000Z',
    expectedMargin: 3.9,
  },
  {
    country: 'DK',
    companyName: 'Coop Danmark A/S',
    orgNr: 'DK-26259495',
    year: 2025,
    expectedSourceLocator: 'https://coop.dk/media/hv1lo4bk/coop-danmark-aarsrapport-2025.pdf',
    expectedSource:
      'Coop Danmark Annual Report 2025. DKK 32565m net sales; DKK -215m operating result; Norges Bank 2025 average DKK/NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
    expectedMargin: -0.66,
  },
  {
    country: 'DK',
    companyName: 'REMA 1000 A/S',
    orgNr: 'DK-14705627',
    year: 2025,
    expectedSourceLocator: 'https://www.reitanretail.no/en/about/reports',
    expectedSource:
      'Reitan Retail Annual Report 2025. REMA 1000 Denmark segment: NOK 45239m revenue; NOK 1518m operating profit',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
    expectedMargin: 3.36,
  },
  {
    country: 'FI',
    companyName: 'Kesko Oyj',
    orgNr: 'FI-0110456-8',
    year: 2024,
    expectedSourceLocator: 'document:evidence-pack/arsrapporter/kesko-annual-report-2024',
    expectedSource: 'Kesko Annual Report 2024. EUR 11.92B, 1 EUR ≈ 11.5 NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-05-18T00:00:00.000Z',
    expectedMargin: 5.5,
  },
  {
    country: 'FI',
    companyName: 'SOK (S Group)',
    orgNr: 'FI-0116323-9',
    year: 2024,
    expectedSourceLocator:
      'https://s-ryhma.fi/en/news/s-groups-investments-in-finland-nearly-eur-1-billi/7chnW0iL7yorOogGzyYcSa',
    expectedSource:
      'SOK Financial Statements Bulletin 2024. EUR 14.3B (retail sales), 1 EUR ≈ 11.5 NOK',
    // Preserve the existing authority state: this row remains explicitly
    // unreviewed and internal. This backfill must not manufacture human review.
    expectedVerificationStatus: null,
    expectedVerifiedAt: null,
    expectedMargin: 3.5,
  },
  {
    country: 'IS',
    companyName: 'Hagar hf',
    orgNr: 'IS-670203-2120',
    year: 2024,
    expectedSourceLocator: 'document:evidence-pack/arsrapporter/hagar-2024-25',
    expectedSource: 'Hagar hf Annual Report 2024. EUR ~1.23B, 1 EUR ≈ 11.5 NOK',
    expectedVerificationStatus: 'human_verified',
    expectedVerifiedAt: '2026-05-18T00:00:00.000Z',
    expectedMargin: 5.79,
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

function asIso(value: Date | string | null): string | null {
  if (value === null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function numberValue(value: number | { toString(): string } | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
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
  resolvedSourceLocator: string | null,
): { data: CountryMetricWriteData | null; skipped: string | null } {
  if (!financial) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: missing CompanyFinancial`,
    }
  }

  if (
    financial.company.orgNr !== target.orgNr ||
    financial.company.name !== target.companyName ||
    financial.company.country !== target.country
  ) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: organization number or company identity mismatch`,
    }
  }

  if (financial.source !== target.expectedSource) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: source contract mismatch`,
    }
  }

  if (resolvedSourceLocator !== target.expectedSourceLocator) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: source locator contract mismatch`,
    }
  }

  if (
    financial.verificationStatus !== target.expectedVerificationStatus ||
    asIso(financial.verifiedAt) !== target.expectedVerifiedAt
  ) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: verification contract mismatch`,
    }
  }

  const revenue = numberValue(financial.revenueNok)
  const operatingResult = numberValue(financial.operatingResult)
  const explicitMargin = numberValue(financial.operatingMargin)
  const calculatedMargin =
    explicitMargin ?? (revenue && operatingResult !== null ? round2((operatingResult / revenue) * 100) : null)

  if (calculatedMargin === null || !Number.isFinite(calculatedMargin)) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: no margin numerator/denominator`,
    }
  }

  if (calculatedMargin !== target.expectedMargin) {
    return {
      data: null,
      skipped: `${target.country}/${target.companyName}/${target.year}: margin contract mismatch; expected ${target.expectedMargin}, found ${calculatedMargin}`,
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
      source: target.expectedSource,
      subtitle: 'Operating margin derived from CompanyFinancial revenue and operating result',
      metadata: {
        sourceUrl: resolvedSourceLocator,
        targetOrgNr: target.orgNr,
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
        companyFinancialVerifiedAt: target.expectedVerifiedAt,
        companyFinancialSource: target.expectedSource,
        sourceQuality:
          target.expectedVerificationStatus === 'human_verified'
            ? 'human_verified_financial'
            : 'unverified_internal_financial',
      },
    },
    skipped: null,
  }
}

type PersistedDerivedMarginRow = {
  id?: string
  country: string
  metricType: string
  category: string
  value: number | { toString(): string }
  unit: string | null
  year: string
  source: string
  subtitle: string | null
  metadata: unknown
}

function normalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeJson)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalizeJson(item)]),
    )
  }
  return value
}

function canonicalDerivedMarginRow(row: CountryMetricWriteData | PersistedDerivedMarginRow) {
  return {
    country: row.country,
    metricType: row.metricType,
    category: row.category,
    value: numberValue(row.value),
    unit: row.unit,
    year: row.year,
    source: row.source,
    subtitle: row.subtitle,
    metadata: normalizeJson(row.metadata),
  }
}

export function assertPersistedDerivedMarginRows(
  expected: CountryMetricWriteData[],
  actual: PersistedDerivedMarginRow[],
) {
  const key = (row: ReturnType<typeof canonicalDerivedMarginRow>) =>
    [row.country, row.metricType, row.category, row.year].join('|')
  const sorted = (rows: Array<CountryMetricWriteData | PersistedDerivedMarginRow>) =>
    rows.map(canonicalDerivedMarginRow).sort((a, b) => key(a).localeCompare(key(b)))
  if (JSON.stringify(sorted(expected)) !== JSON.stringify(sorted(actual))) {
    throw new Error('persisted derived margin rows differ from the exact plan')
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
        orgNr: target.orgNr,
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
    const documents = await prisma.document.findMany({
      select: { id: true, slug: true },
    })
    const documentRefs = new Set(
      documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
    )
    const marginPlans = await Promise.all(
      DERIVED_MARGIN_TARGETS.map(async (target) => {
        const financial = await fetchFinancialForTarget(prisma, target)
        return {
          target,
          ...buildDerivedMarginMetricData(
            target,
            financial,
            financial
              ? resolveCompanyFinancialSourceLocator(financial, documentRefs)
              : null,
          ),
        }
      }),
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
      if (marginData.length !== DERIVED_MARGIN_TARGETS.length || skipped.length > 0) {
        throw new Error('refusing partial derived-margin apply because the exact target contract did not pass')
      }

      await prisma.$transaction(async (transaction) => {
        for (const data of marginData) {
          await transaction.countryMetric.upsert({
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
          await transaction.countryMetric.update({
            where: { id: plan.id },
            data: { metadata: plan.metadata },
          })
        }

        const verifiedRows = await transaction.countryMetric.findMany({
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
          orderBy: [
            { country: 'asc' },
            { metricType: 'asc' },
            { category: 'asc' },
            { year: 'asc' },
          ],
        })
        const missing = findMethodLabelGaps(verifiedRows)
        if (missing.length > 0) {
          throw new Error(`CountryMetric methodLabel missing on ${missing.length} rows`)
        }

        const persistedMargins = await transaction.countryMetric.findMany({
          where: {
            OR: marginData.map((row) => ({
              country: row.country,
              metricType: row.metricType,
              category: row.category,
              year: row.year,
            })),
          },
          select: {
            id: true,
            country: true,
            metricType: true,
            category: true,
            value: true,
            unit: true,
            year: true,
            source: true,
            subtitle: true,
            metadata: true,
          },
        })
        assertPersistedDerivedMarginRows(marginData, persistedMargins)
      }, { maxWait: 20_000, timeout: 120_000 })
    }

    const summary = {
      derivedMarginRowsPlanned: marginData.length,
      derivedMarginRowsSkipped: skipped,
      countryMetricRowsLabelled: metadataPlans.length,
      methodLabelVerifiedRows: simulatedRows.length,
      persistedDerivedMarginRowsVerified: apply ? marginData.length : 0,
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
