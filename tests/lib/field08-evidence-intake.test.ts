import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  ACQUISITION_RECEIPTS_PATH,
  APPRAISAL_REVIEW_MANIFEST_PATH,
  COVERAGE_CELLS_PATH,
  COVERAGE_GENERATOR_PATH,
  COVERAGE_LEDGER_PATH,
  EVIDENCE_REGISTER_PATH,
  EXTERNAL_CAPTURES_MANIFEST_PATH,
  EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH,
  FIELD08_SOURCE_MAP_PATH,
  GENERATION_MANIFEST_PATH,
  GENERATOR_PATH,
  HISTORICAL_ASSESSMENTS_PATH,
  INTAKE_PATH,
  INTAKE_SCHEMA_PATH,
  KNOWLEDGE_OBJECTS_PATH,
  KNOWLEDGE_OBJECT_SCHEMA_PATH,
  KNOWLEDGE_VALIDATOR_PATH,
  ONTOLOGY_PATH,
  REPORT_PATH,
  REVIEWER_BRIEF_PATH,
  buildField08EvidenceArtifacts,
  parseField08EvidenceCliArgs,
  writeOrCheckField08Evidence,
  type Field08EvidenceIntake,
} from '../../scripts/knowledge/generate-field08-evidence-intake'
import { validateKnowledgeFoundation } from '../../scripts/knowledge/validate-knowledge-foundation'

const root = fileURLToPath(new URL('../../', import.meta.url))
const captureRoot = 'research/evidence-pack/field08-gate2c-2026-07-28/raw'
const externalFixtureInspectionPath = 'research/evidence-pack/field08-gate2c-2026-07-28/notes/dk-a.md'
const externalFixtureCapturePath = `${captureRoot}/dk-a.pdf`
const externalFixtureCaptureBytes = Buffer.from('%PDF-1.7\nDetached fixture PDF bytes\n')

function git(cwd: string, args: string[]): string {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return result.stdout.trim()
}

function copyPath(sourceRoot: string, targetRoot: string, path: string) {
  const target = resolve(targetRoot, path)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(resolve(sourceRoot, path), target)
}

function digest(value: Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function makeLocalExternalFixture(intake: Field08EvidenceIntake) {
  const acquisition = intake.sourceAcquisitions[0]
  acquisition.captureStorage = 'local_external'
  acquisition.archiveDurability = 'local_only_at_risk'
  acquisition.inspectionNotePath = externalFixtureInspectionPath
  acquisition.capturePath = externalFixtureCapturePath
  acquisition.captureSha256 = digest(externalFixtureCaptureBytes)
  acquisition.captureSizeBytes = externalFixtureCaptureBytes.length
  acquisition.mediaType = 'application/pdf'
}

function prepareLocalExternalFixture(repo: string) {
  const target = resolve(repo, externalFixtureCapturePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, externalFixtureCaptureBytes)
}

function facets(geographyId: 'geo.dk' | 'geo.no') {
  return {
    geographyIds: [geographyId],
    stageIds: ['stage.primary.agriculture_crop', 'stage.return_flows.loss_waste_generation'],
    domainIds: ['domain.circularity_resource_efficiency_waste'],
    outcomeIds: ['outcome.resource_circularity'],
    actorClassIds: [],
    flowClassIds: ['flow.physical.food_waste'],
    commodityGroupIds: ['commodity.mixed_food_basket'],
    materialGroupIds: ['material.waste'],
    circularStrategyIds: ['circular_strategy.r0'],
    ownershipFormIds: [],
  }
}

function boundary(unit = 'tonnes') {
  return {
    included: ['Food waste generated in the reported sectors.'],
    excluded: ['Non-food material.'],
    functionalUnit: unit,
  }
}

function timeScope() {
  return { kind: 'snapshot' as const, from: '2023-01-01', to: '2023-12-31', asOf: '2026-07-28' }
}

function fixtureIntake(captures: Array<{ name: string; bytes: Buffer }>): Field08EvidenceIntake {
  const acquisition = (
    index: number,
    geographyId: 'geo.dk' | 'geo.no',
    sourceId: string,
    citationId: string,
    sourceCandidateId: string,
  ) => ({
    acquisitionId: `acq.field08.fixture.${index}`,
    sourceId,
    citationId,
    sourceCandidateId,
    title: `Fixture source ${index}`,
    publisher: 'Fixture public authority',
    sourceClass: 'primary' as const,
    sourceUrl: `https://example.invalid/source-${index}`,
    citationText: `Fixture source ${index}, exact table locator.`,
    locator: `Table ${index}, row total`,
    evidenceRole: 'numerator' as const,
    accessedAt: '2026-07-28',
    capturedAt: '2026-07-28T12:00:00+02:00',
    capturePath: `${captureRoot}/${captures[index].name}`,
    captureSha256: digest(captures[index].bytes),
    captureSizeBytes: captures[index].bytes.length,
    mediaType: 'text/plain',
    acquisitionMethod: 'direct_download' as const,
    captureStorage: 'git_tracked' as const,
    archiveDurability: 'git_pinned' as const,
    inspectionNotePath: null,
    reuseReviewState: 'pending' as const,
    requestReceiptPath: null,
    geographyIds: [geographyId],
    boundaryState: 'political_direct' as const,
    nonAdditiveWithGeographyIds: [],
    facets: facets(geographyId),
    limitations: ['Fixture evidence requires human method review.'],
  })
  const dkSubject = {
    subjectId: 'fs:process:field08.fixture.dk-food-waste',
    objectTypeId: 'knowledge_object.process' as const,
    title: 'Danish food-waste generation',
    summary: 'Fixture subject for a Danish food-waste measurement.',
    facets: facets('geo.dk'),
    systemBoundary: boundary(),
  }
  const noSubject = {
    subjectId: 'fs:process:field08.fixture.no-food-waste',
    objectTypeId: 'knowledge_object.process' as const,
    title: 'Norwegian food-waste generation',
    summary: 'Fixture subject for Norwegian component measurements.',
    facets: facets('geo.no'),
    systemBoundary: boundary(),
  }
  const indicator = (id: string, subjectId: string, geographyId: 'geo.dk' | 'geo.no') => ({
    indicatorId: id,
    title: `${geographyId} food-waste mass`,
    summary: 'Food-waste mass under the declared fixture boundary.',
    subjectIds: [subjectId],
    facets: facets(geographyId),
    period: '2023',
    unit: 'tonnes',
    numeratorDefinition: 'Reported food-waste mass.',
    denominatorOrUniverse: 'Declared reporting sectors.',
    method: 'Source-reported or directly captured table value.',
    universe: 'Declared reporting sectors in the political geography.',
    unknownReason: 'Indicator definition has no standalone value.',
  })
  const claim = (
    id: string,
    geographyId: 'geo.dk' | 'geo.no',
    citationIds: string[],
    aggregationAllowed: boolean,
  ) => ({
    claimId: id,
    claimKind: 'quantitative_measurement_claim' as const,
    title: `${geographyId} food-waste claim`,
    summary: 'A bounded quantitative fixture claim.',
    claimText: 'The source reports the typed food-waste measurements under the declared boundary.',
    citationIds,
    coverageCellIds: [`cov.v1.profile=legacy_field_political.geography=${geographyId.slice(4)}.legacy_fields=f08`],
    facets: facets(geographyId),
    timeScope: timeScope(),
    systemBoundary: boundary(),
    boundaryState: 'political_direct' as const,
    nonAdditiveWithGeographyIds: [],
    aggregationAllowed,
    limitations: ['Human review is pending.'],
  })
  const measurement = (
    observationId: string,
    claimId: string,
    indicatorId: string,
    subjectId: string,
    geographyId: 'geo.dk' | 'geo.no',
    citationIds: string[],
    value: number,
    aggregationAllowed: boolean,
    componentObservationIds: string[] = [],
    reportedPrecision: null | 'nearest_1_unit' = null,
  ) => ({
    observationId,
    claimId,
    indicatorId,
    subjectIds: [subjectId],
    citationIds,
    title: `${observationId} measurement`,
    summary: 'A typed fixture measurement.',
    facets: facets(geographyId),
    timeScope: timeScope(),
    systemBoundary: boundary(),
    value,
    unit: 'tonnes',
    numeratorDefinition: 'Reported food-waste mass.',
    denominatorOrUniverse: 'Declared reporting sectors.',
    method: 'Direct source value.',
    universe: 'Declared reporting sectors in the political geography.',
    unknownReason: null,
    realizationState: 'realized_measured' as const,
    boundaryState: 'political_direct' as const,
    nonAdditiveWithGeographyIds: [],
    calculationKind: 'source_reported' as const,
    aggregationAllowed,
    componentObservationIds,
    reportedPrecision,
    sourceRowProvenance: [],
    uncertainty: { level: 'medium' as const, reasons: ['Human method review is pending.'] },
    limitations: ['Fixture limitation.'],
  })
  const sources = [
    acquisition(0, 'geo.dk', 'fs:source:field08.fixture.dk-a', 'fs:citation:field08.fixture.dk-a', 'field08.source.fixture.dk-a'),
    acquisition(1, 'geo.dk', 'fs:source:field08.fixture.dk-b', 'fs:citation:field08.fixture.dk-b', 'field08.source.fixture.dk-b'),
    acquisition(2, 'geo.no', 'fs:source:field08.fixture.no', 'fs:citation:field08.fixture.no', 'field08.source.fixture.no'),
  ]
  const dkClaim = 'fs:claim:field08.fixture.dk-disputed'
  const noClaim = 'fs:claim:field08.fixture.no-unaffected'
  const dkIndicator = 'fs:indicator:field08.fixture.dk-food-waste'
  const noIndicator = 'fs:indicator:field08.fixture.no-food-waste'
  const dkA = measurement('fs:observation:field08.fixture.dk-a', dkClaim, dkIndicator, dkSubject.subjectId, 'geo.dk', [sources[0].citationId], 100, false)
  const dkB = measurement('fs:observation:field08.fixture.dk-b', dkClaim, dkIndicator, dkSubject.subjectId, 'geo.dk', [sources[1].citationId], 110, false)
  const noA = measurement('fs:observation:field08.fixture.no-a', noClaim, noIndicator, noSubject.subjectId, 'geo.no', [sources[2].citationId], 40.1, false)
  const noB = measurement('fs:observation:field08.fixture.no-b', noClaim, noIndicator, noSubject.subjectId, 'geo.no', [sources[2].citationId], 60.2, false)
  const noTotal = measurement(
    'fs:observation:field08.fixture.no-total',
    noClaim,
    noIndicator,
    noSubject.subjectId,
    'geo.no',
    [sources[2].citationId],
    100,
    false,
    [noA.observationId, noB.observationId],
    'nearest_1_unit',
  )
  const gateTargets = [
    ...sources.map((item) => item.acquisitionId),
    ...sources.map((item) => item.sourceId),
    dkClaim,
    noClaim,
    dkA.observationId,
    dkB.observationId,
    noA.observationId,
    noB.observationId,
    noTotal.observationId,
  ]
  return {
    documentType: 'field08_evidence_intake',
    schemaVersion: '1.0.0',
    intakeId: 'intake.field08_gate2c.v1',
    status: 'machine_checked_human_review_pending',
    observedAt: '2026-07-28T12:00:00+02:00',
    sourceMapId: 'map.field08_research_candidates.v1',
    semantics: {
      artifactRole: 'evidence_intake',
      coverageImplication: 'none',
      externalUseAllowed: false,
      readinessPromotionAllowed: false,
      historicalAssessmentMutationAllowed: false,
      humanReviewRequired: true,
      sapmiSubjectEvidenceAllowed: false,
    },
    sourceAcquisitions: sources,
    subjectDefinitions: [dkSubject, noSubject],
    indicatorDefinitions: [indicator(dkIndicator, dkSubject.subjectId, 'geo.dk'), indicator(noIndicator, noSubject.subjectId, 'geo.no')],
    claimCandidates: [
      claim(dkClaim, 'geo.dk', [sources[0].citationId, sources[1].citationId], false),
      claim(noClaim, 'geo.no', [sources[2].citationId], false),
    ],
    measurementCandidates: [dkA, dkB, noA, noB, noTotal],
    contradictionSets: [{
      contradictionSetId: 'contradiction.field08.fixture.dk',
      status: 'open',
      claimIds: [dkClaim],
      observationIds: [dkA.observationId, dkB.observationId],
      observationPairs: [{ leftObservationId: dkA.observationId, rightObservationId: dkB.observationId }],
      citationIds: [sources[0].citationId, sources[1].citationId],
      description: 'Two exact source locators report incompatible values under a boundary that still needs review.',
      aggregationAllowed: false,
      resolution: null,
    }],
    deferredCandidates: [{
      deferredCandidateId: 'deferred.field08.fixture.dk-method',
      sourceCandidateId: sources[0].sourceCandidateId,
      geographyIds: ['geo.dk'],
      reasonCode: 'method_unresolved',
      description: 'A remaining method branch is outside this fixture tranche.',
      nextAction: 'Review the method branch in a later evidence tranche.',
    }],
    childDimensionRequirements: [
      {
        requirementId: 'child_requirement.field08.fixture.no-flow',
        targetId: noClaim,
        dimensionId: 'flow_class',
        requiredValueIds: ['flow.physical.food_waste'],
        status: 'open',
        rationale: 'The claim must retain its exact food-waste flow class.',
      },
      {
        requirementId: 'child_requirement.field08.fixture.no-commodity',
        targetId: noClaim,
        dimensionId: 'commodity_group',
        requiredValueIds: ['commodity.mixed_food_basket'],
        status: 'open',
        rationale: 'The aggregate commodity scope must remain explicit.',
      },
      {
        requirementId: 'child_requirement.field08.fixture.no-destination',
        targetId: noClaim,
        dimensionId: 'destination',
        requiredValueIds: ['stage.return_flows.loss_waste_generation'],
        status: 'open',
        rationale: 'The destination stage must remain explicit.',
      },
      {
        requirementId: 'child_requirement.field08.fixture.no-method',
        targetId: noClaim,
        dimensionId: 'method',
        requiredValueIds: ['method_requirement.exact_locator_review'],
        status: 'open',
        rationale: 'The exact-locator method review remains required.',
      },
    ],
    appraisalDrafts: sources.map((item, index) => ({
      appraisalDraftId: `appraisal.field08.fixture.${index}`,
      targetSourceId: item.sourceId,
      authorityAssessment: 'Official-authority fixture pending human confirmation.',
      scopeFitAssessment: 'The locator appears relevant to the bounded claim.',
      methodAssessment: 'Method transparency requires human review.',
      limitationAssessment: 'Comparability and boundary limitations remain open.',
      reviewState: 'human_review_pending' as const,
      externalGatePassed: false as const,
    })),
    reviewGates: [
      {
        reviewGateId: 'review_gate.field08.fixture.human',
        gateType: 'ordinary_human_review',
        targetIds: gateTargets,
        status: 'pending',
        requiredReviewerRole: 'Field 08 evidence reviewer',
        instructions: 'Review locators, definitions, boundaries, arithmetic and limitations.',
        externalGatePassed: false,
        coveragePromotionAllowed: false,
      },
      {
        reviewGateId: 'review_gate.field08.fixture.method',
        gateType: 'method_appraisal',
        targetIds: [
          ...sources.map((item) => item.sourceId),
          'appraisal.field08.fixture.0',
          'appraisal.field08.fixture.1',
          'appraisal.field08.fixture.2',
        ],
        status: 'pending',
        requiredReviewerRole: 'Field 08 method reviewer',
        instructions: 'Complete the pending appraisal drafts.',
        externalGatePassed: false,
        coveragePromotionAllowed: false,
      },
      {
        reviewGateId: 'review_gate.field08.fixture.contradiction',
        gateType: 'contradiction_resolution',
        targetIds: ['contradiction.field08.fixture.dk'],
        status: 'pending',
        requiredReviewerRole: 'Field 08 contradiction reviewer',
        instructions: 'Resolve or retain the claim-scoped contradiction.',
        externalGatePassed: false,
        coveragePromotionAllowed: false,
      },
    ],
  }
}

function writeExternalCaptureManifest(repo: string, intake: Field08EvidenceIntake) {
  const localByPath = new Map(intake.sourceAcquisitions
    .filter((item) => item.captureStorage === 'local_external')
    .map((item) => [item.capturePath, item]))
  const captures = [...localByPath.values()].map((acquisition, index) => {
    assert.ok(acquisition.inspectionNotePath)
    const inspectionTarget = resolve(repo, acquisition.inspectionNotePath)
    if (!existsSync(inspectionTarget)) {
      mkdirSync(dirname(inspectionTarget), { recursive: true })
      writeFileSync(inspectionTarget, `# Fixture locator note\n\nProject-authored facts and locators for ${acquisition.acquisitionId}.\n`)
    }
    const captureBytes = readFileSync(resolve(repo, acquisition.capturePath))
    const inspectionBytes = readFileSync(inspectionTarget)
    return {
      captureId: `capture.field08.fixture.${index}`,
      sourceCandidateId: acquisition.sourceCandidateId,
      sourceUrl: acquisition.sourceUrl,
      accessedAt: acquisition.accessedAt,
      capturedAt: acquisition.capturedAt,
      localPath: acquisition.capturePath,
      storageClass: 'local_external',
      archiveDurability: 'local_only_at_risk',
      recoveryLocator: acquisition.sourceUrl,
      sha256: acquisition.captureSha256,
      sizeBytes: acquisition.captureSizeBytes,
      mediaType: acquisition.mediaType,
      fileMagic: captureBytes.subarray(0, Math.min(8, captureBytes.length)).toString('latin1'),
      redistributionStatus: 'review_pending',
      license: null,
      licenseUrl: null,
      inspectionNote: {
        path: acquisition.inspectionNotePath,
        sha256: digest(inspectionBytes),
        sizeBytes: inspectionBytes.length,
        mediaType: 'text/markdown',
        authorship: 'project_authored',
        scope: 'bounded_facts_and_locator_metadata',
        preparationMethod: 'manual_factual_locator_note',
        containsFullText: false,
        containsVerbatimSourceText: false,
        sourcePdfSha256: acquisition.captureSha256,
        rightsBoundary: 'does_not_grant_source_redistribution_rights',
        preparedAt: '2026-07-29',
      },
    }
  })
  const target = resolve(repo, EXTERNAL_CAPTURES_MANIFEST_PATH)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify({
    documentType: 'field08_gate2c_external_capture_manifest',
    schemaVersion: '1.0.0',
    manifestId: 'external_captures.field08_gate2c.v1',
    status: 'local_only_human_reuse_review_pending',
    captures,
  }, null, 2)}\n`)
}

function committedFixture(
  t: { after(callback: () => void): void },
  mutate?: (intake: Field08EvidenceIntake) => void,
  prepare?: (repo: string, intake: Field08EvidenceIntake) => void,
) {
  const repo = mkdtempSync(join(tmpdir(), 'food-field08-gate2c-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const paths = [
    INTAKE_SCHEMA_PATH,
    EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH,
    KNOWLEDGE_OBJECT_SCHEMA_PATH,
    ONTOLOGY_PATH,
    COVERAGE_LEDGER_PATH,
    HISTORICAL_ASSESSMENTS_PATH,
    COVERAGE_CELLS_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
    KNOWLEDGE_VALIDATOR_PATH,
  ]
  for (const path of paths) copyPath(root, repo, path)
  const captures = [
    { name: 'dk-a.txt', bytes: Buffer.from('Danish fixture A\n') },
    { name: 'dk-b.txt', bytes: Buffer.from('Danish fixture B\n') },
    { name: 'no.txt', bytes: Buffer.from('Norwegian fixture\n') },
  ]
  for (const capture of captures) {
    const path = resolve(repo, captureRoot, capture.name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, capture.bytes)
  }
  const intake = fixtureIntake(captures)
  const sourceMapSources = intake.sourceAcquisitions.map((item) => ({
    sourceCandidateId: item.sourceCandidateId,
    title: item.title,
    publisher: item.publisher,
    sourceType: 'government_report',
  }))
  mutate?.(intake)
  prepare?.(repo, intake)
  const sourceMapTarget = resolve(repo, FIELD08_SOURCE_MAP_PATH)
  mkdirSync(dirname(sourceMapTarget), { recursive: true })
  writeFileSync(sourceMapTarget, `${JSON.stringify({
    mapId: 'map.field08_research_candidates.v1',
    sources: sourceMapSources,
    bindings: intake.sourceAcquisitions.map((item) => ({
      sourceCandidateId: item.sourceCandidateId,
      geographyId: item.geographyIds[0],
      boundaryFit: item.boundaryState === 'political_direct' || item.boundaryState === 'aland_only' ? 'direct_candidate' : 'requires_reconciliation',
    })),
  }, null, 2)}\n`)
  const intakeTarget = resolve(repo, INTAKE_PATH)
  mkdirSync(dirname(intakeTarget), { recursive: true })
  writeFileSync(intakeTarget, `${JSON.stringify(intake, null, 2)}\n`)
  writeExternalCaptureManifest(repo, intake)
  const localExternalPaths = [...new Set(intake.sourceAcquisitions
    .filter((item) => item.captureStorage === 'local_external')
    .map((item) => item.capturePath))]
  if (localExternalPaths.length > 0) {
    writeFileSync(resolve(repo, '.gitignore'), `${localExternalPaths.map((path) => `/${path}`).join('\n')}\n`)
  }
  git(repo, ['init', '-q'])
  git(repo, ['config', 'user.name', 'Gate 2C Test'])
  git(repo, ['config', 'user.email', 'gate2c@example.invalid'])
  git(repo, ['add', '--', '.'])
  git(repo, ['commit', '-q', '-m', 'test: pin Gate 2C source intake'])
  return { repo, baseCommit: git(repo, ['rev-parse', 'HEAD']) }
}

function writeApiReceiptFixture(repo: string, intake: Field08EvidenceIntake, mismatch = false) {
  const acquisition = intake.sourceAcquisitions[2]
  const receiptPath = acquisition.requestReceiptPath
  assert.ok(receiptPath)
  const metadataPath = `${captureRoot}/metadata.json`
  writeFileSync(resolve(repo, metadataPath), '{"metadata":true}\n')
  const receiptTarget = resolve(repo, receiptPath)
  mkdirSync(dirname(receiptTarget), { recursive: true })
  writeFileSync(receiptTarget, `${JSON.stringify({
    documentType: 'field08_gate2c_api_request_receipts',
    schemaVersion: '1.0.0',
    retrievedAt: '2026-07-28',
    requests: [
      {
        requestId: 'field08.request.fixture.data',
        method: 'GET',
        url: mismatch ? 'https://example.invalid/wrong' : acquisition.sourceUrl,
        headers: { Accept: 'text/plain' },
        body: null,
        responsePath: acquisition.capturePath,
      },
      {
        requestId: 'field08.request.fixture.metadata',
        method: 'GET',
        url: 'https://example.invalid/metadata',
        headers: { Accept: 'application/json' },
        body: null,
        responsePath: metadataPath,
      },
    ],
  }, null, 2)}\n`)
}

test('builds deterministic receipts, internal knowledge objects and a claim-scoped contradiction', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const first = buildField08EvidenceArtifacts(repo, { baseCommit })
  const second = buildField08EvidenceArtifacts(repo, { baseCommit })
  assert.equal(first.acquisitionReceiptsJsonl, second.acquisitionReceiptsJsonl)
  assert.equal(first.knowledgeObjectsJson, second.knowledgeObjectsJson)
  assert.equal(first.evidenceRegisterJson, second.evidenceRegisterJson)
  assert.equal(first.generationManifestJson, second.generationManifestJson)
  assert.match(first.reportMarkdown, /## Deferred candidates/)
  assert.match(first.reportMarkdown, /deferred\.field08\.fixture\.dk-method/)
  assert.match(first.reportMarkdown, /## Required child dimensions/)
  assert.match(first.reportMarkdown, /child_requirement\.field08\.fixture\.no-method/)

  const disputed = first.knowledgeObjects.find((item) => item.id === 'fs:claim:field08.fixture.dk-disputed')
  const unaffected = first.knowledgeObjects.find((item) => item.id === 'fs:claim:field08.fixture.no-unaffected')
  assert.ok(disputed)
  assert.ok(unaffected)
  assert.equal((disputed.evidence as { verificationStatus: string }).verificationStatus, 'disputed')
  assert.equal((unaffected.evidence as { verificationStatus: string }).verificationStatus, 'needs_review')
  assert.equal(disputed.claimStatus, 'internal_candidate')
  for (const object of first.knowledgeObjects.filter((item) => (
    item.objectTypeId === 'knowledge_object.claim' || item.objectTypeId === 'knowledge_object.observation'
  ))) assert.equal(object.aggregationAllowed, false)
  const missingAggregationFlag = structuredClone(first.knowledgeObjects)
  const missingClaimFlag = missingAggregationFlag.find((item) => item.objectTypeId === 'knowledge_object.claim')
  assert.ok(missingClaimFlag)
  delete missingClaimFlag.aggregationAllowed
  assert.equal(validateKnowledgeFoundation(missingAggregationFlag, { root: repo }).valid, false)
  const enabledAggregation = structuredClone(first.knowledgeObjects)
  const enabledObservation = enabledAggregation.find((item) => item.objectTypeId === 'knowledge_object.observation')
  assert.ok(enabledObservation)
  enabledObservation.aggregationAllowed = true
  assert.equal(validateKnowledgeFoundation(enabledAggregation, { root: repo }).valid, false)
  const laterContradictoryObservation = first.knowledgeObjects.find((item) => item.id === 'fs:observation:field08.fixture.dk-b')
  assert.ok(laterContradictoryObservation)
  assert.ok((laterContradictoryObservation.relations as Array<{ relationType: string; targetId: string }>).some((relation) => (
    relation.relationType === 'contradicts' && relation.targetId === 'fs:observation:field08.fixture.dk-a'
  )))
  for (const object of first.knowledgeObjects) {
    const evidence = object.evidence as {
      citationReadiness: string
      appraisalState: string
      sourceRefs: Array<{
        verificationStatus: string
        supportsOrChallenges?: string
        captureStorage: 'git_tracked' | 'local_external'
        archiveDurability: 'git_pinned' | 'local_only_at_risk'
        inspectionNotePath: string | null
        reuseReviewState: 'pending'
      }>
    }
    assert.equal(evidence.citationReadiness, 'internal_context')
    assert.equal(evidence.appraisalState, 'draft')
    assert.ok(evidence.sourceRefs.every((ref) => ref.verificationStatus === 'needs_review'))
    assert.ok(evidence.sourceRefs.every((ref) => ref.supportsOrChallenges === undefined || ref.supportsOrChallenges === 'supports'))
    assert.ok(evidence.sourceRefs.every((ref) => ref.reuseReviewState === 'pending'))
    assert.ok(evidence.sourceRefs.every((ref) => (
      ref.captureStorage === 'git_tracked'
        ? ref.archiveDurability === 'git_pinned' && ref.inspectionNotePath === null
        : ref.archiveDurability === 'local_only_at_risk' && typeof ref.inspectionNotePath === 'string'
    )))
  }

  const incompleteCaptureMetadata = structuredClone(first.knowledgeObjects)
  const objectWithSourceRef = incompleteCaptureMetadata.find((item) => (
    ((item.evidence as { sourceRefs?: unknown[] }).sourceRefs?.length ?? 0) > 0
  ))
  assert.ok(objectWithSourceRef)
  const incompleteSourceRef = (objectWithSourceRef.evidence as { sourceRefs: Array<{ archiveDurability?: string }> }).sourceRefs[0]
  delete incompleteSourceRef.archiveDurability
  assert.equal(validateKnowledgeFoundation(incompleteCaptureMetadata, { root: repo }).valid, false)

  const guard = first.evidenceRegister.baselineGuard as Record<string, number>
  assert.equal(guard.historicalEventCount, 117)
  assert.equal(guard.field08CellCount, 9)
  assert.equal(guard.field08ScopeRegistrationCount, 9)
  assert.equal(guard.field08SubjectMatterAssessmentCount, 0)
  assert.equal(guard.historicalAssessmentWriteCount, 0)
})

test('validates exact capture bytes and component rounding', (t) => {
  const badCapture = committedFixture(t, (intake) => {
    intake.sourceAcquisitions[0].captureSha256 = `sha256:${'0'.repeat(64)}`
  })
  assert.throws(() => buildField08EvidenceArtifacts(badCapture.repo, { baseCommit: badCapture.baseCommit }), /capture SHA-256 mismatch/)

  const badRounding = committedFixture(t, (intake) => {
    const total = intake.measurementCandidates.find((item) => item.componentObservationIds.length > 0)
    assert.ok(total)
    total.value = 101
  })
  assert.throws(() => buildField08EvidenceArtifacts(badRounding.repo, { baseCommit: badRounding.baseCommit }), /inconsistent with nearest_1_unit/)
})

test('rejects a cross-scope contradiction pair', (t) => {
  const crossScope = committedFixture(t, (intake) => {
    const contradiction = intake.contradictionSets[0]
    contradiction.claimIds.push('fs:claim:field08.fixture.no-unaffected')
    contradiction.observationIds.push('fs:observation:field08.fixture.no-a')
    contradiction.observationPairs.push({
      leftObservationId: 'fs:observation:field08.fixture.dk-b',
      rightObservationId: 'fs:observation:field08.fixture.no-a',
    })
    contradiction.citationIds.push('fs:citation:field08.fixture.no')
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(crossScope.repo, { baseCommit: crossScope.baseCommit }),
    /pair must use the same indicator/,
  )
})

test('generates only declared same-scope contradiction pairs and never a clique edge', (t) => {
  const fixture = committedFixture(t, (intake) => {
    const dkB = intake.measurementCandidates.find((item) => item.observationId === 'fs:observation:field08.fixture.dk-b')
    assert.ok(dkB)
    const dkC = structuredClone(dkB)
    dkC.observationId = 'fs:observation:field08.fixture.dk-c'
    dkC.value = 120
    intake.measurementCandidates.push(dkC)
    const contradiction = intake.contradictionSets[0]
    contradiction.observationIds.push(dkC.observationId)
    contradiction.observationPairs.push({
      leftObservationId: 'fs:observation:field08.fixture.dk-b',
      rightObservationId: dkC.observationId,
    })
    const ordinaryGate = intake.reviewGates.find((gate) => gate.gateType === 'ordinary_human_review')
    assert.ok(ordinaryGate)
    ordinaryGate.targetIds.push(dkC.observationId)
  })
  const artifacts = buildField08EvidenceArtifacts(fixture.repo, { baseCommit: fixture.baseCommit })
  const dkC = artifacts.knowledgeObjects.find((item) => item.id === 'fs:observation:field08.fixture.dk-c')
  assert.ok(dkC)
  const relations = dkC.relations as Array<{ relationType: string; targetId: string }>
  assert.ok(relations.some((relation) => relation.relationType === 'contradicts' && relation.targetId === 'fs:observation:field08.fixture.dk-b'))
  assert.ok(!relations.some((relation) => relation.relationType === 'contradicts' && relation.targetId === 'fs:observation:field08.fixture.dk-a'))
})

test('allows locator-specific system-boundary prose while preserving the typed contradiction scope', (t) => {
  const locatorSpecific = committedFixture(t, (intake) => {
    const originalClaim = intake.claimCandidates.find((item) => item.claimId === 'fs:claim:field08.fixture.dk-disputed')
    const rightObservation = intake.measurementCandidates.find((item) => item.observationId === 'fs:observation:field08.fixture.dk-b')
    const ordinaryGate = intake.reviewGates.find((gate) => gate.gateType === 'ordinary_human_review')
    assert.ok(originalClaim)
    assert.ok(rightObservation)
    assert.ok(ordinaryGate)
    const rightClaim = structuredClone(originalClaim)
    rightClaim.claimId = 'fs:claim:field08.fixture.dk-disputed-locator-b'
    rightClaim.citationIds = ['fs:citation:field08.fixture.dk-b']
    rightClaim.systemBoundary = {
      included: ['Rows included by locator B.'],
      excluded: ['Rows excluded by locator B.'],
      functionalUnit: 'Locator B describes source-reported tonnes.',
    }
    originalClaim.citationIds = ['fs:citation:field08.fixture.dk-a']
    rightObservation.claimId = rightClaim.claimId
    rightObservation.systemBoundary = structuredClone(rightClaim.systemBoundary)
    intake.claimCandidates.push(rightClaim)
    intake.contradictionSets[0].claimIds = [originalClaim.claimId, rightClaim.claimId]
    ordinaryGate.targetIds.push(rightClaim.claimId)
  })
  assert.doesNotThrow(() => buildField08EvidenceArtifacts(locatorSpecific.repo, { baseCommit: locatorSpecific.baseCommit }))
})

test('allows method-context citations outside a contradiction set but requires represented member citations', (t) => {
  const withMethodContext = committedFixture(t, (intake) => {
    const context = {
      ...structuredClone(intake.sourceAcquisitions[0]),
      acquisitionId: 'acq.field08.fixture.dk-method-context',
      citationId: 'fs:citation:field08.fixture.dk-method-context',
      locator: 'Method annex',
      citationText: 'Fixture method-context locator.',
      evidenceRole: 'method' as const,
    }
    intake.sourceAcquisitions.push(context)
    const ordinaryGate = intake.reviewGates.find((gate) => gate.gateType === 'ordinary_human_review')
    const observation = intake.measurementCandidates.find((item) => item.observationId === 'fs:observation:field08.fixture.dk-a')
    const claim = intake.claimCandidates.find((item) => item.claimId === 'fs:claim:field08.fixture.dk-disputed')
    assert.ok(ordinaryGate)
    assert.ok(observation)
    assert.ok(claim)
    ordinaryGate.targetIds.push(context.acquisitionId, context.citationId)
    observation.citationIds.push(context.citationId)
    claim.citationIds.push(context.citationId)
  })
  assert.doesNotThrow(() => buildField08EvidenceArtifacts(withMethodContext.repo, { baseCommit: withMethodContext.baseCommit }))

  const unrepresentedMember = committedFixture(t, (intake) => {
    intake.contradictionSets[0].citationIds = [
      'fs:citation:field08.fixture.dk-a',
      'fs:citation:field08.fixture.no',
    ]
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(unrepresentedMember.repo, { baseCommit: unrepresentedMember.baseCommit }),
    /member fs:observation:field08\.fixture\.dk-b has no citation represented/,
  )

  const unusedSetCitation = committedFixture(t, (intake) => {
    intake.contradictionSets[0].citationIds.push('fs:citation:field08.fixture.no')
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(unusedSetCitation.repo, { baseCommit: unusedSetCitation.baseCommit }),
    /citation fs:citation:field08\.fixture\.no is not attached to a member observation/,
  )

  const methodOnlySide = committedFixture(t, (intake) => {
    intake.sourceAcquisitions[0].evidenceRole = 'method'
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(methodOnlySide.repo, { baseCommit: methodOnlySide.baseCommit }),
    /pair member fs:observation:field08\.fixture\.dk-a requires a numerator or counterevidence citation/,
  )

  const counterevidenceSide = committedFixture(t, (intake) => {
    intake.sourceAcquisitions[0].evidenceRole = 'counterevidence'
  })
  assert.doesNotThrow(() => buildField08EvidenceArtifacts(counterevidenceSide.repo, { baseCommit: counterevidenceSide.baseCommit }))
})

test('keeps every Gate 2C contradiction open and unresolved while human review is pending', (t) => {
  const resolved = committedFixture(t, (intake) => {
    const contradiction = intake.contradictionSets[0] as unknown as { status: string; resolution: string | null }
    contradiction.status = 'resolved'
    contradiction.resolution = 'Premature machine resolution.'
  })
  assert.throws(() => buildField08EvidenceArtifacts(resolved.repo, { baseCommit: resolved.baseCommit }), /schema validation failed/)

  const prematureResolution = committedFixture(t, (intake) => {
    ;(intake.contradictionSets[0] as unknown as { resolution: string | null }).resolution = 'Premature machine resolution.'
  })
  assert.throws(() => buildField08EvidenceArtifacts(prematureResolution.repo, { baseCommit: prematureResolution.baseCommit }), /schema validation failed/)
})

test('pins every API receipt response and rejects missing or mismatched requests', (t) => {
  const makeApi = (intake: Field08EvidenceIntake) => {
    intake.sourceAcquisitions[2].acquisitionMethod = 'api_query'
    intake.sourceAcquisitions[2].requestReceiptPath = 'research/evidence-pack/field08-gate2c-2026-07-28/requests/api-requests.v1.json'
  }
  const valid = committedFixture(t, makeApi, (repo, intake) => writeApiReceiptFixture(repo, intake))
  const artifacts = buildField08EvidenceArtifacts(valid.repo, { baseCommit: valid.baseCommit })
  assert.ok(artifacts.inputSnapshots.some((snapshot) => snapshot.path === `${captureRoot}/metadata.json`))

  const missing = committedFixture(t, makeApi)
  assert.throws(() => buildField08EvidenceArtifacts(missing.repo, { baseCommit: missing.baseCommit }), /API request receipt is missing/)

  const mismatched = committedFixture(t, makeApi, (repo, intake) => writeApiReceiptFixture(repo, intake, true))
  assert.throws(() => buildField08EvidenceArtifacts(mismatched.repo, { baseCommit: mismatched.baseCommit }), /does not match exactly one API request receipt/)
})

test('excludes local-external captures from Git snapshots and supports metadata-only versus full replay', (t) => {
  const capturePath = externalFixtureCapturePath
  const localExternal = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  const initial = buildField08EvidenceArtifacts(localExternal.repo, { baseCommit: localExternal.baseCommit })
  assert.ok(!initial.inputSnapshots.some((snapshot) => snapshot.path === capturePath))
  assert.ok(initial.inputSnapshots.some((snapshot) => snapshot.path === externalFixtureInspectionPath))
  assert.ok(initial.inputSnapshots.some((snapshot) => snapshot.path === '.gitignore'))
  assert.equal(initial.externalCaptureVerification.allRequiredPresentAndVerified, true)

  rmSync(resolve(localExternal.repo, capturePath))
  const metadataOnly = buildField08EvidenceArtifacts(localExternal.repo, {
    baseCommit: localExternal.baseCommit,
    allowMissingLocalExternalCaptures: true,
  })
  assert.equal(metadataOnly.externalCaptureVerification.allRequiredPresentAndVerified, false)
  assert.throws(
    () => writeOrCheckField08Evidence(localExternal.repo, metadataOnly, false),
    /requires every local-external capture to be present and hash-verified/,
  )
  assert.throws(
    () => buildField08EvidenceArtifacts(localExternal.repo, { baseCommit: localExternal.baseCommit }),
    /local-external capture is missing/,
  )

  const trackedInIndex = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  git(trackedInIndex.repo, ['add', '-f', '--', capturePath])
  assert.throws(
    () => buildField08EvidenceArtifacts(trackedInIndex.repo, { baseCommit: trackedInIndex.baseCommit }),
    /must not be tracked in the current Git index/,
  )

  const improperlyCommitted = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  git(improperlyCommitted.repo, ['add', '-f', '--', capturePath])
  git(improperlyCommitted.repo, ['commit', '-q', '-m', 'test: improperly commit local-external capture'])
  const improperlyCommittedBase = git(improperlyCommitted.repo, ['rev-parse', 'HEAD'])
  git(improperlyCommitted.repo, ['rm', '-q', '--cached', '--', capturePath])
  assert.throws(
    () => buildField08EvidenceArtifacts(improperlyCommitted.repo, { baseCommit: improperlyCommittedBase }),
    /local-external capture must be absent from source commit/,
  )

  const notIgnored = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  writeFileSync(resolve(notIgnored.repo, '.gitignore'), '# detached capture is not ignored\n')
  assert.throws(
    () => buildField08EvidenceArtifacts(notIgnored.repo, { baseCommit: notIgnored.baseCommit }),
    /must match a Git ignore rule/,
  )
})

test('validates the detached-capture manifest with a strict fail-closed schema', (t) => {
  const mutateManifest = (repo: string, mutate: (manifest: { captures: Array<Record<string, unknown>> }) => void) => {
    const path = resolve(repo, EXTERNAL_CAPTURES_MANIFEST_PATH)
    const manifest = JSON.parse(readFileSync(path, 'utf8')) as { captures: Array<Record<string, unknown>> }
    mutate(manifest)
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
  }

  const extraApproval = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  mutateManifest(extraApproval.repo, (manifest) => {
    manifest.captures[0].humanApproval = true
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(extraApproval.repo, { baseCommit: extraApproval.baseCommit }),
    /external-captures\.v1\.json schema validation failed/,
  )

  const weakMedia = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  mutateManifest(weakMedia.repo, (manifest) => {
    manifest.captures[0].mediaType = 'application/octet-stream'
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(weakMedia.repo, { baseCommit: weakMedia.baseCommit }),
    /external-captures\.v1\.json schema validation failed/,
  )

  const weakMagic = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  mutateManifest(weakMagic.repo, (manifest) => {
    manifest.captures[0].fileMagic = '%PDF'
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(weakMagic.repo, { baseCommit: weakMagic.baseCommit }),
    /external-captures\.v1\.json schema validation failed/,
  )

  const fullTextClaim = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  mutateManifest(fullTextClaim.repo, (manifest) => {
    ;(manifest.captures[0].inspectionNote as Record<string, unknown>).containsFullText = true
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(fullTextClaim.repo, { baseCommit: fullTextClaim.baseCommit }),
    /external-captures\.v1\.json schema validation failed/,
  )

  const wrongSourceBinding = committedFixture(t, makeLocalExternalFixture, prepareLocalExternalFixture)
  mutateManifest(wrongSourceBinding.repo, (manifest) => {
    ;(manifest.captures[0].inspectionNote as Record<string, unknown>).sourcePdfSha256 = digest(Buffer.from('wrong source'))
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(wrongSourceBinding.repo, { baseCommit: wrongSourceBinding.baseCommit }),
    /inspection note must bind the exact PDF hash/,
  )
})

test('rejects symbolic-link and non-regular input files', (t) => {
  const symlinked = committedFixture(t, undefined, (repo) => {
    const target = resolve(repo, captureRoot, 'dk-a.txt')
    rmSync(target)
    symlinkSync('dk-b.txt', target)
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(symlinked.repo, { baseCommit: symlinked.baseCommit }),
    /cannot be a symbolic link/,
  )

  const directoryInput = committedFixture(t, undefined, (repo) => {
    const target = resolve(repo, captureRoot, 'dk-a.txt')
    rmSync(target)
    mkdirSync(target)
    writeFileSync(resolve(target, 'tracked-child.txt'), 'not a regular input file\n')
  })
  assert.throws(
    () => buildField08EvidenceArtifacts(directoryInput.repo, { baseCommit: directoryInput.baseCommit }),
    /must be a regular file/,
  )
})

test('validates new child-dimension namespaces and Gate 2B candidate accounting', (t) => {
  const invalidCommodity = committedFixture(t, (intake) => {
    const requirement = intake.childDimensionRequirements.find((item) => item.dimensionId === 'commodity_group')
    assert.ok(requirement)
    requirement.requiredValueIds = ['commodity.not_in_ontology']
  })
  assert.throws(() => buildField08EvidenceArtifacts(invalidCommodity.repo, { baseCommit: invalidCommodity.baseCommit }), /outside commodity_group/)

  const invalidDestination = committedFixture(t, (intake) => {
    const requirement = intake.childDimensionRequirements.find((item) => item.dimensionId === 'destination')
    assert.ok(requirement)
    requirement.requiredValueIds = ['stage.not_in_ontology']
  })
  assert.throws(() => buildField08EvidenceArtifacts(invalidDestination.repo, { baseCommit: invalidDestination.baseCommit }), /outside destination/)

  const invalidMethod = committedFixture(t, (intake) => {
    const requirement = intake.childDimensionRequirements.find((item) => item.dimensionId === 'method')
    assert.ok(requirement)
    requirement.requiredValueIds = ['method.invalid_namespace']
  })
  assert.throws(() => buildField08EvidenceArtifacts(invalidMethod.repo, { baseCommit: invalidMethod.baseCommit }), /schema validation failed|invalid method requirement ID/)

  const unknownCandidate = committedFixture(t, (intake) => {
    intake.sourceAcquisitions[0].sourceCandidateId = 'field08.source.fixture.unknown'
  })
  assert.throws(() => buildField08EvidenceArtifacts(unknownCandidate.repo, { baseCommit: unknownCandidate.baseCommit }), /unknown candidate/)

  const missingCandidate = committedFixture(t, (intake) => {
    intake.sourceAcquisitions = intake.sourceAcquisitions.slice(0, 2)
  })
  assert.throws(() => buildField08EvidenceArtifacts(missingCandidate.repo, { baseCommit: missingCandidate.baseCommit }), /must cover every Gate 2B source candidate/)

  const partialAcquisitionGap = committedFixture(t)
  const sourceMapPath = resolve(partialAcquisitionGap.repo, FIELD08_SOURCE_MAP_PATH)
  const sourceMap = JSON.parse(readFileSync(sourceMapPath, 'utf8')) as {
    bindings: Array<{ sourceCandidateId: string; geographyId: string; boundaryFit: string }>
  }
  sourceMap.bindings.push({
    sourceCandidateId: 'field08.source.fixture.dk-a',
    geographyId: 'geo.no',
    boundaryFit: 'direct_candidate',
  })
  writeFileSync(sourceMapPath, `${JSON.stringify(sourceMap, null, 2)}\n`)
  assert.throws(
    () => buildField08EvidenceArtifacts(partialAcquisitionGap.repo, { baseCommit: partialAcquisitionGap.baseCommit }),
    /acquired\/deferred geography union must equal all Gate 2B bindings/,
  )
})

test('rejects unsafe Finland–Åland aggregation and missing non-additivity', (t) => {
  const unknownAggregate = committedFixture(t, (intake) => {
    const claim = intake.claimCandidates[0]
    claim.facets.geographyIds = ['geo.fi']
    claim.coverageCellIds = ['cov.v1.profile=legacy_field_political.geography=fi.legacy_fields=f08']
    claim.boundaryState = 'unknown_finland_aland'
    claim.aggregationAllowed = true
  })
  assert.throws(() => buildField08EvidenceArtifacts(unknownAggregate.repo, { baseCommit: unknownAggregate.baseCommit }), /cannot aggregate while human review is pending/)

  const missingNonAdditive = committedFixture(t, (intake) => {
    const acquisition = intake.sourceAcquisitions[0]
    acquisition.geographyIds = ['geo.fi']
    acquisition.facets.geographyIds = ['geo.fi']
    acquisition.boundaryState = 'finland_including_aland'
    acquisition.nonAdditiveWithGeographyIds = []
    intake.deferredCandidates[0].geographyIds = ['geo.fi']
  })
  assert.throws(() => buildField08EvidenceArtifacts(missingNonAdditive.repo, { baseCommit: missingNonAdditive.baseCommit }), /must be non-additive with geo.ax/)
})

test('rejects contradiction leakage, per-hectare derivation and human-gate promotion', (t) => {
  const contradictionLeak = committedFixture(t, (intake) => {
    const contradiction = intake.contradictionSets[0]
    contradiction.claimIds.push('fs:claim:field08.fixture.no-unaffected')
  })
  assert.throws(() => buildField08EvidenceArtifacts(contradictionLeak.repo, { baseCommit: contradictionLeak.baseCommit }), /claimIds must equal the union/)

  const perHa = committedFixture(t, (intake) => {
    const measurement = intake.measurementCandidates[0]
    measurement.calculationKind = 'derived_from_source_rows'
    measurement.sourceRowProvenance = ['Table 1 row A minus row B']
    measurement.unit = 'kg_per_hectare'
    const indicator = intake.indicatorDefinitions.find((item) => item.indicatorId === measurement.indicatorId)
    assert.ok(indicator)
    indicator.unit = 'kg_per_hectare'
  })
  assert.throws(() => buildField08EvidenceArtifacts(perHa.repo, { baseCommit: perHa.baseCommit }), /per-hectare derived subtraction/)

  const promoted = committedFixture(t, (intake) => {
    ;(intake.reviewGates[0] as unknown as { externalGatePassed: boolean }).externalGatePassed = true
  })
  assert.throws(() => buildField08EvidenceArtifacts(promoted.repo, { baseCommit: promoted.baseCommit }), /schema validation failed/)

  const missingMethodGate = committedFixture(t, (intake) => {
    intake.reviewGates = intake.reviewGates.filter((gate) => gate.gateType !== 'method_appraisal')
  })
  assert.throws(() => buildField08EvidenceArtifacts(missingMethodGate.repo, { baseCommit: missingMethodGate.baseCommit }), /has no method_appraisal gate/)
})

test('builds the current production inputs in a temporary Git repository without detached PDFs', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'food-field08-production-inputs-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const intake = JSON.parse(readFileSync(resolve(root, INTAKE_PATH), 'utf8')) as Field08EvidenceIntake
  const paths = new Set([
    '.gitignore',
    INTAKE_PATH,
    INTAKE_SCHEMA_PATH,
    EXTERNAL_CAPTURES_MANIFEST_PATH,
    EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH,
    KNOWLEDGE_OBJECT_SCHEMA_PATH,
    ONTOLOGY_PATH,
    COVERAGE_LEDGER_PATH,
    HISTORICAL_ASSESSMENTS_PATH,
    COVERAGE_CELLS_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
    KNOWLEDGE_VALIDATOR_PATH,
    FIELD08_SOURCE_MAP_PATH,
  ])
  for (const acquisition of intake.sourceAcquisitions) {
    if (acquisition.captureStorage === 'git_tracked') paths.add(acquisition.capturePath)
    if (acquisition.inspectionNotePath) paths.add(acquisition.inspectionNotePath)
    if (acquisition.requestReceiptPath) paths.add(acquisition.requestReceiptPath)
  }
  for (const receiptPath of [...new Set(intake.sourceAcquisitions
    .flatMap((item) => item.requestReceiptPath ? [item.requestReceiptPath] : []))]) {
    const receipt = JSON.parse(readFileSync(resolve(root, receiptPath), 'utf8')) as {
      requests: Array<{ responsePath: string }>
    }
    for (const request of receipt.requests) paths.add(request.responsePath)
  }
  for (const path of paths) {
    assert.equal(existsSync(resolve(root, path)), true, `Missing production fixture input ${path}`)
    copyPath(root, repo, path)
  }
  for (const acquisition of intake.sourceAcquisitions.filter((item) => item.captureStorage === 'local_external')) {
    assert.equal(existsSync(resolve(repo, acquisition.capturePath)), false)
  }
  git(repo, ['init', '-q'])
  git(repo, ['config', 'user.name', 'Gate 2C Production Fixture'])
  git(repo, ['config', 'user.email', 'gate2c-production@example.invalid'])
  git(repo, ['add', '--', '.'])
  git(repo, ['commit', '-q', '-m', 'test: pin current Gate 2C production inputs'])
  const baseCommit = git(repo, ['rev-parse', 'HEAD'])
  const artifacts = buildField08EvidenceArtifacts(repo, {
    baseCommit,
    allowMissingLocalExternalCaptures: true,
  })
  assert.deepEqual(artifacts.evidenceRegister.recordCounts, {
    acquisitions: 17,
    uniqueSources: 5,
    citations: 17,
    claims: 34,
    measurements: 29,
    openContradictions: 4,
    deferredCandidates: 23,
    childDimensionRequirements: 20,
    appraisalDrafts: 5,
    pendingReviewGates: 4,
    knowledgeObjects: 78,
  })
  assert.equal(artifacts.intake.contradictionSets.reduce((total, item) => total + item.observationPairs.length, 0), 8)
  assert.deepEqual(artifacts.externalCaptureVerification, {
    requiredPaths: [
      'research/evidence-pack/field08-gate2c-2026-07-28/raw/ax-asub-avfallsstatistik-2024.pdf',
      'research/evidence-pack/field08-gate2c-2026-07-28/raw/is-environment-agency-food-waste-2022.pdf',
      'research/evidence-pack/field08-gate2c-2026-07-28/raw/no-landbruksdirektoratet-matsvinn-jordbrukssektoren-2024.pdf',
    ],
    verifiedPaths: [],
    allRequiredPresentAndVerified: false,
  })
})

test('writes the generation manifest last, keeps coverage byte-identical and detects drift', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const historicalBefore = readFileSync(resolve(repo, HISTORICAL_ASSESSMENTS_PATH), 'utf8')
  const ledgerBefore = readFileSync(resolve(repo, COVERAGE_LEDGER_PATH), 'utf8')
  const artifacts = buildField08EvidenceArtifacts(repo, { baseCommit })
  writeOrCheckField08Evidence(repo, artifacts, false)
  for (const [path, expected] of [
    [ACQUISITION_RECEIPTS_PATH, artifacts.acquisitionReceiptsJsonl],
    [KNOWLEDGE_OBJECTS_PATH, artifacts.knowledgeObjectsJson],
    [APPRAISAL_REVIEW_MANIFEST_PATH, artifacts.appraisalReviewManifestJson],
    [REVIEWER_BRIEF_PATH, artifacts.reviewerBriefMarkdown],
    [EVIDENCE_REGISTER_PATH, artifacts.evidenceRegisterJson],
    [REPORT_PATH, artifacts.reportMarkdown],
    [GENERATION_MANIFEST_PATH, artifacts.generationManifestJson],
  ] as const) assert.equal(readFileSync(resolve(repo, path), 'utf8'), expected)
  assert.equal(readFileSync(resolve(repo, HISTORICAL_ASSESSMENTS_PATH), 'utf8'), historicalBefore)
  assert.equal(readFileSync(resolve(repo, COVERAGE_LEDGER_PATH), 'utf8'), ledgerBefore)
  writeOrCheckField08Evidence(repo, artifacts, true)
  writeFileSync(resolve(repo, EVIDENCE_REGISTER_PATH), '{}\n')
  assert.throws(() => writeOrCheckField08Evidence(repo, artifacts, true), /stale/)

  appendFileSync(resolve(repo, HISTORICAL_ASSESSMENTS_PATH), '\n')
  assert.throws(() => buildField08EvidenceArtifacts(repo, { baseCommit }), /differs from declared base commit/)
})

test('invalidates the old generation manifest before output replacement and cleans every staged temp', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const artifacts = buildField08EvidenceArtifacts(repo, { baseCommit })
  writeOrCheckField08Evidence(repo, artifacts, false)
  assert.equal(existsSync(resolve(repo, GENERATION_MANIFEST_PATH)), true)

  assert.throws(
    () => writeOrCheckField08Evidence(repo, artifacts, false, { failAfterOutputRenames: 1 }),
    /Injected generated-output replacement failure/,
  )
  assert.equal(existsSync(resolve(repo, GENERATION_MANIFEST_PATH)), false)
  for (const directory of [dirname(ACQUISITION_RECEIPTS_PATH), dirname(KNOWLEDGE_OBJECTS_PATH)]) {
    const entries = readdirSync(resolve(repo, directory))
    assert.ok(entries.every((entry) => !entry.endsWith('.tmp')))
  }
})

test('rejects symbolic-link output parents before write or check', (t) => {
  const writeFixture = committedFixture(t)
  const writeArtifacts = buildField08EvidenceArtifacts(writeFixture.repo, { baseCommit: writeFixture.baseCommit })
  const outsideWrite = mkdtempSync(join(tmpdir(), 'food-field08-output-outside-'))
  t.after(() => rmSync(outsideWrite, { recursive: true, force: true }))
  symlinkSync(outsideWrite, resolve(writeFixture.repo, dirname(KNOWLEDGE_OBJECTS_PATH)))
  assert.throws(
    () => writeOrCheckField08Evidence(writeFixture.repo, writeArtifacts, false),
    /parent cannot be a symbolic link/,
  )

  const checkFixture = committedFixture(t)
  const checkArtifacts = buildField08EvidenceArtifacts(checkFixture.repo, { baseCommit: checkFixture.baseCommit })
  writeOrCheckField08Evidence(checkFixture.repo, checkArtifacts, false)
  const outsideCheck = mkdtempSync(join(tmpdir(), 'food-field08-check-outside-'))
  t.after(() => rmSync(outsideCheck, { recursive: true, force: true }))
  rmSync(resolve(checkFixture.repo, dirname(KNOWLEDGE_OBJECTS_PATH)), { recursive: true })
  symlinkSync(outsideCheck, resolve(checkFixture.repo, dirname(KNOWLEDGE_OBJECTS_PATH)))
  assert.throws(
    () => writeOrCheckField08Evidence(checkFixture.repo, checkArtifacts, true),
    /parent cannot be a symbolic link/,
  )
})

test('rejects unknown, missing and duplicate CLI arguments', () => {
  assert.deepEqual(parseField08EvidenceCliArgs(['--check', '--base-commit=abc123']), { check: true, requireCaptures: false, baseCommit: 'abc123' })
  assert.deepEqual(parseField08EvidenceCliArgs(['--base-commit', 'abc123']), { check: false, requireCaptures: false, baseCommit: 'abc123' })
  assert.deepEqual(parseField08EvidenceCliArgs(['--check', '--require-captures']), { check: true, requireCaptures: true, baseCommit: undefined })
  assert.throws(() => parseField08EvidenceCliArgs(['--chek']), /Unknown argument/)
  assert.throws(() => parseField08EvidenceCliArgs(['--base-commit']), /requires a value/)
  assert.throws(() => parseField08EvidenceCliArgs(['--check', '--check']), /Duplicate --check/)
  assert.throws(() => parseField08EvidenceCliArgs(['--require-captures']), /requires --check/)
  assert.throws(() => parseField08EvidenceCliArgs(['--check', '--require-captures', '--require-captures']), /Duplicate --require-captures/)
})
