# File coverage — research/ vs DB/seed

> Auto-generert av `scripts/compute-file-coverage.ts` — ikke rediger manuelt.
> Generert: 2026-06-14T23:12:34.324Z
> Totalt funn: **512**

## Totals per problem

| Problem | Count |
|---|---:|
| orphan_file | 369 |
| missing_file_document | 141 |
| missing_file_sourcedoc | 0 |
| broken_supportingsource | 1 |
| report_no_analytical_link | 0 |
| duplicate_file_separate_records | 1 |

## Distribution: severity x problem

| Severity | orphan_file | missing_file_document | missing_file_sourcedoc | broken_supportingsource | report_no_analytical_link | duplicate_file_separate_records |
|---|---:|---:|---:|---:|---:|---:|
| HIGH | 0 | 65 | 0 | 0 | 0 | 0 |
| MEDIUM | 30 | 75 | 0 | 0 | 0 | 0 |
| LOW | 339 | 1 | 0 | 1 | 0 | 1 |

## Top 30 highest-severity findings

| # | Severity | Problem | Entity | Ref | Priority | Action |
|---:|---|---|---|---|---:|---|
| 1 | HIGH | missing_file_document | Document | cmppajyqr0001njvm7la1op31 (sedwall-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 2 | HIGH | missing_file_document | Document | cmppajyqy0002njvmeo5z64yk (bojo-2023) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 3 | HIGH | missing_file_document | Document | cmppajyr30003njvmka3xvjsc (nmbu-circular-vegetables-2022) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 4 | HIGH | missing_file_document | Document | cmppajyr60004njvmkuyujbnd (van-straten-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 5 | HIGH | missing_file_document | Document | cmppajyrc0005njvm3ccaxbrf (segersven-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 6 | HIGH | missing_file_document | Document | cmppajyri0006njvm31b5p6at (rey-verge-2005) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 7 | HIGH | missing_file_document | Document | cmppajyrn0007njvmd1h15xme (slu-house-crickets-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 8 | HIGH | missing_file_document | Document | cmppajyrr0008njvm72f0l3n2 (bueso-bordils-2021) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 9 | HIGH | missing_file_document | Document | cmppajyru0009njvmavxrd7cp (desilva-2023) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 10 | HIGH | missing_file_document | Document | cmppajyrz000anjvm40x9zv8t (lund-beijer-2026) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 11 | HIGH | missing_file_document | Document | cmppajyso000cnjvm1vx5gvhu (matsystemutvalget-2026) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 12 | HIGH | missing_file_document | Document | cmppajysv000dnjvm5uvvmk08 (akademia-uib-kjopermakt) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 13 | HIGH | missing_file_document | Document | cmppajyt3000fnjvmjakt14qv (se-konkurrensverket-2024-5) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 14 | HIGH | missing_file_document | Document | cmppajyt8000gnjvmz8r1gkuy (asko-infrastruktur-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 15 | HIGH | missing_file_document | Document | cmppajytd000hnjvmn60kb31b (kt-markedsundersokelser-2026) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 16 | HIGH | missing_file_document | Document | cmppajytf000injvm3k3rqsu6 (is-markedsstruktur-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 17 | HIGH | missing_file_document | Document | cmppajytj000jnjvmapvnokb7 (juridisk-eudr-norge-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 18 | HIGH | missing_file_document | Document | cmppajytn000knjvm9q2oil3y (nbs-systemkritikk) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 19 | HIGH | missing_file_document | Document | cmppajyu9000pnjvmnf9p1ypx (akademia-sifo-retail-media-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 20 | HIGH | missing_file_document | Document | cmppajyuc000qnjvmm7gsitu3 (juridisk-eiendomsmakt-lokal-konku | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 21 | HIGH | missing_file_document | Document | cmppajyue000rnjvmxrad483t (etmv-toimintakertomus-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 22 | HIGH | missing_file_document | Document | cmppajyuh000snjvmgcmt6umd (coop-danmark-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 23 | HIGH | missing_file_document | Document | cmppajyv1000ynjvmqjymvcbk (menon-emv-innovasjon) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 24 | HIGH | missing_file_document | Document | cmppajyvb0012njvmnphhze07 (karlstad-declaration-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 25 | HIGH | missing_file_document | Document | cmppajyve0013njvmw7zok4yr (nordic-food-alert-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 26 | HIGH | missing_file_document | Document | cmppajyvi0014njvmjm0t5x4g (dagligvaretilsynet-aarsrapport-20 | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 27 | HIGH | missing_file_document | Document | cmppajyvs0017njvm2oigezqq (pubmed-szulecka-2024) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 28 | HIGH | missing_file_document | Document | cmppajyvy0018njvmtrhi7iw8 (pubmed-sigala-2025) | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 29 | HIGH | missing_file_document | Document | cmppajywc001cnjvmql7lo7er (norgesgruppen-halvarsrapport-h1-2 | 5.0 | Restore file at "null" or update Document.filePath to actual location |
| 30 | HIGH | missing_file_document | Document | cmppajywg001dnjvmesg58paz (akademia-nhh-matbors-historie) | 5.0 | Restore file at "null" or update Document.filePath to actual location |

## Orphan-file directories

| Top-level dir | Orphan count |
|---|---:|
| arkiv-sortert | 267 |
| external | 36 |
| evidence-pack | 24 |
| pdf-downloads-20-04-26 | 22 |
| visualisering | 14 |
| bibliotek | 6 |

## Severity rules

- **HIGH**: missing file or broken reference where the entity has KI-PRIORITY ≥ 4.0
- **MEDIUM**: same but priority 3.0–3.5, or orphans in primary directories (`evidence-pack/`, `bibliotek/`)
- **LOW**: orphans in archive/raw directories (`arkiv-sortert/`, `pdf-downloads-20-04-26/`, perpl-snapshots) or duplicate-files-as-separate-records

## Scope notes

- Scanned **1320** files (.pdf, .md) under `research/`, excluding `_plans/`, `_status/`, `intake/`, and the meta/index docs at the root.
- Cross-referenced 1205 `Document`, 198 `SourceDoc`, and 129 seed Reports (plus their supportingSources).
- `SourceDoc` locator coverage accepts URL, DOI, linked `Document`, or a resolvable local file. `SourceDoc.filename` is often a bare filename (no path); the script uses a basename index over `research/` as the local-file fallback.
- A `Document` missing-file finding is HIGH severity if the linked seed Report/Thesis has KI-PRIORITY ≥ 4.0; otherwise MEDIUM. Documents without any seed link (e.g. raw imports) default to MEDIUM.
- Duplicate detection groups by SHA256 from `pdf-katalog.json` and only flags groups with ≥2 distinct `Document` records.
