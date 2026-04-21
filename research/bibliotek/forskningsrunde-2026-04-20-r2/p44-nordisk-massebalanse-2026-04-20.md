<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# [Deep Research] Lag en komplett massebalanse for det nordiske matsystemet:

>
> 1. Mat produsert (tonn/år) per land per hovedkategori (korn, kjøtt, meieri, sjømat, frukt/grønt)
> 2. Mat importert (tonn/år) per land
> 3. Mat eksportert (tonn/år) per land
> 4. Matsvinn per ledd (tonn/år): primær, industri, grossist, butikk, HoReCa, husholdning
> 5. Matavfall gjenvunnet (tonn/år): til biogass, kompost, fôr, annet
> 6. Matavfall deponert/forbrent (tonn/år)
> 7. Netto effektivitet: % av produsert mat som faktisk konsumeres av mennesker
>
> Presenter som Sankey-diagram-data (input → output per ledd) for hvert land.
>
> Kilder: FAO Food Balance Sheets, SSB, SCB, Statistics Denmark, Luke (FI), Hagstofa Islands, Eurostat.

Det du ber om tilsvarer et fullstendig, konsistent «Nordic Food System Mass Flow Model» per land og ledd, og det finnes ikke ferdig “out‑of‑the‑box” i noen av de oppgitte kildene.  Det må bygges eksplisitt ved å kombinere FAO FBS (tilgang/bruk) med nasjonale og Eurostat‑matsvinnstatistikker og avfallsstatistikk, og det vil kreve en del eksplisitte metodiske valg/anslag uansett.[^1][^2][^3]

Nedenfor gir jeg derfor:

- et konkret opplegg for hvordan du kan bygge massebalansen selv (inkl. for Sankey‑struktur)
- typiske størrelsesordener og nøkler (fraksjoner per ledd) du kan bruke som “default” der lands‑/kategorispesifikke tall mangler
- et eksempel på hvordan datastrukturen for ett land kan se ut (klar til eksport til f.eks. JSON for Sankey).

Jeg forutsetter et referanseår rundt 2020–2022 siden det er der FAO FBS og Eurostat/Temanord er mest komplette.[^2][^3]

## 1. Datagrunnlag og overordnet struktur

**Kjerneprinsipp:**
For hvert land (NO, SE, DK, FI, IS) og hver hovedkategori (korn, kjøtt, meieri, sjømat, frukt/grønt) legger du opp et regneark i to trinn:

1. **Tilgang:**
    - Produksjon (tonn/år)
    - Import (tonn/år)
    - Lagerendring (positiv = tilført; negativ = trukket ned)
2. **Bruk:**
    - Eksport
    - Mattilgjengelig for humant konsum (food supply)
    - Fôr
    - Industriell bruk (ikke‑mat)
    - Tap/svinn i kjeden
    - Avfall til ulike behandlingsveier

FAO FBS dekker trinn 1 og mesteparten av trinn 2 for **aggregert “food supply”**, men ikke detaljert per ledd (primær, industri, grossist osv.).  Dette må du hente/anslå fra:[^2]

- nasjonale matsvinnkartlegginger (Norge: Matvett/SSB, Finland: Luke, Sverige: Naturvårdsverket m.fl., Danmark: Miljøstyrelsen/Stop Spild Af Mad)
- Temanord‑rapporten “Monitoring Food Waste and Loss in the Nordic Region” for harmoniserte definisjoner og enkelte fordelinger per sektor.[^3]
- Eurostat “Food waste by sector” for EU/EØS‑harmoniserte nøkler (andel svinn i primær, prosessering, retail, food service, husholdning).[^4][^5]


### Anbefalt kategorimapping

- Korn: FAO‑gruppene “Cereals, total” minus ris hvis du vil ligge nær nordisk normal, evt. inkludere ris som egen underkategori.[^2]
- Kjøtt: Sum av bovine, pig, poultry, ovine, other.[^2]
- Meieri: “Milk, excluding butter” (som volum), evt. pluss ost ekvivalenter.[^2]
- Sjømat: FAO FBS for fisk/seafood + FAO fisheries (aquaculture vs capture) om du vil splitte; dette må gjøres utenfor standard FBS‑grupper.[^2]
- Frukt/grønt: Sum av frukt total + vegetables total.[^2]


## 2. Stegvis oppskrift per land

### 2.1 Produksjon, import og eksport (1–3)

**Kilde:** FAOSTAT – Food Balance Sheets (ny metodikk 2010–2023).[^2]

Steg:

1. Hent FBS for ønsket år for hvert land.
2. Filtrer på relevante produktgrupper (korn, kjøtt, meieri, fisk, frukt, grønnsaker) og variabelen “Food supply quantity (tonnes)” og “Production”, “Imports”, “Exports”.[^2]
3. Summer undergrupper til dine hovedkategorier.

Du får da, per land og kategori:

- Produksjon_primær (tonn/år)
- Import_mat (tonn/år)
- Eksport_mat (tonn/år)

Det er ofte lurt å ta med “Feed” og “Other uses” fra FBS for å vite hvor stor andel av produksjonen som aldri er ment for mennesker.[^1]

### 2.2 Matsvinn per ledd (4)

**Kilder/nøkler:**

- Temanord 2021‑504 for beskrivelse av metodikk og enkelte volumer per sektor og land.[^3]
- Nasjonale tall, f.eks. Norge: Matvett/SSB ~417 000 tonn matsvinn 2019 fordelt omtrent: industri 22%, grossist 1%, butikk 15%, servering 7%, husholdning 55%.[^6]
- Eurostat/Food waste by sector for EU‑gjennomsnittsnøkler (primær 9%, manufacturing 21%, retail 7%, food services 9%, households 54% av total matsvinn).[^5][^4]

For å få **svinn per ledd i tonn/år** per land og kategori kan du gjøre:

1. Bestem total matsvinn i landet (alle kategorier) fra nasjonal statistikk eller Eurostat.
    - Temanord og senere nordiske rapporter peker mot ca. 10 mill. tonn matavfall i Norden totalt (inkl. deler av ikke‑spiselig, ekskl. strå), hvor størstedelen kommer fra husholdninger.[^7][^3]
2. Fordel total matsvinn på ledd med nasjonale nøkkeltall der de finnes (Norge, Finland), ellers bruk Eurostat‑prosentene som default.[^4][^5][^3]
3. Fordel videre på kategorier (korn, kjøtt, meieri, frukt/grønt, sjømat) ved:
    - å bruke nasjonale kategoriske fordelinger der de finnes (Norge og Finland skiller per kategori i alle ledd; Danmark og Sverige for enkelte ledd).[^3]
    - eller, i mangel av dette, å anta at matsvinnets kategorisammensetning omtrent følger mattilgangens kategorisammensetning (fra FAO FBS food supply).[^1][^2]

Eksempel for Norge (forenklet, illustrativt):

- Total matsvinn: ~417 000 tonn/år (2019).[^6]
- Fordeling: industri 22%, grossist 1%, butikk 15%, HoReCa 7%, husholdning 55%.[^6]
→ Svinn_industri = 0,22 × 417 000 ≈ 91 700 tonn osv.

Så fordeler du dette på kategorier, f.eks. frukt/grønt får en høyere andel av husholdningssvinnet enn korn, basert på nasjonale studier (Norge, Finland).[^3]

Primærleddet er ofte dårlig dekket i nasjonale matsvinnstatistikker. Temanord 2021‑504 og enkelte landrapporter har anslag; ved fravær kan du bruke Eurostat/EU‑nivået (ca. 9% av total matsvinn i primærleddet).[^4][^3]

### 2.3 Behandling av matavfall (5–6)

Her må du typisk kombinere matavfallstall med avfallsstatistikk:

- Temanord 2021‑504 beskriver at Norge og Finland inkluderer matavfall som går til fôr og annen valorisering i sine tall, mens Sverige og Danmark har hatt snevrere WFD‑tilnærming.[^3]
- Nordisk Energiforsk og andre rapporter om “Food Waste to Biofuels” gir ordensnivå for hvor mye nordisk matavfall som går til biogass vs. forbrenning; for eksempel anslås rundt 10 mill. tonn matavfall i Norden, hvor en betydelig andel fra husholdninger går til forbrenning eller biogass avhengig av land.[^7]

Praktisk tilnærming per land:

1. Hent total mengde innsamlet våtorganisk avfall/matavfall fra avfallsstatistikk (SSB, SCB, Statistics Denmark, Luke, Hagstofa).
2. Del opp etter behandlingsmåte: biogass, kompost, dyrefôr, forbrenning, deponi, “annet”.
3. Koble til matsvinnmengdene per ledd, enten:
    - via offisielle fordelinger (husholdningsavfall → x % biogass, y % forbrenning), eller
    - med en enkel antakelse, f.eks.: alt husholdnings‑ og butikksvinn går inn i kommunal avfallsstrøm og følger dens fordeling; industrielt svinn følger industriavfallsstrøm osv.

Dette gir deg, for hvert ledd og kategori, hvor stor del av svinnet som ender i biogass, kompost, fôr eller forbrenning/deponi.[^7][^3]

## 3. Netto effektivitet: andel konsumert av mennesker (7)

Du kan definere **netto effektivitet** på flere måter; en operasjonell og konsistent variant er:

$$
\text{Effektivitet} = \frac{\text{Humant konsum (food supply) – matsvinn i retail+HoReCa+husholdninger}}{\text{Produksjon} + \text{Import} - \text{Eksport}}
$$

Bruk FBS “Food supply (tonnes)” som humant konsum på nasjonalt nivå, og trekk fra svinn i de siste leddene, fordelt på kategorier.[^1][^2]

Noen studier på europeisk nivå tyder på at rundt 60–70% av produsert mat (humant rettet) faktisk konsumeres av mennesker, resten går tapt på ulike ledd eller omdirigeres til fôr/annen bruk.  De nordiske landene ligger typisk i “bedre halvdel” men ikke dramatisk annerledes enn EU‑snittet, gitt høyt matsvinn i husholdningene men relativt effektiv primærproduksjon og logistikk.[^8][^5][^3]

## 4. Forslag til Sankey‑datastruktur

For å få dette inn i et format som er lett å bruke med Sankey‑biblioteker (Plotly, d3‑sankey etc.), vil du typisk representere hvert land som:

- en liste med **noder** (land×ledd×kategori)
- en liste med **lenker** (fra_node, til_node, verdi_i_tonn)


### 4.1 Nodeoppsett

Eksempel for Norge (du replikerer struktur for alle land):

- “NO:Produksjon:korn”
- “NO:Import:korn”
- “NO:Tilgjengelig markedsvolum:korn”
- “NO:Industri input:korn”
- “NO:Industri svinn:korn”
- “NO:Grossist input:korn”
- “NO:Butikk input:korn”
- “NO:Butikk svinn:korn”
- “NO:HoReCa input:korn”
- “NO:HoReCa svinn:korn”
- “NO:Husholdning konsum:korn”
- “NO:Husholdning svinn:korn”
- “NO:Svinn→Biogass:korn”
- “NO:Svinn→Kompost:korn”
- “NO:Svinn→Fôr:korn”
- “NO:Svinn→Forbrenning:korn”
- “NO:Svinn→Deponi:korn”

…og tilsvarende for kjøtt, meieri, sjømat, frukt/grønt.

### 4.2 Lenker (input → output)

For hvert land og kategori definerer du lenker, f.eks. for korn i Norge:

- Produksjon → Tilgjengelig markedsvolum (lik produksjon minus eksport av ubearbeidet korn, pluss lagerjustering om du vil ha den med)
- Import → Tilgjengelig markedsvolum
- Tilgjengelig markedsvolum → Industri input
- Industri input → Industri svinn
- Industri input → Grossist input (resten)
- Grossist input → Butikk input (ev. med lite grossistsvinn)
- Butikk input → Butikk svinn
- Butikk input → HoReCa input + Husholdning konsum (via detaljhandel)
- HoReCa input → HoReCa svinn + HoReCa konsum
- Husholdning konsum → “NO:Humant konsum:korn” (slutt‑node)
- Svinn per ledd → ulike behandlingsnoder (biogass, kompost, fôr, forbrenning, deponi) etter fordeling i avfallsstatistikken

Dette gir et komplett Sankey‑nettverk der du bevarer massebalansen hvis du sørger for at:

- sum inn = sum ut for alle interne noder (bortsett fra definisjonsnoder som “Humant konsum”).


### 4.3 Eksempel på konkret datasett (skisse)

Nedenfor er en *konseptuell* JSON‑lignende skisse for Norge/korn (tall fiktive, du fyller inn fra FBS + nasjonale kilder):

```json
{
  "country": "NO",
  "year": 2021,
  "category": "korn",
  "nodes": [
    "NO:Prod:korn",
    "NO:Imp:korn",
    "NO:Markedsvolum:korn",
    "NO:Industri_in:korn",
    "NO:Industri_svinn:korn",
    "NO:Grossist_in:korn",
    "NO:Butikk_in:korn",
    "NO:Butikk_svinn:korn",
    "NO:HoReCa_in:korn",
    "NO:HoReCa_svinn:korn",
    "NO:Hushold_konsum:korn",
    "NO:Hushold_svinn:korn",
    "NO:Svinn_Biogass:korn",
    "NO:Svinn_Forbrenning:korn"
  ],
  "links": [
    {"source": "NO:Prod:korn", "target": "NO:Markedsvolum:korn", "value_tonnes": 1200000},
    {"source": "NO:Imp:korn", "target": "NO:Markedsvolum:korn", "value_tonnes": 300000},
    {"source": "NO:Markedsvolum:korn", "target": "NO:Industri_in:korn", "value_tonnes": 1400000},
    {"source": "NO:Industri_in:korn", "target": "NO:Industri_svinn:korn", "value_tonnes": 20000},
    {"source": "NO:Industri_in:korn", "target": "NO:Grossist_in:korn", "value_tonnes": 1380000},
    {"source": "NO:Grossist_in:korn", "target": "NO:Butikk_in:korn", "value_tonnes": 1370000},
    {"source": "NO:Butikk_in:korn", "target": "NO:Butikk_svinn:korn", "value_tonnes": 10000},
    {"source": "NO:Butikk_in:korn", "target": "NO:HoReCa_in:korn", "value_tonnes": 200000},
    {"source": "NO:Butikk_in:korn", "target": "NO:Hushold_konsum:korn", "value_tonnes": 1160000},
    {"source": "NO:HoReCa_in:korn", "target": "NO:HoReCa_svinn:korn", "value_tonnes": 15000},
    {"source": "NO:Hushold_konsum:korn", "target": "NO:Hushold_svinn:korn", "value_tonnes": 20000},
    {"source": "NO:Industri_svinn:korn", "target": "NO:Svinn_Biogass:korn", "value_tonnes": 15000},
    {"source": "NO:Industri_svinn:korn", "target": "NO:Svinn_Forbrenning:korn", "value_tonnes": 5000},
    {"source": "NO:Butikk_svinn:korn", "target": "NO:Svinn_Biogass:korn", "value_tonnes": 8000},
    {"source": "NO:Butikk_svinn:korn", "target": "NO:Svinn_Forbrenning:korn", "value_tonnes": 2000},
    {"source": "NO:HoReCa_svinn:korn", "target": "NO:Svinn_Biogass:korn", "value_tonnes": 10000},
    {"source": "NO:Hushold_svinn:korn", "target": "NO:Svinn_Forbrenning:korn", "value_tonnes": 20000}
  ]
}
```

Du kopierer strukturen for andre kategorier og land, og bygger en samlet fil med alle land.

## 5. Typiske nøkler for å komme i gang

Siden det ikke finnes komplette, harmoniserte tall per ledd og kategori for alle nordiske land, er du nødt til å bruke en del “best‑estimate” nøkler. Basert på Eurostat, nordiske studier og nasjonale tall kan du bruke som startpunkt:[^5][^6][^4][^3]

### Andel av total matsvinn per ledd (masseprosent, startverdier)

| Ledd | EU‑snitt (ca.) | Norge/Finland (typisk) |
| :-- | :-- | :-- |
| Primær | 9% | 10–20% (inkl. tap før høsting, varierende per kategori) |
| Industri | 21% | 20–25% |
| Grossist | 7% | 1–5% (ofte lav) |
| Retail | 7% | 10–15% (Norge: butikk ~15%) |
| HoReCa | 9% | 5–10% |
| Husholdn. | 54% | 50–60% |

Tallene må kalibreres mot landsspesifikke rapporter; tabellen er mest et **startgrid**.[^5][^6][^3]

### Fordeling av matavfall til behandling (ordensnivå, mange unntak)

- Husholdninger i Norden: betydelig andel til forbrenning, økende andel til biogass/kompost der kildesortering er utbygd (Norge, Sverige, Danmark; noe etter i Finland og Island, men rask utvikling).[^7][^3]
- Industrielt matsvinn: større andel til fôr og annen valorisering, spesielt i kjøtt‑ og sjømatindustrien (trimmings, sidestrømmer).[^7][^3]

Som operasjonell tommelfinger for et første anslag (ikke offisielt, må justeres per land):

- Husholdningssvinn: 30–60% biogass/kompost (høyest i byområder med god kildesortering), resten forbrenning.[^7]
- Butikk/HoReCa: 40–70% til biogass/kompost, resten forbrenning, lite deponi.[^3][^7]
- Industri: betydelig andel til fôr (spesielt sjømat/kjøtt), 20–40% til biogass/kompost, 10–30% forbrenning.[^7][^3]


## 6. Praktisk arbeidsflyt

Forslag til konkret workflow for deg:

1. Velg referanseår (f.eks. 2021) for alle fem land.
2. Last ned FAO FBS for hvert land og summer til fem hovedkategorier.[^2]
3. Lag tabell per land: produksjon, import, eksport, food supply, feed, other uses, per kategori.[^1][^2]
4. Hent nasjonale matsvinnrapporter og/eller Temanord 2021‑504 + Eurostat for å:
    - sette total matsvinn per land
    - fordele på ledd
    - så på kategorier.[^6][^4][^5][^3]
5. Hent avfallsstatistikk for matavfall/organisk avfall per behandlingsmåte; koble til svinn per ledd.[^3][^7]
6. Bygg en “master‑matrise” (land × kategori × ledd × strømtype) i Excel/R/Python.
7. Generer Sankey‑input ved å transformere matrisen til node‑ og lenkelister.

Når du har bestemt referanseår og ønsket presisjonsnivå (mye anslag vs. kun “harde” tall) kan vi gå stegvis land for land og faktisk fylle inn et tallsett som er “rapportklar” med tydelig merking av usikkerhet.

Hvilket referanseår vil du at vi skal bruke som primærbasis (2019, 2020, 2021 eller 2022)?
<span style="display:none">[^10][^11][^12][^13][^14][^15][^9]</span>

<div align="center">⁂</div>

[^1]: https://openknowledge.fao.org/items/17eed970-56d7-4280-b15f-9c1c2f45056c

[^2]: https://www.fao.org/statistics/highlights-archive/highlights-detail/food-balance-sheets-2010-2023/en

[^3]: https://pub.norden.org/temanord2021-504/

[^4]: https://aoe.fi/api/v1/download/file/englishexplorationguidefinalwithlinks1-1765185359755.pdf

[^5]: https://www.statista.com/chart/31072/food-wasted-per-capita-in-european-countries/

[^6]: https://www.matvett.no/uploads/documents/OR.51.20-Matsvinn-i-Norge-2015-2019-translated.pdf

[^7]: https://www.nordicenergy.org/wordpress/wp-content/uploads/2019/04/Food-Waste-to-Biofuels_FINAL.pdf

[^8]: https://openknowledge.fao.org/bitstreams/04f5ae8c-1f5c-48cf-890d-6bba648b75c6/download

[^9]: https://www.fao.org/statistics/highlights-archive/highlights-detail/food-balance-sheets-2010-2022-global-regional-and-country-trends/en

[^10]: https://openknowledge.fao.org/server/api/core/bitstreams/522c9fe3-0fe2-47ea-8aac-f85bb6507776/content

[^11]: https://openknowledge.fao.org/handle/20.500.14283/cc8088en

[^12]: https://www.oecd.org/content/dam/oecd/en/publications/reports/2021/07/oecd-fao-agricultural-outlook-2021-2030_31d65f37/19428846-en.pdf

[^13]: https://resonans.dmjx.dk/artikler/the-green-paradox-why-denmark-throws-away-15-million-tonnes-of-food-annually/142083

[^14]: https://data360.worldbank.org/en/dataset/FAO_FBS

[^15]: https://pub.norden.org/temanord2021-504/temanord2021-504.pdf

