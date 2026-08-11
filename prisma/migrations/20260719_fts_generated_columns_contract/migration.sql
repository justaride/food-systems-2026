-- Forward-only codification of the PostgreSQL FTS objects that historically
-- lived in scripts/add-postgres-fts.sql. Existing generated columns are left
-- untouched; the schema-drift gate verifies their expressions and fails if an
-- existing column is not GENERATED ALWAYS. Missing indexes are repaired.

BEGIN;

CREATE OR REPLACE FUNCTION public.immutable_to_tsvector_no(text)
RETURNS tsvector AS $$
  SELECT pg_catalog.to_tsvector('norwegian'::regconfig, COALESCE($1, ''));
$$ LANGUAGE SQL IMMUTABLE SECURITY INVOKER SET search_path = pg_catalog;

CREATE OR REPLACE FUNCTION public.immutable_array_to_string(text[])
RETURNS text AS $$
  SELECT COALESCE(pg_catalog.array_to_string($1, ' '), '');
$$ LANGUAGE SQL IMMUTABLE SECURITY INVOKER SET search_path = pg_catalog;

ALTER TABLE public."Document"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    pg_catalog.setweight(public.immutable_to_tsvector_no(title), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(summary), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(tags)), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(content), 'C')
  ) STORED;

ALTER TABLE public."Insight"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    pg_catalog.setweight(public.immutable_to_tsvector_no(title), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(description), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(tags)), 'B')
  ) STORED;

ALTER TABLE public."Report"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    pg_catalog.setweight(public.immutable_to_tsvector_no(title), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no("fullTitle"), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string("keyFindings")), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(recommendations)), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(relevance), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(tags)), 'B')
  ) STORED;

ALTER TABLE public."Thesis"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    pg_catalog.setweight(public.immutable_to_tsvector_no(title), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no("titleNo"), 'A') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(synthesis), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string("keyFindings")), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(takeaways)), 'B') ||
    pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(tags)), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "Document_search_vector_idx" ON public."Document" USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS "Insight_search_vector_idx" ON public."Insight" USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS "Report_search_vector_idx" ON public."Report" USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS "Thesis_search_vector_idx" ON public."Thesis" USING GIN (search_vector);

COMMIT;
