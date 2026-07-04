# Mottakslogg: MVK gjodsel-jordforbedring deepening 2026-07-02

- Dataset: `mvk-gjodsel-jordforbedring-deepening-2026-07-02`
- Celle: `innsatsfaktorer / gjodsel-jordforbedring`
- Kilde: live DB-audit mot tidligere `mvk-gjodsel-jordforbedring-node-kandidater-2026-06-26.csv` og nåværende `domainRegistrations`.
- Kandidater: 3 eksakte re-registreringsrader for aktører som allerede hadde `subdomene:gjodsel-jordforbedring` i `themeTags`, men som ikke lenger ble telt av coverage-auditen fordi nyere multi-domene-berikelser hadde `domainRegistrations` uten eksakt `innsatsfaktorer / gjodsel-jordforbedring`.
- Utvalg: `Felleskjopet Agri SA`, `Felleskjopet Rogaland Agder SA` og `NORGRO AS`. `VEAS AS` og `Veas Marked AS` hadde samme metadata-undertelling, men ble ikke lagt til i denne passeringen fordi universe-target er 20, kun tre rader trengtes for å lukke gapet, og VEAS-radene allerede er tellende i `matsvinn-sirkulaer / biogass-bioraffinering` og `kompost-jordprodukt`.
- Dedupe: live DB slug/org.nr., eksisterende 2026-06-26 gjødselkandidater og auditens eksakte registreringsregel. Ingen nye aktører ble introdusert.
- Importresultat: 0 nye aktører og 3 eksisterende aktører beriket.
- Dekningsendring etter import/audit: `gjodsel-jordforbedring` 17 -> 20/20 (gap 3 -> 0), `innsatsfaktorer` 76 -> 79/80, og total domain-tagged dekning 1 628 -> 1 631/1 651. DB Actor-count er fortsatt 1 553.

## Usikkerhet

Batchen er en eksakt metadata-/domene-registrering, ikke en ny claim-lock. Kildene dokumenterer gjødsel-, kalk- eller jordforbedringsrolle, men låser ikke volum, salg, markedsandel, produktliste, norskprodusert/importert andel, gjødslingsresultat eller 2026-aktivitet.

## Verifikasjon

- Kandidatlisten er avledet fra live DB og tidligere 2026-06-26 gjødsel-/jordforbedringsinntak 2026-07-02.
- CSV-en er avgrenset til tre eksakte re-registreringer for å lukke 17 -> 20 uten å overfylle universe-target.
- `db:import:mvk-gjodsel-jordforbedring-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
