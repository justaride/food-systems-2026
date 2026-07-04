# MVK mottakslogg: forbruk / matfellesskap-innkjopslag (2026-07-01)

- Kandidatfil: `research/_status/mvk-forbruk-matfellesskap-innkjopslag-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-forbruk-matfellesskap-innkjopslag-2026-07-01`.
- Kildepass: Brreg detaljoppslag for kooperativer, andelslandbruk, marked-/plattformaktorer og lokale innkjopsfellesskap.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-forbruk-matfellesskap-innkjopslag-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 17.
- Eksisterende beriket/lenket: 3 (`Øverland Andelslandbruk SA`, `Stiftelsen Bondens Marked Norge`, `Too Good To Go Norge AS`).
- CompanyId-lenker ved import: 1 (`TOO GOOD TO GO NORGE AS`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-forbruk-matfellesskap-innkjopslag-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
