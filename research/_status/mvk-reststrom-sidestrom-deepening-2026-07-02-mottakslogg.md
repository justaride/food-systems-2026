# Mottakslogg: MVK reststrom-sidestrom deepening 2026-07-02

- Dataset: `mvk-reststrom-sidestrom-deepening-2026-07-02`
- Celle: `matsvinn-sirkulaer / reststrom-sidestrom`
- Kilde: live DB-audit mot tidligere `mvk-reststrom-sidestrom-node-kandidater-2026-06-26.csv` og nåværende `domainRegistrations`.
- Kandidater: 1 eksakt re-registreringsrad for aktør som allerede hadde `subdomene:reststrom-sidestrom` i `themeTags`, men som ikke lenger ble telt av coverage-auditen fordi nyere multi-domene-berikelser hadde `domainRegistrations` uten eksakt `matsvinn-sirkulaer / reststrom-sidestrom`.
- Utvalg: `Nortura SA`. `Nofima AS` og `SINTEF Ocean AS` hadde samme metadata-undertelling, men ble ikke lagt til i denne passeringen fordi universe-target er 20, kun én rad trengs for å lukke gapet, og de to er primært FoU-infrastruktur.
- Dedupe: live DB slug/org.nr., eksisterende 2026-06-26 reststrøm-/sidestrømkandidater og auditens eksakte registreringsregel. Ingen nye aktører introduseres.
- Importresultat: 0 nye aktører og 1 eksisterende aktør beriket.
- Dekningsendring etter import/audit: `reststrom-sidestrom` 19 -> 20/20 (gap 1 -> 0), `matsvinn-sirkulaer` 101 -> 102/120, og total domain-tagged dekning 1 633 -> 1 634/1 651. DB Actor-count er fortsatt 1 554.

## Usikkerhet

Batchen er en eksakt metadata-/domene-registrering, ikke en ny claim-lock. Kilden dokumenterer Norturas sirkulærøkonomi-/restråstoffrolle, men låser ikke volum, fraksjonsfordeling, verdikjedeandel, matsvinnreduksjon, mottakernettverk, produktmiks eller faktisk 2026-utnyttelse.

## Verifikasjon

- Kandidatlisten er avledet fra live DB og tidligere 2026-06-26 reststrøm-/sidestrøminntak 2026-07-02.
- CSV-en er avgrenset til én eksakt re-registrering for å lukke 19 -> 20 uten å overfylle universe-target.
- `db:import:mvk-reststrom-sidestrom-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
