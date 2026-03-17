# Food Access, Food Deserts og Lokal HHI: Metoder, Kilder og Datasett for Nordisk og Komparativ Analyse

## Sammendrag

Forskning på matvaredeserts og lokal butikk­konsentrasjon er metodisk fragmentert: noen studier måler fysisk avstand, andre tetthet, noen bruker HHI på markedsandeler, og noen kombinerer alle tre dimensjonene med sosioøkonomiske indikatorer. Norden er relativt underutforsket innenfor dette feltet sammenlignet med USA, Storbritannia og Canada, men nyere regulatoriske rapporter fra de skandinaviske konkurransemyndighetene og akademisk arbeid fra NHH, KTH og Uppsala gir et solid metodisk grunnlag. Denne rapporten katalogiserer de viktigste kildene med beskrivelse av geografisk nivå, målingsmetode, datagrunnlag, lenke og overførbarhet til Food Systems 2026-arbeid.

***

## 1. Norge: Konkurranseanalyse og Butikkstruktur

### 1.1 Konkurransetilsynets Dagligvarerapport 2024

**Type:** Offentlig rapport (reguleringsmyndighet)
**Geografisk nivå:** Nasjonalt + 6 regioner (Oslo, Østlandet u/Oslo, Sørlandet, Vestlandet, Midt-Norge, Nord-Norge)

Konkurransetilsynet presenterte i denne rapporten for første gang en **egenprodusert kartlegging av dagligvarekjedenes markedsandeler** basert på direkte innrapporterte omsetningstall fra Bunnpris, Coop, NorgesGruppen og Rema 1000 for 2023 og 2024. Metoden innebærer at tilsynet beregner avvik mellom kjedens regionale omsetningsandel og dens nasjonale markedsandel, og dermed identifiserer geografiske skjevheter i markedsstruktur. NorgesGruppen holder 43,5% nasjonalt, men har markant lavere andel i Midt- og Nord-Norge, der Coop er sterkere.[^1][^2][^3]

Rapporten dokumenterer videre at **i de 50 minst befolkede kommunene utgjør Coop nær halvparten av omsetningen** — en indikator på lokal konsentrasjonsrisiko. Denne metodikken (omsetningstall per butikk → regionale andelsberegninger → avviksanalyse) er direkte overførbar til subnasjonale Food Systems 2026-analyser på kommunenivå i Norge dersom tilgangen til kjededata sikres via åleggande-mekanismen.[^1]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | 6 regioner, nasjonalt |
| Konsentrering målt med | Omsetningsandel per region; avvik fra nasjonal andel |
| Datakilder | Direkte innrapporterte omsetningstall fra kjedene |
| Lenke | [konkurransetilsynet.no](https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf) |
| Overførbarhet | Høy – metode kan skaleres til kommunenivå med tilsvarende åleggande |

### 1.2 Strøm Halseth (NHH, 2023): Lokal HHI på Postnummernivå

**Type:** Akademisk paper (NHH, FOOD-prosjektet)
**Geografisk nivå:** Postnummer (~2 100 markeder), kommuner (~430), fylker, grunnkretser

Dette er den metodisk **mest presise analysen av lokal HHI i norsk dagligvarehandel**. HHI beregnes som \(HHI = \sum_{i=1}^{N} (S_i)^2\) der \(S_i\) er markedsandel målt med omsetning fra Geodata-registeret. Analysen viser at **medianen for lokal HHI på postnummernivå er 1,0 (monopol)**, men den salgs-vektede middelverdien er 0,63 — noe som reflekterer at rurale monopoler utgjør en liten andel av total nasjonal omsetning.[^4]

Metoden benytter tetthetsjusterte opptaksområder: fra 0,5 km i tettbefolkede BSU-kvintiler til 10 km i spredtbygde områder. Datagrunnlaget er Geodata AS sin årslige panel med butikklokasjoner, format, kjedetilhørighet og regnskapsinntekter. Analysen er gjennomført som en DiD-studie av Coop/ICA-fusjonen i 2015, men metodikken for HHI-beregning er klart dokumentert og replikerbar for Food Systems 2026.[^4]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | Postnummer, kommune, fylke, BSU |
| HHI beregnet med | Omsetning per kjede per geografisk enhet; \(HHI = \Sigma S_i^2\) |
| Datakilder | Geodata AS (årslig panel), AC Nielsen |
| Lenke | [cresse.info/2023_ps13_pa2_Strom-Halseth.pdf](https://www.cresse.info/wp-content/uploads/2023/09/2023_ps13_pa2_Strom-Halseth.pdf) |
| Overførbarhet | Høy – HHI-metoden kan direkte anvendes på kommunenivå |

### 1.3 Restriktive klausuler og markedskonsentrasjon (NHH/Konkurransetilsynet, 2024)

**Geografisk nivå:** Kommunalt

En masteroppgave publisert av Konkurransetilsynet kombinerer **Geodata-registeret med SSBs demografidata** for å analysere hvordan restriktive klausuler (konkurransebegrensende vedtekter i eiendomskontrakter) påvirker markedskonsentrasjon, butikkomsetting og avstand mellom dagligvarebutikker på kommunenivå. Metoden inkluderer en markedskonsentrasjonsmodell på kommunalt nivå, og er dermed et eksempel på at Geodata + SSB kan kombineres for subnasjonale konsentrasjonsanalyser.[^5]

***

## 2. Sverige: Konkurransemyndighet og Tilgjengelighetsverktøy

### 2.1 Konkurrensverket: Dagligvaruhandelns etablering i kommunerna (Rapport 2024:4)

**Type:** Offentlig rapport (reguleringsmyndighet)
**Geografisk nivå:** 290 kommuner

Dette er den mest **direkte analysen av kommunal markedsstruktur i dagligvarehandelen** i Norden. Rapporten kombinerer tre metodiske tilnærminger:[^6]

1. **Åleggande om omsetningstall**: De fem største aktørene (ICA, Coop, Axfood, Lidl, City Gross) måtte rapportere omsetning i kroner per kommune og butikkonsept for 2022.[^7]
2. **GIS-analyse av nærmeste konkurrent**: Ved bruk av Tillväxtverkets Pipos-tjeneste og NVDB vegnettsdata (Dijkstras algoritme) ble det beregnet for hvilke butikker den nærmeste konkurrenten tilhører samme aktør — funnet: 428 butikker (11% av fullsortiment).[^7]
3. **Kommunesurvey og intervjuer**: 171 av 290 kommuner svarte (59% svarprosent).[^7]

Rapporten fastslår at **over en tredjedel av Sveriges kommuner (102 av 290) manglet lågprisbutik i 2022**, noe som rammer ca. én million innbyggere. ICA er til stede i 286 av 290 kommuner.[^8][^9][^6]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | 290 kommuner |
| Konsentrasjon målt med | Antall aktører per kommune; fraværsanalyse; nærmeste-konkurrent-analyse |
| Datakilder | Åleggande til 5 aktorer; Pipos (Tillväxtverket); NVDB vegnettsdata |
| Lenke | [konkurrensverket.se/rapport_2024-4.pdf](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf) |
| Overførbarhet | Direkte – metode og data er åpne og replikerbare |

### 2.2 Tillväxtverket – Pipos/Serviceanalys (Sverige)

**Type:** Offentlig GIS-verktøy (for offentlig sektor)
**Geografisk nivå:** Kommune, regional; grunnkretsnivå

Pipos er en GIS-plattform som **simulerer konsekvensene av butikkåpning eller -nedleggelse på tilgjengelighetsgrad** for befolkning og virksomheter i Sverige. Serviceanalys viser kjøreavstand til nærmeste dagligvarehandel fordelt i fem intervaller, og brukes som grunnlag for nasjonale, regionale og kommunale plandokumenter. Plattformen Tillväxtanalys utviklet også **PIPON** — en tverrnordisk tilgjengelighetsplattform for Norden — i samarbeid med Nordisk råd.[^10][^11][^12][^13]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | Kommunalt, regional; simuleringsbasert |
| Tilgjengelighet målt med | Kjøreavstand (km) til nærmeste service; 5 kategorier |
| Datakilder | GIS vegnettsdata; servicelokasjonsregister inkl. dagligvarer |
| Lenke | [pipos.se / tillvaxtverket.se](https://tillvaxtverket.se/tillvaxtverket/guiderochverktyg/guiderochverktyg/pinpointswedenpipos.4764.html) |
| Overførbarhet | Høy – direkte modell for norsk/nordisk SSB + Matrikkelen + Geodata |

### 2.3 SCB – Statistiska handelsområden (Sverige)

**Type:** Offentlige geodata (CC0-lisens)
**Geografisk nivå:** Handelsoner (polygoner), Sverige

SCB avgrenser handelsoneområder som konsentrasjoner av **detaljhandelsforetak (SNI 47) med ≥5 butikker**. Data leveres som GeoPackage og er tilgjengelig via WMS/WFS-tjenester, og oppdateres hvert femte år. Disse dataene kan kombineres med SCBs bedriftsregister (nå avgiftsfritt via API) for å hente ut dagligvarebutikker på kommunalt nivå.[^14]

### 2.4 Matöknar i Sverige – GIS-studie Malmö (Lunds Univ., 2022)

**Type:** Akademisk paper (masteroppgave)
**Geografisk nivå:** Bydel/nabolag (Malmö)

Studien definerer matørken som et område **uten dagligvarebutikk innenfor 1 km gangavstand**, og kartlegger dette via nettverksanalyse i GIS. Finner en matørken i sørvestlige Malmö forklart av småhusbebyggelse, lavt kundegrunnlag og manglende tjenesteklynger. Metoden er enkel og replikerbar med åpne data (OSM + kommunale registre).[^15]

### 2.5 KTH FOOD – Romlig analyse av matlikhet i Stockholm (2025)

**Type:** Akademisk (pågående forskning, KTH)

Ioannis Ioannidis ved KTH FOOD anvender **romlig analyse og GIS for å identifisere matørkener i Stockholm** med fokus på ulik fordeling av næringsrik, rimelig mat. Forskningen er relatert til den 15-minutters-by-konseptet og undersøker sammenhengen mellom matøkner og sosial ulikhet.[^16][^17]

***

## 3. Danmark: Fusjonskontroll og Lokal HHI

### 3.1 KFST: Salling Group/Coop-fusjon (2025, 2024)

**Type:** Fusjonskontrollavgjørelse (Konkurrence- og Forbrugerstyrelsen)
**Geografisk nivå:** Lokale markeder (5 og 10 minutters kjøretid)

KFST anvender eksplisitt **HHI og delta-HHI** i sin fusjonsanalyse for dagligvarer, i tråd med EU-Kommisjonens retningslinjer. Geografisk avgrensning av lokale markeder baseres på kjøretider (5 min, 10 min) fra partenes butikker. I Salling/Coop-saken ble to lokale markeder (Slagelse og Taastrup) utpekt for dypere analyse på grunn av høy kombinert markedsandel og HHI over kommisjonens terskler. Diversion ratios fra kundespørreundersøkelser supplerer den kvantitative analysen.[^18]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | Lokale markeder (5/10 min kjøretid); to spesifikke case-kommuner |
| Konsentrasjon målt med | HHI + delta-HHI (EU-standard); diversion ratios |
| Datakilder | Butikkregistre; partenes omsetningstall; markedsundersøkelse |
| Lenke | [kfst.dk/media/edgjum43](https://kfst.dk/media/edgjum43/20250326-salling-groups-erhvervelse-af-dele-af-coop-danmark-a.pdf) |
| Overførbarhet | Høy – metodikken er direkte overførbar til Food Systems 2026 |

### 3.2 KFST: REMA 1000/ALDI-fusjon (2023)

**Type:** Fusjonskontrollavgjørelse
**Geografisk nivå:** 12 lokale markeder (kommuner/byer)

Denne avgjørelsen analyserte fusjonen i 12 spesifikke lokale områder ved bruk av HHI og kjøretidsbasert markedsavgrensning. Metodikken er identisk med Salling/Coop-saken og gir konkrete eksempler på kommunal HHI-beregning i dansk kontekst.[^19]

***

## 4. Finland: Markedsstruktur og Husholdningsavstand

### 4.1 PTY – Finnish Grocery Trade Association (Årsrapport 2024)

**Type:** Bransjestatistikk
**Geografisk nivå:** Nasjonalt; butikktype

Finsk dagligvarehandel domineres av S Group og K Group. Rapporten gir detaljert statistikk etter butikktype (størrelse i kvm), butikkantall (2 734 butikker) og markedsandeler per kjede. Finland har 1 263 innbyggere per dagligvarebutikk — en indikator for gjennomsnittlig butikktetthet. Markedet kjennetegnes av svært høy konsentrasjon: S Group og K Group har til sammen over 80% markedsandel.[^20][^21][^22]

### 4.2 Statistics Finland – Household Budget Survey 2012

**Type:** Offisiell statistikk
**Geografisk nivå:** Urbant/ruralt klassifisert; nasjonalt representativt

En tredjedel av finske husholdninger har **under 500 m til nærmeste dagligvarebutikk**, og tre av fire bor innenfor 1,5 km — basert på veinavsandsberegninger i Statistics Finlands forbruksundersøkelse. Median avstand er 700 m; gjennomsnitt 2 km. Disse dataene viser at Finland har god gjennomsnittlig tilgjengelighet, men med betydelig geografisk variasjon mellom urbane og rurale strøk.[^23][^24]

***

## 5. Storbritannia: Sammensatte Indekser

### 5.1 CDRC – Priority Places for Food Index v2.1 (2024)

**Type:** Akademisk/policy-verktøy (CDRC, Univ. of Leeds + Which?)
**Geografisk nivå:** LSOA (England/Wales, ca. 650 husholdninger), Data Zones (Skottland), SOA (Nord-Irland)

PPFI er det mest **metodisk avanserte og åpne tilgjengelighetsindeksen i Norden/Europa**. Indeksen kombinerer **syv domener med lik vekting** og er bygd på åpne data:[^25][^26][^27][^28][^29]

1. Nærhet til supermarked
2. Tilgjengelighet til supermarked (transporttid)
3. Nærhet til ikke-supermarked mattilbud
4. Tilgang til online levering
5. Sosioøkonomiske barrierer
6. Drivstoffattigdom
7. Behov for familiemattilbud (fri skolemat, Healthy Start)

Domenene kombineres til ett sammensatt indeks etter metoder fra UK's Index of Multiple Deprivation. Data inkluderer Census, offentlige hjelperegistre, web-scrapede leveringsadresser og matbankdata. Versjon 2.1 ble publisert mars 2026.[^28][^30][^31]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | LSOA (England/Wales), Data Zones (Skottland) |
| Tilgjengelighet målt med | 7-domene sammensatt indeks; lik vekting |
| Datakilder | Census, offentlige registre, web-scraping, matbankdata |
| Lenke | [priorityplaces.cdrc.ac.uk](https://priorityplaces.cdrc.ac.uk/) + [data.hasp.ac.uk](https://data.hasp.ac.uk/browser/dataset/5276/0) |
| Overførbarhet | Høy – domenene kan tilpasses til nordiske datasett (SSB, SCB, Stat.fi) |

### 5.2 CDRC – E-Food Desert Index (EFDI, 2020–2021)

**Type:** Akademisk/policy-verktøy (CDRC, Univ. of Leeds)
**Geografisk nivå:** LSOA

EFDI er forgjengeren til PPFI og fokuserte spesielt på **e-handelsdimensjonen** av matøkner — det vil si nabolag som lider under både dårlig fysisk tilgjengelighet og manglende online leveringsdekning. Indeksen identifiserte en ny form for ulikhet: rurale e-matøkner som falt utenfor den tradisjonelle urbane matørken-litteraturen. Inneholder fire hoveddimensjoner: butikkproksimitet/tetthet, transport, sosioøkonomi, og e-handel.[^32][^33]

### 5.3 London Food Purchase Data (PLOS Complex Systems, 2025)

**Type:** Akademisk studie
**Geografisk nivå:** Nabolag (London)

En studie av supermarkedt­transaksjonsdata fra **1,6 millioner London-kunder** bruker usupervisert statistisk metode for å identifisere kjøpsmønstre og deretter geographically weighted regression for å koble mønstre til lokale forhold. Studien utfordrer den klassiske avstandsbaserte definisjonen av matøkner, og viser at i urbane miljøer er kjøpekraft og kulturelle faktorer like viktige som geografisk avstand.[^34]

***

## 6. Canada: Nasjonalt Datasett og Rural Metodikk

### 6.1 Can-FED v2 – Canadian Food Environment Dataset (Statistics Canada, 2025)

**Type:** Offisiell statistikk (Statistics Canada)
**Geografisk nivå:** Dissemination Area (DA) – ca. 56 000 DAs nasjonalt

Can-FED versjon 2 er et **pankanadisk datasett** for detaljhandelsmiljøet basert på 2024 Statistics Canada Business Register. Metoden beregner **absolutt og relativ tetthet av matforretninger** ved bruk av nettverksbufre rundt DA-sentroider, med OpenStreetMap vegdata og Valhalla-ruting. Kategoriske tilgangsvariabler genereres via k-median-clustering (5 kategorier per tetthetsmål). Datasett er delvis åpent tilgjengelig og kan kobles til helseundersøkelsesdata via Standard Geographical Classification.[^35][^36][^37]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | Dissemination Area (DA) |
| Tilgjengelighet målt med | Absolutt + relativ tetthet; nettverksbufre; k-medians |
| Datakilder | Statistics Canada Business Register 2024; OpenStreetMap; Valhalla |
| Lenke | [statcan.gc.ca/Can-FED v2](https://www150.statcan.gc.ca/n1/pub/13-20-0001/132000012025002-eng.htm) |
| Overførbarhet | Høy – Metode med Business Register + OSM er direkte replikerbar |

### 6.2 Rural Food Desert Methodology (Québec, Canada)

**Type:** Akademisk studie (PMC, 2015)
**Geografisk nivå:** Ruralt (4 sammenhengende fylker i Québec)

Studien utviklet en metodologi for å identifisere matøkner i **rurale miljøer** ved å kombinere fire in-store kvalitetsmål (ferskhet, prisoverkommelighet, mangfold, relativ tilgjengelighet) med vegavstand. Fant at matøkner var **mer utbredte** når matkvalitet ble tatt hensyn til enn ved bruk av kun USDA-avstandsdefinisjonen. Metodikken matcher godt til norske og finske rurale kommuner der eneste butikk kan ha begrenset sortiment.[^38]

### 6.3 Montreal Gravity Model (Mamiya et al., 2021)

**Type:** Akademisk studie
**Geografisk nivå:** Nabolag (Montreal)

Bruker Huff gravity model kombinert med butikknivå transaksjonsdata fra Nielsen for å beregne **husholdningsvis tilskrivning av kjøpsatferd** til nabolagsnivå-indikatorer. Denne tilnærmingen muliggjør mer presise geografiske helseanalyser enn tradisjonelle survey-baserte metoder.[^39]

***

## 7. USA: Etablerte Referansemetoder

### 7.1 USDA Food Access Research Atlas (FARA)

**Type:** Offentlig verktøy og datasett (ERS/USDA)
**Geografisk nivå:** Census tract

FARA er den mest siterte referansen for matørken-metodikk internasjonalt. Definisjonen av matørken kombinerer to terskler:[^40][^41]
- **Lavinnkomst**: Fattigdomsrate ≥20%, eller medianinntekt ≤80% av delstats/metro-median
- **Lavtilgang**: ≥500 personer eller ≥33% av befolkning bor >1 mil (urban) eller >10 mil (rural) fra nærmeste supermarked[^42][^43]

Data er oppdatert med 2019-tall; kartbasert grensesnitt tillater sammenligning med 2015-data. Supermarkeder er definert som matforretninger med ≥$2 mill. årlig omsetning og alle hoveddepartementer.[^43][^40]

| Parameter | Detalj |
|-----------|--------|
| Geografisk nivå | Census tract |
| Tilgjengelighet målt med | Avstand til nærmeste supermarked; kjøretøytilgang; lavinn.trekk |
| Datakilder | SNAP-autoriserte butikker + TDLinx (Nielsen) 2006/2019 |
| Lenke | [ers.usda.gov/food-access-research-atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas) |
| Overførbarhet | Moderat – kategorier og terskler må justeres for norsk kontekst |

### 7.2 Quality-Weighted Grocery Store Accessibility (QWGA)

**Type:** Akademisk studie (PMC, 2017)

QWGA kombinerer **avstand til nærmeste dagligvarebutikk med NEMS-S (Nutrition Environment Measures Survey in Stores) kvalitetsscore** til ett vektet tilgjengelighetsmål. Formelen deler typisk avstandsmål på rangert NEMS-score slik at korte avstander til dårlige butikker gir lavere score enn lange avstander til gode butikker. Studien demonstrerer at kontroll for butikkvalitet nullifiserer mange av de negative helseeffektene tilskrevet matøkner.[^44]

***

## 8. Nordiske Datasett og Åpne Ressurser

| Datasett | Land | Tilgjengelighet | Innhold | Lenke |
|----------|------|-----------------|---------|-------|
| **SSB Statistikkbank** | NO | Åpen (API) | 6000+ tabeller; fylke/kommune/bydel/grunnkrets | [ssb.no/en/statbank](https://www.ssb.no/en/statbank) |
| **Geodata AS – Butikkregister** | NO | Kommersiell | Dagligvare: omsetning, kjedetilhørighet, adresse; ukentlig oppdatert | [geodata.no/produkter](https://www.geodata.no/produkter-og-tjenester/forretningsdata) |
| **Prognosesenteret – Kommunemonitor** | NO | Kommersiell | Demografi + omsetningsdata per kommune; ~400 regioner | [prognosesenteret.no](https://prognosesenteret.no/kommunemonitor/) |
| **Pipos/Serviceanalys** | SE | Offentlig sektor | GIS tilgjengelighet; simulering; dagligvarer | [tillvaxtverket.se](https://tillvaxtverket.se/tillvaxtverket/guiderochverktyg/guiderochverktyg/pinpointswedenpipos.4764.html) |
| **SCB Öppna geodata** | SE | Åpen (CC0) | Handelsoner, tettbebyggelse, bedriftsregister | [scb.se/oppna-data](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/) |
| **SCB Bedriftsregister** | SE | Åpen (API, fra 2025) | Alle foretak inkl. dagligvare; adresser/koordinater | [scb.se](https://www.scb.se/en/finding-statistics/statistics-by-subject-area/) |
| **Statistics Finland (Tilastokeskus)** | FI | Åpen/kommersiell | HBS-data; avstandsdata til tjenester | [stat.fi](https://stat.fi/til/ktutk/2012/ktutk_2012_2014-05-26_en.html) |
| **PTY – Finnish Grocery Trade** | FI | Åpen | Årsstatistikk; markedsandeler, butikkantall | [pty.fi](https://www.pty.fi/wp-content/uploads/2024/06/Paivittaistavarakauppa-ry-2024-EN.pdf) |
| **CDRC Data Portal / PPFI v2.1** | UK | Åpen | LSOA-nivå; 7-domene matindeks | [priorityplaces.cdrc.ac.uk](https://priorityplaces.cdrc.ac.uk/) |
| **Can-FED v2 (Statistics Canada)** | CA | Åpen (generell) + forsker | DA-nivå; butikktetthet; nettverksbuffer | [statcan.gc.ca](https://www150.statcan.gc.ca/n1/pub/13-20-0001/132000012025002-eng.htm) |
| **USDA FARA** | USA | Åpen | Census tract; matøkner 2015/2019 | [ers.usda.gov/food-access-research-atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas) |

***

## 9. Metodisk Sammenligning

| Metode | Geografisk nivå | Konsentrasjon/tilgang | Fordeler | Begrensninger |
|--------|-----------------|----------------------|----------|---------------|
| **Avstand til nærmeste butikk** | Husholdning/nabolag | Reiseavstand (m/km) | Enkel, replikerbar, OSM-basert | Ignorerer konkurranse og pris |
| **Butikktetthet (butikker/innb.)** | Kommune/region | Absolutt/relativ tetthet | Greit for subnasjonale sammenligninger | Sier lite om konkurranse |
| **HHI (markedsandeler)** | Postnummer/kommune | \(HHI = \Sigma S_i^2\) | Standardmål i konkurranserett; direkte policy-relevant | Krever omsetningsdata per kjede |
| **PPFI (7-domene indeks)** | LSOA-ekvivalent | Sammensatt | Fanger flerdimensjonal sårbarhet | Dataintensiv; krever tilpasning |
| **Nettverksbuffer-tetthet** | DA/grunnkrets | Absolutt+relativ tetthet | Presis romlig analyse; OSM-basert | Krever GIS-kompetanse |
| **Kjøretid-basert (5/10 min)** | Lokalt marked | HHI + drive-time soner | Brukt i fusjonskontroll; juridisk forankret | Forutsetter bilbruk |
| **Gravity-modell (Huff)** | Nabolag | Tilskrevet etterspørsel | Fanger faktisk handelsatferd | Krever transaksjonskjonsdata |

***

## 10. Metodisk Rammeverk for Food Systems 2026

For subnasjonale analyser innenfor Food Systems 2026 i Norden anbefales en **to-trinns tilnærming**:

**Trinn 1 – Kartlegging av butikktetthet og tilgjengelighet:**
- Beregn avstand fra husholdnings-/grunnkretsnivå til nærmeste dagligvarebutikk via vegnettsdata (OpenStreetMap eller Statens vegvesen NVDB)[^4]
- Bruk Pipos/Serviceanalys for Sverige (offentlig sektor); SSB-arealbruk + Geodata-butikkregister for Norge[^45][^46][^10]
- Klassifiser kommuner etter butikktetthet (butikker per 1 000 innb.) og avstand i desiler/kategorier

**Trinn 2 – Beregn lokal HHI og markedskonsentrasjon:**
- Innhent omsetningsdata per butikk/kjede per kommune (via Geodata AS eller direkte fra kjedene etter KFST/Konkurrensverket-modellen)[^2][^5]
- Beregn \(HHI = \sum S_i^2\) for hver kommune; identifiser kommuner med HHI > 0,25 (høy konsentrasjon) og kommuner der én eller to aktorer dominerer[^47][^6]
- Supplér med PPFI-inspirerte domener (sosioøkonomi, transporttilgang, online tilgjengelighet) ved bruk av SSB/SCB/Tilastokeskus åpne data

**Nøkkelpunkt om metodisk overførbarhet:**
Strom Halseth (NHH) og Konkurrensverket (Sverige) demonstrerer at HHI på kommunenivå er gjennomførbart med tilgjengelige registre i Norden. KFST-fusjonspraksis gir juridisk presedens for 5/10-minutters kjøretid som lokal markedsavgrensning. Can-FED v2 viser at OSM-baserte nettverksbufre og åpne bedriftsregistre er tilstrekkelig for nasjonale kartlegginger. USDA FARA og UK PPFI gir terskelverdier og domenevekter som kan adapteres til nordisk kontekst.[^37][^18][^6][^4]

***

## 11. Kunnskapsgap

- **Island**: Ingen spesifikke studier identifisert. Markedet er dominert av Bónus, Krónan og Nettó (datterselskap av norske og danske kjeder).
- **Kommunal HHI, Norge**: Konkurransetilsynets rapport (2024) dekker seks regioner, men ikke kommunenivå. Strøm Halseth (2023) gir postnummernivå men ikke åpent datasett.
- **Finland kommunalt nivå**: PTY gir bransjestatistikk, men ingen åpen kommunal database for butikklokalisering og markedsandeler er identifisert.
- **Kvalitetsjustert tilgjengelighet Norden**: Ingen nordisk studie kombinerer NEMS-type butikkrevisjoner med GIS-analyse (QWGA-metoden).[^44]
- **E-matøkner Norden**: CDRC-metodikken for e-handel/leveringsdekning er ikke replikert i Norden, til tross for høy online-handleandel i Sverige og Norge.

---

## References

1. [Norwegian Competition Authority Reports Market Share Changes in Grocery Sector](https://www.policypulse.pro/article/8Gs57tKAT1KOkIctxrk4)

2. [Konkurransetilsynets Dagligvarerapport 2024](https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf)

3. [konkurransetilsynets - dagligvarerapport 2024](https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25-1.pdf)

4. [Competition and Grocery Retail Formats:](https://www.cresse.info/wp-content/uploads/2023/09/2023_ps13_pa2_Strom-Halseth.pdf)

5. [Restrictive covenants in the Norwegian grocery market](https://konkurransetilsynet.no/wp-content/uploads/2025/02/Restrictive-covenants-in-the-grocery-markets-masters-thesis-2024.pdf)

6. [Dagligvaruhandelns etablering i kommunerna](https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/)

7. [Dagligvaruhandelns etablering i kommunerna. Konkurrensverkets rapport 2024:4.](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf)

8. [ICA  handlarnas](https://www.icahandlarna.se/media/hy1pmkoi/ica-handlarnas-va-rld-2024_final_241024.pdf)

9. [Uppdrag till Konkurrensverket och Boverket att förbättra ...](https://www.regeringen.se/contentassets/a2e73c40505449e28949998739dab4cb/uppdrag-till-konkurrensverket-och-boverket-att-forbattra-forutsattningarna-for-etablering-av-dagligvarubutiker.pdf)

10. [Pinpoint Sweden (Pipos)](https://tillvaxtverket.se/tillvaxtverket/guiderochverktyg/guiderochverktyg/pinpointswedenpipos.4764.html) - Pipos är en digital plattform som Tillväxtverket utvecklar och förvaltar. På den har vi byggt tre tj...

11. [Pipos Serviceanalys Inledning](https://pipos.se/download/18.28ce07081715d8d400c14c52/1619617966469/Manual%20f%C3%B6r%20Serviceanalys_beta_20200420.pdf)

12. [Manual för Serviceanalys](https://pipos.se/download/18.17ea4b99174bf4090f0bd66/1601453705727/Manual%20f%C3%B6r%20Serviceanalys_20200928.pdf)

13. [PIPON-en plattform för nordiska tillgänglighetsanalyser](https://www.tillvaxtanalys.se/download/18.62dd45451715a00666f1e9b7/1586366190291/Rapport_2012_08_.pdf)

14. [Statistiska handelsområden](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistiska-handelsomraden/) - SCB tar fram avgränsningar för handelsområden med hjälp av registerdata och geodata från bland annat...

15. [Matöknar i Sverige - En tillgänglighetsstudie av livsmedelsbutiker i Malmö](https://lup.lub.lu.se/student-papers/search/publication/9082554) - Studies have been made on food deserts all around the world. Sweden is however an outlier, and few s...

16. [Exploring Urban Food Inequality: How Spatial Analysis can Build Healthier Cities | KTH](https://www.kth.se/en/kthfood/nyheter-evenemang/nyheter/exploring-urban-food-inequality-how-spatial-analysis-can-build-healthier-cities-1.1396460)

17. [How spatial analysis maps food deserts in Stockholm](https://www.linkedin.com/posts/kth-food_exploring-urban-food-inequality-how-spatial-activity-7315367945549885440-itdq) - How is food access connected to livable cities? 🏙️🍎 Ioannis Ioannidis, researcher at KTH FOOD, uses ...

18. [[PDF] Salling Group A/S' erhvervelse af dele af Coop Danmark A/S](https://kfst.dk/media/edgjum43/20250326-salling-groups-erhvervelse-af-dele-af-coop-danmark-a.pdf)

19. [Afgørelse fusionen mellem REMA 1000 og dele af ALDI](https://kfst.dk/media/1scjlqrk/20230830-fusion-rema-1000-og-dele-af-aldi-danmark.pdf) - Konkurrence- og Forbrugerstyrelsen (herefter også ”styrelsen”) modtog den 31. marts 2023 en anmeldel...

20. [FINNISH GROCERY TRADE](https://www.pty.fi/wp-content/uploads/2024/06/Paivittaistavarakauppa-ry-2024-EN.pdf)

21. [[PDF] THE GROCERY RETAIL SECTOR - Flanders Investment & Trade](https://export.flandersinvestmentandtrade.com/sites/fit_domains/files/media/report/The%2520grocery%2520retail%2520sector%2520in%2520Finland%25202022_2.pdf)

22. [The distribution network in Finland - Lloyds Bank Trade Portal](https://www.lloydsbanktrade.com/en/market-potential/finland/distribution) - Learn about the distribution market in Finland. Find out information on the evolution of the retail ...

23. [[PDF] Households' consumption 2012 - Tilastokeskus](https://stat.fi/til/ktutk/2012/ktutk_2012_2014-05-26_en.pdf)

24. [Grocery stores are close to the home](https://stat.fi/til/ktutk/2012/ktutk_2012_2014-05-26_tie_001_en.html) - Statistics Finland's Household Budget Survey produces data on changes in the consumption expenditure...

25. [Priority Places for Food Index - Version 2 Released - Consumer Data Research Centre](https://www.cdrc.ac.uk/updated-priority-places-for-food-index/) - The Priority Places for Food Index (PPFI), developed as a collaboration between the Consumer Data Re...

26. [Priority Places for Food - examples of high-priority neighbourhoods across England, Wales, and Scotland - Consumer Data Research Centre](https://www.cdrc.ac.uk/priority-places-for-food-examples-of-high-priority-neighbourhoods-across-england-wales-and-scotland/) - The Priority Places for Food Index (PPFI), developed as a collaboration between the Consumer Data Re...

27. [Priority places for food | RGS](https://www.rgs.org/about-us/what-is-geography/geovisualisation/priority-places-for-food)

28. [Identifying drivers of food insecurity through linked data- the Priority ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC10895572/)

29. [Project: Priority Places for Food Index](https://hasp.ac.uk/project/priority-places-for-food-index/) - The Priority Places for Food Index identifies neighbourhoods across the UK that are vulnerable to in...

30. [Priority Places for Food Index V2.1](https://data.hasp.ac.uk/browser/dataset/5276/0) - The Priority Places for Food Index (PPFI) is a composite index constructed using open data to captur...

31. [Identifying areas at highest food insecurity through open data](https://eprints.whiterose.ac.uk/id/eprint/212392/1/GISRUK_2023_paper_1860.pdf) - The Priority Places for Food Index highlights drivers of food insecurity across seven domains around...

32. [Assessing the presence of e-food deserts in the UK](https://www.cdrc.ac.uk/research/retail/assessing-the-presence-of-e-food-deserts-in-the-uk/) - Assessing the presence of e-food deserts in the UK The e-food deserts index (EFDI) is a multi-dimens...

33. [CDRC analysis uncovers new rural e-food deserts](https://www.cdrc.ac.uk/cdrc-analysis-uncovers-new-rural-e-food-deserts/) - CDRC analysis uncovers new rural e-food deserts A new small area ‘e-food deserts index’ (EFDI) produ...

34. [Food purchase data reveals the locations of London's 'food deserts'](https://journals.plos.org/complexsystems/article?id=10.1371%2Fjournal.pcsy.0000072) - Author summary Poor diets are a major risk to health, contributing to 13% of deaths in the UK, and o...

35. [Canadian Food Environment Dataset: User Guide](https://www150.statcan.gc.ca/n1/pub/13-20-0001/132000012025002-eng.htm) - The purpose of this document is to describe the development and user considerations for the Can-FED ...

36. [Canadian Food Environment Dataset: Data File](https://www150.statcan.gc.ca/n1/pub/13-20-0001/132000012025001-eng.htm) - The Can-FED is a geographic-based set of measures that represents the food environment of Canadian c...

37. [Canadian Food Environment Dataset: User Guide](https://publications.gc.ca/collections/collection_2025/statcan/132000012025002-eng.pdf) - The purpose of this document is to describe the development and user considerations for the Can-FED ...

38. [Identifying rural food deserts: Methodological considerations for food ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC6972151/) - OBJECTIVES: Food insecurity in an important public health issue and affects 13% of Canadian househol...

39. [Generating community measures of food purchasing activities using ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC10195567/) - by H Mamiya · 2021 · Cited by 2 — Generating community measures of food purchasing activities using ...

40. [Food Access Research Atlas - About the Atlas - ers.usda.gov](https://www.ers.usda.gov/data-products/food-access-research-atlas/about-the-atlas) - The Food Access Research Atlas maps food access indicators for census tracts using ½-mile and 1-mile...

41. [Food Access Research Atlas - ers.usda.gov](https://www.ers.usda.gov/data-products/food-access-research-atlas) - The Food Access Research Atlas interactive guide provides an overview of the Food Access Research At...

42. [Food Environment - Food Desert Census Tracts - SparkMap](https://sparkmap.org/data-info/food-environment-food-desert-census-tracts/) - This indicator reports the number of neighborhoods in the report area that are within food deserts. ...

43. [Mapping Food Deserts in the United States - ers.usda.govwww.ers.usda.gov › data-feature-mapping-food-deserts-in-the-u-s](https://www.ers.usda.gov/amber-waves/2011/december/data-feature-mapping-food-deserts-in-the-u-s) - ERS's Food Desert Locator is a mapping tool that presents a spatial overview of where food deserts a...

44. [Investigating the Spatial Dimension of Food Access - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5580570/) - The purpose of this article is to investigate the sensitivity of food access models to a dataset’s s...

45. [SSBs statistikkbank](https://data.norge.no/nb/datasets/e74957b7-d052-4d93-9afb-4a2fce65882f) - Statistikkbanken til Statistisk sentralbyrå har over 6000 tabeller og dekker de fleste samfunnsområd...

46. [Dagligvare | Geodata Online](https://dokumentasjon.geodataonline.no/docs/Temakart/Dagligvare/) - Karttjenesten inneholder dagligvarebutikker i Norge, hentet fra Prognosesenterets butikkregister. Re...

47. ["All retail sectors are highly concentrated"](https://www.nhh.no/en/research-centres/food/food-news/2024/all-retail-sectors-are-highly-concentrated/) - This is claimed by Professor Frode Steen, who is currently particularly concerned with the grocery i...

