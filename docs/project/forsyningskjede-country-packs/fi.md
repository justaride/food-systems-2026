# Forsyningskjede country pack: Finland

Opprettet: 2026-04-29  
Status: god statistikkdekning og strukturelt komplett verdikjede; seafood-backfill, primærleveranser og relasjonsparitet trenger fortsatt primærsjekk.

## 1. Kilder og status

| Datalag | Status | Kommentar |
| --- | --- | --- |
| `value-chain.json` | 8/8 ledd | `seafood` backfilled fra lokal research; trenger primærsjekk |
| `DeliveryVolume` | Mangler | Ingen finsk ekvivalent i DB |
| `BusinessRelationship` | Tynn | 3 `FI -> FI`, 1 `SE -> FI` |
| `trade-groups` | Klar med forbehold | 60 annual, 720 monthly rows |
| `core-series` | Klar med forbehold | Pris, handel og produksjon finnes |
| `analysis-panel` | Klar | 387 harmoniserte rader |
| Geo-assets | Staging | Stores/municipalities finnes; infrastruktur må landmerkes |
| Circularity | Delvis | 1 FI-loop og 1 actor case |
| Nutrient flows | Delvis | Estimert modell med FI |

## 2. Verdikjedeledd

Dekning: 8/8.

Gjenstår:

- `seafood` er lagt inn fra lokal research og må primærsjekkes.
- Volumfelt mangler på de fleste ledd.
- Wastefelt mangler på `primary`, `processing`, `distribution`, `retail`, `horeca`.

Neste handling:

- Primærsjekk seafood-ledd mot offisiell/import- og bransjekilde.
- Fylle volum/wastefelt der offentlig statistikk finnes.

## 3. Primærproduksjon

Status: mangler DB-ekvivalent.

Core-series produksjon:

- Havreproduksjon 1 207,5 tusen tonn i 2024.
- Sammenlignbar med NO/SE, men ikke komplett produksjonskurv.

Neste handling:

- Finne finsk kilde for produsent-/leveranse- eller produksjonsstrømmer.
- Luke er sannsynlig første kilde for landbruk og matvarebalanse.
- Bruk havre bare som smalt produksjonssubpanel til DK/IS har bedre proxy.

## 4. Sjømat og fôr

Status: backfilled, ikke primærvalidert.

Neste handling:

- Verifisere finsk seafood-ledd mot primærkilde.
- Skille sjømat som import, produksjon og prosessering.
- Vurdere fôr/innsatsvarer for landbruk og food industry.

## 5. Foredling

Kandidater:

- Valio
- Atria
- HKScan
- Fazer
- Raisio

Neste handling:

- Bygg top-aktørregister og relasjonskandidater.

## 6. Distribusjon og logistikk

Kandidater:

- Kesko/K Group logistics
- S Group logistics
- Foodservice/grossistaktører

Neste handling:

- Normaliser infrastruktur og logistikkhubber med kilde.

## 7. Dagligvare og foodservice

Kandidater:

- K Group
- S Group
- Lidl Finland
- Kespro

Neste handling:

- Bygg relasjonskandidater for dagligvare og foodservice.

## 8. Import/eksport og sårbarhet

Status: klar med forbehold.

Eksisterende:

- 60 annual import rows.
- 720 monthly import rows.
- 240 trade rows i core-series.
- Første import-sårbarhetskort er skrevet i `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`.
- 2024-kort: største gruppe er frukt/grønt (31,0 %), deretter fisk/sjømat (22,2 %); største 2022-2024-endring er korn (-54,4 %).

Neste handling:

- Primærsjekk kornfallet og seafood-importen før ekstern bruk.

## 9. Matsvinn, sidestrømmer og retur

Status: delvis.

Eksisterende:

- 1 FI-loop.
- 1 actor case.
- Nutrient-flow modell inkluderer FI.

Neste handling:

- Minst 3 FI-spesifikke case cards.
- Knytt matsvinn og supply-chain collaboration fra forskningsgrunnlag til claim cards.

## 10. Regulatorisk/styringsmessig ramme

Prioriter:

- StatFin
- Luke
- Ruokavirasto
- Food Market Ombudsman
- Konkurranse og UTP-relaterte kilder

## 11. Nøkkelaktører og relasjoner

Kjent baseline:

- 7 Company-rader.
- 25 CountryMetric-rader.
- 5 relasjonsnoder.
- 4 relasjoner med finsk part.
- 6 nye review-kandidater seeded i `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv` med `needs_primary_check` og `hold`.

Neste handling:

- Utvid fra 6 til minst 20 relasjonskandidater i review.
- Minst 10 godkjente/importerte relasjoner før finsk graf regnes operativ.

## 12. Datagap og review-kø

Prioritert kø:

1. Primærsjekk seafood-ledd.
2. Finsk primærleveranse- eller produksjonsproxy.
3. Utvid relasjonskø fra 6 til 20 kandidater.
4. Infrastruktur med kilde og landfelt.
5. 8-12 claim cards.
