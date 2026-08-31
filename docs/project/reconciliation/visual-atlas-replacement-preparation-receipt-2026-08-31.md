# Kvittering for klargjøring av visual-atlas-erstatninger

**Dato:** 2026-08-31
**Omfang:** Kun intern, kandidatavgrenset forberedelse for `U01`, `U03`, `U04`, `T07`, `U05` og `U06`.

## Myndighetsgrense

Dette er en forberedelseskvittering, ikke rettighetsklarering, menneskelig
review, autoritetsforfremmelse eller publiseringsbeslutning. Alle seks
postene forblir `human_gate`, `publication_ready=false` og
`deletion_authorized=false` inntil en navngitt eier har gitt en separat
beslutning.

## Grunnlag og dekkning

- Baseline: `eb3e68cc5285f9c8f173b0f7fc1998f56691e55f`.
- Retention-matrix commit: `8f8886e8c63dc6cbfc8ffe95d45b8eef0cb25c69`.
- Manifest: `research/_status/visual-atlas-replacement-manifest-2026-08-31.json`.
- Erstatningsnotater:
  - `research/bibliotek/rettighetsavgrensede-kilder-2026-08-31/ambio-fish-sludge-2017.md` (`U01`)
  - `research/bibliotek/rettighetsavgrensede-kilder-2026-08-31/estate-coop-union-2015.md` (`U03`)
  - `research/bibliotek/rettighetsavgrensede-kilder-2026-08-31/frontiers-phosphorus-flow-norway-2023.md` (`U04`)
  - `research/bibliotek/rettighetsavgrensede-kilder-2026-08-31/riksdagen-prop-2025-26-205.md` (`T07`)
  - `research/bibliotek/rettighetsavgrensede-kilder-2026-08-31/forskrift-2023-12-11-2037.md` (`U05`, `U06`)

Den reguleringsbaserte U05/U06-erstatningen gjelder
*Forskrift om forbud mot negative servitutter som begrenser etablering av
dagligvarevirksomhet* (`FOR-2023-12-11-2037`), ikke en bompengeregulering.

## Verifikasjon og negativ evidens

- Fokusert kontrakttest: `node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts`; resultat: PASS.
- No source capture was deleted or modified.
- No publication or status promotion occurred.
- No database or corpus-health workflow occurred.
- No push, PR, merge, or deployment occurred.
