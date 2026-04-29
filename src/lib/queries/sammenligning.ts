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
    categories?: Record<string, Record<string, number | null>>
    summary?: string
    sources?: string[]
  } | null
}

type ChartMetricsJson = {
  totalStores?: number | null
  parentCompany?: {
    data?: Array<{ name: string; share: number }>
    parentHHI?: number | null
    parentCR3?: number | null
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
    foodWasteByCategory: Record<string, Record<string, number | null>> | null
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

export async function getSammenligningData(): Promise<SammenligningData> {
  // Implementeres i Task 2
  return {
    generatedAt: new Date().toISOString(),
    countries: { no: null, se: null, dk: null, fi: null, is: null },
  }
}
