# MVK mottakslogg: okologi-sertifisering / kontrollorgan-merkeordning (2026-07-01)

- Kandidatfil: `research/_status/mvk-okologi-kontrollorgan-merkeordning-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-okologi-kontrollorgan-merkeordning-2026-07-01`.
- Kildepass: Brreg detaljoppslag for kontroll-, merkeordnings- og myndighetsaktorer.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-okologi-kontrollorgan-merkeordning-2026-07-01`.
- Kandidater klargjort/importert: 10.
- Nye noder fra ren pre-okologi DB: 2 (`DEBIO MARKED AS`, `NORSK ØKOLOGISK FORENING`). Lokal idempotent rerun etter DNV-slugfiks rapporterte 0 nye fordi disse to var lagt inn før første kjøring traff duplikatgrensen.
- Eksisterende beriket/lenket: 8 (`Debio`, `Stiftelsen Norsk Mat`, `Mattilsynet`, `Landbruksdirektoratet`, `Norsk Akkreditering`, `Økologisk Norge`, `KIWA AS`, `DNV Business Assurance Norway`).
- CompanyId-lenker ved pre-dedup: 1 (`DEBIO MARKED AS`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/ordningspasset.
- Dekningsdelta etter import/audit: 0 -> 10 kartlagt; gap 10 -> 0.
- Verifisering: Brreg-rader validert via detalj-API 2026-07-01.
- Dedup-notat: `DNV BUSINESS ASSURANCE NORWAY AS` eksisterte allerede med slug `dnv-business-assurance-norway`; kandidatfil og review-koe ble rettet fra `dnv-business-assurance-norway-as`.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (6 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-okologi-kontrollorgan-merkeordning-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
