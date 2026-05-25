-- Utvidet insight-link-suggester: kombinerer kandidater fra Document, Report
-- og Thesis. Reports/Theses linker til Document via documentId — vi bruker
-- den underliggende Document.id som target i InsightDocumentRef.
--
-- Dato: 2026-05-11 v2
-- Bruk: psql -d foodsystems --csv -f scripts/suggest-insight-links-v2.sql \
--         > research/_status/insight-link-candidates-v2-2026-05-11.csv

WITH unlinked AS (
  SELECT id, title, description, tags
  FROM "Insight"
  WHERE NOT EXISTS(SELECT 1 FROM "InsightDocumentRef" r WHERE r."insightId" = "Insight".id)
),
queries AS (
  SELECT
    u.id, u.title,
    (SELECT string_agg(t, ' | ')::tsquery
     FROM (
       SELECT DISTINCT lower(regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g')) AS t
       FROM unnest(regexp_split_to_array(u.title || ' ' || coalesce(array_to_string(u.tags, ' '), ''), '\s+|[,.;:()\[\]{}!?''"]')) AS token
       WHERE char_length(regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g')) >= 4
         AND regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g') ~ '^[a-zA-ZæøåÆØÅ]'
         AND lower(regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g')) NOT IN
           ('over','under','etter','mellom','blant','rundt','dette','disse','denne','være','vare','vart','ikke','også','ogsa','andre','noen','hver','alle','flere','siden','mange')
     ) tokens
     WHERE t !~ '^[0-9]+$'
    ) AS q_or
  FROM unlinked u
),
doc_cands AS (
  SELECT q.id AS insight_id, q.title AS insight_title,
         d.id AS doc_id, d.title AS doc_title, 'Document' AS source,
         ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], d.search_vector, q.q_or) AS rank,
         row_number() OVER (PARTITION BY q.id ORDER BY ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], d.search_vector, q.q_or) DESC) AS rn
  FROM queries q
  JOIN "Document" d ON q.q_or IS NOT NULL AND d.search_vector @@ q.q_or
),
report_cands AS (
  -- Reports må ha documentId for å være linkbare
  SELECT q.id AS insight_id, q.title AS insight_title,
         r."documentId" AS doc_id,
         r.title AS doc_title,
         'Report' AS source,
         -- Rescaler Report-rank til Document-skala: × 10 (approx empirisk)
         ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], r.search_vector, q.q_or) * 10 AS rank,
         row_number() OVER (PARTITION BY q.id ORDER BY ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], r.search_vector, q.q_or) DESC) AS rn
  FROM queries q
  JOIN "Report" r ON q.q_or IS NOT NULL AND r.search_vector @@ q.q_or AND r."documentId" IS NOT NULL
),
thesis_cands AS (
  SELECT q.id AS insight_id, q.title AS insight_title,
         t."documentId" AS doc_id,
         t.title AS doc_title,
         'Thesis' AS source,
         ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], t.search_vector, q.q_or) * 10 AS rank,
         row_number() OVER (PARTITION BY q.id ORDER BY ts_rank_cd('{0.1,0.3,0.6,1.0}'::float4[], t.search_vector, q.q_or) DESC) AS rn
  FROM queries q
  JOIN "Thesis" t ON q.q_or IS NOT NULL AND t.search_vector @@ q.q_or AND t."documentId" IS NOT NULL
)
SELECT * FROM (
  SELECT insight_id, insight_title, doc_id, doc_title, source, rank,
         CASE WHEN rank > 15 THEN 'high' WHEN rank > 8 THEN 'medium' ELSE 'low' END AS confidence,
         '' AS decision
  FROM doc_cands WHERE rn <= 5
  UNION ALL
  SELECT insight_id, insight_title, doc_id, doc_title, source, rank,
         CASE WHEN rank > 15 THEN 'high' WHEN rank > 8 THEN 'medium' ELSE 'low' END AS confidence,
         '' AS decision
  FROM report_cands WHERE rn <= 3
  UNION ALL
  SELECT insight_id, insight_title, doc_id, doc_title, source, rank,
         CASE WHEN rank > 15 THEN 'high' WHEN rank > 8 THEN 'medium' ELSE 'low' END AS confidence,
         '' AS decision
  FROM thesis_cands WHERE rn <= 3
) all_cands
ORDER BY insight_id, rank DESC;
