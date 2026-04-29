import { prisma } from '@/lib/db'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

type DeliveryBuyerRow = {
  buyerId: string | null
  buyerName: string | null
  commodity: string
  supplierCount: number
  totalQuantity: number
  unit: string
}

type DeliveryCommoditySummary = {
  commodity: string
  unit: string
  totalQuantity: number
  supplierCount: number
  buyers: { buyerId: string | null; buyerName: string | null; quantity: number; supplierCount: number }[]
}

export type PrimaryDeliveriesData = {
  byBuyer: DeliveryBuyerRow[]
  byCommodity: DeliveryCommoditySummary[]
  totalSuppliers: number
  totalDeliveryRows: number
}

export async function getPrimaryProducerDeliveries(): Promise<PrimaryDeliveriesData> {
  const [buyerRows, totals] = await Promise.all([
    prisma.deliveryVolume.groupBy({
      by: ['buyerId', 'buyerName', 'commodity', 'unit'],
      _sum: { quantity: true },
      _count: true,
    }),
    prisma.deliveryVolume.aggregate({ _count: true }),
  ])

  const distinctSuppliers = await prisma.deliveryVolume.groupBy({
    by: ['supplierOrgNr'],
    _count: true,
  })

  const byBuyer: DeliveryBuyerRow[] = buyerRows
    .map(r => ({
      buyerId: r.buyerId,
      buyerName: r.buyerName,
      commodity: r.commodity,
      supplierCount: r._count,
      totalQuantity: Number(r._sum.quantity ?? 0),
      unit: r.unit,
    }))
    .filter(r => r.totalQuantity > 0)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)

  const commodityMap = new Map<string, DeliveryCommoditySummary>()
  for (const row of byBuyer) {
    const existing = commodityMap.get(row.commodity) ?? {
      commodity: row.commodity,
      unit: row.unit,
      totalQuantity: 0,
      supplierCount: 0,
      buyers: [],
    }
    existing.totalQuantity += row.totalQuantity
    existing.supplierCount += row.supplierCount
    existing.buyers.push({
      buyerId: row.buyerId,
      buyerName: row.buyerName,
      quantity: row.totalQuantity,
      supplierCount: row.supplierCount,
    })
    commodityMap.set(row.commodity, existing)
  }

  const byCommodity = Array.from(commodityMap.values())
    .map(c => ({ ...c, buyers: c.buyers.sort((a, b) => b.quantity - a.quantity) }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)

  return {
    byBuyer,
    byCommodity,
    totalSuppliers: distinctSuppliers.length,
    totalDeliveryRows: totals._count,
  }
}

type SupplyChainNode = {
  id: string
  label: string
  valueChainStage: string | null
  country: string
}

type SupplyChainEdge = {
  id: string
  source: string
  target: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: number | null
}

type SupplyChainStats = {
  totalRelationships: number
  companiesInvolved: number
  byType: Record<string, number>
}

export type SupplyChainGraphData = {
  nodes: SupplyChainNode[]
  edges: SupplyChainEdge[]
  stats: SupplyChainStats
}

type QualityStatus = 'ok' | 'info' | 'warn' | 'error'

type SupplyChainQualityMetric = {
  id: string
  label: string
  value: number
  denominator?: number
  percent?: number
  detail: string
  status: QualityStatus
}

type DeliveryCommodityQuality = {
  commodity: string
  year: number
  unit: string
  rows: number
  totalQuantity: number
  missingBuyerRows: number
  missingKommuneRows: number
}

type StageCoverageRow = {
  stage: string
  count: number
}

type RelationshipTypeRow = {
  type: string
  count: number
}

type ValueChainInventoryRow = {
  country: string
  year: number | null
  stepCount: number
  targetStepCoveragePct: number
  missingTargetSteps: string[]
  sourceRefs: number
  missingVolumeSteps: string[]
  missingWasteSteps: string[]
  selfSufficiencyPct: number | null
}

type ProjectDataCandidate = {
  id: string
  title: string
  path: string
  records: string
  readiness: 'klar-na' | 'klar-med-forbehold' | 'staging'
  quality: 'high' | 'medium' | 'low'
  why: string
  integration: string
}

export type SupplyChainDataQuality = {
  generatedAt: string
  qualityScore: number
  metrics: SupplyChainQualityMetric[]
  stageCoverage: StageCoverageRow[]
  relationshipTypes: RelationshipTypeRow[]
  deliveryCommodities: DeliveryCommodityQuality[]
  valueChainInventory: ValueChainInventoryRow[]
  projectDataCandidates: ProjectDataCandidate[]
  findings: string[]
}

const TARGET_VALUE_CHAIN_STEPS = [
  'primary',
  'seafood',
  'processing',
  'distribution',
  'retail',
  'horeca',
  'household',
  'waste',
]

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 100
  return Math.round((numerator / denominator) * 1000) / 10
}

function metricStatus(percent: number, warnBelow = 95, errorBelow = 80): QualityStatus {
  if (percent < errorBelow) return 'error'
  if (percent < warnBelow) return 'warn'
  return 'ok'
}

async function readJsonFile<T = any>(relativePath: string): Promise<T | null> {
  try {
    const text = await readFile(path.join(process.cwd(), relativePath), 'utf8')
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

async function countCsvRows(relativePath: string): Promise<number | null> {
  try {
    const text = await readFile(path.join(process.cwd(), relativePath), 'utf8')
    const trimmed = text.trim()
    if (!trimmed) return 0
    return Math.max(0, trimmed.split(/\r?\n/).length - 1)
  } catch {
    return null
  }
}

async function countJsonRecords(relativePath: string): Promise<number | null> {
  const data = await readJsonFile<Record<string, unknown>>(relativePath)
  if (!data) return null
  if (Array.isArray(data)) return data.length
  if (Array.isArray(data.features)) return data.features.length
  if (Array.isArray(data.timeseries)) return data.timeseries.length

  const countableKeys = [
    'existing_loops',
    'actor_cases',
    'gaps',
    'countries',
    'technologies',
  ]
  const count = countableKeys.reduce((sum, key) => {
    const value = data[key]
    return sum + (Array.isArray(value) ? value.length : 0)
  }, 0)
  return count > 0 ? count : null
}

async function getValueChainInventory(): Promise<ValueChainInventoryRow[]> {
  const countries = ['no', 'se', 'dk', 'fi', 'is']
  const rows = await Promise.all(
    countries.map(async country => {
      const data = await readJsonFile<{
        year?: number
        selfSufficiency?: { caloric_pct?: number }
        steps?: Array<{
          id: string
          sources?: string[]
          volume_tonnes?: number | null
          waste_tonnes?: number | null
          total_waste_tonnes?: number | null
        }>
      }>(`public/data/food-systems/${country}/value-chain.json`)

      const steps = data?.steps ?? []
      const stepIds = new Set(steps.map(step => step.id))
      const missingTargetSteps = TARGET_VALUE_CHAIN_STEPS.filter(step => !stepIds.has(step))
      const sourceRefs = steps.reduce((sum, step) => sum + (step.sources?.length ?? 0), 0)
      const missingVolumeSteps = steps
        .filter(step => step.volume_tonnes == null)
        .map(step => step.id)
      const missingWasteSteps = steps
        .filter(step => step.waste_tonnes == null && step.total_waste_tonnes == null)
        .map(step => step.id)

      return {
        country: country.toUpperCase(),
        year: data?.year ?? null,
        stepCount: steps.length,
        targetStepCoveragePct: pct(TARGET_VALUE_CHAIN_STEPS.length - missingTargetSteps.length, TARGET_VALUE_CHAIN_STEPS.length),
        missingTargetSteps,
        sourceRefs,
        missingVolumeSteps,
        missingWasteSteps,
        selfSufficiencyPct: data?.selfSufficiency?.caloric_pct ?? null,
      }
    })
  )

  return rows.sort((a, b) => a.country.localeCompare(b.country))
}

function recordLabel(count: number | null, unit: string): string {
  if (count == null) return 'ikke lest'
  return `${count.toLocaleString('no')} ${unit}`
}

export async function getSupplyChainDataQuality(): Promise<SupplyChainDataQuality> {
  const [
    totalCompanies,
    totalRelationships,
    totalDeliveries,
    companyStages,
    relationshipTypes,
    deliveryCommodityRows,
    deliveryMissingBuyerRows,
    deliveryMissingKommuneRows,
    relMissingSource,
    relMissingDescription,
    deliveryMissingBuyer,
    deliveryMissingKommune,
    zeroDelivery,
    distinctSuppliers,
    valueChainInventory,
    tradeGroupAnnualRows,
    corePriceRows,
    coreTradeRows,
    coreProductionRows,
    feedTimeseriesRows,
    logisticsHubRows,
    processingPlantRows,
    portRows,
    aquacultureSiteRows,
    circularityRows,
    nutrientRows,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.businessRelationship.count(),
    prisma.deliveryVolume.count(),
    prisma.company.groupBy({
      by: ['valueChainStage'],
      _count: { _all: true },
    }),
    prisma.businessRelationship.groupBy({
      by: ['relationshipType'],
      _count: { _all: true },
    }),
    prisma.deliveryVolume.groupBy({
      by: ['commodity', 'year', 'unit'],
      _sum: { quantity: true },
      _count: { _all: true },
    }),
    prisma.deliveryVolume.groupBy({
      by: ['commodity'],
      where: { buyerId: null },
      _count: { _all: true },
    }),
    prisma.deliveryVolume.groupBy({
      by: ['commodity'],
      where: { kommuneNr: null },
      _count: { _all: true },
    }),
    prisma.businessRelationship.count({
      where: { OR: [{ source: null }, { source: '' }] },
    }),
    prisma.businessRelationship.count({
      where: { OR: [{ description: null }, { description: '' }] },
    }),
    prisma.deliveryVolume.count({ where: { buyerId: null } }),
    prisma.deliveryVolume.count({ where: { kommuneNr: null } }),
    prisma.deliveryVolume.count({ where: { quantity: { lte: 0 } } }),
    prisma.deliveryVolume.groupBy({
      by: ['supplierOrgNr'],
      _count: { _all: true },
    }),
    getValueChainInventory(),
    countCsvRows('research/data/nordic/trade-groups/normalized/trade_groups_imports_annual_panel.csv'),
    countCsvRows('research/data/nordic/core-series/prices_hicp_food_monthly.csv'),
    countCsvRows('research/data/nordic/core-series/trade_monthly_first_panel.csv'),
    countCsvRows('research/data/nordic/core-series/production_annual_first_panel.csv'),
    countJsonRecords('public/data/food-systems/feed-composition-timeseries.json'),
    countJsonRecords('public/data/food-systems/logistics_hubs.geojson'),
    countJsonRecords('public/data/food-systems/processing_plants.geojson'),
    countJsonRecords('public/data/food-systems/ports.geojson'),
    countJsonRecords('public/data/food-systems/aquaculture_sites.geojson'),
    countJsonRecords('public/data/food-systems/circularity-loops.json'),
    countJsonRecords('public/data/food-systems/nutrient-flows.json'),
  ])

  const stageCoverage = companyStages
    .map(row => ({
      stage: row.valueChainStage ?? 'uklassifisert',
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count)

  const relationshipTypeRows = relationshipTypes
    .map(row => ({
      type: row.relationshipType,
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count)

  const missingBuyerByCommodity = new Map(
    deliveryMissingBuyerRows.map(row => [row.commodity, row._count._all])
  )
  const missingKommuneByCommodity = new Map(
    deliveryMissingKommuneRows.map(row => [row.commodity, row._count._all])
  )

  const deliveryCommodities = deliveryCommodityRows
    .map(row => ({
      commodity: row.commodity,
      year: row.year,
      unit: row.unit,
      rows: row._count._all,
      totalQuantity: Number(row._sum.quantity ?? 0),
      missingBuyerRows: missingBuyerByCommodity.get(row.commodity) ?? 0,
      missingKommuneRows: missingKommuneByCommodity.get(row.commodity) ?? 0,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)

  const knownStageCount = totalCompanies - (stageCoverage.find(row => row.stage === 'uklassifisert')?.count ?? 0)
  const relationshipSourceCoverage = pct(totalRelationships - relMissingSource, totalRelationships)
  const relationshipDescriptionCoverage = pct(totalRelationships - relMissingDescription, totalRelationships)
  const deliveryBuyerCoverage = pct(totalDeliveries - deliveryMissingBuyer, totalDeliveries)
  const deliveryKommuneCoverage = pct(totalDeliveries - deliveryMissingKommune, totalDeliveries)
  const deliveryPositiveQuantity = pct(totalDeliveries - zeroDelivery, totalDeliveries)
  const companyStageCoverage = pct(knownStageCount, totalCompanies)
  const valueChainCoverage =
    valueChainInventory.length > 0
      ? Math.round(
          valueChainInventory.reduce((sum, row) => sum + row.targetStepCoveragePct, 0) /
            valueChainInventory.length
        )
      : 0

  const metrics: SupplyChainQualityMetric[] = [
    {
      id: 'relationship-source',
      label: 'Relasjoner med kilde',
      value: totalRelationships - relMissingSource,
      denominator: totalRelationships,
      percent: relationshipSourceCoverage,
      detail: `${relMissingSource.toLocaleString('no')} mangler kilde`,
      status: metricStatus(relationshipSourceCoverage),
    },
    {
      id: 'relationship-description',
      label: 'Relasjoner med beskrivelse',
      value: totalRelationships - relMissingDescription,
      denominator: totalRelationships,
      percent: relationshipDescriptionCoverage,
      detail: `${relMissingDescription.toLocaleString('no')} mangler beskrivelse`,
      status: metricStatus(relationshipDescriptionCoverage),
    },
    {
      id: 'delivery-buyer',
      label: 'Leveranser koblet til avtakere',
      value: totalDeliveries - deliveryMissingBuyer,
      denominator: totalDeliveries,
      percent: deliveryBuyerCoverage,
      detail: `${deliveryMissingBuyer.toLocaleString('no')} rader har bare avtakernavn`,
      status: metricStatus(deliveryBuyerCoverage, 90, 75),
    },
    {
      id: 'delivery-kommune',
      label: 'Leveranser med kommune',
      value: totalDeliveries - deliveryMissingKommune,
      denominator: totalDeliveries,
      percent: deliveryKommuneCoverage,
      detail: `${deliveryMissingKommune.toLocaleString('no')} rader mangler kommune`,
      status: metricStatus(deliveryKommuneCoverage),
    },
    {
      id: 'delivery-quantity',
      label: 'Leveranser med positiv mengde',
      value: totalDeliveries - zeroDelivery,
      denominator: totalDeliveries,
      percent: deliveryPositiveQuantity,
      detail: `${zeroDelivery.toLocaleString('no')} null-/negativ-mengder`,
      status: metricStatus(deliveryPositiveQuantity),
    },
    {
      id: 'company-stage',
      label: 'Selskaper med verdikjedeledd',
      value: knownStageCount,
      denominator: totalCompanies,
      percent: companyStageCoverage,
      detail: `${totalCompanies.toLocaleString('no')} selskaper totalt`,
      status: metricStatus(companyStageCoverage),
    },
    {
      id: 'value-chain-files',
      label: 'Nordisk ledddekning',
      value: valueChainInventory.reduce(
        (sum, row) => sum + (TARGET_VALUE_CHAIN_STEPS.length - row.missingTargetSteps.length),
        0
      ),
      denominator: valueChainInventory.length * TARGET_VALUE_CHAIN_STEPS.length,
      percent: valueChainCoverage,
      detail: '8 mål-ledd per land i value-chain.json',
      status: metricStatus(valueChainCoverage, 85, 65),
    },
  ]

  const qualityScore = Math.round(
    metrics.reduce((sum, metric) => sum + (metric.percent ?? 0), 0) / metrics.length
  )

  const projectDataCandidates: ProjectDataCandidate[] = [
    {
      id: 'value-chain-json',
      title: 'Nordiske value-chain-filer',
      path: 'public/data/food-systems/{no,se,dk,fi,is}/value-chain.json',
      records: `${valueChainInventory.length} land / ${valueChainInventory.reduce((sum, row) => sum + row.stepCount, 0)} ledd`,
      readiness: 'klar-med-forbehold',
      quality: 'medium',
      why: 'Gir landvis selvforsyning, ledd, waste, policy og kildelister som siden ikke viser.',
      integration: 'Brukes som nordisk dekningspanel og gapliste, ikke som direkte relasjonsgraf.',
    },
    {
      id: 'trade-groups',
      title: 'Importpanel per varegruppe',
      path: 'research/data/nordic/trade-groups/normalized/trade_groups_imports_annual_panel.csv',
      records: recordLabel(tradeGroupAnnualRows, 'rader'),
      readiness: 'klar-med-forbehold',
      quality: 'medium',
      why: 'Synliggjør importavhengighet for korn, kjøtt, fisk/sjømat, meieri/egg, frukt/grønt og fett/oljer.',
      integration: 'Legg inn som egen import-sårbarhetsstripe med tydelig nivå-/klassifikasjonsforbehold.',
    },
    {
      id: 'core-series',
      title: 'Kjerne-serier for pris, handel og produksjon',
      path: 'research/data/nordic/core-series/',
      records: `${recordLabel(corePriceRows, 'prisrader')}, ${recordLabel(coreTradeRows, 'handelsrader')}, ${recordLabel(coreProductionRows, 'produksjonsrader')}`,
      readiness: 'klar-med-forbehold',
      quality: 'medium',
      why: 'Gir tidsdimensjon for prispress, handelsbevegelse og produksjonsvolatilitet.',
      integration: 'Bruk som trendpanel ved siden av grafen, med indeks/level-skille bevart.',
    },
    {
      id: 'geo-assets',
      title: 'Romlige noder: hubber, anlegg, havner og akvakultur',
      path: 'public/data/food-systems/*.geojson',
      records: `${recordLabel(logisticsHubRows, 'hubber')}, ${recordLabel(processingPlantRows, 'anlegg')}, ${recordLabel(portRows, 'havner')}, ${recordLabel(aquacultureSiteRows, 'akvalokaliteter')}`,
      readiness: 'staging',
      quality: 'medium',
      why: 'Forsyningskjede-grafen mangler geografisk flaskehals- og infrastrukturvisning.',
      integration: 'Koble som kart-/infrastrukturpanel etter ID- og kildefelt er harmonisert.',
    },
    {
      id: 'feed-composition',
      title: 'Fôrkomposisjon og opprinnelse',
      path: 'public/data/food-systems/feed-composition-timeseries.json',
      records: recordLabel(feedTimeseriesRows, 'tidsseriepunkter'),
      readiness: 'klar-na',
      quality: 'high',
      why: 'Direkte relevant for innsatsvarer, importert fôrråvare og Food TG-spor A.',
      integration: 'Løft inn som sårbarhetsmodul for sjømat/fôr, koblet til Skretting, BioMar, Cargill og Mowi.',
    },
    {
      id: 'circular-flows',
      title: 'Sirkulære looper og næringsstrømmer',
      path: 'public/data/food-systems/circularity-loops.json + nutrient-flows.json',
      records: `${recordLabel(circularityRows, 'loop-/case-rader')}, ${recordLabel(nutrientRows, 'nutrient-rader')}`,
      readiness: 'staging',
      quality: 'medium',
      why: 'Dekker returstrømmer som dagens forsyningskjede-graf nesten ikke viser.',
      integration: 'Bruk som egen “retur- og sidestrøm”-seksjon med benchmark/statusmerking.',
    },
  ]

  const findings = [
    `${totalDeliveries.toLocaleString('no')} leveranser fra ${distinctSuppliers.length.toLocaleString('no')} unike produsent-orgnr er importert, men ${deliveryMissingBuyer.toLocaleString('no')} leveranser mangler buyerId-kobling.`,
    `Relasjonsgrafen har ${totalRelationships.toLocaleString('no')} kuraterte relasjoner og full kilde-/beskrivelsesdekning, men er fortsatt tynn relativt til ${totalCompanies.toLocaleString('no')} selskaper i DB.`,
    `Nordiske value-chain-filer dekker ${valueChainInventory.reduce((sum, row) => sum + row.stepCount, 0)} ledd, men Island mangler flere mål-ledd og flere land mangler volum-/waste-felt på tvers av ledd.`,
    'Fôrkomposisjon, importpanel og geografiske hubber er klare kandidatdata for neste sideutvidelse; de bør holdes adskilt som sårbarhet, infrastruktur og returstrømmer.',
  ]

  return {
    generatedAt: new Date().toISOString(),
    qualityScore,
    metrics,
    stageCoverage,
    relationshipTypes: relationshipTypeRows,
    deliveryCommodities,
    valueChainInventory,
    projectDataCandidates,
    findings,
  }
}

export async function getSupplyChainGraph(): Promise<SupplyChainGraphData> {
  const relationships = await prisma.businessRelationship.findMany({
    include: {
      fromCompany: { select: { id: true, name: true, valueChainStage: true, country: true } },
      toCompany: { select: { id: true, name: true, valueChainStage: true, country: true } },
    },
  })

  const companyMap = new Map<string, SupplyChainNode>()

  for (const rel of relationships) {
    if (!companyMap.has(rel.fromCompany.id)) {
      companyMap.set(rel.fromCompany.id, {
        id: rel.fromCompany.id,
        label: rel.fromCompany.name,
        valueChainStage: rel.fromCompany.valueChainStage,
        country: rel.fromCompany.country,
      })
    }
    if (!companyMap.has(rel.toCompany.id)) {
      companyMap.set(rel.toCompany.id, {
        id: rel.toCompany.id,
        label: rel.toCompany.name,
        valueChainStage: rel.toCompany.valueChainStage,
        country: rel.toCompany.country,
      })
    }
  }

  const byType: Record<string, number> = {}
  const edges: SupplyChainEdge[] = relationships.map(r => {
    byType[r.relationshipType] = (byType[r.relationshipType] ?? 0) + 1
    return {
      id: r.id,
      source: r.fromCompanyId,
      target: r.toCompanyId,
      relationshipType: r.relationshipType,
      description: r.description,
      sector: r.sector,
      estimatedValue: r.estimatedValue,
    }
  })

  return {
    nodes: [...companyMap.values()],
    edges,
    stats: {
      totalRelationships: relationships.length,
      companiesInvolved: companyMap.size,
      byType,
    },
  }
}
