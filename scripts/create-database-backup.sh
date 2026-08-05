#!/bin/sh
# Create a PostgreSQL custom-format dump, validate its structure, and publish
# it atomically with checksum + hash-bound metadata v2.
# The script does not upload or delete backups; retention/off-node copying is
# an explicit operator responsibility documented in POSTGRES-MCP-SETUP.md.
set -eu

usage() {
  cat <<'EOF'
Usage: create-database-backup.sh

Required environment:
  DATABASE_URL          Source PostgreSQL URL
  DATABASE_BACKUP_DIR   Absolute destination directory (mode 0700 recommended)

Optional environment:
  DATABASE_BACKUP_LABEL Filename prefix (default: foodsystems)

The source must already contain the DatabaseIdentity and
ControlledMutationAudit release-control tables. Metadata v2 binds the dump
bytes to the primary database UUID, the full completed Prisma ledger digest,
exact core counts, and a deterministic database fingerprint.
EOF
}

fail() {
  printf '%s\n' "[db-backup] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  -h|--help) usage; exit 0 ;;
  '') ;;
  *) usage >&2; fail "unknown argument: $1" ;;
esac

[ -n "${DATABASE_URL:-}" ] || fail 'DATABASE_URL is required'
[ -n "${DATABASE_BACKUP_DIR:-}" ] || fail 'DATABASE_BACKUP_DIR is required; no implicit /tmp or repository destination is allowed'
case "$DATABASE_BACKUP_DIR" in
  /*) ;;
  *) fail 'DATABASE_BACKUP_DIR must be an absolute path' ;;
esac
case "$DATABASE_BACKUP_DIR" in
  /|/tmp|/var/tmp) fail 'DATABASE_BACKUP_DIR must be a dedicated subdirectory, not a broad system directory' ;;
esac

DATABASE_BACKUP_LABEL=${DATABASE_BACKUP_LABEL:-foodsystems}
case "$DATABASE_BACKUP_LABEL" in
  ''|*[!a-zA-Z0-9_-]*) fail 'DATABASE_BACKUP_LABEL contains unsupported filename characters' ;;
esac

for command_name in node pg_dump pg_restore psql find mktemp awk chmod mv wc tr date; do
  command -v "$command_name" >/dev/null 2>&1 || fail "$command_name is required"
done

if ! command -v sha256sum >/dev/null 2>&1 && ! command -v openssl >/dev/null 2>&1; then
  fail 'sha256sum or openssl is required for SHA-256 verification'
fi

sha256_file() {
  checksum_value=''
  if command -v sha256sum >/dev/null 2>&1; then
    checksum_value=$(sha256sum "$1" 2>/dev/null | awk 'NR == 1 { print $1 }') || checksum_value=''
    case "$checksum_value" in
      *[!0-9a-fA-F]*|'') checksum_value='' ;;
    esac
    if [ "${#checksum_value}" -eq 64 ]; then
      printf '%s\n' "$checksum_value"
      return 0
    fi
  fi

  if command -v openssl >/dev/null 2>&1; then
    checksum_value=$(openssl dgst -sha256 "$1" 2>/dev/null | awk 'NR == 1 { print $NF }') || checksum_value=''
    case "$checksum_value" in
      *[!0-9a-fA-F]*|'') checksum_value='' ;;
    esac
    if [ "${#checksum_value}" -eq 64 ]; then
      printf '%s\n' "$checksum_value"
      return 0
    fi
  fi

  fail 'could not calculate a valid SHA-256 digest with sha256sum or openssl'
}

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VERIFY_SCRIPT=$SCRIPT_DIR/verify-database-backup.sh
CONTRACT_HELPER=$SCRIPT_DIR/database-backup-contract.mjs
SNAPSHOT_SQL=$SCRIPT_DIR/database-backup-snapshot.sql
[ -x "$VERIFY_SCRIPT" ] || fail "backup verifier is missing or not executable: $VERIFY_SCRIPT"
[ -f "$CONTRACT_HELPER" ] || fail "backup contract helper is missing: $CONTRACT_HELPER"
[ -f "$SNAPSHOT_SQL" ] || fail "backup snapshot SQL is missing: $SNAPSHOT_SQL"

umask 077
mkdir -p "$DATABASE_BACKUP_DIR"
[ -d "$DATABASE_BACKUP_DIR" ] || fail "backup directory does not exist: $DATABASE_BACKUP_DIR"
[ -w "$DATABASE_BACKUP_DIR" ] || fail "backup directory is not writable: $DATABASE_BACKUP_DIR"
if [ -n "$(find "$DATABASE_BACKUP_DIR" -prune -perm -022 -print)" ]; then
  fail 'DATABASE_BACKUP_DIR must not be group- or world-writable'
fi

timestamp=$(date -u '+%Y%m%dT%H%M%SZ')
final_file=$DATABASE_BACKUP_DIR/$DATABASE_BACKUP_LABEL-$timestamp.dump
[ ! -e "$final_file" ] || fail "backup already exists: $final_file"
[ ! -e "$final_file.sha256" ] || fail "backup checksum sidecar already exists: $final_file.sha256"
[ ! -e "$final_file.metadata" ] || fail "backup metadata sidecar already exists: $final_file.metadata"
[ ! -e "$final_file.metadata.sha256" ] || fail "backup metadata checksum sidecar already exists: $final_file.metadata.sha256"
lock_file=$final_file.lock
if ! (set -C; : >"$lock_file") 2>/dev/null; then
  fail "another backup process owns the target timestamp: $lock_file"
fi

if ! temporary_file=$(mktemp "$DATABASE_BACKUP_DIR/.${DATABASE_BACKUP_LABEL}.dump.XXXXXX"); then
  rm -f "$lock_file"
  fail 'could not allocate a temporary backup file'
fi
temporary_list=$temporary_file.list
temporary_checksum=$temporary_file.sha256
temporary_metadata=$temporary_file.metadata
temporary_metadata_checksum=$temporary_file.metadata.sha256
temporary_snapshot_before=$temporary_file.snapshot-before.json
temporary_snapshot_after=$temporary_file.snapshot-after.json
published=false
connection_dir=''

cleanup() {
  cleanup_status=$?
  trap - EXIT HUP INT TERM
  set +e
  if [ "$published" != true ]; then
    rm -f \
      "$temporary_file" \
      "$temporary_list" \
      "$temporary_checksum" \
      "$temporary_metadata" \
      "$temporary_metadata_checksum" \
      "$temporary_snapshot_before" \
      "$temporary_snapshot_after"
    # These paths were proven absent before this process acquired its unique
    # lock. Removing all four unconditionally closes signal windows between
    # individual atomic renames.
    rm -f \
      "$final_file" \
      "$final_file.sha256" \
      "$final_file.metadata" \
      "$final_file.metadata.sha256"
  fi
  if [ -n "$connection_dir" ]; then
    rm -f \
      "$connection_dir/host" \
      "$connection_dir/port" \
      "$connection_dir/database" \
      "$connection_dir/user" \
      "$connection_dir/sslmode" \
      "$connection_dir/pgpass"
    rmdir "$connection_dir" 2>/dev/null
  fi
  rm -f "$lock_file"
  exit "$cleanup_status"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-backup-credentials.XXXXXX") || fail 'could not allocate a private connection directory'
chmod 700 "$connection_dir"
if ! RAW_DATABASE_URL=$DATABASE_URL DATABASE_CONNECTION_DIR=$connection_dir node <<'NODE'
const fs = require('node:fs')
const path = require('node:path')

try {
  const url = new URL(process.env.RAW_DATABASE_URL)
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('unsupported protocol')
  }

  const decode = (value) => decodeURIComponent(value)
  const values = {
    host: decode(url.hostname),
    port: url.port || '5432',
    database: decode(url.pathname.replace(/^\//, '')),
    user: decode(url.username),
    sslmode: url.searchParams.get('sslmode') || 'prefer',
  }
  const password = decode(url.password)

  if (!values.database || !values.user || !/^\d+$/.test(values.port)) {
    throw new Error('missing required connection component')
  }
  if (!['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'].includes(values.sslmode)) {
    throw new Error('unsupported sslmode')
  }
  for (const value of [...Object.values(values), password]) {
    if (/[\0\r\n]/.test(value)) throw new Error('unsafe connection component')
  }

  const writePrivate = (name, value) => fs.writeFileSync(
    path.join(process.env.DATABASE_CONNECTION_DIR, name),
    `${value}\n`,
    { encoding: 'utf8', mode: 0o600, flag: 'wx' },
  )
  for (const [name, value] of Object.entries(values)) writePrivate(name, value)

  const escapePgpass = (value) => value.replace(/\\/g, '\\\\').replace(/:/g, '\\:')
  writePrivate('pgpass', [values.host, values.port, values.database, values.user, password]
    .map(escapePgpass)
    .join(':'))
} catch {
  console.error('[db-backup] ERROR: DATABASE_URL is not a valid supported PostgreSQL URL')
  process.exit(1)
}
NODE
then
  fail 'could not derive private libpq connection settings from DATABASE_URL'
fi

PGHOST=$(cat "$connection_dir/host")
PGPORT=$(cat "$connection_dir/port")
PGDATABASE=$(cat "$connection_dir/database")
PGUSER=$(cat "$connection_dir/user")
PGSSLMODE=$(cat "$connection_dir/sslmode")
PGPASSFILE=$connection_dir/pgpass
export PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE PGPASSFILE
unset PGPASSWORD DATABASE_URL

psql -X -A -t -q -v ON_ERROR_STOP=1 -f "$SNAPSHOT_SQL" >"$temporary_snapshot_before"
[ -s "$temporary_snapshot_before" ] || fail 'metadata v2 pre-dump snapshot is empty'

printf '%s\n' '[db-backup] creating PostgreSQL custom-format dump'
pg_dump \
  --format=custom \
  --compress=6 \
  --no-owner \
  --no-acl \
  --file="$temporary_file"

[ -s "$temporary_file" ] || fail 'pg_dump produced an empty file'
pg_restore --list "$temporary_file" >"$temporary_list"
[ -s "$temporary_list" ] || fail 'pg_restore could not produce a non-empty archive catalog'

psql -X -A -t -q -v ON_ERROR_STOP=1 -f "$SNAPSHOT_SQL" >"$temporary_snapshot_after"
[ -s "$temporary_snapshot_after" ] || fail 'metadata v2 post-dump snapshot is empty'

checksum=$(sha256_file "$temporary_file")
bytes=$(wc -c <"$temporary_file" | tr -d ' ')
created_at_utc=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

printf '%s  %s\n' "$checksum" "$(basename "$final_file")" >"$temporary_checksum"
node "$CONTRACT_HELPER" build-metadata \
  --snapshot-before "$temporary_snapshot_before" \
  --snapshot-after "$temporary_snapshot_after" \
  --dump "$temporary_file" \
  --dump-file-name "$(basename "$final_file")" \
  --dump-sha256 "$checksum" \
  --dump-bytes "$bytes" \
  --created-at-utc "$created_at_utc" \
  --output "$temporary_metadata" \
  --binding-output "$temporary_metadata_checksum"

BACKUP_REQUIRE_METADATA_V2=1 "$VERIFY_SCRIPT" "$temporary_file"
rm -f "$temporary_list" "$temporary_snapshot_before" "$temporary_snapshot_after"

# Publish the sidecars first and the dump last. Observers never see the final
# dump path before its checksum and metadata are already present.
mv "$temporary_metadata_checksum" "$final_file.metadata.sha256"
mv "$temporary_metadata" "$final_file.metadata"
mv "$temporary_checksum" "$final_file.sha256"
mv "$temporary_file" "$final_file"
published=true

printf '%s\n' "[db-backup] PASS: $final_file"
printf '%s\n' '[db-backup] backup is local only until copied to an access-controlled off-node destination'
