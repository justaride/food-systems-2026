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
  - `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/ambio-fish-sludge-2017.md` (`U01`)
  - `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/estate-coop-union-2015.md` (`U03`)
  - `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/frontiers-phosphorus-flow-norway-2023.md` (`U04`)
  - `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/riksdagen-prop-2025-26-205.md` (`T07`)
  - `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/forskrift-2023-12-11-2037.md` (`U05`, `U06`)

Den reguleringsbaserte U05/U06-erstatningen gjelder
*Forskrift om forbud mot negative servitutter som begrenser etablering av
dagligvarevirksomhet* (`FOR-2023-12-11-2037`), ikke den feilaktig angitte
*Forskrift om endring i forskrift om administrative tollnedsettelser for
landbruksvarer*.

## Verifikasjon og negativ evidens

- `2026-08-31 is the verification-access date`; den betegner datoen da de
  lokale fangstene og nåværende offentlige locatorene ble kontrollert, ikke
  opprinnelig nedlastings- eller publiseringsdato.
- Råfilene finnes i en `separate primary checkout`; denne kvitteringen oppgir
  ikke en mer detaljert lokal sti.
- Metoden var `shasum -a 256` over hver av de seks eksakte råfilene. `all six files matched` manifestets verdier og den tidligere forhåndskontrollen.
- `repository tests verify declarations but do not read the external raw bytes`; råfilidentitet er derfor separat kontrollbevis, ikke en egenskap ved den reproduserbare testsuiten.
- Fokusert kontrakttest: `node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts`; resultat: PASS.
- `This final fix did not write to, delete, or modify any source capture`; påstanden gjelder denne fixens operasjoner. Den lesebaserte hashkontrollen attesterer byteidentitet på kontrolltidspunktet, ikke uforanderlighet utenfor det verifiserte intervallet.
- No publication or status promotion occurred.
- No database or corpus-health workflow occurred.
- No push, PR, merge, or deployment occurred.
