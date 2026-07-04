# MVK mottakslogg: interesseorg-paraply / faglag-bonde (2026-07-01)

- Kandidatfil: `research/_status/mvk-interesseorg-faglag-bonde-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-interesseorg-faglag-bonde-2026-07-01`.
- Kildepass: Brreg detaljoppslag for bonde-, produsent-, avls-, rådgivings- og landbruksfaglige organisasjoner.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-interesseorg-faglag-bonde-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 14.
- Eksisterende beriket/lenket: 6 (`Norges Bondelag`, `Norsk Bonde- og Småbrukarlag`, `Norsk Sau og Geit`, `Norsk Landbruksrådgiving SA`, `Norges Bygdekvinnelag`, `Norsk Gardsost`).
- CompanyId-lenker ved import: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-interesseorg-faglag-bonde-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
