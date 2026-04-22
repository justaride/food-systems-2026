# Plan: Innlesing av Media Mapping + Scandinavia Circular Food Research

**Branch:** `data/circular-food-research-2026-04-23`
**Kilder:** `~/Downloads/Media mapping articles list.docx` (36 medieoppslag) + `~/Downloads/Scandinavia Circular Food Research.docx` (~18 akademiske arbeider).
**Mål:** Speile innhold fra begge dokumenter i databasen og oppdatere sirkularitet-UI med nordisk benchmark.

## Kontekst

- `theses.ts` (src/lib/data) → seedes til Prisma `Thesis`, konsumeres av `/masteroppgaver`. Type: master | phd.
- `sources.ts` → seedes til `SourceDoc`. Passer for journal-artikler, policy-rapporter og mediekilder.
- `actors.ts` → seedes til `Actor`. Nye sirkulær-aktører legges her + mappes i `circularity-actor-map.ts`.
- CSV-backlog-mønster: `research/evidence-pack/download-backlog-<tema>-<dato>.csv`. 6 CSVer allerede konsumert av /kilder.
- `/sirkularitet` har `RLadderMatrix` og `NutrientFlowsView` i dag — ingen land-benchmark-kort.

## Oppgaver

### Task 1 — Master- og PhD-avhandlinger (7 nye)
Legg til i `src/lib/data/theses.ts`:
1. Ruvini De Silva — *Circular value creation in Swedish seafood processing* (Gothenburg 2023, master)
2. *House crickets in circular food systems* (SLU 2025, PhD)
3. Erik Bojö — *Circular food systems: content and discourse analysis* (KTH 2023, master)
4. Avesta Mirza — *Circular economy in the food and retail industry (ICA case)* (Uppsala 2016, master)
5. Van Straten — *Circular business models in Finnish food companies* (Södertörn 2025, master)
6. Vicente Bueso Bordils — *Circular economy mapping on Bornholm island* (AAU 2021, master)
7. *Barriers and drivers for circular vegetable value chains* (NMBU 2022, master)

Tags skal inkludere `sirkulaer` + kontekstuelle (f.eks. `verdikjede`, `matsvinn`, `protein`, `nordisk`).

### Task 2 — Journal-artikler og policy-rapporter (≈11 nye)
Legg til i `src/lib/data/sources.ts` (SourceDoc-type):
1. Managing a Circular Food System — Turku Campus (MDPI Sustainability 2021)
2. Nested circularity in food systems — Finnish case (Resources, Conservation & Recycling 2023)
3. System dynamics modeling of food loss — Norwegian seafood (J Cleaner Production 2025)
4. Circular economy for aquatic food systems — Phosphorus flow Norway (Frontiers 2023)
5. Delivering the Circular Economy: Denmark (Ellen MacArthur 2015)
6. Food waste prevention in Denmark (Danish EPA 2017)
7. Eriksson m.fl. — Food chain sustainability in Sweden (SLU-rapport 2016)
8. Low-carbon circular transition in the Nordics (Nordic Council working paper 2022)
9. Effective waste prevention needs policies (Nordic Council 2025)
10. Seafood in the circular economy (Iceland Ocean Cluster 2022)
11. Norway's Action plan for a circular economy 2024–2025

### Task 3 — Nye aktører (13 nye)
Legg til i `src/lib/data/actors.ts`:
- **NO:** Norsøk, Nutricycle (Columbi Farms)
- **SE:** RISE, IVL Swedish Environmental Research, KTH PLENTY Centre, KTH PLATE Centre, Luleå tekniska universitet (LTU)
- **DK:** Onnest, Jalm&B, Circular Food Technology, Peter Larsen Coffee, PhosphorCare, Reduced
- **Nordic:** Nordic Circular Hotspot

Oppdater `circularity-actor-map.ts` tilsvarende. Legg til relasjoner der relevant (Nutricycle ↔ SINTEF/NIBIO, KTH PLENTY ↔ SLU/RISE, Norsøk ↔ CIRCULANDIA).

### Task 4 — Media-backlog CSV
Opprett `research/evidence-pack/download-backlog-circular-food-media-2026-04-23.csv` med 36 medieoppslag fra Media Mapping. Samme skjema som øvrige backlog-CSVer (priority, status, country, theme, doc_type, institution, title, year, url, …). Legg til lasting i /kilder hvis pipeline krever eksplisitt referanse.

### Task 5 — Circularity Gap benchmark-kort på /sirkularitet
Legg til nordisk sirkularitetsrate som benchmark-kort øverst på siden:
- NO: 2.4 % (Circularity Gap Norway 2024)
- SE: 3.4 % (Circularity Gap Sweden 2024)
- Nordic gjennomsnitt: 6 % (Nordic Circular Hotspot "Beyond the Bean" 2023)
- DK/FI/IS: kilde ikke identifisert i Media Mapping — vis som "n/a"

Datakilde: utvide `src/lib/data/country-chart-data.ts` eller legge inn som statisk konstant i `SirkularitetContent.tsx`. Bruk eksisterende `Card`-komponent. Kilder markeres med små fotnoter/hover som peker på sources.ts-IDene lagt inn i Task 2.

## Akseptansekriterier (hele planen)

- `npm run build` passerer (inkluderer Prisma generate + chart metrics).
- `npm run lint` passerer.
- `/masteroppgaver` viser 7 nye oppføringer med `theme=sirkulaer` filter.
- `/aktorer` viser 13 nye aktører.
- `/kilder` viser 11 nye SourceDoc-oppføringer + 36 backlog-oppføringer.
- `/sirkularitet` viser nordisk benchmark-kort.

## Out of scope

- Ingen nye prisma-migrasjoner — alt passer innenfor eksisterende skjema.
- Ingen nye sider — alt bruker eksisterende informasjonsarkitektur.
- Ingen PDF-nedlasting — bare registrering av URL-er i backlog-CSV.
