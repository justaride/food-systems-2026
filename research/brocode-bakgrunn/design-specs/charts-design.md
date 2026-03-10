# Food Systems Norway - Phase 2 Charts Design

## Overview

Add four chart components to the MunicipalityPanel for enhanced data visualization.

## Architecture

```
src/components/food-systems/charts/
├── MarketShareChart.tsx    # Donut chart - chain market share
├── ComparisonChart.tsx     # Bar chart - vs national averages
├── StoreTypeChart.tsx      # Pie chart - store type breakdown
├── ParentCompanyChart.tsx  # Donut chart - parent company share
└── index.ts                # Barrel export
```

**Dependencies:** `@nivo/pie`, `@nivo/bar`

**Integration:** Charts added to `MunicipalityPanel.tsx` below existing metrics.

## Chart 1: Market Share (Donut)

- Nivo `ResponsivePie` with `innerRadius={0.5}`
- Slices colored by `CHAIN_CONFIGS[chainId].color`
- Center text: total store count
- Chains <3% grouped into "Other"
- Max 6 slices
- Height: 180px

## Chart 2: Comparison Bar Chart

- Nivo `ResponsiveBar` horizontal layout
- Compare municipality vs national averages:
  - Stores per 1,000 residents (avg: ~0.7)
  - HHI concentration (avg: ~2,500)
  - Stores per km²
- Municipality bars: emerald, National bars: gray
- Height: 140px

**Requires:** Add `nationalMetrics` to `FoodSystemsContext`

## Chart 3: Store Type Breakdown (Pie)

- Nivo `ResponsivePie` with `innerRadius={0}`
- Categories by `StoreType`:
  - Discount - blue
  - Supermarket - emerald
  - Convenience - amber
  - Hypermarket - purple
- Height: 150px

## Chart 4: Parent Company (Donut)

- Nivo `ResponsivePie` with `innerRadius={0.6}`
- Aggregate by `CHAIN_CONFIGS[chainId].parent`:
  - NorgesGruppen - #1B4332
  - Coop Norge - #00529B
  - Reitangruppen - #E30613
  - Bunnpris AS - #E91E63
- Center text: "Ownership" / "Eierskap"
- Height: 160px

## Implementation Order

1. Install dependencies (@nivo/pie, @nivo/bar)
2. Create MarketShareChart.tsx
3. Create ParentCompanyChart.tsx
4. Create StoreTypeChart.tsx
5. Add national averages calculation to context
6. Create ComparisonChart.tsx
7. Integrate all charts into MunicipalityPanel
8. Test bilingual labels

## Bilingual Support

All charts support `isNorwegian` prop for labels and tooltips.

## Status: Complete ✓

Implemented 2025-12-29. All four charts integrated into MunicipalityPanel.

### Additional Fix: Point-in-Polygon Matching

The original store-to-municipality matching used city name heuristics which failed (OSM data has empty city fields). Fixed by implementing proper geospatial matching:

- Added `@turf/boolean-point-in-polygon` and `@turf/helpers`
- MunicipalityPanel now loads GeoJSON boundaries
- Each store's coordinates are tested against the municipality polygon
- Results in accurate store counts and metrics per municipality
