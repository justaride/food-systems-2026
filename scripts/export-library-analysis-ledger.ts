import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
  summarizeRows,
  writeLibraryAnalysisArtifacts,
} from './library-analysis-common'
import {
  type LibraryAnalysisInventoryRow,
} from '../src/lib/library-analysis-inventory'
import {
  libraryAnalysisIdentityKey,
  partitionLibraryAnalysisRecordsForLiveLedger,
} from '../src/lib/library-analysis-processing'
import {
  classifyLibraryAnalysisRecord,
  requiresLibraryAnalysisReview,
} from '../src/lib/library-analysis'
import { readLibraryAnalysisExternalCitationPolicyHash } from '../src/lib/library-analysis-external-citations'

async function main() {
  const exportBatch = process.env.DATABASE_URL
    ? await loadRowsFromDb()
    : {
        rows: await loadLibraryAnalysisInventory(),
        staleRetainedCount: 0,
      }
  const { rows, staleRetainedCount } = exportBatch
  const summary = summarizeRows(rows)
  const paths = writeLibraryAnalysisArtifacts(rows, { staleRetainedCount })

  console.log(`Library ledger exported sources: ${summary.total}`)
  console.log(`Stale retained outside live ledger: ${staleRetainedCount}`)
  console.log(`Review queue: ${summary.reviewRequired}`)
  console.log(`Ledger: ${paths.ledgerPath}`)
}

async function loadRowsFromDb(): Promise<{
  rows: LibraryAnalysisInventoryRow[]
  staleRetainedCount: number
}> {
  const currentInventory = await loadLibraryAnalysisInventory({ requireDb: true })
  const currentByIdentity = new Map(
    currentInventory.map(row => [libraryAnalysisIdentityKey(row), row] as const),
  )
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const records = await prisma.libraryAnalysisRecord.findMany({
      orderBy: [{ sourceKind: 'asc' }, { sourceKey: 'asc' }],
    })
    if (records.length === 0) {
      return { rows: currentInventory, staleRetainedCount: 0 }
    }

    const { liveRecords, staleRetainedRecords } =
      partitionLibraryAnalysisRecordsForLiveLedger(currentInventory, records)

    const rows = liveRecords.map(record => {
      const current = currentByIdentity.get(libraryAnalysisIdentityKey(record))
      const claimCandidates = Array.isArray(record.claimCandidates)
        ? record.claimCandidates
        : []
      const classification = classifyLibraryAnalysisRecord({
        wordCount: record.wordCount,
        hasLocalFile: Boolean(record.canonicalPath),
        hasDbLink: Boolean(record.documentId || record.sourceDocId),
        citationReadiness: record.citationReadiness,
        claimCandidateCount: claimCandidates.length,
        riskFlags: record.riskFlags,
        gapKinds: [],
        isSuperseded: record.status === 'superseded',
      })
      const externalCitationPolicyHash = readLibraryAnalysisExternalCitationPolicyHash(record.aiCard)
      const currentExternalCitationPolicyHash = current?.currentExternalCitationPolicyHash ?? null
      const reviewRequired = requiresLibraryAnalysisReview({
        sourceKind: record.sourceKind,
        sourceKey: record.sourceKey,
        documentId: record.documentId,
        status: record.status,
        usageRule: record.usageRule,
        reviewStatus: record.reviewStatus,
        reviewedAt: record.reviewedAt,
        reviewer: record.reviewer,
        citationReadiness: record.citationReadiness,
        contentHash: record.contentHash,
        currentContentHash: current?.contentHash ?? null,
        externalCitationPolicyHash,
        currentExternalCitationPolicyHash,
        riskFlags: record.riskFlags,
        claimCandidateCount: claimCandidates.length,
      })

      return {
        sourceKind: record.sourceKind as LibraryAnalysisInventoryRow['sourceKind'],
        sourceKey: record.sourceKey,
        title: record.title,
        canonicalPath: record.canonicalPath,
        linkedDocumentId: record.documentId,
        linkedSourceDocId: record.sourceDocId,
        linkedReportId: null,
        linkedThesisId: null,
        citationReadiness: record.citationReadiness,
        externalCitationEligible: Boolean(currentExternalCitationPolicyHash),
        externalCitationPolicyHash,
        currentExternalCitationPolicyHash,
        hasLocalFile: Boolean(record.canonicalPath),
        hasDbLink: Boolean(record.documentId || record.sourceDocId),
        wordCount: record.wordCount,
        contentHash: record.contentHash ?? '',
        currentContentHash: current?.contentHash ?? null,
        riskFlags: record.riskFlags,
        claimCandidateCount: claimCandidates.length,
        reviewStatus: record.reviewStatus,
        reviewedAt: record.reviewedAt?.toISOString() ?? null,
        reviewer: record.reviewer,
        classification: {
          ...classification,
          status: record.status as LibraryAnalysisInventoryRow['classification']['status'],
          usageRule: record.usageRule as LibraryAnalysisInventoryRow['classification']['usageRule'],
          reviewRequired,
        },
      }
    })

    return {
      rows,
      staleRetainedCount: staleRetainedRecords.length,
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
