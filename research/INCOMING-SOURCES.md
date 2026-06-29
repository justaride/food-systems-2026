# Incoming Sources Manifest

Single source of truth for pending ingestion work.
Updated: 2026-06-19

## Pending source families

| # | Path | Description | Files | Size | Status | Target step | Notes |
|---|------|-------------|-------|------|--------|-------------|-------|
| 1 | `research/landbrukarena_transcripts/` | YouTube transcripts from LandBruk Arena channel (12 .txt, 13 .json, manifest.csv, manifest.json, ALL_TRANSCRIPTS.md) | 28 | 368 KB | **ingested** | step 10 | 17 transcripts imported (12 YouTube captions + 5 local ASR). Import script: `scripts/import-transcripts.ts`. 2 videos still missing (index 14: empty ASR, index 15: download error). |
| 2 | `scripts/fetch_youtube_channel_transcripts.py` | Python CLI tool that produced the transcripts above (yt-dlp + youtube-transcript-api) | 1 | 6 KB | **ingested** | step 10 | Tooling used for transcript fetch. Retained for future channel updates. |
| 3 | `scripts/transcribe_missing_youtube_videos.py` | Whisper-based local ASR for videos missing YouTube captions (faster-whisper + yt-dlp) | 1 | 5 KB | **ingested** | step 10 | Used to fill 5 transcripts where YouTube captions were disabled. Retained for future use. |
| 4 | `research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf` | Wageningen Food & Biobased Research report 2247 on circular applications of agri-residues, DOI 10.18174/563389 | 1 | 1.8 MB | **ingested** | B-sidestream / C-adoption | Moved from repo root and registered as `src-170` in `src/lib/data/sources.ts` on 2026-05-17. |
| 5 | KFST Salling-Coop afgørelse 2025-03-26 (kfst.dk/media/edgjum43/...) | Konkurrenceradet decision godkjenner Salling Groups erhvervelse av 33 Coop Danmark-butikker | 1 | url-only | **registered** | DK adopsjon / Spor C | Registrert som `src-171` i `src/lib/data/sources.ts` 2026-05-18 for å tette DK adopsjon-gap (0 docs i nordic-coverage-gap-analysis-2026-05-11.md). PDF-nedlasting + Document-import gjenstår. |
| 6 | KFST OK-Coop afgørelse 2024-06-26 (kfst.dk/afgoerelser-ruling/...) | Konkurrenceradet intervention i OKs erhvervelse av Coop Danmark (foranledning for src-171) | 1 | url-only | **registered** | DK adopsjon / Spor C | Registrert som `src-172` 2026-05-18. URL-only inntil PDF hentes ned. |
| 7 | Luke Food Balance Sheet 2024 (statdb.luke.fi/.../Ravintotase) | Finlands offisielle matbalansestatistikk: produksjon, forbruk, lager, import/eksport, per-capita | 1 | data-portal | **registered** | FI selvforsyning / Spor A | Registrert som `src-173` 2026-05-18 for å tette FI selvforsyning-gap (0 docs). Datasett, ikke PDF — krever egen ingest-pipeline. |
| 8 | NESA Food and Water 2030 programme (huoltovarmuuskeskus.fi/en/a/...) | Strategi 2024-2030 for finsk matberedskap; Finland som nordisk leder på matsikkerhet | 1 | url-only | **registered** | FI selvforsyning + Spor C | Registrert som `src-174` 2026-05-18. Sentralt for nordisk beredskapssammenligning. |
| 9 | SLU Karimi et al. (2019) filamentous fungi on vinasse (pub.epsilon.slu.se/16481/...) | SE forskningsartikkel om mikrobiell proteinprod fra biproduct, FoU-spor for sirkulær fôr | 1 | 0.6 MB | **registered** | SE sirkulært fôr / Spor A | Registrert som `src-175` 2026-05-18 for å tette SE sirkulært fôr-gap (0 docs). Del av SLUs "Framtidens foder bygger på kretslopp"-prosjekt. PDF tilgjengelig på pub.epsilon. |
| 10 | Jordbruksverket Livsmedelsstrategi Rapport 2024:3 (www2.jordbruksverket.se/download/...) | SE årsrapport på livsmedelsstrategin med 6 kap. + 12 vedlegg, dekker fôr/biomasse | 1 | PDF | **registered** | SE adopsjon / Spor C | Registrert som `src-176` 2026-05-18. Norsk nordisk komparativ for policy-spor. |
| 11 | `research/evidence-pack/nordisk/future-nordic-diets-tn2017-566.pdf` | Nordic Council of Ministers TemaNord 2017:566 — to scenarioer (SY/EY) for nordisk matsystem basert på organisk drift; kjøttreduksjon 81–90 %; GHG-kutt fra ~1600 til 310–700 kg CO₂-ekv/person/år | 1 | 1.7 MB | **ready** | Spor A (selvforsyning/beredskap) + nordisk komparativ | Registrert som `src-182` i `prisma/seed-data/sources.ts`. Rapport i `reports.ts` (`future-nordic-diets-tn2017-566`). PDF i evidence-pack. Import-script klart: `npx tsx scripts/import-future-nordic-diets-pdf.ts --apply`. |

## Disposition key

- **parked** -- Acknowledged but not yet scheduled for ingestion. Do not import into the database.
- **ready** -- Cleared for ingestion in the current pipeline step.
- **registered** -- Listed in `src/lib/data/sources.ts` with src-ID; PDF/document-content not yet ingested to Document table.
- **ingested** -- Successfully imported; row kept for audit trail.

## Rules

1. Every untracked research artifact or fetch script must have a row here before it is committed.
2. Nothing moves to "ready" without an explicit decision tied to a pipeline step.
3. After ingestion, update the status to "ingested" and record the commit hash.
