import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisUrlTextRepairPlan,
  formatLibraryAnalysisUrlTextRepairPlanMarkdown,
  type LibraryAnalysisUrlTextRepairInput,
} from '../../src/lib/library-analysis-url-text-repair'

const inputs: LibraryAnalysisUrlTextRepairInput[] = [
  {
    sourceKey: 'document:update-pdf',
    documentId: 'doc-update-pdf',
    existingUpdatedAt: '2026-06-18T11:00:00.000Z',
    title: 'URL PDF',
    repairBatch: 'missing_document_locator_search',
    url: 'https://example.org/source.pdf',
    finalUrl: 'https://example.org/source.pdf',
    existingContent: 'PDF metadata stub.',
    existingWordCount: 3,
    extractedText: 'mat '.repeat(620),
    extractedWordCount: 620,
    extractionStatus: 'extractable_500_plus',
    contentKind: 'pdf',
    extractionMethod: 'pdf_pdftotext',
  },
  {
    sourceKey: 'document:update-html',
    documentId: 'doc-update-html',
    existingUpdatedAt: '2026-06-18T11:01:00.000Z',
    title: 'URL HTML',
    repairBatch: 'missing_sourcedoc_locator',
    url: 'https://example.org/article',
    finalUrl: 'https://example.org/article?canonical=1',
    existingContent: 'HTML metadata stub.',
    existingWordCount: 3,
    extractedText: 'ord '.repeat(180),
    extractedWordCount: 180,
    extractionStatus: 'extractable_150_499',
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
  {
    sourceKey: 'document:no-document',
    documentId: null,
    existingUpdatedAt: null,
    title: 'No document target',
    repairBatch: 'missing_document_locator_search',
    url: 'https://example.org/no-document',
    finalUrl: 'https://example.org/no-document',
    existingContent: '',
    existingWordCount: 0,
    extractedText: 'ord '.repeat(250),
    extractedWordCount: 250,
    extractionStatus: 'extractable_150_499',
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
  {
    sourceKey: 'document:not-extractable',
    documentId: 'doc-not-extractable',
    existingUpdatedAt: '2026-06-18T11:02:00.000Z',
    title: 'HTTP error',
    repairBatch: 'missing_sourcedoc_locator',
    url: 'https://example.org/missing',
    finalUrl: 'https://example.org/missing',
    existingContent: 'HTTP error stub.',
    existingWordCount: 3,
    extractedText: '',
    extractedWordCount: 0,
    extractionStatus: 'http_error',
    contentKind: 'unknown',
    extractionMethod: 'none',
  },
  {
    sourceKey: 'document:no-gain',
    documentId: 'doc-no-gain',
    existingUpdatedAt: '2026-06-18T11:03:00.000Z',
    title: 'Existing richer content',
    repairBatch: 'missing_document_locator_search',
    url: 'https://example.org/rich',
    finalUrl: 'https://example.org/rich',
    existingContent: 'rik '.repeat(260),
    existingWordCount: 260,
    extractedText: 'rik '.repeat(180),
    extractedWordCount: 180,
    extractionStatus: 'extractable_150_499',
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
]

describe('library analysis URL text repair', () => {
  it('plans conservative document content updates from refetched URL text', () => {
    const plan = buildLibraryAnalysisUrlTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(plan.total, 5)
    assert.deepEqual(plan.summary.byAction, {
      skip_no_document: 1,
      skip_no_gain: 1,
      skip_not_extractable: 1,
      update: 2,
    })
    assert.deepEqual(plan.summary.byRepairBatch, {
      missing_document_locator_search: 3,
      missing_sourcedoc_locator: 2,
    })
    assert.deepEqual(plan.summary.byContentKind, {
      html: 3,
      pdf: 1,
      unknown: 1,
    })
    assert.equal(plan.summary.updateRows, 2)
    assert.equal(plan.summary.clearsLowTextRows, 2)
    assert.ok(plan.summary.totalWordGain > 750)

    const update = plan.rows.find(row => row.sourceKey === 'document:update-pdf')
    assert.equal(update?.action, 'update')
    assert.equal(update?.expectedUpdatedAt, '2026-06-18T11:00:00.000Z')
    assert.equal(update?.extractionStatus, 'extractable_500_plus')
    assert.equal(update?.contentKind, 'pdf')
    assert.match(update?.nextContent ?? '', /URL text extraction/)
    assert.match(update?.nextContent ?? '', /Source URL: `https:\/\/example\.org\/source\.pdf`/)
    assert.match(update?.nextContent ?? '', /Extraction method: `pdf_pdftotext`/)
    assert.match(update?.reason ?? '', /Document.content can be updated/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const noDocument = plan.rows.find(row => row.sourceKey === 'document:no-document')
    assert.equal(noDocument?.action, 'skip_no_document')
    assert.equal(noDocument?.nextContent, null)

    const notExtractable = plan.rows.find(row => row.sourceKey === 'document:not-extractable')
    assert.equal(notExtractable?.action, 'skip_not_extractable')
    assert.match(notExtractable?.reason ?? '', /http_error/)

    const noGain = plan.rows.find(row => row.sourceKey === 'document:no-gain')
    assert.equal(noGain?.action, 'skip_no_gain')
    assert.equal(noGain?.newWordCount, 260)
  })

  it('formats a guarded markdown repair plan', () => {
    const plan = buildLibraryAnalysisUrlTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisUrlTextRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-url-text-repair-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis URL Text Repair Plan/m)
    assert.match(markdown, /Document.content/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Document\.updatedAt, wordCount og content/)
    assert.match(markdown, /avbryter hele batchen/)
    assert.match(markdown, /Total rows \| 5/)
    assert.match(markdown, /Update rows \| 2/)
    assert.match(markdown, /Clears low-text rows \| 2/)
    assert.match(markdown, /Rows shown below: 2 of 5/)
    assert.match(markdown, /research\/_status\/library-analysis-url-text-repair-plan.json/)
  })
})
