---
tittel: Food TG R13 — Batchrapport 12
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 12
prompter: R13-LAND-001, R13-LAND-002, R13-LAND-003, R13-LAND-004
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 12 — Food TG R13

## Oppsummering

Hele-landskapet-batchen. LAND-001 og LAND-002 er de tyngste primærkildefestede strukturanalysene i hele R13. LAND-003 og LAND-004 er interne arbeidskart.

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | alle fire |
| importer (PCQ) | 2 | R13-LAND-001, R13-LAND-002 |
| vent (forstaelse/internal) | 2 | R13-LAND-003, R13-LAND-004 |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-LAND-001 | Makt- og eierkonsentrasjon | enrich | PCQ | A (KT, Coop årsrapp., Nortura, NOEK, Felleskjøpet); B (Menon, Oslo Econ.); C (grossist%, fiskefôr 2024) | KT Dagligvarerapport 2024 (apr. 2025) | Grossistprosentar ikke offentlig; fiskefôr 2024 C; Tine 2024 ikke isolert | **importer** |
| R13-LAND-002 | Vertikal integrasjon og kontroll | enrich | PCQ | A (årsrapporter NG/Coop/Reitan/Nortura/Tine/Mowi/FK, BAMA); B (NCR, SNL); C (Fjordland eierandel, REMA Distr., Pronofa) | BAMA årsrapport 2023 + Nortura/Tine/Mowi årsrapporter 2024 | Fjordland eierandel motstridende; Nova Sea 95 %-kjøp ikke endelig bekreftet | **importer** |
| R13-LAND-003 | Helsystem-kart og aktørtypologi | enrich | forstaelse | syntetisk — behold gate per node | R13-syntese batch 01–11 | WASTE/regenerativ/LAND-001/002 ikke integrert i kartet | vent |
| R13-LAND-004 | Datagap-atlas | enrich | internal | intern syntese | R13 batch 01–11 C-gap-ekstraksjon + R13-GAP-006 | R4/R5/R6-gap ikke systematisk dekket | vent |

## Per-target outcome

### R13-LAND-001 — Makt- og eierkonsentrasjon

**Beslutning:** enrich → PCQ (**importer**)

**Nøkkelfunn:**

**Dagligvare (detaljhandel):**
- NorgesGruppen: 43,5 % (KT Dagligvarerapport 2024, A)
- Coop: 29,2 % (KT) / 29,3 % (Coop årsrapport 2024, A — marginalt avvik)
- REMA 1000: 23,9 % (KT, A)
- Bunnpris: 3,3 % (KT, A)
- Fire kjeder = ~100 % av norsk dagligvareomsetning

**Grossist:**
- ASKO (NorgesGruppen), Coop Logistikk, REMA Distribusjon = tre vertikalt integrerte aktører
- Prosentandeler ikke offentlig (Menon 177/2024: dominans bekreftet, prosenter utelatt av konkurransehensyn). C-gap.

**Foredling (terrestrisk):**
- Nortura SA: markedsregulator kjøtt/egg. Slaktevolum 2024 gir Nortura ca. 65–70 % av rødkjøtt (A, NOEK). Prior ca. 42 % av kylling (ned, A, Nortura T1-2024).
- Tine SA: ca. 72,9 % av anvendt melk 2023 (Landbruksdirektoratets siste rapport, A). 2024-tall ikke isolert.
- Begge er samvirker med lovfestet markedsregulatorfunksjon (Landbrukssamvirkeloven).

**Fôr (akvakultur):**
- Skretting (Nutreco/SHV Holdings), Cargill Aqua Nutrition, BioMar (EW Group) = globalt oligopol
- Norske offentlige markedsandeler 2024: ikke funnet. Siste bransjetall (2012–2013): Skretting ca. 37 %, Cargill ca. 33 %, BioMar ca. 26 % — sterkt utdatert. C-gap.

**Fôr (terrestrisk):**
- Felleskjøpet Agri SA: 21,2 mrd NOK omsetning (A). Markedsandel i kraftfôr: ikke offentlig. C-gap.

**KT V2024-4-vedtak:** 4,9 mrd. NOK gebyr til Coop, NorgesGruppen og REMA for prisinformasjonsutveksling 2004–2011 (A). Dette er atferdshendelse, ikke strukturkonsentrasjon.

**Ikke si:** NorgesGruppen har monopol; ASKO kontrollerer grossistmarkedet; Nortura/Tine er unntatt fra konkurranseloven; konsentrasjon skyldes koordinering; Tine har over 80 % meierianddel; Skretting/Cargill/BioMar-andeler uten 2024-kilde.

---

### R13-LAND-002 — Vertikal integrasjon og kontroll

**Beslutning:** enrich → PCQ (**importer**)

**Nøkkelfunn (28 integrasjonskoblinger dokumentert fra årsrapporter):**

**NorgesGruppen:** ASKO (100 %, grossist), UNIL AS (100 %, EMV-produksjon), BAMA Gruppen AS (46 %, frukt/grønt grossist — BAMA-årsrapport 2023, A). Rema Industrier: 20 % i BAMA. Ingen funn av eierinteresser i primærproduksjon/gårdsbruk.

**Coop:** Coop Norge Industri (100 %) inkl. Røra Fabrikker, Goman, Totenpoteter, Ferskvarehuset. Coop Norge Logistikk (100 %). To-lag samvirkestruktur.

**Reitan/REMA:** Norsk Kylling AS (100 % siden 2012) — integrert rugeri, slakteri, foredling, 133 kontraktsbønder Midt-Norge. Stange Gård AS (95 %, svineproduksjon). Spekeloftet (50 %), Kjeldsberg (50 %).

**Nortura:** Kooperativ (15 500 bønder). Norilia AS (100 %, biprodukter), Hå Rugeri (51 %), Fjordkjøkken (56,5 %), Noridane Foods (65 %).

**Tine:** Diplom-Is (100 %), Fjordland AS (Tine hevder heleid — motstridende med Nortura-Wikipedia 38,86 % — PCQ-flagget). Wernersson Ost, Norseland, MIMIRO.

**Mowi:** Fullt integrert: rogn → settefisk → sjøfase → slakteri → foredling → markedsføring. Nova Sea oppkjøpt til 95 % (annonsert jan. 2025 — ikke endelig bekreftet per 31.12.2024). Cermaq: 100 % Mitsubishi Corporation (Japan) siden 2014.

**Felleskjøpet Agri:** Kornmottak/markedsregulator, kraftfôrfabrikker, Norgesmøllene 100 % (fra apr. 2025). Ca. 100 butikker + Granngården (Sverige).

**Seks PCQ-tomme celler:** Fjordland eierlag, Banan II AS bakerste eierlag, REMA Distribusjon Brreg-verifisering, Pronofa (fiskefôr), Nova Sea endelig eierandel, Kaffebrenneriet/Reitan.

**Ikke si:** NorgesGruppen kontrollerer BAMA; Nortura-bønder er ansatt av Nortura; Cermaq er norsk; Mowi er selvforsynt med fôr globalt; Nova Sea er heleid per 31.12.2024.

---

### R13-LAND-003 — Helsystem-kart og aktørtypologi

**Beslutning:** enrich → forstaelse (vent)

**10-node systemkart syntetisert fra R13 batch 01–11:**

1. Dominerende aktører — konsentrasjon dokumentert; NorgesGruppen/Tine/Nortura/Felleskjøpet
2. Kooperativstruktur — samvirkedualitet (markedsregulator + bonde)
3. Primærprodusenter — svake data for småskala (aktørgate)
4. Distribusjon/logistikk — ASKO dominerer; REKO/DLVRY i alternativkanalen
5. Alternativt protein — pilot vs. realisert, 5/9 konkurs
6. Food waste-strømmer — source-shortlist med tomme celler per kanal
7. Innovasjonsaktører — 5/9 konkurs, kapitalintensitet
8. Regulatorisk/policy — Riksrevisjonen: klimamål ikke i rute
9. Forskningsmiljøer — MatMakt (Ruralis) høyest relevans
10. Bevegelsesaktører — REKO, andelslandbruk, frønettverk

**Blinde flekker:** WASTE-noder, regenerativ/agroøkologisk, LAND-001/002 (lest etter kartet ble skrevet).

---

### R13-LAND-004 — Datagap-atlas

**Beslutning:** enrich → internal (vent)

**10 domener, 60+ C-hull. Fire tyngste strukturelle gap:**

1. **SOC-baseline (jordkarbon):** JordVAAK startet 2026 — ingen data før ~2036. UNFCCC-tall er Tier 1/2-modellert. Alle jordk arbon-påstander er dermed estimater, ikke målte.
2. **Oppdrettsslam massebalanse:** Tre-kolonners balanse (modellert/innsamlet/behandlet) ikke koblet i åpen kilde. Åpne merder samler ~0 under normaldrift.
3. **Aksjonærregister altprotein/CEA:** Lukket for alle 8 kartlagte selskaper. Eierstruktur kan ikke hentes via offentlig Brreg.
4. **Protein-gram-serie:** Norsk selvforsyning beregnes på energibasis (kJ/kcal), ikke protein-gram. Ingen offisiell gram-serie publisert av SSB/NIBIO.

**Andre prioriterte gap:** digestat NPK-retur (NO = C), grossistmarkedsandeler, insektbiomasse i åker, pollinatortrend, markedsandeler fiskefôr 2024, matsvinn primærjordbruk, per-kanal-direktesalg i lokalmat.

---

## Oppfølgingspunkter

- **LAND-001**: Hent Landbruksdirektoratets meierirapport 2024 for Tine-andel. Kontakt Sjømatbransjeforeningen for fiskefôrmarkedsandeler 2023/2024. Les KT grossistrapport (oppfølging av Menon 177/2024) om den er publisert.
- **LAND-002**: PCQ per tom celle (Fjordland, Banan II, REMA Distribusjon, Pronofa, Nova Sea, Kaffebrenneriet). Nortura-årsmelding 2024 bekrefter Fjordland-eierandel — les side med eierskap direkte.
- **LAND-003**: Oppdater helsystemkartet etter at LAND-001/002 er importert. Legg inn WASTE-nodedata fra batch 01–03. Legg inn OKO-noder fra batch 10–11.
- **LAND-004**: Utfyll R4/R5/R6-gap ved å lese tidligere rundes intake-indekser. Identifiser gap som er blitt fylt vs. persisterer fra R4 til R13.
- **Batch 12 markerer avslutning av strukturanalysene** — LAND-001/002 er de tyngste primærkildefestede strukturdokumentene i R13.
- Ingen av batch-12-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
