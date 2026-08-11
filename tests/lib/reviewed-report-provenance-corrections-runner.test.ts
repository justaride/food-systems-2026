import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_DEPENDENCY_SCOPE,
  type ReviewedReportProvenanceCorrectionClient,
  type ReviewedReportProvenanceCorrectionDatabaseRow,
  type ReviewedReportProvenanceCorrectionInspection,
  assertReviewedReportProvenanceCorrectionApplyAuthorization,
  assertReviewedReportProvenanceCorrectionPostApply,
  assertReviewedReportProvenanceCorrectionReady,
  buildReviewedReportProvenanceCorrectionSeedTargets,
  inspectReviewedReportProvenanceCorrectionState,
  parseReviewedReportProvenanceCorrectionArgs,
  reviewedReportProvenanceCorrectionPlanSha256,
} from '../../scripts/apply-reviewed-report-provenance-corrections'
import {
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
} from '../../src/lib/citations/reviewed-report-provenance-corrections'

const DATABASE_IDENTITY_UUID = '90e3e24d-230f-42f7-b178-5bcd5b861e84'

type FakeState = 'pending' | 'applied' | 'hybrid' | 'conflict'

type FakeDependencies = {
  documents: unknown[]
  documentRefs: unknown[]
  sourceCitations: Array<{ id: string; [key: string]: unknown }>
  fieldCitations: unknown[]
  libraryAnalysisRecords: unknown[]
  evidenceAppraisals: unknown[]
}

const DEFAULT_DEPENDENCIES: FakeDependencies = {
  documents: [{ id: 'doc-1', title: 'Bound document' }],
  documentRefs: [
    { id: 'doc-ref-1', fromId: 'doc-1', toId: 'doc-external' },
  ],
  sourceCitations: [
    { id: 'citation-1', documentId: 'doc-1', citationText: 'Evidence' },
  ],
  fieldCitations: [
    {
      id: 'field-citation-1',
      citationId: 'citation-1',
      entityType: 'Report',
      entityId: 'beredskap-finsk-modell-hvk',
    },
  ],
  libraryAnalysisRecords: [
    {
      id: 'analysis-1',
      sourceKind: 'report',
      sourceKey: 'report:beredskap-finsk-modell-hvk',
    },
  ],
  evidenceAppraisals: [
    {
      id: 'appraisal-1',
      reportId: 'beredskap-finsk-modell-hvk',
      status: 'draft',
    },
  ],
}

function databaseRowsForState(
  state: FakeState,
): ReviewedReportProvenanceCorrectionDatabaseRow[] {
  return buildReviewedReportProvenanceCorrectionSeedTargets().map(
    (target, index) => {
      let provenanceType: string = target.entry.expectedCurrentType
      if (state === 'applied' || (state === 'hybrid' && index === 0)) {
        provenanceType = target.entry.targetType
      } else if (state === 'conflict' && index === 0) {
        provenanceType = 'internal_register'
      }
      return {
        ...(target.portableIdentity as unknown as Record<string, unknown>),
        provenanceType,
        documentId: index === 0 ? 'doc-1' : null,
      } as unknown as ReviewedReportProvenanceCorrectionDatabaseRow
    },
  )
}

function fakeClient(options?: {
  state?: FakeState
  identityUuid?: string
  identityAvailable?: boolean
  omitLastReport?: boolean
  mutateFirstReport?: (
    row: ReviewedReportProvenanceCorrectionDatabaseRow,
  ) => ReviewedReportProvenanceCorrectionDatabaseRow
  dependencies?: Partial<FakeDependencies>
}) {
  const state = options?.state ?? 'pending'
  const rows = databaseRowsForState(state)
  if (options?.mutateFirstReport && rows[0]) {
    rows[0] = options.mutateFirstReport(rows[0])
  }
  if (options?.omitLastReport) rows.pop()
  const dependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...options?.dependencies,
  }
  let identityRead = 0
  const client = {
    $queryRaw: async () => {
      identityRead += 1
      if (identityRead === 1) {
        return [
          {
            currentDatabase: 'foodsystems',
            identityTable:
              options?.identityAvailable === false
                ? null
                : '"DatabaseIdentity"',
          },
        ]
      }
      return [{ identityUuid: options?.identityUuid ?? DATABASE_IDENTITY_UUID }]
    },
    report: { findMany: async () => rows },
    document: { findMany: async () => dependencies.documents },
    documentRef: { findMany: async () => dependencies.documentRefs },
    sourceCitation: {
      findMany: async () => dependencies.sourceCitations,
    },
    fieldCitation: { findMany: async () => dependencies.fieldCitations },
    libraryAnalysisRecord: {
      findMany: async () => dependencies.libraryAnalysisRecords,
    },
    evidenceAppraisal: {
      findMany: async () => dependencies.evidenceAppraisals,
    },
  }
  return client as unknown as ReviewedReportProvenanceCorrectionClient
}

async function inspection(
  state: FakeState,
  options?: Parameters<typeof fakeClient>[0],
) {
  return inspectReviewedReportProvenanceCorrectionState(
    fakeClient({ ...options, state }),
  )
}

describe('reviewed Report provenance correction database runner', () => {
  it('binds all seven manifest rows to exact hashed seed identities', () => {
    const targets = buildReviewedReportProvenanceCorrectionSeedTargets()
    assert.equal(
      targets.length,
      REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
    )
    assert.deepEqual(
      targets.map((target) => target.entry.id),
      REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) => entry.id),
    )
    assert.ok(
      targets.every((target) =>
        /^[a-f0-9]{64}$/.test(target.portableIdentitySha256),
      ),
    )
  })

  it('defaults to dry-run and functionally enforces exact apply authorization', () => {
    assert.deepEqual(parseReviewedReportProvenanceCorrectionArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    })
    const authorized = parseReviewedReportProvenanceCorrectionArgs([
      '--apply',
      `--ack=${REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK}`,
      `--plan-sha256=${'a'.repeat(64)}`,
    ])
    assert.doesNotThrow(() =>
      assertReviewedReportProvenanceCorrectionApplyAuthorization(authorized),
    )
    assert.throws(
      () =>
        assertReviewedReportProvenanceCorrectionApplyAuthorization({
          ...authorized,
          ack: 'WRONG_ACK',
        }),
      /requires --ack=APPLY_REVIEWED_REPORT_PROVENANCE_CORRECTIONS_7/,
    )
    assert.throws(
      () =>
        assertReviewedReportProvenanceCorrectionApplyAuthorization({
          ...authorized,
          expectedPlanSha256: 'A'.repeat(64),
        }),
      /exact --plan-sha256=<64 lowercase hex>/,
    )
    assert.throws(
      () => parseReviewedReportProvenanceCorrectionArgs(['--ack=unused']),
      /valid only with --apply/,
    )
    assert.throws(
      () =>
        parseReviewedReportProvenanceCorrectionArgs(['--apply', '--apply']),
      /must not be repeated/,
    )
    assert.throws(
      () => parseReviewedReportProvenanceCorrectionArgs(['--unknown']),
      /Unknown Report provenance correction argument/,
    )
  })

  it('functionally builds exact pending and applied plans with stable hashes', async () => {
    const pending = await inspection('pending')
    const pendingAgain = await inspection('pending')
    assert.deepEqual(
      assertReviewedReportProvenanceCorrectionReady(pending),
      { pending: 7, applied: 0 },
    )
    assert.deepEqual(pending.plan.summary, {
      pending: 7,
      applied: 0,
      conflicts: 0,
    })
    assert.equal(
      reviewedReportProvenanceCorrectionPlanSha256(pending),
      reviewedReportProvenanceCorrectionPlanSha256(pendingAgain),
    )
    assert.ok(
      pending.plan.rows.every(
        (row) =>
          /^[a-f0-9]{64}$/.test(row.seedIdentitySha256) &&
          /^[a-f0-9]{64}$/.test(row.databaseNonProvenanceSha256 ?? '') &&
          /^[a-f0-9]{64}$/.test(row.beforeFullRowSha256 ?? '') &&
          /^[a-f0-9]{64}$/.test(row.afterFullRowSha256 ?? '') &&
          row.beforeFullRowSha256 !== row.afterFullRowSha256,
      ),
    )

    const applied = await inspection('applied')
    assert.deepEqual(
      assertReviewedReportProvenanceCorrectionReady(applied),
      { pending: 0, applied: 7 },
    )
    assert.ok(
      applied.plan.rows.every(
        (row) => row.beforeFullRowSha256 === row.afterFullRowSha256,
      ),
    )
    assert.deepEqual(
      assertReviewedReportProvenanceCorrectionPostApply(pending, applied),
      { pending: 0, applied: 7 },
    )
  })

  it('rejects hybrid, unexpected, missing, and non-provenance-drift states', async () => {
    const hybrid = await inspection('hybrid')
    assert.equal(hybrid.plan.conflicts[0]?.entity, 'Batch')
    assert.match(
      hybrid.plan.conflicts[0]?.reason ?? '',
      /hybrid\/partially applied/,
    )
    assert.throws(
      () => assertReviewedReportProvenanceCorrectionReady(hybrid),
      /hybrid\/partially applied/,
    )

    const unexpected = await inspection('conflict')
    assert.equal(
      unexpected.plan.conflicts[0]?.reason,
      'unexpected_current_provenance:internal_register',
    )
    assert.throws(
      () => assertReviewedReportProvenanceCorrectionReady(unexpected),
      /unexpected_current_provenance/,
    )

    const missing = await inspectReviewedReportProvenanceCorrectionState(
      fakeClient({ state: 'pending', omitLastReport: true }),
    )
    assert.ok(
      missing.plan.conflicts.some(
        (conflict) => conflict.reason === 'missing_database_row',
      ),
    )

    const identityDrift = await inspectReviewedReportProvenanceCorrectionState(
      fakeClient({
        state: 'pending',
        mutateFirstReport: (row) => ({ ...row, title: `${row.title} drift` }),
      }),
    )
    assert.equal(
      identityDrift.plan.conflicts[0]?.reason,
      'seed_database_non_provenance_identity_drift',
    )
  })

  it('binds plan hashes to DatabaseIdentity and every enumerated dependency', async () => {
    const baseline = await inspection('pending')
    const dependencyDrift = await inspection('pending', {
      dependencies: {
        libraryAnalysisRecords: [
          ...DEFAULT_DEPENDENCIES.libraryAnalysisRecords,
          {
            id: 'analysis-2',
            sourceKind: 'report',
            sourceKey: 'report:reitan-2024-25',
          },
        ],
      },
    })
    assert.notEqual(
      dependencyDrift.plan.dependencySha256,
      baseline.plan.dependencySha256,
    )
    assert.notEqual(
      reviewedReportProvenanceCorrectionPlanSha256(dependencyDrift),
      reviewedReportProvenanceCorrectionPlanSha256(baseline),
    )

    const databaseDrift = await inspection('pending', {
      identityUuid: '123e4567-e89b-42d3-a456-426614174001',
    })
    assert.notEqual(
      reviewedReportProvenanceCorrectionPlanSha256(databaseDrift),
      reviewedReportProvenanceCorrectionPlanSha256(baseline),
    )
    assert.deepEqual(
      baseline.plan.dependencyScope,
      REVIEWED_REPORT_PROVENANCE_CORRECTION_DEPENDENCY_SCOPE,
    )
    assert.deepEqual(baseline.plan.dependencyCounts, {
      databaseIdentity: 1,
      documents: 1,
      documentRefs: 1,
      sourceCitations: 1,
      fieldCitations: 1,
      libraryAnalysisRecords: 1,
      evidenceAppraisals: 1,
    })
  })

  it('functionally rejects post-apply dependency, non-provenance, and full-row drift', async () => {
    const before = await inspection('pending')
    const after = await inspection('applied')
    const dependencyDrift = await inspection('applied', {
      dependencies: {
        documentRefs: [
          ...DEFAULT_DEPENDENCIES.documentRefs,
          { id: 'doc-ref-2', fromId: 'doc-1', toId: 'doc-other' },
        ],
      },
    })
    assert.throws(
      () =>
        assertReviewedReportProvenanceCorrectionPostApply(
          before,
          dependencyDrift,
        ),
      /post-apply idempotence, non-provenance, identity, or dependency/,
    )

    const nonProvenanceDrift: ReviewedReportProvenanceCorrectionInspection = {
      ...after,
      plan: {
        ...after.plan,
        databaseNonProvenanceSha256: '0'.repeat(64),
      },
    }
    assert.throws(
      () =>
        assertReviewedReportProvenanceCorrectionPostApply(
          before,
          nonProvenanceDrift,
        ),
      /post-apply idempotence, non-provenance, identity, or dependency/,
    )

    const fullRowDrift: ReviewedReportProvenanceCorrectionInspection = {
      ...after,
      plan: {
        ...after.plan,
        rows: after.plan.rows.map((row, index) =>
          index === 0
            ? { ...row, beforeFullRowSha256: 'f'.repeat(64) }
            : row,
        ),
      },
    }
    assert.throws(
      () =>
        assertReviewedReportProvenanceCorrectionPostApply(
          before,
          fullRowDrift,
        ),
      /post-apply full-row hash verification failed/,
    )
  })

  it('pins locks, Serializable CAS, exact dependency scope, and one-field writes', () => {
    const runner = readFileSync(
      'scripts/apply-reviewed-report-provenance-corrections.ts',
      'utf8',
    )
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    assert.equal(
      packageJson.scripts['repair:reviewed-report-provenance-corrections'],
      'tsx scripts/apply-reviewed-report-provenance-corrections.ts',
    )
    assert.match(runner, /APPLY_REVIEWED_REPORT_PROVENANCE_CORRECTIONS_7/)
    assert.match(runner, /current_database\(\)/)
    assert.match(runner, /to_regclass\('public\."DatabaseIdentity"'\)/)
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(runner, /ORDER BY "id" FOR UPDATE/)
    assert.match(runner, /FROM "Document"[\s\S]*?FOR SHARE/)
    assert.match(runner, /FROM "DocumentRef"[\s\S]*?FOR SHARE/)
    assert.match(runner, /FROM "SourceCitation"[\s\S]*?FOR SHARE/)
    assert.match(runner, /FROM "FieldCitation"[\s\S]*?FOR SHARE/)
    assert.match(runner, /FROM "LibraryAnalysisRecord"[\s\S]*?FOR SHARE/)
    assert.match(runner, /FROM "EvidenceAppraisal"[\s\S]*?FOR SHARE/)
    assert.match(runner, /isolationLevel: 'Serializable'/)
    assert.match(runner, /beforeFullRowSha256/)
    assert.match(runner, /afterFullRowSha256/)
    assert.match(
      runner,
      /where: \{\s*id: row\.id,\s*provenanceType: row\.expectedCurrentType,\s*\}/,
    )
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 1)
    assert.equal(
      (runner.match(/data: \{ provenanceType: row\.targetType \}/g) ?? [])
        .length,
      1,
    )
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    )
  })
})
