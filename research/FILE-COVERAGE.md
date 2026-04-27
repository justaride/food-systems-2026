# File coverage — research/ vs DB/seed

> Auto-generert av `scripts/compute-file-coverage.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T12:11:59.910Z
> Totalt funn: **334**

## Totals per problem

| Problem | Count |
|---|---:|
| orphan_file | 145 |
| missing_file_document | 69 |
| missing_file_sourcedoc | 118 |
| broken_supportingsource | 1 |
| report_no_analytical_link | 0 |
| duplicate_file_separate_records | 1 |

## Distribution: severity x problem

| Severity | orphan_file | missing_file_document | missing_file_sourcedoc | broken_supportingsource | report_no_analytical_link | duplicate_file_separate_records |
|---|---:|---:|---:|---:|---:|---:|
| HIGH | 0 | 0 | 0 | 0 | 0 | 0 |
| MEDIUM | 3 | 69 | 118 | 0 | 0 | 0 |
| LOW | 142 | 0 | 0 | 1 | 0 | 1 |

## Top 30 highest-severity findings

| # | Severity | Problem | Entity | Ref | Priority | Action |
|---:|---|---|---|---|---:|---|
| 1 | MEDIUM | orphan_file | file | evidence-pack/beredskap/beredskap-island-food-stockpiles-202 |  | Link to a Document/SourceDoc or Report.supportingSources, or move to archive |
| 2 | MEDIUM | orphan_file | file | evidence-pack/beredskap/beredskap-island-melmolle-2025.md |  | Link to a Document/SourceDoc or Report.supportingSources, or move to archive |
| 3 | MEDIUM | orphan_file | file | evidence-pack/bransje/dlf-leverandor-2025.md |  | Link to a Document/SourceDoc or Report.supportingSources, or move to archive |
| 4 | MEDIUM | missing_file_document | Document | cmoh15ie70006to0d1jejouzr |  | Restore file at "generated/meetings/meeting-2.md" or update Document.filePath to |
| 5 | MEDIUM | missing_file_document | Document | cmoh15iel000dto0ddjjgvr4k |  | Restore file at "generated/meetings/meeting-4.md" or update Document.filePath to |
| 6 | MEDIUM | missing_file_document | Document | cmoh15iev000hto0dr2wc0qlq |  | Restore file at "generated/meetings/meeting-6.md" or update Document.filePath to |
| 7 | MEDIUM | missing_file_document | Document | cmoh15if0000jto0dyaxlo77l |  | Restore file at "generated/meetings/meeting-7.md" or update Document.filePath to |
| 8 | MEDIUM | missing_file_document | Document | cmoh15iee000ato0dez3u62ym |  | Restore file at "generated/meetings/meeting-3.md" or update Document.filePath to |
| 9 | MEDIUM | missing_file_document | Document | cmoh15if5000lto0d0pk2rliu |  | Restore file at "generated/meetings/meeting-8.md" or update Document.filePath to |
| 10 | MEDIUM | missing_file_document | Document | cmoh2g8860038n60d04z5mrbn |  | Restore file at "incoming/food-research-process-2026-04-20/07-academic-research- |
| 11 | MEDIUM | missing_file_document | Document | cmoh0jpub0001vw0dbumriqjz |  | Restore file at "external/meeting-4-research-focus.md" or update Document.filePa |
| 12 | MEDIUM | missing_file_document | Document | cmoh0jpug0002vw0d7f3qipql |  | Restore file at "external/nmr-vision-2030.md" or update Document.filePath to act |
| 13 | MEDIUM | missing_file_document | Document | cmoh0jpuk0003vw0dp0j4x509 |  | Restore file at "external/greenpeace-feeding-monster-2021.md" or update Document |
| 14 | MEDIUM | missing_file_document | Document | cmoh0jpte0000vw0dusb874iw |  | Restore file at "external/nordic-house-mote.md" or update Document.filePath to a |
| 15 | MEDIUM | missing_file_document | Document | cmoh0jpuv0004vw0di9yc9yfo |  | Restore file at "external/nhh-food-steen-2024.md" or update Document.filePath to |
| 16 | MEDIUM | missing_file_document | Document | cmoh0jpv50005vw0d1s3y31jb |  | Restore file at "external/van-zanten-nature-food-2023.md" or update Document.fil |
| 17 | MEDIUM | missing_file_document | Document | cmoh0jpva0006vw0djj92bb5t |  | Restore file at "external/coffee-forest-eudr-research.md" or update Document.fil |
| 18 | MEDIUM | missing_file_document | Document | cmoh0jpw70007vw0dobq4dve9 |  | Restore file at "external/ni-soknad-ncc-fase-2.md" or update Document.filePath t |
| 19 | MEDIUM | missing_file_document | Document | cmoh0jq2e000ovw0dr56o59bd |  | Restore file at "external/prop-33-l-2019-2020.pdf" or update Document.filePath t |
| 20 | MEDIUM | missing_file_document | Document | cmoh0jq31000pvw0du1cdkgt1 |  | Restore file at "external/lokalmatrapport-2025.pdf" or update Document.filePath  |
| 21 | MEDIUM | missing_file_document | Document | cmoh0jq34000qvw0dyaqsz7rn |  | Restore file at "external/motiva-responsible-food-procurement-2026.pdf" or updat |
| 22 | MEDIUM | missing_file_document | Document | cmoh0jq3a000rvw0ddhlu9f03 |  | Restore file at "external/oecd-flw-2025.md" or update Document.filePath to actua |
| 23 | MEDIUM | missing_file_document | Document | cmoh0jq3g000svw0dr363p3qt |  | Restore file at "external/feedback-blue-empire-2024.md" or update Document.fileP |
| 24 | MEDIUM | missing_file_document | Document | cmoh15idw0002to0dfcqwh31h |  | Restore file at "generated/meetings/meeting-1.md" or update Document.filePath to |
| 25 | MEDIUM | missing_file_document | Document | cmoh15ier000fto0d9ub71df2 |  | Restore file at "generated/meetings/meeting-5.md" or update Document.filePath to |
| 26 | MEDIUM | missing_file_document | Document | cmoh0jq3j000tvw0dxfigthdk |  | Restore file at "external/arla-farmahead-2024.pdf" or update Document.filePath t |
| 27 | MEDIUM | missing_file_document | Document | cmoh0jq3o000uvw0durhs03b1 |  | Restore file at "external/forskningsrunde-2026-04-20-backlog.csv" or update Docu |
| 28 | MEDIUM | missing_file_document | Document | cmoh0jq3t000vvw0djc9hzr6d |  | Restore file at "external/Strategisk ledergruppe Marked 16 mars 2026.md" or upda |
| 29 | MEDIUM | missing_file_document | Document | cmoh0jq4i000wvw0ds1ekyivj |  | Restore file at "external/statistics-finland-hbs-2012.md" or update Document.fil |
| 30 | MEDIUM | missing_file_document | Document | cmoh0jq4n000xvw0d70wc56n6 |  | Restore file at "external/ecr-dagligvarukartan-2024.md" or update Document.fileP |

## Orphan-file directories

| Top-level dir | Orphan count |
|---|---:|
| arkiv-sortert | 98 |
| pdf-downloads-20-04-26 | 22 |
| visualisering | 14 |
| evidence-pack | 3 |
| HTML-EXTRACTION-LOG.md | 1 |
| HTML-TRIAGE.md | 1 |
| PDF-QUALITY.md | 1 |
| REMEDIATION-BACKLOG.md | 1 |
| URL-INVENTORY.md | 1 |
| cathrine-ten-step-oppsummering.md | 1 |
| external | 1 |
| statusrapport-mars-2026.md | 1 |

## Severity rules

- **HIGH**: missing file or broken reference where the entity has KI-PRIORITY ≥ 4.0
- **MEDIUM**: same but priority 3.0–3.5, or orphans in primary directories (`evidence-pack/`, `bibliotek/`)
- **LOW**: orphans in archive/raw directories (`arkiv-sortert/`, `pdf-downloads-20-04-26/`, perpl-snapshots) or duplicate-files-as-separate-records

## Scope notes

- Scanned **1121** files (.pdf, .md) under `research/`, excluding `_plans/`, `_status/`, `intake/`, and the meta/index docs at the root.
- Cross-referenced 1163 `Document`, 307 `SourceDoc`, and 108 seed Reports (plus their supportingSources).
- `SourceDoc.filename` is often a bare filename (no path); the script uses a basename index over `research/` to resolve them, so a SourceDoc is only flagged when no file with that basename exists anywhere under `research/`.
- A `Document` missing-file finding is HIGH severity if the linked seed Report/Thesis has KI-PRIORITY ≥ 4.0; otherwise MEDIUM. Documents without any seed link (e.g. raw imports) default to MEDIUM.
- Duplicate detection groups by SHA256 from `pdf-katalog.json` and only flags groups with ≥2 distinct `Document` records.
