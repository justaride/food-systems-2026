# A2. Mat og biomasse (Food & Biomass)

**Sektoranalyse | Verdikjedekartlegging**
**Dato:** 2026-03-13
**Status:** Utkast v1
**Forfatter:** Gabriel Freeman
**Konfidensmetode:** [hoy] = verifisert med primærkilde | [middels] = sekundærkilde/estimat | [lav] = enkeltkilde/utdatert | [data mangler] = ikke funnet

---

## 1. Verdikjede-diagram

```
Primærproduksjon          Foredling              Distribusjon           Detaljhandel          Konsum                Avfall/Gjenvinning
─────────────────── ──> ─────────────── ──> ──────────────── ──> ──────────────── ──> ──────────── ──> ─────────────────────────
                                                                                                      │
Jordbruk                  Slakteri/meieri         Grossist               Dagligvare             Husholdning          ┌─ Biogass (anaerob)
  - Korn/grønnsaker       Bakeri                  Lager/transport        HORECA                 Storhusholdning      ├─ Kompost
  - Husdyr/melk           Fiskeindustri           Eksport/import         Matkasse-tjenester     Institusjon          ├─ Dyrefôr
  - Potet/frukt           Drikkevare              Matsentraler           Bakerier                                    ├─ Insektprotein
                          Kornmølle               REKO-ringer            Too Good To Go                              ├─ Biokull
Fiskeri/havbruk           Fôrproduksjon                                                                             └─ Deponi (minkende)
  - Villfisk
  - Laks/ørret
  - Tang/tare

Skog/biomasse
  - Trevirke
  - GROT (greiner/topper)
  - Halm/strå
```

**Sirkulære tilbakeløp:**
- Matavfall → biogassanlegg → biogjødsel → jordbruk (lukket loop)
- Fiskebiprodukter → fôrproduksjon → havbruk
- Matoverskudd → matsentraler/Too Good To Go → konsum (redistribusjon)
- Organisk avfall → kompost → grøntareal/jordbruk

---

## 2. Volumer

### 2.1 Matsvinn (tonn/år)

| Kategori | Norge | Sverige | Danmark | Finland | Island | Kilde |
|----------|-------|---------|---------|---------|--------|-------|
| **Totalt matsvinn** | ~454 000 t (2020) [hoy] | ~880 000 t (2024, detail/konsum) [hoy] | ~814 000 t [middels] | ~400 000–641 000 t [middels] | [data mangler] | NO: NORSUS/bransjeavtale; SE: Naturvardsverket 2024; DK: dst.dk; FI: Luke |
| Husholdning | ~222 000 t (~42 kg/pers) [hoy] | ~370 000 t (~35 kg/pers) [middels] | ~244 000 t (~30%) [middels] | ~107–137 000 t (20–25 kg/pers) [middels] | [data mangler] | Nasjonal rapportering |
| Primærproduksjon | ~42 000 t (jordbruk) [hoy] | [data mangler for 2024] | [data mangler] | [data mangler] | [data mangler] | NO: NORSUS 2021 |
| Fiskeri | ~12 400 t [hoy] | [data mangler] | [data mangler] | [data mangler] | [data mangler] | NO: NORSUS 2021 |
| Industri/grossist | ~176 000 t [middels] | ~510 000 t (industri+grossist) [middels] | [data mangler] | [data mangler] | [data mangler] | Estimat |
| **Per capita totalt** | ~85 kg/pers [middels] | ~84 kg/pers [hoy] | ~139 kg/pers [middels] | ~116 kg/pers [middels] | [data mangler] | Varierende metoder |

**Nordisk total:** >3,6 millioner tonn mat kastes hvert ar [hoy]
Kilde: [Norden.org — Nordic food waste](https://www.norden.org/en/news/nordic-region-stepping-its-efforts-reduce-food-waste)

**Merknad:** Tallene er ikke direkte sammenliknbare pa tvers av land pga. ulik avgrensning og malemetodikk. EU-harmonisert rapportering (Eurostat) vil bedre sammenliknbarheten fra 2025-rapporteringsaret.

### 2.2 Biogassproduksjon

| Land | Produksjon (TWh) | Kapasitet/mal | Feedstock-dominans | Konfidens |
|------|-------------------|---------------|---------------------|-----------|
| **Norge** | ~0,47 TWh (2023) | Mal: >1,5 TWh (2030) | Matavfall, husdyrgjodsel, fiskebiprodukter | [hoy] |
| **Sverige** | ~2 TWh (AD, 2023) | Mal: 7 TWh (2030) | Matavfall, gjodsel, avlopssalm | [hoy] |
| **Danmark** | ~8,1 TWh (2024) | Mal: 100% gront gass (2030); ~41% av gassforbruk (aug 2025) | Husdyrgjodsel, matavfall, energiavlinger (<4% fra 2025) | [hoy] |
| **Finland** | ~0,93 TWh (2024) | Mal: ~4 TWh (4x okning) | Matavfall, gjodsel, industriavfall | [middels] |
| **Island** | [data mangler] | [data mangler] | [data mangler] | [data mangler] |

**Danmark er den klare nordiske lederen** med 8,1 TWh — nesten like mye som resten av Norden til sammen. Norges kapasitet er under rask utbygging med 12 anlegg under planlegging/bygging. [hoy]

Kilder:
- [IEA Bioenergy Norway 2024](https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Norway_final-.pdf)
- [IEA Bioenergy Denmark 2024](https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Denmark_final.pdf)
- [Biogas Outlook Denmark 2025](https://www.biogas.dk/wp-content/uploads/2025/11/Biogas-Outlook-2025-English-2nd-September.pdf)
- [Statistics Finland — biogas 2024](https://stat.fi/en/publication/cm1koxtuaczjr07w7sl25niug)

### 2.3 Nordisk biomasseproduksjon (overordnet)

| Biomassetype | Storste produsent | Nordisk kontekst | Konfidens |
|-------------|-------------------|------------------|-----------|
| Skogbiomasse | Sverige, Finland | Sverige og Finland dominerer; Norge nr. 3 | [hoy] |
| Husdyrgjodsel | Danmark | 60% av landarealet i jordbruk | [hoy] |
| Fiskebiprodukter | Norge | Verdens nest storste sjomateksportor | [hoy] |
| Halm/stra | Danmark, Sverige | Vesentlig for biogass-feedstock | [middels] |
| Tang/tare | Norge, Island | Voksende sektor for fôr, mat og biomaterial | [middels] |

---

## 3. Aktortabell

### 3.1 Langs verdikjeden

| Ledd | Norge | Sverige | Danmark | Finland | Konfidens |
|------|-------|---------|---------|---------|-----------|
| **Primærproduksjon** | Norges Bondelag, Gartnerhallen, Norsk Landbrukssamvirke | Lantbrukarnas Riksforbund (LRF) | Landbrug & Fodevarer | MTK (Centralforbundet for lant- och skogsbruksproducenter) | [hoy] |
| **Fiskeri/havbruk** | Sjomatrad, Mowi, SalMar, Leroy | SLU Aqua | DPPO, Royal Greenland | Luke (Naturresursinstitutet) | [middels] |
| **Foredling** | TINE, Nortura, Orkla, Bama | Arla Foods (SE/DK), Lantmannen | Arla Foods, Danish Crown, Carlsberg | Valio, Fazer, HKScan | [hoy] |
| **Distribusjon/grossist** | ASKO (NorgesGruppen), Bama | Axfood, ICA | COOP DK, Salling Group | Kesko, S-Group | [hoy] |
| **Detaljhandel** | NorgesGruppen, COOP, Rema 1000 | ICA, COOP, Axfood/Hemkop | COOP, Netto, Foetex | S-Market, K-Citymarket, Lidl FI | [hoy] |
| **Avfallshandtering** | IVAR, BIR, GIR, Vesar | Ragn-Sells, Stena Recycling | Vestforbraending, ARC | Lassila & Tikanoja, Remeo | [middels] |
| **Biogass** | St1 Biokraft, VEAS, Havila Biogass, Gasum NO | Gasum SE, Scandinavian Biogas, St1 Biokraft | Nature Energy, Bigadan | Gasum FI, St1, Doranova | [hoy] |
| **Matsentraler/redistribusjon** | Matsentralen (8 lokasjoner) | Allwin, Stockholms Stadsmission Matstationen | FodevareBanken | Yhteinen Poyta, Ruokapankki | [middels] |
| **Digitale plattformer** | Too Good To Go NO, Holdbart, REKO-ringer | Too Good To Go SE, Karma, REKO-ringer | Too Good To Go DK | ResQ Club, REKO-ringer | [hoy] |

### 3.2 Forsknings- og kunnskapsaktorer

| Omrade | Norge | Sverige | Danmark | Finland |
|--------|-------|---------|---------|---------|
| Matsvinnforskning | NORSUS, NIBIO, NMBU | SLU, IVL | DTU, Kobenhavns Universitet | Luke, VTT |
| Biogassforskning | SINTEF, NMBU | Linkopings Universitet, RISE | Aarhus Universitet, SDU | VTT, Aalto |
| Sirkulaer okonomi | NCCE, Circular Norway | IVL, Cradlenet | Ellen MacArthur (DK partnere) | SITRA, Demos Helsinki |

---

## 4. Infrastruktur

### 4.1 Fysisk infrastruktur

**Biogassanlegg (utvalg)**

| Land | Antall anlegg (ca.) | Storste anlegg | Kapasitet storste | Status |
|------|---------------------|----------------|-------------------|--------|
| Norge | ~40 (inkl. gardanlegg) | St1 Biokraft, Skogn | 125–165 GWh/ar | 12 nye under planlegging [hoy] |
| Sverige | ~280 (ca. 140 oppgraderer til biometan) | St1 Biokraft, Monsteras | 138 GWh/ar (apnet 2025) | Ekspansjon mot 7 TWh [hoy] |
| Danmark | ~175 biogassanlegg | Gjennomsnitt ~35 GWh/anlegg | 8,1 TWh total (2024) | Vekst bremser 2024-25 [hoy] |
| Finland | ~120 (inkl. 40 nye 2021-24) | 3 storskala under bygging | 100–200 GWh/anlegg | 1,02 mrd EUR planlagt [middels] |

**Kompostering og sortering**
- Alle nordiske land har kildesortering av matavfall i varierende grad
- Danmark: Obligatorisk matavfallssortering fra 2024 i alle kommuner [hoy]
- Sverige: Obligatorisk matavfallssortering fra 1. jan 2024 [hoy]
- Norge: Obligatorisk utsortering av matavfall fra 2023 (avfallsforskriften) [hoy]
- Finland: Kildesortering utvidet til alle boliger med >5 leiligheter fra 2024 [middels]

**Industriell symbiose (mat/biomasse)**
- Kalundborg (DK): Verdensforste industrielle symbiose; inkluderer naeringsmiddelindustri [hoy]
- Sotenäs (SE): Marin industriell symbiose — fiskebiprodukter til biogass og fôr [middels]

### 4.2 Digital infrastruktur

| Plattform/system | Land | Funksjon | Konfidens |
|-----------------|------|----------|-----------|
| Too Good To Go | Alle nordiske | Overskuddsmat fra butikk/restaurant til forbruker | [hoy] |
| REKO-ringer | NO, SE, FI (274 aktive ringer) | Direktesalg produsent-forbruker via Facebook | [hoy] |
| Karma | SE | Overskuddsmat-app | [middels] |
| ResQ Club | FI | Overskuddsmat-app | [middels] |
| Holdbart | NO | Prisnedslag pa varer naer utlopsdato | [middels] |
| DIGIFOOD | NO, SE, DK (forskningsprosjekt) | Digitalisering av REKO-ringer; NordForsk/USN-ledet | [middels] |
| Matsvinn.no | NO | Bransjeavtalens rapporteringsplattform | [hoy] |
| Naturvardsverket data | SE | Nasjonal matavfallsstatistikk | [hoy] |
| FoodWasteExplorer (Eurostat) | EU/EOS | EU-harmonisert matsvinndata | [middels] |

**REKO-ringer i tall:** 274 aktive ringer, 786 000 aktive forbrukere, ~500 MNOK arlig omsetning [middels]
Kilde: [USN — DIGIFOOD](https://www.usn.no/forskning/forskningsgrupper-og-senter/okonomi-ledelse-og-regulering/digital-transformasjon/prosjekter/transforming-the-nordic-reko-rings-into-a-sustainable-digital-local-food-system-digifood)

---

## 5. Politikk og regulering

| Instrument | NO | SE | DK | FI | IS | EU |
|-----------|----|----|----|----|----|----|
| **Bransjeavtale matsvinn** | Ja (2017, 5 dep. + 12 bransjeorg.) [hoy] | Frivillig mal (Livsmedelsverket) [middels] | Frivillig ("Together against food waste") [middels] | Frivillig (Luke-koordinert) [lav] | Matarsoun-initiativ [lav] | Anbefaling |
| **Malsetting matsvinnreduksjon** | 50% innen 2030 (SDG 12.3) [hoy] | 50% innen 2030 [hoy] | 50% innen 2030 [hoy] | 50% innen 2030 [middels] | [data mangler] | **Bindende: 10% industri, 30% detaljh./hush. innen 2030** [hoy] |
| **Kildesortering matavfall** | Obligatorisk fra 2023 [hoy] | Obligatorisk fra jan 2024 [hoy] | Obligatorisk alle kommuner 2024 [hoy] | Utvidet 2024 (>5 leileigheter) [middels] | Obligatorisk (4 fraksjoner, 2023) [middels] | WFD-revisjon 2025 |
| **Biogassstotte** | Enova-stotte, investeringsstotte [hoy] | Biogassutredning 2023, skatteincentiver [middels] | Subsidieordning (peak 2024) [hoy] | Investeringsstotte [middels] | [data mangler] | REPowerEU |
| **Matdonasjonsvern** | Frivillig/veiledning [middels] | Frivillig [middels] | Frivillig [middels] | Frivillig [middels] | [data mangler] | Anbefaling; WFD 2025 krever tilrettelegging [hoy] |
| **Daterapportering** | Bransjeavtale-rapportering 2021/2025/2030 [hoy] | Naturvardsverket arlig fra 2020 [hoy] | Dst.dk arlig [middels] | Luke + Stat.fi [middels] | [data mangler] | Eurostat-rapportering 2022-harmonisert |

### EU Waste Framework Directive — revisjon 2025

Den reviderte avfallsrammedirektivet (i kraft oktober 2025) introduserer:
- **Bindende matsvinnreduksjonmal:** 10% fra foredling/industri, 30% per capita fra detaljhandel/restaurant/husholdning — innen 31. desember 2030 [hoy]
- **Baseline:** Gjennomsnittlig arlig matsvinn 2021–2023
- **Ansvarlig myndighet:** Utpekes innen 17. januar 2026
- **Tilpasning av programmer:** Innen 17. oktober 2027
- **Matdonasjonsplikt:** Okonomiske aktorer ma tilrettelegge for donasjon av usolgt mat

Kilde: [European Commission — food waste reduction targets](https://food.ec.europa.eu/food-safety/food-waste/eu-food-waste-relevant-legislation/food-waste-reduction-targets_en)

---

## 6. Finansieringsstrommer

### 6.1 EU-finansiering

| Program | Budsjett (relevant) | Fokus | Tidsrom | Konfidens |
|---------|---------------------|-------|---------|-----------|
| Horizon Europe Cluster 6 | ~677 MEUR (2026), ~632 MEUR (2027) | Mat, biookonomi, naturressurser, jordbruk, miljo | Soknader april/sept 2026 | [hoy] |
| CCRI (Circular Cities & Regions Initiative) | Varierer per utlysning | Sirkulaere matsystemer i byer/regioner (HOOP, Agro2Circular, P2Green m.fl.) | Lopende | [hoy] |
| LIFE Programme | Varierer | Miljo/klima, inkl. bioavfallsvalorisering | Lopende | [middels] |
| Interreg / NPA | Varierer | Nordiske/arktiske matsvinn- og biogassprosjekter (SYMBIOMA m.fl.) | Lopende | [middels] |

### 6.2 Nordisk finansiering

| Program | Budsjett | Fokus | Konfidens |
|---------|----------|-------|-----------|
| Nordic Innovation — Circular Cities | 15 MNOK | Sirkulaere losninger i nordiske byer, inkl. mat | [hoy] |
| NordForsk — DIGIFOOD | Forskningsfinansiering | Digital transformasjon av REKO-ringer | [middels] |
| Nordic Bioeconomy Programme | Varierer | Biookonomi i Norden | [middels] |
| Nordic Council — NCE Working Group | Policy-koordinering | Harmonisering av sirkulaer okonomipolitikk | [hoy] |

### 6.3 Nasjonal finansiering

| Land | Viktigste mekanisme | Fokus | Konfidens |
|------|---------------------|-------|-----------|
| Norge | Enova, Innovasjon Norge, Forskningsradet | Biogass, matsvinnreduksjon, sirkulaer bioressurs | [hoy] |
| Sverige | Naturvardsverket, Energimyndigheten | Biogass, matavfall, sirkulaer okonomi | [middels] |
| Danmark | Danish Industry Foundation (125 MDKK), Energistyrelsen | Sirkulaer omstilling, biogass, gront gass | [hoy] |
| Finland | Business Finland, SITRA, YM (Miljomin.) | Biookonomi, sirkulaer okonomi | [middels] |

---

## 7. Grensekryssende strommer

### 7.1 Handel i mat og biomasse

| Strom | Retning | Volum/verdi | Konfidens |
|-------|---------|-------------|-----------|
| Norsk sjomateksport | NO → EU/globalt | ~150 mrd NOK/ar (2024); verdens nest storste sjomateksportor | [hoy] |
| Dansk mateksport | DK → EU/globalt | Jordbruk = ~25% av dansk eksportverdi | [hoy] |
| Svensk trelast/biomasse | SE → EU | Stor eksportor av trebasert biomasse | [middels] |
| Finsk trelast/bioenergi | FI → EU | Stor eksportor av trebasert biomasse og bioenergi | [middels] |
| Fôrimport | EU → NO, FI | Soyamel, korn til husdyrfôr | [middels] |
| Frukt/gronnsaker-import | EU → NO, SE, FI | Nordisk selvforsyningsgrad lav pa frukt/gront | [middels] |

### 7.2 Biogass og biogjodsel

| Strom | Retning | Kontekst | Konfidens |
|-------|---------|----------|-----------|
| LBG (flytende biogass) | DK/SE → NO | Norge importerer biogass; begrenset egen produksjon | [middels] |
| Gasum nordisk nettverk | FI ↔ SE ↔ NO | Gasum opererer biogassanlegg i alle tre land | [hoy] |
| Biogjodsel | Lokalt/regionalt | Biogassdigestat brukes som gjodsel lokalt; begrenset grensehandel | [middels] |

### 7.3 Politiske barrierer for grensekryssende strommer

- **Ulik klassifisering:** Matavfall klassifiseres ulikt som avfall vs. biprodukt pa tvers av land [middels]
- **Transportregulering:** EU avfallstransportforordning begrenser grenseoverskridende avfallstransport [hoy]
- **Veterinærkrav:** Animalske biprodukter (ABP-forordningen) har strenge krav til grensehandel [hoy]
- **EOS-forskjeller:** Norge (EOS) vs. EU-medlemmer har noen forskjeller i implementering [middels]

---

## 8. Bruddpunkter og gap

### 8.1 Strukturelle gap

| Gap | Beskrivelse | Alvorlighetsgrad | Konfidens |
|-----|-------------|-------------------|-----------|
| **Manglende harmonisert matsvinndata** | Ulikt malegrunnlag gjor nordisk sammenlikning vanskelig; Eurostat-harmonisering forventet 2025+ | Hoy | [hoy] |
| **Biogass-kapasitetsgap i NO og FI** | Norge (0,47 TWh) og Finland (0,93 TWh) langt bak Danmark (8,1 TWh); stort potensial, treg utbygging | Hoy | [hoy] |
| **Lav matavfallsseparering i praksis** | Tross obligatorisk kildesortering er faktisk utsorteringsgrad variabel, spesielt i leilighetsbygg | Middels | [middels] |
| **Matredistribusjon underutnyttet** | Matsentraler dekker bare en brokdel av overskuddsmat; logistikk og regulering er barrierer | Middels | [middels] |
| **Islands manglende strategi** | Ingen nasjonal matsvinnstrategi, ingen biogass av betydning, ingen CCD-signering | Hoy | [hoy] |
| **Primaerproduksjonsdata mangler** | Matsvinn i jordbruk/fiskeri er darlig kartlagt i alle nordiske land unntatt Norge | Middels | [middels] |

### 8.2 Sirkulaere muligheter (bruddpunkter for innovasjon)

| Mulighet | Beskrivelse | TRL | Konfidens |
|----------|-------------|-----|-----------|
| **Insektprotein fra matavfall** | Larver (Black Soldier Fly) omdanner matavfall til proteinrikt fôr; flere nordiske startups | 5–7 | [middels] |
| **Tang/tare-verdikjede** | Dyrking, hosting og prosessering av tang til mat, fôr, biomaterial, bioenergi | 4–6 | [middels] |
| **Biokull fra biomasserester** | Pyrolyse av trevirke/avlingsrester til karbonfangst og jordforbedring | 6–8 | [middels] |
| **Digital matsvinnsporing** | AI-basert prediktiv bestilling, automatisk prising, IoT-temperaturovervaking | 7–9 | [hoy] |
| **Naeringskretslopet** | Fosfor- og nitrogengjenvining fra bioavfall/avlopsslam til gjodsel (P2Green, NPower) | 5–7 | [middels] |

---

## 9. WP-relevans

### WP1: Samfunn (Sosial sirkulaer okonomi)

| Kobling | Relevans | Referanse |
|---------|----------|-----------|
| **REKO-ringer som sosial infrastruktur** | 274 ringer med 786 000 forbrukere = desentralisert, demokratisk matsystem; direkte kobling til SSE-prinsipper om fellesskapsstyring | DR-05, ESS-08 |
| **Matsentralen som sosial sirkulaer bedrift** | Redistribusjon av overskuddsmat til sarbarge grupper; 4 000+ tonn/ar (NO); kombinerer matsvinnreduksjon med sosial inkludering | DR-05 |
| **Too Good To Go som forbrukerengasjement** | 8,1 millioner maltider reddet (H1 2025, globalt); 67% vekst; gjor sirkulaer atferd tilgjengelig for alle | — |
| **Matsvinnbransjeavtalen** | Norsk multi-stakeholder governance-modell: 5 departementer + 12 bransjeorganisasjoner = tverrsektoriell samhandling | Kongsvinger-11 |
| **Matfattigdom og rettferdig omstilling** | Matsentraler viser at sirkulaer okonomi kan adressere ulikhet; jf. RREUSE-modellen (70 arbeidsplasser per 1 000 tonn) | DR-05 |

### WP2: System (materialstrom og urban symbiose)

| Kobling | Relevans | Referanse |
|---------|----------|-----------|
| **Biogass som urban metabolisme** | Matavfall → biogass → energi + biogjodsel → jordbruk = eksemplarisk urban symbiosekrets | MFA-14 |
| **Kalundborg matavfallsintegrasjon** | Industriell symbiose inkluderer naeringsmiddelindustri; overforbar til nordiske byregioner | Kalundborg-10 |
| **MFA-metodikk for matstrommer** | Circle Economy/Circle Scan (Kongsvinger) kartla regionens matstrommer; overforbar metode | Kongsvinger-11 |
| **Gasum-nettverket** | Grensekryssende biogassinfrastruktur (FI-SE-NO) = eksempel pa nordisk systemintegrasjon | — |
| **Digital plattformintegrasjon** | REKO + TGTG + Karma + Holdbart = fragmentert digitalt okosystem; mulighet for systemintegrasjon | — |

### WP3: Material (bygd miljo)

| Kobling | Relevans | Referanse |
|---------|----------|-----------|
| **Biobaserte byggematerialer** | Trevirke, halm, tang som byggematerial; kobling til Public Circular Buildings | PCB-referanse |
| **Biogassanlegg som infrastruktur** | Plassering, utforming og integrering av biogassanlegg i bylandskap = arkitektonisk utfordring | — |
| **Kompostfasiliteter i bydeler** | Nabolagskompostering som del av sirkulaer byutvikling (jf. Amsterdam Buiksloterham) | Amsterdam-09 |

---

## 10. Kongsvinger-muligheter

### 10.1 Lokal kontekst

Kongsvinger i Innlandet fylke har relevant matproduksjons- og biomassekontekst:

- **Jordbruksregion:** Innlandet er Norges storste jordbruksfylke (etter areal); Kongsvinger-regionen har aktiv primærproduksjon med gront, potet, korn og husdyr [middels]
- **Midt i Matfatet:** Innlandets arlige moteplass for mat, jordbruk og reiseliv ble holdt i Kongsvinger-regionen (sept. 2022) — viser regional mat-identitet [hoy]
- **7sterke klyngen:** 90+ bedrifter inkl. matrelatert industri; baerekraftnettverk etablert 2018 [hoy]
- **GIR (avfallshandtering):** Glassregionen Interkommunale Renovasjonsselskap handterer matavfall for regionen [hoy]
- **Circle Scan:** Kongsvinger var Norges forste Circle Region Scan (2019-2021) — kartla materialstrommer inkl. matrelaterte strommer [hoy]

### 10.2 Muligheter for sirkulaer matproduksjon

| Mulighet | Beskrivelse | Aktorer | Prioritet |
|----------|-------------|---------|-----------|
| **Regionalt biogassanlegg** | Innlandet er malomrade for Havila Biogass (100 GWh planlagt 2027-28); kan koble jordbruksgjodsel og matavfall fra Kongsvinger-regionen | Havila Biogass, 7sterke, GIR | Hoy |
| **REKO-ring Kongsvinger** | Etablere/styrke lokal REKO-ring for direktesalg fra regionale produsenter; bygge pa Midt i Matfatet-nettverket | Lokale gardsbruk (f.eks. Skarstad), forbrukere | Middels |
| **Matsentralen Innlandet** | Utvide matsentralnettverk til Innlandet; koble overskudd fra detaljhandel/HORECA til lokale organisasjoner | Matsentralen, COOP, NorgesGruppen lokalt | Middels |
| **Sirkulaert fôr-kreatsalop** | Fiskebiprodukter og matavfall → insektprotein eller biogass → biogjodsel → lokalt jordbruk | 7sterke-bedrifter, NMBU, Hogskolesenteret Kongsvinger | Lav (TRL) |
| **Montreal-struktur for mat** | Anvende den tverrsektorielle radgivningsmodellen (Kongsvinger Montreal-struktur) pa matsektorens verdikjede — koordinere jordbruk, industri, avfall, kommune | Einar/Martin (Natural State), kommunene, 7sterke | Hoy |
| **Kongsvinger som pilotby for EU matsvinnmal** | Bruke Circle Scan-data som baseline for a pilotere EU WFD 2025 matsvinnreduksjon (10%/30% mal) pa regionalt niva | Kongsvinger kommune, GIR, NORSUS | Middels |

### 10.3 Kobling til Circle City Life

Kongsvinger-regionens mat/biomasse-muligheter styrker Circle City Life-prosjektet pa tre niva:
1. **WP1 (Samfunn):** Montreal-strukturen for mat = tverrsektoriell governance-modell for sirkulaert matsystem
2. **WP2 (System):** Circle Scan-data gir baseline for regional MFA pa matstrommer; Havila Biogass-prosjektet gir konkret urban symbiose-case
3. **WP3 (Material):** Biobaserte byggematerialer fra lokal biomasse (trevirke fra Glommaskogene, halm) kobler til Public Circular Buildings

---

## Kilder

### Nasjonale datakilder
- [NORSUS — matsvinnforskning](https://norsus.no/en/norsus-forskning-pa-matsvinn-og-samfunnseffektene-dette-har-hatt/)
- [Naturvardsverket — livsmedelsavfall 2024](https://www.naturvardsverket.se/data-och-statistik/avfall/avfall-mat/)
- [Statistics Denmark — SDG 12.3.1 food waste](https://www.dst.dk/en/Statistik/temaer/SDG/globale-verdensmaal/12-ansvarligt-forbrug-og-produktion/delmaal-03/indikator-1)
- [Luke — food waste Finland](https://www.luke.fi/en/luonnonvaratieto/science-and-information/biomassaatlas/biomassaatlaksen-biomassat/food-waste)
- [SSB — avfall fra hushalda](https://www.ssb.no/en/natur-og-miljo/avfall/statistikk/avfall-fra-hushalda)

### Biogass og biomasse
- [IEA Bioenergy Norway 2024](https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Norway_final-.pdf)
- [IEA Bioenergy Denmark 2024](https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Denmark_final.pdf)
- [IEA Bioenergy Sweden 2024](https://www.ieabioenergy.com/wp-content/uploads/2024/12/CountryReport2024_Sweden_final.pdf)
- [Biogas Outlook Denmark 2025](https://www.biogas.dk/wp-content/uploads/2025/11/Biogas-Outlook-2025-English-2nd-September.pdf)
- [Statistics Finland — biogas 2024](https://stat.fi/en/publication/cm1koxtuaczjr07w7sl25niug)
- [Havila Biogass — Nordsol plants](https://nordsol.com/news/havila-biogass-selects-nordsol-to-develop-three-lbg-production-plants-in-norway/)
- [Doranova — biogas Finland](https://www.doranova.fi/en/what-kind-of-biogas-plants-are-being-built-in-finland/)

### EU-politikk
- [EU food waste reduction targets](https://food.ec.europa.eu/food-safety/food-waste/eu-food-waste-relevant-legislation/food-waste-reduction-targets_en)
- [Revised Waste Framework Directive 2025](https://environment.ec.europa.eu/news/revised-waste-framework-directive-enters-force-2025-10-16_en)
- [European Parliament — food waste rules 2025](https://www.europarl.europa.eu/news/en/press-room/20250905IPR30172/parliament-adopts-new-eu-rules-to-reduce-textile-and-food-waste)
- [Horizon Europe Cluster 6 — 2026-2027 work programme](https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-9-food-bioeconomy-natural-resources-agriculture-and-environment_horizon-2026-2027_en.pdf)

### Sirkulaere matinitiativ
- [Too Good To Go](https://www.toogoodtogo.com/)
- [USN — DIGIFOOD / REKO-ringer](https://www.usn.no/forskning/forskningsgrupper-og-senter/okonomi-ledelse-og-regulering/digital-transformasjon/prosjekter/transforming-the-nordic-reko-rings-into-a-sustainable-digital-local-food-system-digifood)
- [Matsentralen Norge](https://www.matsentralen.no/english)
- [Norden.org — Nordic food waste reduction](https://www.norden.org/en/news/nordic-region-stepping-its-efforts-reduce-food-waste)
- [Norden.org — food banks unused potential](https://www.norden.org/en/news/new-nordic-study-food-banks-have-big-unused-potential-minimize-food-waste)

### Kongsvinger
- [Kongsvingerregionen — sirkulaerokonomi](https://kongsvingerregionen.no/norges-gronne-hjerte/sirkulaerokonomi/)
- [Circle Economy — Circular Kongsvinger Region](https://www.circle-economy.com/resources/circular-kongsvinger-region)
- [Kongsvingerregionen — Midt i Matfatet](https://kongsvingerregionen.no/en/midt-i-matfatet-innlandets-moteplass-for-mat-landbruk-og-reiseliv-16-18-september-2022/)
- [County Governor Innlandet — agriculture](https://www.statsforvalteren.no/en/innlandet/agriculture-and-food/)

### Nordisk kontekst
- [Norden.org — bioeconomy](https://www.norden.org/en/information/bioeconomy-nordic-region)
- [Nordic food waste monitoring (TemaNord 2021:504)](https://pub.norden.org/temanord2021-504/)
- [Food and Land Use Coalition — The Nordics](https://www.foodandlandusecoalition.org/wp-content/uploads/2019/10/TheNordics-Food_and_Land_Use.pdf)
- [Nordic Biogas Conference 2026 (Reykjavik)](https://nordicbiogasconference.com/)

### CCRI-prosjekter (mat/biomasse-relevant)
- HOOP — Urban biowaste and wastewater valorization
- Agro2Circular — Agri-food sector residues upcycling
- P2Green — Bio-based fertilizers from human excreta
- NPower — Nutrient flow balancing
- EcoeFISHent — Valorization of fishing/fish industry side-streams
- BIOMODEL4REGIONS — Bio-based economy governance models
