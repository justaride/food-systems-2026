# Verdikjede grafikk- og metrics-oppsett

Dato: 2026-04-29  
Branch: `feature/verdikjede-graphics-metrics-2026-04-29`  
Flater: `/verdikjede`, `/forsyningskjede`, `/sammenligning`, `/sirkularitet`, `/kart`

## Skill-funn

`find-skills` ble brukt med tre søk:

| Søk | Beste treff | Installs | Vurdering |
| --- | --- | ---: | --- |
| `data visualization` | `anthropics/knowledge-work-plugins@data-visualization` | 5.5K | Sterk ekstern kandidat hvis vi vil installere en generell dataviz-skill. |
| `metrics dashboard` | `phuryn/pm-skills@metrics-dashboard` | 594 | Under terskelen jeg normalt ville anbefalt som hovedvalg. |
| `d3 charts` | `davila7/claude-code-templates@d3-viz` | 360 | Svakere enn lokale skills; ikke anbefalt før behovet er mer spesifikt. |

Lokale skills som passer best uten ny installasjon:

- `business-intelligence`: metrics-definisjoner, dashboardstruktur og beslutningsuttak.
- `kpi-dashboard-design`: KPI-hierarki, terskler, kort og drilldown-logikk.
- `d3-viz`: custom Sankey, nettverk, flyt og eventuelle egne SVG-visninger.
- `frontend-design`: produksjonskvalitet på sideoppsett og kontrollflater.

Anbefaling: ikke installer ny ekstern skill nå. Den lokale kombinasjonen dekker arbeidet, og repoen har allerede Recharts, Nivo, React Force Graph og Leaflet.

## Dagens situasjon

`/verdikjede` var i hovedsak en tekstlig ledd-accordion fra `src/lib/data/verdikjede.ts`, beriket med DB-kobling fra `getVerdikjedeEnrichment()`, pluss `FeedCompositionTimeseries`.

`/forsyningskjede` har allerede mer operativ dataflate:

- relasjonsgraf fra `BusinessRelationship`
- primærleveranser fra `DeliveryVolume`
- datakvalitet og kandidatdata fra `getSupplyChainDataQuality()`
- value-chain-dekningspanel for `public/data/food-systems/{no,se,dk,fi,is}/value-chain.json`

Det logiske grepet er derfor å gjøre `/verdikjede` til den brede analytiske inngangen, mens `/forsyningskjede` forblir relasjons- og leveranseflaten.

## Implementert oppsett i denne branchen

Ny server-side oversikt:

- `getVerdikjedeOverview()` i `src/lib/queries/verdikjede.ts`
- Leser `value-chain.json` for Norge, Sverige, Danmark, Finland og Island
- Beregner:
  - mål-ledddekning
  - selvforsyning
  - kildereferanser
  - kjente waste-felt
  - volum-/waste-dekning per ledd
  - grafiske kandidatuttak med readiness

Ny `/verdikjede`-struktur:

- KPI-rad: nordisk dekning, selvforsyningssnitt, kildereferanser og kjent matsvinn
- Datadekning per land
- Leddsignaler per verdikjedeledd
- Matflyt/Sankey som første grafiske uttak
- Kandidatkort for import-sårbarhet, geografiske flaskehalser og returstrømmer

## Neste grafiske uttak

| Prioritet | Uttak | Datagrunnlag | Readiness | Hvor |
| --- | --- | --- | --- | --- |
| 1 | Sammenlignbar nordisk Sankey | `value-chain.json` | Klar med forbehold | `/verdikjede` |
| 2 | Import- og beredskapssårbarhet | `trade-groups`, `core-series`, selvforsyning | Klar med forbehold | `/verdikjede` + `/forsyningskjede` |
| 3 | Flaskehalskart | hubber, anlegg, havner, akvakultur | Staging | `/kart` + `/forsyningskjede` |
| 4 | Returstrømmer/sirkularitet | `circularity-loops.json`, `nutrient-flows.json`, waste-felt | Staging | `/sirkularitet` |
| 5 | Makt/margin per ledd | `Company`, eierskap, rapportregister, `BusinessRelationship` | Klar med forbehold | `/eierskap` + `/verdikjede` |

## Datakontrakt som bør stabiliseres

For hvert ledd i `value-chain.json` bør vi etter hvert skille tydelig mellom:

- `volume_tonnes`: fysisk volum gjennom leddet
- `import_tonnes` og `export_tonnes`: grensekryssende flyt
- `waste_tonnes` og `total_waste_tonnes`: leddsvinn vs total svinnnode
- `production_value_bn`, `value_added_bn`, `market_value_bn`: økonomiske verdier med eksplisitt valuta
- `sources`: primærkilder per felt, ikke bare per ledd
- `data_quality`: høy/middels/lav + notat

Viktig: økonomiske felt kan ikke summeres nordisk før valuta og definisjon er harmonisert. Dagens UI bruker derfor ikke en samlet økonomi-KPI.
