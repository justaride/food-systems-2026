export type LibraryAnalysisRunClaim = {
  text: string
  evidence: string | null
  sourcePath: string | null
  pageRef: string | null
}

export type LibraryAnalysisRunGap = {
  kind: string
  note: string
}

export type LibraryAnalysisRunRow = {
  id: string
  runId: string
  aiModel: string
  promptVersion: string
  analysisTier: string
  aiSummary: string | null
  keyFindings: string[]
  projectImplications: string[]
  claims: LibraryAnalysisRunClaim[]
  gaps: LibraryAnalysisRunGap[]
  riskFlags: string[]
  payloadHash: string
  contentHash: string | null
  wordCount: number
  createdAt: Date
  /** A record for this source points at this run as the analysis it shows. */
  isCurrent: boolean
  /** A human has recorded a decision on this source. */
  reviewStatus: string | null
  reviewer: string | null
}

export type LibraryAnalysisRunGroup = {
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  runs: LibraryAnalysisRunRow[]
}

/**
 * Model analyses grouped by the source they analysed, newest run first, so a
 * reviewer can compare what different models or prompts said about the same
 * material. Read-only: nothing here grants a run any authority.
 */
export async function getLibraryAnalysisRunGroups(opts?: {
  limit?: number
}): Promise<LibraryAnalysisRunGroup[]> {
  const prisma = (await import('@/lib/db')).prisma

  const [runs, records] = await Promise.all([
    prisma.libraryAnalysisRun.findMany({
      orderBy: [{ sourceKey: 'asc' }, { createdAt: 'desc' }],
      take: opts?.limit ?? 500,
      select: {
        id: true,
        sourceKind: true,
        sourceKey: true,
        title: true,
        canonicalPath: true,
        runId: true,
        aiModel: true,
        promptVersion: true,
        analysisTier: true,
        aiSummary: true,
        keyFindings: true,
        projectImplications: true,
        claimCandidates: true,
        gaps: true,
        riskFlags: true,
        payloadHash: true,
        contentHash: true,
        wordCount: true,
        createdAt: true,
      },
    }),
    prisma.libraryAnalysisRecord.findMany({
      select: { sourceKind: true, sourceKey: true, currentRunId: true, reviewStatus: true, reviewer: true },
    }),
  ])

  const recordByKey = new Map(records.map(record => [
    `${record.sourceKind}:${record.sourceKey}`,
    record,
  ]))

  const groups = new Map<string, LibraryAnalysisRunGroup>()

  for (const run of runs) {
    const key = `${run.sourceKind}:${run.sourceKey}`
    const record = recordByKey.get(key)

    let group = groups.get(key)
    if (!group) {
      group = {
        sourceKind: run.sourceKind,
        sourceKey: run.sourceKey,
        title: run.title,
        canonicalPath: run.canonicalPath,
        runs: [],
      }
      groups.set(key, group)
    }

    group.runs.push({
      id: run.id,
      runId: run.runId,
      aiModel: run.aiModel,
      promptVersion: run.promptVersion,
      analysisTier: run.analysisTier,
      aiSummary: run.aiSummary,
      keyFindings: run.keyFindings,
      projectImplications: run.projectImplications,
      claims: toClaims(run.claimCandidates),
      gaps: toGaps(run.gaps),
      riskFlags: run.riskFlags,
      payloadHash: run.payloadHash,
      contentHash: run.contentHash,
      wordCount: run.wordCount,
      createdAt: run.createdAt,
      isCurrent: record?.currentRunId === run.id,
      reviewStatus: record?.reviewStatus ?? null,
      reviewer: record?.reviewer ?? null,
    })
  }

  return [...groups.values()]
}

export function toClaims(value: unknown): LibraryAnalysisRunClaim[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const claim = entry as Record<string, unknown>
    const text = typeof claim.text === 'string' ? claim.text : null
    if (!text) return []
    return [{
      text,
      evidence: typeof claim.evidence === 'string' ? claim.evidence : null,
      sourcePath: typeof claim.sourcePath === 'string' ? claim.sourcePath : null,
      pageRef: typeof claim.pageRef === 'string' ? claim.pageRef : null,
    }]
  })
}

export function toGaps(value: unknown): LibraryAnalysisRunGap[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const gap = entry as Record<string, unknown>
    const note = typeof gap.note === 'string' ? gap.note : null
    if (!note) return []
    return [{ kind: typeof gap.kind === 'string' ? gap.kind : 'none', note }]
  })
}
