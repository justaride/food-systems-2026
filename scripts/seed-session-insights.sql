-- Seed de 5 ins-food-tg-XX insights som ble lagt til lokalt i sesjon 2026-05-11
-- men aldri ble seedet til prod. Trengs for at InsightDocumentRef-koblinger
-- til disse skal fungere.
-- Idempotent via ON CONFLICT (id) DO NOTHING.

CREATE TEMP TABLE _stage_insights (
  id text, title text, description text, "insightType" text, source text,
  "phaseId" text, tags text[], url text, date text
);

\copy _stage_insights FROM 'scripts/seed-session-insights.csv' WITH (FORMAT CSV, HEADER TRUE)

INSERT INTO "Insight" (id, title, description, "insightType", source, "phaseId", tags, url, date)
SELECT id, title, description, "insightType", source, "phaseId", tags, url, date
FROM _stage_insights
ON CONFLICT (id) DO NOTHING;

\echo === Verifiser ins-food-tg-XX finnes ===
SELECT id, LEFT(title, 60) FROM "Insight" WHERE id LIKE 'ins-food-tg-%' ORDER BY id;

\echo === Nå kjør seed-food-redistribution-doc.sql REFs-delen igjen ===
-- Refs som tidligere ikke kunne inserte fordi insights manglet
INSERT INTO "InsightDocumentRef" (id, "insightId", "documentId", relevance)
SELECT
  'food-redist-tg-' || ROW_NUMBER() OVER (),
  s."insightId",
  d.id,
  s.relevance
FROM (VALUES
  ('ins-food-tg-01', 'primary'),
  ('ins-food-tg-05', 'primary')
) AS s("insightId", relevance)
JOIN "Document" d ON d.slug = 'incoming-incoming-food-research-process-2026-04-20-04-food-waste-and-circularity-20d75deeda-food-redistribution-in-the-nordic-region-pdf'
WHERE EXISTS (SELECT 1 FROM "Insight" i WHERE i.id = s."insightId")
ON CONFLICT ("insightId", "documentId") DO NOTHING;

\echo === Re-kjør slug-baserte refs nå når ins-food-tg-* er på plass ===
CREATE TEMP TABLE _stage_refs_slug (
  id text, "insightId" text, document_slug text, relevance text
);

\copy _stage_refs_slug FROM 'scripts/seed-insight-doc-refs-by-slug.csv' WITH (FORMAT CSV, HEADER TRUE)

INSERT INTO "InsightDocumentRef" (id, "insightId", "documentId", relevance)
SELECT s.id, s."insightId", d.id, s.relevance
FROM _stage_refs_slug s
JOIN "Document" d ON d.slug = s.document_slug
JOIN "Insight" i ON i.id = s."insightId"
ON CONFLICT ("insightId", "documentId") DO NOTHING;

\echo === Final-verifisering ===
SELECT 'Insight totalt' as t, count(*) FROM "Insight"
UNION ALL
SELECT 'Insights med ≥1 doc-link', count(DISTINCT "insightId") FROM "InsightDocumentRef"
UNION ALL
SELECT 'InsightDocumentRef totalt', count(*) FROM "InsightDocumentRef";
