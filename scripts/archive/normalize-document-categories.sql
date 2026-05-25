-- Normaliser country og documentType i Document-tabellen
-- Idempotent: kan kjøres flere ganger uten effekt etter første gang.
-- Dato: 2026-05-11
-- Bakgrunn: data-readiness-audit avdekket inkonsistens
--   country: lowercase ISO + 'nordic'/'Nordic' + 'global'
--   documentType: 'annual-report'/'annual_report', 'policy_report' med underscore

BEGIN;

-- Country: lowercase ISO -> uppercase
UPDATE "Document" SET country = 'NO'     WHERE country = 'no';
UPDATE "Document" SET country = 'SE'     WHERE country = 'se';
UPDATE "Document" SET country = 'DK'     WHERE country = 'dk';
UPDATE "Document" SET country = 'FI'     WHERE country = 'fi';
UPDATE "Document" SET country = 'IS'     WHERE country = 'is';
UPDATE "Document" SET country = 'EU'     WHERE country = 'eu';
UPDATE "Document" SET country = 'US'     WHERE country = 'us';

-- Regional/global -> canonical casing (matcher Actor.country der 'Nordic' allerede brukes)
UPDATE "Document" SET country = 'Nordic' WHERE country = 'nordic';
UPDATE "Document" SET country = 'Global' WHERE country = 'global';

-- documentType: kollaps underscore-varianter til kebab-case (majoritets-konvensjon)
UPDATE "Document" SET "documentType" = 'annual-report' WHERE "documentType" = 'annual_report';
UPDATE "Document" SET "documentType" = 'policy-report' WHERE "documentType" = 'policy_report';

COMMIT;
