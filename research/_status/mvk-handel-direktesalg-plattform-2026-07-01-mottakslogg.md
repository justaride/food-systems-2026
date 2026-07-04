# MVK mottakslogg: handel-dagligvare / direktesalg-plattform (2026-07-01)

- Kandidatfil: `research/_status/mvk-handel-direktesalg-plattform-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-handel-direktesalg-plattform-2026-07-01`.
- Kildepass: Brreg detaljoppslag for nettbutikk, levering, markedsplass, lokalmatplattform, REKO/Bondens Marked og kooperative direktesalgskanaler.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-handel-direktesalg-plattform-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 8.
- Eksisterende beriket/lenket: 12 (`Oda`, `Morgenlevering AS`, `Lokalmat SA`, `Holdbart AS`, `Stiftelsen Bondens Marked Norge`, `REKO Norge`, `Kooperativet SA`, `Nøtterøy Kooperativ SA`, `Trondheim Kooperativ SA`, `Ås Kooperativ SA`, `Matkollektivet SA`, `Too Good To Go Norge AS`).
- CompanyId-lenker ved import: 4 (`ODA GROUP AS`, `ODA NORWAY AS`, `HOLDBART AS`, `TOO GOOD TO GO NORGE AS`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-handel-direktesalg-plattform-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
