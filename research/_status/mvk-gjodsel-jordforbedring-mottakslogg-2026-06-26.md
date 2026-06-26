# Mottakslogg: innsatsfaktorer / gjodsel-jordforbedring 2026-06-26

## Scope

- Celle: `innsatsfaktorer / gjodsel-jordforbedring`.
- Kandidatfil: `research/_status/mvk-gjodsel-jordforbedring-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-gjodsel-jordforbedring-relasjoner-2026-06-26.json`.
- Guardrails: lokal DB-only, ingen schema-endring, ingen prod-import.

## Gather

- Kandidater: 22 aktorer med lokator.
- Kildetyper: egen-/primarkilder for Yara, Felleskjopet, FKRA, Norgesfor, Fiskaa, Strand Unikorn, LOG, NORGRO, Gronn Gjodsel, Gronn Vekst, Lindum, Mjosanlegget, Reve Kompost, Bokashi Norge, Norbark, Den Magiske Fabrikken, Greve Biogass, IVAR, Ecopro og Veas Marked; IVAR-styresak brukt for Minorga Vekst.
- Brreg-validert 2026-06-26: 22 aktive org.nr.

## Importresultat

- Lokal import: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-gjodsel-jordforbedring-2026-06-26`.
- Nye noder: 3 (`yara-norge-as`, `gronn-gjodsel-as`, `minorga-vekst-as`).
- Eksisterende beriket/lenket: 19 (`felleskjopet-agri`, `felleskjopet-rogaland-agder`, `norgesfor-as`, `fiskaa-molle-as`, `strand-unikorn-as`, `log-as`, `norgro-as`, `gronn-vekst-as`, `lindum-as`, `mjosanlegget-as`, `reve-kompost-as`, `bokashi-norge-as`, `norbark-as`, `den-magiske-fabrikken`, `greve-biogass`, `ivar-iks`, `ecopro-as`, `veas-as`, `veas-marked-as`).
- Relasjoner importert: 5.
- Dekningsdelta: 0 -> 22 kartlagt; gap 20 -> 0. Cellen er mettet etter arbeidsanslaget.
- Cross-session dedup-audit: 22 datasettaktorer, alle `NO`; ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
