# BroCode Comprehensive Project Plan

**Date:** 2025-12-31
**Branch:** `main`
**Status:** ✅ Phase 4 Complete + Phase 5 In Progress

---

## Executive Summary

Comprehensive analysis of BroCode project revealed:
- **Build:** Passing (109 chunks, 11MB total)
- **Routes:** 21/21 verified (no 404s)
- **Hidden Content:** ~~4 unused components~~ → Cleaned (17 files removed, -2,980 lines)
- **Research:** 10 documents synthesized with actionable items
- **Food Systems:** Phase 4 complete, Phase 5 started with aquaculture layer (1,782 sites)

### Optimization Sweep Results (2025-12-31)
| Metric | Before | After |
|--------|--------|-------|
| Chunk count | 113 | 109 |
| Unused components | 17 | 0 |
| Lines removed | - | 2,980 |
| Mermaid loading | Static (500KB initial) | Dynamic (lazy) |
| Package imports | Unoptimized | Tree-shaking enabled |

---

## Part 1: Audit Results

### 1.1 Link Audit - PASSED

| Category | Status | Details |
|----------|--------|---------|
| Navigation | ✅ | All 4 nav items verified |
| Footer | ⚠️ | 4 placeholder social links (`#`) |
| Routes | ✅ | 21/21 pages exist |
| Project URLs | ✅ | `/fractal-analysis`, `/demographics` verified |
| Mockups | ✅ | 13/13 components exist |

**Only Issue:** Social links in Footer (lines 37, 40, 43, 46) are placeholders.

### 1.2 Hidden Content Inventory

#### Unused Components (High Value)
| Component | Purpose | Status |
|-----------|---------|--------|
| `InsightCards.tsx` | 2009-2024 demographic milestones | ✅ Integrated |
| `AnimatedBubbleChart.tsx` | Population drill-down by county | ❌ Deleted (unused) |
| `OriginalLogo.tsx` | BroCode gradient text | ❌ Deleted (unused) |
| `TimelineProjection.tsx` | Timeline visualization | ❌ Deleted (unused) |

#### Deleted in Optimization Sweep
- 12 fractal components (3D/WebGL never imported)
- 2 `.broken` backup page files

#### Unused Visual Assets
| File | Content | Integration Target |
|------|---------|-------------------|
| `logistics_hubs.geojson` | 19 distribution centers | Food Systems map |
| `prompts.md` | 10 AI image generation prompts | Marketing/visuals |
| `food_flow_2024.mermaid` | Sankey diagram (Mermaid) | Food Systems page |
| `value_chain_funnel.mermaid` | Market concentration diagram | Food Systems page |

#### Template Assets (Low Priority)
- `vercel.svg`, `next.svg`, `file.svg`, `globe.svg`, `window.svg` - unused

### 1.3 Research Synthesis

10 research documents analyzed. Key findings:

| Document | Core Insight |
|----------|--------------|
| Anders Nordstad Thesis | Vertically integrated triopoly with closed infrastructure |
| 2025 Update | Prisjeger fine (4.9B NOK) validates tacit collusion |
| Supply Chain Synthesis | 3 critical hubs; 44% self-sufficiency |
| Alternative Perspectives | Ecological, network, indigenous lenses |
| Metaphors & Visualizations | 6 metaphors, 10 visualization concepts |
| Pattern Analysis | Zipf R²=0.901; Top 3 = 93.4% |
| Price Transmission | PPI +42.7% vs KPI +32.5% gap |

---

## Part 2: Implementation Plan

### Tier 1: Quick Wins (1-2 hours each) ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 1 | Add logistics hub layer to Food Systems map | ✅ Done |
| 2 | Integrate InsightCards into Demographics | ✅ Done |
| 3 | Add Mermaid diagrams to Food Systems | ✅ Done |
| 4 | Fix Footer social links (or remove) | ✅ Removed |
| 5 | Feature research docs in /docs sidebar | ✅ Done |

### Tier 2: Medium Features (2-4 hours each) - Partial

| # | Task | Status |
|---|------|--------|
| 6 | Municipality search & autocomplete | ✅ Done |
| 7 | Self-sufficiency dashboard cards | ✅ Done |
| 8 | AnimatedBubbleChart integration | ❌ Removed (unused) |
| 9 | Comparison mode (2 municipalities) | ✅ Done |
| 10 | Data export (CSV) | ✅ Done |

### Tier 3: Major Features (4-8 hours each)

| # | Task | Files | Status |
|---|------|-------|--------|
| 11 | Food desert analysis (5km coverage) | `FoodDesertLayer.tsx`, `FoodDesertPanel.tsx` | ✅ Done |
| 12 | Vulnerability heat map (scenario modeling) | `VulnerabilityLayer.tsx`, `VulnerabilityPanel.tsx` | ✅ Done |
| 13 | Supply chain Sankey + geography | `SupplyChainSankey.tsx` | ✅ Done |
| 14 | Animated flow visualization | `FlowLayer.tsx`, `flow-utils.ts` | ✅ Done |
| 15 | Network graph visualization | `SupplyNetworkGraph.tsx` | ✅ Done |

### Tier 4: Research-Dependent (8+ hours)

| # | Task | Data Needed | Status |
|---|------|-------------|--------|
| 16 | Processing plant layer | Nortura, Tine, BAMA locations | ✅ Done (30 plants) |
| 17 | Farm production layer | SSB Table 06462 | ✅ Done (50 sample farms) |
| 18 | Port/fisheries layer | Fiskeridirektoratet API | ✅ Done (25 ports) |
| 19 | "What If" scenario simulator | Econometric model | 🔲 Pending |
| 20 | "Follow the Food" journey | Product-specific case studies | 🔲 Pending |

---

## Part 3: Food Systems Phase 4 Roadmap

### Phase 4A: Infrastructure ✅ COMPLETE
1. ✅ Logistics hub layer (19 hubs)
2. ✅ Municipality search with autocomplete
3. ✅ Self-sufficiency dashboard
4. ✅ Municipality comparison mode
5. ✅ Mermaid diagrams (Food Flow, Value Chain)

### Phase 4B: Data Expansion ✅ COMPLETE
1. ✅ Farm locations (50 sample farms, 5 types)
2. ✅ Processing plant layer (30 facilities)
3. ✅ Port/fisheries layer (25 ports)
4. ✅ Aquaculture sites (Fiskeridirektoratet API - 1,782 sites)
5. 🔲 SSB API integration for real farm data

### Phase 4C: Advanced Visualizations ✅ COMPLETE
1. ✅ Food desert analysis (5km coverage circles)
2. ✅ Animated flow visualization (CSS SVG)
3. ✅ Vulnerability heat map (risk scoring by municipality)
4. ✅ Network graph visualization (force-directed Plotly)
5. ✅ Supply chain Sankey diagram (Plotly interactive)
6. ✅ Data export (CSV)

### Phase 5: Real Data Integration (In Progress)
1. ✅ Aquaculture sites layer (Fiskeridirektoratet API - 1,782 licensed facilities)
2. 🔲 SSB API integration for real farm data (Table 06462)
3. 🔲 "What If" policy simulator
4. 🔲 "Follow the Food" journey visualization

---

## Part 4: Immediate Actions

### Commit Current Work
```bash
git add .
git commit -m "docs: add comprehensive project plan and audit results"
```

### Suggested Agent Distribution

| Agent | Tasks | Priority |
|-------|-------|----------|
| Agent 1 | Tasks 1-2 (logistics hubs + InsightCards) | P1 |
| Agent 2 | Tasks 3-4 (Mermaid + Footer) | P1 |
| Agent 3 | Task 6 (Municipality search) | P2 |
| Agent 4 | Task 11 (Food desert analysis) | P2 |

---

## Part 5: Data Sources Status

| Source | Status | Priority |
|--------|--------|----------|
| Logistics hubs GeoJSON | ✅ Complete (19 hubs) | - |
| Store data (3,849) | ✅ Complete | - |
| Municipality metrics | ✅ Complete | - |
| SSB Demographics | ✅ Complete | - |
| Farms GeoJSON | ✅ Sample (50 farms) | P2 for real data |
| Processing plants | ✅ Complete (30 facilities) | - |
| Ports GeoJSON | ✅ Complete (25 ports) | - |
| Aquaculture sites | ✅ Complete (1,782 sites from Fiskeridirektoratet) | - |
| SSB Agriculture API | 🔲 Needs integration | P2 |

---

## Part 6: Visualization Priority Matrix

| Visualization | Impact | Effort | Status |
|---------------|--------|--------|--------|
| Logistics hub layer | High | Low | ✅ Done |
| Self-sufficiency cards | High | Low | ✅ Done |
| Mermaid diagrams | Medium | Low | ✅ Done |
| Municipality search | High | Medium | ✅ Done |
| Food desert analysis | High | High | ✅ Done |
| Farm locations layer | High | Medium | ✅ Done |
| Processing plants layer | High | Medium | ✅ Done |
| Ports layer | Medium | Medium | ✅ Done |
| Animated flows | Medium | High | ✅ Done |
| Vulnerability heat map | High | Medium | ✅ Done |
| Network graph | Medium | Medium | ✅ Done |
| Supply chain Sankey | High | Medium | ✅ Done |
| Data export (CSV) | Medium | Low | ✅ Done |
| "What If" simulator | High | Very High | 🔲 Phase 5 |

---

## Appendix: Key Hypotheses to Visualize

From research synthesis:

| ID | Hypothesis | Visualization |
|----|------------|---------------|
| H1 | Population follows Zipf | ZipfDistributionChart ✅ |
| H2 | Top 3 control >90% | ParentCompanyChart ✅ |
| H3 | Parent HHI > 2500 | LorenzCurveChart ✅ |
| H7 | 3-player equilibrium stable | CausalLoopDiagram ✅ |
| H15 | Market at carrying capacity | New: CapacityGauge |
| H16 | Single hub failure = cascade | VulnerabilityLayer ✅ |
| H18 | Top 3 hubs >80% centrality | SupplyNetworkGraph ✅ |

---

*Generated 2025-12-31 by Claude Code analysis*
