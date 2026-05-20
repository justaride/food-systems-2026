# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-05-20T02:25:03.971Z
> Totalt: **535** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 42 | 309 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 0 | 18 | 11 | 0 |
| url-health | 10 | 0 | 95 | 0 |
| **Total** | 10 | 65 | 460 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| E: missing SourceDoc | 42 | 0 | 42 | 0 |
| F: orphan files | 307 | 0 | 0 | 307 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| I: scanned PDFs (need OCR) | 5 | 0 | 5 | 0 |
| J: low-text PDFs | 44 | 0 | 0 | 44 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| N: needs MD extraction | 18 | 0 | 18 | 0 |
| O: other HTML issues | 11 | 0 | 0 | 11 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 52 | 5 | 0 | 47 |
| R: timeout URLs | 5 | 4 | 0 | 1 |
| S: server-error URLs | 5 | 1 | 0 | 4 |
| T: other URL issues | 2 | 0 | 0 | 2 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 42 funn. Dette er strukturerte SourceDoc-poster som mangler lokal filkobling eller må få oppdatert filename/URL.
- **URL-helse:** 105 funn fordelt på dead/blocked/timeout/server_error/other.
- **Document.filePath:** 0 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 307 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

## Anbefalt rekkefølge for neste ryddeslice

1. **SourceDoc-lokatorer (Gruppe E):** legg inn presis `url` eller koble til eksisterende `Document` for strukturerte kilder uten locator.
2. **HIGH URL-funn:** start med `report_canonical`, `thesis` og `sourcedoc` før lavprioritets `document`-URL-er.
3. **HTML-triage (Gruppe N):** konverter høyprioritets HTML-snapshots til Markdown slik at de kan indekseres og siteres.
4. **Scannede/low-text PDF-er (Gruppe I/J):** OCR bare de viktigste først; resten kan stå som lavprioritet hvis `Document.content` allerede er dekkende.
5. **Orphan files (Gruppe F):** vurder arkivering/sletting senere, etter at SourceDoc/Document-koblinger er grønne.

## URL-HEALTH status

URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://civita.no/okonomi/naeringspolitikk/svak-konkurranse- |
| 2 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://salford-repository.worktribe.com/output/1322952/sust |
| 3 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20Fo |
| 4 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/globalassets/dokument/inform |
| 5 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/globalassets/dokument/inform |
| 6 | HIGH | url-health | R: timeout URLs | timeout | https://lutpub.lut.fi/handle/10024/165638 |
| 7 | HIGH | url-health | R: timeout URLs | timeout | https://lutpub.lut.fi/handle/10024/170079 |
| 8 | HIGH | url-health | R: timeout URLs | timeout | https://skemman.is/handle/1946/26754 |
| 9 | HIGH | url-health | R: timeout URLs | timeout | https://skemman.is/handle/1946/32307 |
| 10 | HIGH | url-health | S: server-error URLs | server_error | https://urn.fi/URN:NBN:fi-fe2024043024001 |
| 11 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-137 |
| 12 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-138 |
| 13 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-139 |
| 14 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-140 |
| 15 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-141 |
| 16 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-142 |
| 17 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-143 |
| 18 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-144 |
| 19 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-145 |
| 20 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-148 |
| 21 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-150 |
| 22 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-154 |
| 23 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-155 |
| 24 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-156 |
| 25 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-157 |
| 26 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-158 |
| 27 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-159 |
| 28 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-160 |
| 29 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-161 |
| 30 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-162 |
