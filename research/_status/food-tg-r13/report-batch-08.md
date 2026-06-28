---
tittel: Food TG R13 — Batchrapport 08
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 08
prompter: R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 08 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002 |
| park | 0 | — |
| aktørspørsmål | 0 | — |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-AKTOR-008 | Lokalmat-distribusjon og REKO-alternativer | enrich | source-shortlist | A (totalmarkedstall, Stiftelsen Norsk Mat, Bondens marked, Godt Lokalt/DLVRY) + B (REKO-tall, digitale plattformer) + C (gårdsutsalg-dekomponering) | Reiler Consulting / Stiftelsen Norsk Mat, Lokalmatrapport 2025, regjeringen.no, 2025-12-02 | Ingen offentlig kilde bryter ned de 938 mill. kr direktesalg per kanal | vent |
| R13-PROT-008 | Norsk dyrking av bønner, erter og åkerbønne | enrich | source-shortlist | B dominerende (arealtall fra NIBIO/doktorgradsarbeid, foredlingskjede fra aktørsider); A for Landbruksdirektoratet-rapport | NIBIO nyhetsartikkel (Lundby, 2025) | Volumtall (tonn) per vekst per år mangler som offentlig SSB-serie; mat/fôr-split ikke kvantifisert | vent |
| R13-INNO-001 | CEA og vertikalt landbruk i Norge | enrich | source-shortlist | A (Onna Greens og Columbi Farms regnskap via Brønnøysund) + B (Himmelgrønt, Avisomo, The Farm Society — pressemeldinger/aktørrapportert) + C (Infarm og Nordic Harvest norsk tilstedeværelse) | Innovasjon Norge kundehistorie om Avisomo, sep. 2025 | Ingen aktør oppgir realisert produksjonsvolum; Himmelgrønt regnskap ikke funnet | vent |
| R13-INNO-002 | Agritech/foodtech-økosystem Norge | enrich | source-shortlist | A (NCE Heidner, Nordic Edge, NIC/Innovasjon Norge primærnettsteder) + B (alle kapital/fundingtall — actor-reported eller bransjemedier) | NCE Heidner Biocluster, Om klyngen, 2026 | Aggregert norsk agritech VC-kapital per år mangler offentlig kilde; nasjonal strategi ikke fremlagt | vent |

## Per-target outcome

### R13-AKTOR-008 — Lokalmat-distribusjon og REKO-alternativer

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **Markedsankeret:** Total direktesalgsomsetning for norsk lokalmat var **938 mill. kr i 2025** (+8 % fra 725 mill. kr 2023/2024), ifølge Reiler Consulting/Stiftelsen Norsk Mat (Lokalmatrapport 2025, regjeringen.no, des. 2025). Ingen offentlig kilde bryter ned dette beløpet per kanal — kanaldekomponering er C-celle.
- **Stiftelsen Norsk Mat / Lokalmat.no:** B2B-informasjonsportal, ikke en handels- eller distribusjonskanal. 650+ produsenter, 3 100+ produkter i katalog. Stiftelsen Norsk Mat er ny navn for Matmerk (omdøpt 2025).
- **Bondens marked Norge:** Fysiske direktesalgsmarkeder; ~20 aktive lokasjoner; 388 markedsdager og 27 MNOK omsetning i Oslo-markedet i 2023/2024. 2 faste ansatte nasjonalt. Sesongbasert.
- **REKO-ringer:** Kryssreferanse til R13-AKTOR-003. 2022-ankertall (>140 ringer, >500 000 kunder, >600 produsenter) er siste verifiserte. REKO Norge stiftet jan. 2025.
- **Godt Lokalt / Spesialgrossistene (DLVRY):** Kommersiell spesialgrossist med 350+ produsenter og >1 mrd. kr omsetning 2025 — sterkest A-klasse dokumentert aktør i kommersiell lag. Leverer til HoReCa og spesialbutikker.
- **Gudbrandsdalsmat SA:** Regionalt food hub/kooperativ; 25+ produsenter; én ordre/én levering via Tine-logistikk; sitert som modell i regjeringens lokalmatstrategi.
- **Digitale plattformer:** Dyrket.no (~100 prod., Oslo-region), Tastebuds (Bergen, 50+ prod., NOK 500 000 DOGA-støtte 2024), LocalFood.no, Rekono — alle aktive men uten offentliggjorte omsetningstall.
- **Hanen:** Organisasjon for Inn på tunet og gårdsbasert reiseliv; drifter ikke distribusjonskanal.

**Ikke si:** Lokalmat.no er en handelsplattform; Matmerk/Stiftelsen Norsk Mat driver distribusjonskanaler; REKO har over 200 ringer uten kildedatering; kanaldekomponering av 938 mill. kr er mulig fra åpne kilder; Godt Lokalt er en kortreist direktesalgskanal i REKO-forstand.

---

### R13-PROT-008 — Norsk dyrking av bønner, erter og åkerbønne

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **Arealtall (B-klasse, NIBIO/doktorgradsarbeid):** Samlet norsk åkerbønne- og erteareal ~86 000 daa i 2024. Åkerbønne (~48 000 daa) har vokst fra ~2 000 daa (2013) til ~48 000 daa (2024). Ert (~38 000 daa) har hatt mer moderat vekst. Hagebønne og lupiner dyrkes ikke i kommersiell norsk skala (klimabegrensning).
- **Bruk: nesten all produksjon går til kraftfôr, ikke mat.** Åkerbønne til kraftfôr (Felleskjøpet er primærkjøper). Matindustriens bruk av norske belgvekster er marginal per 2024.
- **Volumtall (tonn) er C-celle:** SSB publiserer ikke en separat årsvolum-serie for belgvekster tilsvarende korn. Avlingsnivå for åkerbønne (~240–350 kg/daa) og ert (~250–380 kg/daa) er tilgjengelig fra NLR og dyrkingsveiledninger, men ikke kombinert med arealtall i offisiell statistikk.
- **Landbruksdirektoratets rapport 3-16/2026 (feb. 2026):** "Åkerbønner, erter og oljefrø — Muligheter og barrierer for økt norsk produksjon". Primærdokument identifisert, PDF ikke fullt lest. Innledning bekrefter utredningsmandat — ingen vedtatt tilskuddsordning per juni 2026.
- **Foredlingskjede:** Nofima har estimert potensial (50 000 t humanprotein fra belgvekster per år som realistisk mål), men dette er potensialtall, ikke prognoser.
- **FoU-prosjekter:** FABANOVA (klimatilpassede åkerbønner for Norden, NIBIO/NordGen), FutureProteinCrops (NMBU) — alle pre-kommersielle.

**Ikke si:** norsk belgvekstproduksjon bidrar vesentlig til humanprotein i dag; 48 000 daa åkerbønne tilsvarer X tonn uten avlingsnivå; Nofimas potensialtall er prognoser; Landbruksdirektoratets utredning innebærer vedtak om tilskudd.

---

### R13-INNO-001 — CEA og vertikalt landbruk i Norge

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **Onna Greens AS** (917 653 135, Moss): Regnskap 2024 via Proff/Brønnøysund: NOK 17,5 mill. omsetning (A-klasse), NOK -9,6 mill. driftsresultat — betydelig kapitalforbrenning. 50 ansatte. Kapitalforhøyelse juni 2026. Kommersiell produksjon dokumentert, men ikke produksjonsvolum.
- **Himmelgrønt AS** (Coop/Avisomo JV, Gardermoen): Planmål 100 tonn/år salat. Produkter i Coop-butikker per 2026 bekreftet via NTB pressemelding. Org.nr. ikke funnet i Brreg — kan driftes under Avisomo eller Coop-enhet. Regnskap og faktisk produksjonsvolum ukjent (C).
- **Avisomo AS** (920 937 659): dagl. leder Martin Molenaar, 17 ansatte. Innovasjon Norge-støttet (sep. 2025). Regnskap 2023–2024 ikke synlig i Proff. Produksjonslokasjon og vekster ikke bekreftet i åpne kilder.
- **Columbi Farms AS:** Regnskap 2023: NOK 2,1 mill. omsetning, -1,8 mill. driftsresultat. Pre-kommersiell skala.
- **Harabakken / 4.farm:** Prosjekt ved Harabakken gård; "høyteknologisk vertikalt landbruk" oppgitt på nettsted. Pre-kommersiell.
- **The Farm Society:** Nettverk for norsk vertikalt landbruk — eksistens bekreftet via nettside, men aktivitetsnivå og medlemmer ikke dokumentert.
- **Infarm (DE) og Nordic Harvest (DK):** Infarm gikk konkurs 2023. Nordic Harvest: ingen norsk tilstedeværelse funnet (C).
- **Gjennomgående: ingen norsk CEA-aktør oppgir realisert produksjonsvolum (kg/år) i åpne kilder.** Ambisjon ≠ realisert produksjon for alle aktører.

**Ikke si:** Himmelgrønt produserer 100 tonn salat per år; Onna Greens er Norges ledende vertikale farm; Infarm hadde norsk operasjon; CEA er lønnsomt i Norge; Avisomo produserer salat (ikke bekreftet).

---

### R13-INNO-002 — Agritech/foodtech-økosystem Norge

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **NCE Heidner Biocluster** (Hamar, Innlandet): Norges primære agritech/bioøkonomi-klynge. NCE-status siden 2018. 50+ medlemmer, NOK 66 mrd. samlet omsetning i membersmassen (A-klasse, heidner.no/om-klyngen). Merk: 66 mrd. er membersmassens omsetning — ikke klyngeorganisasjonens.
- **Nordic Edge Agritech Innovation Cluster** (Stavanger/Rogaland): Drev kampanjen som resulterte i enstemmig Stortingsvedtak 22. mai 2025 om at nasjonal agritech-strategi skal utarbeides. Strategi ikke fremlagt per juni 2026.
- **AgriFoodTech Norway:** Overordnet koordineringsplattform siden 2023 (NCE Heidner + Nordic Edge + SIVA + Innovasjon Norge). Søkt om NOK 100 mill./år insentivordning og NOK 20 mill./år programfinansiering — dette er political asks, ikke bevilgede midler.
- **T:lab** (Steinkjer): Agritech-inkubator i Trøndelag. NOK 1,3 mrd. hentet kumulativt av porteføljeselskaper siden 2017 (B-klasse, aktørrapportert).
- **Aggrator Inkubator Ås** (NMBU-campus): Porteføljeselskaper hentet NOK 135 mill. i 2024 (B-klasse).
- **Startups med dokumentert funding (2022–2026, alle B-klasse):**
  - Nofence (virtuelt gjerde): €30M Series B, sep. 2025
  - Saga Robotics (gårdsroboter): €9,5M, 2025; USD 43,8M totalt
  - N2 Applied (plasmakvelstoff): €10M, jan. 2023
  - Kilter (ugrasroboter): €6,5M, feb. 2026, Kubota-ledet
  - DigiFarm (digital landbruksplattform): NOK 60M EU EIC 2021, €1,5M kontrakter 2023
- **Innovasjon Norge / NIC:** Klyngeprogram administrert via Norsk Klyngeprogram; Heidner og Nordic Edge er NIC-partnere.
- **Aggregert norsk agritech VC-kapital per år:** mangler én offentlig kilde — dette er den primære C-cellen.

**Ikke si:** AgriFoodTech Norway er finansiert med 100 MNOK; NCE Heidner Bioclusters 66 mrd. er klyngeorganisasjonens omsetning; T:labs 1,3 mrd. er ett års fundraising; norsk agritech-markedet er verdt USD 700M; nasjonal agritech-strategi er vedtatt eller finansiert.

---

## Oppfølgingspunkter

- **AKTOR-008**: Kontakt Stiftelsen Norsk Mat / Reiler Consulting for kanaldekomponering av direktesalg. Sjekk Bondens markeds egne statistikker for per-marked-omsetning 2024. Dyrket.no og Tastebuds kan gi omsetningstal ved henvendelse.
- **PROT-008**: Hent SSB tabell 07495 direkte for belgvekster (åkerbønne + ert areal per år 2018–2024). Les Landbruksdirektoratets rapport 3-16/2026 (full PDF). Beregn estimert volum fra areal × gjennomsnittlig avlingsnivå (NLR-data tilgjengelig).
- **INNO-001**: Søk Brreg for Himmelgrønt AS. Sjekk Coop-årsrapport 2025 for Himmelgrønt-omtale og evt. volumtall. Onna Greens: be om produksjonsvolum-data (aktørspørsmål).
- **INNO-002**: Stortingsinnsyn for nasjonal agritech-strategi (bestilt mai 2025 — status?). Hent fullstendig NIC-klyngedatabase for alle mat/agri-relevante klynger. Dealroom NO for agritech VC-aggregering.
- Ingen av batch-08-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
