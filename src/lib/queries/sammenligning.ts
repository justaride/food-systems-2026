// src/lib/queries/sammenligning.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CountryCode } from '@/lib/config/countries'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'

const COUNTRY_CODES: CountryCode[] = ['no', 'se', 'dk', 'fi', 'is']

type ValueChainStep = {
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
  sources?: string[] | null
  data_quality_flag?: string | null
  method_note?: string | null
  last_verified?: string | null
  confidence?: string | null
  source?: string | null
}

type ValueChainJson = {
  country: string
  year?: number
  population: number
  currency?: string
  selfSufficiency?: {
    caloric_pct?: number | null
    feed_corrected_pct?: number | null
    strategic_grain_reserve_months?: number | null
    target_pct?: number | null
    target_year?: number | null
    source?: string | null
    notes?: string | null
  } | null
  steps: ValueChainStep[]
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

export type DataPointMeta = {
  status: ResearchEvidenceStatus
  sources: string[]
  methodNote?: string
  lastVerified?: string
  year?: number
}

type MarketMetricKey = 'hhi' | 'cr3' | 'gini' | 'totalStores' | 'emvSharePct' | 'retailFormatMix' | 'parents'
type PreparednessMetricKey =
  | 'selfSufficiencyCaloricPct'
  | 'selfSufficiencyFeedCorrectedPct'
  | 'selfSufficiencyTargetPct'
  | 'selfSufficiencyTargetYear'
  | 'importTonnes'
  | 'importValueBn'
  | 'exportTonnes'
  | 'exportValueBn'
  | 'feedImportPct'
  | 'grainReserveMonths'
type ValueChainMetricKey =
  | 'primaryVolumeTonnes'
  | 'seafoodExportValueBn'
  | 'processingTurnoverBn'
  | 'employmentNace01'
  | 'employmentNace03'
  | 'employmentNace10'
  | 'employmentNace11'
  | 'valueAddedByStep'
  | 'co2ePerStep'
type CircularityMetricKey =
  | 'totalWastePerCapitaKg'
  | 'householdWastePerCapitaKg'
  | 'wasteReductionSince2015Pct'
  | 'biogasGwh'
  | 'biogasTargetGwh'
  | 'biogasPlants'
  | 'depositReturnRatePct'
  | 'foodWasteByCategory'

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
    selfSufficiencyFeedCorrectedPct: number | null
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
  meta: {
    market: Partial<Record<MarketMetricKey, DataPointMeta>>
    preparedness: Partial<Record<PreparednessMetricKey, DataPointMeta>>
    valueChain: Partial<Record<ValueChainMetricKey, DataPointMeta>>
    circularity: Partial<Record<CircularityMetricKey, DataPointMeta>>
  }
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

function mapQualityFlag(flag?: string | null): ResearchEvidenceStatus {
  switch (flag) {
    case 'primary_api':
      return 'validated'
    case 'primary_api_definition_diff':
      return 'primary_snapshot'
    case 'local_research_needs_primary_check':
    case 'needs_primary_check':
      return 'local_research_needs_primary_check'
    default:
      return 'primary_snapshot'
  }
}

function metaFromStep(
  step: ValueChainStep | null,
  value: number | null | undefined,
  year?: number,
  overrides?: Partial<DataPointMeta>,
): DataPointMeta | undefined {
  if (value === null || value === undefined) return undefined
  if (!step) return overrides ? { status: 'primary_snapshot', sources: [], year, ...overrides } : undefined
  const baseStatus = mapQualityFlag(step.data_quality_flag)
  return {
    status: overrides?.status ?? baseStatus,
    sources: overrides?.sources ?? step.sources ?? [],
    methodNote: overrides?.methodNote ?? step.method_note ?? undefined,
    lastVerified: overrides?.lastVerified ?? step.last_verified ?? undefined,
    year: overrides?.year ?? year,
  }
}

function metaFromExplicit(
  value: number | null | undefined,
  status: ResearchEvidenceStatus,
  sources: string[],
  year?: number,
  methodNote?: string,
): DataPointMeta | undefined {
  if (value === null || value === undefined) return undefined
  return { status, sources, year, methodNote }
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

  const hhiVal = cm?.parentCompany?.parentHHI ?? null
  const cr3Val = cm?.parentCompany?.data?.length
    ? Math.round(cm.parentCompany.data
        .map(p => p.value)
        .sort((a, b) => b - a)
        .slice(0, 3)
        .reduce((sum, v) => sum + v, 0) * 10) / 10
    : null
  const giniVal = cm?.lorenzCurve?.gini ?? null
  const totalStoresVal = cm?.totalStores ?? null
  const emvVal = processing?.emv_share_pct ?? null
  const parentsList = cm?.parentCompany?.data?.map(p => ({ name: p.label ?? p.name ?? p.id ?? '', sharePct: p.value })) ?? []

  const chartMetricsSources = ['chart-metrics.json', 'stores.json (OSM)', 'Konkurransetilsynet']
  const ssSourceLabel = vc.selfSufficiency?.source ?? undefined

  const ssVal = vc.selfSufficiency?.caloric_pct ?? null
  const ssFeedCorrectedVal = vc.selfSufficiency?.feed_corrected_pct ?? null
  const ssTargetVal = vc.selfSufficiency?.target_pct ?? null
  const ssTargetYearVal = vc.selfSufficiency?.target_year ?? null
  const grainReserveVal = primary?.grain_reserve_months
    ?? vc.selfSufficiency?.strategic_grain_reserve_months
    ?? null
  const grainReserveSources = code === 'fi' && grainReserveVal !== null
    ? [ssSourceLabel ?? 'Huoltovarmuuskeskus (HVK)']
    : primary?.sources ?? []
  const grainReserveMethodNote = primary?.method_note ?? vc.selfSufficiency?.notes ?? undefined

  return {
    code,
    population: vc.population,
    market: {
      hhi: hhiVal,
      cr3: cr3Val,
      gini: giniVal,
      totalStores: totalStoresVal,
      emvSharePct: emvVal,
      retailFormatMix: formatMix,
      parents: parentsList,
      sourceYear: vc.year ?? null,
    },
    preparedness: {
      selfSufficiencyCaloricPct: ssVal,
      selfSufficiencyFeedCorrectedPct: ssFeedCorrectedVal,
      selfSufficiencyTargetPct: ssTargetVal,
      selfSufficiencyTargetYear: ssTargetYearVal,
      importTonnes: sumImports,
      importValueBn: sumImportValue,
      exportTonnes: sumExports,
      exportValueBn: sumExportValue,
      feedImportPct: primary?.feed_import_pct ?? null,
      grainReserveMonths: grainReserveVal,
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
    meta: {
      market: {
        hhi: metaFromExplicit(hhiVal, 'validated', chartMetricsSources, vc.year),
        cr3: metaFromExplicit(cr3Val, 'validated', chartMetricsSources, vc.year),
        gini: metaFromExplicit(giniVal, 'validated', chartMetricsSources, vc.year),
        totalStores: metaFromExplicit(totalStoresVal, 'validated', chartMetricsSources, vc.year),
        emvSharePct: metaFromStep(processing, emvVal, vc.year),
        retailFormatMix: metaFromStep(retail, formatMix ? 1 : null, vc.year),
        parents: metaFromExplicit(parentsList.length ? 1 : null, 'validated', chartMetricsSources, vc.year),
      },
      preparedness: {
        selfSufficiencyCaloricPct: metaFromExplicit(
          ssVal,
          'primary_snapshot',
          ssSourceLabel ? [ssSourceLabel] : [],
          vc.year,
          vc.selfSufficiency?.notes ?? undefined,
        ),
        selfSufficiencyFeedCorrectedPct: metaFromExplicit(
          ssFeedCorrectedVal,
          'primary_snapshot',
          ssSourceLabel ? [ssSourceLabel] : [],
          vc.year,
          vc.selfSufficiency?.notes ?? undefined,
        ),
        selfSufficiencyTargetPct: metaFromExplicit(ssTargetVal, 'primary_snapshot', ssSourceLabel ? [ssSourceLabel] : [], vc.year),
        selfSufficiencyTargetYear: metaFromExplicit(ssTargetYearVal, 'primary_snapshot', ssSourceLabel ? [ssSourceLabel] : [], vc.year),
        importTonnes: metaFromExplicit(sumImports, 'primary_snapshot', ['SSB 08799 / Eurostat ext_lt_intertrd'], vc.year),
        importValueBn: metaFromExplicit(sumImportValue, 'primary_snapshot', ['SSB / Eurostat'], vc.year),
        exportTonnes: metaFromExplicit(sumExports, 'primary_snapshot', ['SSB 08799 / Sjømatrådet / Eurostat'], vc.year),
        exportValueBn: metaFromExplicit(sumExportValue, 'primary_snapshot', ['SSB / Sjømatrådet / Eurostat'], vc.year),
        feedImportPct: metaFromStep(primary, primary?.feed_import_pct, vc.year),
        grainReserveMonths: metaFromExplicit(
          grainReserveVal,
          code === 'fi' ? 'validated' : 'primary_snapshot',
          grainReserveSources,
          vc.year,
          grainReserveMethodNote,
        ),
      },
      valueChain: {
        primaryVolumeTonnes: metaFromStep(primary, primary?.volume_tonnes, vc.year),
        seafoodExportValueBn: metaFromStep(seafood, seafood?.export_value_bn, vc.year),
        processingTurnoverBn: metaFromStep(processing, processing?.turnover_bn ?? processing?.production_value_bn, vc.year),
        employmentNace01: metaFromStep(primary, primary?.employment?.agriculture_nace01, vc.year),
        employmentNace03: metaFromStep(seafood, seafood?.employment?.fisheries_aquaculture_nace03 ?? primary?.employment?.fisheries_aquaculture_nace03, vc.year),
        employmentNace10: metaFromStep(processing, processing?.employment?.food_manufacturing_nace10 ?? primary?.employment?.food_manufacturing_nace10, vc.year),
        employmentNace11: metaFromStep(processing, processing?.employment?.beverages_nace11 ?? primary?.employment?.beverages_nace11, vc.year),
        valueAddedByStep: metaFromExplicit(
          Object.values(valueAdded).some(v => v !== null) ? 1 : null,
          code === 'no' ? 'primary_snapshot' : 'local_research_needs_primary_check',
          code === 'no' ? ['NORSUS LCA', 'SSB 09171'] : [],
          vc.year,
        ),
        co2ePerStep: metaFromExplicit(
          Object.values(co2e).some(v => v !== null) ? 1 : null,
          code === 'no' ? 'primary_snapshot' : 'missing',
          code === 'no' ? ['NORSUS LCA 2021'] : [],
          vc.year,
          code !== 'no' ? 'CO₂e per ledd kun tilgjengelig for Norge (NORSUS-modell). SE/DK/FI/IS krever lokal LCA-data.' : undefined,
        ),
      },
      circularity: {
        totalWastePerCapitaKg: metaFromStep(waste, totalWastePerCapita, vc.year),
        householdWastePerCapitaKg: metaFromStep(household, household?.waste_per_capita_kg, vc.year),
        wasteReductionSince2015Pct: metaFromExplicit(
          waste?.waste_reduction_since_2015_pct ?? null,
          'primary_snapshot',
          waste?.sources ?? [],
          vc.year,
        ),
        biogasGwh: metaFromStep(waste, waste?.circularity?.biogas_gwh, vc.year),
        biogasTargetGwh: metaFromStep(waste, waste?.circularity?.biogas_target_gwh, vc.year),
        biogasPlants: metaFromStep(waste, waste?.circularity?.biogas_plants, vc.year),
        depositReturnRatePct: metaFromExplicit(
          retail?.deposit_return_rate_pct ?? household?.deposit_return_rate_pct ?? null,
          'primary_snapshot',
          code === 'no' ? ['Infinitum'] : code === 'se' ? ['Pantamera'] : [],
          vc.year,
        ),
        foodWasteByCategory: metaFromExplicit(
          vc.food_waste_by_category?.categories?.length ? 1 : null,
          'proxy_model',
          vc.food_waste_by_category?.sources ?? [],
          vc.year,
          'Nordisk estimat per kategori (NORSUS/Matvett/Nordic Council). Skal splittes per land via Naturvårdsverket (SE), DTU (DK), Luke (FI), Umhverfisstofnun (IS).',
        ),
      },
    },
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
