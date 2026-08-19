#!/bin/sh
# Create or maintain the two candidate-analysis authority roles and replace
# only their effective privilege paths with the reviewed Delivery 1 allowlists.
set -eu

usage() {
  cat <<'EOF'
Usage: bootstrap-candidate-analysis-roles.sh --apply --confirm-database-session-drain

Required environment:
  DATABASE_ADMIN_URL                    PostgreSQL role/grant administrator URL

Optional environment:
  CANDIDATE_WORKER_DB_ROLE              Default: foodsystems_candidate_worker
  CANDIDATE_RECONCILER_DB_ROLE          Default: foodsystems_candidate_reconciler
  CANDIDATE_DB_SCHEMA                   Default: public
  CANDIDATE_WORKER_DB_APP_NAME          Default: foodsystems-candidate-worker
  CANDIDATE_RECONCILER_DB_APP_NAME      Default: foodsystems-candidate-reconciler

This operation never creates, changes, transports, or logs a login credential.
Missing roles are created NOLOGIN. Initial credentials must be provisioned by a
separate authorized operation. With existing dedicated credentials, restore in
this order: bootstrap grants, explicit enable, worker verify, reconciler verify.
Existing candidate roles must already be safely disabled before recovery; run
disable-candidate-analysis-writes.sh --apply first, then rerun bootstrap. Recovery
drains every other client session in the target database before restoring grants.
Incompatible PUBLIC/default-ACL state requires separate authorized hardening.
EOF
}

fail() {
  printf '%s\n' "[candidate-roles] ERROR: $*" >&2
  exit 1
}

[ "$#" -eq 2 ] || {
  usage >&2
  fail 'exactly --apply --confirm-database-session-drain is required'
}
[ "$1" = '--apply' ] && [ "$2" = '--confirm-database-session-drain' ] || {
  usage >&2
  fail 'exactly --apply --confirm-database-session-drain is required'
}

[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'

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
node "$SCRIPT_DIR/reject-ambient-candidate-libpq-env.mjs" candidate-role-bootstrap

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-candidate-bootstrap.XXXXXX")
cleanup_connection() {
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
}
trap cleanup_connection EXIT HUP INT TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$DATABASE_ADMIN_URL PGPASSFILE_PATH=$PGPASSFILE \
  CANDIDATE_URL_CONTEXT=candidate-roles \
  node "$SCRIPT_DIR/normalize-candidate-postgres-url.mjs")
unset DATABASE_ADMIN_URL PGPASSWORD PGOPTIONS PGSERVICE PGSERVICEFILE
export CANDIDATE_WORKER_DB_ROLE CANDIDATE_RECONCILER_DB_ROLE
export CANDIDATE_DB_SCHEMA CANDIDATE_WORKER_DB_APP_NAME CANDIDATE_RECONCILER_DB_APP_NAME

printf '%s\n' '[candidate-roles] replacing candidate authority-role grants without credential changes'

psql "$PSQL_DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -f - <<'SQL'
\getenv worker_role CANDIDATE_WORKER_DB_ROLE
\getenv reconciler_role CANDIDATE_RECONCILER_DB_ROLE
\getenv target_schema CANDIDATE_DB_SCHEMA
\getenv worker_app_name CANDIDATE_WORKER_DB_APP_NAME
\getenv reconciler_app_name CANDIDATE_RECONCILER_DB_APP_NAME

SELECT set_config('foodsystems.candidate_schema', :'target_schema', false);
SELECT set_config('foodsystems.candidate_worker_role', :'worker_role', false);
SELECT set_config('foodsystems.candidate_reconciler_role', :'reconciler_role', false);
DO $preflight$
DECLARE
  missing_relation boolean;
  incompatible_acl boolean;
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
  IF to_regnamespace(current_setting('foodsystems.candidate_schema')) IS NULL THEN
    RAISE EXCEPTION 'target schema does not exist';
  END IF;
  WITH required_relation(relname) AS (
    VALUES
      ('Document'), ('SourceDoc'), ('LibraryAnalysisRecord'),
      ('CandidateContentUnit'), ('CandidateAnalysisRun'),
      ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
      ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
      ('CandidateEvidenceLink'), ('CandidateDependency'),
      ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
      ('CandidatePromotionDecision')
  )
  SELECT EXISTS (
    SELECT relname FROM required_relation
    EXCEPT
    SELECT class.relname
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = current_setting('foodsystems.candidate_schema')
      AND class.relkind IN ('r', 'p')
  ) INTO missing_relation;
  IF missing_relation THEN
    RAISE EXCEPTION 'one or more candidate role relations are missing';
  END IF;

  WITH user_schema AS (
    SELECT oid AS schema_oid, nspname, nspowner, nspacl
    FROM pg_namespace
    WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
  ), user_class AS (
    SELECT class.oid, class.relkind, class.relowner, class.relacl
    FROM pg_class class
    JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
    WHERE class.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
  ), user_routine AS (
    SELECT procedure.oid, procedure.proowner, procedure.proacl
    FROM pg_proc procedure
    JOIN user_schema namespace ON namespace.schema_oid = procedure.pronamespace
  ), user_type AS (
    SELECT type.oid, type.typowner
    FROM pg_type type
    JOIN user_schema namespace ON namespace.schema_oid = type.typnamespace
  ), user_owner(owner_oid) AS (
    SELECT relowner FROM user_class
    UNION SELECT proowner FROM user_routine
    UNION SELECT typowner FROM user_type
  )
  SELECT
    EXISTS (
      SELECT 1 FROM pg_database database,
      LATERAL aclexplode(COALESCE(database.datacl, acldefault('d', database.datdba))) privilege
      WHERE database.datname = current_database()
        AND privilege.grantee = 0
        AND privilege.privilege_type IN ('CREATE', 'TEMPORARY')
    )
    OR EXISTS (
      SELECT 1 FROM user_schema namespace,
      LATERAL aclexplode(COALESCE(namespace.nspacl, acldefault('n', namespace.nspowner))) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_class class,
      LATERAL aclexplode(COALESCE(
        class.relacl,
        acldefault(CASE WHEN class.relkind = 'S' THEN 'S'::"char" ELSE 'r'::"char" END, class.relowner)
      )) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1
      FROM pg_attribute attribute
      JOIN user_class class ON class.oid = attribute.attrelid,
      LATERAL aclexplode(attribute.attacl) privilege
      WHERE attribute.attnum > 0 AND NOT attribute.attisdropped
        AND privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_routine routine,
      LATERAL aclexplode(COALESCE(routine.proacl, acldefault('f', routine.proowner))) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1
      FROM pg_default_acl defaults
      LEFT JOIN user_schema namespace ON namespace.schema_oid = defaults.defaclnamespace,
      LATERAL aclexplode(defaults.defaclacl) privilege
      WHERE (defaults.defaclnamespace = 0 OR namespace.schema_oid IS NOT NULL)
        AND defaults.defaclobjtype IN ('r', 'S', 'f')
        AND privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_owner owner
      WHERE EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(
          (
            SELECT defaults.defaclacl FROM pg_default_acl defaults
            WHERE defaults.defaclrole = owner.owner_oid
              AND defaults.defaclnamespace = 0
              AND defaults.defaclobjtype = 'f'
          ),
          acldefault('f', owner.owner_oid)
        )) privilege
        WHERE privilege.grantee = 0 AND privilege.privilege_type = 'EXECUTE'
      )
    )
    OR EXISTS (
      SELECT 1
      FROM pg_parameter_acl parameter,
      LATERAL aclexplode(parameter.paracl) privilege
      WHERE privilege.grantee = 0
        AND privilege.privilege_type IN ('SET', 'ALTER SYSTEM')
    ) INTO incompatible_acl;
  IF incompatible_acl THEN
    RAISE EXCEPTION 'incompatible PUBLIC or default ACL surface, including parameter privileges; use a separate authorized database-hardening operation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_prepared_xacts prepared
    WHERE prepared.database = current_database()
  ) THEN
    RAISE EXCEPTION 'prepared transaction exists in target database; resolve it before candidate recovery';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_roles role
    WHERE role.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) AND (
      role.rolcanlogin OR role.rolinherit OR role.rolsuper
      OR role.rolcreatedb OR role.rolcreaterole OR role.rolreplication
      OR role.rolbypassrls OR role.rolconnlimit <> 10
    )
  ) OR EXISTS (
    SELECT 1
    FROM pg_auth_members membership
    JOIN pg_roles granted ON granted.oid = membership.roleid
    JOIN pg_roles member ON member.oid = membership.member
    WHERE granted.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) OR member.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    )
  ) OR EXISTS (
    WITH candidate_role AS (
      SELECT oid FROM pg_roles
      WHERE rolname IN (
        current_setting('foodsystems.candidate_worker_role'),
        current_setting('foodsystems.candidate_reconciler_role')
      )
    ), user_relation AS (
      SELECT class.oid
      FROM pg_class class
      JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
      WHERE namespace.nspname <> 'information_schema'
        AND namespace.nspname !~ '^pg_'
        AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
    )
    SELECT 1
    FROM candidate_role role
    CROSS JOIN user_relation relation
    WHERE has_table_privilege(role.oid, relation.oid, 'INSERT')
       OR has_any_column_privilege(role.oid, relation.oid, 'INSERT')
  ) THEN
    RAISE EXCEPTION 'candidate roles must be disabled before bootstrap; run disable-candidate-analysis-writes.sh --apply first';
  END IF;
END
$preflight$;

BEGIN;

-- Hold every catalog that carries a checked authority fact through the target
-- database drain and grant repair. The order matches explicit login recovery.
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
  pg_catalog.pg_shdepend
IN SHARE ROW EXCLUSIVE MODE;

DO $locked_preflight$
DECLARE
  missing_relation boolean;
  incompatible_acl boolean;
BEGIN
  WITH required_relation(relname) AS (
    VALUES
      ('Document'), ('SourceDoc'), ('LibraryAnalysisRecord'),
      ('CandidateContentUnit'), ('CandidateAnalysisRun'),
      ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
      ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
      ('CandidateEvidenceLink'), ('CandidateDependency'),
      ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
      ('CandidatePromotionDecision')
  )
  SELECT EXISTS (
    SELECT relname FROM required_relation
    EXCEPT
    SELECT class.relname
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = current_setting('foodsystems.candidate_schema')
      AND class.relkind IN ('r', 'p')
  ) INTO missing_relation;
  IF missing_relation THEN
    RAISE EXCEPTION 'one or more candidate role relations are missing';
  END IF;

  WITH user_schema AS (
    SELECT oid AS schema_oid, nspname, nspowner, nspacl
    FROM pg_namespace
    WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
  ), user_class AS (
    SELECT class.oid, class.relkind, class.relowner, class.relacl
    FROM pg_class class
    JOIN user_schema namespace ON namespace.schema_oid = class.relnamespace
    WHERE class.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
  ), user_routine AS (
    SELECT procedure.oid, procedure.proowner, procedure.proacl
    FROM pg_proc procedure
    JOIN user_schema namespace ON namespace.schema_oid = procedure.pronamespace
  ), user_type AS (
    SELECT type.oid, type.typowner
    FROM pg_type type
    JOIN user_schema namespace ON namespace.schema_oid = type.typnamespace
  ), user_owner(owner_oid) AS (
    SELECT relowner FROM user_class
    UNION SELECT proowner FROM user_routine
    UNION SELECT typowner FROM user_type
  )
  SELECT
    EXISTS (
      SELECT 1 FROM pg_database database,
      LATERAL aclexplode(COALESCE(database.datacl, acldefault('d', database.datdba))) privilege
      WHERE database.datname = current_database()
        AND privilege.grantee = 0
        AND privilege.privilege_type IN ('CREATE', 'TEMPORARY')
    )
    OR EXISTS (
      SELECT 1 FROM user_schema namespace,
      LATERAL aclexplode(COALESCE(namespace.nspacl, acldefault('n', namespace.nspowner))) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_class class,
      LATERAL aclexplode(COALESCE(
        class.relacl,
        acldefault(CASE WHEN class.relkind = 'S' THEN 'S'::"char" ELSE 'r'::"char" END, class.relowner)
      )) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1
      FROM pg_attribute attribute
      JOIN user_class class ON class.oid = attribute.attrelid,
      LATERAL aclexplode(attribute.attacl) privilege
      WHERE attribute.attnum > 0 AND NOT attribute.attisdropped
        AND privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_routine routine,
      LATERAL aclexplode(COALESCE(routine.proacl, acldefault('f', routine.proowner))) privilege
      WHERE privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1
      FROM pg_default_acl defaults
      LEFT JOIN user_schema namespace ON namespace.schema_oid = defaults.defaclnamespace,
      LATERAL aclexplode(defaults.defaclacl) privilege
      WHERE (defaults.defaclnamespace = 0 OR namespace.schema_oid IS NOT NULL)
        AND defaults.defaclobjtype IN ('r', 'S', 'f')
        AND privilege.grantee = 0
    )
    OR EXISTS (
      SELECT 1 FROM user_owner owner
      WHERE EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(
          (
            SELECT defaults.defaclacl FROM pg_default_acl defaults
            WHERE defaults.defaclrole = owner.owner_oid
              AND defaults.defaclnamespace = 0
              AND defaults.defaclobjtype = 'f'
          ),
          acldefault('f', owner.owner_oid)
        )) privilege
        WHERE privilege.grantee = 0 AND privilege.privilege_type = 'EXECUTE'
      )
    )
    OR EXISTS (
      SELECT 1
      FROM pg_parameter_acl parameter,
      LATERAL aclexplode(parameter.paracl) privilege
      WHERE privilege.grantee = 0
        AND privilege.privilege_type IN ('SET', 'ALTER SYSTEM')
    ) INTO incompatible_acl;
  IF incompatible_acl THEN
    RAISE EXCEPTION 'incompatible PUBLIC or default ACL surface, including parameter privileges; use a separate authorized database-hardening operation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_prepared_xacts prepared
    WHERE prepared.database = current_database()
  ) THEN
    RAISE EXCEPTION 'prepared transaction exists in target database; resolve it before candidate recovery';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_roles role
    WHERE role.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) AND (
      role.rolcanlogin OR role.rolinherit OR role.rolsuper
      OR role.rolcreatedb OR role.rolcreaterole OR role.rolreplication
      OR role.rolbypassrls OR role.rolconnlimit <> 10
    )
  ) OR EXISTS (
    SELECT 1
    FROM pg_auth_members membership
    JOIN pg_roles granted ON granted.oid = membership.roleid
    JOIN pg_roles member ON member.oid = membership.member
    WHERE granted.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    ) OR member.rolname IN (
      current_setting('foodsystems.candidate_worker_role'),
      current_setting('foodsystems.candidate_reconciler_role')
    )
  ) OR EXISTS (
    WITH candidate_role AS (
      SELECT oid FROM pg_roles
      WHERE rolname IN (
        current_setting('foodsystems.candidate_worker_role'),
        current_setting('foodsystems.candidate_reconciler_role')
      )
    ), user_relation AS (
      SELECT class.oid
      FROM pg_class class
      JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
      WHERE namespace.nspname <> 'information_schema'
        AND namespace.nspname !~ '^pg_'
        AND class.relkind IN ('r', 'p', 'v', 'm', 'f')
    )
    SELECT 1
    FROM candidate_role role
    CROSS JOIN user_relation relation
    WHERE has_table_privilege(role.oid, relation.oid, 'INSERT')
       OR has_any_column_privilege(role.oid, relation.oid, 'INSERT')
  ) THEN
    RAISE EXCEPTION 'candidate roles must be disabled before bootstrap; run disable-candidate-analysis-writes.sh --apply first';
  END IF;
END
$locked_preflight$;

-- The captured set is the recovery epoch boundary: only other client backends
-- in this exact database are terminated, and every selected PID must disappear.
DO $drain$
DECLARE
  target_pids integer[];
BEGIN
  SELECT COALESCE(array_agg(activity.pid ORDER BY activity.pid), ARRAY[]::integer[])
  INTO target_pids
  FROM pg_stat_activity activity
  WHERE activity.datid = (SELECT oid FROM pg_database WHERE datname = current_database())
    AND activity.backend_type = 'client backend'
    AND activity.pid <> pg_backend_pid();

  PERFORM pg_terminate_backend(activity.pid, 5000)
  FROM pg_stat_activity activity
  WHERE activity.pid = ANY(target_pids);

  PERFORM pg_stat_clear_snapshot();

  IF EXISTS (
    SELECT 1 FROM pg_stat_activity activity
    WHERE activity.pid = ANY(target_pids)
  ) THEN
    RAISE EXCEPTION 'target database client sessions survived recovery drain';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_prepared_xacts prepared
    WHERE prepared.database = current_database()
  ) THEN
    RAISE EXCEPTION 'prepared transaction appeared during recovery drain';
  END IF;
END
$drain$;

SELECT format('CREATE ROLE %I NOLOGIN', role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name)
\gexec

SELECT format(
  'ALTER ROLE %I WITH NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10',
  role_name
)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
WITH candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format(
  'REVOKE ALL PRIVILEGES ON PARAMETER %I FROM %I',
  parameter.parname,
  candidate_role.role_name
)
FROM pg_parameter_acl parameter
CROSS JOIN candidate_role
\gexec
SELECT format('ALTER ROLE %I RESET ALL', role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format(
  'ALTER ROLE %I SET session_replication_role TO %L',
  role_name,
  'origin'
)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec

-- A candidate login must not be able to SET ROLE through inherited membership.
SELECT format('REVOKE %I FROM %I', granted.rolname, member.rolname)
FROM pg_auth_members membership
JOIN pg_roles granted ON granted.oid = membership.roleid
JOIN pg_roles member ON member.oid = membership.member
WHERE member.rolname IN (:'worker_role', :'reconciler_role')
\gexec
-- No stronger login may SET ROLE into a candidate identity either.
SELECT format('REVOKE %I FROM %I', granted.rolname, member.rolname)
FROM pg_auth_members membership
JOIN pg_roles granted ON granted.oid = membership.roleid
JOIN pg_roles member ON member.oid = membership.member
WHERE granted.rolname IN (:'worker_role', :'reconciler_role')
\gexec

SELECT format('REVOKE ALL PRIVILEGES ON DATABASE %I FROM %I', current_database(), role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec

WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE ALL PRIVILEGES ON SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
SELECT format('GRANT USAGE ON SCHEMA %I TO %I', :'target_schema', role_name)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec

WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
-- Relation revokes do not remove column ACLs, so clear every current column.
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
  'REVOKE ALL PRIVILEGES (%s) ON TABLE %I.%I FROM %I',
  column_list, nspname, relname, role_name
)
FROM user_relation_columns CROSS JOIN candidate_role
\gexec
WITH candidate_relation(relname) AS (
  VALUES
    ('CandidateContentUnit'), ('CandidateAnalysisRun'),
    ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
    ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
    ('CandidateEvidenceLink'), ('CandidateDependency'),
    ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
    ('CandidatePromotionDecision')
), worker_select(relname) AS (
  SELECT relname FROM candidate_relation
  UNION ALL VALUES ('Document'), ('SourceDoc'), ('LibraryAnalysisRecord')
)
SELECT format('GRANT SELECT ON TABLE %I.%I TO %I', :'target_schema', relname, :'worker_role')
FROM worker_select
\gexec
WITH candidate_relation(relname) AS (
  VALUES
    ('CandidateContentUnit'), ('CandidateAnalysisRun'),
    ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
    ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
    ('CandidateEvidenceLink'), ('CandidateDependency'),
    ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
    ('CandidatePromotionDecision')
)
SELECT format('GRANT SELECT ON TABLE %I.%I TO %I', :'target_schema', relname, :'reconciler_role')
FROM candidate_relation
\gexec
WITH worker_insert(relname) AS (
  VALUES
    ('CandidateAnalysisRun'), ('CandidateAnalysisRunInput'),
    ('CandidateAnalysisRunEvent'), ('CandidateAnalysisArtifact'),
    ('CandidateAssertion'), ('CandidateEvidenceLink'), ('CandidateDependency')
)
SELECT format('GRANT INSERT ON TABLE %I.%I TO %I', :'target_schema', relname, :'worker_role')
FROM worker_insert
\gexec
SELECT format(
  'GRANT INSERT ON TABLE %I.%I TO %I',
  :'target_schema', 'CandidateReconciliationSnapshot', :'reconciler_role'
)
\gexec

WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
WITH user_schema AS (
  SELECT nspname FROM pg_namespace
  WHERE nspname <> 'information_schema' AND nspname !~ '^pg_'
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format('REVOKE ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA %I FROM %I', nspname, role_name)
FROM user_schema CROSS JOIN candidate_role
\gexec
-- Remove every current direct/default grant to either candidate role only.
WITH default_acl AS (
  SELECT DISTINCT owner.rolname AS owner_name, namespace.nspname AS schema_name,
    defaults.defaclobjtype
  FROM pg_default_acl defaults
  JOIN pg_roles owner ON owner.oid = defaults.defaclrole
  LEFT JOIN pg_namespace namespace ON namespace.oid = defaults.defaclnamespace
  WHERE defaults.defaclnamespace = 0
     OR (namespace.nspname <> 'information_schema' AND namespace.nspname !~ '^pg_')
), candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE ALL PRIVILEGES ON %s FROM %I',
  owner_name,
  CASE WHEN schema_name IS NULL THEN '' ELSE format(' IN SCHEMA %I', schema_name) END,
  CASE defaclobjtype WHEN 'r' THEN 'TABLES' WHEN 'S' THEN 'SEQUENCES' ELSE 'FUNCTIONS' END,
  role_name
)
FROM default_acl CROSS JOIN candidate_role
WHERE defaclobjtype IN ('r', 'S', 'f')
\gexec
SELECT format('ALTER ROLE %I SET statement_timeout TO %L', role_name, '15s')
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format('ALTER ROLE %I SET lock_timeout TO %L', role_name, '2s')
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format('ALTER ROLE %I SET idle_in_transaction_session_timeout TO %L', role_name, '15s')
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format('ALTER ROLE %I SET search_path TO %I, %I', role_name, 'pg_catalog', :'target_schema')
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
SELECT format('ALTER ROLE %I SET application_name TO %L', :'worker_role', :'worker_app_name')
\gexec
SELECT format('ALTER ROLE %I SET application_name TO %L', :'reconciler_role', :'reconciler_app_name')
\gexec

COMMIT;
SQL

printf '%s\n' '[candidate-roles] recovery epoch and candidate grants complete; both roles remain NOLOGIN'
printf '%s\n' '[candidate-roles] explicit enable is still required before verifying or starting candidate workers'
