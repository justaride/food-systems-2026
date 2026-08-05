import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer, type AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { it } from 'node:test'
import { Client } from 'pg'

const repoRoot = process.cwd()

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

async function waitForClientLock(
  observer: Client,
  applicationName: string,
  isSettled: () => boolean,
) {
  const deadline = Date.now() + 5_000
  while (Date.now() < deadline) {
    const activity = await observer.query<{ wait_event_type: string | null }>(`
      SELECT wait_event_type
      FROM pg_stat_activity
      WHERE application_name = $1
    `, [applicationName])
    if (activity.rows.some(row => row.wait_event_type === 'Lock')) return
    if (isSettled()) {
      assert.fail(`${applicationName} completed before entering a row-lock wait`)
    }
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  assert.fail(`${applicationName} did not enter a row-lock wait before timeout`)
}

it('keeps Report locator/access metadata race-safe in disposable PostgreSQL', { timeout: 45_000 }, async (t) => {
  const importer = readFileSync('scripts/import-ts-data.ts', 'utf8')
  assert.doesNotMatch(importer, /prisma\.report\.findUnique\(/)
  assert.match(
    importer,
    /prisma\.report\.updateMany\(\{[\s\S]*where: \{ id: r\.id, accessedAt: null \}[\s\S]*data: \{ sourceUrl: r\.sourceUrl \?\? null \}/,
  )

  const bindir = postgresBindir()
  if (!bindir) {
    t.skip('pg_config is unavailable; set POSTGRES_BINDIR to run the importer race regression')
    return
  }

  const binaries = Object.fromEntries(
    ['initdb', 'pg_ctl', 'createdb'].map(name => [name, join(bindir, name)]),
  ) as Record<string, string>
  if (Object.values(binaries).some(binary => !existsSync(binary))) {
    t.skip('PostgreSQL server binaries are unavailable')
    return
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'foodsystems-import-race-'))
  const dataDir = join(tempRoot, 'data')
  const socketDir = mkdtempSync('/tmp/foodsystems-import-race-socket-')
  const postgresLog = join(tempRoot, 'postgres.log')
  const database = 'foodsystems_import_race_test'
  const port = await reserveTcpPort()
  const processEnv: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: `${bindir}:${process.env.PATH ?? ''}`,
  }
  const run = (binary: string, args: string[]) => spawnSync(binary, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: processEnv,
  })
  const connect = async (applicationName: string) => {
    const client = new Client({
      host: '127.0.0.1',
      port,
      user: 'postgres',
      database,
      application_name: applicationName,
      connectionTimeoutMillis: 5_000,
    })
    await client.connect()
    await client.query(`SET lock_timeout = '5s'`)
    return client
  }

  let started = false
  let reviewClient: Client | null = null
  let genericClient: Client | null = null
  try {
    const initialized = run(binaries.initdb!, [
      '-A', 'trust', '-U', 'postgres', '-D', dataDir,
    ])
    assert.equal(initialized.status, 0, initialized.stderr)

    const start = run(binaries.pg_ctl!, [
      '-D', dataDir,
      '-l', postgresLog,
      '-o', `-F -p ${port} -k ${socketDir}`,
      '-w', 'start',
    ])
    assert.equal(
      start.status,
      0,
      `${start.stderr}\n${existsSync(postgresLog) ? readFileSync(postgresLog, 'utf8') : ''}`,
    )
    started = true

    const created = run(binaries.createdb!, [
      '-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', database,
    ])
    assert.equal(created.status, 0, created.stderr)

    reviewClient = await connect('import-race-review')
    genericClient = await connect('import-race-generic')
    await reviewClient.query(`
      CREATE TABLE "Report" (
        "id" TEXT PRIMARY KEY,
        "sourceUrl" TEXT,
        "accessedAt" TIMESTAMPTZ
      )
    `)
    await reviewClient.query(`
      INSERT INTO "Report" ("id", "sourceUrl", "accessedAt")
      VALUES
        ('review-wins', 'https://old.example/review-wins', NULL),
        ('generic-wins', 'https://old.example/generic-wins', NULL)
    `)

    // The reviewed full-row write owns the row lock first. The generic import
    // must wait, then PostgreSQL rechecks accessedAt IS NULL after commit and
    // reports zero updated rows instead of splitting the reviewed pair.
    await reviewClient.query('BEGIN ISOLATION LEVEL SERIALIZABLE')
    const reviewedWrite = await reviewClient.query(`
      UPDATE "Report"
      SET "sourceUrl" = 'https://reviewed.example/report.pdf',
          "accessedAt" = '2026-07-20T00:00:00Z'
      WHERE "id" = 'review-wins'
        AND "sourceUrl" = 'https://old.example/review-wins'
        AND "accessedAt" IS NULL
      RETURNING "id"
    `)
    assert.equal(reviewedWrite.rowCount, 1)

    let genericAfterReviewSettled = false
    const genericAfterReview = genericClient.query(`
      UPDATE "Report"
      SET "sourceUrl" = 'https://generic.example/report.pdf'
      WHERE "id" = 'review-wins' AND "accessedAt" IS NULL
      RETURNING "id"
    `).finally(() => {
      genericAfterReviewSettled = true
    })
    await waitForClientLock(
      reviewClient,
      'import-race-generic',
      () => genericAfterReviewSettled,
    )
    await reviewClient.query('COMMIT')
    assert.equal((await genericAfterReview).rowCount, 0)

    const reviewWinsState = await reviewClient.query<{
      sourceUrl: string
      accessedAt: string | null
    }>(`
      SELECT
        "sourceUrl" AS "sourceUrl",
        to_char("accessedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "accessedAt"
      FROM "Report"
      WHERE "id" = 'review-wins'
    `)
    assert.deepEqual(reviewWinsState.rows, [{
      sourceUrl: 'https://reviewed.example/report.pdf',
      accessedAt: '2026-07-20',
    }])

    // The generic import owns the row lock first. The reviewed full-row CAS
    // carries the pinned old locator/access snapshot and must either return no
    // row or fail serialization after the generic write commits. Both outcomes
    // are fail-closed; neither can create a generic locator/reviewed-date hybrid.
    await genericClient.query('BEGIN')
    const genericWrite = await genericClient.query(`
      UPDATE "Report"
      SET "sourceUrl" = 'https://generic.example/report.pdf'
      WHERE "id" = 'generic-wins' AND "accessedAt" IS NULL
      RETURNING "id"
    `)
    assert.equal(genericWrite.rowCount, 1)

    await reviewClient.query('BEGIN ISOLATION LEVEL SERIALIZABLE')
    let reviewAfterGenericSettled = false
    const reviewAfterGeneric = reviewClient.query(`
      UPDATE "Report"
      SET "sourceUrl" = 'https://reviewed.example/report.pdf',
          "accessedAt" = '2026-07-20T00:00:00Z'
      WHERE "id" = 'generic-wins'
        AND "sourceUrl" = 'https://old.example/generic-wins'
        AND "accessedAt" IS NULL
      RETURNING "id"
    `).then(
      result => ({ ok: true as const, result }),
      (error: Error & { code?: string }) => ({ ok: false as const, error }),
    ).finally(() => {
      reviewAfterGenericSettled = true
    })
    await waitForClientLock(
      genericClient,
      'import-race-review',
      () => reviewAfterGenericSettled,
    )
    await genericClient.query('COMMIT')

    const reviewAfterGenericOutcome = await reviewAfterGeneric
    if (reviewAfterGenericOutcome.ok) {
      assert.equal(reviewAfterGenericOutcome.result.rowCount, 0)
      await reviewClient.query('COMMIT')
    } else {
      assert.equal(reviewAfterGenericOutcome.error.code, '40001')
      assert.match(reviewAfterGenericOutcome.error.message, /serialize|concurrent update/i)
      await reviewClient.query('ROLLBACK')
    }

    const genericWinsState = await genericClient.query<{
      sourceUrl: string
      accessedAt: string | null
    }>(`
      SELECT
        "sourceUrl" AS "sourceUrl",
        to_char("accessedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "accessedAt"
      FROM "Report"
      WHERE "id" = 'generic-wins'
    `)
    assert.deepEqual(genericWinsState.rows, [{
      sourceUrl: 'https://generic.example/report.pdf',
      accessedAt: null,
    }])
  } finally {
    await reviewClient?.query('ROLLBACK').catch(() => undefined)
    await genericClient?.query('ROLLBACK').catch(() => undefined)
    await Promise.all([
      reviewClient?.end(),
      genericClient?.end(),
    ])
    if (started) {
      run(binaries.pg_ctl!, ['-D', dataDir, '-m', 'immediate', '-w', 'stop'])
    }
    rmSync(socketDir, { recursive: true, force: true })
    rmSync(tempRoot, { recursive: true, force: true })
  }
})
