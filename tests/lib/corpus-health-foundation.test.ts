import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  statSync,
} from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  canonicalSha256,
  validateCorpusHealthAssessment,
  validateCorpusHealthBundle,
} from '../../scripts/knowledge/generate-corpus-health'

type JsonObject = Record<string, unknown>

type SnapshotEntry = {
  path: string
  kind: 'file' | 'symlink'
  sizeBytes: number
  sha256: string
}

const root = fileURLToPath(new URL('../../', import.meta.url))

const PROFILE_IDS = [
  'health_profile.internal_discovery',
  'health_profile.internal_analysis',
  'health_profile.external_evidence_support',
  'health_profile.observatory_operations',
]

const FORBIDDEN_SCORE_AND_COVERAGE_KEYS = new Set([
  'coverageCellId',
  'coverageCellIds',
  'overallHealthScore',
  'globalHealthScore',
  'weightedScore',
  'aggregateScore',
])

function asObject(value: unknown, label = 'value'): JsonObject {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`)
  return value as JsonObject
}

function asObjectArray(value: unknown, label = 'value'): JsonObject[] {
  assert.ok(Array.isArray(value), `${label} must be an array`)
  return value.map((item, index) => asObject(item, `${label}[${index}]`))
}

function readJson(relativePath: string): JsonObject {
  return asObject(JSON.parse(readFileSync(resolve(root, relativePath), 'utf8')), relativePath)
}

function readJsonLines(relativePath: string): JsonObject[] {
  return readFileSync(resolve(root, relativePath), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line, index) => asObject(JSON.parse(line), `${relativePath}:${index + 1}`))
}

function sha256Bytes(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function withoutContentHash(value: JsonObject): JsonObject {
  const { contentHash: _contentHash, ...payload } = value
  return payload
}

function assertCanonicalContentHash(value: JsonObject, label: string) {
  assert.match(String(value.contentHash), /^sha256:[a-f0-9]{64}$/)
  assert.equal(value.contentHash, canonicalSha256(withoutContentHash(value)), label)
}

function walkSnapshotEntries(absolutePath: string): SnapshotEntry[] {
  const rootStat = lstatSync(absolutePath)
  if (rootStat.isSymbolicLink()) {
    const target = readlinkSync(absolutePath)
    return [{
      path: '.',
      kind: 'symlink',
      sizeBytes: Buffer.byteLength(target),
      sha256: sha256Bytes(target),
    }]
  }
  if (rootStat.isFile()) {
    const bytes = readFileSync(absolutePath)
    return [{ path: '.', kind: 'file', sizeBytes: bytes.length, sha256: sha256Bytes(bytes) }]
  }

  const entries: SnapshotEntry[] = []
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const fullPath = join(directory, name)
      const stat = lstatSync(fullPath)
      if (stat.isDirectory()) {
        visit(fullPath)
      } else if (stat.isSymbolicLink()) {
        const target = readlinkSync(fullPath)
        entries.push({
          path: relative(absolutePath, fullPath),
          kind: 'symlink',
          sizeBytes: Buffer.byteLength(target),
          sha256: sha256Bytes(target),
        })
      } else if (stat.isFile()) {
        const bytes = readFileSync(fullPath)
        entries.push({
          path: relative(absolutePath, fullPath),
          kind: 'file',
          sizeBytes: bytes.length,
          sha256: sha256Bytes(bytes),
        })
      }
    }
  }
  visit(absolutePath)
  return entries
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys)
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      keys.add(key)
      collectKeys(item, keys)
    }
  }
  return keys
}

function collectSnapshotRefs(value: unknown, refs = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectSnapshotRefs(item, refs)
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'sourceSnapshotIds' && Array.isArray(item)) {
        for (const snapshotId of item) refs.add(String(snapshotId))
      }
      collectSnapshotRefs(item, refs)
    }
  }
  return refs
}

function metric(assessment: JsonObject, metricId: string): JsonObject {
  const result = asObjectArray(assessment.metrics, 'assessment.metrics')
    .find((item) => item.metricId === metricId)
  assert.ok(result, `Missing metric ${metricId}`)
  return result
}

function profileVerdict(assessment: JsonObject, profileId: string): JsonObject {
  const result = asObjectArray(assessment.profileVerdicts, 'assessment.profileVerdicts')
    .find((item) => item.profileId === profileId)
  assert.ok(result, `Missing profile verdict ${profileId}`)
  return result
}

const schema = readJson('knowledge/schema/corpus-evidence-health.schema.v1.json')
const thresholds = readJson('knowledge/health/corpus-health-thresholds.v1.json')
const sourceSnapshots = readJson('knowledge/health/corpus-health-source-snapshots.v1.json')
const sourceSnapshotHistory = readJsonLines('knowledge/health/corpus-health-source-snapshot-history.v1.jsonl')
const assessments = readJsonLines('knowledge/health/corpus-health-assessments.v1.jsonl')
const current = readJson('knowledge/health/corpus-health-current.v1.json')
const summary = readJson('knowledge/health/corpus-health-summary.v1.json')
const generationManifest = readJson('knowledge/health/corpus-health-generation-manifest.v1.json')

test('keeps corpus health structurally separate from subject coverage and additive scoring', () => {
  const definitions = asObject(schema.$defs, 'schema.$defs')
  const boundarySchema = asObject(definitions.semanticBoundary, 'semanticBoundary schema')
  const boundaryProperties = asObject(boundarySchema.properties, 'semanticBoundary properties')
  assert.equal(asObject(boundaryProperties.subjectCoverageClaim).const, false)
  assert.equal(asObject(boundaryProperties.mayPromoteCoverageCells).const, false)
  assert.equal(asObject(boundaryProperties.globalScorePermitted).const, false)

  for (const [label, artifact] of [
    ['thresholds', thresholds],
    ['assessment', assessments.at(-1)],
    ['summary', summary],
  ] as const) {
    const boundary = asObject(asObject(artifact, label).semanticBoundary, `${label}.semanticBoundary`)
    assert.equal(boundary.subjectCoverageClaim, false)
    assert.equal(boundary.mayPromoteCoverageCells, false)
    assert.equal(boundary.mayAggregateWithCoverageLedger, false)
    assert.equal(boundary.globalScorePermitted, false)
  }

  const observedKeys = collectKeys([thresholds, assessments, sourceSnapshots, sourceSnapshotHistory, current, summary])
  for (const forbidden of FORBIDDEN_SCORE_AND_COVERAGE_KEYS) {
    assert.equal(observedKeys.has(forbidden), false, `${forbidden} must not occur in corpus-health artifacts`)
  }
})

test('records exactly four named intended-use verdicts under a proposed baseline', () => {
  assert.ok(assessments.length >= 1)
  const assessment = assessments.at(-1) as JsonObject
  const verdicts = asObjectArray(assessment.profileVerdicts, 'assessment.profileVerdicts')
  assert.equal(verdicts.length, 4)
  assert.deepEqual(verdicts.map((item) => item.profileId).toSorted(), PROFILE_IDS.toSorted())
  assert.equal(new Set(verdicts.map((item) => item.profileId)).size, 4)

  const summaryVerdicts = asObjectArray(summary.profileVerdicts, 'summary.profileVerdicts')
  assert.deepEqual(summaryVerdicts.map((item) => item.profileId).toSorted(), PROFILE_IDS.toSorted())
  assert.equal(thresholds.adoptionStatus, 'proposed')
  assert.equal(assessment.baselineAdoptionStatus, 'proposed')
  assert.equal(current.baselineAdoptionStatus, 'proposed')

  for (const profileId of [
    'health_profile.external_evidence_support',
    'health_profile.observatory_operations',
  ]) {
    const verdict = profileVerdict(assessment, profileId)
    assert.equal(verdict.verdict, 'blocked')
    assert.equal(verdict.readyForProfile, false)
  }
})

test('receipt-resolves migration lineage while failing closed on identity, appraisal and archive readiness', () => {
  const historicalAssessment = assessments[0] as JsonObject
  const historicalLineageConflict = asObjectArray(historicalAssessment.conflicts, 'historicalAssessment.conflicts')
    .find((item) => item.conflictId === 'health.conflict.code_db_lineage')
  assert.ok(historicalLineageConflict)
  assert.equal(historicalLineageConflict.status, 'open')

  const assessment = assessments.at(-1) as JsonObject
  const lineageConflict = asObjectArray(assessment.conflicts, 'assessment.conflicts')
    .find((item) => item.conflictId === 'health.conflict.code_db_lineage')
  assert.ok(lineageConflict)
  assert.equal(lineageConflict.status, 'resolved')
  assert.equal(lineageConflict.severity, 'blocker')
  assert.ok(Array.isArray(lineageConflict.resolutionReceiptIds))
  assert.equal(lineageConflict.resolutionReceiptIds.length, 1)
  assert.equal(metric(assessment, 'health_metric.head_migrations').value, 31)
  assert.equal(metric(assessment, 'health_metric.database_migrations').value, 31)
  assert.equal(metric(assessment, 'health_metric.migration_lineage_mismatches').value, 0)
  assert.equal(metric(assessment, 'health_metric.database_only_evidence_identities').value, 18)
  assert.equal(metric(assessment, 'health_metric.managed_runtime_evidence_identities').value, 17)
  assert.equal(metric(assessment, 'health_metric.unclassified_database_only_evidence_identities').value, 1)
  assert.equal(metric(assessment, 'health_metric.missing_managed_runtime_evidence_identities').value, 0)
  assert.equal(metric(assessment, 'health_metric.seed_only_evidence_identities').value, 1)

  const seedIdentityConflict = asObjectArray(assessment.conflicts, 'assessment.conflicts')
    .find((item) => item.conflictId === 'health.conflict.seed_database_identity')
  assert.ok(seedIdentityConflict)
  assert.equal(seedIdentityConflict.status, 'open')

  const internalAnalysis = profileVerdict(assessment, 'health_profile.internal_analysis')
  assert.equal(internalAnalysis.readyForProfile, false)
  assert.ok(asObjectArray(internalAnalysis.checks).some((item) => (
    item.checkId === 'health_check.analysis.lineage' && item.status === 'pass'
  )))

  const appraisal = metric(assessment, 'health_metric.evidence_appraisal')
  assert.equal(appraisal.value, 0)
  assert.equal(appraisal.numerator, 0)
  assert.equal(appraisal.denominator, 417)
  assert.equal(appraisal.percentage, 0)

  const archive = metric(assessment, 'health_metric.external_rows_needing_archive')
  assert.equal(archive.value, 1_855)
  assert.equal(archive.numerator, 1_855)
  assert.equal(archive.denominator, 2_376)
  assert.ok(asObjectArray(assessment.dimensions, 'assessment.dimensions').some((item) => (
    item.dimensionId === 'archive'
    && item.verdict === 'blocked'
  )))
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').externalRowsNeedingArchive, 1_855)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').managedRuntimeEvidenceIdentities, 17)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').unclassifiedDatabaseOnlyEvidenceIdentities, 1)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').missingManagedRuntimeEvidenceIdentities, 0)
})

test('recomputes immutable content, source and generation-output hashes', () => {
  for (const [label, artifact] of [
    ['source snapshot set', sourceSnapshots],
    ['current pointer', current],
    ['summary', summary],
    ['generation manifest', generationManifest],
  ] as const) {
    assertCanonicalContentHash(artifact, `${label} canonical content hash`)
  }
  for (const assessment of assessments) {
    assertCanonicalContentHash(assessment, `${String(assessment.assessmentId)} canonical content hash`)
  }
  for (const snapshotSet of sourceSnapshotHistory) {
    assertCanonicalContentHash(snapshotSet, `${String(snapshotSet.sourceSnapshotSetId)} canonical content hash`)
  }

  for (const snapshot of asObjectArray(sourceSnapshots.snapshots, 'sourceSnapshots.snapshots')) {
    const absolutePath = resolve(root, String(snapshot.path))
    const entries = walkSnapshotEntries(absolutePath)
    const expectedHash = entries.length === 1 && entries[0]?.path === '.'
      ? entries[0].sha256
      : canonicalSha256(entries)
    assert.equal(snapshot.sha256, expectedHash, `${String(snapshot.snapshotId)} source hash`)
    assert.equal(snapshot.sizeBytes, entries.reduce((sum, entry) => sum + entry.sizeBytes, 0))
    assert.equal(snapshot.fileCount, entries.length)
  }

  for (const group of ['inputs', 'outputs'] as const) {
    for (const entry of asObjectArray(generationManifest[group], `generationManifest.${group}`)) {
      const absolutePath = resolve(root, String(entry.path))
      const bytes = readFileSync(absolutePath)
      assert.equal(entry.sha256, sha256Bytes(bytes), `${String(entry.path)} manifest hash`)
      assert.equal(entry.sizeBytes, statSync(absolutePath).size, `${String(entry.path)} manifest size`)
    }
  }

  const databaseSnapshot = asObject(sourceSnapshots.databaseSnapshot, 'databaseSnapshot')
  for (const field of ['databaseIdentityHash', 'queryHash', 'resultHash', 'migrationLedgerHash']) {
    assert.match(String(databaseSnapshot[field]), /^sha256:[a-f0-9]{64}$/, `databaseSnapshot.${field}`)
  }
})

test('resolves the current pointer and every nested source-snapshot reference', () => {
  const matching = assessments.filter((assessment) => assessment.assessmentId === current.assessmentId)
  assert.equal(matching.length, 1, 'current pointer must resolve one immutable assessment')
  assert.equal(current.assessmentContentHash, matching[0].contentHash)
  assert.equal(current.sourceSnapshotSetId, matching[0].sourceSnapshotSetId)
  assert.equal(current.sourceSnapshotSetHash, sourceSnapshots.contentHash)
  assert.equal(sourceSnapshots.sourceSnapshotSetId, matching[0].sourceSnapshotSetId)
  assert.equal(summary.assessmentId, current.assessmentId)
  assert.deepEqual(generationManifest.assessmentIds, assessments.map((assessment) => assessment.assessmentId))
  assert.equal(generationManifest.sourceSnapshotSetHash, sourceSnapshots.contentHash)
  assert.ok(sourceSnapshotHistory.length >= 2)
  const currentSnapshotSets = sourceSnapshotHistory.filter(
    (snapshotSet) => snapshotSet.sourceSnapshotSetId === current.sourceSnapshotSetId,
  )
  assert.equal(currentSnapshotSets.length, 1)
  assert.deepEqual(currentSnapshotSets[0], sourceSnapshots)

  for (const assessment of assessments) {
    const matchingSnapshotSets = sourceSnapshotHistory.filter(
      (snapshotSet) => snapshotSet.sourceSnapshotSetId === assessment.sourceSnapshotSetId,
    )
    assert.equal(matchingSnapshotSets.length, 1, `${String(assessment.assessmentId)} source snapshot set`)
    const assessmentSnapshotSet = matchingSnapshotSets[0] as JsonObject
    const availableSnapshotIds = new Set(
      asObjectArray(assessmentSnapshotSet.snapshots, 'assessmentSnapshotSet.snapshots')
        .map((snapshot) => String(snapshot.snapshotId)),
    )
    availableSnapshotIds.add(String(asObject(assessmentSnapshotSet.databaseSnapshot).snapshotId))
    for (const reference of collectSnapshotRefs(assessment)) {
      assert.ok(availableSnapshotIds.has(reference), `${String(assessment.assessmentId)} references ${reference}`)
    }
  }

  const issues = validateCorpusHealthBundle({
    sourceSnapshots,
    sourceSnapshotHistory,
    assessments,
    current,
    summary,
    generationManifest,
  })
  assert.deepEqual(issues, [])

  const missingHistoricalSetIssues = validateCorpusHealthBundle({
    sourceSnapshots,
    sourceSnapshotHistory: [sourceSnapshots],
    assessments,
    current,
    summary,
    generationManifest,
  })
  assert.ok(missingHistoricalSetIssues.some((issue) => issue.includes('references missing source snapshot set')))
})

test('validator rejects content-hash mutation and a rehashed readiness bypass', () => {
  const baseline = assessments.at(-1) as JsonObject

  const hashMutation = structuredClone(baseline)
  hashMutation.contentHash = `sha256:${'0'.repeat(64)}`
  const hashIssues = validateCorpusHealthAssessment(hashMutation, thresholds, schema)
  assert.ok(hashIssues.some((issue) => issue.includes('contentHash does not match canonical payload')))

  const readinessBypass = structuredClone(baseline)
  const external = profileVerdict(readinessBypass, 'health_profile.external_evidence_support')
  external.readyForProfile = true
  readinessBypass.contentHash = canonicalSha256(withoutContentHash(readinessBypass))
  const readinessIssues = validateCorpusHealthAssessment(readinessBypass, thresholds, schema)
  assert.ok(readinessIssues.some((issue) => issue.includes('cannot be ready with blockers or failed/unknown checks')))
  assert.ok(readinessIssues.includes('external readiness requires complete appraisal'))
  assert.ok(readinessIssues.includes('external readiness requires zero required archive gaps'))
  assert.ok(readinessIssues.includes('external readiness requires approved human review'))
})
