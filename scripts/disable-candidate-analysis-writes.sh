#!/bin/sh
# Emergency fail-safe for the two exact candidate roles on one attested target.
set -eu

usage() {
  cat <<'EOF'
Usage: disable-candidate-analysis-writes.sh --apply

Required: DATABASE_ADMIN_URL
Optional role/schema variables keep their documented defaults. The four
CANDIDATE_EXPECTED_TARGET_* identity variables are all-or-none. Lock acquisition
is limited to 2 seconds and statements to 15 seconds. A mismatch or timeout is
an unresolved active security incident; resolve the endpoint/blocker and retry.
EOF
}

fail() {
  printf '%s\n' "[candidate-disable] ERROR: $*" >&2
  exit 1
}

[ "$#" -eq 1 ] || { usage >&2; fail 'refusing to disable candidate writes without --apply'; }
[ "$1" = '--apply' ] || { usage >&2; fail 'refusing to disable candidate writes without --apply'; }
[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'
CANDIDATE_WORKER_DB_ROLE=${CANDIDATE_WORKER_DB_ROLE:-foodsystems_candidate_worker}
CANDIDATE_RECONCILER_DB_ROLE=${CANDIDATE_RECONCILER_DB_ROLE:-foodsystems_candidate_reconciler}
CANDIDATE_DB_SCHEMA=${CANDIDATE_DB_SCHEMA:-public}
for role_name in "$CANDIDATE_WORKER_DB_ROLE" "$CANDIDATE_RECONCILER_DB_ROLE"; do
  case "$role_name" in
    ''|*[!a-z0-9_]*) fail 'candidate role names must contain only lowercase letters, digits, and underscores' ;;
  esac
done
[ "$CANDIDATE_WORKER_DB_ROLE" != "$CANDIDATE_RECONCILER_DB_ROLE" ] || fail 'worker and reconciler role names must be distinct'
case "$CANDIDATE_DB_SCHEMA" in
  ''|*[!a-zA-Z0-9_]*) fail 'CANDIDATE_DB_SCHEMA must be a simple PostgreSQL identifier' ;;
esac

expected_count=0
for expected_value in \
  "${CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER:-}" \
  "${CANDIDATE_EXPECTED_TARGET_DATABASE_HEX:-}" \
  "${CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX:-}" \
  "${CANDIDATE_EXPECTED_TARGET_SERVER_PORT:-}"
do
  [ -z "$expected_value" ] || expected_count=$((expected_count + 1))
done
[ "$expected_count" -eq 0 ] || [ "$expected_count" -eq 4 ] || fail 'expected target identity fields must be supplied together'

command -v psql >/dev/null 2>&1 || fail 'psql is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-disable

ADMIN_DATABASE_URL=$DATABASE_ADMIN_URL
unset DATABASE_ADMIN_URL
connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-disable.XXXXXX")
cleanup_connection() {
  unset PGPASSFILE
  rm -f "$connection_dir/pgpass" "$connection_dir/target.json"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$ADMIN_DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$connection_dir/target.json \
  CANDIDATE_URL_CONTEXT=candidate-disable \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
unset ADMIN_DATABASE_URL PGPASSWORD PGOPTIONS PGSERVICE PGSERVICEFILE

if [ "$expected_count" -eq 0 ]; then
  live_identity=$(psql "$PSQL_DATABASE_URL" -X -q -A -t -v ON_ERROR_STOP=1 -c \
    "SET statement_timeout TO '15s'; SELECT (SELECT system_identifier::text FROM pg_control_system()) || '|' || encode(convert_to(current_database(), 'UTF8'), 'hex') || '|' || encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex') || '|' || inet_server_port()::text") \
    || fail 'unresolved_active_security_incident: target identity could not be attested; resolve endpoint and retry'
  saved_ifs=$IFS
  IFS='|' read -r CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER CANDIDATE_EXPECTED_TARGET_DATABASE_HEX CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX CANDIDATE_EXPECTED_TARGET_SERVER_PORT <<EOF
$live_identity
EOF
  IFS=$saved_ifs
  unset live_identity
fi
case "$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER" in ''|*[!0-9]*) fail 'expected target system identifier is invalid' ;; esac
case "$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX" in ''|*[!0-9a-f]*) fail 'expected target database identity is invalid' ;; esac
case "$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX" in ''|*[!0-9a-f]*) fail 'expected target server address identity is invalid' ;; esac
case "$CANDIDATE_EXPECTED_TARGET_SERVER_PORT" in ''|*[!0-9]*) fail 'expected target server port identity is invalid' ;; esac

export CANDIDATE_WORKER_DB_ROLE CANDIDATE_RECONCILER_DB_ROLE CANDIDATE_DB_SCHEMA
export CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
export CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX CANDIDATE_EXPECTED_TARGET_SERVER_PORT

if ! psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE
\getenv target_schema CANDIDATE_DB_SCHEMA
\getenv expected_system_identifier CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER
\getenv expected_database_hex CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
\getenv expected_server_address_hex CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX
\getenv expected_server_port CANDIDATE_EXPECTED_TARGET_SERVER_PORT

SET lock_timeout TO '2s';
SET statement_timeout TO '15s';
BEGIN;
LOCK TABLE
  pg_catalog.pg_authid,
  pg_catalog.pg_auth_members,
  pg_catalog.pg_database,
  pg_catalog.pg_namespace,
  pg_catalog.pg_class,
  pg_catalog.pg_attribute,
  pg_catalog.pg_proc,
  pg_catalog.pg_default_acl,
  pg_catalog.pg_db_role_setting,
  pg_catalog.pg_parameter_acl,
  pg_catalog.pg_shdepend
IN SHARE ROW EXCLUSIVE MODE;
SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', true);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', true);
SELECT set_config('foodsystems.candidate_target_system_identifier', :'expected_system_identifier', true);
SELECT set_config('foodsystems.candidate_target_database_hex', :'expected_database_hex', true);
SELECT set_config('foodsystems.candidate_target_server_address_hex', :'expected_server_address_hex', true);
SELECT set_config('foodsystems.candidate_target_server_port', :'expected_server_port', true);
DO $preflight$
BEGIN
  IF session_user <> current_user THEN
    RAISE EXCEPTION 'administrator session must not use SET ROLE';
  END IF;
  IF (SELECT system_identifier::text FROM pg_control_system()) <> current_setting('foodsystems.candidate_target_system_identifier')
    OR encode(convert_to(current_database(), 'UTF8'), 'hex') <> current_setting('foodsystems.candidate_target_database_hex')
    OR encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex') <> current_setting('foodsystems.candidate_target_server_address_hex')
    OR inet_server_port()::text <> current_setting('foodsystems.candidate_target_server_port') THEN
    RAISE EXCEPTION 'target_identity_mismatch: refusing candidate disable mutation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_setting('foodsystems.candidate_worker_role'))
    OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_setting('foodsystems.candidate_reconciler_role')) THEN
    RAISE EXCEPTION 'both exact candidate roles must exist before disable';
  END IF;
END
$preflight$;

SELECT format('ALTER ROLE %I NOLOGIN', :'worker_role')
\gexec
SELECT format('ALTER ROLE %I NOLOGIN', :'reconciler_role')
\gexec
SELECT format('REVOKE %I FROM %I', granted.rolname, member.rolname)
FROM pg_auth_members membership
JOIN pg_roles granted ON granted.oid = membership.roleid
JOIN pg_roles member ON member.oid = membership.member
WHERE member.rolname IN (:'worker_role', :'reconciler_role') OR granted.rolname IN (:'worker_role', :'reconciler_role')
\gexec
WITH user_schema AS (
  SELECT nspname FROM pg_namespace WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (VALUES (:'worker_role'), (:'reconciler_role'))
SELECT format('REVOKE INSERT ON ALL TABLES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
WITH user_relation_columns AS (
  SELECT namespace.nspname, class.relname, string_agg(format('%I', attribute.attname), ', ' ORDER BY attribute.attnum) AS column_list
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  JOIN pg_attribute attribute ON attribute.attrelid = class.oid
  WHERE namespace.nspname <> 'information_schema' AND namespace.nspname !~ '^pg_'
    AND class.relkind IN ('r', 'p', 'v', 'm', 'f') AND attribute.attnum > 0 AND NOT attribute.attisdropped
  GROUP BY namespace.nspname, class.relname
), candidate_role(role_name) AS (VALUES (:'worker_role'), (:'reconciler_role'))
SELECT format('REVOKE INSERT (%s) ON TABLE %I.%I FROM %I', column_list, nspname, relname, role_name)
FROM user_relation_columns CROSS JOIN candidate_role
\gexec
WITH user_schema AS (
  SELECT nspname FROM pg_namespace WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (VALUES (:'worker_role'), (:'reconciler_role'))
SELECT format('REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
WITH user_schema AS (
  SELECT nspname FROM pg_namespace WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (VALUES (:'worker_role'), (:'reconciler_role'))
SELECT format('REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
COMMIT;

SELECT pg_terminate_backend(activity.pid, 5000)
FROM pg_stat_activity activity
WHERE activity.usename IN (:'worker_role', :'reconciler_role') AND activity.pid <> pg_backend_pid();
SELECT pg_stat_clear_snapshot();
SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', false);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', false);
SELECT set_config('foodsystems.candidate_target_system_identifier', :'expected_system_identifier', false);
SELECT set_config('foodsystems.candidate_target_database_hex', :'expected_database_hex', false);
SELECT set_config('foodsystems.candidate_target_server_address_hex', :'expected_server_address_hex', false);
SELECT set_config('foodsystems.candidate_target_server_port', :'expected_server_port', false);
DO $final_verification$
DECLARE candidate_role_name text;
BEGIN
  IF (SELECT system_identifier::text FROM pg_control_system()) <> current_setting('foodsystems.candidate_target_system_identifier')
    OR encode(convert_to(current_database(), 'UTF8'), 'hex') <> current_setting('foodsystems.candidate_target_database_hex')
    OR encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex') <> current_setting('foodsystems.candidate_target_server_address_hex')
    OR inet_server_port()::text <> current_setting('foodsystems.candidate_target_server_port') THEN
    RAISE EXCEPTION 'target_identity_mismatch: final disabled verification changed target';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) AND rolcanlogin)
    OR EXISTS (SELECT 1 FROM pg_stat_activity WHERE usename IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) AND pid <> pg_backend_pid()) THEN
    RAISE EXCEPTION 'candidate disabled-state verification failed';
  END IF;
  FOR candidate_role_name IN SELECT * FROM (VALUES
    (current_setting('foodsystems.candidate_worker_role')),
    (current_setting('foodsystems.candidate_reconciler_role'))
  ) role(role_name)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class class JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
      WHERE namespace.nspname <> 'information_schema' AND namespace.nspname !~ '^pg_'
        AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
        AND (has_table_privilege(candidate_role_name, class.oid, 'INSERT') OR has_any_column_privilege(candidate_role_name, class.oid, 'INSERT'))
    ) OR EXISTS (
      SELECT 1 FROM pg_proc procedure JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
      WHERE namespace.nspname <> 'information_schema' AND namespace.nspname !~ '^pg_'
        AND has_function_privilege(candidate_role_name, procedure.oid, 'EXECUTE')
    ) THEN
      RAISE EXCEPTION 'candidate disabled-state writer authority verification failed';
    END IF;
  END LOOP;
END
$final_verification$;
SQL
then
  fail 'unresolved_active_security_incident: target-bound disable was not proven (target_identity_mismatch or lock/statement timeout); resolve endpoint/blocker and retry'
fi

printf '%s\n' '[candidate-disable] PASS: target-bound candidate writes disabled and verified; no rows were deleted'
printf '%s\n' '[candidate-disable] recover only via bootstrap grants, existing-credential enable, worker verify, reconciler verify'
