# MVK mottakslogg: lokale-verdikjeder / reko deepening pass 6 (2026-07-02)

- Kandidatfil: `research/_status/mvk-reko-deepening-6-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-reko-deepening-6-2026-07-02`.
- Kildepass: REKO Norge sitt offisielle Google My Maps KML-kart (`mid=1xvx6CIa6i406wG7z2u01wupMVp3avF7J`) hentet 2026-07-02.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-reko-deepening-6-2026-07-02`.
- Kandidater klargjort: 19.
- Dedupe/filter: 166 KML-placemarks lest; 3 uten Facebook-gruppelokator, 23 KML-interne duplikat-lokatorer, 119 eksisterende live DB-lokatorer og 2 eksisterende node-slugs ble droppet før kandidatvalg. Kandidatene er de 19 gjenværende nye ring-lokatorene etter dedupe mot live DB, tidligere REKO-kandidatfiler, normaliserte Facebook-lokatorer og KML-interne dubletter.
- Metode: navn ble normalisert fra KML-varianter som `REKO-ringen`, `Reko ringen` og `REKO:` til `REKO-ringen <sted>`, mens original Facebook-lokator ble bevart. Namdalen-rader med samme Facebook-gruppelokator ble deduplisert til én representativ lokatorrad.
- Importresultat: 19 aktører importert, 19 nye noder, 0 eksisterende aktører beriket, 0 personer og 0 relasjoner.
- Dekningsdelta etter import/audit: `reko` 120 -> 139/140 (gap 20 -> 1), `lokale-verdikjeder` 202 -> 221/258 og total domain-tagged dekning 1 493 -> 1 512/1 651. DB Actor-count er 1 458. Passet er kildebegrenset til 19 rader fordi KML-kartet ikke ga flere rene, nye lokatorer etter dedupe.

## Usikkerhet

Offisielt kart dokumenterer ringnavn/Facebook-lokator, men ikke aktiv 2026-drift, utleveringsfrekvens, antall produsenter/kunder, omsetning eller komplett datert nasjonal ringtelling. Batchen skal brukes som actor-gate/kandidatkart, ikke claim-lock.

## Verifikasjon

- Kandidatlisten er generert fra REKO Norge KML snapshot 2026-07-02.
- CSV er deduplisert mot live DB, tidligere REKO-kandidatfiler, normaliserte Facebook-lokatorer og KML-interne dubletter.
- `db:import:mvk-reko-deepening-6-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
