-- Durable release controls for reviewed, destructive identity migrations.
--
-- This migration does not perform an identity mutation. It establishes one
-- immutable database lineage, an append-only mutation audit, and a global
-- semantic-target guard for new or retargeted FieldCitation rows.
BEGIN;

-- Close the preflight-to-trigger race. These locks block concurrent writers
-- for the short duration of this transactional migration.
LOCK TABLE
  "FieldCitation", "Thesis", "Document", "SourceDoc", "Report"
IN SHARE ROW EXCLUSIVE MODE;

-- Existing rows must already satisfy the invariant. Never install a trigger
-- over known-bad history and then present the database as protected.
DO $preflight$
DECLARE
  offending_field_citation TEXT;
BEGIN
  SELECT "id"
  INTO offending_field_citation
  FROM "FieldCitation"
  WHERE "entityType" = 'Thesis'
    AND "entityId" = 'matsvinnloven-2025'
  ORDER BY "id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'release-control preflight: FieldCitation % targets forbidden Thesis:matsvinnloven-2025',
      offending_field_citation;
  END IF;

  offending_field_citation := NULL;
  SELECT field_citation."id"
  INTO offending_field_citation
  FROM "FieldCitation" field_citation
  JOIN "Document" document ON document."id" = field_citation."entityId"
  WHERE field_citation."entityType" = 'Document'
    AND (
      document."documentType" = 'quarantined_synthetic'
      OR document."metadata" #>> '{identityQuarantine,status}' = 'blocked_synthetic_identity'
    )
  ORDER BY field_citation."id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'release-control preflight: FieldCitation % targets a quarantined synthetic Document',
      offending_field_citation;
  END IF;

  offending_field_citation := NULL;
  SELECT field_citation."id"
  INTO offending_field_citation
  FROM "FieldCitation" field_citation
  WHERE
    (
      field_citation."entityType" = 'Thesis'
      AND NOT EXISTS (
        SELECT 1 FROM "Thesis" thesis WHERE thesis."id" = field_citation."entityId"
      )
    )
    OR (
      field_citation."entityType" = 'Document'
      AND NOT EXISTS (
        SELECT 1 FROM "Document" document WHERE document."id" = field_citation."entityId"
      )
    )
    OR (
      field_citation."entityType" = 'SourceDoc'
      AND NOT EXISTS (
        SELECT 1 FROM "SourceDoc" source_doc WHERE source_doc."id" = field_citation."entityId"
      )
    )
    OR (
      field_citation."entityType" = 'Report'
      AND NOT EXISTS (
        SELECT 1 FROM "Report" report WHERE report."id" = field_citation."entityId"
      )
    )
  ORDER BY field_citation."id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'release-control preflight: FieldCitation % has a missing Thesis/Document/SourceDoc/Report target',
      offending_field_citation;
  END IF;
END
$preflight$;

CREATE TABLE "DatabaseIdentity" (
  "key" TEXT NOT NULL,
  "identityUuid" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DatabaseIdentity_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "DatabaseIdentity_primary_key_check" CHECK ("key" = 'primary')
);

CREATE UNIQUE INDEX "DatabaseIdentity_identityUuid_key"
  ON "DatabaseIdentity"("identityUuid");

-- The UUID is generated once, inside the migration transaction, and is then
-- protected from update, delete, and truncate by the triggers below.
INSERT INTO "DatabaseIdentity" ("key", "identityUuid")
VALUES ('primary', gen_random_uuid());

CREATE TABLE "ControlledMutationAudit" (
  "id" TEXT NOT NULL,
  "operationKey" TEXT NOT NULL,
  "contractScope" TEXT NOT NULL,
  "contractSha256" TEXT NOT NULL,
  "planSha256" TEXT NOT NULL,
  "beforeSnapshotSha256" TEXT NOT NULL,
  "afterSnapshotSha256" TEXT NOT NULL,
  "databaseIdentityUuid" UUID NOT NULL,
  "targetFingerprintSha256" TEXT NOT NULL,
  "backupSha256" TEXT NOT NULL,
  "backupMetadataSha256" TEXT NOT NULL,
  "restoreReceiptSha256" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "authorizationRef" TEXT NOT NULL,
  "databaseRole" TEXT NOT NULL,
  "mutationSummary" JSONB NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ControlledMutationAudit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ControlledMutationAudit_sha256_check" CHECK (
    "contractSha256" ~ '^[0-9a-f]{64}$'
    AND "planSha256" ~ '^[0-9a-f]{64}$'
    AND "beforeSnapshotSha256" ~ '^[0-9a-f]{64}$'
    AND "afterSnapshotSha256" ~ '^[0-9a-f]{64}$'
    AND "targetFingerprintSha256" ~ '^[0-9a-f]{64}$'
    AND "backupSha256" ~ '^[0-9a-f]{64}$'
    AND "backupMetadataSha256" ~ '^[0-9a-f]{64}$'
    AND "restoreReceiptSha256" ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT "ControlledMutationAudit_operator_authorization_check" CHECK (
    NULLIF(BTRIM("operatorId"), '') IS NOT NULL
    AND NULLIF(BTRIM("authorizationRef"), '') IS NOT NULL
  ),
  CONSTRAINT "ControlledMutationAudit_databaseIdentityUuid_fkey"
    FOREIGN KEY ("databaseIdentityUuid")
    REFERENCES "DatabaseIdentity"("identityUuid")
    ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE UNIQUE INDEX "ControlledMutationAudit_operationKey_key"
  ON "ControlledMutationAudit"("operationKey");
CREATE INDEX "ControlledMutationAudit_contractScope_idx"
  ON "ControlledMutationAudit"("contractScope");
CREATE INDEX "ControlledMutationAudit_recordedAt_idx"
  ON "ControlledMutationAudit"("recordedAt");

-- Do not expose either control table through PUBLIC. No runtime or MCP role is
-- granted access here; any future visibility or INSERT privilege must be an
-- explicit, separately reviewed role change.
REVOKE ALL PRIVILEGES ON TABLE "DatabaseIdentity" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE "ControlledMutationAudit" FROM PUBLIC;

DO $mcp_acl$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'foodsystems_mcp_ro') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public."DatabaseIdentity" FROM foodsystems_mcp_ro';
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public."ControlledMutationAudit" FROM foodsystems_mcp_ro';
  END IF;
END
$mcp_acl$;

CREATE FUNCTION public.reject_controlled_mutation_history_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  RAISE EXCEPTION '% is immutable: % is not permitted', TG_TABLE_NAME, TG_OP;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_controlled_mutation_history_change() FROM PUBLIC;

CREATE TRIGGER "DatabaseIdentity_reject_update_delete"
BEFORE UPDATE OR DELETE ON "DatabaseIdentity"
FOR EACH ROW EXECUTE FUNCTION public.reject_controlled_mutation_history_change();

CREATE TRIGGER "DatabaseIdentity_reject_truncate"
BEFORE TRUNCATE ON "DatabaseIdentity"
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_controlled_mutation_history_change();

CREATE TRIGGER "ControlledMutationAudit_reject_update_delete"
BEFORE UPDATE OR DELETE ON "ControlledMutationAudit"
FOR EACH ROW EXECUTE FUNCTION public.reject_controlled_mutation_history_change();

CREATE TRIGGER "ControlledMutationAudit_reject_truncate"
BEFORE TRUNCATE ON "ControlledMutationAudit"
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_controlled_mutation_history_change();

CREATE FUNCTION public.enforce_field_citation_target_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
DECLARE
  target_document_type TEXT;
  target_document_metadata JSONB;
BEGIN
  IF NEW."entityType" = 'Thesis' THEN
    IF NEW."entityId" = 'matsvinnloven-2025' THEN
      RAISE EXCEPTION 'FieldCitation cannot target forbidden Thesis:matsvinnloven-2025';
    END IF;

    PERFORM 1
    FROM public."Thesis"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target Thesis:% does not exist', NEW."entityId";
    END IF;
  ELSIF NEW."entityType" = 'Document' THEN
    SELECT "documentType", "metadata"
    INTO target_document_type, target_document_metadata
    FROM public."Document"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target Document:% does not exist', NEW."entityId";
    END IF;

    IF target_document_type = 'quarantined_synthetic'
      OR target_document_metadata #>> '{identityQuarantine,status}' = 'blocked_synthetic_identity'
    THEN
      RAISE EXCEPTION 'FieldCitation cannot target quarantined synthetic Document:%', NEW."entityId";
    END IF;
  ELSIF NEW."entityType" = 'SourceDoc' THEN
    PERFORM 1
    FROM public."SourceDoc"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target SourceDoc:% does not exist', NEW."entityId";
    END IF;
  ELSIF NEW."entityType" = 'Report' THEN
    PERFORM 1
    FROM public."Report"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target Report:% does not exist', NEW."entityId";
    END IF;
  END IF;

  -- Other historical entityType values remain intentionally compatible.
  RETURN NEW;
END
$function$;

REVOKE ALL ON FUNCTION public.enforce_field_citation_target_integrity() FROM PUBLIC;

CREATE TRIGGER "FieldCitation_target_integrity"
BEFORE INSERT OR UPDATE OF "entityType", "entityId" ON "FieldCitation"
FOR EACH ROW EXECUTE FUNCTION public.enforce_field_citation_target_integrity();

COMMIT;
