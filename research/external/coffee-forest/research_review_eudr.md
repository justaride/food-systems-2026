---
source: local
original_path: ~/Documents/Coffee&Forest/research_review_eudr.md
relevance: "HØY (EUDR regulatory analysis, Norway-specific compliance findings)"
copied: 2026-03-19
---

# Research Review: EUDR Compliance & Technical Feasibility for Fuglen Coffee

**Status**: APPROVED (Ready for PRD)

## 1. Objectivity Check
- [x] **No Solutioning**: The research focuses on regulatory requirements and API specifications, not hypothetical architecture.
- [x] **Unbiased Tone**: Findings are based on official EU commission documents and EEA agreement texts.
- [x] **Strict Documentation**: Documents the exact "cut-off date" (Dec 31, 2020) and data formats.

## 2. Evidence & Depth
- [x] **Code/Spec References**:
    - **API**: EUDR Information System uses a WSDL (SOAP/XML) for submission and accepts GeoJSON for location data.
    - **Geolocation**: Explicit rule found for plots <4ha (Point) vs >4ha (Polygon).
    - **Precision**: 6 decimal digits required (approx. 11cm precision).
- [x] **Specificity**:
    - **Norway Context**: Confirmed Coffee is **included** in Norway's EUDR implementation (EEA), unlike cocoa/soy which are excluded. This is a critical verified fact.

## 3. Findings Summary (The "Law as Code")

| Requirement | Technical Spec | Impact on Fuglen |
| :--- | :--- | :--- |
| **Output Artifact** | `Due Diligence Statement` (DDS) via API | Need an engine to generate valid XML/JSON payloads. |
| **Traceability** | **<4ha**: Point (Lat/Long)<br>**>=4ha**: Polygon (GeoJSON) | Need a "Data Collection" interface for small farmers/co-ops to input simple points, and larger estates to upload shapefiles. |
| **Verification** | "Deforestation-free" status (Post-2020) | Need to overlay user-submitted GeoJSONs against satellite data (e.g., Global Forest Watch or Sentinel) *before* submission. |
| **Norway Status** | **Coffee is IN** | Fuglen must comply fully. No "EEA loophole" for coffee. |

## 4. Competitive Landscape & Gap
- **Existing Tools**: TraceX, Meridia, Farmer Connect.
- **The Gap**: Most are enterprise-scale "black boxes". Fuglen's "fragmented data" reality (direct relationships but manual systems) requires a **"Bridge Tool"**:
    - Focus: Data Aggregation & Cleaning (turning messy Excel/WhatsApp coords into valid GeoJSON).
    - Focus: Pre-submission verification (don't submit to EU until green).

## 5. Actionable Feedback for PRD
The PRD can now be drafted with specific technical goals:
1.  **Define "Data Ingest" CUJ**: handling both "Point" and "Polygon" inputs.
2.  **Define "Verification" CUJ**: "Active" check against satellite layers (as requested by user).
3.  **Define "Submission" CUJ**: Generating the XML/JSON for the EU portal.
