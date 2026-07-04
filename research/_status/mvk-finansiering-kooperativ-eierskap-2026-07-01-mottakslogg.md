# MVK mottakslogg: finansiering-investering / kooperativ-eierskap (2026-07-01)

- Kandidatfil: `research/_status/mvk-finansiering-kooperativ-eierskap-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-finansiering-kooperativ-eierskap-2026-07-01`.
- Kildepass: Brreg detaljoppslag for kooperativt eierskap.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-finansiering-kooperativ-eierskap-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 3.
- Eksisterende beriket/lenket: 17 (`Coop Norge SA`, `TINE SA`, `Nortura SA`, `Felleskjøpet Agri SA`, `Gartnerhallen SA`, `Geno SA`, `Norsvin SA`, `Norsk Jersey SA`, `Norges Råfisklag SA`, `Norges Sildesalgslag SA`, `Samvirkene`, `Norsk Landbrukssamvirke`, `Felleskjøpet Rogaland Agder SA`, `HOFF SA`, `TYR`, `Norske Landbrukstenester`, `Norsk Sau og Geit`).
- CompanyId-lenker ved import: 7 (`COOP NORGE SA`, `TINE SA`, `NORTURA SA`, `FELLESKJØPET AGRI SA`, `GARTNERHALLEN SA`, `FELLESKJØPET ROGALAND AGDER SA`, `HOFF SA`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-finansiering-kooperativ-eierskap-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
