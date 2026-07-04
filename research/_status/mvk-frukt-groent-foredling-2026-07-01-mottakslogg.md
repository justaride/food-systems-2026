# MVK mottakslogg: foredling-industri / frukt-groent-foredling (2026-07-01)

- Kandidatfil: `research/_status/mvk-frukt-groent-foredling-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-frukt-groent-foredling-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret NACE 10.310/10.320/10.390 med detaljoppslag per org.nr.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-frukt-groent-foredling-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- Brreg-univers i kodepasset: 173; detaljscoret shortlist: 50.
- CompanyId-lenker ved pre-dedup: 20.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (3 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-frukt-groent-foredling-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
