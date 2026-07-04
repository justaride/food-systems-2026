# MVK mottakslogg: institusjon-finansiering / virkemiddel-ordning (2026-07-01)

- Kandidatfil: `research/_status/mvk-institusjon-virkemiddel-ordning-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-institusjon-virkemiddel-ordning-2026-07-01`.
- Kildepass: Brreg detaljoppslag for juridiske virkemiddelaktorer og offisielle program-/ordningssider for ordningsnoder.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-institusjon-virkemiddel-ordning-2026-07-01`.
- Kandidater klargjort/importert: 12.
- Nye noder: 1.
- Eksisterende beriket/lenket: 11 (eksisterende virkemiddel-/programaktorer beriket med `institusjon-finansiering / virkemiddel-ordning`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 12 kartlagt; gap 12 -> 0.
- Verifisering: juridiske aktorer Brreg-validert; ordnings-URL-er kildeidentifisert 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (8 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-institusjon-virkemiddel-ordning-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
