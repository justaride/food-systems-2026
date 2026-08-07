#!/bin/sh
# Fail closed on database/Prisma schema drift while allowing only the
# documented GENERATED search_vector columns/indexes that Prisma cannot model.
set -eu

usage() {
  cat <<'EOF'
Usage: verify-database-schema-drift.sh

Required environment:
  DATABASE_URL  Database to compare with prisma/schema.prisma

Optional environment:
  PRISMA_BIN          Explicit Prisma CLI executable
  PRISMA_SCHEMA_FILE  Schema path (default: prisma/schema.prisma)

Exit 0 means either no drift or only the verified generated-FTS difference.
Any extra table, column, constraint, index, enum, or unknown SQL is an error.
EOF
}

fail() {
  printf '%s\n' "[schema-drift] ERROR: $*" >&2
  exit 1
}

case "${1:-}" in
  -h|--help) usage; exit 0 ;;
  '') ;;
  *) usage >&2; fail "unknown argument: $1" ;;
esac

[ -n "${DATABASE_URL:-}" ] || fail 'DATABASE_URL is required'
command -v node >/dev/null 2>&1 || fail 'node is required to normalize the connection URL'
command -v psql >/dev/null 2>&1 || fail 'psql is required to verify the FTS contract'

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SCHEMA_FILE=${PRISMA_SCHEMA_FILE:-"$REPO_ROOT/prisma/schema.prisma"}
[ -f "$SCHEMA_FILE" ] || fail "Prisma schema not found: $SCHEMA_FILE"

if [ -n "${PRISMA_BIN:-}" ]; then
  [ -x "$PRISMA_BIN" ] || fail "PRISMA_BIN is not executable: $PRISMA_BIN"
  prisma_bin=$PRISMA_BIN
elif [ -x "$REPO_ROOT/node_modules/.bin/prisma" ]; then
  prisma_bin=$REPO_ROOT/node_modules/.bin/prisma
else
  fail 'Prisma CLI not found; set PRISMA_BIN or install repository dependencies'
fi

connection_dir=$(mktemp -d "${TMPDIR:-/tmp}/foodsystems-drift-credentials.XXXXXX")
diff_file=''
filtered_file=''
cleanup() {
  cleanup_status=$?
  trap - EXIT HUP INT TERM
  set +e
  [ -z "$diff_file" ] || rm -f "$diff_file" "$filtered_file"
  rm -f "$connection_dir/pgpass"
  rmdir "$connection_dir" 2>/dev/null || true
  exit "$cleanup_status"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
export PGPASSFILE=$connection_dir/pgpass
PSQL_DATABASE_URL=$(RAW_DATABASE_URL=$DATABASE_URL PGPASSFILE_PATH=$PGPASSFILE node -e '
  const fs = require("node:fs")
  const url = new URL(process.env.RAW_DATABASE_URL)
  if (!/^postgres(ql)?:$/.test(url.protocol)) throw new Error("DATABASE_URL must use PostgreSQL")
  if (url.searchParams.has("password") || url.searchParams.has("sslpassword")) throw new Error("put database passwords in the URL authority, not query parameters")
  const decode = value => decodeURIComponent(value)
  const escapeField = value => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:")
  const fields = [url.hostname || "localhost", url.port || "5432", decode(url.pathname.replace(/^\//, "")), decode(url.username), decode(url.password)].map(escapeField)
  fs.writeFileSync(process.env.PGPASSFILE_PATH, `${fields.join(":")}\n`, { mode: 0o600 })
  url.password = ""
  url.searchParams.delete("schema")
  process.stdout.write(url.toString())
')

# An allowed Prisma diff is trustworthy only when PostgreSQL confirms the
# columns are generated tsvectors, their indexes are valid, and both wrapper
# functions are immutable.
fts_issues=$(psql "$PSQL_DATABASE_URL" -X -A -t -q -v ON_ERROR_STOP=1 <<'SQL'
SET search_path = pg_catalog, public;
WITH expected(table_name, expected_terms, required_fragments) AS (
  VALUES
    (
      'Document',
      4,
      ARRAY[
        'setweight(immutable_to_tsvector_no(title), ''A''::"char")',
        'setweight(immutable_to_tsvector_no(summary), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(content), ''C''::"char")'
      ]::text[]
    ),
    (
      'Insight',
      3,
      ARRAY[
        'setweight(immutable_to_tsvector_no(title), ''A''::"char")',
        'setweight(immutable_to_tsvector_no(description), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), ''B''::"char")'
      ]::text[]
    ),
    (
      'Report',
      6,
      ARRAY[
        'setweight(immutable_to_tsvector_no(title), ''A''::"char")',
        'setweight(immutable_to_tsvector_no("fullTitle"), ''A''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(recommendations)), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(relevance), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), ''B''::"char")'
      ]::text[]
    ),
    (
      'Thesis',
      6,
      ARRAY[
        'setweight(immutable_to_tsvector_no(title), ''A''::"char")',
        'setweight(immutable_to_tsvector_no("titleNo"), ''A''::"char")',
        'setweight(immutable_to_tsvector_no(synthesis), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(takeaways)), ''B''::"char")',
        'setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), ''B''::"char")'
      ]::text[]
    )
), column_check AS (
  SELECT
    expected.table_name,
    expected.expected_terms,
    expected.required_fragments,
    columns.data_type,
    columns.udt_name,
    columns.is_generated,
    columns.generation_expression
  FROM expected
  LEFT JOIN information_schema.columns columns
    ON columns.table_schema = 'public'
   AND columns.table_name = expected.table_name
   AND columns.column_name = 'search_vector'
), index_check AS (
  SELECT
    expected.table_name,
    bool_or(
      index_class.oid IS NOT NULL
      AND access_method.amname = 'gin'
      AND indexed_attribute.attname = 'search_vector'
      AND operator_class.opcname = 'tsvector_ops'
      AND index.indisvalid
      AND index.indisready
      AND NOT index.indisunique
      AND index.indnkeyatts = 1
      AND index.indnatts = 1
      AND index.indpred IS NULL
      AND index.indexprs IS NULL
    ) AS valid_index
  FROM expected
  LEFT JOIN pg_class table_class ON table_class.relname = expected.table_name
  LEFT JOIN pg_namespace namespace ON namespace.oid = table_class.relnamespace AND namespace.nspname = 'public'
  LEFT JOIN pg_index index ON index.indrelid = table_class.oid
  LEFT JOIN pg_class index_class
    ON index_class.oid = index.indexrelid
   AND index_class.relname = expected.table_name || '_search_vector_idx'
  LEFT JOIN pg_am access_method ON access_method.oid = index_class.relam
  LEFT JOIN pg_attribute indexed_attribute
    ON indexed_attribute.attrelid = table_class.oid
   AND indexed_attribute.attnum = index.indkey[0]
  LEFT JOIN pg_opclass operator_class ON operator_class.oid = index.indclass[0]
  WHERE namespace.oid IS NOT NULL
  GROUP BY expected.table_name
), checks(issue) AS (
  SELECT format('%s.search_vector is missing or is not a generated tsvector', table_name)
  FROM column_check
  WHERE udt_name IS DISTINCT FROM 'tsvector'
     OR is_generated IS DISTINCT FROM 'ALWAYS'
     OR generation_expression IS NULL
  UNION ALL
  SELECT format('%s.search_vector generation expression does not match the documented weighted fields', table_name)
  FROM column_check
  WHERE generation_expression IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM unnest(required_fragments) fragment
        WHERE position(fragment IN generation_expression) = 0
      )
      OR regexp_count(generation_expression, 'immutable_to_tsvector_no') <> expected_terms
      OR regexp_count(generation_expression, 'setweight') <> expected_terms
      OR regexp_count(generation_expression, '\|\|') <> expected_terms - 1
    )
  UNION ALL
  SELECT format('%s_search_vector_idx is missing, invalid, or unready', table_name)
  FROM index_check
  WHERE valid_index IS DISTINCT FROM true
  UNION ALL
  SELECT 'immutable_to_tsvector_no(text) is missing or has an unsafe definition'
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_proc procedure
    JOIN pg_language language ON language.oid = procedure.prolang
    WHERE procedure.oid = to_regprocedure('public.immutable_to_tsvector_no(text)')
      AND procedure.provolatile = 'i'
      AND NOT procedure.prosecdef
      AND procedure.prokind = 'f'
      AND language.lanname = 'sql'
      AND procedure.proconfig @> ARRAY['search_path=pg_catalog']
      AND position('pg_catalog.to_tsvector(''norwegian''::regconfig, COALESCE($1, ''''))' IN procedure.prosrc) > 0
  )
  UNION ALL
  SELECT 'immutable_array_to_string(text[]) is missing or has an unsafe definition'
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_proc procedure
    JOIN pg_language language ON language.oid = procedure.prolang
    WHERE procedure.oid = to_regprocedure('public.immutable_array_to_string(text[])')
      AND procedure.provolatile = 'i'
      AND NOT procedure.prosecdef
      AND procedure.prokind = 'f'
      AND language.lanname = 'sql'
      AND procedure.proconfig @> ARRAY['search_path=pg_catalog']
      AND position('COALESCE(pg_catalog.array_to_string($1, '' ''), '''')' IN procedure.prosrc) > 0
  )
)
SELECT issue FROM checks ORDER BY issue;
SQL
)
diff_file=$(mktemp "${TMPDIR:-/tmp}/foodsystems-prisma-drift.sql.XXXXXX")
filtered_file=$diff_file.filtered

PRISMA_HIDE_UPDATE_MESSAGE=1 "$prisma_bin" migrate diff \
  --from-config-datasource \
  --to-schema "$SCHEMA_FILE" \
  --script \
  --output "$diff_file"

sed -e 's/\r$//' -e '/^[[:space:]]*--/d' -e '/^[[:space:]]*$/d' "$diff_file" >"$filtered_file"

if [ ! -s "$filtered_file" ] && [ -z "$fts_issues" ]; then
  printf '%s\n' '[schema-drift] PASS: database matches Prisma schema and generated-FTS contract'
  exit 0
fi

unknown_drift=$(grep -Ev '^(ALTER TABLE "(Document|Insight|Report|Thesis)" ALTER COLUMN "search_vector" DROP DEFAULT;|DROP INDEX "(Document|Insight|Report|Thesis)_search_vector_idx";)$' "$filtered_file" || true)
if [ -n "$unknown_drift" ]; then
  printf '%s\n' '[schema-drift] unknown drift detected; full migration diff follows:' >&2
  sed 's/^/  /' "$diff_file" >&2
  if [ -n "$fts_issues" ]; then
    printf '%s\n' '[schema-drift] generated-FTS contract also failed:' >&2
    printf '%s\n' "$fts_issues" | sed 's/^/  - /' >&2
  fi
  exit 1
fi

if [ -n "$fts_issues" ]; then
  printf '%s\n' '[schema-drift] generated-FTS contract failed:' >&2
  printf '%s\n' "$fts_issues" | sed 's/^/  - /' >&2
  exit 1
fi

allowed_count=$(wc -l <"$filtered_file" | tr -d ' ')
[ "$allowed_count" -eq 4 ] || [ "$allowed_count" -eq 8 ] \
  || fail "expected four generated-column differences, optionally plus four matching FTS-index differences; found $allowed_count"
for table_name in Document Insight Report Thesis; do
  default_count=$(grep -Fxc "ALTER TABLE \"$table_name\" ALTER COLUMN \"search_vector\" DROP DEFAULT;" "$filtered_file" || true)
  [ "$default_count" -eq 1 ] \
    || fail "documented FTS difference missing for $table_name"

  index_count=$(grep -Fxc "DROP INDEX \"${table_name}_search_vector_idx\";" "$filtered_file" || true)
  if [ "$allowed_count" -eq 8 ]; then
    [ "$index_count" -eq 1 ] || fail "documented FTS index difference missing for $table_name"
  else
    [ "$index_count" -eq 0 ] || fail "partial FTS index-difference set found for $table_name"
  fi
done

printf '%s\n' '[schema-drift] PASS: only a documented generated-FTS Prisma diff remains'
