import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisManualLocalMatchRepairPlan,
  formatLibraryAnalysisManualLocalMatchRepairPlanMarkdown,
  type LibraryAnalysisManualLocalMatchRepairDocument,
  type LibraryAnalysisManualLocalMatchRepairFile,
  type LibraryAnalysisManualLocalMatchRepairMapping,
} from '../../src/lib/library-analysis-manual-local-match-repair'

const mappings: LibraryAnalysisManualLocalMatchRepairMapping[] = [
  {
    sourceKey: 'document:nnr',
    documentId: 'doc-nnr',
    title: 'Nordic Nutrition Recommendations 2023',
    localPath: 'research/bibliotek/nordisk/nnr2023.md',
    expectedTitleIncludes: ['Nordic Nutrition Recommendations'],
    expectedUrlIncludes: ['pub.norden.org/nord2023-003'],
    reviewNote: 'Exact local markdown match found during P1 review.',
  },
  {
    sourceKey: 'document:used-path',
    documentId: 'doc-used-path',
    title: 'NIBIO metode',
    localPath: 'research/bibliotek/beredskap/nibio.md',
    expectedTitleIncludes: ['NIBIO'],
    reviewNote: 'Path is already assigned elsewhere.',
  },
  {
    sourceKey: 'document:weak-file',
    documentId: 'doc-weak-file',
    title: 'Matsystemutvalget status',
    localPath: 'research/bibliotek/nou/matsystemutvalget.md',
    expectedTitleIncludes: ['Matsystemutvalget'],
    reviewNote: 'Local file exists but remains too short.',
  },
]

const documents: LibraryAnalysisManualLocalMatchRepairDocument[] = [
  {
    id: 'doc-nnr',
    title: 'NORDIC NUTRITION RECOMMENDATIONS 2023',
    url: 'https://pub.norden.org/nord2023-003/',
    filePath: null,
    content: 'kort '.repeat(57),
    wordCount: 57,
  },
  {
    id: 'doc-used-path',
    title: 'NIBIO: Metode for selvforsyningsberegning',
    url: null,
    filePath: null,
    content: 'kort '.repeat(124),
    wordCount: 124,
  },
  {
    id: 'other-doc',
    title: 'Existing owner',
    url: null,
    filePath: 'research/bibliotek/beredskap/nibio.md',
    content: 'annen tekst',
    wordCount: 2,
  },
  {
    id: 'doc-weak-file',
    title: 'Matsystemutvalget - Status 2026',
    url: null,
    filePath: null,
    content: 'kort '.repeat(130),
    wordCount: 130,
  },
]

const files: LibraryAnalysisManualLocalMatchRepairFile[] = [
  {
    path: 'research/bibliotek/nordisk/nnr2023.md',
    text: 'nordisk '.repeat(366),
    wordCount: 366,
  },
  {
    path: 'research/bibliotek/beredskap/nibio.md',
    text: 'nibio '.repeat(179),
    wordCount: 179,
  },
  {
    path: 'research/bibliotek/nou/matsystemutvalget.md',
    text: 'status '.repeat(142),
    wordCount: 142,
  },
]

describe('library analysis manual local match repair', () => {
  it('plans only reviewed local matches that pass document, path, and text guards', () => {
    const plan = buildLibraryAnalysisManualLocalMatchRepairPlan({
      mappings,
      documents,
      files,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })

    assert.equal(plan.total, 3)
    assert.deepEqual(plan.summary.byAction, {
      skip_below_quality_floor: 1,
      skip_path_already_assigned: 1,
      update: 1,
    })
    assert.equal(plan.summary.updateRows, 1)
    assert.equal(plan.summary.totalWordGain, 333)
    assert.equal(plan.summary.clearsLowTextRows, 1)

    const update = plan.rows.find(row => row.sourceKey === 'document:nnr')
    assert.equal(update?.action, 'update')
    assert.equal(update?.documentId, 'doc-nnr')
    assert.equal(update?.newFilePath, 'research/bibliotek/nordisk/nnr2023.md')
    assert.equal(update?.newWordCount, 390)
    assert.match(update?.nextContent ?? '', /Manual local source match/)
    assert.match(update?.nextContent ?? '', /Reviewed note: Exact local markdown match/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const usedPath = plan.rows.find(row => row.sourceKey === 'document:used-path')
    assert.equal(usedPath?.action, 'skip_path_already_assigned')
    assert.match(usedPath?.reason ?? '', /other-doc/)
    assert.equal(usedPath?.nextContent, null)

    const weakFile = plan.rows.find(row => row.sourceKey === 'document:weak-file')
    assert.equal(weakFile?.action, 'skip_below_quality_floor')
    assert.equal(weakFile?.newWordCount, 130)
  })

  it('formats a guarded markdown handoff without embedding replacement content', () => {
    const plan = buildLibraryAnalysisManualLocalMatchRepairPlan({
      mappings,
      documents,
      files,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisManualLocalMatchRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-manual-local-match-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis Manual Local Match Repair Plan/m)
    assert.match(markdown, /forhaandsvurderte lokale kilde-matcher/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 3/)
    assert.match(markdown, /Update rows \| 1/)
    assert.match(markdown, /Rows shown below: 2 of 3/)
    assert.doesNotMatch(markdown, /nordisk nordisk nordisk/)
  })
})
