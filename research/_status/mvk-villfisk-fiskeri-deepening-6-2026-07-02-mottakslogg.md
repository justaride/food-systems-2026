# Mottakslogg: MVK villfisk/fiskeri deepening pass 6 2026-07-02

- Dataset: `mvk-villfisk-fiskeri-deepening-6-2026-07-02`
- Celle: `primaerproduksjon / villfisk-fiskeri`
- Kilde: Brreg Enhetsregisteret API, NACE `03.110` (`Fiske og fangst i sjø`), sortert etter ansatte, med detaljoppslag per org.nr.
- Kandidater: 20 Brreg-rader.
- Utvalg: aktive AS/SA/ANS/DA med primær NACE `03.110` og direkte operativt signal i navn/formål/aktivitet (`fiske`, `fangst`, `fiskefartøy`, `kystfiske`, `havfiske`, `trål`, `line`, `not`, `garn` eller tilsvarende). Service-/rettighets-/kortsalgs-/elve-/oppdretts- og andre edge-caser droppes uten slikt signal.
- Dedupe: live DB `subdomene:villfisk-fiskeri` (120 aktører), tidligere villfisk-kandidatfiler (120 rader) og eksakt navn/org.nr. mot alle aktører for å unngå duplikat `country,name`.
- Filtertelling: 7 788 Brreg-rader tilgjengelig; 25 rader inspisert; 2 eksisterende villfisk-org.nr. droppet; 3 ikke-primær NACE droppet; 20 kandidater valgt; 1 kandidat (`the-qrill-company-as`) matchet eksisterende aktør og ble beriket heller enn nyopprettet.
- Importresultat: 19 nye aktører og 1 eksisterende aktør beriket.
- Dekningsendring etter import/audit: `villfisk-fiskeri` 120 -> 140/150 (gap 30 -> 10), `primaerproduksjon` 300 -> 320/350 og total domain-tagged dekning 1 473 -> 1 493/1 651. DB Actor-count er 1 439.

## Usikkerhet

Brreg bekrefter juridisk enhet, organisasjonsnummer, NACE og registertekst. Batchen låser ikke fartøy, kvote, landingsvolum, artssammensetning, fangstområde eller aktiv fiskeriaktivitet i inneværende år. Rader med investering, holding, service, utleie, administrasjon eller konsernrolle er markert med `middels` confidence og må reviewes før hard claim-lock.

## Verifikasjon

- Kandidatlisten er generert fra Brreg API 2026-07-02.
- CSV er deduplisert mot live DB, tidligere villfisk-kandidatfiler og globalt navn/org.nr.-fallback.
- `db:import:mvk-villfisk-fiskeri-deepening-6-2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run compute-metrics:full`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:domain-coverage -- --date=2026-07-02`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:audit`, `npm run audit:research-artifacts -- --base=origin/main`, `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`, `git diff --check`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run audit:citable`, `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:verify`, `npm run test`, `npm run lint` og `npm run build` er grønne.
- Build gir fortsatt kjent Next/Turbopack workspace-root warning og NFT trace warning via `next.config.ts` / `src/lib/hvitbok/loader.ts`.
