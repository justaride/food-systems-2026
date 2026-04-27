# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T12:27:55.164Z
> Totalt: **317** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 118 | 144 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 3 | 2 | 0 | 0 |
| **Total** | 3 | 125 | 189 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| E: missing SourceDoc | 118 | 0 | 118 | 0 |
| F: orphan files | 142 | 0 | 0 | 142 |
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
| 4 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-1 |
| 5 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-10 |
| 6 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-101 |
| 7 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-102 |
| 8 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-103 |
| 9 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-107 |
| 10 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-108 |
| 11 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-109 |
| 12 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-110 |
| 13 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-111 |
| 14 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-112 |
| 15 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-113 |
| 16 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-114 |
| 17 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-115 |
| 18 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-116 |
| 19 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-117 |
| 20 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-118 |
| 21 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-119 |
| 22 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-120 |
| 23 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-121 |
| 24 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-123 |
| 25 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-124 |
| 26 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-125 |
| 27 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-126 |
| 28 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-136 |
| 29 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-137 |
| 30 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-138 |
