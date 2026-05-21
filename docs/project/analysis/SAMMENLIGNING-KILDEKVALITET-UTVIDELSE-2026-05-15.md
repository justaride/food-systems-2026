# /sammenligning — kildekvalitet, verifisering, transparens og utvidelse

**Dato:** 2026-05-15
**Eier:** Gabriel
**Status:** Analyse + tiltaksplan (ikke implementert ennå)
**Bygger på:** [SAMMENLIGNING-DATAGAP-MATRISE-2026-05-15.md](SAMMENLIGNING-DATAGAP-MATRISE-2026-05-15.md) — denne dokumenterer **hvor data mangler**; dette dokumentet dekker **hvor data kommer fra, hvor godt det er kvalitetssikret, hvilke verifiseringskilder som finnes, og hvilke utvidelser som er aktuelle**.

## TL;DR

1. **Nåværende dekning:** /sammenligning leser 5 × `value-chain.json` + 5 × `chart-metrics.json`. Av 36 sentrale datapunkter er 44 % fylt; 17 % kan tettes via kode/schema-fixes uten ny innsamling (egen sak — gap-matrisen).
2. **Kvalitetsprofil:** NO bygger nesten utelukkende på primær-statistikkbyrå (SSB, NIBIO, Sjømatrådet, NORSUS). SE/DK/FI har solide markedsstruktur-tall (Konkurrensverket/KFST/KKV + Eurostat-organisk) men `data_quality_flag: local_research_needs_primary_check` på sjømat, foredling og distribusjon. IS er nesten gjennomgående `needs_primary_check`.
3. **Transparens-gap i UI:** Bare 1 av 23 `ChartCard` har eksplisitt `source`-prop. Resten arver kildeinfo fra Bolk-nivå `ResearchEvidenceBadge`. JSON inneholder strukturerte `sources: [...]`-arrayer per ledd, men de når aldri brukeren.
4. **Verifiseringspotensiale:** For 90+ % av metrikkene finnes minst 2 uavhengige nordiske/EU-kilder vi enten allerede bruker (KILDEREGISTER) eller kan koble til via Eurostat SDMX, Nordstat, OECD eller landspesifikke statistikkbyråer.
5. **Utvidelse:** Wageningen 16-indikator-rammeverket (Elbersen 2022) er allerede integrert i prosjektets KILDEREGISTER § 12.4 og rammeverket § 9 — men er ikke koblet inn på /sammenligning. Det åpner for å utvide Bolk 4 (Sirkularitet) med 4–6 nye kvantifiserbare datapunkter (kaskade-nivå, sosial sirkularitet, residue-utnyttelse).

---

## Del A — Kilde-audit per Bolk

Legende kvalitet:
- 🟢 **Primær statistikkbyrå/regulator** — siterbar (SSB, SCB, DST, Luke, Hagstofa, Eurostat, Konkurransetilsynet/Konkurrensverket/KFST/KKV)
- 🟡 **Etablert sekundær** — bransjeorganisasjon/aksepterte rapporter (Sjømatrådet, NORSUS, Matvett, Animalia, IEA Bioenergy)
- 🟠 **Selskaps-/sektoretspesifikk** — årsrapporter, pressemeldinger, lokal sektoranalyse
- 🔴 **Lokal research / needs_primary_check** — `data_quality_flag` indikerer at primærsjekk ikke er gjort

### Bolk 1 — Markedsstruktur & makt

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| HHI (parents) | 🟢 chart-metrics.json (derivert fra stores.json/Konkurransetilsynet) | 🟢 SCB/Konkurrensverket | 🟢 KFST | 🟢 KKV/PTY | 🟢 (men n=243 butikker) |
| CR3 / CR2 | 🟢 (samme) | 🟢 Konkurrensverket | 🟢 KFST | 🟢 KKV | 🟡 lokal estimat |
| Gini (butikkstørrelse) | 🟢 derivert fra stores.json + municipalities.json | 🟢 derivert | 🟢 derivert | 🟢 derivert | 🟢 derivert |
| Antall butikker | 🟢 stores.json (OSM + brand-attribution) | 🟢 SCB | 🟢 DST | 🟢 KKV/PTY | 🟢 |
| EMV-andel foredling | 🟠 i `notes`-felt | 🟢 SCB PxWeb | 🟠 i `notes` | 🟢 PTY | ❌ |
| Discount-andel | 🟠 i `format_share` (NO bare) | ❌ | 🟠 i `notes` (">40%") | ❌ | ❌ |
| Topp 3 parents | 🟢 chart-metrics | 🟢 Konkurrensverket | 🟢 KFST + årsrapporter | 🟢 KKV | 🟠 lokal estimat (Hagar) |

**Vurdering:** Markedsstruktur er den **mest robust dokumenterte** Bolken. Alle 5 land har offentlig konkurransetilsyn med årlige analyser. Hovedkvalitetsproblemet er at NO bruker derivert HHI fra OSM-butikkdata (proxy for omsetning-HHI), mens SE/DK/FI/IS bruker offentlig oppgitte omsetningstall fra konkurransetilsyn. **Dette gir asymmetri og bør flagges.**

### Bolk 2 — Selvforsyning & beredskap

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| Selvforsyning kalori % | 🟢 NIBIO Engrosforbruk AB5/AB6 2024 | 🟢 Jordbruksverket + SOU 2024:8 | 🟢 DST + Landbrug & Fødevarer | 🟢 Luke | 🟠 estimat fra Hagstofa + policy-landscape |
| Mål-%/-år | 🟢 Meld. St. 11 (2023-2024) | ❌ | ❌ | 🟢 HVK | ❌ |
| Total import/eksport (tonn) | 🟢 SSB 08799 | ❌ (kun verdi i SEK) | ❌ | ❌ | ❌ |
| Fôr-import-andel | 🟡 i `notes` (Sjømatrådet: 92% sjømat-fôr; NIBIO: ~70% husdyr-fôr) | ❌ | ❌ | ❌ | ❌ |
| Kornreserve mnd | ❌ (NO avviklet 2003) | 🟡 utredning pågår | ❌ | 🟢 HVK | ❌ |

**Vurdering:** Selvforsyning er **politisk omstridt og definisjonssensitivt**. DK 300 % og NO 41 % er teknisk korrekte men ikke direkte sammenlignbare — DK inkluderer eksportoverskudd, NO inkluderer importert fôr. Dette **må eksponeres i UI**, ikke skjules.

### Bolk 3 — Verdikjedevolum & verdiskaping

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| Primærvolum tonn | 🟢 SSB 09171 | ❌ | 🟢 DST (aggregert) | ❌ | ❌ |
| Sjømat eksportverdi | 🟢 Sjømatrådet | 🔴 `local_research_needs_primary_check` | 🔴 samme | 🔴 samme | ❌ |
| Foredlings-omsetning | 🟢 SSB 13470 | 🟢 SCB PxWeb | 🟢 DST | 🟢 stat.fi PxWeb | ❌ |
| Sysselsetting NACE | 🟢 SSB 09171 | ❌ | ❌ | ❌ | ❌ |
| Verdiskaping per ledd | 🟢 NORSUS LCA-rammeverk | ❌ | ❌ | ❌ | ❌ |
| CO₂e per ledd | 🟢 NORSUS (kun NO) | ❌ | ❌ | ❌ | ❌ |

**Vurdering:** Verdikjede-Bolken har lavest dekning (14 %) og **høyest kvalitetsasymmetri**. NO er bygd på SSB+NORSUS — det finnes ingen 1:1 motpart for de andre landene fordi NORSUS-modellen er norsk-spesifikk. Eurostat NACE-data kan harmonisere sysselsetting, men ikke verdiskaping per ledd.

### Bolk 4 — Sirkularitet & matsvinn

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| Total svinn kg/cap | 🟢 NORSUS/Matvett 2024 | 🟢 Naturvårdsverket Rapport 7176 | 🟢 DST | 🟢 Luke | ❌ |
| Husholdningssvinn | 🟢 NORSUS | 🟢 Naturvårdsverket | 🟢 DST | 🟢 Luke | ❌ |
| Svinn-reduksjon siden 2015 | 🟢 NORSUS/Matvett tidsserie | ❌ | ❌ | ❌ | ❌ |
| Biogass GWh + anlegg | 🟢 IEA Bioenergy NO 2024 | 🟢 IEA Bioenergy SE 2024 | 🟢 IEA Bioenergy DK 2024 + Biogas Outlook 2025 | 🟢 Luke + stat.fi | ❌ |
| Pant-returrate | 🟢 Infinitum 92.3 % | 🟢 Pantamera 87 % | ❌ (men Dansk Retursystem ~93%) | ❌ (men Palpa ~94%) | ❌ |
| Matsvinn per kategori | 🟡 NORSUS-derivert nordisk estimat | ❌ | ❌ | ❌ | ❌ |

**Vurdering:** Sirkularitet er **nest best dekket** etter markedsstruktur (60 %). De fire største landene har sammenlignbare NORSUS/Naturvårdsverket/DST/Luke-rapporter med samme metode (TemaNord 2021:504). Tre lavthengende verifiseringer: Dansk Retursystem-årsrapport (DK pant), Palpa-årsrapport (FI pant), Umhverfisstofnun (IS).

### Bolk 5 — Politikk & regulering

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| Lov-/forskrift-tiltak | 🟢 Lovdata (LOV-2025-06-20-103 matsvinnloven) | 🟢 SOU 2024:8 | 🟢 KFST + Klimaaftale 2024 | 🟢 Luke + HVK | 🟠 Matarsoun + sortering 2023 |
| Frivillige avtaler | 🟢 Bransjeavtalen 2017 | 🟢 50% mål 2030 | 🟢 Together Against FW | 🟢 Luke-mål | ❌ |

**Vurdering:** Politikk er **strukturelt komplett** (100 % dekning), men IS har bare 2 tiltak registrert — undermapping. Norsk Matvælastefnu 2024 og fiskeriforvaltningslovgivning bør legges til.

---

## Del B — Verifiseringskilder (kryssvalidering)

For hver hovedmetrikk, foreslår vi 2–3 uavhengige kilder som kan brukes til å verifisere primærkilden. Disse er ikke ment som erstatning — de er **triangulering** for å fange opp definisjonsforskjeller og rapporteringsfeil.

### Markedsstruktur & makt

| Metrikk | Primær | Verifisering 1 | Verifisering 2 |
|---|---|---|---|
| HHI/CR3 dagligvare | Konkurrensverket/Konkurransetilsynet/KFST/KKV | NielsenIQ Dagligvarerapporten | Selskapenes egne årsrapporter (sjekk Coop, ICA, Salling, S-Group, Hagar) |
| Antall butikker | Stat-byrå | OSM (Overpass API) | Bransjeforening (Virke, Svensk Handel, COOP DK, PTY) |
| EMV-andel | Bransjeundersøkelser | DLF (Dagligvareleverandørenes Forening) | Selskapenes egenrapporterte EMV |
| Discount-andel | Sektoranalyse | NielsenIQ | Bransjeforening |

### Selvforsyning & beredskap

| Metrikk | Primær | Verifisering 1 | Verifisering 2 |
|---|---|---|---|
| Kalori-selvforsyning | NIBIO/Jordbruksverket/DST/Luke | FAO Food Balance Sheets | OECD Agricultural Outlook |
| Strategiske reserver | HVK (FI), nasjonale beredskapsdok | NATO/EU food security index | SIPRI/SEI rapporter |
| Fôr-import | Sjømatrådet (NO), LRF (SE), Landbrug & Fødevarer (DK) | Eurostat ext_lt_intertrd (foderstoffer) | OECD-FAO Outlook |
| Korn-balanse | Stat-byrå | Eurostat apro_cpsh1 | USDA FAS |

### Verdikjedevolum & verdiskaping

| Metrikk | Primær | Verifisering 1 | Verifisering 2 |
|---|---|---|---|
| Primærvolum | Stat-byrå (jordbruk) | Eurostat apro_cpsh1 / fish_aq | FAO STAT |
| Sjømat eksportverdi | Sjømatrådet | Eurostat DS-018995 | UN Comtrade |
| Foredlings-omsetning | Stat-byrå (NACE 10+11) | Eurostat sbs_na_ind_r2 | OECD STAN |
| Sysselsetting NACE | Stat-byrå | Eurostat lfsa_egan22d | OECD STAN-employment |
| Verdiskaping per ledd | NORSUS (NO) | LCA-database ecoinvent | Eurostat sbs_na_ind_r2 (value-added) |
| CO₂e per ledd | NORSUS | Naturvårdsverket scope 1+2+3 | DCE Aarhus University (DK) |

### Sirkularitet & matsvinn

| Metrikk | Primær | Verifisering 1 | Verifisering 2 |
|---|---|---|---|
| Total svinn kg/cap | Nat. rapport (NORSUS/Naturvårdsverket/DST/Luke) | Eurostat env_wasfw | TemaNord 2021:504 (felles metode) |
| Husholdningssvinn | Samme | Forbrukerundersøkelser (SIFO, Konsumentverket) | UNEP Food Waste Index 2024 |
| Svinn-reduksjon | NORSUS tidsserie (NO) | Bransjeavtalen rapportering | Eurostat env_wasfw tidsserie (fra 2020) |
| Biogass | IEA Bioenergy | EU EurObservER barometer | Nasjonale energimyndigheter |
| Pant-returrate | Selskap (Infinitum/Pantamera/Dansk Retursystem/Palpa/Endurvinnslan) | Bransjeavtaler / miljømyndighet | EU SUP-direktiv-rapportering |
| Matsvinn per kategori | NORSUS (NO) | DTU Fødevareinstituttet (DK), Naturvårdsverket (SE), Luke (FI), Umhverfisstofnun (IS) | TemaNord 2021:504 |

### Politikk & regulering

| Metrikk | Primær | Verifisering 1 | Verifisering 2 |
|---|---|---|---|
| Lover/forskrifter | Lovdata + nat. lovregister | EU Commission food law database | Nordic Council policy database |
| Frivillige avtaler | Bransje-/myndighetsavtaler | NielsenIQ/PostNord/PTY rapporter | NCM Nordic Cooperation reports |

---

## Del C — Transparens og kildeføring i UI

### C.1 Nåværende status

| Element | Hvor | Synlighet | Datakilde |
|---|---|---|---|
| Bolk-nivå `ResearchEvidenceBadge` | `BolkSection.tsx` | ✅ synlig som farget pill ved siden av tittel | hardkodet `researchStatus` + `researchStatusDetail` i `SammenligningContent.tsx` |
| Datapunkt-nivå `InfoPopover` | `ChartCard.tsx` | ⚠️ "i"-ikon, klikkbar — viser år + source-string | `year` og `source` prop, **men kun 1/23 ChartCard sender dette** |
| Sources-array i JSON | hver `value-chain.json` step | ❌ ikke eksponert i UI | `steps[i].sources: string[]` finnes for alle ledd |
| Metodikk-lenke | header på /sammenligning | ✅ "Kilder og metode: /metodikk" | statisk lenke, ikke per-Bolk |
| /metodikk side | /metodikk | ✅ men generell — har Ten-Step + Evidence Pack, ingen direkte mapping fra ChartCard til kilde | dedikert side |
| KILDEREGISTER.md | research/bibliotek/ | ❌ ikke i UI i det hele tatt | markdown-fil, kun lest av research-team |

### C.2 Gap-analyse

1. **Ulik granularitet i source-attribution:** HHI-ChartCard har source "Konsentrasjons-data fra konkurransemyndigheter og selskapsrapporter", men det er ikke koblet til en konkret post i KILDEREGISTER. De andre 22 ChartCards har null kildeattribusjon.
2. **Bolk-nivå badge skjuler heterogenitet:** Bolk 3 har `researchStatus="local_research_needs_primary_check"` for hele Bolken, men i realiteten er NO-data 🟢 primær og SE/DK/FI/IS er 🔴. Brukeren ser ikke at NO-tallet er solid mens nabolandet er proxy.
3. **JSON-sources brukes ikke:** Hver step i `value-chain.json` har `sources: [...]` (typisk 2–5 elementer). Disse er strukturerte og kunne mappes direkte mot KILDEREGISTER med en kort kobling, men feltet leses ikke av `getSammenligningData()`.
4. **`data_quality_flag` ignoreres:** SE/DK/FI/IS sjømat, foredling, distribusjon, HoReCa har eksplisitt `data_quality_flag: local_research_needs_primary_check` + `confidence: low` + `method_note: ...`. Ingen av disse vises i UI. Bruker som leser «Sjømat eksport-verdi SE: 14 SEK mrd» får ingen indikasjon på at denne er backfilled fra lokal research, ikke bekreftet.

### C.3 Forbedringsforslag — prioritert

#### C.3.A — Quick wins (1–2 dager, ingen ny data)

**C.3.A.1: Per-land confidence-indikator i `ChartCard`**
- Per i dag har `ChartCard` `value: null | number` for hvert land. Utvid til `{ value: number | null, confidence?: 'high' | 'medium' | 'low' | 'proxy' }`. Vis et lite punkt-ikon over flagget (grønn/gul/oransje/rød).
- Datakilde: derivér `confidence` fra step-nivå `data_quality_flag` i JSON (mapping: `primary_api` → high, `primary_api_definition_diff` → medium, `local_research_needs_primary_check` → low, manglende → null/proxy).

**C.3.A.2: Per-ChartCard `sources` array**
- Utvid `ChartCard`-props med `sources?: Array<{ label: string; href?: string; level: 'primary' | 'secondary' | 'estimate' }>`.
- `InfoPopover` viser hele listen i stedet for én `source`-string.
- Fyll inn i `getSammenligningData()` ved å lese `steps[i].sources` fra JSON og mappe til den aktuelle metrikken.

**C.3.A.3: Sources-popover lenker til KILDEREGISTER**
- KILDEREGISTER skal eksponeres som rute, f.eks. `/metodikk/kilderegister` (eller `/kilder`).
- Hver source-streng i `InfoPopover` lenker til riktig anker i KILDEREGISTER. Eksempel: «NORSUS 2024» → `/metodikk/kilderegister#norsus-2024`.

**C.3.A.4: Eksponer `method_note` for low-confidence felt**
- For verdier hvor `confidence: low`, vis en tooltip på selve søylen som forklarer metoden («Backfilled from local Nordic value-chain notes; primary check pending»).

**Estimert effekt:** Bruker kan klikke seg fra hver søyle på /sammenligning til konkret kilde i KILDEREGISTER. Transparens går fra «Bolk-nivå generelt» til «datapunkt-nivå spesifikt».

#### C.3.B — Strukturell oppgradering (3–5 dager)

**C.3.B.1: Source-ID-skjema i JSON**
- I dag er `sources: ["SSB", "SSB 09171", "trade_volumes_2024.json", "NORSUS", "organic_agriculture_annual.csv"]` — blanding av kortnavn, tabell-id, filsti, organisasjon. Inkonsistent.
- Innfør et `source_id`-skjema: `kr-norsus-2024-matvett`, `kr-ssb-09171`, `kr-eurostat-org_cropar`, `kr-elbersen-2022`. Hvert ID matcher en post i KILDEREGISTER.
- Migrer eksisterende `sources`-arrayer i 5 × `value-chain.json` (≈25 steps × 3 sources = ~75 referanser).

**C.3.B.2: Auto-generert kildeliste per Bolk**
- Bunn av hver Bolk: «Kilder for denne seksjonen» — auto-generert fra alle ChartCard-sources, dedupert.
- Hver kilde vises som chip med fargeindikator (🟢🟡🟠🔴) for kvalitetsnivå.

**C.3.B.3: Snapshot-CSV-eksport per Bolk**
- Hver Bolk får en «Last ned data»-knapp som genererer en CSV med kolonner: `country, metric, value, unit, year, source_id, confidence, method_note`.
- Gir ekstern verifiserbarhet og oppfyller Open Data-prinsipp som NCH-paraplyen krever.

**C.3.B.4: Definisjonsbaseline-banner**
- For Bolk 2 (selvforsyning) og Bolk 4 (svinn): innled med en eksplisitt definisjons-forklaring («DK 300 % kalori-selvforsyning inkluderer eksportoverskudd; NO 41 % korrigerer ikke for sjømateksport»). Statisk per Bolk eller fra et `meta.definitions`-objekt i JSON.

#### C.3.C — Strategiske oppgraderinger (5–10 dager)

**C.3.C.1: Trafikklys-matrise på toppen av siden**
- Komprimert 5 × 5-grid (5 land × 5 Bolker) med 🟢🟡🟠🔴 per celle, vist øverst. Klikk åpner Bolken.

**C.3.C.2: Diff-mot-verifiseringskilde**
- For hvert datapunkt hvor vi har en sekundærkilde: vis primær-verdi + sekundær-verdi side om side. Avvik > 10 % flagges automatisk for review.
- Eksempel: NIBIO 41,3 % vs Jordbruksverket-konsistens-sjekk vs OECD Agricultural Outlook.

**C.3.C.3: `last_verified` per datapunkt**
- JSON har allerede `last_verified: "2026-04-29"` på enkelte steps. Eksponer dette i UI som «Sist verifisert: 2026-04-29 — 18 dager siden».

---

## Del D — Utvidelser: nye relevante datapunkter

### D.1 Wageningen Circular Evaluation Framework — utvidelse av Bolk 4

KILDEREGISTER § 12.4 og `research/rammeverk/sirkulaer-matsystem-rammeverk.md` § 9 dokumenterer 16-indikator-rammeverket. Disse 4 sub-domenene har klare sammenligningsmuligheter:

**Sirkularitets-domenet (4 indikatorer):**
- Kaskadenivå (1–9 skala) — hvilket bruksnivå biomasse-residuer havner på (mat→fôr→energi→deponi)
- Residue-utnyttelsesgrad % (hvor stor andel av biomasse-residuer som finner sekundær anvendelse)
- Næringsstoff-resirkulering N/P/K (datapunkter finnes allerede delvis i `nutrient-flows.json`)
- Kretsløp-lukkethet for matsystem (geografisk skala på sirkulær infrastruktur)

**Sosio-økonomisk domene (4 indikatorer):**
- Lokal verdiskaping fra residue-anvendelse
- Arbeidsplasser i biobasert sektor (NACE 38+41+1042+1042... krever særskilt mapping)
- Eierskapsdistribusjon (kooperativt vs konsern)
- Matsuverenitet-indikator (kobler tilbake til Bolk 2)

**Miljø-domene (4 indikatorer):**
- GHG-reduksjon fra residue-anvendelse vs baseline
- Vannbruk per produserte enhet
- Land-bruk-endring
- Biodiversitets-indikator

**Implementerbarhets-domene (4 indikatorer):**
- TRL (Technology Readiness Level) for hovedanvendelser
- Regulatoriske barrierer (kvalitativ skala)
- Marked/etterspørsel-modenhet
- Politisk støtte (subsidier/insentiver — kobler til Bolk 5)

**Foreslått implementering:**
- Ny under-Bolk «4b: Sirkularitets-evaluator» som viser 4 spider-diagrammer (en per land der data finnes — sannsynligvis NO først, så DK pga symbiosen Kalundborg + 100 %-grønt-gass-målet).
- Sub-bolk lenker til den planlagte `/sirkularitet/evaluator`-flaten (memory: project_nordisk_sirkularitetsrapport_2026_05).

### D.2 Nye datapunkter per Bolk

#### Bolk 1 — Markedsstruktur (utvidelser)
- **Leverandørmakt (CR3 leverandører)** — paritet til retail-CR3. Datakilde: DLF (NO), bransjeorganisasjoner i hvert land.
- **Etableringsbarrierer-indeks** — kvantifisering fra Fretheim/Rodnova NHH-masteroppgave (2020) + Konkurransetilsynet-rapporter. Score 0–10 per land.
- **EU UTP-direktiv-implementering** — status per land for Directive (EU) 2019/633. Datakilde: European Commission rapport, og Reitan-/Coop-/ICA-årsrapporter.
- **EMV-utvikling 5-år** — tidsserie ikke bare snapshot. Datakilde: DLF + Eurostat sbs_na_ind_r2.

#### Bolk 2 — Beredskap (utvidelser)
- **Diversifiserings-indeks for import** — Herfindahl-indeks på opprinnelsesland for hovedvarekategorier. Datakilde: SSB 08799 / Eurostat ext_lt_intertrd / UN Comtrade. Lavt = sårbar mot enkeltland.
- **Energi-sårbarhet i matsystem** — andel fossil energi i gjødsel/transport/lagring. Datakilde: nasjonale energiregnskap + EU EurObservER.
- **Klimarisiko-indeks** — SEI/Nordic Council transboundary climate risks (allerede i KILDEREGISTER).
- **Matsentral/donasjon-volum kg/cap** — sosial beredskap. Datakilde: Matsentralen NO, Stadsmissionen SE, Fødevarebanken DK, Helsingin Ruoka-apu FI.

#### Bolk 3 — Verdikjede (utvidelser)
- **Bondens andel av matkronen** — AgriAnalyse 2025-rapport allerede i KILDEREGISTER. Trinn-fordeling primary → processing → distribution → retail.
- **Margin-fordeling i kjeden** — Konkurransetilsynet verdikjedestudie. NO komplett, andre land delvis.
- **Innovasjons-/FoU-investering** — bransje-FoU som % av omsetning. Datakilde: SSB FoU-statistikk, Vinnova, Innovationsfonden DK, Business Finland.
- **Sertifisering og standardisering** — antall ASC/MSC/økologisk-sertifiserte aktører per land. Datakilde: ASC/MSC global database, Eurostat ORG_AHOLDER.

#### Bolk 4 — Sirkularitet (utvidelser utover Wageningen)
- **Insektprotein/alternative proteiner — antall aktører og kapasitet** — partial data finnes for FI (Solar Foods, Enifer). Utvid til alle land. Datakilde: GFI Europe rapport (allerede i KILDEREGISTER).
- **Marin sirkularitet** — sidestrøm fra fiskeindustri til fôr/farmasi/kosmetikk. Datakilde: Sjømatrådet, Marel (IS), Norsus marint LCA.
- **Kompostering- og biogass-tilgjengelighet** — andel av befolkning som har kommunalt matavfall-system. Datakilde: nasjonale miljømyndigheter + EU env_wasmun.
- **Reparasjon/redistribution** — Too Good To Go, Matsentralen-volum (NO har 2M+ TGTG magic bags, 5735 tonn Matsentralen i JSON). Utvid til alle land.

#### Bolk 5 — Politikk (utvidelser)
- **Subsidie-/støttenivå (% av brutto landbruksinntekt)** — OECD PSE-indikator. NO 59 %, sammenlign med SE/DK/FI/IS.
- **Karbonprising matsystem** — DK CO2-avgift jordbruk 300/750 DKK/tonn allerede dokumentert. Sammenlign med EU ETS-status, ANE NO.
- **Offentlig innkjøp av økologisk/lokal mat** — København 84 %, Sverige Livsmedelsverket-tall, Norge regjeringsmål 50 %. Datakilde: Livsmedelsverket SE, Ekomatcentrum.
- **EU CAP-implementering per land** — for SE/DK/FI/IS som er EU-medlem; NO/IS via EEA. Datakilde: European Commission CAP Strategic Plans.
- **NOU/utredninger — tidsserie** — antall offentlige utredninger om matsystem 2015–2025 per land. Indikator på politisk oppmerksomhet.

### D.3 Strategiske datapunkter på tvers av Bolker

- **«Food TG insights metric»-panel** — fra Food TG Insight Pack v0.1 (memory: project_food_tg_insight_pack_v01). 5–7 nøkkel-KPI som måler nordisk transformasjons-fremdrift, vist som hero-banner på /sammenligning.
- **Nordisk benchmark-score** — sammensatt 0–100-score per land basert på vektede Bolk-metrikker. Krever metodologisk beslutning om vekter (legg til debattposisjon i /metodikk).
- **Time-series for alle metrikker** — siden /sammenligning per i dag viser snapshot (2024). Utvid til 2015→2024 tidsserie der data finnes. Datakilde: alle stat-byråer har historiske serier; krever import-pipeline-arbeid.

---

## Del E — Anbefalt utførelses-rekkefølge

Antar at gap-matrisen sin Quick Wins A1–A6 utføres parallelt (egen sak).

### Sprint 1 — Transparens (1 uke)
1. C.3.A.1 — Per-land confidence-indikator i ChartCard (mappe fra `data_quality_flag`).
2. C.3.A.2 — Per-ChartCard `sources`-array, eksponer i InfoPopover.
3. C.3.A.4 — Vis `method_note` for low-confidence felt.
4. **Leveranse:** Hver bruker som besøker /sammenligning ser nå hvilken kilde hvert datapunkt har og hvor sikkert det er.

### Sprint 2 — Strukturell kilde-mapping (1 uke)
5. C.3.B.1 — Innfør `source_id`-skjema, migrer 5 × `value-chain.json`.
6. C.3.A.3 — Bygg `/metodikk/kilderegister`-rute, lenk source_id fra ChartCard.
7. C.3.B.2 — Auto-generert kildeliste per Bolk.
8. **Leveranse:** Fra ChartCard kan bruker klikke direkte til primærkilden i KILDEREGISTER.

### Sprint 3 — Verifisering og diff (1–2 uker)
9. Implementer 2–3 verifiseringskilder per Bolk (B-tabellene over) — start med Eurostat NACE + Eurostat env_wasfw fordi de er API-tilgjengelige.
10. C.3.C.2 — Diff-mot-verifiseringskilde for utvalgte metrikker.
11. C.3.B.3 — CSV-eksport per Bolk.

### Sprint 4 — Wageningen-evaluator (1–2 uker)
12. Lag JSON-skjema for 16 indikatorer × 5 land i `public/data/food-systems/<land>/circular-evaluator.json`.
13. Fyll NO først (mest data), så DK, så SE/FI/IS.
14. Bygg sub-Bolk 4b med spider-diagrammer.

### Sprint 5 — Datapunkt-utvidelser (utvidet — løpende)
15. D.2-listen tas som tickets per Bolk over 4–8 uker, prioritert etter Food TG-mandat.

---

## Del F — Avhengigheter og åpne spørsmål

1. **Postgres FTS er live** (memory: project_postgres_fts_2026_05_11) — kan brukes til å bygge søkbar KILDEREGISTER-database.
2. **Postgres MCP-plan** (memory: project_postgres_mcp_plan) — vil gjøre source-attribution kjørbar via MCP.
3. **SSB MCP-server todo** (memory: project_ssb_mcp_todo) — når implementert vil gi automatisert oppdatering fra SSB.
4. **Country-normalisering 2026-05-11** — uppercase ISO-koder i DB, lowercase i frontend. Source-mapping bør følge samme konvensjon.

### Åpne spørsmål (svar i parentes der jeg har gjettet)
1. Hvilket nivå skal kildeføring ligge på i UI? *(Anbefaling: per ChartCard som standard, med utvidet panel på «Vis full kilde»)*
2. Skal CSV-eksport være offentlig eller bare for innloggede? *(Anbefaling: offentlig — det er en bærebjelke i Open Data og NCH-paraplyen)*
3. Skal verifiseringsdiff vises by default eller bak en toggle? *(Anbefaling: bak en toggle «Vis triangulering» — ellers blir UI overlastet)*
4. Hvor langt nedover NCH-prioriteringen skal D.2-listen drives? *(Avhenger av Food TG mandat 2026-05-07 — bør avstemmes med JT)*

---

## Vedlegg — Implementasjons-skisser

### Forslag til utvidet `ChartCardSource` type

```ts
type SourceLevel = 'primary' | 'secondary' | 'estimate' | 'proxy'
type Confidence = 'high' | 'medium' | 'low'

type ChartCardSource = {
  source_id: string             // "kr-ssb-09171"
  label: string                 // "SSB Tabell 09171"
  url?: string                  // direkte til SSB statbank
  level: SourceLevel
  year?: number
  last_verified?: string        // ISO date
  method_note?: string
}

type ChartCardCountryRow = {
  country: string
  flag: string
  code: CountryCode
  value: number | null
  population?: number
  confidence?: Confidence
  sources?: ChartCardSource[]   // overstyrer ChartCard-level sources
}

type ChartCardProps = {
  title: string
  description?: string
  unit?: string
  rows: ChartCardCountryRow[]
  year?: number
  sources?: ChartCardSource[]    // default sources for hele chartet
  perCapitaEnabled?: boolean
  perCapitaUnit?: string
}
```

### Forslag til source-katalog i JSON

```json
// public/data/food-systems/_sources.json
{
  "kr-ssb-09171": {
    "label": "SSB Tabell 09171 (Sysselsetting og verdi i jordbruket)",
    "url": "https://www.ssb.no/statbank/table/09171",
    "level": "primary",
    "country_scope": ["no"],
    "topics": ["sysselsetting", "verdiskaping", "primaerproduksjon"]
  },
  "kr-eurostat-sbs_na_ind_r2": {
    "label": "Eurostat sbs_na_ind_r2 (Strukturelle bedriftsstatistikker NACE)",
    "url": "https://ec.europa.eu/eurostat/databrowser/view/sbs_na_ind_r2",
    "level": "primary",
    "country_scope": ["se", "dk", "fi"],
    "topics": ["sysselsetting", "omsetning", "verdiskaping"]
  },
  "kr-norsus-2024": {
    "label": "NORSUS Matvett-rapport 2024",
    "url": "...",
    "level": "primary",
    "country_scope": ["no"],
    "topics": ["matsvinn", "lca", "co2e"]
  },
  "kr-elbersen-2022": {
    "label": "Elbersen et al. 2022 — Wageningen Circular Evaluation Framework",
    "url": "https://doi.org/10.18174/563389",
    "level": "primary",
    "country_scope": ["nordic"],
    "topics": ["sirkularitet", "rammeverk", "kaskade"]
  }
}
```

---

## Konklusjon

`/sammenligning` har solid datagrunnlag for markedsstruktur, politikk og store deler av sirkularitet — men transparensen i UI fanger ikke opp variasjonen i kildekvalitet på tvers av land og metrikker. **Det største tiltaket er ikke å hente mer data, men å eksponere det vi allerede har.**

Konkret: hver `ChartCard` bør lenke fra datapunkt til primærkilde i KILDEREGISTER, og hver verdi bør vise confidence-nivå basert på `data_quality_flag` som allerede ligger i JSON-en. Når dette er på plass kan vi legge til verifiseringskilder (Eurostat NACE er den enkleste) og Wageningen-evaluator som utvider Bolk 4 med 16 nye sammenligningspunkter.

Anbefalt rekkefølge: **Sprint 1 (transparens) før Sprint 2 (struktur) før Sprint 3 (verifisering)** — verdiøkning fra hver sprint er synlig for brukeren i seg selv, og hver oppgradering åpner for neste.
