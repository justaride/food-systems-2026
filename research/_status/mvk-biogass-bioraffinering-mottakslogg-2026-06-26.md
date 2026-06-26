# MVK mottakslogg: matsvinn-sirkulaer / biogass-bioraffinering

Dato: 2026-06-26

## Kilder og metode

- Registreringspass: Brreg Enhetsregisteret API for org.nr/status + primaere aktorsider der tilgjengelig.
- Fanout: maalrettet webpass via Biogass Norge/Standard Norge-bransjelister, aktorsider og offentlige anleggssider.
- Dedup mot lokal KB: eksisterende Actor-slug truffet for `biogass-norge`, `st1-biokraft`, `greve-biogass` og `ivar-iks`; eksisterende Company-truffet for `ST1 BIOKRAFT AS`.
- Kandidatfil: `research/_status/mvk-biogass-bioraffinering-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-biogass-bioraffinering-relasjoner-2026-06-26.json`.

## Importresultat

- Kandidatantall: 19 aktorer.
- Nye noder: 15.
- Eksisterende beriket: 4 (`biogass-norge`, `st1-biokraft`, `greve-biogass`, `ivar-iks`).
- Relasjoner: 3.
- For import: `mapped_count=0`, `gap=20`.
- Etter import/reconcile: `mapped_count=19`, `gap=1`.

## Vakter

- Ingen kildelose kandidater importeres.
- `Renevo AS` og `Vireo AS` er satt `unverified` fordi rollebelegget i denne passeringen er fra bransje-/leverandorkilde, selv om org.nr er Brreg-validert.
- Alle org.nr i kandidatfilen er validert mot Brreg API 2026-06-26.
