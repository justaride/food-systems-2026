# scripts/archive/

Engangs-scripts som har gjort jobben sin og ikke trenger å være i aktiv `scripts/`. Beholdt i git for historikk og reverserbarhet.

## Innhold

- **Versjonerte iterasjoner** (eldre versjoner erstattet av v3 eller annen aktiv versjon)
  - `apply-insight-links-v2.ts`, `apply-insight-doc-links.ts`
  - `curate-insight-links-v2.ts`, `curate-insight-doc-links.ts`
  - `suggest-insight-links-v2.sql`, `suggest-insight-doc-links.sql`

- **Engangs-seeds** (importert til DB, ikke kjørt på nytt)
  - `seed-food-redistribution-doc.{csv,sql}`
  - `seed-insight-doc-refs-by-slug.{csv,sql}`, `seed-insight-doc-refs-data.csv`
  - `seed-okologisk-norden-data.csv`
  - `seed-prod-data.sql`
  - `seed-session-insights.{csv,sql}`

- **Engangs-fixes / migrations** (utført, ikke skal kjøres igjen)
  - `fix-document-country-uppercase.ts`
  - `fix-document-fts-generated.ts`
  - `fix-insight-report-thesis-fts.ts`
  - `migrate-circularity-value-chain.py`
  - `normalize-document-categories.sql`
  - `cleanup-nordic-lane-b.ts`, `cleanup-nordic-report-links.ts`, `cleanup-old-orgnrs.ts`
  - `run-prod-migrations.ts`
  - `import-nnr2023-pdf.ts`
  - `import-okologisk-norden-evidence.ts`

Hvis du trenger å gjenoppta noe: `git mv scripts/archive/<file> scripts/<file>` eller bare kjør direkte fra arkivet.
