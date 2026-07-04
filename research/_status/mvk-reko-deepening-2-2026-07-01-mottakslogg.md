# MVK mottakslogg: lokale-verdikjeder / reko deepening pass 2 (2026-07-01)

- Kandidatfil: `research/_status/mvk-reko-deepening-2-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-reko-deepening-2-2026-07-01`.
- Kildepass: REKO Norge sitt offisielle Google My Maps KML-kart (`mid=1xvx6CIa6i406wG7z2u01wupMVp3avF7J`) hentet 2026-07-01.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reko-deepening-2-2026-07-01`.
- Kandidater klargjort: 20.
- Kandidater importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i kartpasset.
- Dekningsdelta etter import/audit: `reko` 40 -> 60; gap 100 -> 80. `lokale-verdikjeder` 68 -> 88/261; maks gap 100 -> 80. Total domene-tagget dekning 1,179 -> 1,199/1,654. DB Actor-count 1,149 -> 1,169.
- Dedupe: eksisterende `subdomene:reko`-aktører og normaliserte Facebook-lokatorer ble ekskludert; KML-interne dubletter/variantnavn ble droppet i samme pass.
- Metode: navn ble normalisert fra KML-varianter som `REKO-ringen`, `Reko ringen` og `REKO:` til `REKO-ringen <sted>`, mens original Facebook-lokator ble bevart.
- Usikkerhet: offisielt kart dokumenterer ringnavn/Facebook-lokator, men ikke aktiv 2026-drift, utleveringsfrekvens, antall produsenter/kunder, omsetning eller komplett datert nasjonal ringtelling.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-reko-deepening-2-2026-07-01` lagt til og innlemmet i `db:prod-sync` foer `db:verify`.
- Verifikasjon: `db:import:mvk-reko-deepening-2-2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
