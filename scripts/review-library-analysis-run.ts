/**
 * Human review decision on one model analysis run.
 *
 * Runs are immutable machine output and carry no authority. This is the only
 * place a person grants one: approving points LibraryAnalysisRecord at the run,
 * rejecting records the decision and stops showing it.
 *
 * A decision is never made in the web UI, because that app has no
 * authentication. It is made here, by a named reviewer, exactly like the
 * existing external review decision.
 *
 *   npm run research:library:review-run:dry-run -- --run <id> --decision approve --reviewer "Navn"
 *   npm run research:library:review-run:apply   -- --run <id> --decision approve --reviewer "Navn"
 */
import { pathToFileURL } from 'node:url'
import type { Prisma } from '../src/generated/prisma/client'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'

export type ReviewDecision = 'approve' | 'reject'

export type ReviewArgs = {
  runId: string
  decision: ReviewDecision
  reviewer: string
  apply: boolean
}

export type ReviewedRun = {
  id: string
  sourceKind: string
  sourceKey: string
  documentId: string | null
  sourceDocId: string | null
  canonicalPath: string | null
  title: string
  analysisTier: string
  aiCard: Prisma.InputJsonValue
  aiSummary: string | null
  keyFindings: string[]
  claimCandidates: Prisma.InputJsonValue
  projectImplications: string[]
  gaps: Prisma.InputJsonValue
  controlLinks: Prisma.InputJsonValue
  riskFlags: string[]
  contentHash: string | null
  wordCount: number
}

export function parseReviewArgs(argv: string[]): ReviewArgs {
  const value = (flag: string) => {
    const index = argv.indexOf(flag)
    if (index === -1) return null
    const next = argv[index + 1]
    return next && !next.startsWith('--') ? next : null
  }

  const runId = value('--run')
  if (!runId) throw new Error('--run <LibraryAnalysisRun id> is required')

  const decision = value('--decision')
  if (decision !== 'approve' && decision !== 'reject') {
    throw new Error('--decision must be approve or reject')
  }

  const reviewer = value('--reviewer')
  if (!reviewer) throw new Error('--reviewer "<name>" is required; a decision must name a person')

  return { runId, decision, reviewer, apply: argv.includes('--apply') }
}

/**
 * What an approval writes onto the record. The analysis content comes from the
 * run, so an approved record shows exactly the analysis that was reviewed.
 *
 * A model can never reach safe_for_external_claims through this path. The
 * adapter gate already refuses such a card, and this refuses it again: external
 * claim authority is granted by the separate external review decision, against
 * a content hash, not by approving a model run.
 */
export function buildApprovalWrite(run: ReviewedRun, reviewer: string, reviewedAt: Date) {
  const card = (run.aiCard ?? {}) as Record<string, unknown>
  const usageRule = typeof card.recommendedUsageRule === 'string'
    ? card.recommendedUsageRule
    : 'internal_background'

  if (usageRule === 'safe_for_external_claims') {
    throw new Error(
      'Refusing to approve: the run asks for safe_for_external_claims. External claim authority is granted by research:library:review-external, not by approving a model run.',
    )
  }

  const status = typeof card.status === 'string' ? card.status : 'ai_draft'
  const citationReadiness = typeof card.citationStatus === 'string' ? card.citationStatus : null

  return {
    sourceKind: run.sourceKind,
    sourceKey: run.sourceKey,
    documentId: run.documentId,
    sourceDocId: run.sourceDocId,
    canonicalPath: run.canonicalPath,
    title: run.title,
    status,
    usageRule,
    reviewStatus: 'approved',
    citationReadiness,
    analysisTier: run.analysisTier,
    aiCard: run.aiCard,
    aiSummary: run.aiSummary,
    keyFindings: run.keyFindings,
    claimCandidates: run.claimCandidates,
    projectImplications: run.projectImplications,
    gaps: run.gaps,
    controlLinks: run.controlLinks,
    riskFlags: run.riskFlags,
    contentHash: run.contentHash,
    wordCount: run.wordCount,
    processedAt: reviewedAt,
    reviewedAt,
    reviewer,
    currentRunId: run.id,
  }
}

/**
 * A rejection records who decided and when, and stops the rejected analysis
 * being the one on show. It does not delete the run: the candidate stays in
 * history so a later reviewer can see what was turned down.
 */
export function buildRejectionWrite(run: ReviewedRun, reviewer: string, reviewedAt: Date) {
  return {
    create: {
      sourceKind: run.sourceKind,
      sourceKey: run.sourceKey,
      documentId: run.documentId,
      sourceDocId: run.sourceDocId,
      canonicalPath: run.canonicalPath,
      title: run.title,
      status: 'review_required',
      usageRule: 'do_not_use_for_claims',
      reviewStatus: 'rejected',
      analysisTier: run.analysisTier,
      keyFindings: [],
      projectImplications: [],
      riskFlags: run.riskFlags,
      wordCount: run.wordCount,
      reviewedAt,
      reviewer,
    },
    update: {
      reviewStatus: 'rejected',
      usageRule: 'do_not_use_for_claims',
      reviewedAt,
      reviewer,
    },
  }
}

async function main() {
  const args = parseReviewArgs(process.argv.slice(2))
  const prisma = createLibraryAnalysisPrismaClient()

  try {
    const found = await prisma.libraryAnalysisRun.findUnique({ where: { id: args.runId } })
    if (!found) throw new Error(`No LibraryAnalysisRun with id ${args.runId}`)

    // The stored columns are nullable JSON; the record write is not.
    const run: ReviewedRun = {
      ...found,
      aiCard: (found.aiCard ?? {}) as Prisma.InputJsonValue,
      claimCandidates: (found.claimCandidates ?? []) as Prisma.InputJsonValue,
      gaps: (found.gaps ?? []) as Prisma.InputJsonValue,
      controlLinks: (found.controlLinks ?? []) as Prisma.InputJsonValue,
    }

    const reviewedAt = new Date()
    const where = {
      sourceKind_sourceKey: { sourceKind: run.sourceKind, sourceKey: run.sourceKey },
    }

    console.log(JSON.stringify({
      runMode: args.apply ? 'apply' : 'dry-run',
      decision: args.decision,
      reviewer: args.reviewer,
      run: { id: run.id, runId: found.runId, aiModel: found.aiModel },
      source: { sourceKind: run.sourceKind, sourceKey: run.sourceKey, title: run.title },
    }, null, 2))

    if (args.decision === 'approve') {
      const write = buildApprovalWrite(run, args.reviewer, reviewedAt)
      if (!args.apply) {
        console.log('Dry run: would approve this run and point the record at it. Re-run with --apply.')
        return
      }
      await prisma.libraryAnalysisRecord.upsert({ where, create: write, update: write })
      console.log(`Approved. LibraryAnalysisRecord for ${run.sourceKey} now shows run ${run.id}.`)
      return
    }

    const write = buildRejectionWrite(run, args.reviewer, reviewedAt)
    if (!args.apply) {
      console.log('Dry run: would record a rejection for this source. Re-run with --apply.')
      return
    }
    await prisma.libraryAnalysisRecord.upsert({ where, create: write.create, update: write.update })
    // Never leave the record pointing at an analysis a reviewer just rejected.
    await prisma.libraryAnalysisRecord.updateMany({
      where: { sourceKind: run.sourceKind, sourceKey: run.sourceKey, currentRunId: run.id },
      data: { currentRunId: null },
    })
    console.log(`Rejected. Run ${run.id} stays in history and is no longer shown for ${run.sourceKey}.`)
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
