# FS04/09 — primærkildeavstemming for Nofima og Holdbart

Dato: 2026-09-09
Status: hashbundne rettingskandidater; ingen kanonisk skriving eller reviewbeslutning

## Nofima AS 2023

To originale rapporter fra [Nofimas offisielle rapportarkiv](https://nofima.no/om-oss/)
er bevart og kontrollert:

| Original | SHA-256 | Bytes | Lokator |
|---|---|---:|---|
| Årsmelding Nofima 2023 | `89927e7bd17e507387a9115f2ddcaa00927b0ca093e11a8e25c9235c5ed29d32` | 655 979 | fysisk PDF-side 11 / trykt SIDE 2, RESULTATREGNSKAP, kolonne 2023 |
| Årsmelding Nofima 2024 | `2fb619e87b32fff1c1b9b11322bd284556a7ac9918d46663967bdf1575cc6d4e` | 786 033 | fysisk PDF-side 11 / trykt SIDE 2, sammenligningskolonne 2023 |

Begge viser samme selskapsregnskap for Nofima AS, «Tall i hele tusen NOK»:

| Rad | 2023 | Enhet |
|---|---:|---|
| Sum driftsinntekter | 721 311 | tusen NOK |
| Driftsresultat | −5 928 | tusen NOK |

Den lagrede raden 725 / −18 MNOK stemmer dermed ikke med originalregnskapet.
Hashbundet tekstforslag: «Nofima AS hadde i 2023 driftsinntekter på 721,311 MNOK
og driftsresultat på −5,928 MNOK (selskapsregnskap; rapportert i hele tusen NOK).»
Dette er en kandidat, ikke en utført retting.

## Holdbart AS 2024

[Regnskapsregisterets historiske PDF-endepunkt](https://data.brreg.no/regnskapsregisteret/regnskap/aarsregnskap/kopi/815664582/2024)
leverte den originale 35-siders registerkopien for organisasjonsnummer 815 664 582.
PDF-en er 1 159 386 bytes og har SHA-256
`d2809eca25311ca2d2c291948c0b207d596c4613016a6034bb22aef6f26146f5`.
Registerets årsliste bekrefter at kopier finnes for 2015–2025.

Tre steder i 2024-kopien bekrefter selskapsomsetningen i NOK:

| Fysisk side | Lokator | 2024 |
|---:|---|---:|
| 2 | RESULTATREGNSKAP, «Sum inntekter» | 579 112 420 |
| 13 | Årsberetning 2024, omsetningssetningen | 579 112 420 |
| 16 | Digitalt forseglet resultatregnskap, «Sum driftsinntekter» | 579 112 420 |

Den gamle avrundingen 579 MNOK har dermed fått primærkildebelegg, men den bør
bevares med presis selskapsavgrensning og enhet. Driftsresultatet har et internt
avvik i samme offisielle PDF: registertabellen på fysisk side 2 viser 22 973 971
NOK, mens det digitalt forseglede vedlegget på fysisk side 16 viser 22 973 972
NOK. Kandidaten lar derfor eksakt driftsresultat stå uavklart. Et tekstforslag
skal synliggjøre 1-kronesavviket og må ikke fremstille én av radene som avgjort.

## Registerkildebeskyttelsen

PR #379-observasjonen kan ikke lenger reproduseres. I dagens
`scripts/import-brreg-financials.ts` godtar `isRegistrySourced()` både den direkte
Regnskapsregisteret-URL-en som `buildSourceString()` produserer og den eldre
prefiksformen. Eksisterende regresjonstest kaller helperne sammen og beskytter
denne kontrakten. Importskriptet ble derfor ikke endret i denne avstemmingen.

## Autoritetsgrense og neste beslutning

Originalbytes, ekstrakter, visuelle sider og kandidatmanifest ligger i det private
`project-completion-2026-09-09/financial-reconciliation`-området. Ingen database,
kanonisk kilde, verifiseringsstatus eller menneskelig reviewkvittering er endret.

Før eventuell kanonisk retting må en menneskelig reviewer godkjenne Nofima-raden,
og avgjøre hvordan Holdbarts 1-kronesavvik skal håndteres eller innhente en ny
offisiell forklaring/kopi.
