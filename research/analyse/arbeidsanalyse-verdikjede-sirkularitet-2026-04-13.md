# Arbeidsanalyse: Verdikjede, Sirkularitet og Materialstatus

**Dato:** 13. april 2026
**Kontekst:** Oppfølging av møte 5 (Transition Groups) og møte 6 (JT + Gabriel arbeidsmøte)
**Formål:** Kartlegge hva vi har, hva vi mangler, og prioritere neste steg

---

## Del 1: Dekningsmatrise — JTs 8 temaer x eksisterende kilder

### Leseveiledning

- **Dekning** = antall kilder som direkte behandler temaet
- **Kvantitativ** = om vi har tall (volumer, prosent, CO2e)
- **Nordisk** = hvilke land som er dekket
- **Gap** = hva som mangler for å kunne bruke temaet i leveransen

---

### Matrise

| # | Tema | Dekning | Kvantitativ | Nordisk | Hovedkilder | Kritiske gap |
|---|------|---------|-------------|---------|-------------|-------------|
| 1 | **Importavhengighet** | Moderat (6 kilder) | Ja: selvforsyningsgrad, handelsvolumer, soyaimport 500kt/år | NO, SE, DK, FI | country-chart-data.ts, trade_volumes_2024.json, KOST-01, EUDR-rapport | Mangler: per-kategori importandel SE/DK/FI/IS, bilateral handelsstrømmer, erstatningspotensial |
| 2 | **Regenerativt landbruk** | Moderat (5 kilder) | Delvis: 5% økologisk (NO), Arla/Lantmannen piloter | NO, SE, DK | regenerativt-landbruk-norden.md, PROD-02, arealbruk-norge.md | Mangler: adopsjonstall per land, karbonlagringsdata, økonomi for bønder, agroforestry-caser |
| 3 | **Matsvinn hele kjeden** | Sterk (10+ kilder) | Ja: 407kt NO, 9.5Mt Norden, tidsserier 2015-2024, per-sektor | NO, SE, DK, FI, IS | matsvinn-2024.md, tidsserier, barrierer, nordisk-rapport, hierarki-biogass, matsvinnloven | Mangler: per-ledd fordeling i SE/DK/FI/IS, husholdningsatferd, kommunal implementering |
| 4 | **Alternativt for** | Sterk (6 kilder) | Delvis: BSF 1t avfall→200kg protein, insekt 1-3 kg CO2e/kg, 7 EU-godkjente arter | NO (Invertapro), SE (Tebrito), FI (Enifer, Solar Foods) | insekt-industri.md, TEK-01, TEK-02, PROD-01, carbon-meta | Mangler: prissammenligning mot soya, nordisk produsentkapasitet, forregulering per land |
| 5 | **Direktehandel** | Svak (2-3 kilder) | Delvis: 274 REKO-ringer, 786k brukere, ~500 MNOK/år | FI (180), SE (220), NO (voksende) | SA-02, nordisk-sirkularitet-komparativ.md | Mangler: bonde-inntektseffekt, logistikkost, forbrukerbetaling, skaleringsbarrierer, norske tall |
| 6 | **Alger og spillvarme** | Svak (3 kilder, implisitt) | Begrenset: alger TRL 4-6, spillvarme 30% kostnadsreduksjon | Generelt nordisk | TEK-01, PROD-01, circular-economy-outlook | Mangler: kommersielle algeanlegg i Norden, spillvarmekilder kartlagt, produksjonskost/kg, pilotprosjekter |
| 7 | **Fiskeslam/oppdrettsavfall** | Moderat (5 kilder) | Ja: 1M tonn restråstoff/år, 5-10 mrd NOK potensial, for=75% av laks-GHG | NO primært | posisjonsdokument, PROD-01, PROD-03, SA-02, sirkulaer-biookonomi | Mangler: per-art verdikalkyle, regulatoriske barrierer, prosesseringskapasitet, nordisk sammenligning |
| 8 | **Akademia→skala gap** | Moderat (4+ kilder) | Begrenset: 14 thesis-backlog, EFSA-tidslinjer, Nofima/NIBIO-benchmarks | NO, SE, FI, DK | BACKLOG, TEK-02, PROD-03, SA-02 | Mangler: systematisk TRL→kommersialisering-analyse, investorberedskap, policybarrierer, antall spin-offs |

---

### Temadekning — visuell oversikt

```
Tema                        Kilder  Kvantitativ  Nordisk    Status
───────────────────────────────────────────────────────────────
3. Matsvinn hele kjeden      10+      ████████    5 land     STERK
4. Alternativt for            6       ██████░░    3 land     STERK
7. Fiskeslam/oppdrett         5       ██████░░    1 land     MODERAT
1. Importavhengighet          6       █████░░░    4 land     MODERAT
2. Regenerativt landbruk      5       ████░░░░    3 land     MODERAT
8. Akademia→skala             4       ███░░░░░    4 land     MODERAT
5. Direktehandel              3       ███░░░░░    3 land     SVAK
6. Alger og spillvarme        3       ██░░░░░░    Generelt   SVAK
```

---

## Del 2: Ubehandlet materiale — inventar og prioritering

### 2.1 Materialer som er identifisert men ikke integrert

| # | Materiale | Filer | Relevans for JT-temaer | Prioritet |
|---|-----------|-------|----------------------|-----------|
| A | **Thesis-backlog 2024-2025** | 14 theses | Matsvinn (3), marked (4), supply chain (3), pakking (2), klima (2) | HOY — flere dekker direkte tema 3, 4, 8 |
| B | **Barekraft SEC-MAT** | 12 filer | Alle 8 temaer dekket: lovverk, bioøkonomi, protein, havbruk, regenerativt | HOY — rik sektoranalyse, klar for integrering |
| C | **SA-02 Circular Cities** | 1 fil (381 linjer) | Tema 1-8 alle dekket. REKO-data, biogass, matsvinn, aktørkart | HOY — mest komplette kryssnordiske analysefilen |
| D | **PubMed wave 2** | 40+ artikler | Akademisk dekning, peer-reviewed artikler | MODERAT — manifest finnes, analyse krever tid |
| E | **Landbrukarena-transkripsjoner** | 19 videoer | Ukjent til analysert — mulig primærdata om produksjonsperspektiv | MODERAT — krever syntese av ASR-transkripsjoner |
| F | **Handelsdata raw JSON** | 29 filer | Kun DK har data (7 filer). SE/FI/IS/NO er tomme strukturer | LAV — begrenset verdi uten nye API-kall |
| G | **23 uinnhentede desk research-items** | Rapporter | Konkurransetilsynet (7), Dagligvaretilsynet (7), konsulenter (5), NHH (4) | MODERAT — viktig for regulatorisk dekning men ikke sirkularitet |

### 2.2 Nøkkelfunn fra SEC-MAT og SA-02

**Viktigste uextraherte innsikter:**

1. **Fiskeavfall: 5-10 mrd NOK/år ubrukt potensial** (posisjonsdokument + SA-02)
   - ~200 000 tonn kastes i havet, 1M tonn totalt restråstoff
   - Omega-3, kollagen, peptider — flere inntektsstrømmer per sidestrøm

2. **REKO-ringer: skalert sosial sirkulærøkonomi** (SA-02)
   - 274 ringer, 786 000 brukere, ~500 MNOK årlig
   - DIGIFOOD-prosjekt (USN, NordForsk) digitaliserer nettverket
   - Bevis på desentralisert matsystemstyring som fungerer

3. **Dansk CO2-avgift på biologiske utslipp** (REG-03)
   - Verdens første: DKK 300/t (2030), DKK 750/t (2035)
   - Green Area Fund: 43 MDKK → 250 000 ha skog + 140 000 ha myr
   - Direkte overførbar til norsk landbrukspolitikk

4. **Matsvinnloven donasjonsplikt** (REG-01)
   - Kan tredoble Matsentralen-volumer: 6 000 → 15-20 000 tonn/år
   - Logistikkinfrastruktur er flaskehalsen

5. **PFAS-forbud 12. august 2026** (REG-02)
   - Rammer ~80% av fiberbasert matemballasje
   - Umiddelbar forsyningskjededisrupsjon og innovasjonsmulighet

6. **Biogassgapet: NO 828 GWh vs DK 8 000+ GWh** (SA-02, komparativ)
   - Norge trenger 100-160 nye anlegg for å nå potensial
   - Fiskeslam fra akvakultur = 3 TWh unikt norsk potensial
   - Danmark: 20-års forutsigbare subsidier er nøkkelen

7. **Alternative proteiner ved kommersiell infleksjon** (TEK-01, TEK-02)
   - Enifer PEKILO: €36M, EFSA-søknad okt 2024
   - Solar Foods Solein: Factory 01 operativ, 160t/år
   - 7 insektarter EU-godkjent Q1 2025
   - **2025-2026 EFSA-beslutninger avgjør levedyktighet**

---

## Del 3: Verdikjede-datainventar per nordisk land

### 3.1 Datamodenhet per land

```
             Produksjon  Handel    Svinn     Utslipp   Selvfors.  Aktører
             (volum)     (volum)   (volum)   (CO2e)    (%)        (selskaper)
─────────────────────────────────────────────────────────────────────────
Norge        ████████    ████████  ████████  ████████  ████████   ████████
Danmark      ██████░░    ██████░░  ████░░░░  ████░░░░  ██████░░   ███░░░░░
Sverige      ████░░░░    ██░░░░░░  ████░░░░  ████░░░░  ██████░░   █████░░░
Finland      ████░░░░    ██░░░░░░  ████░░░░  ████░░░░  ██████░░   ███░░░░░
Island       ██░░░░░░    █░░░░░░░  ██░░░░░░  █░░░░░░░  ░░░░░░░░   ██░░░░░░
```

### 3.2 Eksisterende verdikjededata — Norge (mest komplett)

| Verdikjedeledd | Volum (tonn) | CO2e (Mt) | Tap/svinn | Kilde |
|----------------|-------------|-----------|-----------|-------|
| **Primærproduksjon** | Korn 1.18M, Kjøtt 357k, Melk 1.52M, F&G 232k | 4.4 | 27 000t (landbruk) | trade_volumes, SSB |
| **Import** | 517 000t (78.7 mrd NOK) | — | — | trade_volumes |
| **Foredling** | — | 0.9 | 80 000t (industri) | matsvinn-2024 |
| **Distribusjon/grossist** | ASKO 425 000 m², 700+ lastebiler/dag | 0.5 (transport) | — | verdikjede.ts |
| **Retail** | 66.3% discount, 22.9% super, 10.9% nærbutikk | — | 50 000t | matsvinn-2024, country-chart |
| **HORECA** | 76.9 mrd NOK (2024) | — | 35 000t | verdikjede.ts |
| **Forbruk (husholdning)** | — | — | 215 000t | matsvinn-2024 |
| **Sjømateksport** | 2.8M t (175.4 mrd NOK) | — | — | trade_volumes |
| **Avfall totalt** | — | 1.6 | 407 100t totalt | matsvinn-2024 |

### 3.3 Manglende data per land — for verdikjekartlegging

**Danmark:**
- Har: handelsverdi (DKK, månedlig 2022-2026), selvforsyning, matsvinn 139 kg/capita
- Mangler: produksjonsvolumer per kategori, prosesseringskapasitet, HORECA-volumer

**Sverige:**
- Har: selvforsyning, 13 selskaper i DB, matsvinn 85 kg/capita, prisindekser
- Mangler: handelsvolumer (JSON-filer er tomme), produksjonsvolumer, prosessering

**Finland:**
- Har: selvforsyning, 7 selskaper i DB, matsvinn 68 kg/capita, prisindekser
- Mangler: handelsvolumer (JSON-filer tomme), produksjonsdetaljer

**Island:**
- Har: 6 selskaper i DB, begrenset prisdata
- Mangler: nesten alt — selvforsyning, handel, svinn, utslipp, produksjon

### 3.4 Kilder for å fylle gap

| Gap | Kilde | Type | Tilgjengelighet |
|-----|-------|------|----------------|
| SE produksjonsvolumer | Jordbruksverket + SCB | API/rapport | Offentlig |
| DK produksjonsvolumer | DST (dst.dk) | API (ADAM-modell) | Offentlig |
| FI produksjonsvolumer | Luke (Naturresursinstitutet) | Åpen data | Offentlig |
| IS produksjonsvolumer | Hagstofa Islands | Rapport | Begrenset |
| Alle land: FAO Food Balance | FAOSTAT | Nedlastbar CSV | Offentlig, standardisert |
| Alle land: matsvinn per ledd | Eurostat harmonisert (2025-rapportering) | Under utvikling | Kommer 2026 |
| Alle land: klimaavtrykk | UNFCCC National Inventory Reports | PDF/data | Offentlig |
| Nordisk sammenligning | Nordic Council / TemaNord rapporter | PDF | Offentlig |

---

## Del 4: Sirkularitetsanalyse — eksisterende looper og gap

### 4.1 Identifiserte eksisterende sirkularitetslooper

| Loop | Land | Status | Volum | Kilde |
|------|------|--------|-------|-------|
| **Biogass fra matavfall** | DK | Skalert (160 anlegg, 8 TWh) | 8 000+ GWh | komparativ |
| **Biogass fra matavfall** | NO | Under utbygging (Bio Jæren) | 828 GWh (mål 5.5-11 TWh) | sirkulaer-biookonomi |
| **Panteordning (plast/glass)** | NO | Moden (Infinitum) | 92.3% returrate | verdikjede.ts |
| **Fiskeavfall → fiskemel/olje** | NO | Industriell (eksisterende) | ~800 000t prosessert | posisjonsdokument |
| **TINE myse → protein** | NO | Kommersiell (300 MNOK investert) | Myseprotein til premium | posisjonsdokument |
| **Matsentralen redistribusjon** | NO | Operativ | 5 735t (2024) = 10.2M måltider | hierarki-biogass |
| **Too Good To Go** | Norden | Skalert | 25M måltider (Norden), 2M+ magic bags (NO) | SA-02, selskaper |
| **REKO-ringer (direktesalg)** | FI/SE/NO | Skalert | 274 ringer, 786k brukere, ~500 MNOK/år | SA-02 |
| **Den Magiske Fabrikken** | NO | Operativ | 106 000t/år → 5.1M liter diesel-ekv. | sirkulaer-biookonomi |
| **Nortura biprodukter → for** | NO | Industriell | Del av 357kt kjøttproduksjon | verdikjede.ts |
| **Grønt Punkt emballasje** | NO | Operativ | EPR-system, 1000kg-terskel fjernet 1.7.2025 | REG-02 |
| **Skolmat (gratis)** | FI/SE | Institusjonell | ~37 mrd NOK/år totalt | verdikjede.ts |
| **Kalundborg industriell symbiose** | DK | Moden (verdens første) | Inkluderer matforedling | SA-02 |
| **Gasum tverrnordisk biogass** | FI/SE/NO | Kommersiell | Tverrnordisk operatør | SA-02 |

### 4.2 Sirkulære fiaskoer — viktige caser (fra Einars innspill)

| Aktør | Land | Konsept | Investert | Konkurs | Læring |
|-------|------|---------|-----------|---------|--------|
| **Restaurant Rest** | NO | Zero-waste gourmet, 8 bord, Michelin Green Star | TINE 33.4%, Shepherd's Pie 50% | Sept 2024 | Premium/fine dining + sirkulær = økonomisk skjørt. COVID + energi + inflasjon. Del av bølge (41 konkurser sept 2024) |
| **Enorm Biofactory** | DK | Insektprotein, 22 000 m2, Arla-partnerskap | >50M EUR | Okt 2025 | Selv storskalateknologi + industripartner holder ikke. Prisgap mot soya for stort |

**Mønster:** Plattform/discount-modeller (Too Good To Go, Holdbart, REKO) overlever. Produksjons- og premiummodeller (Rest, Enorm) kollapser under kostnadspress. Dette er kritisk innsikt for pilotanbefalinger i roadmapen.

### 4.3 Identifiserte gap — looper som mangler eller er underutviklet

| Gap | Potensial | Barriere | Land |
|-----|-----------|---------|------|
| **Fiskeavfall i havet** | 200 000t/år kastes, 5-10 mrd NOK potensial | Logistikk, mangel på prosessering til havs | NO |
| **Matsentralen kapasitet** | Kun 3% av industrisvinn redistribuert, kan 3x til 15-20kt | Logistikkinfrastruktur (kjølekjede) | NO |
| **Biogass Norge** | 10x gap vs Danmark (828 vs 8000 GWh) | Kortsiktige subsidier, mangel på 20-års forutsigbarhet | NO |
| **Insektprotein til for** | EU-godkjent, BSF 1t→200kg protein | Prisgap mot soya, skaleringskapital | NO, SE, FI |
| **Alge-/tangdyrking** | TRL 4-6, omega-3, for, drivstoff | Kommersiell umodenhet, regulatorisk usikkerhet | Norden |
| **Oppdrettsslam valorisering** | Gjødsel, biokull, biogass fra slam | Tørking vs pyrolyse vs AD — teknologivalg | NO |
| **Husholdningssvinn** | Kun -5% reduksjon vs -21% retail | Atferdsendring vanskelig, «best før» forvirring | Norden |
| **HORECA sirkularitet** | Reuse-mål: 10% takeaway 2030 (PPWR) | ~150 000 gjenbruksbeholdere trengs (NO), vaskeinfrastruktur | Norden |
| **Regenerativ omstilling** | <5% økologisk (NO), Agreena karbonkreditt | Investeringsrisiko for bønder, mangel på langsiktig støtte | NO, SE |
| **Akademia→industri kobling** | 71 masteroppgaver, 11 PhD — lite kommersialisert | Fôrselskaper vil ikke ha alternativer før pris matcher soya | Norden |

### 4.3 Per-tema oppsummering

#### Tema 1: Importavhengighet
- **Nåsituasjon:** NO 44% kalorisk selvforsyning, FI 80%+, DK 100%+, SE 50%
- **Nøkkeltall:** NO importerer 517kt mat (78.7 mrd NOK), 500kt soya til for
- **Nordisk:** DK eksporterer 25% av BNP i mat. FI har 9-mnd strategisk reserve
- **Potensial:** Lokal proteinproduksjon (lupin, erter, insekt) kan redusere soyaavhengighet
- **Gap:** Mangler per-kategori bilateral handelsstrøm-analyse

#### Tema 2: Regenerativt landbruk
- **Nåsituasjon:** ~5% økologisk (NO), Arla piloter (SE/DK), Lantmannen program
- **Nøkkeltall:** NO mister 6-8000 ha dyrket mark/år (mål: maks 4000)
- **Nordisk:** SE/DK lengre fremme med storskala piloter (Arla, Lantmannen)
- **Potensial:** Karbonkreditter (Agreena ~€500-2000/ha/år), virtuell gjering (Nofence)
- **Gap:** Mangler nordisk soil carbon baseline, adopsjonsbarrierer SME

#### Tema 3: Matsvinn hele kjeden
- **Nåsituasjon:** NO 407kt (73.4 kg/capita), 24% reduksjon per capita siden 2015
- **Nøkkeltall:** Retail -21%, industri -12%, husholdning -5% (2015-2024)
- **Nordisk:** FI lavest (68 kg), DK høyest (139 kg, inflert av prosessering)
- **Potensial:** Matsvinnloven (2025/26) + EU WFD 2025 (10% industri, 30% retail/husholdning)
- **Gap:** Husholdningsatferd er hardest å endre

#### Tema 4: Alternativt for
- **Nåsituasjon:** 0.4% novel ingredients i laksefôr (mål 25% innen 2030)
- **Nøkkeltall:** BSF: 1t avfall → 200kg protein. Laksefôr = 75% av GHG-fotavtrykk
- **Nordisk:** Invertapro (Tromsø), Tebrito (SE), Enifer (FI), Solar Foods (FI)
- **Potensial:** 7 insektarter EU-godkjent. EFSA-beslutninger 2025-26 avgjørende
- **Gap:** Prisgap mot soya, nordisk produsentkapasitet ukjent

#### Tema 5: Direktehandel
- **Nåsituasjon:** 274 REKO-ringer, 786k brukere, ~500 MNOK/år
- **Nøkkeltall:** FI 180 ringer, SE 220, NO voksende. DIGIFOOD digitaliserer
- **Nordisk:** FI/SE leder, NO henger etter i formalisering
- **Potensial:** Bondens Marked, restaurantnettverk, kortreist-politikk
- **Gap:** Inntektseffekt for bønder, logistikkost, norske tall mangler

#### Tema 6: Alger og spillvarme
- **Nåsituasjon:** TRL 4-6, begrenset kommersiell aktivitet i Norden
- **Nøkkeltall:** Vertikal farming + datasenter spillvarme: 30% kostnadsreduksjon
- **Nordisk:** Begrenset. Seaweed Solutions (NO), noen svenske/finske forsøk
- **Potensial:** CO2 + spillvarme → alger → fôr/drivstoff. Nordisk fortrinn: fornybar energi
- **Gap:** Svakest dekket tema. Mangler aktørkart, pilotdata, økonomi

#### Tema 7: Fiskeslam og oppdrettsavfall
- **Nåsituasjon:** ~1M tonn restråstoff/år, 200kt kastes i havet
- **Nøkkeltall:** 5-10 mrd NOK/år potensial. Omega-3, kollagen, peptider, biogass
- **Nordisk:** Primært norsk fenomen (skalert akvakultur)
- **Potensial:** Slam → gjødsel/biokull/biogass. Lukket oppdrett fanger mer slam
- **Gap:** Per-art verdikalkyle, prosesseringskapasitet, regulatoriske barrierer

#### Tema 8: Akademia→skala gap
- **Nåsituasjon:** 71 theses + 11 PhD indeksert, 14 i backlog. Nofima/NIBIO forsker aktivt
- **Nøkkeltall:** NMBU 10-års alternativt fôr-prosjekt — ingen kommersialisering
- **Nordisk:** Enifer (FI) og Solar Foods (FI) er sjeldne suksesshistorier
- **Potensial:** TRL-kartlegging → identifisere hva som er «kommersiell-klart» men blokkert
- **Gap:** Systematisk TRL→marked-analyse, investorberedskap, spin-off-telling

---

## Del 5: Forskningsplan — neste steg for datainsamling

### 5.1 Prioritet A: Kan gjøres med Claude (data harvest)

| # | Oppgave | Datakilde | Dekker tema | Estimert omfang |
|---|---------|-----------|-------------|-----------------|
| 1 | Importér 14 thesis-backlog | MASTER-PHD-BACKLOG-2026.md | 3, 4, 8 | Liten: oppdater theses.ts |
| 2 | Integrer 12 SEC-MAT filer som SourceDocs | research/external/barekraft/ | 1-8 | Middels: opprett import-script |
| 3 | Integrer SA-02 som SourceDoc | research/external/circular-cities/ | 1-8 | Liten: enkelimport |
| 4 | Hent FAO Food Balance Sheets per nordisk land | FAOSTAT (offentlig CSV) | 1, 2 | Middels: standardisert format |
| 5 | Hent SSB/SCB/DST/Luke produksjonsdata | Statistikkbyråer (API) | Verdikjede per land | Stor: 4 API-er |
| 6 | Hent nordiske matsvinndata per ledd | Matvett, Naturvårdsverket, etc. | 3 | Middels: variert format |
| 7 | Hent UNFCCC utslippsdata per land | National Inventory Reports | Verdikjede per land | Middels: PDF-ekstraksjon |
| 8 | Kartlegg REKO-ringer i Norge | Web search | 5 | Liten |
| 9 | Kartlegg algeproduksjonsprosjekter i Norden | Web search + PubMed | 6 | Middels |
| 10 | Kartlegg oppdrettsslam-piloter | Nofima, NIBIO, web | 7 | Middels |

### 5.2 Prioritet B: Krever menneskelig innsats

| # | Oppgave | Eier | Dekker tema |
|---|---------|------|-------------|
| 1 | Stakeholder-intervjuer (5 targets identifisert) | Gabriel/Cathrine | Alle |
| 2 | Nordisk partnervalidering (Michel SE, Betina DK) | Gabriel/Einar | 1, verdikjede |
| 3 | TG Charter (1 side) | Gabriel/Cathrine | Evidence Pack |
| 4 | Velge indikatorer med Einar | Gabriel/Einar | Dashboard |
| 5 | Definere 3-5 sirkularitetstemaer (JT) | Jan Thomas | Avgrensning |

### 5.3 Anbefalte prioriterte sirkularitetstemaer (for JTs beslutning)

Basert på datamodenhet, nordisk relevans og potensial:

**Anbefalt topp 3:**
1. **Matsvinn hele kjeden** — sterkest datagrunnlag, matsvinnloven gir politisk momentum, alle ledd dekket
2. **Fiskeslam/oppdrettsavfall + alternativt fôr** (kombinert) — unikt norsk fortrinn, stort ubrukt potensial (5-10 mrd NOK), kobler sjømat og sirkularitet
3. **Importavhengighet** — fundamentalt for selvforsyningsdebatt, kvantifiserbart, politisk aktuelt

**Valgfri #4-5:**
4. **Regenerativt landbruk** — dansk CO2-avgift gir policy-presedens, Arla/Lantmannen piloter
5. **Direktehandel / REKO** — operasjonalisert bevis, sosial sirkularitet, desentralisert

---

## Del 6: Dashboard-konsekvenser

### Hva bør endres/legges til

| Endring | Hva | Prioritet |
|---------|-----|-----------|
| **Utvid FoodFlowSankey** | Fra hardkodet NO → dynamisk per land | Høy |
| **Ny side: Sirkularitet** | Per-tema oversikt med looper, gap, potensial | Høy |
| **Verdikjede per land** | Switch mellom NO/SE/DK/FI/IS med volum/utslipp/svinn | Høy |
| **CountryMetric utvidelse** | Legge til per-ledd verdikjededata | Middels |
| **Sirkularitetslooper visuelt** | Sankey/flyt som viser eksisterende gjenbruk | Middels |
| **REKO-ringer kart** | Leaflet-lag med REKO-ringer i Norden | Lav |
| **Biogass-sammenligning** | Bar chart: NO vs DK vs SE vs FI | Lav |
