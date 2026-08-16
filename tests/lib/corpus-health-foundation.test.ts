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
  assertManifestEntryMatchesBytes,
  canonicalSha256,
  loadGate1KnowledgeInputs,
  parseCorpusProcessingSummary,
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

test('strictly binds the whole-corpus lifecycle, Gate 2C review contract and PDF extraction boundary', () => {
  const inputs = loadGate1KnowledgeInputs(root)

  assert.equal(inputs.corpus.activeIdentities, 1_555)
  assert.equal(inputs.corpus.contentHashBoundIdentities, 1_537)
  assert.equal(inputs.corpus.repositoryHashBoundBytes, 518_098_005)
  assert.equal(inputs.corpus.privateRecoveryHashBoundBytes, 36_224_174)
  assert.equal(inputs.corpus.hashBoundBytes, 554_322_179)
  assert.equal(inputs.corpus.missingRepositoryFiles, 11)
  assert.equal(inputs.corpus.noLocatorIdentities, 18)
  assert.equal(inputs.corpus.deduplicatedProcessingUnits, 1_467)
  assert.equal(inputs.corpus.fullTextComplete, 0)
  assert.equal(inputs.corpus.sourceRoleOwnerConfirmed, 0)
  assert.equal(inputs.corpus.ownerReviewed, 0)
  assert.equal(inputs.corpus.independentlyValidated, 0)
  assert.equal(inputs.corpus.partnerValidated, 0)
  assert.equal(inputs.corpus.rightsHolderValidated, 0)
  assert.equal(inputs.corpus.rightsCleared, 0)
  assert.equal(inputs.corpus.publicationApproved, 0)
  assert.equal(inputs.corpus.externalUseReady, 0)
  assert.equal(inputs.corpus.coverageApproved, 0)
  assert.equal(inputs.corpus.summary.roles.knownIdentityAliasMismatches, 2)

  assert.equal(inputs.review.canonicalLayerCount, 8)
  assert.equal(inputs.review.unclassifiedLegacyMappingCount, 5)
  assert.equal(inputs.review.legacyStatusOnlyCanonicalHumanApprovals, 0)

  assert.equal(inputs.pdf.technicalUnits, 15)
  assert.equal(inputs.pdf.technicallyQualifiedUnits, 15)
  assert.equal(inputs.pdf.technicalFailures, 0)
  assert.equal(inputs.pdf.extractedPages, 772)
  assert.equal(inputs.pdf.extractedWords, 272_545)
  assert.equal(inputs.pdf.warningPages, 35)
  assert.equal(inputs.pdf.openIdentityBlockers, 12)
  assert.equal(inputs.pdf.legacyAliasScopeBlockers, 2)
  assert.equal(inputs.pdf.unregisteredSourceCandidateBlockers, 10)
  assert.equal(inputs.pdf.aiAnalysisComplete, false)
  assert.equal(inputs.pdf.ownerReviewComplete, false)
  assert.equal(inputs.pdf.independentValidationComplete, false)
  assert.equal(inputs.pdf.rightsCleared, false)
  assert.equal(inputs.pdf.publicationReady, false)
  assert.equal(inputs.pdf.coveragePromotionAllowed, false)
  assert.equal(inputs.pdf.portableTrackedValidationSupported, true)
  assert.equal(inputs.pdf.privateVerificationPerformed, false)
})

test('rejects malformed or widened corpus-processing summaries', () => {
  const raw = readJson('knowledge/corpus/corpus-processing-summary.v1.json')
  assert.doesNotThrow(() => parseCorpusProcessingSummary(raw))

  const wrongCount = structuredClone(raw)
  asObject(wrongCount.activeCorpus).total = '1555'
  assert.throws(() => parseCorpusProcessingSummary(wrongCount), /Corpus processing summary is invalid/)

  const widened = structuredClone(raw)
  widened.unreviewedCoverageClaim = true
  assert.throws(() => parseCorpusProcessingSummary(widened), /Unrecognized key/)
})

test('fails closed when manifest-bound corpus bytes drift', () => {
  const manifest = readJson('knowledge/corpus/corpus-processing-generation-manifest.v1.json')
  const rawEntry = asObjectArray(manifest.outputs, 'corpus manifest outputs')
    .find((entry) => entry.path === 'knowledge/corpus/corpus-processing-summary.v1.json')
  assert.ok(rawEntry)
  const entry = {
    path: String(rawEntry.path),
    sha256: String(rawEntry.sha256),
    sizeBytes: Number(rawEntry.sizeBytes),
  }
  const bytes = readFileSync(resolve(root, entry.path))
  assert.doesNotThrow(() => assertManifestEntryMatchesBytes(entry, bytes, 'summary'))

  const staleBytes = Buffer.from(bytes)
  staleBytes[0] = staleBytes[0] === 0x7b ? 0x5b : 0x7b
  assert.throws(
    () => assertManifestEntryMatchesBytes(entry, staleBytes, 'summary'),
    /does not match manifest entry/,
  )
})

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

test('keeps configured-database lineage exact and fails closed on identity, appraisal and archive gaps', () => {
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
  // Trioen under flyttet seg med nøyaktig 1 hver, samtidig: én seed-only
  // identitet ble løst i produksjonsreleasen 2026-08-11, så den forsvant
  // fra både database-only og unclassified samtidig som seed_only ble 0.
  assert.equal(metric(assessment, 'health_metric.database_only_evidence_identities').value, 72)
  assert.equal(metric(assessment, 'health_metric.managed_runtime_evidence_identities').value, 17)
  assert.equal(metric(assessment, 'health_metric.unclassified_database_only_evidence_identities').value, 55)
  assert.equal(metric(assessment, 'health_metric.missing_managed_runtime_evidence_identities').value, 0)
  assert.equal(metric(assessment, 'health_metric.seed_only_evidence_identities').value, 0)

  const seedIdentityConflict = asObjectArray(assessment.conflicts, 'assessment.conflicts')
    .find((item) => item.conflictId === 'health.conflict.seed_database_identity')
  assert.ok(seedIdentityConflict)
  assert.equal(seedIdentityConflict.status, 'open')

  const libraryIdentityConflict = asObjectArray(assessment.conflicts, 'assessment.conflicts')
    .find((item) => item.conflictId === 'health.conflict.library_inventory_materialization')
  assert.ok(libraryIdentityConflict)
  assert.equal(libraryIdentityConflict.status, 'open')
  assert.equal(metric(assessment, 'health_metric.library_inventory').value, 1_555)
  // Produksjonsreleasen 2026-08-11 flyttet biblioteket, den mistet det ikke.
  // Nevneren står stille på 1 555, og 165 + 1 390 = 1 555 nøyaktig: radene
  // byttet klasse fra live-materialisert til inventar-bare.
  //
  // Totalen 1 770 er verifiserbar utenfra — /api/library-analysis/status
  // svarer `total: 1770`, og releasekvitteringen fra samme dag oppgir det
  // samme tallet.
  //
  // Kontraktproblemene er en ren sum av de to andre tallene pluss et rest:
  //     1 605 «unreviewed retained database row»   = library_retained_history_rows
  //   + 1 390 «current inventory identity is not materialized» = library_inventory_only_rows
  //   +    17 «missing retained database row»
  //   = 3 012
  // Altså én sak per beholdt rad og én per inventar-rad, ikke et fall i
  // kvalitet. `pendingReview: 399` og `humanReviewed: 0` på det levende
  // endepunktet er samme tilstand sett fra appen.
  //
  // De 17 «missing» er det eneste her som ikke er selvforklarende: før
  // releasen var 55 av 72 beholdte rader ugjennomgåtte, altså 17
  // gjennomgåtte. De 17 bar ikke over. Se PR-en for spørsmålet.
  assert.equal(metric(assessment, 'health_metric.library_live_materialization').value, 165)
  assert.equal(metric(assessment, 'health_metric.library_materialization').value, 1_770)
  assert.equal(metric(assessment, 'health_metric.library_retained_history_rows').value, 1_605)
  assert.equal(metric(assessment, 'health_metric.library_inventory_only_rows').value, 1_390)
  assert.equal(metric(assessment, 'health_metric.library_retained_history_contract_issues').value, 3_012)
  assert.equal(metric(assessment, 'health_metric.library_projection_updates_reported').value, 15)

  const internalAnalysis = profileVerdict(assessment, 'health_profile.internal_analysis')
  assert.equal(internalAnalysis.readyForProfile, false)
  assert.ok(asObjectArray(internalAnalysis.checks).some((item) => (
    item.checkId === 'health_check.analysis.lineage' && item.status === 'pass'
  )))

  const appraisal = metric(assessment, 'health_metric.evidence_appraisal')
  assert.equal(appraisal.value, 0)
  assert.equal(appraisal.numerator, 0)
  assert.equal(appraisal.denominator, 472)
  assert.equal(appraisal.percentage, 0)

  // 77,4 % -> 98,6 % av en base som vokste 2 562 -> 5 016. Importen tok inn
  // nye siteringer uten arkivbevis. Tallet pinnes fordi det er en
  // OBSERVASJON i en dimensjon som allerede står `blocked` — påstanden rett
  // under holder den porten. Skulle arkivet bli løst, feiler denne først.
  const archive = metric(assessment, 'health_metric.external_rows_needing_archive')
  assert.equal(archive.value, 4_944)
  assert.equal(archive.numerator, 4_944)
  assert.equal(archive.denominator, 5_016)
  assert.ok(asObjectArray(assessment.dimensions, 'assessment.dimensions').some((item) => (
    item.dimensionId === 'archive'
    && item.verdict === 'blocked'
  )))
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').externalRowsNeedingArchive, 4_944)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').managedRuntimeEvidenceIdentities, 17)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').unclassifiedDatabaseOnlyEvidenceIdentities, 55)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').missingManagedRuntimeEvidenceIdentities, 0)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').livePersistedLibraryRows, 165)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').retainedLibraryHistoryRows, 1_605)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').libraryInventoryOnlyRows, 1_390)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').libraryRetainedHistoryContractIssues, 3_012)
  assert.equal(asObject(summary.keyMetrics, 'summary.keyMetrics').reportedLibraryProjectionUpdates, 15)

  const pdfOpenIdentityBlockers = metric(assessment, 'health_metric.pdf_open_identity_blockers')
  const pdfOpenAliasBlockers = metric(assessment, 'health_metric.pdf_open_alias_blockers')
  const pdfOpenUnregisteredCandidates = metric(
    assessment,
    'health_metric.pdf_open_unregistered_source_candidate_blockers',
  )
  assert.equal(pdfOpenIdentityBlockers.value, 12)
  assert.equal(pdfOpenAliasBlockers.value, 2)
  assert.equal(pdfOpenUnregisteredCandidates.value, 10)
  assert.equal(
    Number(pdfOpenIdentityBlockers.value),
    Number(pdfOpenAliasBlockers.value) + Number(pdfOpenUnregisteredCandidates.value),
  )
  const summaryMetrics = asObject(summary.keyMetrics, 'summary.keyMetrics')
  assert.equal(summaryMetrics.pdfOpenIdentityBlockers, 12)
  assert.equal(summaryMetrics.pdfOpenAliasBlockers, 2)
  assert.equal(summaryMetrics.pdfOpenUnregisteredSourceCandidateBlockers, 10)
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
