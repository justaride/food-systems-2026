# Gap List: Items Requiring Human Input Before Finalization

**Date:** March 2026
**Status:** Post-review of Draft v1.1
**Purpose:** Identifies what the whitepaper cannot resolve without human stakeholders

---

## 1. Critical Gaps (Must resolve before June 2026 delivery)

### 1.1 TG Charter
- **What:** 1-page mandate with North Star and success criteria
- **Who:** Gabriel + Cathrine (with Einar/Martin approval)
- **Why:** Evidence Pack requirement #1; frames the entire project
- **Ten Step Start:** Step 1

### 1.2 Stakeholder Mapping / Commitment Map
- **What:** Prioritized stakeholder map with specific "asks" per actor
- **Who:** Gabriel + Cathrine + Einar
- **Why:** Evidence Pack requirement #3; needed for mobilization
- **Priority actors:** Konkurransetilsynet, NMBU (food systems group), Nordic Edge, Vestland grønn region
- **Ten Step Start:** Step 3

### 1.3 Nordic Data Validation
- **What:** Confirm DK/SE/FI market shares and regulatory details with local partners
- **Who:** Michel Bajuk (Sweden/Cradlenet), Betina Simonsen (Denmark/LDCluster)
- **Why:** Nordic market data (§4.1) uses estimates with ±2–3% uncertainty; partner validation increases credibility
- **Specific checks:**
  - Sweden: Confirm Coop Sverige's operating loss (SEK 2.7B) and current market share
  - Denmark: Confirm Aldi exit redistribution among remaining players
  - Finland: Confirm §4a enforcement cases beyond Valio EUR 600K

---

## 2. Important Gaps (Strengthen whitepaper quality)

### 2.1 Stakeholder Voices / Interviews
- **What:** Direct quotes or interview excerpts from key actors
- **Who:** Gabriel + Cathrine to conduct
- **Suggested interviews:**
  - Supplier/producer: illustrate "fear culture" with a real voice
  - Anders Nordstad: direct commentary on infrastructure thesis
  - NCH leadership (Einar/Martin): Nordic collaboration perspective
  - NMBU academic: scholarly framing of system dynamics
- **Impact:** Transforms data-driven analysis into compelling narrative

### 2.2 Pilot Concepts (2–5 proposals)
- **What:** Concrete, scoped pilot proposals linked to transition levers
- **Who:** Entire TG (brainstorm session)
- **Potential pilots:**
  - Open logistics access feasibility study (lever 2)
  - Finnish §4a impact assessment for Norwegian context (lever 1)
  - REKO ring / direct sales scaling analysis
  - Food desert mapping using municipal HHI data
- **Ten Step Start:** Step 7
- **Evidence Pack:** Pilot Brief (#4)

### 2.3 Adoption Track Note
- **What:** 1-page note on adoption mechanisms (procurement standards, policy instruments)
- **Who:** Gabriel + Cathrine
- **Ten Step Start:** Step 7 (adjacent)
- **Evidence Pack:** #5

---

## 3. Phase 2 Gaps (June–December 2026)

### 3.1 Finance Note
- **What:** 1-page funding strategy (NIB, EIB, Nordic Innovation, other sources)
- **Who:** Martin/Einar
- **Evidence Pack:** #6

### 3.2 Roadmap (1–3 years)
- **What:** Implementation plan with milestones and owners
- **Who:** Entire TG (requires strategic decisions)
- **Evidence Pack:** #7
- **Ten Step Start:** Step 10

### 3.3 Decision Log
- **What:** Running log of formal decisions taken by TG
- **Who:** TG secretary (ongoing operational document)
- **Evidence Pack:** #2

---

## 4. Data Gaps (Would strengthen analysis but not blocking)

### 4.1 Municipal HHI Computation
- **What:** Point-in-polygon matching of 3,849 stores to 357 municipalities → per-municipality HHI
- **Requires:** GIS computation (store coordinates already available in `brocode-kart/data/stores.json`)
- **Value:** Would reveal "food deserts" and local monopolies hidden by national averages
- **Current status:** `municipal_hhi` section in JSON is empty (n_municipalities: 0)

### 4.2 Time-Series Revenue Shares
- **What:** Annual revenue-based market shares over 10–15 years
- **Why:** Would test whether concentration trend is truly stable or slowly increasing
- **Source:** Konkurransetilsynet annual reports, NHH FOOD archives

### 4.3 Price-Level Comparison (PPP)
- **What:** Actual price levels (not just indices) across Nordic countries
- **Why:** Would quantify the "price premium" Norwegian consumers pay vs. neighbors
- **Source:** Eurostat PPP data, Nordic Council price surveys

---

## 5. Corrections Applied in Review (v1.0 → v1.1)

| Issue | Section | Correction |
|-------|---------|------------|
| **Top-3 share inconsistency** | §4.1 | Norway's Top-3 changed from 93% to ~97% with footnote explaining revenue vs. store-count methodology |
| **Asymmetric price claim** | §3.4, §3.6 | "3–4× faster" hedged to "3–5× in individual months" with specific example (Jan 2025) |
| **Seafood export value** | §1.2 | "NOK 175 billion" corrected to "NOK 175.4 billion" per trade data |
| **Dual methodology note** | §2.3 | Added limitation #5 explaining store-count vs. revenue share dual methodology |

---

## 6. Evidence Pack Coverage Summary

| Evidence Pack Document | Status | Action Needed |
|------------------------|--------|---------------|
| 1. TG Charter (1 page) | **GAP** | Gabriel + Cathrine to draft |
| 2. Decision Log | **GAP** | Ongoing operational document |
| 3. Commitment Map | **GAP** | Stakeholder mapping session |
| 4. Pilot Brief (2 pages) | **PARTIAL** | Transition levers identified; need scoped pilots |
| 5. Adoption Track Note | **PARTIAL** | Regulatory mapping done; need adoption mechanisms |
| 6. Finance Note | **GAP** | Martin/Einar (phase 2) |
| 7. Roadmap (1–3 yr) | **GAP** | Requires strategic decisions (phase 2) |
| 8. Executive Brief (1 page) | **DONE** | See `executive-brief.md` |

---

*This gap list accompanies the reviewed whitepaper draft (v1.1). Items are prioritized by delivery deadline (June 2026) and Evidence Pack requirements.*
