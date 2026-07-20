import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import {
  PINNED_SEED_ONLY_REPORT_TARGET_SHA256,
  SEED_ONLY_REPORT_MANAGED_FIELDS,
  SEED_ONLY_REPORT_SYNC_IDS,
  buildReviewedSeedOnlyReportTargets,
  buildSeedOnlyReportSyncPlan,
  seedOnlyReportSyncPlanContract,
  sha256SeedOnlyReportJson,
  type SeedOnlyReportDatabaseSnapshot,
  type SeedOnlyReportTarget,
} from '../../src/lib/citations/seed-only-report-sync'

function databaseRows(
  targets: readonly SeedOnlyReportTarget[],
  documentIds: Record<string, string | null> = {},
): SeedOnlyReportDatabaseSnapshot[] {
  return structuredClone(targets).map(target => ({
    ...target,
    documentId: documentIds[target.id] ?? null,
  }))
}

describe('guarded seed-only Report sync', () => {
  it('pins exactly the two reviewed internal Report targets and their complete manifest', () => {
    const targets = buildReviewedSeedOnlyReportTargets(reports)
    assert.deepEqual(targets.map(target => target.id), [...SEED_ONLY_REPORT_SYNC_IDS].sort())
    assert.equal(
      sha256SeedOnlyReportJson(targets),
      PINNED_SEED_ONLY_REPORT_TARGET_SHA256,
    )
    assert.equal(
      PINNED_SEED_ONLY_REPORT_TARGET_SHA256,
      'bdfbde7eee91a28fc826ed54e2af6c53c4f91aac3b49a0933612a8306ef509b6',
    )

    const artifactRegister = targets.find(target =>
      target.id === 'food-systems-2026-internal-artifact-register')!
    assert.equal(artifactRegister.provenanceType, 'internal_register')
    assert.equal(Array.isArray(artifactRegister.supportingSources), true)
    assert.equal((artifactRegister.supportingSources as unknown[]).length, 21)

    const fundingDossiers = targets.find(target =>
      target.id === 'food-systems-2026-pilot-funding-dossiers')!
    assert.equal(fundingDossiers.provenanceType, 'internal_synthesis')
    assert.equal(Array.isArray(fundingDossiers.supportingSources), true)
    assert.equal((fundingDossiers.supportingSources as unknown[]).length, 6)
    for (const target of targets) {
      assert.equal(target.country, 'NO')
      assert.equal(target.sourceUrl, null)
      assert.equal(target.accessedAt, null)
      assert.equal('documentId' in target, false)
    }
  })

  it('fails closed when either reviewed seed row is missing, duplicated, or changed', () => {
    assert.throws(
      () => buildReviewedSeedOnlyReportTargets(
        reports.filter(report => report.id !== SEED_ONLY_REPORT_SYNC_IDS[0]),
      ),
      /exactly two unique reviewed seed rows/,
    )
    const duplicated = [
      ...reports,
      structuredClone(reports.find(report => report.id === SEED_ONLY_REPORT_SYNC_IDS[0])!),
    ]
    assert.throws(
      () => buildReviewedSeedOnlyReportTargets(duplicated),
      /exactly two unique reviewed seed rows/,
    )

    const drifted = structuredClone(reports)
    drifted.find(report => report.id === SEED_ONLY_REPORT_SYNC_IDS[1])!.title =
      'Unreviewed replacement title'
    assert.throws(
      () => buildReviewedSeedOnlyReportTargets(drifted),
      /target values drifted from the pinned manifest/,
    )

    const driftedTargets = structuredClone(buildReviewedSeedOnlyReportTargets(reports))
    driftedTargets[0]!.title = 'Unreviewed direct plan target'
    assert.throws(
      () => buildSeedOnlyReportSyncPlan([], driftedTargets),
      /plan targets drifted from the pinned manifest/,
    )
  })

  it('builds a deterministic create-only plan when both reviewed ids are absent', () => {
    const targets = buildReviewedSeedOnlyReportTargets(reports)
    const plan = buildSeedOnlyReportSyncPlan([], targets)
    assert.deepEqual(plan.summary, {
      total: 2,
      pendingCreates: 2,
      alreadyApplied: 0,
      conflicts: 0,
    })
    assert.deepEqual(plan.creates.map(create => create.id), [...SEED_ONLY_REPORT_SYNC_IDS].sort())
    assert.ok(plan.creates.every(create => create.expectedAbsent))
    assert.ok(plan.creates.every(create => /^[a-f0-9]{64}$/.test(create.targetRowSha256)))
    assert.deepEqual(plan.observed.map(row => row.state), ['missing', 'missing'])

    const reversed = buildSeedOnlyReportSyncPlan([], [...targets].reverse())
    assert.deepEqual(
      seedOnlyReportSyncPlanContract(reversed),
      seedOnlyReportSyncPlanContract(plan),
    )
  })

  it('is idempotent for exact existing rows and preserves independent document links', () => {
    const targets = buildReviewedSeedOnlyReportTargets(reports)
    const rows = databaseRows(targets, {
      'food-systems-2026-internal-artifact-register': 'doc-artifact-register',
      'food-systems-2026-pilot-funding-dossiers': 'doc-funding-dossiers',
    })
    const plan = buildSeedOnlyReportSyncPlan(rows, targets)
    assert.deepEqual(plan.summary, {
      total: 2,
      pendingCreates: 0,
      alreadyApplied: 2,
      conflicts: 0,
    })
    assert.deepEqual(plan.alreadyAppliedIds, [...SEED_ONLY_REPORT_SYNC_IDS].sort())
    assert.deepEqual(
      plan.observed.map(row => row.documentId),
      ['doc-artifact-register', 'doc-funding-dossiers'],
    )

    const reorderedJson = structuredClone(rows)
    const firstSource = (reorderedJson[0]!.supportingSources as Array<Record<string, unknown>>)[0]!
    reorderedJson[0]!.supportingSources = [{
      documentPath: firstSource.documentPath,
      label: firstSource.label,
    }, ...(reorderedJson[0]!.supportingSources as unknown[]).slice(1)]
    const reorderedPlan = buildSeedOnlyReportSyncPlan(reorderedJson, targets)
    assert.equal(reorderedPlan.conflicts.length, 0)
    assert.equal(reorderedPlan.alreadyAppliedIds.length, 2)
  })

  it('allows a mixed missing/applied state but rejects any existing seed-field drift', () => {
    const targets = buildReviewedSeedOnlyReportTargets(reports)
    const oneExisting = databaseRows([targets[0]!])
    const mixed = buildSeedOnlyReportSyncPlan(oneExisting, targets)
    assert.equal(mixed.creates.length, 1)
    assert.equal(mixed.alreadyAppliedIds.length, 1)
    assert.equal(mixed.conflicts.length, 0)

    const drifted = databaseRows(targets)
    drifted[0]!.title = 'A database-only title that must never be overwritten'
    drifted[0]!.provenanceType = 'external_report'
    const conflict = buildSeedOnlyReportSyncPlan(drifted, targets)
    assert.equal(conflict.creates.length, 0)
    assert.equal(conflict.alreadyAppliedIds.length, 1)
    assert.equal(conflict.conflicts.length, 1)
    assert.deepEqual(conflict.conflicts[0]!.changedFields, ['title', 'provenanceType'])

    const duplicated = buildSeedOnlyReportSyncPlan(
      [...databaseRows(targets), structuredClone(databaseRows(targets)[0]!)],
      targets,
    )
    assert.equal(duplicated.conflicts[0]!.code, 'duplicate_snapshot')
  })

  it('requires plan review, absence CAS, locks, Serializable apply, and create-only writes', () => {
    const source = readFileSync('scripts/sync-seed-only-reports.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['repair:seed-only-reports'],
      'tsx scripts/sync-seed-only-reports.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "Report"[\s\S]*FOR UPDATE/)
    assert.match(source, /client\.report\.count\(\{ where: \{ id: create\.id \} \}\)/)
    assert.match(source, /inspectSeedOnlyReportSync\(transaction, targets\)/)
    assert.match(source, /lockedDigest !== args\.expectedPlanSha256/)
    assert.match(source, /transaction\.report\.create\(\{ data: reportCreateData\(create\.target\) \}\)/)
    assert.match(source, /afterPlan\.creates\.length > 0/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were committed/)
    assert.doesNotMatch(source, /report\.(?:update|updateMany|upsert|delete|deleteMany|createMany)\s*\(/)

    const createData = source.match(
      /function reportCreateData\([\s\S]*?\n}\n\nasync function findAbsenceCasPreflightMismatches/,
    )?.[0] ?? ''
    for (const field of SEED_ONLY_REPORT_MANAGED_FIELDS) {
      assert.match(createData, new RegExp(`${field}:`), `create data must include ${field}`)
    }
  })
})
