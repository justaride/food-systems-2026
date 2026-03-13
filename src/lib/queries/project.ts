import { prisma } from '@/lib/db'
import type {
  Phase,
  ProjectTask,
  TenStep,
  KPI,
  EvidenceDoc,
  Deliverable,
  Application,
} from '@/lib/types'

export async function getPhases(): Promise<Phase[]> {
  const rows = await prisma.phase.findMany({ orderBy: { id: 'asc' } })
  return rows as unknown as Phase[]
}

export async function getTasks(opts?: { status?: string; phaseId?: string }): Promise<ProjectTask[]> {
  const { status, phaseId } = opts ?? {}
  const where = {
    ...(status && { status }),
    ...(phaseId && { phaseId }),
  }
  const rows = await prisma.projectTask.findMany({ where, orderBy: { id: 'asc' } })
  return rows as unknown as ProjectTask[]
}

export async function getTeam() {
  return prisma.teamMember.findMany({ orderBy: { id: 'asc' } })
}

export async function getDeliverables(): Promise<Deliverable[]> {
  const rows = await prisma.deliverable.findMany({ orderBy: { id: 'asc' } })
  return rows as unknown as Deliverable[]
}

export async function getKpis(): Promise<KPI[]> {
  const rows = await prisma.kPI.findMany()
  return rows.map(r => ({
    ...r,
    current: r.current ?? undefined,
    target: r.target ?? undefined,
  }))
}

export async function getTenSteps(): Promise<TenStep[]> {
  const rows = await prisma.tenStep.findMany({ orderBy: { step: 'asc' } })
  return rows as unknown as TenStep[]
}

export async function getEvidenceDocs(): Promise<EvidenceDoc[]> {
  const rows = await prisma.evidenceDoc.findMany({ orderBy: { id: 'asc' } })
  return rows as unknown as EvidenceDoc[]
}

export async function getApplications(): Promise<Application[]> {
  const rows = await prisma.application.findMany({ orderBy: { year: 'desc' } })
  return rows as unknown as Application[]
}

export async function getRecentInsights(limit = 3) {
  return prisma.insight.findMany({
    include: {
      sourceRefs: { select: { id: true, label: true, url: true, note: true, sourceDocId: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  })
}
