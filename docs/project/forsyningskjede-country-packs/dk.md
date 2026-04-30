# Forsyningskjede country pack: Danmark

Opprettet: 2026-04-29  
Status: god handels- og sirkularitetsdekning og strukturelt komplett verdikjede; produksjonsminimumskurv har primærsnapshot, mens metodeimport, seafood-backfill og relasjonsparitet fortsatt trenger arbeid.

## 1. Kilder og status

| Datalag | Status | Kommentar |
| --- | --- | --- |
| `value-chain.json` | 8/8 ledd | `seafood` backfilled fra lokal research; trenger primærsjekk |
| `DeliveryVolume` | Mangler | Ingen dansk ekvivalent i DB |
| `BusinessRelationship` | Tynn | 3 `DK -> DK`, 2 `NO -> DK` |
| `trade-groups` | Klar med forbehold | 30 annual, 294 monthly rows |
| `core-series` | Delvis | Pris og handel finnes; produksjon bare 3 rader |
| `analysis-panel` | Klar | 233 harmoniserte rader |
| Geo-assets | Staging | Stores/municipalities finnes; infrastruktur må landmerkes |
| Circularity | Delvis | 3 DK-loops og 2 actor cases |
| Nutrient flows | Delvis | Estimert modell med DK |

## 2. Verdikjedeledd

Dekning: 8/8.

Gjenstår:

- `seafood` er lagt inn fra lokal research og må primærsjekkes.
- Volum mangler på `processing`, `distribution`, `retail`, `horeca`, `household`, `waste`.
- Waste mangler på `primary`, `processing`, `distribution`, `retail`, `horeca`.

Neste handling:

- Primærsjekk seafood-ledd mot offisiell/import- og bransjekilde.
- Fylle sentrale volum-/wastefelt med kilde eller proxymerking.

## 3. Primærproduksjon

Status: mangler DB-ekvivalent.

Core-series produksjon:

- Nåværende produksjonsserie er `cereals_output_value`, 11 534 mill. DKK i 2024.
- Dette er verdi-fallback i løpende priser, ikke direkte sammenlignbart med NO/SE/FI havrevolum.
- Proxy-kandidater er lagt i `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`: korn totalt, H170, melk, svin, poteter, landinger fra danske fartøy og akvakultur.
- Primærsnapshot fra StatBank HST77 bekrefter korn totalt 2024: 7,5846 mill. tonn.
- Samme StatBank-tabell bekrefter H170 2024: 274 300 tonn `Oats, mixed grains and other grains`. Dette er en havre-proxy med metodeforbehold, ikke ren havre.
- Øvrige 2024-snapshots: melk fra gård 5 767,6 mill. kg, svinproduksjon 1 726 600 tonn, poteter HST77 samlet 2 997 600 tonn, landinger fra danske fartøy 467 478,631 tonn og akvakultur 46 405 tonn.

Neste handling:

- Finne dansk datakilde for produksjons-/leveranseflyt.
- Vurdere StatBank som primærkilde for produksjons- og verdistrømmer.
- Avgjøre om H170-proxyen kan brukes i en caveated sammenstilling med NO/SE/FI havresubpanelet.
- Låse metode for DK minimumskurv før eventuell import til core-series.
- Beholde potet- og landingsforbeholdene synlige: poteter inkluderer både settepoteter, mel og konsum; FISK2 er landinger fra danske fartøy.

## 4. Sjømat og fôr

Status: backfilled, ikke primærvalidert.

Neste handling:

- Verifisere dansk seafood-ledd mot primærkilde.
- Skille fiskeri, akvakultur, import og foredling.

## 5. Foredling

Kandidater:

- Danish Crown
- Arla
- DLG
- Carlsberg/food-adjacent sidestreams
- Orkla Danmark

Neste handling:

- Bygg foredlings- og landbrukskooperativ-kandidater for review.

## 6. Distribusjon og logistikk

Kandidater:

- Salling Group logistics
- Coop Danmark
- Dagrofa
- DSV/DFDS der relevant

Neste handling:

- Normaliser danske logistikk- og grossistnoder.

## 7. Dagligvare og foodservice

Kandidater:

- Salling Group
- Coop Danmark
- Dagrofa
- Rema 1000 Danmark

Neste handling:

- Bygg relasjonskandidater for dagligvare, grossist og foredling.

## 8. Import/eksport og sårbarhet

Status: klar med forbehold.

Eksisterende:

- 30 annual import rows.
- 294 monthly import rows.
- 98 trade rows i core-series.
- Første import-sårbarhetskort er skrevet i `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`.
- 2024-kort: største gruppe er fisk/sjømat (30,7 %), deretter frukt/grønt (20,8 %); største 2022-2024-endring er fett/oljer (-15,5 %).

Neste handling:

- Primærsjekk seafood-hub/re-eksporttolkning før ekstern bruk.
- Vurdere om lavere trade-row count skyldes periode/source eller normaliseringsgap.

## 9. Matsvinn, sidestrømmer og retur

Status: relativt sterk.

Eksisterende:

- Biogass, Kalundborg og actor cases finnes i circularity-filen.
- Nutrient-flow modell inkluderer DK.

Neste handling:

- Lage 3-5 DK case cards med case/volum/policy adskilt.

## 10. Regulatorisk/styringsmessig ramme

Prioriter:

- Danmarks Statistik / StatBank
- Fødevarestyrelsen
- Konkurrence- og Forbrugerstyrelsen
- Matsvinn, biogass, gjødsel og landbruksregulering

## 11. Nøkkelaktører og relasjoner

Kjent baseline:

- 6 Company-rader.
- 29 CountryMetric-rader.
- 6 relasjonsnoder.
- 5 relasjoner med dansk part.
- 6 nye review-kandidater seeded i `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv` med `needs_primary_check` og `hold`.

Neste handling:

- Utvid fra 6 til minst 20 relasjonskandidater i review.
- Minst 10 godkjente/importerte relasjoner før dansk graf regnes operativ.

## 12. Datagap og review-kø

Prioritert kø:

1. Primærsjekk seafood-ledd.
2. Bedre produksjonsserie-dekning.
3. Utvid relasjonskø fra 6 til 20 kandidater.
4. Infrastruktur med kilde og landfelt.
5. 8-12 claim cards.
