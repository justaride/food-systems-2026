# Datavisualisering ChartFrame-migrasjon 2026-04-29

## Formål

Dette notatet lukker første Fase 0b-harvest fra `/forsyningskjede`: hvilke paneler som er flyttet til felles `ChartFrame`, hvilke som bevisst ikke er flyttet ennå, og hvilke komponenter som nå er felles kontrakt.

## Felles komponenter

Første felleslag:

- `src/components/visualization/ChartFrame.tsx`
- `src/components/visualization/SourceFootnote.tsx`
- `src/components/visualization/DataQualityStrip.tsx`
- `src/components/visualization/CoveragePanel.tsx`
- `src/lib/visualization/colors.ts`
- `src/lib/visualization/format.ts`
- `src/lib/visualization/coverage.ts`

`ChartFrame` krever `VisualizationDataContract` med spørsmål, enhet, periode, evidensstatus, kilder og eventuelt dekningsnotat.

## Migrert nå

| Flate | Status | Begrunnelse |
| --- | --- | --- |
| `/forsyningskjede` importproxy | Migrert til `ChartFrame` | Klart gjentatt mønster: spørsmål, enhet, periode, proxy-status og kildefot. |
| `/forsyningskjede` infrastruktur | Migrert til `ChartFrame` | Må bære tydelig `illustrative` status og dekningsnotat om GeoJSON vs prod-paritet. |
| `/forsyningskjede` returstrømmer | Migrert til `ChartFrame` | Må skille kuraterte case/gap fra komplett observert vareflyt. |
| `/forsyningskjede` toppstripe | Migrert til `DataQualityStrip` | Samme status/value/description-mønster som trengs på flere dashboardflater. |

## Ikke flyttet ennå

| Flate | Beholdes foreløpig | Hvorfor |
| --- | --- | --- |
| `Primærleveranser` og kjøperkonsentrasjon | Lokalt i `ForsyningskjedeContent.tsx` | Trenger først en tydeligere chart/table-kontrakt for observerte mengder og blandede enheter. |
| `SupplyChainQualityPanel` | Lokalt | Er en sammensatt auditflate, ikke ett chart. Bør eventuelt bruke `DataQualityStrip` senere. |
| `FeedCompositionTimeseries` | Egen chart-komponent | Har allerede intern kildefot, interaktiv Recharts-struktur og statusmerking. Kan flyttes når chart source-kontrakten er stabil. |
| `NutrientFlowsView` | Egen chart-komponent | Har egen landvelger og flere interne charts. Kan bruke `ChartFrame` senere, men krever props-basert datalast i stedet for klient-fetch. |

## Neste migrasjonskandidater

1. Flytt `FeedCompositionTimeseries` til `ChartFrame` når data fetch flyttes server-side eller komponenten får eksplisitt contract-prop.
2. Flytt `NutrientFlowsView` til `ChartFrame` etter samme mønster.
3. Vurder `CoveragePanel` for Gate C / prod-local-drift, ikke som generell pynt.
