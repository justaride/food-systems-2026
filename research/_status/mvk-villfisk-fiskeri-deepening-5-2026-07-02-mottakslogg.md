# MVK mottakslogg: primaerproduksjon / villfisk-fiskeri deepening pass 5 (2026-07-02)

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-deepening-5-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-villfisk-fiskeri-deepening-5-2026-07-02`.
- Kildepass: Brreg Enhetsregisteret NACE 03.110 med detaljoppslag per org.nr., hentet 2026-07-02.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-villfisk-fiskeri-deepening-5-2026-07-02`.
- Kandidater klargjort: 20.
- Dedupe/filter: 7,788 Brreg NACE 03.110-rader tilgjengelig; 451 rader inspisert før kandidatsett. 100 eksisterende/prior villfisk-org.nr. eller slugs, 306 feil org.form/ENK, 5 inaktive/avviklingsrader, 17 uten eksplisitt direkte fiskeri-/fangst-/fartøy-/sjømat-signal og 3 service-/rettighets-/kortsalgs-edge-caser ble droppet før kandidatvalg.
- Filterstramming: passet krever direkte operativt signal i navn/formål/aktivitet (f.eks. fiske/fangst, fiskefartøy, fiskebåtrederi, kystfiske/havfiske), ikke bare NACE-label eller støtte-/rettighetsrolle.
- Kilde-/claim-status: Brreg bekrefter juridisk aktiv enhet, NACE/navn og registertekst, men ikke fartøy, kvote, landingsvolum, artssammensetning, fangstområde eller aktiv fiskeriaktivitet i inneværende år. Mixed-role rader er beholdt på `middels` confidence og review-flagget.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-deepening-5-2026-07-02` lagt til i `db:prod-sync` før `db:verify`.
- Importresultat: 20 aktører importert, 20 nye noder, 0 eksisterende aktører beriket, 0 personer og 0 relasjoner.
- Dekningsdelta etter import/audit: `villfisk-fiskeri` 100 -> 120/150 og gap 50 -> 30; `primaerproduksjon` er nå 280/350, maks gap er 40, og total domene-tagget dekning er 1,399/1,651. DB Actor-count er 1,350.
- Verifikasjon: `db:import:mvk-villfisk-fiskeri-deepening-5-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
