# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-05-26T23:33:32.394Z
> Totalt: **471** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 0 | 310 | 0 |
| pdf-quality | 0 | 0 | 45 | 0 |
| html-triage | 0 | 0 | 29 | 0 |
| url-health | 0 | 0 | 87 | 0 |
| **Total** | 0 | 0 | 471 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| F: orphan files | 308 | 0 | 0 | 308 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| J: low-text PDFs | 44 | 0 | 0 | 44 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| O: other HTML issues | 29 | 0 | 0 | 29 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 44 | 0 | 0 | 44 |
| T: other URL issues | 2 | 0 | 0 | 2 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 0 funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.
- **PDF-OCR:** 5 scannede PDF-er er lukket i `research/PDF-OCR-REVIEW.csv` fordi OCR-tekst, eksisterende Document-tekst eller eksplisitt lokal erstatningstekst er dekkende; 0 review-rader traff ingen aktiv PDF-quality-rad.
- **URL-helse:** 87 funn fordelt på dead/blocked/timeout/server_error/other.
- **URL-review:** 5 blokkerte URL-er er lukket i `research/URL-HEALTH-REVIEW.csv` fordi de er verifisert via nettleser, citable mirror eller lokal kildepakke; 0 review-rader traff ingen aktiv URL-health-rad.
- **Document.filePath:** 0 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 308 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

## Anbefalt rekkefølge for neste ryddeslice

1. **Åpne MEDIUM-funn:** håndter gjenværende `pdf-quality`-rad først. For skippede/korrupt-lignende PDF-er betyr dette re-nedlasting, erstatningskilde eller eksplisitt arkivbeslutning.
2. **Graph enrichment:** prioriter board-member profile gaps og company-name duplicate groups; teknisk graf-integritet er allerede grønn.
3. **Dead/low-priority URL-er (Gruppe P/T):** rydd bare der kilden brukes i app/rapport eller har klar ny URL.
4. **Orphan files (Gruppe F):** vurder arkivering/sletting senere; alle Document/SourceDoc-lokatorer er grønne i denne kjøringen.

## URL-HEALTH status

URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.

Review-lukkede URL-er i `research/URL-HEALTH-REVIEW.csv` beholdes med opprinnelig kilde-URL, men tas ut av åpen backlog når det finnes eksplisitt nettleserverifikasjon, citable mirror eller lokal kildepakke. Dette er ikke det samme som å erklære CLI-sjekken grønn.

Scannede PDF-er i `research/PDF-OCR-REVIEW.csv` beholdes som opprinnelige PDF-filer, men tas ut av åpen backlog når OCR-tekst, DB-innhold eller eksplisitt lokal erstatningstekst på minst 100 ord er dekkende. Dette er ikke det samme som å erklære PDF-filen tekstbasert.

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/00_Working_File |
| 2 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 3 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 4 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 5 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 6 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 7 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 8 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 9 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 10 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 11 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 12 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 13 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 14 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 15 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 16 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 17 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 18 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 19 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 20 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 21 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 22 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 23 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 24 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 25 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 26 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 27 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 28 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 29 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
| 30 | LOW | file-coverage | F: orphan files | orphan_file | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Gover |
