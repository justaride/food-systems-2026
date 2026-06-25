# Review-kø resolusjon — domene-kartlegging (2026-06-26)

Etterkontroll av de minor data-kvalitetsflaggene fra den autonome kjøringen (PR #205). Hver post er gjennomgått mot nodens faktiske beskrivelse/lokator.

## Endret

1. **`markedshage-vedervang-okologiske-utsalg` → reklassifisert** `regenerativ-praksis/market-gardening` → `lokale-verdikjeder/gaardsutsalg`. Beskrivelsen («sjølbetjent økologisk gårdsutsalg med egenprodusert og lokal mat») er et utsalg/butikk, ikke en market-garden. CSV + lokal DB + dekningsprofiler oppdatert (market-gardening 10→9, gaardsutsalg 0→1).
2. **`markedshage-gjoding-gard` ↔ `multistrata-gjoeding` kryssreferert.** Samme fysiske gård (Gjøding, Hurdal): den ene noden er gårdens markedshage/produksjon, den andre er EU-agroforestry-prosjektet som hostes der. Beholdt som to legitime fasetter; lagt `metadata.sameAs = multistrata-gjoeding` + note på markedshage-noden. Ikke en feilklassifisering — Gjøding *har* markedshage.

## Gjennomgått og beholdt (vurdert forsvarlig)

3. **`markedshage-botun-gardsbutikk`** — beholdt som market-gardening. Tross «Gardsbutikk» i navnet er det per beskrivelse «Økologisk Markedshage og Småbruk».
4. **`markedshage-grindal-gardsbutikk`, `markedshage-akersmak-huseby-gard`** — beholdt som market-gardening. Begge dyrker egne sesonggrønnsaker (Akersmak: «dyrker kortreiste sesonggrønnsaker»); grensetilfeller mot gårdsutsalg, men dyrkings-aspektet veier.
5. **`andelslandbruk-al-markedshage`** — beholdt under andelslandbruk. Hybrid «markedshage/andelslandbruk»; Økoguiden kategoriserer den som andelslandbruk, og CSA-aspektet er reelt.
6. **De 13 `machine_verified` andelslandbruk uten org.nr** — ingen org.nr finnes på radene (Brreg-sjekk ikke aktuell). `machine_verified` hviler på Økoguiden-registeroppføring, som er innenfor posturen. Ingen endring.

## REKO (uendret, allerede korrekt)

- De 14 REKO-ringene står som `unverified` + flagget (2022-liste, aktivitet må sjekkes ved en senere runde). Korrekt konservativ håndtering — ingen endring nå.
