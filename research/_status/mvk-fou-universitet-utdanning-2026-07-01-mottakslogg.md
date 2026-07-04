# MVK mottakslogg: fou-institusjon / universitet-utdanning (2026-07-01)

- Kandidatfil: `research/_status/mvk-fou-universitet-utdanning-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-fou-universitet-utdanning-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret detaljoppslag per org.nr. (12 aktive UH-enheter).
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-fou-universitet-utdanning-2026-07-01`.
- Kandidater klargjort/importert: 12.
- Nye noder: 4.
- Eksisterende beriket/lenket: 8 (`NMBU`, `Universitetet i Oslo`, `Universitetet i Bergen`, `NTNU`, `Nord universitet`, `OsloMet`, `Høgskulen på Vestlandet`, `Universitetet i Innlandet`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/nettverkspasset.
- Dekningsdelta etter import/audit: 0 -> 12 kartlagt; gap 12 -> 0.
- Verifisering: Brreg-rader validert via detalj-API 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (11 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-fou-universitet-utdanning-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
