# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-05-01T02:21:55.966Z
> Totalt: **616** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 0 | 118 | 152 | 0 |
| pdf-quality | 0 | 289 | 0 | 0 |
| html-triage | 0 | 18 | 11 | 0 |
| url-health | 28 | 0 | 0 | 0 |
| **Total** | 28 | 425 | 163 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| E: missing SourceDoc | 118 | 0 | 118 | 0 |
| F: orphan files | 150 | 0 | 0 | 150 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| M: other PDF issues | 289 | 0 | 289 | 0 |
| N: needs MD extraction | 18 | 0 | 18 | 0 |
| O: other HTML issues | 11 | 0 | 0 | 11 |
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
| 1 | HIGH | url-health | P: dead URLs | dead | https://beccle.no/files/2020/01/Susanne_Helen_Gangstoe_Maste |
| 2 | HIGH | url-health | P: dead URLs | dead | https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/112 |
| 3 | HIGH | url-health | P: dead URLs | dead | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2569075 |
| 4 | HIGH | url-health | P: dead URLs | dead | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2788657 |
| 5 | HIGH | url-health | P: dead URLs | dead | https://nordopen.nord.no/nord-xmlui/handle/11250/2491452 |
| 6 | HIGH | url-health | P: dead URLs | dead | https://oda.oslomet.no/oda-xmlui/handle/11250/3101983 |
| 7 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778 |
| 8 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/167473 |
| 9 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3051794 |
| 10 | HIGH | url-health | P: dead URLs | dead | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3158950 |
| 11 | HIGH | url-health | P: dead URLs | dead | https://trace.tennessee.edu/cgi/viewcontent.cgi?article=1473 |
| 12 | HIGH | url-health | P: dead URLs | dead | https://uia.brage.unit.no/uia-xmlui/handle/11250/276369 |
| 13 | HIGH | url-health | P: dead URLs | dead | https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873 |
| 14 | HIGH | url-health | P: dead URLs | dead | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id723782 |
| 15 | HIGH | url-health | P: dead URLs | dead | https://www.uib.no/en/persons/Tommy.Gabrielsen |
| 16 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://doi.org/10.1002/gch2.202300265 |
| 17 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://salford-repository.worktribe.com/output/1322952/sust |
| 18 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20Fo |
| 19 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/26754 |
| 20 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://skemman.is/handle/1946/32307 |
| 21 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/informationsmaterial/rapport |
| 22 | HIGH | url-health | Q: blocked URLs (403/451) | blocked | https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om |
| 23 | HIGH | url-health | R: timeout URLs | timeout | https://haku.vainu.com/company/normal-norge-as-omsetning-og- |
| 24 | HIGH | url-health | R: timeout URLs | timeout | https://stud.epsilon.slu.se/17609/ |
| 25 | HIGH | url-health | S: server-error URLs | server_error | https://www.kkv.fi/en/facts-and-advice/competition-affairs/a |
| 26 | HIGH | url-health | T: other URL issues | other | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A |
| 27 | HIGH | url-health | T: other URL issues | other | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A |
| 28 | HIGH | url-health | T: other URL issues | other | https://www.diva-portal.org/smash/get/diva2:2041632/FULLTEXT |
| 29 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-1 |
| 30 | MEDIUM | file-coverage | E: missing SourceDoc | missing_file_sourcedoc | src-10 |
