import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisRepairBacklog,
  formatLibraryAnalysisRepairBacklogMarkdown,
  resolveLibraryAnalysisRepairPathFacts,
  summarizeLibraryAnalysisRecordDistribution,
  type LibraryAnalysisRepairBacklogInput,
} from '../../src/lib/library-analysis-repair-backlog'

const records: LibraryAnalysisRepairBacklogInput[] = [
  {
    sourceKind: 'document',
    sourceKey: 'document:stale-path',
    title: 'Stale imported PDF',
    canonicalPath: 'research/evidence-pack/missing.pdf',
    documentId: 'doc-stale',
    sourceDocId: null,
    wordCount: 52,
    riskFlags: ['low_text_quality'],
    citationReadiness: null,
    pathState: 'path_missing_on_disk',
    pathResolution: 'missing',
    resolvedPath: null,
    extension: '.pdf',
    sizeBucket: 'missing',
    sourceDocFilename: null,
    sourceDocType: null,
    hasCitationLocalPath: false,
    hasCitationUrl: false,
  },
  {
    sourceKind: 'document',
    sourceKey: 'document:no-path',
    title: 'Linked SourceDoc without path',
    canonicalPath: null,
    documentId: 'doc-no-path',
    sourceDocId: 'src-1',
    wordCount: 56,
    riskFlags: ['low_text_quality', 'missing_file_path'],
    citationReadiness: null,
    pathState: 'no_path',
    pathResolution: 'none',
    resolvedPath: null,
    extension: 'none',
    sizeBucket: 'none',
    sourceDocFilename: 'source.pdf',
    sourceDocType: 'rapport',
    hasCitationLocalPath: false,
    hasCitationUrl: false,
  },
  {
    sourceKind: 'document',
    sourceKey: 'document:url-backed',
    title: 'URL backed low-text report',
    canonicalPath: null,
    documentId: 'doc-url-backed',
    sourceDocId: null,
    wordCount: 93,
    riskFlags: ['low_text_quality', 'missing_file_path'],
    citationReadiness: null,
    pathState: 'no_path',
    pathResolution: 'none',
    resolvedPath: null,
    extension: 'none',
    sizeBucket: 'none',
    sourceDocFilename: null,
    sourceDocType: null,
    hasCitationLocalPath: false,
    hasCitationUrl: false,
    documentUrl: 'https://example.org/report',
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    provenanceType: null,
    generatedFrom: null,
  },
  {
    sourceKind: 'document',
    sourceKey: 'document:seeded-stub',
    title: 'Seeded internal synthesis stub',
    canonicalPath: null,
    documentId: 'doc-seeded-stub',
    sourceDocId: null,
    wordCount: 91,
    riskFlags: ['low_text_quality', 'missing_file_path'],
    citationReadiness: null,
    pathState: 'no_path',
    pathResolution: 'none',
    resolvedPath: null,
    extension: 'none',
    sizeBucket: 'none',
    sourceDocFilename: null,
    sourceDocType: null,
    hasCitationLocalPath: false,
    hasCitationUrl: false,
    documentUrl: null,
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    provenanceType: 'internal_synthesis',
    generatedFrom: 'prisma/seed-data/reports.ts',
  },
  {
    sourceKind: 'document',
    sourceKey: 'document:seeded-url-backed',
    title: 'Seeded external report with URL',
    canonicalPath: null,
    documentId: 'doc-seeded-url-backed',
    sourceDocId: null,
    wordCount: 136,
    riskFlags: ['low_text_quality', 'missing_file_path'],
    citationReadiness: null,
    pathState: 'no_path',
    pathResolution: 'none',
    resolvedPath: null,
    extension: 'none',
    sizeBucket: 'none',
    sourceDocFilename: null,
    sourceDocType: null,
    hasCitationLocalPath: false,
    hasCitationUrl: false,
    documentUrl: 'https://example.org/seeded-external-report',
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    provenanceType: 'external_report',
    generatedFrom: 'prisma/seed-data/reports.ts',
  },
  {
    sourceKind: 'document',
    sourceKey: 'document:existing-low-text',
    title: 'Existing low-text strategy PDF',
    canonicalPath: '2026 TRANSITION GROUP OVERVIEW WORKING DOC.pdf',
    documentId: 'doc-existing',
    sourceDocId: 'src-2',
    wordCount: 38,
    riskFlags: ['low_text_quality'],
    citationReadiness: null,
    pathState: 'path_exists',
    pathResolution: 'direct',
    resolvedPath: '2026 TRANSITION GROUP OVERVIEW WORKING DOC.pdf',
    extension: '.pdf',
    sizeBucket: '16KB-256KB',
    sourceDocFilename: 'working-doc.pdf',
    sourceDocType: 'arbeidsdok',
    hasCitationLocalPath: false,
    hasCitationUrl: false,
  },
  {
    sourceKind: 'library_file',
    sourceKey: 'library_file:research/bibliotek/tiny-note.md',
    title: 'Tiny loose note',
    canonicalPath: 'research/bibliotek/tiny-note.md',
    documentId: null,
    sourceDocId: null,
    wordCount: 12,
    riskFlags: ['low_text_quality', 'orphan_source'],
    citationReadiness: null,
    pathState: 'path_exists',
    pathResolution: 'direct',
    resolvedPath: 'research/bibliotek/tiny-note.md',
    extension: '.md',
    sizeBucket: '1B-1KB',
    sourceDocFilename: null,
    sourceDocType: null,
    hasCitationLocalPath: false,
    hasCitationUrl: false,
  },
]

describe('library analysis repair backlog', () => {
  it('resolves repair paths through the repo local-file locator candidates', () => {
    const facts = resolveLibraryAnalysisRepairPathFacts('bibliotek/a/report.md', {
      root: '/repo',
      fileExists: path => path === '/repo/research/bibliotek/a/report.md',
      fileSize: () => 2048,
    })

    assert.deepEqual(facts, {
      pathState: 'path_exists',
      pathResolution: 'research_prefix',
      resolvedPath: 'research/bibliotek/a/report.md',
      extension: '.md',
      sizeBucket: '1KB-16KB',
    })
  })

  it('summarizes the full LibraryAnalysisRecord distribution separately from repair rows', () => {
    const distribution = summarizeLibraryAnalysisRecordDistribution([
      {
        status: 'approved_internal',
        usageRule: 'safe_for_ai_context',
        sourceKind: 'document',
        riskFlags: [],
        canonicalPath: 'research/bibliotek/a.md',
        documentId: 'doc-1',
        sourceDocId: 'src-1',
      },
      {
        status: 'review_required',
        usageRule: 'internal_background',
        sourceKind: 'library_file',
        riskFlags: ['low_text_quality', 'orphan_source'],
        canonicalPath: 'research/bibliotek/tiny-note.md',
        documentId: null,
        sourceDocId: null,
      },
    ])

    assert.deepEqual(distribution, {
      total: 2,
      byStatus: {
        approved_internal: 1,
        review_required: 1,
      },
      byUsageRule: {
        internal_background: 1,
        safe_for_ai_context: 1,
      },
      bySourceKind: {
        document: 1,
        library_file: 1,
      },
      byRiskFlag: {
        low_text_quality: 1,
        orphan_source: 1,
      },
      byLinkMatrix: {
        'doc:false|sourceDoc:false|path:true': 1,
        'doc:true|sourceDoc:true|path:true': 1,
      },
    })
  })

  it('classifies missing-text records into mechanical repair groups', () => {
    const backlog = buildLibraryAnalysisRepairBacklog(records)

    assert.equal(backlog.total, 7)
    assert.deepEqual(backlog.summary.byRepairKind, {
      existing_low_text: 1,
      loose_library_file: 1,
      missing_document_locator: 1,
      seeded_report_stub: 1,
      stale_document_locator: 1,
      url_backed_low_text: 2,
    })
    assert.deepEqual(backlog.summary.byRepairBatch, {
      missing_sourcedoc_locator: 1,
      pdf_text_extraction: 1,
      loose_markdown_import_review: 1,
      seeded_internal_synthesis_review: 1,
      stale_document_locator_remap: 1,
      url_backed_text_extraction: 2,
    })
    assert.deepEqual(backlog.summary.bySourceKind, {
      document: 6,
      library_file: 1,
    })

    const stale = backlog.rows.find(row => row.sourceKey === 'document:stale-path')
    assert.equal(stale?.repairKind, 'stale_document_locator')
    assert.equal(stale?.repairBatch, 'stale_document_locator_remap')
    assert.equal(stale?.repairLane, 'mekanisk tekst-/koblingsreparasjon')
    assert.equal(stale?.priority, 'P1')
    assert.match(stale?.recommendedAction ?? '', /Remapp/)

    const noPath = backlog.rows.find(row => row.sourceKey === 'document:no-path')
    assert.equal(noPath?.repairKind, 'missing_document_locator')
    assert.equal(noPath?.repairBatch, 'missing_sourcedoc_locator')
    assert.equal(noPath?.priority, 'P1')
    assert.match(noPath?.recommendedAction ?? '', /SourceDoc/)

    const urlBacked = backlog.rows.find(row => row.sourceKey === 'document:url-backed')
    assert.equal(urlBacked?.repairKind, 'url_backed_low_text')
    assert.equal(urlBacked?.repairBatch, 'url_backed_text_extraction')
    assert.equal(urlBacked?.priority, 'P2')
    assert.match(urlBacked?.recommendedAction ?? '', /URL/)

    const seededStub = backlog.rows.find(row => row.sourceKey === 'document:seeded-stub')
    assert.equal(seededStub?.repairKind, 'seeded_report_stub')
    assert.equal(seededStub?.repairBatch, 'seeded_internal_synthesis_review')
    assert.equal(seededStub?.priority, 'P2')
    assert.match(seededStub?.recommendedAction ?? '', /seedet/)

    const seededUrlBacked = backlog.rows.find(row => row.sourceKey === 'document:seeded-url-backed')
    assert.equal(seededUrlBacked?.repairKind, 'url_backed_low_text')
    assert.equal(seededUrlBacked?.repairBatch, 'url_backed_text_extraction')

    const existing = backlog.rows.find(row => row.sourceKey === 'document:existing-low-text')
    assert.equal(existing?.repairKind, 'existing_low_text')
    assert.equal(existing?.repairBatch, 'pdf_text_extraction')
    assert.match(existing?.recommendedAction ?? '', /tekstuttrekk/)

    const loose = backlog.rows.find(row => row.sourceKey === 'library_file:research/bibliotek/tiny-note.md')
    assert.equal(loose?.repairKind, 'loose_library_file')
    assert.equal(loose?.repairBatch, 'loose_markdown_import_review')
    assert.equal(loose?.priority, 'P2')
    assert.match(loose?.recommendedAction ?? '', /importeres/)
  })

  it('separates existing low-text local files by practical disposition', () => {
    const backlog = buildLibraryAnalysisRepairBacklog([
      {
        sourceKind: 'document',
        sourceKey: 'document:control-artifact',
        title: 'Blocked Promotion Worklist',
        canonicalPath: 'research/intake/batch/BLOCKED-PROMOTION-WORKLIST.md',
        documentId: 'doc-control',
        sourceDocId: null,
        wordCount: 145,
        riskFlags: ['low_text_quality'],
        citationReadiness: null,
        pathState: 'path_exists',
        pathResolution: 'direct',
        resolvedPath: 'research/intake/batch/BLOCKED-PROMOTION-WORKLIST.md',
        extension: '.md',
        sizeBucket: '1B-1KB',
        sourceDocFilename: null,
        sourceDocType: null,
        hasCitationLocalPath: false,
        hasCitationUrl: false,
      },
      {
        sourceKind: 'document',
        sourceKey: 'document:transcript-fragment',
        title: 'Short transcript fragment',
        canonicalPath: 'research/landbrukarena_transcripts/short.txt',
        documentId: 'doc-transcript',
        sourceDocId: null,
        wordCount: 20,
        riskFlags: ['low_text_quality'],
        citationReadiness: null,
        pathState: 'path_exists',
        pathResolution: 'direct',
        resolvedPath: 'research/landbrukarena_transcripts/short.txt',
        extension: '.txt',
        sizeBucket: '1B-1KB',
        sourceDocFilename: null,
        sourceDocType: null,
        hasCitationLocalPath: false,
        hasCitationUrl: false,
      },
      {
        sourceKind: 'document',
        sourceKey: 'document:source-locator-stub',
        title: 'Annual report source locator',
        canonicalPath: 'research/evidence-pack/source.md',
        documentId: 'doc-source-stub',
        sourceDocId: null,
        wordCount: 8,
        riskFlags: ['low_text_quality'],
        citationReadiness: null,
        pathState: 'path_exists',
        pathResolution: 'direct',
        resolvedPath: 'research/evidence-pack/source.md',
        extension: '.md',
        sizeBucket: '1B-1KB',
        sourceDocFilename: null,
        sourceDocType: null,
        hasCitationLocalPath: false,
        hasCitationUrl: false,
      },
      {
        sourceKind: 'document',
        sourceKey: 'document:short-summary',
        title: 'Curated short summary',
        canonicalPath: 'research/bibliotek/summary.md',
        documentId: 'doc-summary',
        sourceDocId: null,
        wordCount: 132,
        riskFlags: ['low_text_quality'],
        citationReadiness: null,
        pathState: 'path_exists',
        pathResolution: 'direct',
        resolvedPath: 'research/bibliotek/summary.md',
        extension: '.md',
        sizeBucket: '1KB-16KB',
        sourceDocFilename: null,
        sourceDocType: null,
        hasCitationLocalPath: false,
        hasCitationUrl: false,
      },
    ])

    assert.deepEqual(backlog.summary.byRepairBatch, {
      existing_control_artifact_review: 1,
      existing_short_summary_review: 1,
      existing_source_locator_stub_review: 1,
      existing_transcript_fragment_review: 1,
    })
    assert.match(
      backlog.rows.find(row => row.sourceKey === 'document:control-artifact')?.recommendedAction ?? '',
      /kontroll/,
    )
    assert.match(
      backlog.rows.find(row => row.sourceKey === 'document:transcript-fragment')?.recommendedAction ?? '',
      /transkripsjonsfragment/,
    )
    assert.match(
      backlog.rows.find(row => row.sourceKey === 'document:source-locator-stub')?.recommendedAction ?? '',
      /lenke-stubben/,
    )
  })

  it('formats a guarded markdown backlog with full JSON handoff', () => {
    const backlog = buildLibraryAnalysisRepairBacklog(records)
    const markdown = formatLibraryAnalysisRepairBacklogMarkdown(backlog, {
      generatedAt: '2026-06-18T12:00:00.000Z',
      jsonPath: 'research/_status/library-analysis-repair-backlog.json',
      sampleLimit: 2,
      recordDistribution: summarizeLibraryAnalysisRecordDistribution([
        {
          status: 'approved_internal',
          usageRule: 'safe_for_ai_context',
          sourceKind: 'document',
          riskFlags: [],
          canonicalPath: 'research/bibliotek/a.md',
          documentId: 'doc-1',
          sourceDocId: 'src-1',
        },
      ]),
    })

    assert.match(markdown, /^# Library Analysis Repair Backlog/m)
    assert.match(markdown, /LibraryAnalysisRecord Snapshot/)
    assert.match(markdown, /approved_internal/)
    assert.match(markdown, /doc:true\\\|sourceDoc:true\\\|path:true/)
    assert.match(markdown, /Mekanisk tekst-\/koblingsreparasjon/)
    assert.match(markdown, /Intern AI-kontekst/)
    assert.match(markdown, /Claim-kandidater/)
    assert.match(markdown, /Ekstern publiserbar bruk/)
    assert.match(markdown, /Full radliste: `research\/_status\/library-analysis-repair-backlog.json`/)
    assert.match(markdown, /Rows shown below: 2 of 7/)
  })
})
