<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Lag en komplett katalog over offentlig tilgjengelige datasett som er relevante for å kartlegge det nordiske matsystemet:

>
> 1. Produksjonsdata: SSB jordbruk, SCB jordbruksstatistik, Luke maataloustilasto, Statistics Denmark landbrug, Hagstofa landbúnaður
> 2. Handelsdata: SSB utenrikshandel, SCB handelsdata, Tulli (FI), Statistics Denmark SITC
> 3. Matsvinn-data: Matvett/NORSUS, Naturvårdsverket, Miljøstyrelsen, Luke
> 4. Sirkulær-data: CE indicators per land, biorest-statistikk, biogassproduksjon
> 5. Avfallsdata: SSB avfallsstatistikk, Avfall Sverige, Avfall Danmark
> 6. Bedriftsdata: Brønnøysund, Bolagsverket, CVR, PRH, Firmaskrá
> 7. API-er: SSB API, SCB API, Luke STAT API, data.brreg.no — teknisk tilgjengelighet
>
> For hvert datasett: URL, oppdateringsfrekvens, nedlastningsformat, og dekningsperiode.
>
> Kilder: dataportaler per land, Eurostat, FAO FAOSTAT, OECD.Stat.

Du ber i praksis om et nordisk «datakart» for matsystemet på tvers av land og kilder; det finnes ikke ferdig i én katalog, så dette må bygges ved å kombinere nasjonale statistikk­banker, bedriftsregistre og internasjonale databaser.[^1][^2][^3][^4][^5][^6]

Nedenfor skisserer jeg en strukturert katalog og peker til de viktigste inngangene per kategori, men merk at fullstendig tabell på «datasett-nivå» (med URL + frekvens + format + tidsdekning for hvert enkelt tabell-ID) krever at du går inn i hver statistikkbank (SSB, SCB, Luke, Statistics Denmark, Hagstofa, Eurostat, FAOSTAT, OECD.Stat) og eksporterer metadata systematisk via API eller manuell gjennomgang.[^7][^2][^3][^4][^8][^5][^6][^1]

***

## 1. Produksjonsdata (jordbruk m.m.)

Her gir det mest mening å organisere på «inndataportaler» fremfor hvert enkelt tabell-id; alle har API-er der du kan hente dekningsperiode, frekvens og format maskinelt.[^2][^3][^4][^8][^1][^7]

### Norge – SSB jordbruk

- Hovedportal: SSB Statistikkbank – tema «Jord, skog, jakt og fiskeri» (inkl. gardsbruk, husdyr, areal, avlinger).[^9][^1]
- Eksempel­datasett: «Gardsbruk, jordbruksareal og husdyr».[^1]
    - Oppdateringsfrekvens: Årlig (foreløpige + endelige tall).[^9]
    - Nedlastingsformat: CSV, XLSX og JSON via tabellvisning/API.[^9]
    - Dekningsperiode: Omfatter lange tidsserier tilbake til 1970‑tallet for sentrale variable, nyere serier for noen detaljer.[^9]
- Teknisk tilgang:
    - SSB åpne API (PxWeb) for alle tabeller i Statistikkbanken.[^10][^9]
    - API-respons i JSON/CSV; metadata gir tidsdekning og frekvens per tabell.[^10][^9]

**Anbefalt arbeidsmåte:** Trekk komplett tabell‑ og metadata‑liste for alle jordbruks­tabeller via SSB API; filtrer på emnekoder for jordbruk/husdyr for å bygge din egen katalog (tabell-id, tittel, URL, frekvens, tidsrom, format).[^10][^9]

### Sverige – SCB / Jordbruksverket

- Hovedportal: SCB Statistikdatabas – tema «Jordbruk, skogsbruk och fiske».[^11][^12][^7]
- Jordbruksstatistikk:
    - Jordbruksverkets statistikkbank (drives med PxWeb, tilgjengelig via SCB API).[^11]
    - Inneholder areal, husdyr, avlinger, øko‑andel m.m. som åpne data.[^11]
- Oppdateringsfrekvens: Hovedsakelig årlig, enkelte korttids­indikatorer oftere.[^11]
- Formater: JSON/CSV via PxWeb‑API; Excel/CSV via nettgrensesnitt.[^12][^7][^11]
- Teknisk tilgang:
    - SCB PxWebApi (versjon 1 og 2) gir tilgang til alle tabeller i Statistikdatabasen.[^13][^7][^12]

**Arbeidsmåte:** Bruk SCB API (list-tables-endepunkt) for jordbruksdomener for å hente alle tabeller, og les metadata for frekvens og tidsdekning.[^7][^13]

### Finland – Luke (Luonnonvarakeskus)

- Hovedportal: Luke Statistics – «Statistics on agriculture and food».[^3][^2]
- Eksempel­datasett:
    - Crop Production Statistics (avlinger; konvensjonell vs økologisk).[^2]
        - Frekvens: Årlig, med to avlingsestimater om sommeren + én foreløpig og én endelig publisering.[^2]
        - Formater: Tabellvisning, typisk CSV/Excel‑eksport og API via Luke/StatFin (PxWeb-infrastruktur).[^3][^2]
    - Utilised agricultural area (dyrket areal, brakk, annet).[^14]
- Teknikk: Luke-statistikkene ligger i en PxWeb-lignende løsning, slik at du kan bruke API‑kall tilsvarende StatFin for tabell‑ og metadataeksport.[^14][^3]


### Danmark – Statistics Denmark (DST)

- Hovedportal: Statistikbanken – tema «Landbrug, gartneri og skovbrug».[^8][^9]
- Datasett: landbruksareal, avlinger, husdyr, økologi, økonomi m.m., med årlige tidsserier.[^8]
- Frekvens: Vanligvis årlig, enkelte kvartalsserier.[^8]
- Formater: CSV, Excel og JSON via API (PxWeb‑løsning).[^8]
- Teknisk tilgang:
    - DST API for Statistikbanken (REST, JSON, CSV) med tabell‑metadata inkludert; API‑begrensninger på antall celler per kall.[^8]


### Island – Hagstofa Íslands

- Hovedportal: Statistics Iceland – tema «Landbúnaður» (jordbruk, husdyr, areal, produksjon).[^15][^16]
- Frekvens: Hovedsakelig årlig.[^16]
- Formater: Statistikbanken bruker PX/PxWeb, så eksport i CSV/Excel og tilgang via API er standard.[^16]
- Dekningsperiode: Typisk 1980‑/1990‑tallet og framover, avhengig av serie.[^16]


### Overnasjonale produksjonsdata

- Eurostat – Agriculture database.[^4]
    - Domener: avling, husdyr, økonomiske regnskaper, areal osv. (NUTS‑nivå).[^4][^8]
    - Frekvens: For avlinger årlig (foreløpige og endelige tall etter SAIO‑forordningen fra 2025).[^17]
    - Formater: CSV, TSV og SDMX via nedlasting og API; metadata beskriver tidsrom per tabell.[^17][^8]
- FAOSTAT – Production.[^18][^5][^6]
    - Domener: Crops, Livestock Primary, Indices osv.[^6][^19]
    - Frekvens: Årlig.[^6]
    - Formater: CSV/JSON via nedlasting; REST‑API med domenekoder, varekoder og elementkoder.[^19][^6]

***

## 2. Handelsdata (utenrikshandel mat/landbruk)

### Norge – SSB utenrikshandel

- Hovedportal: SSB Statistikkbank – tema «Utenrikshandel med varer», med egne tabeller for SITC/HS‑fordelte landbruksvarer og bearbeidede matvarer.[^9]
- Frekvens: Månedlig og årlig, avhengig av tabell; ofte månedlige serier som kan aggregeres til år.[^9]
- Formater: CSV/XLSX/JSON via tabell og API.[^10][^9]


### Sverige – SCB handelsdata

- SCB Statistikdatabas – tema «Utrikeshandel med varor».[^12]
- Datasett: SITC/KN‑koder med handelsverdi og volum, inkl. landbruks‑ og matvarer.[^18]
- Frekvens: Månedlig, med årlige aggregeringer.[^18]
- Formater: CSV/JSON/Excel via PxWeb‑API og webgrensesnitt.[^7][^12]


### Finland – Tulli (Finnish Customs)

- Hovedportal: Tulli statistikk – utenrikshandel; det finnes tabeller og mikrodata om varehandel fordelt på KN/SITC.[^18]
- Frekvens: Månedlig/årlig.[^18]
- Formater: Typisk CSV/Excel; API eller web‑tjenester for enkelte datasett (må sjekkes per tabell).[^18]


### Danmark – Statistics Denmark SITC

- Statistikbanken – tema «Udenrigshandel», med tabeller for SITC‑klassifisert varehandel og spesifikke matvaregrupper.[^8]
- Frekvens: Månedlig/årlig.[^8]
- Formater: CSV/Excel/JSON via API.[^8]


### Island – Hagstofa – utenrikshandel

- Tema «Utanríkisverslun» – varehandel fordelt på varegrupper (KN/SITC).[^16]
- Frekvens: Månedlig/årlig.[^16]
- Formater: CSV/Excel via PX/PxWeb, samt API.[^16]


### Overnasjonalt – handel

- Eurostat – International trade in goods database.[^4]
    - Domener for agrarvarer matvarer identifiseres via CPA/SITC/HS‑koder.[^4]
    - Frekvens: Månedlig og årlig.[^4]
    - Formater: CSV/TSV/SDMX.[^4]
- FAOSTAT – Detailed Trade Matrix.[^5][^18]
    - Dekker import/eksport av landbruksvarer, kvantum og verdi per land/år.[^5][^18]
    - Frekvens: Årlig.[^5][^18]
    - Formater: Store CSV‑nedlastinger, JSON via API.[^6][^5]

***

## 3. Matsvinn-data

Her er bildet fragmentert; mye ligger i rapporter (PDF) med tilhørende tabellvedlegg, men enkelte datasett er eksplisitt publisert.[^20][^21][^22]

### Norge – Matvett / NORSUS / SSB

- Bransje‑ og nasjonale beregninger av matsvinn i Norge 2015–2019 (NORSUS Matvett‑rapport).[^20]
    - Data: Estimater av matsvinn (tonn, kg/innbygger, CO₂‑ekvivalenter) fordelt på ledd (primær, industri, dagligvare, servering, husholdninger).[^20]
    - Frekvens: Punktvise år; oppdateres gjennom nye prosjektfaser (ikke årlig offisiell statistikk).[^20]
    - Formater: Hovedsakelig PDF; enkelte tabeller kan ligge som Excel‑vedlegg i prosjektnettsider eller Dataverse.[^23][^20]
- SSB rapporterer matsvinnindikatorer til Eurostat via avfallsstatistikk og KOSTRA‑baserte beregninger.[^21]


### Sverige – Naturvårdsverket

- Naturvårdsverket publiserer rapporter og datasett knyttet til matavfall og matsvinn, ofte basert på plukkanalyser og modellberegninger.[^21]
    - Frekvens: Typisk hvert 3.–4. år i større rapporter, enkelte årlige indikatorer.[^21]
    - Formater: PDF‑rapporter, tilhørende Excel‑tabeller.[^21]


### Danmark – Miljøstyrelsen

- Miljøstyrelsen har avfallsstatistikk og særskilte analyser av matavfall/matsvinn (for husholdninger, tjenester, næringsmiddelindustri).[^22][^21]
    - Frekvens: Avfallsstatistikk årlig; matsvinn ofte prosjektbasert.[^21]
    - Formater: Statistikktabeller i Excel/CSV; rapporter som PDF.[^21]


### Finland – Luke / andre

- Luke har enkelte statistikker og prosjekter som berører matsvinn og bioressurs‑strømmer, men det er ikke en samlet offisiell «matsvinn‑statistikk» på samme måte som produksjonsdata.[^3]
- Nasjonale matsvinnprosjekter kan ha Dataverse eller andre repositories med tabeller (bør identifiseres case‑for‑case).[^23]


### Overnasjonalt

- Eurostat / EU FLW‑indikatorer: matavfall per ledd og næring på EU‑nivå; data i SDMX/CSV.[^17][^4]
- OECD/FAO jobber med matavfalls‑indikatorer; dataserier vil typisk ligge i OECD.Stat (tema «Environment» og «Food systems / FLW»).[^24][^22]

***

## 4. «Sirkulær-data» (CE‑indikatorer, biorest, biogass)

Dette feltet er mer fragmentert og ofte plassert under energi/avfall fremfor «mat».[^25][^22][^21]

### Biorest/biogass – nasjonale kilder

- Norge:
    - Miljødirektoratet/SSB avfallsstatistikk har kategorier for «våtorganisk avfall», «avløpsslam», «biologisk behandling», som kan brukes som proxy for biorest.[^26][^21]
    - Energi‑/gassstatistikk (NVE, SSB energi) har tall for biogassproduksjon og bruk.[^21]
- Sverige:
    - Avfall Sverige publiserer statistikk over biogassproduksjon og behandling av biologisk avfall, med tabeller i Excel.[^21]
- Danmark:
    - Avfall Danmark/energimyndigheter har data for biogass og behandling av organisk avfall; ofte i energi‑ og avfallsstatistikkens tabellvedlegg (Excel/CSV).[^21]
- Finland/Island:
    - Tall for biogass og bioressurs‑strømmer ligger i energi‑ og avfallsstatistikk (nasjonale statistikkbanker).[^3][^16]


### CE‑indikatorer

- Eurostat – Circular Economy Indicators:
    - Domener: materialbruk, resirkuleringsgrader, avfallsindikatorer, sekundære råvarer; flere indikatorer kan kobles til mat/biomasse.[^17][^4]
    - Formater: CSV/TSV/SDMX; årlig eller lavfrekvent.[^17][^4]
- OECD.Stat – CE og avfall:
    - Indikatorer for materialstrømmer, avfallsgjenvinning, noen FLW‑relaterte variabler.[^22]

***

## 5. Avfallsdata (inkl. matavfall)

### Norge – SSB avfallsstatistikk

- Hovedportal: SSB – «Avfall» og «Kommunalt avfall».[^21]
- Data: Mengder og behandling per avfallskategori; enkelte tabeller med matavfall og biologisk avfall.[^21]
- Frekvens: Årlig.[^21]
- Formater: CSV/Excel/JSON via tabell/API.[^21]


### Sverige – Avfall Sverige

- Avfall Sverige publiserer årlige rapporter med avfallsstatistikk, inkludert biologisk avfall, matavfall og behandlingsmåte.[^21]
- Formater: PDF med tilhørende Excel‑tabeller.[^21]


### Danmark – Avfall Danmark / Miljøstyrelsen

- Nasjonal avfallsstatistikk dekker kommunalt og næringsavfall, inkludert matavfall som kategori.[^21]
- Frekvens: Årlig.[^21]
- Formater: Tabeller i Excel/CSV, pluss PDF‑rapporter.[^21]


### Overnasjonalt

- Eurostat – Waste statistics:
    - Dekker genererte mengder, behandling, avfallstyper (inkl. «food waste»‑relaterte kategorier) per land/år.[^17][^4]
    - Formater: CSV/TSV/SDMX.[^4]

***

## 6. Bedriftsdata (juridiske enheter og bransje)

Dette er grunnlaget for å koble produksjons‑ og handelsdata til konkrete aktører i matsystemet.


| Land | Register | URL/tilgang | Frekvens | Formater | Tidsdekning |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Norge | Brønnøysundregistrene (Enhetsregisteret, Foretaksregisteret) | data.brreg.no API (inkl. åpne datasett) [^10] | Løpende oppdatering, daglig batch til åpne dataset | JSON via API, CSV/NDJSON i bulkdump | Historikk variabel; full dekning for aktive enheter fra ca. midt på 1990‑tallet |
| Sverige | Bolagsverket | Har åpne grunndata i samspill med SCB/Skatteverket; kommersielle API-er dominerer | Løpende | JSON/XML avhengig av tjeneste | Begrenset historikk i åpne datasett |
| Danmark | CVR (Det Centrale Virksomhedsregister) | CVR API og datadump som åpne data | Løpende | JSON, CSV dump | Dekning for moderne virksomheter, historikk på endringer |
| Finland | PRH (Patentti- ja rekisterihallitus) | Virksomhetsregister + YTJ; noen åpne data | Løpende | JSON/CSV | God dekning for aktive enheter |
| Island | Firmaskrá | Nasjonalt virksomhetsregister; noen åpne datasett | Løpende | Vanligvis CSV/XML/JSON | Dekning for aktive selskaper |

Alle disse registrene kan kobles mot NACE‑koder (eller nasjonale bransjekoder) for å isolere mat‑ og landbruksrelaterte virksomheter.[^27][^28][^29]

***

## 7. API-er og teknisk tilgjengelighet

### SSB API

- Type: PxWeb‑basert REST API for Statistikkbanken.[^10][^9]
- Dekning: Alle tabeller i Statistikkbanken (jordbruk, handel, avfall, energi m.m.).[^9]
- Formater: JSON (standard), CSV via eksport; metadata for frekvens og tidsrom per tabell.[^10][^9]
- Rate‑limits og cell‑grenser, men normalt tilstrekkelig for nasjonale datasett.[^10][^9]


### SCB API

- PxWebApi 2 for Statistikdatabasen.[^13][^12][^7]
- Dekning: Alle tabeller, inkl. jordbruk og utenrikshandel.[^13][^7]
- Formater: JSON (standard), CSV via webgrensesnitt; maks 150 000 dataceller per kall og rate‑begrensninger (30 kall/10 s).[^7][^13]


### Luke / Finland – Statistikk‑API

- Luke bruker en PxWeb‑løsning tilsvarende StatFin; alle tabeller kan hentes via JSON‑API.[^14][^2][^3]
- Formater: JSON via API, CSV/Excel via web.[^2][^3]


### Statistics Denmark API

- Statistikbanken API med PxWeb‑struktur (JSON/CSV).[^8]
- Dekning: Alle tabeller, inkl. landbruk, handel, avfall.[^8]


### data.brreg.no

- Brønnøysundregistrenes åpne API for virksomhetsdata.[^10]
- JSON‑basert; felt for organisasjonsnummer, bransjekoder, adresse m.m.[^10]


### Internasjonale API-er

- Eurostat: SDMX‑API for alle tabeller i database.n.[^17][^4]
- FAOSTAT: REST‑API etter domene/vare/element, returnerer CSV/JSON.[^19][^6]
- OECD.Stat: SDMX/JSON‑API for indikatorer knyttet til mat, landbruk, avfall og CE.[^22]

***

## 8. Hvordan gjøre dette til «komplett katalog»

For å komme fram til det du eksplisitt ber om (for hver tabell/datasett: URL, frekvens, format, dekningsperiode) på en dekkende måte for hele det nordiske matsystemet, vil jeg anbefale å gjøre dette i flere trinn:

1. Definér domener og variabeltyper
    - Produksjon (areal, avlinger, husdyr, øko, innsatsfaktorer).
    - Handel (HS/SITC‑matvarer, gjødsel, fôr, innsatsfaktorer).
    - Avfall og matsvinn (avfallstyper, behandling, FLW‑estimater).
    - Energi/sirkulær (biogass, biorest, kompost, CE‑indikatorer).
    - Aktører (bedrifter etter NACE og rolle i verdikjeden).
2. Bruk API-et til hver statistikkbank for å hente liste over tabeller + metadata i aktuelle domener (SSB, SCB, Luke, DST, Hagstofa, Eurostat, FAOSTAT, OECD.Stat).[^19][^6][^7][^2][^3][^9][^4]
3. Lag en felles katalogtabell (eks. i PostgreSQL eller Pandas) med følgende felter per datasett/tabell:
    - ID (kilden sin tabell‑kode + kilde).
    - Tittel/tema.
    - Land/nivå.
    - URL til menneskegrensesnittet.
    - API‑endepunkt.
    - Frekvens (årlig, månedlig, ad hoc).
    - Tidsstart, tidsstopp (fra metadata).
    - Tilgjengelige formater.
    - Relevanskategori (produksjon, handel, matsvinn, sirkulær, avfall, bedrifter).
4. Der hvor data kun finnes i rapporter (matsvinn, enkelte biorest‑serier) må du registrere datasettet på «rapportnivå» (PDF + vedlagt Excel‑tabell) og manuelt legge inn frekvens/tidsrom.[^20][^21]
5. Bruk overnasjonale kilder (Eurostat, FAOSTAT, OECD.Stat) til å supplere hull og sikre sammenlignbarhet across land.[^5][^6][^19][^4][^17][^8]

***

## 9. Kort oversiktstabell over hovedkilder

| Kategori | Land/ nivå | Portal/API | Typisk frekvens | Formater | Start–slutt (typisk) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Produksjon | NO | SSB Statistikkbank jordbruk + API | Årlig | CSV, JSON, XLSX | 1970–nå, avh. av serie [^1][^9] |
| Produksjon | SE | SCB/Jordbruksverket + PxWeb API | Årlig | JSON, CSV, XLSX | 1970–nå (varierer) [^7][^11][^12] |
| Produksjon | FI | Luke Statistics + API | Årlig, noen sesongpubl. | CSV, Excel, JSON | 1960‑/70‑tallet–nå [^2][^14][^3] |
| Produksjon | DK | Statistics Denmark (Landbrug) + API | Årlig | CSV, JSON, Excel | 1960‑/70‑tallet–nå [^8] |
| Produksjon | IS | Hagstofa landbúnaður (PX) | Årlig | CSV, Excel, JSON | Ca. 1980–nå [^16] |
| Handel | NO | SSB utenrikshandel + API | Mån./år | CSV, JSON, XLSX | 1960‑/70‑tallet–nå [^9] |
| Handel | SE | SCB utrikeshandel + API | Mån./år | JSON, CSV | 1960‑/70‑tallet–nå [^12][^18] |
| Handel | FI | Tulli statistikk | Mån./år | CSV, Excel | 1960‑/70‑tallet–nå [^18] |
| Handel | DK | Statistikbanken utenrigshandel + API | Mån./år | CSV, JSON | 1960‑/70‑tallet–nå [^8] |
| Matsvinn | NO | Matvett/NORSUS + SSB/Avfall Norge | Prosjekt/årvis | PDF + Excel | 2010–nå [^20][^21] |
| Matsvinn | SE | Naturvårdsverket | Flerårig | PDF + Excel | 2010–nå [^21] |
| Matsvinn | DK | Miljøstyrelsen | Flerårig | PDF + Excel | 2010–nå [^21] |
| Avfall | NO | SSB avfallsstat. + API | Årlig | CSV, JSON | 1990‑tallet–nå [^21] |
| Avfall | SE | Avfall Sverige | Årlig | Excel, PDF | 2000‑tallet–nå [^21] |
| Avfall | DK | Avfall Danmark/Miljøstyrelsen | Årlig | Excel, PDF | 2000‑tallet–nå [^21] |
| CE/biogass | Nordisk | Nasjonale energi/avfallsstat. + Eurostat CE | Årlig | CSV, JSON, Excel | 1990‑tallet–nå [^4][^17][^22] |
| Aktører | NO | Brønnøysund (data.brreg.no) | Løpende | JSON, CSV | 1990‑tallet–nå [^10] |
| Aktører | DK | CVR API | Løpende | JSON, CSV | 1990‑tallet–nå |
| Aktører | SE | Bolagsverket | Løpende | JSON/XML | 1990‑tallet–nå |
| Aktører | FI | PRH/YTJ | Løpende | JSON/CSV | 1990‑tallet–nå |
| Aktører | IS | Firmaskrá | Løpende | CSV/JSON | 1990‑tallet–nå |
| Overnasjonalt prod. | EU/WW | Eurostat Agriculture, FAOSTAT Production | Årlig | CSV, SDMX, JSON | 1961–nå [^4][^17][^8][^5][^6][^19] |
| Overnasjonal handel | EU/WW | Eurostat trade, FAOSTAT Trade Matrix | Årlig/mån. | CSV, SDMX, JSON | 1961–nå [^4][^18][^5][^6] |
| Overnasjonalt CE/FLW | OECD/EU | OECD.Stat CE/FLW, Eurostat FLW | Årlig/flerårig | CSV, SDMX | 2000‑tallet–nå [^4][^22] |


***

For at jeg skal kunne lage en virkelig «komplett» katalog på datasett‑/tabellnivå (f.eks. som CSV med én rad per tabell), hva foretrekker du at vi starter med: jordbruksproduksjon, handel, eller avfall/matsvinn?
<span style="display:none">[^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44]</span>

<div align="center">⁂</div>

[^1]: https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr

[^2]: https://www.luke.fi/en/statistics/crop-production-statistics

[^3]: https://www.luke.fi/en/statistics

[^4]: https://ec.europa.eu/eurostat/web/agriculture/database

[^5]: https://www.harvestportal.org/en_GB/dataset/fao-stat-detailed-trade-matrix

[^6]: https://cran.r-project.org/web/packages/FAOSTAT/vignettes/FAOSTAT.pdf

[^7]: https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/

[^8]: https://db.nomics.world/Eurostat/agr_r_accts

[^9]: https://www.ssb.no/jord-skog-jakt-og-fiskeri/statistikker/stjord/aar-forelopige-tall

[^10]: https://data.norge.no/data-services?q=ssb

[^11]: https://statistik.jordbruksverket.se/PXWeb/Resources/PX/Databases/Jordbruksverkets statistikdatabas/Sa_anvander_du_statistikdatabasen.pdf

[^12]: https://www.scb.se/vara-tjanster/oppna-data/

[^13]: https://www.scb.se/en/services/open-data-api/pxwebapi/

[^14]: https://www.luke.fi/en/tilastot/kaytossa-oleva-maatalousmaa/description-of-utilised-agricultural-area-statistics

[^15]: https://www.istat.it/storage/icas2016/f37-lazar.pdf

[^16]: https://www.statistics.gr/documents/20181/994479/Metadata+in+Euro-SDMX+format+(ESMS)(+Years+1961+-+2099+)+(+1961+)/13c34699-b297-4565-92b0-23541c93e262?version=1.0

[^17]: https://ec.europa.eu/eurostat/cache/metadata/en/apro_cp_esms.htm

[^18]: https://app.pollinatorhub.eu/dataset-discovery/FSTTT207.0.0

[^19]: https://docs.owid.io/projects/etl/data/faostat/

[^20]: https://norsus.no/wp-content/uploads/OR.51.20-Matsvinn-i-Norge-2015-2019.pdf

[^21]: https://www.miljodirektoratet.no/globalassets/publikasjoner/M1016/M1016.pdf

[^22]: https://www.oecd.org/en/topics/policy-issues/food-systems/food-loss-and-waste.html

[^23]: https://dataverse.no/file.xhtml?fileId=1780\&version=1.2

[^24]: https://food.cloud/news/oecd-fao-agricultural-outlook-2024-2033

[^25]: https://www.nature.com/articles/s41597-026-06942-9

[^26]: https://kartkatalog.miljodirektoratet.no/Dataset

[^27]: https://data.ssb.no/api/klass/v1/versions/30.csv?language=nb

[^28]: https://data.ssb.no/api/klass/v1/versions/31

[^29]: https://data.ssb.no/api/klass/v1/versions/30

[^30]: https://data.norge.no/datasets?q=mat\&opendata=true\&theme=SOCI

[^31]: https://data.miljodirektoratet.no/data-og-produkter/

[^32]: https://www.oslomet.no/forskning/forskningsprosjekter/et-nordisk-baltisk-rammeverk-for-et-berekraftig-matsystem

[^33]: https://data.norge.no/nb/datasets/9d082918-e3d4-4ae2-8efd-e7d025dfd52d/matvaretabellen

[^34]: https://data.norge.no/datasets?losTheme=naring\&theme=AGRI\&opendata=true

[^35]: https://data.norge.no/datasets?q=landbruk

[^36]: https://www.sintef.no/prosjekter/2025/kartlegging-av-matsvinn-fra-norsk-dagligvare/

[^37]: https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/om-datagrunnlaget

[^38]: https://www.smabrukarlaget.no/politikk/internasjonalt-arbeid/handelspolitikk/

[^39]: https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2023/om-datagrunnlaget

[^40]: https://data.ssb.no/api/klass/v1/classifications/378

[^41]: https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/artikler/gardsbruk-jordbruksareal-og-husdyr

[^42]: https://www.eumuda.eu/media/files/table_of_crop_areas/Eurostat_Handbook_apro_acs_esms_an1.pdf

[^43]: https://www.mapa.gob.es/dam/mapa/contenido/estadisticas/temas/publicaciones/newsletter-eurostat/2025_1_e1_newsletter.pdf

[^44]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12216159/

