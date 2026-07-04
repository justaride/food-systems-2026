# MVK mottakslogg: primaerproduksjon / havbruk-akvakultur deepening (2026-07-01)

- Kandidatfil: `research/_status/mvk-havbruk-akvakultur-deepening-2026-07-01-node-kandidater.csv`.
- Dataset: `mvk-havbruk-akvakultur-deepening-2026-07-01`.
- Kildepass: Brreg Enhetsregisteret NACE 03.211, sortert etter `antallAnsatte,desc`, med detaljoppslag per org.nr.; Fiskeridirektoratet pub-aqua `sites-by-entity-nr/{orgNr}` brukt som ekstra permit-/lokalitetssignal i notes.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-havbruk-akvakultur-deepening-2026-07-01`.
- Kandidater klargjort: 20.
- Kandidater importert: 20.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 9 (`MOWI ASA`, `SALMAR FARMING AS`, `CERMAQ NORWAY AS`, `LERØY MIDT AS`, `NOVA SEA AS`, `LERØY AURORA AS`, `LERØY SEAFOOD GROUP ASA`, `LERØY VEST AS`, `MOWI MARKETS NORWAY AS`).
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta etter import/audit: `havbruk-akvakultur` 20 -> 40; gap 100 -> 80. `primaerproduksjon` 160 -> 180/350; maks gap 100 -> 90. Total domene-tagget dekning 1,159 -> 1,179/1,654. DB Actor-count 1,129 -> 1,149.
- Dedupe: eksisterende 20 `subdomene:havbruk-akvakultur`-aktører fra 2026-06-27 ble ekskludert før kandidatvalg.
- Metode: dette passet retter opp tidligere alfabetisk registerslice som traff små/tilfeldige A-rader og bommet på sentrale operatører som Mowi, SalMar, Lerøy, Cermaq, Nova Sea, Nordlaks, Grieg, Bolaks og andre ansatte-/lokalitetssterke selskaper.
- Usikkerhet: Brreg bekrefter juridisk aktiv enhet, NACE/navn og registertekst, og pub-aqua bekrefter lokalitets-/tillatelsessignal der API-en returnerer treff. Batchen beviser ikke full konsernstruktur, biomasse, produksjonsvolum, luse-/miljøstatus, lønnsomhet, faktisk drift i innevaerende uke eller komplett nasjonalt inventar.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-havbruk-akvakultur-deepening-2026-07-01` lagt til og innlemmet i `db:prod-sync` foer `db:verify`.
- Verifikasjon: `db:import:mvk-havbruk-akvakultur-deepening-2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-01`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
