# MVK mottakslogg: innsatsfaktorer / for-protein

Dato: 2026-06-26

## Kilder og metode

- Registreringspass: Brreg Enhetsregisteret API for org.nr/status + primarkilder fra aktorer/institusjoner.
- Fanout: maalrettet webpass via Felleskjopet/FKRA, Norgesfor, Fiskaa Molle, Strand Unikorn, Denofa, Skretting, Mowi Feed, Cargill/EWOS, BioMar, Aller Aqua, Vestkorn, Pelagia, Zooca/Calanus, QRILL, Norilia, Invertapro, Pronofa, BIO3, Nofima, Foods of Norway og Arctic Feed.
- Dedup mot lokal KB: eksisterende Actor-slug truffet for `felleskjopet-agri`, `strand-unikorn-as`, `denofa`, `skretting`, `mowi-feed`, `cargill-aqua-nutrition`, `invertapro`, `pronofa`, `bio3-norway` og `nofima`.
- Eksisterende Company-truffet for `Felleskjopet Agri SA`, `Felleskjopet Rogaland Agder SA`, `Norgesfor AS`, `Fiskaa Molle AS`, `Strand Unikorn AS`, `Denofa AS`, `Skretting AS`, `Mowi Feed AS`, `Cargill Inc NUF`, `BioMar AS`, `Norilia AS`, `Invertapro AS`, `Pronofa ASA`, `BIO3 AS` og `Nofima AS`.
- Kandidatfil: `research/_status/mvk-for-protein-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-for-protein-relasjoner-2026-06-26.json`.

## Importresultat

- Kandidatantall: 22 aktorer/prosjekt.
- Nye noder: 12 (`felleskjopet-rogaland-agder`, `norgesfor-as`, `fiskaa-molle-as`, `biomar-as`, `aller-aqua-norway-as`, `vestkorn-milling-as`, `pelagia-as`, `calanus-as`, `the-qrill-company-as`, `norilia-as`, `foods-of-norway`, `arctic-feed-ingredients-as`).
- Eksisterende beriket: 10 (`felleskjopet-agri`, `strand-unikorn-as`, `denofa`, `skretting`, `mowi-feed`, `cargill-aqua-nutrition`, `invertapro`, `pronofa`, `bio3-norway`, `nofima`).
- Relasjoner importert: 0 i denne passeringen; bare `companyId`-lenking der lokal Company finnes.
- For import: `mapped_count=0`, `gap=20`.
- Etter import/reconcile: `mapped_count=21`, `gap=0` for `innsatsfaktorer / for-protein / NO`.
- Telleavvik: `Cargill Aqua Nutrition / EWOS` ble beriket og lenket til lokal `Cargill Inc` Company, men eksisterende Actor har `country=US` og teller derfor utenfor NO-raden i dekningsboka.
- Cross-session dedup-audit etter import: 22 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## Vakter

- Ingen kildelose kandidater importeres.
- `Cargill Aqua Nutrition / EWOS` flagges fordi eksisterende Actor har `country=US`; norsk NUF/org.nr og norsk aktivitet er Brreg-/egenkilde-validert, men NO-coverage kan telle den utenfor NO-raden.
- `Aller Aqua Norway AS` flagges fordi norsk rolle i kandidatdata er import-/salgsledd, mens produksjonen av okologisk for beskrives paa konsernsiden.
- `Norilia AS`, `Nofima AS` og `Foods of Norway` flagges fordi de er ingrediens-/FoU-/prosjektroller heller enn klassiske kraftforprodusenter.
- Norske org.nr validert mot Brreg API 2026-06-26: `911608103`, `915442552`, `975871096`, `975856844`, `916329717`, `987643935`, `988044113`, `911610744`, `916635001`, `937843860`, `994046055`, `994423592`, `989094823`, `984468970`, `988354139`, `995643316`, `917809755`, `926501836`, `915334504`, `989278835`, `913170539`.
