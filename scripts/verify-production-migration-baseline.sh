#!/bin/sh
# Read-only production preflight for the fail-closed Prisma migration runner.
#
# The caller must prepare a private libpq connection through PGHOST, PGPORT,
# PGDATABASE, PGUSER and PGPASSFILE. No credential-bearing URL is accepted or
# passed in process arguments.
set -eu

fail() {
  printf '%s\n' "[migration-preflight] ERROR: $*" >&2
  exit 1
}

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
MIGRATIONS_DIR=$REPO_ROOT/prisma/migrations
BASELINE_LAST_MIGRATION=${MIGRATION_BASELINE_LAST:-20260618_library_analysis_record}

for required_name in PGHOST PGDATABASE PGUSER PGPASSFILE; do
  eval "required_value=\${$required_name:-}"
  [ -n "$required_value" ] || fail "$required_name is required"
done
[ -f "$PGPASSFILE" ] || fail 'PGPASSFILE must reference a regular file'
[ -d "$MIGRATIONS_DIR" ] || fail "migrations directory is missing: $MIGRATIONS_DIR"

if [ -n "${PSQL_BIN:-}" ]; then
  [ -x "$PSQL_BIN" ] || fail "PSQL_BIN is not executable: $PSQL_BIN"
  psql_bin=$PSQL_BIN
else
  command -v psql >/dev/null 2>&1 || fail 'psql is required'
  psql_bin=$(command -v psql)
fi
command -v node >/dev/null 2>&1 || fail 'node is required'

hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    openssl dgst -sha256 "$1" | awk '{print $NF}'
  fi
}

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-migration-preflight.XXXXXX")
cleanup() {
  rm -f "$work_dir/expected.tsv" "$work_dir/actual.tsv"
  rmdir "$work_dir" 2>/dev/null || true
}
trap cleanup EXIT HUP INT TERM
expected_file=$work_dir/expected.tsv
actual_file=$work_dir/actual.tsv

baseline_found=false
for migration_file in "$MIGRATIONS_DIR"/*/migration.sql; do
  [ -f "$migration_file" ] || continue
  migration_name=$(basename "$(dirname "$migration_file")")
  printf '%s\t%s\n' "$migration_name" "$(hash_file "$migration_file")" >> "$expected_file"
  if [ "$migration_name" = "$BASELINE_LAST_MIGRATION" ]; then
    baseline_found=true
    break
  fi
done
[ "$baseline_found" = true ] \
  || fail "baseline cutoff migration is missing: $BASELINE_LAST_MIGRATION"

ledger_exists=$($psql_bin -X -A -t -q -v ON_ERROR_STOP=1 \
  -c 'SELECT to_regclass('\''public."_prisma_migrations"'\'') IS NOT NULL')
[ "$ledger_exists" = t ] \
  || fail 'Prisma migration ledger is missing; production must be explicitly baselined before deploy'

authority_summary=$($psql_bin -X -A -t -q -v ON_ERROR_STOP=1 -c '
  SELECT concat(
    '\''superuser='\'', rolsuper,
    '\'',createrole='\'', rolcreaterole,
    '\'',createdb='\'', rolcreatedb,
    '\'',database_owner='\'', (SELECT datdba = role.oid FROM pg_database WHERE datname = current_database()),
    '\'',public_schema_owner='\'', (SELECT nspowner = role.oid FROM pg_namespace WHERE nspname = '\''public'\'')
  )
  FROM pg_roles role
  WHERE rolname = current_user
')
printf '%s\n' "[migration-preflight] current credential authority: $authority_summary"

failed_count=$($psql_bin -X -A -t -q -v ON_ERROR_STOP=1 \
  -c 'SELECT count(*) FROM public."_prisma_migrations" WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL')
[ "$failed_count" = 0 ] \
  || fail "Prisma migration ledger contains $failed_count unfinished or rolled-back rows"

$psql_bin -X -A -t -q -F '	' -v ON_ERROR_STOP=1 \
  -c 'SELECT migration_name, checksum FROM public."_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name' \
  > "$actual_file"

EXPECTED_FILE=$expected_file ACTUAL_FILE=$actual_file node <<'NODE'
const fs = require('node:fs')

function rows(path) {
  const text = fs.readFileSync(path, 'utf8').trim()
  if (!text) return new Map()
  return new Map(text.split('\n').map(line => {
    const [name, checksum, ...extra] = line.split('\t')
    if (!name || !checksum || extra.length) throw new Error(`invalid migration row in ${path}`)
    return [name, checksum]
  }))
}

const expected = rows(process.env.EXPECTED_FILE)
const actual = rows(process.env.ACTUAL_FILE)
const missing = []
const drifted = []
for (const [name, checksum] of expected) {
  if (!actual.has(name)) missing.push(name)
  else if (actual.get(name) !== checksum) drifted.push(name)
}
if (missing.length || drifted.length) {
  if (missing.length) console.error(`[migration-preflight] missing baseline migrations: ${missing.join(', ')}`)
  if (drifted.length) console.error(`[migration-preflight] checksum drift: ${drifted.join(', ')}`)
  process.exit(1)
}
console.log(`[migration-preflight] baseline ledger PASS: ${expected.size}/${expected.size} names and checksums`)
NODE

library_table=$($psql_bin -X -A -t -q -v ON_ERROR_STOP=1 \
  -c 'SELECT to_regclass('\''public."LibraryAnalysisRecord"'\'') IS NOT NULL')
[ "$library_table" = t ] \
  || fail 'LibraryAnalysisRecord is absent although its baseline migration must already be completed'

printf '%s\n' '[migration-preflight] production baseline PASS: ledger and LibraryAnalysisRecord are present'
