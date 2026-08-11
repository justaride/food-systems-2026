\set ON_ERROR_STOP on
SET TIME ZONE 'UTC';

DO $contract$
DECLARE
  relation_name text;
  identity_count bigint;
  completed_migration_count bigint;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'public."ControlledMutationAudit"',
    'public."DatabaseIdentity"',
    'public."Document"',
    'public."EvidenceAppraisal"',
    'public."FieldCitation"',
    'public."LibraryAnalysisRecord"',
    'public."Report"',
    'public."SourceCitation"',
    'public."SourceDoc"',
    'public."Thesis"',
    'public."_prisma_migrations"'
  ] LOOP
    IF to_regclass(relation_name) IS NULL THEN
      RAISE EXCEPTION 'metadata v2 required relation is missing: %', relation_name;
    END IF;
  END LOOP;

  SELECT count(*) INTO identity_count
  FROM public."DatabaseIdentity"
  WHERE "key" = 'primary' AND "identityUuid" IS NOT NULL;
  IF identity_count <> 1 OR (SELECT count(*) FROM public."DatabaseIdentity") <> 1 THEN
    RAISE EXCEPTION 'metadata v2 requires exactly one primary DatabaseIdentity row';
  END IF;

  SELECT count(*) INTO completed_migration_count
  FROM public."_prisma_migrations"
  WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL;
  IF completed_migration_count = 0 THEN
    RAISE EXCEPTION 'metadata v2 requires a non-empty completed Prisma migration ledger';
  END IF;
END
$contract$;

WITH completed_migrations AS (
  SELECT
    id,
    checksum,
    to_char(finished_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "finishedAt",
    migration_name AS "migrationName",
    logs,
    NULL::text AS "rolledBackAt",
    to_char(started_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "startedAt",
    applied_steps_count AS "appliedStepsCount"
  FROM public."_prisma_migrations"
  WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
  ORDER BY migration_name, id
), snapshot AS (
  SELECT jsonb_build_object(
    'sourceDatabase', current_database(),
    'serverVersion', current_setting('server_version'),
    'databaseIdentityUuid', (
      SELECT "identityUuid"::text
      FROM public."DatabaseIdentity"
      WHERE "key" = 'primary'
    ),
    'migrationLedger', (
      SELECT jsonb_agg(to_jsonb(completed_migrations) ORDER BY "migrationName", id)
      FROM completed_migrations
    ),
    'coreCounts', jsonb_build_object(
      'ControlledMutationAudit', (SELECT count(*) FROM public."ControlledMutationAudit"),
      'DatabaseIdentity', (SELECT count(*) FROM public."DatabaseIdentity"),
      'Document', (SELECT count(*) FROM public."Document"),
      'EvidenceAppraisal', (SELECT count(*) FROM public."EvidenceAppraisal"),
      'FieldCitation', (SELECT count(*) FROM public."FieldCitation"),
      'LibraryAnalysisRecord', (SELECT count(*) FROM public."LibraryAnalysisRecord"),
      'Report', (SELECT count(*) FROM public."Report"),
      'SourceCitation', (SELECT count(*) FROM public."SourceCitation"),
      'SourceDoc', (SELECT count(*) FROM public."SourceDoc"),
      'Thesis', (SELECT count(*) FROM public."Thesis")
    )
  ) AS payload
)
SELECT payload::text FROM snapshot;
