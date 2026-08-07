-- Follow-up only: close the Document quarantine concurrency gap left by the
-- v2 FieldCitation target trigger without rewriting an applied migration.
--
-- FOR KEY SHARE does not conflict with a non-key UPDATE's FOR NO KEY UPDATE
-- row lock. A citation insert and a Document quarantine transition could
-- therefore both validate the old state and commit. FOR SHARE conflicts with
-- that UPDATE lock while still allowing concurrent readers/citation inserts.
BEGIN;

LOCK TABLE
  "FieldCitation", "Document"
IN SHARE ROW EXCLUSIVE MODE;

-- If the v2 race has already produced an invalid pair, fail closed instead of
-- installing the stronger lock over history that already violates the rule.
DO $document_quarantine_preflight$
DECLARE
  offending_field_citation TEXT;
BEGIN
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
      'FieldCitation integrity v3 preflight: row % targets a quarantined synthetic Document',
      offending_field_citation;
  END IF;
END
$document_quarantine_preflight$;

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

  -- Preserve the v2 compatibility boundary: values outside these four
  -- canonical polymorphic target types retain their historical behavior.
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
    FOR SHARE;

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

COMMIT;
