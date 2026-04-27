# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T11:58:23.968Z
> Totalt: **633** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 1 | 376 | 201 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 3 | 2 | 0 | 0 |
| **Total** | 4 | 383 | 246 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| A: stale incoming/ | 191 | 1 | 190 | 0 |
| B: external/ DB-only | 60 | 0 | 60 | 0 |
| C: generated/meetings/ | 8 | 0 | 8 | 0 |
| E: missing SourceDoc | 118 | 0 | 118 | 0 |
| F: orphan files | 199 | 0 | 0 | 199 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| I: scanned PDFs (need OCR) | 5 | 0 | 5 | 0 |
| J: low-text PDFs | 44 | 0 | 0 | 44 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| N: needs MD extraction | 5 | 3 | 2 | 0 |

### Gruppe A: stale `incoming/food-research-process-2026-04-20/` paths

Document.filePath peker til `incoming/food-research-process-2026-04-20/...` som ikke finnes — filene er flyttet til `research/arkiv-sortert/Food Research Process 20.04.26/...` i intake-omorganiseringen.

**Fiks:** skript som mapper `incoming/foo-bar-baz` → `research/arkiv-sortert/Food Research Process 20.04.26/foo_bar_baz` og oppdaterer `Document.filePath` in-place. Verifiser hver mapping mot `research/pdf-katalog.json` SHA256 før commit. Lav risiko, høyt antall fikser — bør gjøres først.

### Gruppe B: `external/` paths

Document.filePath peker til `external/...` som ikke finnes på disk noe sted. Innhold er sannsynligvis bare i `Document.content` (DB-only). Filer er enten slettet eller aldri lagret lokalt.

**Fiks:** policy-beslutning trengs:
- Beholde som DB-only? Da bør `Document.filePath` settes til null + provenance-flagg "db-only".
- Eller laste ned/regenerere PDF-er fra Document.url-feltet?

### Gruppe C: `generated/meetings/meeting-N.md`

Auto-genererte møtenotater som ikke lenger er i repoet (verken filer eller katalog). Cleanup som ikke ble fulgt opp i DB.

**Fiks:** enten gjenskape via samme generator, eller slette de Document-radene fra DB.

## Anbefalt rekkefølge for Fase C

1. **Gruppe A** (~191 Documents, MEDIUM): script-basert path-remap. Lavt risikokvalitet, høyt antall fikser — høyest ROI.
2. **HIGH severity** (totalt få): manuell behandling av matsvinnutvalget-2024 + 3 HTML-snapshots.
3. **Gruppe I — scanned PDFs**: vurder OCR (Tesseract) for de 2-3 viktigste.
4. **Gruppe C** (8 generated/meetings): beslutning gjenskape vs slette.
5. **Gruppe B** (~60 external/): policy-beslutning før handling.
6. **Gruppe N — needs-md-extraction (HTML)**: 5 saker, kan automatiseres med readability/turndown-pipeline.
7. **Gruppe J — low-text PDFs (44)**: lav prioritet — Document.content har sannsynligvis allerede tekst.
8. **Gruppe F — orphan files (199)**: lav prioritet — mest arkiv-sortert/ rå-arkiv, kan beholdes.

## URL-INVENTORY status

URL-helse er **ikke** klassifisert ennå — kun inventarisert (173 unike, 98 % høy-prioritet). Faktisk HTTP-sjekk er en egen Fase B-utvidelse (kan kjøres som batch nattjobb før Fase C).

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | HIGH | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6yo0012n60dqi8nh1te (matsvinnutvalget-2024) |
| 2 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-food-stockpiles-202 |
| 3 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-melmolle-2025.html |
| 4 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/bransje/dlf-leverandor-2025.html |
| 5 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6f10000n60d269y28y9 (report-food-227bb60d773e) |
| 6 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6g30001n60dhuhguh87 (report-food-e3f33c5a4766) |
| 7 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6gk0002n60drn30t1uq (report-food-283dd0683b0d) |
| 8 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6h40003n60dqhyqrk6u (report-food-e268bd87c1c4) |
| 9 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6hv0004n60duhghy9p9 (report-food-cc2689719568) |
| 10 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6ig0005n60d8xqmk6nz (report-food-069b10c9ac66) |
| 11 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6ix0006n60dqtsdx75u (report-food-11ed41bcaca1) |
| 12 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6je0007n60dcn4ycklk (report-food-7aaa0d71e1e7) |
| 13 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6ju0008n60d7cd7gos6 (report-food-8749cc79f983) |
| 14 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6kg0009n60dew0kb9ks |
| 15 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6kw000an60dwl5nabbt |
| 16 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6lc000bn60dmnnbqar9 (report-food-fe0a3ed77f48) |
| 17 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6lq000cn60dkmaqk6r0 |
| 18 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6m5000dn60dmwyfsdxm (report-food-f0fab2be696a) |
| 19 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6mm000en60dim12r57j |
| 20 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6n1000fn60d7nyeiw30 |
| 21 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6ng000gn60d0ywk9k0x |
| 22 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6nu000hn60df51uiqcu (report-food-aa2340aec7eb) |
| 23 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6oa000in60doqd3o1h4 (report-food-5a1cbe46f984) |
| 24 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6oq000jn60d7f8ag0y1 (report-food-2bc5e2a736ab) |
| 25 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6p6000kn60dicd1pfnx (report-food-6de68c22a6f6) |
| 26 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6pl000ln60d5g38599t (report-food-5f07f685a55d) |
| 27 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6q9000mn60dbd4dttlq (report-food-da6ee0591cd2) |
| 28 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6qt000nn60d3xlcmfqa |
| 29 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6rb000on60d9de8ckkr (report-food-f853fed35279) |
| 30 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g6rz000pn60dvopqiy1s |
