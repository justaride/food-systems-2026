-- Seed InsightDocumentRef ved å joine slug + insightId mot prod
-- Krever at Document.slug og Insight.id eksisterer på prod (stabile IDer).
-- Idempotent via ON CONFLICT DO NOTHING.

\echo Step 1: Lag temp-tabell med slug-basert ref
CREATE TEMP TABLE _stage_refs_by_slug (
  id text, "insightId" text, document_slug text, relevance text
);

\copy _stage_refs_by_slug FROM 'scripts/seed-insight-doc-refs-by-slug.csv' WITH (FORMAT CSV, HEADER TRUE)

\echo Step 2: Insert med lookup på Document.slug
INSERT INTO "InsightDocumentRef" (id, "insightId", "documentId", relevance)
SELECT s.id, s."insightId", d.id, s.relevance
FROM _stage_refs_by_slug s
JOIN "Document" d ON d.slug = s.document_slug
JOIN "Insight" i ON i.id = s."insightId"
ON CONFLICT DO NOTHING;

\echo Step 3: Verifiser
SELECT 'InsightDocumentRef totalt' as t, count(*) FROM "InsightDocumentRef"
UNION ALL SELECT 'Insights med >=1 doc-link', count(DISTINCT "insightId") FROM "InsightDocumentRef"
UNION ALL SELECT 'Unique slugs joined på', count(*) FROM _stage_refs_by_slug s WHERE EXISTS(SELECT 1 FROM "Document" d WHERE d.slug = s.document_slug);
