-- Seed manglende "Food Redistribution in the Nordic Region" PDF til prod.
-- Brukes av ins-food-tg-01 og ins-food-tg-05 som primary-kilder.
-- Idempotent via ON CONFLICT DO NOTHING + slug-unique.

CREATE TEMP TABLE _stage_food_redist (
  id text, slug text, "filePath" text, title text, author text,
  year integer, "documentType" text, category text, subcategory text,
  country text, content text, summary text, url text,
  "wordCount" integer, tags text[], metadata jsonb,
  "createdAt" timestamp(3), "updatedAt" timestamp(3)
);

\copy _stage_food_redist FROM 'scripts/seed-food-redistribution-doc.csv' WITH (FORMAT CSV, HEADER TRUE)

INSERT INTO "Document" (id, slug, "filePath", title, author, year, "documentType", category, subcategory, country, content, summary, url, "wordCount", tags, metadata, "createdAt", "updatedAt")
SELECT id, slug, "filePath", title, author, year, "documentType", category, subcategory, country, content, summary, url, "wordCount", tags, metadata, "createdAt", "updatedAt"
FROM _stage_food_redist
ON CONFLICT (slug) DO NOTHING;

-- Re-link de 2 refs som peker på denne slugen
INSERT INTO "InsightDocumentRef" (id, "insightId", "documentId", relevance)
SELECT
  -- generer ny cuid-like id (postgres-natively via gen_random_uuid)
  'food-redist-' || ROW_NUMBER() OVER (),
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

\echo === Verifiser ===
SELECT 'Document finnes' as t, count(*) FROM "Document"
WHERE slug = 'incoming-incoming-food-research-process-2026-04-20-04-food-waste-and-circularity-20d75deeda-food-redistribution-in-the-nordic-region-pdf'
UNION ALL
SELECT 'InsightDocumentRef totalt', count(*) FROM "InsightDocumentRef"
UNION ALL
SELECT 'Insights med >=1 doc-link', count(DISTINCT "insightId") FROM "InsightDocumentRef";
