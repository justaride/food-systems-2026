import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
  summarizeRows,
  writeLibraryAnalysisArtifacts,
} from './library-analysis-common'
import {
  type LibraryAnalysisInventoryRow,
} from '../src/lib/library-analysis-inventory'
import { classifyLibraryAnalysisRecord } from '../src/lib/library-analysis'

async function main() {
  const rows = process.env.DATABASE_URL
    ? await loadRowsFromDb()
    : await loadLibraryAnalysisInventory()
  const summary = summarizeRows(rows)
  const paths = writeLibraryAnalysisArtifacts(rows)

  console.log(`Library ledger exported sources: ${summary.total}`)
  console.log(`Review queue: ${summary.reviewRequired}`)
  console.log(`Ledger: ${paths.ledgerPath}`)
}

async function loadRowsFromDb(): Promise<LibraryAnalysisInventoryRow[]> {
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const records = await prisma.libraryAnalysisRecord.findMany({
      orderBy: [{ sourceKind: 'asc' }, { sourceKey: 'asc' }],
    })
    if (records.length === 0) return loadLibraryAnalysisInventory()

    return records.map(record => {
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
        hasLocalFile: Boolean(record.canonicalPath),
        hasDbLink: Boolean(record.documentId || record.sourceDocId),
        wordCount: record.wordCount,
        contentHash: record.contentHash ?? '',
        riskFlags: record.riskFlags,
        claimCandidateCount: claimCandidates.length,
        classification: {
          ...classification,
          status: record.status as LibraryAnalysisInventoryRow['classification']['status'],
          usageRule: record.usageRule as LibraryAnalysisInventoryRow['classification']['usageRule'],
          reviewRequired: record.reviewStatus === 'queued' || record.status === 'review_required',
        },
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
