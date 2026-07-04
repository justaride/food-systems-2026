import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisInventory,
  formatLibraryAnalysisLedgerJsonl,
  formatLibraryAnalysisSummaryMarkdown,
  type LibraryInventoryDocument,
  type LibraryInventoryFile,
  type LibraryInventorySourceDoc,
} from '../../src/lib/library-analysis-inventory'

const documents: LibraryInventoryDocument[] = [
  {
    id: 'doc-1',
    slug: 'doc-one',
    title: 'Imported report',
    filePath: 'research/bibliotek/a/report.md',
    content: 'This is a substantial imported report with enough words for a stable text hash.',
    summary: 'Imported report summary.',
    wordCount: 750,
    sourceDoc: { id: 'src-1' },
    report: { id: 'report-1' },
    thesis: null,
    sourceCitations: [{ citationReadiness: 'citable_external' }],
  },
]

const sourceDocs: LibraryInventorySourceDoc[] = [
  {
    id: 'src-1',
    filename: 'report.md',
    title: 'Already linked source',
    description: 'Covered through Document.',
    documentId: 'doc-1',
  },
  {
    id: 'src-2',
    filename: 'orphan.pdf',
    title: 'Unlinked source',
    description: 'No linked Document row yet.',
    documentId: null,
  },
]

const libraryFiles: LibraryInventoryFile[] = [
  {
    path: 'research/bibliotek/a/report.md',
    title: 'Duplicate local file',
    content: 'Already imported.',
  },
  {
    path: 'research/bibliotek/b/loose-note.md',
    title: 'Loose note',
    content: 'Tiny note',
  },
]

describe('library analysis inventory', () => {
  it('builds one canonical row per source with stable keys and content hashes', () => {
    const inventory = buildLibraryAnalysisInventory({
      documents,
      sourceDocs,
      reports: [{ id: 'report-1', title: 'Covered report', documentId: 'doc-1' }],
      theses: [{ id: 'thesis-1', title: 'Unlinked thesis', documentId: null, synthesis: 'Thesis synthesis' }],
      libraryFiles,
    })

    assert.deepEqual(inventory.map(row => row.sourceKey), [
      'document:doc-1',
      'library_file:research/bibliotek/b/loose-note.md',
      'source_doc:src-2',
      'thesis:thesis-1',
    ])

    const document = inventory.find(row => row.sourceKey === 'document:doc-1')
    assert.equal(document?.linkedDocumentId, 'doc-1')
    assert.equal(document?.linkedSourceDocId, 'src-1')
    assert.equal(document?.linkedReportId, 'report-1')
    assert.equal(document?.citationReadiness, 'citable_external')
    assert.match(document?.contentHash ?? '', /^[a-f0-9]{64}$/)

    const looseFile = inventory.find(row => row.sourceKind === 'library_file')
    assert.equal(looseFile?.hasDbLink, false)
    assert.equal(looseFile?.hasLocalFile, true)
    assert.equal(looseFile?.classification.status, 'review_required')
    assert.ok(looseFile?.classification.reasons.includes('low_text_quality'))
  })

  it('keeps substantial loose library files as internal background without DB import review', () => {
    const [row] = buildLibraryAnalysisInventory({
      documents: [],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [{
        path: 'research/bibliotek/loose-substantial.md',
        title: 'Loose substantial note',
        content: 'Dette er et substansielt lokalt biblioteksnotat med nok tekst til intern bakgrunn. '.repeat(30),
      }],
    })

    assert.equal(row?.classification.status, 'ai_draft')
    assert.equal(row?.classification.usageRule, 'internal_background')
    assert.equal(row?.classification.reviewRequired, false)
    assert.deepEqual(row?.classification.reasons, ['loose_library_file'])
    assert.deepEqual(row?.riskFlags, ['loose_library_file'])
  })

  it('formats JSONL ledger rows and compact markdown summaries', () => {
    const inventory = buildLibraryAnalysisInventory({
      documents,
      sourceDocs,
      reports: [],
      theses: [],
      libraryFiles,
    })

    const jsonl = formatLibraryAnalysisLedgerJsonl(inventory)
    const lines = jsonl.trim().split('\n')
    assert.equal(lines.length, 3)
    assert.deepEqual(JSON.parse(lines[0]!), {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      title: 'Imported report',
      canonicalPath: 'research/bibliotek/a/report.md',
      status: 'approved_internal',
      usageRule: 'safe_for_ai_context',
      reviewRequired: false,
      riskFlags: [],
      claimCandidateCount: 0,
      contentHash: inventory[0]?.contentHash,
      linkedDocumentId: 'doc-1',
      linkedSourceDocId: 'src-1',
      linkedReportId: 'report-1',
      linkedThesisId: null,
      citationReadiness: 'citable_external',
    })

    const markdown = formatLibraryAnalysisSummaryMarkdown(inventory)
    assert.match(markdown, /^# Library Analysis Summary/m)
    assert.match(markdown, /Total sources \| 3/)
    assert.match(markdown, /Review queue \| 2/)
    assert.match(markdown, /Missing text \| 2/)
  })

  it('keeps documents with unresolved local file paths in review even when filePath is populated', () => {
    const [row] = buildLibraryAnalysisInventory({
      documents: [{
        id: 'doc-stale',
        slug: 'stale',
        title: 'Stale but Citable',
        filePath: 'research/missing.pdf',
        hasLocalFile: false,
        content: 'Dette er et langt nok dokumentgrunnlag til at bare tekstlengde ikke skal blokkere. '.repeat(8),
        summary: null,
        wordCount: 120,
        sourceCitations: [{ citationReadiness: 'citable_external' }],
      }],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [],
    })

    assert.equal(row?.hasLocalFile, false)
    assert.equal(row?.classification.status, 'review_required')
    assert.equal(row?.classification.usageRule, 'internal_background')
    assert.ok(row?.classification.reasons.includes('missing_file_path'))
    assert.ok(row?.riskFlags.includes('missing_file_path'))
  })

  it('keeps URL-backed documents with enough DB text out of local-file repair review', () => {
    const [row] = buildLibraryAnalysisInventory({
      documents: [{
        id: 'doc-url-backed',
        slug: 'url-backed',
        title: 'URL-backed substantial report',
        filePath: null,
        hasLocalFile: false,
        url: 'https://example.org/report.pdf',
        content: 'Dette dokumentet har substansiell tekst i DB og en ekstern locator. '.repeat(30),
        summary: null,
        wordCount: 240,
        sourceCitations: [],
      }],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [],
    })

    assert.equal(row?.classification.status, 'ai_draft')
    assert.equal(row?.classification.usageRule, 'internal_background')
    assert.equal(row?.classification.reviewRequired, false)
    assert.deepEqual(row?.classification.reasons, ['url_backed_internal_context'])
    assert.deepEqual(row?.riskFlags, ['url_backed_internal_context'])
  })

  it('marks seeded blocked-source documents as blocked instead of low-text repair candidates', () => {
    const [row] = buildLibraryAnalysisInventory({
      documents: [{
        id: 'doc-blocked',
        slug: 'blocked',
        title: 'Bondens andel av forbrukerkronen 2025',
        filePath: null,
        hasLocalFile: false,
        content: 'BLOKKERT - lokal fil er HTML-landingsside, ikke ekte PDF.',
        summary: null,
        wordCount: 11,
        sourceCitations: [],
        metadata: {
          generatedFrom: 'prisma/seed-data/reports.ts',
          provenanceType: 'blocked_source',
        },
      }],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [],
    })

    assert.equal(row?.classification.status, 'blocked')
    assert.equal(row?.classification.usageRule, 'do_not_use_for_claims')
    assert.equal(row?.classification.reviewRequired, false)
    assert.deepEqual(row?.classification.reasons, ['blocked_source'])
    assert.deepEqual(row?.riskFlags, ['blocked_source'])
  })

  it('keeps curated short-summary documents as internal background without repair review', () => {
    const [row] = buildLibraryAnalysisInventory({
      documents: [{
        id: 'doc-short-summary',
        slug: 'short-summary',
        title: 'Reviewed short summary',
        filePath: 'research/bibliotek/short-summary.md',
        hasLocalFile: true,
        content: 'Kort kontrollert sammendrag som er nyttig for intern gjenfinning.',
        summary: null,
        wordCount: 80,
        sourceCitations: [],
        metadata: {
          libraryAnalysisDisposition: 'curated_short_summary',
        },
      }],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [],
    })

    assert.equal(row?.classification.status, 'ai_draft')
    assert.equal(row?.classification.usageRule, 'internal_background')
    assert.equal(row?.classification.reviewRequired, false)
    assert.deepEqual(row?.classification.reasons, ['curated_short_summary'])
    assert.deepEqual(row?.riskFlags, ['curated_short_summary'])
  })

  it('excludes control artifacts from document inventory', () => {
    const inventory = buildLibraryAnalysisInventory({
      documents: [
        {
          id: 'doc-control',
          slug: 'control',
          title: 'Blocked Promotion Worklist',
          filePath: 'research/intake/food-research-process-2026-04-20/BLOCKED-PROMOTION-WORKLIST.md',
          hasLocalFile: true,
          content: 'Teknisk kontrollartefakt for importflyt, ikke en kilde i biblioteket.',
          summary: null,
          wordCount: 145,
          sourceCitations: [],
        },
        {
          id: 'doc-plan',
          slug: 'plan',
          title: 'Orphan review',
          filePath: '_plans/ORPHAN-REVIEW.md',
          hasLocalFile: true,
          content: 'Kontrollplan for opprydding, ikke bibliotekskilde.',
          summary: null,
          wordCount: 113,
          sourceCitations: [],
        },
        {
          id: 'doc-data-readme',
          slug: 'data-readme',
          title: 'Nordic prices v1',
          filePath: 'data/nordic/prices/README.md',
          hasLocalFile: true,
          content: 'README for datapakke, ikke selvstendig kilde.',
          summary: null,
          wordCount: 142,
          sourceCitations: [],
        },
        {
          id: 'doc-data-source',
          slug: 'data-source',
          title: 'Faktaark: Eurostat Prisnivåer 2024/2025',
          filePath: 'data/eurostat/price-levels-2024.md',
          hasLocalFile: true,
          content: 'Dette er et datakilde-faktaark med materiell analyseverdi. '.repeat(30),
          summary: null,
          wordCount: 1818,
          sourceCitations: [{ citationReadiness: 'citable_with_note' }],
        },
        {
          id: 'doc-source',
          slug: 'source',
          title: 'Actual source summary',
          filePath: 'research/bibliotek/source.md',
          hasLocalFile: true,
          content: 'Dette er en faktisk bibliotekkilde med nok tekst til analyse. '.repeat(20),
          summary: null,
          wordCount: 180,
          sourceCitations: [{ citationReadiness: 'citable_with_note' }],
        },
      ],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [],
    })

    assert.deepEqual(inventory.map(row => row.sourceKey), [
      'document:doc-data-source',
      'document:doc-source',
    ])
  })

  it('deduplicates research library files already imported through normalized Document file paths', () => {
    const inventory = buildLibraryAnalysisInventory({
      documents: [{
        id: 'doc-alias',
        slug: 'alias',
        title: 'Imported via normalized path',
        filePath: 'bibliotek/akademia/masteroppgaver/source.md',
        hasLocalFile: true,
        content: 'Dette dokumentet er allerede importert fra research-biblioteket. '.repeat(20),
        summary: null,
        wordCount: 180,
        sourceCitations: [{ citationReadiness: 'citable_with_note' }],
      }],
      sourceDocs: [],
      reports: [],
      theses: [],
      libraryFiles: [
        {
          path: 'research/bibliotek/akademia/masteroppgaver/source.md',
          title: 'Duplicate research-prefixed file',
          content: 'Skal ikke bli egen library_file-rad.',
        },
        {
          path: 'research/bibliotek/akademia/masteroppgaver/loose.md',
          title: 'Actual loose file',
          content: 'Denne finnes bare paa disk.',
        },
      ],
    })

    assert.deepEqual(inventory.map(row => row.sourceKey), [
      'document:doc-alias',
      'library_file:research/bibliotek/akademia/masteroppgaver/loose.md',
    ])
  })
})
