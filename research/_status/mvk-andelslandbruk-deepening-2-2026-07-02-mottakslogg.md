# MVK mottakslogg: lokale-verdikjeder / andelslandbruk deepening pass 2 (2026-07-02)

- Kandidatfil: `research/_status/mvk-andelslandbruk-deepening-2-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-andelslandbruk-deepening-2-2026-07-02`.
- Kildepass: Økoguiden API `/Umbraco/Api/EcoGuideApi/Search/8074` med `categoryId=8467` (Andelslandbruk), hentet 2026-07-02; Økologisk Norge sin `Om andelslandbruk`-side oppgir fortsatt 90 aktive andelslandbruk, sist oppdatert 2026-01-26.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-andelslandbruk-deepening-2-2026-07-02`.
- Kandidater klargjort: 20.
- Dedupe/filter: 71 Økoguiden-rader lest. 40 rader ble droppet før kandidatvalg fordi lokator/navn allerede var registrert som andelslandbruk i DB eller tidligere andelslandbruk-kandidatfiler. Kandidatene er de første 20 coverage-økende radene etter normalisert locator-/navnededupe (inkludert gård/gaard/gard-, Røed/Roed- og ø/oe/o-varianter); eksisterende ikke-andelslandbruk-aktører gjenbrukes der normalisert navn peker på en kjent aktør.
- Importresultat: 20 aktører importert; 17 nye aktører og 3 eksisterende aktører beriket (`andelshagebruket-roed-pa-jeloy-sa`, `dysterjordet-andelslandbruk-sa`, `bamble-andelsgard-sa`); 0 personer og 0 relasjoner.
- Dekningsdelta etter import/audit: `andelslandbruk` 40 -> 60/90 og gap 50 -> 30; `lokale-verdikjeder` er nå 168/258, maks gap er 40, og total domene-tagget dekning er 1,379/1,651. DB Actor-count er 1,330.
- Usikkerhet: Økoguiden bekrefter guidekategori/lokator, men ikke aktiv 2026-sesongdrift, andelstilbud, medlemstall, produksjonsvolum, Debio-status, geografisk dekningsgrad eller komplett nasjonal aktivliste. Alle rader beholdes som actor-gate/kandidatkart før hard claim-lock.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Prod-wiring: `db:import:mvk-andelslandbruk-deepening-2-2026-07-02` lagt til i `db:prod-sync` før `db:verify`.
- Verifikasjon: `db:import:mvk-andelslandbruk-deepening-2-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
