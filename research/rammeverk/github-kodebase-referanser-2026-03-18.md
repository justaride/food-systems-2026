# GitHub-kodebase-referanser — Food Systems 2026

**Dato:** 18. mars 2026

## Formål

Kort arbeidsnotat over GitHub-repos som kan være relevante referanser for videre utvikling av Food Systems 2026.

Søket ble gjort med prosjektets nåværende profil som utgangspunkt:

- forskningsarkiv og dokumentbibliotek
- aktør-, selskap- og dokumentgraf
- semantisk søk og vektorindeksering
- Leaflet/GeoJSON-baserte kart
- matsystem-, forsyningskjede- og dashboard-visualisering

## Hovedkonklusjon

Det finnes ikke én åpen kodebase på GitHub som matcher hele prosjektet. Den mest realistiske tilnærmingen er å hente mønstre fra flere referansespor:

- system map / knowledge graph
- supply chain viewer / fortellende logistikk-kart
- food data / åpen produktmodell
- geospatial dashboard / mattilgang og sårbarhet

## Høyest prioriterte referanser

### 1. `blw-ofag-ufag/system-map`

Link: <https://github.com/blw-ofag-ufag/system-map>

Hvorfor den er relevant:

- systemkart for sveitsisk agri-food-sektor
- kombinerer ontologi, knowledge graph, subgraphs og søk
- tett på Food Systems 2026 sin dokument-, aktør- og relasjonslogikk

Hva som bør inspiseres senere:

- modellering av noder, typer og relasjoner
- subgraph-navigasjon
- søkbar grafutforskning

### 2. `hock/Manifest`

Link: <https://github.com/hock/Manifest>

Hvorfor den er relevant:

- bygget som verktøy for forskere, journalister og studenter
- visualiserer supply chains, produksjonslinjer og handelsnettverk
- kombinerer geospatial visning med fortellende og analytisk bruk

Hva som bør inspiseres senere:

- hvordan nettverk og geografi kombineres i samme UI
- hvordan ufullstendige / fragmenterte kjeder representeres
- hvilke datafelter som støtter både analyse og historiefortelling

### 3. `CIAT-DAPA/food_system_web_dashboard`

Link: <https://github.com/CIAT-DAPA/food_system_web_dashboard>

Hvorfor den er relevant:

- konkret food-system-dashboard basert på en studie av matsystemet i Cali
- viser hvordan faglig analyse kan oversettes til offentlig dashboard
- domenemessig nærmere prosjektet enn generiske data dashboards

Hva som bør inspiseres senere:

- struktur for dashboard-sider
- kobling mellom grafer og underliggende datasett
- hvordan forskningsfunn presenteres for lesing, ikke bare analyse

### 4. `Lkruitwagen/global-fossil-fuel-supply-chain`

Link: <https://github.com/Lkruitwagen/global-fossil-fuel-supply-chain>

Hvorfor den er relevant:

- ikke matdomene, men metodisk svært nært
- bygger asset-level nettverk med geospatiale data, grafdatabase og flytberegning
- god referanse for videre arbeid med sårbarhet, flaskehalser og forsyningsflyt

Hva som bør inspiseres senere:

- pipeline for geospatial sammensetting
- flytmodellering og sjokkanalyse
- koblingen mellom rådata, nettverk og visualisering

### 5. `openfoodfacts/openfoodfacts-server`

Link: <https://github.com/openfoodfacts/openfoodfacts-server>

Hvorfor den er relevant:

- moden åpen matdatabase med produkt-, ingrediens- og labeldata
- god referanse for åpne matdata, API-er og datamodellering i skala
- viktig som inspirasjon hvis prosjektet senere skal kobles mot produkt- eller varestrømsdata

Hva som bør inspiseres senere:

- datamodell og API-struktur
- hvordan åpne matdata organiseres og eksponeres
- mulige integrasjonspunkter mot food product metadata

### 6. `openfoodfacts/openfoodfacts-explorer`

Link: <https://github.com/openfoodfacts/openfoodfacts-explorer>

Hvorfor den er relevant:

- frontend-orientert explorer for Open Food Facts
- relevant for browse/search/explorer-UX over store åpne datasett
- nyttig som kontrast til dagens mer prosjektinterne grensesnitt

Hva som bør inspiseres senere:

- utforskende navigasjon
- frontend-struktur for åpne food datasets
- filtrering og søkeopplevelse

## Taktiske referanser

### `tomickigrzegorz/react-leaflet-examples`

Link: <https://github.com/tomickigrzegorz/react-leaflet-examples>

Bruk:

- direkte implementasjonsreferanse for Leaflet-mønstre
- nyttig for lagkontroller, bounds, GeoJSON-interaksjoner og høy markørtetthet

### `zgebler/Mapping-Food-Deserts`

Link: <https://github.com/zgebler/Mapping-Food-Deserts>

Bruk:

- referanse for food-access / matørken-analyse
- relevant for metodikk rundt tilgang, shapefiles og modellering

### `sensein/brainkb-ui`

Link: <https://github.com/sensein/brainkb-ui>

Bruk:

- relevant som UX-referanse for knowledge base over graf/SPARQL-backend
- nyttig dersom Food Systems 2026 skal bli mer eksplisitt kunnskapsbase-orientert

### `panovp/FNS-Harmony`

Link: <https://github.com/panovp/FNS-Harmony>

Bruk:

- ontologi for food, nutrition og security
- relevant for fremtidig schema-/taksonomi- og interoperabilitetsarbeid

## Anbefalt neste steg når vi fortsetter

- klone og lese `system-map`, `Manifest` og `food_system_web_dashboard`
- sammenligne disse med vår egen modell for `Document`, `Company`, `Actor` og grafvisning
- hente konkrete mønstre for:
  - subgraph-utforskning
  - supply-chain-kart med fortellende lag
  - åpen dataset explorer-UX
  - ontologi/taksonomi for matrelaterte entiteter

## Notat

GitHub-søket ga en del støy og mange student-/kursprosjekter. Repoene over er filtrert ut som de mest plausible referansene for videre arbeid, enten strategisk eller taktisk.
