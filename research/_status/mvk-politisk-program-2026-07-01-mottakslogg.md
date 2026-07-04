# MVK mottakslogg: virkemiddel-policy / politisk-program (2026-07-01)

- Kandidatfil: `research/_status/mvk-politisk-program-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-politisk-program-2026-07-01`.
- Kildepass: Offisielle regjeringen.no-, Innovasjon Norge-, Forskningsraadet- og Miljodirektoratet-sider identifisert via websoek og delvis direkte HTTP-probet.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-politisk-program-2026-07-01`.
- Kandidater klargjort/importert: 10.
- Nye noder: 10.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/program-passet.
- Dekningsdelta etter import/audit: 0 -> 10 kartlagt; gap 10 -> 0.
- Verifisering: offisielle program-URL-er kildeidentifisert; se kandidatnotater for HTTP-status 2026-07-01.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (10 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-politisk-program-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
