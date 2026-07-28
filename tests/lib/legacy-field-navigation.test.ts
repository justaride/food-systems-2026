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
  COVERAGE_GENERATOR_PATH,
  GENERATION_MANIFEST_PATH,
  GENERATOR_PATH,
  MAP_PATH,
  ONTOLOGY_PATH,
  REGISTER_PATH,
  SCHEMA_PATH,
  buildLegacyFieldNavigationArtifacts,
  writeOrCheckLegacyFieldNavigation,
  type NavigationMap,
} from '../../scripts/knowledge/generate-legacy-field-navigation'

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

function committedFixture(t: { after(callback: () => void): void }) {
  const repo = mkdtempSync(join(tmpdir(), 'food-legacy-navigation-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const map = JSON.parse(readFileSync(resolve(root, MAP_PATH), 'utf8')) as NavigationMap
  const paths = [
    MAP_PATH,
    SCHEMA_PATH,
    ONTOLOGY_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
    ...map.navigationContexts.map((context) => context.artifactPath),
    ...map.fields.map((field) => field.artifactPath),
  ]
  for (const path of new Set(paths)) copyPath(root, repo, path)
  git(repo, ['init', '-q'])
  git(repo, ['config', 'user.name', 'Gate 2A Test'])
  git(repo, ['config', 'user.email', 'gate2a@example.invalid'])
  git(repo, ['add', '--', ...[...new Set(paths)]])
  git(repo, ['commit', '-q', '-m', 'test: pin navigation source'])
  return { repo, baseCommit: git(repo, ['rev-parse', 'HEAD']), map }
}

test('validates the proposed map against a schema that forbids promotion fields', () => {
  const schema = JSON.parse(readFileSync(resolve(root, SCHEMA_PATH), 'utf8')) as object
  const map = JSON.parse(readFileSync(resolve(root, MAP_PATH), 'utf8')) as NavigationMap
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  assert.equal(validate(map), true, JSON.stringify(validate.errors))
  assert.equal(map.fields.length, 13)
  assert.deepEqual(map.fields.map((field) => field.sequence), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  assert.equal(map.semantics.coverageImplication, 'none')
  assert.equal(map.semantics.subjectMatterState, 'unassessed')
  assert.equal(map.semantics.geographyRepresentation, 'unknown')
  assert.equal(map.semantics.coveragePromotionAllowed, false)
  assert.equal(map.semantics.crossProfileAggregationAllowed, false)
})

test('builds thirteen artifacts and separate 104/13 neutral bindings deterministically', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const first = buildLegacyFieldNavigationArtifacts(repo, { baseCommit })
  const second = buildLegacyFieldNavigationArtifacts(repo, { baseCommit })
  assert.equal(first.registerJson, second.registerJson)
  assert.equal(first.generationManifestJson, second.generationManifestJson)
  assert.equal(first.register.fieldRegistrations.length, 13)
  assert.equal(first.register.navigationContexts.length, 2)

  const political = first.register.bindings.filter((binding) => binding.profileId === 'profile.legacy_field_political')
  const sapmi = first.register.bindings.filter((binding) => binding.profileId === 'profile.legacy_field_sapmi_overlap')
  assert.equal(political.length, 104)
  assert.equal(sapmi.length, 13)
  assert.ok(political.every((binding) => binding.aggregationClass === 'political_nordic'))
  assert.ok(political.every((binding) => binding.geographyId !== 'geo.sapmi'))
  assert.ok(political.every((binding) => binding.rightsHolderReviewRequired === false))
  assert.ok(sapmi.every((binding) => binding.aggregationClass === 'sapmi_overlapping'))
  assert.ok(sapmi.every((binding) => binding.geographyId === 'geo.sapmi'))
  assert.ok(sapmi.every((binding) => binding.rightsHolderReviewRequired === true))

  for (const registration of first.register.fieldRegistrations) {
    assert.equal(registration.coverageImplication, 'none')
    assert.equal(registration.subjectMatterState, 'unassessed')
    assert.equal(registration.geographyRepresentation, 'unknown')
    assert.equal(registration.evidenceUse, 'not_evidence')
    assert.match(registration.artifactSnapshot.gitObjectId, /^[a-f0-9]{40}$/)
    assert.match(registration.artifactSnapshot.sha256, /^sha256:[a-f0-9]{64}$/)
  }
  for (const binding of first.register.bindings) {
    assert.equal(binding.bindingSemantics, 'navigation_route_only')
    assert.equal(binding.coverageImplication, 'none')
    assert.equal(binding.subjectMatterState, 'unassessed')
    assert.equal(binding.geographyRepresentation, 'unknown')
    assert.equal(binding.evidenceUse, 'not_evidence')
    for (const forbidden of ['evidenceLinks', 'reviewReceipts', 'readinessResult', 'inventoryState', 'citationReadiness']) {
      assert.equal(forbidden in binding, false)
    }
  }
})

test('resolves every navigation binding to an existing historical legacy cell without changing it', (t) => {
  const { repo, baseCommit } = committedFixture(t)
  const artifacts = buildLegacyFieldNavigationArtifacts(repo, { baseCommit })
  const historicalCellIds = new Set(
    readFileSync(resolve(root, 'knowledge/coverage/coverage-ledger.v1.jsonl'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.includes('"profileId":"profile.legacy_field_'))
      .map((line) => (JSON.parse(line) as { cell: { cellId: string } }).cell.cellId),
  )
  assert.equal(historicalCellIds.size, 117)
  assert.deepEqual(new Set(artifacts.register.bindings.map((binding) => binding.cellId)), historicalCellIds)
})

test('writes the register before its manifest, checks exact bytes and fails on source or output drift', (t) => {
  const { repo, baseCommit, map } = committedFixture(t)
  const artifacts = buildLegacyFieldNavigationArtifacts(repo, { baseCommit })
  writeOrCheckLegacyFieldNavigation(repo, artifacts, false)
  assert.equal(readFileSync(resolve(repo, REGISTER_PATH), 'utf8'), artifacts.registerJson)
  assert.equal(readFileSync(resolve(repo, GENERATION_MANIFEST_PATH), 'utf8'), artifacts.generationManifestJson)
  writeOrCheckLegacyFieldNavigation(repo, artifacts, true)

  writeFileSync(resolve(repo, REGISTER_PATH), '{}\n')
  assert.throws(() => writeOrCheckLegacyFieldNavigation(repo, artifacts, true), /stale/)

  const fieldPath = map.fields[0].artifactPath
  appendFileSync(resolve(repo, fieldPath), '\nsource drift\n')
  assert.throws(
    () => buildLegacyFieldNavigationArtifacts(repo, { baseCommit }),
    /differs from declared base commit/,
  )
})
