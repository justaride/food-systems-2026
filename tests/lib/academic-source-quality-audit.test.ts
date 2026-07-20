import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  academicSourceQualityExitCode,
  buildAcademicDatabaseAudit,
  buildAcademicExternalReadiness,
  buildAcademicSourceQualityRepairQueue,
  buildAcademicSourceQualitySnapshot,
  formatAcademicSourceQualityRepairQueueMarkdown,
  formatAcademicSourceQualityStatusMarkdown,
  isValidAbsoluteHttpUrl,
  isValidDoiSyntax,
  parseAcademicSourceQualityArgs,
  type AcademicDatabaseRows,
  type AcademicSeedCorpus,
} from '../../scripts/audit-academic-source-quality'
import { reports } from '../../prisma/seed-data/reports'
import { theses } from '../../prisma/seed-data/theses'
import { sources } from '../../prisma/seed-data/sources'

describe('academic source quality audit', () => {
  const generatedAt = '2026-07-19T00:00:00.000Z'

  it('separates the regression minimum from external academic readiness', () => {
    const snapshot = buildAcademicSourceQualitySnapshot(generatedAt)

    assert.equal(snapshot.regressionGate.status, 'pass')
    assert.equal(snapshot.externalReadiness.status, 'not_ready')
    assert.equal(snapshot.scope.database.status, 'unavailable')
    assert.equal(academicSourceQualityExitCode(snapshot), 0)
    assert.equal(academicSourceQualityExitCode(snapshot, true), 1)
    assert.equal(academicSourceQualityExitCode(snapshot, false, true), 1)

    const sourceDocUrl = snapshot.regressionGate.checks.find(check => (
      check.set === 'SourceDoc' && check.key === 'url'
    ))
    assert.ok(sourceDocUrl)
    assert.equal(sourceDocUrl.present, 102)
    assert.ok(sourceDocUrl.pct >= 44)
    assert.match(sourceDocUrl.label, /valid absolute http\(s\)/i)

    const reportUrl = snapshot.regressionGate.checks.find(check => (
      check.set === 'Report' && check.key === 'source_url'
    ))
    const thesisIdentifiers = snapshot.regressionGate.checks.find(check => (
      check.set === 'Thesis' && check.key === 'persistent_identifier'
    ))
    const thesisDois = snapshot.regressionGate.checks.find(check => (
      check.set === 'Thesis' && check.key === 'doi'
    ))
    const reportDois = snapshot.regressionGate.checks.find(check => (
      check.set === 'Report' && check.key === 'doi'
    ))
    const sourceDocDois = snapshot.regressionGate.checks.find(check => (
      check.set === 'SourceDoc' && check.key === 'doi'
    ))
    assert.equal(reportUrl?.present, 126)
    assert.equal(thesisIdentifiers?.present, 37)
    assert.equal(thesisDois?.present, 1)
    assert.equal(reportDois?.present, 22)
    assert.equal(sourceDocDois?.present, 10)
    assert.deepEqual(
      snapshot.regressionGate.checks
        .filter(check => ['access_date', 'accessed_at', 'provenance_type'].includes(check.key))
        .map(check => [check.set, check.key, check.minPresent]),
      [
        ['Report', 'access_date', 92],
        ['Report', 'provenance_type', 125],
        ['Thesis', 'access_date', 78],
        ['SourceDoc', 'accessed_at', 76],
        ['SourceDoc', 'provenance_type', 156],
      ],
    )
    assert.deepEqual(
      snapshot.urlSyntax.find(profile => profile.set === 'SourceDoc'),
      {
        set: 'SourceDoc',
        field: 'url',
        total: 183,
        nonEmpty: 102,
        validAbsoluteHttpUrl: 102,
        invalidNonEmpty: 0,
        missing: 81,
      },
    )

    assert.deepEqual(
      snapshot.identifierSyntax.find(profile => profile.set === 'Thesis'),
      {
        set: 'Thesis',
        field: 'doi',
        total: 78,
        nonEmpty: 37,
        validDoi: 1,
        otherPersistentIdentifier: 36,
        unrecognizedNonEmpty: 0,
        otherPersistentIdentifierSchemes: {
          hdl: 24,
          diva2: 7,
          slu: 4,
          urn: 1,
        },
      },
    )

    const appraisal = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'appraisal_status'
    ))
    const thesisMethod = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'thesis_method'
    ))
    assert.equal(appraisal?.status, 'unsupported')
    assert.equal(thesisMethod?.status, 'ready')
    const sourceDocProvenance = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'source_doc_provenance'
    ))
    const reportProvenance = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'report_provenance'
    ))
    const reportLocator = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'report_locator'
    ))
    assert.equal(reportProvenance?.present, 139)
    assert.equal(reportProvenance?.total, 139)
    assert.equal(reportProvenance?.status, 'ready')
    assert.equal(reportLocator?.present, 101)
    assert.equal(reportLocator?.total, 101)
    assert.equal(reportLocator?.status, 'ready')
    assert.equal(sourceDocProvenance?.present, 181)
    assert.equal(sourceDocProvenance?.total, 183)
    assert.equal(sourceDocProvenance?.status, 'gap')
    const sourceDocLocator = snapshot.externalReadiness.dimensions.find(dimension => (
      dimension.key === 'source_doc_locator'
    ))
    assert.equal(sourceDocLocator?.present, 99)
    assert.equal(sourceDocLocator?.total, 103)
    assert.equal(sourceDocLocator?.status, 'gap')
  })

  it('fails closed on unknown CLI flags and makes the release gate require database parity', () => {
    assert.deepEqual(parseAcademicSourceQualityArgs([]), {
      requireExternalReady: false,
      requireDatabaseParity: false,
      releaseGate: false,
    })
    assert.deepEqual(parseAcademicSourceQualityArgs(['--release-gate']), {
      requireExternalReady: false,
      requireDatabaseParity: true,
      releaseGate: true,
    })
    assert.deepEqual(parseAcademicSourceQualityArgs(['--require-external-ready', '--require-db-parity']), {
      requireExternalReady: true,
      requireDatabaseParity: true,
      releaseGate: false,
    })
    assert.throws(
      () => parseAcademicSourceQualityArgs(['--require-databse-parity']),
      /Unknown academic source-quality argument.*--require-databse-parity/,
    )
  })

  it('distinguishes valid DOI and absolute URL syntax from lookalike metadata', () => {
    assert.equal(isValidDoiSyntax('10.1016/j.ijindorg.2014.11.001'), true)
    assert.equal(isValidDoiSyntax('https://doi.org/10.1787/59cf6c95-en'), true)
    assert.equal(isValidDoiSyntax('hdl:11250/3051794'), false)
    assert.equal(isValidDoiSyntax('diva2:1595067'), false)

    assert.equal(isValidAbsoluteHttpUrl('https://example.test/work'), true)
    assert.equal(isValidAbsoluteHttpUrl('http://example.test/work'), true)
    assert.equal(isValidAbsoluteHttpUrl('example.test/work'), false)
    assert.equal(isValidAbsoluteHttpUrl('/relative/work'), false)
  })

  it('keeps unresolved SourceDoc locators in an evidence-preserving repair queue', () => {
    const queue = buildAcademicSourceQualityRepairQueue(generatedAt)

    assert.equal(queue.reportProvenanceReviewCount, 0)
    assert.equal(queue.reportInternalEvidenceCount, 38)
    assert.equal(queue.sourceDocProvenanceReviewCount, 2)
    assert.equal(queue.sourceDocInternalEvidenceCount, 78)
    assert.equal(queue.sourceDocUrlGapCount, 4)
    assert.equal(queue.sourceDocActiveUrlGapCount, 4)
    assert.equal(queue.sourceDocDuplicateUrlGapCount, 0)
    assert.equal(queue.sourceDocUrlRows.some(row => row.id === 'src-88'), false)
    assert.equal(queue.sourceDocUrlRows.some(row => row.id === 'src-89'), false)
    assert.equal(queue.sourceDocUrlRows.filter(row => row.locatorIssue === 'missing_url').length, 4)
    assert.equal(queue.sourceDocUrlRows.filter(row => row.locatorIssue === 'invalid_absolute_http_url').length, 0)
    assert.equal(queue.accessDateReviewCount, 29)
    assert.equal(queue.liveAccessDateGapCount, 33)
    assert.equal(queue.accessDateReviewRows.filter(row => row.set === 'Report').length, 9)
    assert.equal(queue.accessDateReviewRows.filter(row => row.set === 'Thesis').length, 0)
    assert.equal(queue.accessDateReviewRows.filter(row => row.set === 'SourceDoc').length, 20)
    assert.equal(queue.accessDateReviewRows.some(row => row.id === 'jacobsen-jansson-2022'), false)
    assert.equal(queue.accessDateReviewRows.some(row => row.id === 'nguyen-hartmann-2024'), false)
    assert.ok(queue.accessDateReviewRows.every(row => /^https?:\/\//u.test(row.url)))
    assert.ok(queue.sourceDocUrlRows.every(row => (
      row.missingFields.includes('url') || row.missingFields.includes('validAbsoluteHttpUrl')
    )))
    assert.ok(queue.sourceDocUrlRows.every(row => /do not infer|manually|verify the existing DOI/i.test(row.nextAction)))
    assert.equal(queue.sourceDocUrlRows.some(row => row.id === 'src-29'), false)
    assert.deepEqual(
      queue.sourceDocProvenanceReviewRows.map(row => row.id),
      ['src-77', 'src-87'],
    )
    assert.equal(queue.sourceDocProvenanceReviewRows.some(row => row.id === 'src-1'), false)
    assert.equal(queue.sourceDocProvenanceReviewRows.some(row => row.id === 'src-46'), false)
    assert.deepEqual(
      queue.systemGaps.map(gap => gap.key),
      [
        'report_provenance_review',
        'invalid_source_doc_url_syntax',
        'source_doc_provenance_review',
        'internal_evidence_identity',
        'duplicate_locator_reconciliation',
        'access_dates',
        'peer_review_appraisal',
        'study_design_and_bias',
        'claim_anchors',
      ],
    )
    assert.equal(
      queue.systemGaps.find(gap => gap.key === 'study_design_and_bias')?.affectedRows,
      400,
    )
    assert.deepEqual(
      queue.executionWaves.map(wave => [wave.priority, wave.key, wave.scopeCount]),
      [
        [1, 'identity_truth_gate', 0],
        [2, 'appraisal_pilot', 3],
        [3, 'external_access_dates', 33],
        [4, 'provenance_classification', 2],
        [5, 'appraisal_corpus', 397],
        [6, 'claim_anchor_expansion', 400],
      ],
    )
    assert.deepEqual(queue.executionWaves[1]?.targetIds, [
      'SourceDoc:src-30',
      'SourceDoc:src-32',
      'SourceDoc:src-45',
    ])
    assert.ok(queue.executionWaves.every(wave => wave.humanReviewRequired))
    assert.match(
      queue.systemGaps.find(gap => gap.key === 'peer_review_appraisal')?.action ?? '',
      /active model.*same target/i,
    )
    assert.deepEqual(queue.duplicateLocatorSummary, {
      reportGroups: 4,
      reportRows: 8,
      sourceDocGroups: 0,
      sourceDocRows: 0,
      validAbsoluteHttpUrlGroups: 4,
      invalidUrlSyntaxGroups: 0,
    })
    assert.equal(
      queue.duplicateLocatorGroups
        .flatMap(group => group.rows)
        .find(row => row.id === 'dagligvaretilsynet-aarsrapport-2024')
        ?.likelyMisbinding ?? false,
      false,
    )
    assert.equal(
      queue.duplicateLocatorGroups.some(group => (
        group.set === 'Report' &&
        group.locatorSyntax === 'valid_absolute_http_url' &&
        group.canonicalLocator.includes('/r15-2023-') &&
        group.rowCount === 2
      )),
      true,
    )
  })

  it('reconciles injected database scope and measures database metadata coverage', () => {
    const database = buildAcademicDatabaseAudit({
      reports: [
        { id: 'report-test-1', title: 'Report one', year: 2025, institution: 'Authority', author: null, sourceUrl: 'https://example.test/report', doi: null, accessedAt: '2026-07-19', provenanceType: 'external_report' },
        { id: 'report-test-2', title: 'Report two', year: null, institution: null, author: null, sourceUrl: 'example.test/report', doi: 'hdl:123/456', accessedAt: null, provenanceType: null },
      ],
      theses: [
        { id: 'thesis-test-1', title: 'Thesis one', year: 2024, institution: 'University', authors: 'Researcher', method: null, url: 'https://example.test/thesis', doi: 'hdl:123/456', accessDate: null },
      ],
      sourceDocs: [
        { id: 'source-test-1', filename: 'source.pdf', title: 'Source one', year: '2024', author: 'Agency', sourceType: 'rapport', description: 'Description', relevance: 'Relevance', url: 'https://example.test/source', doi: null, publisher: 'Agency', isDuplicate: false, accessedAt: '2026-07-19', archivedUrl: null, provenanceType: 'official_primary' },
      ],
      fieldCitations: [
        {
          entityType: 'Report',
          entityId: 'report-test-1',
          fieldPath: 'keyFindings[0]',
          claimText: 'Anchored finding',
          citation: { pageRef: 'p. 4', quote: null },
        },
        {
          entityType: 'SourceDoc',
          entityId: 'source-test-1',
          fieldPath: 'description',
          claimText: null,
          citation: { pageRef: 'p. 2', quote: null },
        },
      ],
    })
    const snapshot = buildAcademicSourceQualitySnapshot(generatedAt, database)

    assert.equal(database.status, 'available')
    assert.equal(database.parity.status, 'mismatch')
    assert.deepEqual(database.counts, {
      reportRows: 2,
      thesisRows: 1,
      sourceDocRows: 1,
      totalRows: 4,
    })
    assert.deepEqual(
      database.parity.differences.map(row => row.delta),
      [-137, -77, -182],
    )
    assert.deepEqual(
      database.parity.differences.map(row => row.databaseOnlyIds.length),
      [2, 1, 1],
    )
    assert.deepEqual(
      database.parity.differences.map(row => row.seedOnlyIds.length),
      [139, 78, 183],
    )
    assert.deepEqual(
      database.coverage.find(check => check.set === 'Report' && check.key === 'source_url'),
      {
        set: 'Report',
        key: 'source_url',
        label: 'valid absolute http(s) sourceUrl',
        present: 1,
        total: 2,
        pct: 50,
        modeled: true,
      },
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Thesis' && check.key === 'persistent_identifier')?.present,
      1,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Thesis' && check.key === 'doi')?.present,
      0,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Thesis' && check.key === 'study_design_and_bias')?.modeled,
      true,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Thesis' && check.key === 'study_design_and_bias')?.present,
      0,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Report' && check.key === 'access_date')?.present,
      1,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'Report' && check.key === 'claim_anchor')?.present,
      1,
    )
    assert.equal(
      snapshot.externalReadiness.dimensions.find(check => check.key === 'claim_anchor')?.status,
      'gap',
    )
    assert.equal(
      snapshot.externalReadiness.dimensions.find(check => check.key === 'claim_anchor')?.present,
      0,
    )
    assert.equal(
      snapshot.externalReadiness.dimensions.find(check => check.key === 'claim_anchor')?.total,
      0,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'SourceDoc' && check.key === 'claim_anchor')?.present,
      0,
    )
    assert.equal(
      database.coverage.find(check => check.set === 'SourceDoc' && check.key === 'provenance_type')?.present,
      1,
    )
    assert.equal(academicSourceQualityExitCode(snapshot), 0)
    assert.equal(academicSourceQualityExitCode(snapshot, false, true), 1)
  })

  it('has an attainable external-ready path without treating exclusions as externally usable', () => {
    const sourceHash = 'a'.repeat(64)
    const reportId = 'external-ready-test'
    const seedReport = {
      ...reports[0]!,
      id: reportId,
      title: 'Externally reviewed test report',
      institution: 'Independent research institute',
      author: 'Named researcher',
      year: 2025,
      sourceUrl: 'https://www.norden.org/en/publication/external-ready-test',
      accessedAt: '2026-07-19',
      provenanceType: 'external_report' as const,
    }
    const seedCorpus: AcademicSeedCorpus = {
      reports: [seedReport],
      theses: [],
      sources: [],
    }
    const reviewedAppraisal: NonNullable<AcademicDatabaseRows['appraisals']>[number] = {
      reportId,
      thesisId: null,
      sourceDocId: null,
      status: 'reviewed',
      basis: 'peer_reviewed',
      studyDesign: 'observational',
      methodologySummary: 'Full-text review of the stated observational method.',
      sampleOrCoverage: 'Nordic retail sample.',
      applicability: 'direct',
      applicabilityContext: 'Nordic food-system evidence.',
      limitationsStatus: 'identified',
      limitations: ['Limited temporal coverage.'],
      riskOfBias: 'low',
      riskOfBiasNotes: 'Sampling, measurement, and reporting were reviewed.',
      framework: 'FS2026 evidence appraisal',
      frameworkVersion: '1',
      reviewMethod: 'full_text',
      reviewBasisCitationId: 'citation-external-ready',
      reviewedSourceHash: sourceHash,
      hashAlgorithm: 'sha256',
      reviewedBy: 'Named reviewer',
      reviewedAt: '2026-07-19T20:00:00.000Z',
      reviewBasisCitation: {
        id: 'citation-external-ready',
        sourceClass: 'primary',
        citationReadiness: 'citable_external',
        verificationStatus: 'human_verified',
        url: 'https://www.norden.org/en/publication/external-ready-test',
        archivedUrl: null,
        accessedAt: '2026-07-19',
        fileHash: sourceHash,
        contentHash: null,
        sourceDocId: null,
        document: {
          report: { id: reportId },
          thesis: null,
          sourceDoc: null,
        },
      },
    }
    const rows: AcademicDatabaseRows = {
      reports: [{
        id: reportId,
        title: seedReport.title,
        year: seedReport.year,
        institution: seedReport.institution,
        author: seedReport.author,
        sourceUrl: seedReport.sourceUrl,
        doi: seedReport.doi ?? null,
        accessedAt: seedReport.accessedAt,
        provenanceType: seedReport.provenanceType,
      }],
      theses: [],
      sourceDocs: [],
      fieldCitations: [{
        entityType: 'Report',
        entityId: reportId,
        fieldPath: 'keyFindings[0]',
        claimText: 'A reviewed externally scoped finding.',
        citation: { pageRef: 'p. 4', quote: null },
      }],
      appraisals: [reviewedAppraisal],
    }

    const database = buildAcademicDatabaseAudit(rows, [], seedCorpus)
    const readiness = buildAcademicExternalReadiness(database, seedCorpus)

    assert.equal(database.parity.status, 'match')
    assert.equal(readiness.status, 'ready')
    assert.equal(readiness.blockers.length, 0)
    assert.deepEqual(
      readiness.dimensions
        .filter(dimension => ['external_appraisal_gate', 'claim_anchor'].includes(dimension.key))
        .map(dimension => [dimension.key, dimension.present, dimension.total, dimension.status]),
      [
        ['external_appraisal_gate', 1, 1, 'ready'],
        ['claim_anchor', 1, 1, 'ready'],
      ],
    )

    const excludedRows: AcademicDatabaseRows = {
      ...rows,
      appraisals: [{
        ...reviewedAppraisal,
        status: 'excluded_not_applicable',
        reviewMethod: 'metadata_only',
        notApplicableReason: 'Not intended for external claim support.',
      }],
    }
    const excludedReadiness = buildAcademicExternalReadiness(
      buildAcademicDatabaseAudit(excludedRows, [], seedCorpus),
      seedCorpus,
    )
    assert.equal(excludedReadiness.status, 'not_ready')
    assert.equal(
      excludedReadiness.dimensions.find(dimension => dimension.key === 'external_appraisal_gate')?.status,
      'ready',
    )
    assert.deepEqual(
      excludedReadiness.dimensions
        .find(dimension => dimension.key === 'claim_anchor'),
      {
        key: 'claim_anchor',
        label: 'Externally qualified records with a syntactic claim anchor',
        set: 'Corpus',
        present: 0,
        total: 0,
        pct: 0,
        target: 100,
        status: 'gap',
        note: 'The denominator contains only records already passing the independent appraisal/citation gate and must be non-empty. One claimText plus pageRef/quote is still only a record-level onboarding check; every emitted claim remains separately fail-closed under citation and appraisal policy.',
      },
    )

    const mismatchedExclusionRows: AcademicDatabaseRows = {
      ...excludedRows,
      appraisals: excludedRows.appraisals?.map(appraisal => ({
        ...appraisal,
        reviewBasisCitation: appraisal.reviewBasisCitation
          ? {
              ...appraisal.reviewBasisCitation,
              document: {
                report: { id: 'different-report' },
                thesis: null,
                sourceDoc: null,
              },
            }
          : null,
      })),
    }
    const mismatchedExclusionReadiness = buildAcademicExternalReadiness(
      buildAcademicDatabaseAudit(mismatchedExclusionRows, [], seedCorpus),
      seedCorpus,
    )
    assert.equal(
      mismatchedExclusionReadiness.dimensions
        .find(dimension => dimension.key === 'external_appraisal_gate')?.status,
      'gap',
    )
    assert.equal(
      mismatchedExclusionReadiness.dimensions
        .find(dimension => dimension.key === 'appraisal_status')?.status,
      'gap',
    )

    const internalSeedReport = {
      ...seedReport,
      sourceUrl: undefined,
      accessedAt: undefined,
      provenanceType: 'internal_synthesis' as const,
    }
    const internalSeedCorpus: AcademicSeedCorpus = {
      reports: [internalSeedReport],
      theses: [],
      sources: [],
    }
    const internalRows: AcademicDatabaseRows = {
      ...rows,
      reports: [{
        ...rows.reports[0]!,
        sourceUrl: null,
        accessedAt: null,
        provenanceType: 'internal_synthesis',
      }],
    }
    const internalReadiness = buildAcademicExternalReadiness(
      buildAcademicDatabaseAudit(internalRows, [], internalSeedCorpus),
      internalSeedCorpus,
    )
    assert.equal(internalReadiness.status, 'not_ready')
    assert.deepEqual(
      internalReadiness.dimensions
        .filter(dimension => ['external_appraisal_gate', 'claim_anchor'].includes(dimension.key))
        .map(dimension => [dimension.key, dimension.present, dimension.total, dimension.status]),
      [
        ['external_appraisal_gate', 0, 1, 'gap'],
        ['claim_anchor', 0, 0, 'gap'],
      ],
    )
  })

  it('includes managed runtime SourceDocs in the live duplicate-locator denominator', () => {
    const managedIds = ['src-yt-runtime-a', 'src-yt-runtime-b']
    const emptySeedCorpus: AcademicSeedCorpus = { reports: [], theses: [], sources: [] }
    const sharedRuntimeLocator = 'https://www.youtube.com/watch?v=runtime-duplicate'
    const database = buildAcademicDatabaseAudit({
      reports: [],
      theses: [],
      sourceDocs: managedIds.map((id, index) => ({
        id,
        filename: `${id}.md`,
        title: `Runtime source ${index + 1}`,
        year: '2026',
        author: 'Landbruk Arena',
        sourceType: 'transkripsjon',
        description: 'Managed runtime transcript.',
        relevance: 'External duplicate-locator regression fixture.',
        url: sharedRuntimeLocator,
        doi: null,
        publisher: 'Landbruk Arena',
        isDuplicate: false,
        accessedAt: '2026-07-20',
        archivedUrl: null,
        provenanceType: 'official_primary',
      })),
      fieldCitations: [],
      appraisals: [],
    }, managedIds, emptySeedCorpus)
    const duplicateCoverage = database.coverage.find(coverage => (
      coverage.set === 'SourceDoc' && coverage.key === 'duplicate_locator_review'
    ))
    const duplicateDimension = buildAcademicExternalReadiness(database, emptySeedCorpus)
      .dimensions.find(dimension => dimension.key === 'duplicate_locator_review')

    assert.equal(database.parity.status, 'match')
    assert.deepEqual(
      duplicateCoverage && {
        present: duplicateCoverage.present,
        total: duplicateCoverage.total,
      },
      { present: 0, total: 2 },
    )
    assert.deepEqual(
      duplicateDimension && {
        present: duplicateDimension.present,
        total: duplicateDimension.total,
        status: duplicateDimension.status,
      },
      { present: 0, total: 2, status: 'gap' },
    )
  })

  it('treats deterministic manifest imports as managed identities, not seed drift', () => {
    const managedId = 'src-yt-reviewed-manifest-id'
    const database = buildAcademicDatabaseAudit({
      reports: reports.map(row => ({
        id: row.id,
        title: row.title,
        year: row.year ?? null,
        institution: row.institution ?? null,
        author: row.author ?? null,
        sourceUrl: row.sourceUrl ?? null,
        doi: row.doi ?? null,
        accessedAt: row.accessedAt ?? null,
        provenanceType: row.provenanceType ?? null,
      })),
      theses: theses.map(row => ({
        id: row.id,
        title: row.title,
        year: row.year,
        institution: row.institution,
        authors: row.authors,
        method: row.method ?? null,
        url: row.url,
        doi: row.doi ?? null,
        accessDate: row.accessDate ?? null,
      })),
      sourceDocs: [
        ...sources.map(row => ({
          id: row.id,
          filename: row.filename,
          title: row.title ?? null,
          year: row.year == null ? null : String(row.year),
          author: row.author ?? null,
          sourceType: row.type,
          description: row.description,
          relevance: row.relevance,
          url: row.url ?? null,
          doi: row.doi ?? null,
          publisher: row.publisher ?? null,
          isDuplicate: row.isDuplicate ?? false,
          accessedAt: row.accessedAt ?? null,
          archivedUrl: row.archivedUrl ?? null,
          provenanceType: row.provenanceType ?? 'unknown',
        })),
        {
          id: managedId,
          filename: 'managed.txt',
          title: 'Managed transcript',
          year: null,
          author: 'Landbruk Arena',
          sourceType: 'transkripsjon',
          description: 'Manifest-derived transcript',
          relevance: 'Internal discovery only',
          url: 'https://www.youtube.com/watch?v=reviewed-manifest-id',
          doi: null,
          publisher: null,
          isDuplicate: false,
          accessedAt: null,
          archivedUrl: null,
          provenanceType: 'unknown',
        },
      ],
      fieldCitations: [],
    }, [managedId])

    const sourceDifference = database.parity.differences.find(row => row.set === 'SourceDoc')!
    assert.equal(database.parity.identityStatus, 'match')
    assert.equal(database.parity.status, 'match')
    assert.deepEqual(sourceDifference.databaseOnlyIds, [managedId])
    assert.deepEqual(sourceDifference.managedRuntimeIds, [managedId])
    assert.deepEqual(sourceDifference.unclassifiedDatabaseOnlyIds, [])
    assert.deepEqual(sourceDifference.missingManagedRuntimeIds, [])
    assert.equal(sourceDifference.classifiedParity, 'match')
  })

  it('renders durable status and queue boundaries without claiming readiness', () => {
    const snapshot = buildAcademicSourceQualitySnapshot(generatedAt)
    const queue = buildAcademicSourceQualityRepairQueue(generatedAt)
    const statusMarkdown = formatAcademicSourceQualityStatusMarkdown(snapshot)
    const queueMarkdown = formatAcademicSourceQualityRepairQueueMarkdown(queue)

    assert.match(statusMarkdown, /Regression gate: \*\*PASS\*\*/)
    assert.match(statusMarkdown, /Academic\/external readiness: \*\*NOT READY\*\*/)
    assert.match(statusMarkdown, /Database scope: \*\*UNAVAILABLE\*\*/)
    assert.match(statusMarkdown, /Default CI remains seed-only/)
    assert.match(
      statusMarkdown,
      new RegExp(`not a set of ${snapshot.scope.totalRows} academic publications`),
    )
    assert.doesNotMatch(statusMarkdown, /not a set of 392 academic publications/)
    assert.match(statusMarkdown, /AI drafts and internal-background records are not upgraded/)
    assert.match(statusMarkdown, /Identifier Syntax Profile/)
    assert.match(statusMarkdown, /URL Syntax Profile/)
    assert.match(statusMarkdown, /\| SourceDoc \| url \| 102\/183 \| 102\/183 \| 0 \| 81 \|/)
    assert.match(statusMarkdown, /They do not make HTTP requests or prove live status, redirects, archive persistence, or availability/)
    assert.doesNotMatch(statusMarkdown, /Stable record locator/)
    assert.match(queueMarkdown, /This queue records missing evidence/)
    assert.match(queueMarkdown, /Prioritized Execution Waves/)
    assert.match(queueMarkdown, /identity_truth_gate/)
    assert.match(queueMarkdown, /SourceDoc:src-30; SourceDoc:src-32; SourceDoc:src-45/)
    assert.match(queueMarkdown, /Report Provenance Review \(0 unknown; 38 explicitly internal\/composite\/blocked\)/)
    assert.match(queueMarkdown, /SourceDoc Provenance Review \(2 unknown; 78 explicitly internal\/duplicate\)/)
    assert.match(queueMarkdown, /SourceDoc Valid Absolute URL Queue \(4 total; 4 active; 0 declared duplicate rows\)/)
    assert.match(queueMarkdown, /Access Date Verification \(29 seed-known rows; 33 live gap rows\)/)
    assert.match(queueMarkdown, /4 Report groups \/ 8 rows; 0 SourceDoc groups \/ 0 rows/)
    assert.match(queueMarkdown, /akademia-nhh-butikkstruktur-2024/)
  })
})
