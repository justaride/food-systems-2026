-- Coverage-matrise: documents per land × Food TG-tema
-- Brukt for nordisk gap-analyse 2026-05-11.
-- Re-run etter hver import-batch for å spore progresjon.

\pset format aligned

WITH themes(theme, terms) AS (VALUES
  ('A: Sirkulært fôr',          ARRAY['fôr','feed','soya','insekt','havremelk','massebalanse','importavhengighet','fôrråvarer']),
  ('B: Sidestrømmer/matsvinn',  ARRAY['matsvinn','matavfall','sidestrøm','biogas','biogass','næringsstoff','svartvann','biorest']),
  ('C: Adopsjon/policy',        ARRAY['policy','regulering','innkjøp','offentlig','governance','konkurransetilsyn','utp']),
  ('D: Markedsmakt/dagligvare', ARRAY['dagligvare','retail','markedsmakt','konsentrasjon','konkurranse','NorgesGruppen','Coop','Salling','ICA','Axfood','Kesko']),
  ('E: Selvforsyning/beredskap',ARRAY['selvforsyning','beredskap','matsikkerhet','self-sufficiency','preparedness']),
  ('F: Sirkulær økonomi/R',     ARRAY['sirkulær','circular','regenerative','gjenbruk','resirkulering'])
),
expanded AS (
  SELECT
    t.theme,
    (SELECT string_agg(lower(regexp_replace(tok, '[^a-zA-ZæøåÆØÅ0-9]', '', 'g')), ' | ')
     FROM unnest(t.terms) tok WHERE char_length(tok) >= 3
    )::tsquery AS q
  FROM themes t
)
SELECT
  e.theme,
  count(*) FILTER (WHERE d.country='NO') AS NO,
  count(*) FILTER (WHERE d.country='SE') AS SE,
  count(*) FILTER (WHERE d.country='DK') AS DK,
  count(*) FILTER (WHERE d.country='FI') AS FI,
  count(*) FILTER (WHERE d.country='IS') AS IS_,
  count(*) FILTER (WHERE d.country='Nordic') AS Nordic
FROM expanded e
LEFT JOIN "Document" d ON d.search_vector @@ e.q AND d.country IN ('NO','SE','DK','FI','IS','Nordic')
GROUP BY e.theme
ORDER BY e.theme;
