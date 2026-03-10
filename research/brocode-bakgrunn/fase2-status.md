# Food Systems Norway - Phase 2/3/4/5 Status

_Last updated: 2025-12-31_

## Summary

| Phase    | Status      | Description                                              |
| -------- | ----------- | -------------------------------------------------------- |
| Phase 1  | ✅ Complete | Base map, stores, municipalities, filters                |
| Phase 2  | ✅ Complete | Charts, choropleths, demographics, insights, narrative   |
| Phase 3  | ✅ Complete | Systems thinking patterns (Zipf, Lorenz, feedback loops) |
| Phase 4A | ✅ Complete | Infrastructure: logistics hubs, search, dashboard        |
| Phase 4B | 🔲 Pending  | Data expansion: farms, processing, ports                 |
| Phase 5  | ✅ Complete | Search, comparison mode, Mermaid diagrams                |
| Phase 6  | 🔲 Pending  | Food deserts, data export, advanced analysis             |

### Git Status (as of 2025-12-31)

**Branch:** `chore/frontend-optimization-sweep`

**Latest commit:** `11fe2fc` - feat: implement comprehensive Food Systems improvements

**All Phase 4A/5 work committed:** 30 files changed, 7033 insertions, 7633 deletions

---

## Completed Features

### Narrative Section (2025-12-30)

Research-backed analysis section connecting our data to academic research.

**Themes covered (from Nordic White Paper 2024):**

- **Power Imbalances** (Intervention Area 9) - Market concentration, retailer dominance
- **Self-Sufficiency & Food Sovereignty** (Intervention Area 11) - Production independence
- **Blue Economy** (Intervention Area 10) - Seafood exports, fishing quota concentration
- **Emergency Preparedness** (Intervention Area 12) - Supply chain resilience

**Data integration:**

- HHI concentration data from municipality metrics
- Self-sufficiency rates from SSB
- Seafood trade volumes
- Border trade statistics

**Source:** Gaiani et al. (2024) "White Paper on Nordic Sustainable Food Systems", Ruralia Institute, University of Helsinki

### Insights Section (2025-12-30)

Inline section displayed below the map (scroll down to view).

**Charts included:**

- `FoodFlowSankey` - Sankey diagram showing food flows (imports, domestic, seafood → consumption/exports)
- `MarginsChart` - Corporate profit margins (NorgesGruppen, Reitan, Coop vs suppliers)
- `SelfSufficiencyChart` - Norwegian self-sufficiency by food category

**Key Stats Cards:**

- Total Turnover (Mrd NOK)
- Border Trade (Mrd NOK)
- Private Label Share (%)

**Market Structure Info:**

- NorgesGruppen, Reitangruppen, Coop Norge overview

**Data sources loaded:**

- `ssb_landbruk_2024.json` - Market overview, production, self-sufficiency
- `financial_insights_2024.json` - Corporate margins from annual reports
- `trade_volumes_2024.json` - Import/export/domestic production tonnes

### Municipality Panel Charts (2025-12-29)

- `MarketShareChart` - Donut chart of chain market share in selected municipality
- `ParentCompanyChart` - Ownership breakdown (NorgesGruppen, Coop, Reitangruppen)
- `StoreTypeChart` - Discount vs supermarket vs convenience distribution
- `ComparisonChart` - Municipality vs national averages bar chart

Dependencies: `@nivo/pie`, `@nivo/bar`, `recharts`

### Choropleth Maps (2025-12-29)

- Store density visualization (stores per 1,000 residents)
- Market concentration visualization (HHI index)
- Dynamic legend with color scales
- Layer exclusivity (one choropleth at a time)
- Pre-computed municipalityMetrics in context

### Enhanced Store Data (2025-12-29)

- Re-fetched 3,849 stores from OSM with:
  - Opening hours (98% coverage)
  - Wheelchair accessibility
  - Phone numbers
- Updated popups show new fields
- Script: `scripts/food-systems/fetch-osm-stores.py`

### SSB Demographics Data (2025-12-30)

- **Age Distribution**: 357/357 municipalities (100%)
  - Under 18 percentage
  - Over 65 percentage
- **Median Income**: 356/357 municipalities (99.7%)
  - 2023 after-tax household income
- **Households**: 356/357 municipalities (99.7%)
  - Total household count per municipality
- Script: `scripts/food-systems/fetch-ssb-demographics.py`

**Note:** Haram (1580) has no separate 2023 income/household data because it was merged into Ålesund from 2020-2023, then re-established as a separate municipality in 2024.

### Demographics UI (2025-12-30)

- Added demographics section to MunicipalityPanel
- Displays when clicking any municipality:
  - Median income (in thousands NOK)
  - Household count
  - Under 18% age group
  - Over 65% age group
- Color-coded cards (blue/purple/amber/teal)
- Bilingual labels (EN/NO)

### Website Integration (2025-12-30)

- Added Food Systems to Lab page navigation
- First item in Lab grid with "Map" tag
- Links to `/lab/food-systems`

### Production Deployment

- Deployed via Coolify on `cloudbrain` server (77.42.43.227)
- Live at: http://b8w8k4w48wscswwwkowocoo0.77.42.43.227.sslip.io
- Auto-deploys from `main` branch via GitHub integration

## Component Inventory

### Main Components

| Component           | File                    | Purpose                            |
| ------------------- | ----------------------- | ---------------------------------- |
| `FoodSystemsClient` | `client.tsx`            | Main client wrapper                |
| `FoodSystemsMap`    | `FoodSystemsMap.tsx`    | Leaflet map with stores/boundaries |
| `MunicipalityPanel` | `MunicipalityPanel.tsx` | Sidebar panel with stats & charts  |
| `LayerControls`     | `LayerControls.tsx`     | Layer and chain filter toggles     |
| `ChoroplethLegend`  | `ChoroplethLegend.tsx`  | Dynamic legend for density/HHI     |
| `InsightsSection`   | `InsightsSection.tsx`   | Inline national insights below map |
| `NarrativeSection`  | `NarrativeSection.tsx`  | Research-backed analysis narrative |

### Chart Components

| Chart                  | File                              | Used In           |
| ---------------------- | --------------------------------- | ----------------- |
| `MarketShareChart`     | `charts/MarketShareChart.tsx`     | MunicipalityPanel |
| `ParentCompanyChart`   | `charts/ParentCompanyChart.tsx`   | MunicipalityPanel |
| `StoreTypeChart`       | `charts/StoreTypeChart.tsx`       | MunicipalityPanel |
| `ComparisonChart`      | `charts/ComparisonChart.tsx`      | MunicipalityPanel |
| `MarginsChart`         | `charts/MarginsChart.tsx`         | InsightsSection   |
| `SelfSufficiencyChart` | `charts/SelfSufficiencyChart.tsx` | InsightsSection   |
| `FoodFlowSankey`       | `charts/FoodFlowSankey.tsx`       | InsightsSection   |

### Context & Types

| File                                 | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| `FoodSystemsContext.tsx`             | State management, data loading       |
| `lib/food-systems/types.ts`          | Store, Municipality, Metrics types   |
| `lib/food-systems/insights-types.ts` | SSBStats, FinancialStats, TradeStats |
| `lib/food-systems/metrics.ts`        | Calculation functions                |

## Data Files

### Primary Data (`public/data/food-systems/`)

| File                            | Records | Purpose                           |
| ------------------------------- | ------- | --------------------------------- |
| `stores.json`                   | 3,849   | Store locations with OSM details  |
| `municipalities.json`           | 357     | Municipality stats + demographics |
| `norway-municipalities.geojson` | 357     | Municipal boundary polygons       |

### Insights Data (`public/data/food-systems/raw_data/`)

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `ssb_landbruk_2024.json`       | Market overview, production, self-sufficiency rates  |
| `financial_insights_2024.json` | Corporate margins (NG 3.3%, Reitan 3.85%, Coop 1.0%) |
| `trade_volumes_2024.json`      | Import/export tonnes, domestic production            |

### Visuals (`docs/data/food-systems/visuals/`)

| File                         | Purpose                          | Status                               |
| ---------------------------- | -------------------------------- | ------------------------------------ |
| `prompts.md`                 | 10 AI image generation prompts   | Not integrated                       |
| `food_flow_2024.mermaid`     | Mermaid diagram of food flows    | ✅ Integrated via SystemFlowsSection |
| `value_chain_funnel.mermaid` | Value chain funnel diagram       | ✅ Integrated via SystemFlowsSection |
| `logistics_hubs.geojson`     | 19 distribution center locations | ✅ Integrated as map layer           |

## Phase 5: Completed Features (2025-12-31)

### Logistics Hub Layer ✅

**Implementation:** Added 19 distribution centers to map with diamond markers.

**Files modified:**

- `FoodSystemsMap.tsx` - Added logistics hub layer with owner-colored markers
- `FoodSystemsContext.tsx` - Added `logisticsHubs` state
- `types.ts` - Added `LogisticsHub`, `LogisticsOwner` types
- `public/data/food-systems/logistics_hubs.geojson` - Copied from docs

### Municipality Search ✅

**Implementation:** Fuzzy autocomplete with keyboard navigation.

**Files created:**

- `MunicipalitySearch.tsx` - Search component with autocomplete dropdown

**Features:**

- Fuzzy matching on municipality names
- Keyboard navigation (Arrow Up/Down, Enter, Escape)
- Triggers map zoom via `setZoomToBounds`
- Bilingual placeholders

### Self-Sufficiency Dashboard ✅

**Implementation:** Vulnerability gauge and category risk cards.

**Files created:**

- `SelfSufficiencyDashboard.tsx` - Dashboard with SVG gauge

**Features:**

- SVG gauge showing 44% self-sufficiency
- Category cards (Dairy, Meat, Eggs, Grains, Fruit/Veg)
- Risk level indicators (Low/Moderate/High)

### Comparison Mode ✅

**Implementation:** Side-by-side comparison of two municipalities.

**Files modified:**

- `MunicipalityPanel.tsx` - Added comparison view with `ComparisonIndicator`
- `FoodSystemsContext.tsx` - Added `comparisonMunicipality`, `isComparisonMode`
- `LayerControls.tsx` - Added Compare toggle button
- `FoodSystemsMap.tsx` - Added comparison styling (emerald/violet)

### Mermaid Diagrams ✅

**Implementation:** Tab-based Food Flow and Value Chain diagrams.

**Files created:**

- `MermaidDiagram.tsx` - Client-side Mermaid rendering
- `SystemFlowsSection.tsx` - Tab interface for diagrams

**Dependencies added:** `mermaid`

---

## Phase 6: Pending Features

### Food Desert Analysis

**Purpose:** Identify underserved areas without nearby grocery access

**Implementation approach:**

1. Add `coverage` layer (already defined in types.ts)
2. Draw 5km radius circles around each store
3. Calculate % population within coverage
4. Identify "food deserts" (areas >5km from any store)

**Files to modify:**

- `FoodSystemsMap.tsx` - add coverage layer rendering
- `FoodSystemsContext.tsx` - add coverage toggle
- `metrics.ts` - add coverage calculation

### Data Export

**Purpose:** Download municipality stats as CSV/PDF

**Implementation approach:**

1. Export button in panel
2. CSV: municipality name, population, stores, density, HHI
3. PDF: formatted report with charts

**Dependencies needed:** jspdf, papaparse (or similar)

## Data Sources Status

| Source            | Status    | Notes                               |
| ----------------- | --------- | ----------------------------------- |
| OpenStreetMap     | ✓ Working | 3,849 stores with details           |
| Kartverket        | ✓ Working | Municipal boundaries GeoJSON        |
| SSB Population    | ✓ Working | 357 municipalities                  |
| SSB Income        | ✓ Working | 356/357 municipalities (2023 data)  |
| SSB Age           | ✓ Working | 357/357 municipalities (2024 data)  |
| SSB Households    | ✓ Working | 356/357 municipalities (2023 data)  |
| SSB Agriculture   | ✓ Working | Production, self-sufficiency        |
| Corporate Reports | ✓ Working | NorgesGruppen, Reitan, Coop margins |

### SSB API Technical Notes

**Issue resolved (2025-12-30):** The SSB API was returning null values due to municipality code mismatches.

**Root cause:** Municipality codes changed over time:

- Pre-2020: Old codes (01xx, 02xx)
- 2020-2023: Intermediate codes (30xx)
- 2024+: Current codes (31xx)

**Solution implemented:**

1. Dynamic code mapping based on query year
2. Manual mappings for edge cases (Sami names, multi-county municipalities)
3. Batched queries for age data (20 municipalities per batch)
4. Summing male + female values (no "total" option in age table)

**Edge cases handled:**

- Våler (exists in multiple counties) → mapped to Våler (Viken)
- Sami municipality names (Karasjok, Porsanger) → spelling variations
- Haram → no 2020-2023 data (was part of Ålesund)

## Scripts

| Script                                             | Purpose                                |
| -------------------------------------------------- | -------------------------------------- |
| `scripts/food-systems/fetch-osm-stores.py`         | Re-fetch stores from OSM               |
| `scripts/food-systems/fetch-ssb-demographics.py`   | Fetch age, income, households from SSB |
| `scripts/food-systems/fetch_ssb_indices.py`        | Fetch SSB agriculture/trade data       |
| `scripts/food-systems/fetch_and_analyze_prices.py` | Price analysis (experimental)          |

### fetch-ssb-demographics.py

Fetches demographic data from SSB API and merges with `municipalities.json`.

**Usage:**

```bash
python3 scripts/food-systems/fetch-ssb-demographics.py
```

**Features:**

- Automatic municipality code mapping (2024 → 2020-2023)
- Batched age queries (18 batches of 20 municipalities)
- Manual mappings for edge cases
- Outputs: medianIncome, households, ageDistribution

**Output sample:**

```json
{
  "code": "0301",
  "name": "Oslo",
  "population": 717710,
  "medianIncome": 592000,
  "households": 385234,
  "ageDistribution": {
    "under18Pct": 18.4,
    "over65Pct": 13.2
  }
}
```

## Architecture Notes

### Data Flow

```
stores.json + municipalities.json + geojson + raw_data/*
        ↓
FoodSystemsContext (loads data, computes metrics, loads insights)
        ↓
    ┌───────────────────────────────────────┐
    │                                       │
municipalityMetrics              insights (SSB, financials, trade)
    │                                       │
    ↓                                       ↓
FoodSystemsMap                    InsightsSection (inline below map)
MunicipalityPanel                 (FoodFlowSankey, MarginsChart,
(MarketShare, ParentCompany,       SelfSufficiencyChart)
 StoreType, ComparisonChart)
```

### Key Files

- `src/contexts/FoodSystemsContext.tsx` - state management
- `src/components/food-systems/FoodSystemsMap.tsx` - Leaflet map
- `src/components/food-systems/MunicipalityPanel.tsx` - sidebar panel
- `src/components/food-systems/InsightsSection.tsx` - inline national insights
- `src/components/food-systems/charts/` - All chart components
- `src/lib/food-systems/metrics.ts` - calculation functions
- `src/lib/food-systems/types.ts` - TypeScript interfaces
- `src/lib/food-systems/insights-types.ts` - Insights TypeScript interfaces

## Deployment

### Production Server: cloudbrain (Coolify)

- **URL:** http://b8w8k4w48wscswwwkowocoo0.77.42.43.227.sslip.io
- **Server:** 77.42.43.227
- **Platform:** Coolify (self-hosted)
- **Build:** Nixpacks (auto-detected Node/Next.js)
- **App UUID:** b8w8k4w48wscswwwkowocoo0
- **GitHub Integration:** justaride/brocode (auto-deploys from `main`)

### Deploy Commands

```bash
coolify deploy uuid b8w8k4w48wscswwwkowocoo0

coolify app get b8w8k4w48wscswwwkowocoo0

coolify app logs b8w8k4w48wscswwwkowocoo0

coolify app restart b8w8k4w48wscswwwkowocoo0
```

## Phase 3: Systems Thinking Integration (2025-12-30)

### Research Synthesis Document

`docs/research/food-systems-patterns-synthesis.md`

**Purpose:** Connect food systems research to universal patterns from complex systems theory.

**Pattern Lenses Applied:**

1. **Power Laws** - Zipf distributions, self-organization signatures
2. **Feedback Loops** - Reinforcing (concentration) vs balancing (competition)
3. **Emergence** - Simple rules generating complex infrastructure
4. **Ecological Metabolism** - Value flows, trophic levels, carrying capacity

**Empirical Results (from `scripts/food-systems/analyze_patterns.py`):**
| Hypothesis | Result | Evidence |
|------------|--------|----------|
| H1: Population follows Zipf | SUPPORTED | R² = 0.901, slope = -1.27 |
| H2: Top 3 control >90% | SUPPORTED | Top 3 share = 93.4% |
| H3: Parent HHI > 2500 | SUPPORTED | Parent HHI = 3,438 |

**Results saved to:** `docs/research/pattern-analysis-results.json`

### New Components

| Component                | File                                | Purpose                                                               |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------- |
| `PatternsSection`        | `PatternsSection.tsx`               | 4-tab patterns explorer (Power Laws, Feedback, Emergence, Metabolism) |
| `ZipfDistributionChart`  | `charts/ZipfDistributionChart.tsx`  | Log-log scatter with regression line                                  |
| `LorenzCurveChart`       | `charts/LorenzCurveChart.tsx`       | Gini coefficient visualization                                        |
| `CausalLoopDiagram`      | `charts/CausalLoopDiagram.tsx`      | SVG causal loop diagram (R1, R2, B1)                                  |
| `EmergenceVisualization` | `charts/EmergenceVisualization.tsx` | Interactive agent-based simulation                                    |

### New Library Module

`src/lib/food-systems/pattern-analysis.ts`

- `analyzeZipfDistribution()` - Log-log regression for rank-size distributions
- `calculateGiniCoefficient()` - Market inequality measure
- `calculateLorenzCurve()` - Cumulative share data for visualization
- `analyzeConcentration()` - Chain and parent company HHI
- `analyzeDemographicCorrelations()` - HHI vs income, age, population

### Page Integration

`src/app/[lang]/lab/food-systems/page.tsx`

- Added `PatternsSection` after `NarrativeSection`
- Dark-themed section with interactive visualizations
- Bilingual support (en/no)

### Key Insights Surfaced

1. **Triopoly is an attractor** - 3 companies stable for decades; not conspiracy but predictable emergence
2. **93.4% controlled by top 3** - NorgesGruppen (48.4%), Coop (27.1%), Reitan (18.0%)
3. **Hidden profit extraction** - PPI +42.7% vs KPI +32.5% (opaque mechanisms)
4. **Population follows Zipf** - R² = 0.901 (self-organized distribution)
5. **Chain slope steeper than Zipf** - slope = -1.60 (more concentrated than natural)

### Philosophy Connection

Connected to BroCode thinkers:

- **Gregory Bateson** - Ecology of mind, feedback loops, "the pattern that connects"
- **Terence McKenna** - Novelty vs habit, system frozen in habit
- **Bruce Damer** - Emergence ladder, simple rules → complex patterns

### Phase 3 Refinements (2025-12-30)

**Bug Fixes:**

- Fixed dynamic Tailwind classes (`bg-${color}` → explicit class strings)
- De-duplicated `linearRegression()` function (exported from pattern-analysis.ts)

**UX Improvements:**

- Added loading spinner while data fetches
- Added error state with user-friendly message
- Improved mobile responsiveness (2-column grid for tabs on small screens)

**Accessibility:**

- Added `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Added `aria-selected`, `aria-controls`, `aria-labelledby` attributes

**New Visualizations:**

- `CausalLoopDiagram.tsx` - SVG diagram showing R1, R2 reinforcing loops and B1 broken balancing loop
- `EmergenceVisualization.tsx` - Interactive agent-based simulation with Start/Pause/Reset controls

**Translations:**

- Fixed "Power Laws" → "Potenslov" in Norwegian

---

## TypeScript Fixes Applied (2025-12-30)

These fixes were needed for stricter TypeScript on the server:

| File                       | Issue                             | Fix                                                         |
| -------------------------- | --------------------------------- | ----------------------------------------------------------- |
| `MunicipalityPanel.tsx`    | Passed props to no-prop component | Removed `stores`, `isNorwegian` from `<MarketShareChart />` |
| `MarketShareChart.tsx`     | `percent` possibly undefined      | Changed to `(percent ?? 0)`                                 |
| `UrbanFractalAnalyzer.tsx` | `new Image()` needs args          | Changed to `document.createElement('img')`                  |

---

## Phase 4: Supply Chain Expansion (Started 2025-12-30)

### Overview

Expand from retail-focused mapping (3,849 stores) to **complete supply chain visualization**:
`Produce → Logistics → Stores`

Research-first approach with multi-perspective systems thinking integration.

### Research Documents Created

| Document                       | Location                                               | Status           |
| ------------------------------ | ------------------------------------------------------ | ---------------- |
| **Supply Chain Synthesis**     | `docs/research/food-systems-supply-chain-synthesis.md` | Skeleton created |
| **Alternative Perspectives**   | `docs/research/alternative-perspectives-synthesis.md`  | Complete draft   |
| **Metaphors & Visualizations** | `docs/research/metaphors-and-visualizations.md`        | Complete draft   |
| **Data Source Inventory**      | `docs/data/food-systems/data-source-inventory.md`      | Complete         |

### Data Expanded

| File                     | Before | After       |
| ------------------------ | ------ | ----------- |
| `logistics_hubs.geojson` | 6 hubs | **19 hubs** |

**All known distribution centers now mapped:**

- ASKO: Vestby (100k m²), Vestby Kjøl, Oslo, Øst, Hedmark, Oppland, Midt-Norge, Vest, Rogaland, Agder, Nord
- Rema: Vinterbro (70k m²), Trondheim, Bergen, Sandnes, Kristiansand, Narvik
- Coop: C-Log Gardermoen (84k m²)
- Bunnpris: Central distribution

### API Access Verified

| Source              | Status            | Tables/Endpoints                  |
| ------------------- | ----------------- | --------------------------------- |
| SSB Statbank        | ✅ Working        | 06462 (ag area), 06447 (holdings) |
| Fiskeridirektoratet | ✅ Accessible     | Aquaculture registry              |
| Barentswatch        | ✅ API responding | Registration needed               |
| Kystverket          | 🔲 Not tested     | Port statistics                   |

### New Theoretical Perspectives

**Ecological/Biological:**

- Circulatory system metaphor (hubs = heart)
- Keystone species (C-Log = 1,200 stores)
- Holling's resilience theory (Conservation phase)
- Carrying capacity analysis

**Network Theory:**

- Betweenness centrality
- Hub-and-spoke fragility
- Information asymmetry

**Indigenous/Traditional:**

- Sami reindeer herding as alternative model
- REKO-ringen as modern revival
- Pre-industrial resilience mechanisms

### New Hypotheses (H15-H23)

| ID  | Hypothesis                           | Lens       |
| --- | ------------------------------------ | ---------- |
| H15 | Market at carrying capacity          | Ecological |
| H16 | Single hub failure → >25% cascade    | Ecological |
| H17 | Producer margins declining vs retail | Ecological |
| H18 | Top 3 hubs >80% flow centrality      | Network    |
| H19 | System cannot survive 2 hub failure  | Network    |
| H20 | Retailers 10x lower uncertainty      | Network    |
| H21 | TEK declined >80% since 1950         | Indigenous |
| H22 | Regulations burden alternatives      | Indigenous |
| H23 | Time horizon mismatch                | Indigenous |

### Phase 4 Next Steps

1. **Data Collection Scripts** (not started)
   - `fetch-farm-data.py` → SSB agricultural holdings
   - `fetch-fisheries.py` → Fiskeridirektoratet
   - `fetch-ports.py` → Kystverket
   - `fetch-processing.py` → Mattilsynet

2. **GeoJSON Files to Create**
   - `farms.geojson`
   - `fisheries.geojson`
   - `aquaculture.geojson`
   - `processing_plants.geojson`
   - `ports.geojson`
   - `supply_flows.geojson`

3. **Map Implementation**
   - Add logistics hub layer (data ready)
   - Add production layer toggles
   - Add flow visualization
   - Add vulnerability modeling

4. **Research Completion**
   - Populate supply chain synthesis with data
   - Literature review (Stockholm Resilience, FAO)
   - Expert consultation list

### Visualization Priorities

| Priority | Visualization          | Complexity |
| -------- | ---------------------- | ---------- |
| P1       | Logistics hub layer    | Low        |
| P1       | Supply chain Sankey    | Medium     |
| P2       | Animated flow map      | High       |
| P2       | Vulnerability heat map | Medium     |
| P3       | Network graph          | Medium     |
| P4       | "What If" simulation   | High       |

### Key Files for Phase 4

| Purpose           | File                                                    |
| ----------------- | ------------------------------------------------------- |
| Research skeleton | `docs/research/food-systems-supply-chain-synthesis.md`  |
| Perspectives      | `docs/research/alternative-perspectives-synthesis.md`   |
| Visualizations    | `docs/research/metaphors-and-visualizations.md`         |
| Data inventory    | `docs/data/food-systems/data-source-inventory.md`       |
| Hub data          | `docs/data/food-systems/visuals/logistics_hubs.geojson` |
| Plan file         | `~/.claude/plans/glowing-wandering-summit.md`           |
