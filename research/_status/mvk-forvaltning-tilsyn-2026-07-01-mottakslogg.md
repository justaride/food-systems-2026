# MVK mottakslogg: virkemiddel-policy / forvaltning-tilsyn (2026-07-01)

- Kandidatfil: `research/_status/mvk-forvaltning-tilsyn-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-forvaltning-tilsyn-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret detaljoppslag per org.nr. (12 aktive juridiske enheter).
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-forvaltning-tilsyn-2026-07-01`.
- Kandidater klargjort/importert: 12.
- Nye noder: 7.
- Eksisterende beriket/lenket: 5 (`MATTILSYNET` -> `actor-mattilsynet`, `HELSEDIREKTORATET` -> `actor-helsedirektoratet`, `KONKURRANSETILSYNET` -> `actor-kt`, `LANDBRUKS- OG MATDEPARTEMENTET` -> `actor-lmd`, `NÆRINGS- OG FISKERIDEPARTEMENTET` -> `actor-nfd`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 12 kartlagt; gap 12 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (6 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-forvaltning-tilsyn-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
