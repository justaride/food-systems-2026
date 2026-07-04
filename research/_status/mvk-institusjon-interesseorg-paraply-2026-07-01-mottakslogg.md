# MVK mottakslogg: institusjon-finansiering / interesseorg-paraply (2026-07-01)

- Kandidatfil: `research/_status/mvk-institusjon-interesseorg-paraply-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-institusjon-interesseorg-paraply-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret detaljoppslag per org.nr. (15 aktive juridiske enheter).
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-institusjon-interesseorg-paraply-2026-07-01`.
- Kandidater klargjort/importert: 15.
- Nye noder: 8.
- Eksisterende beriket/lenket: 7 (`NORGES BONDELAG` -> `actor-bondelaget`, `NORSK BONDE- OG SMÅBRUKARLAG` -> `actor-smabrukarlaget`, `ØKOLOGISK NORGE` -> `okologisk-norge`, `SJØMAT NORGE` -> `actor-sjomat-norge`, `NHO MAT OG DRIKKE` -> `actor-nho-mat-og-drikke`, `DLF` -> `actor-dlf`, `NHO REISELIV` -> `actor-nho-reiseliv`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 15 kartlagt; gap 15 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (5 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-institusjon-interesseorg-paraply-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
