import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import {
  buildCoverageArtifacts,
  buildCoverageCells,
  canonicalJson,
  sha256,
  validateOntology,
  type Ontology,
} from '../../scripts/knowledge/generate-coverage-ledger'

const root = fileURLToPath(new URL('../../', import.meta.url))

const outputFiles = [
  'knowledge/coverage/coverage-cells.v1.csv',
  'knowledge/coverage/coverage-assessments-baseline.v1.jsonl',
  'knowledge/coverage/coverage-ledger.v1.jsonl',
  'knowledge/coverage/coverage-ledger.v1.csv',
  'knowledge/coverage/coverage-summary.v1.json',
  'knowledge/coverage/coverage-source-snapshots.v1.json',
]

function expectedCells(profile: Ontology['coverageProfiles'][number]): number {
  return profile.geographyIds.length
    * profile.axes.reduce((product, axis) => product * axis.ids.length, 1)
}

test('materializes four non-conflating political, Sapmi and legacy profiles', () => {
  const artifacts = buildCoverageArtifacts(root)
  const counts = Object.groupBy(artifacts.cells, (cell) => cell.profileId)

  for (const profile of artifacts.ontology.coverageProfiles) {
    assert.equal(counts[profile.id]?.length, expectedCells(profile), profile.id)
  }
  assert.equal(counts['profile.canonical_political_macro']?.length, 6_072)
  assert.equal(counts['profile.canonical_sapmi_overlap_macro']?.length, 759)
  assert.equal(counts['profile.legacy_field_political']?.length, 104)
  assert.equal(counts['profile.legacy_field_sapmi_overlap']?.length, 13)
  assert.equal(artifacts.cells.length, 6_948)
  assert.equal(new Set(artifacts.cells.map((cell) => cell.cellId)).size, artifacts.cells.length)

  for (const cell of artifacts.cells) {
    if (cell.aggregationClass === 'sapmi_overlapping') assert.equal(cell.geographyId, 'geo.sapmi')
    if (cell.aggregationClass === 'political_nordic') assert.notEqual(cell.geographyId, 'geo.sapmi')
  }
})

test('derives dimension-labelled cell IDs independently of profile axis order', () => {
  const artifacts = buildCoverageArtifacts(root)
  const changed = structuredClone(artifacts.ontology)
  const profile = changed.coverageProfiles.find((item) => item.id === 'profile.canonical_political_macro')
  assert.ok(profile)
  profile.axes.reverse()

  const originalIds = artifacts.cells
    .filter((cell) => cell.profileId === profile.id)
    .map((cell) => cell.cellId)
  const reorderedIds = buildCoverageCells(changed)
    .filter((cell) => cell.profileId === profile.id)
    .map((cell) => cell.cellId)
  assert.deepEqual(reorderedIds, originalIds)
  assert.ok(originalIds[0].includes('domains='))
  assert.ok(originalIds[0].includes('value_chain_stages='))
  for (const cell of artifacts.cells) {
    assert.deepEqual(
      cell.axisBindings.map((binding) => binding.dimension),
      cell.axisBindings.map((binding) => binding.dimension).toSorted(),
    )
  }
})

test('enforces ontology trees and stage coverage-unit membership dynamically', () => {
  const artifacts = buildCoverageArtifacts(root)
  validateOntology(artifacts.ontology)
  const stages = artifacts.ontology.dimensions.valueChainStages
  assert.equal(stages.filter((term) => term.coverageUnit === true).length, 33)
  for (const stage of stages.filter((term) => term.coverageUnit === true)) {
    assert.ok(stage.nodeKind)
    assert.equal(stages.some((candidate) => candidate.parentId === stage.id), false)
  }

  const cyclic = structuredClone(artifacts.ontology)
  const parent = cyclic.dimensions.valueChainStages.find((term) => term.id === 'stage.primary')
  assert.ok(parent)
  parent.parentId = 'stage.primary.agriculture_crop'
  assert.throws(() => validateOntology(cyclic), /cycle|structural leaf/)

  const nonCoverageProfile = structuredClone(artifacts.ontology)
  const political = nonCoverageProfile.coverageProfiles.find((item) => item.id === 'profile.canonical_political_macro')
  assert.ok(political)
  const stageAxis = political.axes.find((axis) => axis.dimension === 'valueChainStages')
  assert.ok(stageAxis)
  stageAxis.ids[0] = 'stage.primary'
  assert.throws(() => validateOntology(nonCoverageProfile), /non-coverage stage/)
})

test('registers 117 neutral legacy scope events without promoting knowledge', () => {
  const artifacts = buildCoverageArtifacts(root)
  assert.equal(artifacts.assessments.length, 117)
  assert.equal(
    artifacts.assessments.filter((assessment) => assessment.cellId.includes('canonical_')).length,
    0,
  )
  const eventCounts = Object.groupBy(artifacts.assessments, (assessment) => (
    artifacts.cells.find((cell) => cell.cellId === assessment.cellId)?.profileId ?? 'missing'
  ))
  assert.equal(eventCounts['profile.legacy_field_political']?.length, 104)
  assert.equal(eventCounts['profile.legacy_field_sapmi_overlap']?.length, 13)

  for (const assessment of artifacts.assessments) {
    assert.equal(assessment.eventKind, 'scope_registration')
    assert.equal(assessment.workflowStage, 'unassessed')
    assert.equal(assessment.inventoryState, 'unknown')
    assert.equal(assessment.knowledgeDepth, 'unknown')
    assert.equal(assessment.verificationStatus, 'unverified')
    assert.equal(assessment.citationReadiness, 'not_assessed')
    assert.equal(assessment.temporalDepth, 'not_assessed')
    assert.equal(assessment.assessmentWorkflowState, 'candidate')
    assert.equal(assessment.method, null)
    assert.deepEqual(assessment.evidenceLinks, [])
    assert.deepEqual(assessment.reviewReceipts, [])
    assert.equal(assessment.readinessResult, null)
    assert.ok(Object.values(assessment.facetCoverage).every((facet) => facet.assessmentState === 'unknown'))
  }
})

test('binds each content-addressed event to the immutable Git and SHA-256 snapshot set', () => {
  const artifacts = buildCoverageArtifacts(root)
  const { sourceSnapshotSetHash, ...snapshotRecord } = artifacts.sourceSnapshotSet
  assert.equal(sourceSnapshotSetHash, sha256(canonicalJson(snapshotRecord)))
  assert.equal(artifacts.sourceSnapshotSet.baseCommit, artifacts.baseline.baseCommit)
  assert.ok(artifacts.sourceSnapshotSet.snapshots.length >= 3)

  for (const snapshot of artifacts.sourceSnapshotSet.snapshots) {
    assert.match(snapshot.gitObjectId, /^[a-f0-9]{40}$/)
    assert.match(snapshot.sha256, /^sha256:[a-f0-9]{64}$/)
    assert.ok(snapshot.fileCount >= 1)
    assert.ok(snapshot.entries.every((entry) => /^sha256:[a-f0-9]{64}$/.test(entry.sha256)))
  }

  const expectedBaselineSnapshotId = 'snapshot.v1.'
    + sourceSnapshotSetHash.slice('sha256:'.length, 'sha256:'.length + 20)
  for (const assessment of artifacts.assessments) {
    assert.equal(assessment.baseCommit, artifacts.baseline.baseCommit)
    assert.equal(assessment.baselineSnapshotId, expectedBaselineSnapshotId)
    const { assessmentId, contentHash, ...semantic } = assessment
    const semanticHash = sha256(canonicalJson(semantic))
    assert.ok(assessmentId.endsWith(semanticHash.slice('sha256:'.length, 'sha256:'.length + 20)))
    assert.equal(contentHash, sha256(canonicalJson({ assessmentId, ...semantic })))
  }
})

test('validates every generated cell and assessment against the executable coverage schema', () => {
  const artifacts = buildCoverageArtifacts(root)
  const schema = JSON.parse(
    readFileSync(root + '/knowledge/schema/coverage-ledger.schema.v1.json', 'utf8'),
  ) as object
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  for (const item of [...artifacts.cells, ...artifacts.assessments]) {
    assert.equal(validate(item), true, JSON.stringify(validate.errors))
  }
})

test('reports states only within named profiles and never as one global completion score', () => {
  const artifacts = buildCoverageArtifacts(root)
  const summary = JSON.parse(artifacts.summaryJson) as Record<string, unknown>
  assert.equal('expectedCellCount' in summary, false)
  assert.equal('workflowStages' in summary, false)
  assert.equal('byGeography' in summary, false)

  const profiles = summary.byProfile as Record<string, {
    definedCellCount: number
    explicitEventCount: number
    evidenceBackedAssessmentEventCount: number
    completeForRequiredProfileCount: number
    byGeography: Record<string, unknown>
  }>
  for (const profile of artifacts.ontology.coverageProfiles) {
    assert.equal(profiles[profile.id].definedCellCount, expectedCells(profile))
    assert.equal(profiles[profile.id].evidenceBackedAssessmentEventCount, 0)
    assert.equal(profiles[profile.id].completeForRequiredProfileCount, 0)
    assert.ok(profiles[profile.id].byGeography)
  }
})

test('keeps a complete canonical JSONL projection alongside the human CSV', () => {
  const artifacts = buildCoverageArtifacts(root)
  const parsed = artifacts.ledgerJsonl.trim().split(/\r?\n/).map((line) => JSON.parse(line)) as Array<{
    cell: { cellId: string }
    latestAssessment: unknown
    projectedReadinessResult: unknown
  }>
  assert.equal(parsed.length, artifacts.cells.length)
  assert.equal(parsed[0].cell.cellId, artifacts.cells[0].cellId)
  assert.ok(parsed.every((record) => record.projectedReadinessResult))
  const header = artifacts.ledgerCsv.slice(0, artifacts.ledgerCsv.indexOf('\n'))
  assert.ok(header.includes('latest_assessment_json'))
  assert.ok(header.includes('facet_coverage_json'))
  assert.ok(header.includes('artifact_snapshot_ids_json'))
})

test('committed projections and their final commit-marker manifest match generation', () => {
  const artifacts = buildCoverageArtifacts(root)
  const expected = new Map<string, string>([
    [outputFiles[0], artifacts.cellsCsv],
    [outputFiles[1], artifacts.assessmentsJsonl],
    [outputFiles[2], artifacts.ledgerJsonl],
    [outputFiles[3], artifacts.ledgerCsv],
    [outputFiles[4], artifacts.summaryJson],
    [outputFiles[5], artifacts.sourceSnapshotsJson],
  ])
  for (const [path, content] of expected) {
    assert.equal(readFileSync(root + '/' + path, 'utf8'), content)
  }
  assert.equal(
    readFileSync(root + '/knowledge/coverage/coverage-generation-manifest.v1.json', 'utf8'),
    artifacts.generationManifestJson,
  )

  const manifest = JSON.parse(artifacts.generationManifestJson) as {
    outputs: Array<{ path: string; sha256: string; sizeBytes: number }>
  }
  for (const output of manifest.outputs) {
    const content = expected.get(output.path)
    assert.ok(content)
    assert.equal(output.sha256, sha256(content))
    assert.equal(output.sizeBytes, Buffer.byteLength(content))
  }
})
