# MVK mottakslogg: innsatsfaktorer / froe-genressurser

Dato: 2026-06-26

## Kilder og metode

- Registreringspass: Brreg Enhetsregisteret API for org.nr/status + primarkilder fra aktorer/institusjoner.
- Fanout: maalrettet webpass via KVANN, NIBIO/Norsk genressurssenter/Landvik, NordGen/Seed Vault, Graminor, Sagaplant, Solhatt, Norsk Froavlerlag, NORGRO, Strand Unikorn, Felleskjopet, Midt-Norsk Blomsterengfro, LOG og La Humla Suse.
- Dedup mot lokal KB: eksisterende Actor-slug truffet for `kvann`, `nibio`, `nordgen`, `solhatt` og `felleskjopet-agri`.
- Eksisterende Company-truffet for `Felleskjopet Agri SA` og `Strand Unikorn AS`.
- Kandidatfil: `research/_status/mvk-froe-genressurser-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-froe-genressurser-relasjoner-2026-06-26.json`.

## Importresultat

- Kandidatantall: 14 aktorer/ordninger.
- Nye noder: 9 (`svalbard-global-seed-vault`, `graminor-as`, `sagaplant-as`, `norsk-froavlerlag`, `norgro-as`, `strand-unikorn-as`, `midt-norsk-blomsterengfro-ans`, `log-as`, `la-humla-suse`).
- Eksisterende beriket: 5 (`kvann`, `nibio`, `nordgen`, `solhatt`, `felleskjopet-agri`).
- Relasjoner importert: 4.
- For import: `mapped_count=0`, `gap=20`.
- Etter import/reconcile: `mapped_count=13`, `gap=7` for `innsatsfaktorer / froe-genressurser / NO`.
- Telleavvik: `NordGen` ble beriket, men eksisterende Actor har `country=Nordic` og teller derfor utenfor NO-raden i dekningsboka.
- Cross-session dedup-audit etter import: 14 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## Vakter

- Ingen kildelose kandidater importeres.
- `NordGen` og `Svalbard Global Seed Vault` tas med fordi de er direkte koblet til norsk froberedskap og Svalbard, men de er institusjons-/infrastrukturnoder heller enn norske selskaper.
- `LOG AS` og `La Humla Suse` flagges som distribusjons-/formidlingsledd, ikke som primar planteforedler eller genbank.
- `NIBIO` tas med som FoU-/forvaltningsinfrastruktur for genressurser og naturfro, ikke som kommersiell froleverandor alene.
- Norske org.nr validert mot Brreg API 2026-06-26: `917965137`, `988983837`, `967247359`, `993061158`, `913997832`, `984027761`, `960117883`, `916329717`, `911608103`, `971169486`, `983473997`, `912047652`.
