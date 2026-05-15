// src/lib/queries/sammenligning.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CountryCode } from '@/lib/config/countries'

const COUNTRY_CODES: CountryCode[] = ['no', 'se', 'dk', 'fi', 'is']

type ValueChainJson = {
  country: string
  year?: number
  population: number
  currency?: string
  selfSufficiency?: {
    caloric_pct?: number | null
    target_pct?: number | null
    target_year?: number | null
    source?: string | null
  } | null
  steps: Array<{
    id: string
    volume_tonnes?: number | null
    import_tonnes?: number | null
    import_value_bn?: number | null
    export_tonnes?: number | null
    export_value_bn?: number | null
    waste_tonnes?: number | null
    waste_per_capita_kg?: number | null
    waste_reduction_since_2015_pct?: number | null
    deposit_return_rate_pct?: number | null
    co2e_mt?: number | null
    production_value_bn?: number | null
    value_added_bn?: number | null
    turnover_bn?: number | null
    emv_share_pct?: number | null
    feed_import_pct?: number | null
    grain_reserve_months?: number | null
    employees?: number | null
    employment?: {
      agriculture_nace01?: number | null
      fisheries_aquaculture_nace03?: number | null
      food_manufacturing_nace10?: number | null
      beverages_nace11?: number | null
    } | null
    breakdown?: Record<string, unknown> | null
    retail_format?: {
      discount_pct?: number | null
      supermarket_pct?: number | null
      convenience_pct?: number | null
    } | null
    format_share?: {
      discount_pct?: number | null
      supermarket_pct?: number | null
      convenience_pct?: number | null
    } | null
    circularity?: {
      biogas_gwh?: number | null
      biogas_target_gwh?: number | null
      biogas_plants?: number | null
    } | null
    source?: string | null
  }>
  key_policies?: Array<{
    name: string
    year: number
    type: string
    target?: string | null
    summary?: string | null
  }>
  food_waste_by_category?: {
    description?: string
    categories?: Array<{
      id: string
      name: string
      production_mt_nordic?: number | null
      waste_by_step?: Record<string, { pct?: string | number | null; kt_yr?: string | number | null; main_cause?: string | null } | null>
      biggest_loss_step?: string | null
      climate_impact_note?: string | null
    }>
    summary?: string
    sources?: string[]
  } | null
}

type ChartMetricsJson = {
  totalStores?: number | null
  parentCompany?: {
    data?: Array<{ id?: string; label?: string; name?: string; value: number; count?: number; color?: string }>
    parentHHI?: number | null
  } | null
  lorenzCurve?: { gini?: number | null } | null
}

export type CountrySammenligning = {
  code: CountryCode
  population: number
  market: {
    hhi: number | null
    cr3: number | null
    gini: number | null
    totalStores: number | null
    emvSharePct: number | null
    retailFormatMix: { discount: number; supermarket: number; convenience: number } | null
    parents: Array<{ name: string; sharePct: number }>
    sourceYear: number | null
  }
  preparedness: {
    selfSufficiencyCaloricPct: number | null
    selfSufficiencyTargetPct: number | null
    selfSufficiencyTargetYear: number | null
    importTonnes: number | null
    importValueBn: number | null
    exportTonnes: number | null
    exportValueBn: number | null
    feedImportPct: number | null
    grainReserveMonths: number | null
    sourceYear: number | null
  }
  valueChain: {
    primaryVolumeTonnes: number | null
    seafoodExportValueBn: number | null
    processingTurnoverBn: number | null
    employmentByNace: { nace01: number | null; nace03: number | null; nace10: number | null; nace11: number | null }
    valueAddedByStep: Record<string, number | null>
    co2ePerStep: Record<string, number | null>
    sourceYear: number | null
  }
  circularity: {
    totalWastePerCapitaKg: number | null
    householdWastePerCapitaKg: number | null
    wasteReductionSince2015Pct: number | null
    biogasGwh: number | null
    biogasTargetGwh: number | null
    biogasPlants: number | null
    depositReturnRatePct: number | null
    foodWasteByCategory: Array<{
      id: string
      name: string
      productionMtNordic: number | null
      biggestLossStep: string | null
    }> | null
    sourceYear: number | null
  }
  policies: Array<{ name: string; year: number; type: string; target: string | null }>
}

export type SammenligningData = {
  generatedAt: string
  countries: Record<CountryCode, CountrySammenligning | null>
}

async function readJson<T>(relPath: string): Promise<T | null> {
  try {
    const full = path.join(process.cwd(), 'public', 'data', 'food-systems', relPath)
    const raw = await fs.readFile(full, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function findStep(steps: ValueChainJson['steps'], id: string) {
  return steps.find(s => s.id === id) ?? null
}

function sumOrNull(values: Array<number | null | undefined>): number | null {
  const present = values.filter((v): v is number => v != null)
  return present.length ? present.reduce((a, b) => a + b, 0) : null
}

function buildCountry(
  code: CountryCode,
  vc: ValueChainJson | null,
  cm: ChartMetricsJson | null,
): CountrySammenligning | null {
  if (!vc) return null

  const primary = findStep(vc.steps, 'primary')
  const seafood = findStep(vc.steps, 'seafood')
  const processing = findStep(vc.steps, 'processing')
  const retail = findStep(vc.steps, 'retail')
  const household = findStep(vc.steps, 'household')
  const waste = findStep(vc.steps, 'waste')

  const sumImports = sumOrNull(vc.steps.map(x => x.import_tonnes))
  const sumImportValue = sumOrNull(vc.steps.map(x => x.import_value_bn))
  const sumExports = sumOrNull(vc.steps.map(x => x.export_tonnes))
  const sumExportValue = sumOrNull(vc.steps.map(x => x.export_value_bn))

  const valueAdded: Record<string, number | null> = {}
  const co2e: Record<string, number | null> = {}
  for (const s of vc.steps) {
    valueAdded[s.id] = s.value_added_bn ?? null
    co2e[s.id] = s.co2e_mt ?? null
  }

  const retailFormat = retail?.format_share ?? retail?.retail_format ?? null
  const formatMix = retailFormat
    ? {
        discount: retailFormat.discount_pct ?? 0,
        supermarket: retailFormat.supermarket_pct ?? 0,
        convenience: retailFormat.convenience_pct ?? 0,
      }
    : null

  const totalWastePerCapita = waste?.waste_per_capita_kg
    ?? (waste?.waste_tonnes && vc.population
        ? Math.round((waste.waste_tonnes * 1000) / vc.population)
        : null)

  return {
    code,
    population: vc.population,
    market: {
      hhi: cm?.parentCompany?.parentHHI ?? null,
      cr3: cm?.parentCompany?.data?.length
        ? Math.round(cm.parentCompany.data
            .map(p => p.value)
            .sort((a, b) => b - a)
            .slice(0, 3)
            .reduce((sum, v) => sum + v, 0) * 10) / 10
        : null,
      gini: cm?.lorenzCurve?.gini ?? null,
      totalStores: cm?.totalStores ?? null,
      emvSharePct: processing?.emv_share_pct ?? null,
      retailFormatMix: formatMix,
      parents: cm?.parentCompany?.data?.map(p => ({ name: p.label ?? p.name ?? p.id ?? '', sharePct: p.value })) ?? [],
      sourceYear: vc.year ?? null,
    },
    preparedness: {
      selfSufficiencyCaloricPct: vc.selfSufficiency?.caloric_pct ?? null,
      selfSufficiencyTargetPct: vc.selfSufficiency?.target_pct ?? null,
      selfSufficiencyTargetYear: vc.selfSufficiency?.target_year ?? null,
      importTonnes: sumImports,
      importValueBn: sumImportValue,
      exportTonnes: sumExports,
      exportValueBn: sumExportValue,
      feedImportPct: primary?.feed_import_pct ?? null,
      grainReserveMonths: primary?.grain_reserve_months ?? null,
      sourceYear: vc.year ?? null,
    },
    valueChain: {
      primaryVolumeTonnes: primary?.volume_tonnes ?? null,
      seafoodExportValueBn: seafood?.export_value_bn ?? null,
      processingTurnoverBn: processing?.turnover_bn ?? processing?.production_value_bn ?? null,
      employmentByNace: {
        nace01: primary?.employment?.agriculture_nace01 ?? null,
        nace03: seafood?.employment?.fisheries_aquaculture_nace03 ?? null,
        nace10: processing?.employment?.food_manufacturing_nace10 ?? null,
        nace11: processing?.employment?.beverages_nace11 ?? null,
      },
      valueAddedByStep: valueAdded,
      co2ePerStep: co2e,
      sourceYear: vc.year ?? null,
    },
    circularity: {
      totalWastePerCapitaKg: totalWastePerCapita,
      householdWastePerCapitaKg: household?.waste_per_capita_kg ?? null,
      wasteReductionSince2015Pct: waste?.waste_reduction_since_2015_pct ?? null,
      biogasGwh: waste?.circularity?.biogas_gwh ?? null,
      biogasTargetGwh: waste?.circularity?.biogas_target_gwh ?? null,
      biogasPlants: waste?.circularity?.biogas_plants ?? null,
      depositReturnRatePct: retail?.deposit_return_rate_pct ?? household?.deposit_return_rate_pct ?? null,
      foodWasteByCategory: vc.food_waste_by_category?.categories
        ? vc.food_waste_by_category.categories.map(c => ({
            id: c.id,
            name: c.name,
            productionMtNordic: typeof c.production_mt_nordic === 'number' ? c.production_mt_nordic : null,
            biggestLossStep: c.biggest_loss_step ?? null,
          }))
        : null,
      sourceYear: vc.year ?? null,
    },
    policies: (vc.key_policies ?? []).map(p => ({
      name: p.name,
      year: p.year,
      type: p.type,
      target: p.target ?? null,
    })),
  }
}

export async function getSammenligningData(): Promise<SammenligningData> {
  const entries = await Promise.all(
    COUNTRY_CODES.map(async (code) => {
      const [vc, cm] = await Promise.all([
        readJson<ValueChainJson>(`${code}/value-chain.json`),
        readJson<ChartMetricsJson>(`${code}/chart-metrics.json`),
      ])
      return [code, buildCountry(code, vc, cm)] as const
    })
  )
  const countries = Object.fromEntries(entries) as Record<CountryCode, CountrySammenligning | null>
  return { generatedAt: new Date().toISOString(), countries }
}
