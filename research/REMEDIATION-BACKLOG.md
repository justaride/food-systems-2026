# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-05-20T10:17:24.657Z
> Totalt: **481** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 0 | 310 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 0 | 18 | 11 | 0 |
| url-health | 5 | 0 | 87 | 0 |
| **Total** | 5 | 23 | 453 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| F: orphan files | 308 | 0 | 0 | 308 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| I: scanned PDFs (need OCR) | 5 | 0 | 5 | 0 |
| J: low-text PDFs | 44 | 0 | 0 | 44 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| N: needs MD extraction | 18 | 0 | 18 | 0 |
| O: other HTML issues | 11 | 0 | 0 | 11 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 49 | 5 | 0 | 44 |
| T: other URL issues | 2 | 0 | 0 | 2 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 0 funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.
- **URL-helse:** 92 funn fordelt på dead/blocked/timeout/server_error/other.
- **Document.filePath:** 0 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 308 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

## Anbefalt rekkefølge for neste ryddeslice

1. **HIGH URL-funn:** start med `report_canonical`, `thesis` og `sourcedoc` før lavprioritets `document`-URL-er. `blocked` kan være botblokkering, så bytt bare til live-verifiserte erstatnings-URL-er.
2. **HTML-triage (Gruppe N):** konverter høyprioritets HTML-snapshots til Markdown slik at de kan indekseres og siteres.
3. **Scannede PDF-er (Gruppe I):** OCR de 5 gjenværende MEDIUM-filene først; low-text PDF-er kan vente hvis `Document.content` allerede er dekkende.
4. **Dead/low-priority URL-er (Gruppe P/T):** rydd bare der kilden brukes i app/rapport eller har klar ny URL.
5. **Orphan files (Gruppe F):** vurder arkivering/sletting senere; alle Document/SourceDoc-lokatorer er grønne i denne kjøringen.

## URL-HEALTH status

URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://civita.no/okonomi/naeringspolitikk/svak-konkurranse- |
| 2 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://salford-repository.worktribe.com/output/1322952/sust |
| 3 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20Fo |
| 4 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/26754 |
| 5 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/32307 |
| 6 | MEDIUM | pdf-quality | I: scanned PDFs (need OCR) | scanned | arkiv-sortert/Food Research Process 20.04.26/06_Company_And_ |
| 7 | MEDIUM | pdf-quality | I: scanned PDFs (need OCR) | scanned | arkiv-sortert/Food Research Process 20.04.26/07_Academic_Res |
| 8 | MEDIUM | pdf-quality | I: scanned PDFs (need OCR) | scanned | arkiv-sortert/Food Research Process 20.04.26/08_Food_Securit |
| 9 | MEDIUM | pdf-quality | I: scanned PDFs (need OCR) | scanned | evidence-pack/akademia/drager-vagene-2017.pdf |
| 10 | MEDIUM | pdf-quality | I: scanned PDFs (need OCR) | scanned | pdf-downloads-20-04-26/What does it take to close the loop_  |
| 11 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-prolu |
| 12 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-prolu |
| 13 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-ruoka |
| 14 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-eea-a |
| 15 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-hagst |
| 16 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-mast- |
| 17 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-stati |
| 18 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-stati |
| 19 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-stati |
| 20 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/is-tun-l |
| 21 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/no-landb |
| 22 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
| 23 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
| 24 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
| 25 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
| 26 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
| 27 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-jordb |
| 28 | MEDIUM | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/okologisk-norden-2026-04-29/downloads/se-jordb |
| 29 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/00_Working_File |
| 30 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
