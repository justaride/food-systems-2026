import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisManualUrlMatchRepairPlan,
  formatLibraryAnalysisManualUrlMatchRepairPlanMarkdown,
  type LibraryAnalysisManualUrlMatchRepairDocument,
  type LibraryAnalysisManualUrlMatchRepairMapping,
  type LibraryAnalysisManualUrlMatchRepairUrl,
} from '../../src/lib/library-analysis-manual-url-match-repair'

const mappings: LibraryAnalysisManualUrlMatchRepairMapping[] = [
  {
    sourceKey: 'document:agrain',
    documentId: 'doc-agrain',
    title: 'Capital raise and business model 2024',
    sourceUrl: 'https://presscloud.com/csp/vocast/message.csp?KEY=519058656948183&format=web',
    expectedTitleIncludes: ['Capital raise'],
    expectedExistingUrlIncludes: ['agrain.com'],
    expectedExtractedTextIncludes: ['Agrain', 'DKK 26 million'],
    reviewNote: 'Reviewed Agrain press release resolved during P1 source repair.',
  },
  {
    sourceKey: 'document:guarded',
    documentId: 'doc-guarded',
    title: 'Guarded source',
    sourceUrl: 'https://example.com/guarded',
    expectedExistingUrlIncludes: ['expected.example'],
    reviewNote: 'Should not update when the existing URL guard fails.',
  },
  {
    sourceKey: 'document:short',
    documentId: 'doc-short',
    title: 'Short source',
    sourceUrl: 'https://example.com/short',
    expectedTitleIncludes: ['Short'],
    reviewNote: 'Should not update when the fetched source remains too short.',
  },
]

const documents: LibraryAnalysisManualUrlMatchRepairDocument[] = [
  {
    id: 'doc-agrain',
    title: 'Capital raise and business model 2024',
    url: 'https://agrain.com/',
    content: 'kort '.repeat(9),
    wordCount: 9,
  },
  {
    id: 'doc-guarded',
    title: 'Guarded source',
    url: 'https://other.example/source',
    content: 'kort '.repeat(20),
    wordCount: 20,
  },
  {
    id: 'doc-short',
    title: 'Short source',
    url: 'https://example.com/short-old',
    content: 'kort '.repeat(10),
    wordCount: 10,
  },
]

const urls: LibraryAnalysisManualUrlMatchRepairUrl[] = [
  {
    url: 'https://presscloud.com/csp/vocast/message.csp?KEY=519058656948183&format=web',
    finalUrl: 'https://presscloud.com/csp/vocast/message.csp?KEY=519058656948183&format=web',
    text: 'Agrain '.repeat(170) + 'DKK 26 million',
    wordCount: 173,
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
  {
    url: 'https://example.com/guarded',
    finalUrl: 'https://example.com/guarded',
    text: 'guarded '.repeat(200),
    wordCount: 200,
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
  {
    url: 'https://example.com/short',
    finalUrl: 'https://example.com/short',
    text: 'short '.repeat(40),
    wordCount: 40,
    contentKind: 'html',
    extractionMethod: 'html_text',
  },
]

describe('library analysis manual URL match repair', () => {
  it('plans reviewed URL matches only when document, URL, fetched text, and quality guards pass', () => {
    const plan = buildLibraryAnalysisManualUrlMatchRepairPlan({
      mappings,
      documents,
      urls,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })

    assert.equal(plan.total, 3)
    assert.deepEqual(plan.summary.byAction, {
      skip_below_quality_floor: 1,
      skip_existing_url_guard_failed: 1,
      update: 1,
    })
    assert.equal(plan.summary.updateRows, 1)
    assert.equal(plan.summary.clearsLowTextRows, 1)

    const update = plan.rows.find(row => row.sourceKey === 'document:agrain')
    assert.equal(update?.action, 'update')
    assert.equal(update?.newUrl, 'https://presscloud.com/csp/vocast/message.csp?KEY=519058656948183&format=web')
    assert.ok((update?.newWordCount ?? 0) > 173)
    assert.match(update?.nextContent ?? '', /Manual URL source match/)
    assert.match(update?.nextContent ?? '', /Reviewed Agrain press release/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const guarded = plan.rows.find(row => row.sourceKey === 'document:guarded')
    assert.equal(guarded?.action, 'skip_existing_url_guard_failed')
    assert.equal(guarded?.newUrl, null)
    assert.match(guarded?.reason ?? '', /expected.example/)

    const short = plan.rows.find(row => row.sourceKey === 'document:short')
    assert.equal(short?.action, 'skip_below_quality_floor')
    assert.equal(short?.newWordCount, 10)
  })

  it('formats a bounded handoff for the manual URL repair plan', () => {
    const plan = buildLibraryAnalysisManualUrlMatchRepairPlan({
      mappings,
      documents,
      urls,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisManualUrlMatchRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-manual-url-match-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis Manual URL Match Repair Plan/m)
    assert.match(markdown, /forhaandsvurderte URL-matcher/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 3/)
    assert.match(markdown, /Update rows \| 1/)
    assert.match(markdown, /Rows shown below: 2 of 3/)
    assert.doesNotMatch(markdown, /Agrain Agrain Agrain/)
  })
})
