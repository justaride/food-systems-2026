# Phase 4B & 4C Design: Data Expansion + Advanced Visualization

**Date:** 2025-12-31
**Status:** ✅ Complete
**Scope:** Parallel implementation of data expansion and advanced visualization

---

## Overview

Full implementation completed on 2025-12-31:

### Phase 4B - Data Expansion (All Complete)
| Feature | Status | Files |
|---------|--------|-------|
| Farm locations | ✅ | `FarmLayer.tsx`, `farms.geojson` |
| Processing plants | ✅ | `ProcessingPlantLayer.tsx`, `processing_plants.geojson` |
| Ports & fisheries | ✅ | `PortLayer.tsx`, `ports.geojson` |

### Phase 4C - Advanced Visualization (All Complete)
| Feature | Status | Files |
|---------|--------|-------|
| Food desert analysis | ✅ | `FoodDesertLayer.tsx`, `FoodDesertPanel.tsx`, `desert-analysis.ts` |
| Animated flow viz | ✅ | `FlowLayer.tsx`, `flow-utils.ts` |
| Vulnerability heat map | ✅ | `VulnerabilityLayer.tsx`, `VulnerabilityPanel.tsx`, `vulnerability.ts` |
| Network graph | ✅ | `SupplyNetworkGraph.tsx` |
| Supply chain Sankey | ✅ | `SupplyChainSankey.tsx` |
| CSV data export | ✅ | `ExportButton.tsx` |

### Phase 5 - Real Data Integration (In Progress)
| Feature | Status | Files |
|---------|--------|-------|
| Aquaculture sites | ✅ | `AquacultureLayer.tsx`, `aquaculture_sites.geojson` (1,782 sites) |
| SSB farm data API | ⏳ Pending | — |
| "What If" simulator | ⏳ Pending | — |

---

## Original Design (Farm Locations + Food Desert)

---

## Phase 4B: Farm Locations Layer

### Data Source
SSB Table 06462 - Agricultural holdings by municipality

### File Structure
```
/public/data/food-systems/
├── farms.geojson           # Farm locations with production data
└── raw_data/
    └── ssb_farms_2024.json # Raw SSB statistics

/src/lib/food-systems/
├── types.ts                # Add Farm type
└── farm-utils.ts           # Farm data processing

/src/components/food-systems/
└── FarmLayer.tsx           # Map layer component
```

### Data Types
```typescript
interface Farm {
  id: string;
  municipalityCode: string;
  type: 'dairy' | 'grain' | 'vegetables' | 'livestock' | 'mixed';
  productionArea: number;    // hectares
  coordinates: [number, number];
  products?: string[];
}
```

### Layer Behavior
- Add `'farms'` to `FoodSystemsLayer` type
- Farm markers with icons by production type
- Cluster markers when zoomed out (Leaflet.markercluster)
- Click reveals production details in panel

---

## Phase 4C: Food Desert Analysis

### Definition
Food desert = area >5km from nearest grocery store (distance-based)

### File Structure
```
/src/components/food-systems/
├── FoodDesertLayer.tsx        # Coverage circles + desert highlighting
└── FoodDesertPanel.tsx        # Stats panel showing affected areas

/src/lib/food-systems/
└── desert-analysis.ts         # Coverage calculation utilities

/public/data/food-systems/
└── desert-coverage.json       # Pre-calculated coverage data
```

### Data Types
```typescript
interface CoverageAnalysis {
  coveredArea: number;         // km² within 5km of any store
  uncoveredArea: number;       // km² beyond 5km from all stores
  affectedMunicipalities: string[];
  coveragePercent: number;
}

interface MunicipalityCoverage {
  code: string;
  totalArea: number;
  coveredArea: number;
  coveragePercent: number;
  nearestStoreDistance?: number;  // for uncovered centroids
}
```

### Visualization
- Semi-transparent 5km circles around stores (green, 20% opacity)
- Uncovered areas highlighted (red/orange gradient)
- Municipality-level stats in panel
- Uses Turf.js `buffer()` and `difference()` for geometry

### Performance
- Pre-calculate coverage at build time
- Cache results in context
- Only render visible circles based on map bounds

---

## Integration

### Context Updates
```typescript
type FoodSystemsLayer =
  | 'stores' | 'boundaries' | 'density' | 'concentration'
  | 'logistics' | 'farms' | 'food-desert';

interface FoodSystemsContextType {
  // ... existing ...
  farms: Farm[];
  desertAnalysis: CoverageAnalysis | null;
  municipalityCoverage: Record<string, MunicipalityCoverage>;
}
```

### Data Loading
Add to existing `Promise.all` in `FoodSystemsContext`:
```typescript
fetch('/data/food-systems/farms.geojson'),
fetch('/data/food-systems/desert-coverage.json'),
```

### Layer Control Updates
- Add "Production" section with farm layer toggle
- Add "Analysis" section with food desert toggle
- Desert layer includes legend (green = covered, red = desert)

---

## Implementation Tasks

### Phase 4B - Farm Locations
1. Create SSB data fetch script for Table 06462
2. Add `Farm` type to `types.ts`
3. Generate `farms.geojson` with municipality centroids
4. Build `FarmLayer.tsx` with clustered markers
5. Integrate into context and layer controls

### Phase 4C - Food Desert Analysis
1. Create `desert-analysis.ts` with Turf.js calculations
2. Build coverage pre-calculation script
3. Create `FoodDesertLayer.tsx` with circles + highlighting
4. Add `FoodDesertPanel.tsx` for stats display
5. Integrate into context and layer controls

### Shared Tasks
- Update `FoodSystemsContext` with new types/state
- Update `LayerControlPanel` UI with new sections
- Update `FoodSystemsMap` to render new layers

---

## Dependencies

### Existing
- Turf.js (already installed)
- Leaflet (already installed)
- react-leaflet (already installed)

### New
- leaflet.markercluster (for farm clustering)

---

## Success Criteria

- [x] Farm layer displays clustered markers by municipality
- [x] Farm markers show production type icons
- [x] Food desert layer shows 5km coverage circles
- [x] Uncovered areas visually highlighted
- [x] Panel displays coverage statistics per municipality
- [x] Both layers toggle independently
- [x] Performance acceptable with all data loaded
- [x] Processing plants layer with company icons
- [x] Ports layer with type differentiation
- [x] Animated flow visualization from hubs to stores

## Remaining Work (Phase 5)

- [x] Aquaculture sites layer (Fiskeridirektoratet API - 1,782 sites)
- [x] Network graph (SupplyNetworkGraph.tsx)
- [x] Data export (ExportButton.tsx with CSV)
- [ ] "What If" scenario simulator
- [ ] SSB API integration for real farm data (Table 06462)
- [ ] "Follow the Food" journey visualization
