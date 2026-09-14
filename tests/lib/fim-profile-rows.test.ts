import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildFimProfileRows, validateFimInputs, type FimInputs } from '../../src/lib/fim/profile-rows'

// Synthetic fixture only: this repository is public and must never carry real FIM data.
function field(state: string) {
  return { label: 'Felt', evidence_state: state, applicability: 'applicable', evidence: [], issues: [], numeric_observations: [] }
}

function fixture(): FimInputs {
  return {
    profiles: [
      {
        actor_id: 'core-a',
        org_number: '000000001',
        name: 'Testselskap A AS',
        entity_kind: 'legal_entity',
        fields: { identity: field('registry_documented'), products: field('not_structured_in_inputs'), capacity: field('conflict_open') },
        inherited_narrative: { text: 'Syntetisk tangprodusent', status: 'inherited_not_revalidated' },
        original_open_questions: [{ field: 'capacity', question: 'Hvor stor er kapasiteten?' }],
      },
      {
        actor_id: 'fishery-b',
        org_number: '',
        name: 'Testfiske B AS',
        entity_kind: 'registered_organisation',
        origin: 'fishery approval crosswalk',
        fields: { identity: field('registry_documented'), stage: field('not_researched') },
      },
    ],
    findings: [
      { finding_id: 'f1', actor_id: 'core-a', kind: 'registered_name' },
      { finding_id: 'f2', actor_id: 'fishery-b', kind: 'registered_name', fields: ['stage'] },
      { finding_id: 'f3', actor_id: 'core-a', kind: 'filed_accounts' },
    ],
    observations: [{ actor_id: 'core-a', metric: 'revenue', value: 10, unit: 'NOK' }],
    summary: { profiles: 2, new_findings: 3, numeric_observations: 1 },
    pilotRecords: [
      {
        job_id: 'actor-core-a',
        kind: 'existing_actor_field_packet',
        review_verdict: 'pass',
        claims: [{
          claim_id: 'c1',
          fields: ['identity'],
          statement: 'Syntetisk påstand',
          source_refs: [{ url: 'https://example.org/a', json_pointer: '/navn', source_value: 'x', path: '/Users/reviewer/local.json' }],
          automated_review: { verdict: 'supported', reason: 'Støttet av kilden' },
        }],
        field_assessments: [{ field: 'identity', state: 'candidate_supported', automated_review: { verdict: 'supported' } }],
        escalations: [{ field: 'capacity', question: 'Finn primærkilde' }],
        excluded_claims: [],
      },
      { job_id: 'issue-synthetic', kind: 'exception', review_verdict: 'pass', claims: [] },
    ],
  }
}

describe('FIM profile rows', () => {
  it('accepts consistent inputs', () => {
    assert.deepEqual(validateFimInputs(fixture()), [])
  })

  it('maps profiles with cohort, counts, children, and search text', () => {
    const [core, fishery] = buildFimProfileRows(fixture())

    assert.equal(core.cohort, 'core')
    assert.equal(fishery.cohort, 'fishery')
    assert.equal(fishery.orgNumber, null)
    assert.equal(core.releaseId, 'enrichment-v009')
    assert.deepEqual(core.findings.map(f => f.finding_id), ['f1', 'f3'])
    assert.deepEqual(fishery.findings.map(f => f.finding_id), ['f2'])
    assert.equal(core.numericObservations.length, 1)
    assert.equal(fishery.numericObservations.length, 0)
    assert.equal(core.documentedFieldCount, 2)
    assert.equal(core.conflictCount, 1)
    // 'stage' has no field evidence but carries a finding, so it counts.
    assert.equal(fishery.documentedFieldCount, 2)
    assert.match(core.searchText, /Testselskap A AS/)
    assert.match(core.searchText, /000000001/)
    assert.match(core.searchText, /tangprodusent/)
  })

  it('attaches pilot reviews by job id and drops local reviewer paths', () => {
    const [core, fishery] = buildFimProfileRows(fixture())

    assert.equal(fishery.pilotReview, null)
    assert.equal(core.pilotReview?.verdict, 'pass')
    assert.equal(core.pilotReview?.claims[0].verdict, 'supported')
    assert.deepEqual(core.pilotReview?.claims[0].sources, [{ url: 'https://example.org/a', pointer: '/navn', value: 'x' }])
    assert.equal(core.pilotReview?.fieldAssessments[0].verdict, 'supported')
    assert.equal(core.pilotReview?.escalations[0].question, 'Finn primærkilde')
    assert.doesNotMatch(JSON.stringify(core.pilotReview), /\/Users\//)
  })

  it('reports count, duplicate, and orphan problems without names or ids', () => {
    const inputs = fixture()
    inputs.profiles.push({ ...inputs.profiles[0] })
    inputs.findings.push({ finding_id: 'f4', actor_id: 'missing-actor' })
    inputs.observations.push({ actor_id: 'missing-actor' })

    const errors = validateFimInputs(inputs)
    assert.deepEqual(errors, [
      'profiles: expected 2, got 3',
      'findings: expected 3, got 4',
      'numeric observations: expected 1, got 2',
      'duplicate profile ids: 1',
      'findings without profile: 1',
      'numeric observations without profile: 1',
    ])
    assert.doesNotMatch(errors.join(' '), /Testselskap|core-a|missing-actor/)
  })
})
