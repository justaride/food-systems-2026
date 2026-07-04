# MVK mottakslogg: primaerproduksjon / villfisk-fiskeri deepening pass 4 (2026-07-02)

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-deepening-4-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-villfisk-fiskeri-deepening-4-2026-07-02`.
- Kildepass: Brreg Enhetsregisteret NACE 03.110 med detaljoppslag per org.nr., hentet 2026-07-02.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-villfisk-fiskeri-deepening-4-2026-07-02`.
- Kandidater klargjort: 20.
- Dedupe/filter: 7,788 Brreg NACE 03.110-rader tilgjengelig; 345 rader inspisert før kandidatsett. 80 eksisterende villfisk-org.nr., 227 feil org.form/ENK, 5 inaktive og 13 uten eksplisitt operativt fiskeri-/fangst-/fartøy-/sjømat-signal i navn/formål/aktivitet ble droppet før kandidatvalg.
- Filterstramming: første generatorutkast ble forkastet fordi NACE-teksten alene slapp rene holding-/investeringsrader gjennom. Endelig kandidatsett krever operativt signal i navn/formål/aktivitet, ikke bare NACE-label.
- Kilde-/claim-status: Brreg bekrefter juridisk aktiv enhet, NACE/navn og registertekst, men ikke fartøy, kvote, landingsvolum, artssammensetning, fangstområde eller aktiv fiskeriaktivitet i inneværende år. Mixed-role rader er beholdt på `middels` confidence og review-flagget.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-deepening-4-2026-07-02` lagt til i `db:prod-sync` før `db:verify`.
- Importresultat: 20 aktører importert, 20 nye noder, 0 eksisterende aktører beriket, 0 personer og 0 relasjoner.
- Dekningsdelta etter import/audit: `villfisk-fiskeri` 80 -> 100 og gap 70 -> 50; `primaerproduksjon` er naa 240/350 med maks gap 60, og total domene-tagget dekning er 1,299/1,651. DB Actor-count er 1,266.
- Verifikasjon: `db:import:mvk-villfisk-fiskeri-deepening-4-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
