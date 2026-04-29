import { prisma } from '@/lib/db'
import { isPrismaDataUnavailable } from './prisma-errors'
import { verdikjedeStages } from '@/lib/data/verdikjede'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type ActorMatch = {
  name: string
  companyId: string | null
}

export type StageEnrichment = {
  stageId: string
  actorMatches: ActorMatch[]
  companyCount: number
  dbStages: string[]
}

type ValueChainJson = {
  country?: string
  year?: number
  selfSufficiency?: {
    caloric_pct?: number
    target_pct?: number
    target_year?: number
  }
  steps?: Array<{
    id: string
    name?: string
    volume_tonnes?: number | null
    waste_tonnes?: number | null
    total_waste_tonnes?: number | null
    production_value_bn?: number | null
    value_added_bn?: number | null
    market_value_bn?: number | null
    market_value_bn_sek?: number | null
    sources?: string[]
  }>
  key_policies?: unknown[]
}

export type VerdikjedeCountryOverview = {
  code: string
  label: string
  year: number | null
  selfSufficiencyPct: number | null
  selfSufficiencyTargetPct: number | null
  stepCount: number
  targetStepCoveragePct: number
  sourceRefs: number
  knownVolumeSteps: number
  knownWasteSteps: number
  totalKnownVolumeTonnes: number
  totalKnownWasteTonnes: number
  totalProductionValueBn: number
  totalValueAddedBn: number
  policyCount: number
  missingTargetSteps: string[]
  missingVolumeSteps: string[]
  missingWasteSteps: string[]
  flowSketchReady: boolean
}

export type VerdikjedeStageSignal = {
  id: string
  label: string
  countriesWithStep: number
  countriesWithVolume: number
  countriesWithWaste: number
  totalKnownVolumeTonnes: number
  totalKnownWasteTonnes: number
}

export type VerdikjedeGraphicOpportunity = {
  id: string
  title: string
  readiness: 'klar-na' | 'klar-med-forbehold' | 'staging'
  skill: string
  dataSources: string[]
  why: string
  nextStep: string
  route?: string
}

export type VerdikjedeOverview = {
  generatedAt: string
  countries: VerdikjedeCountryOverview[]
  stageSignals: VerdikjedeStageSignal[]
  opportunities: VerdikjedeGraphicOpportunity[]
  totals: {
    countryCount: number
    targetStepCount: number
    coveredTargetSteps: number
    averageCoveragePct: number
    sourceRefs: number
    knownWasteTonnes: number
    knownProductionValueBn: number
    averageSelfSufficiencyPct: number | null
  }
}

export const stageToDbStages: Record<string, string[]> = {
  primaerproduksjon: ['production'],
  foredling: ['processing'],
  'distribusjon-logistikk': ['logistics', 'wholesale', 'distribution'],
  innsatsvarer: ['inputs'],
  horeca: ['foodservice'],
  'matsvinn-sirkulaer': ['circular'],
  sjoemat: ['seafood'],
  'sjomatfor-saarbarhet': ['inputs'],
  forbruk: ['retail', 'platform'],
  'norsk-bedriftsdata': [],
  'kryss-analyse': [],
}

const COUNTRY_LABELS: Record<string, string> = {
  no: 'Norge',
  se: 'Sverige',
  dk: 'Danmark',
  fi: 'Finland',
  is: 'Island',
}

const TARGET_VALUE_CHAIN_STEPS: { id: string; label: string }[] = [
  { id: 'primary', label: 'Primærproduksjon' },
  { id: 'seafood', label: 'Sjømat' },
  { id: 'processing', label: 'Foredling' },
  { id: 'distribution', label: 'Distribusjon' },
  { id: 'retail', label: 'Detaljhandel' },
  { id: 'horeca', label: 'HoReCa' },
  { id: 'household', label: 'Husholdning' },
  { id: 'waste', label: 'Avfall/sirkularitet' },
]

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\b(asa|as|sa|ab|oyj|hf|group|gruppen|international|foods?|holding)\b/g, ' ')
    .replace(/[^\p{L}\d]+/gu, '')
    .trim()
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 100
  return Math.round((numerator / denominator) * 1000) / 10
}

async function readValueChainFile(code: string): Promise<ValueChainJson | null> {
  try {
    const text = await readFile(
      path.join(process.cwd(), 'public', 'data', 'food-systems', code, 'value-chain.json'),
      'utf8'
    )
    return JSON.parse(text) as ValueChainJson
  } catch {
    return null
  }
}

function getWasteTonnes(step: NonNullable<ValueChainJson['steps']>[number]): number | null {
  if (typeof step.total_waste_tonnes === 'number') return step.total_waste_tonnes
  if (typeof step.waste_tonnes === 'number') return step.waste_tonnes
  return null
}

export async function getVerdikjedeOverview(): Promise<VerdikjedeOverview> {
  const codes = Object.keys(COUNTRY_LABELS)
  const files = await Promise.all(codes.map(readValueChainFile))
  const countries = codes.map((code, index): VerdikjedeCountryOverview => {
    const data = files[index]
    const steps = data?.steps ?? []
    const stepIds = new Set(steps.map(step => step.id))
    const missingTargetSteps = TARGET_VALUE_CHAIN_STEPS
      .filter(step => !stepIds.has(step.id))
      .map(step => step.label)
    const missingVolumeSteps = steps
      .filter(step => typeof step.volume_tonnes !== 'number')
      .map(step => step.name ?? step.id)
    const missingWasteSteps = steps
      .filter(step => getWasteTonnes(step) == null)
      .map(step => step.name ?? step.id)
    const totalKnownVolumeTonnes = steps.reduce(
      (sum, step) => sum + (typeof step.volume_tonnes === 'number' ? step.volume_tonnes : 0),
      0
    )
    const totalKnownWasteTonnes = steps.reduce(
      (sum, step) => sum + (getWasteTonnes(step) ?? 0),
      0
    )
    const totalProductionValueBn = steps.reduce(
      (sum, step) => sum + (step.production_value_bn ?? step.market_value_bn ?? step.market_value_bn_sek ?? 0),
      0
    )
    const totalValueAddedBn = steps.reduce(
      (sum, step) => sum + (step.value_added_bn ?? 0),
      0
    )
    const coveredTargetSteps = TARGET_VALUE_CHAIN_STEPS.length - missingTargetSteps.length

    return {
      code,
      label: COUNTRY_LABELS[code],
      year: data?.year ?? null,
      selfSufficiencyPct: data?.selfSufficiency?.caloric_pct ?? null,
      selfSufficiencyTargetPct: data?.selfSufficiency?.target_pct ?? null,
      stepCount: steps.length,
      targetStepCoveragePct: pct(coveredTargetSteps, TARGET_VALUE_CHAIN_STEPS.length),
      sourceRefs: steps.reduce((sum, step) => sum + (step.sources?.length ?? 0), 0),
      knownVolumeSteps: steps.filter(step => typeof step.volume_tonnes === 'number').length,
      knownWasteSteps: steps.filter(step => getWasteTonnes(step) != null).length,
      totalKnownVolumeTonnes,
      totalKnownWasteTonnes,
      totalProductionValueBn,
      totalValueAddedBn,
      policyCount: data?.key_policies?.length ?? 0,
      missingTargetSteps,
      missingVolumeSteps,
      missingWasteSteps,
      flowSketchReady: ['no', 'se', 'dk', 'fi'].includes(code),
    }
  })

  const stageSignals = TARGET_VALUE_CHAIN_STEPS.map(stepDef => {
    let countriesWithStep = 0
    let countriesWithVolume = 0
    let countriesWithWaste = 0
    let totalKnownVolumeTonnes = 0
    let totalKnownWasteTonnes = 0

    for (const data of files) {
      const step = data?.steps?.find(s => s.id === stepDef.id)
      if (!step) continue
      countriesWithStep += 1
      if (typeof step.volume_tonnes === 'number') {
        countriesWithVolume += 1
        totalKnownVolumeTonnes += step.volume_tonnes
      }
      const waste = getWasteTonnes(step)
      if (waste != null) {
        countriesWithWaste += 1
        totalKnownWasteTonnes += waste
      }
    }

    return {
      id: stepDef.id,
      label: stepDef.label,
      countriesWithStep,
      countriesWithVolume,
      countriesWithWaste,
      totalKnownVolumeTonnes,
      totalKnownWasteTonnes,
    }
  })

  const coveredTargetSteps = countries.reduce(
    (sum, country) => sum + Math.round((country.targetStepCoveragePct / 100) * TARGET_VALUE_CHAIN_STEPS.length),
    0
  )
  const selfSufficiencyValues = countries
    .map(country => country.selfSufficiencyPct)
    .filter((value): value is number => typeof value === 'number')

  return {
    generatedAt: new Date().toISOString(),
    countries,
    stageSignals,
    opportunities: [
      {
        id: 'flow-sankey',
        title: 'Matflyt per land',
        readiness: 'klar-na',
        skill: 'd3-viz / data-visualization',
        dataSources: ['public/data/food-systems/{country}/value-chain.json', 'FoodFlowSankey'],
        why: 'Viser produksjon, import, eksport, husholdningsforbruk og matsvinn som flyt i stedet for bare leddtekst.',
        nextStep: 'Gjøre dagens skisse om til sammenlignbar nordisk flyt med kildepopover per ledd.',
        route: '/verdikjede',
      },
      {
        id: 'import-vulnerability',
        title: 'Import- og beredskapssårbarhet',
        readiness: 'klar-med-forbehold',
        skill: 'business-intelligence / kpi-dashboard-design',
        dataSources: ['research/data/nordic/trade-groups/normalized/', 'research/data/nordic/core-series/'],
        why: 'Kobler selvforsyning, importandel og pris-/handelstidsserier til konkrete sårbare ledd.',
        nextStep: 'Bygge en sårbarhetsstripe med varegruppe, land, trend og datakvalitet.',
        route: '/forsyningskjede',
      },
      {
        id: 'bottleneck-map',
        title: 'Geografiske flaskehalser',
        readiness: 'staging',
        skill: 'frontend-design / data-visualization',
        dataSources: ['logistics_hubs.geojson', 'processing_plants.geojson', 'ports.geojson', 'aquaculture_sites.geojson'],
        why: 'Forsyningskjeden har nettverksgraf, men ikke romlig lesning av lagre, havner, anlegg og akvakulturpunkter.',
        nextStep: 'Harmonisere ID/kildefelt og lage kartpanel med flaskehalsstatus.',
        route: '/kart',
      },
      {
        id: 'circular-return-flows',
        title: 'Returstrømmer og sirkularitet',
        readiness: 'staging',
        skill: 'd3-viz / business-intelligence',
        dataSources: ['circularity-loops.json', 'nutrient-flows.json', 'value-chain.json'],
        why: 'Gjør sidestrømmer, matsvinn, biogass og næringsstoffretur til en egen analyse, ikke bare en endestasjon.',
        nextStep: 'Splitte returstrømmer fra lineær flyt og merke modenhet, volum og dokumentasjonsgrad.',
        route: '/sirkularitet',
      },
    ],
    totals: {
      countryCount: countries.length,
      targetStepCount: countries.length * TARGET_VALUE_CHAIN_STEPS.length,
      coveredTargetSteps,
      averageCoveragePct: pct(coveredTargetSteps, countries.length * TARGET_VALUE_CHAIN_STEPS.length),
      sourceRefs: countries.reduce((sum, country) => sum + country.sourceRefs, 0),
      knownWasteTonnes: countries.reduce((sum, country) => sum + country.totalKnownWasteTonnes, 0),
      knownProductionValueBn: countries.reduce((sum, country) => sum + country.totalProductionValueBn, 0),
      averageSelfSufficiencyPct:
        selfSufficiencyValues.length > 0
          ? Math.round(selfSufficiencyValues.reduce((sum, value) => sum + value, 0) / selfSufficiencyValues.length)
          : null,
    },
  }
}

export async function getVerdikjedeEnrichment(): Promise<StageEnrichment[]> {
  const allActorNames = new Set<string>()
  for (const stage of verdikjedeStages) {
    for (const actor of stage.keyActors) allActorNames.add(actor)
  }

  const nameToCompanyId = new Map<string, string>()
  const stageCountByDb = new Map<string, number>()

  try {
    const [companies, grouped] = await Promise.all([
      prisma.company.findMany({ select: { id: true, name: true } }),
      prisma.company.groupBy({
        by: ['valueChainStage'],
        _count: { _all: true },
      }),
    ])

    const companyByNormalized = new Map<string, string>()
    for (const c of companies) {
      const norm = normalizeForMatch(c.name)
      if (norm.length >= 3 && !companyByNormalized.has(norm)) {
        companyByNormalized.set(norm, c.id)
      }
    }

    for (const actor of allActorNames) {
      const norm = normalizeForMatch(actor)
      if (norm.length < 3) continue
      const direct = companyByNormalized.get(norm)
      if (direct) {
        nameToCompanyId.set(actor, direct)
        continue
      }
      for (const [compNorm, compId] of companyByNormalized) {
        if (compNorm.startsWith(norm) || norm.startsWith(compNorm)) {
          nameToCompanyId.set(actor, compId)
          break
        }
      }
    }

    for (const row of grouped) {
      if (row.valueChainStage) {
        stageCountByDb.set(row.valueChainStage, row._count._all)
      }
    }
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
  }

  return verdikjedeStages.map(stage => {
    const dbStages = stageToDbStages[stage.id] ?? []
    const companyCount = dbStages.reduce((sum, s) => sum + (stageCountByDb.get(s) ?? 0), 0)
    const actorMatches: ActorMatch[] = stage.keyActors.map(actor => ({
      name: actor,
      companyId: nameToCompanyId.get(actor) ?? null,
    }))
    return { stageId: stage.id, actorMatches, companyCount, dbStages }
  })
}
