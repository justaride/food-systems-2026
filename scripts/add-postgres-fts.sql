-- Postgres FTS: tsvector-genererte kolonner + GIN-indekser
-- Dato: 2026-05-11
-- Bakgrunn: pivot fra OpenAI embeddings (krever API vi ikke har) til
-- Postgres native FTS. Bedre relevansranking enn ILIKE, ingen ekstern
-- avhengighet. Dekker Document, Insight, Report, Thesis.
--
-- IMMUTABLE-wrappers er nødvendig fordi Postgres' to_tsvector() og
-- array_to_string() er STABLE, ikke IMMUTABLE — og GENERATED-kolonner
-- krever IMMUTABLE. Wrappers er trygt så lenge config (= 'norwegian')
-- ikke endres.

BEGIN;

CREATE OR REPLACE FUNCTION immutable_to_tsvector_no(text)
RETURNS tsvector AS $$
  SELECT to_tsvector('norwegian'::regconfig, COALESCE($1, ''));
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION immutable_array_to_string(text[])
RETURNS text AS $$
  SELECT COALESCE(array_to_string($1, ' '), '');
$$ LANGUAGE SQL IMMUTABLE;

-- Document
ALTER TABLE "Document"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(immutable_to_tsvector_no(title), 'A') ||
    setweight(immutable_to_tsvector_no(summary), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B') ||
    setweight(immutable_to_tsvector_no(content), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS "Document_search_vector_idx" ON "Document" USING GIN (search_vector);

-- Insight
ALTER TABLE "Insight"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(immutable_to_tsvector_no(title), 'A') ||
    setweight(immutable_to_tsvector_no(description), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS "Insight_search_vector_idx" ON "Insight" USING GIN (search_vector);

-- Report
ALTER TABLE "Report"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(immutable_to_tsvector_no(title), 'A') ||
    setweight(immutable_to_tsvector_no("fullTitle"), 'A') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(recommendations)), 'B') ||
    setweight(immutable_to_tsvector_no(relevance), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS "Report_search_vector_idx" ON "Report" USING GIN (search_vector);

-- Thesis
ALTER TABLE "Thesis"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(immutable_to_tsvector_no(title), 'A') ||
    setweight(immutable_to_tsvector_no("titleNo"), 'A') ||
    setweight(immutable_to_tsvector_no(synthesis), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(takeaways)), 'B') ||
    setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS "Thesis_search_vector_idx" ON "Thesis" USING GIN (search_vector);

COMMIT;
