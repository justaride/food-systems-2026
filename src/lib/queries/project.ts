import { cache } from 'react'
import { prisma } from '@/lib/db'
import { applications as fallbackApplications } from '@/lib/data/applications'
import { evidencePack as fallbackEvidencePack } from '@/lib/data/evidence-pack'
import { insights as fallbackInsights } from '@/lib/data/insights'
import { kpis as fallbackKpis } from '@/lib/data/kpis'
import { phases as fallbackPhases } from '@/lib/data/phases'
import { team as fallbackTeam } from '@/lib/data/team'
import { tenSteps as fallbackTenSteps } from '@/lib/data/ten-step-start'
import type {
  Phase,
  TenStep,
  KPI,
  EvidenceDoc,
  Application,
} from '@/lib/types'
import { isPrismaDataUnavailable } from './prisma-errors'

function logProjectFallback(dataset: string, error: unknown) {
  console.warn(`[project-query] Falling back to static ${dataset} data`, error)
}

function canonicalValueMatches(rowValue: unknown, canonicalValue: unknown): boolean {
  if (typeof canonicalValue === 'object' && canonicalValue !== null) {
    return JSON.stringify(rowValue) === JSON.stringify(canonicalValue)
  }

  return rowValue === canonicalValue
}

function rowMatchesCanonical<T extends object>(row: T | undefined, canonical: T): boolean {
  if (!row) return false

  return Object.entries(canonical as Record<string, unknown>).every(([key, canonicalValue]) => (
    canonicalValueMatches((row as Record<string, unknown>)[key], canonicalValue)
  ))
}

function getFreshCanonicalRows<T extends object, K extends string | number>(
  rows: T[],
  canonicalRows: T[],
  getKey: (row: T) => K,
): T[] {
  const rowsById = new Map(rows.map(row => [getKey(row), row]))
  const hasCurrentCanonicalRows = canonicalRows.every(canonical => (
    rowMatchesCanonical(rowsById.get(getKey(canonical)), canonical)
  ))

  if (!hasCurrentCanonicalRows) return canonicalRows

  return canonicalRows.map(canonical => rowsById.get(getKey(canonical)) ?? canonical)
}

export const getPhases = cache(async (): Promise<Phase[]> => {
  try {
    const rows = await prisma.phase.findMany({ orderBy: { id: 'asc' } })
    return getFreshCanonicalRows(rows as unknown as Phase[], fallbackPhases, row => row.id)
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('phases', error)
    return fallbackPhases
  }
})

export async function getTeam() {
  try {
    return await prisma.teamMember.findMany({ orderBy: { id: 'asc' } })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('team', error)
    return fallbackTeam
  }
}

export async function getKpis(): Promise<KPI[]> {
  try {
    const rows = await prisma.kPI.findMany()
    return rows.map(r => ({
      ...r,
      current: r.current ?? undefined,
      target: r.target ?? undefined,
    }))
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('kpis', error)
    return fallbackKpis
  }
}

export async function getTenSteps(): Promise<TenStep[]> {
  try {
    const rows = await prisma.tenStep.findMany({ orderBy: { step: 'asc' } })
    return getFreshCanonicalRows(rows as unknown as TenStep[], fallbackTenSteps, row => row.step)
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('ten steps', error)
    return fallbackTenSteps
  }
}

export async function getEvidenceDocs(): Promise<EvidenceDoc[]> {
  try {
    const rows = await prisma.evidenceDoc.findMany({ orderBy: { id: 'asc' } })
    return getFreshCanonicalRows(rows as unknown as EvidenceDoc[], fallbackEvidencePack, row => row.id)
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('evidence docs', error)
    return fallbackEvidencePack
  }
}

export async function getApplications(): Promise<Application[]> {
  try {
    const rows = await prisma.application.findMany({ orderBy: { year: 'desc' } })
    return rows as unknown as Application[]
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('applications', error)
    return fallbackApplications
  }
}

export async function getRecentInsights(limit = 3) {
  try {
    return await prisma.insight.findMany({
      include: {
        sourceRefs: { select: { id: true, label: true, url: true, note: true, sourceDocId: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('insights', error)
    return [...fallbackInsights]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
      .map(item => ({
        ...item,
        insightType: item.type,
        sourceRefs: item.sources?.map(source => ({
          id: source.sourceId ?? source.label,
          label: source.label,
          url: source.url ?? null,
          note: source.note ?? null,
          sourceDocId: null,
        })) ?? [],
      }))
  }
}
