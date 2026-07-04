# MVK mottakslogg: lokale-verdikjeder / reko deepening pass 3 (2026-07-01)

- Kandidatfil: `research/_status/mvk-reko-deepening-3-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-reko-deepening-3-2026-07-01`.
- Kildepass: REKO Norge sitt offisielle Google My Maps KML-kart (`mid=1xvx6CIa6i406wG7z2u01wupMVp3avF7J`) hentet 2026-07-01.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reko-deepening-3-2026-07-01`.
- Kandidater klargjort: 20.
- Importresultat: 20 importert, 20 nye noder, 0 eksisterende beriket, 0 CompanyId-lenker, 0 relasjoner.
- Dekningsdelta etter import/audit: `reko` 60 -> 80 og gap 80 -> 60; `lokale-verdikjeder` 88 -> 108/261 og maks gap 80 -> 73; total domene-tagget dekning 1,239 -> 1,259; DB Actor-count 1,209 -> 1,229.
- Dedupe/filter: 164 KML-placemarks lest; 54 eksisterende normaliserte Facebook-lokatorer droppet før kandidatvalg. Kandidatene er første 20 nye ring-lokatorer etter dedupe mot eksisterende `subdomene:reko`-aktører, normaliserte Facebook-lokatorer og KML-interne dubletter.
- Metode: navn ble normalisert fra KML-varianter som `REKO-ringen`, `Reko ringen` og `REKO:` til `REKO-ringen <sted>`, mens original Facebook-lokator ble bevart.
- Usikkerhet: offisielt kart dokumenterer ringnavn/Facebook-lokator, men ikke aktiv 2026-drift, utleveringsfrekvens, antall produsenter/kunder, omsetning eller komplett datert nasjonal ringtelling.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-reko-deepening-3-2026-07-01` lagt til i `db:prod-sync` foer `db:verify`.
- Verifikasjon: `db:import:mvk-reko-deepening-3-2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
