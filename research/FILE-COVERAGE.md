# File coverage — research/ vs DB/seed

> Auto-generert av `scripts/compute-file-coverage.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T15:59:11.463Z
> Totalt funn: **270**

## Totals per problem

| Problem | Count |
|---|---:|
| orphan_file | 150 |
| missing_file_document | 0 |
| missing_file_sourcedoc | 118 |
| broken_supportingsource | 1 |
| report_no_analytical_link | 0 |
| duplicate_file_separate_records | 1 |

## Distribution: severity x problem

| Severity | orphan_file | missing_file_document | missing_file_sourcedoc | broken_supportingsource | report_no_analytical_link | duplicate_file_separate_records |
|---|---:|---:|---:|---:|---:|---:|
| HIGH | 0 | 0 | 0 | 0 | 0 | 0 |
| MEDIUM | 0 | 0 | 118 | 0 | 0 | 0 |
| LOW | 150 | 0 | 0 | 1 | 0 | 1 |

## Top 30 highest-severity findings

| # | Severity | Problem | Entity | Ref | Priority | Action |
|---:|---|---|---|---|---:|---|
| 1 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-2 |  | Restore file at "1. Food system_ Oslo Innovasjons program 2025.md" or update Sou |
| 2 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-food-417f05987af9 |  | Restore file at "Endelig er matsvinnloven her! _ Framtiden i våre hender.pdf" or |
| 3 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-1 |  | Restore file at "Just now (12.Revise-Gab) Nordic Circular Food systems - V.2.md" |
| 4 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-food-7ff714786c3d |  | Restore file at "fréttatilkynning-hagar-4f-2024-25-ensk.pdf" or update SourceDoc |
| 5 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-118 |  | Restore file at "SEC-MAT-TEK-02-biotech-proteiner.md" or update SourceDoc.filena |
| 6 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-food-523403f1176d |  | Restore file at "Response of food waste anaerobic digestion to the dimensions of |
| 7 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-9 |  | Restore file at "Natural State Mail - NCH application 2025.pdf" or update Source |
| 8 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-10 |  | Restore file at "Natural State Mail - DROFTING TG.pdf" or update SourceDoc.filen |
| 9 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-86 |  | Restore file at "nhh-food-steen-2024.md" or update SourceDoc.filename to actual  |
| 10 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-91 |  | Restore file at "matsvinnutvalget-2024.md" or update SourceDoc.filename to actua |
| 11 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-92 |  | Restore file at "nmr-vision-2030.md" or update SourceDoc.filename to actual loca |
| 12 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-94 |  | Restore file at "greenpeace-feeding-monster-2021.md" or update SourceDoc.filenam |
| 13 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-cvT_rOtTDBo |  | Restore file at "13-landbruk-arena-forklarer-hva-er-kronetoll-og-hva-er-prosentt |
| 14 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-UPYj1SNHYdw |  | Restore file at "04-nina-ranøien-om-kurstilbud-for-landbrukets-tillitsvalgte-UPY |
| 15 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-USSkCfpjGbM |  | Restore file at "16-USSkCfpjGbM-local-asr-small.txt" or update SourceDoc.filenam |
| 16 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-SgltfUW8Ymg |  | Restore file at "08-norsk-landbruk-tilde-SgltfUW8Ymg.txt" or update SourceDoc.fi |
| 17 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-8JZSIH4WC5A |  | Restore file at "05-per-inge-egeland-om-kurstilbud-for-landbrukets-tillitsvalgte |
| 18 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-aPzdVR0eaI4 |  | Restore file at "06-sigrid-heringstad-om-kurstilbud-for-landbrukets-tillitsvalgt |
| 19 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-blx_7Jwq0Nc |  | Restore file at "07-loopfilm-norges-bondelag-blx_7Jwq0Nc.txt" or update SourceDo |
| 20 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-fc50NCdLhL4 |  | Restore file at "09-norsk-landbruk-nina-rangøien-fc50NCdLhL4.txt" or update Sour |
| 21 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-nvb9MJdwIzA |  | Restore file at "17-nvb9MJdwIzA-local-asr-small.txt" or update SourceDoc.filenam |
| 22 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-hALbwiwHdOM |  | Restore file at "10-norsk-landbruk-nina-kort-hALbwiwHdOM.txt" or update SourceDo |
| 23 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-XcV4bZe0J_I |  | Restore file at "11-film-alle-fire-m-plakater-kursdeltagere-XcV4bZe0J_I.txt" or  |
| 24 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-6kP1Kfmzm9w |  | Restore file at "12-6kP1Kfmzm9w-local-asr-small.txt" or update SourceDoc.filenam |
| 25 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-BOQZvBG_LBw |  | Restore file at "01-kari-toft-fullversjon-bred-BOQZvBG_LBw.txt" or update Source |
| 26 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-W2VaX150Uw8 |  | Restore file at "02-seminar-om-avrenningstiltak-i-jordbruket-i-regi-av-agrianaly |
| 27 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-n1qF1TRh2d0 |  | Restore file at "03-erling-aas-eng-om-tillitsverv-i-landbruket-n1qF1TRh2d0.txt"  |
| 28 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt--TkOU0IeVq0 |  | Restore file at "18--TkOU0IeVq0-local-asr-small.txt" or update SourceDoc.filenam |
| 29 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-yt-EMeYsB6Vk2Y |  | Restore file at "19-EMeYsB6Vk2Y-local-asr-small.txt" or update SourceDoc.filenam |
| 30 | MEDIUM | missing_file_sourcedoc | SourceDoc | src-73 |  | Restore file at "van-zanten-nature-food-2023.md" or update SourceDoc.filename to |

## Orphan-file directories

| Top-level dir | Orphan count |
|---|---:|
| arkiv-sortert | 98 |
| pdf-downloads-20-04-26 | 22 |
| visualisering | 14 |
| ocr-output | 4 |
| DATA-READINESS-SLUTTRAPPORT.md | 1 |
| HTML-EXTRACTION-LOG.md | 1 |
| HTML-TRIAGE.md | 1 |
| KI-ACCEPTANCE-TESTS.md | 1 |
| OCR-LOG.md | 1 |
| PDF-QUALITY.md | 1 |
| REMEDIATION-BACKLOG.md | 1 |
| URL-HEALTH.md | 1 |
| URL-INVENTORY.md | 1 |
| cathrine-ten-step-oppsummering.md | 1 |
| external | 1 |
| statusrapport-mars-2026.md | 1 |

## Severity rules

- **HIGH**: missing file or broken reference where the entity has KI-PRIORITY ≥ 4.0
- **MEDIUM**: same but priority 3.0–3.5, or orphans in primary directories (`evidence-pack/`, `bibliotek/`)
- **LOW**: orphans in archive/raw directories (`arkiv-sortert/`, `pdf-downloads-20-04-26/`, perpl-snapshots) or duplicate-files-as-separate-records

## Scope notes

- Scanned **1129** files (.pdf, .md) under `research/`, excluding `_plans/`, `_status/`, `intake/`, and the meta/index docs at the root.
- Cross-referenced 1163 `Document`, 307 `SourceDoc`, and 108 seed Reports (plus their supportingSources).
- `SourceDoc.filename` is often a bare filename (no path); the script uses a basename index over `research/` to resolve them, so a SourceDoc is only flagged when no file with that basename exists anywhere under `research/`.
- A `Document` missing-file finding is HIGH severity if the linked seed Report/Thesis has KI-PRIORITY ≥ 4.0; otherwise MEDIUM. Documents without any seed link (e.g. raw imports) default to MEDIUM.
- Duplicate detection groups by SHA256 from `pdf-katalog.json` and only flags groups with ≥2 distinct `Document` records.
