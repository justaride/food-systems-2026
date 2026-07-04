# MVK mottakslogg: handel-dagligvare / spesialhandel-delikatesse (2026-07-01)

- Kandidatfil: `research/_status/mvk-handel-spesialhandel-delikatesse-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-handel-spesialhandel-delikatesse-2026-07-01`.
- Kildepass: Brreg detaljoppslag for spesialhandel, delikatesse, fisk/kjott/ost, mathall og lokalmat-butikker.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-handel-spesialhandel-delikatesse-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 19.
- Eksisterende beriket/lenket: 1 (`Bagn Pølsemakeri AS`).
- CompanyId-lenker ved import: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Dedup-funn/fiks: første import traff unik `(country, name)` for `BAGN PØLSEMAKERI AS`; kandidatfil og review-koe ble rettet fra `bagn-polsemakeri-as` til eksisterende slug `bagn-p-lsemakeri-as`, og idempotent rerun fullførte importen.
- Prod-wiring: `db:import:mvk-handel-spesialhandel-delikatesse-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
