# Nordic price level method note

Dato: 2026-05-15  
Gap: B12  
Status: analyseklar metode for prisnivaa, ikke prisvekst

## Beslutning

For B12 brukes Eurostat price level index som hovedserie:

- dataset: `nordic-eurostat-food-price-levels-annual`
- lokal kilde: `research/data/nordic/prices/normalized/nordic-eurostat-food-price-levels-annual.csv`
- maaletall: `value`
- indikator: `PLI_EU27_2020`
- kategori: `A0101` / Food and non-alcoholic beverages
- frekvens: annual
- land: `DK`, `FI`, `IS`, `NO`, `SE`
- periode: 2015-2024

Ny analysetabell:

- `research/data/nordic/prices/ppp-price-panel-2026-05-15.csv`

## Hva serien kan brukes til

Serien kan brukes til:

- relativt prisnivaa mellom nordiske land
- utvikling i relativt prisnivaa mot EU27=100
- nordisk sammenligning av matprisnivaa som B12-gap

Serien skal ikke brukes til:

- maanedlig prisvekst
- husholdningenes totale matbelastning
- inflasjonsanalyse
- direkte sammenligning med HICP/KPI uten metodebro

## Skille mot HICP/KPI

`PLI_EU27_2020` viser relativt prisnivaa. HICP/KPI viser prisendring over tid innen en indeksfamilie.

Derfor skal disse datalagene holdes separat:

| Datatype | Bruk | Eksempel |
|---|---|---|
| PLI/PPP | relativt prisnivaa mellom land | B12 |
| HICP/KPI | prisvekst over tid | matinflasjon |
| budsjett-/inntektsdata | husholdningsbelastning | affordability |

## SSB som kontrollpunkt

B12-gapkortet viser SSB/Eurostat 2024-tall for `Food and non-alcoholic beverages`:

| Land | SSB/Eurostat 2024 |
|---|---:|
| Norge | 131,6 |
| Sverige | 105,8 |
| Danmark | 119,5 |
| Finland | 108,6 |
| Island | 148,0 |

Det lokale Eurostat-panelet gir litt andre 2024-verdier:

| Land | Lokal Eurostat PLI 2024 |
|---|---:|
| Danmark | 120,2 |
| Finland | 109,8 |
| Island | 143,9 |
| Norge | 131,2 |
| Sverige | 106,4 |

Begge kan brukes, men ikke som samme rad i samme serie uten forklaring. Anbefalt praksis:

- bruk lokal Eurostat PLI annual som hovedserie
- bruk SSB 2024 som kontrollpunkt/note
- ikke bland SSB 2024 inn i tidsserien

## Kvalitetsstatus

| Felt | Verdi |
|---|---|
| `evidence_status` | `primary_snapshot` |
| `method_status` | `official_statistical_extract` |
| `quality_flag` | `ok` |
| `comparability_flag` | `directly_comparable` |
| `promotion_status` | `promoted_analysis` |
| `allowed_surfaces` | `research+analysis+report` |
| `ki_usage_rule` | `cite_with_underlying_sources` |

## Neste handling

1. Oppdater B12-gapkortet til aa peke til metodenotat og panel.
2. Dersom data skal inn i UI, legg metodekort som skiller prisnivaa fra prisvekst.
3. Dersom data skal inn i KI-svar, legg locator/chunk for Eurostat/SSB-kilden i source-to-claim-ledger.
