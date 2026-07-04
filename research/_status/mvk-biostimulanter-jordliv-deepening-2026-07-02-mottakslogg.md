# Mottakslogg: MVK biostimulanter-jordliv deepening 2026-07-02

- Dataset: `mvk-biostimulanter-jordliv-deepening-2026-07-02`
- Celle: `innsatsfaktorer / biostimulanter-jordliv`
- Kilde: live DB-audit mot tidligere `mvk-biostimulanter-jordliv-node-kandidater-2026-06-26.csv` og nåværende `domainRegistrations`.
- Kandidater: 4 eksakte re-registreringsrader for aktører som allerede hadde `subdomene:biostimulanter-jordliv` i `themeTags`, men som ikke lenger ble telt av coverage-auditen fordi nyere multi-domene-berikelser hadde `domainRegistrations` uten eksakt `innsatsfaktorer / biostimulanter-jordliv`.
- Utvalg: `Felleskjopet Agri SA`, `NORGRO AS`, `NORSOEK - Norsk senter for okologisk landbruk` og `Stiftelsen Norsk Mat`. `Oekologisk Norge` hadde samme metadata-undertelling, men ble ikke lagt til i denne passeringen fordi universe-target er 20 og kun fire rader trengtes for å lukke gapet uten overfyll.
- Dedupe: live DB slug/org.nr., eksisterende 2026-06-26 biostimulantkandidater og auditens eksakte registreringsregel. Ingen nye aktører ble introdusert.
- Importresultat: 0 nye aktører og 4 eksisterende aktører beriket.
- Dekningsendring etter import/audit: `biostimulanter-jordliv` 16 -> 20/20 (gap 4 -> 0), `innsatsfaktorer` 72 -> 76/80, og total domain-tagged dekning 1 624 -> 1 628/1 651. DB Actor-count er fortsatt 1 553.

## Usikkerhet

Batchen er en eksakt metadata-/domene-registrering, ikke en ny claim-lock. Kildene dokumenterer biostimulant-, jordlivs- eller jordhelserolle, men låser ikke volum, faktisk bruk, markedsandel, produktgodkjenning, dyrkingsresultat eller 2026-aktivitet. `Stiftelsen Norsk Mat` og den utelatte `Oekologisk Norge` er kunnskaps-/formidlingsroller og må fortsatt holdes adskilt fra produsent-/leverandørroller i analyser.

## Verifikasjon

- Kandidatlisten er avledet fra live DB og tidligere 2026-06-26 biostimulantinntak 2026-07-02.
- CSV-en er avgrenset til fire eksakte re-registreringer for å lukke 16 -> 20 uten å overfylle universe-target.
- `db:import:mvk-biostimulanter-jordliv-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
