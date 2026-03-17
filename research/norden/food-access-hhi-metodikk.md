---
title: Food Access, Food Deserts og Lokal HHI — Nordisk metodikk
date: 2026-03-17
source: Perplexity research, mars 2026
tags: [food-access, HHI, matørkener, GIS, metodikk, nordisk]
---

# Food Access, Food Deserts og Lokal HHI — Nordisk metodikk

## 1. Metodikkkatalog

### 1.1 HHI (Herfindahl-Hirschman Index)

**Formel:** HHI = Σ Si²

Der Si er markedsandelen til aktør i (uttrykt som desimalbrøk eller prosent). Intervall: 0 → 1 (normalisert) eller 0 → 10 000 (prosentkvadrert).

| HHI-verdi | Tolkning |
|---|---|
| < 0.15 / 1 500 | Ukonsentrert |
| 0.15–0.25 / 1 500–2 500 | Moderat konsentrert |
| > 0.25 / 2 500 | Høykonsentrert |
| 1.0 / 10 000 | Monopol |

**Styrker:** Enkel, sammenlignbar, internasjonal standard (DOJ/FTC, EU).
**Svakheter:** Krever nøyaktige markedsandeler per geografisk nivå; sensitiv for markedsavgrensning.

### 1.2 Avstandsbaserte metoder

- **Euklidisk avstand (luftlinje):** Rett linje fra bosted til nærmeste butikk. Enkel å beregne, men ignorerer veinett og topografi.
- **Nettverksavstand:** Beregner korteste vei langs faktisk veinett (OpenStreetMap, NVDB). Mer realistisk i norsk/nordisk terreng med fjorder, fjell og spredt bosetting.
- **Kjøretid/gangtid:** Bruker tidsbasert impedans i stedet for ren avstand. KFST (Danmark) bruker 5 og 10 minutters kjøretid som standard.

### 1.3 Nettverksbuffer-analyse

Beregner serviceareal (isokroner) rundt butikker med definerte tids- eller avstandsterskler. Identifiserer befolkning utenfor alle serviceareal som «food desert»-innbyggere. Krever:
- Butikkregistre med koordinater
- Befolkningsrutenett (100m eller 250m)
- Veinettverksdata

### 1.4 Komposittindekser — PPFI (Priority Places for Food Index)

CDRC (UK) sin PPFI v2.1 kombinerer 7 domener:
1. Butikktilgjengelighet (nærhet, tetthet)
2. Transporttilgjengelighet
3. Husholdningsbarrierer (inntekt, bil-eierskap)
4. Boligsituasjon
5. Helseutfall (kostholdsrelaterte sykdommer)
6. Sosialt nærmiljø
7. Mathandel online tilgjengelighet

**Styrke:** Fanger multidimensjonal deprivasjon, ikke bare avstand.
**Svakhet:** Datakrevende, vanskelig å replikere uten tilsvarende mikrodatainfrastruktur.

### 1.5 Gravitasjonsmodeller — Huff-modellen

**Formel:** Pij = (Sj^α / Dij^β) / Σk(Sk^α / Dik^β)

Der Pij er sannsynligheten for at forbruker i handler i butikk j, Sj er butikkens attraktivitet (areal, sortiment), Dij er avstand/tid, og α/β er kalibrasjonsparametere.

**Bruk:** Estimerer markedsområder og forventet omsetningsfordeling. Brukt av Pipos/Serviceanalys i Sverige.

## 2. Datakilder per land

### 2.1 Norge (NO)

| Kilde | Type | Tilgang |
|---|---|---|
| SSB Statistikkbank | Handelsstatistikk, befolkningsrutenett | Åpen (ssb.no/en/statbank) |
| Geodata AS butikkregister | Geokodet butikkregister med kjedetilhørighet | Kommersiell |
| Konkurransetilsynet | Markedsandeler per kjede (direkte innrapportering) | Offentlig (aggregert) |
| Prognosesenteret | Dagligvaremarkedet, omsetningstall | Kommersiell |
| Kartverket / NVDB | Veinettverksdata for nettverksanalyse | Åpen (CC BY 4.0) |

### 2.2 Sverige (SE)

| Kilde | Type | Tilgang |
|---|---|---|
| Pipos / Serviceanalys (Tillväxtverket) | Butikkregistre, tilgjengelighetsanalyser per kommun | Offentlig sektor |
| SCB handelsområder / bedriftsregister | Sysselsetting og omsetning per bransje | Åpen / delvis begrenset |
| SCB Öppna geodata | Befolkningsrutenett, administrative grenser | Åpen (CC0) |
| Konkurrensverket rapport 2024:4 | Lokal dagligvarekonkurranse, kommuneanalyse | Offentlig |
| DLF (Dagligvaruleverantörers Förbund) | Markedsandeler nasjonalt | Bransjerapport |

### 2.3 Danmark (DK)

| Kilde | Type | Tilgang |
|---|---|---|
| KFST (Konkurrence- og Forbrugerstyrelsen) | Drive-time HHI (5/10 min), fusjonsanalyser | Offentlig |
| Danmarks Statistik | Handelsstatistikk, befolkningsdata | Åpen / delvis begrenset |
| De Samvirkende Købmænd | Butikkoversikt, markedsrapporter | Bransjerapport |
| Salling Group / Coop DK fusjonsanalyser | Detaljerte lokal-HHI-beregninger i fusjonsvedtak | Offentlig (vedtaksdokumenter) |

### 2.4 Finland (FI)

| Kilde | Type | Tilgang |
|---|---|---|
| PTY (Finnish Grocery Trade Association) | Årlig dagligvarestatistikk, markedsandeler | Åpen (pty.fi) |
| Statistics Finland (Tilastokeskus) | Household Budget Survey (HBS) 2012, befolkningsdata | Åpen |
| LUKE (Naturresursinstitutet) | Matforsyningsbalanse, produksjonsdata | Åpen |
| KKV (Konkurrens- och konsumentverket) | Fusjonsvedtak, markedsanalyser | Offentlig |

### 2.5 Storbritannia (UK) — Referansemodell

| Kilde | Type | Tilgang |
|---|---|---|
| CDRC Priority Places for Food Index v2.1 | Komposittindeks med 7 domener, LSOA-nivå | Åpen (CDRC Data) |
| CMA (Competition and Markets Authority) | Lokal HHI, fusjonsanalyser (Sainsbury's/Asda etc.) | Offentlig |
| Geolytix Retail Points | Butikkregister med geokoordinater | Kommersiell / akademisk lisens |

## 3. Konkrete funn

### 3.1 Norge

- **Lokal HHI:** Median HHI = 1.0 (monopol) på postnummernivå. Strøm & Halseth (NHH 2023) viste at flertallet av norske postnumre har kun én dagligvarekjede representert.
- **Nasjonal HHI:** ~0.26 (høykonsentrert) med tre dominerende aktører (NorgesGruppen ~44%, Coop ~29%, Rema 1000 ~23%).
- **Butikkdekning:** Betydelig nedgang i antall butikker utenfor bysentra. Transportavstand problematisk i distriktene.

### 3.2 Sverige

- **Kommuner uten discounter:** 102 av 290 kommuner mangler lavprisbutikk (Konkurrensverket 2024:4), noe som berører ~1 million innbyggere.
- **Markedsstruktur:** ICA (~53%), Coop (~18%), Axfood (~22%). Høy konsentrasjon, men mer geografisk spredning enn Norge.
- **Pipos-data:** Tillväxtverket/Pipos kartlegger butikktilgjengelighet systematisk per kommun med kjøretidsisokroner.

### 3.3 Danmark

- **KFST-metodikk:** Bruker systematisk drive-time HHI med 5 og 10 minutters kjøretid som markedsavgrensning i fusjonsanalyser.
- **Salling/Coop-fusjon:** Detaljerte lokal-HHI-beregninger gjennomført i forbindelse med fusjonsanalyse, viser at mange lokalmarkeder allerede er høykonsentrerte.
- **Markedsstruktur:** Salling Group (~35%), Coop DK (~35%), Rema 1000 (~12%), Aldi (~4%).

### 3.4 Finland

- **Innbyggere per butikk:** 1 263 innbyggere per dagligvarebutikk (PTY 2024).
- **Median butikkavstand:** 700 meter (Statistics Finland Household Budget Survey 2012). NB: Eldre datapunkt.
- **S-Group dominans:** S-Group (~46%) og K-Group (~36%) kontrollerer >80% av markedet — duopol.
- **Butikkstruktur:** Sterk trend mot hypermarkeder og store supermarkeder, med konsolidering av små nærbutikker.

### 3.5 Island

- Ingen akademiske studier identifisert om food deserts eller lokal HHI.
- Tre aktører dominerer: Hagar (Hagkaup/Bónus), Samkaup (Nettó/Krónan), Costco.
- Reykjavik-området har rimelig tilgjengelighet; rurale områder og vestfjordene er potensielt underforsynt.

## 4. Kunnskapshull

| Gap | Beskrivelse | Prioritet |
|---|---|---|
| Island ustudert | Ingen kjent studie av food access eller lokal konkurranse på Island | Høy |
| Ingen NEMS-studie i Norden | NEMS (Nutrition Environment Measures Survey) kvalitetsvekting ikke kombinert med GIS-tilgjengelighet i noen nordisk studie | Høy |
| E-matørkener ukartlagt | CDRC-metodikken for e-matørkener er ikke replikert i Norden; netthandelsdekning ukjent | Middels |
| Kommunal HHI-database mangler | Norge og Finland mangler systematisk kommunal HHI-database (Danmark har KFST-data, Sverige har Konkurrensverket) | Høy |
| Prisnivå-kobling | Ingen nordisk studie kobler lokal HHI til prisnivå på butikknivå (endogenitetsproblem) | Middels |
| Tidsserieperspektiv | Mangelfull tidsseriedata for lokal konsentrasjon — vanskelig å spore endring over tid | Middels |

## 5. Anbefalt 2-stegs rammeverk for Food Systems 2026

### Steg 1: Kartlegg tilgjengelighet (Accessibility Mapping)

**Mål:** Identifisere matørkener og tilgjengelighetsgradienter i norske kommuner.

1. **Innhent butikkregister** — Geodata AS eller OSM-uttrekk med kjedetilhørighet
2. **Befolkningsrutenett** — SSB 250m rutenett med demografiske variabler
3. **Nettverksanalyse** — Beregn kjøretid og gangtid til nærmeste butikk(er) via NVDB/OSM
4. **Isochronberegning** — 5, 10, 15 min kjøretid; 10, 20 min gangtid
5. **Food desert-identifisering** — Befolkning utenfor alle isokroner, vektet mot deprivasjonsindikatorer

**Verktøy:** Python (osmnx, networkx), QGIS, PostGIS

### Steg 2: Beregn lokal HHI (Competition Mapping)

**Mål:** Kvantifisere lokal markedskonsentrasjon i hvert identifiserte lokalmarked.

1. **Definer lokalmarkeder** — Drive-time (10 min) eller administrative grenser (postnummer/grunnkrets)
2. **Estimer markedsandeler** — Butikkareal som proxy (tilgjengelig) eller omsetning (begrenset tilgang)
3. **Beregn HHI** — Per lokalmarked; kartlegg distribusjon
4. **Koble til Steg 1** — Overlay tilgjengelighetsgradienter med konsentrasjonsgradienter
5. **Identifiser sårbare områder** — Lav tilgjengelighet + høy konsentrasjon = høyest prioritet

**Forventet output:**
- Kommunekart med HHI-verdier (kloropleth)
- Food desert-kart med befolkningstall
- Krysstabell: tilgjengelighet × konsentrasjon
- Sammenlignbar metodikk for nordisk komparasjon

### Datakrav og tilgjengelighet

| Data | Kilde | Status |
|---|---|---|
| Butikkregistre med koordinater | Geodata AS / OSM | Kommersiell / åpen |
| Kjedetilhørighet | Geodata AS / manuell | Kommersiell / manuell |
| Butikkareal (proxy for andel) | Geodata AS | Kommersiell |
| Befolkningsrutenett | SSB | Åpen |
| Veinettverksdata | NVDB / OSM | Åpen |
| Demografisk deprivasjon | SSB | Åpen |

## 6. Referanser

- Strøm, S. & Halseth, A. (2023). *Lokal konkurranse i norsk dagligvare.* NHH / SNF Working Paper.
- Konkurrensverket (2024). *Konkurrensen i Sverige 2024:4 — Dagligvarumarknaden.* Stockholm.
- KFST (2023). *Fusionsafgørelse — Salling Group/Coop DK.* Konkurrence- og Forbrugerstyrelsen.
- CDRC (2024). *Priority Places for Food Index v2.1.* Consumer Data Research Centre, University of Leeds.
- PTY (2024). *Finnish Grocery Trade 2024.* Finnish Grocery Trade Association.
- Statistics Finland (2012). *Household Budget Survey — Access to Services.* Tilastokeskus.
- Tillväxtverket (2024). *Serviceanalys — tillgång till kommersiell och offentlig service.* Pipos.
- USDA ERS (2023). *Food Access Research Atlas.* United States Department of Agriculture.
