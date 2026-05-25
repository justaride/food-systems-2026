# Insight → Document koblingskandidater

**Generert:** 2026-05-11 fra FTS ts_rank_cd mot Document.search_vector
**Innsikter dekket:** 101/102 unlinked
**Kandidater totalt:** 505 (high: 218 · medium: 134 · low: 153)

## Hvordan reviewe

1. Åpne CSV-en (`insight-doc-link-candidates-2026-05-11.csv`) i Numbers/Excel
2. For hver rad: sett `decision` til `y` for godkjente koblinger, ellers la stå tom
3. Kjør `scripts/apply-insight-doc-links.sql` for å sette inn de godkjente i `InsightDocumentRef`

**Tommelfingerregel:**
- **high (rank > 15):** sterk token-overlap. Sjekk likevel — kan være falsk-positiv hvis temaet er bredt
- **medium (rank 8–15):** kreves manuell vurdering
- **low (rank ≤ 8):** sannsynligvis ikke direkte sitérbar

---

### `ins-01` Norsk selvforsyningsgrad under 50% for matvarer

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.2 | `cmmv9nxz70049w70dzuorewp5` Prioritert masterlogg: Offentlige rapporter om matsystemer, dagligvaremakt, selvforsyning og matsikkerhet (2010–2026) |
| 2 | 🟡 med | 12.9 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 3 | 🟡 med | 12.6 | `cmmpax3d00005u10dtuh0ykh7` Sentralt Kilderegister: Food Systems 2026 |
| 4 | 🟡 med | 12.6 | `cmnyng110000yd50dvuprio2f` PDF-gjennomgang: Offentlige rapporter og utredninger |
| 5 | 🟡 med | 12.6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |

### `ins-03` Nordisk matsikkerhetsstrategi mangler koordinering

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15 | `cmo87ff5z000eq30dh9polgas` Arkiv-indeks — research/ |

### `ins-04` Matsvinn i Norge: 390 000 tonn arlig

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 34.5 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟢 high | 21.3 | `cmmpax3qc002ju10dpp2z5xxj` Nordisk Primærproduksjon: Komparativ Analyse |
| 3 | 🟢 high | 17.8 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 4 | 🟢 high | 16.5 | `cmo87fgq200aoq30dyfx0mnnt` Oppdater massebalanse-tallene for norsk laks/ørret-oppdrett til 2024: |
| 5 | 🟢 high | 16.5 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |

### `ins-05` Ten Step Start v2.0 anvendt pa matsystemer

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 10.8 | `cmmxl54eh0002jw0dckrm5ekw` Møtenotat 9. mars 2026 — Food Systems Transition Group |
| 2 | 🟡 med | 10.8 | `cmmxl54f90005jw0dfhxplkvv` 9. mars-notater — Utvidet Kontekst |
| 3 | 🟡 med | 8.4 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |
| 4 | 🟡 med | 8.1 | `cmmpax3vj003lu10d6xmim3j0` Gap List: Items Requiring Human Input Before Finalization |
| 5 | ⚪ low | 5.4 | `cmo7gxgqh008d060dyubm4b8m` Deep Research Progress: EAT Foundation |

### `ins-06` EU Farm to Fork-strategien som rammeverk

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 11.4 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 2 | 🟡 med | 8.8 | `cmmv9nxyj0044w70d4yizdtih` Circular Food Systems – Rammeverk, Definisjoner og Operativt Kriteriesett |
| 3 | ⚪ low | 7.3 | `cmmv9ny0c004ow70dj7dtnnv1` Sirkulære matsystemer — Rammeverk og operativt kriteriesett |
| 4 | ⚪ low | 6.9 | `cmmxl54e20001jw0d5xz2y194` Oslo Innovasjonsprogram 2025 — Food Systems Application |
| 5 | ⚪ low | 6.9 | `cmmxl54g9000ajw0d2arpodk1` Oslo Innovasjonsprogram 2025 — Copy |

### `ins-07` Gigamapping som metode for systemkartlegging

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 8.1 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |
| 2 | ⚪ low | 5.1 | `cmo87ffa40010q30dkxh3x7qm` PDF-gjennomgang: Forskningsinstitutt, NIBIO og NORSUS |
| 3 | ⚪ low | 4 | `cmmv9nxvq0037w70d2y45dvsd` Food Access, Food Deserts og Lokal HHI — Nordisk metodikk |
| 4 | ⚪ low | 2.5 | `cmmxl54fi0006jw0d0m9q66ym` Drøfting Transition Groups — Metodikk og Governance |
| 5 | ⚪ low | 2.4 | `cmmv9nxyo0045w70dai9qqd11` Food Access, Food Deserts og Lokal HHI: Metoder, Kilder og Datasett for Nordisk og Komparativ Analyse |

### `ins-08` Biosirkel-modellen for sirkulaer matproduksjon

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 3.7 | `cmmxvfn6o001k1i0d19kek5be` Klimatiltak i landbruket — Utredning om modeller, karbonlagring og bærekraftig matproduksjon |
| 2 | ⚪ low | 3.6 | `cmo7gxjgq00k3060dt7i115mj` Deep Research Prompt Pack - Nordic Circular Food Landscape |
| 3 | ⚪ low | 3.3 | `cmmpax3jc001wu10d4a4veidh` Tenketanker, NGO-er og sivilsamfunnsorganisasjoner: Nordiske matsystemer |
| 4 | ⚪ low | 3.3 | `cmmxvfo5f00351i0dop0d2r66` PubMed-søk: Relevante publikasjoner for Food Systems 2026 |
| 5 | ⚪ low | 3.1 | `cmn7lflkq0053fy0dt58ftf9i` Sammendrag: Migrantarbeid i nordisk matproduksjon |

### `ins-100` Koebenhavn 87,8% oekologisk i 70 000 daglige maaltider — samme budsjett

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 5.8 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 2 | ⚪ low | 5.8 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 3 | ⚪ low | 5.8 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 4 | ⚪ low | 3.9 | `cmo87fgkv009zq30d2fidqzcn` Lag en komplett oversikt over aktive forskningsprogrammer på sirkulære matsystemer ved nordiske universiteter og institutter (2024–2026). Inkluder: |
| 5 | ⚪ low | 3.9 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |

### `ins-101` Alternative distribusjonskanaler Norden: penetrasjonsindeks SE 3,8 / NO 3,6 / FI 3,4 / DK 3,0

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 18.3 | `cmo87ffcw001jq30dd5ipihrh` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 2 | 🟢 high | 18.3 | `cmo7gxgo4007y060dsrg4cdu1` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 3 | 🟢 high | 18.3 | `cmo7gxgou0082060de2z51ph9` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 4 | ⚪ low | 6.3 | `cmo87fgsv00b3q30d5rc4siyp` Identifiser de 20 nordiske kommunene som er lengst framme på sirkulær matpolitikk: |
| 5 | ⚪ low | 5.4 | `cmn7lflot006rfy0dmcvly2em` Sammendrag: Farm-to-table og kortreist mat i Norden |

### `ins-102` Cheffelo SEK 1,188 mrd — nordens stoerste maaltidskasse-aktoer

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 3.9 | `cmo87ffcw001jq30dd5ipihrh` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 2 | ⚪ low | 3.9 | `cmo7gxgou0082060de2z51ph9` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 3 | ⚪ low | 3.9 | `cmo7gxgo4007y060dsrg4cdu1` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 4 | ⚪ low | 3.3 | `cmo87fhkh00fpq30dgvpu2j3i` Denmark Insect producer Enorm Biofactory insolvent |
| 5 | ⚪ low | 3.3 | `cmn7lflnk006bfy0dh1ujrepw` Sammendrag: HelloFresh og måltidskasser i Norden |

### `ins-103` Etableringsbarrierer: 7-dimensjonal modell fra nordiske failed entrants

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 27.6 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 18 | `cmmv9nxys0046w70dov6it3a9` Nordisk Dagligvaremarked: Markedsstruktur og Validering 2024–2026 |
| 3 | 🟢 high | 16.8 | `cmmpax3ne002du10ddlbworj8` Nordisk komparativ analyse: Matsystemer i Danmark, Sverige og Finland |
| 4 | 🟢 high | 16.5 | `cmmpax3ml002au10dkoagzsuj` Nordic Food Retail Market Structures: Comparative Research |
| 5 | 🟡 med | 14.1 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |

### `ins-104` Mathem/Oda/Axfood online grocery — konsolidering endte i rekonstruksjon 2024

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.1 | `cmmv9nxys0046w70dov6it3a9` Nordisk Dagligvaremarked: Markedsstruktur og Validering 2024–2026 |
| 2 | 🟡 med | 13.3 | `cmn7lflnn006cfy0dald6x546` Sammendrag: Mathem og Mat.se — svensk nettdagligvare |
| 3 | 🟡 med | 11.8 | `cmn7lflij004mfy0do38vf0si` Nordic Master's Theses: Grocery Market Concentration & Food Systems |
| 4 | 🟡 med | 11.1 | `cmmpax3ml002au10dkoagzsuj` Nordic Food Retail Market Structures: Comparative Research |
| 5 | 🟡 med | 11.1 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |

### `ins-105` Too Good To Go 120 millioner brukere / 1,35 megatonn CO2e unngaatt

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 17.2 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 16.5 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟢 high | 15.1 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 4 | 🟡 med | 14.7 | `cmoh2g7ek001xn60dxvb4mhpy` 2021 Impact Report ENG |
| 5 | 🟡 med | 13.2 | `cmmv9nxys0046w70dov6it3a9` Nordisk Dagligvaremarked: Markedsstruktur og Validering 2024–2026 |

### `ins-106` Plantefonden (DK) forpliktet DKK 394m over 116 prosjekter 2023-2025

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟡 med | 13.5 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 3 | 🟡 med | 12 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 4 | 🟡 med | 12 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 5 | 🟡 med | 10.5 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |

### `ins-107` Soer-Korea resirkulerer 96,8% av 4,81 megatonn matavfall (2023)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 19.6 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 15 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 11.7 | `cmo87fgsv00b3q30d5rc4siyp` Identifiser de 20 nordiske kommunene som er lengst framme på sirkulær matpolitikk: |
| 4 | 🟡 med | 11.7 | `cmn5ibu8b000e1i0dct0a0k6p` Nordisk sirkularitet — komparativ analyse |
| 5 | 🟡 med | 11.5 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |

### `ins-108` Arla FarmAhead: -9,9% CO2/kg melk fra 2020-basislinjen innen 2025

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 18.6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | ⚪ low | 7 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 3 | ⚪ low | 7 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 4 | ⚪ low | 7 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | ⚪ low | 4.5 | `cmmpax3r2002ku10dulrezpar` Nordisk Foredlingsindustri: Komparativ Analyse |

### `ins-109` Brasil PNAE: 71,2% av kommuner naar 30%-familiebruk-krav — 120 000 familier, 40 mill elever

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 15.9 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟡 med | 14.7 | `cmnyng10s000wd50deopby6ri` Gjennomgang av arsrapporter -- nordiske dagligvareaktorer |
| 3 | ⚪ low | 7.5 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |
| 4 | ⚪ low | 7 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | ⚪ low | 7 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |

### `ins-11` Danmark bruker 62% av landarealet til jordbruk — hoyest i Norden

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 15.6 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 3 | 🟢 high | 15.3 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 4 | 🟡 med | 12 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 5 | 🟡 med | 10.8 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |

### `ins-110` Framstillinger 2020-2026: to narrative poler — beredskap og kjoepekraft

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 6 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 2 | ⚪ low | 6 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | ⚪ low | 5.5 | `cmo87ffd7001lq30dfmstvw66` Framstillinger av mat, makt og beredskap i norsk offentlighet |
| 4 | ⚪ low | 5.5 | `cmo7gxgp20084060dvyxsojur` Framstillinger av mat, makt og beredskap i norsk offentlighet |
| 5 | ⚪ low | 5.5 | `cmo7gxgri008l060dhkw8m6m3` Framstillinger av mat, makt og beredskap i norsk offentlighet |

### `ins-111` Regulatorisk tidslinje 2024-2026 — 8 hoeydepunkter for dagligvarepolitikk

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 7.6 | `cmmpax3ox002hu10dhx3hp9mg` Regulatorisk og politisk kartlegging: Nordiske matsystemer |
| 2 | ⚪ low | 5.7 | `cmo87fi6i00k1q30dh046ijuk` Lag en komparativ analyse av suksess- og fiaskotilfeller i nordisk sirkulær mat i perioden 2015–2026. Minimum 15 case totalt. |
| 3 | ⚪ low | 5.4 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | ⚪ low | 4.8 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | ⚪ low | 4.8 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |

### `ins-112` STROBE+GRADE-ramverk for FS2026 evidensregister

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 8.1 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |
| 2 | ⚪ low | 5.1 | `cmo87ffa40010q30dkxh3x7qm` PDF-gjennomgang: Forskningsinstitutt, NIBIO og NORSUS |
| 3 | ⚪ low | 4.5 | `cmmv9nxvj0035w70dshvyurym` Nordisk aktoerkart — Perplexity-kartlegging mars 2026 |
| 4 | ⚪ low | 4 | `cmmv9nxvq0037w70d2y45dvsd` Food Access, Food Deserts og Lokal HHI — Nordisk metodikk |
| 5 | ⚪ low | 2.7 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |

### `ins-113` Norges sirkulaer matinnovasjon: biogass, tare, plantebasert, CSA — fem laererike case

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 9.3 | `cmn56a5bu000c3b0dhnhk77jy` Sektoranalyse: Mat og biomasse (Circular Cities) |
| 2 | 🟡 med | 8.7 | `cmn5ibvuj008c1i0dqtpb1xbg` A2. Mat og biomasse (Food & Biomass) |
| 3 | ⚪ low | 7.9 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |
| 4 | ⚪ low | 6 | `cmo87fgt200b4q30da5lqnryg` Kartlegg alle biogassanlegg i Norden som bruker matavfall som substrat: |
| 5 | ⚪ low | 5.1 | `cmo87fi6900k0q30d4m6jnsgz` Kartlegg skjulte bi-strømmer (sidestrømmer) fra plantebasert matproduksjon i Norden som har kommersielt potensial men er underutnyttet. For hver bi-strøm, oppgi volum, aktuell bruk, og R9-potensial. |

### `ins-114` Nordisk foodservice-grossistkart: Kespro 49% FI, ASKO dominant NO, Martin & Servera + Menigo SE

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 25.2 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 24.6 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 24.6 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 19.3 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |
| 5 | 🟢 high | 19 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |

### `ins-115` Norsk 30%-klimavekt i offentlige innkjoep fra 1. januar 2024

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 12.9 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟡 med | 12.6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 3 | 🟡 med | 12.3 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |
| 4 | 🟡 med | 11.4 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟡 med | 11.4 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |

### `ins-116` Under-rapportering er hovedeffekten — ikke lav lovbruddssats

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 1.3 | `cmo87ffdn001pq30dgm25r9lk` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 2 | ⚪ low | 1.3 | `cmo7gxgpu0088060d09vdm923` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 3 | ⚪ low | 1.3 | `cmo7gxgrn008m060dmzwz2kkc` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 4 | ⚪ low | 1.2 | `cmn7lfl7y0014fy0dnwi9wroe` Sammendrag: Frankrikes Loi EGAlim — implementering og resultater etter syv ar |
| 5 | ⚪ low | 0.9 | `cmoh0jq7v001fvw0dllx3n4ao` Prop. 4 L (2025-2026) Endringer i lov om god handelsskikk |

### `ins-117` Tre motorer for faktisk endring: etterspoersel, operasjon, finansiering

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.4 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟡 med | 10.2 | `cmmxgxphj005nm70dis7i18u5` Landbruk Arena transkripsjoner med lokal ASR |
| 3 | 🟡 med | 8.2 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 4 | 🟡 med | 8.2 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | 🟡 med | 8.2 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |

### `ins-12` Nordisk gardskonsolidering: 62% faerre bruk i Norge siden 1989

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 30.6 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 2 | 🟢 high | 30.6 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 29.4 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | 🟢 high | 18.7 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 17.8 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |

### `ins-13` Nordisk foredlingsindustri: EUR 80 mrd, 260 000+ ansatte

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 25.5 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 19 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15.3 | `cmo87ff5z000eq30dh9polgas` Arkiv-indeks — research/ |

### `ins-16` Nordisk antibiotikabruk: 10-15x lavere enn EU-snitt

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 16.3 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |

### `ins-17` Danmarks biogass-lederskap: 160 anlegg, 40% av gassforbruket

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.3 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 20.2 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |
| 3 | 🟢 high | 17.4 | `cmo87fgt200b4q30da5lqnryg` Kartlegg alle biogassanlegg i Norden som bruker matavfall som substrat: |
| 4 | 🟢 high | 17.1 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |
| 5 | 🟢 high | 15.3 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |

### `ins-19` Nordiske panteordninger: 87-93% returrate

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 25.2 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15.3 | `cmnyng0ve0000d50ddmwephuv` Arkiv-indeks — research/ |

### `ins-20` Nordisk sjoematregion: NOK 250+ mrd i samlet eksport

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.3 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 2 | 🟢 high | 24.3 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | 🟢 high | 19.6 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 16 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |

### `ins-21` Okologisk matmarked: Danmark 11,6% vs. Norge 2,0%

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 25.2 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 20.7 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 3 | 🟢 high | 19.2 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 4 | 🟡 med | 11.7 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 5 | 🟡 med | 10.2 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |

### `ins-22` Norske matpriser 24% hoyere enn Sverige

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 3.1 | `cmmpax3mi0029u10dg3fjkv68` Nordisk matpris-sammenligning: inflasjon vs prisnivå |
| 2 | ⚪ low | 2.4 | `cmnyng1jj005cd50dh0arn159` Consumer behaviour towards price-reduced suboptimal foods in the supermarket and the relation to food waste in households |
| 3 | ⚪ low | 2.1 | `cmn7lflgd0043fy0dgy0ii6tj` Do Informed Consumers Pay Less? Evidence from a Survey with Linked Grocery Purchase Data |
| 4 | ⚪ low | 2.1 | `cmmxvfn97001o1i0dcovjds01` Forbrukerpolitikk og økonomi i dagligvaremarkedet |
| 5 | ⚪ low | 1.5 | `cmn7lflns006efy0d1d0kr36v` Sammendrag: Plattformøkonomi i dagligvarehandelen |

### `ins-23` Grensehandel NO-SE: NOK 11,3 mrd (2025)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 5.5 | `cmmxvfn28001b1i0d6cewx7ss` Grensehandel — trussel og mulighet |
| 2 | ⚪ low | 3.9 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 3 | ⚪ low | 3.6 | `cmmpax3g90014u10d2qque8f6` Bransje-, statistikk- og beredskapskilder |
| 4 | ⚪ low | 2.7 | `cmn7lflgg0044fy0dro6l7aa6` Hump-shaped cross-price effects and the extensive margin in cross-border shopping |
| 5 | ⚪ low | 2.2 | `cmmpax3lm0025u10d6mt3l8xf` Faktaark: Grensehandel 2024–2025 (SSB) |

### `ins-25` Kobenhavn: 84% okologisk mat i offentlige kjokken

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 11.4 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 2 | ⚪ low | 5.2 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 3 | ⚪ low | 5.2 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 4 | ⚪ low | 5.2 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | ⚪ low | 4.2 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |

### `ins-26` 14 norske mataktorer omsetter for over 800 mrd. NOK

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 55.5 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟡 med | 9 | `cmmpax3r2002ku10dulrezpar` Nordisk Foredlingsindustri: Komparativ Analyse |
| 3 | ⚪ low | 5.7 | `cmmpax3uc0032u10dtlb3p6uq` Selskapsdata: 14 Norske Matsystem-Aktorer |
| 4 | ⚪ low | 5.7 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 5 | ⚪ low | 5.1 | `cmmv9nxys0046w70dov6it3a9` Nordisk Dagligvaremarked: Markedsstruktur og Validering 2024–2026 |

### `ins-29` Yara: 2000+ patenter og 36,2% statlig eierskap

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 6.3 | `cmmpax3uc0032u10dtlb3p6uq` Selskapsdata: 14 Norske Matsystem-Aktorer |
| 2 | ⚪ low | 5.7 | `cmmpax3r2002ku10dulrezpar` Nordisk Foredlingsindustri: Komparativ Analyse |
| 3 | ⚪ low | 2.1 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |
| 4 | ⚪ low | 1.5 | `cmmxgxph2005km70dg74e9c2z` Landbruk Arena: essens for prosjektet og kartleggingen |
| 5 | ⚪ low | 1.5 | `cmo87fgru00axq30dbwag2gyo` [Deep Research] Kartlegg Restaurant Rest (Oslo) — zero-waste restaurant eid av TINE som gikk konkurs i september 2024: |

### `ins-30` Utenlandsk kontroll over 40% av norsk laksefôr

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 17.1 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟡 med | 12.6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 3 | 🟡 med | 12.3 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |
| 4 | 🟡 med | 11.4 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |
| 5 | 🟡 med | 11.1 | `cmmpax3d00005u10dtuh0ykh7` Sentralt Kilderegister: Food Systems 2026 |

### `ins-32` Syv kritiske flaskehalser i nordisk matforsyning

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.6 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.8 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.8 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 20.2 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15.9 | `cmnyng0ve0000d50ddmwephuv` Arkiv-indeks — research/ |

### `ins-37` 1 av 12 norske husholdninger viser tegn til matfattigdom

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 6.6 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |
| 2 | ⚪ low | 5.4 | `cmn5ibuhe002j1i0drb7wewy8` Sammendrag: SIFO/OsloMet — Forbrukertrender mat |
| 3 | ⚪ low | 4.5 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | ⚪ low | 4.5 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 5 | ⚪ low | 4.3 | `cmn7lflol006ofy0dujrlqe7y` Sammendrag: Matfattigdom i Norge og Norden |

### `ins-38` Biogass-gap oppdatert: Norge 11,6x under Danmark (0,7 vs 8 TWh)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.3 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 17.5 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |
| 3 | 🟡 med | 14.4 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |
| 4 | 🟡 med | 13.2 | `cmn5ibu8b000e1i0dct0a0k6p` Nordisk sirkularitet — komparativ analyse |
| 5 | 🟡 med | 13.2 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |

### `ins-41` Matsvinnloven 2026: Nordens foerste obligatoriske matsvinnsregulering

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.5 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟡 med | 14.1 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 9 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 4 | 🟡 med | 8.7 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |
| 5 | 🟡 med | 8.7 | `cmnyng114000zd50dfdqd91nd` PubMed PDF-gjennomgang -- Strukturert analyse |

### `ins-44` NKJ identifiserer 12 nordiske intervensjonspunkter for matsystemtransformasjon

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15.3 | `cmnyng0ve0000d50ddmwephuv` Arkiv-indeks — research/ |

### `ins-45` EU Farm to Fork: 50% pesticid, 20% gjodsel, 25% okologisk innen 2030

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 16.2 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 2 | 🟡 med | 8.7 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 3 | 🟡 med | 8.1 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |
| 4 | ⚪ low | 7.8 | `cmmxl54g9000ajw0d2arpodk1` Oslo Innovasjonsprogram 2025 — Copy |
| 5 | ⚪ low | 7.8 | `cmmxl54e20001jw0d5xz2y194` Oslo Innovasjonsprogram 2025 — Food Systems Application |

### `ins-47` Sverige: 102 av 290 kommuner mangler discounter (~1M mennesker beroert)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 0.9 | `cmmv9nxvq0037w70d2y45dvsd` Food Access, Food Deserts og Lokal HHI — Nordisk metodikk |
| 2 | ⚪ low | 0.6 | `cmn7lfl9j001kfy0duzmdqazw` Sammendrag: Det tyske dagligvaremarkedets struktur og konsentrasjon |
| 3 | ⚪ low | 0.3 | `cmmxa679z006dty0dd13955wr` GitHub-kodebase-referanser — Food Systems 2026 |
| 4 | ⚪ low | 0.3 | `cmn7lfl6v000ufy0d0iijrmbn` Sammendrag: Det belgiske dagligvaremarkedet og prisregulering |
| 5 | ⚪ low | 0.3 | `cmo87ff6y000iq30ddjzoa6cj` Plattform-kobling — seed ↔ arkiv |

### `ins-48` Metodisk gap: Ingen nordisk studie kombinerer NEMS kvalitetsscorer med GIS-tilgjengelighet

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.8 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.8 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15.3 | `cmo87ff5z000eq30dh9polgas` Arkiv-indeks — research/ |

### `ins-49` Alle 5 nordiske land har HHI >2500: highly concentrated etter DOJ/EU-standard

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 34.8 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 26.7 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 26.7 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 26.2 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |
| 5 | 🟢 high | 26.2 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |

### `ins-50` Axfood kjopte City Gross (3.7% andel) for SEK 2 mrd — svensk konsolidering

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 47.1 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟢 high | 30.6 | `cmp11sfkr0006zq0dpzj0x2p8` Ekologiska Arsrapporten 2024 |
| 3 | 🟢 high | 24.3 | `cmmv9nxys0046w70dov6it3a9` Nordisk Dagligvaremarked: Markedsstruktur og Validering 2024–2026 |
| 4 | 🟢 high | 16.2 | `cmp11sfie0003zq0dcan4hfzw` Statistik over okologiske jordbrugsbedrifter 2024 |
| 5 | 🟡 med | 13.5 | `cmp11sfnm000pzq0dn1orxnsu` Ekomatcentrum EMC marknadsrapport 2022 |

### `ins-51` Island: Drangar hf. dannet (Samkaup+Heimkaup+Orkan fusjon des. 2024)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 11.7 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 2 | ⚪ low | 7.5 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 3 | ⚪ low | 7.5 | `cmmpax3t8002pu10dn08g1los` Nordisk Sjømatverdikjede: Komparativ Analyse |
| 4 | ⚪ low | 6.9 | `cmmpax3qc002ju10dpp2z5xxj` Nordisk Primærproduksjon: Komparativ Analyse |
| 5 | ⚪ low | 6.9 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |

### `ins-52` Aldi Nord forlot Danmark 2024; Lidl fravaerende fra NO og IS

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 36 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 35.4 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 3 | 🟢 high | 27.1 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |
| 4 | 🟢 high | 27 | `cmmv9ny04004mw70d4mf5vlop` Perplexity-masterliste: Food Systems 2026 |
| 5 | 🟢 high | 26.5 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |

### `ins-55` Danmark 88% okologisk offentlig innkjop vs. Norge 2% — offentlig innkjop er sterkeste policy-verktoy

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.6 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | 🟢 high | 21 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |
| 3 | 🟢 high | 17.1 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 4 | 🟡 med | 11.4 | `cmmpax3rs002lu10dr8rtsh2l` Grossist, distribusjon og logistikkinfrastruktur i Norden |
| 5 | 🟡 med | 11.1 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |

### `ins-56` Island matsvinn: Reykjavik 48-27 kg/person (44% reduksjon 2015-2018)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 29.8 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 18 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 13.5 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |
| 4 | 🟡 med | 12.6 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 5 | 🟡 med | 12 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |

### `ins-57` Matsvinnutvalget 2024: 75% reduksjon av matsvinn er mulig — over SDG 12.3 (50%)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 22.3 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 15.3 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 12.6 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |
| 4 | 🟡 med | 12 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 5 | 🟡 med | 11.4 | `cmnyng114000zd50dfdqd91nd` PubMed PDF-gjennomgang -- Strukturert analyse |

### `ins-58` NOU 2023:1 + Meld.St.11: Regjeringen hever selvforsyningsambisjon til 50% innen 2030

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 12.4 | `cmmv9nxz70049w70dzuorewp5` Prioritert masterlogg: Offentlige rapporter om matsystemer, dagligvaremakt, selvforsyning og matsikkerhet (2010–2026) |
| 2 | ⚪ low | 7.5 | `cmmv9nxty002gw70dk75k3wxf` Prioritert masterlogg — Offentlige rapporter om matsystemer (2010–2026) |
| 3 | ⚪ low | 7.2 | `cmmv9nxyw0047w70dj1ts8e81` Nordisk aktørkart for matsystemkartlegging 2026 |
| 4 | ⚪ low | 6.6 | `cmo7gxgri008l060dhkw8m6m3` Framstillinger av mat, makt og beredskap i norsk offentlighet |
| 5 | ⚪ low | 6 | `cmmpax3d00005u10dtuh0ykh7` Sentralt Kilderegister: Food Systems 2026 |

### `ins-59` Norsk laksefor: 92% importavhengighet ($2.80 mrd), 9/10 kg fra saarbare regioner

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.4 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |
| 2 | 🟡 med | 12.9 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 3 | 🟡 med | 12.6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 4 | 🟡 med | 11.4 | `cmmpax3d00005u10dtuh0ykh7` Sentralt Kilderegister: Food Systems 2026 |
| 5 | 🟡 med | 9.9 | `cmo87fhe200ejq30duae3m3dw` Lokalmatrapport 2025 |

### `ins-60` Vest-Afrika fiskeolje: 123-144K tonn fisk tilsv. 2.5-4M menneskers matforbruk

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 35.7 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟢 high | 21.3 | `cmmpax3qc002ju10dpp2z5xxj` Nordisk Primærproduksjon: Komparativ Analyse |
| 3 | 🟢 high | 19.5 | `cmo87fgq200aoq30dyfx0mnnt` Oppdater massebalanse-tallene for norsk laks/ørret-oppdrett til 2024: |
| 4 | 🟢 high | 15.9 | `cmo7gxgrc008k060dq6lzlf91` Påstanden om at 70% av fôret i norsk oppdrett havner i fjorden sirkulerer bredt. Jeg vil ha en kildebasert kvantifisering av det reelle fôr-tapet. |
| 5 | 🟢 high | 15.3 | `cmmpax3t8002pu10dn08g1los` Nordisk Sjømatverdikjede: Komparativ Analyse |

### `ins-61` Historisk forskift: 1990 65% fiskemel → 2024 22% marine, 73% vegetabilsk

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 13.6 | `cmo87fgly00a6q30dfmxbnwjw` Kartlegg den globale fiskemel-verdikjeden med nordisk perspektiv: |
| 2 | 🟡 med | 11.4 | `cmo87fglc00a2q30ddiocgj2c` Dokumenter hvordan sammensetningen av norsk laksefôr har endret seg fra 2010 til 2025. Spesifikt: |
| 3 | 🟡 med | 10.8 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |
| 4 | 🟡 med | 9 | `cmo87fi2o00jgq30d60ajdujz` Til tross for over 15 år med forskning på alternative proteiner til soya og fiskemel i nordisk oppdrett, er fôrresepten fortsatt dominert av soya (Brasil/Argentina) og villfanget fisk. Jeg vil forstå hvorfor — systematisk, ikke anekdotisk. |
| 5 | 🟡 med | 8.1 | `cmo7gxgnw007x060d90ovnjv6` Til tross for over 15 år med forskning på alternative proteiner til soya og fiskemel i nordisk oppdrett, er fôrresepten fortsatt dominert av soya (Brasil/Argentina) og villfanget fisk. Jeg vil forstå hvorfor — systematisk, ikke anekdotisk. |

### `ins-62` Raavareloeftet: 0.4% → 25% nye raavarer innen 2030 (6000% oekning)

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 1.3 | `cmmpax3j7001uu10dkzsbg0ga` Sammendrag: Nordisk Ministerråd (2024) — Policyverktøy for mat-transformasjon |
| 2 | ⚪ low | 1.2 | `cmn7lfl95001gfy0d6bcn8l6e` Sammendrag: Egne merkevarer (EMV) — internasjonal litteratur |
| 3 | ⚪ low | 0.9 | `cmnyng1180010d50dncywd95p` PDF-gjennomgang: Tilsyn, tenketank og konsulentrapport |
| 4 | ⚪ low | 0.9 | `cmmv9nxyw0047w70dj1ts8e81` Nordisk aktørkart for matsystemkartlegging 2026 |
| 5 | ⚪ low | 0.9 | `cmo7gxgq20089060dphat33sd` EAT: evidensbank for kjernefunn |

### `ins-63` Peru anchovy: El Nino 2023 → 1.3M tonn (ned 70%), 2024 normalisert 4.85M tonn

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 34.5 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟢 high | 21.3 | `cmmpax3qc002ju10dpp2z5xxj` Nordisk Primærproduksjon: Komparativ Analyse |
| 3 | 🟢 high | 16.5 | `cmo87fgq200aoq30dyfx0mnnt` Oppdater massebalanse-tallene for norsk laks/ørret-oppdrett til 2024: |
| 4 | 🟡 med | 13.8 | `cmmpax3t8002pu10dn08g1los` Nordisk Sjømatverdikjede: Komparativ Analyse |
| 5 | 🟡 med | 12.6 | `cmo7gxgrc008k060dq6lzlf91` Påstanden om at 70% av fôret i norsk oppdrett havner i fjorden sirkulerer bredt. Jeg vil ha en kildebasert kvantifisering av det reelle fôr-tapet. |

### `ins-64` Regjeringens 5M tonn laks 2050-ambisjon umulig innenfor 92% importbasert raavaregrunnlag

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 35.4 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 2 | 🟢 high | 29.7 | `cmmpax3t8002pu10dn08g1los` Nordisk Sjømatverdikjede: Komparativ Analyse |
| 3 | 🟢 high | 21.3 | `cmmpax3qc002ju10dpp2z5xxj` Nordisk Primærproduksjon: Komparativ Analyse |
| 4 | 🟢 high | 21.1 | `cmo87fgq200aoq30dyfx0mnnt` Oppdater massebalanse-tallene for norsk laks/ørret-oppdrett til 2024: |
| 5 | 🟢 high | 15.3 | `cmo87fgls00a5q30dd461uzyo` Deep Research] Kartlegg alle operative og under-bygging lukkede/semi-lukkede oppdrettsanlegg i Norden (2024–2026): |

### `ins-65` Dagligvarekjedenes eiendomsportefoljer utgjor over 35 mrd. NOK

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 33.1 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟢 high | 19.2 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟢 high | 18.6 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟢 high | 18.6 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | 🟢 high | 17.1 | `cmnyng10s000wd50deopby6ri` Gjennomgang av arsrapporter -- nordiske dagligvareaktorer |

### `ins-66` Estimert internleie i dagligvare: 2,5-4,6 mrd. NOK aarlig

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.7 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 10.5 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 10.2 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 10.2 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | ⚪ low | 5.1 | `cmnyng10s000wd50deopby6ri` Gjennomgang av arsrapporter -- nordiske dagligvareaktorer |

### `ins-67` Eiendomsmodellen gir 3-8 % strukturell kostnadsfordel

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 16.5 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 12.6 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 12.6 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 12.3 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | 🟡 med | 10.5 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |

### `ins-68` Odd Reitan leder personlig Reitan Eiendom med 16 mrd. i eiendeler

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 21.3 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 13.8 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 13.5 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 13.5 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | ⚪ low | 7.8 | `cmn5ibu7h00091i0dq706x6xn` Nye insights fra eiendomsmodell-analyse |

### `ins-69` Halvparten av enslige forsoergere rapporterer lav matsikkerhet

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 3.7 | `cmn7lflol006ofy0dujrlqe7y` Sammendrag: Matfattigdom i Norge og Norden |
| 2 | ⚪ low | 1.5 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | ⚪ low | 1.5 | `cmn5ibu7q000b1i0dd7amusq8` Matørkener og sårbarhet i nordisk kontekst |
| 4 | ⚪ low | 1.5 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 5 | ⚪ low | 1.2 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |

### `ins-70` Median HHI = 1,0 (monopol) paa postnummernivaa i norsk dagligvare

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 13.5 | `cmnyng110000yd50dvuprio2f` PDF-gjennomgang: Offentlige rapporter og utredninger |
| 2 | 🟡 med | 13.2 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 3 | 🟡 med | 12.9 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 4 | 🟡 med | 12.7 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |
| 5 | 🟡 med | 12.3 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |

### `ins-71` Koebenhavn 84 % oekologisk i offentlige kjokken uten oekt budsjett

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 5.8 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 2 | ⚪ low | 5.8 | `cmo87ffd2001kq30dr57jdi3c` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 3 | ⚪ low | 5.8 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 4 | ⚪ low | 3.9 | `cmo87fgkv009zq30d2fidqzcn` Lag en komplett oversikt over aktive forskningsprogrammer på sirkulære matsystemer ved nordiske universiteter og institutter (2024–2026). Inkluder: |
| 5 | ⚪ low | 3.7 | `cmoh0jq9i001mvw0d9ij0mdzj` Koebenhavn Food Strategy 2019 |

### `ins-72` Sverige leder Norden i oekologisk offentlig matinnkjoep med 39 %

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 23.1 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 23.1 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 16.8 | `cmmv9ny04004mw70d4mf5vlop` Perplexity-masterliste: Food Systems 2026 |

### `ins-73` Nordisk matsvinnreduksjon: Norge -24 %, Sverige 0 % — divergerende baner mot 2030

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 27.8 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 26.4 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 3 | 🟢 high | 25.8 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 25.8 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟢 high | 18.7 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |

### `ins-74` Sirkulaer matomkonomi: tre uutnyttede spaker — redistribusjon, biogass, innkjoep

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 10.2 | `cmn56a5bu000c3b0dhnhk77jy` Sektoranalyse: Mat og biomasse (Circular Cities) |
| 2 | 🟡 med | 9.6 | `cmn5ibvuj008c1i0dqtpb1xbg` A2. Mat og biomasse (Food & Biomass) |
| 3 | 🟡 med | 8.5 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |
| 4 | ⚪ low | 6 | `cmo87fgt200b4q30da5lqnryg` Kartlegg alle biogassanlegg i Norden som bruker matavfall som substrat: |
| 5 | ⚪ low | 6 | `cmn5ibu8b000e1i0dct0a0k6p` Nordisk sirkularitet — komparativ analyse |

### `ins-75` Panteordninger (87-94 %) mest effektive nordiske sirkulaerverktoeyet — matsvinnlov for tidlig aa evaluere

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 11.2 | `cmmpax3i2001pu10dyrnjc98w` Dypforskning: Sirkulære Matsystemer, Biogass og Ressursgjenvinning i Norden |
| 2 | 🟡 med | 8.1 | `cmn56a5bu000c3b0dhnhk77jy` Sektoranalyse: Mat og biomasse (Circular Cities) |
| 3 | ⚪ low | 7.5 | `cmo87ffdc001mq30d4b0hr65l` Nordiske dagligvarecase som mislyktes og hva de avslører om etableringsbarrierer |
| 4 | ⚪ low | 7.5 | `cmn5ibvuj008c1i0dqtpb1xbg` A2. Mat og biomasse (Food & Biomass) |
| 5 | ⚪ low | 7.5 | `cmo7gxgp50085060dxoohsr0p` Nordiske dagligvarecase som mislyktes og hva de avslører om etableringsbarrierer |

### `ins-76` REKO-ringer: 400+ ringer og 1 mill.+ medlemmer i Finland/Sverige — motmodell til kjedekonsentrasjon

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.6 | `cmo87ffcw001jq30dd5ipihrh` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 2 | 🟢 high | 24.6 | `cmo7gxgou0082060de2z51ph9` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 3 | 🟢 high | 24.3 | `cmo7gxgo4007y060dsrg4cdu1` Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden |
| 4 | 🟢 high | 20.1 | `cmmpax3td002qu10dxrl7wdei` Forbruksmonstre og matkonsum i Norden |
| 5 | 🟢 high | 17.4 | `cmmpax3so002nu10dnuztrpba` Nordisk HoReCa og Storhusholdning: Komparativ Analyse (2024-2026) |

### `ins-77` Markedskonsentrasjon som stabil attraktor: CR3 ~ 96 % i 8 aar

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 17.8 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 2 | ⚪ low | 6 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 3 | ⚪ low | 3.9 | `cmn5ibu8r000h1i0dc96zv3au` Tidsserier: Strukturelle indikatorer for norsk matsystem 2015-2025 |
| 4 | ⚪ low | 2.8 | `cmmpax3dg0008u10d0422hpen` Sammendrag: Dräger & Vågene (NHH, 2017) — Markedskonsentrasjon i Skandinavia |
| 5 | ⚪ low | 2.2 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |

### `ins-78` Eiendomsinvestering 6x raskere enn omsetningsvekst: strukturell lock-in

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 15.9 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 12.6 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 12.6 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 12.3 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | 🟡 med | 9.1 | `cmn5ibu8r000h1i0dc96zv3au` Tidsserier: Strukturelle indikatorer for norsk matsystem 2015-2025 |

### `ins-79` Divergerende trender: matsvinn -24 % mens konsentrasjon og priser vedvarer

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 15.3 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 2 | 🟡 med | 14.5 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 3 | 🟡 med | 13.2 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 4 | 🟡 med | 9 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 5 | 🟡 med | 8.4 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |

### `ins-80` Matpolitikk fragmentert over 4-6 departementer i hvert nordisk land

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 42.3 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 28.4 | `cmn5ibu7x000c1i0dgq2yfl4l` Nordisk styringsarkitektur for matsystemer — Hvem eier matpolitikken? |
| 3 | 🟢 high | 27.9 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 27.9 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟢 high | 26.8 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |

### `ins-81` Ingen nordisk institusjon eier sirkulaer matsystemomstilling

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 29.2 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 2 | 🟢 high | 27.2 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 3 | 🟢 high | 26.7 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | 🟢 high | 26.7 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟢 high | 26.7 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |

### `ins-82` Dagligvarekjedenes grossistmonopol reproduseres i HORECA

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.3 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 22.8 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 22.8 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 19 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 17 | `cmmpax3tk002su10deelzv6fp` Kryssegment Verdikjedeanalyse: Maktkonsentrasjon og Systemrisiko i Nordiske Matsystemer |

### `ins-83` Compass Group dominerer nordisk kontraktcatering etter to oppkjoep

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 27.9 | `cmokdp3qf0000y20dsvg0p64j` Nordic Nutrition Recommendations 2023 |
| 2 | 🟢 high | 24.6 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 24.6 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 5 | 🟢 high | 22.9 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |

### `ins-84` Skolematsystemet er Nordens stoerste uutnyttede folkehelseverktoy

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24.6 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 23.7 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 23.7 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.7 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 16.8 | `cmmv9ny04004mw70d4mf5vlop` Perplexity-masterliste: Food Systems 2026 |

### `ins-85` Axel Johnson-familien kontrollerer baade dagligvare og storhusholdning i Sverige

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 7 | `cmn5ibu84000d1i0dru98cgbl` HORECA som maktkonsentrasjonens andre kanal: Nordisk foodservice-kartlegging |
| 2 | ⚪ low | 6.1 | `cmo87fgmf00a9q30d2i4de17y` Kartlegg Axel Johnson-gruppen som matsystem-aktør i Sverige: |
| 3 | ⚪ low | 5.1 | `cmnyng10b000sd50dbmse2ex2` PDF-gjennomgang: Akademia (Batch 1) |
| 4 | ⚪ low | 4.3 | `cmo7gxgoh007z060dn08s7e26` AX Foundation (Sverige) — stiftelsen tilknyttet Axel Johnson-gruppen — driver et eksepsjonelt bredt matsystem-program som JT peker på som arketyp for norske initiativ. Jeg vil ha en detaljert kartlegging. |
| 5 | ⚪ low | 4.3 | `cmo87fi2u00jhq30d638mz5lz` AX Foundation (Sverige) — stiftelsen tilknyttet Axel Johnson-gruppen — driver et eksepsjonelt bredt matsystem-program som JT peker på som arketyp for norske initiativ. Jeg vil ha en detaljert kartlegging. |

### `ins-86` HORECA-sektoren mangler maktkonsentrasjonsovervaaking i alle nordiske land

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 34.8 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 31.3 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 3 | 🟢 high | 31.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 31.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟢 high | 26.2 | `cmmpax3rx002mu10d3imte3fi` Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk |

### `ins-87` EU PPWR: ny emballasjeforordning med generell anvendelse fra august 2026

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 15.4 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟡 med | 13.5 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 10.5 | `cmnyng114000zd50dfdqd91nd` PubMed PDF-gjennomgang -- Strukturert analyse |
| 4 | 🟡 med | 9 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 5 | 🟡 med | 8.4 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |

### `ins-88` Nordisk matsvinnforpliktelse: halvere matavfall innen 2030

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 32.3 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟢 high | 32.1 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 3 | 🟢 high | 27.6 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 27.6 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 5 | 🟢 high | 21.1 | `cmmpax3jc001wu10d4a4veidh` Tenketanker, NGO-er og sivilsamfunnsorganisasjoner: Nordiske matsystemer |

### `ins-89` Fem sirkulaere sloyfer for TG Food Systems

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 78.9 | `cmo7gxj9b00ik060dl8cnxidr` SourceDoc Promotion Preview |
| 2 | 🟢 high | 60.6 | `cmokdp3qf0000y20dsvg0p64j` Nordic Nutrition Recommendations 2023 |
| 3 | 🟢 high | 49.8 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 4 | 🟢 high | 48.9 | `cmmv9nxyw0047w70dj1ts8e81` Nordisk aktørkart for matsystemkartlegging 2026 |
| 5 | 🟢 high | 40.6 | `cmmxl54e20001jw0d5xz2y194` Oslo Innovasjonsprogram 2025 — Food Systems Application |

### `ins-90` ISO 59000-serien som forankring for TG sirkulaeroekonomi

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 8.1 | `cmmpax3f1000ru10dlc6nv1ep` Akademisk dypforskning: Nordiske matsystemer, markedskonsentrasjon og matpolitikk |
| 2 | ⚪ low | 5.1 | `cmo87ffa40010q30dkxh3x7qm` PDF-gjennomgang: Forskningsinstitutt, NIBIO og NORSUS |
| 3 | ⚪ low | 4 | `cmmv9nxvq0037w70d2y45dvsd` Food Access, Food Deserts og Lokal HHI — Nordisk metodikk |
| 4 | ⚪ low | 2.5 | `cmmxl54fi0006jw0d0m9q66ym` Drøfting Transition Groups — Metodikk og Governance |
| 5 | ⚪ low | 2.4 | `cmmv9nxyo0045w70dai9qqd11` Food Access, Food Deserts og Lokal HHI: Metoder, Kilder og Datasett for Nordisk og Komparativ Analyse |

### `ins-91` NMBU FeedLoop: operasjonalisert sirkulaert matsystemdesign

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 5.7 | `cmo7gxjgq00k3060dt7i115mj` Deep Research Prompt Pack - Nordic Circular Food Landscape |
| 2 | ⚪ low | 4.5 | `cmo87fgta00b5q30d48nwu64b` Kartlegg regenerativt landbruk-bevegelsen i Norden: |
| 3 | ⚪ low | 4.3 | `cmmxvfo81003e1i0dzc73zirg` Sirkulaere selskaper i norsk matsystem |
| 4 | ⚪ low | 4.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 5 | ⚪ low | 4.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |

### `ins-92` NCE Heidner kartlegger matberedskap i NO/SE/FI — parallellprosess

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 28.2 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 2 | 🟢 high | 28.2 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 25.5 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | 🟢 high | 19.8 | `cmnyng0ve0000d50ddmwephuv` Arkiv-indeks — research/ |
| 5 | 🟢 high | 19.8 | `cmo87ff5z000eq30dh9polgas` Arkiv-indeks — research/ |

### `ins-93` Eiendom som strukturell konkurransebarriere — 350+ registrerte negative servitutter

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.7 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 11.4 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 11.1 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 11.1 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | ⚪ low | 5.7 | `cmnyng10b000sd50dbmse2ex2` PDF-gjennomgang: Akademia (Batch 1) |

### `ins-94` Internleie i NorgesGruppen — NOK 168m til naerstaaende eiendom 2024

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.1 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟡 med | 11.1 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟡 med | 10.8 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟡 med | 10.8 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | ⚪ low | 5.4 | `cmnyng10s000wd50deopby6ri` Gjennomgang av arsrapporter -- nordiske dagligvareaktorer |

### `ins-95` Reitan Eiendom forvalter 2,077 millioner kvm bygningsmasse — REBUS-portefoelje overfoert

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 31.2 | `cmn5ibu7a00081i0dknxr6q79` Eiendomsmodellen i norsk dagligvare: Finansiell analyse |
| 2 | 🟢 high | 20.1 | `cmo7gxgr0008i060d9c6jwiz4` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 3 | 🟢 high | 19.5 | `cmo87ffdk001oq30dflbc2wfp` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 4 | 🟢 high | 19.5 | `cmo7gxgpq0087060dyuans2ba` Eiendomsmakt i dagligvaremarkedet i Norge og Norden |
| 5 | 🟢 high | 17.1 | `cmnyng10s000wd50deopby6ri` Gjennomgang av arsrapporter -- nordiske dagligvareaktorer |

### `ins-96` Dagligvaretilsynet: 0 vedtak om lovbrudd siden oppstart

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 7.2 | `cmnyng110000yd50dvuprio2f` PDF-gjennomgang: Offentlige rapporter og utredninger |
| 2 | ⚪ low | 6.1 | `cmn7lflsx008kfy0dbdcr0xeh` Sammendrag: Prisjeger-vedtaket -- Konkurransetilsynets historiske milliardgebyr |
| 3 | ⚪ low | 5.4 | `cmo87ffdn001pq30dgm25r9lk` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 4 | ⚪ low | 5.4 | `cmo7gxgpu0088060d09vdm923` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 5 | ⚪ low | 5.4 | `cmo7gxgrn008m060dmzwz2kkc` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |

### `ins-97` Fryktkultur: 13-17% muntlige sideavtaler; >1/3 leverandoerer delistet uten saklig grunn

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 7.9 | `cmo87ffdn001pq30dgm25r9lk` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 2 | ⚪ low | 7.9 | `cmo7gxgrn008m060dmzwz2kkc` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 3 | ⚪ low | 7.9 | `cmo7gxgpu0088060d09vdm923` Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare |
| 4 | ⚪ low | 3.6 | `cmmxgxpha005mm70dv46ao4jk` Landbruk Arena transkripsjoner |
| 5 | ⚪ low | 3.6 | `cmmxgxphj005nm70dis7i18u5` Landbruk Arena transkripsjoner med lokal ASR |

### `ins-98` Nordisk UTP-handheving: Sverige 4 sanksjonsavgifter, Danmark 1 klage trukket

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 25.8 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 2 | 🟢 high | 25.8 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 25.5 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 4 | 🟢 high | 25.3 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 5 | 🟢 high | 25.2 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |

### `ins-99` Nordisk offentlig maaltid: 5,5 millioner maaltider per dag

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 24 | `cmo87fi8l00kiq30dv4w4v2xn` Perplexity Promptpack — Møte 7 (20.04.2026) |
| 2 | 🟢 high | 23.7 | `cmo87ff59000aq30dug05vwd4` Research Corpus Audit -- Food Systems 2026 |
| 3 | 🟢 high | 23.7 | `cmn7lfl4d0004fy0d8rbhfxsd` Research Corpus Audit -- Food Systems 2026 |
| 4 | 🟢 high | 18.4 | `cmnyng10v000xd50dki28l95j` PDF-gjennomgang: Nordisk komparativ mappe |
| 5 | 🟢 high | 15 | `cmnyng0ve0000d50ddmwephuv` Arkiv-indeks — research/ |

### `ins-food-tg-01` Food TG bor snevres til Spor A+B, med C som gate

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 77.1 | `cmo7gxj9b00ik060dl8cnxidr` SourceDoc Promotion Preview |
| 2 | 🟢 high | 61.2 | `cmokdp3qf0000y20dsvg0p64j` Nordic Nutrition Recommendations 2023 |
| 3 | 🟢 high | 49.8 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 4 | 🟢 high | 48.9 | `cmmv9nxyw0047w70dj1ts8e81` Nordisk aktørkart for matsystemkartlegging 2026 |
| 5 | 🟢 high | 40.6 | `cmmxl54e20001jw0d5xz2y194` Oslo Innovasjonsprogram 2025 — Food Systems Application |

### `ins-food-tg-02` EUDR/sporbarhet er sterkest som datadriver, ikke som norsk konklusjon

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 19.8 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 2 | 🟢 high | 19.5 | `cmmxa66620033ty0d49joui46` Markedskonsentrasjon i Skandinavia |
| 3 | 🟡 med | 14.4 | `cmp11sfh50001zq0d0xllhueq` Produksjon av okologiske jordbruksvarer 2025 |
| 4 | 🟡 med | 14.1 | `cmmv9nxzd004aw70d4wwxcc5l` Nordisk sjømatfôr: Råvareopprinnelse, importavhengighet og globale sårbarheter |
| 5 | 🟡 med | 11.7 | `cmmpax3d00005u10dtuh0ykh7` Sentralt Kilderegister: Food Systems 2026 |

### `ins-food-tg-03` Matsvinnkvalitet er raskere adoption-kandidat enn fysisk prosessering

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟡 med | 14.5 | `cmmpax3t4002ou10dled3hd5b` Matsvinn og sirkulaer okonomi i matsystemet: Nordisk komparativ analyse |
| 2 | 🟡 med | 13.5 | `cmmv9nxz10048w70dm4ig1vyf` Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026) |
| 3 | 🟡 med | 9 | `cmo87fi4c00jpq30d9w30ry2h` Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer — både i offentlige institusjoner (SSB, Nordisk ministerråd, EUs JRC, norske Matsvinnutvalget, danske Fødevarestyrelsen, svenske Jordbruksverket) og i private bransjeorganer (NorgesGruppen, Coop, Axfood, Arla, Tine). |
| 4 | 🟡 med | 8.4 | `cmn5ibw8l00b41i0d680443lo` 7. Sirkulære matsystemer i Norden |
| 5 | 🟡 med | 8.1 | `cmnyng114000zd50dfdqd91nd` PubMed PDF-gjennomgang -- Strukturert analyse |

### `ins-food-tg-04` Okara/BSG er teknisk benchmark med klare gates

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | ⚪ low | 7.7 | `cmn5ibvu200861i0dwx3zi22h` SEC-MAT-PROD-03: Blå Bioøkonomi – Teknisk Detalj (Teknisk Dypdykk) |
| 2 | ⚪ low | 7.7 | `cmo87fhqy00gqq30dnqqs3d8o` SEC-MAT-PROD-03: Blå Bioøkonomi – Teknisk Detalj (Teknisk Dypdykk) |
| 3 | ⚪ low | 5.5 | `cmn56a5bp000b3b0d1uqwimer` Blå bioøkonomi — teknisk detalj |
| 4 | ⚪ low | 5.2 | `cmo7gxgox0083060dg9rbv56k` Nordiske og internasjonale benchmark-case for matsystemomstilling |
| 5 | ⚪ low | 5.2 | `cmo7gxgsc008q060ddk0uz6og` Nordiske og internasjonale benchmark-case for matsystemomstilling |

### `ins-food-tg-05` Claim-status maa styre alle uttak fra Food TG

| # | Confidence | Rank | Document |
|---|---|---|---|
| 1 | 🟢 high | 77.1 | `cmo7gxj9b00ik060dl8cnxidr` SourceDoc Promotion Preview |
| 2 | 🟢 high | 60.6 | `cmokdp3qf0000y20dsvg0p64j` Nordic Nutrition Recommendations 2023 |
| 3 | 🟢 high | 49.8 | `cmp11sfly000bzq0d14bxlvad` Iceland country profile - control system for organic production |
| 4 | 🟢 high | 48.9 | `cmmv9nxyw0047w70dj1ts8e81` Nordisk aktørkart for matsystemkartlegging 2026 |
| 5 | 🟢 high | 40.6 | `cmmxl54e20001jw0d5xz2y194` Oslo Innovasjonsprogram 2025 — Food Systems Application |

