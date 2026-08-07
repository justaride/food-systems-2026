import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const createBackup = resolve('scripts/create-database-backup.sh')
const verifyBackup = resolve('scripts/verify-database-backup.sh')
const restoreBackup = resolve('scripts/restore-database-backup-drill.sh')
const archiveBody = 'fake PostgreSQL custom archive\n'
const archiveDigest = createHash('sha256').update(archiveBody).digest('hex')
const sourceUrl = 'postgresql://backup_user:p%40ss%3Aword%5Ctail@db.example:6543/foodsystems?schema=public&sslmode=verify-full'
const adminUrl = 'postgresql://restore_user:r%40ss%3Aword%5Ctail@restore.example:7654/postgres?schema=public&sslmode=require'
const databaseIdentityUuid = '11111111-2222-4333-8444-555555555555'
const migrationChecksum = 'a'.repeat(64)
const fakeCoreCounts = {
  ControlledMutationAudit: 0,
  DatabaseIdentity: 1,
  Document: 1539,
  EvidenceAppraisal: 0,
  FieldCitation: 244521,
  LibraryAnalysisRecord: 1570,
  Report: 139,
  SourceCitation: 2703,
  SourceDoc: 199,
  Thesis: 79,
}
const fakeDatabaseSnapshot = JSON.stringify({
  sourceDatabase: 'foodsystems',
  serverVersion: '16.4',
  databaseIdentityUuid,
  migrationLedger: [
    {
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      checksum: migrationChecksum,
      finishedAt: '2026-07-20T10:00:01.000Z',
      migrationName: '20260720_controlled_mutation_release_controls',
      logs: null,
      rolledBackAt: null,
      startedAt: '2026-07-20T10:00:00.000Z',
      appliedStepsCount: 1,
    },
  ],
  coreCounts: fakeCoreCounts,
})

function makeExecutable(path: string, source: string): void {
  writeFileSync(path, source)
  chmodSync(path, 0o755)
}

function fakeCatalog(): string {
  return [
    '1; 0 0 TABLE public Document owner',
    '2; 0 0 TABLE public SourceCitation owner',
    '3; 0 0 TABLE public EvidenceAppraisal owner',
    '4; 0 0 TABLE public _prisma_migrations owner',
    '5; 0 0 TABLE public DatabaseIdentity owner',
    '6; 0 0 TABLE public ControlledMutationAudit owner',
    '',
  ].join('\n')
}

interface FakeRuntime {
  root: string
  bin: string
  calls: string
  hashCalls: string
  moveCount: string
  signalMarker: string
}

function setupFakeRuntime(interruptFinalMove = false): FakeRuntime {
  const root = mkdtempSync(join(tmpdir(), 'foodsystems-backup-security-'))
  const bin = join(root, 'bin')
  const calls = join(root, 'calls.log')
  const hashCalls = join(root, 'hash-calls.log')
  const moveCount = join(root, 'move-count')
  const signalMarker = join(root, 'restore-receipt-signal-fired')
  mkdirSync(bin)

  makeExecutable(join(bin, 'sha256sum'), '#!/bin/sh\nexit 64\n')
  makeExecutable(join(bin, 'openssl'), `#!/bin/sh
printf '%s\\n' "openssl-fallback" >> "$FAKE_HASH_CALLS"
printf 'SHA2-256(%s)= %s\\n' "$3" "$FAKE_ARCHIVE_DIGEST"
`)
  makeExecutable(join(bin, 'pg_dump'), `#!/bin/sh
output=''
for argument do
  case "$argument" in
    --file=*) output=\${argument#--file=} ;;
  esac
done
[ -n "$output" ] || exit 70
case "$*" in
  *p@ss*|*word*tail*|*postgresql://*) exit 91 ;;
esac
mode=$(stat -c %a "$PGPASSFILE" 2>/dev/null || stat -f %Lp "$PGPASSFILE")
pass_match=false
grep -Fqx "$EXPECTED_PGPASS" "$PGPASSFILE" && pass_match=true
printf 'pg_dump|args=%s|host=%s|port=%s|db=%s|user=%s|ssl=%s|mode=%s|pass=%s\\n' \
  "$*" "$PGHOST" "$PGPORT" "$PGDATABASE" "$PGUSER" "$PGSSLMODE" "$mode" "$pass_match" >> "$FAKE_CALLS"
printf '%s' "$FAKE_ARCHIVE_BODY" > "$output"
`)
  makeExecutable(join(bin, 'pg_restore'), `#!/bin/sh
case " $* " in
  *' --list '*)
    printf '%s' "$FAKE_CATALOG"
    ;;
  *)
    mode=$(stat -c %a "$PGPASSFILE" 2>/dev/null || stat -f %Lp "$PGPASSFILE")
    pass_match=false
    grep -Fqx "$EXPECTED_PGPASS" "$PGPASSFILE" && pass_match=true
    printf 'pg_restore|args=%s|host=%s|port=%s|db=%s|user=%s|ssl=%s|mode=%s|pass=%s\\n' \
      "$*" "$PGHOST" "$PGPORT" "$PGDATABASE" "$PGUSER" "$PGSSLMODE" "$mode" "$pass_match" >> "$FAKE_CALLS"
    ;;
esac
`)
  makeExecutable(join(bin, 'psql'), `#!/bin/sh
query_input=$(cat)
case "$*" in
  *database-backup-snapshot.sql*) response=$FAKE_DATABASE_SNAPSHOT ;;
  *current_database*) response=$PGDATABASE ;;
  *server_version*) response=16.4 ;;
  *database_name=*)
    case "$query_input" in
      *'SELECT NOT EXISTS'*) response=\${FAKE_CONFIRM_ABSENT:-t} ;;
      *) response=f ;;
    esac
    ;;
  *'public."Document"'*) response=1539 ;;
  *'public."SourceCitation"'*) response=2703 ;;
  *'public."FieldCitation"'*) response=244521 ;;
  *'public."Report"'*) response=139 ;;
  *'public."Thesis"'*) response=79 ;;
  *'public."SourceDoc"'*) response=199 ;;
  *'public."LibraryAnalysisRecord"'*) response=1570 ;;
  *EvidenceAppraisal*) response=0 ;;
  *) response='' ;;
esac
mode=$(stat -c %a "$PGPASSFILE" 2>/dev/null || stat -f %Lp "$PGPASSFILE")
pass_match=false
grep -Fqx "$EXPECTED_PGPASS" "$PGPASSFILE" && pass_match=true
printf 'psql|args=%s|host=%s|port=%s|db=%s|user=%s|ssl=%s|mode=%s|pass=%s\\n' \
  "$*" "$PGHOST" "$PGPORT" "$PGDATABASE" "$PGUSER" "$PGSSLMODE" "$mode" "$pass_match" >> "$FAKE_CALLS"
[ -z "$response" ] || printf '%s\\n' "$response"
`)
  makeExecutable(join(bin, 'createdb'), `#!/bin/sh
printf 'createdb|args=%s|host=%s|port=%s|db=%s|user=%s|ssl=%s\\n' \
  "$*" "$PGHOST" "$PGPORT" "$PGDATABASE" "$PGUSER" "$PGSSLMODE" >> "$FAKE_CALLS"
`)
  makeExecutable(join(bin, 'dropdb'), `#!/bin/sh
printf 'dropdb|args=%s|host=%s|port=%s|db=%s|user=%s|ssl=%s\\n' \
  "$*" "$PGHOST" "$PGPORT" "$PGDATABASE" "$PGUSER" "$PGSSLMODE" >> "$FAKE_CALLS"
[ "\${FAKE_DROPDB_FAIL:-0}" != 1 ] || exit 79
`)
  makeExecutable(join(bin, 'rm'), `#!/bin/sh
/bin/rm "$@"
remove_status=$?
case "$*" in
  *foodsystems-restored-snapshot*)
    if [ "\${FAKE_SIGNAL_AFTER_RECEIPT:-0}" = 1 ] && [ ! -e "$FAKE_SIGNAL_MARKER" ]; then
      : > "$FAKE_SIGNAL_MARKER"
      kill -TERM "$PPID"
    fi
    ;;
esac
exit "$remove_status"
`)

  if (interruptFinalMove) {
    makeExecutable(join(bin, 'mv'), `#!/bin/sh
count=0
[ ! -f "$FAKE_MOVE_COUNT" ] || count=$(cat "$FAKE_MOVE_COUNT")
count=$((count + 1))
printf '%s\\n' "$count" > "$FAKE_MOVE_COUNT"
/bin/mv "$@" || exit $?
if [ "$count" -eq 4 ]; then
  kill -TERM "$PPID"
fi
`)
  }

  return { root, bin, calls, hashCalls, moveCount, signalMarker }
}

function runtimeEnv(runtime: FakeRuntime, expectedPgpass: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: `${runtime.bin}:${process.env.PATH}`,
    TMPDIR: runtime.root,
    FAKE_CALLS: runtime.calls,
    FAKE_HASH_CALLS: runtime.hashCalls,
    FAKE_ARCHIVE_BODY: archiveBody,
    FAKE_ARCHIVE_DIGEST: archiveDigest,
    FAKE_CATALOG: fakeCatalog(),
    FAKE_DATABASE_SNAPSHOT: fakeDatabaseSnapshot,
    FAKE_CONFIRM_ABSENT: 't',
    EXPECTED_PGPASS: expectedPgpass,
    FAKE_MOVE_COUNT: runtime.moveCount,
    FAKE_SIGNAL_MARKER: runtime.signalMarker,
  }
}

function createV2Backup(runtime: FakeRuntime, label: string): string {
  const backupDir = join(runtime.root, `${label}-backups`)
  mkdirSync(backupDir, { mode: 0o700 })
  const result = spawnSync(createBackup, [], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...runtimeEnv(runtime, 'db.example:6543:foodsystems:backup_user:p@ss\\:word\\\\tail'),
      DATABASE_URL: sourceUrl,
      DATABASE_BACKUP_DIR: backupDir,
      DATABASE_BACKUP_LABEL: label,
    },
  })
  assert.equal(result.status, 0, result.stderr)
  const dump = readdirSync(backupDir).find(name => name.endsWith('.dump'))
  assert.ok(dump)
  return join(backupDir, dump)
}

describe('database backup runtime security', () => {
  it('uses sha256sum with an openssl fallback and has no legacy hash dependency', () => {
    const createSource = readFileSync(createBackup, 'utf8')
    const verifySource = readFileSync(verifyBackup, 'utf8')

    for (const source of [createSource, verifySource]) {
      assert.match(source, /command -v sha256sum/)
      assert.match(source, /openssl dgst -sha256/)
      assert.doesNotMatch(source, /(?:^|[^0-9])shasum(?:\s|$)/m)
    }

    const runtime = setupFakeRuntime()
    const archive = join(runtime.root, 'portable.dump')
    writeFileSync(archive, archiveBody)
    writeFileSync(`${archive}.sha256`, `${archiveDigest}  portable.dump\n`)
    writeFileSync(
      `${archive}.metadata`,
      `format=postgresql-custom\nbytes=${Buffer.byteLength(archiveBody)}\nsha256=${archiveDigest}\n`,
    )

    const result = spawnSync(verifyBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: runtimeEnv(runtime, ''),
    })

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /PASS/)
    assert.match(result.stderr, /legacy backup accepted for historical restore only/)
    assert.match(readFileSync(runtime.hashCalls, 'utf8'), /openssl-fallback/)

    const strictResult = spawnSync(verifyBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, ''),
        BACKUP_REQUIRE_METADATA_V2: '1',
      },
    })
    assert.notEqual(strictResult.status, 0)
    assert.match(strictResult.stderr, /metadata v2 is required or claimed.*not valid JSON/)
  })

  it('rejects an otherwise valid archive when EvidenceAppraisal is absent', () => {
    const runtime = setupFakeRuntime()
    const archive = join(runtime.root, 'missing-appraisal.dump')
    writeFileSync(archive, archiveBody)
    writeFileSync(`${archive}.sha256`, `${archiveDigest}  missing-appraisal.dump\n`)

    const result = spawnSync(verifyBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, ''),
        FAKE_CATALOG: fakeCatalog().replace(
          '3; 0 0 TABLE public EvidenceAppraisal owner\n',
          '',
        ),
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /required table is missing from archive catalog: public\.EvidenceAppraisal/)
  })

  it('keeps credentials out of argv and publishes a complete hash-bound metadata v2 set', () => {
    const runtime = setupFakeRuntime()
    const backupDir = join(runtime.root, 'backups')
    mkdirSync(backupDir, { mode: 0o700 })
    const expectedPgpass = 'db.example:6543:foodsystems:backup_user:p@ss\\:word\\\\tail'

    const result = spawnSync(createBackup, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, expectedPgpass),
        DATABASE_URL: sourceUrl,
        DATABASE_BACKUP_DIR: backupDir,
        DATABASE_BACKUP_LABEL: 'runtime',
      },
    })

    assert.equal(result.status, 0, result.stderr)
    const calls = readFileSync(runtime.calls, 'utf8')
    assert.doesNotMatch(calls, /postgresql:\/\/|p@ss|word\\tail/)
    assert.match(calls, /pg_dump\|args=.*\|host=db\.example\|port=6543\|db=foodsystems\|user=backup_user\|ssl=verify-full\|mode=600\|pass=true/)
    assert.match(calls, /psql\|args=.*\|host=db\.example\|port=6543\|db=foodsystems\|user=backup_user\|ssl=verify-full\|mode=600\|pass=true/)

    const files = readdirSync(backupDir)
    const dump = files.find((name) => name.endsWith('.dump'))
    assert.ok(dump)
    assert.deepEqual(
      files.sort(),
      [dump, `${dump}.metadata`, `${dump}.metadata.sha256`, `${dump}.sha256`].sort(),
    )
    assert.equal(statSync(join(backupDir, dump)).mode & 0o077, 0)
    const metadataPath = join(backupDir, `${dump}.metadata`)
    const metadataBytes = readFileSync(metadataPath, 'utf8')
    const metadata = JSON.parse(metadataBytes) as {
      format: string
      version: number
      dump: { bytes: number; sha256: string }
      databaseIdentity: { key: string; uuid: string }
      completedPrismaMigrationLedger: { completedCount: number; sha256: string }
      coreCounts: Record<string, number>
      targetDatabaseFingerprint: { canonicalJsonFormat: string; sha256: string }
    }
    assert.equal(metadata.format, 'foodsystems-database-backup-metadata')
    assert.equal(metadata.version, 2)
    assert.deepEqual(metadata.dump, {
      bytes: Buffer.byteLength(archiveBody),
      sha256: archiveDigest,
      archiveFormat: 'postgresql-custom',
      fileName: dump,
    })
    assert.deepEqual(metadata.databaseIdentity, { key: 'primary', uuid: databaseIdentityUuid })
    assert.equal(metadata.completedPrismaMigrationLedger.completedCount, 1)
    assert.match(metadata.completedPrismaMigrationLedger.sha256, /^[0-9a-f]{64}$/)
    assert.deepEqual(metadata.coreCounts, fakeCoreCounts)
    assert.equal(metadata.targetDatabaseFingerprint.canonicalJsonFormat, 'sorted-keys-v1')
    assert.match(metadata.targetDatabaseFingerprint.sha256, /^[0-9a-f]{64}$/)
    assert.equal(
      readFileSync(`${metadataPath}.sha256`, 'utf8').trim(),
      createHash('sha256').update(metadataBytes).digest('hex'),
    )
    assert.doesNotMatch(metadataBytes, /postgresql:\/\/|backup_user|p@ss|word\\tail/)
    assert.equal(statSync(metadataPath).mode & 0o077, 0)
    assert.equal(statSync(`${metadataPath}.sha256`).mode & 0o077, 0)
    assert.equal(readdirSync(runtime.root).some((name) => name.startsWith('foodsystems-backup-credentials.')), false)
  })

  it('fails closed when metadata v2 archive controls or canonical fingerprint binding drift', () => {
    const missingControlRuntime = setupFakeRuntime()
    const missingControlArchive = createV2Backup(missingControlRuntime, 'missing-control')
    const missingControl = spawnSync(verifyBackup, [missingControlArchive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(missingControlRuntime, ''),
        BACKUP_REQUIRE_METADATA_V2: '1',
        FAKE_CATALOG: fakeCatalog().replace(
          '5; 0 0 TABLE public DatabaseIdentity owner\n',
          '',
        ),
      },
    })
    assert.notEqual(missingControl.status, 0)
    assert.match(
      missingControl.stderr,
      /required table is missing from archive catalog: public\.DatabaseIdentity/,
    )

    const driftRuntime = setupFakeRuntime()
    const driftArchive = createV2Backup(driftRuntime, 'fingerprint-drift')
    const metadataPath = `${driftArchive}.metadata`
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as {
      coreCounts: { Document: number }
    }
    metadata.coreCounts.Document += 1
    const driftedBytes = `${JSON.stringify(metadata)}\n`
    writeFileSync(metadataPath, driftedBytes)
    writeFileSync(
      `${metadataPath}.sha256`,
      `${createHash('sha256').update(driftedBytes).digest('hex')}\n`,
    )
    const drifted = spawnSync(verifyBackup, [driftArchive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(driftRuntime, ''),
        BACKUP_REQUIRE_METADATA_V2: '1',
      },
    })
    assert.notEqual(drifted.status, 0)
    assert.match(drifted.stderr, /target database fingerprint does not match/)
  })

  it('removes the dump and all three sidecars when TERM lands after the final rename', () => {
    const runtime = setupFakeRuntime(true)
    const backupDir = join(runtime.root, 'interrupted-backups')
    mkdirSync(backupDir, { mode: 0o700 })

    const result = spawnSync(createBackup, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, 'db.example:6543:foodsystems:backup_user:p@ss\\:word\\\\tail'),
        DATABASE_URL: sourceUrl,
        DATABASE_BACKUP_DIR: backupDir,
        DATABASE_BACKUP_LABEL: 'interrupt',
      },
    })

    assert.equal(result.status, 143, result.stderr)
    assert.deepEqual(readdirSync(backupDir), [])
  })

  it('uses private libpq settings for a restore drill and never puts the admin URL in argv', () => {
    const runtime = setupFakeRuntime()
    const archive = join(runtime.root, 'restore.dump')
    writeFileSync(archive, archiveBody)
    writeFileSync(`${archive}.sha256`, `${archiveDigest}  restore.dump\n`)
    const expectedPgpass = 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, expectedPgpass),
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_runtime',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_EXPECTED_DOCUMENT_COUNT: '1539',
        RESTORE_EXPECTED_SOURCE_CITATION_COUNT: '2703',
        RESTORE_EXPECTED_FIELD_CITATION_COUNT: '244521',
        RESTORE_EXPECTED_REPORT_COUNT: '139',
        RESTORE_EXPECTED_THESIS_COUNT: '79',
        RESTORE_EXPECTED_SOURCE_DOC_COUNT: '199',
        RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT: '1570',
        RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT: '0',
      },
    })

    assert.equal(result.status, 0, result.stderr)
    const calls = readFileSync(runtime.calls, 'utf8')
    assert.doesNotMatch(calls, /postgresql:\/\/|r@ss|word\\tail/)
    assert.match(calls, /createdb\|args=--maintenance-db=postgres .* foodsystems_restore_runtime\|host=restore\.example\|port=7654\|db=postgres\|user=restore_user\|ssl=require/)
    assert.match(calls, /pg_restore\|args=.*--dbname=foodsystems_restore_runtime .*\|host=restore\.example\|port=7654\|db=postgres\|user=restore_user\|ssl=require\|mode=600\|pass=true/)
    assert.match(calls, /psql\|args=.*\|host=restore\.example\|port=7654\|db=foodsystems_restore_runtime\|user=restore_user\|ssl=require\|mode=600\|pass=true/)
    assert.match(calls, /dropdb\|args=--maintenance-db=postgres --if-exists foodsystems_restore_runtime/)
    for (const [relationName, expectedCount] of [
      ['Document', '1539'],
      ['SourceCitation', '2703'],
      ['FieldCitation', '244521'],
      ['Report', '139'],
      ['Thesis', '79'],
      ['SourceDoc', '199'],
      ['LibraryAnalysisRecord', '1570'],
      ['EvidenceAppraisal', '0'],
    ]) {
      assert.match(result.stdout, new RegExp(`exact ${relationName} count verified: ${expectedCount}`))
    }
    assert.equal(readdirSync(runtime.root).some((name) => name.startsWith('foodsystems-restore-credentials.')), false)
  })

  it('publishes a private receipt v1 only after exact metadata v2 restore and confirmed cleanup', () => {
    const runtime = setupFakeRuntime()
    const archive = createV2Backup(runtime, 'receipt-source')
    const receiptDir = join(runtime.root, 'receipts')
    mkdirSync(receiptDir, { mode: 0o700 })
    const receiptPath = join(receiptDir, 'restore-receipt.json')
    const expectedPgpass = 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, expectedPgpass),
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_receipt',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_RECEIPT_PATH: receiptPath,
        RESTORE_EXPECTED_DOCUMENT_COUNT: '1539',
        RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT: '0',
      },
    })

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /metadata v2 target fingerprint verified: [0-9a-f]{64}/)
    assert.match(result.stdout, /cleanup PASS:.*removed and confirmed absent/)
    assert.match(result.stdout, /receipt PASS:/)
    const receiptBytes = readFileSync(receiptPath, 'utf8')
    const receipt = JSON.parse(receiptBytes) as {
      format: string
      version: number
      backup: { dumpBytes: number; dumpSha256: string; metadataSha256: string }
      databaseIdentity: { key: string; uuid: string }
      completedPrismaMigrationLedger: { completedCount: number; sha256: string }
      coreCounts: Record<string, number>
      targetDatabaseFingerprint: { canonicalJsonFormat: string; sha256: string }
      checks: Record<string, unknown> & {
        optionalOperatorExpectedCounts: { status: string; supplied: Record<string, number> }
      }
      cleanup: { databaseName: string; drop: string; databaseAbsenceConfirmed: boolean }
    }
    assert.equal(receipt.format, 'foodsystems-database-restore-receipt')
    assert.equal(receipt.version, 1)
    assert.deepEqual(receipt.backup, {
      dumpBytes: Buffer.byteLength(archiveBody),
      dumpSha256: archiveDigest,
      metadataSha256: createHash('sha256')
        .update(readFileSync(`${archive}.metadata`))
        .digest('hex'),
    })
    assert.deepEqual(receipt.databaseIdentity, { key: 'primary', uuid: databaseIdentityUuid })
    assert.equal(receipt.completedPrismaMigrationLedger.completedCount, 1)
    assert.match(receipt.completedPrismaMigrationLedger.sha256, /^[0-9a-f]{64}$/)
    assert.deepEqual(receipt.coreCounts, fakeCoreCounts)
    assert.equal(receipt.targetDatabaseFingerprint.canonicalJsonFormat, 'sorted-keys-v1')
    assert.match(receipt.targetDatabaseFingerprint.sha256, /^[0-9a-f]{64}$/)
    assert.deepEqual(receipt.checks.optionalOperatorExpectedCounts, {
      status: 'pass',
      supplied: { Document: 1539, EvidenceAppraisal: 0 },
    })
    assert.deepEqual(receipt.cleanup, {
      databaseName: 'foodsystems_restore_receipt',
      drop: 'pass',
      databaseAbsenceConfirmed: true,
    })
    assert.equal(statSync(receiptPath).mode & 0o077, 0)
    assert.doesNotMatch(receiptBytes, /postgresql:\/\/|restore_user|r@ss|word\\tail/)
    assert.equal(readdirSync(receiptDir).includes('restore-receipt.json.lock'), false)
  })

  it('rejects a non-absolute receipt destination before any database command', () => {
    const runtime = setupFakeRuntime()
    const result = spawnSync(restoreBackup, [join(runtime.root, 'unused.dump')], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, ''),
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_invalid_receipt',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_RECEIPT_PATH: 'relative-receipt.json',
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /RESTORE_RECEIPT_PATH must be absolute/)
    assert.equal(readdirSync(runtime.root).includes('calls.log'), false)
  })

  it('does not publish a receipt when the restored metadata fingerprint differs', () => {
    const runtime = setupFakeRuntime()
    const archive = createV2Backup(runtime, 'receipt-fingerprint-failure')
    const receiptDir = join(runtime.root, 'failed-fingerprint-receipt')
    mkdirSync(receiptDir, { mode: 0o700 })
    const receiptPath = join(receiptDir, 'receipt.json')
    const driftedSnapshot = JSON.parse(fakeDatabaseSnapshot) as {
      coreCounts: { Document: number }
    }
    driftedSnapshot.coreCounts.Document += 1

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'),
        FAKE_DATABASE_SNAPSHOT: JSON.stringify(driftedSnapshot),
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_fingerprint_failure',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_RECEIPT_PATH: receiptPath,
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /restored exact core counts do not match metadata v2/)
    assert.equal(readdirSync(receiptDir).length, 0)
    assert.match(
      readFileSync(runtime.calls, 'utf8'),
      /dropdb\|args=--maintenance-db=postgres --if-exists foodsystems_restore_fingerprint_failure/,
    )
  })

  it('does not publish a receipt when disposable-database cleanup fails', () => {
    const runtime = setupFakeRuntime()
    const archive = createV2Backup(runtime, 'receipt-cleanup-failure')
    const receiptDir = join(runtime.root, 'failed-cleanup-receipt')
    mkdirSync(receiptDir, { mode: 0o700 })
    const receiptPath = join(receiptDir, 'receipt.json')

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'),
        FAKE_DROPDB_FAIL: '1',
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_cleanup_failure',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_RECEIPT_PATH: receiptPath,
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /failed to remove disposable database/)
    assert.equal(readdirSync(receiptDir).length, 0)
  })

  it('removes an atomically published receipt when TERM arrives before final success', () => {
    const runtime = setupFakeRuntime()
    const archive = createV2Backup(runtime, 'receipt-signal')
    const receiptDir = join(runtime.root, 'signal-receipt')
    mkdirSync(receiptDir, { mode: 0o700 })
    const receiptPath = join(receiptDir, 'receipt.json')

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'),
        FAKE_SIGNAL_AFTER_RECEIPT: '1',
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_receipt_signal',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_RECEIPT_PATH: receiptPath,
      },
    })

    assert.equal(result.status, 143, result.stderr)
    assert.equal(readdirSync(receiptDir).length, 0)
  })

  it('rejects every invalid optional exact-count input before database commands run', () => {
    const archive = join(tmpdir(), 'unused-invalid-restore-count.dump')
    const expectedCountNames = [
      'RESTORE_EXPECTED_DOCUMENT_COUNT',
      'RESTORE_EXPECTED_SOURCE_CITATION_COUNT',
      'RESTORE_EXPECTED_FIELD_CITATION_COUNT',
      'RESTORE_EXPECTED_REPORT_COUNT',
      'RESTORE_EXPECTED_THESIS_COUNT',
      'RESTORE_EXPECTED_SOURCE_DOC_COUNT',
      'RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT',
      'RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT',
    ]

    for (const expectedCountName of expectedCountNames) {
      const runtime = setupFakeRuntime()
      const result = spawnSync(restoreBackup, [archive], {
        cwd: repoRoot,
        encoding: 'utf8',
        env: {
          ...runtimeEnv(runtime, ''),
          DATABASE_RESTORE_ADMIN_URL: adminUrl,
          RESTORE_DATABASE_NAME: 'foodsystems_restore_invalid_count',
          RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
          [expectedCountName]: '-1',
        },
      })

      assert.notEqual(result.status, 0)
      assert.match(
        result.stderr,
        new RegExp(`${expectedCountName} must be a non-negative integer`),
      )
      assert.equal(readdirSync(runtime.root).includes('calls.log'), false)
    }
  })

  it('fails and removes the disposable database on an EvidenceAppraisal count mismatch', () => {
    const runtime = setupFakeRuntime()
    const archive = join(runtime.root, 'restore-count-mismatch.dump')
    writeFileSync(archive, archiveBody)
    writeFileSync(`${archive}.sha256`, `${archiveDigest}  restore-count-mismatch.dump\n`)

    const result = spawnSync(restoreBackup, [archive], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...runtimeEnv(runtime, 'restore.example:7654:*:restore_user:r@ss\\:word\\\\tail'),
        DATABASE_RESTORE_ADMIN_URL: adminUrl,
        RESTORE_DATABASE_NAME: 'foodsystems_restore_appraisal_mismatch',
        RESTORE_DRILL_ACK: 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE',
        RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT: '1',
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /EvidenceAppraisal count mismatch after restore: expected 1, got 0/)
    assert.match(
      readFileSync(runtime.calls, 'utf8'),
      /dropdb\|args=--maintenance-db=postgres --if-exists foodsystems_restore_appraisal_mismatch/,
    )
  })
})
