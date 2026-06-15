---
tittel: "Deep Research - P-FISH-2"
dato: "2026-06-13"
status: "Stoppsignal truffet - ikke lukket"
scope: "Metodebro Island-Norge basert på Strand et al. 2024. Leseoppgave uten websøk."
bruksregel: "Sammenligning holdes tilbake til Strand et al. 2024 foreligger lokalt og er side-/definisjonslest."
---

# Deep Research - P-FISH-2

## 0. Kort svar

P-FISH-2 kan ikke lukkes i denne kjøringen. Prompten krever lokal fulltekst av Strand et al. 2024 (`Resources, Environment and Sustainability` 16:100157) på denne stien:

`research/external/dro-0906/downloads/strand-etal-2024.pdf`

Den filen finnes ikke i repoet, og den forventede `downloads`-mappen under `research/external/dro-0906/` finnes heller ikke. Repo-nært søk etter `strand`, `100157`, `Resources, Environment and Sustainability`, `S2666*`, `Iceland` og PDF-kandidater fant ikke artikkelen. Flere generiske ScienceDirect-PDF-er i `research/pdf-downloads-20-04-26/` ble sjekket lokalt; de var andre artikler.

**Konklusjon:** Island-Norge-metodebroen holdes tilbake. Eksisterende SJA09114-CSV, SINTEF/FHF-uttak og DRR-1206-007 er nyttige støttefiler, men kan ikke erstatte Strand-artikkelen fordi P-FISH-2 eksplisitt skal vurdere definisjonene i den artikkelen.

## 1. Stoppsignal

| Krav i prompt | Funn | Konsekvens |
|---|---|---|
| Bruk lokal `research/external/dro-0906/downloads/strand-etal-2024.pdf` | Fil og mappe ikke funnet | Stoppsignal truffet |
| Ingen websøk | Overholdt | Ingen ekstern gjenhenting av artikkel i denne kjøringen |
| Definer `restråstoff`, `utnyttet`, `tilgjengelig` fra Strand et al. | Ikke mulig uten fulltekst | Definisjonstabell må stå åpen |
| Sammenlign mot SINTEF/FHF og Hagstofa SJA09114 | Ikke metodisk forsvarlig uten Strand-definisjonene | Sammenligning holdes tilbake |

## 2. Definisjonstabell

| begrep | artikkelens definisjon | SINTEF-ekvivalent | SJA09114-ekvivalent | kompatibel? |
|---|---|---|---|---|
| Restråstoff / side-stream / by-products | Ikke lest - Strand-PDF mangler | SINTEF/FHF skiller tilgjengelig, utnyttet og ikke utnyttet marint restråstoff i norsk fiskeri/havbruk | SJA09114 er registrerte biproduktlandinger/disponering etter art/type/verdi | Ikke vurdert |
| Utnyttet / utilised | Ikke lest - Strand-PDF mangler | SINTEF/FHF har utnyttet volum og sluttbrukskategorier | SJA09114 viser landede/disponerte biprodukter, ikke total utnyttelsesgrad | Ikke vurdert |
| Tilgjengelig / available | Ikke lest - Strand-PDF mangler | SINTEF/FHF har teoretisk/oppstått tilgjengelig restråstoff fra råstoffgrunnlag | SJA09114 har ikke samme denominator; det er ikke totalbiomasse | Ikke vurdert |
| Høyverdi / value tier | Ikke lest - Strand-PDF mangler | SINTEF/FHF viser sluttbruk, men høyverdiandel er bare delvis tallfestet | SJA09114 har verdi per biprodukt, ikke nødvendigvis anvendelse/value tier | Ikke vurdert |

## 3. Talltabell

| tall | verdi | enhet | år | geografi | kilde | locator | kan brukes i P-FISH-2 nå? |
|---|---:|---|---:|---|---|---|---|
| Registrerte biproduktlandinger, alle arter | 30 424 | tonn | 2024 | Island | Hagstofa SJA09114, lokalt uttak | `research/external/spor1-uttak-2026-06-12/uttak-01-statistics-iceland-sja09114.md` | Nei, ikke til metodebro uten Strand-definisjon |
| Verdi registrerte biproduktlandinger, alle arter | 7,26 | mrd. ISK | 2024 | Island | Hagstofa SJA09114, lokalt uttak | samme | Nei, bare støttepunkt |
| Torskandel av biproduktvolum | 43 | % | 2024 | Island | Hagstofa SJA09114, lokalt uttak | samme | Nei, bare støttepunkt |
| Tilgjengelig marint restråstoff | ca. 1,094 | mill. tonn | 2024 | Norge | SINTEF/FHF 2024 | `deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md`; SINTEF/FHF lokal kopi | Nei, ikke som Island-Norge metodebro alene |
| Utnyttet marint restråstoff | ca. 976 000 | tonn | 2024 | Norge | SINTEF/FHF 2024 | samme | Nei, ikke sammenlignbart mot SJA09114 uten Strand-metode |
| Ikke utnyttet marint restråstoff | ca. 118 000 | tonn | 2024 | Norge | SINTEF/FHF 2024 | samme | Nei |

## 4. Hva kan sies trygt nå?

Trygt internt, men ikke som P-FISH-2-metodebro:

1. Island har et lokalt SJA09114-uttrekk for registrerte biproduktlandinger/disponering etter art, type og verdi, med 2024 som siste år i uttaket.
2. Norge har en sterkere årlig SINTEF/FHF-baseline for tilgjengelig, utnyttet og ikke utnyttet marint restråstoff.
3. SJA09114 og SINTEF/FHF har ulike denominatorspråk: SJA09114 er registrerte biproduktlandinger/disponering, mens SINTEF/FHF er en tilgjengelighets-/anvendelsesanalyse for oppstått restråstoff.
4. Derfor er en direkte prosentvis Island-Norge-utnyttelsessammenligning ikke trygg uten Strand et al. eller en annen eksplisitt metodebro.

## 5. Ikke-si-liste

- Ikke si at Island og Norge kan sammenlignes direkte på utnyttelsesgrad basert på SJA09114 vs. SINTEF/FHF.
- Ikke si at SJA09114 viser total islandsk restråstoffutnyttelse. Den viser registrerte biproduktlandinger/disponering.
- Ikke si at Strand et al. 2024 støtter eller avviser sammenligningen før artikkelen er funnet og lest.
- Ikke bruk DRR-1206-007 som erstatning for P-FISH-2. Den er benchmark-/kildevalidering, ikke metodebroen prompten ber om.
- Ikke lås claim om "Island 90 %" eller "Norge vs. Island" med mindre denominator, artsscope, år og definisjon er eksplisitt kontrollert.

## 6. Claim-lock-forslag

Trygge formuleringer, gitt dagens stoppsignal:

1. "Island kan fortsatt brukes som designbenchmark for marint restråstoff, men direkte Island-Norge-utnyttelsessammenligning holdes tilbake til Strand et al. 2024 er lest mot SINTEF/FHF og Hagstofa SJA09114."
2. "Foreløpig har vi to ulike datatyper: Hagstofa SJA09114 for registrerte islandske biproduktlandinger/disponering og SINTEF/FHF for norsk tilgjengelig/anvendt restråstoff. Disse er ikke automatisk kompatible."

Hold tilbake:

1. "Island utnytter X % mot Norges Y %."
2. "Strand et al. dokumenterer at SINTEF/FHF og SJA09114 er kompatible."
3. "SJA09114 er islandsk parallell til SINTEF/FHF."

## 7. Neste handling

1. Finn eller hent fulltekst av Strand et al. 2024 og legg den på avtalt sti eller en ny dokumentert lokal sti.
2. Kjør P-FISH-2 på nytt med side-/tabell-locator for artikkelens definisjoner.
3. Først etter ny kjøring: vurder om eksisterende SJA09114-CSV og SINTEF/FHF 2024 kan kobles i en trygg definisjonstabell.
