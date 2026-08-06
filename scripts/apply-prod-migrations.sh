#!/bin/sh
# Production schema-sync: applies every committed Prisma migration to the
# database in DATABASE_URL. Runs as Coolify's post_deployment_command.
#
# Why a plain psql script and not Prisma:
#   - `prisma db push` is incompatible with the STORED GENERATED search_vector
#     columns, so it was removed from the deploy.
#   - `prisma migrate deploy` needs migration history that this database does
#     not have (it was bootstrapped with db push).
#   - The Next.js standalone runner image cannot load the Prisma client / its
#     driver adapter, so a Node-based runner is not an option here.
#
# Every committed migration is authored idempotently (IF NOT EXISTS / guarded
# DO-blocks), so applying the full set on every deploy is safe.
#
# That was an unchecked assumption until 2026-08-06, when three migrations on
# main turned out to fail on re-application. With set -e below, the loop died
# on #11 of 14 and everything after it — including LibraryAnalysisRecord —
# never reached prod, silently. The assumption is now enforced by
# `npm run db:verify:migration-idempotency` in the PR quality gates: it applies
# the whole set twice against a throwaway database. Do not hand-author a
# migration without a guard; CI will reject it.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[migrate] DATABASE_URL not set — skipping" >&2
  exit 0
fi

# psql/libpq rejects Prisma's `?schema=` connection-string parameter — strip it.
DB="${DATABASE_URL%%\?*}"

MIGRATIONS_DIR="$(CDPATH= cd "$(dirname "$0")/../prisma/migrations" && pwd)"

for f in "$MIGRATIONS_DIR"/*/migration.sql; do
  [ -f "$f" ] || continue
  echo "[migrate] apply $f"
  psql "$DB" -v ON_ERROR_STOP=1 -f "$f"
done

echo "[migrate] schema sync OK"
