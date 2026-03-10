# Forskningsmateriale — Food Systems 2026

Migrert fra BroCode-prosjektet. Grunnlag for Transition Group-arbeid og whitepaper.

## norge/ — Norsk matsystem-analyse

| Fil | Innhold |
|---|---|
| `forsyningskjede.md` | Komplett verdikjedeanalyse: produksjon → grossist → detaljist. Tre-aktør-oligopol (NorgesGruppen 44%, Coop 29%, REMA 24%) |
| `markedskonsentrasjon.md` | Kvantitativ analyse: HHI ~3400, Zipf-fordeling, Gini 0.82. Feedback loops som opprettholder konsentrasjon |
| `pristransmisjon.md` | PPI vs KPI-analyse 2015–2025. Asymmetrisk pristransmisjon — produsent absorberer sjokk, forbrukerpris stiger monotont |
| `nordstad-tesen.md` | Infrastruktur som essential facility. Grossistleddet som flaskehals. Konkurranserettslig analyse |
| `nordstad-oppdatering.md` | 2025-oppdatering: Prisjeger-boten, Gaasland-rapporten, nye data |
| `regulatorisk-landskap.md` | Lov om god handelsskikk, EMV-regulering, Dagligvaretilsynet, konkurranseloven |
| `matsikkerhet-beredskap.md` | Riksrevisjonens kritikk, EFTA-forpliktelser, beredskapslager, forsyningssikkerhet |

## rammeverk/ — Analytiske rammeverk og teori

| Fil | Innhold |
|---|---|
| `systemteori-perspektiver.md` | Økologisk, nettverks- og TEK-perspektiver på matsystemet |
| `grand-unified-theory.md` | Filosofisk overbygning: kompleksitetsteori møter matsystemer |
| `metaforer-og-visualisering.md` | Konsepter for visuell kommunikasjon av systemdynamikk |
| `forskningsmasterliste.md` | Komplett forskningshistorikk — hypoteser, metoder, funn (v2) |
| `forskningsmasterliste-v1.md` | "Dark Matter"-arkiv: 73 hinge points, 5 forskningsområder (Maxwell's Demon, Macy, McLuhan, supernormale stimuli, enclosure) |
| `teori-ekstrapolering.md` | Strategi for teori-utvidelse: Bateson + Wolfram + Damer, Metacrisis, Ruliad, Architect→Gardener |
| `connections/` | 6-dels intellektuell kontekst-serie (se under) |

### connections/

| Fil | Innhold |
|---|---|
| `vol1-foundations.md` | Grunnleggende systemteori og matsystemhistorie |
| `vol2-deep-structure.md` | Dypstruktur i det norske matsystemet |
| `vol3-urbanism.md` | Urbanisme, geografi og matforsyning |
| `vol4-pattern-recognition.md` | Mønstergjenkjenning på tvers av systemer |
| `tidslinje.md` | Tidslinje over dypstrukturelle endringer |
| `cybersyn-mcnamara.md` | Case study: Cybersyn og McNamara — systemstyring |

## data/ — Kvantitative datasett

| Fil | Innhold |
|---|---|
| `prisindekser-2015-2025.csv` | Prisindekser (PPI/KPI) med 2020-base. Kjernedata for pristransmisjonsanalyse |
| `markedskonsentrasjon-resultater.json` | HHI, Zipf-eksponenter, Gini-koeffisienter. Beregnet fra markedsandelsdata |

## norden/ — Nordisk komparativ analyse

Tom — klar for neste arbeidsfase (dansk, svensk, finsk matsystemdata).

## brocode-bakgrunn/ — Prosjekthistorikk

| Fil | Innhold |
|---|---|
| `fase2-status.md` | BroCode Phase 2 implementeringsstatus per des. 2025 |
| `prosjektplan.md` | Komplett prosjektplan: hypotese → analyse → visualisering |
| `design-specs/charts-design.md` | Spec for 4 chart-typer (market share, comparison, store type, parent company) |
| `design-specs/choropleth-design.md` | Kartlag-arkitektur, fargeskalaer, tooltips, pre-computation |
| `design-specs/phase4-avansert-visualisering.md` | Master design: farm locations, ports, food deserts, animerte flows, vulnerability heatmap, Sankey, nettverksgraf |

## brocode-kart/ — Kartkomponenter og geodata (referanse)

Komplett kopi av BroCode food systems visualiseringsstack. **56 filer.** Referanse for eventuell re-implementering i Food Systems 2026.

### components/ — React-komponenter (Leaflet + Nivo + Recharts + Plotly)

| Kartlag | Fil |
|---|---|
| Hovedkart + choropleth | `FoodSystemsMap.tsx` |
| Gårder | `FarmLayer.tsx` |
| Foredlingsanlegg | `ProcessingPlantLayer.tsx` |
| Havner | `PortLayer.tsx` |
| Akvakultur (1782 sites) | `AquacultureLayer.tsx` |
| Matørkener (5km dekning) | `FoodDesertLayer.tsx` |
| Forsyningsflyter (animert) | `FlowLayer.tsx` |
| Sårbarhetskart | `VulnerabilityLayer.tsx` |
| Lagkontroller | `LayerControls.tsx` |
| Kommunepanel + søk | `MunicipalityPanel.tsx`, `MunicipalitySearch.tsx` |
| Matørken-panel | `FoodDesertPanel.tsx` |
| Sårbarhetspanel | `VulnerabilityPanel.tsx` |
| Choropleth-legende | `ChoroplethLegend.tsx` |

| Charts | Fil |
|---|---|
| Markedsandel (donut) | `charts/MarketShareChart.tsx` |
| Sammenligning (bar) | `charts/ComparisonChart.tsx` |
| Butikktype (pie) | `charts/StoreTypeChart.tsx` |
| Morselskap (donut) | `charts/ParentCompanyChart.tsx` |
| Lorenz/Gini | `charts/LorenzCurveChart.tsx` |
| Sankey (forsyningskjede) | `charts/FoodFlowSankey.tsx` |
| Marginer | `charts/MarginsChart.tsx` |
| Selvforsyning | `charts/SelfSufficiencyChart.tsx` |
| Zipf-fordeling | `charts/ZipfDistributionChart.tsx` |
| Kausaldiagram | `charts/CausalLoopDiagram.tsx` |
| Emergens | `charts/EmergenceVisualization.tsx` |

### data/ — Geodata og datasett

| Fil | Innhold |
|---|---|
| `norway-municipalities.geojson` | 356 kommunegrenser |
| `farms.geojson` | 50 gårder med produksjonstype |
| `processing_plants.geojson` | 30 foredlingsanlegg |
| `ports.geojson` | 25 havner |
| `aquaculture_sites.geojson` | 1782 reelle akvakultur-sites (Fiskeridirektoratet) |
| `logistics_hubs.geojson` | Logistikk-knutepunkter |
| `stores.json` | Dagligvarebutikker |
| `municipalities.json` | Kommunereferansedata |
| `raw_data/ssb_landbruk_2024.json` | SSB jordbruksstatistikk |
| `raw_data/financial_insights_2024.json` | Økonomiske data |
| `raw_data/trade_volumes_2024.json` | Handelsvolum |

### lib/ — Beregningslogikk

`types.ts`, `metrics.ts`, `pattern-analysis.ts`, `vulnerability.ts`, `flow-utils.ts`, `desert-analysis.ts`, `insights-types.ts`
