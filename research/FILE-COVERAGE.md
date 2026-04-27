# File coverage — research/ vs DB/seed

> Auto-generert av `scripts/compute-file-coverage.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T11:46:41.775Z
> Totalt funn: **578**

## Totals per problem

| Problem | Count |
|---|---:|
| orphan_file | 199 |
| missing_file_document | 259 |
| missing_file_sourcedoc | 118 |
| broken_supportingsource | 1 |
| report_no_analytical_link | 0 |
| duplicate_file_separate_records | 1 |

## Distribution: severity x problem

| Severity | orphan_file | missing_file_document | missing_file_sourcedoc | broken_supportingsource | report_no_analytical_link | duplicate_file_separate_records |
|---|---:|---:|---:|---:|---:|---:|
| HIGH | 0 | 1 | 0 | 0 | 0 | 0 |
| MEDIUM | 0 | 258 | 118 | 0 | 0 | 0 |
| LOW | 199 | 0 | 0 | 1 | 0 | 1 |

## Top 30 highest-severity findings

| # | Severity | Problem | Entity | Ref | Priority | Action |
|---:|---|---|---|---|---:|---|
| 1 | HIGH | missing_file_document | Document | cmoh2g6yo0012n60dqi8nh1te (matsvinnutvalget-2024) | 5.0 | Restore file at "incoming/food-research-process-2026-04-20/04-food-waste-and-cir |
| 2 | MEDIUM | missing_file_document | Document | cmoh15ie70006to0d1jejouzr |  | Restore file at "generated/meetings/meeting-2.md" or update Document.filePath to |
| 3 | MEDIUM | missing_file_document | Document | cmoh15iel000dto0ddjjgvr4k |  | Restore file at "generated/meetings/meeting-4.md" or update Document.filePath to |
| 4 | MEDIUM | missing_file_document | Document | cmoh15iev000hto0dr2wc0qlq |  | Restore file at "generated/meetings/meeting-6.md" or update Document.filePath to |
| 5 | MEDIUM | missing_file_document | Document | cmoh15if0000jto0dyaxlo77l |  | Restore file at "generated/meetings/meeting-7.md" or update Document.filePath to |
| 6 | MEDIUM | missing_file_document | Document | cmoh15iee000ato0dez3u62ym |  | Restore file at "generated/meetings/meeting-3.md" or update Document.filePath to |
| 7 | MEDIUM | missing_file_document | Document | cmoh15if5000lto0d0pk2rliu |  | Restore file at "generated/meetings/meeting-8.md" or update Document.filePath to |
| 8 | MEDIUM | missing_file_document | Document | cmoh2g6f10000n60d269y28y9 (report-food-227bb60d773e) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 9 | MEDIUM | missing_file_document | Document | cmoh2g6g30001n60dhuhguh87 (report-food-e3f33c5a4766) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 10 | MEDIUM | missing_file_document | Document | cmoh2g6gk0002n60drn30t1uq (report-food-283dd0683b0d) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 11 | MEDIUM | missing_file_document | Document | cmoh2g6h40003n60dqhyqrk6u (report-food-e268bd87c1c4) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 12 | MEDIUM | missing_file_document | Document | cmoh2g6hv0004n60duhghy9p9 (report-food-cc2689719568) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 13 | MEDIUM | missing_file_document | Document | cmoh2g6ig0005n60d8xqmk6nz (report-food-069b10c9ac66) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 14 | MEDIUM | missing_file_document | Document | cmoh2g6ix0006n60dqtsdx75u (report-food-11ed41bcaca1) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 15 | MEDIUM | missing_file_document | Document | cmoh2g6je0007n60dcn4ycklk (report-food-7aaa0d71e1e7) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 16 | MEDIUM | missing_file_document | Document | cmoh2g6ju0008n60d7cd7gos6 (report-food-8749cc79f983) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 17 | MEDIUM | missing_file_document | Document | cmoh2g6kg0009n60dew0kb9ks |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 18 | MEDIUM | missing_file_document | Document | cmoh2g6kw000an60dwl5nabbt |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 19 | MEDIUM | missing_file_document | Document | cmoh2g6lc000bn60dmnnbqar9 (report-food-fe0a3ed77f48) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 20 | MEDIUM | missing_file_document | Document | cmoh2g6lq000cn60dkmaqk6r0 |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 21 | MEDIUM | missing_file_document | Document | cmoh2g6m5000dn60dmwyfsdxm (report-food-f0fab2be696a) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 22 | MEDIUM | missing_file_document | Document | cmoh2g6mm000en60dim12r57j |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 23 | MEDIUM | missing_file_document | Document | cmoh2g6n1000fn60d7nyeiw30 |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 24 | MEDIUM | missing_file_document | Document | cmoh2g6ng000gn60d0ywk9k0x |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 25 | MEDIUM | missing_file_document | Document | cmoh2g6nu000hn60df51uiqcu (report-food-aa2340aec7eb) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 26 | MEDIUM | missing_file_document | Document | cmoh2g6oa000in60doqd3o1h4 (report-food-5a1cbe46f984) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 27 | MEDIUM | missing_file_document | Document | cmoh2g6oq000jn60d7f8ag0y1 (report-food-2bc5e2a736ab) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 28 | MEDIUM | missing_file_document | Document | cmoh2g6p6000kn60dicd1pfnx (report-food-6de68c22a6f6) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 29 | MEDIUM | missing_file_document | Document | cmoh2g6pl000ln60d5g38599t (report-food-5f07f685a55d) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |
| 30 | MEDIUM | missing_file_document | Document | cmoh2g6q9000mn60dbd4dttlq (report-food-da6ee0591cd2) |  | Restore file at "incoming/food-research-process-2026-04-20/03-policy-governance- |

## Orphan-file directories

| Top-level dir | Orphan count |
|---|---:|
| arkiv-sortert | 161 |
| pdf-downloads-20-04-26 | 22 |
| visualisering | 14 |
| URL-INVENTORY.md | 1 |
| external | 1 |

## Severity rules

- **HIGH**: missing file or broken reference where the entity has KI-PRIORITY ≥ 4.0
- **MEDIUM**: same but priority 3.0–3.5, or orphans in primary directories (`evidence-pack/`, `bibliotek/`)
- **LOW**: orphans in archive/raw directories (`arkiv-sortert/`, `pdf-downloads-20-04-26/`, perpl-snapshots) or duplicate-files-as-separate-records

## Scope notes

- Scanned **1112** files (.pdf, .md) under `research/`, excluding `_plans/`, `_status/`, `intake/`, and the meta/index docs at the root.
- Cross-referenced 1163 `Document`, 307 `SourceDoc`, and 108 seed Reports (plus their supportingSources).
- `SourceDoc.filename` is often a bare filename (no path); the script uses a basename index over `research/` to resolve them, so a SourceDoc is only flagged when no file with that basename exists anywhere under `research/`.
- A `Document` missing-file finding is HIGH severity if the linked seed Report/Thesis has KI-PRIORITY ≥ 4.0; otherwise MEDIUM. Documents without any seed link (e.g. raw imports) default to MEDIUM.
- Duplicate detection groups by SHA256 from `pdf-katalog.json` and only flags groups with ≥2 distinct `Document` records.
