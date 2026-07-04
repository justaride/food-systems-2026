# MVK mottakslogg: primaerproduksjon / urban-dyrking (2026-07-01)

- Kandidatfil: `research/_status/mvk-urban-dyrking-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-urban-dyrking-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret navnesok: urbant landbruk, urban dyrking, nabolagshage, parsellhage, Losaeter, Dyrk.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-urban-dyrking-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Kildeunivers i passet: mixed-name-search.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: Brreg aktiv enhet validert; kategori bygger paa navnesok og maa rolleavklares.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv` (20 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-urban-dyrking-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
