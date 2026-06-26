# Mottakslogg: innsatsfaktorer / biostimulanter-jordliv 2026-06-26

## Scope

- Celle: `innsatsfaktorer / biostimulanter-jordliv`.
- Kandidatfil: `research/_status/mvk-biostimulanter-jordliv-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-biostimulanter-jordliv-relasjoner-2026-06-26.json`.
- Guardrails: lokal DB-only, ingen schema-endring, ingen prod-import.

## Gather

- Kandidater: 22 aktorer med lokator.
- Kildetyper: egen-/primarkilder for NORGRO, LOG, Yara, Felleskjopet Agri, Kelpinor, Seafertil, Nordquist Ferment, Norsk Naturgjodsel, Bokashi Norge, Gronn Gjodsel, NORSOEK, NIBIO, Norsk Landbruksradgiving, VitalAnalyse, Eurofins Agro, Oekologisk Norge, Stiftelsen Norsk Mat og Norges Vel; offentlige/sekundaere kilder brukt for Agrinos Norway, Sunn Jord AS, Jordplan AS og Norsk Jordforening.
- Brreg-validert 2026-06-26: 22 org.nr. finnes som aktive eller identifiserte norske enheter i Brreg-oppslag; `vitalanalyse` og `norsk-jordforening` holdes som `unverified`/etterkontroll fordi rolle- og juridisk kobling er svakere enn for produktleverandorene.

## Importresultat

- Lokal import: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-biostimulanter-jordliv-2026-06-26`.
- Nye noder: 12 (`agrinos-norway-as`, `kelpinor-as`, `seafertil-as`, `nordquist-ferment-as`, `norsk-naturgjodsel-as`, `norsk-landbruksradgiving-sa`, `vitalanalyse`, `sunn-jord-as`, `eurofins-agro-testing-norway-as`, `jordplan-as`, `norsk-jordforening`, `norges-vel`).
- Eksisterende beriket/lenket: 10 (`norgro-as`, `log-as`, `yara-norge-as`, `felleskjopet-agri`, `bokashi-norge-as`, `gronn-gjodsel-as`, `norsok`, `nibio`, `okologisk-norge`, `stiftelsen-norsk-mat`); 2 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner importert: 6.
- Dekningsdelta: 0 -> 22 kartlagt; gap 20 -> 0. Cellen er mettet etter arbeidsanslaget.
- Cross-session dedup-audit: 22 datasettaktorer, alle `NO`; ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
