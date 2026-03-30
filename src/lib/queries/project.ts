import { prisma } from '@/lib/db'
import { applications as fallbackApplications } from '@/lib/data/applications'
import { deliverables as fallbackDeliverables } from '@/lib/data/deliverables'
import { evidencePack as fallbackEvidencePack } from '@/lib/data/evidence-pack'
import { insights as fallbackInsights } from '@/lib/data/insights'
import { kpis as fallbackKpis } from '@/lib/data/kpis'
import { phases as fallbackPhases } from '@/lib/data/phases'
import { tasks as fallbackTasks } from '@/lib/data/tasks'
import { team as fallbackTeam } from '@/lib/data/team'
import { tenSteps as fallbackTenSteps } from '@/lib/data/ten-step-start'
import type {
  Phase,
  ProjectTask,
  TenStep,
  KPI,
  EvidenceDoc,
  Deliverable,
  Application,
} from '@/lib/types'
import { isPrismaDataUnavailable } from './prisma-errors'

function logProjectFallback(dataset: string, error: unknown) {
  console.warn(`[project-query] Falling back to static ${dataset} data`, error)
}

export async function getPhases(): Promise<Phase[]> {
  try {
    const rows = await prisma.phase.findMany({ orderBy: { id: 'asc' } })
    return rows as unknown as Phase[]
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('phases', error)
    return fallbackPhases
  }
}

export async function getTasks(opts?: { status?: string; phaseId?: string }): Promise<ProjectTask[]> {
  const { status, phaseId } = opts ?? {}
  const where = {
    ...(status && { status }),
    ...(phaseId && { phaseId }),
  }
  try {
    const rows = await prisma.projectTask.findMany({ where, orderBy: { id: 'asc' } })
    return rows as unknown as ProjectTask[]
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('tasks', error)
    return fallbackTasks.filter(task => {
      if (status && task.status !== status) return false
      if (phaseId && task.phase !== phaseId) return false
      return true
    })
  }
}

export async function getTeam() {
  try {
    return await prisma.teamMember.findMany({ orderBy: { id: 'asc' } })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('team', error)
    return fallbackTeam
  }
}

export async function getDeliverables(): Promise<Deliverable[]> {
  try {
    const rows = await prisma.deliverable.findMany({ orderBy: { id: 'asc' } })
    return rows as unknown as Deliverable[]
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('deliverables', error)
    return fallbackDeliverables
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
    return rows as unknown as TenStep[]
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    logProjectFallback('ten steps', error)
    return fallbackTenSteps
  }
}

export async function getEvidenceDocs(): Promise<EvidenceDoc[]> {
  try {
    const rows = await prisma.evidenceDoc.findMany({ orderBy: { id: 'asc' } })
    return rows as unknown as EvidenceDoc[]
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
