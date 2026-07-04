# MVK mottakslogg: horeca-offentlig / reiseliv-gardsmat (2026-07-01)

- Kandidatfil: `research/_status/mvk-reiseliv-gardsmat-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-reiseliv-gardsmat-2026-07-01`.
- Kildepass: HANEN kart-API / offentlig medlemskart med detaljoppslag der org.nr. er tilgjengelig.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reiseliv-gardsmat-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Kildeunivers i passet: 563; detaljscoret shortlist: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker ved pre-dedup: 20.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: HANEN offentlig kart-API validert; Brreg org.nr. bare der trygt navnematch finnes.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv` (3 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-reiseliv-gardsmat-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
