# Forsyningskjede country pack: Sverige

Opprettet: 2026-04-29  
Status: god statistikkdekning og strukturelt komplett verdikjede; seafood-backfill, primærleveranser og relasjonsparitet trenger fortsatt primærsjekk.

## 1. Kilder og status

| Datalag | Status | Kommentar |
| --- | --- | --- |
| `value-chain.json` | 8/8 ledd | `seafood` backfilled fra lokal research; trenger primærsjekk |
| `DeliveryVolume` | Mangler | Ingen svensk ekvivalent i DB |
| `BusinessRelationship` | Tynn | 5 `SE -> SE`, 1 `SE -> FI` |
| `trade-groups` | Klar med forbehold | 66 annual, 792 monthly rows |
| `core-series` | Klar med forbehold | Pris, handel og produksjon finnes |
| `analysis-panel` | Klar | 411 harmoniserte rader |
| Geo-assets | Staging | Stores/municipalities finnes; infrastruktur må landmerkes |
| Circularity | Delvis | 3 SE-loops pluss nordiske fellescase |
| Nutrient flows | Delvis | Estimert modell med SE |

## 2. Verdikjedeledd

Dekning: 8/8.

Gjenstår:

- `seafood` er lagt inn fra lokal research og må primærsjekkes.
- Volumfelt mangler på alle eksisterende ledd.
- Wastefelt mangler på `primary`, `processing`, `distribution`, `retail`, `horeca`.

Neste handling:

- Primærsjekk seafood-ledd mot offisiell/import- og bransjekilde.
- Legg inn metode, confidence og eventuelle korrigerte volum-/handelsfelt.

## 3. Primærproduksjon

Status: mangler DB-ekvivalent.

Core-series produksjon:

- Havreproduksjon 622,5 tusen tonn i 2024.
- Sammenlignbar med NO/FI, men ikke komplett produksjonskurv.

Neste handling:

- Finne svensk kilde for produsent-/leveranse- eller produksjonsstrømmer.
- Hvis direkte leveransedata ikke finnes, definere proxy med tydelig metode.
- Bruk havre bare som smalt produksjonssubpanel til DK/IS har bedre proxy.

## 4. Sjømat og fôr

Status: backfilled, ikke primærvalidert.

Neste handling:

- Verifisere svensk seafood-ledd mot primærkilde.
- Skille import, prosessering og eventuell innenlandsk produksjon.

## 5. Foredling

Status: delvis.

Kandidater:

- Lantmännen
- Arla Sverige
- HKScan/Scan Sverige
- Orkla Sverige

Neste handling:

- Bygge foredlingsaktør-liste med 10-15 noder totalt på tvers av roller.

## 6. Distribusjon og logistikk

Status: kildejakt.

Kandidater:

- ICA logistics
- Axfood/Dagab
- Coop logistics
- Martin & Servera

Neste handling:

- Lage infrastruktur- og logistikk-kandidater med `source_ref`, `country`, `node_type`.

## 7. Dagligvare og foodservice

Status: aktørgrunnlag finnes, relasjoner må bygges.

Kandidater:

- ICA
- Axfood
- Coop Sverige
- Lidl Sverige
- Martin & Servera

Neste handling:

- Fylle review-kø med relasjoner før DB-import.

## 8. Import/eksport og sårbarhet

Status: klar med forbehold.

Eksisterende:

- 66 annual import rows.
- 792 monthly import rows.
- 264 trade rows i core-series.
- Første import-sårbarhetskort er skrevet i `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`.
- 2024-kort: største gruppe er fisk/sjømat (48,6 %), deretter frukt/grønt (16,5 %); største 2022-2024-endring er korn (+21,0 %).

Neste handling:

- Primærsjekk seafood-andelen og koble til seafood-backfill.

## 9. Matsvinn, sidestrømmer og retur

Status: delvis.

Eksisterende:

- 3 svenske circularity loops.
- Nutrient-flow modell inkluderer SE.

Neste handling:

- Minst 3 SE-spesifikke case cards.
- Skille nordiske fellescase fra svenske landcase.

## 10. Regulatorisk/styringsmessig ramme

Prioriter:

- Jordbruksverket
- Livsmedelsverket
- Konkurrensverket
- Matavfalls-/sirkularitetsregler

## 11. Nøkkelaktører og relasjoner

Kjent baseline:

- 15 Company-rader.
- 27 CountryMetric-rader.
- 10 relasjonsnoder.
- 6 relasjoner med svensk part.
- 6 nye review-kandidater seeded i `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv` med `needs_primary_check` og `hold`.

Neste handling:

- Utvid fra 6 til minst 20 relasjonskandidater i review.
- Minst 10 godkjente/importerte relasjoner før svensk graf regnes operativ.

## 12. Datagap og review-kø

Prioritert kø:

1. Primærsjekk seafood-ledd.
2. Svensk primærleveranse- eller produksjonsproxy.
3. Utvid relasjonskø fra 6 til 20 kandidater.
4. Infrastruktur med kilde og landfelt.
5. 8-12 claim cards.
