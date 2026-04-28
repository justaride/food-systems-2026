# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T15:56:39.778Z
> Totalt: **345** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 118 | 144 | 0 |
| pdf-quality | 0 | 5 | 45 | 0 |
| html-triage | 3 | 2 | 0 | 0 |
| url-health | 28 | 0 | 0 | 0 |
| **Total** | 31 | 125 | 189 | 0 |

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
| P: dead URLs | 15 | 15 | 0 | 0 |
| Q: blocked URLs (403/451) | 7 | 7 | 0 | 0 |
| R: timeout URLs | 2 | 2 | 0 | 0 |
| S: server-error URLs | 1 | 1 | 0 | 0 |
| T: other URL issues | 3 | 3 | 0 | 0 |

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
| 17 | HIGH | url-health | P: dead URLs | dead | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id723782 |
| 18 | HIGH | url-health | P: dead URLs | dead | https://www.uib.no/en/persons/Tommy.Gabrielsen |
| 19 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://doi.org/10.1002/gch2.202300265 |
| 20 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://salford-repository.worktribe.com/output/1322952/sust |
| 21 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20Fo |
| 22 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/26754 |
| 23 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/32307 |
| 24 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/informationsmaterial/rapport |
| 25 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om |
| 26 | HIGH | url-health | R: timeout URLs | timeout | https://haku.vainu.com/company/normal-norge-as-omsetning-og- |
| 27 | HIGH | url-health | R: timeout URLs | timeout | https://stud.epsilon.slu.se/17609/ |
| 28 | HIGH | url-health | S: server-error URLs | server_error | https://www.kkv.fi/en/facts-and-advice/competition-affairs/a |
| 29 | HIGH | url-health | T: other URL issues | other | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A |
| 30 | HIGH | url-health | T: other URL issues | other | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A |
