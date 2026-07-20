import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  assessLibraryAnalysisExternalReadiness,
  auditLibraryAnalysisArtifacts,
} from '../../src/lib/library-analysis-audit'

describe('library analysis audit', () => {
  it('keeps internal AI readiness separate from external claim readiness', () => {
    const readiness = assessLibraryAnalysisExternalReadiness([
      JSON.stringify({
        sourceKey: 'document:doc-1',
        status: 'approved_internal',
        usageRule: 'safe_for_ai_context',
        reviewStatus: 'not_required',
        reviewedAt: null,
        reviewer: null,
      }),
      JSON.stringify({
        sourceKey: 'document:doc-2',
        status: 'ai_draft',
        usageRule: 'internal_background',
        reviewStatus: 'not_reviewed',
        reviewedAt: null,
        reviewer: null,
      }),
    ].join('\n') + '\n')

    assert.equal(readiness.ledgerValid, true)
    assert.equal(readiness.status, 'not_ready')
    assert.equal(readiness.safeForAiContextRows, 1)
    assert.equal(readiness.aiDraftRows, 1)
    assert.equal(readiness.humanReviewedRows, 0)
    assert.equal(readiness.reviewProvenanceAvailable, true)
    assert.equal(readiness.externalClaimContractAvailable, true)
    assert.equal(readiness.externalClaimEligibleRows, 0)
    assert.ok(readiness.blockers.some(blocker => /no rows.*human review/.test(blocker)))
  })

  it('counts only complete human external approvals and rejects incomplete external markers', () => {
    const validRow = {
      sourceKind: 'document',
      sourceKey: 'document:valid',
      linkedDocumentId: 'valid',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidateCount: 0,
    }
    const incompleteRow = {
      ...validRow,
      sourceKey: 'document:incomplete',
      linkedDocumentId: 'incomplete',
      reviewStatus: 'not_reviewed',
      reviewedAt: null,
      reviewer: null,
    }

    const readiness = assessLibraryAnalysisExternalReadiness(`${JSON.stringify(validRow)}\n`)
    assert.equal(readiness.externalClaimEligibleRows, 1)
    assert.equal(readiness.invalidExternalApprovalRows, 0)
    assert.equal(readiness.externalCitationPolicyBlockedRows, 0)
    assert.equal(readiness.externalClaimContractAvailable, true)

    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: `${JSON.stringify(incompleteRow)}\n`,
      summaryContent: [
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 1 |',
        '| Review queue | 0 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 0 |',
      ].join('\n'),
      localFileExists: () => true,
    })
    assert.ok(failures.some(failure => /review_status_not_approved/.test(failure)))
    assert.ok(failures.some(failure => /review_provenance_missing/.test(failure)))

    const invalidReadiness = assessLibraryAnalysisExternalReadiness(`${JSON.stringify(incompleteRow)}\n`)
    assert.equal(invalidReadiness.ledgerValid, false)
    assert.equal(invalidReadiness.invalidExternalApprovalRows, 1)
    assert.ok(invalidReadiness.blockers.some(blocker => /violate the approval contract/.test(blocker)))
  })

  it('fails static readiness when current citation eligibility is lost or replaced', () => {
    const baseRow = {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      linkedDocumentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: null,
      riskFlags: [],
      claimCandidateCount: 0,
    }

    const locatorLost = assessLibraryAnalysisExternalReadiness(`${JSON.stringify(baseRow)}\n`)
    assert.equal(locatorLost.ledgerValid, false)
    assert.equal(locatorLost.externalClaimEligibleRows, 0)
    assert.equal(locatorLost.externalCitationPolicyBlockedRows, 1)
    assert.ok(locatorLost.blockers.some(blocker => /current citation policy binding/.test(blocker)))

    const locatorReplaced = assessLibraryAnalysisExternalReadiness(`${JSON.stringify({
      ...baseRow,
      currentExternalCitationPolicyHash: 'd'.repeat(64),
    })}\n`)
    assert.equal(locatorReplaced.ledgerValid, false)
    assert.equal(locatorReplaced.externalClaimEligibleRows, 0)
    assert.equal(locatorReplaced.externalCitationPolicyBlockedRows, 1)
  })

  it('accepts matching ledger, summary, and repair backlog artifacts', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      repairBacklogJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
          priority: 'P3',
        }],
        summary: {
          byRepairKind: { existing_low_text: 1 },
          byRepairBatch: { markdown_low_text_review: 1 },
        },
      }),
      repairBacklogMarkdownContent: [
        '# Library Analysis Repair Backlog',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total repair rows | 1 |',
        '| existing_low_text | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| markdown_low_text_review | 1 |',
      ].join('\n'),
      pdfExtractionProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          status: 'extractable_500_plus',
        }],
        summary: {
          byStatus: { extractable_500_plus: 1 },
          extractableRows: 1,
          mechanicalRepairCandidates: 1,
        },
      }),
      pdfExtractionProfileMarkdownContent: [
        '# Library Analysis PDF Extraction Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total PDF repair rows | 1 |',
        '| Extractable rows | 1 |',
        '| Mechanical repair candidates | 1 |',
        '',
        '### Extraction Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| extractable_500_plus | 1 |',
      ].join('\n'),
      pdfTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 10,
          nextContent: '[omitted from handoff; generated in-memory during repair]',
        }],
        summary: {
          byAction: { update: 1 },
          updateRows: 1,
          totalWordGain: 10,
        },
      }),
      pdfTextRepairPlanMarkdownContent: [
        '# Library Analysis PDF Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 1 |',
        '| Total word gain | 10 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
          '| update | 1 |',
      ].join('\n'),
      localTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          repairBatch: 'text_low_text_review',
          wordGain: 10,
          nextContent: '[omitted from handoff; generated in-memory during repair]',
        }],
        summary: {
          byAction: { update: 1 },
          byRepairBatch: { text_low_text_review: 1 },
          updateRows: 1,
          totalWordGain: 10,
          clearsLowTextRows: 1,
        },
      }),
      localTextRepairPlanMarkdownContent: [
        '# Library Analysis Local Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 1 |',
        '| Total word gain | 10 |',
        '| Clears low-text rows | 1 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| update | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| text_low_text_review | 1 |',
      ].join('\n'),
      manualLocalMatchRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 20,
          nextContent: '[omitted from handoff; generated in-memory during repair]',
        }],
        summary: {
          byAction: { update: 1 },
          updateRows: 1,
          totalWordGain: 20,
          clearsLowTextRows: 1,
        },
      }),
      manualLocalMatchRepairPlanMarkdownContent: [
        '# Library Analysis Manual Local Match Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 1 |',
        '| Total word gain | 20 |',
        '| Clears low-text rows | 1 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| update | 1 |',
      ].join('\n'),
      manualUrlMatchRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 30,
          nextContent: '[omitted from handoff; generated in-memory during repair]',
        }],
        summary: {
          byAction: { update: 1 },
          updateRows: 1,
          totalWordGain: 30,
          clearsLowTextRows: 1,
        },
      }),
      manualUrlMatchRepairPlanMarkdownContent: [
        '# Library Analysis Manual URL Match Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 1 |',
        '| Total word gain | 30 |',
        '| Clears low-text rows | 1 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| update | 1 |',
      ].join('\n'),
      locatorProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          locatorStatus: 'url_backed_no_local_file',
          repairBatch: 'missing_document_locator_search',
          locatorSignals: ['document_url'],
        }],
        summary: {
          byLocatorStatus: { url_backed_no_local_file: 1 },
          byRepairBatch: { missing_document_locator_search: 1 },
          byLocatorSignal: { document_url: 1 },
          rowsWithExternalLocator: 1,
          localMatchCandidates: 0,
          trueLocatorGaps: 0,
        },
      }),
      locatorProfileMarkdownContent: [
        '# Library Analysis Locator Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Rows with external locator | 1 |',
        '| Local match candidates | 0 |',
        '| True locator gaps | 0 |',
        '',
        '### Locator Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| url_backed_no_local_file | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_document_locator_search | 1 |',
        '',
        '### Locator Signal',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| document_url | 1 |',
      ].join('\n'),
      urlTextExtractionProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          status: 'extractable_500_plus',
          contentKind: 'pdf',
          repairBatch: 'missing_document_locator_search',
          extractedWordCount: 600,
          wordGain: 540,
        }],
        summary: {
          byStatus: { extractable_500_plus: 1 },
          byContentKind: { pdf: 1 },
          byRepairBatch: { missing_document_locator_search: 1 },
          extractableRows: 1,
          mechanicalRepairCandidates: 1,
          totalExtractedWords: 600,
        },
      }),
      urlTextExtractionProfileMarkdownContent: [
        '# Library Analysis URL Text Extraction Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Extractable rows | 1 |',
        '| Mechanical repair candidates | 1 |',
        '| Total extracted words | 600 |',
        '',
        '### Extraction Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| extractable_500_plus | 1 |',
        '',
        '### Content Kind',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| pdf | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_document_locator_search | 1 |',
      ].join('\n'),
      urlTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          contentKind: 'pdf',
          repairBatch: 'missing_document_locator_search',
          wordGain: 540,
          nextContent: '[omitted from handoff; generated in-memory during repair]',
        }],
        summary: {
          byAction: { update: 1 },
          byContentKind: { pdf: 1 },
          byRepairBatch: { missing_document_locator_search: 1 },
          updateRows: 1,
          totalWordGain: 540,
          clearsLowTextRows: 1,
        },
      }),
      urlTextRepairPlanMarkdownContent: [
        '# Library Analysis URL Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 1 |',
        '| Total word gain | 540 |',
        '| Clears low-text rows | 1 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| update | 1 |',
        '',
        '### Content Kind',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| pdf | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_document_locator_search | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.deepEqual(failures, [])
  })

  it('fails rows whose canonical paths do not resolve locally', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Approved missing file',
          canonicalPath: 'missing.pdf',
          status: 'approved_internal',
          usageRule: 'safe_for_ai_context',
          reviewRequired: false,
          riskFlags: [],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 1 |',
        '| Review queue | 0 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 0 |',
      ].join('\n'),
      localFileExists: () => false,
    })

    assert.ok(failures.some(failure => failure.includes('unresolved canonicalPath missing.pdf')))
  })

  it('allows unresolved canonical paths for draft internal-background rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Draft missing file',
          canonicalPath: 'missing-draft.pdf',
          status: 'ai_draft',
          usageRule: 'internal_background',
          reviewRequired: false,
          riskFlags: [],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 0 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 0 |',
      ].join('\n'),
      localFileExists: () => false,
    })

    assert.deepEqual(failures, [])
  })

  it('fails when the summary metrics do not match ledger rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 0 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('summary Missing text is 0 but ledger computes 1')))
  })

  it('fails when repair backlog batch summaries do not match repair rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      repairBacklogJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          repairKind: 'existing_low_text',
          repairBatch: 'markdown_low_text_review',
          priority: 'P3',
        }],
        summary: {
          byRepairKind: { existing_low_text: 1 },
          byRepairBatch: { pdf_text_extraction: 1 },
        },
      }),
      repairBacklogMarkdownContent: [
        '# Library Analysis Repair Backlog',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total repair rows | 1 |',
        '| existing_low_text | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| pdf_text_extraction | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('repair backlog byRepairBatch markdown_low_text_review is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('repair backlog byRepairBatch pdf_text_extraction is 1 but rows compute 0')))
  })

  it('fails when PDF extraction profile summaries do not match profile rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      pdfExtractionProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          status: 'extractable_500_plus',
        }],
        summary: {
          byStatus: { no_gain: 1 },
          extractableRows: 0,
          mechanicalRepairCandidates: 0,
        },
      }),
      pdfExtractionProfileMarkdownContent: [
        '# Library Analysis PDF Extraction Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total PDF repair rows | 1 |',
        '| Extractable rows | 0 |',
        '| Mechanical repair candidates | 0 |',
        '',
        '### Extraction Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| no_gain | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('PDF extraction profile byStatus extractable_500_plus is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('PDF extraction profile Extractable rows is 0 but rows compute 1')))
  })

  it('fails when PDF text repair plan summaries do not match plan rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      pdfTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 10,
          nextContent: 'full extracted text should not be in handoff',
        }],
        summary: {
          byAction: { skip_no_gain: 1 },
          updateRows: 0,
          totalWordGain: 0,
        },
      }),
      pdfTextRepairPlanMarkdownContent: [
        '# Library Analysis PDF Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 0 |',
        '| Total word gain | 0 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| skip_no_gain | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('PDF text repair plan byAction update is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('PDF text repair plan Update rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('PDF text repair plan row document:doc-1 includes full nextContent')))
  })

  it('fails when local text repair plan summaries do not match plan rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      localTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          repairBatch: 'text_low_text_review',
          wordGain: 10,
          nextContent: 'full local text should not be in handoff',
        }],
        summary: {
          byAction: { skip_no_gain: 1 },
          byRepairBatch: { markdown_low_text_review: 1 },
          updateRows: 0,
          totalWordGain: 0,
          clearsLowTextRows: 0,
        },
      }),
      localTextRepairPlanMarkdownContent: [
        '# Library Analysis Local Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 0 |',
        '| Total word gain | 0 |',
        '| Clears low-text rows | 0 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| skip_no_gain | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| markdown_low_text_review | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('local text repair plan byAction update is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('local text repair plan byRepairBatch text_low_text_review is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('local text repair plan Update rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('local text repair plan row document:doc-1 includes full nextContent')))
  })

  it('fails when manual local match repair plan summaries do not match plan rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      manualLocalMatchRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 20,
          nextContent: 'full manual local text should not be in handoff',
        }],
        summary: {
          byAction: { skip_no_gain: 1 },
          updateRows: 0,
          totalWordGain: 0,
          clearsLowTextRows: 0,
        },
      }),
      manualLocalMatchRepairPlanMarkdownContent: [
        '# Library Analysis Manual Local Match Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 0 |',
        '| Total word gain | 0 |',
        '| Clears low-text rows | 0 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| skip_no_gain | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('manual local match repair plan byAction update is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('manual local match repair plan Update rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('manual local match repair plan row document:doc-1 includes full nextContent')))
  })

  it('fails when manual URL match repair plan summaries do not match plan rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      manualUrlMatchRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          wordGain: 30,
          nextContent: 'full manual URL text should not be in handoff',
        }],
        summary: {
          byAction: { skip_no_gain: 1 },
          updateRows: 0,
          totalWordGain: 0,
          clearsLowTextRows: 0,
        },
      }),
      manualUrlMatchRepairPlanMarkdownContent: [
        '# Library Analysis Manual URL Match Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 0 |',
        '| Total word gain | 0 |',
        '| Clears low-text rows | 0 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| skip_no_gain | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('manual URL match repair plan byAction update is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('manual URL match repair plan Update rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('manual URL match repair plan row document:doc-1 includes full nextContent')))
  })

  it('fails when locator profile summaries do not match profile rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      locatorProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          locatorStatus: 'url_backed_no_local_file',
          repairBatch: 'missing_document_locator_search',
          locatorSignals: ['document_url'],
        }],
        summary: {
          byLocatorStatus: { locator_missing: 1 },
          byRepairBatch: { missing_sourcedoc_locator: 1 },
          byLocatorSignal: { source_doc_url: 1 },
          rowsWithExternalLocator: 0,
          localMatchCandidates: 1,
          trueLocatorGaps: 1,
        },
      }),
      locatorProfileMarkdownContent: [
        '# Library Analysis Locator Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Rows with external locator | 0 |',
        '| Local match candidates | 1 |',
        '| True locator gaps | 1 |',
        '',
        '### Locator Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| locator_missing | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_sourcedoc_locator | 1 |',
        '',
        '### Locator Signal',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| source_doc_url | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('locator profile byLocatorStatus url_backed_no_local_file is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('locator profile byRepairBatch missing_document_locator_search is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('locator profile byLocatorSignal document_url is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('locator profile Rows with external locator is 0 but rows compute 1')))
  })

  it('fails when URL text extraction profile summaries do not match profile rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      urlTextExtractionProfileJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          status: 'extractable_500_plus',
          contentKind: 'pdf',
          repairBatch: 'missing_document_locator_search',
          extractedWordCount: 600,
          wordGain: 540,
        }],
        summary: {
          byStatus: { small_text: 1 },
          byContentKind: { html: 1 },
          byRepairBatch: { missing_sourcedoc_locator: 1 },
          extractableRows: 0,
          mechanicalRepairCandidates: 0,
          totalExtractedWords: 0,
        },
      }),
      urlTextExtractionProfileMarkdownContent: [
        '# Library Analysis URL Text Extraction Profile',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Extractable rows | 0 |',
        '| Mechanical repair candidates | 0 |',
        '| Total extracted words | 0 |',
        '',
        '### Extraction Status',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| small_text | 1 |',
        '',
        '### Content Kind',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| html | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_sourcedoc_locator | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('URL text extraction profile byStatus extractable_500_plus is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text extraction profile byContentKind pdf is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text extraction profile Extractable rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text extraction profile Total extracted words is 0 but rows compute 600')))
  })

  it('fails when URL text repair plan summaries do not match plan rows', () => {
    const failures = auditLibraryAnalysisArtifacts({
      ledgerContent: [
        JSON.stringify({
          sourceKind: 'document',
          sourceKey: 'document:doc-1',
          title: 'Low text review',
          canonicalPath: 'research/low-text.md',
          status: 'review_required',
          usageRule: 'internal_background',
          reviewRequired: true,
          riskFlags: ['low_text_quality'],
          claimCandidateCount: 0,
        }),
      ].join('\n') + '\n',
      summaryContent: [
        '# Library Analysis Summary',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total sources | 1 |',
        '| Finished internal | 0 |',
        '| Review queue | 1 |',
        '| Blocked | 0 |',
        '| Type-B actor gates | 0 |',
        '| Type-C gaps | 0 |',
        '| Claim candidates | 0 |',
        '| Missing text | 1 |',
      ].join('\n'),
      urlTextRepairPlanJsonContent: JSON.stringify({
        total: 1,
        rows: [{
          sourceKey: 'document:doc-1',
          action: 'update',
          contentKind: 'pdf',
          repairBatch: 'missing_document_locator_search',
          wordGain: 540,
          nextContent: 'full URL text should not be in handoff',
        }],
        summary: {
          byAction: { skip_no_gain: 1 },
          byContentKind: { html: 1 },
          byRepairBatch: { missing_sourcedoc_locator: 1 },
          updateRows: 0,
          totalWordGain: 0,
          clearsLowTextRows: 0,
        },
      }),
      urlTextRepairPlanMarkdownContent: [
        '# Library Analysis URL Text Repair Plan',
        '',
        '| Metric | Count |',
        '|---|---:|',
        '| Total rows | 1 |',
        '| Update rows | 0 |',
        '| Total word gain | 0 |',
        '| Clears low-text rows | 0 |',
        '',
        '### Action',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| skip_no_gain | 1 |',
        '',
        '### Content Kind',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| html | 1 |',
        '',
        '### Repair Batch',
        '',
        '| Value | Count |',
        '|---|---:|',
        '| missing_sourcedoc_locator | 1 |',
      ].join('\n'),
      localFileExists: () => true,
    })

    assert.ok(failures.some(failure => failure.includes('URL text repair plan byAction update is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text repair plan byContentKind pdf is missing but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text repair plan Update rows is 0 but rows compute 1')))
    assert.ok(failures.some(failure => failure.includes('URL text repair plan row document:doc-1 includes full nextContent')))
  })
})
