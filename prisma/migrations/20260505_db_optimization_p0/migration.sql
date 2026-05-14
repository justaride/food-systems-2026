-- P0 ytelsesindekser fra database-audit 2026-05-05.
-- Tre grupper: (1) HNSW på Document.embedding for semantisk søk,
-- (2) pg_trgm GIN-indekser for ILIKE-søk i søkefelt, (3) Subsidy.subsidyType
-- for aggregasjonene i subsidies-agg.ts.
--
-- Forutsetter at extensions vector og pg_trgm er installert (deklarert i
-- schema.prisma). Hvis ikke, opprett dem først.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- (1) Vektorindeks for semantisk søk.
-- Uten denne gjør semanticSearch en full table scan + sort på hver spørring.
-- HNSW velges over IVFFlat for korpusstørrelser opp til ~1M rader.
-- Ops-klassen vector_cosine_ops matcher distanseoperatoren <=> i koden.
CREATE INDEX IF NOT EXISTS "Document_embedding_hnsw_idx"
  ON "Document"
  USING hnsw ("embedding" vector_cosine_ops);

-- (2) Trigram-indekser for ILIKE/contains-søk.
-- keywordSearch i src/lib/queries/search.ts kjører `contains: ..., mode: insensitive`
-- mot disse kolonnene. Uten gin_trgm_ops er hver spørring en sekvensiell skanning
-- med per-rad LOWER(). pg_trgm-extensionen er allerede aktiv, bare ubrukt.
CREATE INDEX IF NOT EXISTS "Document_title_trgm_idx"
  ON "Document" USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Document_content_trgm_idx"
  ON "Document" USING gin ("content" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Company_name_trgm_idx"
  ON "Company" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Actor_name_trgm_idx"
  ON "Actor" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Insight_title_trgm_idx"
  ON "Insight" USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Thesis_title_trgm_idx"
  ON "Thesis" USING gin ("title" gin_trgm_ops);

-- (3) Subsidy.subsidyType — alle aggregasjoner i subsidies-agg.ts filtrerer
-- på dette feltet før groupBy. Skjemaet hadde indekser for companyId, scheme
-- og year, men ikke subsidyType.
CREATE INDEX IF NOT EXISTS "Subsidy_subsidyType_idx"
  ON "Subsidy"("subsidyType");
