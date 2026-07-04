# Mottakslogg: MVK paraply-nettverk deepening 2026-07-02

- Dataset: `mvk-paraply-nettverk-deepening-2026-07-02`
- Celle: `lokale-verdikjeder / paraply-nettverk`
- Kilde: dekningsbokas universe-liste (`REKO Norge`, `Bondens marked`, `HANEN`, `Oekologisk Norge`, `NBS`, `Smaaskala Groent`, `Matsentralen`, `Stiftelsen Norsk Mat`) kontrollert mot live DB og primær-/Brreg-lokatorer.
- Kandidater: 5 eksakte re-registreringsrader for navngitte universe-ankre som allerede fantes som aktører i andre domener, men manglet eksakt `domainRegistrations` for `lokale-verdikjeder / paraply-nettverk`.
- Utvalg: `REKO-ringer Norge`, `Norsk Bonde- og Småbrukarlag`, `Smaaskala Groent Norge`, `Matsentralen Norge` og `Stiftelsen Norsk Mat`. `Stiftelsen Bondens marked`, `HANEN` og `Andelslandbruk (Oekologisk Norge)` var allerede tellende legacy-/eksaktregistreringer i cellen.
- Dedupe: live DB slug/org.nr. og eksisterende universe-ankre; ingen nye paraplyer utenfor dekningsbokas named universe ble lagt til.
- Importresultat: 0 nye aktører og 5 eksisterende aktører beriket.
- Dekningsendring etter import/audit: `paraply-nettverk` 3 -> 8/8 (gap 5 -> 0), `lokale-verdikjeder` 246 -> 251/258 og total domain-tagged dekning 1 619 -> 1 624/1 651. DB Actor-count er fortsatt 1 553.

## Usikkerhet

Batchen er en eksakt metadata-/domene-registrering, ikke en ny claim-lock. Brreg bekrefter juridisk enhet for NBS, Matsentralen Norge og Stiftelsen Norsk Mat. REKO- og Småskala Grønt-radene bruker primærlokatorer for paraply-/nettverksrolle. Batchen låser ikke ringtall, medlemstall, produsenttall, omsetning, regional aktivitet, programomfang eller komplett nasjonalt nettverk.

## Verifikasjon

- Kandidatlisten er avledet fra `domene-dekningsbok.csv` og live DB 2026-07-02.
- CSV er deduplisert mot eksisterende aktørslugs/org.nr. og er avgrenset til de navngitte universe-ankrene.
- `db:import:mvk-paraply-nettverk-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
