# Document file-path backfill — status 2026-07-02

Status: controlled WS5 remediation slice

## What was done

Added `scripts/backfill-document-file-paths-from-seed-map.ts` and package command `db:backfill:document-file-paths`.

The script only updates `Document.filePath` when a linked Report/Thesis has one of these controlled evidence paths:

- high-confidence `research/seed-pdf-map.json` match;
- explicit curated local map for already-present markdown/PDF source notes;
- direct-PDF `research/download-queue.csv` target that exists on disk.

It skips non-high-confidence seed-map matches unless they are explicitly present in the curated local map, and it checks for `Document.filePath` uniqueness conflicts before updating.

## Applied result

This slice backfilled 56 unique linked `Document.filePath` rows across high-priority reports and theses.

Examples of controlled rows:

- `sedwall-2025` -> `research/evidence-pack/akademia/sedwall-2025.pdf`
- `se-konkurrensverket-2024-5` -> `research/evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf`
- `dk-salling-coop-decision-2025` -> `research/evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf`
- `kt-markedsundersokelser-2026` -> `research/bibliotek/konkurransetilsynet/markedsundersokelser-status.md`
- `asko-infrastruktur-2025` -> `research/bibliotek/bransje/logistikk/asko-infrastruktur-2025.md`
- `konkurrensverket-2025-5-livsmedelsutredning` -> `research/evidence-pack/nordisk/konkurrensverket-2025-5-livsmedelsutredning.pdf`

New direct-PDF downloads with valid `%PDF-` headers:

- `bojo-2023`
- `mirza-2016`
- `van-straten-2025`
- `bueso-bordils-2021`
- `lund-beijer-2026`
- `norden-policy-2024`
- `karlstad-declaration-2024`
- `nordic-food-alert-2025`
- `konkurrensverket-2025-5-livsmedelsutredning`
- `etmv-toimintakertomus-2024`
- `kfst-foedevarehandelslov-evaluering-2024`

One attempted direct-looking URL (`menon-emv-innovasjon`) returned HTML rather than a PDF and was not saved; the row was instead linked to the existing local source note.

Additional high-priority landing-page/article rows were closed with explicit local source-locator notes under `research/evidence-pack/source-notes/`. These notes are not full-text captures; they anchor the DB row to the canonical external URL and keep full-archive work separate.

## Regenerated backlog

After the final `compute-file-coverage` and `build-remediation-backlog` regeneration:

- `research/FILE-COVERAGE.csv`: 125 findings, including 95 `missing_file_document`.
- `research/REMEDIATION-BACKLOG.csv`: 275 findings total.
- Severity: 0 HIGH, 101 MEDIUM, 174 LOW.
- Remaining `missing_file_document` rows are MEDIUM/LOW, not HIGH.

## Stop condition

The remaining file-coverage rows are medium/low maintenance. Later passes should prioritize full-text downloads/archives for source-note rows and the 95 remaining `missing_file_document` rows, but there are no HIGH remediation findings after this slice.
