# scripts/ audit — recon

Date: 2026-05-25
Scope: `scripts/` (166 filer eks. `__pycache__`/`lib`)

## Oversikt

- **88 referert** i package.json, CI, eller `src/` (53 %)
- **78 ureferert** (47 %) — kandidater for arkiv eller sletting

Filtypefordeling: 139 .ts, 9 .sql, 7 .py, 6 .sh, 5 .csv

## Ureferert: åpenbare arkiv-kandidater

### Versjonerte iterasjoner (eldre versjoner kan arkiveres)

- `apply-insight-links-v2.ts`, `apply-insight-links-v3.ts` (+ `apply-insight-doc-links.ts`)
- `curate-insight-links-v2.ts`, `curate-insight-links-v3.ts` (+ `curate-insight-doc-links.ts`)
- `suggest-insight-links-v2.sql`, `suggest-insight-links-v3.sql` (+ `suggest-insight-doc-links.sql`)

### Engangs-seeds (gjort sin jobb)

- `seed-food-redistribution-doc.{csv,sql}`
- `seed-insight-doc-refs-by-slug.{csv,sql}`
- `seed-insight-doc-refs-data.csv`
- `seed-okologisk-norden-data.csv`
- `seed-prod-data.sql`
- `seed-session-insights.{csv,sql}`

### Engangs-fixes/migrations

- `fix-document-country-uppercase.ts`
- `fix-document-fts-generated.ts`
- `fix-insight-report-thesis-fts.ts`
- `migrate-circularity-value-chain.py`
- `normalize-document-categories.sql`
- `cleanup-nordic-lane-b.ts`, `cleanup-nordic-report-links.ts`, `cleanup-old-orgnrs.ts`
- `run-prod-migrations.ts`
- `import-nnr2023-pdf.ts`
- `import-okologisk-norden-evidence.ts`

### Verifikasjons-/ad-hoc audits (sannsynligvis manuelt brukt)

`audit-company-extraction.ts`, `audit-food-tg-source-shortlist-status.ts`, `audit-media-landscape.ts`, `audit-person-raw-corpus.ts`, `audit-person-underlag.ts`, `audit-platform-linkage.ts`, `build-archive-index.ts`, `build-download-queue.ts`, `build-download-report.ts`, `build-orphan-review.ts`, `build-pdf-catalog.ts`, `build-person-high-priority-review.ts`, `print-visualization-drift-keys.ts`, m.fl.

### Eksterne workflows / antageligvis aktive utenfor npm

- `deploy.sh`, `coolify-sync-source-commit.sh` (Coolify-deploy)
- `extract-pdf-metadata.py`, `transcribe_missing_youtube_videos.py`, `fetch_youtube_channel_transcripts.py`
- `fetch-nordic-stores.sh`, `fetch-pubmed-wave1.sh`, `compute-nordic-metrics.sh`
- `offentligdata_brreg_mcp.py`

## Anbefaling

1. **Opprett `scripts/archive/`** og flytt dit:
   - Eldre versjoner (`*-v2.ts`, `*-doc-links.ts`-pendanter)
   - Alle engangs-seeds (`seed-*.{csv,sql}`)
   - Alle engangs-fixes/migrations (listen over)

   ~25 filer ut av aktiv katalog. Lett å reversere via git om noe trengs igjen.

2. **Behold som er:**
   - audit-/build-/fetch-skript som ikke åpenbart er engangs (manuelt brukt ved behov)
   - Coolify/deploy-skript
   - Python-skript for eksterne datakilder

3. **Verifiser før flytting:** søk i `docs/`, `.github/`, `Makefile`, og git-loggen for referanser.

## Ikke-anbefaling

Ikke slett ureferert kode globalt — flere `audit-*`-skript er sannsynligvis fortsatt nyttige som ad-hoc verktøy.
