import { summarizeLibraryAnalysisRecords } from '@/lib/library-analysis'

export type LibraryAnalysisStatusRecord = {
  status: string
  usageRule: string
  reviewStatus: string | null
  riskFlags: string[]
  claimCandidates: unknown
}

export type LibraryAnalysisBadge = {
  status: string
  usageRule: string
  reviewRequired: boolean
  claimCandidateCount: number
  riskFlags: string[]
}

export type LibraryAnalysisStatusPayload = ReturnType<typeof buildLibraryAnalysisStatusPayload>

export type LibraryAnalysisRecordRow = {
  id: string
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  aiSummary: string | null
  keyFindings: string[]
  projectImplications: string[]
  riskFlags: string[]
  claimCandidateCount: number
  wordCount: number
  updatedAt: Date
}

export function buildLibraryAnalysisStatusPayload(records: LibraryAnalysisStatusRecord[]) {
  const summary = summarizeLibraryAnalysisRecords(records.map(record => ({
    status: record.status,
    usageRule: record.usageRule,
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
    riskFlags: record.riskFlags,
  })))

  return {
    ok: summary.total > 0 && summary.reviewRequired === 0 && summary.blocked === 0,
    total: summary.total,
    finished: summary.finished,
    readinessPct: summary.total === 0 ? 0 : Math.round((summary.finished / summary.total) * 100),
    reviewRequired: summary.reviewRequired,
    blocked: summary.blocked,
    typeB: summary.typeB,
    typeC: summary.typeC,
    claimCandidates: summary.claimCandidates,
    missingText: summary.missingText,
    byStatus: countBy(records, record => record.status),
    byUsageRule: countBy(records, record => record.usageRule),
  }
}

export function toLibraryAnalysisBadge(record: LibraryAnalysisStatusRecord | null | undefined): LibraryAnalysisBadge | null {
  if (!record) return null

  return {
    status: record.status,
    usageRule: record.usageRule,
    reviewRequired: record.reviewStatus === 'queued' || record.status === 'review_required' || record.status === 'blocked',
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
    riskFlags: record.riskFlags,
  }
}

export async function getLibraryAnalysisStatus() {
  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    select: {
      status: true,
      usageRule: true,
      reviewStatus: true,
      riskFlags: true,
      claimCandidates: true,
    },
  })

  return buildLibraryAnalysisStatusPayload(records)
}

export async function getLibraryAnalysisRecords(opts?: {
  limit?: number
  status?: string
}): Promise<LibraryAnalysisRecordRow[]> {
  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    select: {
      id: true,
      sourceKind: true,
      sourceKey: true,
      title: true,
      canonicalPath: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      citationReadiness: true,
      aiSummary: true,
      keyFindings: true,
      projectImplications: true,
      riskFlags: true,
      claimCandidates: true,
      wordCount: true,
      updatedAt: true,
    },
    orderBy: [
      { status: 'asc' },
      { usageRule: 'asc' },
      { title: 'asc' },
    ],
    take: opts?.limit ?? 200,
  })

  return records.map(record => ({
    ...record,
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
  }))
}

export async function getLibraryAnalysisBadgesByDocumentIds(documentIds: string[]) {
  const ids = [...new Set(documentIds)].filter(Boolean)
  if (ids.length === 0) return new Map<string, LibraryAnalysisBadge>()

  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    where: { documentId: { in: ids } },
    select: {
      documentId: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      riskFlags: true,
      claimCandidates: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const badges = new Map<string, LibraryAnalysisBadge>()
  for (const record of records) {
    if (!record.documentId || badges.has(record.documentId)) continue
    badges.set(record.documentId, toLibraryAnalysisBadge(record)!)
  }
  return badges
}

function claimCandidateCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function countBy<T>(records: T[], keyFn: (record: T) => string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const record of records) {
    const key = keyFn(record)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

async function getPrisma() {
  return (await import('@/lib/db')).prisma
}
