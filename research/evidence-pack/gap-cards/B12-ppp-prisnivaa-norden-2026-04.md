# B12 - PPP og prisnivå: Norden

Status: initial evidence card, tallanker klart
Gap-ID: B12
Lane: hurtig-plukk
Dato: 2026-04-29

## Hva kan brukes nå

SSB/Eurostat-tabellen for 2024 gir et direkte nordisk prisnivåanker for "Food and non-alcoholic beverages", der EU27 = 100:

| Land | Food and non-alcoholic beverages, 2024 |
|---|---:|
| Norge | 131,6 |
| Sverige | 105,8 |
| Danmark | 119,5 |
| Finland | 108,6 |
| Island | 148,0 |

Dette er en tverrsnittsmåling av relativt prisnivå, ikke en månedlig prisvekstserie. Den må derfor ikke blandes direkte med HICP/KPI uten tydelig metodeforklaring.

## Kilder

- SSB, Comparison of price levels in Europe, StatBank table 14682: https://www.ssb.no/en/ppp
- Eurostat PPP metadata: https://ec.europa.eu/eurostat/cache/metadata/en/prc_ppp_esms.htm
- Lokal tidsserieflate for prisvekst: `research/data/nordic/core-series/`

## Må fortsatt tettes

- Skille tre nivåer i narrativet: relativt prisnivå/PPP, konsumprisindeks over tid og faktisk husholdningsbelastning.
- Koble til lokale `prices_*`-filer og forklare hvorfor de 660 lokale prisradene ikke er samme datakonsept som PPP-tabellen.

## Dypning 2026-04-29

Det finnes allerede en lokal 2015-2024-serie for Eurostat prisnivåindeks mat:

- `research/data/eurostat_price_level_indices_food_2015_2024.csv`
- `research/data/nordic/prices/normalized/nordic-eurostat-food-price-levels-annual.csv`
- Manifest-rad: `nordic-eurostat-food-price-levels-annual`, 50 rader, oppdatert 2025-07-10.

Endring i lokal Eurostat-serie, EU27 = 100:

| Land | 2015 | 2024 | Endring |
|---|---:|---:|---:|
| Danmark | 146,4 | 120,2 | -26,2 |
| Finland | 121,1 | 109,8 | -11,3 |
| Norge | 162,5 | 131,2 | -31,3 |
| Sverige | 126,0 | 106,4 | -19,6 |

SSB-tabellen for 2024 bruker en litt annen presentasjonsflate for `Food and non-alcoholic beverages` og gir Norge 131,6, Sverige 105,8, Danmark 119,5, Finland 108,6 og Island 148,0. Begge kan brukes, men må ikke blandes i samme tidsserie uten kilde-/kategori-note.

## Akseptansegate

Kortet kan oppgraderes til integrerbart når vi velger én av de to prisnivåflatene som hovedserie og legger SSB 2024 som kontrollpunkt eller note.
