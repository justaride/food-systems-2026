import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK,
  buildReviewedProvenanceCompletionSeedTargets,
  parseReviewedProvenanceCompletionArgs,
} from '../../scripts/apply-reviewed-provenance-completion'
import {
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST,
  REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
} from '../../src/lib/citations/reviewed-provenance-completion'

describe('reviewed provenance completion database runner', () => {
  it('binds all 39 manifest rows to exact, hashed seed identities', () => {
    const targets = buildReviewedProvenanceCompletionSeedTargets()
    assert.equal(targets.length, REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT)
    assert.deepEqual(
      targets.map((target) => `${target.entry.entity}:${target.entry.id}`),
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map(
        (entry) => `${entry.entity}:${entry.id}`,
      ),
    )
    assert.ok(
      targets.every((target) =>
        /^[a-f0-9]{64}$/.test(target.portableIdentitySha256),
      ),
    )
  })

  it('defaults to dry-run and rejects ambiguous apply arguments', () => {
    assert.deepEqual(parseReviewedProvenanceCompletionArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    })
    assert.deepEqual(
      parseReviewedProvenanceCompletionArgs([
        '--apply',
        `--ack=${REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK}`,
        `--plan-sha256=${'a'.repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK,
        expectedPlanSha256: 'a'.repeat(64),
      },
    )
    assert.throws(
      () => parseReviewedProvenanceCompletionArgs(['--ack=unused']),
      /valid only with --apply/,
    )
    assert.throws(
      () => parseReviewedProvenanceCompletionArgs(['--ack=']),
      /valid only with --apply/,
    )
    assert.throws(
      () =>
        parseReviewedProvenanceCompletionArgs(['--apply', '--apply']),
      /must not be repeated/,
    )
    assert.throws(
      () => parseReviewedProvenanceCompletionArgs(['--unknown']),
      /Unknown completion argument/,
    )
  })

  it('pins database identity, target and enumerated-dependency snapshots, locks, and the reviewed plan', () => {
    const runner = readFileSync(
      'scripts/apply-reviewed-provenance-completion.ts',
      'utf8',
    )
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    assert.equal(
      packageJson.scripts['repair:reviewed-provenance-completion'],
      'tsx scripts/apply-reviewed-provenance-completion.ts',
    )
    assert.match(runner, /APPLY_REVIEWED_PROVENANCE_COMPLETION_39/)
    assert.match(runner, /--plan-sha256=<64 lowercase hex>/)
    assert.match(runner, /current_database\(\)/)
    assert.match(runner, /to_regclass\('public\."DatabaseIdentity"'\)/)
    assert.match(runner, /databaseIdentityUuid/)
    assert.match(runner, /manifestSha256/)
    assert.match(runner, /seedIdentitySha256/)
    assert.match(runner, /databaseFullStateSha256/)
    assert.match(runner, /databaseNonProvenanceSha256/)
    assert.match(runner, /dependencySha256/)
    assert.match(runner, /dependencyCounts/)
    assert.match(runner, /fieldCitations: \{\s*some:/)
    assert.match(
      runner,
      /SELECT "citationId" FROM "FieldCitation"[\s\S]*?"entityType" = 'Report'/,
    )
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(runner, /ORDER BY "id" FOR UPDATE/)
    assert.match(runner, /FOR SHARE/)
    assert.match(runner, /isolationLevel: 'Serializable'/)
    assert.match(
      runner,
      /inspectReviewedProvenanceCompletionState\(\s*transaction/,
    )
    assert.match(runner, /reviewedProvenanceCompletionPlanSha256\(locked\)/)
    assert.match(runner, /REVIEWED_PROVENANCE_COMPLETION_RECEIPT/)
    assert.match(
      runner,
      /--apply requires an available, pinned primary DatabaseIdentity UUID/,
    )
  })

  it('uses full-row CAS and changes only the expected provenance state', () => {
    const runner = readFileSync(
      'scripts/apply-reviewed-provenance-completion.ts',
      'utf8',
    )
    assert.match(runner, /beforeFullRowSha256/)
    assert.match(runner, /afterFullRowSha256/)
    assert.match(runner, /where: \{ id: row\.id, provenanceType: null \}/)
    assert.match(
      runner,
      /where: \{ id: row\.id, provenanceType: 'unknown' \}/,
    )
    assert.equal(
      (runner.match(/data: \{ provenanceType: row\.targetType \}/g) ?? [])
        .length,
      2,
    )
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 2)
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    )
    assert.match(runner, /post-apply idempotence/)
    assert.match(runner, /afterAtomic\.pending !== 0/)
    assert.match(runner, /afterAtomic\.applied !==/)
  })
})
