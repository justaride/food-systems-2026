import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisManualPdfMatchRepairPlan,
  formatLibraryAnalysisManualPdfMatchRepairPlanMarkdown,
  type LibraryAnalysisManualPdfMatchRepairDocument,
  type LibraryAnalysisManualPdfMatchRepairFile,
  type LibraryAnalysisManualPdfMatchRepairMapping,
} from '../../src/lib/library-analysis-manual-pdf-match-repair'

const mappings: LibraryAnalysisManualPdfMatchRepairMapping[] = [
  {
    sourceKey: 'document:kfst',
    documentId: 'doc-kfst',
    title: 'KFST Evaluering af foedevarehandelsloven 2024',
    sourceUrl: 'https://kfst.dk/media/evaluering.pdf',
    localPath: 'research/evidence-pack/nordisk/kfst-foedevarehandelsloven-evaluering-2024.pdf',
    expectedTitleIncludes: ['KFST', 'foedevarehandelsloven'],
    expectedExistingUrlIncludes: ['kfst.dk'],
    reviewNote: 'Official KFST PDF resolved during P1 source repair.',
  },
  {
    sourceKey: 'document:owned',
    documentId: 'doc-owned',
    title: 'Konkurrensverket 2024:4 duplicate',
    sourceUrl: 'https://www.konkurrensverket.se/rapport_2024-4.pdf',
    localPath: 'evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
    expectedTitleIncludes: ['Konkurrensverket'],
    reviewNote: 'Path already belongs to a canonical document.',
  },
  {
    sourceKey: 'document:reviewed-alias',
    documentId: 'doc-reviewed-alias',
    title: 'Konkurrensverket 2024:4 reviewed alias',
    sourceUrl: 'https://www.konkurrensverket.se/rapport_2024-4.pdf',
    localPath: 'evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
    expectedTitleIncludes: ['Konkurrensverket'],
    sharedPathOwnerDocumentId: 'canonical-owner',
    reviewNote: 'Reviewed alias shares the canonical report PDF intentionally.',
  },
  {
    sourceKey: 'document:weak',
    documentId: 'doc-weak',
    title: 'Ruokavirasto ETMV 2024',
    sourceUrl: 'https://www.ruokavirasto.fi/etmv-2024.pdf',
    localPath: 'research/evidence-pack/nordisk/ruokavirasto-etmv-2024.pdf',
    expectedTitleIncludes: ['Ruokavirasto'],
    reviewNote: 'PDF exists but has too little extractable text.',
  },
]

const documents: LibraryAnalysisManualPdfMatchRepairDocument[] = [
  {
    id: 'doc-kfst',
    title: 'KFST Evaluering af foedevarehandelsloven 2024',
    url: 'https://en.kfst.dk/media/51101',
    filePath: null,
    content: 'kort '.repeat(56),
    wordCount: 56,
  },
  {
    id: 'doc-owned',
    title: 'Konkurrensverket rapportnotat',
    url: 'https://www.konkurrensverket.se/publikationer/',
    filePath: null,
    content: 'kort '.repeat(55),
    wordCount: 55,
  },
  {
    id: 'canonical-owner',
    title: 'Dagligvaruhandelns etablering i kommunerna',
    url: 'https://www.konkurrensverket.se/rapport_2024-4.pdf',
    filePath: 'research/evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
    content: 'full tekst',
    wordCount: 2,
  },
  {
    id: 'doc-reviewed-alias',
    title: 'Konkurrensverket aliasrapport',
    url: 'https://www.konkurrensverket.se/publikationer/',
    filePath: null,
    content: 'kort '.repeat(55),
    wordCount: 55,
  },
  {
    id: 'doc-weak',
    title: 'Ruokavirasto ETMV 2024',
    url: 'https://www.ruokavirasto.fi/globalassets/etmv/',
    filePath: null,
    content: 'kort '.repeat(59),
    wordCount: 59,
  },
]

const files: LibraryAnalysisManualPdfMatchRepairFile[] = [
  {
    path: 'research/evidence-pack/nordisk/kfst-foedevarehandelsloven-evaluering-2024.pdf',
    text: 'foedevarehandelsloven '.repeat(320),
    wordCount: 320,
  },
  {
    path: 'research/evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
    text: 'konkurrensverket '.repeat(300),
    wordCount: 300,
  },
  {
    path: 'research/evidence-pack/nordisk/ruokavirasto-etmv-2024.pdf',
    text: 'etmv '.repeat(120),
    wordCount: 120,
  },
]

describe('library analysis manual PDF match repair', () => {
  it('plans reviewed PDF matches only when document, URL, path, and extracted text guards pass', () => {
    const plan = buildLibraryAnalysisManualPdfMatchRepairPlan({
      mappings,
      documents,
      files,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })

    assert.equal(plan.total, 4)
    assert.deepEqual(plan.summary.byAction, {
      skip_below_quality_floor: 1,
      skip_path_already_assigned: 1,
      update: 2,
    })
    assert.equal(plan.summary.updateRows, 2)
    assert.equal(plan.summary.clearsLowTextRows, 2)

    const update = plan.rows.find(row => row.sourceKey === 'document:kfst')
    assert.equal(update?.action, 'update')
    assert.equal(update?.newFilePath, 'research/evidence-pack/nordisk/kfst-foedevarehandelsloven-evaluering-2024.pdf')
    assert.equal(update?.newUrl, 'https://kfst.dk/media/evaluering.pdf')
    assert.ok((update?.newWordCount ?? 0) > 320)
    assert.ok((update?.wordGain ?? 0) > 250)
    assert.match(update?.nextContent ?? '', /Manual PDF source match/)
    assert.match(update?.nextContent ?? '', /Official KFST PDF resolved/)
    assert.notEqual(update?.contentHashBefore, update?.contentHashAfter)

    const owned = plan.rows.find(row => row.sourceKey === 'document:owned')
    assert.equal(owned?.action, 'skip_path_already_assigned')
    assert.match(owned?.reason ?? '', /canonical-owner/)
    assert.equal(owned?.nextContent, null)

    const reviewedAlias = plan.rows.find(row => row.sourceKey === 'document:reviewed-alias')
    assert.equal(reviewedAlias?.action, 'update')
    assert.equal(reviewedAlias?.newFilePath, 'evidence-pack/nordisk/konkurrensverket-2024-4.pdf')
    assert.match(reviewedAlias?.reason ?? '', /shared with reviewed owner canonical-owner/)
    assert.match(reviewedAlias?.nextContent ?? '', /Reviewed alias shares the canonical report PDF intentionally/)

    const weak = plan.rows.find(row => row.sourceKey === 'document:weak')
    assert.equal(weak?.action, 'skip_below_quality_floor')
    assert.equal(weak?.newWordCount, 59)
  })

  it('formats a bounded handoff for the manual PDF repair plan', () => {
    const plan = buildLibraryAnalysisManualPdfMatchRepairPlan({
      mappings,
      documents,
      files,
      generatedAt: '2026-06-19T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisManualPdfMatchRepairPlanMarkdown(plan, {
      jsonPath: 'research/_status/library-analysis-manual-pdf-match-plan.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis Manual PDF Match Repair Plan/m)
    assert.match(markdown, /forhaandsvurderte offisielle PDF-matcher/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 4/)
    assert.match(markdown, /Update rows \| 2/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
    assert.doesNotMatch(markdown, /foedevarehandelsloven foedevarehandelsloven foedevarehandelsloven/)
  })

  it('does not plan a shared-owner update when the exact DB filePath is already taken', () => {
    const plan = buildLibraryAnalysisManualPdfMatchRepairPlan({
      mappings: [{
        sourceKey: 'document:exact-shared-alias',
        documentId: 'doc-exact-shared-alias',
        title: 'Konkurrensverket exact shared alias',
        sourceUrl: 'https://www.konkurrensverket.se/rapport_2024-4.pdf',
        localPath: 'research/evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
        expectedTitleIncludes: ['Konkurrensverket'],
        sharedPathOwnerDocumentId: 'canonical-owner',
        reviewNote: 'This reviewed alias points at the same canonical report.',
      }],
      documents: [
        {
          id: 'doc-exact-shared-alias',
          title: 'Konkurrensverket aliasrapport',
          url: 'https://www.konkurrensverket.se/publikationer/',
          filePath: null,
          content: 'kort '.repeat(55),
          wordCount: 55,
        },
        {
          id: 'canonical-owner',
          title: 'Dagligvaruhandelns etablering i kommunerna',
          url: 'https://www.konkurrensverket.se/rapport_2024-4.pdf',
          filePath: 'research/evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
          content: 'full tekst',
          wordCount: 2,
        },
      ],
      files: [{
        path: 'research/evidence-pack/nordisk/konkurrensverket-2024-4.pdf',
        text: 'konkurrensverket '.repeat(300),
        wordCount: 300,
      }],
      generatedAt: '2026-06-19T12:00:00.000Z',
    })

    assert.equal(plan.summary.updateRows, 0)
    assert.deepEqual(plan.summary.byAction, { skip_path_already_assigned: 1 })
    assert.match(plan.rows[0]?.reason ?? '', /exactly assigned to Document canonical-owner/)
  })
})
