import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  canonicalSha256,
  runCoverageFoundationValidation,
  validateCoverageFoundation,
  validateKnowledgeFoundation,
  type KnowledgeValidationResult,
} from '../../scripts/knowledge/validate-knowledge-foundation'

const root = fileURLToPath(new URL('../../', import.meta.url))

function coverageCellId(geographyId: string): string {
  const csv = readFileSync(new URL('../../knowledge/coverage/coverage-cells.v1.csv', import.meta.url), 'utf8')
  const row = csv.split(/\r?\n/).find((line) => (
    line.includes(`,${geographyId},`)
    && line.includes('stage.consumption.commercial_meals')
    && line.includes('domain.animal_health_welfare')
  ))
  assert.ok(row, `Expected a generated coverage cell for ${geographyId}`)
  return row.slice(0, row.indexOf(','))
}

const NO_CELL = coverageCellId('geo.no')
const SE_CELL = coverageCellId('geo.se')
const WHOLE_NORDIC = ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is', 'geo.fo', 'geo.gl', 'geo.ax']

function firstJsonLine(relativePath: string): Record<string, unknown> {
  const content = readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8')
  const newline = content.indexOf('\n')
  return JSON.parse(newline === -1 ? content : content.slice(0, newline)) as Record<string, unknown>
}

const MULTI_AXIS_LEDGER_RECORD = firstJsonLine('knowledge/coverage/coverage-ledger.v1.jsonl')
const BASELINE_ASSESSMENT = firstJsonLine('knowledge/coverage/coverage-assessments-baseline.v1.jsonl')
const SOURCE_SNAPSHOTS = JSON.parse(
  readFileSync(new URL('../../knowledge/coverage/coverage-source-snapshots.v1.json', import.meta.url), 'utf8'),
) as Record<string, unknown>
const ASSESSMENT_CELL = (() => {
  const assessmentCellId = BASELINE_ASSESSMENT.cellId
  const ledger = readFileSync(new URL('../../knowledge/coverage/coverage-ledger.v1.jsonl', import.meta.url), 'utf8')
  const line = ledger.split(/\r?\n/).find((candidate) => candidate.includes(`\"cellId\":\"${String(assessmentCellId)}\"`))
  assert.ok(line, `Expected ledger cell ${String(assessmentCellId)}`)
  return (JSON.parse(line) as { cell: Record<string, unknown> }).cell
})()

function cloneObject(value: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(value)
}

function lenses(state: 'assessed' | 'unknown' | 'not_applicable' = 'unknown') {
  return Object.fromEntries([
    'lens.system_boundary',
    'lens.geography_scale',
    'lens.time_change',
    'lens.value_chain_stage',
    'lens.actor_position_power',
    'lens.commodity_material',
    'lens.flow_circularity_cascade',
    'lens.evidence_uncertainty',
    'lens.distribution_equity_rights',
    'lens.resilience_shock',
    'lens.outcome_tradeoffs',
  ].map((id) => [id, { state, note: `${id} reviewed` }]))
}

function facets(geographyIds = ['geo.no']): Record<string, unknown> {
  return {
    geographyIds,
    stageIds: ['stage.consumption.commercial_meals'],
    domainIds: ['domain.animal_health_welfare'],
    outcomeIds: [],
    actorClassIds: [],
    flowClassIds: [],
    commodityGroupIds: [],
    materialGroupIds: [],
    circularStrategyIds: [],
    ownershipFormIds: [],
  }
}

function internalEvidence() {
  return {
    evidenceBasis: 'not_assessed',
    verificationStatus: 'unverified',
    citationReadiness: 'blocked_unsourced',
    appraisalState: 'none',
    sourceRefs: [],
    uncertainty: { level: 'unknown', reasons: ['Draft baseline'] },
  }
}

function baseObject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fs:claim:draft-animal-welfare',
    schemaVersion: '1.0.0',
    ontologyVersion: '1.0.0',
    objectTypeId: 'knowledge_object.claim',
    title: 'Draft animal-welfare claim',
    summary: 'Draft internal claim awaiting evidence.',
    claimText: 'A draft proposition.',
    claimStatus: 'internal_candidate',
    aggregationAllowed: false,
    facets: facets(),
    timeScope: { kind: 'snapshot', asOf: '2026-07-26' },
    systemBoundary: { included: ['Commercial meals'], excluded: [], functionalUnit: null },
    evidence: internalEvidence(),
    operationalRoute: 'source_gated',
    coverageCellIds: [NO_CELL],
    lensAssessments: lenses(),
    relations: [],
    payloadKind: 'none',
    legacyFieldIds: [],
    createdAt: '2026-07-26',
    updatedAt: '2026-07-26',
    ...overrides,
  }
}

function sourceObject() {
  return {
    ...baseObject({
      id: 'fs:source:nordic-primary-demo',
      objectTypeId: 'knowledge_object.source',
      title: 'Nordic primary source',
      summary: 'Stable source identity used by validation tests.',
      operationalRoute: 'none',
    }),
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
  }
}

function externalNordicClaim() {
  return baseObject({
    id: 'fs:claim:nordic-external-demo',
    title: 'Reviewed Nordic comparison',
    summary: 'Reviewed comparison with explicit geography accounting.',
    claimText: 'The reviewed result represents Norway and Sweden under the declared comparison method.',
    claimStatus: 'controlled',
    aggregationAllowed: true,
    facets: {
      ...facets(['geo.nordic']),
      representedGeographyIds: ['geo.no', 'geo.se'],
      missingGeographyIds: ['geo.dk', 'geo.fi', 'geo.is'],
      notApplicableGeographyIds: ['geo.fo', 'geo.gl', 'geo.ax'],
    },
    comparisonScope: {
      kind: 'whole_political_nordic',
      memberGeographyIds: WHOLE_NORDIC,
      method: 'Harmonized comparison of reviewed national records.',
      periodAlignment: 'Calendar year 2025.',
      limitations: ['Three territories are not applicable to this specific measure.'],
    },
    coverageCellIds: [NO_CELL, SE_CELL],
    evidence: {
      evidenceBasis: 'observed',
      verificationStatus: 'human_verified',
      citationReadiness: 'citable_external',
      appraisalState: 'reviewed',
      reviewedBy: 'reviewer:test',
      reviewedAt: '2026-07-26',
      sourceRefs: [{
        sourceId: 'fs:source:nordic-primary-demo',
        sourceClass: 'primary',
        citationText: 'Nordic primary source, table 4.',
        url: 'https://example.org/nordic-primary',
        locator: 'Table 4, rows NO and SE',
        accessedAt: '2026-07-26',
        evidenceRole: 'descriptive_claim',
        supportsOrChallenges: 'supports',
        verificationStatus: 'human_verified',
        reviewedBy: 'reviewer:test',
        reviewedAt: '2026-07-26',
      }],
      uncertainty: { level: 'low', reasons: ['Aligned period and definition.'] },
    },
    lensAssessments: lenses('assessed'),
  })
}

function codes(result: KnowledgeValidationResult): Set<string> {
  return new Set(result.issues.map((item) => item.code))
}

function assertInvalid(result: KnowledgeValidationResult, expectedCode: string) {
  assert.equal(result.valid, false)
  assert.ok(codes(result).has(expectedCode), `Expected ${expectedCode}; received ${[...codes(result)].join(', ')}`)
}

test('validates every generated coverage cell and baseline assessment by default', () => {
  const result = runCoverageFoundationValidation(root)
  assert.equal(result.valid, true, result.issues.map((item) => `${item.code}: ${item.message}`).join('\n'))
  assert.ok(result.cellCount > 0)
  assert.ok(result.assessmentCount > 0)
})

test('rejects fake controlled axis IDs in coverage cells', () => {
  const cell = cloneObject(MULTI_AXIS_LEDGER_RECORD.cell as Record<string, unknown>)
  const bindings = cell.axisBindings as Array<Record<string, unknown>>
  bindings[0].valueId = 'domain.not_in_ontology'
  const result = validateCoverageFoundation({
    cells: [cell],
    assessments: [],
    sourceSnapshots: cloneObject(SOURCE_SNAPSHOTS),
  }, { root })
  assertInvalid(result, 'unknown_coverage_axis_id')
  assert.ok(codes(result).has('axis_value_not_in_profile'))
})

test('rejects unsorted and duplicate axis bindings', () => {
  const unsorted = cloneObject(MULTI_AXIS_LEDGER_RECORD.cell as Record<string, unknown>)
  ;(unsorted.axisBindings as unknown[]).reverse()
  const duplicate = cloneObject(MULTI_AXIS_LEDGER_RECORD.cell as Record<string, unknown>)
  const duplicateBindings = duplicate.axisBindings as Array<Record<string, unknown>>
  duplicateBindings[1].dimension = duplicateBindings[0].dimension
  const result = validateCoverageFoundation({
    cells: [unsorted, duplicate],
    assessments: [],
    sourceSnapshots: cloneObject(SOURCE_SNAPSHOTS),
  }, { root })
  assertInvalid(result, 'unsorted_axis_bindings')
  assert.ok(codes(result).has('duplicate_axis_binding'))
})

test('rejects baseline and artifact provenance mismatches', () => {
  const assessment = cloneObject(BASELINE_ASSESSMENT)
  assessment.baselineSnapshotId = `snapshot.v1.${'0'.repeat(20)}`
  assessment.artifactSnapshotIds = [`artifact.v1.${'0'.repeat(20)}`]
  const withoutHash = { ...assessment }
  delete withoutHash.contentHash
  assessment.contentHash = canonicalSha256(withoutHash)
  const result = validateCoverageFoundation({
    cells: [cloneObject(ASSESSMENT_CELL)],
    assessments: [assessment],
    sourceSnapshots: cloneObject(SOURCE_SNAPSHOTS),
  }, { root })
  assertInvalid(result, 'baseline_snapshot_mismatch')
  assert.ok(codes(result).has('unknown_artifact_snapshot'))
})

test('rejects a mutated assessment content hash', () => {
  const assessment = cloneObject(BASELINE_ASSESSMENT)
  assessment.contentHash = `sha256:${'0'.repeat(64)}`
  const result = validateCoverageFoundation({
    cells: [cloneObject(ASSESSMENT_CELL)],
    assessments: [assessment],
    sourceSnapshots: cloneObject(SOURCE_SNAPSHOTS),
  }, { root })
  assertInvalid(result, 'assessment_content_hash_mismatch')
})

test('rejects an unknown assessment supersession target', () => {
  const assessment = cloneObject(BASELINE_ASSESSMENT)
  assessment.supersedesId = `assess.v1.2026-07-26.${'0'.repeat(20)}`
  const withoutHash = { ...assessment }
  delete withoutHash.contentHash
  assessment.contentHash = canonicalSha256(withoutHash)
  const result = validateCoverageFoundation({
    cells: [cloneObject(ASSESSMENT_CELL)],
    assessments: [assessment],
    sourceSnapshots: cloneObject(SOURCE_SNAPSHOTS),
  }, { root })
  assertInvalid(result, 'unknown_supersedes_target')
  assert.equal(codes(result).has('assessment_content_hash_mismatch'), false)
})

test('accepts a draft baseline claim without promoting its evidence state', () => {
  const result = validateKnowledgeFoundation(baseObject(), { root })
  assert.deepEqual(result, { valid: true, issues: [] })
})

test('accepts a fully reviewed external Nordic claim with exact geography accounting', () => {
  const result = validateKnowledgeFoundation([sourceObject(), externalNordicClaim()], { root })
  assert.deepEqual(result, { valid: true, issues: [] })
})

test('applies Nordic member accounting to non-claim knowledge objects', () => {
  const synthesis = externalNordicClaim()
  Object.assign(synthesis, {
    id: 'fs:synthesis:nordic-external-demo',
    objectTypeId: 'knowledge_object.synthesis',
    claimText: undefined,
    claimStatus: undefined,
  })
  const result = validateKnowledgeFoundation([sourceObject(), synthesis], { root })
  assert.deepEqual(result, { valid: true, issues: [] })
})

test('rejects the historical external-readiness bypass', () => {
  const bypass = baseObject({
    evidence: {
      ...internalEvidence(),
      citationReadiness: 'citable_external',
    },
  })
  const result = validateKnowledgeFoundation(bypass, { root })
  assert.equal(result.valid, false)
  assert.ok(result.issues.some((item) => item.path.startsWith('/evidence')))
  assert.ok(result.issues.some((item) => item.path.startsWith('/lensAssessments')))
  assert.ok(result.issues.some((item) => item.path.startsWith('/facets')))
})

test('rejects manual completion authority and legacy ko canonical IDs', () => {
  const result = validateKnowledgeFoundation(baseObject({
    id: 'ko.claim.manual-completion',
    completionStatus: 'complete',
  }), { root })
  assert.equal(result.valid, false)
  assert.ok(codes(result).has('schema_pattern'))
  assert.ok(codes(result).has('schema_additionalProperties'))
})

test('rejects fake ontology IDs, fake coverage cells and unresolved relation endpoints', () => {
  const draft = baseObject({
    facets: { ...facets(['geo.fake']), domainIds: ['domain.fake'] },
    coverageCellIds: ['cov.canonical_core.fake.fake.fake'],
    relations: [{ relationType: 'related_to', targetId: 'fs:claim:not-present' }],
  })
  const result = validateKnowledgeFoundation(draft, { root })
  assertInvalid(result, 'unknown_ontology_id')
  assert.ok(codes(result).has('unknown_coverage_cell'))
  assert.ok(codes(result).has('unresolved_reference'))
})

test('rejects malformed relation endpoints even when callers list them as known', () => {
  const result = validateKnowledgeFoundation(baseObject({
    relations: [{ relationType: 'related_to', targetId: 'fs:claim:' }],
  }), {
    root,
    knownObjectIds: ['fs:claim:'],
  })
  assert.ok(codes(result).has('schema_pattern'))
})

test('rejects Norway-only and overlapping Nordic geography accounting', () => {
  const claim = externalNordicClaim()
  claim.facets = {
    ...claim.facets,
    representedGeographyIds: ['geo.no'],
    missingGeographyIds: ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is'],
    notApplicableGeographyIds: ['geo.fo', 'geo.gl', 'geo.ax'],
  }
  const result = validateKnowledgeFoundation([sourceObject(), claim], { root })
  assertInvalid(result, 'norway_proxy_for_nordic')
  assert.ok(codes(result).has('overlapping_geography_accounting'))
})

test('requires a dated search protocol for true-C and rejects a non-future recheck', () => {
  const missing = validateKnowledgeFoundation(baseObject({ operationalRoute: 'true_c' }), { root })
  assert.ok(codes(missing).has('schema_required'))

  const stale = validateKnowledgeFoundation(baseObject({
    operationalRoute: 'true_c',
    searchProtocol: {
      scope: 'National open-data search.',
      method: 'Named registry and literature search.',
      sourcesChecked: ['Registry A'],
      asOf: '2026-07-26',
      recheckAt: '2026-07-26',
      negativeFinding: 'No qualifying series identified within the scope.',
    },
  }), { root })
  assertInvalid(stale, 'invalid_recheck_date')
})

test('requires case maturity, realization and coverage routing', () => {
  const result = validateKnowledgeFoundation(baseObject({
    id: 'fs:case:pilot-without-state',
    objectTypeId: 'knowledge_object.case',
    claimText: undefined,
    claimStatus: undefined,
    caseState: undefined,
  }), { root })
  assert.ok(codes(result).has('schema_required'))
})

test('models control relationships without commodity quantities', () => {
  const actorA = sourceObject()
  Object.assign(actorA, { id: 'fs:actor:owner-a', objectTypeId: 'knowledge_object.actor', title: 'Owner A' })
  const actorB = sourceObject()
  Object.assign(actorB, { id: 'fs:actor:company-b', objectTypeId: 'knowledge_object.actor', title: 'Company B' })
  const relationship = baseObject({
    id: 'fs:flow:ownership-a-b',
    objectTypeId: 'knowledge_object.flow',
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
    payloadKind: 'relationship',
    relationship: {
      fromId: 'fs:actor:owner-a',
      toId: 'fs:actor:company-b',
      relationshipClassId: 'flow.control.ownership',
      direction: 'directed',
      period: '2026-07-26',
      realizationState: 'realized_measured',
    },
  })
  const result = validateKnowledgeFoundation([actorA, actorB, relationship], { root })
  assert.deepEqual(result, { valid: true, issues: [] })
})

test('keeps stock and metric payloads distinct from physical flows', () => {
  const actor = sourceObject()
  Object.assign(actor, { id: 'fs:actor:meal-provider', objectTypeId: 'knowledge_object.actor', title: 'Meal provider' })
  const indicator = baseObject({
    id: 'fs:indicator:meal-stock-tonnes',
    objectTypeId: 'knowledge_object.indicator',
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
    payloadKind: 'metric_indicator',
    metricIndicator: {
      metricId: 'fs:indicator:meal-stock-tonnes',
      subjectIds: ['fs:actor:meal-provider'],
      geographyIds: ['geo.no'],
      period: '2025',
      value: 12,
      unit: 'tonnes',
      universe: 'Reviewed meal-provider inventory.',
      method: 'Direct reported stock at period end.',
    },
  })
  const stock = baseObject({
    id: 'fs:observation:meal-stock-2025',
    objectTypeId: 'knowledge_object.observation',
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
    payloadKind: 'stock',
    stock: {
      subjectId: 'fs:actor:meal-provider',
      geographyId: 'geo.no',
      stageId: 'stage.consumption.commercial_meals',
      commodityGroupId: 'commodity.mixed_food_basket',
      quantity: 12,
      unit: 'tonnes',
      period: '2025',
      realizationState: 'realized_measured',
    },
  })
  const result = validateKnowledgeFoundation([actor, indicator, stock], { root })
  assert.deepEqual(result, { valid: true, issues: [] })
})

test('requires quantity or an explicit unknown reason for physical flows', () => {
  const flow = baseObject({
    id: 'fs:flow:food-without-quantity',
    objectTypeId: 'knowledge_object.flow',
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
    payloadKind: 'physical_flow',
    physicalFlow: {
      fromEntityId: 'fs:actor:producer',
      toEntityId: 'fs:actor:retailer',
      flowClassId: 'flow.physical.food',
      stageFromId: 'stage.primary.agriculture_crop',
      stageToId: 'stage.market.retail',
      originGeographyId: 'geo.no',
      destinationGeographyId: 'geo.no',
      commodityGroupId: 'commodity.plant_food.cereals',
      period: '2025',
      realizationState: 'realized_measured',
    },
  })
  const result = validateKnowledgeFoundation(flow, {
    root,
    knownObjectIds: ['fs:actor:producer', 'fs:actor:retailer'],
  })
  assert.ok(codes(result).has('schema_anyOf'))
})

test('rejects physical-flow classes in relationship payloads', () => {
  const flow = baseObject({
    id: 'fs:flow:invalid-relationship',
    objectTypeId: 'knowledge_object.flow',
    claimText: undefined,
    claimStatus: undefined,
    coverageCellIds: undefined,
    payloadKind: 'relationship',
    relationship: {
      fromId: 'fs:actor:owner-a',
      toId: 'fs:actor:company-b',
      relationshipClassId: 'flow.physical.food',
      direction: 'directed',
      period: '2026-07-26',
      realizationState: 'realized_measured',
    },
  })
  const result = validateKnowledgeFoundation(flow, {
    root,
    knownObjectIds: ['fs:actor:owner-a', 'fs:actor:company-b'],
  })
  assert.ok(codes(result).has('schema_pattern'))
})
