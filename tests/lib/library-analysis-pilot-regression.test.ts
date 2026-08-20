import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisCandidatePlan,
  buildLibraryAnalysisRequestBatch,
  buildLibraryValidationCandidatePlan,
  buildLibraryValidationRequest,
  LibraryAnalysisResponseSchema,
  LibraryValidationResponseSchema,
  libraryAnalysisRequestHash,
  libraryValidationRequestHash,
} from '../../src/lib/knowledge/library-analysis-automated-runner'
import { deriveAutomatedDisposition } from '../../src/lib/knowledge/library-analysis-automated-validation'
import { runDeterministicLibraryGates } from '../../src/lib/knowledge/library-analysis-evidence-gates'
import { buildLibraryAnalysisPopulation } from '../../src/lib/knowledge/library-analysis-population'

type PilotFixture = {
  schema: string
  pilotId: string
  executionProfile: {
    analysis: { provider: string; name: string; version: string }
    validator: { provider: string; name: string; version: string }
    validatorSeparation: 'same_model'
    validatorSeparationLevel: 'same_model_distinct_prompt'
  }
  sources: Array<{
    sourceKind: string
    sourceKey: string
    path: string
    contentHash: string
    claims: Array<{
      claimId: string
      assertionType: string
      text: string
      evidence: string
    }>
  }>
  negativeCases: Array<{
    caseId: string
    sourceKey: string
    claim: string
    evidence: string
    expectedErrorClass: 'F3'
    validatorKind: 'deterministic' | 'model'
  }>
}

type PilotReceipt = {
  schema: string
  pilotId: string
  automatedOnly: true
  externalReady: false
  persistenceState: 'candidate_plan_only_not_applied'
  populationSnapshotId: string
  populationHash: string
  validatorSeparationLevel: string
  sourceResults: Array<{
    sourceKey: string
    analysisRunId: string
    validationRunId: string
    disposition: string
    machineUse: string
    findings: unknown[]
  }>
  negativeRegressionResults: Array<{
    caseId: string
    disposition: string
    machineUse: string
    findings: Array<{ errorClass: string }>
  }>
}

const fixture = JSON.parse(readFileSync(
  'tests/fixtures/library-analysis-pilot-ig006-input.v1.json',
  'utf8',
)) as PilotFixture

function sha256(value: string): string {
  return createHash('sha256').update(Buffer.from(value, 'utf8')).digest('hex')
}

function executePilotPlans() {
  const contentBySource = new Map(fixture.sources.map(source => {
    const text = readFileSync(source.path, 'utf8')
    assert.equal(sha256(text), source.contentHash)
    return [source.sourceKey, text] as const
  }))
  const population = buildLibraryAnalysisPopulation(fixture.sources.map(source => ({
    sourceKind: source.sourceKind,
    sourceKey: source.sourceKey,
    sourceVersionHash: source.contentHash,
    inputKind: 'repository_file' as const,
    locator: source.path,
    contentHash: source.contentHash,
    identityConfidence: 'exact' as const,
    readableInput: true,
    superseded: false,
  })))
  const batch = buildLibraryAnalysisRequestBatch({
    snapshot: population,
    contentUnits: fixture.sources.map(source => ({
      sourceKey: source.sourceKey,
      id: `content:pilot:${source.sourceKey.split(':')[1]}`,
      locator: source.path,
      contentHash: source.contentHash,
      text: contentBySource.get(source.sourceKey)!,
    })),
    repositoryRoot: process.cwd(),
  })

  const sourceResults = batch.requests.map(request => {
    const source = fixture.sources.find(item => item.sourceKey === request.sourceKey)!
    const analysisResponse = LibraryAnalysisResponseSchema.parse({
      schema: 'library-analysis-response/v1',
      requestHash: libraryAnalysisRequestHash(request),
      model: fixture.executionProfile.analysis,
      claims: source.claims.map(claim => ({
        ...claim,
        contentUnitId: request.contentUnits[0]!.id,
        locator: request.contentUnits[0]!.locator,
        confidence: null,
      })),
    })
    const analysis = buildLibraryAnalysisCandidatePlan({
      request,
      response: analysisResponse,
    })
    const validationRequest = buildLibraryValidationRequest({
      analysisRequest: request,
      analysisRunId: analysis.run.id,
      analysisOutputManifestHash: analysis.outputManifestHash,
      assertions: analysis.assertions.map(assertion => ({
        assertionId: assertion.id,
        payloadHash: assertion.payloadHash,
      })),
      repositoryRoot: process.cwd(),
    })
    const validationResponse = LibraryValidationResponseSchema.parse({
      schema: 'library-validation-response/v1',
      requestHash: libraryValidationRequestHash(validationRequest),
      model: fixture.executionProfile.validator,
      analysisState: 'complete',
      contentHashStatus: 'current',
      locatorStatus: 'exact',
      validatorSeparation: fixture.executionProfile.validatorSeparation,
      riskFlags: [],
      assessedAssertionIds: validationRequest.assertions.map(({ assertionId }) => assertionId),
      findings: [],
    })
    const validation = buildLibraryValidationCandidatePlan({
      request: validationRequest,
      response: validationResponse,
    })
    return {
      sourceKey: request.sourceKey,
      analysisRunId: analysis.run.id,
      validationRunId: validation.run.id,
      disposition: validation.result.disposition,
      machineUse: validation.result.machineUse,
      findings: validation.result.findings,
    }
  })

  return { population, sourceResults, contentBySource }
}

describe('IG-006 automated-only pilot regression', () => {
  it('binds three tracked fulltexts and creates sealed authority-free candidate plans', () => {
    const { population, sourceResults } = executePilotPlans()
    assert.equal(population.rows.length, 3)
    assert.equal(sourceResults.length, 3)
    assert.equal(sourceResults.every(result => result.disposition === 'partial'), true)
    assert.equal(sourceResults.every(result => result.machineUse === 'candidate_only'), true)
    assert.equal(sourceResults.every(result => result.findings.length === 0), true)
  })

  it('keeps both known partial-evidence cases out of reusable context', () => {
    const { contentBySource } = executePilotPlans()
    for (const negative of fixture.negativeCases) {
      const deterministic = runDeterministicLibraryGates({
        claim: negative.claim,
        evidence: negative.evidence,
        sourceText: contentBySource.get(negative.sourceKey)!,
        locator: fixture.sources.find(source => source.sourceKey === negative.sourceKey)!.path,
        contentUnitId: `content:${negative.caseId}`,
        assertionId: `assertion:${negative.caseId}`,
      }).findings
      const findings = negative.validatorKind === 'deterministic'
        ? deterministic
        : [{
            findingId: `finding:${negative.caseId}`,
            assertionId: `assertion:${negative.caseId}`,
            errorClass: negative.expectedErrorClass,
            severity: 'material' as const,
            affectsClaim: true,
            contentUnitIds: [`content:${negative.caseId}`],
            explanation: 'The excerpt supports only the object, not the stated estimation method.',
            validatorKind: 'model' as const,
            deterministicRuleIds: [],
          }]
      assert.ok(findings.some(finding => finding.errorClass === negative.expectedErrorClass))
      const result = deriveAutomatedDisposition({
        candidateId: `candidate:${negative.caseId}`,
        populationEligibility: 'eligible',
        analysisState: 'complete',
        contentHashStatus: 'current',
        locatorStatus: 'exact',
        validatorSeparation: 'separate_model_plus_deterministic',
        riskFlags: [],
        findings,
      })
      assert.equal(result.machineUse, 'quarantined')
      assert.equal(result.disposition, 'quarantined')
    }
  })

  it('locks the governed receipt to the executable plan identities', () => {
    const receipt = JSON.parse(readFileSync(
      'research/_status/library-analysis-pilot-automated-2026-08-20.json',
      'utf8',
    )) as PilotReceipt
    const { population, sourceResults } = executePilotPlans()

    assert.equal(receipt.schema, 'library-analysis-pilot-automated-receipt/v1')
    assert.equal(receipt.pilotId, fixture.pilotId)
    assert.equal(receipt.automatedOnly, true)
    assert.equal(receipt.externalReady, false)
    assert.equal(receipt.persistenceState, 'candidate_plan_only_not_applied')
    assert.equal(receipt.populationSnapshotId, population.snapshotId)
    assert.equal(receipt.populationHash, population.populationHash)
    assert.equal(receipt.validatorSeparationLevel, fixture.executionProfile.validatorSeparationLevel)
    assert.deepEqual(receipt.sourceResults, sourceResults)
    assert.equal(receipt.negativeRegressionResults.length, 2)
    assert.equal(receipt.negativeRegressionResults.every(result => (
      result.disposition === 'quarantined' &&
      result.machineUse === 'quarantined' &&
      result.findings.some(finding => finding.errorClass === 'F3')
    )), true)
  })
})
