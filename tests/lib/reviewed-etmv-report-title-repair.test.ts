import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import {
  PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO,
  REVIEWED_ETMV_REPORT_CONTENT_HASHES,
  REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
  REVIEWED_ETMV_REPORT_FULL_ROW_HASHES,
  REVIEWED_ETMV_REPORT_ID,
  REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
  REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
  REVIEWED_ETMV_REPORT_TITLE_AFTER,
  REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
  applyReviewedEtmvReportTitleRepairToSeed,
  replaceReviewedEtmvTitleExactlyOnce,
  reviewedEtmvLibraryAnalysisContentHash,
  sha256ReviewedEtmvJson,
  sha256ReviewedEtmvText,
} from '../../src/lib/citations/reviewed-etmv-report-title-repair'
import {
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_DEPENDENCY_SCOPE,
  assertReviewedEtmvApplyAuthorization,
  assertReviewedEtmvPlanReady,
  assertReviewedEtmvPostApply,
  buildReviewedEtmvPlanFromCollections,
  fullReviewedEtmvDocumentWhere,
  fullReviewedEtmvLibraryAnalysisWhere,
  fullReviewedEtmvReportWhere,
  fullReviewedEtmvSourceCitationWhere,
  materializeReviewedEtmvAfterRows,
  parseReviewedEtmvArgs,
  reviewedEtmvNonTargetHashes,
  reviewedEtmvPlanSha256,
  type ReviewedEtmvCollections,
  type ReviewedEtmvDatabaseIdentity,
  type ReviewedEtmvDocumentRow,
  type ReviewedEtmvFieldCitationRow,
  type ReviewedEtmvLibraryAnalysisRow,
  type ReviewedEtmvPinnedHashes,
  type ReviewedEtmvReportRow,
  type ReviewedEtmvSourceCitationRow,
} from '../../scripts/apply-reviewed-etmv-report-title-repair'

const databaseIdentity: ReviewedEtmvDatabaseIdentity = {
  currentDatabase: 'foodsystems',
  identityUuid: '90e3e24d-230f-42f7-b178-5bcd5b861e84',
  createdAt: '2026-07-20T00:47:20.631Z',
}

const beforeReport: ReviewedEtmvReportRow = {
  id: REVIEWED_ETMV_REPORT_ID,
  title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  fullTitle: null,
  author: null,
  institution:
    'Elintarvikemarkkinavaltuutettu / Finnish Food Market Ombudsman',
  date: null,
  year: 2024,
  sourceUrl:
    'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
  reportCategory: 'konkurransetilsyn',
  country: 'FI',
  keyFindings: ['finding'],
  recommendations: ['recommendation'],
  relevance: 'relevance',
  tags: ['ETMV'],
  doi: null,
  isbn: null,
  issn: null,
  publisher: 'Ruokavirasto',
  provenanceType: 'external_report',
  supportingSources: null,
  accessedAt: new Date(REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO),
  documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
}

const beforeDocument: ReviewedEtmvDocumentRow = {
  id: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  slug: 'report-etmv-toimintakertomus-2024',
  filePath: 'research/evidence-pack/nordisk/etmv-toimintakertomus-2024.pdf',
  title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  author: beforeReport.institution,
  year: 2024,
  documentType: 'konkurransetilsyn',
  category: 'bibliotek',
  subcategory: 'reports',
  country: 'FI',
  content: `# ${REVIEWED_ETMV_REPORT_TITLE_BEFORE}\nBody`,
  summary: 'A preserved summary',
  url: beforeReport.sourceUrl,
  accessedAt: null,
  archivedUrl: null,
  wordCount: 4185,
  tags: ['ETMV', 'report'],
  metadata: {
    reportId: REVIEWED_ETMV_REPORT_ID,
    generatedFrom: 'prisma/seed-data/reports.ts',
  },
  createdAt: new Date('2026-05-28T09:29:10.694Z'),
  updatedAt: new Date('2026-07-02T07:39:52.478Z'),
}

const beforeCitation: ReviewedEtmvSourceCitationRow = {
  id: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
  sourceClass: 'secondary',
  citationReadiness: 'citable_with_note',
  verificationStatus: 'machine_verified',
  citationText: `Report: ${REVIEWED_ETMV_REPORT_TITLE_BEFORE}`,
  title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  publisher: 'Ruokavirasto',
  author: null,
  year: 2024,
  url: beforeReport.sourceUrl,
  archivedUrl:
    'https://web.archive.org/web/20251107011843/https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
  localPath: null,
  fileHash: null,
  contentHash: null,
  hashAlgorithm: 'sha256',
  pageRef: null,
  quote: null,
  accessedAt: null,
  captureMethod: 'backfill-existing-locators',
  verifiedAt: new Date('2026-05-26T06:36:57.045Z'),
  verifiedBy: null,
  confidence: null,
  notes: null,
  documentId: null,
  sourceDocId: null,
  createdAt: new Date('2026-05-19T23:52:33.424Z'),
  updatedAt: new Date('2026-05-26T06:36:57.045Z'),
}

const fieldCitation: ReviewedEtmvFieldCitationRow = {
  id: REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
  citationId: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
  entityType: 'Report',
  entityId: REVIEWED_ETMV_REPORT_ID,
  fieldPath: 'sourceUrl',
  claimText: null,
  confidence: null,
  createdAt: new Date('2026-05-19T23:52:33.709Z'),
}

const beforeLibraryAnalysis: ReviewedEtmvLibraryAnalysisRow = {
  id: REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
  sourceKind: 'document',
  sourceKey: `document:${REVIEWED_ETMV_REPORT_DOCUMENT_ID}`,
  documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  sourceDocId: null,
  canonicalPath: beforeDocument.filePath,
  title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  status: 'ai_draft',
  usageRule: 'internal_background',
  reviewStatus: 'not_required',
  citationReadiness: null,
  analysisTier: 'triage_card',
  aiCard: {
    status: 'ai_draft',
    shortSummary: `${REVIEWED_ETMV_REPORT_TITLE_BEFORE} er triagert.`,
    riskFlags: ['url_backed_internal_context'],
    controlLinks: [{ href: '/bibliotek/example', label: 'Bibliotek' }],
  },
  aiSummary: `${REVIEWED_ETMV_REPORT_TITLE_BEFORE} er triagert.`,
  keyFindings: ['Triage flag'],
  claimCandidates: [],
  projectImplications: ['Internal only'],
  gaps: [{ kind: 'unclear_source' }],
  controlLinks: [{ href: '/bibliotek/example', label: 'Bibliotek' }],
  riskFlags: ['url_backed_internal_context'],
  contentHash: reviewedEtmvLibraryAnalysisContentHash({
    summary: beforeDocument.summary,
    content: beforeDocument.content,
  }),
  wordCount: 4185,
  processedAt: new Date('2026-07-19T19:39:54.836Z'),
  reviewedAt: null,
  reviewer: null,
  createdAt: new Date('2026-06-18T15:50:14.813Z'),
  updatedAt: new Date('2026-07-19T19:39:54.836Z'),
}

const fixtureAfter = materializeReviewedEtmvAfterRows(
  {
    report: beforeReport,
    document: beforeDocument,
    sourceCitation: beforeCitation,
    fieldCitation,
    libraryAnalysisRecord: beforeLibraryAnalysis,
  },
  { verifyPinnedHashes: false },
)

const fixtureNonTarget = reviewedEtmvNonTargetHashes({
  report: beforeReport,
  document: beforeDocument,
  sourceCitation: beforeCitation,
  libraryAnalysisRecord: beforeLibraryAnalysis,
})

const fixturePinnedHashes: ReviewedEtmvPinnedHashes = {
  Report: {
    before: sha256ReviewedEtmvJson(beforeReport),
    after: sha256ReviewedEtmvJson(fixtureAfter.report),
    nonTarget: fixtureNonTarget.Report,
  },
  Document: {
    before: sha256ReviewedEtmvJson(beforeDocument),
    after: sha256ReviewedEtmvJson(fixtureAfter.document),
    nonTarget: fixtureNonTarget.Document,
  },
  SourceCitation: {
    before: sha256ReviewedEtmvJson(beforeCitation),
    after: sha256ReviewedEtmvJson(fixtureAfter.sourceCitation),
    nonTarget: fixtureNonTarget.SourceCitation,
  },
  FieldCitation: {
    before: sha256ReviewedEtmvJson(fieldCitation),
    after: sha256ReviewedEtmvJson(fieldCitation),
    nonTarget: sha256ReviewedEtmvJson(fieldCitation),
  },
  LibraryAnalysisRecord: {
    before: sha256ReviewedEtmvJson(beforeLibraryAnalysis),
    after: sha256ReviewedEtmvJson(fixtureAfter.libraryAnalysisRecord),
    nonTarget: fixtureNonTarget.LibraryAnalysisRecord,
  },
}

function collections(
  state: 'before' | 'after' | 'hybrid' = 'before',
): ReviewedEtmvCollections {
  return {
    reports: [
      state === 'after' || state === 'hybrid'
        ? fixtureAfter.report
        : beforeReport,
    ],
    documents: [state === 'after' ? fixtureAfter.document : beforeDocument],
    sourceCitations: [
      state === 'after' ? fixtureAfter.sourceCitation : beforeCitation,
    ],
    fieldCitations: [fieldCitation],
    libraryAnalysisRecords: [
      state === 'after'
        ? fixtureAfter.libraryAnalysisRecord
        : beforeLibraryAnalysis,
    ],
    evidenceAppraisals: [],
    documentRefs: [],
    insightDocumentRefs: [],
    companyDocumentRefs: [],
    actorDocumentRefs: [],
    sourceDocBindings: [],
    thesisBindings: [],
    reportBindings: [
      {
        id: REVIEWED_ETMV_REPORT_ID,
        documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
      },
    ],
    insightCitationBindings: [],
    producerCitationBindings: [],
  }
}

function plan(state: 'before' | 'after' | 'hybrid' = 'before') {
  return buildReviewedEtmvPlanFromCollections(
    collections(state),
    databaseIdentity,
    {
      pinnedHashes: fixturePinnedHashes,
      verifyProductionDerivation: false,
    },
  )
}

describe('reviewed ETMV Report title repair contract', () => {
  it('pins the exact target graph, titles, content hashes, and contract digest', () => {
    assert.equal(REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
      PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256)
    assert.deepEqual(REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.ids, {
      report: REVIEWED_ETMV_REPORT_ID,
      document: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
      sourceCitation: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
      fieldCitation: REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
      libraryAnalysisRecord: REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
    })
    assert.deepEqual(REVIEWED_ETMV_REPORT_CONTENT_HASHES, {
      documentContentBefore:
        'e1bdf89676884485375af155ae0286fd78239346df40062b6fd0f5e56add4622',
      documentContentAfter:
        '9d29e8b384519c0fe81a83367c8b4abd08bcbffddffd9378619ca03a9fc3673f',
      libraryAnalysisContentBefore:
        '9f5940db58e5a4f19736fa885ff56b8396a9957a09cd6408a1ec9620edd1c0ed',
      libraryAnalysisContentAfter:
        '61520b6e940f5cef8c9eceb141c450ccc3ad6a12092dbbcb27c2431183064c06',
    })
    assert.ok(
      Object.values(REVIEWED_ETMV_REPORT_FULL_ROW_HASHES).every((entry) =>
        Object.values(entry).every((hash) => /^[a-f0-9]{64}$/.test(hash)),
      ),
    )
  })

  it('replaces exactly one occurrence and derives both raw and composite hashes', () => {
    const next = replaceReviewedEtmvTitleExactlyOnce(
      beforeDocument.content,
      'fixture',
    )
    assert.equal(
      next.split(REVIEWED_ETMV_REPORT_TITLE_BEFORE).length - 1,
      0,
    )
    assert.equal(next.split(REVIEWED_ETMV_REPORT_TITLE_AFTER).length - 1, 1)
    assert.equal(
      sha256ReviewedEtmvText(next),
      sha256ReviewedEtmvText(fixtureAfter.document.content),
    )
    assert.equal(
      reviewedEtmvLibraryAnalysisContentHash({
        summary: beforeDocument.summary,
        content: next,
      }),
      fixtureAfter.libraryAnalysisRecord.contentHash,
    )
    assert.throws(
      () => replaceReviewedEtmvTitleExactlyOnce('no title', 'missing'),
      /exactly once; actual=0/,
    )
    assert.throws(
      () =>
        replaceReviewedEtmvTitleExactlyOnce(
          `${REVIEWED_ETMV_REPORT_TITLE_BEFORE} ${REVIEWED_ETMV_REPORT_TITLE_BEFORE}`,
          'duplicate',
        ),
      /exactly once; actual=2/,
    )
  })

  it('changes only the four approved semantic projections', () => {
    assert.equal(fixtureAfter.report.title, REVIEWED_ETMV_REPORT_TITLE_AFTER)
    assert.equal(fixtureAfter.document.title, REVIEWED_ETMV_REPORT_TITLE_AFTER)
    assert.equal(fixtureAfter.document.filePath, beforeDocument.filePath)
    assert.equal(fixtureAfter.document.wordCount, beforeDocument.wordCount)
    assert.deepEqual(fixtureAfter.document.metadata, beforeDocument.metadata)
    assert.equal(fixtureAfter.document.updatedAt, beforeDocument.updatedAt)

    assert.equal(
      fixtureAfter.sourceCitation.accessedAt?.toISOString(),
      REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO,
    )
    assert.equal(fixtureAfter.sourceCitation.url, beforeCitation.url)
    assert.equal(
      fixtureAfter.sourceCitation.archivedUrl,
      beforeCitation.archivedUrl,
    )
    assert.equal(
      fixtureAfter.sourceCitation.verificationStatus,
      beforeCitation.verificationStatus,
    )
    assert.equal(fixtureAfter.sourceCitation.verifiedAt, beforeCitation.verifiedAt)
    assert.equal(fixtureAfter.sourceCitation.updatedAt, beforeCitation.updatedAt)

    const beforeCard = beforeLibraryAnalysis.aiCard as Record<string, unknown>
    const afterCard = fixtureAfter.libraryAnalysisRecord.aiCard as Record<
      string,
      unknown
    >
    assert.equal(afterCard.status, beforeCard.status)
    assert.deepEqual(afterCard.riskFlags, beforeCard.riskFlags)
    assert.deepEqual(afterCard.controlLinks, beforeCard.controlLinks)
    assert.notEqual(afterCard.shortSummary, beforeCard.shortSummary)
    assert.equal(
      fixtureAfter.libraryAnalysisRecord.contentHash,
      reviewedEtmvLibraryAnalysisContentHash({
        summary: fixtureAfter.document.summary,
        content: fixtureAfter.document.content,
      }),
    )

    const noFilePath = materializeReviewedEtmvAfterRows(
      {
        report: beforeReport,
        document: { ...beforeDocument, filePath: null },
        sourceCitation: beforeCitation,
        fieldCitation,
        libraryAnalysisRecord: beforeLibraryAnalysis,
      },
      { verifyPinnedHashes: false },
    )
    assert.equal(noFilePath.document.filePath, null)
  })

  it('fails closed when any semantic text projection loses its exact occurrence', () => {
    assert.throws(
      () =>
        materializeReviewedEtmvAfterRows(
          {
            report: beforeReport,
            document: { ...beforeDocument, content: 'No reviewed title here' },
            sourceCitation: beforeCitation,
            fieldCitation,
            libraryAnalysisRecord: beforeLibraryAnalysis,
          },
          { verifyPinnedHashes: false },
        ),
      /Document\.content must contain the old title exactly once/,
    )
    assert.throws(
      () =>
        materializeReviewedEtmvAfterRows(
          {
            report: beforeReport,
            document: beforeDocument,
            sourceCitation: beforeCitation,
            fieldCitation,
            libraryAnalysisRecord: {
              ...beforeLibraryAnalysis,
              aiSummary: `${REVIEWED_ETMV_REPORT_TITLE_BEFORE} ${REVIEWED_ETMV_REPORT_TITLE_BEFORE}`,
            },
          },
          { verifyPinnedHashes: false },
        ),
      /LibraryAnalysisRecord\.aiSummary must contain the old title exactly once/,
    )
    assert.throws(
      () =>
        materializeReviewedEtmvAfterRows(
          {
            report: beforeReport,
            document: beforeDocument,
            sourceCitation: beforeCitation,
            fieldCitation,
            libraryAnalysisRecord: {
              ...beforeLibraryAnalysis,
              aiCard: { status: 'ai_draft' },
            },
          },
          { verifyPinnedHashes: false },
        ),
      /aiCard\.shortSummary is missing/,
    )
  })

  it('updates only the 2024 Report in the outer seed projection', () => {
    const target = reports.filter((row) => row.id === REVIEWED_ETMV_REPORT_ID)
    assert.equal(target.length, 1)
    assert.equal(target[0]?.title, REVIEWED_ETMV_REPORT_TITLE_AFTER)
    const report2023 = reports.find(
      (row) => row.id === 'finland-food-market-ombudsman-2023',
    )
    assert.ok(report2023)
    assert.equal(
      report2023.title,
      'Elintarvikemarkkinavaltuutetun toimintakertomus 2023',
    )
    assert.equal(
      REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.boundary.mutatesSourceDocRows,
      false,
    )

    const untouched = reports.find((row) => row.id === 'nou-2011-4')!
    const oldTarget = {
      ...target[0]!,
      title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    }
    const projected = applyReviewedEtmvReportTitleRepairToSeed([
      oldTarget,
      untouched,
    ])
    assert.equal(projected[0]?.title, REVIEWED_ETMV_REPORT_TITLE_AFTER)
    assert.strictEqual(projected[1], untouched)
    assert.deepEqual(
      { ...projected[0], title: REVIEWED_ETMV_REPORT_TITLE_BEFORE },
      oldTarget,
    )
    assert.throws(
      () => applyReviewedEtmvReportTitleRepairToSeed([untouched]),
      /exactly one target/,
    )
  })
})

describe('reviewed ETMV Report title repair runner', () => {
  it('classifies exact all-before and all-after plans deterministically', () => {
    const before = plan('before')
    const after = plan('after')
    assert.equal(before.plan.atomicState, 'all_before')
    assert.equal(after.plan.atomicState, 'all_after')
    assert.deepEqual(assertReviewedEtmvPlanReady(before), {
      pendingTargets: 4,
      appliedTargets: 0,
    })
    assert.deepEqual(assertReviewedEtmvPlanReady(after), {
      pendingTargets: 0,
      appliedTargets: 4,
    })
    assert.equal(
      reviewedEtmvPlanSha256(before),
      reviewedEtmvPlanSha256(plan('before')),
    )
    assert.deepEqual(before.plan.dependencyScope,
      REVIEWED_ETMV_REPORT_TITLE_REPAIR_DEPENDENCY_SCOPE)
    assert.deepEqual(
      assertReviewedEtmvPostApply(before, after, fixturePinnedHashes),
      { pendingTargets: 0, appliedTargets: 4 },
    )
  })

  it('refuses hybrid, drifted, missing, and duplicate targets', () => {
    const hybrid = plan('hybrid')
    assert.equal(hybrid.plan.atomicState, 'hybrid')
    assert.ok(
      hybrid.plan.conflicts.some(
        (conflict) => conflict.code === 'hybrid_partial_state',
      ),
    )
    assert.throws(() => assertReviewedEtmvPlanReady(hybrid), /not ready/)

    const drifted = collections('before')
    drifted.sourceCitations[0] = {
      ...drifted.sourceCitations[0]!,
      publisher: 'Drifted publisher',
    }
    const driftPlan = buildReviewedEtmvPlanFromCollections(
      drifted,
      databaseIdentity,
      { pinnedHashes: fixturePinnedHashes, verifyProductionDerivation: false },
    )
    assert.ok(
      driftPlan.plan.conflicts.some(
        (conflict) => conflict.code === 'target_full_row_drift',
      ),
    )
    assert.ok(
      driftPlan.plan.conflicts.some(
        (conflict) => conflict.code === 'protected_field_drift',
      ),
    )

    const missing = collections('before')
    missing.documents = []
    const missingPlan = buildReviewedEtmvPlanFromCollections(
      missing,
      databaseIdentity,
      { pinnedHashes: fixturePinnedHashes, verifyProductionDerivation: false },
    )
    assert.ok(
      missingPlan.plan.conflicts.some(
        (conflict) => conflict.code === 'missing_target',
      ),
    )

    const duplicate = collections('before')
    duplicate.libraryAnalysisRecords.push(beforeLibraryAnalysis)
    const duplicatePlan = buildReviewedEtmvPlanFromCollections(
      duplicate,
      databaseIdentity,
      { pinnedHashes: fixturePinnedHashes, verifyProductionDerivation: false },
    )
    assert.ok(
      duplicatePlan.plan.conflicts.some(
        (conflict) => conflict.code === 'duplicate_target',
      ),
    )
  })

  it('binds every enumerated direct dependency and rejects post-proof drift', () => {
    const before = plan('before')
    const after = plan('after')
    const changedCollections = collections('after')
    changedCollections.documentRefs.push({
      id: 'doc-ref-new',
      fromId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
      toId: 'other-document',
      refType: 'references',
    })
    const changed = buildReviewedEtmvPlanFromCollections(
      changedCollections,
      databaseIdentity,
      { pinnedHashes: fixturePinnedHashes, verifyProductionDerivation: false },
    )
    assert.notEqual(
      changed.plan.dependencySha256,
      after.plan.dependencySha256,
    )
    assert.notEqual(
      reviewedEtmvPlanSha256(changed),
      reviewedEtmvPlanSha256(after),
    )
    assert.throws(
      () => assertReviewedEtmvPostApply(before, changed, fixturePinnedHashes),
      /transaction must roll back/,
    )

    const identityDrift = buildReviewedEtmvPlanFromCollections(
      collections('after'),
      {
        ...databaseIdentity,
        identityUuid: '123e4567-e89b-42d3-a456-426614174001',
      },
      { pinnedHashes: fixturePinnedHashes, verifyProductionDerivation: false },
    )
    assert.throws(
      () =>
        assertReviewedEtmvPostApply(before, identityDrift, fixturePinnedHashes),
      /transaction must roll back/,
    )
  })

  it('builds full-row CAS predicates while updating only approved columns', () => {
    const reportWhere = fullReviewedEtmvReportWhere(beforeReport)
    const documentWhere = fullReviewedEtmvDocumentWhere(beforeDocument)
    const citationWhere = fullReviewedEtmvSourceCitationWhere(beforeCitation)
    const libraryWhere = fullReviewedEtmvLibraryAnalysisWhere(
      beforeLibraryAnalysis,
    )
    assert.equal(reportWhere.documentId, REVIEWED_ETMV_REPORT_DOCUMENT_ID)
    assert.deepEqual(reportWhere.keyFindings, {
      equals: beforeReport.keyFindings,
    })
    assert.equal(documentWhere.filePath, beforeDocument.filePath)
    assert.equal(documentWhere.content, beforeDocument.content)
    assert.equal(documentWhere.updatedAt, beforeDocument.updatedAt)
    assert.equal(citationWhere.sourceClass, 'secondary')
    assert.equal(citationWhere.verificationStatus, 'machine_verified')
    assert.equal(citationWhere.archivedUrl, beforeCitation.archivedUrl)
    assert.equal(citationWhere.verifiedAt, beforeCitation.verifiedAt)
    assert.equal(libraryWhere.wordCount, beforeLibraryAnalysis.wordCount)
    assert.equal(libraryWhere.updatedAt, beforeLibraryAnalysis.updatedAt)
    assert.ok('aiCard' in libraryWhere)
    assert.ok('controlLinks' in libraryWhere)
  })

  it('enforces dry-run default and exact apply authorization', () => {
    assert.deepEqual(parseReviewedEtmvArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    })
    const authorized = parseReviewedEtmvArgs([
      '--apply',
      `--ack=${REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK}`,
      `--plan-sha256=${'a'.repeat(64)}`,
    ])
    assert.doesNotThrow(() =>
      assertReviewedEtmvApplyAuthorization(authorized),
    )
    assert.throws(
      () =>
        assertReviewedEtmvApplyAuthorization({
          ...authorized,
          ack: 'WRONG',
        }),
      /APPLY_REVIEWED_ETMV_REPORT_TITLE_REPAIR_1/,
    )
    assert.throws(
      () =>
        assertReviewedEtmvApplyAuthorization({
          ...authorized,
          expectedPlanSha256: 'A'.repeat(64),
        }),
      /64 lowercase hex/,
    )
    assert.throws(
      () => parseReviewedEtmvArgs(['--ack=unused']),
      /valid only with --apply/,
    )
    assert.throws(
      () => parseReviewedEtmvArgs(['--apply', '--apply']),
      /must not be repeated/,
    )
  })

  it('keeps CLI apply behind advisory/table/row locks, Serializable, CAS, and post proof', () => {
    const runner = readFileSync(
      'scripts/apply-reviewed-etmv-report-title-repair.ts',
      'utf8',
    )
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(
      runner,
      /transaction\.\$executeRaw`[\s\S]{0,200}pg_advisory_xact_lock/,
    )
    assert.match(runner, /LOCK TABLE/)
    assert.match(runner, /SHARE ROW EXCLUSIVE MODE/)
    assert.match(runner, /FOR SHARE/)
    assert.match(runner, /FOR[\s\S]*UPDATE/)
    assert.match(runner, /TransactionIsolationLevel\.Serializable/)
    assert.match(runner, /fullReviewedEtmvReportWhere/)
    assert.match(runner, /fullReviewedEtmvDocumentWhere/)
    assert.match(runner, /fullReviewedEtmvSourceCitationWhere/)
    assert.match(runner, /fullReviewedEtmvLibraryAnalysisWhere/)
    assert.match(runner, /lockedDigest !== initialDigest/)
    assert.match(
      runner,
      /const after = await inspectReviewedEtmvState\(transaction\)[\s\S]*assertReviewedEtmvPostApply\(locked, after\)/,
    )
    assert.match(runner, /transaction must roll back/)

    const seed = readFileSync('prisma/seed-data/reports.ts', 'utf8')
    assert.match(seed, /applyReviewedEtmvReportTitleRepairToSeed/)
    assert.match(
      seed,
      /export const reports: Report\[\] = applyReviewedEtmvReportTitleRepairToSeed\(/,
    )
  })
})
