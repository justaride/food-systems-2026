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
command -v cmp >/dev/null 2>&1 || fail 'cmp is required to bind database targets'
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
manifest_values=$(node "$SCRIPT_DIR/read-candidate-security-graph-manifest.mjs" \
  "$SCRIPT_DIR/candidate-security-graph.v1.json")
set -- $manifest_values
[ "$#" -eq 5 ] || fail 'candidate security manifest output is invalid'
CANDIDATE_SECURITY_MANIFEST_VERSION=$1
CANDIDATE_SECURITY_POSTGRES_MAJOR=$2
CANDIDATE_SECURITY_OWNER_POLICY=$3
CANDIDATE_SECURITY_CHECKER_SHA256=$4
CANDIDATE_SECURITY_GRAPH_SHA256=$5
unset manifest_values
export CANDIDATE_SECURITY_MANIFEST_VERSION CANDIDATE_SECURITY_POSTGRES_MAJOR
export CANDIDATE_SECURITY_OWNER_POLICY CANDIDATE_SECURITY_CHECKER_SHA256
export CANDIDATE_SECURITY_GRAPH_SHA256
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-enable

ADMIN_DATABASE_URL=$DATABASE_ADMIN_URL
WORKER_DATABASE_URL=$CANDIDATE_WORKER_DATABASE_URL
RECONCILER_DATABASE_URL=$CANDIDATE_RECONCILER_DATABASE_URL
unset DATABASE_ADMIN_URL CANDIDATE_WORKER_DATABASE_URL CANDIDATE_RECONCILER_DATABASE_URL

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-enable.XXXXXX")
ADMIN_PGPASSFILE=$connection_dir/admin.pgpass
WORKER_PGPASSFILE=$connection_dir/worker.pgpass
RECONCILER_PGPASSFILE=$connection_dir/reconciler.pgpass
ADMIN_TARGET_IDENTITY_FILE=$connection_dir/admin-target.json
WORKER_TARGET_IDENTITY_FILE=$connection_dir/worker-target.json
RECONCILER_TARGET_IDENTITY_FILE=$connection_dir/reconciler-target.json
connection_active=1
cleanup_connection() {
  if [ "$connection_active" -eq 1 ]; then
    unset PGPASSFILE
    rm -f \
      "$ADMIN_PGPASSFILE" \
      "$WORKER_PGPASSFILE" \
      "$RECONCILER_PGPASSFILE" \
      "$ADMIN_TARGET_IDENTITY_FILE" \
      "$WORKER_TARGET_IDENTITY_FILE" \
      "$RECONCILER_TARGET_IDENTITY_FILE"
    rmdir "$connection_dir" 2>/dev/null || true
    connection_active=0
  fi
}

fail_safe_active=0
fail_safe_exit() {
  exit_status=$1
  trap - EXIT HUP INT TERM
  if [ "$fail_safe_active" -eq 1 ]; then
    if ! DATABASE_ADMIN_URL=$ADMIN_DATABASE_URL \
      CANDIDATE_WORKER_DB_ROLE=$CANDIDATE_WORKER_DB_ROLE \
      CANDIDATE_RECONCILER_DB_ROLE=$CANDIDATE_RECONCILER_DB_ROLE \
      CANDIDATE_DB_SCHEMA=$CANDIDATE_DB_SCHEMA \
      CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER=${CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER:-} \
      CANDIDATE_EXPECTED_TARGET_DATABASE_HEX=${CANDIDATE_EXPECTED_TARGET_DATABASE_HEX:-} \
      CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX=${CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX:-} \
      CANDIDATE_EXPECTED_TARGET_SERVER_PORT=${CANDIDATE_EXPECTED_TARGET_SERVER_PORT:-} \
      "$SCRIPT_DIR/disable-candidate-analysis-writes.sh" --apply; then
      printf '%s\n' '[candidate-enable] ERROR: unresolved_active_security_incident: target-bound fail-safe disable was not proven' >&2
    fi
    exit_status=1
  fi
  cleanup_connection
  unset ADMIN_DATABASE_URL WORKER_DATABASE_URL RECONCILER_DATABASE_URL
  exit "$exit_status"
}
trap 'fail_safe_exit $?' EXIT
trap 'fail_safe_exit 1' HUP INT TERM

PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$ADMIN_DATABASE_URL \
  PGPASSFILE_PATH=$ADMIN_PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$ADMIN_TARGET_IDENTITY_FILE \
  CANDIDATE_URL_CONTEXT=candidate-role-enable \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")

# Once the exact admin URL can be reused safely, every later parsing, binding,
# capability, contract, activation, or verification failure fails back through
# the target-A disable operation.
fail_safe_active=1
RAW_DATABASE_URL=$WORKER_DATABASE_URL \
  PGPASSFILE_PATH=$WORKER_PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$WORKER_TARGET_IDENTITY_FILE \
  EXPECTED_URL_ROLE=$CANDIDATE_WORKER_DB_ROLE \
  EXPECTED_URL_APP=$CANDIDATE_WORKER_DB_APP_NAME \
  CANDIDATE_URL_CONTEXT=candidate-role-enable-worker \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs" >/dev/null
RAW_DATABASE_URL=$RECONCILER_DATABASE_URL \
  PGPASSFILE_PATH=$RECONCILER_PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$RECONCILER_TARGET_IDENTITY_FILE \
  EXPECTED_URL_ROLE=$CANDIDATE_RECONCILER_DB_ROLE \
  EXPECTED_URL_APP=$CANDIDATE_RECONCILER_DB_APP_NAME \
  CANDIDATE_URL_CONTEXT=candidate-role-enable-reconciler \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs" >/dev/null
if ! cmp -s "$ADMIN_TARGET_IDENTITY_FILE" "$WORKER_TARGET_IDENTITY_FILE" \
  || ! cmp -s "$ADMIN_TARGET_IDENTITY_FILE" "$RECONCILER_TARGET_IDENTITY_FILE"; then
  fail 'dedicated database URLs must match the exact admin endpoint and database'
fi

# system_identifier is a public, read-only cluster identity in PostgreSQL 16.
# Bind it with the live database and server endpoint without adding a helper,
# grant, SECURITY DEFINER path, or monitoring role.
ADMIN_LIVE_IDENTITY=$(PGPASSFILE=$ADMIN_PGPASSFILE \
  psql "$PSQL_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c \
  "SELECT (SELECT system_identifier::text FROM pg_control_system()) || '|' || encode(convert_to(current_database(), 'UTF8'), 'hex') || '|' || encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex') || '|' || inet_server_port()::text")
saved_ifs=$IFS
IFS='|' read -r \
  CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER \
  CANDIDATE_EXPECTED_TARGET_DATABASE_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_PORT <<EOF
$ADMIN_LIVE_IDENTITY
EOF
IFS=$saved_ifs
case "$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER" in
  ''|*[!0-9]*) fail 'admin live cluster identity is invalid' ;;
esac
case "$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX" in
  ''|*[!0-9a-f]*) fail 'admin live database identity is invalid' ;;
esac
case "$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX" in
  ''|*[!0-9a-f]*) fail 'admin live server address identity is invalid' ;;
esac
case "$CANDIDATE_EXPECTED_TARGET_SERVER_PORT" in
  ''|*[!0-9]*) fail 'admin live server port identity is invalid' ;;
esac
unset ADMIN_LIVE_IDENTITY
export CANDIDATE_WORKER_DB_ROLE CANDIDATE_RECONCILER_DB_ROLE CANDIDATE_DB_SCHEMA
export CANDIDATE_WORKER_DB_APP_NAME CANDIDATE_RECONCILER_DB_APP_NAME
export CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER
export CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
export CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX
export CANDIDATE_EXPECTED_TARGET_SERVER_PORT

PGPASSFILE=$ADMIN_PGPASSFILE \
psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -f - <<'SQL'
DO $capability$
BEGIN
  IF session_user <> current_user THEN
    RAISE EXCEPTION 'administrator session must not use SET ROLE';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = current_user AND rolsuper
  ) THEN
    RAISE EXCEPTION 'connected recovery administrator must be SUPERUSER';
  END IF;
END
$capability$;
SQL

PGPASSFILE=$ADMIN_PGPASSFILE \
psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 \
  -v expected_checker_sha256="$CANDIDATE_SECURITY_CHECKER_SHA256" \
  -v expected_graph_sha256="$CANDIDATE_SECURITY_GRAPH_SHA256" \
  -f "$SCRIPT_DIR/attest-candidate-security-graph.sql"

if ! PGPASSFILE=$ADMIN_PGPASSFILE \
psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 \
  -v security_attestation_sql="$SCRIPT_DIR/attest-candidate-security-graph.sql" \
  -v expected_checker_sha256="$CANDIDATE_SECURITY_CHECKER_SHA256" \
  -v expected_graph_sha256="$CANDIDATE_SECURITY_GRAPH_SHA256" \
  -f - <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE
\getenv target_schema CANDIDATE_DB_SCHEMA
\getenv worker_app_name CANDIDATE_WORKER_DB_APP_NAME
\getenv reconciler_app_name CANDIDATE_RECONCILER_DB_APP_NAME
\getenv expected_system_identifier CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER
\getenv expected_database_hex CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
\getenv expected_server_address_hex CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX
\getenv expected_server_port CANDIDATE_EXPECTED_TARGET_SERVER_PORT

BEGIN;
SET LOCAL lock_timeout TO '2s';
SET LOCAL statement_timeout TO '15s';

-- These catalogs contain every mutable fact checked below. PostgreSQL holds
-- the locks to transaction end, so ALTER ROLE, GRANT/REVOKE, and owner changes
-- cannot cross the recheck-to-LOGIN boundary.
LOCK TABLE
  pg_catalog.pg_authid,
  pg_catalog.pg_auth_members,
  pg_catalog.pg_database,
  pg_catalog.pg_namespace,
  pg_catalog.pg_class,
  pg_catalog.pg_attribute,
  pg_catalog.pg_proc,
  pg_catalog.pg_type,
  pg_catalog.pg_default_acl,
  pg_catalog.pg_db_role_setting,
  pg_catalog.pg_parameter_acl,
  pg_catalog.pg_shdepend,
  pg_catalog.pg_trigger
IN SHARE ROW EXCLUSIVE MODE;

\i :security_attestation_sql

SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', true);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', true);
SELECT set_config('foodsystems.candidate_schema', :'target_schema', true);
SELECT set_config('foodsystems.candidate_worker_app_name', :'worker_app_name', true);
SELECT set_config('foodsystems.candidate_reconciler_app_name', :'reconciler_app_name', true);
SELECT set_config('foodsystems.candidate_target_system_identifier', :'expected_system_identifier', true);
SELECT set_config('foodsystems.candidate_target_database_hex', :'expected_database_hex', true);
SELECT set_config('foodsystems.candidate_target_server_address_hex', :'expected_server_address_hex', true);
SELECT set_config('foodsystems.candidate_target_server_port', :'expected_server_port', true);
DO $preflight$
DECLARE
  target_worker_role text := current_setting('foodsystems.candidate_worker_role');
  target_reconciler_role text := current_setting('foodsystems.candidate_reconciler_role');
  target_schema text := current_setting('foodsystems.candidate_schema');
  worker_app_name text := current_setting('foodsystems.candidate_worker_app_name');
  reconciler_app_name text := current_setting('foodsystems.candidate_reconciler_app_name');
  target_role text;
  role_mode text;
  expected_app_name text;
  contract_issues text;
  recovery_issue text;
BEGIN
  IF session_user <> current_user THEN
    RAISE EXCEPTION 'administrator session must not use SET ROLE';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = current_user AND rolsuper
  ) THEN
    RAISE EXCEPTION 'connected recovery administrator must be SUPERUSER';
  END IF;
  IF (SELECT system_identifier::text FROM pg_control_system())
      <> current_setting('foodsystems.candidate_target_system_identifier')
    OR encode(convert_to(current_database(), 'UTF8'), 'hex')
      <> current_setting('foodsystems.candidate_target_database_hex')
    OR encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex')
      <> current_setting('foodsystems.candidate_target_server_address_hex')
    OR inet_server_port()::text
      <> current_setting('foodsystems.candidate_target_server_port') THEN
    RAISE EXCEPTION 'activation target changed between admin identity read and authoritative transaction';
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
        OR rolreplication OR rolbypassrls OR rolinherit OR rolconnlimit <> 10
      )
  ) THEN
    RAISE EXCEPTION 'candidate roles must be NOLOGIN with exact safe attributes before enable';
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
  IF to_regnamespace(target_schema) IS NULL THEN
    RAISE EXCEPTION 'target schema does not exist';
  END IF;
  recovery_issue := public.candidate_critical_trigger_drift(target_schema);
  IF recovery_issue IS NOT NULL THEN
    RAISE EXCEPTION 'candidate critical trigger drift: %', recovery_issue;
  END IF;
  recovery_issue := public.candidate_other_database_connect_issue(
    target_worker_role,
    target_reconciler_role
  );
  IF recovery_issue IS NOT NULL THEN
    RAISE EXCEPTION 'other database CONNECT isolation prerequisite failed: %', recovery_issue;
  END IF;

  FOR target_role, role_mode, expected_app_name IN
    SELECT * FROM (VALUES
      (target_worker_role, 'worker', worker_app_name),
      (target_reconciler_role, 'reconciler', reconciler_app_name)
    ) role_contract(role_name, mode_name, app_name)
  LOOP
    WITH role_row AS (
      SELECT * FROM pg_roles WHERE rolname = target_role
    ), candidate_relation(relname) AS (
      VALUES
        ('CandidateContentUnit'), ('CandidateAnalysisRun'),
        ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
        ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
        ('CandidateEvidenceLink'), ('CandidateDependency'),
        ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
        ('CandidatePromotionDecision')
    ), expected_select(relname) AS (
      SELECT relname FROM candidate_relation
      UNION ALL
      SELECT relname FROM (VALUES
        ('Document'), ('SourceDoc'), ('LibraryAnalysisRecord')
      ) canonical(relname)
      WHERE role_mode = 'worker'
    ), expected_insert(relname) AS (
      SELECT NULL::text WHERE false
    ), expected_writer_routine(proname, argument_types) AS (
      SELECT 'candidate_worker_append', 'text, jsonb' WHERE role_mode = 'worker'
      UNION ALL
      SELECT 'candidate_reconciler_append', 'jsonb' WHERE role_mode = 'reconciler'
    ), user_schema AS (
      SELECT oid AS schema_oid, nspname, nspowner
      FROM pg_namespace
      WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
    ), user_relations AS (
      SELECT class.oid AS relation_oid, namespace.nspname, class.relname,
        class.relowner
      FROM pg_class class
      JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
      WHERE class.relkind IN ('r', 'p', 'v', 'm', 'f')
    ), target_relations AS (
      SELECT * FROM user_relations WHERE nspname = target_schema
    ), user_sequences AS (
      SELECT class.oid AS sequence_oid, namespace.nspname, class.relname,
        class.relowner
      FROM pg_class class
      JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
      WHERE class.relkind = 'S'
    ), user_routines AS (
      SELECT procedure.oid AS routine_oid, procedure.proowner,
        procedure.prosecdef, procedure.proacl, procedure.proname,
        oidvectortypes(procedure.proargtypes) AS argument_types,
        procedure.proconfig, namespace.nspname
      FROM pg_proc procedure
      JOIN user_schema namespace ON namespace.schema_oid = procedure.pronamespace
    ), user_types AS (
      SELECT type.oid AS type_oid, type.typowner, namespace.nspname,
        type.typname
      FROM pg_type type
      JOIN user_schema namespace ON namespace.schema_oid = type.typnamespace
    ), user_object_owners AS (
      SELECT DISTINCT relowner AS owner_oid FROM user_relations
      UNION SELECT DISTINCT relowner FROM user_sequences
      UNION SELECT DISTINCT proowner FROM user_routines
      UNION SELECT DISTINCT typowner FROM user_types
    ), owned_dependencies AS (
      SELECT dependency.classid, dependency.objid, dependency.objsubid
      FROM pg_shdepend dependency
      WHERE dependency.refclassid = 'pg_authid'::regclass
        AND dependency.refobjid = (SELECT oid FROM role_row)
        AND dependency.deptype = 'o'
        AND (
          dependency.dbid = 0
          OR dependency.dbid = (
            SELECT oid FROM pg_database WHERE datname = current_database()
          )
        )
    ), expected_settings(name, value) AS (
      VALUES
        ('application_name', expected_app_name),
        ('idle_in_transaction_session_timeout', '15s'),
        ('lock_timeout', '2s'),
        ('search_path', format('pg_catalog, %I', target_schema)),
        ('session_replication_role', 'origin'),
        ('statement_timeout', '15s')
    ), actual_global_settings(name, value) AS (
      SELECT split_part(config.value, '=', 1),
        substr(config.value, strpos(config.value, '=') + 1)
      FROM pg_db_role_setting setting
      CROSS JOIN LATERAL unnest(setting.setconfig) config(value)
      WHERE setting.setrole = (SELECT oid FROM role_row)
        AND setting.setdatabase = 0
    ), checks(issue) AS (
      SELECT 'candidate role owns the connected database'
      WHERE EXISTS (
        SELECT 1 FROM pg_database
        WHERE datname = current_database() AND datdba = (SELECT oid FROM role_row)
      )
      UNION ALL
      SELECT format('candidate role owns schema %I', nspname)
      FROM user_schema WHERE nspowner = (SELECT oid FROM role_row)
      UNION ALL
      SELECT 'candidate role owns an object in a non-system schema'
      WHERE EXISTS (SELECT 1 FROM user_relations WHERE relowner = (SELECT oid FROM role_row))
         OR EXISTS (SELECT 1 FROM user_sequences WHERE relowner = (SELECT oid FROM role_row))
         OR EXISTS (SELECT 1 FROM user_routines WHERE proowner = (SELECT oid FROM role_row))
         OR EXISTS (SELECT 1 FROM user_types WHERE typowner = (SELECT oid FROM role_row))
      UNION ALL
      SELECT format(
        'candidate role retains an ownership dependency: %s',
        pg_describe_object(classid, objid, objsubid)
      ) FROM owned_dependencies
      UNION ALL
      SELECT 'database CONNECT privilege is missing'
      WHERE NOT has_database_privilege(target_role, current_database(), 'CONNECT')
      UNION ALL
      SELECT 'database TEMP privilege is effective'
      WHERE has_database_privilege(target_role, current_database(), 'TEMP')
      UNION ALL
      SELECT 'database CREATE privilege is effective'
      WHERE has_database_privilege(target_role, current_database(), 'CREATE')
      UNION ALL
      SELECT 'target schema USAGE privilege is missing'
      WHERE NOT has_schema_privilege(target_role, target_schema, 'USAGE')
      UNION ALL
      SELECT format('schema USAGE privilege is effective outside target on %I', nspname)
      FROM user_schema
      WHERE nspname <> target_schema
        AND has_schema_privilege(target_role, schema_oid, 'USAGE')
      UNION ALL
      SELECT format('schema CREATE privilege is effective on %I', nspname)
      FROM user_schema
      WHERE has_schema_privilege(target_role, schema_oid, 'CREATE')
      UNION ALL
      SELECT 'one or more exact SELECT allowlist relations are missing'
      WHERE EXISTS (
        SELECT relname FROM expected_select
        EXCEPT SELECT relname FROM target_relations
      )
      UNION ALL
      SELECT format('SELECT privilege differs from exact allowlist on %I.%I', nspname, relname)
      FROM user_relations
      WHERE has_table_privilege(target_role, relation_oid, 'SELECT')
        <> (nspname = target_schema AND relname IN (SELECT relname FROM expected_select))
      UNION ALL
      SELECT format('column SELECT is effective outside exact allowlist on %I.%I', nspname, relname)
      FROM user_relations
      WHERE NOT (nspname = target_schema AND relname IN (SELECT relname FROM expected_select))
        AND NOT has_table_privilege(target_role, relation_oid, 'SELECT')
        AND has_any_column_privilege(target_role, relation_oid, 'SELECT')
      UNION ALL
      SELECT 'one or more exact INSERT allowlist relations are missing'
      WHERE EXISTS (
        SELECT relname FROM expected_insert
        EXCEPT SELECT relname FROM target_relations
        WHERE has_table_privilege(target_role, relation_oid, 'INSERT')
      )
      UNION ALL
      SELECT format('canonical, human-authority, promotion, or unrelated INSERT is effective on %I.%I', nspname, relname)
      FROM user_relations
      WHERE has_table_privilege(target_role, relation_oid, 'INSERT')
        AND NOT (
          nspname = target_schema
          AND relname IN (SELECT relname FROM expected_insert)
        )
      UNION ALL
      SELECT format('forbidden table write is effective on %I.%I', nspname, relname)
      FROM user_relations
      WHERE has_table_privilege(target_role, relation_oid, 'UPDATE')
         OR has_table_privilege(target_role, relation_oid, 'DELETE')
         OR has_table_privilege(target_role, relation_oid, 'TRUNCATE')
         OR has_table_privilege(target_role, relation_oid, 'REFERENCES')
         OR has_table_privilege(target_role, relation_oid, 'TRIGGER')
      UNION ALL
      SELECT format('column INSERT is effective outside exact allowlist on %I.%I', nspname, relname)
      FROM user_relations
      WHERE NOT has_table_privilege(target_role, relation_oid, 'INSERT')
        AND has_any_column_privilege(target_role, relation_oid, 'INSERT')
      UNION ALL
      SELECT format('forbidden column write is effective on %I.%I', nspname, relname)
      FROM user_relations
      WHERE (
          NOT has_table_privilege(target_role, relation_oid, 'UPDATE')
          AND has_any_column_privilege(target_role, relation_oid, 'UPDATE')
        ) OR (
          NOT has_table_privilege(target_role, relation_oid, 'REFERENCES')
          AND has_any_column_privilege(target_role, relation_oid, 'REFERENCES')
        )
      UNION ALL
      SELECT format('sequence privilege is effective on %I.%I', nspname, relname)
      FROM user_sequences
      WHERE has_sequence_privilege(target_role, sequence_oid, 'SELECT')
         OR has_sequence_privilege(target_role, sequence_oid, 'USAGE')
         OR has_sequence_privilege(target_role, sequence_oid, 'UPDATE')
      UNION ALL
      SELECT format('required audited writer routine is missing or changed: %s(%s)', proname, argument_types)
      FROM expected_writer_routine expected
      WHERE NOT EXISTS (
        SELECT 1 FROM user_routines routine
        WHERE routine.nspname = target_schema
          AND routine.proname = expected.proname
          AND routine.argument_types = expected.argument_types
          AND routine.prosecdef
          AND routine.proconfig = ARRAY['search_path=pg_catalog']
          AND has_function_privilege(target_role, routine.routine_oid, 'EXECUTE')
      )
      UNION ALL
      SELECT format('unexpected executable routine is effective: %I.%I(%s)', nspname, proname, argument_types)
      FROM user_routines routine
      WHERE has_function_privilege(target_role, routine_oid, 'EXECUTE')
        AND NOT (
          nspname = target_schema
          AND (proname, argument_types) IN (
            SELECT proname, argument_types FROM expected_writer_routine
          )
        )
      UNION ALL
      SELECT format('object owner %I retains default PUBLIC routine EXECUTE', owner.rolname)
      FROM user_object_owners object_owner
      JOIN pg_roles owner ON owner.oid = object_owner.owner_oid
      WHERE EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(
          (
            SELECT defaults.defaclacl FROM pg_default_acl defaults
            WHERE defaults.defaclrole = object_owner.owner_oid
              AND defaults.defaclnamespace = 0
              AND defaults.defaclobjtype = 'f'
          ),
          acldefault('f', object_owner.owner_oid)
        )) privilege
        WHERE privilege.grantee = 0 AND privilege.privilege_type = 'EXECUTE'
      )
      UNION ALL
      SELECT 'default ACL path could grant future table, sequence, or routine access'
      WHERE EXISTS (
        SELECT 1
        FROM pg_default_acl defaults
        LEFT JOIN user_schema namespace ON namespace.schema_oid = defaults.defaclnamespace
        CROSS JOIN LATERAL aclexplode(defaults.defaclacl) privilege
        WHERE (defaults.defaclnamespace = 0 OR namespace.schema_oid IS NOT NULL)
          AND privilege.grantee IN (0, (SELECT oid FROM role_row))
          AND defaults.defaclobjtype IN ('r', 'S', 'f')
      )
      UNION ALL
      SELECT format('configuration parameter privilege is effective: %s', parameter.parname)
      FROM pg_parameter_acl parameter
      WHERE has_parameter_privilege(target_role, parameter.parname, 'SET')
         OR has_parameter_privilege(target_role, parameter.parname, 'ALTER SYSTEM')
      UNION ALL
      SELECT 'candidate role has a database-specific setting'
      WHERE EXISTS (
        SELECT 1 FROM pg_db_role_setting
        WHERE setrole = (SELECT oid FROM role_row) AND setdatabase <> 0
      )
      UNION ALL
      SELECT format('required role setting is missing or changed: %s', name)
      FROM (
        SELECT name, value FROM expected_settings
        EXCEPT SELECT name, value FROM actual_global_settings
      ) missing_setting
      UNION ALL
      SELECT format('unexpected role setting is present: %s', name)
      FROM (
        SELECT name, value FROM actual_global_settings
        EXCEPT SELECT name, value FROM expected_settings
      ) extra_setting
      UNION ALL
      SELECT 'database default_transaction_read_only must be off'
      WHERE current_setting('default_transaction_read_only') <> 'off'
    )
    SELECT string_agg(issue, '; ' ORDER BY issue)
    INTO contract_issues
    FROM checks;
    IF contract_issues IS NOT NULL THEN
      RAISE EXCEPTION 'candidate % role contract mismatch before enable: %',
        role_mode, contract_issues;
    END IF;
  END LOOP;
END
$preflight$;

-- NOLOGIN does not terminate sessions established earlier. Clear any exact
-- candidate sessions before LOGIN is restored, and require their disappearance.
SELECT pg_terminate_backend(activity.pid, 5000)
FROM pg_stat_activity activity
WHERE activity.usename IN (:'worker_role', :'reconciler_role')
  AND activity.pid <> pg_backend_pid();
-- pg_stat_activity reuses its statistics snapshot inside this transaction.
-- Refresh only after both bounded termination calls before checking survivors.
SELECT pg_stat_clear_snapshot();
DO $session_check$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_stat_activity activity
    WHERE activity.usename IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    )
      AND activity.pid <> pg_backend_pid()
  ) THEN
    RAISE EXCEPTION 'candidate sessions survived pre-activation termination';
  END IF;
END
$session_check$;

SELECT format('ALTER ROLE %I LOGIN', role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
COMMIT;
SQL
then
  printf '%s\n' '[candidate-enable] ERROR: activation transaction failed within the 2s lock / 15s statement budget; resolve the reported contract or blocker and retry' >&2
  exit 1
fi

CANDIDATE_WORKER_DATABASE_URL=$WORKER_DATABASE_URL \
  CANDIDATE_ADMIN_DATABASE_URL=$ADMIN_DATABASE_URL \
  CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER=$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER \
  CANDIDATE_EXPECTED_TARGET_DATABASE_HEX=$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX=$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_PORT=$CANDIDATE_EXPECTED_TARGET_SERVER_PORT \
  "$SCRIPT_DIR/verify-candidate-analysis-roles.sh" --role=worker
CANDIDATE_RECONCILER_DATABASE_URL=$RECONCILER_DATABASE_URL \
  CANDIDATE_ADMIN_DATABASE_URL=$ADMIN_DATABASE_URL \
  CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER=$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER \
  CANDIDATE_EXPECTED_TARGET_DATABASE_HEX=$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX=$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX \
  CANDIDATE_EXPECTED_TARGET_SERVER_PORT=$CANDIDATE_EXPECTED_TARGET_SERVER_PORT \
  "$SCRIPT_DIR/verify-candidate-analysis-roles.sh" --role=reconciler

fail_safe_active=0
cleanup_connection
unset ADMIN_DATABASE_URL WORKER_DATABASE_URL RECONCILER_DATABASE_URL
trap - EXIT HUP INT TERM
printf '%s\n' '[candidate-enable] PASS: existing worker and reconciler credentials verified'
