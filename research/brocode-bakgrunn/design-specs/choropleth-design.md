# Food Systems Norway - Choropleth Maps Design

## Overview

Add choropleth visualization to color municipalities by store density or market concentration metrics.

## Architecture

**Pre-computation in Context:**
- `municipalityMetrics` calculated on load using point-in-polygon
- Stored in `FoodSystemsContext` for map and panel access
- Avoids recalculating on every render

**Layer Exclusivity:**
- `density` and `concentration` are mutually exclusive
- Enabling one auto-disables the other
- Handled in `toggleLayer` callback

## Components

### FoodSystemsMap.tsx
- Dynamic styling based on `choroplethMode`
- `getFillColor()` uses `getDensityColor()` or `getConcentrationColor()`
- Tooltip shows metric value when choropleth active
- Hover effect increases opacity

### ChoroplethLegend.tsx
- Positioned bottom-left of map
- Shows gradient bar with value stops
- Labels: Low/High or Competitive/Concentrated
- Bilingual support (en/no)
- Only visible when choropleth layer active

### LayerControls.tsx
- Existing toggles for `density` and `concentration`
- No changes needed (already in place)

## Color Scales

**Density (stores per 1,000 residents):**
- 0.0: #EF4444 (red - low access)
- 0.3: #F97316 (orange)
- 0.5: #FBBF24 (yellow)
- 0.7: #84CC16 (lime - national avg)
- 1.0+: #22C55E (green - high access)

**Concentration (HHI):**
- 0: #3B82F6 (blue - competitive)
- 1500: #8B5CF6 (purple - moderate)
- 2500: #EC4899 (pink - concentrated)
- 4000+: #DC2626 (red - highly concentrated)

## Status: Complete ✓

Implemented 2025-12-29.
