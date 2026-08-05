#!/bin/sh
# Restore a verified backup into a newly created disposable database, run
# project-level integrity checks, and drop the disposable database afterward.
set -eu

usage() {
  cat <<'EOF'
Usage: restore-database-backup-drill.sh /absolute/path/to/backup.dump

Required environment:
  DATABASE_RESTORE_ADMIN_URL  Admin URL, normally connected to postgres
  RESTORE_DATABASE_NAME      New disposable DB matching foodsystems_restore_*
  RESTORE_DRILL_ACK          Must equal: I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE

Optional environment:
  RESTORE_RECEIPT_PATH     Absolute, new JSON receipt path. When set, metadata
                           v2 is mandatory. The private receipt is published
                           atomically only after restore verification, exact
                           metadata binding, successful drop, and confirmed
                           target-database absence.
  RESTORE_EXPECTED_DOCUMENT_COUNT
                             Exact Document row count expected after restore
  RESTORE_EXPECTED_SOURCE_CITATION_COUNT
                             Exact SourceCitation row count expected after restore
  RESTORE_EXPECTED_FIELD_CITATION_COUNT
                             Exact FieldCitation row count expected after restore
  RESTORE_EXPECTED_REPORT_COUNT
                             Exact Report row count expected after restore
  RESTORE_EXPECTED_THESIS_COUNT
                             Exact Thesis row count expected after restore
  RESTORE_EXPECTED_SOURCE_DOC_COUNT
                             Exact SourceDoc row count expected after restore
  RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT
                             Exact LibraryAnalysisRecord row count expected
                             after restore
  RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT
                             Exact EvidenceAppraisal row count expected after
                             restore; zero is valid before human appraisal

All expected-count values must be non-negative integers. Zero is preserved as
an exact expectation where the restored data contract permits an empty table.

The target database must not already exist. The script creates it, restores
the archive, verifies core objects/data/constraints/indexes, and drops only the
exact validated target name on exit. It never overwrites an existing DB or an
existing receipt. Historical backups remain restoreable without a receipt;
they are not eligible as controlled-mutation evidence.
EOF
}

fail() {
  printf '%s\n' "[db-restore-drill] ERROR: $*" >&2
  exit 1
}

validate_expected_count() {
  expected_count_name=$1
  expected_count_value=$2
  case "$expected_count_value" in
    '') ;;
    *[!0-9]*) fail "$expected_count_name must be a non-negative integer" ;;
  esac
}

case "${1:-}" in
  -h|--help) usage; exit 0 ;;
  '') usage >&2; fail 'backup path is required' ;;
esac
[ "$#" -eq 1 ] || fail 'exactly one backup path is required'
[ -n "${DATABASE_RESTORE_ADMIN_URL:-}" ] || fail 'DATABASE_RESTORE_ADMIN_URL is required'
[ -n "${RESTORE_DATABASE_NAME:-}" ] || fail 'RESTORE_DATABASE_NAME is required'
[ "${RESTORE_DRILL_ACK:-}" = 'I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE' ] || fail 'explicit RESTORE_DRILL_ACK is required'
validate_expected_count RESTORE_EXPECTED_DOCUMENT_COUNT "${RESTORE_EXPECTED_DOCUMENT_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_SOURCE_CITATION_COUNT "${RESTORE_EXPECTED_SOURCE_CITATION_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_FIELD_CITATION_COUNT "${RESTORE_EXPECTED_FIELD_CITATION_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_REPORT_COUNT "${RESTORE_EXPECTED_REPORT_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_THESIS_COUNT "${RESTORE_EXPECTED_THESIS_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_SOURCE_DOC_COUNT "${RESTORE_EXPECTED_SOURCE_DOC_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT "${RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT:-}"
validate_expected_count RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT "${RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT:-}"

case "$RESTORE_DATABASE_NAME" in
  foodsystems_restore_[a-z0-9_]*) ;;
  *) fail 'RESTORE_DATABASE_NAME must begin with foodsystems_restore_ and use lowercase letters, digits, or underscores' ;;
esac
case "$RESTORE_DATABASE_NAME" in
  *[!a-z0-9_]*) fail 'RESTORE_DATABASE_NAME contains unsupported characters' ;;
esac

for command_name in node psql createdb dropdb pg_restore mktemp chmod rm rmdir; do
  command -v "$command_name" >/dev/null 2>&1 || fail "$command_name is required"
done

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VERIFY_SCRIPT=$SCRIPT_DIR/verify-database-backup.sh
CONTRACT_HELPER=$SCRIPT_DIR/database-backup-contract.mjs
SNAPSHOT_SQL=$SCRIPT_DIR/database-backup-snapshot.sql
[ -x "$VERIFY_SCRIPT" ] || fail "backup verifier is missing or not executable: $VERIFY_SCRIPT"
[ -f "$CONTRACT_HELPER" ] || fail "backup contract helper is missing: $CONTRACT_HELPER"
[ -f "$SNAPSHOT_SQL" ] || fail "backup snapshot SQL is missing: $SNAPSHOT_SQL"

target_reserved=false
connection_dir=''
ADMIN_URL=''
restored_snapshot=''
restore_completed=false
receipt_requested=false
receipt_path=${RESTORE_RECEIPT_PATH:-}
receipt_lock_file=''
receipt_lock_owned=false
receipt_write_started=false

if [ -n "$receipt_path" ]; then
  receipt_requested=true
fi

cleanup_target() {
  if [ "$target_reserved" = true ]; then
    # ADMIN_URL contains only the maintenance database name. Authentication is
    # supplied through the private libpq environment and PGPASSFILE.
    if ! dropdb --maintenance-db="$ADMIN_URL" --if-exists "$RESTORE_DATABASE_NAME"; then
      printf '%s\n' "[db-restore-drill] ERROR: failed to remove disposable database $RESTORE_DATABASE_NAME" >&2
      return 1
    fi
    # Disarm immediately after our drop succeeds. If another process creates a
    # database with the same name before the absence check, the EXIT trap must
    # not mistake that new database for the disposable target we owned.
    target_reserved=false
  fi
}

cleanup_connection() {
  [ -n "$connection_dir" ] || return 0
  rm -f \
    "$connection_dir/host" \
    "$connection_dir/port" \
    "$connection_dir/database" \
    "$connection_dir/user" \
    "$connection_dir/sslmode" \
    "$connection_dir/pgpass" || return 1
  rmdir "$connection_dir" || return 1
  connection_dir=''
}

cleanup() {
  cleanup_status=$?
  cleanup_failure=0
  trap - EXIT HUP INT TERM
  set +e
  cleanup_target || cleanup_failure=1
  cleanup_connection || cleanup_failure=1
  if [ -n "$restored_snapshot" ]; then
    rm -f "$restored_snapshot" || cleanup_failure=1
  fi
  if [ "$receipt_write_started" = true ] && {
    [ "$cleanup_status" -ne 0 ] ||
    [ "$cleanup_failure" -ne 0 ] ||
    [ "$restore_completed" != true ];
  }; then
    rm -f "$receipt_path" || cleanup_failure=1
  fi
  if [ "$receipt_lock_owned" = true ]; then
    rm -f "$receipt_lock_file" || cleanup_failure=1
  fi
  if [ "$cleanup_status" -eq 0 ] && [ "$cleanup_failure" -ne 0 ]; then
    cleanup_status=1
  fi
  exit "$cleanup_status"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

require_metadata_v2=0
if [ "$receipt_requested" = true ]; then
  node "$CONTRACT_HELPER" validate-receipt-path --path "$receipt_path"
  receipt_lock_file=$receipt_path.lock
  if ! (set -C; : >"$receipt_lock_file") 2>/dev/null; then
    fail "another restore drill owns the receipt destination: $receipt_lock_file"
  fi
  receipt_lock_owned=true
  chmod 600 "$receipt_lock_file"
  [ ! -e "$receipt_path" ] || fail "RESTORE_RECEIPT_PATH already exists; refusing to overwrite: $receipt_path"
  require_metadata_v2=1
fi

BACKUP_REQUIRE_METADATA_V2=$require_metadata_v2 "$VERIFY_SCRIPT" "$1"
metadata_status=$(node "$CONTRACT_HELPER" verify-metadata \
  --dump "$1" \
  --require-v2 "$require_metadata_v2")

umask 077
connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-restore-credentials.XXXXXX") || fail 'could not allocate a private connection directory'
chmod 700 "$connection_dir"
if ! RAW_DATABASE_URL=$DATABASE_RESTORE_ADMIN_URL DATABASE_CONNECTION_DIR=$connection_dir node <<'NODE'
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
  writePrivate('pgpass', [values.host, values.port, '*', values.user, password]
    .map(escapePgpass)
    .join(':'))
} catch {
  console.error('[db-restore-drill] ERROR: DATABASE_RESTORE_ADMIN_URL is not a valid supported PostgreSQL URL')
  process.exit(1)
}
NODE
then
  fail 'could not derive private libpq connection settings from DATABASE_RESTORE_ADMIN_URL'
fi

PGHOST=$(cat "$connection_dir/host")
PGPORT=$(cat "$connection_dir/port")
PGDATABASE=$(cat "$connection_dir/database")
PGUSER=$(cat "$connection_dir/user")
PGSSLMODE=$(cat "$connection_dir/sslmode")
PGPASSFILE=$connection_dir/pgpass
export PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE PGPASSFILE
unset PGPASSWORD DATABASE_RESTORE_ADMIN_URL
# Despite the historical variable name, this value is only the maintenance
# database identifier; connection credentials remain in the private pgpass file.
ADMIN_URL=$PGDATABASE

already_exists=$(psql -X -A -t -v ON_ERROR_STOP=1 -v database_name="$RESTORE_DATABASE_NAME" <<'SQL'
SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'database_name');
SQL
)
[ "$already_exists" = f ] || fail "target database already exists; refusing to overwrite or drop it: $RESTORE_DATABASE_NAME"

printf '%s\n' "[db-restore-drill] creating disposable database $RESTORE_DATABASE_NAME"
createdb --maintenance-db="$ADMIN_URL" --template=template0 --encoding=UTF8 "$RESTORE_DATABASE_NAME"
# Arm destructive cleanup only after createdb confirms that this process
# created the target. A signal in this tiny interval can leave a clearly
# disposable database behind, but can never make us drop a race-created DB.
target_reserved=true

printf '%s\n' '[db-restore-drill] restoring verified archive'
pg_restore \
  --exit-on-error \
  --no-owner \
  --no-acl \
  --dbname="$RESTORE_DATABASE_NAME" \
  "$1"

PGDATABASE=$RESTORE_DATABASE_NAME psql -X -v ON_ERROR_STOP=1 <<'SQL'
DO $verify$
DECLARE
  relation_name text;
  row_count bigint;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'public."Document"',
    'public."SourceCitation"',
    'public."FieldCitation"',
    'public."Report"',
    'public."Thesis"',
    'public."SourceDoc"',
    'public."EvidenceAppraisal"',
    'public."LibraryAnalysisRecord"',
    'public."_prisma_migrations"'
  ] LOOP
    IF to_regclass(relation_name) IS NULL THEN
      RAISE EXCEPTION 'required relation missing after restore: %', relation_name;
    END IF;
  END LOOP;

  EXECUTE 'SELECT count(*) FROM public."Document"' INTO row_count;
  IF row_count = 0 THEN
    RAISE EXCEPTION 'Document is empty after restore';
  END IF;

  EXECUTE 'SELECT count(*) FROM public."SourceCitation"' INTO row_count;
  IF row_count = 0 THEN
    RAISE EXCEPTION 'SourceCitation is empty after restore';
  END IF;

  EXECUTE 'SELECT count(*) FROM public."LibraryAnalysisRecord"' INTO row_count;
  IF row_count = 0 THEN
    RAISE EXCEPTION 'LibraryAnalysisRecord is empty after restore';
  END IF;

  EXECUTE 'SELECT count(*) FROM public."_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL' INTO row_count;
  IF row_count = 0 THEN
    RAISE EXCEPTION 'no completed Prisma migration ledger entries after restore';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_index WHERE NOT indisvalid OR NOT indisready
  ) THEN
    RAISE EXCEPTION 'invalid or unready index found after restore';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE NOT convalidated
  ) THEN
    RAISE EXCEPTION 'unvalidated constraint found after restore';
  END IF;
END
$verify$;
SQL

verify_expected_count() {
  expected_count_name=$1
  relation_name=$2
  expected_count_value=$3
  [ -n "$expected_count_value" ] || return 0

  case "$relation_name" in
    Document|SourceCitation|FieldCitation|Report|Thesis|SourceDoc|LibraryAnalysisRecord|EvidenceAppraisal) ;;
    *) fail "internal unsupported exact-count relation: $relation_name" ;;
  esac

  restored_count=$(PGDATABASE=$RESTORE_DATABASE_NAME psql -X -A -t -v ON_ERROR_STOP=1 \
    -c "SELECT count(*) FROM public.\"$relation_name\"")
  [ "$restored_count" = "$expected_count_value" ] \
    || fail "$relation_name count mismatch after restore: expected $expected_count_value, got $restored_count"
  printf '%s\n' "[db-restore-drill] exact $relation_name count verified: $restored_count ($expected_count_name)"
}

verify_expected_count RESTORE_EXPECTED_DOCUMENT_COUNT Document "${RESTORE_EXPECTED_DOCUMENT_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_SOURCE_CITATION_COUNT SourceCitation "${RESTORE_EXPECTED_SOURCE_CITATION_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_FIELD_CITATION_COUNT FieldCitation "${RESTORE_EXPECTED_FIELD_CITATION_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_REPORT_COUNT Report "${RESTORE_EXPECTED_REPORT_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_THESIS_COUNT Thesis "${RESTORE_EXPECTED_THESIS_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_SOURCE_DOC_COUNT SourceDoc "${RESTORE_EXPECTED_SOURCE_DOC_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT LibraryAnalysisRecord "${RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT:-}"
verify_expected_count RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT EvidenceAppraisal "${RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT:-}"

if [ "$metadata_status" = v2 ]; then
  restored_snapshot=$(mktemp "${TMPDIR:-/tmp}/foodsystems-restored-snapshot.XXXXXX") \
    || fail 'could not allocate restored database snapshot file'
  PGDATABASE=$RESTORE_DATABASE_NAME psql -X -A -t -q -v ON_ERROR_STOP=1 \
    -f "$SNAPSHOT_SQL" >"$restored_snapshot"
  [ -s "$restored_snapshot" ] || fail 'restored metadata v2 database snapshot is empty'
  restored_fingerprint=$(node "$CONTRACT_HELPER" verify-restored-snapshot \
    --metadata "$1.metadata" \
    --snapshot "$restored_snapshot")
  printf '%s\n' "[db-restore-drill] metadata v2 target fingerprint verified: $restored_fingerprint"
fi

printf '%s\n' '[db-restore-drill] restore and exact integrity checks passed'
cleanup_target || fail "failed to remove disposable database $RESTORE_DATABASE_NAME"
confirmed_absent=$(psql -X -A -t -v ON_ERROR_STOP=1 -v database_name="$RESTORE_DATABASE_NAME" <<'SQL'
SELECT NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'database_name');
SQL
)
[ "$confirmed_absent" = t ] || fail "disposable database absence could not be confirmed: $RESTORE_DATABASE_NAME"
printf '%s\n' "[db-restore-drill] cleanup PASS: disposable database $RESTORE_DATABASE_NAME was removed and confirmed absent"

cleanup_connection || fail 'failed to remove private restore connection material'

if [ "$receipt_requested" = true ]; then
  receipt_write_started=true
  node "$CONTRACT_HELPER" write-receipt \
    --dump "$1" \
    --snapshot "$restored_snapshot" \
    --path "$receipt_path" \
    --target-database "$RESTORE_DATABASE_NAME"
fi

if [ -n "$restored_snapshot" ]; then
  rm -f "$restored_snapshot" || fail 'failed to remove restored database snapshot material'
  restored_snapshot=''
fi
if [ "$receipt_lock_owned" = true ]; then
  rm -f "$receipt_lock_file" || fail 'failed to remove restore receipt lock'
  receipt_lock_owned=false
fi

if [ "$receipt_requested" = true ]; then
  printf '%s\n' "[db-restore-drill] receipt PASS: $receipt_path"
fi
printf '%s\n' "[db-restore-drill] PASS: disposable database $RESTORE_DATABASE_NAME was removed"
restore_completed=true
