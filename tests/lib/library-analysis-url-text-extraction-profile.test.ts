import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisUrlTextExtractionTargets,
  buildLibraryAnalysisUrlTextExtractionProfile,
  formatLibraryAnalysisUrlTextExtractionProfileMarkdown,
  type LibraryAnalysisUrlTextExtractionProfileInput,
} from '../../src/lib/library-analysis-url-text-extraction-profile'

const inputs: LibraryAnalysisUrlTextExtractionProfileInput[] = [
  {
    sourceKey: 'document:large-pdf',
    documentId: 'doc-large-pdf',
    title: 'Large PDF',
    repairBatch: 'missing_document_locator_search',
    url: 'https://example.org/large.pdf',
    finalUrl: 'https://example.org/large.pdf',
    existingWordCount: 52,
    fetchStatus: 'ok',
    httpStatus: 200,
    contentType: 'application/pdf',
    contentKind: 'pdf',
    extractionMethod: 'pdf_pdftotext',
    byteLength: 120_000,
    extractedWordCount: 640,
    extractedContentHash: 'hash-large',
    error: null,
  },
  {
    sourceKey: 'document:small-html',
    documentId: 'doc-small-html',
    title: 'Small HTML',
    repairBatch: 'missing_document_locator_search',
    url: 'https://example.org/small',
    finalUrl: 'https://example.org/small',
    existingWordCount: 44,
    fetchStatus: 'ok',
    httpStatus: 200,
    contentType: 'text/html',
    contentKind: 'html',
    extractionMethod: 'html_text',
    byteLength: 20_000,
    extractedWordCount: 86,
    extractedContentHash: 'hash-small',
    error: null,
  },
  {
    sourceKey: 'document:http-error',
    documentId: 'doc-http-error',
    title: 'HTTP error',
    repairBatch: 'missing_sourcedoc_locator',
    url: 'https://example.org/missing.pdf',
    finalUrl: 'https://example.org/missing.pdf',
    existingWordCount: 55,
    fetchStatus: 'http_error',
    httpStatus: 404,
    contentType: null,
    contentKind: 'unknown',
    extractionMethod: 'none',
    byteLength: 0,
    extractedWordCount: 0,
    extractedContentHash: null,
    error: 'HTTP 404',
  },
  {
    sourceKey: 'document:docx',
    documentId: 'doc-docx',
    title: 'Unsupported DOCX',
    repairBatch: 'missing_sourcedoc_locator',
    url: 'https://example.org/file.docx',
    finalUrl: 'https://example.org/file.docx',
    existingWordCount: 55,
    fetchStatus: 'ok',
    httpStatus: 200,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    contentKind: 'unsupported',
    extractionMethod: 'none',
    byteLength: 18_000,
    extractedWordCount: 0,
    extractedContentHash: null,
    error: null,
  },
]

describe('library analysis URL text extraction profile', () => {
  it('selects both missing-locator URL rows and existing low-text rows with deterministic URL priority', () => {
    const targets = buildLibraryAnalysisUrlTextExtractionTargets({
      locatorRows: [
        {
          sourceKey: 'document:missing-url-backed',
          documentId: 'doc-missing',
          title: 'Missing URL-backed',
          repairBatch: 'missing_document_locator_search',
          locatorStatus: 'url_backed_no_local_file',
          documentUrl: null,
          documentArchivedUrl: null,
          sourceDocUrl: 'https://example.org/source-doc',
          sourceDocDoi: '10.1234/example',
          sourceDocArchivedUrl: null,
        },
        {
          sourceKey: 'document:missing-manual',
          documentId: 'doc-manual',
          title: 'Manual missing',
          repairBatch: 'missing_document_locator_search',
          locatorStatus: 'locator_missing',
          documentUrl: 'https://example.org/manual',
          documentArchivedUrl: null,
          sourceDocUrl: null,
          sourceDocDoi: null,
          sourceDocArchivedUrl: null,
        },
      ],
      backlogRows: [
        {
          sourceKey: 'document:existing-low-text',
          documentId: 'doc-existing',
          title: 'Existing low text',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
        },
        {
          sourceKey: 'document:existing-without-url',
          documentId: 'doc-without-url',
          title: 'Existing without URL',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
        },
        {
          sourceKey: 'document:loose-file',
          documentId: 'doc-loose',
          title: 'Loose file',
          repairKind: 'loose_library_file',
          repairBatch: 'loose_markdown_import_review',
        },
      ],
      documents: [
        {
          id: 'doc-missing',
          wordCount: 57,
          url: null,
          archivedUrl: null,
          sourceDoc: null,
          sourceCitations: [],
        },
        {
          id: 'doc-existing',
          wordCount: 121,
          url: null,
          archivedUrl: null,
          sourceDoc: {
            url: null,
            doi: 'https://doi.org/10.4321/low-text',
            archivedUrl: null,
          },
          sourceCitations: [
            {
              url: 'https://example.org/citation',
              archivedUrl: 'https://web.archive.org/citation',
            },
          ],
        },
        {
          id: 'doc-without-url',
          wordCount: 119,
          url: null,
          archivedUrl: null,
          sourceDoc: null,
          sourceCitations: [],
        },
        {
          id: 'doc-loose',
          wordCount: 80,
          url: 'https://example.org/loose',
          archivedUrl: null,
          sourceDoc: null,
          sourceCitations: [],
        },
      ],
    })

    assert.deepEqual(targets.map(target => target.sourceKey), [
      'document:missing-url-backed',
      'document:existing-low-text',
    ])
    assert.equal(targets[0].url, 'https://example.org/source-doc')
    assert.equal(targets[0].existingWordCount, 57)
    assert.equal(targets[1].url, 'https://doi.org/10.4321/low-text')
    assert.equal(targets[1].existingWordCount, 121)
  })

  it('deduplicates URL extraction targets and applies limits after selection', () => {
    const targets = buildLibraryAnalysisUrlTextExtractionTargets({
      locatorRows: [
        {
          sourceKey: 'document:shared',
          documentId: 'doc-shared',
          title: 'Shared from locator',
          repairBatch: 'missing_document_locator_search',
          locatorStatus: 'url_backed_no_local_file',
          documentUrl: 'https://example.org/locator',
          documentArchivedUrl: null,
          sourceDocUrl: null,
          sourceDocDoi: null,
          sourceDocArchivedUrl: null,
        },
      ],
      backlogRows: [
        {
          sourceKey: 'document:shared',
          documentId: 'doc-shared',
          title: 'Shared from backlog',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
        },
        {
          sourceKey: 'document:second',
          documentId: 'doc-second',
          title: 'Second low text',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
        },
      ],
      documents: [
        {
          id: 'doc-shared',
          wordCount: 88,
          url: 'https://example.org/document',
          archivedUrl: null,
          sourceDoc: null,
          sourceCitations: [],
        },
        {
          id: 'doc-second',
          wordCount: 91,
          url: 'https://example.org/second',
          archivedUrl: null,
          sourceDoc: null,
          sourceCitations: [],
        },
      ],
      limit: 1,
    })

    assert.deepEqual(targets.map(target => target.sourceKey), ['document:shared'])
    assert.equal(targets[0].title, 'Shared from locator')
    assert.equal(targets[0].url, 'https://example.org/locator')
  })

  it('classifies fetched URL text by extractability and repair value', () => {
    const profile = buildLibraryAnalysisUrlTextExtractionProfile(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(profile.total, 4)
    assert.deepEqual(profile.summary.byStatus, {
      extractable_500_plus: 1,
      http_error: 1,
      small_text: 1,
      unsupported_content_type: 1,
    })
    assert.deepEqual(profile.summary.byContentKind, {
      html: 1,
      pdf: 1,
      unknown: 1,
      unsupported: 1,
    })
    assert.equal(profile.summary.extractableRows, 1)
    assert.equal(profile.summary.mechanicalRepairCandidates, 1)
    assert.equal(profile.summary.totalExtractedWords, 726)

    const large = profile.rows.find(row => row.sourceKey === 'document:large-pdf')
    assert.equal(large?.status, 'extractable_500_plus')
    assert.equal(large?.wordGain, 588)
    assert.match(large?.recommendedAction ?? '', /repair plan/)

    const unsupported = profile.rows.find(row => row.sourceKey === 'document:docx')
    assert.equal(unsupported?.status, 'unsupported_content_type')
    assert.match(unsupported?.recommendedAction ?? '', /dedicated extractor/)
  })

  it('formats a guarded markdown extraction profile', () => {
    const profile = buildLibraryAnalysisUrlTextExtractionProfile(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisUrlTextExtractionProfileMarkdown(profile, {
      jsonPath: 'research/_status/library-analysis-url-text-extraction-profile.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis URL Text Extraction Profile/m)
    assert.match(markdown, /read-only/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 4/)
    assert.match(markdown, /Extractable rows \| 1/)
    assert.match(markdown, /Mechanical repair candidates \| 1/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
  })
})
