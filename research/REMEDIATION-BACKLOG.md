# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-05-19T08:10:05.217Z
> Totalt: **514** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 42 | 306 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 3 | 2 | 0 | 0 |
| url-health | 31 | 0 | 80 | 0 |
| **Total** | 34 | 49 | 431 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| E: missing SourceDoc | 42 | 0 | 42 | 0 |
| F: orphan files | 304 | 0 | 0 | 304 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| I: scanned PDFs (need OCR) | 5 | 0 | 5 | 0 |
| J: low-text PDFs | 44 | 0 | 0 | 44 |
| K: oversized PDFs | 1 | 0 | 0 | 1 |
| N: needs MD extraction | 5 | 3 | 2 | 0 |
| P: dead URLs | 51 | 16 | 0 | 35 |
| Q: blocked URLs (403/451) | 38 | 7 | 0 | 31 |
| R: timeout URLs | 3 | 1 | 0 | 2 |
| S: server-error URLs | 6 | 2 | 0 | 4 |
| T: other URL issues | 13 | 5 | 0 | 8 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 42 funn. Dette er strukturerte SourceDoc-poster som mangler lokal filkobling eller må få oppdatert filename/URL.
- **URL-helse:** 111 funn fordelt på dead/blocked/timeout/server_error/other.
- **Document.filePath:** 0 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 304 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

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
| 1 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-food-stockpiles-202 |
| 2 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/beredskap/beredskap-island-melmolle-2025.html |
| 3 | HIGH | html-triage | N: needs MD extraction | needs-md-extraction | evidence-pack/bransje/dlf-leverandor-2025.html |
| 4 | HIGH | url-health | P: dead URLs | dead | https://beccle.no/files/2020/01/Susanne_Helen_Gangstoe_Maste |
| 5 | HIGH | url-health | P: dead URLs | dead | https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/112 |
| 6 | HIGH | url-health | P: dead URLs | dead | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2569075 |
| 7 | HIGH | url-health | P: dead URLs | dead | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2788657 |
| 8 | HIGH | url-health | P: dead URLs | dead | https://nordopen.nord.no/nord-xmlui/handle/11250/2491452 |
| 9 | HIGH | url-health | P: dead URLs | dead | https://oda.oslomet.no/oda-xmlui/handle/11250/3101983 |
| 10 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778 |
| 11 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/167473 |
| 12 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3051794 |
| 13 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3158950 |
| 14 | HIGH | url-health | P: dead URLs | dead | https://trace.tennessee.edu/cgi/viewcontent.cgi?article=1473 |
| 15 | HIGH | url-health | P: dead URLs | dead | https://uia.brage.unit.no/uia-xmlui/handle/11250/276369 |
| 16 | HIGH | url-health | P: dead URLs | dead | https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873 |
| 17 | HIGH | url-health | P: dead URLs | dead | https://www.dagligvaretilsynet.no/rapporter-og-strategi |
| 18 | HIGH | url-health | P: dead URLs | dead | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id723782 |
| 19 | HIGH | url-health | P: dead URLs | dead | https://www.uib.no/en/persons/Tommy.Gabrielsen |
| 20 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://pub.norden.org/nord2024-007/index.html |
| 21 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://salford-repository.worktribe.com/output/1322952/sust |
| 22 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20Fo |
| 23 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/26754 |
| 24 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/32307 |
| 25 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/informationsmaterial/rapport |
| 26 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om |
| 27 | HIGH | url-health | R: timeout URLs | timeout | https://research.cbs.dk/da/studentProjects/4d595881-09e8-490 |
| 28 | HIGH | url-health | S: server-error URLs | server_error | https://www.icagrupp.se/en/archive/press-archive/2025/ica-gr |
| 29 | HIGH | url-health | S: server-error URLs | server_error | https://www.kkv.fi/en/facts-and-advice/competition-affairs/a |
| 30 | HIGH | url-health | T: other URL issues | other | http://www.diva-portal.org/smash/get/diva2:1966137/FULLTEXT0 |
