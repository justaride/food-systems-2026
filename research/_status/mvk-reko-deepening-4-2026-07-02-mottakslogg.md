# MVK mottakslogg: lokale-verdikjeder / reko deepening pass 4 (2026-07-02)

- Kandidatfil: `research/_status/mvk-reko-deepening-4-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-reko-deepening-4-2026-07-02`.
- Kildepass: REKO Norge sitt offisielle Google My Maps KML-kart (`mid=1xvx6CIa6i406wG7z2u01wupMVp3avF7J`) hentet 2026-07-02.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reko-deepening-4-2026-07-02`.
- Kandidater klargjort: 20.
- Dedupe/filter: 166 KML-placemarks lest; 3 uten Facebook-gruppelokator, 23 KML-interne duplikat-lokatorer, 79 eksisterende normaliserte lokatorer og 1 eksisterende node-slug ble droppet før kandidatvalg. Kandidatene er første 20 nye ring-lokatorer etter dedupe mot live DB, tidligere REKO-kandidatfiler, normaliserte Facebook-lokatorer og KML-interne dubletter.
- Metode: navn ble normalisert fra KML-varianter som `REKO-ringen`, `Reko ringen` og `REKO:` til `REKO-ringen <sted>`, mens original Facebook-lokator ble bevart.
- Usikkerhet: offisielt kart dokumenterer ringnavn/Facebook-lokator, men ikke aktiv 2026-drift, utleveringsfrekvens, antall produsenter/kunder, omsetning eller komplett datert nasjonal ringtelling.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-reko-deepening-4-2026-07-02` lagt til i `db:prod-sync` før `db:verify`.
- Importresultat: 20 aktører importert, 20 nye noder, 0 eksisterende aktører beriket, 0 personer og 0 relasjoner.
- Dekningsdelta etter import/audit: `reko` 80 -> 100 og gap 60 -> 40; `lokale-verdikjeder` er naa 148/258 med maks gap 50, og total domene-tagget dekning er 1,319/1,651. DB Actor-count er 1,286.
- Verifikasjon: `db:import:mvk-reko-deepening-4-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
