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

command -v psql >/dev/null 2>&1 || fail 'psql is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'
[ -z "${PGOPTIONS:-}" ] || fail 'PGOPTIONS is not permitted for candidate role verification'
[ -z "${PGSERVICE:-}" ] || fail 'PGSERVICE is not permitted for candidate role verification'
[ -z "${PGSERVICEFILE:-}" ] || fail 'PGSERVICEFILE is not permitted for candidate role verification'

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-verify.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$ROLE_DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE EXPECTED_URL_ROLE=$EXPECTED_ROLE EXPECTED_URL_APP=$EXPECTED_APP_NAME node -e '
  const fs = require("node:fs")
  const die = message => { console.error(`[candidate-role-verify] ERROR: ${message}`); process.exit(1) }
  let url
  try { url = new URL(process.env.RAW_DATABASE_URL) } catch { die("invalid PostgreSQL URL") }
  if (!/^postgres(ql)?:$/.test(url.protocol)) die("candidate database URL must use PostgreSQL")
  if (url.searchParams.has("password") || url.searchParams.has("sslpassword")) die("put database passwords in the URL authority, not query parameters")
  if (url.searchParams.has("options")) die("startup options are not permitted")
  if (url.searchParams.has("service")) die("connection services are not permitted")
  try {
    const decode = value => decodeURIComponent(value)
    const username = decode(url.username)
    if (username !== process.env.EXPECTED_URL_ROLE) die("dedicated database URL username does not match expected role")
    if ((url.searchParams.get("application_name") ?? "") !== process.env.EXPECTED_URL_APP) die("dedicated database URL application_name does not match expected value")
    const escapeField = value => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:")
    const fields = [url.hostname || "localhost", url.port || "5432", decode(url.pathname.replace(/^\//, "")), username, decode(url.password)].map(escapeField)
    fs.writeFileSync(process.env.PGPASSFILE_PATH, `${fields.join(":")}\n`, { mode: 0o600 })
    url.password = ""
    url.searchParams.delete("schema")
    process.stdout.write(url.toString())
  } catch { die("invalid PostgreSQL URL") }
')
unset ROLE_DATABASE_URL CANDIDATE_WORKER_DATABASE_URL CANDIDATE_RECONCILER_DATABASE_URL PGPASSWORD PGOPTIONS PGSERVICE PGSERVICEFILE
export ROLE_MODE EXPECTED_ROLE EXPECTED_APP_NAME CANDIDATE_DB_SCHEMA

issues=$(psql "$PSQL_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 <<'SQL'
\getenv role_mode ROLE_MODE
\getenv expected_role EXPECTED_ROLE
\getenv expected_app_name EXPECTED_APP_NAME
\getenv target_schema CANDIDATE_DB_SCHEMA

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
  SELECT relname FROM (VALUES
    ('CandidateAnalysisRun'), ('CandidateAnalysisRunInput'),
    ('CandidateAnalysisRunEvent'), ('CandidateAnalysisArtifact'),
    ('CandidateAssertion'), ('CandidateEvidenceLink'), ('CandidateDependency')
  ) worker(relname)
  WHERE :'role_mode' = 'worker'
  UNION ALL
  SELECT 'CandidateReconciliationSnapshot' WHERE :'role_mode' = 'reconciler'
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
    procedure.proacl, namespace.nspname
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
  SELECT format('direct routine privilege is granted in schema %I', nspname)
  FROM user_routines routine
  WHERE EXISTS (
    SELECT 1
    FROM aclexplode(COALESCE(routine.proacl, acldefault('f', routine.proowner))) privilege
    WHERE privilege.grantee = (SELECT oid FROM role_row)
  )
  UNION ALL
  SELECT 'an executable SECURITY DEFINER routine can bypass candidate table ACLs'
  WHERE EXISTS (
    SELECT 1 FROM user_routines
    WHERE prosecdef AND has_function_privilege(current_user, routine_oid, 'EXECUTE')
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
  "BEGIN; INSERT INTO $CANDIDATE_DB_SCHEMA.\"Document\" DEFAULT VALUES; ROLLBACK"
expect_denied 'canonical LibraryAnalysisRecord INSERT' \
  "BEGIN; INSERT INTO $CANDIDATE_DB_SCHEMA.\"LibraryAnalysisRecord\" DEFAULT VALUES; ROLLBACK"
expect_denied 'CandidateHumanReviewDecision INSERT' \
  "BEGIN; INSERT INTO $CANDIDATE_DB_SCHEMA.\"CandidateHumanReviewDecision\" DEFAULT VALUES; ROLLBACK"
expect_denied 'CandidatePromotionDecision INSERT' \
  "BEGIN; INSERT INTO $CANDIDATE_DB_SCHEMA.\"CandidatePromotionDecision\" DEFAULT VALUES; ROLLBACK"
expect_denied 'candidate UPDATE' \
  "BEGIN; UPDATE $CANDIDATE_DB_SCHEMA.\"CandidateAnalysisRun\" SET \"id\" = \"id\" WHERE false; ROLLBACK"
expect_denied 'candidate DELETE' \
  "BEGIN; DELETE FROM $CANDIDATE_DB_SCHEMA.\"CandidateAnalysisRun\" WHERE false; ROLLBACK"
expect_denied 'schema CREATE' \
  "BEGIN; CREATE TABLE $CANDIDATE_DB_SCHEMA.candidate_role_probe (id integer); ROLLBACK"
expect_denied 'database TEMP' \
  'BEGIN; CREATE TEMP TABLE candidate_role_temp_probe (id integer); ROLLBACK'

printf '%s\n' "[candidate-role-verify] PASS: $EXPECTED_ROLE matches the exact $ROLE_MODE privilege contract"
