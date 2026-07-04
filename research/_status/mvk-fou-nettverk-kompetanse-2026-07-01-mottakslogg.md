# MVK mottakslogg: fou-institusjon / nettverk-kompetanse (2026-07-01)

- Kandidatfil: `research/_status/mvk-fou-nettverk-kompetanse-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-fou-nettverk-kompetanse-2026-07-01`.
- Kildepass: Brreg detaljoppslag for klynge-/kompetanseaktorer kombinert med offisielle nettverks-/prosjektsider der Brreg-enhet ikke var entydig.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-fou-nettverk-kompetanse-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder fra ren pre-FOU DB: 18. Lokal idempotent rerun etter Heidner-slugfiks rapporterte 5 nye fordi 13 rader var lagt inn før første kjøring traff duplikatgrensen.
- Eksisterende beriket/lenket: 2 fra tidligere data (`NCE Heidner Biocluster` -> `actor-heidner-biocluster`, `Foods of Norway (NMBU)` -> `foods-of-norway`). Lokal idempotent rerun rapporterte 15 eksisterende etter partial-importen.
- CompanyId-lenker ved pre-dedup: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette register-/nettverkspasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Verifisering: Brreg-rader validert via detalj-API 2026-07-01; offisielle nettverks-/prosjektsider flagget som needs_review der org.nr. ikke er entydig.
- Dedup-notat: `NCE Heidner Biocluster` eksisterte allerede med slug `nce-heidner-biocluster`; kandidatfilen ble rettet fra `heidner-biocluster` slik at prod-sync beriker eksisterende aktør i stedet for å forsøke duplikat.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv` (15 rad(er) fra denne cellen).
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-fou-nettverk-kompetanse-2026-07-01` skal ligge i `db:prod-sync` foer `db:verify`.
