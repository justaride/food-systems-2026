import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
} from './library-analysis-common'
import {
  buildLibraryAnalysisSyncPlan,
} from '../src/lib/library-analysis-processing'
import {
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT,
  PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  inspectLibraryAnalysisRetainedHistory,
  validateLibraryAnalysisRetainedHistoryContract,
} from '../src/lib/library-analysis-retained-history-contract'

export async function checkLibraryAnalysisRetainedHistory() {
  const contractIssues = validateLibraryAnalysisRetainedHistoryContract()
  if (contractIssues.length > 0) {
    throw new Error(`Retained-history source contract is invalid:\n- ${contractIssues.join('\n- ')}`)
  }

  const currentInventory = await loadLibraryAnalysisInventory({ requireDb: true })
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const databaseRows = await prisma.$transaction(async transaction => {
      await transaction.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      return transaction.libraryAnalysisRecord.findMany({
        orderBy: [{ sourceKind: 'asc' }, { sourceKey: 'asc' }],
      })
    }, { isolationLevel: 'RepeatableRead' })

    const inspection = inspectLibraryAnalysisRetainedHistory({
      currentInventory,
      databaseRows,
    })
    if (inspection.issues.length > 0) {
      throw new Error(`Retained-history database check failed:\n- ${inspection.issues.join('\n- ')}`)
    }

    const syncPlan = buildLibraryAnalysisSyncPlan(currentInventory, databaseRows)
    if (syncPlan.counts.create !== 0) {
      throw new Error(
        `Retained-history check requires zero inventory-only creates; found ${syncPlan.counts.create}`,
      )
    }
    if (syncPlan.counts.stale !== inspection.summary.retainedHistoryRows) {
      throw new Error(
        `Sync-plan retained count ${syncPlan.counts.stale} does not match inspected count ${inspection.summary.retainedHistoryRows}`,
      )
    }

    return Object.freeze({
      ok: true,
      contractVersion: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION,
      contractSha256: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
      pinnedContractSha256:
        PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
      databaseTransaction: Object.freeze({
        isolationLevel: 'repeatable_read',
        readOnly: true,
      }),
      identityPartition: inspection.summary,
      projectionFreshness: Object.freeze({
        contractBoundary: 'separate',
        materialUpdateCount: syncPlan.counts.material_update,
        observedAtReview:
          LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT
            .projectionFreshnessMaterialUpdates,
        matchesReviewObservation:
          syncPlan.counts.material_update ===
          LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT
            .projectionFreshnessMaterialUpdates,
        noopCount: syncPlan.counts.noop,
      }),
      managedRuntimeSourceDocs: Object.freeze({
        contractBoundary: 'separate',
        retainedIntersectionCount:
          LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT
            .managedRuntimeSourceDocIntersectionRows,
      }),
    })
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const result = await checkLibraryAnalysisRetainedHistory()
  console.log(JSON.stringify(result, null, 2))
}

const invokedPath = process.argv[1]
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
