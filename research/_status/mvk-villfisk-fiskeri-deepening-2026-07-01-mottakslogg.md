# MVK mottakslogg: primaerproduksjon / villfisk-fiskeri deepening (2026-07-01)

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-deepening-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-villfisk-fiskeri-deepening-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret NACE 03.110 med detaljoppslag per org.nr.; fortsettelse etter 2026-06-27-run-floor, filtrert for aktive AS/ANS-rader med eksplisitt fiskeri-/fangst-/fartoy-/sjomat-/tang-/tare-signal i Brreg aktivitet/formaal.
- Gate: actor-gate. Brreg bekrefter juridisk enhet, NACE, navn og registertekst, men ikke fartoyliste, kvote, landingsvolum, artssammensetning, eller aktiv fiskeriaktivitet i innevaerende aar.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-villfisk-fiskeri-deepening-2026-07-01`.
- Kandidater importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: `villfisk-fiskeri` 20 -> 40 kartlagt; gap 130 -> 110.
- Brreg-univers i kodepasset: 200 listede rader inspisert til kandidatsett og reservekandidater; 162 rader droppet foer import.
- Verifisering: alle importerte org.nr. ble validert via Brreg detalj-API 2026-07-01.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-deepening-2026-07-01` lagt til og innlemmet i `db:prod-sync` foer `db:verify`.
