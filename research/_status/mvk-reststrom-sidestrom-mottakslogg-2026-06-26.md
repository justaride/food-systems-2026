# Mottakslogg: matsvinn-sirkulaer / reststrom-sidestrom 2026-06-26

## Scope

- Celle: `matsvinn-sirkulaer / reststrom-sidestrom`.
- Kandidatfil: `research/_status/mvk-reststrom-sidestrom-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-reststrom-sidestrom-relasjoner-2026-06-26.json`.
- Guardrails: lokal DB-only, ingen schema-endring, ingen prod-import.

## Gather

- Kandidater: 22 aktorer med lokator.
- Kildetyper: egen-/primarkilder for Norilia, Bioco, Biosirk Norge, Fatland Ull Hud & Skinn, Nortura, Animalia, Pelagia, Karmsund Protein, Nutrimar, Biomega Norway, Hofseth BioCare, Marealis, Seagarden, ScanBio, TripleNine Vedde, Orkla Health Ocean, Nofima, SINTEF Ocean og TINE; offentlige/sekundaere kilder brukt for NutriShell/Hitramat og Ydra.
- Brreg-validert 2026-06-26: 22 aktive org.nr. i kandidatfilen.

## Importresultat

- Lokal import: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reststrom-sidestrom-2026-06-26`.
- Nye noder: 16 (`bioco-as`, `biosirk-norge-as`, `fatland-ull-hud-skinn-as`, `animalia-as`, `karmsund-protein-as`, `nutrimar-as`, `hofseth-biocare-asa`, `marealis-as`, `seagarden-as`, `scanbio-marine-group-as`, `triplenine-vedde-as`, `orkla-health-ocean-as`, `nutrishell-as`, `hitramat-as`, `ydra-as`, `tine-sa`).
- Eksisterende beriket/lenket: 6 (`norilia-as`, `nortura-sa` -> eksisterende `actor-nortura`, `pelagia-as`, `biomega-norway`, `nofima`, `sintef-ocean`); 6 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner importert: 5.
- Dekningsdelta: 0 -> 22 kartlagt; gap 20 -> 0. Cellen er mettet etter arbeidsanslaget.
- Cross-session dedup-audit: 22 datasettaktorer, alle `NO`; ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
