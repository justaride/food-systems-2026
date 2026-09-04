/**
 * Backfill NordicIndicatorRow for C1 retail-concentration from CountryMetric.
 *
 * Safety:
 * - dry-run default (no writes)
 * - --apply upserts indicator rows for cellId=retail-concentration
 * - does not invent HHI/CR3; derives CR3 from retailerShare top-3
 * - leaves dated holes (unknown + holeReason) when required rows missing
 * - internal / gate:internal only
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient, Prisma } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { parseInventoryUrl } from '../src/lib/source-url-inventory'

export const C1_CELL_ID = 'retail-concentration'
export const C1_PASS = 'nordic-c1-retail-concentration-2026-09-04'
export const COUNTRIES = ['NO', 'SE', 'DK', 'FI', 'IS'] as const

const OTHER_LABELS = new Set(
  ['andre', 'øvrige', 'ovriga', 'övriga', 'muut', 'other', 'others'].map((s) =>
    s.toLocaleLowerCase('nb-NO'),
  ),
)

type MetricRow = {
  country: string
  metricType: string
  category: string
  value: Prisma.Decimal | number
  unit: string | null
  year: string
  source: string
  metadata: unknown
}

export type PlannedIndicator = {
  cellId: string
  country: string
  indicatorId: string
  year: number
  value: number | null
  unit: string
  methodId: string
  quality: string
  holeReason: string | null
  partnerStatus: string
  metadata: Record<string, unknown>
}

function num(v: Prisma.Decimal | number | null | undefined): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(v.toString())
  return Number.isFinite(n) ? n : null
}

function parseYear(year: string): number | null {
  const m = year.match(/(\d{4})/)
  return m ? Number(m[1]) : null
}

function slugBanner(category: string): string {
  return category
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function isOtherCategory(category: string): boolean {
  const c = category.trim().toLocaleLowerCase('nb-NO')
  if (OTHER_LABELS.has(c)) return true
  return [...OTHER_LABELS].some((o) => c === o || c.startsWith(`${o} `))
}

/** Non-banner margin rows that must not enter top-3 retailer margins. */
function isRetailerMarginCategory(category: string): boolean {
  const c = category.toLocaleLowerCase('nb-NO')
  if (c.includes('leverandør') || c.includes('leverandor')) return false
  if (c === 'dagligvare') return false
  return true
}

function hasDirectMetricLocator(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const locator = value.trim()
  if (!locator) return false

  if (locator.startsWith('document:')) {
    const ref = locator.slice('document:'.length)
    return (
      /^[a-z0-9][a-z0-9._/-]*$/i.test(ref) &&
      ref.split('/').every(segment => segment !== '.' && segment !== '..')
    )
  }

  const parsed = parseInventoryUrl(locator)
  return parsed?.protocol === 'http' || parsed?.protocol === 'https'
}

function metricQuality(row: MetricRow): 'measured' | 'modelled' | 'unknown' {
  const metadata =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : null
  const metadataText = metadata ? JSON.stringify(metadata) : ''
  const provenance = `${row.source} ${metadataText}`.toLocaleLowerCase('nb-NO')
  const hasLocator = hasDirectMetricLocator(metadata?.sourceUrl)
  const explicitlyReportedMargin =
    row.metricType === 'margin' &&
    metadata?.operatingMarginSource === 'companyFinancial.operatingMargin'
  if (explicitlyReportedMargin) return hasLocator ? 'measured' : 'unknown'

  const hasExplicitRatioMethod =
    row.metricType === 'margin' &&
    metadata?.methodLabel === 'operating_margin_percent_operating_result_over_revenue'
  if (hasExplicitRatioMethod || /(beregnet|calculated|derived|modell)/.test(provenance)) {
    return 'modelled'
  }

  if (row.metricType === 'margin' && !hasLocator) return 'unknown'
  if (provenance.includes('unverified_internal_financial')) return 'unknown'
  return 'measured'
}

export function planC1Indicators(metrics: MetricRow[]): PlannedIndicator[] {
  const planned: PlannedIndicator[] = []
  const byCountry = new Map<string, MetricRow[]>()
  for (const row of metrics) {
    if (!COUNTRIES.includes(row.country as (typeof COUNTRIES)[number])) continue
    const list = byCountry.get(row.country) ?? []
    list.push(row)
    byCountry.set(row.country, list)
  }

  for (const country of COUNTRIES) {
    const rows = byCountry.get(country) ?? []

    // HHI — latest year with dagligvare (or any) hhi row
    const hhiRows = rows
      .filter((r) => r.metricType === 'hhi')
      .map((r) => ({ ...r, y: parseYear(r.year) }))
      .filter((r) => r.y != null) as Array<MetricRow & { y: number }>
    hhiRows.sort((a, b) => b.y - a.y)
    const hhi = hhiRows.find((r) => r.category.toLocaleLowerCase('nb-NO') === 'dagligvare') ?? hhiRows[0]
    if (hhi) {
      planned.push({
        cellId: C1_CELL_ID,
        country,
        indicatorId: 'hhi',
        year: hhi.y,
        value: num(hhi.value),
        unit: hhi.unit ?? 'index',
        methodId: 'retail-hhi-v1',
        quality: metricQuality(hhi),
        holeReason: null,
        partnerStatus: 'internal',
        metadata: {
          pass: C1_PASS,
          sourceMetricType: 'hhi',
          sourceCategory: hhi.category,
          source: hhi.source,
          sourceYearLabel: hhi.year,
          sourceMetadata: hhi.metadata,
        },
      })
    } else {
      planned.push({
        cellId: C1_CELL_ID,
        country,
        indicatorId: 'hhi',
        year: 2024,
        value: null,
        unit: 'index',
        methodId: 'retail-hhi-v1',
        quality: 'unknown',
        holeReason: 'No CountryMetric hhi row for country',
        partnerStatus: 'internal',
        metadata: { pass: C1_PASS },
      })
    }

    // CR3 — sum of top-3 retailerShare excluding residual "Andre"/etc., latest year
    const shareRows = rows
      .filter((r) => r.metricType === 'retailerShare' && !isOtherCategory(r.category))
      .map((r) => ({ ...r, y: parseYear(r.year), v: num(r.value) }))
      .filter((r) => r.y != null && r.v != null) as Array<MetricRow & { y: number; v: number }>
    const shareYears = [...new Set(shareRows.map((r) => r.y))].sort((a, b) => b - a)
    const shareYear = shareYears[0]
    if (shareYear != null) {
      const top = shareRows
        .filter((r) => r.y === shareYear)
        .sort((a, b) => b.v - a.v)
        .slice(0, 3)
      if (top.length === 3) {
        const cr3 = top.reduce((s, r) => s + r.v, 0)
        planned.push({
          cellId: C1_CELL_ID,
          country,
          indicatorId: 'cr3',
          year: shareYear,
          value: Math.round(cr3 * 100) / 100,
          unit: 'percent',
          methodId: 'retail-cr3-v1',
          quality: 'modelled',
          holeReason: null,
          partnerStatus: 'internal',
          metadata: {
            pass: C1_PASS,
            derivation: 'sum(top3 retailerShare excluding residual categories)',
            top3: top.map((r) => ({ category: r.category, value: r.v, source: r.source })),
          },
        })
      } else {
        planned.push({
          cellId: C1_CELL_ID,
          country,
          indicatorId: 'cr3',
          year: shareYear,
          value: null,
          unit: 'percent',
          methodId: 'retail-cr3-v1',
          quality: 'unknown',
          holeReason: `Fewer than 3 retailerShare rows for ${shareYear}`,
          partnerStatus: 'internal',
          metadata: { pass: C1_PASS, found: top.map((r) => r.category) },
        })
      }
    } else {
      planned.push({
        cellId: C1_CELL_ID,
        country,
        indicatorId: 'cr3',
        year: 2024,
        value: null,
        unit: 'percent',
        methodId: 'retail-cr3-v1',
        quality: 'unknown',
        holeReason: 'No CountryMetric retailerShare rows for country',
        partnerStatus: 'internal',
        metadata: { pass: C1_PASS },
      })
    }

    // Margins — latest FY per country among retailer banners only
    const marginRows = rows
      .filter((r) => r.metricType === 'margin' && isRetailerMarginCategory(r.category))
      .map((r) => ({ ...r, y: parseYear(r.year), v: num(r.value) }))
      .filter((r) => r.y != null && r.v != null) as Array<MetricRow & { y: number; v: number }>
    const marginYears = [...new Set(marginRows.map((r) => r.y))].sort((a, b) => b - a)
    const marginYear = marginYears[0]
    if (marginYear == null) {
      planned.push({
        cellId: C1_CELL_ID,
        country,
        indicatorId: 'margin_top1',
        year: 2024,
        value: null,
        unit: 'percent',
        methodId: 'retail-opmargin-fy-v1',
        quality: 'unknown',
        holeReason: 'No retailer margin CountryMetric rows',
        partnerStatus: 'internal',
        metadata: { pass: C1_PASS },
      })
    } else {
      const ranked = marginRows
        .filter((r) => r.y === marginYear)
        .sort((a, b) => b.v - a.v)
      ranked.forEach((r, idx) => {
        const rank = idx + 1
        if (rank <= 3) {
          planned.push({
            cellId: C1_CELL_ID,
            country,
            indicatorId: `margin_top${rank}`,
            year: r.y,
            value: r.v,
            unit: 'percent',
            methodId: 'retail-opmargin-fy-v1',
            quality: metricQuality(r),
            holeReason: null,
            partnerStatus: 'internal',
            metadata: {
              pass: C1_PASS,
              banner: r.category,
              source: r.source,
              sourceYearLabel: r.year,
              sourceMetadata: r.metadata,
            },
          })
        }
        planned.push({
          cellId: C1_CELL_ID,
          country,
          indicatorId: `margin_banner_${slugBanner(r.category)}`,
          year: r.y,
          value: r.v,
          unit: 'percent',
          methodId: 'retail-opmargin-fy-v1',
          quality: metricQuality(r),
          holeReason: null,
          partnerStatus: 'internal',
          metadata: {
            pass: C1_PASS,
            banner: r.category,
            source: r.source,
            sourceYearLabel: r.year,
            sourceMetadata: r.metadata,
          },
        })
      })
      for (let rank = ranked.length + 1; rank <= 3; rank++) {
        planned.push({
          cellId: C1_CELL_ID,
          country,
          indicatorId: `margin_top${rank}`,
          year: marginYear,
          value: null,
          unit: 'percent',
          methodId: 'retail-opmargin-fy-v1',
          quality: 'unknown',
          holeReason:
            country === 'IS' && rank >= 2
              ? 'IS retailer margin panel incomplete (e.g. Samkaup missing operating margin)'
              : `Fewer than ${rank} retailer margin rows for ${marginYear}`,
          partnerStatus: 'internal',
          metadata: { pass: C1_PASS, bannersPresent: ranked.map((r) => r.category) },
        })
      }
    }
  }

  return planned
}

function createPrisma() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

export async function runC1Backfill(argv: string[] = process.argv.slice(2)) {
  const apply = argv.includes('--apply')
  const prisma = createPrisma()
  try {
    const cell = await prisma.nordicCell.findUnique({ where: { id: C1_CELL_ID } })
    if (!cell) {
      throw new Error(`NordicCell ${C1_CELL_ID} missing — apply schema migration first`)
    }

    const metrics = (await prisma.countryMetric.findMany({
      where: {
        metricType: { in: ['hhi', 'retailerShare', 'margin'] },
        country: { in: [...COUNTRIES] },
      },
      select: {
        country: true,
        metricType: true,
        category: true,
        value: true,
        unit: true,
        year: true,
        source: true,
        metadata: true,
      },
    })) as MetricRow[]

    const planned = planC1Indicators(metrics)
    const withValues = planned.filter((p) => p.value != null).length
    const holes = planned.filter((p) => p.value == null).length

    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'dry-run',
          pass: C1_PASS,
          cellId: C1_CELL_ID,
          sourceMetricRows: metrics.length,
          plannedRows: planned.length,
          withValues,
          holes,
          byCountry: Object.fromEntries(
            COUNTRIES.map((c) => [
              c,
              planned
                .filter((p) => p.country === c)
                .map((p) => ({
                  indicatorId: p.indicatorId,
                  year: p.year,
                  value: p.value,
                  quality: p.quality,
                  holeReason: p.holeReason,
                })),
            ]),
          ),
        },
        null,
        2,
      ),
    )

    if (!apply) return { planned, written: 0 }

    let written = 0
    for (const row of planned) {
      await prisma.nordicIndicatorRow.upsert({
        where: {
          cellId_country_indicatorId_year_methodId: {
            cellId: row.cellId,
            country: row.country,
            indicatorId: row.indicatorId,
            year: row.year,
            methodId: row.methodId,
          },
        },
        create: {
          cellId: row.cellId,
          country: row.country,
          indicatorId: row.indicatorId,
          year: row.year,
          value: row.value,
          unit: row.unit,
          methodId: row.methodId,
          quality: row.quality,
          holeReason: row.holeReason,
          partnerStatus: row.partnerStatus,
          metadata: row.metadata as Prisma.InputJsonValue,
        },
        update: {
          value: row.value,
          unit: row.unit,
          quality: row.quality,
          holeReason: row.holeReason,
          partnerStatus: row.partnerStatus,
          metadata: row.metadata as Prisma.InputJsonValue,
        },
      })
      written += 1
    }
    console.log(JSON.stringify({ written, pass: C1_PASS }, null, 2))
    return { planned, written }
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  runC1Backfill().catch((error) => {
    console.error('[nordic-c1-backfill] failed:', error)
    process.exitCode = 1
  })
}
