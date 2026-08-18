#!/bin/sh
# Restore LOGIN only for the two existing candidate roles, using already
# provisioned dedicated credentials and failing back to the disabled state.
set -eu

usage() {
  cat <<'EOF'
Usage: enable-candidate-analysis-logins.sh --apply --confirm-existing-credentials

Required environment:
  DATABASE_ADMIN_URL                    PostgreSQL role administrator URL
  CANDIDATE_WORKER_DATABASE_URL         Existing dedicated worker login URL
  CANDIDATE_RECONCILER_DATABASE_URL     Existing dedicated reconciler login URL

Optional environment:
  CANDIDATE_WORKER_DB_ROLE              Default: foodsystems_candidate_worker
  CANDIDATE_RECONCILER_DB_ROLE          Default: foodsystems_candidate_reconciler
  CANDIDATE_DB_SCHEMA                   Default: public
  CANDIDATE_WORKER_DB_APP_NAME          Default: foodsystems-candidate-worker
  CANDIDATE_RECONCILER_DB_APP_NAME      Default: foodsystems-candidate-reconciler

This operation only enables the two exact existing roles. It never creates,
changes, transports, or logs a credential. Any failed verification invokes the
candidate disable operation before returning failure.
EOF
}

fail() {
  printf '%s\n' "[candidate-enable] ERROR: $*" >&2
  exit 1
}

[ "$#" -eq 2 ] || {
  usage >&2
  fail 'exactly --apply --confirm-existing-credentials is required'
}
[ "$1" = '--apply' ] && [ "$2" = '--confirm-existing-credentials' ] || {
  usage >&2
  fail 'exactly --apply --confirm-existing-credentials is required'
}

[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'
[ -n "${CANDIDATE_WORKER_DATABASE_URL:-}" ] \
  || fail 'CANDIDATE_WORKER_DATABASE_URL is required'
[ -n "${CANDIDATE_RECONCILER_DATABASE_URL:-}" ] \
  || fail 'CANDIDATE_RECONCILER_DATABASE_URL is required'

CANDIDATE_WORKER_DB_ROLE=${CANDIDATE_WORKER_DB_ROLE:-foodsystems_candidate_worker}
CANDIDATE_RECONCILER_DB_ROLE=${CANDIDATE_RECONCILER_DB_ROLE:-foodsystems_candidate_reconciler}
CANDIDATE_DB_SCHEMA=${CANDIDATE_DB_SCHEMA:-public}
CANDIDATE_WORKER_DB_APP_NAME=${CANDIDATE_WORKER_DB_APP_NAME:-foodsystems-candidate-worker}
CANDIDATE_RECONCILER_DB_APP_NAME=${CANDIDATE_RECONCILER_DB_APP_NAME:-foodsystems-candidate-reconciler}

for role_name in "$CANDIDATE_WORKER_DB_ROLE" "$CANDIDATE_RECONCILER_DB_ROLE"; do
  case "$role_name" in
    ''|*[!a-z0-9_]*) fail 'candidate role names must contain only lowercase letters, digits, and underscores' ;;
  esac
done
[ "$CANDIDATE_WORKER_DB_ROLE" != "$CANDIDATE_RECONCILER_DB_ROLE" ] \
  || fail 'worker and reconciler role names must be distinct'
case "$CANDIDATE_DB_SCHEMA" in
  ''|*[!a-zA-Z0-9_]*) fail 'CANDIDATE_DB_SCHEMA must be a simple PostgreSQL identifier' ;;
esac
for app_name in "$CANDIDATE_WORKER_DB_APP_NAME" "$CANDIDATE_RECONCILER_DB_APP_NAME"; do
  case "$app_name" in
    ''|*[!a-zA-Z0-9_-]*) fail 'candidate application names contain unsupported characters' ;;
  esac
done

command -v psql >/dev/null 2>&1 || fail 'psql is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-enable

ADMIN_DATABASE_URL=$DATABASE_ADMIN_URL
WORKER_DATABASE_URL=$CANDIDATE_WORKER_DATABASE_URL
RECONCILER_DATABASE_URL=$CANDIDATE_RECONCILER_DATABASE_URL
unset DATABASE_ADMIN_URL CANDIDATE_WORKER_DATABASE_URL CANDIDATE_RECONCILER_DATABASE_URL

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-enable.XXXXXX")
connection_active=1
cleanup_connection() {
  if [ "$connection_active" -eq 1 ]; then
    unset PGPASSFILE
    rm -f "$connection_dir/pgpass"
    rmdir "$connection_dir" 2>/dev/null || true
    connection_active=0
  fi
}

fail_safe_active=0
fail_safe_exit() {
  exit_status=$1
  trap - EXIT HUP INT TERM
  cleanup_connection
  if [ "$fail_safe_active" -eq 1 ]; then
    if ! DATABASE_ADMIN_URL=$ADMIN_DATABASE_URL \
      CANDIDATE_WORKER_DB_ROLE=$CANDIDATE_WORKER_DB_ROLE \
      CANDIDATE_RECONCILER_DB_ROLE=$CANDIDATE_RECONCILER_DB_ROLE \
      CANDIDATE_DB_SCHEMA=$CANDIDATE_DB_SCHEMA \
      "$SCRIPT_DIR/disable-candidate-analysis-writes.sh" --apply; then
      printf '%s\n' '[candidate-enable] ERROR: fail-safe disable operation failed' >&2
    fi
    exit_status=1
  fi
  unset ADMIN_DATABASE_URL WORKER_DATABASE_URL RECONCILER_DATABASE_URL
  exit "$exit_status"
}
trap 'fail_safe_exit $?' EXIT
trap 'fail_safe_exit 1' HUP INT TERM

export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$ADMIN_DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE \
  CANDIDATE_URL_CONTEXT=candidate-role-enable \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
export CANDIDATE_WORKER_DB_ROLE CANDIDATE_RECONCILER_DB_ROLE CANDIDATE_DB_SCHEMA
export CANDIDATE_WORKER_DB_APP_NAME CANDIDATE_RECONCILER_DB_APP_NAME

psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -f - <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE

SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', false);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', false);
DO $preflight$
DECLARE
  candidate_role_oid oid;
  target_worker_role text := current_setting('foodsystems.candidate_worker_role');
  target_reconciler_role text := current_setting('foodsystems.candidate_reconciler_role');
BEGIN
  IF session_user <> current_user THEN
    RAISE EXCEPTION 'administrator session must not use SET ROLE';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = current_user AND (rolsuper OR rolcreaterole)
  ) THEN
    RAISE EXCEPTION 'connected role must have CREATEROLE or SUPERUSER';
  END IF;
  IF EXISTS (
    SELECT role_name
    FROM (VALUES (target_worker_role), (target_reconciler_role)) roles(role_name)
    WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name)
  ) THEN
    RAISE EXCEPTION 'both exact candidate roles must exist before enable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname IN (target_worker_role, target_reconciler_role)
      AND (
        rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole
        OR rolreplication OR rolbypassrls OR rolinherit
      )
  ) THEN
    RAISE EXCEPTION 'candidate roles must be NOLOGIN without elevated attributes before enable';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_auth_members membership
    JOIN pg_roles granted ON granted.oid = membership.roleid
    JOIN pg_roles member ON member.oid = membership.member
    WHERE granted.rolname IN (target_worker_role, target_reconciler_role)
       OR member.rolname IN (target_worker_role, target_reconciler_role)
  ) THEN
    RAISE EXCEPTION 'candidate roles must have no membership path before enable';
  END IF;
  FOREACH candidate_role_oid IN ARRAY ARRAY[
    (SELECT oid FROM pg_roles WHERE rolname = target_worker_role),
    (SELECT oid FROM pg_roles WHERE rolname = target_reconciler_role)
  ]
  LOOP
    IF EXISTS (
      WITH user_schema AS (
        SELECT oid
        FROM pg_namespace
        WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
      )
      SELECT 1 FROM pg_namespace namespace
      WHERE namespace.oid IN (SELECT oid FROM user_schema)
        AND namespace.nspowner = candidate_role_oid
      UNION ALL
      SELECT 1 FROM pg_class class
      WHERE class.relnamespace IN (SELECT oid FROM user_schema)
        AND class.relowner = candidate_role_oid
      UNION ALL
      SELECT 1 FROM pg_proc procedure
      WHERE procedure.pronamespace IN (SELECT oid FROM user_schema)
        AND procedure.proowner = candidate_role_oid
      UNION ALL
      SELECT 1 FROM pg_type type
      WHERE type.typnamespace IN (SELECT oid FROM user_schema)
        AND type.typowner = candidate_role_oid
    ) THEN
      RAISE EXCEPTION 'candidate roles must own no object in a non-system schema before enable';
    END IF;
  END LOOP;
END
$preflight$;
SQL

# Activate fail-safe handling before the command that can commit LOGIN so a
# signal at any command boundary cannot leave an enabled, unverified role.
fail_safe_active=1
psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -f - <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE

BEGIN;
SELECT format('ALTER ROLE %I LOGIN', role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
COMMIT;
SQL

cleanup_connection

CANDIDATE_WORKER_DATABASE_URL=$WORKER_DATABASE_URL \
  "$SCRIPT_DIR/verify-candidate-analysis-roles.sh" --role=worker
CANDIDATE_RECONCILER_DATABASE_URL=$RECONCILER_DATABASE_URL \
  "$SCRIPT_DIR/verify-candidate-analysis-roles.sh" --role=reconciler

fail_safe_active=0
unset ADMIN_DATABASE_URL WORKER_DATABASE_URL RECONCILER_DATABASE_URL
trap - EXIT HUP INT TERM
printf '%s\n' '[candidate-enable] PASS: existing worker and reconciler credentials verified'
