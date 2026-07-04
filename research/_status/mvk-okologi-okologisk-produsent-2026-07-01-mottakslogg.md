# MVK mottakslogg: okologi-sertifisering / okologisk-produsent (2026-07-01)

- Kandidatfil: `research/_status/mvk-okologi-okologisk-produsent-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-okologi-okologisk-produsent-2026-07-01`.
- Kildepass: Brreg navne-/NACE-sweep for norske produsenter med okologisk/oko/biodynamisk navn og landbruks-/mat-NACE.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-okologi-okologisk-produsent-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/ordningspasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: Brreg-rader validert via detalj-API 2026-07-01; alle produsenter fra navne-/NACE-sweep er review-flagget der Debio-sertifikat ikke er kontrollert som egen kilde.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (19 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-okologi-okologisk-produsent-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
