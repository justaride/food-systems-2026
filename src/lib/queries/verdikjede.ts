import { prisma } from '@/lib/db'
import { isPrismaDataUnavailable } from './prisma-errors'
import { verdikjedeStages } from '@/lib/data/verdikjede'

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

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\b(asa|as|sa|ab|oyj|hf|group|gruppen|international|foods?|holding)\b/g, ' ')
    .replace(/[^\p{L}\d]+/gu, '')
    .trim()
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
