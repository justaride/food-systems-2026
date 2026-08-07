import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import {
  CONSTITUTION_PATH,
  COVERAGE_GENERATOR_PATH,
  COVERAGE_LEDGER_PATH,
  FIELD08_README_PATH,
  GENERATION_MANIFEST_PATH,
  GENERATOR_PATH,
  HISTORICAL_ASSESSMENTS_PATH,
  ONTOLOGY_PATH,
  REGISTER_PATH,
  REGISTER_SCHEMA_PATH,
  REPORT_PATH,
  SOURCE_MAP_PATH,
  SOURCE_SCHEMA_PATH,
  buildField08ResearchArtifacts,
  parseField08CliArgs,
  writeOrCheckField08Research,
  type Field08SourceMap,
} from '../../scripts/knowledge/generate-field08-research-candidates'

const root = fileURLToPath(new URL('../../', import.meta.url))

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

function committedFixture(
  t: { after(callback: () => void): void },
  mutate?: (sourceMap: Field08SourceMap) => void,
) {
  const repo = mkdtempSync(join(tmpdir(), 'food-field08-candidates-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const paths = [
    SOURCE_MAP_PATH,
    SOURCE_SCHEMA_PATH,
    REGISTER_SCHEMA_PATH,
    ONTOLOGY_PATH,
    COVERAGE_LEDGER_PATH,
    HISTORICAL_ASSESSMENTS_PATH,
    CONSTITUTION_PATH,
    FIELD08_README_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
  ]
  for (const path of paths) copyPath(root, repo, path)
  if (mutate) {
    const sourceMap = JSON.parse(readFileSync(resolve(repo, SOURCE_MAP_PATH), 'utf8')) as Field08SourceMap
    mutate(sourceMap)
    writeFileSync(resolve(repo, SOURCE_MAP_PATH), `${JSON.stringify(sourceMap, null, 2)}\n`)
  }
  git(repo, ['init', '-q'])
  git(repo, ['config', 'user.name', 'Gate 2B Test'])
  git(repo, ['config', 'user.email', 'gate2b@example.invalid'])
  git(repo, ['add', '--', ...paths])
  git(repo, ['commit', '-q', '-m', 'test: pin Field 08 research source'])
  return { repo, baseCommit: git(repo, ['rev-parse', 'HEAD']) }
}

test('validates a candidate-only source map and rejects promotion fields', () => {
  const schema = JSON.parse(readFileSync(resolve(root, SOURCE_SCHEMA_PATH), 'utf8')) as object
  const sourceMap = JSON.parse(readFileSync(resolve(root, SOURCE_MAP_PATH), 'utf8')) as Field08SourceMap
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  assert.equal(validate(sourceMap), true, JSON.stringify(validate.errors))
  assert.equal(sourceMap.sources.length, 27)
  assert.equal(sourceMap.bindings.length, 33)
  assert.equal(sourceMap.observations.length, 33)
  assert.equal(sourceMap.geographyPlans.length, 9)
  assert.equal(sourceMap.semantics.coverageImplication, 'none')
  assert.equal(sourceMap.semantics.subjectMatterState, 'unassessed')
  assert.equal(sourceMap.semantics.readinessPromotionAllowed, false)
  assert.equal(sourceMap.semantics.historicalAssessmentMutationAllowed, false)
  assert.equal(sourceMap.semantics.crossProfileAggregationAllowed, false)

  const invalid = structuredClone(sourceMap) as Field08SourceMap & { readinessResult?: unknown }
  invalid.readinessResult = { completeForProfile: true }
  assert.equal(validate(invalid), false)
})

test('builds a deterministic 272/34 facet matrix while every historical cell remains unassessed', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const first = buildField08ResearchArtifacts(repo, { baseCommit })
  const second = buildField08ResearchArtifacts(repo, { baseCommit })
  assert.equal(first.registerJson, second.registerJson)
  assert.equal(first.reportMarkdown, second.reportMarkdown)
  assert.equal(first.generationManifestJson, second.generationManifestJson)
  assert.equal(first.register.facetInventory.length, 306)
  assert.equal(first.register.geographyCandidates.length, 9)
  assert.equal(first.register.baselineGuard.historicalEventCount, 117)
  assert.equal(first.register.baselineGuard.field08CellCount, 9)
  assert.equal(first.register.baselineGuard.field08ScopeRegistrationCount, 9)
  assert.equal(first.register.baselineGuard.field08SubjectMatterAssessmentCount, 0)
  assert.equal(first.register.baselineGuard.historicalAssessmentWriteCount, 0)

  const political = first.register.facetInventory.filter((record) => record.profileId === 'profile.legacy_field_political')
  const sapmi = first.register.facetInventory.filter((record) => record.profileId === 'profile.legacy_field_sapmi_overlap')
  assert.equal(political.length, 272)
  assert.equal(sapmi.length, 34)
  assert.ok(sapmi.every((record) => record.candidateState === 'rights_holder_route_required'))
  assert.ok(sapmi.every((record) => record.rightsHolderReviewRequired))
  assert.ok(sapmi.every((record) => record.coverageImplication === 'none'))

  const finland = first.register.geographyCandidates.find((record) => record.geographyId === 'geo.fi')
  const greenland = first.register.geographyCandidates.find((record) => record.geographyId === 'geo.gl')
  assert.ok(finland)
  assert.ok(greenland)
  assert.equal(finland.facetCounts.substantiveCandidate, 0)
  assert.ok(finland.facetCounts.boundaryReconciliationRequired > 0)
  assert.equal(greenland.facetCounts.substantiveCandidate, 0)
  assert.ok(greenland.facetCounts.contextCandidate > 0)
  assert.ok(first.register.geographyCandidates.every((record) => record.scopeCompletenessState === 'unassessed'))
  assert.ok(first.register.geographyCandidates.every((record) => record.readinessResult === null))
  assert.ok(first.register.geographyCandidates.every((record) => !record.assessmentEventCreated))
})

test('keeps observation metadata and normalized references fail closed', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const artifacts = buildField08ResearchArtifacts(repo, { baseCommit })
  const sourceIds = new Set(artifacts.register.sourceCandidates.map((source) => source.sourceCandidateId))
  const bindingIds = new Set(artifacts.register.sourceBindings.map((binding) => binding.sourceBindingId))
  assert.ok(artifacts.register.sourceBindings.every((binding) => sourceIds.has(binding.sourceCandidateId)))
  assert.ok(artifacts.register.observationCandidates.every((observation) => sourceIds.has(observation.sourceCandidateId)))
  assert.ok(artifacts.register.observationCandidates.every((observation) => bindingIds.has(observation.sourceBindingId)))
  assert.ok(artifacts.register.sourceBindings.every((binding) => !binding.claimPromotionAllowed))
  assert.ok(artifacts.register.observationCandidates.every((observation) => !observation.externalUseAllowed))
  assert.ok(artifacts.register.observationCandidates.every((observation) => observation.verificationState === 'needs_review'))
  assert.deepEqual(artifacts.register.safetySummary, {
    coverageAssessmentEventsCreated: 0,
    coverageCellsPromoted: 0,
    readinessResultsCreated: 0,
    externalReadyClaimsCreated: 0,
    politicalSapmiAggregationsCreated: 0,
    sapmiSubstantiveCoverageCredit: 0,
    historicalCoverageFilesModified: 0,
  })
})

test('rejects an inaccurate quantitative metadata-gap declaration', (t) => {
  const { repo, baseCommit } = committedFixture(t, (sourceMap) => {
    const observation = sourceMap.observations.find((candidate) => candidate.quantitative)
    assert.ok(observation)
    observation.metadataGaps = ['method']
  })
  assert.throws(
    () => buildField08ResearchArtifacts(repo, { baseCommit }),
    /metadata gaps are not exact/,
  )
})

test('rejects a binding without an observation and a mismatched observation type', (t) => {
  const missingObservation = committedFixture(t, (sourceMap) => {
    sourceMap.observations = sourceMap.observations.slice(1)
  })
  assert.throws(
    () => buildField08ResearchArtifacts(missingObservation.repo, { baseCommit: missingObservation.baseCommit }),
    /at least one bounded observation candidate/,
  )

  const mismatchedType = committedFixture(t, (sourceMap) => {
    const observation = sourceMap.observations.find((candidate) => candidate.observationType === 'policy_status_candidate')
    assert.ok(observation)
    observation.observationType = 'quantitative_measurement_candidate'
  })
  assert.throws(
    () => buildField08ResearchArtifacts(mismatchedType.repo, { baseCommit: mismatchedType.baseCommit }),
    /schema validation failed|type and quantitative flag disagree/,
  )
})

test('requires an internally consistent rights-holder institutional classification', (t) => {
  const inconsistent = committedFixture(t, (sourceMap) => {
    const source = sourceMap.sources.find((candidate) => candidate.rightsHolderInstitutionalSource)
    assert.ok(source)
    source.authorityClass = 'official_public_authority'
  })
  assert.throws(
    () => buildField08ResearchArtifacts(inconsistent.repo, { baseCommit: inconsistent.baseCommit }),
    /schema validation failed|rights-holder classification fields disagree/,
  )
})

test('rejects unknown, missing and duplicate CLI arguments', () => {
  assert.deepEqual(parseField08CliArgs(['--check', '--base-commit=abc123']), { check: true, baseCommit: 'abc123' })
  assert.deepEqual(parseField08CliArgs(['--base-commit', 'abc123']), { check: false, baseCommit: 'abc123' })
  assert.throws(() => parseField08CliArgs(['--chek']), /Unknown argument/)
  assert.throws(() => parseField08CliArgs(['--base-commit']), /requires a value/)
  assert.throws(() => parseField08CliArgs(['--check', '--check']), /Duplicate --check/)
})

test('writes register and report before the manifest, preserves coverage bytes, and fails on drift', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const historicalBefore = readFileSync(resolve(repo, HISTORICAL_ASSESSMENTS_PATH), 'utf8')
  const ledgerBefore = readFileSync(resolve(repo, COVERAGE_LEDGER_PATH), 'utf8')
  const artifacts = buildField08ResearchArtifacts(repo, { baseCommit })
  writeOrCheckField08Research(repo, artifacts, false)
  assert.equal(readFileSync(resolve(repo, REGISTER_PATH), 'utf8'), artifacts.registerJson)
  assert.equal(readFileSync(resolve(repo, REPORT_PATH), 'utf8'), artifacts.reportMarkdown)
  assert.equal(readFileSync(resolve(repo, GENERATION_MANIFEST_PATH), 'utf8'), artifacts.generationManifestJson)
  assert.equal(readFileSync(resolve(repo, HISTORICAL_ASSESSMENTS_PATH), 'utf8'), historicalBefore)
  assert.equal(readFileSync(resolve(repo, COVERAGE_LEDGER_PATH), 'utf8'), ledgerBefore)
  writeOrCheckField08Research(repo, artifacts, true)

  writeFileSync(resolve(repo, REGISTER_PATH), '{}\n')
  assert.throws(() => writeOrCheckField08Research(repo, artifacts, true), /stale/)

  appendFileSync(resolve(repo, SOURCE_MAP_PATH), '\n')
  assert.throws(
    () => buildField08ResearchArtifacts(repo, { baseCommit }),
    /differs from declared base commit/,
  )
})
