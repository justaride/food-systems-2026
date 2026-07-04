import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisPdfTextRepairPlan,
  formatLibraryAnalysisPdfTextRepairPlanMarkdown,
  type LibraryAnalysisPdfTextRepairInput,
} from '../../src/lib/library-analysis-pdf-text-repair'

const inputs: LibraryAnalysisPdfTextRepairInput[] = [
  {
    sourceKey: 'document:update-large',
    documentId: 'doc-large',
    title: 'Large PDF',
    path: 'research/large.pdf',
    existingContent: '# Large PDF\n\nPDF document - full text not extracted.',
    existingWordCount: 8,
    extractedText: 'mat '.repeat(180),
    extractedWordCount: 180,
    extractionStatus: 'extractable_150_499',
  },
  {
    sourceKey: 'document:update-small',
    documentId: 'doc-small',
    title: 'Small PDF',
    path: 'research/small.pdf',
    existingContent: 'Small metadata stub.',
    existingWordCount: 3,
    extractedText: 'ord '.repeat(12),
    extractedWordCount: 12,
    extractionStatus: 'small_gain',
  },
  {
    sourceKey: 'document:no-document',
    documentId: null,
    title: 'Unlinked PDF',
    path: 'research/unlinked.pdf',
    existingContent: '',
    existingWordCount: 0,
    extractedText: 'ord '.repeat(200),
    extractedWordCount: 200,
    extractionStatus: 'extractable_150_499',
  },
  {
    sourceKey: 'document:no-gain',
    documentId: 'doc-no-gain',
    title: 'Existing Rich PDF',
    path: 'research/rich.pdf',
    existingContent: 'rik '.repeat(240),
    existingWordCount: 240,
    extractedText: 'rik '.repeat(120),
    extractedWordCount: 120,
    extractionStatus: 'small_gain',
  },
]

describe('library analysis PDF text repair', () => {
  it('plans conservative document content updates from extracted PDF text', () => {
    const plan = buildLibraryAnalysisPdfTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(plan.total, 4)
    assert.deepEqual(plan.summary.byAction, {
      skip_no_document: 1,
      skip_no_gain: 1,
      update: 2,
    })
    assert.equal(plan.summary.updateRows, 2)
    assert.equal(plan.summary.totalWordGain, 218)

    const update = plan.rows.find(row => row.sourceKey === 'document:update-large')
    assert.equal(update?.action, 'update')
    assert.equal(update?.newWordCount, 201)
    assert.match(update?.nextContent ?? '', /PDF text extraction/)
    assert.match(update?.nextContent ?? '', /Source PDF: `research\/large\.pdf`/)
    assert.match(update?.reason ?? '', /8 -> 201 words/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const noDocument = plan.rows.find(row => row.sourceKey === 'document:no-document')
    assert.equal(noDocument?.action, 'skip_no_document')
    assert.equal(noDocument?.nextContent, null)

    const noGain = plan.rows.find(row => row.sourceKey === 'document:no-gain')
    assert.equal(noGain?.action, 'skip_no_gain')
    assert.equal(noGain?.newWordCount, 240)
  })

  it('formats a guarded markdown repair plan', () => {
    const plan = buildLibraryAnalysisPdfTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisPdfTextRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-pdf-text-repair-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis PDF Text Repair Plan/m)
    assert.match(markdown, /Document.content/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 4/)
    assert.match(markdown, /Update rows \| 2/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
    assert.match(markdown, /research\/_status\/library-analysis-pdf-text-repair-plan.json/)
  })
})
