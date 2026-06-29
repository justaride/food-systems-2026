# MVK review-kø resolusjon — 2026-06-26

Etterkontroll av flaggene fra den autonome MVK-kjøringen (PR #208). Hver post gjennomgått mot nodens faktiske rolle og mot Brreg.

## Endret

1. **`nibio` fjernet fra tre produsent-celler.** NIBIO er FoU-infrastruktur, ikke en produsent-populasjonsnode. Den var additivt tagget inn i `matsvinn-sirkulaer/insekt-alternativ-protein`, `innsatsfaktorer/froe-genressurser` og `innsatsfaktorer/biostimulanter-jordliv`. Fjernet de tre celle-taggene (DB + CSV-rader); NIBIO beholder sine basis-/`institusjon-finansiering`-tagger og plasseres riktig når `fou-institusjon/forskningsinstitutt` kjøres. Cellekorreksjon: insekt 6→5, frø-genressurser 13→12, biostimulanter 22→21.
2. **`pronofa` navn rettet** «Pronofa AS» → «Pronofa ASA» (Brreg: PRONOFA ASA, org.nr 926501836). CSV-ene hadde allerede ASA; kun DB-Actor-navnet var etterslepet.

## Dokumentert (verifisert, anbefalt videre)

3. **`greve-biogass` syntetisk org.nr.** Reelt org.nr er **912716635** (GREVE BIOGASS AS, aktiv per Brreg 2026-06-26). Den eksisterende `Company`-raden bruker en syntetisk org.nr. Anbefales rettet som en egen selskaps-data-fiks (rører selskaps-unik-nøkkel; utenfor en review-tidy).
4. **`ecoprot`** — ingen ren Brreg-match for «Ecoprot AS» (ECOPRO/ECOPROD/ECOPROS finnes, men ikke trygt treff). Agentens `unverified` var korrekt. Beholdt `unverified`; krever menneskelig identitetsavklaring før oppgradering.

## Gjennomgått og beholdt (forsvarlig som-er)

5. **8 regionale matsentraler uten eget org.nr** — `machine_verified` som nettverksnoder via Matsentralen Norges egen kontaktside (adresse + kontaktinfo). De har trolig ikke separate org.nr (del av Matsentralen-nettverket). Forsvarlig.
6. **`oslo-kommune-oslokompost`, `follo-ren-iks`, `norbark-as`** — kommunal/IKS-rolle og eierskaps-presisering; agentens flagg er korrekte men ikke feil. Lar stå til en evt. kommunal/offentlig-celle.

## Note

- `mvk-completeness-dashboard.md` sine overskrifts-tall er punkt-i-tid; `domene-profiles.json` er re-auditert og korrekt etter denne fiksen. Dashboardet regenereres ved neste Codex-økt.
