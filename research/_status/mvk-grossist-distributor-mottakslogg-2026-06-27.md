# MVK mottakslogg: distribusjon-grossist / grossist-distributor (2026-06-27)

- Kandidatfil: `research/_status/mvk-grossist-distributor-node-kandidater-2026-06-27.csv`.
- Dataset: `mvk-grossist-distributor-2026-06-27`.
- Kildepass: Brreg Enhetsregisteret NACE 46.310 med detaljoppslag per org.nr.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-grossist-distributor-2026-06-27`.
- Kandidater importert/beriket: 20.
- Nye noder fra ren DB: 19.
- Eksisterende beriket/lenket: 1 (BAMA Gruppen via eksisterende Actor/Company).
- CompanyId-lenker: 3.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-06-27.
- Cross-session dedup: lokal duplikat `bama-gruppen-as` ble fjernet; CSV peker naa paa eksisterende `bama-gruppen`/BAMA-actor og importen er idempotent.
- Review-kø: `research/_status/mvk-review-koe-2026-06-27.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-06-27.md`.
- Prod-wiring: `db:import:mvk-grossist-distributor-2026-06-27` lagt til og innlemmet i `db:prod-sync` foer `db:verify`.
