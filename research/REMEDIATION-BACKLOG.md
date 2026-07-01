# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-07-01T02:10:27.247Z
> Totalt: **917** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 65 | 105 | 342 | 0 |
| pdf-quality | 0 | 289 | 0 | 0 |
| html-triage | 0 | 0 | 29 | 0 |
| url-health | 0 | 0 | 87 | 0 |
| **Total** | 65 | 394 | 458 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| B: external/ DB-only | 44 | 0 | 44 | 0 |
| D: other missing-document | 97 | 65 | 31 | 1 |
| F: orphan files | 369 | 0 | 30 | 339 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| M: other PDF issues | 289 | 0 | 289 | 0 |
| O: other HTML issues | 29 | 0 | 0 | 29 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 44 | 0 | 0 | 44 |
| T: other URL issues | 2 | 0 | 0 | 2 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 0 funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.
- **PDF-OCR:** 0 scannede PDF-er er lukket i `research/PDF-OCR-REVIEW.csv` fordi OCR-tekst, eksisterende Document-tekst eller eksplisitt lokal erstatningstekst er dekkende; 1 review-rader traff ingen aktiv PDF-quality-rad.
- **URL-helse:** 87 funn fordelt på dead/blocked/timeout/server_error/other.
- **URL-review:** 5 blokkerte URL-er er lukket i `research/URL-HEALTH-REVIEW.csv` fordi de er verifisert via nettleser, citable mirror eller lokal kildepakke; 0 review-rader traff ingen aktiv URL-health-rad.
- **Document.filePath:** 141 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 369 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

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
| 1 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyof0000njvmdjrv2blv (tesdal-2013) |
| 2 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyqr0001njvm7la1op31 (sedwall-2025) |
| 3 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyqy0002njvmeo5z64yk (bojo-2023) |
| 4 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyr30003njvmka3xvjsc (nmbu-circular-vegetables-2022) |
| 5 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyr60004njvmkuyujbnd (van-straten-2025) |
| 6 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrc0005njvm3ccaxbrf (segersven-2024) |
| 7 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyri0006njvm31b5p6at (rey-verge-2005) |
| 8 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrn0007njvmd1h15xme (slu-house-crickets-2025) |
| 9 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrr0008njvm72f0l3n2 (bueso-bordils-2021) |
| 10 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyru0009njvmavxrd7cp (desilva-2023) |
| 11 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrz000anjvm40x9zv8t (lund-beijer-2026) |
| 12 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajys2000bnjvm18kstw5z (mirza-2016) |
| 13 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyso000cnjvm1vx5gvhu (matsystemutvalget-2026) |
| 14 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajysv000dnjvm5uvvmk08 (akademia-uib-kjopermakt) |
| 15 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyt3000fnjvmjakt14qv (se-konkurrensverket-2024-5) |
| 16 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyt8000gnjvmz8r1gkuy (asko-infrastruktur-2025) |
| 17 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytd000hnjvmn60kb31b (kt-markedsundersokelser-2026) |
| 18 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytf000injvm3k3rqsu6 (is-markedsstruktur-2024) |
| 19 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytj000jnjvmapvnokb7 (juridisk-eudr-norge-2025) |
| 20 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytn000knjvm9q2oil3y (nbs-systemkritikk) |
| 21 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyu3000onjvmqmv7ycxt (norden-policy-2024) |
| 22 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyu9000pnjvmnf9p1ypx (akademia-sifo-retail-media-2025) |
| 23 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuc000qnjvmm7gsitu3 (juridisk-eiendomsmakt-lokal-konku |
| 24 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyue000rnjvmxrad483t (etmv-toimintakertomus-2024) |
| 25 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuh000snjvmgcmt6umd (coop-danmark-2024) |
| 26 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyul000tnjvmlzlt7jek (verdibutikker-utfordrere) |
| 27 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuo000unjvmcl2enn4a (nordisk-sammenligning-2024) |
| 28 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyut000wnjvm9uh3kihc (dlf-leverandor-2025) |
| 29 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyv1000ynjvmqjymvcbk (menon-emv-innovasjon) |
| 30 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyv3000znjvm24f56eod (merkevarer-historie) |
