import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer, type AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const baselineLastMigration = '20260618_library_analysis_record'
const baselineMigrations = readdirSync(join(repoRoot, 'prisma/migrations'))
  .filter(name => name <= baselineLastMigration)
  .filter(name => {
    try {
      return statSync(join(repoRoot, 'prisma/migrations', name, 'migration.sql')).isFile()
    } catch {
      return false
    }
  })
  .sort()

function read(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

function executable(path: string): boolean {
  return (statSync(join(repoRoot, path)).mode & 0o111) !== 0
}

function makeExecutable(path: string, content: string): void {
  writeFileSync(path, content)
  chmodSync(path, 0o755)
}

function makeLedgerPsql(path: string): void {
  makeExecutable(path, `#!/bin/sh
case "$*" in
  *to_regclass*) printf '%s\\n' "$FAKE_LEDGER_EXISTS" ;;
  *migration_name*) printf '%s\\n' "$FAKE_APPLIED_MIGRATIONS" ;;
  *) exit 70 ;;
esac
`)
}

function postgresBindir(): string | null {
  const configured = process.env.POSTGRES_BINDIR?.trim()
  if (configured) return configured

  const result = spawnSync('pg_config', ['--bindir'], { encoding: 'utf8' })
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : null
}

async function reserveTcpPort(): Promise<number> {
  return await new Promise((resolvePort, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo
      server.close(error => error ? reject(error) : resolvePort(address.port))
    })
  })
}

describe('production migration runner', () => {
  const runner = resolve('scripts/apply-prod-migrations.sh')

  it('ships a credential-safe read-only production baseline preflight', () => {
    const preflight = read('scripts/verify-production-migration-baseline.sh')

    assert.ok(executable('scripts/verify-production-migration-baseline.sh'))
    assert.match(preflight, /required_name in PGHOST PGDATABASE PGUSER PGPASSFILE/)
    assert.match(preflight, /\$required_name is required/)
    assert.match(preflight, /migration_name, checksum/)
    assert.match(preflight, /checksum drift/)
    assert.match(preflight, /LibraryAnalysisRecord is absent/)
    assert.match(preflight, /current credential authority/)
    assert.match(preflight, /rolcreaterole/)
    assert.match(preflight, /database_owner/)
    assert.doesNotMatch(preflight, /DATABASE_URL/)
    assert.doesNotMatch(preflight, /psql[^\n]*postgres(?:ql)?:\/\//)
    assert.doesNotMatch(preflight, /\b(?:INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\b/)
  })

  it('uses Prisma ledger commands and never replays raw migration SQL', () => {
    const script = read('scripts/apply-prod-migrations.sh')
    const executableLines = script.split('\n').filter(line => !line.trimStart().startsWith('#')).join('\n')

    assert.ok(executable('scripts/apply-prod-migrations.sh'))
    assert.match(script, /migrate deploy --schema/)
    assert.match(script, /migrate status --schema/)
    assert.match(script, /verify-database-schema-drift\.sh/)
    assert.match(executableLines, /migration_name FROM public\."_prisma_migrations"/)
    assert.match(script, /MIGRATION_DATABASE_URL is required/)
    assert.match(script, /PGPASSFILE/)
    assert.match(script, /baseline migration is not completed/)
    assert.doesNotMatch(executableLines, /for f in .*migration\.sql/)
    assert.doesNotMatch(script, /DATABASE_URL not set.*skipping/i)
  })

  it('fails closed when the dedicated migration URL is missing', () => {
    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: { ...process.env, MIGRATION_DATABASE_URL: '' },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /MIGRATION_DATABASE_URL is required/)
  })

  it('rejects migration passwords in URL query parameters before invoking database tools', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-query-password-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const invocationLog = join(dir, 'invoked.log')
    makeExecutable(fakePrisma, `#!/bin/sh
printf '%s\n' prisma >> "$FAKE_INVOCATION_LOG"
`)
    makeExecutable(fakePsql, `#!/bin/sh
printf '%s\n' psql >> "$FAKE_INVOCATION_LOG"
`)

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user@example.invalid/foodsystems?password=secret&schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        FAKE_INVOCATION_LOG: invocationLog,
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /put database passwords in the URL authority/)
    assert.equal(existsSync(invocationLog), false)
  })

  it('calls deploy then status through an explicit local Prisma binary', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-prisma-runner-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const fakeDriftGate = join(dir, 'verify-drift')
    const log = join(dir, 'calls.log')
    const driftLog = join(dir, 'drift.log')
    makeExecutable(fakePrisma, `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_PRISMA_LOG"
exit 0
`)
    makeExecutable(fakeDriftGate, `#!/bin/sh
printf '%s\\n' "drift:$PRISMA_BIN:$PRISMA_SCHEMA_FILE" >> "$FAKE_DRIFT_LOG"
exit 0
`)
    makeLedgerPsql(fakePsql)

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user:secret@example.invalid/foodsystems?schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        FAKE_LEDGER_EXISTS: 't',
        FAKE_APPLIED_MIGRATIONS: baselineMigrations.join('\n'),
        FAKE_PRISMA_LOG: log,
        DATABASE_SCHEMA_DRIFT_SCRIPT: fakeDriftGate,
        FAKE_DRIFT_LOG: driftLog,
      },
    })

    assert.equal(result.status, 0, result.stderr)
    const calls = readFileSync(log, 'utf8').trim().split('\n')
    assert.equal(calls.length, 2)
    assert.match(calls[0], /^migrate deploy --schema /)
    assert.match(calls[1], /^migrate status --schema /)
    assert.match(readFileSync(driftLog, 'utf8'), new RegExp(`^drift:${fakePrisma}:.*prisma/schema\\.prisma\\n$`))
  })

  it('stops immediately when migrate deploy fails', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-prisma-fail-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const fakeDriftGate = join(dir, 'verify-drift')
    const log = join(dir, 'calls.log')
    makeExecutable(fakePrisma, `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_PRISMA_LOG"
case "$1 $2" in
  'migrate deploy') exit 42 ;;
esac
exit 0
`)
    makeExecutable(fakeDriftGate, '#!/bin/sh\nexit 0\n')
    makeLedgerPsql(fakePsql)

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user:secret@example.invalid/foodsystems?schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        FAKE_LEDGER_EXISTS: 't',
        FAKE_APPLIED_MIGRATIONS: baselineMigrations.join('\n'),
        FAKE_PRISMA_LOG: log,
        DATABASE_SCHEMA_DRIFT_SCRIPT: fakeDriftGate,
      },
    })

    assert.equal(result.status, 42)
    assert.equal(readFileSync(log, 'utf8').trim().split('\n').length, 1)
  })

  it('fails the deployment hook when the post-migration drift gate fails', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-drift-fail-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const fakeDriftGate = join(dir, 'verify-drift')
    makeExecutable(fakePrisma, '#!/bin/sh\nexit 0\n')
    makeExecutable(fakeDriftGate, '#!/bin/sh\nexit 43\n')
    makeLedgerPsql(fakePsql)

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user:secret@example.invalid/foodsystems?schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        FAKE_LEDGER_EXISTS: 't',
        FAKE_APPLIED_MIGRATIONS: baselineMigrations.join('\n'),
        DATABASE_SCHEMA_DRIFT_SCRIPT: fakeDriftGate,
      },
    })

    assert.equal(result.status, 43)
  })

  it('refuses an empty or unbaselined database before migrate deploy', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-baseline-missing-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const fakeDriftGate = join(dir, 'verify-drift')
    const prismaLog = join(dir, 'prisma.log')
    makeExecutable(fakePrisma, `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_PRISMA_LOG"
`)
    makeLedgerPsql(fakePsql)
    makeExecutable(fakeDriftGate, '#!/bin/sh\nexit 0\n')

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user:secret@example.invalid/foodsystems?schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        DATABASE_SCHEMA_DRIFT_SCRIPT: fakeDriftGate,
        FAKE_LEDGER_EXISTS: 'f',
        FAKE_APPLIED_MIGRATIONS: '',
        FAKE_PRISMA_LOG: prismaLog,
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /catch-up history cannot bootstrap an empty or unbaselined database/)
    assert.equal(existsSync(prismaLog), false)
  })

  it('requires every historical baseline migration to be completed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-baseline-incomplete-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    const fakeDriftGate = join(dir, 'verify-drift')
    makeExecutable(fakePrisma, '#!/bin/sh\nexit 0\n')
    makeLedgerPsql(fakePsql)
    makeExecutable(fakeDriftGate, '#!/bin/sh\nexit 0\n')

    const result = spawnSync(runner, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MIGRATION_DATABASE_URL: 'postgresql://user:secret@example.invalid/foodsystems?schema=public',
        PRISMA_BIN: fakePrisma,
        PSQL_BIN: fakePsql,
        DATABASE_SCHEMA_DRIFT_SCRIPT: fakeDriftGate,
        FAKE_LEDGER_EXISTS: 't',
        FAKE_APPLIED_MIGRATIONS: baselineMigrations.slice(1).join('\n'),
      },
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /baseline migration is not completed/)
  })
})

describe('immutable pre-ledger-cutover migration history', () => {
  const expectedChecksums: Record<string, string> = {
    '20260421_media_evidence_corpus': 'e76031401a1ddcdff6e31121d06b573ca2f04f02de44005d1190df95c0609a91',
    '20260421_subsidy_nullable_columns': '6fe7156f486c1680865ae6e151110294c85af658cb20c294f05e16c5d8268db9',
    '20260427_document_filepath_nullable': 'fb19bc149c7718dc094bdb873c44426604d24c8151dc3dc2f23e126640c5b3c5',
    '20260427_report_provenance': 'f8ea31e324e3a2744680fe8bfd8c3eb2fad957c2221cc6fa3e819a5f13d85c07',
    '20260505_db_optimization_p0': 'e3b8c46333f4805eb76e59c0e2ed9bf53ec624298bacc3db05beed16df47f1bb',
    '20260518_company_registry_flags': '88c95fa330bc9e75b617a15cd22da0cb29a106353c43e9a5eb34aed01e87cf73',
    '20260518_document_source_access_metadata': '44f7b2cc08cf31028cdb03a05256ff7958bfb8a795dfdd165bcb09fac96cdea8',
    '20260518_field_citation_idempotency': '779a237d18ddd1c3347b0543d54ce2325eb5d2d1eda6e9158888f52d96428bc5',
    '20260518_hagar_fiscal_and_shareholder_snapshot_metadata': '4203a50d858edaa6cd6c0b87209cb9ce38b3313bdc0bd993ec5d2040b6e8407a',
    '20260518_insight_structured_citation_fields': '39b69173fd64579afb6a9cc155d083f35fe0c8e006ec544ee4cf2239616e67dd',
    '20260518_source_citations': '51a7eb30ad51ef0b47890a9076ded78eb936b4173afbba439ba3d68a61436009',
    '20260518_verification_metadata': '111bd9299985cf3c8335e8999bab921c8313837464a54d524aa926299c50f5f8',
    '20260520_board_member_provenance': 'a30330d134f358a9f8eabe1cc86be270efab77ab758272282a166de7fdd7c72f',
    '20260520_producer_separation': 'ef54112eec17ee8e75ebd3c74575baeca14ad68a04061c3b8af594c8707ca51d',
    '20260520_schema_drift_catchup': '115d4ca62be5572eb4be65a77bd2a2d45a4dad037c37722ff4b631f5e86dba22',
    '20260520_source_citation_enum_values': '37b73ff2f0693f0a3cd85642dbef102b6a690e2e30b58eebd14a1c5f3b9e8e15',
    '20260520_source_citations': 'a5881be892018614c5f33dd968431ad21b22d1320068299ad2be123a98524a02',
    '20260525183422_add_last_brreg_refresh': '1383e80d450a31e350c22a698944dea9ffb3bb6de32831594c63de2212f26411',
    '20260526_actor_relationship_provenance': 'dc4453d98cbf359f337bf38ba88e8b8a676b6d246721c24755f36f98b12da95e',
    '20260526_producer_primary_citation': '787715dc73453aa8c35ecb5209c6be124fc23c9aecb5f084e997e4c0f91d86a1',
    '20260611_food_tg_board_entries': 'e6a4e693d0682b68c0137d34567bded9606b048b15f37ebeb76110bea43d3b0e',
    '20260618_library_analysis_record': '46fdaf7f4c3e7cb18d0e82edce75a43d55ba168521227924999c6ff5b9e23edc',
  }

  it('freezes released SQL instead of making historical migrations replayable after release', () => {
    for (const [name, expected] of Object.entries(expectedChecksums)) {
      const sql = readFileSync(join(repoRoot, 'prisma/migrations', name, 'migration.sql'))
      const actual = createHash('sha256').update(sql).digest('hex')
      assert.equal(actual, expected, `released migration changed: ${name}`)
    }
  })

  it('adds a forward-only, idempotent FTS object repair migration', () => {
    const sql = read('prisma/migrations/20260719_fts_generated_columns_contract/migration.sql')
    assert.match(sql, /CREATE OR REPLACE FUNCTION public\.immutable_to_tsvector_no/)
    assert.match(sql, /SECURITY INVOKER SET search_path = pg_catalog/)
    assert.match(sql, /^BEGIN;$/m)
    assert.match(sql, /^COMMIT;$/m)
    assert.equal((sql.match(/ADD COLUMN IF NOT EXISTS search_vector/g) ?? []).length, 4)
    assert.equal((sql.match(/CREATE INDEX IF NOT EXISTS .*_search_vector_idx/g) ?? []).length, 4)
  })
})

describe('schema drift gate', () => {
  const gate = resolve('scripts/verify-database-schema-drift.sh')

  function runGate(
    diff: string,
    ftsIssue = '',
    databaseUrl = 'postgresql://test:test@localhost:5432/test?schema=public',
  ) {
    const dir = mkdtempSync(join(tmpdir(), 'foodsystems-drift-gate-'))
    const fakePrisma = join(dir, 'prisma')
    const fakePsql = join(dir, 'psql')
    makeExecutable(fakePrisma, `#!/bin/sh
output=''
while [ "$#" -gt 0 ]; do
  if [ "$1" = '--output' ]; then
    shift
    output=$1
  fi
  shift
done
[ -n "$output" ] || exit 70
printf '%s\\n' "$FAKE_PRISMA_DIFF" > "$output"
`)
    makeExecutable(fakePsql, `#!/bin/sh
printf '%s' "$FAKE_FTS_ISSUE"
`)

    return spawnSync(gate, [], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        DATABASE_URL: databaseUrl,
        PRISMA_BIN: fakePrisma,
        FAKE_PRISMA_DIFF: diff,
        FAKE_FTS_ISSUE: ftsIssue,
      },
    })
  }

  const allowedDiff = `-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "search_vector" DROP DEFAULT;
-- AlterTable
ALTER TABLE "Insight" ALTER COLUMN "search_vector" DROP DEFAULT;
-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "search_vector" DROP DEFAULT;
-- AlterTable
ALTER TABLE "Thesis" ALTER COLUMN "search_vector" DROP DEFAULT;`

  const allowedDiffWithIndexes = `-- DropIndex
DROP INDEX "Document_search_vector_idx";
-- DropIndex
DROP INDEX "Insight_search_vector_idx";
-- DropIndex
DROP INDEX "Report_search_vector_idx";
-- DropIndex
DROP INDEX "Thesis_search_vector_idx";
${allowedDiff}`

  it('accepts only the four documented generated-column differences', () => {
    const result = runGate(allowedDiff)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /documented generated-FTS Prisma diff/)
  })

  it('accepts the matching four index lines when the Prisma engine emits them', () => {
    const result = runGate(allowedDiffWithIndexes)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /documented generated-FTS Prisma diff/)
  })

  it('rejects unknown schema drift', () => {
    const result = runGate(`${allowedDiff}\nDROP TABLE "Unexpected";`)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /unknown drift detected/)
    assert.match(result.stderr, /Unexpected/)
  })

  it('rejects an unverified FTS implementation even when the diff is allowlisted', () => {
    const result = runGate(allowedDiff, 'Document_search_vector_idx is missing')
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /generated-FTS contract failed/)
  })

  it('rejects schema-check passwords in URL query parameters before invoking database tools', () => {
    const result = runGate(
      allowedDiff,
      '',
      'postgresql://test@localhost:5432/test?password=secret&schema=public',
    )
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /put database passwords in the URL authority/)
  })
})

describe('MCP role and backup/restore safety contracts', () => {
  it('ships executable role bootstrap and verification with ACL-level deny probes', () => {
    const bootstrap = read('scripts/bootstrap-mcp-readonly-role.sh')
    const verify = read('scripts/verify-mcp-readonly-role.sh')

    assert.ok(executable('scripts/bootstrap-mcp-readonly-role.sh'))
    assert.ok(executable('scripts/verify-mcp-readonly-role.sh'))
    assert.match(bootstrap, /refusing to change grants without --apply/)
    assert.match(bootstrap, /NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS/)
    assert.match(bootstrap, /REVOKE CREATE, TEMPORARY ON DATABASE %I FROM PUBLIC/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES ON SCHEMA %I FROM PUBLIC/)
    assert.match(bootstrap, /nspname !~ '\^pg_'/)
    assert.doesNotMatch(bootstrap, /GRANT SELECT ON ALL TABLES/)
    assert.match(bootstrap, /GRANT SELECT ON TABLE %I\.%I/)
    assert.match(bootstrap, /\('SourceCitation'\)/)
    assert.match(bootstrap, /\('Report'\)/)
    assert.equal((bootstrap.match(/\('EvidenceAppraisal'\)/g) ?? []).length, 2)
    assert.doesNotMatch(bootstrap, /\('ActorContact'\)/)
    assert.match(bootstrap, /New relations are intentionally not auto-granted/)
    assert.match(bootstrap, /REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES ON ALL SEQUENCES/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES ON ALL FUNCTIONS/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES ON ALL PROCEDURES/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES \(%s\) ON TABLE %I\.%I FROM %I/)
    assert.match(bootstrap, /REVOKE ALL PRIVILEGES \(%s\) ON TABLE %I\.%I FROM PUBLIC/)
    assert.match(bootstrap, /attribute\.attnum > 0/)
    assert.match(bootstrap, /NOT attribute\.attisdropped/)
    assert.match(bootstrap, /default_transaction_read_only/)
    assert.match(bootstrap, /statement_timeout/)
    assert.match(bootstrap, /search_path/)
    assert.match(bootstrap, /application_name/)
    assert.match(bootstrap, /PGPASSFILE/)
    assert.match(bootstrap, /unset DATABASE_ADMIN_URL PGPASSWORD/)
    assert.match(bootstrap, /url\.password = ""/)
    assert.match(bootstrap, /url\.searchParams\.has\("sslpassword"\)/)
    assert.match(bootstrap, /RAISE EXCEPTION/)
    assert.doesNotMatch(bootstrap, /\\quit 1/)
    assert.match(verify, /SET default_transaction_read_only = off; UPDATE/)
    assert.match(verify, /CREATE TEMP TABLE/)
    assert.match(verify, /has_sequence_privilege\(current_user, oid, 'SELECT'\)/)
    assert.match(verify, /procedure\.prosecdef/)
    assert.match(verify, /retains default PUBLIC routine EXECUTE/)
    assert.match(verify, /has_function_privilege\(current_user, procedure\.oid, 'EXECUTE'\)/)
    assert.match(verify, /has_any_column_privilege\(current_user, oid, 'SELECT'\)/)
    assert.match(verify, /has_any_column_privilege\(current_user, oid, 'UPDATE'\)/)
    assert.match(verify, /outside the MCP allowlist/)
    assert.match(verify, /SET ROLE through membership/)
    assert.match(verify, /\('Report'\)/)
    assert.match(verify, /\('EvidenceAppraisal'\)/)
    assert.match(verify, /'EvidenceAppraisal'/)
    assert.match(verify, /PGPASSFILE/)
    assert.match(verify, /unset MCP_DATABASE_URL PGPASSWORD/)
    assert.match(verify, /url\.password = ""/)
    assert.match(verify, /url\.searchParams\.has\("sslpassword"\)/)
  })

  it('revokes and detects PUBLIC and member-role privilege paths across user schemas', {
    timeout: 30_000,
  }, async (t) => {
    const bindir = postgresBindir()
    if (!bindir) {
      t.skip('pg_config is unavailable; set POSTGRES_BINDIR to run the live ACL regression')
      return
    }

    const binaries = Object.fromEntries(
      ['initdb', 'pg_ctl', 'createdb', 'psql'].map(name => [name, join(bindir, name)]),
    ) as Record<string, string>
    if (Object.values(binaries).some(binary => !existsSync(binary))) {
      t.skip('PostgreSQL server binaries are unavailable')
      return
    }

    const tempRoot = mkdtempSync(join(tmpdir(), 'foodsystems-mcp-acl-'))
    const dataDir = join(tempRoot, 'data')
    const socketDir = join(tempRoot, 'socket')
    const port = await reserveTcpPort()
    const database = 'foodsystems_acl_test'
    const adminUrl = `postgresql://postgres@127.0.0.1:${port}/${database}`
    const mcpUrl = `postgresql://foodsystems_mcp_ro:acl-test-password@127.0.0.1:${port}/${database}?application_name=foodsystems-mcp-ro`
    const processEnv: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${bindir}:${process.env.PATH ?? ''}`,
    }
    let started = false

    const run = (binary: string, args: string[], env = processEnv) => spawnSync(
      binary,
      args,
      { cwd: repoRoot, encoding: 'utf8', env },
    )
    const sql = (statement: string) => run(binaries.psql!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', database,
      '-v', 'ON_ERROR_STOP=1', '-c', statement,
    ])

    try {
      assert.equal(run(binaries.initdb!, ['-A', 'trust', '-U', 'postgres', '-D', dataDir]).status, 0)
      mkdirSync(socketDir)
      const start = run(binaries.pg_ctl!, [
        '-D', dataDir,
        '-l', join(tempRoot, 'postgres.log'),
        '-o', `-F -p ${port} -k ${socketDir}`,
        '-w', 'start',
      ])
      assert.equal(start.status, 0, start.stderr)
      started = true
      const createDatabase = run(binaries.createdb!, [
        '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', database,
      ])
      assert.equal(createDatabase.status, 0, createDatabase.stderr)

      const allowlist = [
        'Actor', 'ActorDocumentRef', 'ActorRelationship', 'BoardMember',
        'BusinessRelationship', 'Company', 'CompanyDocumentRef',
        'CompanyOwnership', 'CompanyProperty', 'Document', 'EvidenceAppraisal', 'FieldCitation',
        'Insight', 'LibraryAnalysisRecord', 'PersonProfile', 'Report', 'Shareholder',
        'SourceCitation', 'SourceDoc', 'Thesis',
      ]
      const setupSql = [
        'CREATE SCHEMA sidecar',
        'CREATE ROLE inherited_reader NOLOGIN',
        'CREATE ROLE foodsystems_mcp_ro NOLOGIN',
        'GRANT inherited_reader TO foodsystems_mcp_ro',
        'CREATE TABLE sidecar.shared (id integer)',
        'CREATE SEQUENCE sidecar.shared_seq',
        'GRANT USAGE, CREATE ON SCHEMA sidecar TO PUBLIC',
        'GRANT USAGE ON SCHEMA sidecar TO inherited_reader',
        'GRANT SELECT (id) ON sidecar.shared TO inherited_reader',
        'GRANT SELECT, INSERT ON sidecar.shared TO PUBLIC',
        'GRANT UPDATE (id) ON sidecar.shared TO PUBLIC',
        'GRANT USAGE, SELECT ON SEQUENCE sidecar.shared_seq TO PUBLIC',
        'ALTER DEFAULT PRIVILEGES IN SCHEMA sidecar GRANT SELECT ON TABLES TO PUBLIC',
        'CREATE TABLE public."OutsideAllowlist" (id integer)',
        ...allowlist.map(name => `CREATE TABLE public."${name}" (id integer)`),
      ].join('; ') + ';'
      const setup = sql(setupSql)
      assert.equal(setup.status, 0, setup.stderr)

      const bootstrap = run(resolve('scripts/bootstrap-mcp-readonly-role.sh'), ['--apply'], {
        ...processEnv,
        DATABASE_ADMIN_URL: adminUrl,
        MCP_DB_PASSWORD: 'acl-test-password',
      })
      assert.equal(bootstrap.status, 0, bootstrap.stderr)

      const verify = () => run(resolve('scripts/verify-mcp-readonly-role.sh'), [], {
        ...processEnv,
        MCP_DATABASE_URL: mcpUrl,
      })
      const verified = verify()
      assert.equal(verified.status, 0, verified.stderr)

      const schemaPublicRoutineDefault = sql(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO PUBLIC',
      )
      assert.equal(schemaPublicRoutineDefault.status, 0, schemaPublicRoutineDefault.stderr)
      const schemaPublicRoutineDefaultLeak = verify()
      assert.notEqual(schemaPublicRoutineDefaultLeak.status, 0)
      assert.match(
        schemaPublicRoutineDefaultLeak.stderr,
        /default privileges could grant future relation, sequence, or direct routine access/i,
      )
      const schemaPublicRoutineDefaultCleanup = sql(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC',
      )
      assert.equal(
        schemaPublicRoutineDefaultCleanup.status,
        0,
        schemaPublicRoutineDefaultCleanup.stderr,
      )
      const verifiedAfterSchemaPublicRoutineDefaultCleanup = verify()
      assert.equal(
        verifiedAfterSchemaPublicRoutineDefaultCleanup.status,
        0,
        verifiedAfterSchemaPublicRoutineDefaultCleanup.stderr,
      )

      const futureDefiner = sql(
        "CREATE FUNCTION public.future_security_definer() RETURNS integer LANGUAGE sql SECURITY DEFINER AS 'SELECT 1'",
      )
      assert.equal(futureDefiner.status, 0, futureDefiner.stderr)
      const futureDefinerPrivilege = sql(
        "SELECT has_function_privilege('foodsystems_mcp_ro', 'public.future_security_definer()', 'EXECUTE')",
      )
      assert.equal(futureDefinerPrivilege.status, 0, futureDefinerPrivilege.stderr)
      assert.match(futureDefinerPrivilege.stdout, /f/)
      const verifiedAfterFutureDefiner = verify()
      assert.equal(verifiedAfterFutureDefiner.status, 0, verifiedAfterFutureDefiner.stderr)

      const effective = sql(`
        SELECT
          has_table_privilege('foodsystems_mcp_ro', 'public."Document"', 'SELECT'),
          has_table_privilege('foodsystems_mcp_ro', 'public."OutsideAllowlist"', 'SELECT'),
          has_table_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'SELECT'),
          has_any_column_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'SELECT'),
          has_table_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'INSERT'),
          has_any_column_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'UPDATE'),
          has_sequence_privilege('foodsystems_mcp_ro', 'sidecar.shared_seq', 'USAGE'),
          has_schema_privilege('foodsystems_mcp_ro', 'sidecar', 'USAGE'),
          has_schema_privilege('foodsystems_mcp_ro', 'sidecar', 'CREATE'),
          EXISTS (
            SELECT 1 FROM pg_auth_members membership
            JOIN pg_roles member ON member.oid = membership.member
            WHERE member.rolname = 'foodsystems_mcp_ro'
          )
      `)
      assert.equal(effective.status, 0, effective.stderr)
      assert.match(effective.stdout, /t\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f\s*\|\s*f/)

      assert.equal(sql('GRANT SELECT (id) ON sidecar.shared TO PUBLIC').status, 0)
      const columnEvidence = sql(`
        SELECT
          has_table_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'SELECT'),
          has_any_column_privilege('foodsystems_mcp_ro', 'sidecar.shared', 'SELECT')
      `)
      assert.equal(columnEvidence.status, 0, columnEvidence.stderr)
      assert.match(columnEvidence.stdout, /f\s*\|\s*t/)
      const publicColumnLeak = verify()
      assert.notEqual(publicColumnLeak.status, 0)
      assert.match(publicColumnLeak.stderr, /column SELECT.*outside the MCP allowlist.*sidecar\.shared/i)
      assert.equal(sql('REVOKE SELECT (id) ON sidecar.shared FROM PUBLIC').status, 0)

      assert.equal(sql('GRANT SELECT ON sidecar.shared TO PUBLIC').status, 0)
      const publicLeak = verify()
      assert.notEqual(publicLeak.status, 0)
      assert.match(publicLeak.stderr, /outside the MCP allowlist.*sidecar\.shared/i)
      assert.equal(sql('REVOKE SELECT ON sidecar.shared FROM PUBLIC').status, 0)

      assert.equal(sql('GRANT inherited_reader TO foodsystems_mcp_ro').status, 0)
      const membershipLeak = verify()
      assert.notEqual(membershipLeak.status, 0)
      assert.match(membershipLeak.stderr, /SET ROLE through membership in inherited_reader/i)
    } finally {
      if (started) run(binaries.pg_ctl!, ['-D', dataDir, '-m', 'immediate', 'stop'])
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })

  it('verifies exact FTS expression and GIN operator-class contracts', () => {
    const driftGate = read('scripts/verify-database-schema-drift.sh')

    assert.match(driftGate, /required_fragments/)
    assert.match(driftGate, /regexp_count\(generation_expression, 'setweight'\)/)
    assert.match(driftGate, /access_method\.amname = 'gin'/)
    assert.match(driftGate, /indexed_attribute\.attname = 'search_vector'/)
    assert.match(driftGate, /operator_class\.opcname = 'tsvector_ops'/)
  })

  it('rejects database passwords in URL query parameters before invoking database CLIs', () => {
    const migrate = read('scripts/apply-prod-migrations.sh')
    const drift = read('scripts/verify-database-schema-drift.sh')

    for (const script of [migrate, drift]) {
      assert.match(script, /url\.searchParams\.has\("password"\)/)
      assert.match(script, /url\.searchParams\.has\("sslpassword"\)/)
      assert.match(script, /put database passwords in the URL authority, not query parameters/)
    }
  })

  it('requires explicit, atomic backup publication with checksum verification', () => {
    const create = read('scripts/create-database-backup.sh')
    const verify = read('scripts/verify-database-backup.sh')
    const contract = read('scripts/database-backup-contract.mjs')
    const snapshot = read('scripts/database-backup-snapshot.sql')

    assert.ok(executable('scripts/create-database-backup.sh'))
    assert.ok(executable('scripts/verify-database-backup.sh'))
    assert.match(create, /DATABASE_BACKUP_DIR is required/)
    assert.match(create, /--format=custom/)
    assert.match(create, /--no-owner/)
    assert.match(create, /verify-database-backup\.sh/)
    assert.match(verify, /checksum file is missing/)
    assert.match(verify, /SHA-256 mismatch/)
    assert.match(verify, /Document SourceCitation EvidenceAppraisal _prisma_migrations/)
    assert.match(create, /metadata\.sha256/)
    assert.match(create, /BACKUP_REQUIRE_METADATA_V2=1/)
    assert.match(verify, /BACKUP_REQUIRE_METADATA_V2/)
    assert.match(verify, /DatabaseIdentity ControlledMutationAudit/)
    assert.match(contract, /foodsystems-database-backup-metadata/)
    assert.match(contract, /sorted-keys-v1/)
    assert.match(contract, /completedPrismaMigrationLedger/)
    assert.match(contract, /targetDatabaseFingerprint/)
    assert.match(snapshot, /public\."DatabaseIdentity"/)
    assert.match(snapshot, /public\."ControlledMutationAudit"/)
  })

  it('restores only to a new, explicitly acknowledged disposable database', () => {
    const restore = read('scripts/restore-database-backup-drill.sh')

    assert.ok(executable('scripts/restore-database-backup-drill.sh'))
    assert.match(restore, /I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE/)
    assert.match(restore, /target database already exists; refusing to overwrite or drop it/)
    assert.match(restore, /foodsystems_restore_/)
    assert.match(restore, /pg_restore/)
    assert.match(restore, /invalid or unready index found after restore/)
    assert.match(restore, /unvalidated constraint found after restore/)
    assert.match(restore, /LibraryAnalysisRecord is empty after restore/)
    assert.match(restore, /public\."EvidenceAppraisal"/)
    assert.match(restore, /RESTORE_RECEIPT_PATH/)
    assert.match(restore, /verify-restored-snapshot/)
    assert.match(restore, /confirmed_absent/)
    assert.match(restore, /write-receipt/)
    for (const [environmentName, relationName] of [
      ['RESTORE_EXPECTED_DOCUMENT_COUNT', 'Document'],
      ['RESTORE_EXPECTED_SOURCE_CITATION_COUNT', 'SourceCitation'],
      ['RESTORE_EXPECTED_FIELD_CITATION_COUNT', 'FieldCitation'],
      ['RESTORE_EXPECTED_REPORT_COUNT', 'Report'],
      ['RESTORE_EXPECTED_THESIS_COUNT', 'Thesis'],
      ['RESTORE_EXPECTED_SOURCE_DOC_COUNT', 'SourceDoc'],
      ['RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT', 'LibraryAnalysisRecord'],
      ['RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT', 'EvidenceAppraisal'],
    ]) {
      assert.ok(restore.includes(environmentName), `missing exact-count input ${environmentName}`)
      assert.ok(
        restore.includes(`verify_expected_count ${environmentName} ${relationName}`),
        `missing exact-count mapping for ${relationName}`,
      )
    }
    assert.match(restore, /must be a non-negative integer/)
    assert.match(restore, /\$relation_name count mismatch after restore/)
    assert.match(restore, /dropdb --maintenance-db="\$ADMIN_URL" --if-exists "\$RESTORE_DATABASE_NAME"/)
    assert.ok(
      restore.indexOf('createdb --maintenance-db=') < restore.indexOf('target_reserved=true'),
      'cleanup must be armed only after this process successfully creates the target database',
    )
    assert.ok(
      restore.indexOf('cleanup_target || fail') < restore.indexOf('write-receipt'),
      'receipt publication must happen only after disposable database cleanup succeeds',
    )
    const cleanupFunction = restore.slice(
      restore.indexOf('cleanup_target() {'),
      restore.indexOf('cleanup_connection() {'),
    )
    assert.ok(
      cleanupFunction.indexOf('dropdb --maintenance-db=') < cleanupFunction.indexOf('target_reserved=false'),
      'cleanup ownership must be disarmed immediately after this process drops its target',
    )
    assert.ok(
      cleanupFunction.indexOf('target_reserved=false') < restore.indexOf('confirmed_absent='),
      'the absence check must run only after destructive cleanup has been disarmed',
    )
    assert.ok(
      restore.indexOf('confirmed_absent=') < restore.indexOf('write-receipt'),
      'receipt publication must happen only after database absence is confirmed',
    )
  })
})
