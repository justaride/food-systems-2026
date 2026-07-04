# MVK mottakslogg: forbruk / forbrukerorganisasjon (2026-07-01)

- Kandidatfil: `research/_status/mvk-forbruk-forbrukerorganisasjon-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-forbruk-forbrukerorganisasjon-2026-07-01`.
- Kildepass: Brreg detaljoppslag for forbruker-, sivilsamfunns- og forvaltningsaktorer med tydelig forbruker-/matsystemtilknytning.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-forbruk-forbrukerorganisasjon-2026-07-01`.
- Kandidater klargjort/importert: 10.
- Nye noder: 0.
- Eksisterende beriket/lenket: 10 (`Forbrukerrådet`, `Forbrukertilsynet`, `Framtiden i våre hender`, `Norges Kvinne- og Familieforbund`, `Norges Bygdekvinnelag`, `REKO Norge`, `Økologisk Norge`, `Matvett AS`, `Dyrevernalliansen STI`, `Spire`).
- CompanyId-lenker ved import: 1 (`MATVETT AS`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 10 kartlagt; gap 10 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-forbruk-forbrukerorganisasjon-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
