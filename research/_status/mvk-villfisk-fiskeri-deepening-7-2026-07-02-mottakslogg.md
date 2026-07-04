# Mottakslogg: MVK villfisk/fiskeri deepening pass 7 2026-07-02

- Dataset: `mvk-villfisk-fiskeri-deepening-7-2026-07-02`
- Celle: `primaerproduksjon / villfisk-fiskeri`
- Kilde: Brreg Enhetsregisteret API, NACE `03.110` (`Fiske og fangst i sjø`), sortert etter ansatte, med detaljoppslag per org.nr.
- Kandidater: 10 Brreg-rader.
- Utvalg: aktive AS/SA/ANS/DA med primær NACE `03.110` og direkte operativt signal i navn/formål/aktivitet (`fiske`, `fangst`, `fiskefartøy`, `kystfiske`, `havfiske`, `fiskerivirksomhet`, `kråkebollefangst` eller tilsvarende). Service-/rettighets-/kortsalgs-/elve-/oppdretts- og andre edge-caser droppes uten slikt signal.
- Dedupe: live DB `subdomene:villfisk-fiskeri` (140 aktører), tidligere villfisk-kandidatfiler (140 rader) og eksakt navn/org.nr. mot alle aktører for å unngå duplikat `country,name`.
- Filtertelling: 7 788 Brreg-rader tilgjengelig; 46 rader inspisert; 25 eksisterende/prior eller globalt dupliserte org.nr./navn droppet; 1 ikke-primær NACE-rad droppet; 20 kandidater var teknisk brukbare; de 10 sterkeste ble valgt for å lukke gjenværende gap uten å ta med service-only edge-caser.
- Importresultat: 10 nye aktører og 0 eksisterende aktører beriket.
- Dekningsendring etter import/audit: `villfisk-fiskeri` 140 -> 150/150 (gap 10 -> 0), `primaerproduksjon` 340 -> 350/350 og total domain-tagged dekning 1 609 -> 1 619/1 651. DB Actor-count er 1 553.

## Usikkerhet

Brreg bekrefter juridisk enhet, organisasjonsnummer, NACE og registertekst. Batchen låser ikke fartøy, kvote, landingsvolum, artssammensetning, fangstområde eller aktiv fiskeriaktivitet i inneværende år. Rader med investering, holding, service, utleie, administrasjon eller annen blandet rolle er markert med `middels` confidence og må reviewes før hard claim-lock.

## Verifikasjon

- Kandidatlisten er generert fra Brreg API 2026-07-02.
- CSV er deduplisert mot live DB, tidligere villfisk-kandidatfiler og globalt navn/org.nr.-fallback.
- `db:import:mvk-villfisk-fiskeri-deepening-7-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
