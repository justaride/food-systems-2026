# MVK mottakslogg: institusjon-finansiering / universitet-utdanning (2026-07-01)

- Kandidatfil: `research/_status/mvk-institusjon-universitet-utdanning-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-institusjon-universitet-utdanning-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret detaljoppslag per org.nr. (8 aktive juridiske enheter).
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-institusjon-universitet-utdanning-2026-07-01`.
- Kandidater klargjort/importert: 8.
- Nye noder: 8.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 8 kartlagt; gap 8 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (7 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-institusjon-universitet-utdanning-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
