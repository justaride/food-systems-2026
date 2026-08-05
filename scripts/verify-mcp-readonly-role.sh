#!/bin/sh
# Prove that the MCP login can read the target schema but cannot write, create
# permanent objects, or create temporary objects. The write probes are either
# no-op DML (WHERE false) or transaction-wrapped DDL and leave no data behind.
set -eu

usage() {
  cat <<'EOF'
Usage: verify-mcp-readonly-role.sh

Required environment:
  MCP_DATABASE_URL  PostgreSQL URL using the dedicated MCP login

Optional environment:
  MCP_DB_ROLE        Expected current_user (default: foodsystems_mcp_ro)
  MCP_DB_SCHEMA      Readable schema (default: public)
  MCP_DB_APP_NAME    Expected application_name (default: foodsystems-mcp-ro)
EOF
}

fail() {
  printf '%s\n' "[mcp-role-verify] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  -h|--help) usage; exit 0 ;;
  '') ;;
  *) usage >&2; fail "unknown argument: $1" ;;
esac

[ -n "${MCP_DATABASE_URL:-}" ] || fail 'MCP_DATABASE_URL is required'
MCP_DB_ROLE=${MCP_DB_ROLE:-foodsystems_mcp_ro}
MCP_DB_SCHEMA=${MCP_DB_SCHEMA:-public}
MCP_DB_APP_NAME=${MCP_DB_APP_NAME:-foodsystems-mcp-ro}

case "$MCP_DB_ROLE" in
  ''|*[!a-z0-9_]*) fail 'MCP_DB_ROLE must contain only lowercase letters, digits, and underscores' ;;
esac
case "$MCP_DB_SCHEMA" in
  ''|*[!a-zA-Z0-9_]*) fail 'MCP_DB_SCHEMA must be a simple PostgreSQL identifier' ;;
esac
case "$MCP_DB_APP_NAME" in
  ''|*[!a-zA-Z0-9_-]*) fail 'MCP_DB_APP_NAME contains unsupported characters' ;;
esac

command -v psql >/dev/null 2>&1 || fail 'psql is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-mcp-verify.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$MCP_DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE node -e '
  const fs = require("node:fs")
  const url = new URL(process.env.RAW_DATABASE_URL)
  if (!/^postgres(ql)?:$/.test(url.protocol)) throw new Error("MCP_DATABASE_URL must use PostgreSQL")
  const decode = value => decodeURIComponent(value)
  const escapeField = value => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:")
  const fields = [url.hostname || "localhost", url.port || "5432", decode(url.pathname.replace(/^\//, "")), decode(url.username), decode(url.password)].map(escapeField)
  fs.writeFileSync(process.env.PGPASSFILE_PATH, `${fields.join(":")}\n`, { mode: 0o600 })
  if (url.searchParams.has("password") || url.searchParams.has("sslpassword")) throw new Error("put database passwords in the URL authority, not query parameters")
  url.password = ""
  url.searchParams.delete("schema")
  process.stdout.write(url.toString())
')
MCP_URL_APP_NAME=$(RAW_DATABASE_URL=$MCP_DATABASE_URL node -e '
  const url = new URL(process.env.RAW_DATABASE_URL)
  process.stdout.write(url.searchParams.get("application_name") ?? "")
')
[ "$MCP_URL_APP_NAME" = "$MCP_DB_APP_NAME" ] \
  || fail "MCP_DATABASE_URL must set application_name=$MCP_DB_APP_NAME"
unset MCP_DATABASE_URL PGPASSWORD
export MCP_DB_ROLE MCP_DB_SCHEMA MCP_DB_APP_NAME

issues=$(psql "$PSQL_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 <<'SQL'
\getenv expected_role MCP_DB_ROLE
\getenv target_schema MCP_DB_SCHEMA
\getenv expected_app_name MCP_DB_APP_NAME

WITH role_row AS (
  SELECT * FROM pg_roles WHERE rolname = current_user
), allowed_relation(relname) AS (
  VALUES
    ('Actor'), ('ActorDocumentRef'), ('ActorRelationship'), ('BoardMember'),
    ('BusinessRelationship'), ('Company'), ('CompanyDocumentRef'),
    ('CompanyOwnership'), ('CompanyProperty'), ('Document'),
    ('EvidenceAppraisal'), ('FieldCitation'), ('Insight'), ('LibraryAnalysisRecord'), ('Report'),
    ('PersonProfile'), ('Shareholder'), ('SourceCitation'), ('SourceDoc'),
    ('Thesis')
), user_schema AS (
  SELECT oid, nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
), user_relations AS (
  SELECT class.oid, namespace.nspname, class.relname,
    namespace.nspname = :'target_schema'
      AND allowed_relation.relname IS NOT NULL AS is_allowed
  FROM pg_class class
  JOIN user_schema namespace ON namespace.oid = class.relnamespace
  LEFT JOIN allowed_relation
    ON namespace.nspname = :'target_schema'
   AND allowed_relation.relname = class.relname
  WHERE class.relkind IN ('r', 'p', 'v', 'm', 'f')
), target_relations AS (
  SELECT *
  FROM user_relations
  WHERE nspname = :'target_schema'
), user_sequences AS (
  SELECT class.oid, namespace.nspname, class.relname
  FROM pg_class class
  JOIN user_schema namespace ON namespace.oid = class.relnamespace
  WHERE class.relkind = 'S'
), user_routines AS (
  SELECT procedure.oid, procedure.proowner, procedure.prosecdef,
    procedure.proacl, namespace.nspname
  FROM pg_proc procedure
  JOIN user_schema namespace ON namespace.oid = procedure.pronamespace
), user_object_owners AS (
  SELECT DISTINCT class.relowner AS owner_oid
  FROM pg_class class
  JOIN user_schema namespace ON namespace.oid = class.relnamespace
  UNION
  SELECT DISTINCT procedure.proowner AS owner_oid
  FROM user_routines procedure
), role_membership AS (
  SELECT granted.rolname
  FROM pg_auth_members membership
  JOIN pg_roles granted ON granted.oid = membership.roleid
  JOIN pg_roles member ON member.oid = membership.member
  WHERE member.rolname = current_user
), checks(issue) AS (
  SELECT format('connected as %I, expected %I', current_user, :'expected_role')
  WHERE current_user <> :'expected_role'
  UNION ALL
  SELECT 'role has an elevated cluster attribute'
  FROM role_row
  WHERE rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls OR rolinherit
  UNION ALL
  SELECT 'role must be LOGIN with connection limit 10'
  FROM role_row
  WHERE NOT rolcanlogin OR rolconnlimit <> 10
  UNION ALL
  SELECT format('role can SET ROLE through membership in %I', rolname)
  FROM role_membership
  UNION ALL
  SELECT 'role owns the connected database'
  WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = current_database() AND datdba = (SELECT oid FROM role_row))
  UNION ALL
  SELECT 'role owns an object in a non-system schema'
  WHERE EXISTS (
    SELECT 1 FROM pg_class class
    JOIN user_schema namespace ON namespace.oid = class.relnamespace
    WHERE class.relowner = (SELECT oid FROM role_row)
  )
  UNION ALL
  SELECT 'role owns a routine in a non-system schema'
  WHERE EXISTS (
    SELECT 1
    FROM user_routines procedure
    WHERE procedure.proowner = (SELECT oid FROM role_row)
  )
  UNION ALL
  SELECT 'database TEMP privilege is still effective'
  WHERE has_database_privilege(current_user, current_database(), 'TEMP')
  UNION ALL
  SELECT 'database CREATE privilege is still effective'
  WHERE has_database_privilege(current_user, current_database(), 'CREATE')
  UNION ALL
  SELECT 'target schema USAGE privilege is missing'
  WHERE NOT has_schema_privilege(current_user, :'target_schema', 'USAGE')
  UNION ALL
  SELECT format('schema USAGE privilege is effective outside the target on %I', nspname)
  FROM user_schema
  WHERE nspname <> :'target_schema'
    AND has_schema_privilege(current_user, oid, 'USAGE')
  UNION ALL
  SELECT format('schema CREATE privilege is effective on %I', nspname)
  FROM user_schema
  WHERE has_schema_privilege(current_user, oid, 'CREATE')
  UNION ALL
  SELECT 'one or more MCP allowlist relations are missing'
  WHERE EXISTS (
    SELECT relname FROM allowed_relation
    EXCEPT
    SELECT relname FROM target_relations
  )
  UNION ALL
  SELECT 'SELECT is missing on one or more MCP allowlist relations'
  WHERE EXISTS (
    SELECT 1 FROM target_relations
    WHERE is_allowed AND NOT has_table_privilege(current_user, oid, 'SELECT')
  )
  UNION ALL
  SELECT format('SELECT is effective outside the MCP allowlist on %I.%I', nspname, relname)
  FROM user_relations
  WHERE NOT is_allowed AND has_table_privilege(current_user, oid, 'SELECT')
  UNION ALL
  SELECT format('column SELECT is effective outside the MCP allowlist on %I.%I', nspname, relname)
  FROM user_relations
  WHERE NOT is_allowed
    AND NOT has_table_privilege(current_user, oid, 'SELECT')
    AND has_any_column_privilege(current_user, oid, 'SELECT')
  UNION ALL
  SELECT format('a write privilege is effective on %I.%I', nspname, relname)
  FROM user_relations
  WHERE has_table_privilege(current_user, oid, 'INSERT')
     OR has_table_privilege(current_user, oid, 'UPDATE')
     OR has_table_privilege(current_user, oid, 'DELETE')
     OR has_table_privilege(current_user, oid, 'TRUNCATE')
     OR has_table_privilege(current_user, oid, 'REFERENCES')
     OR has_table_privilege(current_user, oid, 'TRIGGER')
  UNION ALL
  SELECT format('a column write privilege is effective on %I.%I', nspname, relname)
  FROM user_relations
  WHERE (
      NOT has_table_privilege(current_user, oid, 'INSERT')
      AND has_any_column_privilege(current_user, oid, 'INSERT')
    ) OR (
      NOT has_table_privilege(current_user, oid, 'UPDATE')
      AND has_any_column_privilege(current_user, oid, 'UPDATE')
    ) OR (
      NOT has_table_privilege(current_user, oid, 'REFERENCES')
      AND has_any_column_privilege(current_user, oid, 'REFERENCES')
    )
  UNION ALL
  SELECT format('sequence privilege is effective on %I.%I', nspname, relname)
  FROM user_sequences
  WHERE has_sequence_privilege(current_user, oid, 'SELECT')
     OR has_sequence_privilege(current_user, oid, 'USAGE')
     OR has_sequence_privilege(current_user, oid, 'UPDATE')
  UNION ALL
  SELECT format('direct routine privilege is granted in schema %I', nspname)
  FROM user_routines procedure
  WHERE EXISTS (
    SELECT 1
    FROM aclexplode(COALESCE(procedure.proacl, acldefault('f', procedure.proowner))) privilege
    WHERE privilege.grantee = (SELECT oid FROM role_row)
  )
  UNION ALL
  SELECT 'an executable SECURITY DEFINER routine can bypass table ACLs in a user schema'
  WHERE EXISTS (
    SELECT 1
    FROM user_routines procedure
    WHERE procedure.prosecdef
      AND has_function_privilege(current_user, procedure.oid, 'EXECUTE')
  )
  UNION ALL
  SELECT format('object owner %I retains default PUBLIC routine EXECUTE', owner.rolname)
  FROM user_object_owners object_owner
  JOIN pg_roles owner ON owner.oid = object_owner.owner_oid
  WHERE EXISTS (
    SELECT 1
    FROM aclexplode(COALESCE(
      (
        SELECT defaults.defaclacl
        FROM pg_default_acl defaults
        WHERE defaults.defaclrole = object_owner.owner_oid
          AND defaults.defaclnamespace = 0
          AND defaults.defaclobjtype = 'f'
      ),
      acldefault('f', object_owner.owner_oid)
    )) privilege
    WHERE privilege.grantee = 0
      AND privilege.privilege_type = 'EXECUTE'
  )
  UNION ALL
  SELECT 'default privileges could grant future relation, sequence, or direct routine access'
  WHERE EXISTS (
    SELECT 1
    FROM pg_default_acl defaults
    LEFT JOIN user_schema namespace ON namespace.oid = defaults.defaclnamespace
    CROSS JOIN LATERAL aclexplode(defaults.defaclacl) privilege
    WHERE (defaults.defaclnamespace = 0 OR namespace.oid IS NOT NULL)
      AND privilege.grantee IN (0, (SELECT oid FROM role_row))
      AND defaults.defaclobjtype IN ('r', 'S', 'f')
  )
  UNION ALL
  SELECT 'default_transaction_read_only is not on'
  WHERE current_setting('default_transaction_read_only') <> 'on'
  UNION ALL
  SELECT 'statement_timeout must be 15 seconds'
  WHERE current_setting('statement_timeout') <> '15s'
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
  printf '%s\n' '[mcp-role-verify] static privilege audit failed:' >&2
  printf '%s\n' "$issues" | sed 's/^/  - /' >&2
  exit 1
fi

probe_target=$(psql "$PSQL_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -v target_schema="$MCP_DB_SCHEMA" <<'SQL'
SELECT format('%I.%I|%I', namespace.nspname, class.relname, attribute.attname)
FROM pg_class class
JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
JOIN pg_attribute attribute ON attribute.attrelid = class.oid
WHERE namespace.nspname = :'target_schema'
  AND class.relkind IN ('r', 'p')
  AND class.relname IN (
    'Actor', 'ActorDocumentRef', 'ActorRelationship', 'BoardMember',
    'BusinessRelationship', 'Company', 'CompanyDocumentRef',
    'CompanyOwnership', 'CompanyProperty', 'Document', 'EvidenceAppraisal',
    'FieldCitation', 'Insight', 'LibraryAnalysisRecord', 'PersonProfile', 'Report', 'Shareholder',
    'SourceCitation', 'SourceDoc', 'Thesis'
  )
  AND attribute.attnum > 0
  AND NOT attribute.attisdropped
  AND attribute.attgenerated = ''
  AND attribute.attidentity = ''
ORDER BY class.relname, attribute.attnum
LIMIT 1;
SQL
)
[ -n "$probe_target" ] || fail "no readable probe target found in schema $MCP_DB_SCHEMA"
probe_relation=${probe_target%%|*}
probe_column=${probe_target#*|}

psql "$PSQL_DATABASE_URL" -X -v ON_ERROR_STOP=1 -q -c "SELECT count(*) FROM $probe_relation" >/dev/null

expect_denied() {
  label=$1
  sql=$2
  output_file=$(mktemp "${TMPDIR:-/tmp}/foodsystems-mcp-role.XXXXXX")
  if psql "$PSQL_DATABASE_URL" -X -v ON_ERROR_STOP=1 -q -c "$sql" >"$output_file" 2>&1; then
    rm -f "$output_file"
    fail "$label unexpectedly succeeded"
  fi
  if ! grep -Eiq 'permission denied|read-only transaction|not owner' "$output_file"; then
    printf '%s\n' "[mcp-role-verify] unexpected failure for $label:" >&2
    sed 's/^/  /' "$output_file" >&2
    rm -f "$output_file"
    exit 1
  fi
  rm -f "$output_file"
  printf '%s\n' "[mcp-role-verify] denied as expected: $label"
}

# Disable the default read-only GUC inside each new session to prove that ACLs,
# not prompt wording or a user-settable default alone, enforce the boundary.
expect_denied 'UPDATE' "SET default_transaction_read_only = off; UPDATE $probe_relation SET $probe_column = $probe_column WHERE false"
expect_denied 'DELETE' "SET default_transaction_read_only = off; DELETE FROM $probe_relation WHERE false"
expect_denied 'CREATE TABLE' "SET default_transaction_read_only = off; BEGIN; CREATE TABLE $MCP_DB_SCHEMA.mcp_write_probe_$$ (id integer); ROLLBACK"
expect_denied 'CREATE TEMP TABLE' "SET default_transaction_read_only = off; BEGIN; CREATE TEMP TABLE mcp_temp_probe_$$ (id integer); ROLLBACK"

printf '%s\n' "[mcp-role-verify] PASS: $MCP_DB_ROLE is SELECT-only on the MCP relation allowlist with CREATE/TEMP denied"
