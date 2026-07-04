# MVK mottakslogg: horeca-offentlig / offentlig-innkjop-kantine (2026-07-01)

- Kandidatfil: `research/_status/mvk-offentlig-innkjop-kantine-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-offentlig-innkjop-kantine-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret NACE 56.220 med detaljoppslag der org.nr. er tilgjengelig.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-offentlig-innkjop-kantine-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Kildeunivers i passet: 308; detaljscoret shortlist: 55.
- Nye noder: 19.
- Eksisterende beriket/lenket: 1 (`COMPASS GROUP NORGE AS` -> `actor-compass-group`; eksakt NO-domene-registrering lagt i metadata for dekningsaudit).
- CompanyId-lenker ved pre-dedup: 20.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: alle importerte org.nr. validert via Brreg detalj-API 2026-07-01.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv` (1 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-offentlig-innkjop-kantine-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
