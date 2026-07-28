#!/bin/sh
# Create or rotate the dedicated MCP login role. This script changes database
# privileges and therefore requires an explicit --apply acknowledgement.
set -eu

usage() {
  cat <<'EOF'
Usage: bootstrap-mcp-readonly-role.sh --apply

Required environment:
  DATABASE_ADMIN_URL  PostgreSQL URL for a role allowed to manage roles/grants
  MCP_DB_PASSWORD     Password to set on the MCP login (never printed)

Optional environment:
  MCP_DB_ROLE         Login role (default: foodsystems_mcp_ro)
  MCP_DB_SCHEMA       Readable schema (default: public)
  MCP_DB_APP_NAME     Fixed application_name (default: foodsystems-mcp-ro)

The bootstrap revokes PUBLIC privileges on every non-system schema plus CREATE/TEMP on
the target database from PUBLIC. It also removes PUBLIC relation/column/sequence
privileges across every non-system schema before restoring the exact MCP
SELECT allowlist in the target schema, and revokes default PUBLIC routine
EXECUTE for current database-object owners so future SECURITY DEFINER routines
start fail-closed. PostgreSQL has no per-role DENY
privilege, so effective PUBLIC grants must be removed before the MCP role can
be proven read-only. Existing owners retain their owner privileges.
EOF
}

fail() {
  printf '%s\n' "[mcp-role] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  --apply) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; fail 'refusing to change grants without --apply' ;;
esac

[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'
[ -n "${MCP_DB_PASSWORD:-}" ] || fail 'MCP_DB_PASSWORD is required'

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

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-mcp-bootstrap.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$DATABASE_ADMIN_URL PGPASSFILE_PATH=$PGPASSFILE node -e '
  const fs = require("node:fs")
  const url = new URL(process.env.RAW_DATABASE_URL)
  if (!/^postgres(ql)?:$/.test(url.protocol)) throw new Error("DATABASE_ADMIN_URL must use PostgreSQL")
  const decode = value => decodeURIComponent(value)
  const escapeField = value => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:")
  const fields = [url.hostname || "localhost", url.port || "5432", decode(url.pathname.replace(/^\//, "")), decode(url.username), decode(url.password)].map(escapeField)
  fs.writeFileSync(process.env.PGPASSFILE_PATH, `${fields.join(":")}\n`, { mode: 0o600 })
  if (url.searchParams.has("password") || url.searchParams.has("sslpassword")) throw new Error("put database passwords in the URL authority, not query parameters")
  url.password = ""
  url.searchParams.delete("schema")
  process.stdout.write(url.toString())
')
unset DATABASE_ADMIN_URL PGPASSWORD
export MCP_DB_ROLE MCP_DB_PASSWORD MCP_DB_SCHEMA MCP_DB_APP_NAME

printf '%s\n' "[mcp-role] configuring $MCP_DB_ROLE on the database selected by DATABASE_ADMIN_URL"

psql "$PSQL_DATABASE_URL" -X -v ON_ERROR_STOP=1 <<'SQL'
\getenv mcp_role MCP_DB_ROLE
\getenv mcp_password MCP_DB_PASSWORD
\getenv mcp_schema MCP_DB_SCHEMA
\getenv mcp_app_name MCP_DB_APP_NAME

SELECT set_config('foodsystems.mcp_schema', :'mcp_schema', false);
DO $preflight$
DECLARE
  missing_required_relation boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = current_user
      AND (rolsuper OR rolcreaterole)
  ) THEN
    RAISE EXCEPTION 'connected role must have CREATEROLE or SUPERUSER';
  END IF;

  IF to_regnamespace(current_setting('foodsystems.mcp_schema')) IS NULL THEN
    RAISE EXCEPTION 'target schema does not exist';
  END IF;

  WITH required_relation(relname) AS (
    VALUES
      ('Actor'), ('ActorDocumentRef'), ('ActorRelationship'), ('BoardMember'),
      ('BusinessRelationship'), ('Company'), ('CompanyDocumentRef'),
      ('CompanyOwnership'), ('CompanyProperty'), ('Document'),
      ('EvidenceAppraisal'), ('FieldCitation'), ('Insight'), ('Report'),
      ('LibraryAnalysisRecord'), ('PersonProfile'), ('Shareholder'),
      ('SourceCitation'), ('SourceDoc'), ('Thesis')
  )
  SELECT EXISTS (
    SELECT relname FROM required_relation
    EXCEPT
    SELECT class.relname
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = current_setting('foodsystems.mcp_schema')
      AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
  ) INTO missing_required_relation;

  IF missing_required_relation THEN
    RAISE EXCEPTION 'one or more required MCP relations are missing';
  END IF;
END
$preflight$;

BEGIN;

SELECT format('CREATE ROLE %I', :'mcp_role')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'mcp_role')
\gexec

SELECT format(
  'ALTER ROLE %I WITH LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10 PASSWORD %L',
  :'mcp_role',
  :'mcp_password'
)
\gexec

-- A dedicated MCP login must not be able to SET ROLE into another role.
SELECT format('REVOKE %I FROM %I', granted.rolname, :'mcp_role')
FROM pg_auth_members membership
JOIN pg_roles granted ON granted.oid = membership.roleid
JOIN pg_roles member ON member.oid = membership.member
WHERE member.rolname = :'mcp_role'
\gexec

-- Remove inherited PUBLIC capabilities that cannot be denied per role.
SELECT format('REVOKE CREATE, TEMPORARY ON DATABASE %I FROM PUBLIC', current_database())
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON SCHEMA %I FROM PUBLIC', nspname)
FROM user_schema
\gexec

SELECT format('REVOKE ALL PRIVILEGES ON DATABASE %I FROM %I', current_database(), :'mcp_role')
\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'mcp_role')
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON SCHEMA %I FROM %I', nspname, :'mcp_role')
FROM user_schema
\gexec
SELECT format('GRANT USAGE ON SCHEMA %I TO %I', :'mcp_schema', :'mcp_role')
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I FROM %I', nspname, :'mcp_role')
FROM user_schema
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I FROM PUBLIC', nspname)
FROM user_schema
\gexec
-- REVOKE ... ON TABLE does not remove per-column ACL entries. Revoke every
-- current column explicitly so a SELECT/INSERT/UPDATE/REFERENCES grant cannot
-- survive on a relation outside the exact table allowlist. Memberships were
-- removed above; relation default ACLs are handled below (PostgreSQL has no
-- column-level ALTER DEFAULT PRIVILEGES form).
WITH user_relation_columns AS (
  SELECT
    namespace.nspname,
    class.relname,
    string_agg(format('%I', attribute.attname), ', ' ORDER BY attribute.attnum) AS column_list
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  JOIN pg_attribute attribute ON attribute.attrelid = class.oid
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
    AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND attribute.attnum > 0
    AND NOT attribute.attisdropped
  GROUP BY namespace.nspname, class.relname
)
SELECT format(
  'REVOKE ALL PRIVILEGES (%s) ON TABLE %I.%I FROM %I',
  column_list,
  nspname,
  relname,
  :'mcp_role'
)
FROM user_relation_columns
\gexec

WITH user_relation_columns AS (
  SELECT
    namespace.nspname,
    class.relname,
    string_agg(format('%I', attribute.attname), ', ' ORDER BY attribute.attnum) AS column_list
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  JOIN pg_attribute attribute ON attribute.attrelid = class.oid
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
    AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND attribute.attnum > 0
    AND NOT attribute.attisdropped
  GROUP BY namespace.nspname, class.relname
)
SELECT format(
  'REVOKE ALL PRIVILEGES (%s) ON TABLE %I.%I FROM PUBLIC',
  column_list,
  nspname,
  relname
)
FROM user_relation_columns
\gexec
WITH allowed_relation(relname) AS (
  VALUES
    ('Actor'), ('ActorDocumentRef'), ('ActorRelationship'), ('BoardMember'),
    ('BusinessRelationship'), ('Company'), ('CompanyDocumentRef'),
    ('CompanyOwnership'), ('CompanyProperty'), ('Document'),
    ('EvidenceAppraisal'), ('FieldCitation'), ('Insight'), ('Report'),
    ('LibraryAnalysisRecord'), ('PersonProfile'), ('Shareholder'),
    ('SourceCitation'), ('SourceDoc'), ('Thesis')
)
SELECT format('GRANT SELECT ON TABLE %I.%I TO %I', :'mcp_schema', relname, :'mcp_role')
FROM allowed_relation
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I FROM %I', nspname, :'mcp_role')
FROM user_schema
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I FROM PUBLIC', nspname)
FROM user_schema
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA %I FROM %I', nspname, :'mcp_role')
FROM user_schema
\gexec
WITH user_schema AS (
  SELECT nspname
  FROM pg_namespace
  WHERE nspname <> 'information_schema'
    AND nspname !~ '^pg_'
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA %I FROM %I', nspname, :'mcp_role')
FROM user_schema
\gexec
-- PostgreSQL grants routine EXECUTE to PUBLIC by default. Revoke only current
-- SECURITY DEFINER routines, whose owner context could bypass table ACLs;
-- revoking all public routines globally could break unrelated app roles.
SELECT format(
  'REVOKE EXECUTE ON %s %s FROM PUBLIC',
  CASE procedure.prokind WHEN 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
  procedure.oid::regprocedure
)
FROM pg_proc procedure
JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
WHERE namespace.nspname <> 'information_schema'
  AND namespace.nspname !~ '^pg_'
  AND procedure.prosecdef
\gexec

-- Reset defaults for every current user-schema object owner and the migration
-- operator. Custom PUBLIC defaults on relations/sequences are removed too;
-- otherwise a future object could silently escape the explicit allowlist.
-- New relations are intentionally not auto-granted: every MCP surface change
-- requires an explicit allowlist review and a fresh role verification.
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL PRIVILEGES ON TABLES FROM %I',
  owners.owner_name,
  :'mcp_role'
)
FROM (
  SELECT current_user AS owner_name
  UNION
  SELECT DISTINCT pg_get_userbyid(class.relowner)
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
    AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
) owners
\gexec

SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL PRIVILEGES ON SEQUENCES FROM %I',
  owners.owner_name,
  :'mcp_role'
)
FROM (
  SELECT current_user AS owner_name
  UNION
  SELECT DISTINCT pg_get_userbyid(class.relowner)
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
    AND class.relkind = 'S'
) owners
\gexec

SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL PRIVILEGES ON FUNCTIONS FROM %I',
  owners.owner_name,
  :'mcp_role'
)
FROM (
  SELECT current_user AS owner_name
  UNION
  SELECT DISTINCT pg_get_userbyid(procedure.proowner)
  FROM pg_proc procedure
  JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
) owners
\gexec

-- PostgreSQL normally gives PUBLIC EXECUTE on every new function/procedure.
-- Remove that default for the migration operator and every current user-schema
-- object owner. Owners retain execution; any application role that needs a
-- routine must receive an explicit grant. This prevents a future SECURITY
-- DEFINER routine from silently becoming an MCP privilege-escalation path.
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC',
  owners.owner_name
)
FROM (
  SELECT current_user AS owner_name
  UNION
  SELECT DISTINCT pg_get_userbyid(class.relowner)
  FROM pg_class class
  JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
  UNION
  SELECT DISTINCT pg_get_userbyid(procedure.proowner)
  FROM pg_proc procedure
  JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
  WHERE namespace.nspname <> 'information_schema'
    AND namespace.nspname !~ '^pg_'
) owners
\gexec

WITH default_acl AS (
  SELECT DISTINCT
    owner.rolname AS owner_name,
    namespace.nspname AS schema_name,
    defaults.defaclobjtype
  FROM pg_default_acl defaults
  JOIN pg_roles owner ON owner.oid = defaults.defaclrole
  LEFT JOIN pg_namespace namespace ON namespace.oid = defaults.defaclnamespace
  WHERE defaults.defaclnamespace = 0
     OR (
       namespace.nspname <> 'information_schema'
       AND namespace.nspname !~ '^pg_'
     )
)
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE ALL PRIVILEGES ON %s FROM %I',
  owner_name,
  CASE WHEN schema_name IS NULL THEN '' ELSE format(' IN SCHEMA %I', schema_name) END,
  CASE defaclobjtype
    WHEN 'r' THEN 'TABLES'
    WHEN 'S' THEN 'SEQUENCES'
    ELSE 'FUNCTIONS'
  END,
  :'mcp_role'
)
FROM default_acl
WHERE defaclobjtype IN ('r', 'S', 'f')
\gexec

WITH default_acl AS (
  SELECT DISTINCT
    owner.rolname AS owner_name,
    namespace.nspname AS schema_name,
    defaults.defaclobjtype
  FROM pg_default_acl defaults
  JOIN pg_roles owner ON owner.oid = defaults.defaclrole
  LEFT JOIN pg_namespace namespace ON namespace.oid = defaults.defaclnamespace
  WHERE defaults.defaclnamespace = 0
     OR (
       namespace.nspname <> 'information_schema'
       AND namespace.nspname !~ '^pg_'
     )
)
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE ALL PRIVILEGES ON %s FROM PUBLIC',
  owner_name,
  CASE WHEN schema_name IS NULL THEN '' ELSE format(' IN SCHEMA %I', schema_name) END,
  CASE defaclobjtype
    WHEN 'r' THEN 'TABLES'
    WHEN 'S' THEN 'SEQUENCES'
    ELSE 'FUNCTIONS'
  END
)
FROM default_acl
WHERE defaclobjtype IN ('r', 'S', 'f')
\gexec

SELECT format('ALTER ROLE %I SET default_transaction_read_only TO %L', :'mcp_role', 'on')
\gexec
SELECT format('ALTER ROLE %I SET statement_timeout TO %L', :'mcp_role', '15s')
\gexec
SELECT format('ALTER ROLE %I SET lock_timeout TO %L', :'mcp_role', '2s')
\gexec
SELECT format('ALTER ROLE %I SET idle_in_transaction_session_timeout TO %L', :'mcp_role', '15s')
\gexec
SELECT format(
  'ALTER ROLE %I SET search_path TO %I, %I',
  :'mcp_role',
  'pg_catalog',
  :'mcp_schema'
)
\gexec
SELECT format('ALTER ROLE %I SET application_name TO %L', :'mcp_role', :'mcp_app_name')
\gexec

COMMIT;
SQL

printf '%s\n' '[mcp-role] bootstrap complete; run verify-mcp-readonly-role.sh with the dedicated login URL'
