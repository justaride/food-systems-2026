# MVK mottakslogg: matsvinn-sirkulaer / insekt-alternativ-protein

Dato: 2026-06-26

## Kilder og metode

- Registreringspass: Brreg Enhetsregisteret API for org.nr/status + egne aktorsider der tilgjengelig.
- Fanout: maalrettet webpass via Invertapro, Norinsect, Pronofa/NTB, NIBIO MultiFuelLarve og BIO3.
- Dedup mot lokal KB: eksisterende Actor-slug truffet for `invertapro`, `norinsect`, `pronofa`, `ecoprot`, `bio3-norway` og `nibio`.
- Eksisterende Company-truffet for `INVERTAPRO AS`, `NORINSECT AS`, `PRONOFA ASA` og `BIO3 AS`.
- Kandidatfil: `research/_status/mvk-insekt-alternativ-protein-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-insekt-alternativ-protein-relasjoner-2026-06-26.json`.

## Importresultat

- Kandidatantall: 6 aktorer.
- Nye noder: 0.
- Eksisterende beriket: 6 (`invertapro`, `norinsect`, `pronofa`, `ecoprot`, `bio3-norway`, `nibio`).
- Relasjoner: 5.
- For import: `mapped_count=0`, `gap=20`.
- Etter import/reconcile: `mapped_count=6`, `gap=14`.

## Vakter

- Ingen kildelose kandidater importeres.
- `Ecoprot AS` settes `unverified` fordi NIBIO/Pronofa dokumenterer rolle, men Brreg-sok ikke gav et trygt aktivt org.nr-treff 2026-06-26.
- `NIBIO` tas med som FoU-/kunnskapsinfrastruktur for cellen, ikke som proteinprodusent.
- Norske org.nr validert mot Brreg API 2026-06-26: `917809755`, `916325010`, `926501836`, `915334504`, `988983837`.
