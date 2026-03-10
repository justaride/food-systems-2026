# Kvantitativ dybdeanalyse: Det norske matsystemet

**Dato:** 10. mars 2026
**Metode:** Philip Meyer precision journalism framework
**Status:** Fullstendig kvantitativ analyse

---

## Sammendrag

Denne analysen anvender Philip Meyers presisjonsjournalistikk-rammeverk på det norske matsystemet. Vi tester seks hypoteser mot empiriske data fra SSB prisindekser (132 månedlige observasjoner, 2015–2025), markedskonsentrasjonsdata (3 849 butikker, 14 kjeder, 5 morselskaper), og offentlig tilgjengelige nøkkeltall fra Konkurransetilsynet, Riksrevisjonen og selskapenes årsrapporter.

**Hovedfunn:**
- Markedet er høykonsentrert (HHI 3 438 på morselskap-nivå; topp-3 = 93,4 %)
- Produsentpriser (PPI) har steget 42,7 % siden jan. 2020 vs. konsumpriser (KPI) +32,5 % — en «omvendt gap» som tyder på at verdiekstraksjon skjer gjennom skjulte mekanismer, ikke gjennom synlige prisøkninger
- Juli-effekten: KPI stiger i snitt +3,8 indekspoeng fra juni til juli hvert år, konsistent med sesongbasert marginekspansjon
- Spredningen (PPI−KPI) nådde sitt verste i mars 2023 (−24,3 pts) og er nå i ferd med å smalnes (−10,2 pts i nov. 2025) — men KPI akselererer raskere enn PPI avtar, noe som kan indikere forsinket gjennomslag eller aktiv marginbygging

---

## 1. Datasett og validering

### 1.1 Tilgjengelige datasett

| Datasett | Kilde | Omfang | Kvalitet |
|----------|-------|--------|----------|
| Prisindekser (KPI/PPI) | SSB tabell 03013 / 12462 | 132 mnd obs., jan. 2015 – nov. 2025 | Høy (offisiell statistikk) |
| Markedskonsentrasjon | OSM + bearbeidet | 3 849 butikker, 14 kjeder, 5 morselskaper | Medium-høy (OSM-basert) |
| Kommunedata | SSB + Kartverket | 357 kommuner med befolkning, inntekt, demografi | Høy |
| Finansielle nøkkeltall | Årsrapporter 2024 | NorgesGruppen, Reitan, Coop | Høy (revidert) |
| Handelsvolumer | SSB | Import/eksport 2024 | Høy |
| SSB Landbruk | SSB/Landbruksdirektoratet | Selvforsyning, produksjon 2023–2024 | Høy |
| Logistikkinfrastruktur | Kartlagt | 19 sentrale lagre | Medium |

### 1.2 Datavalidering

**Prisindeks-data:**
- Fullstendighet: 132 av 132 forventede månedlige observasjoner (jan. 2015 – nov. 2025) ✅
- Basår: Jan. 2020 = 100 for begge indekser ✅
- Spread = KPI − PPI (beregnet, konsistent gjennom hele serien) ✅
- Ingen manglende verdier, ingen åpenbare datafeil ✅

**Konsentrasjonsdata:**
- 3 849 butikker fordelt på 14 kjeder og 5 morselskaper ✅
- HHI beregnet korrekt: Σ(s_i²) der s_i er prosentandel ✅
  - Manuell verifikasjon: 48,38² + 27,05² + 17,98² + 6,57² + 0,03² = 2 340,6 + 731,7 + 323,3 + 43,2 + 0,001 ≈ 3 439 ✅ (matcher oppgitt 3 438)
- Gini-koeffisient 0,47 virker rimelig for en skjev kjedefordeling ✅

### 1.3 Identifiserte datamangler

| Mangel | Konsekvens | Mulig løsning |
|--------|------------|---------------|
| Kommunal HHI = 0 (tom) | Kan ikke teste H3 om skala-invariant konsentrasjon | Krever punkt-i-polygon-kobling av butikker til kommuner |
| Historisk butikktelling mangler | Kan ikke teste H10 (bæreevne) over tid | SSB bedriftsregister |
| Faktiske markedsandeler (omsetning) | Butikkandeler ≠ omsetningsandeler (Meny vs Kiwi) | Konkurransetilsynets markedsdata |
| Kontraktvilkår | Skjulte gebyrer ikke observerbare | Kvalitativ forskning / varslerdata |
| Kategori-spesifikk EMV-andel | Kan ikke teste H5 fullstendig | Dagligvaretilsynet / Nielsen |

---

## 2. Deskriptiv statistikk

### 2.1 Prisindeksutvikling (2015–2025)

**KPI (Konsumprisindeks, mat og alkoholfrie drikkevarer):**

| Statistikk | Verdi |
|------------|-------|
| Observasjoner | 132 |
| Minimum | 90,93 (jan. 2015) |
| Maksimum | 136,58 (jul. 2025) |
| Gjennomsnitt | 107,17 |
| Standardavvik | 12,48 |
| Totalvekst (jan. 2015 → nov. 2025) | +45,7 % |
| Vekst siden basår (jan. 2020 → nov. 2025) | +32,5 % |

**PPI (Produsentprisindeks, næringsmidler):**

| Statistikk | Verdi |
|------------|-------|
| Observasjoner | 132 |
| Minimum | 87,91 (jan. 2015) |
| Maksimum | 142,69 (aug./nov. 2025) |
| Gjennomsnitt | 111,27 |
| Standardavvik | 18,87 |
| Totalvekst (jan. 2015 → nov. 2025) | +62,3 % |
| Vekst siden basår (jan. 2020 → nov. 2025) | +42,7 % |

**Spread (KPI − PPI):**

| Statistikk | Verdi |
|------------|-------|
| Gjennomsnitt | −4,10 |
| Standardavvik | 8,85 |
| Minimum (verste gap) | −24,28 (mar. 2023) |
| Maksimum | +5,55 (jul. 2015) |
| Nåværende (nov. 2025) | −10,23 |

### 2.2 Spread etter år (gjennomsnittlig KPI − PPI)

| År | Gj.snitt spread | Fase |
|----|-----------------|------|
| 2015 | +3,44 | Pre-krise likevekt |
| 2016 | +1,85 | Pre-krise likevekt |
| 2017 | +1,26 | Pre-krise likevekt |
| 2018 | +1,99 | Pre-krise likevekt |
| 2019 | +0,54 | Overgang |
| 2020 | +0,62 | Pandemi-sjokk |
| 2021 | −4,58 | Divergens begynner |
| 2022 | −13,96 | Gapet åpner seg |
| 2023 | −17,99 | Maksimalt gap |
| 2024 | −15,73 | Delvis konvergens |
| 2025 | −10,80 | Innsmalning pågår |

### 2.3 Markedsstruktur

**Morselskaper (etter butikkandel):**

| Morselskap | Butikker | Andel (%) | Andel² |
|------------|----------|-----------|--------|
| NorgesGruppen | 1 862 | 48,38 | 2 340,6 |
| Coop Norge | 1 041 | 27,05 | 731,7 |
| Reitangruppen | 692 | 17,98 | 323,3 |
| Bunnpris AS | 253 | 6,57 | 43,2 |
| Andre | 1 | 0,03 | 0,0 |
| **Totalt** | **3 849** | **100** | **HHI = 3 438** |

**Kjedefordeling (topp 10 av 14):**

| Rang | Kjede | Butikker | Andel (%) | Morselskap |
|------|-------|----------|-----------|------------|
| 1 | Kiwi | 726 | 18,86 | NorgesGruppen |
| 2 | Rema 1000 | 692 | 17,98 | Reitangruppen |
| 3 | Extra | 584 | 15,17 | Coop Norge |
| 4 | Joker | 450 | 11,69 | NorgesGruppen |
| 5 | Spar | 289 | 7,51 | NorgesGruppen |
| 6 | Coop Prix | 262 | 6,81 | Coop Norge |
| 7 | Bunnpris | 253 | 6,57 | Bunnpris AS |
| 8 | Meny | 184 | 4,78 | NorgesGruppen |
| 9 | Nærbutikken | 132 | 3,43 | NorgesGruppen |
| 10 | Coop Marked | 97 | 2,52 | Coop Norge |

**Konsentrasjonsmål:**

| Mål | Verdi | Terskel | Vurdering |
|-----|-------|---------|-----------|
| Morselskap HHI | 3 438 | >2 500 = høykonsentrert | **Høykonsentrert** |
| Kjede HHI | 1 241 | 1 000–1 800 = moderat | Moderat |
| Topp-3 morselskapsandel | 93,4 % | >60 % = oligopol | **Triopol** |
| Topp-3 kjedeandel | 52,0 % | — | Lavere enn morselskap pga. intern konkurranse |
| Gini (kjeder) | 0,47 | 0 = lik, 1 = helt ulik | Moderat ulikhet |

### 2.4 Finansielle nøkkeltall (2024)

| Selskap | Omsetning (mrd NOK) | Resultatmargin | Absolutt resultat |
|---------|---------------------|----------------|-------------------|
| NorgesGruppen | 118,0 | 3,3 % | ~3,9 mrd |
| Reitangruppen (NO) | 54,5 | 3,85 % | ~2,1 mrd |
| Coop Norge | 61,0 | 1,0 % | ~0,3 mrd |
| **Sum topp-3** | **233,5** | **2,7 % (veid)** | **~6,3 mrd** |

Til sammenligning: dagligvarebransjens gjennomsnittlige driftsmargin er 1,9 % (Virke).

### 2.5 Selvforsyning og handelsbalanse

| Kategori | Selvforsyningsgrad | Import-avhengighet |
|----------|--------------------|--------------------|
| Kalorier totalt | 44 % | 56 % |
| Kalorier (justert for fôrimport) | 39 % | 61 % |
| Melk | 98 % | 2 % |
| Kjøtt | 96 % | 4 % |
| Poteter | 77 % | 23 % |
| Grønnsaker | 49 % | 51 % |
| Frukt | **4 %** | **96 %** |

**Handelsbalanse (2024):**
- Dagligvareomsetning: 226,8 mrd NOK
- Matimport: 78,7 mrd NOK
- Sjømateksport: 175,4 mrd NOK (2,8 mill. tonn)
- Grensehandel til Sverige: 9,35 mrd NOK

---

## 3. Hypotesetesting

### H1: Butikkfordeling følger Zipfs lov

**Prediksjon:** Rangert etter størrelse bør butikk-/befolkningsfordeling vise lineær sammenheng på log-log-skala med helning ≈ −1.

**Resultater:**

| Test | n | Helning | R² | Zipf? |
|------|---|---------|-----|-------|
| Befolkningsfordeling (kommuner) | 357 | −1,27 | 0,901 | **Ja** |
| Kjedefordeling (butikker) | 14 | −1,60 | 0,535 | Inkonklusivt |

**Tolkning:**
- **Befolkning: STØTTET.** R² = 0,90 er utmerket. Helningen −1,27 er noe brattere enn ren Zipf (−1,0), noe som indikerer at Norges befolkningsfordeling er noe mer konsentrert enn teori tilsier — Oslo er relativt sett «for stor» eller de minste kommunene «for små».
- **Kjeder: INKONKLUSIVT.** Med kun 14 observasjoner er R² = 0,54 for svakt. Helningen −1,60 (betydelig brattere enn −1,0) antyder høyere konsentrasjon enn naturlig selvorganisering ville produsert, men utvalget er for lite til å trekke sikre konklusjoner.

**Metodisk begrensning:** Zipf-test på kjedenivå er statistisk svak fordi n = 14. Testen har større verdi på kommunenivå (n = 357) der den bekrefter at Norges bosettingsmønster følger forventet mønster.

### H2: Topp-3 morselskaper kontrollerer > 90 % av markedet

**Prediksjon:** Tre morselskaper kontrollerer mer enn 90 % av butikkene.

**Resultat:**
- NorgesGruppen: 48,38 %
- Coop Norge: 27,05 %
- Reitangruppen: 17,98 %
- **Sum: 93,41 %**

**Vurdering: STØTTET.** Mer ekstremt enn standard Pareto (80/20). Tre selskaper kontrollerer 93,4 % av 3 849 butikker. Den fjerde aktøren (Bunnpris) har kun 6,6 %, og resten er tilnærmet null.

**Implikasjon:** Markedet fungerer som et triopol med en fringe-aktør. Bunnpris' 253 butikker, konsentrert i Midt-Norge, er den eneste gjenværende konkurrenten av noen størrelse.

### H3: HHI > 2 500 (høykonsentrert marked)

**Prediksjon:** Herfindahl-Hirschman-indeksen på morselskapsnivå overstiger DOJ/FTCs terskel for høykonsentrerte markeder.

**Resultat:**
- Morselskap HHI: **3 438**
- DOJ/FTC-terskel: 2 500

**Vurdering: STØTTET.** Markedet er entydig høykonsentrert. HHI på 3 438 er 37,5 % over terskelen. Til sammenligning: HHI for et perfekt triopol med like andeler ville vært 3 333 (33,3² × 3). Norges faktiske HHI er høyere fordi NorgesGruppen alene har nesten halvparten.

**Kontekst:** Kjede-HHI er kun 1 241 (moderat), noe som reflekterer intern konkurranse mellom kjeder innen samme konsern (Kiwi vs. Meny vs. Joker under NorgesGruppen). Men denne intra-konsern «konkurransen» er illusorisk — strategiske beslutninger om innkjøp, logistikk og prising koordineres på morselskapsnivå.

### H-NY1: Asymmetrisk pristransmisjon (PPI → KPI)

**Prediksjon:** Når PPI stiger, følger KPI etter med forsinkelse (ufullstendig gjennomslag). Når PPI faller/stabiliserer seg, faller ikke KPI tilsvarende — en klassisk «rockets and feathers»-dynamikk.

**Analyse: PPI-KPI-gapet i fem faser**

| Fase | Periode | Gj.snitt spread | Dynamikk |
|------|---------|-----------------|----------|
| 1. Pre-krise likevekt | 2015–2019 | +1,82 | KPI > PPI; normalt marginnivå |
| 2. Pandemisjokk | 2020 | +0,62 | Midlertidig prispress, hamstring |
| 3. Divergens | 2021 | −4,58 | PPI akselererer på energi/råvarer; KPI henger etter |
| 4. Maksimalt gap | 2022–2023 | −15,98 | PPI +42,7 % vs KPI +32,5 %; produsentene absorberer |
| 5. Innsmalning | 2024–2025 | −13,27 | PPI stabiliserer; KPI akselererer → margin catchup |

**Nøkkelobservasjon — Fase 5 er kritisk:**
- PPI-vekst (des. 2023 → nov. 2025): +3,3 % (avtagende)
- KPI-vekst (des. 2023 → nov. 2025): +11,3 % (akselererende)

KPI stiger nå tre ganger raskere enn PPI. To mulige tolkninger:

1. **Forsinket gjennomslag (uskyldig):** Detaljistene implementerer forsinkede kostøkninger som allerede var absorbert
2. **Marginbygging (bekymringsverdig):** Detaljistene utnytter at forbrukerne har «vant seg til» høye priser og øker marginene aktivt

**Data støtter begge**, men Konkurransetilsynets funn om «significantly higher than expected profitability» (mai 2024) peker mot tolkning 2.

**Vurdering: STØTTET** — asymmetrisk pristransmisjon er tydelig. KPI steg langsommere enn PPI på vei opp (2021–2023) og faller ikke selv om PPI-veksten avtar (2024–2025). Klassisk rockets and feathers.

### H-NY2: Sesongbasert marginekspansjon (juli-effekten)

**Prediksjon:** KPI viser konsistente sesongtopper om sommeren (særlig juli) som ikke kan forklares av PPI-bevegelser alene, noe som tyder på sesongbasert marginøkning.

**Analyse: Juli-premien (KPI-endring juni → juli)**

| År | KPI juni | KPI juli | Δ KPI | PPI juni | PPI juli | Δ PPI | Margin-gap |
|----|----------|----------|-------|----------|----------|-------|------------|
| 2015 | 94,20 | 95,98 | +1,78 | 89,48 | 90,43 | +0,95 | +0,83 |
| 2016 | 96,45 | 99,25 | +2,80 | 94,53 | 95,37 | +0,84 | +1,96 |
| 2017 | 97,29 | 99,91 | +2,62 | 94,64 | 95,27 | +0,63 | +1,99 |
| 2018 | 97,66 | 101,22 | +3,56 | 96,64 | 96,11 | −0,53 | +4,09 |
| 2019 | 98,88 | 102,99 | +4,11 | 98,11 | 98,84 | +0,73 | +3,38 |
| 2020 | 101,87 | 105,24 | +3,37 | 102,63 | 103,36 | +0,73 | +2,64 |
| 2021 | 100,09 | 102,34 | +2,25 | 103,68 | 105,57 | +1,89 | +0,36 |
| 2022 | 105,05 | 113,00 | +7,95 | 118,93 | 125,66 | +6,73 | +1,22 |
| 2023 | 119,18 | 123,01 | +3,83 | 135,54 | 137,01 | +1,47 | +2,36 |
| 2024 | 124,98 | 129,00 | +4,02 | 138,38 | 139,33 | +0,95 | +3,07 |
| 2025 | 130,87 | 136,58 | +5,71 | 141,11 | 142,59 | +1,48 | +4,23 |

**Gjennomsnittlig juli-premie:** +3,82 KPI-poeng (vs. +1,40 PPI-poeng)
**Gjennomsnittlig «margin-gap» (KPI-økning minus PPI-økning):** +2,38 indekspoeng

**Desember-dip (KPI november → desember):**
Gjennomsnittlig: −2,18 KPI-poeng

**Vurdering: STØTTET.** Juli-KPI-premium er konsistent over hele perioden (11/11 år med positiv premie). Det at KPI-økningen konsekvent overstiger PPI-økningen med i snitt 2,4 poeng antyder at noe utover rene kostnadsøkninger driver prisene opp om sommeren. Mulige forklaringer:
- Sesongvarer (bær, frukt) med høy margin
- Feriesesong med endret forbruksmiks mot premium-produkter
- Lavere prisbevissthet i feriemodus

**Trenden er stigende:** Margin-gapet i juli var 0,83 i 2015 og 4,23 i 2025 — en femdobling. Korrelerer dette med økt markedskonsentrasjon og prisingsalgoritmer?

---

## 4. Tidsserieanalyse av PPI-KPI-spredningen

### 4.1 Dekomponering

**Trend:** Spread beveger seg fra stabilt positivt (+1,8 i 2015–2019) gjennom et negativt sjokk (−18,0 i 2023) og tilbake mot et nytt likevektsnivå (estimert −8 til −10).

**Syklisk komponent:** Spreaden har en tydelig 12-måneders syklus drevet av sesongvariasjoner i KPI (juli-topp, desember-bunn) som ikke korresponderer med PPI-sesong.

**Infleksjons­punkter:**
1. **Sep. 2019 → jan. 2020:** Spread krysser null for siste gang som «normalt positivt»
2. **Sep. 2021:** Spread passerer −6,3 — entydig negativ trend etablert
3. **Mar. 2023:** Bunnen nådd ved −24,3 — maksimal «produsentsmerte»
4. **Jul. 2025:** Spread smalner til −6,0 — smaleste siden aug. 2021

### 4.2 Årsbasert PPI-KPI-veksttakt

| Periode | KPI-vekst | PPI-vekst | Gap (KPI − PPI) |
|---------|-----------|-----------|-----------------|
| 2020 → 2021 | −1,9 % | +9,5 % | −11,4 pp |
| 2021 → 2022 | +10,3 % | +20,0 % | −9,7 pp |
| 2022 → 2023 | +8,9 % | +5,5 % | +3,4 pp |
| 2023 → 2024 | +4,0 % | +1,5 % | +2,5 pp |
| 2024 → 2025* | +7,0 % | +1,7 % | +5,3 pp |

*2025: beregnet des. 2024 → nov. 2025

**Kritisk funn:** Siden 2023 vokser KPI raskere enn PPI. Detaljistene henter igjen gapet — men overskyteren kan indikere netto marginekspansjon. I 2025 vokser KPI fire ganger raskere enn PPI.

### 4.3 Kumulativ divergens

Total kumulativ «produsenttap» (periode der PPI > KPI):
- Varte fra ~sep. 2019 til pågående (75+ måneder)
- Maksimal divergens: PPI 24,3 indekspoeng over KPI (mar. 2023)
- Nåværende divergens: PPI 10,2 indekspoeng over KPI (nov. 2025)

Denne langvarige perioden der produsentprisene ligger over konsumprisene betyr at enten:
1. Produsenter har absorbert en kolossal kostøkning som ikke er fullt overført til forbrukere
2. Verdikjeden mellom produsent og forbruker (grossist, logistikk, detaljist) komprimerer marginene
3. Sammensetningseffekter gjør indeksene ikke direkte sammenlignbare

Alle tre er sannsynligvis delvis sanne. Konkurransetilsynets 2024-funn om «higher than expected profitability» antyder at tolkning 2 gjelder i begrenset grad, mens «skjulte gebyrer»-mekanismen (Nordstad-tesen) betyr at synlige marginer underestimerer reell verdiekstraksjon.

---

## 5. Tverrsnittsanalyse: Markedsstruktur

### 5.1 NorgesGruppen-dominans

NorgesGruppen kontrollerer 5 av 14 kjeder:

| Kjede | Butikker | Andel av NorgesGruppen | Segment |
|-------|----------|------------------------|---------|
| Kiwi | 726 | 39,0 % | Lavpris |
| Joker | 450 | 24,2 % | Nærbutikk |
| Spar | 289 | 15,5 % | Supermarked |
| Meny | 184 | 9,9 % | Premium |
| Nærbutikken | 132 | 7,1 % | Nærbutikk |
| **Totalt** | **1 862** | **100 %** | — |

NorgesGruppen har strategisk dekning over alle markedssegmenter. Kiwi (lavpris) og Meny (premium) gir «prisanker» i begge ender, mens Joker og Nærbutikken dekker distriktene.

### 5.2 Lorenzkurve og Gini

**Kjedefordeling (14 kjeder):**
- Gini = 0,47
- De 7 nederste kjedene (50 %) kontrollerer 20,6 % av butikkene
- De 3 øverste kjedene (21 %) kontrollerer 52,0 % av butikkene

**Morselskapsfordeling (5 selskaper):**
- De facto Gini ≈ 0,56 (estimert fra andeler)
- 1 selskap (20 %) kontrollerer 48,4 % av butikkene

### 5.3 Logistikkstruktur som barriere

| Nettverk | Eier | Sentrallager | Regionale sentre | Betjener |
|----------|------|--------------|------------------|----------|
| ASKO | NorgesGruppen | Vestby (100 000 m²) | 13 | ~1 862 butikker |
| Rema Distribusjon | Reitangruppen | Vinterbro (70 000 m²) | 6 | 692 butikker |
| C-Log | Coop Norge | Gardermoen (84 000 m²) | 1 | ~1 041 butikker |

**Samlet lagerkapasitet topp-3:** >254 000 m² sentrallager + 20 regionale sentre

Bunnpris (253 butikker) har egen distribusjon i begrenset skala. Enhver ny aktør må bygge eller kjøpe seg tilgang til sammenlignbar infrastruktur — en etableringsbarriere på flere milliarder NOK.

---

## 6. Sammenstilling: Styrken i bevisene

### 6.1 Hypotesestatus

| ID | Hypotese | Resultat | Konfidens | Nøkkelbevis |
|----|----------|----------|-----------|-------------|
| H1 | Befolkningsfordeling følger Zipf | **STØTTET** | Høy | R² = 0,901, n = 357 |
| H1b | Kjedefordeling følger Zipf | Inkonklusivt | Lav | R² = 0,535, n = 14 (for lite utvalg) |
| H2 | Topp-3 morselskaper > 90 % | **STØTTET** | Høy | 93,4 % faktisk |
| H3 | HHI > 2 500 | **STØTTET** | Høy | HHI = 3 438 |
| H-NY1 | Asymmetrisk pristransmisjon | **STØTTET** | Medium-høy | KPI vokser 4× raskere enn PPI i 2025 |
| H-NY2 | Sesongbasert marginekspansjon (juli) | **STØTTET** | Medium | 11/11 år med juli-premie; stigende trend |
| H7 | Tre-spiller attraktortilstand | **KONSISTENT** | Medium | 25+ år med stabilitet |
| H9 | Trofisk verdiekstraksjon | **KONSISTENT** | Medium | PPI > KPI siden 2019; skjulte gebyrer |

### 6.2 Samlet kvantitativt bilde

Det norske dagligvaremarkedet viser:

1. **Ekstrem konsentrasjon** — HHI 3 438, topp-3 = 93,4 %, funksjonelt triopol
2. **Asymmetrisk pristransmisjon** — produsenter absorberer kostnadsøkninger raskere enn de overføres til forbrukere, men forbrukerprisene faller ikke når produsentprisene stabiliserer seg
3. **Sesongbasert marginmulighet** — juli-premien har femdoblet seg over 10 år (0,83 → 4,23 poeng)
4. **Infrastrukturbarriere** — tre lukkede logistikknettverk betjener 93 % av butikkene; ny aktør trenger mrd-investering
5. **Kritisk importavhengighet** — 44 % kalorisk selvforsyning, 96 % fruktimport, 56 % total kalorikavhengighet

---

## 7. Metodologi

### 7.1 Datakilder med tilgangsdatoer

| Kilde | Data | Tilgang | Oppdatering |
|-------|------|---------|-------------|
| SSB tabell 03013 | KPI matvarer | Bearbeidet CSV, des. 2025 | Månedlig |
| SSB tabell 12462 | PPI næringsmidler | Bearbeidet CSV, des. 2025 | Månedlig |
| OpenStreetMap via Overpass | Butikklokasjoner | JSON, des. 2025 | Løpende |
| NorgesGruppen årsrapport 2024 | Finansielle nøkkeltall | PDF, 2025 | Årlig |
| Reitangruppen årsrapport 2024 | Finansielle nøkkeltall | PDF, 2025 | Årlig |
| Coop Norge årsrapport 2024 | Finansielle nøkkeltall | PDF, 2025 | Årlig |
| Konkurransetilsynet | Prisjeger-vedtak; markedsstudie 2024 | Offentlig, 2024 | Ad hoc |
| Riksrevisjonen | Matsikkerhet og beredskap | Offentlig, okt. 2023 | Ad hoc |
| SSB / Landbruksdirektoratet | Selvforsyningsgrad, produksjon | JSON, 2024 | Årlig |

### 7.2 Definisjoner

| Begrep | Definisjon | Operasjonalisering |
|--------|------------|---------------------|
| HHI | Herfindahl-Hirschman-indeks | Σ(s_i²) der s_i er markedsandel i prosent; skala 0–10 000 |
| KPI (mat) | Konsumprisindeks, matvarer og alkoholfrie drikkevarer | SSB tabell 03013, rebasert til jan. 2020 = 100 |
| PPI (mat) | Produsentprisindeks, næringsmiddelindustri | SSB tabell 12462, rebasert til jan. 2020 = 100 |
| Spread | KPI − PPI | Positivt = detaljistmargin over produksjonskost; negativt = produsent absorberer mer |
| Selvforsyningsgrad | Andel av kaloriforbruk dekket av norsk produksjon | SSB/NIBIO offisielle beregninger |
| Juli-premie | KPI(juli) − KPI(juni) i et gitt år | Beregnet fra månedlige indeksdata |
| Margin-gap | (KPI juli − KPI juni) − (PPI juli − PPI juni) | Differanse mellom konsumentpris- og produsentprisendring |

### 7.3 Begrensninger

1. **Butikkandeler ≠ omsetningsandeler.** Analysen bruker antall butikker som proxy for markedsandel. Kiwi (lavpris, høy omsetning per butikk) er underrepresentert vs. Joker (nærbutikk, lav omsetning). Konkurransetilsynets omsetningsbaserte andeler viser NorgesGruppen ~43 %, Coop ~30 %, Reitan ~25 % — noe annerledes enn butikkandeler, men konklusjonen (triopol, HHI > 2 500) endres ikke.

2. **OSM-data er crowdsourced.** Butikklokasjoner fra OpenStreetMap kan ha feil — stengte butikker som fortsatt er registrert, nye butikker som mangler. Kvaliteten er generelt god for Norge, men systematisk bias mot urbane områder er mulig.

3. **Prisindekskomposisjon.** KPI og PPI måler forskjellige varekurver. KPI inkluderer all mat (inkl. importvarer, ferdigmat), mens PPI fokuserer på norskproduserte næringsmidler. Direkte sammenligning er derfor en tilnærming, ikke en eksakt margin-beregning.

4. **Manglende kommunal HHI.** Punkt-i-polygon-kobling av butikker til kommuner er ikke utført, noe som forhindrer testing av hypotese H3 (skala-invarians) på lokalt nivå.

5. **Skjulte gebyrer er uobserverbare.** «Fellesmarkedsføringsavgifter», «hylleplass-gebyrer» og «logistikkrabatter» fanges ikke opp i verken KPI eller PPI. Den reelle verdiekstraksjonen er sannsynligvis større enn hva synlige prisdata viser.

### 7.4 Hva vi ekskluderte og hvorfor

- **Netthandel (Oda):** < 2 % markedsandel, ikke representert i OSM-data. Ekskludert for å unngå støy.
- **Storkjøkken/HoReCa:** Utenfor dagligvaredefinisjonen. Remas Kolly-ekspansjon nevnes i kvalitativ analyse.
- **Taxfree/grensehandel:** Inkludert som kontekst (9,35 mrd NOK), men ikke i prisindeks-analysen.

### 7.5 Verifisering

- HHI er manuelt kryssverifisert mot beregning fra individuelle andeler ✅
- Prisindeks-totaler er verifisert mot SSB-tabeller ✅
- Finansielle nøkkeltall er verifisert mot selskapenes publiserte årsrapporter ✅
- Selvforsyningsgrader er verifisert mot Landbruksdirektoratets offisielle tall ✅

---

## 8. Implikasjoner for videre forskning

### 8.1 Prioriterte datainnhentinger

1. **Kommunal HHI:** Kjør punkt-i-polygon-analyse for 3 849 butikker × 357 kommuner
2. **Omsetningsbaserte andeler:** Bruk Konkurransetilsynets data for presis HHI-beregning
3. **Historisk butikktelling:** SSB bedriftsregister for tidsserieanalyse av konsentrasjon
4. **Kategori-EMV:** Dagligvaretilsynets data for å teste EMV-avhengighets-hypotesen

### 8.2 Analytiske utvidelser

1. **Økonometrisk pristransmisjon:** Formell Granger-kausalitetstest og asymmetrisk feiljusteringsmodell (ECM) for PPI → KPI
2. **Dekomponering av juli-effekt:** Separere volumeffekter, komposisjonseffekter og rene priseffekter
3. **Regional variasjon:** Er konsentrasjonen verre i distriktene? (Krever kommunal HHI)
4. **Nordisk sammenligning:** Benchmark norske tall mot DK/SE/FI (se T2)

---

## Vedlegg A: Komplett årsbasert spread-serie

| År | Jan | Feb | Mar | Apr | Mai | Jun | Jul | Aug | Sep | Okt | Nov | Des |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 2015 | 3,0 | 3,5 | 2,0 | 2,4 | 3,3 | 4,7 | 5,6 | 4,3 | 4,7 | 3,5 | 3,8 | 0,5 |
| 2016 | 0,1 | 3,0 | −1,0 | 1,7 | 1,3 | 1,9 | 3,9 | 3,2 | 3,7 | 3,1 | 2,2 | −0,8 |
| 2017 | 0,5 | 1,2 | 0,8 | −1,2 | 1,3 | 2,7 | 4,6 | 1,4 | 1,2 | 1,7 | 1,1 | −0,1 |
| 2018 | 0,8 | 2,5 | 0,1 | 0,2 | 0,4 | 1,0 | 5,1 | 3,4 | 3,0 | 2,2 | 3,7 | 1,6 |
| 2019 | 0,9 | 3,0 | 2,1 | 1,0 | −0,1 | 0,8 | 4,2 | 1,0 | 0,1 | −1,2 | −1,8 | −3,4 |
| 2020 | 0,0 | 1,6 | 1,2 | 0,8 | 0,2 | −0,8 | 1,9 | 1,5 | 1,6 | 1,0 | 0,4 | −2,0 |
| 2021 | −1,0 | 0,4 | −0,7 | −2,6 | −2,9 | −3,6 | −3,2 | −4,9 | −6,3 | −8,7 | −9,9 | −11,4 |
| 2022 | −10,9 | −7,9 | −11,2 | −11,3 | −14,4 | −13,9 | −12,7 | −13,8 | −14,4 | −16,0 | −19,4 | −21,7 |
| 2023 | −21,0 | −20,3 | −24,3 | −21,6 | −19,2 | −16,4 | −14,0 | −14,3 | −14,5 | −14,7 | −16,4 | −19,2 |
| 2024 | −17,1 | −19,6 | −21,9 | −17,9 | −16,5 | −13,4 | −10,3 | −12,1 | −14,7 | −14,7 | −14,0 | −16,5 |
| 2025 | −12,5 | −11,7 | −13,7 | −16,3 | −12,3 | −10,2 | −6,0 | −8,6 | −8,7 | −8,6 | −10,2 | — |

---

## Vedlegg B: Referanser

1. SSB tabell 03013: Konsumprisindeks, etter konsumgruppe. ssb.no/statbank
2. SSB tabell 12462: Produsentprisindeks, etter næring. ssb.no/statbank
3. Konkurransetilsynet (2024). Vedtak om prissamarbeid i dagligvaresektoren, 4,9 mrd NOK
4. Konkurransetilsynet (2024). Dagligvaremarkedet — en markedsstudie
5. Riksrevisjonen (2023). Matsikkerhet og beredskap. Dokument 3:5 (2023–2024)
6. Dagligvaretilsynet (2023). Årsrapport — Lov om god handelsskikk
7. NorgesGruppen ASA (2024). Årsrapport 2024
8. Reitangruppen (2024). Årsrapport 2024
9. Coop Norge SA (2024). Årsrapport 2024
10. Landbruksdirektoratet / SSB (2024). Selvforsyningsgrad og produksjonsstatistikk

---

*Denne analysen er gjennomført som del av Food Systems Transition Group (NCH) innsiktsrapport, mars 2026.*
