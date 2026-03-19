# Underlagskartlegging: dokumentkorpus, PDF-dekning og nett-tilgjengelighet

**Dato:** 18. mars 2026  
**Formaal:** Lage et faktisk materialregnskap over hva som finnes lokalt i repoet, hva som er kartlagt i typed registere, hva som er lastet ned som filer, og hva som er registrert som nett-tilgjengelig fulltekst eller kilde.

---

## 1. Metode og avgrensning

Denne kartleggingen er basert paa tre lag:

1. faktisk filinventering under `research/`
2. metadata i `src/lib/data/sources.ts`
3. metadata i `src/lib/data/theses.ts` og `src/lib/data/reports.ts`

Viktig presisering:

- "lokalt tilgjengelig" betyr at en fil faktisk finnes i repoet
- "kartlagt" betyr at dokumentet er registrert i et typed lag
- "nett-tilgjengelig" betyr at det finnes en URL i metadata
- "direkte PDF paa nett" betyr at URL-en peker direkte til en `.pdf`
- dette notatet **live-validerer ikke** HTTP-status for alle lenker; tallene beskriver repoets egen metadata, ikke garantert 200 OK i sanntid

Det er ogsaa viktig aa ikke summere alle lag blindt:

- `SourceDoc`, `Thesis` og `Report` overlapper delvis
- samme dokument kan finnes som lokal markdown, lokal PDF og ekstern URL samtidig
- rapportlaget er fortsatt svakt koblet til `Document`-laget og kan derfor ikke brukes som fullgod fasit for fulltekstdekning alene

---

## 2. Hovedbilde

Per 18. mars 2026, etter denne kartleggingen, en foerste `P1`-nedlastingsrunde, en foerste `P2`-manual-capture-runde og to oppfoelgende `P3`-/reparasjonsrunder, inneholder `research/`:

- `523` filer totalt
- `183` markdown-filer
- `79` PDF-filer
- `63` CSV-filer
- `113` JSON-filer
- `6` GeoJSON-filer

Hvis vi avgrenser til dokumentlignende filer, finnes det:

- `262` dokumentfiler totalt (`183` markdown + `79` PDF)

Dette betyr at prosjektet allerede har et betydelig lokalt korpus, men at fulltekstlaget er tungt dominert av markdown og ikke av nedlastede original-PDF-er.

---

## 3. Hva som faktisk finnes lokalt i repoet

### 3.1 Markdown-korpuset

Markdown-filer i `research/` fordeler seg slik:

- `95` i `bibliotek/`
- `23` i `norden/`
- `21` i `rammeverk/`
- `9` i `norge/`
- `7` i `perpl-17-03/`
- `5` i `data/`
- `5` i `brocode-bakgrunn/`
- `4` i `whitepaper/`
- `2` i `interviews/`
- `2` i `evidence-pack/`
- resten er top-level styrings- og prosjektfiler

Dette viser at det operative fulltekstkorpuset fortsatt i hovedsak er et markdown-korpus.

### 3.2 PDF-korpuset

PDF-filer i `research/` fordeler seg slik:

- `65` i `evidence-pack/`
- `14` i `visualisering/figurer/`

PDF-korpuset er derfor delt i to klart forskjellige klasser:

1. **kildedokumenter / belegg**
   - lagret i `evidence-pack/`

2. **genererte visualiseringsoutput**
   - lagret i `visualisering/figurer/`

Praktisk betyr dette at `65` av `79` lokale PDF-er er faktiske dokumentunderlag. De resterende `14` er figurfiler, ikke kilder.

### 3.3 Evidence-pack som faktisk PDF-arkiv

De `65` PDF-ene i `evidence-pack/` fordeler seg slik:

- `16` i `evidence-pack/akademia/`
- `11` i `evidence-pack/arsrapporter/`
- `15` i `evidence-pack/offentlig/`
- `13` i `evidence-pack/nordisk/`
- `10` i `evidence-pack/tilsyn/`

Dette er per naa det tydeligste lokale arkivet for nedlastede originaldokumenter.

I denne `P2`-runden ble det i tillegg speilet `13` nye dokumenter med verifisert PDF-struktur, blant annet fra:

- `regjeringen.no`
- `dagligvaretilsynet.no`
- `norgesgruppen.no`
- `coop.no`
- `reitanretail.no`
- `asko.no`
- `icagruppen.se`

I de oppfoelgende `P3`-/reparasjonsrundene ble det speilet `6` ytterligere dokumenter og reparert `5` lokale placeholder-kopier, blant annet fra:

- `axfood.com` / `mb.cision.com`
- `kesko.fi`
- `digitalassets.sallinggroup.com`
- `pty.fi`
- `samkeppni.is`
- `regeringen.se`
- `beccle.no`
- `ruokavirasto.fi`
- `nva.sikt.no`
- `konkurransetilsynet.no` (HTML-capture til lokal PDF)

Viktig teknisk presisering etter validering 18. mars 2026:

- de tidligere kjente `.pdf`-placeholderne i `evidence-pack/` er naa reparert eller erstattet med gyldige PDF-er
- `gangstoe-2019-uib.pdf`, `ulsaker-phd-thesis.pdf`, `is-samkeppni-annual-report-2024.pdf`, `sou-2024-8-livsmedelsberedskap.pdf` og `dk-salling-coop-decision-2025.pdf` er naa verifisert som gyldige PDF-dokumenter
- `innkjopspriser-2017-2023.pdf` er en lokal PDF-capture av offentlig HTML-side, ikke en original vedleggs-PDF fra institusjonen

---

## 4. Hva som er kartlagt i typed registere

### 4.1 SourceDoc-laget

`src/lib/data/sources.ts` inneholder:

- `100` registrerte `SourceDoc`

Fordeling etter type:

- `33` rapport
- `24` analyse
- `11` forskning
- `5` arsrapport
- `4` lovverk
- `3` statistikk
- `3` transkripsjon
- `2` masteroppgave
- `2` soknad
- `2` notat
- `2` epost
- `2` duplikat
- resten er enkeltoppfoeringer som strategi, arbeidsdok, datasett og initiativ

Viktig observasjon:

- `96` av `100` `SourceDoc.filename` peker til `.md`
- bare `4` peker til `.pdf`

Dette betyr at `SourceDoc` i praksis er et **kilderegister og oppsummeringslag**, ikke et rent binararkiv for originalfiler.

### 4.2 Thesis-laget

`src/lib/data/theses.ts` inneholder:

- `31` registrerte master-/avhandlingsoppfoeringer

Dette laget er bedre materialisert enn `SourceDoc`, fordi mange theses baade finnes som lokale markdown-sammendrag og i enkelte tilfeller som lokale eller eksterne PDF-er.

### 4.3 Report-laget

`src/lib/data/reports.ts` inneholder:

- `61` strukturerte rapportoppfoeringer

Men dette laget boer leses med varsomhet som materialregnskap, fordi rapportene fortsatt er svakt koblet til fulltekst:

- statusnotatet for databaseflyten peker paa at `Report.documentId` fortsatt er `0`

Report-laget er derfor sterkt som **strukturert analyseoversikt**, men svakere som fasit for faktisk dokumenttilgjengelighet.

---

## 5. Lastet ned vs. bare kartlagt

### 5.1 SourceDoc: lokal materialisering og nettspor

For `SourceDoc` ser bildet slik ut:

- `64` av `100` har lokal filmatch i repoet
- alle disse matchene er markdown, ikke PDF
- `44` av `100` har URL
- `39` har baade lokal fil og URL
- `25` har lokal fil, men ingen URL
- `5` har URL, men ingen lokal fil
- `31` har verken lokal fil eller URL

Bare `1` `SourceDoc`-URL peker direkte til PDF.

Tolkning:

- `SourceDoc`-laget er godt til a vise hva som er kartlagt og oppsummert
- det er mye svakere som oversikt over hva som faktisk er lastet ned i originalformat
- de `31` oppfoeringene uten lokal fil og uten URL er de tydeligste metadatahullene i source-laget

### 5.2 Thesis: relativt god materialisering

For `Thesis`-laget ser bildet slik ut:

- `30` av `31` har lokal filmatch
- `30` har lokal markdown
- `7` har lokal PDF
- `13` har URL
- `10` har direkte PDF-URL
- `13` har baade lokal fil og URL
- `17` har lokal fil uten URL
- `1` har verken lokal filmatch eller URL

Tolkning:

- thesis-laget er mer komplett enn source-laget
- det fungerer allerede som en god bro mellom kartlagt litteratur, lokal oppsummering og delvis original fulltekst
- det finnes fortsatt ett klart metadatahull som boer fylles

### 5.3 Report: strukturert, men ikke fulltekst-forankret nok

For `Report`-laget:

- `11` av `61` har `sourceUrl`
- `6` av disse peker direkte til PDF
- `50` mangler `sourceUrl`

Det finnes noen tydelige lokale overlapp med `bibliotek/` og `evidence-pack/`, men siden rapportene fortsatt ikke er koblet systematisk til `Document`, boer ikke dette laget brukes alene for a si hvor mye som er "lastet ned".

Praktisk betyr dette:

- report-laget forteller godt **hva som er viktig**
- det forteller forelopig svakere **hvor fullteksten faktisk bor**

---

## 6. Hvor mye er tilgjengelig paa nett

Ser vi paa de tre typed lagene samlet, men uten aa late som de er dedupliserte, faar vi:

- `68` URL-referanser totalt
- `59` unike URL-er
- `16` unike direkte PDF-URL-er

Fordelt per lag:

- `SourceDoc`: `44` URL-er, men bare `1` direkte PDF-URL
- `Thesis`: `13` URL-er, `10` direkte PDF-URL-er
- `Report`: `11` URL-er, `6` direkte PDF-URL-er

Dette peker mot et viktig skille:

1. **kilder som er nettforankret, men ikke noedvendigvis fulltekst-direkte**
   - typisk landingssider, institusjonssider, publikasjonssamlinger

2. **kilder som har direkte nedlastbar PDF paa nett**
   - sterkeste formen for ekstern tilgjengelighet i materialregnskapet

De viktigste vertene i URL-laget er:

- `konkurransetilsynet.no`
- `regjeringen.no`
- `nhh.no`
- `openaccess.nhh.no`
- `beccle.no`
- `konkurrensverket.se`

Dette er i praksis et godt tegn: mye av nettlaget peker mot relativt stabile myndighets-, universitets- og institusjonsdomener.

---

## 7. Hva vi faktisk har, hva vi har kartlagt, og hva som mangler

### 7.1 Det vi faktisk har godt paa plass

- et stort lokalt markdown-korpus
- et tydelig `evidence-pack/` med nedlastede PDF-er
- et omfattende `SourceDoc`-register
- et relativt godt materialisert thesis-lag
- et strukturert report-lag

### 7.2 Det vi har kartlagt, men ikke alltid materialisert

- mange `SourceDoc`-oppfoeringer er kartlagt som metadata eller markdown-notater, men ikke som lokale originalfiler
- report-laget beskriver viktige dokumenter, men er ikke godt nok koblet til fulltekst
- flere nettkilder finnes som URL, men ikke som lokal PDF eller eksplisitt cached fulltekst

### 7.3 De viktigste hullene akkurat naa

1. `SourceDoc` blander interne arbeidsdokumenter, oppsummeringer og eksterne kilder i samme register
2. originalformat og oppsummeringsformat er ikke tydelig skilt
3. `Report` er fortsatt for svakt koblet til `Document`
4. nett-tilgjengelighet er ofte registrert som URL, men ikke klassifisert som:
   - landingsside
   - fulltekst HTML
   - direkte PDF
   - arkivert lokalt
5. `31` `SourceDoc`-oppfoeringer mangler baade lokal fil og URL og boer ryddes
6. den operative nedlastingsrestansen er naa i praksis redusert til versjonsoppfoelging, ikke manglende fulltekst:
   - eventuell `2024/2025`-arsrapport fra `Food Market Ombudsman / FCCA`, siden siste offentlig tilgjengelige PDF som ble funnet var `2023`
   - eventuell senere deduplisering av legacy-filen `dk-salling-coop-decision-2025.pdf` mot hovedkopien

---

## 8. Anbefalt neste grep

Den mest naturlige neste oppryddingen er aa innfoere et eksplisitt tilgjengelighetsregnskap per dokument.

Minste nyttige felter vil vaere:

- `availabilityStatus`
  - `local_pdf`
  - `local_markdown`
  - `web_pdf`
  - `web_html`
  - `metadata_only`
  - `missing`

- `downloadStatus`
  - `downloaded`
  - `not_downloaded`
  - `internal_only`

- `canonicalFileType`
  - `pdf`
  - `markdown`
  - `html`
  - `dataset`
  - `mixed`

Deretter boer tre konkrete ryddejobber prioriteres:

1. backfill `url` og tilgjengelighetsstatus paa `SourceDoc`
2. koble `Report` systematisk til `Document`
3. skille tydeligere mellom:
   - originalkilde
   - lokal oppsummering
   - evidence-pack-PDF

---

## 9. Sluttvurdering

Prosjektet har allerede et stort og seriost dokumentgrunnlag, men det er lettere aa se **at noe er kartlagt** enn aa se **om originaldokumentet faktisk er lokalt, paa nett eller bare nevnt i metadata**.

Det viktigste funnet i denne kartleggingen er derfor:

- dokumentkorpuset er sterkt
- PDF-arkivet er mye mindre enn markdown-korpuset
- thesis-laget er relativt modent
- source-laget er nyttig, men blandet
- report-laget er fortsatt mer analytisk enn arkivmessig

Neste modenhetssteg boer derfor ikke bare vaere "mer research", men et mer eksplisitt system for dokumenttilgjengelighet, filtype og provenance.
