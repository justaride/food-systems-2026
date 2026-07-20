-- Follow-up only: harden the polymorphic FieldCitation target contract without
-- rewriting the already-applied controlled-mutation base migration.
BEGIN;

LOCK TABLE
  "FieldCitation", "Thesis", "Document", "SourceDoc", "Report"
IN SHARE ROW EXCLUSIVE MODE;

-- Fail closed on historical case/whitespace aliases. They must be reviewed and
-- repaired explicitly; this migration never silently rewrites citation identity.
DO $field_citation_v2_preflight$
DECLARE
  offending_field_citation TEXT;
BEGIN
  SELECT classified."id"
  INTO offending_field_citation
  FROM (
    SELECT
      "id",
      "entityType",
      CASE LOWER(REGEXP_REPLACE("entityType", '^[[:space:]]+|[[:space:]]+$', '', 'g'))
        WHEN 'thesis' THEN 'Thesis'
        WHEN 'document' THEN 'Document'
        WHEN 'sourcedoc' THEN 'SourceDoc'
        WHEN 'report' THEN 'Report'
        ELSE NULL
      END AS canonical_type
    FROM "FieldCitation"
  ) classified
  WHERE classified.canonical_type IS NOT NULL
    AND classified."entityType" IS DISTINCT FROM classified.canonical_type
  ORDER BY classified."id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'FieldCitation integrity v2 preflight: row % uses a non-canonical case/whitespace target type',
      offending_field_citation;
  END IF;

  offending_field_citation := NULL;
  SELECT "id"
  INTO offending_field_citation
  FROM "FieldCitation"
  WHERE "entityType" IN ('Thesis', 'Document', 'SourceDoc', 'Report')
    AND (
      "entityId" IS DISTINCT FROM BTRIM("entityId")
      OR "entityId" ~ '[[:cntrl:]]'
      OR "entityId" = ''
    )
  ORDER BY "id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'FieldCitation integrity v2 preflight: row % uses a non-canonical target id',
      offending_field_citation;
  END IF;

  offending_field_citation := NULL;
  SELECT "id"
  INTO offending_field_citation
  FROM "FieldCitation"
  WHERE "entityType" = 'Thesis'
    AND "entityId" = 'matsvinnloven-2025'
  ORDER BY "id"
  LIMIT 1;

  IF offending_field_citation IS NOT NULL THEN
    RAISE EXCEPTION
      'FieldCitation integrity v2 preflight: row % targets forbidden Thesis:matsvinnloven-2025',
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
      'FieldCitation integrity v2 preflight: row % targets a quarantined synthetic Document',
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
      'FieldCitation integrity v2 preflight: row % has a missing canonical target',
      offending_field_citation;
  END IF;
END
$field_citation_v2_preflight$;

DROP TRIGGER IF EXISTS "FieldCitation_target_integrity" ON "FieldCitation";

CREATE OR REPLACE FUNCTION public.enforce_field_citation_target_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $field_citation_target$
DECLARE
  canonical_type TEXT;
  target_document_type TEXT;
  target_document_metadata JSONB;
BEGIN
  canonical_type := CASE LOWER(REGEXP_REPLACE(NEW."entityType", '^[[:space:]]+|[[:space:]]+$', '', 'g'))
    WHEN 'thesis' THEN 'Thesis'
    WHEN 'document' THEN 'Document'
    WHEN 'sourcedoc' THEN 'SourceDoc'
    WHEN 'report' THEN 'Report'
    ELSE NULL
  END;

  -- Explicit compatibility boundary: values outside these four canonical
  -- polymorphic target types retain their historical behavior unchanged.
  IF canonical_type IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW."entityType" IS DISTINCT FROM canonical_type THEN
    RAISE EXCEPTION
      'FieldCitation entityType must use canonical value %, not %',
      canonical_type,
      NEW."entityType";
  END IF;
  IF NEW."entityId" IS DISTINCT FROM BTRIM(NEW."entityId")
    OR NEW."entityId" ~ '[[:cntrl:]]'
    OR NEW."entityId" = ''
  THEN
    RAISE EXCEPTION 'FieldCitation canonical target entityId must be trimmed non-control text';
  END IF;

  IF canonical_type = 'Thesis' THEN
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
  ELSIF canonical_type = 'Document' THEN
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
  ELSIF canonical_type = 'SourceDoc' THEN
    PERFORM 1
    FROM public."SourceDoc"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target SourceDoc:% does not exist', NEW."entityId";
    END IF;
  ELSIF canonical_type = 'Report' THEN
    PERFORM 1
    FROM public."Report"
    WHERE "id" = NEW."entityId"
    FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FieldCitation target Report:% does not exist', NEW."entityId";
    END IF;
  END IF;

  RETURN NEW;
END
$field_citation_target$;

REVOKE ALL ON FUNCTION public.enforce_field_citation_target_integrity() FROM PUBLIC;

CREATE TRIGGER "FieldCitation_target_integrity"
BEFORE INSERT OR UPDATE OF "entityType", "entityId" ON "FieldCitation"
FOR EACH ROW EXECUTE FUNCTION public.enforce_field_citation_target_integrity();

CREATE FUNCTION public.prevent_field_citation_target_orphan()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $reverse_target$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW."id" IS NOT DISTINCT FROM OLD."id" THEN
    RETURN NEW;
  END IF;

  PERFORM 1
  FROM public."FieldCitation"
  WHERE "entityType" = TG_TABLE_NAME
    AND "entityId" = OLD."id"
  FOR KEY SHARE;
  IF FOUND THEN
    RAISE EXCEPTION
      '%:% cannot be % while canonical FieldCitation rows reference it',
      TG_TABLE_NAME,
      OLD."id",
      TG_OP;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END
$reverse_target$;

CREATE FUNCTION public.prevent_field_citation_target_truncate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $reverse_truncate$
BEGIN
  PERFORM 1
  FROM public."FieldCitation"
  WHERE "entityType" = TG_TABLE_NAME;
  IF FOUND THEN
    RAISE EXCEPTION
      '% cannot be truncated while canonical FieldCitation rows reference it',
      TG_TABLE_NAME;
  END IF;
  RETURN NULL;
END
$reverse_truncate$;

CREATE FUNCTION public.prevent_cited_document_quarantine()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $document_quarantine$
BEGIN
  IF NEW."documentType" = 'quarantined_synthetic'
    OR NEW."metadata" #>> '{identityQuarantine,status}' = 'blocked_synthetic_identity'
  THEN
    PERFORM 1
    FROM public."FieldCitation"
    WHERE "entityType" = 'Document'
      AND "entityId" = OLD."id"
    FOR KEY SHARE;
    IF FOUND THEN
      RAISE EXCEPTION
        'Document:% cannot enter identity quarantine while canonical FieldCitation rows reference it',
        OLD."id";
    END IF;
  END IF;
  RETURN NEW;
END
$document_quarantine$;

REVOKE ALL ON FUNCTION public.prevent_field_citation_target_orphan() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_field_citation_target_truncate() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_cited_document_quarantine() FROM PUBLIC;

CREATE TRIGGER "Thesis_prevent_field_citation_orphan"
BEFORE DELETE OR UPDATE OF "id" ON "Thesis"
FOR EACH ROW EXECUTE FUNCTION public.prevent_field_citation_target_orphan();
CREATE TRIGGER "Document_prevent_field_citation_orphan"
BEFORE DELETE OR UPDATE OF "id" ON "Document"
FOR EACH ROW EXECUTE FUNCTION public.prevent_field_citation_target_orphan();
CREATE TRIGGER "SourceDoc_prevent_field_citation_orphan"
BEFORE DELETE OR UPDATE OF "id" ON "SourceDoc"
FOR EACH ROW EXECUTE FUNCTION public.prevent_field_citation_target_orphan();
CREATE TRIGGER "Report_prevent_field_citation_orphan"
BEFORE DELETE OR UPDATE OF "id" ON "Report"
FOR EACH ROW EXECUTE FUNCTION public.prevent_field_citation_target_orphan();

CREATE TRIGGER "Document_prevent_cited_identity_quarantine"
BEFORE UPDATE OF "documentType", "metadata" ON "Document"
FOR EACH ROW EXECUTE FUNCTION public.prevent_cited_document_quarantine();

CREATE TRIGGER "Thesis_prevent_field_citation_orphan_truncate"
BEFORE TRUNCATE ON "Thesis"
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_field_citation_target_truncate();
CREATE TRIGGER "Document_prevent_field_citation_orphan_truncate"
BEFORE TRUNCATE ON "Document"
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_field_citation_target_truncate();
CREATE TRIGGER "SourceDoc_prevent_field_citation_orphan_truncate"
BEFORE TRUNCATE ON "SourceDoc"
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_field_citation_target_truncate();
CREATE TRIGGER "Report_prevent_field_citation_orphan_truncate"
BEFORE TRUNCATE ON "Report"
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_field_citation_target_truncate();

COMMIT;
