# MVK mottakslogg: primaerproduksjon / villfisk-fiskeri deepening pass 3 (2026-07-01)

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-deepening-3-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-villfisk-fiskeri-deepening-3-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret NACE 03.110 med detaljoppslag per org.nr.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-villfisk-fiskeri-deepening-3-2026-07-01`.
- Kandidater klargjort: 20.
- Importresultat: 20 importert, 20 nye noder, 0 eksisterende beriket, 0 CompanyId-lenker, 0 relasjoner.
- Dekningsdelta etter import/audit: `villfisk-fiskeri` 60 -> 80 og gap 90 -> 70; `primaerproduksjon` 180 -> 200/350 og maks gap 90 -> 80; total domene-tagget dekning 1,199 -> 1,219; DB Actor-count 1,169 -> 1,189.
- Dedupe/filter: 298 Brreg-rader inspisert før kandidatsett; 60 eksisterende villfisk-org.nr. droppet, 189 feil org.form/ENK, 5 inaktive og 14 uten eksplisitt operativt fiskeri-/fangst-/fartøy-/sjømat-signal utover NACE ble droppet.
- Usikkerhet: Brreg bekrefter juridisk aktiv enhet, NACE/navn og registertekst, men ikke fartøy, kvote, landingsvolum, artssammensetning, fangstområde eller aktiv fiskeriaktivitet i innevaerende år.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-deepening-3-2026-07-01` lagt til i `db:prod-sync` foer `db:verify`.
- Verifikasjon: `db:audit`, `audit:research-artifacts -- --base=origin/main`, `package.json` parse + `git diff --check`, `audit:citable`, `db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
