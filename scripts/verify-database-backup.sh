#!/bin/sh
# Fail-closed structural, checksum, and metadata verification for a Food
# Systems pg_dump custom archive. This is necessary but not equivalent to a
# restore drill.
set -eu

usage() {
  cat <<'EOF'
Usage: verify-database-backup.sh /absolute/path/to/backup.dump

The adjacent .sha256 file is mandatory. Metadata v2, when present, must have a
valid adjacent .metadata.sha256 binding and adds DatabaseIdentity and
ControlledMutationAudit to the required archive relations.

Optional environment:
  BACKUP_REQUIRE_METADATA_V2  0 (default) preserves structural restore support
                              for historical backups; 1 rejects legacy backups
  BACKUP_REQUIRED_TABLES      Space-separated base relation list (default:
                              Document SourceCitation EvidenceAppraisal
                              _prisma_migrations)
EOF
}

fail() {
  printf '%s\n' "[db-backup-verify] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  -h|--help) usage; exit 0 ;;
  '') usage >&2; fail 'backup path is required' ;;
esac
[ "$#" -eq 1 ] || fail 'exactly one backup path is required'

backup_file=$1
case "$backup_file" in
  /*) ;;
  *) fail 'backup path must be absolute' ;;
esac
[ -f "$backup_file" ] || fail "backup file does not exist: $backup_file"
[ -s "$backup_file" ] || fail "backup file is empty: $backup_file"
[ -f "$backup_file.sha256" ] || fail "checksum file is missing: $backup_file.sha256"

for command_name in node pg_restore mktemp awk; do
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

expected_checksum=$(awk 'NR == 1 { print $1 }' "$backup_file.sha256")
case "$expected_checksum" in
  ''|*[!0-9a-fA-F]*) fail 'checksum file does not start with a hexadecimal SHA-256 digest' ;;
esac
[ "${#expected_checksum}" -eq 64 ] || fail 'checksum digest must contain exactly 64 hexadecimal characters'
actual_checksum=$(sha256_file "$backup_file")
[ "$actual_checksum" = "$expected_checksum" ] || fail 'SHA-256 mismatch; refusing to trust this backup'

case "${BACKUP_REQUIRE_METADATA_V2:-0}" in
  0|1) ;;
  *) fail 'BACKUP_REQUIRE_METADATA_V2 must be 0 or 1' ;;
esac
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CONTRACT_HELPER=$SCRIPT_DIR/database-backup-contract.mjs
[ -f "$CONTRACT_HELPER" ] || fail "backup contract helper is missing: $CONTRACT_HELPER"
metadata_status=$(node "$CONTRACT_HELPER" verify-metadata \
  --dump "$backup_file" \
  --require-v2 "${BACKUP_REQUIRE_METADATA_V2:-0}")
case "$metadata_status" in
  v2) ;;
  legacy)
    printf '%s\n' '[db-backup-verify] WARN: legacy backup accepted for historical restore only; it is not eligible for controlled mutation' >&2
    ;;
  *) fail "backup contract helper returned an unexpected metadata status: $metadata_status" ;;
esac

catalog_file=$(mktemp "${TMPDIR:-/tmp}/foodsystems-backup-catalog.XXXXXX")
trap 'rm -f "$catalog_file"' EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
pg_restore --list "$backup_file" >"$catalog_file"
[ -s "$catalog_file" ] || fail 'archive catalog is empty'

required_tables=${BACKUP_REQUIRED_TABLES:-'Document SourceCitation EvidenceAppraisal _prisma_migrations'}
if [ "$metadata_status" = v2 ]; then
  required_tables="$required_tables DatabaseIdentity ControlledMutationAudit"
fi
for table_name in $required_tables; do
  case "$table_name" in
    ''|*[!a-zA-Z0-9_]*) fail "invalid BACKUP_REQUIRED_TABLES entry: $table_name" ;;
  esac
  if ! grep -Eq "[[:space:]]TABLE[[:space:]]+public[[:space:]]+${table_name}([[:space:]]|$)" "$catalog_file"; then
    fail "required table is missing from archive catalog: public.$table_name"
  fi
done

rm -f "$catalog_file"
trap - EXIT HUP INT TERM
printf '%s\n' "[db-backup-verify] PASS: checksum and required archive objects verified for $backup_file"
printf '%s\n' "[db-backup-verify] metadata contract: $metadata_status"
