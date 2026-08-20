#!/bin/sh
# Verify one candidate login through its own URL. ACL introspection is backed by
# transaction-wrapped negative probes so PUBLIC and membership paths fail shut.
set -eu

usage() {
  cat <<'EOF'
Usage: verify-candidate-analysis-roles.sh --role=worker
       verify-candidate-analysis-roles.sh --role=reconciler

Worker environment:
  CANDIDATE_WORKER_DATABASE_URL       Dedicated worker login URL
Reconciler environment:
  CANDIDATE_RECONCILER_DATABASE_URL   Dedicated reconciler login URL
Required for both modes:
  CANDIDATE_ADMIN_DATABASE_URL        Exact matching administrator URL used
                                      only for read-only security-graph attestation

Optional environment:
  CANDIDATE_WORKER_DB_ROLE            Default: foodsystems_candidate_worker
  CANDIDATE_RECONCILER_DB_ROLE        Default: foodsystems_candidate_reconciler
  CANDIDATE_DB_SCHEMA                 Default: public
  CANDIDATE_WORKER_DB_APP_NAME        Default: foodsystems-candidate-worker
  CANDIDATE_RECONCILER_DB_APP_NAME    Default: foodsystems-candidate-reconciler
EOF
}

fail() {
  printf '%s\n' "[candidate-role-verify] ERROR: $*" >&2
  exit 1
}

[ "$#" -eq 1 ] || { usage >&2; fail 'exactly one --role mode is required'; }
CANDIDATE_WORKER_DB_ROLE=${CANDIDATE_WORKER_DB_ROLE:-foodsystems_candidate_worker}
CANDIDATE_RECONCILER_DB_ROLE=${CANDIDATE_RECONCILER_DB_ROLE:-foodsystems_candidate_reconciler}
CANDIDATE_DB_SCHEMA=${CANDIDATE_DB_SCHEMA:-public}
CANDIDATE_WORKER_DB_APP_NAME=${CANDIDATE_WORKER_DB_APP_NAME:-foodsystems-candidate-worker}
CANDIDATE_RECONCILER_DB_APP_NAME=${CANDIDATE_RECONCILER_DB_APP_NAME:-foodsystems-candidate-reconciler}
CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER=${CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER:-}
CANDIDATE_EXPECTED_TARGET_DATABASE_HEX=${CANDIDATE_EXPECTED_TARGET_DATABASE_HEX:-}
CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX=${CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX:-}
CANDIDATE_EXPECTED_TARGET_SERVER_PORT=${CANDIDATE_EXPECTED_TARGET_SERVER_PORT:-}

case "$1" in
  --role=worker)
    ROLE_MODE=worker
    ROLE_DATABASE_URL=${CANDIDATE_WORKER_DATABASE_URL:-}
    EXPECTED_ROLE=$CANDIDATE_WORKER_DB_ROLE
    EXPECTED_APP_NAME=$CANDIDATE_WORKER_DB_APP_NAME
    [ -n "$ROLE_DATABASE_URL" ] || fail 'CANDIDATE_WORKER_DATABASE_URL is required'
    ;;
  --role=reconciler)
    ROLE_MODE=reconciler
    ROLE_DATABASE_URL=${CANDIDATE_RECONCILER_DATABASE_URL:-}
    EXPECTED_ROLE=$CANDIDATE_RECONCILER_DB_ROLE
    EXPECTED_APP_NAME=$CANDIDATE_RECONCILER_DB_APP_NAME
    [ -n "$ROLE_DATABASE_URL" ] || fail 'CANDIDATE_RECONCILER_DATABASE_URL is required'
    ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; fail 'role must be worker or reconciler' ;;
esac

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
case "$EXPECTED_APP_NAME" in
  ''|*[!a-zA-Z0-9_-]*) fail 'candidate application name contains unsupported characters' ;;
esac
target_identity_fields=0
for identity_value in \
  "$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER" \
  "$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX" \
  "$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX" \
  "$CANDIDATE_EXPECTED_TARGET_SERVER_PORT"; do
  [ -z "$identity_value" ] || target_identity_fields=$((target_identity_fields + 1))
done
[ "$target_identity_fields" -eq 0 ] || [ "$target_identity_fields" -eq 4 ] \
  || fail 'live target identity must supply all four fields or none'
if [ "$target_identity_fields" -eq 4 ]; then
  case "$CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER" in
    *[!0-9]*) fail 'expected live cluster identity is invalid' ;;
  esac
  case "$CANDIDATE_EXPECTED_TARGET_DATABASE_HEX" in
    *[!0-9a-f]*) fail 'expected live database identity is invalid' ;;
  esac
  case "$CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX" in
    *[!0-9a-f]*) fail 'expected live server address identity is invalid' ;;
  esac
  case "$CANDIDATE_EXPECTED_TARGET_SERVER_PORT" in
    *[!0-9]*) fail 'expected live server port identity is invalid' ;;
  esac
fi

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
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-verification

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-verify.XXXXXX")
ROLE_PGPASSFILE=$connection_dir/role.pgpass
ADMIN_PGPASSFILE=$connection_dir/admin.pgpass
ROLE_TARGET_IDENTITY_FILE=$connection_dir/role-target.json
ADMIN_TARGET_IDENTITY_FILE=$connection_dir/admin-target.json
cleanup_connection() {
  rm -f "$ROLE_PGPASSFILE" "$ADMIN_PGPASSFILE" \
    "$ROLE_TARGET_IDENTITY_FILE" "$ADMIN_TARGET_IDENTITY_FILE"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$ROLE_DATABASE_URL \
  PGPASSFILE_PATH=$ROLE_PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$ROLE_TARGET_IDENTITY_FILE \
  EXPECTED_URL_ROLE=$EXPECTED_ROLE EXPECTED_URL_APP=$EXPECTED_APP_NAME \
  CANDIDATE_URL_CONTEXT=candidate-role-verify \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
[ -n "${CANDIDATE_ADMIN_DATABASE_URL:-}" ] \
  || fail 'CANDIDATE_ADMIN_DATABASE_URL is required for security-graph attestation'
ADMIN_PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$CANDIDATE_ADMIN_DATABASE_URL \
  PGPASSFILE_PATH=$ADMIN_PGPASSFILE \
  CANDIDATE_TARGET_IDENTITY_FILE=$ADMIN_TARGET_IDENTITY_FILE \
  CANDIDATE_URL_CONTEXT=candidate-role-verify-admin \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
if ! cmp -s "$ROLE_TARGET_IDENTITY_FILE" "$ADMIN_TARGET_IDENTITY_FILE"; then
  fail 'candidate and administrator database URLs must match exactly'
fi
unset ROLE_DATABASE_URL CANDIDATE_ADMIN_DATABASE_URL
unset CANDIDATE_WORKER_DATABASE_URL CANDIDATE_RECONCILER_DATABASE_URL
unset PGPASSWORD PGOPTIONS PGSERVICE PGSERVICEFILE
export PGPASSFILE=$ROLE_PGPASSFILE
export ROLE_MODE EXPECTED_ROLE EXPECTED_APP_NAME CANDIDATE_DB_SCHEMA
export CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER
export CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
export CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX
export CANDIDATE_EXPECTED_TARGET_SERVER_PORT

issues=$(psql "$PSQL_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 <<'SQL'
\getenv role_mode ROLE_MODE
\getenv expected_role EXPECTED_ROLE
\getenv expected_app_name EXPECTED_APP_NAME
\getenv target_schema CANDIDATE_DB_SCHEMA
\getenv expected_system_identifier CANDIDATE_EXPECTED_TARGET_SYSTEM_IDENTIFIER
\getenv expected_database_hex CANDIDATE_EXPECTED_TARGET_DATABASE_HEX
\getenv expected_server_address_hex CANDIDATE_EXPECTED_TARGET_SERVER_ADDRESS_HEX
\getenv expected_server_port CANDIDATE_EXPECTED_TARGET_SERVER_PORT

WITH role_row AS (
  SELECT * FROM pg_roles WHERE rolname = current_user
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
  SELECT relname FROM (VALUES ('Document'), ('SourceDoc'), ('LibraryAnalysisRecord')) canonical(relname)
  WHERE :'role_mode' = 'worker'
), expected_insert(relname) AS (
  SELECT NULL::text WHERE false
), expected_writer_routine(proname, argument_types) AS (
  SELECT 'candidate_worker_append', 'text, jsonb' WHERE :'role_mode' = 'worker'
  UNION ALL
  SELECT 'candidate_reconciler_append', 'jsonb' WHERE :'role_mode' = 'reconciler'
), expected_critical_trigger(relname, trigger_name) AS (
  VALUES
    ('CandidateContentUnit', 'CandidateContentUnit_reject_update_delete'),
    ('CandidateContentUnit', 'CandidateContentUnit_reject_truncate'),
    ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_invalid_scope'),
    ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_update_delete'),
    ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_truncate'),
    ('CandidateAnalysisRunInput', 'CandidateAnalysisRunInput_reject_update_delete'),
    ('CandidateAnalysisRunInput', 'CandidateAnalysisRunInput_reject_truncate'),
    ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_invalid_machine_payload'),
    ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_update_delete'),
    ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_truncate'),
    ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_invalid_machine_payload'),
    ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_update_delete'),
    ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_truncate'),
    ('CandidateAssertion', 'CandidateAssertion_reject_invalid_machine_payload'),
    ('CandidateAssertion', 'CandidateAssertion_reject_update_delete'),
    ('CandidateAssertion', 'CandidateAssertion_reject_truncate'),
    ('CandidateEvidenceLink', 'CandidateEvidenceLink_reject_update_delete'),
    ('CandidateEvidenceLink', 'CandidateEvidenceLink_reject_truncate'),
    ('CandidateDependency', 'CandidateDependency_reject_update_delete'),
    ('CandidateDependency', 'CandidateDependency_reject_truncate'),
    ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_invalid_machine_payload'),
    ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_update_delete'),
    ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_truncate'),
    ('CandidateHumanReviewDecision', 'CandidateHumanReviewDecision_reject_update_delete'),
    ('CandidateHumanReviewDecision', 'CandidateHumanReviewDecision_reject_truncate'),
    ('CandidatePromotionDecision', 'CandidatePromotionDecision_reject_update_delete'),
    ('CandidatePromotionDecision', 'CandidatePromotionDecision_reject_truncate')
), actual_critical_trigger AS (
  SELECT class.relname, trigger.tgname AS trigger_name,
    trigger.tgenabled, trigger.tgisinternal
  FROM pg_trigger trigger
  JOIN pg_class class ON class.oid = trigger.tgrelid
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  WHERE namespace.nspname = :'target_schema'
    AND class.relname IN (SELECT relname FROM expected_critical_trigger)
), user_schema AS (
  SELECT oid AS schema_oid, nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), user_relations AS (
  SELECT class.oid AS relation_oid, namespace.schema_oid, namespace.nspname,
    class.relname, class.relowner
  FROM pg_class class
  JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
  WHERE class.relkind IN ('r', 'p', 'v', 'm', 'f')
), target_relations AS (
  SELECT * FROM user_relations WHERE nspname = :'target_schema'
), user_sequences AS (
  SELECT class.oid AS sequence_oid, namespace.nspname, class.relname, class.relowner
  FROM pg_class class
  JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
  WHERE class.relkind = 'S'
), user_routines AS (
  SELECT procedure.oid AS routine_oid, procedure.proowner, procedure.prosecdef,
    procedure.proacl, procedure.proname,
    oidvectortypes(procedure.proargtypes) AS argument_types,
    procedure.proconfig, namespace.nspname
  FROM pg_proc procedure
  JOIN user_schema namespace ON namespace.schema_oid = procedure.pronamespace
), user_types AS (
  SELECT type.oid AS type_oid, type.typowner, namespace.nspname, type.typname,
    type.typtype
  FROM pg_type type
  JOIN user_schema namespace ON namespace.schema_oid = type.typnamespace
), user_object_owners AS (
  SELECT DISTINCT relowner AS owner_oid FROM user_relations
  UNION SELECT DISTINCT relowner FROM user_sequences
  UNION SELECT DISTINCT proowner FROM user_routines
  UNION SELECT DISTINCT typowner FROM user_types
), role_membership AS (
  SELECT granted.rolname
  FROM pg_auth_members membership
  JOIN pg_roles granted ON granted.oid = membership.roleid
  JOIN pg_roles member ON member.oid = membership.member
  WHERE member.rolname = current_user
), inbound_role_membership AS (
  SELECT member.rolname
  FROM pg_auth_members membership
  JOIN pg_roles granted ON granted.oid = membership.roleid
  JOIN pg_roles member ON member.oid = membership.member
  WHERE granted.rolname = current_user
), owned_dependencies AS (
  SELECT dependency.classid, dependency.objid, dependency.objsubid
  FROM pg_shdepend dependency
  WHERE dependency.refclassid = 'pg_authid'::regclass
    AND dependency.refobjid = (SELECT oid FROM role_row)
    AND dependency.deptype = 'o'
    AND (
      dependency.dbid = 0
      OR dependency.dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
    )
), checks(issue) AS (
  SELECT 'live cluster or database identity differs from the activation target'
  WHERE :'expected_system_identifier' <> '' AND (
    (SELECT system_identifier::text FROM pg_control_system())
      <> :'expected_system_identifier'
    OR encode(convert_to(current_database(), 'UTF8'), 'hex')
      <> :'expected_database_hex'
    OR encode(convert_to(inet_server_addr()::text, 'UTF8'), 'hex')
      <> :'expected_server_address_hex'
    OR inet_server_port()::text <> :'expected_server_port'
  )
  UNION ALL
  SELECT format(
    'identity mismatch: session_user=%I current_user=%I expected=%I',
    session_user, current_user, :'expected_role'
  )
  WHERE session_user <> current_user OR current_user <> :'expected_role'
  UNION ALL
  SELECT 'candidate role has an elevated cluster attribute'
  FROM role_row
  WHERE rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls OR rolinherit
  UNION ALL
  SELECT 'candidate role must be LOGIN with connection limit 10'
  FROM role_row WHERE NOT rolcanlogin OR rolconnlimit <> 10
  UNION ALL
  SELECT format('candidate role has membership in %I', rolname) FROM role_membership
  UNION ALL
  SELECT format('role %I can SET ROLE into the candidate identity', rolname)
  FROM inbound_role_membership
  UNION ALL
  SELECT 'candidate role owns the connected database'
  WHERE EXISTS (
    SELECT 1 FROM pg_database
    WHERE datname = current_database() AND datdba = (SELECT oid FROM role_row)
  )
  UNION ALL
  SELECT format('candidate role owns schema %I', nspname)
  FROM user_schema
  WHERE pg_get_userbyid((SELECT nspowner FROM pg_namespace WHERE oid = schema_oid)) = current_user
  UNION ALL
  SELECT 'candidate role owns an object in a non-system schema'
  WHERE EXISTS (SELECT 1 FROM user_relations WHERE relowner = (SELECT oid FROM role_row))
     OR EXISTS (SELECT 1 FROM user_sequences WHERE relowner = (SELECT oid FROM role_row))
     OR EXISTS (SELECT 1 FROM user_routines WHERE proowner = (SELECT oid FROM role_row))
  UNION ALL
  SELECT format('candidate role owns user-defined type %I.%I', nspname, typname)
  FROM user_types
  WHERE typowner = (SELECT oid FROM role_row)
  UNION ALL
  SELECT format(
    'candidate role retains an ownership dependency: %s',
    pg_describe_object(classid, objid, objsubid)
  )
  FROM owned_dependencies
  UNION ALL
  SELECT 'database CONNECT privilege is missing'
  WHERE NOT has_database_privilege(current_user, current_database(), 'CONNECT')
  UNION ALL
  SELECT 'database TEMP privilege is effective'
  WHERE has_database_privilege(current_user, current_database(), 'TEMP')
  UNION ALL
  SELECT 'database CREATE privilege is effective'
  WHERE has_database_privilege(current_user, current_database(), 'CREATE')
  UNION ALL
  SELECT 'target schema USAGE privilege is missing'
  WHERE NOT has_schema_privilege(current_user, :'target_schema', 'USAGE')
  UNION ALL
  SELECT format('schema USAGE privilege is effective outside the target on %I', nspname)
  FROM user_schema
  WHERE nspname <> :'target_schema' AND has_schema_privilege(current_user, schema_oid, 'USAGE')
  UNION ALL
  SELECT format('schema CREATE privilege is effective on %I', nspname)
  FROM user_schema
  WHERE has_schema_privilege(current_user, schema_oid, 'CREATE')
  UNION ALL
  SELECT 'one or more exact SELECT allowlist relations are missing'
  WHERE EXISTS (
    SELECT relname FROM expected_select
    EXCEPT SELECT relname FROM target_relations
  )
  UNION ALL
  SELECT format('SELECT privilege differs from exact allowlist on %I.%I', nspname, relname)
  FROM user_relations
  WHERE has_table_privilege(current_user, relation_oid, 'SELECT')
    <> (nspname = :'target_schema' AND relname IN (SELECT relname FROM expected_select))
  UNION ALL
  SELECT format('column SELECT privilege is effective outside the exact allowlist on %I.%I', nspname, relname)
  FROM user_relations
  WHERE NOT (nspname = :'target_schema' AND relname IN (SELECT relname FROM expected_select))
    AND NOT has_table_privilege(current_user, relation_oid, 'SELECT')
    AND has_any_column_privilege(current_user, relation_oid, 'SELECT')
  UNION ALL
  SELECT 'one or more exact INSERT allowlist relations are missing'
  WHERE EXISTS (
    SELECT relname FROM expected_insert
    EXCEPT
    SELECT relname FROM target_relations
    WHERE has_table_privilege(current_user, relation_oid, 'INSERT')
  )
  UNION ALL
  SELECT format('canonical or unrelated write privilege is effective on %I.%I', nspname, relname)
  FROM user_relations
  WHERE has_table_privilege(current_user, relation_oid, 'INSERT')
    AND NOT (nspname = :'target_schema' AND relname IN (SELECT relname FROM expected_insert))
  UNION ALL
  SELECT format('forbidden table write privilege is effective on %I.%I', nspname, relname)
  FROM user_relations
  WHERE has_table_privilege(current_user, relation_oid, 'UPDATE')
     OR has_table_privilege(current_user, relation_oid, 'DELETE')
     OR has_table_privilege(current_user, relation_oid, 'TRUNCATE')
     OR has_table_privilege(current_user, relation_oid, 'REFERENCES')
     OR has_table_privilege(current_user, relation_oid, 'TRIGGER')
  UNION ALL
  SELECT format('column INSERT privilege is effective outside the exact allowlist on %I.%I', nspname, relname)
  FROM user_relations
  WHERE NOT has_table_privilege(current_user, relation_oid, 'INSERT')
    AND has_any_column_privilege(current_user, relation_oid, 'INSERT')
  UNION ALL
  SELECT format('forbidden column write privilege is effective on %I.%I', nspname, relname)
  FROM user_relations
  WHERE (
      NOT has_table_privilege(current_user, relation_oid, 'UPDATE')
      AND has_any_column_privilege(current_user, relation_oid, 'UPDATE')
    ) OR (
      NOT has_table_privilege(current_user, relation_oid, 'REFERENCES')
      AND has_any_column_privilege(current_user, relation_oid, 'REFERENCES')
    )
  UNION ALL
  SELECT format('sequence privilege is effective on %I.%I', nspname, relname)
  FROM user_sequences
  WHERE has_sequence_privilege(current_user, sequence_oid, 'SELECT')
     OR has_sequence_privilege(current_user, sequence_oid, 'USAGE')
     OR has_sequence_privilege(current_user, sequence_oid, 'UPDATE')
  UNION ALL
  SELECT format('required audited writer routine is missing or changed: %s(%s)', proname, argument_types)
  FROM expected_writer_routine expected
  WHERE NOT EXISTS (
    SELECT 1 FROM user_routines routine
    WHERE routine.nspname = :'target_schema'
      AND routine.proname = expected.proname
      AND routine.argument_types = expected.argument_types
      AND routine.prosecdef
      AND routine.proconfig = ARRAY['search_path=pg_catalog']
      AND has_function_privilege(current_user, routine.routine_oid, 'EXECUTE')
  )
  UNION ALL
  SELECT format('unexpected executable routine is effective: %I.%I(%s)', nspname, proname, argument_types)
  FROM user_routines routine
  WHERE has_function_privilege(current_user, routine_oid, 'EXECUTE')
    AND NOT (
      nspname = :'target_schema'
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
  WHERE has_parameter_privilege(current_user, parameter.parname, 'SET')
     OR has_parameter_privilege(current_user, parameter.parname, 'ALTER SYSTEM')
  UNION ALL
  SELECT 'session_replication_role must be origin'
  WHERE current_setting('session_replication_role') <> 'origin'
  UNION ALL
  SELECT 'statement_timeout must be 15 seconds'
  WHERE current_setting('statement_timeout') <> '15s'
  UNION ALL
  SELECT 'default_transaction_read_only must be off for candidate INSERT allowlists'
  WHERE current_setting('default_transaction_read_only') <> 'off'
  UNION ALL
  SELECT 'lock_timeout must be 2 seconds'
  WHERE current_setting('lock_timeout') <> '2s'
  UNION ALL
  SELECT 'idle_in_transaction_session_timeout must be 15 seconds'
  WHERE current_setting('idle_in_transaction_session_timeout') <> '15s'
  UNION ALL
  SELECT format('unexpected search_path: %s', current_setting('search_path'))
  WHERE current_setting('search_path') <> format('pg_catalog, %I', :'target_schema')
  UNION ALL
  SELECT 'role-level application_name default is missing or unexpected'
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_db_role_setting setting
    CROSS JOIN LATERAL unnest(setting.setconfig) config(value)
    WHERE setting.setrole = (SELECT oid FROM role_row)
      AND setting.setdatabase = 0
      AND config.value = 'application_name=' || :'expected_app_name'
  )
  UNION ALL
  SELECT format('unexpected session application_name: %s', current_setting('application_name'))
  WHERE current_setting('application_name') <> :'expected_app_name'
  UNION ALL
  SELECT format('candidate critical trigger drift: %I.%I', expected.relname, expected.trigger_name)
  FROM expected_critical_trigger expected
  LEFT JOIN actual_critical_trigger actual USING (relname, trigger_name)
  WHERE actual.trigger_name IS NULL OR actual.tgenabled <> 'A'
  UNION ALL
  SELECT format('candidate critical trigger drift: unexpected %I.%I', actual.relname, actual.trigger_name)
  FROM actual_critical_trigger actual
  LEFT JOIN expected_critical_trigger expected USING (relname, trigger_name)
  WHERE NOT actual.tgisinternal AND expected.trigger_name IS NULL
  UNION ALL
  SELECT format('other database CONNECT isolation prerequisite failed: %I', database.datname)
  FROM pg_database database
  WHERE database.datallowconn
    AND database.datname <> current_database()
    AND has_database_privilege(current_user, database.oid, 'CONNECT')
)
SELECT issue FROM checks ORDER BY issue;
SQL
)

if [ -n "$issues" ]; then
  printf '%s\n' '[candidate-role-verify] static privilege audit failed:' >&2
  printf '%s\n' "$issues" | sed 's/^/  - /' >&2
  exit 1
fi

expect_denied() {
  label=$1
  sql=$2
  output_file=$(mktemp "${TMPDIR:-/tmp}/foodsystems-candidate-probe.XXXXXX")
  if psql "$PSQL_DATABASE_URL" -X -v ON_ERROR_STOP=1 -q -c "$sql" >"$output_file" 2>&1; then
    rm -f "$output_file"
    fail "$label unexpectedly succeeded"
  fi
  if ! grep -Eiq 'permission denied|not owner' "$output_file"; then
    printf '%s\n' "[candidate-role-verify] unexpected failure for $label:" >&2
    sed 's/^/  /' "$output_file" >&2
    rm -f "$output_file"
    exit 1
  fi
  rm -f "$output_file"
  printf '%s\n' "[candidate-role-verify] denied as expected: $label"
}

# All probes roll back. DEFAULT VALUES reaches PostgreSQL privilege checking
# before any table-specific NOT NULL or foreign-key constraint can matter.
expect_denied 'canonical Document INSERT' \
  "BEGIN; INSERT INTO \"$CANDIDATE_DB_SCHEMA\".\"Document\" DEFAULT VALUES; ROLLBACK"
expect_denied 'canonical LibraryAnalysisRecord INSERT' \
  "BEGIN; INSERT INTO \"$CANDIDATE_DB_SCHEMA\".\"LibraryAnalysisRecord\" DEFAULT VALUES; ROLLBACK"
expect_denied 'CandidateHumanReviewDecision INSERT' \
  "BEGIN; INSERT INTO \"$CANDIDATE_DB_SCHEMA\".\"CandidateHumanReviewDecision\" DEFAULT VALUES; ROLLBACK"
expect_denied 'CandidatePromotionDecision INSERT' \
  "BEGIN; INSERT INTO \"$CANDIDATE_DB_SCHEMA\".\"CandidatePromotionDecision\" DEFAULT VALUES; ROLLBACK"
expect_denied 'candidate UPDATE' \
  "BEGIN; UPDATE \"$CANDIDATE_DB_SCHEMA\".\"CandidateAnalysisRun\" SET \"id\" = \"id\" WHERE false; ROLLBACK"
expect_denied 'candidate DELETE' \
  "BEGIN; DELETE FROM \"$CANDIDATE_DB_SCHEMA\".\"CandidateAnalysisRun\" WHERE false; ROLLBACK"
expect_denied 'schema CREATE' \
  "BEGIN; CREATE TABLE \"$CANDIDATE_DB_SCHEMA\".candidate_role_probe (id integer); ROLLBACK"
expect_denied 'database TEMP' \
  'BEGIN; CREATE TEMP TABLE candidate_role_temp_probe (id integer); ROLLBACK'
expect_denied \
  'session_replication_role replica mode' \
  "SET session_replication_role TO replica"

PGPASSFILE=$ADMIN_PGPASSFILE \
psql "$ADMIN_PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 \
  -v expected_checker_sha256="$CANDIDATE_SECURITY_CHECKER_SHA256" \
  -v expected_graph_sha256="$CANDIDATE_SECURITY_GRAPH_SHA256" \
  -f "$SCRIPT_DIR/attest-candidate-security-graph.sql"

printf '%s\n' "[candidate-role-verify] PASS: $EXPECTED_ROLE matches the exact $ROLE_MODE privilege contract"
