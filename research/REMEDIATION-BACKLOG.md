# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T12:12:32.014Z
> Totalt: **389** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 190 | 144 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 3 | 2 | 0 | 0 |
| **Total** | 3 | 197 | 189 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| A: stale incoming/ | 1 | 0 | 1 | 0 |
| B: external/ DB-only | 60 | 0 | 60 | 0 |
| C: generated/meetings/ | 8 | 0 | 8 | 0 |
| E: missing SourceDoc | 118 | 0 | 118 | 0 |
| F: orphan files | 145 | 0 | 3 | 142 |
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
| 1 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-food-stockpiles-202 |
| 2 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-melmolle-2025.html |
| 3 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/bransje/dlf-leverandor-2025.html |
| 4 | MEDIUM | file-coverage | A: stale incoming/ | missing_file_document | cmoh2g8860038n60d04z5mrbn |
| 5 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpte0000vw0dusb874iw |
| 6 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpub0001vw0dbumriqjz |
| 7 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpug0002vw0d7f3qipql |
| 8 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpuk0003vw0dp0j4x509 |
| 9 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpuv0004vw0di9yc9yfo |
| 10 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpv50005vw0d1s3y31jb |
| 11 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpva0006vw0djj92bb5t |
| 12 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpw70007vw0dobq4dve9 |
| 13 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpwg0008vw0dgcha2p3a |
| 14 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpxt0009vw0deti0bl62 |
| 15 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpxz000avw0deqp3ryi2 |
| 16 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpy2000bvw0dnqnyvayq |
| 17 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpy7000cvw0dv79oyq5m |
| 18 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpyx000dvw0dh2u2yvgs |
| 19 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpzf000evw0d0zrrns6d |
| 20 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpzk000fvw0dj0h1tx00 |
| 21 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpzp000gvw0d49eo8j17 |
| 22 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpzs000hvw0dcmw14pbg |
| 23 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jpzu000ivw0d693wscci |
| 24 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq18000jvw0dpydr04g1 |
| 25 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq1c000kvw0dithrr5z0 |
| 26 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq1f000lvw0dh0opw4u4 |
| 27 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq27000mvw0dybs8pl5r |
| 28 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq2b000nvw0d3sono486 |
| 29 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq2e000ovw0dr56o59bd |
| 30 | MEDIUM | file-coverage | B: external/ DB-only | missing_file_document | cmoh0jq31000pvw0du1cdkgt1 |
