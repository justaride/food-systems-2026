# Mottakslogg: matsvinn-sirkulaer / emballasje-retur 2026-06-26

## Scope

- Celle: `matsvinn-sirkulaer / emballasje-retur`.
- Kandidatfil: `research/_status/mvk-emballasje-retur-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-emballasje-retur-relasjoner-2026-06-26.json`.
- Guardrails: lokal DB-only, ingen schema-endring, ingen prod-import.

## Gather

- Kandidater: 23 aktorer/ordninger med lokator.
- Kildetyper: egen-/primarkilder for Gront Punkt Norge, Plastretur, Sirkel Glass, NORSIRK, Infinitum, LOOP, TOMRA, BEWI, Vartdal Plast, Packoorang, Ragn-Sells, ROAF, Sirk Norge og NORSUS; Gront Punkt-systemside brukt som systemlokator for Norsk Returkartong, Norsk Resy, Norsk Metallgjenvinning og Treretur.
- Brreg-validert 2026-06-26: 21 org.nr. i kandidatfilen er aktive norske enheter. `Sorteringsmerkene` er en ordningsnode uten eget org.nr. og lenkes til LOOP som forvalter.

## Importresultat

- Lokal import: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-emballasje-retur-2026-06-26`.
- Nye noder: 19 (`gront-punkt-norge-as`, `plastretur-as`, `norsk-returkartong-as`, `norsk-resy-as`, `norsk-metallgjenvinning-as`, `sirkel-glass-as`, `treretur-as`, `norsirk-as`, `loop-stiftelsen`, `sorteringsmerkene-loop`, `tomra-systems-asa`, `tomra-butikksystemer-as`, `den-norske-emballasjeforening`, `bewi-insulation-norge-as`, `bewi-circular-as`, `vartdal-plastindustri-as`, `packoorang-as`, `ragn-sells-as`, `roaf-iks`).
- Eksisterende beriket/lenket: 4 (`infinitum-as` -> eksisterende `actor-infinitum`, `norsk-gjenvinning-as` -> eksisterende `actor-norsk-gjenvinning`, `sirk-norge` -> eksisterende `actor-sirk-norge`, `norsus` -> eksisterende `actor-norsus`); 2 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner importert: 15.
- Dekningsdelta: 0 -> 23 kartlagt; gap 20 -> 0. Cellen er mettet etter arbeidsanslaget.
- Cross-session dedup-audit: 23 datasettaktorer, alle `NO`; ingen dupliserte kandidat-orgNr etter at ordningsnoden `sorteringsmerkene-loop` ble satt uten eget org.nr., ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
