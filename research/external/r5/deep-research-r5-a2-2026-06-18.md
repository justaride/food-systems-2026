---
tittel: G-R5-A2 — Konsentrasjon x foravhengighet til claim-lock
status: Datasok v0.1 — uavhengig markedsestimat funnet; fersk primar per produsent mangler/B
eier: Gabriel
dato: 2026-06-18
scope: >
  Konvertering av FORST-R4-17 fra forstaelse til siterbar underlagspakke. Malet er a skille
  claim-lockbare primar-/uavhengige tall fra aktorrapporterte eller ikke-publiserte markedsandeler
  i norsk laksefor.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde5-dybdeplan-codex-2026-06-18.md
  - research/forstaelse/forstaelse-r4-17-2026-06-18.md
  - research/external/r4/DRO-R4-AKTORGATE-MARKORER-2026-06-18.md
  - docs/project/analysis/case-avsjekk/avsjekk-08-for-import-sjomatfor-2026-06-17.md
bruksregel: >
  Denne fila apner ikke claim alene. Claimbar kjerne er: norsk laksefor er importavhengig, og
  markedet er konsentrert rundt fire store forprodusenter. Eksakte og ferske markedsandeler per
  produsent ma merkes datert/uavhengig estimat eller B/aktor-gate inntil primarkilde foreligger.
---

# G-R5-A2 — Konsentrasjon x foravhengighet til claim-lock

## Kort dom

**FORST-R4-17 kan lofte en avgrenset claim-lockbar kjerne, men ikke hele strukturhypotesen som fakta.**

Det claimbare er:

1. Norsk laksefor er sterkt importavhengig: Nofima/FHF 2020 oppgir at **91,7-92 %** av ingrediensene var importert, og at 1 976 709 tonn ingredienser ble brukt til 1 467 655 tonn laks.
2. Forskningen bygger pa data fra **de fire store norske forselskapene: BioMar AS, Cargill, Mowi Feed AS og Skretting AS**.
3. Menon Economics (2019) tallfester havbruksdelen som et konsentrert marked: Skretting 30 %, BioMar 26 %, EWOS/Cargill 24 %, Mowi 19 %, og de fire samlet 99 % av norsk fiskeformarked.

Det som **ikke** er claim-lockbart uten forbehold:

- Ferske, arsspesifikke markedsandeler per produsent (2024/2025) fra norsk tilsyn/primarkilde ble ikke funnet.
- Skretting "~40 %" fra korpus er derfor ikke oppgradert; det avviker ogsa fra Menon 2019 (30 %) og ma holdes som aktor-/sekundaropplysning.
- Den bredere hypotesen "markedsmakt og importsarbarhet er to sider av samme struktur" er fortsatt en analyse/forstaelse. Den kan bygges pa tallene, men ikke formuleres som eksternt dokumentert kausalitet.

---

## Datatabell

Kolonner iht. R5-mandat: `metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet`.

| metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Foringredienser brukt i norsk lakseproduksjon | 1 976 709 | tonn ingredienser, vatvekt | 2020 | Norge, laks | Ressursregnskap, bransjedata fra de fire store forselskapene + offentlig produksjonsstatistikk | Nofima / FHF | https://nofima.no/publikasjon/2047578/ | web linje 21 | Fagfellevurdert artikkel / primar forskningsdata |
| Lakseproduksjon i samme ressursregnskap | 1 467 655 | tonn laks | 2020 | Norge | Ressursregnskap | Nofima / FHF | https://nofima.no/publikasjon/2047578/ | web linje 21 | Fagfellevurdert artikkel / primar forskningsdata |
| Importandel av foringredienser | 91,7 | prosent | 2020 | Norge, laks | Nofima artikkel, norsk marine protein/olje = 8,3 %, resten importert | Nofima | https://nofima.no/publikasjon/2047578/ | web linje 22 | Fagfellevurdert artikkel |
| Importandel av foringredienser | 92 | prosent | 2020 | Norge, laks og regnbueorret | FHF sluttrapport-sammendrag, avrundet | FHF / Nofima | https://www.fhf.no/prosjekter/prosjektbasen/901604/ | web linje 91-96 | Prosjekt-/forskningsrapport, avrundet |
| Fire store norske forselskaper som dataleverandorer | 4 | selskaper | 2020 | Norge | FHF oppgir datakilde for forbruk av formidler | FHF / Nofima | https://www.fhf.no/prosjekter/prosjektbasen/901604/ | web linje 91 | Primar forskningsrapport; selskapslisten er eksplisitt |
| Selskapene i ressursregnskapet | BioMar AS; Cargill; Mowi Feed AS; Skretting AS | navn | 2020 | Norge | Direkte oppgitt i FHF-sammendrag | FHF / Nofima | https://www.fhf.no/prosjekter/prosjektbasen/901604/ | web linje 91 | Primar forskningsrapport |
| Fire forprodusenters samlede andel av norsk fiskefor | 99 | prosent | 2019 | Norge, havbruk/fiskefor | Uavhengig markedsanalyse | Menon Economics | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28, web tekst linje 473-477; screenshot viser selskapstabell | Uavhengig sekundar, datert; ikke primar |
| Skretting markedsandel | 30 | prosent | 2019 | Norge, havbruk/fiskefor | Menon-tabell | Menon Economics | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28, screenshot `turn6view0` | Uavhengig sekundar, datert |
| BioMar markedsandel | 26 | prosent | 2019 | Norge, havbruk/fiskefor | Menon-tabell | Menon Economics | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28, screenshot `turn6view0` | Uavhengig sekundar, datert |
| EWOS/Cargill markedsandel | 24 | prosent | 2019 | Norge, havbruk/fiskefor | Menon-tabell | Menon Economics | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28, screenshot `turn6view0` | Uavhengig sekundar, datert |
| Mowi markedsandel | 19 | prosent | 2019 | Norge, havbruk/fiskefor | Menon-tabell | Menon Economics | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28, screenshot `turn6view0` | Uavhengig sekundar, datert |
| Skretting "~40 %" |  | prosent | 2026-korpus | Norge, laksefor | Aktor-/sekundaropplysning i internt aktorkart, ikke primarverifisert | Internt korpus | research/interviews/nordisk-aktorkart-perplexity-2026.md | linje 157 | **B / hold ute av claim-lock** |
| Fersk 2024/2025 markedsandel per produsent fra Konkurransetilsynet/Menon/SSB |  | prosent | 2024/2025 | Norge | Ikke funnet i apent sok |  |  | Tom celle | B/C: aktor-/tilsynsdata mangler offentlig |

---

## Sok og kildevurdering

### Primar/naer-primar som bar claimbar kjerne

- **Nofima / Aquaculture Reports 2022** er fagfellevurdert og tallfester 2020-ressursregnskapet for hele norsk lakseproduksjon.
- **FHF prosjekt 901604** oppgir eksplisitt metode: produksjonsvolum fra Fiskeridirektoratet/SSB, og fôrmiddeldata fra BioMar AS, Cargill, Mowi Feed AS og Skretting AS.

Disse kildene gir ikke per-produsent markedsandeler, men de bekrefter at de fire selskapene er riktig populasjon for norsk laksefor i ressursregnskapet.

### Uavhengig markedsandel

Menon Economics (2019) er beste funn for uavhengig tallfesting per produsent. Rapporten er ikke primarstatistikk og gir ikke synlig kildefotnote pa akkurat markedsandelsfiguren. Den er likevel en navngitt uavhengig markedsanalyse og kan brukes som datert, citable-with-note estimat:

| selskap | Menon 2019 andel |
|---|---:|
| Skretting | 30 % |
| BioMar | 26 % |
| EWOS/Cargill | 24 % |
| Mowi | 19 % |
| Sum | 99 % |

### Negative sok

Sok etter `site:konkurransetilsynet.no laksefor Skretting BioMar Cargill Mowi Feed markedsandel`, `site:menon.no laksefor formarkedsandel`, og generelle sok etter norsk laksefor-markedsandel fant ingen fersk tilsyns-/primarkildeserie per produsent. Treffene var enten sekundare markedsartikler, selskapssider, eller Nofima/FHF-ressursregnskap uten per-produsent split.

---

## Kildeledger

| # | kilde | type | URL | locator | bruk |
|---|---|---|---|---|---|
| 1 | Aas, Asgard & Ytrestoyl (2022), "Utilization of feed resources..." | Fagfellevurdert artikkel | https://nofima.no/publikasjon/2047578/ | web linje 20-23 | 2020 importandel, total ingrediensmengde, produksjonsvolum |
| 2 | FHF prosjekt 901604, "Ressursregnskap for forråvarer..." | Prosjekt-/forskningsrapport | https://www.fhf.no/prosjekter/prosjektbasen/901604/ | web linje 89-96 | Metode og fire forselskaper |
| 3 | Nofima nyhet "Laksefor er sa smatt i omstilling" | Forskningsformidling | https://nofima.no/resultater/laksefor-er-som-smatt-i-omstilling/ | web linje 63-65 | Krysskontroll av fire-selskapslisten |
| 4 | Menon Economics (2019), "Markedsanalyse gjærbasert encelleprotein" | Uavhengig markedsanalyse | https://menon.no/uploads/images/2019-110-Markedsanalyse-gj%C3%A6rbasert-encelleprotein.pdf | PDF side 28; web tekst linje 473-488; screenshot `turn6view0` | Markedsandeler og 99 %-sum, datert estimat |
| 5 | FORST-R4-17 | Intern forstaelse | research/forstaelse/forstaelse-r4-17-2026-06-18.md | P1/M1-seksjoner | Hypotese og overclaim-vakter |
| 6 | AASK-R4-004 | Intern aktorgate | research/external/r4/DRO-R4-AKTORGATE-MARKORER-2026-06-18.md | rad AASK-R4-004 | Eksakt Skretting-andel forblir aktorgate |

---

## Tomme celler og B/C-merking

| felt | status | hvorfor |
|---|---|---|
| Fersk markedsandel per produsent 2024/2025 | **B** | Ikke funnet i apen tilsyns-/primarkilde. Sannsynlig selskap/branchedata eller betalt markedsanalyse. |
| Skretting "~40 %" | **B / hold ute** | Internt korpus har tallet, men Menon 2019 viser 30 %. Uten kilde/år bak 40 % skal det ikke claim-lockes. |
| Cargill/EWOS etter navne-/eierendringer | B | Menon 2019 bruker EWOS (eid av Cargill). Fersk Cargill Aqua Nutrition Norge-andel ikke publisert i funnene. |
| Sammenheng markedsmakt -> importsarbarhet | Forstaelse | Tallene stotter en strukturhypotese, men dokumenterer ikke kausalitet. |
| Konkurransetilsynet-serie for fiskefor | C per apent sok | Ingen offentlig serie funnet; dette kan endre seg hvis tilsynet publiserer ny sektorrapport. |

---

## Adversariell verifikasjon

1. **Kildeklasse:** Nofima/FHF er sterk for importandel og fire-selskaps-populasjon, men gir ikke per-produsent markedsandeler. Menon gir markedsandeler, men er sekundar/uavhengig og datert 2019.
2. **Aritmetikk:** Menon-andelene summerer `30 + 26 + 24 + 19 = 99`. Dette stemmer med Menons tekst om at de fire samlet star for 99 %.
3. **Konfliktkontroll:** Skretting "~40 %" i FORST-R4-17 er ikke forenlig med Menon 2019 uten ar-/kildeendring. Derfor er det ikke oppgradert.
4. **Overclaim-kontroll:** Ikke skriv at Konkurransetilsynet har verifisert norsk laksefor-HHI eller produsentandeler; ingen slik kilde ble funnet her.
5. **Importavhengighet:** Nofima 91,7 % og FHF 92 % er samme funn med ulik avrunding/populasjonsformulering. Bruk 91,7 % nar presisjon trengs, 92 % som avrundet formidling.
6. **Kausalitet:** "Konsentrasjon x foravhengighet" er en rimelig analytisk kobling, men det eksternt siterbare er bare de to komponentene: importandel og konsentrert fire-aktormarked.

## Beslutning for videre kontrollstakk

- **Løft til claim-lock-kandidat:** importavhengighet 91,7-92 % (2020) og fire store forselskaper som populasjon.
- **Løft med note:** Menon 2019 markedsandeler 30/26/24/19 og 99 % sum, som datert uavhengig estimat.
- **Marker B:** fersk per-produsent markedsandel og Skretting "~40 %".
- **Hold som forstaelse:** strukturlogikken om at markedsmakt og importsarbarhet er "to sider av samme struktur".
