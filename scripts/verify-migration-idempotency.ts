/**
 * Verifiserer at hele migrasjonssettet tåler å bli anvendt om igjen.
 *
 * Hvorfor dette må finnes: prod synkes av scripts/apply-prod-migrations.sh,
 * som kjører `set -e` + `ON_ERROR_STOP=1` over ALLE committede migrasjoner ved
 * HVER deploy. Skriptet hviler på at hver migrasjon er skrevet idempotent. Da
 * det premisset brast (2026-08-06) døde skjemasynken på migrasjon 11 av 14, og
 * alt etter den — inkludert LibraryAnalysisRecord — nådde aldri prod. Ingenting
 * feilet synlig; appen svarte bare "unavailable" på de berørte flatene.
 *
 * Metoden speiler prod: bootstrap med `db push` (slik prod-basen ble laget),
 * så anvend hele settet med psql to ganger. Andre runde er den som teller —
 * en migrasjon som passerer én gang og feiler neste er en deploy-mine.
 *
 * Krever psql og en superbruker-URL (CREATE EXTENSION vector).
 *   MIGRATION_PROBE_ADMIN_URL=postgresql://superuser@localhost:5432/postgres
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRATIONS_DIR = 'prisma/migrations'
const RUNNER = 'scripts/apply-prod-migrations.sh'
const PROBE_DB = 'migration_idempotency_probe'

// Kontrakten gjelder bare så lenge prod-kjøreren replayer rå SQL. Går den over
// til `prisma migrate deploy` blir hver migrasjon anvendt nøyaktig én gang mot
// _prisma_migrations-ledgeren, og da er ugardert engangs-DDL helt riktig — å
// kreve idempotens ville avvist legitime migrasjoner (det gjelder blant annet
// de fem på codex/visual-system-atlas-v1, som er skrevet for den kjøreren).
// Porten pensjonerer derfor seg selv når kjøreren byttes, i stedet for å måtte
// huskes bort.
// Kommentarlinjer teller ikke: dagens kjører *nevner* `prisma migrate deploy`
// i en kommentar om hvorfor den ikke brukes.
const runnerCode = readFileSync(RUNNER, 'utf8')
  .split('\n')
  .filter(line => !line.trimStart().startsWith('#'))
  .join('\n')

if (runnerCode.includes('migrate deploy')) {
  console.log(
    `${RUNNER} bruker Prisma-ledgeren (migrate deploy) — hver migrasjon kjøres\n` +
      'nøyaktig én gang, så idempotens er ikke et krav. Porten hopper over.',
  )
  process.exit(0)
}

const adminUrl = process.env.MIGRATION_PROBE_ADMIN_URL
if (!adminUrl) {
  console.error('MIGRATION_PROBE_ADMIN_URL må peke på en superbruker-konto (databasen «postgres»).')
  process.exit(2)
}

const probeUrl = `${adminUrl.replace(/\/[^/]*$/, '')}/${PROBE_DB}`

function psql(url: string, args: string[]) {
  return execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-q', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function migrationFiles() {
  // Samme rekkefølge som apply-prod-migrations.sh sin glob: leksikografisk.
  return readdirSync(MIGRATIONS_DIR)
    .filter(name => !name.startsWith('.') && name !== 'migration_lock.toml')
    .sort()
    .map(name => ({ name, file: join(MIGRATIONS_DIR, name, 'migration.sql') }))
}

function applyAll(pass: number) {
  const failures: { name: string; error: string }[] = []
  for (const { name, file } of migrationFiles()) {
    try {
      psql(probeUrl, ['-f', file])
    } catch (error) {
      const stderr = (error as { stderr?: string }).stderr ?? String(error)
      const firstError = stderr.split('\n').find(line => line.includes('ERROR:')) ?? stderr.trim()
      failures.push({ name, error: firstError.trim() })
    }
  }
  console.log(`  runde ${pass}: ${failures.length} feilende migrasjoner`)
  for (const f of failures) console.log(`    ✗ ${f.name}\n        ${f.error}`)
  return failures
}

console.log(`Bygger prøvedatabase «${PROBE_DB}» …`)
psql(adminUrl, ['-c', `DROP DATABASE IF EXISTS "${PROBE_DB}"`, '-c', `CREATE DATABASE "${PROBE_DB}"`])
psql(probeUrl, ['-c', 'CREATE EXTENSION IF NOT EXISTS vector', '-c', 'CREATE EXTENSION IF NOT EXISTS pg_trgm'])

console.log('Bootstrapper skjemaet med `prisma db push` (slik prod-basen ble laget) …')
execFileSync('npx', ['prisma', 'db', 'push', '--schema=prisma/schema.prisma', `--url=${probeUrl}`, '--accept-data-loss'], {
  stdio: ['ignore', 'ignore', 'inherit'],
})

console.log('Anvender hele migrasjonssettet to ganger:')
const first = applyAll(1)
const second = applyAll(2)

psql(adminUrl, ['-c', `DROP DATABASE IF EXISTS "${PROBE_DB}"`])

if (first.length === 0 && second.length === 0) {
  console.log('\n✓ Hele settet er idempotent — prod-deployens skjemasynk overlever gjentatt kjøring.')
  process.exit(0)
}

console.error(
  '\n✗ Migrasjoner som ikke tåler gjenbruk. apply-prod-migrations.sh stopper på den' +
    ' første av dem, og alt etter den i rekkefølgen når aldri prod.',
)
process.exit(1)
