# MVK mottakslogg: matsvinn-sirkulaer / kompost-jordprodukt

Dato: 2026-06-26

## Kilder og metode

- Registreringspass: Brreg Enhetsregisteret API for org.nr/status + primarkilder fra aktorene.
- Fanout: maalrettet webpass via Gronn Vekst, Lindum/Norbark, Mjosanlegget, Oslo kommune/Oslokompost, Reve Kompost, Bokashi Norge og Follo Ren.
- Dedup mot lokal KB: eksisterende Actor-slug truffet for `lindum-as` og `mjosanlegget-as`.
- Eksisterende Company-truffet for `BOKASHI NORGE AS`.
- Kandidatfil: `research/_status/mvk-kompost-jordprodukt-node-kandidater-2026-06-26.csv`.
- Relasjonsfil: `research/_status/mvk-kompost-jordprodukt-relasjoner-2026-06-26.json`.

## Importresultat

- Kandidatantall: 8 aktorer/ordninger.
- Nye noder: 6 (`gronn-vekst-as`, `oslo-kommune-oslokompost`, `reve-kompost-as`, `bokashi-norge-as`, `follo-ren-iks`, `norbark-as`).
- Eksisterende beriket: 2 (`lindum-as`, `mjosanlegget-as`).
- Relasjoner: 3.
- For import: `mapped_count=0`, `gap=20`.
- Etter import/reconcile: `mapped_count=8`, `gap=12`.

## Vakter

- Ingen kildelose kandidater importeres.
- `Oslo kommune - Oslokompost` er en kommunal produkt-/etatrolle under Oslo kommune, ikke en selvstendig juridisk enhet.
- `Follo Ren IKS` er inkludert som bestiller-/distribusjonsledd for torvfri jord produsert av Gronn Vekst, ikke som produsent.
- `Norbark AS` er inkludert som jordproduktaktor og Lindum-operator; selskapets nyere org-/eierskapsstruktur flagges for manuell etterkontroll.
- Norske org.nr validert mot Brreg API 2026-06-26: `981711033`, `979618840`, `987916346`, `958935420`, `987739924`, `923456570`, `975804569`, `936074189`.
- Cross-session dedup-audit etter import: 8 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
