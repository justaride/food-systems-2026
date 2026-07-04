import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisLocalTextRepairPlan,
  formatLibraryAnalysisLocalTextRepairPlanMarkdown,
  type LibraryAnalysisLocalTextRepairInput,
} from '../../src/lib/library-analysis-local-text-repair'

const inputs: LibraryAnalysisLocalTextRepairInput[] = [
  {
    sourceKey: 'document:crosses-floor',
    documentId: 'doc-crosses-floor',
    title: 'Transcript crossing the floor',
    path: 'research/transcripts/crosses.txt',
    extension: '.txt',
    repairBatch: 'text_low_text_review',
    existingContent: 'kort '.repeat(130),
    existingWordCount: 130,
    fileText: 'tekst '.repeat(164),
    fileWordCount: 164,
  },
  {
    sourceKey: 'document:still-low',
    documentId: 'doc-still-low',
    title: 'Markdown still below floor',
    path: 'research/short.md',
    extension: '.md',
    repairBatch: 'markdown_low_text_review',
    existingContent: 'kort '.repeat(90),
    existingWordCount: 90,
    fileText: 'tekst '.repeat(121),
    fileWordCount: 121,
  },
  {
    sourceKey: 'library_file:loose',
    documentId: null,
    title: 'Loose markdown file',
    path: 'research/bibliotek/loose.md',
    extension: '.md',
    repairBatch: 'loose_markdown_import_review',
    existingContent: '',
    existingWordCount: 147,
    fileText: 'tekst '.repeat(147),
    fileWordCount: 147,
  },
  {
    sourceKey: 'document:presentation',
    documentId: 'doc-presentation',
    title: 'Loose presentation',
    path: 'research/deck.pptx',
    extension: '.pptx',
    repairBatch: 'loose_presentation_text_extraction',
    existingContent: '',
    existingWordCount: 0,
    fileText: '',
    fileWordCount: 0,
  },
]

describe('library analysis local text repair', () => {
  it('plans only local text updates that clear the low-text floor', () => {
    const plan = buildLibraryAnalysisLocalTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(plan.total, 4)
    assert.deepEqual(plan.summary.byAction, {
      skip_below_quality_floor: 1,
      skip_no_document: 1,
      skip_unsupported_extension: 1,
      update: 1,
    })
    assert.equal(plan.summary.updateRows, 1)
    assert.equal(plan.summary.totalWordGain, 47)
    assert.equal(plan.summary.clearsLowTextRows, 1)

    const update = plan.rows.find(row => row.sourceKey === 'document:crosses-floor')
    assert.equal(update?.action, 'update')
    assert.equal(update?.newWordCount, 177)
    assert.match(update?.nextContent ?? '', /Local file text sync/)
    assert.match(update?.nextContent ?? '', /Source file: `research\/transcripts\/crosses\.txt`/)
    assert.match(update?.reason ?? '', /130 -> 177 words/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const stillLow = plan.rows.find(row => row.sourceKey === 'document:still-low')
    assert.equal(stillLow?.action, 'skip_below_quality_floor')
    assert.equal(stillLow?.nextContent, null)

    const loose = plan.rows.find(row => row.sourceKey === 'library_file:loose')
    assert.equal(loose?.action, 'skip_no_document')

    const presentation = plan.rows.find(row => row.sourceKey === 'document:presentation')
    assert.equal(presentation?.action, 'skip_unsupported_extension')
  })

  it('formats a guarded markdown repair plan', () => {
    const plan = buildLibraryAnalysisLocalTextRepairPlan(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisLocalTextRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-local-text-repair-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis Local Text Repair Plan/m)
    assert.match(markdown, /Document.content/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 4/)
    assert.match(markdown, /Update rows \| 1/)
    assert.match(markdown, /Clears low-text rows \| 1/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
    assert.match(markdown, /research\/_status\/library-analysis-local-text-repair-plan.json/)
  })
})
