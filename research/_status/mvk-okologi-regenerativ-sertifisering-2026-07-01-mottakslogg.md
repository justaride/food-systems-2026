# MVK mottakslogg: okologi-sertifisering / regenerativ-sertifisering (2026-07-01)

- Kandidatfil: `research/_status/mvk-okologi-regenerativ-sertifisering-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-okologi-regenerativ-sertifisering-2026-07-01`.
- Kildepass: Brreg detaljoppslag for regenerative fag-/kompetanseaktorer kombinert med offisielle prosjekt-/sertifiseringssider.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-okologi-regenerativ-sertifisering-2026-07-01`.
- Kandidater klargjort/importert: 10.
- Nye noder: 8.
- Eksisterende beriket/lenket: 2 (`Regenerativt Norge`, `Norsk Landbruksrådgiving SA`).
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/ordningspasset.
- Dekningsdelta etter import/audit: 0 -> 10 kartlagt; gap 10 -> 0.
- Verifisering: Brreg-rader validert via detalj-API 2026-07-01; offisielle ordnings-/prosjektsider flagget som needs_review der org.nr. ikke er entydig.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (9 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-okologi-regenerativ-sertifisering-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
