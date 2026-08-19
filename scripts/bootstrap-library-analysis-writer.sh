#!/bin/sh
# Create the restricted login role the model analysis adapter writes as.
#
# The adapter appends candidate runs and nothing else. This role reflects that:
# it may read the sources it analyses and insert into LibraryAnalysisRun, and it
# has no privilege on canonical, coverage or publication data. It is a railing
# against a buggy or runaway analysis job, not a defence against an attacker who
# already holds the database owner role.
#
# Changing privileges requires an explicit --apply acknowledgement.
set -eu

usage() {
  cat <<'EOF'
Usage: bootstrap-library-analysis-writer.sh --apply

Required environment:
  DATABASE_ADMIN_URL           PostgreSQL URL for a role allowed to manage roles/grants
  LIBRARY_ANALYSIS_DB_PASSWORD Password to set on the login (never printed)

Optional environment:
  LIBRARY_ANALYSIS_DB_ROLE     Login role (default: foodsystems_analysis_writer)
  LIBRARY_ANALYSIS_DB_SCHEMA   Schema holding the tables (default: public)

The role is reset to no privileges before the allowlist is granted, so removing
a table from the list below actually withdraws access on the next run.
EOF
}

fail() {
  printf '%s\n' "[analysis-writer] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  --apply) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; fail 'refusing to change grants without --apply' ;;
esac

[ -n "${DATABASE_ADMIN_URL:-}" ] || fail 'DATABASE_ADMIN_URL is required'
[ -n "${LIBRARY_ANALYSIS_DB_PASSWORD:-}" ] || fail 'LIBRARY_ANALYSIS_DB_PASSWORD is required'

ROLE=${LIBRARY_ANALYSIS_DB_ROLE:-foodsystems_analysis_writer}
SCHEMA=${LIBRARY_ANALYSIS_DB_SCHEMA:-public}

case "$ROLE" in
  ''|*[!a-z0-9_]*) fail 'LIBRARY_ANALYSIS_DB_ROLE must contain only lowercase letters, digits, and underscores' ;;
esac
case "$SCHEMA" in
  ''|*[!a-zA-Z0-9_]*) fail 'LIBRARY_ANALYSIS_DB_SCHEMA must be a simple PostgreSQL identifier' ;;
esac

command -v psql >/dev/null 2>&1 || fail 'psql is required'

# Tables the adapter reads to build an analysis request and resolve its source.
READABLE='"Document", "SourceDoc", "Report", "Thesis", "SourceCitation", "LibraryAnalysisRecord"'
# The single table the adapter writes. SELECT is required because an INSERT
# returning the created row reads it back.
WRITABLE='"LibraryAnalysisRun"'

# psql reads the password from the environment with \getenv, so it never appears
# in the process list the way a -v argument would.
export ROLE SCHEMA
LIBRARY_ANALYSIS_DB_PASSWORD=$LIBRARY_ANALYSIS_DB_PASSWORD
export LIBRARY_ANALYSIS_DB_PASSWORD

printf '%s\n' "[analysis-writer] configuring $ROLE on the database selected by DATABASE_ADMIN_URL"

psql "$DATABASE_ADMIN_URL" -X -q -v ON_ERROR_STOP=1 <<SQL
\getenv writer_role ROLE
\getenv writer_password LIBRARY_ANALYSIS_DB_PASSWORD
\getenv writer_schema SCHEMA

-- psql variables are not expanded inside a dollar-quoted body, so the role
-- statement is built as text and executed with \gexec. \gexec does not echo,
-- so the password is not printed.
SELECT format(
  '%s ROLE %I LOGIN PASSWORD %L',
  CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'writer_role')
    THEN 'ALTER' ELSE 'CREATE' END,
  :'writer_role',
  :'writer_password'
)
\gexec

BEGIN;

-- Reset first, so removing a table from the allowlist withdraws access.
REVOKE ALL ON ALL TABLES IN SCHEMA :"writer_schema" FROM :"writer_role";
REVOKE ALL ON ALL SEQUENCES IN SCHEMA :"writer_schema" FROM :"writer_role";
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA :"writer_schema" FROM :"writer_role";
REVOKE ALL ON SCHEMA :"writer_schema" FROM :"writer_role";
REVOKE ALL ON DATABASE :"DBNAME" FROM :"writer_role";

GRANT CONNECT ON DATABASE :"DBNAME" TO :"writer_role";
GRANT USAGE ON SCHEMA :"writer_schema" TO :"writer_role";
GRANT SELECT ON $READABLE TO :"writer_role";
GRANT SELECT, INSERT ON $WRITABLE TO :"writer_role";

COMMIT;
SQL

printf '%s\n' "[analysis-writer] $ROLE may read sources and append to LibraryAnalysisRun in schema $SCHEMA"
printf '%s\n' "[analysis-writer] no privilege was granted on canonical, coverage or publication tables"
