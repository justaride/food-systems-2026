#!/bin/sh
# Apply committed Prisma migrations exactly once, using Prisma's migration
# ledger and advisory locking. The production image runs this before starting
# the application process; a Coolify post-deployment command is not a
# fail-closed deployment boundary.
#
# The previous runner replayed every migration.sql with psql on every deploy.
# That bypassed _prisma_migrations, retried one-shot DDL, and could leave a
# partially migrated database. Never replace this with a raw SQL directory
# loop: existing databases must be baselined/reconciled explicitly instead.
set -eu

fail() {
  printf '%s\n' "[migrate] ERROR: $*" >&2
  exit 1
}

[ -n "${MIGRATION_DATABASE_URL:-}" ] \
  || fail 'MIGRATION_DATABASE_URL is required; refusing to migrate with the long-running app credential'

# Prisma reads DATABASE_URL from prisma.config.ts. Export the dedicated
# migration credential only inside this child process; the parent shell that
# starts the application retains its least-privilege DATABASE_URL.
export DATABASE_URL=$MIGRATION_DATABASE_URL

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SCHEMA_FILE=${PRISMA_SCHEMA_FILE:-"$REPO_ROOT/prisma/schema.prisma"}
MIGRATIONS_DIR=$REPO_ROOT/prisma/migrations
DRIFT_SCRIPT=${DATABASE_SCHEMA_DRIFT_SCRIPT:-"$SCRIPT_DIR/verify-database-schema-drift.sh"}
BASELINE_LAST_MIGRATION=${MIGRATION_BASELINE_LAST:-20260618_library_analysis_record}

[ -f "$SCHEMA_FILE" ] || fail "Prisma schema not found: $SCHEMA_FILE"
[ -d "$MIGRATIONS_DIR" ] || fail "Prisma migrations directory not found: $MIGRATIONS_DIR"
[ -x "$DRIFT_SCRIPT" ] || fail "Schema-drift verifier is missing or not executable: $DRIFT_SCRIPT"

has_migration=false
for migration_file in "$MIGRATIONS_DIR"/*/migration.sql; do
  if [ -f "$migration_file" ]; then
    has_migration=true
    break
  fi
done
[ "$has_migration" = true ] || fail "No migration.sql files found below $MIGRATIONS_DIR"

command -v node >/dev/null 2>&1 || fail 'node is required to prepare a credential-safe PostgreSQL connection'
if [ -n "${PSQL_BIN:-}" ]; then
  [ -x "$PSQL_BIN" ] || fail "PSQL_BIN is not executable: $PSQL_BIN"
  psql_bin=$PSQL_BIN
else
  command -v psql >/dev/null 2>&1 || fail 'psql is required for migration-ledger preflight'
  psql_bin=$(command -v psql)
fi

if [ -n "${PRISMA_BIN:-}" ]; then
  [ -x "$PRISMA_BIN" ] || fail "PRISMA_BIN is not executable: $PRISMA_BIN"
  prisma_bin=$(CDPATH= cd -- "$(dirname -- "$PRISMA_BIN")" && pwd)/$(basename -- "$PRISMA_BIN")
elif [ -x "$REPO_ROOT/node_modules/.bin/prisma" ]; then
  prisma_bin=$REPO_ROOT/node_modules/.bin/prisma
else
  fail 'Prisma CLI not found; the runtime image must provide node_modules/.bin/prisma or PRISMA_BIN'
fi

export PGAPPNAME=${PGAPPNAME:-foodsystems-prisma-migrate}
cd "$REPO_ROOT"

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-migrate.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$MIGRATION_DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE node -e '
  const fs = require("node:fs")
  const url = new URL(process.env.RAW_DATABASE_URL)
  if (!/^postgres(ql)?:$/.test(url.protocol)) throw new Error("MIGRATION_DATABASE_URL must use PostgreSQL")
  if (url.searchParams.has("password") || url.searchParams.has("sslpassword")) throw new Error("put database passwords in the URL authority, not query parameters")
  const decode = value => decodeURIComponent(value)
  const escapeField = value => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:")
  const fields = [
    url.hostname || "localhost",
    url.port || "5432",
    decode(url.pathname.replace(/^\//, "")),
    decode(url.username),
    decode(url.password),
  ].map(escapeField)
  fs.writeFileSync(process.env.PGPASSFILE_PATH, `${fields.join(":")}\n`, { mode: 0o600 })
  url.password = ""
  url.searchParams.delete("schema")
  process.stdout.write(url.toString())
')

printf '%s\n' '[migrate] verifying controlled baseline before migrate deploy'
ledger_exists=$($psql_bin "$PSQL_DATABASE_URL" -X -A -t -q -v ON_ERROR_STOP=1 \
  -c 'SELECT to_regclass('"'"'public."_prisma_migrations"'"'"') IS NOT NULL')
[ "$ledger_exists" = t ] \
  || fail 'Prisma migration ledger is missing; this catch-up history cannot bootstrap an empty or unbaselined database'

applied_migrations=$($psql_bin "$PSQL_DATABASE_URL" -X -A -t -q -v ON_ERROR_STOP=1 \
  -c 'SELECT migration_name FROM public."_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name')
baseline_found=false
for migration_file in "$MIGRATIONS_DIR"/*/migration.sql; do
  migration_name=$(basename "$(dirname "$migration_file")")
  if ! printf '%s\n' "$applied_migrations" | grep -Fqx -- "$migration_name"; then
    fail "baseline migration is not completed: $migration_name; inspect schema, backup, and ledger before migrate resolve"
  fi
  if [ "$migration_name" = "$BASELINE_LAST_MIGRATION" ]; then
    baseline_found=true
    break
  fi
done
[ "$baseline_found" = true ] \
  || fail "baseline cutoff migration is missing from the repository: $BASELINE_LAST_MIGRATION"

printf '%s\n' '[migrate] applying pending migrations through Prisma ledger'
"$prisma_bin" migrate deploy --schema "$SCHEMA_FILE"

printf '%s\n' '[migrate] verifying migration ledger'
"$prisma_bin" migrate status --schema "$SCHEMA_FILE"

printf '%s\n' '[migrate] verifying database schema and generated-FTS contract'
PRISMA_BIN=$prisma_bin PRISMA_SCHEMA_FILE=$SCHEMA_FILE "$DRIFT_SCRIPT"

printf '%s\n' '[migrate] migration ledger and schema contract are current'
