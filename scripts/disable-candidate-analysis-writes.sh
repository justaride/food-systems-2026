#!/bin/sh
# Emergency fail-safe: disable only the two candidate logins, revoke only their
# INSERT grants, and terminate only sessions owned by those exact logins.
set -eu

usage() {
  cat <<'EOF'
Usage: disable-candidate-analysis-writes.sh --apply

Required environment:
  DATABASE_ADMIN_URL                 PostgreSQL role/grant administrator URL

Optional environment:
  CANDIDATE_WORKER_DB_ROLE           Default: foodsystems_candidate_worker
  CANDIDATE_RECONCILER_DB_ROLE       Default: foodsystems_candidate_reconciler
  CANDIDATE_DB_SCHEMA                Default: public

This command preserves every row and every table. Recovery requires bootstrap
grants, enable-candidate-analysis-logins.sh with existing dedicated credentials,
then worker verification and reconciler verification.
EOF
}

fail() {
  printf '%s\n' "[candidate-disable] ERROR: $*" >&2
  exit 1
}

[ "$#" -eq 1 ] || { usage >&2; fail 'refusing to disable candidate writes without --apply'; }
case "$1" in
  --apply) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; fail 'refusing to disable candidate writes without --apply' ;;
esac

[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'
CANDIDATE_WORKER_DB_ROLE=${CANDIDATE_WORKER_DB_ROLE:-foodsystems_candidate_worker}
CANDIDATE_RECONCILER_DB_ROLE=${CANDIDATE_RECONCILER_DB_ROLE:-foodsystems_candidate_reconciler}
CANDIDATE_DB_SCHEMA=${CANDIDATE_DB_SCHEMA:-public}

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

command -v psql >/dev/null 2>&1 || fail 'psql is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-disable

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-disable.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$DATABASE_ADMIN_URL PGPASSFILE_PATH=$PGPASSFILE \
  CANDIDATE_URL_CONTEXT=candidate-disable \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
unset DATABASE_ADMIN_URL PGPASSWORD PGOPTIONS PGSERVICE PGSERVICEFILE
export CANDIDATE_WORKER_DB_ROLE CANDIDATE_RECONCILER_DB_ROLE CANDIDATE_DB_SCHEMA

psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE
\getenv target_schema CANDIDATE_DB_SCHEMA

SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', false);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', false);
DO $preflight$
BEGIN
  IF session_user <> current_user THEN
    RAISE EXCEPTION 'administrator session must not use SET ROLE';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = current_setting('foodsystems.candidate_worker_role')
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = current_setting('foodsystems.candidate_reconciler_role')
  ) THEN
    RAISE EXCEPTION 'both exact candidate roles must exist before disable';
  END IF;
END
$preflight$;

BEGIN;
SELECT format('ALTER ROLE %I NOLOGIN', :'worker_role')
\gexec
SELECT format('ALTER ROLE %I NOLOGIN', :'reconciler_role')
\gexec

-- Remove SET ROLE paths in both directions. An already-connected stronger
-- gateway cannot be identified by current_role through pg_stat_activity, but
-- complete INSERT revocation below removes the candidate authority it assumed.
SELECT format('REVOKE %I FROM %I', granted.rolname, member.rolname)
FROM pg_auth_members membership
JOIN pg_roles granted ON granted.oid = membership.roleid
JOIN pg_roles member ON member.oid = membership.member
WHERE member.rolname IN (:'worker_role', :'reconciler_role')
   OR granted.rolname IN (:'worker_role', :'reconciler_role')
\gexec

WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE INSERT ON ALL TABLES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
WITH user_relation_columns AS (
  SELECT namespace.nspname, class.relname,
    string_agg(format('%I', attribute.attname), ', ' ORDER BY attribute.attnum) AS column_list
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  JOIN pg_attribute attribute ON attribute.attrelid = class.oid
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
    AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND attribute.attnum > 0 AND NOT attribute.attisdropped
  GROUP BY namespace.nspname, class.relname
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format(
  'REVOKE INSERT (%s) ON TABLE %I.%I FROM %I',
  column_list, nspname, relname, role_name
)
FROM user_relation_columns CROSS JOIN candidate_role
\gexec
COMMIT;

-- NOLOGIN must be committed before terminating sessions so a new candidate
-- session cannot race the emergency stop between termination and commit.
SELECT pg_terminate_backend(activity.pid)
FROM pg_stat_activity activity
WHERE activity.usename IN (:'worker_role', :'reconciler_role')
  AND activity.pid <> pg_backend_pid();
SQL

printf '%s\n' '[candidate-disable] candidate writes disabled; no rows were deleted'
printf '%s\n' '[candidate-disable] recover only via bootstrap grants, existing-credential enable, worker verify, reconciler verify'
