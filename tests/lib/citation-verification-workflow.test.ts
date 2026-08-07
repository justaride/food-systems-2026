import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const workflow = readFileSync('.github/workflows/citation-verification.yml', 'utf8')

function occurrences(value: string, pattern: string): number {
  return value.split(pattern).length - 1
}

describe('citation verification workflow', () => {
  it('offers a read-only manual migration preflight mode', () => {
    assert.match(workflow, /migration_preflight_only:/)
    assert.match(workflow, /type: boolean/)
    assert.match(workflow, /inputs\.migration_preflight_only != true/)
    assert.ok(
      workflow.indexOf('inputs.migration_preflight_only != true') > workflow.indexOf('url-health:'),
      'the mutation guard must be scoped to the URL-health job',
    )
  })

  it('pins and checksum-verifies cloudflared in both jobs', () => {
    const download =
      'https://github.com/cloudflare/cloudflared/releases/download/2026.7.2/cloudflared-linux-amd64'
    const checksum = 'ec905ea7b7e327ff8abdde8cb64697a2152de74dbcdbf6aec9db8364eb3886cd'

    assert.equal(occurrences(workflow, download), 2)
    assert.equal(occurrences(workflow, checksum), 2)
    assert.equal(occurrences(workflow, 'sha256sum -c -'), 2)
    assert.doesNotMatch(workflow, /cloudflared\/releases\/latest/)
  })

  it('probes PostgreSQL through private libpq settings without a credential URL in argv', () => {
    assert.equal(occurrences(workflow, 'Prepare private libpq connection'), 2)
    assert.equal(occurrences(workflow, "fs.writeFileSync(pgpassFile, pgpass, { mode: 0o600 })"), 2)
    assert.equal(occurrences(workflow, "psql -X -tAc 'select 1'"), 2)
    assert.equal(occurrences(workflow, 'unset PGPASSWORD'), 2)

    for (const variable of ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGSSLMODE', 'PGPASSFILE']) {
      assert.ok(workflow.includes(`['${variable}',`), `libpq environment missing ${variable}`)
    }

    assert.doesNotMatch(workflow, /psql[^\n]*\$DATABASE_URL/)
    assert.doesNotMatch(workflow, /psql[^\n]*postgres(?:ql)?:\/\//)
  })

  it('keeps Cloudflare Access service-token credentials out of process arguments', () => {
    assert.equal(
      occurrences(workflow, 'TUNNEL_SERVICE_TOKEN_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}'),
      2,
    )
    assert.equal(
      occurrences(workflow, 'TUNNEL_SERVICE_TOKEN_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}'),
      2,
    )
    assert.doesNotMatch(workflow, /--service-token-(?:id|secret)/)
  })

  it('fails closed on the dedicated Coolify migration key and read-only production baseline', () => {
    assert.match(workflow, /Verify dedicated migration credential is configured in Coolify/)
    assert.match(workflow, /id: migration_credential/)
    assert.match(workflow, /continue-on-error: true/)
    assert.match(workflow, /row\.get\('key'\) == 'MIGRATION_DATABASE_URL'/)
    assert.match(workflow, /row\.get\('is_preview'\) is not True/)
    assert.match(workflow, /candidate\.get\('is_runtime'\) is False/)
    assert.match(workflow, /chmod 600 "\$response_file"/)
    assert.match(workflow, /scripts\/verify-production-migration-baseline\.sh/)
    assert.match(workflow, /id: migration_baseline/)
    assert.match(workflow, /id: schema_drift/)
    assert.match(workflow, /scripts\/verify-database-schema-drift\.sh/)
    assert.match(workflow, /steps\.migration_credential\.outcome != 'success'/)
    assert.match(workflow, /steps\.migration_baseline\.outcome != 'success'/)
    assert.match(workflow, /steps\.schema_drift\.outcome != 'success'/)
    assert.match(workflow, /Enforce dedicated migration credential gate/)
    assert.doesNotMatch(workflow, /print\([^\n]*candidate/)
  })

  it('does not expose database or Cloudflare secrets to checkout and dependency setup', () => {
    for (const secret of [
      'DATABASE_URL',
      'TUNNEL_SERVICE_TOKEN_ID',
      'TUNNEL_SERVICE_TOKEN_SECRET',
    ]) {
      assert.doesNotMatch(
        workflow,
        new RegExp(`^ {6}${secret}:`, 'm'),
        `${secret} must not be configured at job scope`,
      )
    }

    assert.equal(occurrences(workflow, 'DATABASE_URL: ${{ secrets.DATABASE_URL }}'), 5)
    assert.equal(occurrences(workflow, 'TUNNEL_SERVICE_TOKEN_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}'), 2)
    assert.equal(
      occurrences(workflow, 'TUNNEL_SERVICE_TOKEN_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}'),
      2,
    )
  })

  it('derives an escaped mode-0600 pgpass file without writing the password to GitHub env', () => {
    const match = workflow.match(/node <<'NODE'\n([\s\S]*?)\n\s+NODE/)
    assert.ok(match, 'private libpq setup script missing')

    const directory = mkdtempSync(join(tmpdir(), 'citation-workflow-test-'))
    const githubEnv = join(directory, 'github-env')
    try {
      const result = spawnSync(process.execPath, ['-e', match[1]], {
        encoding: 'utf8',
        env: {
          ...process.env,
          RAW_DATABASE_URL:
            'postgresql://citation%40user:p%3Aass%5Cword@localhost:5432/food%3Asystems?sslmode=require&schema=public',
          DATABASE_CONNECTION_DIR: directory,
          GITHUB_ENV_FILE: githubEnv,
        },
      })

      assert.equal(result.status, 0, result.stderr)
      const pgpassFile = join(directory, 'pgpass')
      assert.equal(statSync(pgpassFile).mode & 0o777, 0o600)
      assert.equal(
        readFileSync(pgpassFile, 'utf8'),
        'localhost:5432:food\\:systems:citation@user:p\\:ass\\\\word\n',
      )

      const exported = readFileSync(githubEnv, 'utf8')
      assert.match(exported, /^PGHOST=localhost$/m)
      assert.match(exported, /^PGPORT=5432$/m)
      assert.match(exported, /^PGDATABASE=food:systems$/m)
      assert.match(exported, /^PGUSER=citation@user$/m)
      assert.match(exported, /^PGSSLMODE=require$/m)
      assert.match(exported, /^PGPASSFILE=.*\/pgpass$/m)
      assert.doesNotMatch(exported, /p:ass|p%3Aass/)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('cleans only the workflow-owned credential directory in both jobs', () => {
    assert.equal(occurrences(workflow, '"$RUNNER_TEMP"/citation-db.*)'), 2)
    assert.equal(occurrences(workflow, 'rm -f -- "$DATABASE_CONNECTION_DIR/pgpass"'), 2)
    assert.equal(occurrences(workflow, 'Refusing to remove unexpected connection directory'), 2)
  })
})
