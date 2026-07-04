# MVK mottakslogg: finansiering-investering / stiftelse-fond (2026-07-01)

- Kandidatfil: `research/_status/mvk-finansiering-stiftelse-fond-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-finansiering-stiftelse-fond-2026-07-01`.
- Kildepass: Brreg detaljoppslag for stiftelser/fond.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-finansiering-stiftelse-fond-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 18.
- Eksisterende beriket/lenket: 2 (`Stiftelsen Norsk Mat`, `Stiftelsen Miljøfyrtårn`).
- CompanyId-lenker ved import: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-finansiering-stiftelse-fond-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
