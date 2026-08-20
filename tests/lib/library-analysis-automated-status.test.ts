import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildAutomatedLibraryAnalysisStatus,
  buildAutomatedLibraryAnalysisStatusFromRunConfigs,
  type AutomatedLibraryAnalysisStatusInput,
} from '../../src/lib/knowledge/library-analysis-automated-status'

const hash = 'a'.repeat(64)

function input(
  overrides: Partial<AutomatedLibraryAnalysisStatusInput> = {},
): AutomatedLibraryAnalysisStatusInput {
  return {
    populationSnapshotId: 'population-2026-08-20',
    populationHash: hash,
    populationTotal: 3,
    queryErrors: [],
    records: [
      {
        sourceKey: 'source:a',
        dataClass: 'claim',
        disposition: 'candidate_complete',
        machineUse: 'reusable_for_ai_context',
        findings: [],
        analysisDisposition: 'candidate_complete',
        validatorDisposition: 'candidate_complete',
        validatorSeparationLevel: 'different_provider',
      },
      {
        sourceKey: 'source:b',
        dataClass: 'claim',
        disposition: 'quarantined',
        machineUse: 'quarantined',
        findings: [{
          findingId: 'finding:b',
          assertionId: 'assertion:b',
          errorClass: 'F3',
          severity: 'material',
          affectsClaim: true,
          contentUnitIds: ['unit:b'],
          explanation: 'Evidence does not bind the complete claim.',
          validatorKind: 'model',
          deterministicRuleIds: [],
        }],
        analysisDisposition: 'candidate_complete',
        validatorDisposition: 'quarantined',
        validatorSeparationLevel: 'different_model_same_provider',
      },
      {
        sourceKey: 'source:c',
        dataClass: 'background',
        disposition: 'blocked_input',
        machineUse: 'candidate_only',
        findings: [],
        analysisDisposition: null,
        validatorDisposition: 'blocked_input',
        validatorSeparationLevel: 'different_provider',
      },
    ],
    ...overrides,
  }
}

describe('automated library analysis status', () => {
  it('reports a reconciled automated-only population without authority fields', () => {
    const status = buildAutomatedLibraryAnalysisStatus(input())

    assert.equal(status.automatedOnly, true)
    assert.equal(status.automatedValidationState, 'complete')
    assert.equal(status.populationTotal, 3)
    assert.equal(status.disposedTotal, 3)
    assert.equal(status.candidateComplete, 1)
    assert.equal(status.blockedInput, 1)
    assert.equal(status.quarantined, 1)
    assert.equal(status.reusableForAiContext, 1)
    assert.equal(status.automatedFindingsByClass.F3, 1)
    assert.equal(status.automatedFindingRateByDataClass.claim, 0.5)
    assert.equal(status.automatedFindingRateByDataClass.background, 0)
    assert.equal(status.analysisValidatorDisagreementRate, 0.5)
    assert.equal(status.validatorSeparationLevel, 'different_model_same_provider')
    assert.equal('accuracy' in status, false)
    assert.equal('reviewStatus' in status, false)
    assert.equal('externalReady' in status, false)
  })

  it('fails closed on query errors', () => {
    const status = buildAutomatedLibraryAnalysisStatus(input({
      queryErrors: ['candidate_validation_query_failed'],
    }))

    assert.equal(status.automatedValidationState, 'degraded')
    assert.equal(status.reusableForAiContext, 0)
  })

  it('reports not started and running states honestly', () => {
    const notStarted = buildAutomatedLibraryAnalysisStatus(input({
      populationSnapshotId: null,
      populationHash: null,
      populationTotal: 0,
      records: [],
    }))
    assert.equal(notStarted.automatedValidationState, 'not_started')

    const running = buildAutomatedLibraryAnalysisStatus(input({
      populationTotal: 4,
    }))
    assert.equal(running.automatedValidationState, 'running')
  })

  it('degrades impossible reconciliation and suppresses reusable counts', () => {
    const status = buildAutomatedLibraryAnalysisStatus(input({
      populationTotal: 2,
    }))

    assert.equal(status.automatedValidationState, 'degraded')
    assert.equal(status.disposedTotal, 3)
    assert.equal(status.reusableForAiContext, 0)
  })

  it('uses the newest sealed population and one latest result per source', () => {
    const automatedResult = {
      schema: 'automated-library-analysis-result/v1' as const,
      candidateId: 'candidate:a',
      automatedOnly: true as const,
      disposition: 'candidate_complete' as const,
      machineUse: 'reusable_for_ai_context' as const,
      validatorSeparation: 'separate_model_plus_deterministic' as const,
      riskFlags: [],
      findings: [],
      limitations: [],
    }
    const status = buildAutomatedLibraryAnalysisStatusFromRunConfigs({
      populationTotal: 1,
      configs: [{
        populationSnapshotId: 'population:new',
        populationHash: hash,
        sourceKey: 'source:a',
        analysisDisposition: 'candidate_complete',
        automatedResult,
        dataClass: 'background',
        validatorSeparationLevel: 'different_model_same_provider',
      }, {
        populationSnapshotId: 'population:old',
        populationHash: 'b'.repeat(64),
        sourceKey: 'source:a',
        analysisDisposition: 'candidate_complete',
        automatedResult,
        dataClass: 'background',
        validatorSeparationLevel: 'same_model_distinct_prompt',
      }],
    })

    assert.equal(status.automatedValidationState, 'complete')
    assert.equal(status.populationSnapshotId, 'population:new')
    assert.equal(status.disposedTotal, 1)
  })
})
