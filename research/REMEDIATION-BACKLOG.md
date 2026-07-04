# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-07-04T18:43:35.583Z
> Totalt: **488** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 11 | 30 | 319 | 0 |
| pdf-quality | 0 | 0 | 54 | 0 |
| html-triage | 0 | 0 | 0 | 0 |
| url-health | 0 | 0 | 74 | 0 |
| **Total** | 11 | 30 | 447 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| D: other missing-document | 11 | 11 | 0 | 0 |
| F: orphan files | 349 | 0 | 30 | 319 |
| J: low-text PDFs | 53 | 0 | 0 | 53 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 33 | 0 | 0 | 33 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 0 funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.
- **PDF-review:** 5 PDF-quality-rader er lukket i `research/PDF-OCR-REVIEW.csv` fordi OCR-tekst, eksisterende Document-tekst, eksplisitt lokal erstatningstekst eller bekreftet tilstrekkelig `pdftotext`-uttak er dekkende; 0 review-rader traff ingen aktiv PDF-quality-rad.
- **URL-helse:** 74 funn fordelt på dead/blocked/timeout/server_error/other.
- **URL-review:** 18 URL-health-rader er lukket i `research/URL-HEALTH-REVIEW.csv` fordi de er verifisert via nettleser, citable mirror eller lokal kildepakke; 0 review-rader traff ingen aktiv URL-health-rad.
- **Document.filePath:** 11 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 349 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

## Anbefalt rekkefølge for neste ryddeslice

1. **Gjenværende PDF-quality-funn (54):** håndter `low-text`/`skipped-too-large`-rader først der de er brukt i app, rapport eller KI/RAG-inntak.
2. **URL-helse (74):** rydd URL-er bare der kilden brukes i app/rapport eller har klar ny URL, arkivkopi eller lokal kildepakke.
3. **HTML-triage:** 0 åpne funn.
4. **Graph enrichment:** prioriter board-member profile gaps og company-name duplicate groups; teknisk graf-integritet er allerede grønn.
5. **Orphan files (Gruppe F, 349):** vurder arkivering/sletting eller eksplisitt seed-/DB-lenke.

## URL-HEALTH status

URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.

Review-lukkede URL-er i `research/URL-HEALTH-REVIEW.csv` beholdes med opprinnelig kilde-URL, men tas ut av åpen backlog når det finnes eksplisitt nettleserverifikasjon, citable mirror eller lokal kildepakke. Dette er ikke det samme som å erklære CLI-sjekken grønn.

PDF-er i `research/PDF-OCR-REVIEW.csv` beholdes som opprinnelige PDF-filer, men tas ut av åpen backlog når OCR-tekst, DB-innhold, eksplisitt lokal erstatningstekst eller bekreftet tilstrekkelig `pdftotext`-uttak er dekkende. Dette er ikke det samme som å erklære alle PDF-ene teksttette; `low-text` kan fortsatt være density-only.

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyqy0002njvmeo5z64yk (bojo-2023) |
| 2 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyr60004njvmkuyujbnd (van-straten-2025) |
| 3 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrr0008njvm72f0l3n2 (bueso-bordils-2021) |
| 4 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrz000anjvm40x9zv8t (lund-beijer-2026) |
| 5 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajys2000bnjvm18kstw5z (mirza-2016) |
| 6 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyu3000onjvmqmv7ycxt (norden-policy-2024) |
| 7 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyue000rnjvmxrad483t (etmv-toimintakertomus-2024) |
| 8 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyvb0012njvmnphhze07 (karlstad-declaration-2024) |
| 9 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyve0013njvmw7zok4yr (nordic-food-alert-2025) |
| 10 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyxz001snjvmjzin1ww1 (konkurrensverket-2025-5-livsmedel |
| 11 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyyw0021njvmam1pbay7 (kfst-foedevarehandelslov-evalueri |
| 12 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/akademia/nhh-food/butikkstruktur-2024 2.md |
| 13 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/akademia/nhh-food/food-konsentrasjon-nordisk-2024  |
| 14 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/akademia/nhh-food/matbors-historie 2.md |
| 15 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/akademia/nhh-food/pettersen-steen-mot-bedre-vitend |
| 16 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/sirkularitet/kilder/ks-veileder-sirkulaerokonomi-o |
| 17 | MEDIUM | file-coverage | F: orphan files | orphan_file | bibliotek/sirkularitet/kilder/resource-se-slutrapport-region |
| 18 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/nordisk/nordic-nutrition-recommendations-2023. |
| 19 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/dk-landb |
| 20 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/dk-okolo |
| 21 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/dk-organ |
| 22 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-ruoka |
| 23 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/is-esa-c |
| 24 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/is-esa-o |
| 25 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/is-gover |
| 26 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/no-debio |
| 27 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/no-landb |
| 28 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/nordic-f |
| 29 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekolo |
| 30 | MEDIUM | file-coverage | F: orphan files | orphan_file | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekoma |
