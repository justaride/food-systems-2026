import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import { Client } from 'pg'

import { startEphemeralPostgres } from '../helpers/ephemeral-postgres'

const repoRoot = process.cwd()
const migrationPath = join(
  repoRoot,
  'prisma/migrations/20260720_controlled_mutation_release_controls/migration.sql',
)
const dependencyBindingMigrationPath = join(
  repoRoot,
  'prisma/migrations/20260720_matsvinnloven_audit_dependency_binding/migration.sql',
)
const fieldCitationIntegrityMigrationPath = join(
  repoRoot,
  'prisma/migrations/20260720_release_control_field_citation_integrity_v2/migration.sql',
)
const fieldCitationIntegrityV3MigrationPath = join(
  repoRoot,
  'prisma/migrations/20260720_release_control_field_citation_integrity_v3/migration.sql',
)

function modelBlock(schema: string, modelName: string): string {
  const match = schema.match(new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(match, `Missing ${modelName} model`)
  return match[1]
}

function postgresBindir(): string | null {
  const configured = process.env.POSTGRES_BINDIR?.trim()
  if (configured) return configured

  const result = spawnSync('pg_config', ['--bindir'], { encoding: 'utf8' })
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : null
}

describe('controlled mutation release-control schema', () => {
  const schema = readFileSync(join(repoRoot, 'prisma/schema.prisma'), 'utf8')
  const migration = readFileSync(migrationPath, 'utf8')
  const dependencyBindingMigration = readFileSync(dependencyBindingMigrationPath, 'utf8')
  const fieldCitationIntegrityMigration = readFileSync(fieldCitationIntegrityMigrationPath, 'utf8')
  const fieldCitationIntegrityV3Migration = readFileSync(fieldCitationIntegrityV3MigrationPath, 'utf8')

  it('models one UUID database lineage and the complete append-only receipt', () => {
    const identity = modelBlock(schema, 'DatabaseIdentity')
    assert.match(identity, /key\s+String\s+@id/)
    assert.match(identity, /identityUuid\s+String\s+@unique @db\.Uuid/)
    assert.match(identity, /createdAt\s+DateTime\s+@default\(now\(\)\)/)
    assert.match(identity, /mutationAudits\s+ControlledMutationAudit\[\]/)

    const audit = modelBlock(schema, 'ControlledMutationAudit')
    for (const field of [
      'operationKey',
      'contractScope',
      'contractSha256',
      'planSha256',
      'beforeSnapshotSha256',
      'afterSnapshotSha256',
      'dependencyStateSha256',
      'targetFingerprintSha256',
      'backupSha256',
      'backupMetadataSha256',
      'restoreReceiptSha256',
      'operatorId',
      'authorizationRef',
      'databaseRole',
    ]) {
      assert.match(audit, new RegExp(`${field}\\s+String`))
    }
    assert.match(audit, /databaseIdentityUuid\s+String\s+@db\.Uuid/)
    assert.match(audit, /mutationSummary\s+Json/)
    assert.match(audit, /recordedAt\s+DateTime\s+@default\(now\(\)\)/)
    assert.match(audit, /references: \[identityUuid\], onDelete: Restrict, onUpdate: Restrict/)
    assert.match(audit, /@@index\(\[contractScope\]\)/)
    assert.match(audit, /@@index\(\[recordedAt\]\)/)
  })

  it('installs fail-closed SQL constraints, immutable triggers, ACLs, and target locking', () => {
    assert.match(migration, /^BEGIN;$/m)
    assert.match(migration, /^COMMIT;$/m)
    assert.match(migration, /LOCK TABLE[\s\S]*"FieldCitation"[\s\S]*IN SHARE ROW EXCLUSIVE MODE/)
    assert.match(migration, /CHECK \("key" = 'primary'\)/)
    assert.match(migration, /VALUES \('primary', gen_random_uuid\(\)\)/)
    assert.match(migration, /ControlledMutationAudit_sha256_check/)
    assert.equal((migration.match(/~ '\^\[0-9a-f\]\{64\}\$'/g) ?? []).length, 8)
    assert.match(dependencyBindingMigration, /ADD COLUMN "dependencyStateSha256" TEXT NOT NULL/)
    assert.match(dependencyBindingMigration, /ControlledMutationAudit_dependencyStateSha256_check/)
    assert.match(dependencyBindingMigration, /BTRIM\(NEW\."databaseRole"\) IS DISTINCT FROM current_user::text/)
    assert.match(dependencyBindingMigration, /ControlledMutationAudit_bind_database_role/)
    assert.match(dependencyBindingMigration, /NEW\."operatorId" ~ '\[\[:cntrl:\]\]'/)
    assert.match(dependencyBindingMigration, /NEW\."authorizationRef" ~ '\[\[:cntrl:\]\]'/)
    assert.match(migration, /NULLIF\(BTRIM\("operatorId"\), ''\) IS NOT NULL/)
    assert.match(migration, /NULLIF\(BTRIM\("authorizationRef"\), ''\) IS NOT NULL/)
    assert.match(dependencyBindingMigration, /LOWER\(BTRIM\("databaseRole"\)\) NOT LIKE '%mcp%'/)
    assert.match(migration, /ON DELETE RESTRICT ON UPDATE RESTRICT/)
    assert.equal((migration.match(/reject_update_delete/g) ?? []).length, 2)
    assert.equal((migration.match(/reject_truncate/g) ?? []).length, 2)
    assert.match(migration, /REVOKE ALL PRIVILEGES ON TABLE "DatabaseIdentity" FROM PUBLIC/)
    assert.match(migration, /REVOKE ALL PRIVILEGES ON TABLE "ControlledMutationAudit" FROM PUBLIC/)
    assert.doesNotMatch(migration, /GRANT\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE)/i)

    assert.match(migration, /FieldCitation cannot target forbidden Thesis:matsvinnloven-2025/)
    assert.match(migration, /document\."documentType" = 'quarantined_synthetic'/)
    assert.match(migration, /\{identityQuarantine,status\}.*blocked_synthetic_identity/)
    for (const target of ['Thesis', 'Document', 'SourceDoc', 'Report']) {
      assert.match(migration, new RegExp(`FieldCitation target ${target}:% does not exist`))
    }
    assert.equal((migration.match(/FOR KEY SHARE/g) ?? []).length, 4)
    assert.match(migration, /BEFORE INSERT OR UPDATE OF "entityType", "entityId" ON "FieldCitation"/)
    assert.match(migration, /Other historical entityType values remain intentionally compatible/)
  })

  it('adds FieldCitation integrity v2 without rewriting historical entity types', () => {
    assert.match(fieldCitationIntegrityMigration, /^BEGIN;$/m)
    assert.match(fieldCitationIntegrityMigration, /^COMMIT;$/m)
    assert.match(
      fieldCitationIntegrityMigration,
      /REGEXP_REPLACE\("entityType", '\^\[\[:space:\]\]\+\|\[\[:space:\]\]\+\$', '', 'g'\)/,
    )
    for (const [normalized, canonical] of [
      ['thesis', 'Thesis'], ['document', 'Document'], ['sourcedoc', 'SourceDoc'], ['report', 'Report'],
    ]) {
      assert.match(fieldCitationIntegrityMigration, new RegExp(`WHEN '${normalized}' THEN '${canonical}'`))
    }
    assert.match(fieldCitationIntegrityMigration, /values outside these four canonical[\s\S]*retain their historical behavior/)
    assert.match(fieldCitationIntegrityMigration, /cannot target forbidden Thesis:matsvinnloven-2025/)
    assert.match(fieldCitationIntegrityMigration, /prevent_field_citation_target_orphan/)
    assert.match(fieldCitationIntegrityMigration, /Document_prevent_cited_identity_quarantine/)
    assert.match(fieldCitationIntegrityMigration, /BEFORE UPDATE OF "documentType", "metadata" ON "Document"/)
    for (const target of ['Thesis', 'Document', 'SourceDoc', 'Report']) {
      assert.match(
        fieldCitationIntegrityMigration,
        new RegExp(`CREATE TRIGGER "${target}_prevent_field_citation_orphan"[\\s\\S]*ON "${target}"`),
      )
    }
    assert.equal(
      (fieldCitationIntegrityMigration.match(/BEFORE DELETE OR UPDATE OF "id"/g) ?? []).length,
      4,
    )
    assert.equal((fieldCitationIntegrityMigration.match(/BEFORE TRUNCATE ON/g) ?? []).length, 4)
  })

  it('adds a forward-only Document lock repair while preserving the v2 target contract', () => {
    assert.match(fieldCitationIntegrityV3Migration, /^BEGIN;$/m)
    assert.match(fieldCitationIntegrityV3Migration, /^COMMIT;$/m)
    assert.match(
      fieldCitationIntegrityV3Migration,
      /LOCK TABLE[\s\S]*"FieldCitation", "Document"[\s\S]*IN SHARE ROW EXCLUSIVE MODE/,
    )
    assert.match(
      fieldCitationIntegrityV3Migration,
      /FieldCitation integrity v3 preflight: row % targets a quarantined synthetic Document/,
    )
    assert.match(
      fieldCitationIntegrityV3Migration,
      /CREATE OR REPLACE FUNCTION public\.enforce_field_citation_target_integrity\(\)/,
    )
    const documentBranch = fieldCitationIntegrityV3Migration.match(
      /ELSIF canonical_type = 'Document'[\s\S]*?(?=ELSIF canonical_type = 'SourceDoc')/,
    )?.[0]
    assert.ok(documentBranch)
    assert.match(documentBranch, /FROM public\."Document"[\s\S]*?FOR SHARE;/)
    assert.doesNotMatch(documentBranch, /FOR KEY SHARE;/)
    assert.equal((fieldCitationIntegrityV3Migration.match(/FOR KEY SHARE;/g) ?? []).length, 3)
    for (const target of ['Thesis', 'Document', 'SourceDoc', 'Report']) {
      assert.match(
        fieldCitationIntegrityV3Migration,
        new RegExp(`FieldCitation target ${target}:% does not exist`),
      )
    }
    assert.match(fieldCitationIntegrityV3Migration, /cannot target forbidden Thesis:matsvinnloven-2025/)
    assert.match(
      fieldCitationIntegrityV3Migration,
      /values outside these four[\s\S]*retain their historical behavior/,
    )
    assert.match(
      fieldCitationIntegrityV3Migration,
      /REVOKE ALL ON FUNCTION public\.enforce_field_citation_target_integrity\(\) FROM PUBLIC/,
    )
    assert.doesNotMatch(fieldCitationIntegrityV3Migration, /DROP TRIGGER/)
  })

  it('enforces the controls in disposable PostgreSQL', { timeout: 45_000 }, async (t) => {
    const bindir = postgresBindir()
    if (!bindir) {
      t.skip('pg_config is unavailable; set POSTGRES_BINDIR to run the disposable release-control regression')
      return
    }

    const binaries = Object.fromEntries(
      ['initdb', 'pg_ctl', 'createdb', 'psql'].map(name => [name, join(bindir, name)]),
    ) as Record<string, string>
    if (Object.values(binaries).some(binary => !existsSync(binary))) {
      t.skip('PostgreSQL server binaries are unavailable')
      return
    }

    const tempRoot = mkdtempSync(join(tmpdir(), 'foodsystems-release-controls-'))
    const dataDir = join(tempRoot, 'data')
    const socketDir = mkdtempSync('/tmp/foodsystems-rc-socket-')
    const database = 'foodsystems_release_controls_test'
    // Settes av startEphemeralPostgres: porten som gjelder er den serveren
    // faktisk klarte å binde. Lukkingene under leser den ved kalltidspunkt.
    let port = 0
    const processEnv: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${bindir}:${process.env.PATH ?? ''}`,
    }
    let started = false

    const run = (binary: string, args: string[]) => spawnSync(binary, args, {
      cwd: repoRoot,
      encoding: 'utf8',
      env: processEnv,
    })
    const psql = (statement: string) => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-X', '-v', 'ON_ERROR_STOP=1', '-At', '-c', statement,
    ])
    const applyMigration = () => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-X', '-v', 'ON_ERROR_STOP=1', '-f', migrationPath,
    ])
    const applyDependencyBindingMigration = () => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-X', '-v', 'ON_ERROR_STOP=1', '-f', dependencyBindingMigrationPath,
    ])
    const applyFieldCitationIntegrityMigration = () => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-X', '-v', 'ON_ERROR_STOP=1', '-f', fieldCitationIntegrityMigrationPath,
    ])
    const applyFieldCitationIntegrityV3Migration = () => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-X', '-v', 'ON_ERROR_STOP=1', '-f', fieldCitationIntegrityV3MigrationPath,
    ])
    const expectFailure = (statement: string, pattern: RegExp) => {
      const result = psql(statement)
      assert.notEqual(result.status, 0, result.stdout)
      assert.match(result.stderr, pattern)
    }
    const connectConcurrentClient = async (applicationName: string) => {
      const client = new Client({
        host: '127.0.0.1',
        port,
        user: 'postgres',
        database,
        connectionTimeoutMillis: 5_000,
      })
      await client.connect()
      await client.query(
        `SELECT set_config('application_name', $1, false)`,
        [applicationName],
      )
      await client.query(`SET lock_timeout = '5s'`)
      return client
    }
    const waitForClientLock = async (
      observer: Client,
      applicationName: string,
      isSettled: () => boolean,
    ) => {
      const deadline = Date.now() + 5_000
      while (Date.now() < deadline) {
        const activity = await observer.query<{ wait_event_type: string | null }>(`
          SELECT wait_event_type
          FROM pg_stat_activity
          WHERE application_name = $1
        `, [applicationName])
        if (activity.rows.some((row) => row.wait_event_type === 'Lock')) return
        if (isSettled()) {
          assert.fail(`${applicationName} completed before entering a row-lock wait`)
        }
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      assert.fail(`${applicationName} did not enter a row-lock wait before timeout`)
    }

    try {
      assert.equal(run(binaries.initdb!, ['-A', 'trust', '-U', 'postgres', '-D', dataDir]).status, 0)
      port = await startEphemeralPostgres({
        run,
        pgCtl: binaries.pg_ctl!,
        dataDir,
        socketDir,
        logPathFor: attempt => join(tempRoot, `postgres-attempt-${attempt}.log`),
      })
      started = true
      const created = run(binaries.createdb!, [
        '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', database,
      ])
      assert.equal(created.status, 0, created.stderr)

      const setup = psql(`
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
        CREATE TABLE "Thesis" ("id" TEXT PRIMARY KEY);
        CREATE TABLE "Document" (
          "id" TEXT PRIMARY KEY,
          "documentType" TEXT,
          "metadata" JSONB
        );
        CREATE TABLE "SourceDoc" ("id" TEXT PRIMARY KEY);
        CREATE TABLE "Report" ("id" TEXT PRIMARY KEY);
        CREATE TABLE "FieldCitation" (
          "id" TEXT PRIMARY KEY,
          "citationId" TEXT NOT NULL DEFAULT 'citation',
          "entityType" TEXT NOT NULL,
          "entityId" TEXT NOT NULL,
          "fieldPath" TEXT
        );
      `)
      assert.equal(setup.status, 0, setup.stderr)

      assert.equal(psql(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('missing-preflight', 'Report', 'missing-report')
      `).status, 0)
      const missingPreflight = applyMigration()
      assert.notEqual(missingPreflight.status, 0)
      assert.match(missingPreflight.stderr, /has a missing Thesis\/Document\/SourceDoc\/Report target/)
      assert.equal(psql('SELECT to_regclass(\'public."DatabaseIdentity"\') IS NULL').stdout.trim(), 't')

      assert.equal(psql(`
        DELETE FROM "FieldCitation";
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('synthetic-preflight', 'Thesis', 'matsvinnloven-2025')
      `).status, 0)
      const syntheticPreflight = applyMigration()
      assert.notEqual(syntheticPreflight.status, 0)
      assert.match(syntheticPreflight.stderr, /targets forbidden Thesis:matsvinnloven-2025/)

      assert.equal(psql('DELETE FROM "FieldCitation"').status, 0)
      const applied = applyMigration()
      assert.equal(applied.status, 0, applied.stderr)
      const dependencyBindingApplied = applyDependencyBindingMigration()
      assert.equal(dependencyBindingApplied.status, 0, dependencyBindingApplied.stderr)
      assert.equal(psql(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('preflight-case-alias', ' thesis ', 'matsvinnloven-2025')
      `).status, 0)
      const aliasPreflight = applyFieldCitationIntegrityMigration()
      assert.notEqual(aliasPreflight.status, 0)
      assert.match(aliasPreflight.stderr, /non-canonical case\/whitespace target type/)
      assert.equal(psql(`DELETE FROM "FieldCitation" WHERE "id" = 'preflight-case-alias'`).status, 0)
      assert.equal(psql(`
        INSERT INTO "Thesis" ("id") VALUES (' spaced-target ');
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('preflight-id-alias', 'Thesis', ' spaced-target ')
      `).status, 0)
      const idPreflight = applyFieldCitationIntegrityMigration()
      assert.notEqual(idPreflight.status, 0)
      assert.match(idPreflight.stderr, /non-canonical target id/)
      assert.equal(psql(`
        DELETE FROM "FieldCitation" WHERE "id" = 'preflight-id-alias';
        DELETE FROM "Thesis" WHERE "id" = ' spaced-target '
      `).status, 0)
      const fieldCitationIntegrityApplied = applyFieldCitationIntegrityMigration()
      assert.equal(fieldCitationIntegrityApplied.status, 0, fieldCitationIntegrityApplied.stderr)
      assert.equal(psql(`
        INSERT INTO "Document" ("id", "documentType", "metadata")
        VALUES ('v3-preflight-invalid', 'report', '{}'::jsonb);
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('v3-preflight-invalid-ref', 'Document', 'v3-preflight-invalid');
        ALTER TABLE "Document"
          DISABLE TRIGGER "Document_prevent_cited_identity_quarantine";
        UPDATE "Document"
        SET "documentType" = 'quarantined_synthetic'
        WHERE "id" = 'v3-preflight-invalid';
        ALTER TABLE "Document"
          ENABLE TRIGGER "Document_prevent_cited_identity_quarantine";
      `).status, 0)
      const fieldCitationIntegrityV3Preflight = applyFieldCitationIntegrityV3Migration()
      assert.notEqual(fieldCitationIntegrityV3Preflight.status, 0)
      assert.match(
        fieldCitationIntegrityV3Preflight.stderr,
        /v3 preflight: row v3-preflight-invalid-ref targets a quarantined synthetic Document/,
      )
      assert.equal(psql(`
        DELETE FROM "FieldCitation" WHERE "id" = 'v3-preflight-invalid-ref';
        DELETE FROM "Document" WHERE "id" = 'v3-preflight-invalid';
      `).status, 0)
      const fieldCitationIntegrityV3Applied = applyFieldCitationIntegrityV3Migration()
      assert.equal(fieldCitationIntegrityV3Applied.status, 0, fieldCitationIntegrityV3Applied.stderr)
      const identityRow = psql(`
        SELECT count(*)::text || '|' || string_agg("key", '') || '|' || string_agg("identityUuid"::text, '')
        FROM "DatabaseIdentity"
      `)
      assert.equal(identityRow.status, 0, identityRow.stderr)
      assert.match(
        identityRow.stdout,
        /^1\|primary\|[0-9a-f-]{36}\s*$/,
      )

      expectFailure(
        `INSERT INTO "DatabaseIdentity" ("key", "identityUuid") VALUES ('secondary', gen_random_uuid())`,
        /DatabaseIdentity_primary_key_check/,
      )
      expectFailure(`UPDATE "DatabaseIdentity" SET "createdAt" = now()`, /DatabaseIdentity is immutable: UPDATE/)
      expectFailure(`DELETE FROM "DatabaseIdentity"`, /DatabaseIdentity is immutable: DELETE/)
      expectFailure(
        `TRUNCATE "DatabaseIdentity" CASCADE`,
        /(?:DatabaseIdentity|ControlledMutationAudit) is immutable: TRUNCATE/,
      )

      const validAudit = psql(`
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256", "databaseIdentityUuid",
          "targetFingerprintSha256", "backupSha256", "backupMetadataSha256",
          "restoreReceiptSha256", "operatorId", "authorizationRef", "databaseRole",
          "mutationSummary"
        )
        SELECT
          'audit-1', 'operation-1', 'matsvinnloven-identity', repeat('a', 64), repeat('b', 64),
          repeat('c', 64), repeat('d', 64), repeat('2', 64), "identityUuid", repeat('e', 64),
          repeat('f', 64), repeat('0', 64), repeat('1', 64), 'operator@example.test',
          'user-authorization-1', current_user, '{"rows":1}'::jsonb
        FROM "DatabaseIdentity"
      `)
      assert.equal(validAudit.status, 0, validAudit.stderr)
      const rolledBackAudit = psql(`
        BEGIN;
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256",
          "databaseIdentityUuid", "targetFingerprintSha256", "backupSha256",
          "backupMetadataSha256", "restoreReceiptSha256", "operatorId",
          "authorizationRef", "databaseRole", "mutationSummary"
        )
        SELECT
          'audit-rollback', 'operation-rollback', 'matsvinnloven-identity', repeat('a',64),
          repeat('b',64), repeat('c',64), repeat('d',64), repeat('2',64), "identityUuid",
          repeat('e',64), repeat('f',64), repeat('0',64), repeat('1',64), 'operator',
          'authorization', current_user, '{}'::jsonb
        FROM "DatabaseIdentity";
        SELECT 1 / 0;
        COMMIT;
      `)
      assert.notEqual(rolledBackAudit.status, 0)
      assert.match(rolledBackAudit.stderr, /division by zero/)
      assert.equal(
        psql(`SELECT count(*) FROM "ControlledMutationAudit" WHERE "operationKey" = 'operation-rollback'`).stdout.trim(),
        '0',
      )
      expectFailure(`UPDATE "ControlledMutationAudit" SET "operatorId" = 'other'`, /ControlledMutationAudit is immutable: UPDATE/)
      expectFailure(`DELETE FROM "ControlledMutationAudit"`, /ControlledMutationAudit is immutable: DELETE/)
      expectFailure(`TRUNCATE "ControlledMutationAudit"`, /ControlledMutationAudit is immutable: TRUNCATE/)
      expectFailure(`
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256", "databaseIdentityUuid",
          "targetFingerprintSha256", "backupSha256", "backupMetadataSha256",
          "restoreReceiptSha256", "operatorId", "authorizationRef", "databaseRole", "mutationSummary"
        ) SELECT 'bad-hash', 'bad-hash', 'scope', 'ABC', repeat('b',64), repeat('c',64),
          repeat('d',64), repeat('2',64), "identityUuid", repeat('e',64), repeat('f',64), repeat('0',64),
          repeat('1',64), 'operator', 'authorization', current_user, '{}'::jsonb
        FROM "DatabaseIdentity"
      `, /ControlledMutationAudit_sha256_check/)
      expectFailure(`
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256", "databaseIdentityUuid",
          "targetFingerprintSha256", "backupSha256", "backupMetadataSha256",
          "restoreReceiptSha256", "operatorId", "authorizationRef", "databaseRole", "mutationSummary"
        ) SELECT 'blank-operator', 'blank-operator', 'scope', repeat('a',64), repeat('b',64),
          repeat('c',64), repeat('d',64), repeat('2',64), "identityUuid", repeat('e',64), repeat('f',64),
          repeat('0',64), repeat('1',64), ' ', 'authorization', current_user, '{}'::jsonb
        FROM "DatabaseIdentity"
      `, /ControlledMutationAudit\.operatorId must be trimmed|ControlledMutationAudit_operator_authorization_check/)
      expectFailure(`
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256",
          "databaseIdentityUuid", "targetFingerprintSha256", "backupSha256",
          "backupMetadataSha256", "restoreReceiptSha256", "operatorId",
          "authorizationRef", "databaseRole", "mutationSummary"
        ) SELECT 'mcp-role', 'mcp-role', 'scope', repeat('a',64), repeat('b',64),
          repeat('c',64), repeat('d',64), repeat('2',64), "identityUuid", repeat('e',64),
          repeat('f',64), repeat('0',64), repeat('1',64), 'operator', 'authorization',
          'foodsystems_mcp_ro', '{}'::jsonb
        FROM "DatabaseIdentity"
      `, /ControlledMutationAudit\.databaseRole must be trimmed and equal current_user/)
      expectFailure(`
        INSERT INTO "ControlledMutationAudit" (
          "id", "operationKey", "contractScope", "contractSha256", "planSha256",
          "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256",
          "databaseIdentityUuid", "targetFingerprintSha256", "backupSha256",
          "backupMetadataSha256", "restoreReceiptSha256", "operatorId",
          "authorizationRef", "databaseRole", "mutationSummary"
        ) SELECT 'control-auth', 'control-auth', 'scope', repeat('a',64), repeat('b',64),
          repeat('c',64), repeat('d',64), repeat('2',64), "identityUuid", repeat('e',64),
          repeat('f',64), repeat('0',64), repeat('1',64), 'operator', E'authorization\nref',
          current_user, '{}'::jsonb
        FROM "DatabaseIdentity"
      `, /ControlledMutationAudit\.authorizationRef must be trimmed text without control characters/)

      assert.equal(psql(`
        INSERT INTO "Thesis" VALUES ('good-thesis');
        INSERT INTO "Document" VALUES ('good-document', 'report', '{}'::jsonb);
        INSERT INTO "Document" VALUES ('type-quarantine', 'quarantined_synthetic', '{}'::jsonb);
        INSERT INTO "Document" VALUES (
          'metadata-quarantine', 'report',
          '{"identityQuarantine":{"status":"blocked_synthetic_identity"}}'::jsonb
        );
        INSERT INTO "SourceDoc" VALUES ('good-source');
        INSERT INTO "Report" VALUES ('good-report');
      `).status, 0)

      for (const [id, entityType, entityId] of [
        ['thesis-ok', 'Thesis', 'good-thesis'],
        ['document-ok', 'Document', 'good-document'],
        ['source-ok', 'SourceDoc', 'good-source'],
        ['report-ok', 'Report', 'good-report'],
        ['legacy-ok', 'Insight', 'missing-but-historical'],
      ]) {
        const inserted = psql(`
          INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
          VALUES ('${id}', '${entityType}', '${entityId}')
        `)
        assert.equal(inserted.status, 0, inserted.stderr)
      }

      for (const [id, entityType, entityId] of [
        ['case-thesis', 'thesis', 'good-thesis'],
        ['space-thesis-forbidden', ' Thesis ', 'matsvinnloven-2025'],
        ['case-document', 'DOCUMENT', 'good-document'],
        ['space-source', ' SourceDoc ', 'good-source'],
        ['case-report', 'rEpOrT', 'good-report'],
      ]) {
        expectFailure(`
          INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
          VALUES ('${id}', '${entityType}', '${entityId}')
        `, /entityType must use canonical value/)
      }
      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('space-target-id', 'Thesis', ' good-thesis ')
      `, /canonical target entityId must be trimmed non-control text/)

      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('synthetic', 'Thesis', 'matsvinnloven-2025')
      `, /cannot target forbidden Thesis:matsvinnloven-2025/)
      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('missing-thesis', 'Thesis', 'missing')
      `, /target Thesis:missing does not exist/)
      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('missing-document', 'Document', 'missing')
      `, /target Document:missing does not exist/)
      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('type-quarantine-ref', 'Document', 'type-quarantine')
      `, /cannot target quarantined synthetic Document:type-quarantine/)
      expectFailure(`
        INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
        VALUES ('metadata-quarantine-ref', 'Document', 'metadata-quarantine')
      `, /cannot target quarantined synthetic Document:metadata-quarantine/)
      expectFailure(`
        UPDATE "FieldCitation"
        SET "entityType" = 'Report', "entityId" = 'missing'
        WHERE "id" = 'legacy-ok'
      `, /target Report:missing does not exist/)
      assert.equal(
        psql(`SELECT "entityType" || ':' || "entityId" FROM "FieldCitation" WHERE "id" = 'legacy-ok'`).stdout.trim(),
        'Insight:missing-but-historical',
      )

      for (const [targetTable, targetId] of [
        ['Thesis', 'good-thesis'],
        ['Document', 'good-document'],
        ['SourceDoc', 'good-source'],
        ['Report', 'good-report'],
      ]) {
        expectFailure(
          `DELETE FROM "${targetTable}" WHERE "id" = '${targetId}'`,
          new RegExp(`${targetTable}:${targetId} cannot be DELETE`),
        )
        expectFailure(
          `UPDATE "${targetTable}" SET "id" = '${targetId}-changed' WHERE "id" = '${targetId}'`,
          new RegExp(`${targetTable}:${targetId} cannot be UPDATE`),
        )
        expectFailure(
          `TRUNCATE "${targetTable}"`,
          new RegExp(`${targetTable} cannot be truncated`),
        )
      }
      expectFailure(
        `UPDATE "Document" SET "documentType" = 'quarantined_synthetic' WHERE "id" = 'good-document'`,
        /Document:good-document cannot enter identity quarantine/,
      )
      expectFailure(
        `UPDATE "Document" SET "metadata" = '{"identityQuarantine":{"status":"blocked_synthetic_identity"}}'::jsonb WHERE "id" = 'good-document'`,
        /Document:good-document cannot enter identity quarantine/,
      )

      const observer = await connectConcurrentClient('field-citation-race-observer')
      const citationWriter = await connectConcurrentClient('field-citation-race-citation')
      const quarantineWriter = await connectConcurrentClient('field-citation-race-quarantine')
      try {
        await observer.query(`
          INSERT INTO "Document" ("id", "documentType", "metadata")
          VALUES
            ('race-citation-first', 'report', '{}'::jsonb),
            ('race-quarantine-first', 'report', '{}'::jsonb)
        `)

        // Citation wins the row lock first. The quarantine UPDATE must wait,
        // then re-check FieldCitation and fail after the citation commits.
        await citationWriter.query('BEGIN')
        await citationWriter.query(`
          INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
          VALUES ('race-citation-first-ref', 'Document', 'race-citation-first')
        `)
        await quarantineWriter.query('BEGIN')
        let quarantineAttemptSettled = false
        const quarantineAttempt = quarantineWriter.query(`
          UPDATE "Document"
          SET "documentType" = 'quarantined_synthetic'
          WHERE "id" = 'race-citation-first'
        `).then(
          () => ({ ok: true as const }),
          (error: Error) => ({ ok: false as const, error }),
        ).finally(() => {
          quarantineAttemptSettled = true
        })

        await waitForClientLock(
          observer,
          'field-citation-race-quarantine',
          () => quarantineAttemptSettled,
        )
        await citationWriter.query('COMMIT')
        const quarantineOutcome = await quarantineAttempt
        assert.equal(quarantineOutcome.ok, false)
        if (!quarantineOutcome.ok) {
          assert.match(
            quarantineOutcome.error.message,
            /Document:race-citation-first cannot enter identity quarantine/,
          )
        }
        await quarantineWriter.query('ROLLBACK')
        assert.equal(
          (await observer.query(`
            SELECT count(*)::int AS count
            FROM "FieldCitation"
            WHERE "id" = 'race-citation-first-ref'
          `)).rows[0]?.count,
          1,
        )
        assert.equal(
          (await observer.query(`
            SELECT "documentType"
            FROM "Document"
            WHERE "id" = 'race-citation-first'
          `)).rows[0]?.documentType,
          'report',
        )

        // Quarantine wins first. The citation INSERT must wait for the same
        // Document row, then observe quarantine and fail after it commits.
        await quarantineWriter.query('BEGIN')
        await quarantineWriter.query(`
          UPDATE "Document"
          SET "metadata" = '{"identityQuarantine":{"status":"blocked_synthetic_identity"}}'::jsonb
          WHERE "id" = 'race-quarantine-first'
        `)
        await citationWriter.query('BEGIN')
        let citationAttemptSettled = false
        const citationAttempt = citationWriter.query(`
          INSERT INTO "FieldCitation" ("id", "entityType", "entityId")
          VALUES ('race-quarantine-first-ref', 'Document', 'race-quarantine-first')
        `).then(
          () => ({ ok: true as const }),
          (error: Error) => ({ ok: false as const, error }),
        ).finally(() => {
          citationAttemptSettled = true
        })

        await waitForClientLock(
          observer,
          'field-citation-race-citation',
          () => citationAttemptSettled,
        )
        await quarantineWriter.query('COMMIT')
        const citationOutcome = await citationAttempt
        assert.equal(citationOutcome.ok, false)
        if (!citationOutcome.ok) {
          assert.match(
            citationOutcome.error.message,
            /cannot target quarantined synthetic Document:race-quarantine-first/,
          )
        }
        await citationWriter.query('ROLLBACK')
        assert.equal(
          (await observer.query(`
            SELECT count(*)::int AS count
            FROM "FieldCitation"
            WHERE "id" = 'race-quarantine-first-ref'
          `)).rows[0]?.count,
          0,
        )
        assert.equal(
          (await observer.query(`
            SELECT "metadata" #>> '{identityQuarantine,status}' AS quarantine_status
            FROM "Document"
            WHERE "id" = 'race-quarantine-first'
          `)).rows[0]?.quarantine_status,
          'blocked_synthetic_identity',
        )
      } finally {
        await citationWriter.query('ROLLBACK').catch(() => undefined)
        await quarantineWriter.query('ROLLBACK').catch(() => undefined)
        await Promise.all([
          observer.end(),
          citationWriter.end(),
          quarantineWriter.end(),
        ])
      }

      const mcpAclBlock = migration.match(/DO \$mcp_acl\$[\s\S]*?\$mcp_acl\$;/)?.[0]
      assert.ok(mcpAclBlock)
      assert.equal(psql(`
        CREATE ROLE foodsystems_mcp_ro NOLOGIN;
        GRANT ALL PRIVILEGES ON TABLE "DatabaseIdentity" TO foodsystems_mcp_ro;
        GRANT ALL PRIVILEGES ON TABLE "ControlledMutationAudit" TO foodsystems_mcp_ro;
      `).status, 0)
      assert.equal(
        psql(`
          SELECT
            has_table_privilege('foodsystems_mcp_ro', 'public."DatabaseIdentity"', 'INSERT'),
            has_table_privilege('foodsystems_mcp_ro', 'public."ControlledMutationAudit"', 'INSERT')
        `).stdout.trim(),
        't|t',
      )
      const mcpAclApplied = psql(mcpAclBlock)
      assert.equal(mcpAclApplied.status, 0, mcpAclApplied.stderr)
      assert.equal(
        psql(`
          SELECT
            has_table_privilege('foodsystems_mcp_ro', 'public."DatabaseIdentity"', 'SELECT'),
            has_table_privilege('foodsystems_mcp_ro', 'public."DatabaseIdentity"', 'INSERT'),
            has_table_privilege('foodsystems_mcp_ro', 'public."ControlledMutationAudit"', 'SELECT'),
            has_table_privilege('foodsystems_mcp_ro', 'public."ControlledMutationAudit"', 'INSERT')
        `).stdout.trim(),
        'f|f|f|f',
      )
    } finally {
      if (started) {
        run(binaries.pg_ctl!, ['-D', dataDir, '-m', 'immediate', '-w', 'stop'])
      }
      rmSync(tempRoot, { recursive: true, force: true })
      rmSync(socketDir, { recursive: true, force: true })
    }
  })
})
