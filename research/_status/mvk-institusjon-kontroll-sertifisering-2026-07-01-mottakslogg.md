# MVK mottakslogg: institusjon-finansiering / kontroll-sertifisering (2026-07-01)

- Kandidatfil: `research/_status/mvk-institusjon-kontroll-sertifisering-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-institusjon-kontroll-sertifisering-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret detaljoppslag per org.nr. (6 aktive juridiske enheter).
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-institusjon-kontroll-sertifisering-2026-07-01`.
- Kandidater klargjort/importert: 6.
- Nye noder: 3.
- Eksisterende beriket/lenket: 3 (`DEBIO` -> `debio`, `STIFTELSEN NORSK MAT` -> `stiftelsen-norsk-mat`, `MATTILSYNET` -> `actor-mattilsynet`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 6 kartlagt; gap 6 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (3 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-institusjon-kontroll-sertifisering-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
