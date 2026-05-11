-- Foreslå Insight→Document koblinger via Postgres FTS
-- Dato: 2026-05-11
-- Bruk: psql -d foodsystems -f scripts/suggest-insight-doc-links.sql > research/_status/insight-doc-link-candidates-2026-05-11.csv
--
-- Output (CSV): insight_id, insight_title, doc_id, doc_title, rank, confidence, decision
-- Brukeren fyller inn 'decision' (y/n) og kjører apply-insight-doc-links.sql etterpå.
--
-- Algorithme:
--   1. Filtrer Insights uten InsightDocumentRef
--   2. Bygg tsquery fra title+tags med OR-tokens (4+ tegn, filtrer stopwords/tall)
--   3. Match mot Document.search_vector, ranger med ts_rank_cd
--   4. Topp-5 kandidater per insight, klassifiser confidence: high (>15), medium (>8), low
--
-- Stille bekreft: ingen DB-endringer, kun lesing.
-- Bruk psql --csv flagget for ren CSV output.

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
       FROM unnest(
         regexp_split_to_array(
           u.title || ' ' || coalesce(array_to_string(u.tags, ' '), ''),
           '\s+|[,.;:()\[\]{}!?''"]'
         )
       ) AS token
       WHERE char_length(regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g')) >= 4
         AND regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g') ~ '^[a-zA-ZæøåÆØÅ]'
         AND lower(regexp_replace(token, '[^a-zA-ZæøåÆØÅ0-9-]', '', 'g')) NOT IN (
           'over','under','etter','mellom','blant','rundt','dette','disse','dette',
           'denne','være','vare','vart','varte','ikke','også','ogsa','andre','noen',
           'hver','alle','disse','vore','flere','siden','mange','dette','dette'
         )
     ) tokens
     WHERE t !~ '^[0-9]+$'
    ) AS q_or
  FROM unlinked u
),
candidates AS (
  SELECT
    q.id AS insight_id,
    q.title AS insight_title,
    d.id AS doc_id,
    d.title AS doc_title,
    ts_rank_cd('{0.1, 0.3, 0.6, 1.0}'::float4[], d.search_vector, q.q_or) AS rank,
    row_number() OVER (PARTITION BY q.id ORDER BY ts_rank_cd('{0.1, 0.3, 0.6, 1.0}'::float4[], d.search_vector, q.q_or) DESC) AS rn
  FROM queries q
  JOIN "Document" d ON q.q_or IS NOT NULL AND d.search_vector @@ q.q_or
)
SELECT
  insight_id,
  '"' || replace(insight_title, '"', '""') || '"' AS insight_title,
  doc_id,
  '"' || replace(doc_title, '"', '""') || '"' AS doc_title,
  round(rank::numeric, 3) AS rank,
  CASE WHEN rank > 15 THEN 'high'
       WHEN rank > 8 THEN 'medium'
       ELSE 'low' END AS confidence,
  '' AS decision
FROM candidates
WHERE rn <= 5
ORDER BY insight_id, rn;
