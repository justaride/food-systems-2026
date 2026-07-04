# MVK mottakslogg: distribusjon-grossist / grossist-distributor deepening (2026-07-02)

- Kandidatfil: `research/_status/mvk-grossist-distributor-deepening-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-grossist-distributor-deepening-2026-07-02`.
- Kildepass: Brreg Enhetsregisteret NACE 46.390, 46.380, 46.310, 46.330, 46.340, 46.360 og 46.370, sortert etter `antallAnsatte,desc`, med detaljoppslag per org.nr. 46.210 ble bevisst utelatt fordi korn/såvarer/fôrvarer treffer innsatsfaktor-/landbruksledd mer enn matgrossist-distributørleddet.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-grossist-distributor-deepening-2026-07-02`.
- Kandidater klargjort: 20.
- Importresultat: 20 aktører importert, 7 nye aktører, 13 eksisterende aktører beriket, 0 personer og 0 relasjoner.
- Dedupe/filter: 884 Brreg-rader inspisert på de valgte matgrossist-NACE-kodene. 20 eksisterende `subdomene:grossist-distributor`-org.nr., 13 rader uten primær wholesale-NACE, 140 feil org.form/ENK og 8 inaktive/avviklingsrader ble droppet før kandidatvalg. De 20 høyest ansatte gjenværende AS/SA-radene med primær NACE 46.* og tydelig mat-/drikke-/dagligvare-/storhusholdningsgrossist-signal ble valgt.
- Dekningsdelta etter import/audit: `grossist-distributor` 20 -> 40 og gap 60 -> 40; `distribusjon-grossist` er naa 80/120, maks gap er 40, og total domene-tagget dekning er 1,359/1,651. DB Actor-count er 1,313.
- Usikkerhet: Brreg bekrefter juridisk aktiv enhet, NACE/navn og registertekst, men ikke faktisk volum, markedsandel, lagerkapasitet, kundemiks, distribusjonsgeografi, konsernintern rolle eller at alle regionale ASKO-/grossistledd har selvstendig grossistfunksjon utover logistikk/konsernstruktur.
- Review-kø: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Verifikasjon: `db:import:mvk-grossist-distributor-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')" && git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
- Prod-wiring: `db:import:mvk-grossist-distributor-deepening-2026-07-02` lagt til i `db:prod-sync` før `db:verify`.
