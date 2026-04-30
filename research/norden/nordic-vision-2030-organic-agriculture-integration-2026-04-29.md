# Nordic Vision 2030: økologisk jordbruksareal integrasjon

**Dato:** 2026-04-29  
**Status:** Runtime-integrert datapakke  
**Vision-indikator:** `1.4.2` Organic agricultural land share  
**Runtime target:** `CountryMetric.organicAgriculture`

## Hva er gjort

Økologisk jordbruksareal er løftet fra lokal core-series til runtime-metrikk.

Kildefil:

- `research/data/nordic/core-series/organic_agriculture_annual.csv`
- `research/data/nordic/core-series/organic_agriculture_annual.meta.json`

DB/static:

- `src/lib/data/sustainability-country-metrics.ts`
- `CountryMetric` med `metricType = organicAgriculture`

## Importert til CountryMetric

| Land | År | Areal ha | Andel UAA | Status |
|---|---:|---:|---:|---|
| DK | 2023 | 298939 | 11.41% | Eurostat primary API |
| FI | 2023 | 306348 | 13.52% | Eurostat primary API, definition-diff flag |
| NO | 2023 | 45870 | 4.66% | Eurostat primary API |
| SE | 2023 | 549941 | 18.44% | Eurostat primary API |
| FI | 2024 | 304551 | 13.49% | Latest partial; FI/SE only |
| SE | 2024 | 495568 | 16.66% | Latest partial; FI/SE only |

Det gir 12 `CountryMetric`-rader: `organicAreaHa` og `organicShareUaaPct` per land/år.

## Ikke importert

Island-raden i CSV-en er beholdt som lokal analyseindikasjon, men ikke importert til `CountryMetric`.

| Land | År | Areal ha | Andel UAA | Hvorfor ikke importert |
|---|---:|---:|---:|---|
| IS | 2023 | 6400 | 0.4% | `needs_primary_check`; Eurostat-uttrekket ga ingen Island-verdi i kontrollerte 2022-2024-uttrekk |

## Bruk

Dette er den første konkrete Vision 2030-indikatoren i denne runden som nå er både:

- mappet mot NMRs indikatorramme
- kildebundet til lokal core-series
- lagt inn som runtime-data i `CountryMetric`

Den bør brukes som baseline for Life on land / bærekraftig jordbruk i intern brief. For ekstern bruk bør Finland-flagget og Island-gapet vises eksplisitt.

## Neste steg

1. Finn primærkilde for Island eller marker Island som manglende i sammenligningen.
2. Bygg biodiversitetsproxy for jordbruk hvis Life on land-sporet skal utvides.
3. Vurder om 2024 FI/SE skal vises som foreløpig oppdatering eller holdes utenfor sammenlignbar nordisk baseline.
