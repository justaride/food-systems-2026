# MVK mottakslogg: primaerproduksjon / villfisk-fiskeri (2026-06-27)

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-node-kandidater-2026-06-27.csv`.
- Dataset: `mvk-villfisk-fiskeri-2026-06-27`.
- Kildepass: Brreg Enhetsregisteret NACE 03.110 med detaljoppslag per org.nr.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-villfisk-fiskeri-2026-06-27`.
- Kandidater importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-06-27.
- Review-kø: `research/_status/mvk-review-koe-2026-06-27.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-06-27.md`.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-2026-06-27` lagt til og innlemmet i `db:prod-sync` foer `db:verify`.
