import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { sources } from '../../prisma/seed-data/sources'
import {
  PINNED_REVIEWED_PROVENANCE_MANIFEST_SHA256,
  REVIEWED_PROVENANCE_MANIFEST,
  REVIEWED_PROVENANCE_MANIFEST_SHA256,
  REVIEWED_PROVENANCE_TARGET_COUNT,
  REVIEWED_REPORT_PROVENANCE_EXCLUSIONS,
  REVIEWED_REPORT_PROVENANCE_IDS,
  REVIEWED_REPORT_TARGET_COUNT,
  REVIEWED_SOURCE_DOC_PROVENANCE_EXCLUSIONS,
  REVIEWED_SOURCE_DOC_PROVENANCE_IDS,
  REVIEWED_SOURCE_DOC_TARGET_COUNT,
  applyReviewedReportProvenanceToSeed,
  applyReviewedSourceDocProvenanceToSeed,
  assertReviewedProvenanceStateIsAtomic,
  classifyReviewedProvenanceCurrent,
  sha256ReviewedProvenanceJson,
  validateReviewedProvenanceManifest,
} from '../../src/lib/citations/reviewed-provenance-batch'
import { REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST } from '../../src/lib/citations/reviewed-report-provenance-corrections'
import { buildReviewedProvenanceSeedTargets } from '../../scripts/apply-reviewed-provenance-batch'

const laterReportCorrectionById = new Map(
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) => [
    entry.id,
    entry,
  ]),
)

const reportsAtReviewedProvenanceBatchStage = reports.map((row) => {
  const correction = laterReportCorrectionById.get(row.id)
  return correction
    ? { ...row, provenanceType: correction.expectedCurrentType }
    : row
})

describe('reviewed 190-row provenance batch', () => {
  it('pins the exact reviewed manifest and category counts', () => {
    assert.equal(
      validateReviewedProvenanceManifest().length,
      REVIEWED_PROVENANCE_TARGET_COUNT,
    )
    assert.equal(REVIEWED_PROVENANCE_MANIFEST.length, 190)
    assert.equal(
      new Set(
        REVIEWED_PROVENANCE_MANIFEST.map((row) => `${row.entity}:${row.id}`),
      ).size,
      190,
    )
    assert.equal(
      REVIEWED_PROVENANCE_MANIFEST_SHA256,
      PINNED_REVIEWED_PROVENANCE_MANIFEST_SHA256,
    )
    assert.equal(
      REVIEWED_PROVENANCE_MANIFEST_SHA256,
      '8b831cd30d226ff5e68d25243cb3df3bd2ae48e848c80f7d884e04624a7ba8b5',
    )

    const reportRows = REVIEWED_PROVENANCE_MANIFEST.filter(
      (row) => row.entity === 'Report',
    )
    const sourceRows = REVIEWED_PROVENANCE_MANIFEST.filter(
      (row) => row.entity === 'SourceDoc',
    )
    assert.equal(reportRows.length, REVIEWED_REPORT_TARGET_COUNT)
    assert.equal(sourceRows.length, REVIEWED_SOURCE_DOC_TARGET_COUNT)
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(REVIEWED_REPORT_PROVENANCE_IDS).map(([type, ids]) => [
          type,
          ids.length,
        ]),
      ),
      {
        external_report: 61,
        external_article: 10,
        internal_synthesis: 4,
        composite_source: 3,
        blocked_source: 1,
      },
    )
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(REVIEWED_SOURCE_DOC_PROVENANCE_IDS).map(
          ([type, ids]) => [type, ids.length],
        ),
      ),
      {
        internal_synthesis: 49,
        internal_primary: 5,
        official_primary: 35,
        corporate_self_report: 8,
        peer_reviewed: 6,
        external_publication: 5,
        advocacy_position: 3,
      },
    )
  })

  it('materializes the approved seed provenance while retaining its 41 historical exclusions', () => {
    const seedTargets = buildReviewedProvenanceSeedTargets()
    assert.equal(seedTargets.length, 190)
    assert.equal(
      new Set(
        seedTargets.map(
          (target) => `${target.entry.entity}:${target.entry.id}`,
        ),
      ).size,
      190,
    )
    assert.ok(
      seedTargets.every((target) =>
        /^[a-f0-9]{64}$/.test(target.portableIdentitySha256),
      ),
    )

    const reportById = new Map(
      reportsAtReviewedProvenanceBatchStage.map((row) => [row.id, row]),
    )
    const sourceById = new Map(sources.map((row) => [row.id, row]))
    for (const entry of REVIEWED_PROVENANCE_MANIFEST) {
      const row =
        entry.entity === 'Report'
          ? reportById.get(entry.id)
          : sourceById.get(entry.id)
      assert.equal(
        row?.provenanceType,
        entry.targetType,
        `${entry.entity}:${entry.id}`,
      )
    }
    const historicalKeys = new Set(
      REVIEWED_PROVENANCE_MANIFEST.map((row) => `${row.entity}:${row.id}`),
    )
    assert.equal(REVIEWED_REPORT_PROVENANCE_EXCLUSIONS.length, 14)
    assert.equal(REVIEWED_SOURCE_DOC_PROVENANCE_EXCLUSIONS.length, 27)
    for (const id of REVIEWED_REPORT_PROVENANCE_EXCLUSIONS) {
      assert.ok(reportById.has(id), `Missing Report exclusion seed: ${id}`)
      assert.ok(
        !historicalKeys.has(`Report:${id}`),
        `Historic Report exclusion entered its manifest: ${id}`,
      )
    }
    for (const id of REVIEWED_SOURCE_DOC_PROVENANCE_EXCLUSIONS) {
      assert.ok(sourceById.has(id), `Missing SourceDoc exclusion seed: ${id}`)
      assert.ok(
        !historicalKeys.has(`SourceDoc:${id}`),
        `Historic SourceDoc exclusion entered its manifest: ${id}`,
      )
    }
  })

  it('fails seed materialization closed on missing, duplicate, or conflicting targets', () => {
    assert.throws(
      () =>
        applyReviewedReportProvenanceToSeed(
          reportsAtReviewedProvenanceBatchStage.filter(
            (row) => row.id !== 'nou-2011-4',
          ),
        ),
      /seed rows are missing: nou-2011-4/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceToSeed([
          ...reportsAtReviewedProvenanceBatchStage,
          reportsAtReviewedProvenanceBatchStage.find(
            (row) => row.id === 'nou-2011-4',
          )!,
        ]),
      /Duplicate reviewed Report seed id: nou-2011-4/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceToSeed(
          reportsAtReviewedProvenanceBatchStage.map((row) =>
            row.id === 'nou-2011-4'
              ? { ...row, provenanceType: 'internal_register' as const }
              : row,
          ),
        ),
      /Reviewed Report seed provenance conflict: nou-2011-4/,
    )
    assert.throws(
      () =>
        applyReviewedSourceDocProvenanceToSeed(
          sources.filter((row) => row.id !== 'src-12'),
        ),
      /seed rows are missing: src-12/,
    )
    assert.throws(
      () =>
        applyReviewedSourceDocProvenanceToSeed(
          sources.map((row) =>
            row.id === 'src-12'
              ? { ...row, provenanceType: 'duplicate' as const }
              : row,
          ),
        ),
      /Reviewed SourceDoc seed provenance conflict: src-12/,
    )
  })

  it('accepts only all-pending or all-applied states and rejects mixed partial state', () => {
    const pending = REVIEWED_PROVENANCE_MANIFEST.map((entry) =>
      classifyReviewedProvenanceCurrent(
        entry,
        entry.entity === 'Report' ? null : 'unknown',
      ),
    )
    const applied = REVIEWED_PROVENANCE_MANIFEST.map((entry) =>
      classifyReviewedProvenanceCurrent(entry, entry.targetType),
    )
    assert.deepEqual(assertReviewedProvenanceStateIsAtomic(pending), {
      pending: 190,
      applied: 0,
    })
    assert.deepEqual(assertReviewedProvenanceStateIsAtomic(applied), {
      pending: 0,
      applied: 190,
    })
    assert.throws(
      () =>
        assertReviewedProvenanceStateIsAtomic(['applied', ...pending.slice(1)]),
      /mixed\/partially applied/,
    )
    assert.throws(
      () =>
        assertReviewedProvenanceStateIsAtomic([
          'conflict',
          ...pending.slice(1),
        ]),
      /contains conflicts/,
    )
    assert.equal(
      classifyReviewedProvenanceCurrent(
        REVIEWED_PROVENANCE_MANIFEST[0]!,
        undefined,
      ),
      'conflict',
    )
    const sourceEntry = REVIEWED_PROVENANCE_MANIFEST.find(
      (row) => row.entity === 'SourceDoc',
    )!
    assert.equal(
      classifyReviewedProvenanceCurrent(sourceEntry, null),
      'conflict',
    )
  })

  it('canonicalizes dependency and identity hashes deterministically', () => {
    const left = {
      z: new Date('2026-07-20T00:00:00.000Z'),
      a: [{ beta: 2, alpha: 1 }],
    }
    const right = {
      a: [{ alpha: 1, beta: 2 }],
      z: '2026-07-20T00:00:00.000Z',
    }
    assert.equal(
      sha256ReviewedProvenanceJson(left),
      sha256ReviewedProvenanceJson(right),
    )
  })

  it('keeps apply behind reviewed-plan, locks, full CAS, and provenance-only writes', () => {
    const runner = readFileSync(
      'scripts/apply-reviewed-provenance-batch.ts',
      'utf8',
    )
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    assert.equal(
      packageJson.scripts['repair:reviewed-provenance-batch'],
      'tsx scripts/apply-reviewed-provenance-batch.ts',
    )
    assert.match(runner, /APPLY_REVIEWED_PROVENANCE_BATCH_190/)
    assert.match(
      runner,
      /--apply requires --ack=\$\{REVIEWED_PROVENANCE_APPLY_ACK\}/,
    )
    assert.match(runner, /--plan-sha256=<64 lowercase hex>/)
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(runner, /ORDER BY "id" FOR UPDATE/)
    assert.match(runner, /FOR SHARE/)
    assert.match(runner, /beforeFullRowSha256/)
    assert.match(runner, /databaseNonProvenanceSha256/)
    assert.match(runner, /dependencySha256/)
    assert.match(runner, /assertReviewedProvenanceStateIsAtomic/)
    assert.match(runner, /inspectReviewedProvenanceState\(\s*transaction/)
    assert.match(runner, /isolationLevel: 'Serializable'/)
    assert.equal(
      (runner.match(/data: \{ provenanceType: row\.targetType \}/g) ?? [])
        .length,
      2,
    )
    assert.doesNotMatch(runner, /data: \{ (?!provenanceType: row\.targetType)/)
    assert.doesNotMatch(runner, /deleteMany|createMany|upsert/)
  })
})
