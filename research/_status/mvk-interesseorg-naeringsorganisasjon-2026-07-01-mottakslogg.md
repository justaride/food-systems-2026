# MVK mottakslogg: interesseorg-paraply / naeringsorganisasjon (2026-07-01)

- Kandidatfil: `research/_status/mvk-interesseorg-naeringsorganisasjon-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-interesseorg-naeringsorganisasjon-2026-07-01`.
- Kildepass: Brreg detaljoppslag for nasjonale nærings-, bransje-, samvirke- og markedsorganisasjoner i matverdikjeden.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-interesseorg-naeringsorganisasjon-2026-07-01`.
- Kandidater klargjort/importert: 20.
- Nye noder: 13.
- Eksisterende beriket/lenket: 7 (`NHO Mat og Drikke`, `Sjømat Norge`, `Hovedorganisasjonen Virke`, `NHO Reiseliv`, `Norsk Landbrukssamvirke`, `Samvirkene`, `Norges Fiskarlag`).
- CompanyId-lenker ved import: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i dette registerpasset.
- Dekningsdelta etter import/audit: 0 -> 20 kartlagt; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-interesseorg-naeringsorganisasjon-2026-07-01` ligger i `db:prod-sync` foer `db:verify`.
