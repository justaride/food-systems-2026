# MVK mottakslogg: interesseorg-paraply / miljo-forbruker-ngo (2026-07-01)

- Kandidatfil: `research/_status/mvk-interesseorg-miljo-forbruker-ngo-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-interesseorg-miljo-forbruker-ngo-2026-07-01`.
- Kildepass: Brreg detaljoppslag for miljø-, forbruker-, matsvinn-, matkultur- og sivilsamfunnsaktører med matsystemrelevans.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-interesseorg-miljo-forbruker-ngo-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 10.
- Eksisterende beriket/lenket: 10 (`Framtiden i våre hender`, `Bellona`, `Forbrukerrådet`, `Forbrukertilsynet`, `Matvett AS`, `Matsentralen Norge`, `REKO Norge`, `Økologisk Norge`, `Stiftelsen Geitmyra Matkultursenter for Barn`, `Norges Bygdeungdomslag`).
- CompanyId-lenker ved import: 2 (`MATVETT AS`, `MATSENTRALEN NORGE`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-interesseorg-miljo-forbruker-ngo-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
