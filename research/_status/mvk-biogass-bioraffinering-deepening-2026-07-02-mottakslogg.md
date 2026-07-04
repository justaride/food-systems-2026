# Mottakslogg: MVK biogass-bioraffinering deepening 2026-07-02

- Dataset: `mvk-biogass-bioraffinering-deepening-2026-07-02`
- Celle: `matsvinn-sirkulaer / biogass-bioraffinering`
- Kildepass: Brreg Enhetsregisteret navnesok paa `biogass`, `biogas`, `bioraffineri`, `bioenergi`, `biometan`, `biorest` og `biogjodsel`, med detaljoppslag for valgt org.nr., hentet 2026-07-02.
- Kandidater: 1 Brreg-aktiv juridisk enhet etter dedupe mot live DB Company/Actor-org.nr. og tidligere `mvk-biogass-bioraffinering-node-kandidater-2026-06-26.csv`.
- Utvalg: `HADELAND OG RINGERIKE BIORAFFINERI AS` (`937023715`) fordi Brreg bekrefter aktiv AS, navn med bioraffineri-signal og NACE `35.210 Produksjon av gass`. Raden lukker 19 -> 20 uten aa bruke holding-, eiendoms-, konsulent-, NUF/UTLA-, forening- eller avviklingsstoy.
- Importresultat: 1 ny aktør og 0 eksisterende aktører beriket.
- Dekningsendring etter import/audit: `biogass-bioraffinering` 19 -> 20/20 (gap 1 -> 0), `matsvinn-sirkulaer` 100 -> 101/120, og total domain-tagged dekning 1 632 -> 1 633/1 651. DB Actor-count er 1 554.

## Usikkerhet

Brreg bekrefter juridisk enhet, aktiv registerstatus, navn, NACE og adresse. Batchen laaser ikke substratgrunnlag, matavfallsandel, produksjonsvolum, faktisk driftsskala, biorest-/biogjodselretur, kommersiell levering, anleggstillatelser eller 2026-aktivitet utover registerstatus.

## Verifikasjon

- Kandidatlisten er avgrenset til én rad for aa lukke restgapet 19 -> 20 uten overfyll.
- `Hadeland og Ringerike Bioraffineri AS` hadde ingen live DB Company/Actor-treff paa org.nr. `937023715` foer import.
- `db:import:mvk-biogass-bioraffinering-deepening-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne. Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
