import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisDecisionQueue,
  formatLibraryAnalysisDecisionQueueMarkdown,
  type LibraryAnalysisDecisionQueueInput,
} from '../../src/lib/library-analysis-decision-queue'

const rows: LibraryAnalysisDecisionQueueInput[] = [
  {
    sourceKey: 'document:short-summary',
    title: 'Curated short summary',
    repairKind: 'existing_low_text',
    repairBatch: 'existing_short_summary_review',
    wordCount: 132,
    canonicalPath: 'research/bibliotek/summary.md',
    url: null,
    urlExtractionStatus: null,
    localRepairAction: 'skip_no_gain',
  },
  {
    sourceKey: 'document:source-stub',
    title: 'Annual report source stub',
    repairKind: 'existing_low_text',
    repairBatch: 'existing_source_locator_stub_review',
    wordCount: 8,
    canonicalPath: 'research/evidence-pack/company/aarsredovisning.md',
    url: 'https://www.allabolag.se/',
    urlExtractionStatus: 'small_text',
    localRepairAction: 'skip_below_quality_floor',
  },
  {
    sourceKey: 'document:url-http-error',
    title: 'Blocked public report',
    repairKind: 'url_backed_low_text',
    repairBatch: 'url_backed_text_extraction',
    wordCount: 56,
    canonicalPath: null,
    url: 'https://example.org/report',
    urlExtractionStatus: 'http_error',
    localRepairAction: null,
  },
  {
    sourceKey: 'document:seeded',
    title: 'Seeded internal synthesis',
    repairKind: 'seeded_report_stub',
    repairBatch: 'seeded_internal_synthesis_review',
    wordCount: 91,
    canonicalPath: null,
    url: null,
    urlExtractionStatus: null,
    localRepairAction: null,
  },
  {
    sourceKey: 'document:transcript',
    title: 'Short transcript fragment',
    repairKind: 'existing_low_text',
    repairBatch: 'existing_transcript_fragment_review',
    wordCount: 20,
    canonicalPath: 'research/landbrukarena_transcripts/short.txt',
    url: 'https://www.youtube.com/watch?v=abc',
    urlExtractionStatus: 'small_text',
    localRepairAction: 'skip_below_quality_floor',
  },
]

describe('library analysis decision queue', () => {
  it('splits mechanically exhausted rows into next operator decisions', () => {
    const queue = buildLibraryAnalysisDecisionQueue(rows, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(queue.total, 5)
    assert.deepEqual(queue.summary.byDecisionKind, {
      manual_source_fetch: 2,
      seeded_report_decision: 1,
      short_summary_curation: 1,
      transcript_refetch_or_drop: 1,
    })
    assert.deepEqual(queue.summary.byDecisionLane, {
      curation_decision: 2,
      manual_source_hunt: 2,
      transcript_repair: 1,
    })
    assert.equal(queue.summary.mechanicalUpdateCandidates, 0)

    const sourceStub = queue.rows.find(row => row.sourceKey === 'document:source-stub')
    assert.equal(sourceStub?.decisionKind, 'manual_source_fetch')
    assert.equal(sourceStub?.decisionLane, 'manual_source_hunt')
    assert.equal(sourceStub?.priority, 'P1')
    assert.match(sourceStub?.recommendedAction ?? '', /fulltekst/)

    const seeded = queue.rows.find(row => row.sourceKey === 'document:seeded')
    assert.equal(seeded?.decisionKind, 'seeded_report_decision')
    assert.equal(seeded?.decisionLane, 'curation_decision')
    assert.match(seeded?.aiContextNote ?? '', /ikke safe_for_ai_context/)
  })

  it('formats a guarded decision handoff for the manual phase', () => {
    const queue = buildLibraryAnalysisDecisionQueue(rows, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisDecisionQueueMarkdown(queue, {
      jsonPath: 'research/_status/library-analysis-decision-queue.json',
      sampleLimit: 3,
    })

    assert.match(markdown, /^# Library Analysis Decision Queue/m)
    assert.match(markdown, /ikke en claim-ko/)
    assert.match(markdown, /Total decision rows/)
    assert.match(markdown, /Mechanical update candidates/)
    assert.match(markdown, /manual_source_fetch/)
    assert.match(markdown, /Rows shown below: 3 of 5/)
  })
})
