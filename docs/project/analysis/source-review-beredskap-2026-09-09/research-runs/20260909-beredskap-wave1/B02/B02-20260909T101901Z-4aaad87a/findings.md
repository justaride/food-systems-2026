# B02 findings — Manitoba bulk 160585

- programRunId: `20260909-beredskap-wave1`
- packageId: `B02`
- runId: `B02-20260909T101901Z-4aaad87a`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- terminalStatus: `waiting_owner`
- human_verified: false
- asOf: 2026-09-09T10:25:10Z

## Scope

Only Swedish bulk SKU **160585** (Bagarns Manitoba). Bag SKU **142052** and other Nord Mills products are identity controls only. No functional equivalence from product name, ingredients or nutrition declaration (package stop rule).

## Question 1 — Finnes datert revisjon og full spesifikasjon for 160585?

**Answer (precise stop): Nei, ikke i autoriserte offentlige/frosne kanaler gjennomgått her.**

Kjent:
- Live/frossen produktside R6-S02 identifiserer Art no **160585**, Vikt **Bulk**, EAN **7310130013386**, hvete + askorbinsyre, næringsdeklarasjon (protein **12 g/100 g**). Ingen deklarert revisjon eller gyldig-fra/til.
- HT2026-katalog R6-S10 har produkt rad for Bagarns Manitoba med både 10 kg 142052 og bulk 160585, Malmö.
- Katalogfooter peker til nordmills.se for «aktuella specifikationer och certifikat»; offentlig landing etter redirect viser ikke datert 160585-bulkspesifikasjon/COA.
- B02 live re-fetch: ekstrahert produkttekst-SHA256 er **identisk** med frossen R6-S02-tekst (`2b597255…`), selv om rå-HTML-bytes avviker.
- R6-G03-inntak er **ubesvart** (`sent: false`, alle felt `null`).

Ukjent / stopp:
- Datert revisjons-ID, gyldighetsperiode, bakeparametre min/maks, metoder, fuktbasis, allergen-/mattrygghetsspesifikasjon og partibevis.
- Eventuelle private kundeportal-dokumenter er ikke åpnet (ingen innlogging/omgåelse).

Neste steg: autorisert dataeierinntak til Cerealia Sverige produkt-/laboratorieansvarlig for R6-G03-feltene. Ingen e-post fra denne pakken.

## Question 2 — Er målemetoder og fuktbasis sammenlignbare med Q1 og Regal?

**Answer (precise stop): Kan ikke etableres.**

Kjent:
- SE offentlige kilder oppgir ikke metode-ID, nitrogenfaktor, falltallmetode, askebasis, partikkelmetode eller fuktbasis for 160585.
- `q1-comparison.json` har `allAcceptanceLimitsUnknown: true` og `SE_batchResult: null` for bakeparametre.
- Stoppregel forbyr slutning om funksjonell likeverdighet fra produktnavn/ingredienser/næringsdeklarasjon (protein 12 g vs Regal 13 g er deklarasjonspunkter, ikke metode-sammenligning).

Ukjent:
- SE laboratoriemetoder og fuktbasis; Q1 mottakergrenser/metoder (B03 / R6-G04); Regal 160105 metoder (B01 / R6-G02).

Grenseflate: samordne med B03 (og B01) etter at eierdokumenter finnes; ingen gjensidig venting i denne leveransen.

## Question 3 — Gjelder katalogens 12 måneders holdbarhet faktisk bulk, og under hvilke lagringsvilkår?

**Answer (precise stop): Uavklart for bulk.**

Kjent:
- R6-S10 raden oppgir `Hållbarhetstid: 12 mån` på **delt** rad for 142052 sekk og 160585 bulk.
- Generell katalogtekst: leveranse skal normalt ha minst 50 % restholdbarhet.
- Ingen °C / RH% / bulkspesifikke lagringsvilkår i den bundne raden.

Ukjent:
- Om 12 måneder gjelder bulk alene; lagringstemperatur/fukt; restholdbarhet for konkret parti.

## Owned gap disposition

| gapId | disposition | semanticGapClosed |
|---|---|---|
| R6-G03 | remains_open_waiting_owner | false |
| B02-20260909T101901Z-4aaad87a-G01 | new_subgap_open_waiting_owner | false |
| B02-20260909T101901Z-4aaad87a-G02 | new_subgap_open_waiting_owner_and_coordination | false |
| B02-20260909T101901Z-4aaad87a-G03 | new_subgap_open_waiting_owner | false |

No automatic gap closure. No candidate_resolution_proposed (exact operative specification evidence absent).

## Limitations and contradictions

- Public negative finding ≠ proof that a private specification does not exist.
- Live raw HTML ≠ frozen raw HTML for R6-S02 URL; product text hash matched — treat raw hashes as distinct versions.
- Catalog marketing language vs signed specification: catalog explicitly reserves right to change specifications.
- No contacts, emails, publishing, plan/round mutation, or human_verified authority claims.

## Coordination notes

- B03: Q1 acceptance methods/limits needed before method comparability can be completed.
- B05: Malmö allocation/COA batches are separate from this quality-specification package; no SE allocation inferred here.
