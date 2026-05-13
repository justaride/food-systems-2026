-- Seed prod-DB med okologisk-norden Documents og InsightDocumentRef
-- fra sesjonen 2026-05-11. Idempotent — ON CONFLICT DO NOTHING.
-- Kjøres av post_deployment_command etter FTS-skjema og country-norm.
--
-- search_vector ekskludert fra CSVer (auto-generert av Postgres).

\echo Step 1: Lag temp-tabell for Documents
CREATE TEMP TABLE _stage_documents (
  id text, slug text, "filePath" text, title text, author text,
  year integer, "documentType" text, category text, subcategory text,
  country text, content text, summary text, url text,
  "wordCount" integer, tags text[], metadata jsonb,
  "createdAt" timestamp(3), "updatedAt" timestamp(3)
);

\copy _stage_documents FROM 'scripts/seed-okologisk-norden-data.csv' WITH (FORMAT CSV, HEADER TRUE)

\echo Step 2: Insert nye Documents (skip eksisterende slug)
INSERT INTO "Document" (id, slug, "filePath", title, author, year, "documentType", category, subcategory, country, content, summary, url, "wordCount", tags, metadata, "createdAt", "updatedAt")
SELECT id, slug, "filePath", title, author, year, "documentType", category, subcategory, country, content, summary, url, "wordCount", tags, metadata, "createdAt", "updatedAt"
FROM _stage_documents
ON CONFLICT (slug) DO NOTHING;

\echo Step 3: Lag temp-tabell for InsightDocumentRef
CREATE TEMP TABLE _stage_refs (
  id text, "insightId" text, "documentId" text, relevance text
);

\copy _stage_refs FROM 'scripts/seed-insight-doc-refs-data.csv' WITH (FORMAT CSV, HEADER TRUE)

\echo Step 4: Insert nye refs (skip eksisterende insight+doc-par)
INSERT INTO "InsightDocumentRef" (id, "insightId", "documentId", relevance)
SELECT s.id, s."insightId", s."documentId", s.relevance
FROM _stage_refs s
WHERE EXISTS (SELECT 1 FROM "Document" d WHERE d.id = s."documentId")
  AND EXISTS (SELECT 1 FROM "Insight" i WHERE i.id = s."insightId")
ON CONFLICT ("insightId", "documentId") DO NOTHING;

\echo Step 5: Verifiser
SELECT 'okologisk-norden Documents' as t, count(*) FROM "Document" WHERE metadata::text LIKE '%okologisk-norden-2026-05-11%'
UNION ALL SELECT 'InsightDocumentRef totalt', count(*) FROM "InsightDocumentRef";
