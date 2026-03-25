# Critical Project Review: Food Systems 2026
**Date:** 2026-03-25 | **Sprint:** 6 | **Reviewer:** Automated deep audit

---

## Executive Summary

Food Systems 2026 is a **mature, well-architected knowledge base** mapping Norwegian and Nordic food systems across corporate structures, supply chains, policy, and sustainability. After 6 sprints the project contains **424 documents, 212 companies, 71 theses, 61 reports, 76 actors, and 165 person profiles** in a PostgreSQL database with full-text search and pgvector semantic embeddings. A Next.js 16 frontend with 26 route pages, 18 chart components, and Leaflet mapping serves as the analytical interface.

However, this audit identifies **critical gaps in width and depth** that must be addressed before the June 2026 delivery. The project is strong on Norwegian grocery retail concentration but has significant blind spots in primary data collection, international academic coverage, digital retail transformation, consumer perspectives, and formal citation management.

---

## Part I: What We Have (Strengths)

### 1.1 Technical Infrastructure — Rating: Strong

| Component | Status | Detail |
|-----------|--------|--------|
| Database schema | 37 Prisma models | Comprehensive: companies, ownership, board interlocks, supply chains, properties, actors, documents, metrics |
| Data import pipeline | 42 TypeScript scripts | Idempotent upsert pattern, well-typed, covers all entity types |
| Frontend | 26 pages, 38 components | Full app with charts (Nivo/Recharts), maps (Leaflet), knowledge graph (force-graph-2d) |
| API layer | 8 REST endpoints | Search, companies, actors, documents, insights, sources, properties |
| Build & deploy | Docker + Coolify on Hetzner | Multi-stage build, standalone Next.js, Caddy reverse proxy |
| Semantic search | pgvector 1536-dim embeddings | Ready for AI-powered document retrieval |
| Data integrity | `verify-data-integrity.ts` | All referential integrity checks pass |

### 1.2 Research Corpus — Rating: Strong

| Category | Count | Quality |
|----------|-------|---------|
| Research documents (markdown) | 294 files / 343 MB | Well-organized in 30+ kategorier under `bibliotek/` |
| Primary source PDFs | 79 files | Government reports, annual reports, competition authority docs |
| Academic theses | 71 (indexed + synthesized) | Each with key findings, methodology, takeaways extracted |
| Policy reports | 61 (indexed + synthesized) | NOUs, Stortingsmeldinger, regulatory assessments |
| Source documents | 143 (tracked with metadata) | Manual IDs src-1 through src-109+, typed categorization |
| Key insights | 86 | Tagged, linked to documents and phases |

### 1.3 Corporate Data — Rating: Strong

| Metric | Count | Coverage |
|--------|-------|----------|
| Companies mapped | 212 | NO (140), SE (13), DK (6), FI (7), IS (6), other Nordic subsidiaries |
| Financial records | 303 | Multi-year revenue, margins, employees for major companies |
| Board members | 614 | Avg 3/company, personKey normalization for interlocking detection |
| Ownership structures | 150 | Parent-child chains 2-4 levels deep for major groups |
| Business relationships | 83 | Supplier, buyer, distributor, self-dealing, franchisor |
| Person profiles | 165 | Career trajectories, affiliations, interlocking tags |
| Properties | 127 | Warehouses, retail, logistics, with self-leasing detection |
| Shareholders | 86 | Ownership percentages, controlling flags |

### 1.4 Quantitative Data — Rating: Strong

| Dataset | Scope | Source |
|---------|-------|--------|
| Nordic price indices | 13 series (CPI/PPI/HICP), 2015-2026 monthly | SSB, SCB, Statfin, DST, Eurostat |
| Production/trade series | 12 series across 5 countries | National statistical offices |
| Trade group breakdowns | 30+ commodity flows (dairy, cereals, meat, fats) | Eurostat, national customs |
| Market concentration metrics | HHI, Zipf, Gini, Lorenz for all 5 countries | Computed from company data |
| Country metrics | 243 records | Self-sufficiency, margins, market share by country/year |
| GeoJSON layers | 15+ files | Stores, farms, aquaculture, municipalities, logistics |

### 1.5 Nordic Comparison — Rating: Moderate-Strong

Solid comparative data for the "big picture" across NO, SE, DK, FI, IS:
- Market concentration ratios and HHI per country
- Regulatory framework comparison (Lov om god handelsskikk vs Finnish §4a vs Swedish/Danish approaches)
- Self-sufficiency ratios
- Corporate ownership differences (cooperative vs listed vs family)
- Price level comparisons via Eurostat HICP

---

## Part II: Critical Gaps

### 2.1 PRIMARY DATA — Rating: CRITICAL GAP

**Zero first-person interviews conducted.**

The RESEARCH-MISSIONS.md document identifies 5 interview targets — supplier, Anders Nordstad, NMBU academic, Konkurransetilsynet contact, NCH leadership — but none have been executed. The whitepaper has strong quantitative foundations but **zero direct quotes**. This is the single most important gap for credibility.

| Interview Target | Priority | Status | Blocks |
|-----------------|----------|--------|--------|
| Supplier/producer (fear culture) | A | Not started | Whitepaper §3, §5, §6 |
| Anders Nordstad (infrastructure thesis) | A | Not started | Whitepaper §6.2 |
| NMBU academic (system dynamics) | A | Not started | Whitepaper §6.1 |
| Konkurransetilsynet (enforcement data) | A | Not started | Whitepaper §5 |
| NCH leadership (strategic framing) | B | Not started | Evidence Pack alignment |

**Impact:** Without stakeholder voices the whitepaper reads as desk research, not lived-experience policy analysis. Policymakers and peer reviewers will note this.

### 2.2 EVIDENCE PACK DELIVERABLES — Rating: CRITICAL GAP

| Evidence Pack Item | Status | Dependency |
|-------------------|--------|------------|
| 1. TG Charter (1 page) | NOT STARTED | Mission 3 (workshop) |
| 2. Decision Log | Operational, ongoing | — |
| 3. Commitment Map | NOT STARTED | Mission 3 (workshop) |
| 4. Pilot Brief (2 pages) | NOT STARTED | Missions 1-5 |
| 5. Adoption Track Note | PARTIAL | Mission 5 (regulatory docs) |
| 6. Finance Note (1 page) | NOT STARTED | Mission 7 (funding scan) |
| 7. Roadmap (1-3 yr) | NOT STARTED | Missions 6 + 7 |
| 8. Executive Brief (1 page) | DONE | — |

**Only 1 of 8 Evidence Pack items is complete.** June 2026 delivery requires all 8.

### 2.3 ACADEMIC CITATION SYSTEM — Rating: MODERATE GAP

**What's missing:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No `.bib` file or BibTeX export | High | Cannot generate formatted bibliographies for publication |
| No native DOI field in DB schema | High | DOIs scattered in JSON metadata or missing entirely |
| No ISBN/ISSN tracking | Medium | Cannot verify journal sources systematically |
| No access dates captured | Medium | Cannot verify link freshness for external URLs |
| 11 theses missing URLs | Low | Fixable with targeted lookup |
| 6 duplicate SourceDocs flagged but not cleaned | Low | Minor data quality issue |
| No citation API integration (Crossref, DataCite) | Medium | All metadata entered manually |
| DOI coverage only ~18% of academic sources | High | Limits discoverability and verification |

**Citation quality varies by source type:**
- Government documents: 95%+ complete (URL, author, year, institution)
- NHH theses: 95% complete
- International journals: 70% (DOI present but not always extracted)
- Grey literature/NGO reports: 50-70%
- Pre-2015 sources: Often incomplete

### 2.4 DOCUMENT STORAGE — Rating: SIGNIFICANT GAP

**No centralized PDF archive.** Currently:
- 79 PDFs in `research/` (mostly in evidence-pack/)
- Most academic sources link to external repositories (Handle.net, DiVA, NORA)
- Government documents link to regjeringen.no, lovdata.no
- No backup copies of critical external documents
- If external URLs break, source material is lost

**Risk:** Government websites restructure periodically. A URL that works today may 404 in 12 months. Critical documents (NOU 2011:4, Riksrevisjonen 2023, Dagligvarerapport 2024) should have local PDF copies.

### 2.5 DESK RESEARCH PLAN COMPLETION — Rating: MODERATE GAP

The `DESK-RESEARCH-PLAN.md` is a comprehensive 120+ item checklist. Cross-referencing with collected materials:

| Section | Items | Completed | Gap |
|---------|-------|-----------|-----|
| 1A: NOUs | 4 | 4 | None |
| 1B: Stortingsmeldinger | 3 | 3 | None |
| 1C: Proposisjoner | 3 | 2 | Høringssvar Dagligvaretilsynet avvikling |
| 2A: Konkurransetilsynet | 10 | 3 | **7 uncollected** (Nordic Food Markets 2005, Kartlegging innkjøpspriser, Dagligvarerapport 2022, Prisjusteringsvinduer, Dagligvarerapport 2023, Prisjeger-vedtaket, eldre rapporter) |
| 2B: Dagligvaretilsynet | 8 | 1 | **7 uncollected** (Samarbeidsklimaet 2022-2024, Årsrapporter 2022-2023, Strategi, Veiledninger) |
| 2C: Riksrevisjonen | 1 | 1 | None |
| 2D: Nordiske myndigheter | 3 | 2 | KFST Danmark |
| 3: Konsulentrapporter | 5 | 0 | **5 uncollected** (SØA EMV, Menon EMV, Oslo Economics, Copenhagen Economics, Vista Analyse) |
| 4A: NHH FOOD | 6 | 2 | **4 uncollected** (full publications list, "All retail sectors" article, Steen pubs, Foros pubs) |
| 4B: SIFO/OsloMet | 3 | 1 | Referansebudsjett, Forbrukertrender |
| 4C: NMBU | Broad | Partial | Systematic Brage search not completed |

**~23 specific desk research items remain uncollected from the plan's first 4 sections alone.**

---

## Part III: Gap Analysis by Domain

### 3.1 Width Coverage Matrix

| Domain | Depth | Breadth | Quality | Priority |
|--------|-------|---------|---------|----------|
| Norwegian grocery retail concentration | Deep | Comprehensive | High | Maintained |
| Corporate ownership structures | Deep | 14 major + subsidiaries | High | Maintained |
| Norwegian regulatory landscape | Deep | NOUs, laws, enforcement | High | Maintained |
| Nordic market comparison | Moderate | 5 countries, top-level | Medium-High | Expand depth |
| Price transmission & economics | Deep | 13 time series | High | Maintained |
| Supply chain & logistics | Moderate | 83 relationships mapped | Medium | Needs depth |
| Sustainability & circular economy | Moderate | 15+ sources | Medium | Expand |
| Food waste & matsvinn | Moderate | Nordic quantitative | Medium | Needs primary data |
| Food security & self-sufficiency | Moderate | 44% framing + Riksrevisjonen | Medium | Needs NIBIO methodology |
| **Consumer perspectives** | **Shallow** | **3 theses, 1 SIFO report** | **Low** | **Critical gap** |
| **Digital retail transformation** | **Shallow** | **Oda, Kolonial mentioned only** | **Low** | **Significant gap** |
| **HORECA / foodservice** | **Shallow** | **1 analysis document** | **Low** | **Moderate gap** |
| **Primary production (farming)** | **Moderate** | **Nortura, Tine, Felleskjøpet** | **Medium** | **Expand** |
| **Fisheries & aquaculture** | **Moderate** | **Mowi, SalMar, Lerøy in DB** | **Medium** | **Expand** |
| **International comparison (non-Nordic)** | **Minimal** | **OECD mentions only** | **Low** | **Gap** |
| **Worker/labor perspectives** | **Absent** | **Zero sources** | **None** | **Blind spot** |
| **Indigenous/Sami food systems** | **Absent** | **Zero sources** | **None** | **Blind spot** |
| **Urban food environments** | **Shallow** | **Food desert analysis started** | **Low-Med** | **In progress** |

### 3.2 Academic Coverage Gaps

**Well-covered institutions:**
- NHH (22 sources) — market concentration, pricing, competition
- NMBU (9 sources) — sustainability, food systems, agriculture
- SIFO/OsloMet (7 sources) — consumer research
- SLU Sweden (6 sources) — circular economy, agriculture

**Under-represented:**
| Gap Area | What's Missing | Why It Matters |
|----------|---------------|----------------|
| International food policy journals | Food Policy, Appetite, Nature Food, World Development | Global comparative lens; peer-reviewed evidence base |
| Supply chain logistics journals | Journal of Supply Chain Management, IJLM | Structural analysis of distribution networks |
| Digital transformation | E-commerce journals, platform economics | Oda/Kolonial/HelloFresh disruption potential |
| Labor economics | NNN union reports, ILO food sector studies | Worker perspective on concentration effects |
| Public health | Lancet Planetary Health, BMJ Global Health | Health impacts of food system structure |
| Agricultural economics | European Review of Agricultural Economics | Producer-side analysis |
| Political economy | Regulation & Governance, Competition & Change | Power dynamics theory |

**Thesis backlog:** 14 newly identified theses (2024-2025) in `MASTER-PHD-BACKLOG-2026.md` — not yet imported or synthesized.

### 3.3 Nordic Depth Gaps

| Country | Corporate Data | Regulatory Analysis | Market Metrics | Academic Sources | Verdict |
|---------|---------------|--------------------|---------|----|---------|
| Norway | Deep (140 companies) | Deep (NOUs, laws, KT reports) | Deep (full time series) | Deep (NHH, NMBU, SIFO) | Mature |
| Sweden | Moderate (13 companies) | Moderate (KV 2024:5, ICA/Axfood/Coop) | Moderate (price indices) | Moderate (6 SLU theses) | Needs deepening |
| Denmark | Shallow (6 companies) | Shallow (Salling/Coop mention) | Moderate (Eurostat data) | Shallow (3 AAU/CBS) | Significant gap |
| Finland | Shallow (7 companies) | Moderate (§4a well-documented) | Moderate (Statfin data) | Moderate (5 Aalto/LUT) | Needs company depth |
| Iceland | Minimal (6 companies) | Minimal | Minimal (some Eurostat) | Minimal (1-2 sources) | Major gap |

**Partner validation not yet completed:** Michel Bajuk (Sweden) and Betina Simonsen (Denmark) have not yet confirmed our market share estimates.

---

## Part IV: Document & Source Architecture Assessment

### 4.1 Storage Architecture (Three-Layer System)

```
Layer 1: PostgreSQL (Prisma)          ← Structured, queryable, API-accessible
  424 Documents + 143 SourceDocs + 71 Theses + 61 Reports + 86 Insights

Layer 2: TypeScript Data Files        ← Source of truth for imports
  src/lib/data/theses.ts, reports.ts, sources.ts, insights.ts

Layer 3: Markdown Research Corpus     ← Narrative context, deep analysis
  294 files in research/bibliotek/ organized by 30+ categories
```

**Strength:** Multiple access patterns (programmatic, API, human-readable)
**Weakness:** Data can drift between layers if not kept in sync. TypeScript files are the import source; if markdown analysis evolves without updating TS data, DB becomes stale.

### 4.2 Citation Format Assessment

**Current approach:** Modified APA in Norwegian markdown with enhancements (URL, Relevans, Nøkkelfunn). Inconsistent across files — some use Harvard, some APA, some informal.

**Recommendations for publication-grade citations:**
1. Add `doi`, `isbn`, `issn`, `accessDate` fields to Prisma schema
2. Create BibTeX export endpoint (`/api/citations/bibtex`)
3. Standardize on a single citation format (APA 7th recommended for policy/social science)
4. Implement automated URL health checking (dead link detection)
5. Archive critical PDFs locally with consistent naming

### 4.3 Source Quality Pyramid

```
                    ┌─────────────────┐
                    │  Peer-Reviewed   │  ~25 sources (18% of academic)
                    │  Journal Articles │  DOI available, highest credibility
                    ├─────────────────┤
                    │  Government       │  ~40 sources
                    │  Documents (NOU,  │  Primary authority, fully URL'd
                    │  Meld. St., KT)   │
                    ├─────────────────┤
                    │  Academic Theses   │  71 sources
                    │  (Master/PhD)      │  Synthesized, some lacking URLs
                    ├─────────────────┤
                    │  Institutional     │  ~30 sources
                    │  Reports (SIFO,    │  Mixed quality, good coverage
                    │  AgriAnalyse)      │
                    ├─────────────────┤
                    │  Industry/Annual   │  ~20 sources
                    │  Reports           │  Self-reported data, bias risk
                    ├─────────────────┤
                    │  Grey Literature   │  ~30 sources
                    │  (NGO, think tank, │  Variable quality
                    │  media, blogs)     │
                    └─────────────────┘
```

**Assessment:** The pyramid is **bottom-heavy** — more grey literature and institutional reports than peer-reviewed articles. For academic credibility, increasing the top layers (peer-reviewed + government) is critical.

---

## Part V: Recommended Actions

### Tier 1: Critical Path (Before June 2026 Delivery)

| # | Action | Owner | Impact |
|---|--------|-------|--------|
| 1 | **Execute stakeholder interviews** (Mission 1) | Gabriel/Cathrine | Transforms whitepaper from desk research to narrative |
| 2 | **Complete TG Charter + Stakeholder Map workshop** (Mission 3) | Gabriel/Cathrine/Einar | Unlocks Evidence Pack items #1, #3 |
| 3 | **Send Nordic partner validation** (Mission 2) | Gabriel | Confirms/corrects market share data |
| 4 | **Import 14 MASTER-PHD-BACKLOG theses** | Claude | Adds 2024-2025 academic coverage |
| 5 | **Import 12 Bærekraft SEC-MAT files** (src-110+) | Claude | Rich sector analysis on sustainability, bioeconomy, proteins, aquaculture |
| 6 | **Collect 23 uncollected desk research items** | Claude | Fills Konkurransetilsynet, Dagligvaretilsynet, consultant report gaps |

### Tier 2: Strengthens Analysis

| # | Action | Owner | Impact |
|---|--------|-------|--------|
| 7 | **Archive critical PDFs locally** | Claude | Protects against URL rot (NOU 2011:4, Riksrevisjonen, Dagligvarerapport) |
| 8 | **Add DOI/ISBN/ISSN fields to Prisma schema** | Claude | Enables formal citation export |
| 9 | **Expand international journal coverage** | Claude | 10-15 key articles from Food Policy, Nature Food, etc. |
| 10 | **Deepen Danish and Icelandic data** | Claude | Currently weakest Nordic countries |
| 11 | **Create BibTeX/citation export** | Claude | Publication readiness |
| 12 | **Run NIBIO self-sufficiency methodology verification** | Human/Claude | Validate the 44% claim methodology |

### Tier 3: Completeness & Polish

| # | Action | Owner | Impact |
|---|--------|-------|--------|
| 13 | **Map digital retail disruption** (Oda, Kolonial, HelloFresh, Mathem) | Claude | Emerging competitive dynamics |
| 14 | **Add consumer/labor perspective sources** | Claude | Currently blind spots |
| 15 | **Complete open data retrieval** (Mission 4) | Human/Claude | Municipal HHI, commodity trade |
| 16 | **Build citation graph visualization** | Claude | DocumentRef relationships visible |
| 17 | **Fix Google Drive MCP** | Human | Unlocks AHO gigamapping, Helsinki workshop, MEC docs |
| 18 | **Explore Sami/indigenous food systems** | Claude | Currently absent perspective |
| 19 | **Develop pilot concept briefs** (Mission 6) | Human workshop | Evidence Pack #4 |
| 20 | **Map funding landscape** (Mission 7) | Claude/Human | Evidence Pack #6 |

---

## Part VI: Data Completeness Scorecard

### Overall Project Health

| Dimension | Score | Justification |
|-----------|-------|---------------|
| Technical infrastructure | 9/10 | Mature stack, clean schema, working pipeline |
| Norwegian market analysis | 8/10 | Deep quantitative + regulatory, missing voices |
| Nordic comparison | 6/10 | Good framework, shallow in DK/IS, unvalidated |
| Academic sourcing | 6/10 | 71 theses strong, but journal coverage weak |
| Citation management | 4/10 | No formal system, scattered DOIs, no export |
| Document preservation | 5/10 | 79 PDFs local, most sources external-only |
| Primary data (interviews) | 1/10 | Zero conducted |
| Evidence Pack | 2/10 | 1 of 8 items complete |
| Consumer/labor perspective | 2/10 | Near-absent |
| Supply chain depth | 5/10 | 83 relationships mapped but thin beyond top-level |
| Sustainability integration | 6/10 | Good framework docs, needs primary data |
| **Overall** | **5.5/10** | **Strong desk research foundation; critical gaps in primary data, evidence deliverables, and citation rigor** |

### Path to 8/10 by June 2026

Execute Tier 1 actions (items 1-6) to reach 7/10. Add Tier 2 items 7-12 for 8/10. This is achievable if human missions (interviews, workshop, partner validation) start within 1 week.

---

## Part VII: Detailed Missing Sources

### 7.1 Specific Documents to Collect (Desk Research Plan Gaps)

**Konkurransetilsynet (7 items):**
1. Nordic Food Markets (2005) — historical baseline
2. Kartlegging av innkjøpspriser (2017-2023) — purchasing price investigation
3. Dagligvarerapport 2022 — annual market report
4. Utredning om prisjusteringsvinduer (2023) — price adjustment windows
5. Dagligvarerapport 2023 — annual market report
6. Prisjeger-vedtaket — the landmark NOK 4.9B fine decision
7. All older Dagligvarerapporter (2011-2021) — historical trend analysis

**Dagligvaretilsynet (7 items):**
1. Samarbeidsklimaet 2022 — trading climate survey
2. Samarbeidsklimaet 2023 — trading climate survey
3. Samarbeidsklimaet 2024 — trading climate survey
4. Årsrapport 2022 — annual report
5. Årsrapport 2023 — annual report
6. Strategidokumenter — strategic plans
7. Veiledninger og tolkningsuttalelser — guidance documents

**Consultant Reports (5 items):**
1. SØA: EMV og vertikal integrasjon (2023) — private labels study
2. Menon Economics: EMV og innovasjon (3 reports, 2022) — commissioned by Virke
3. Oslo Economics: "Konkurransen bedre enn sitt rykte" (2024) — commissioned by NorgesGruppen
4. Copenhagen Economics — grocery sector analyses
5. Vista Analyse — food/grocery studies

**Academic (4 items):**
1. NHH FOOD full publications list
2. "All retail sectors are highly concentrated" (NHH 2024)
3. Frode Steen complete publication archive
4. Øystein Foros complete publication archive

### 7.2 Missing External Project Integration

| Source | Location | Status | Content |
|--------|----------|--------|---------|
| Bærekraft SEC-MAT (12 files) | `~/Documents/Bærekraft Kartlegging Prosjekt/` | Identified, not imported | Rich sector analysis: regulation, bioeconomy, PPWR, proteins, aquaculture, regenerative |
| Google Drive materials | Various | Blocked (MCP auth broken) | AHO gigamapping, Helsinki workshop, ECESP, MEC-project |
| Circular Cities SA-02 | `~/Documents/Circular Cities 2026/` | Cross-referenced only | 382-line Nordic food/biomasse sector analysis |

### 7.3 Missing Nordic Academic Sources

**14 theses in MASTER-PHD-BACKLOG (2024-2025, not imported):**
- Sundin (SLU 2024 PhD) — Food waste prevention
- Berntzen (NMBU 2024) — Carbon footprint of Norwegian diets
- Holmgren (Uppsala 2025) — Platform competition in grocery
- Lindquist (KTH 2024) — Supply chain digitalization
- Rasmussen (CBS 2025) — Danish retail concentration post-Aldi
- And 9 more across Aalto, LUT, Tampere, AAU, UiO

---

## Part VIII: Architecture & Build Assessment

### 8.1 Build System

**Health: Good.** The build pipeline (`prisma generate → compute-metrics → next build`) is well-structured. Docker multi-stage build produces a lean standalone image. No significant technical debt in the build system.

**Minor concerns:**
- No automated tests (jest/vitest not configured)
- No CI/CD pipeline (GitHub Actions not set up)
- No linting beyond Next.js defaults
- `compute-chart-metrics.ts` at 13K is the most complex script — could benefit from modularization

### 8.2 Data Pipeline

**Health: Good.** The 42-script import system is well-organized with idempotent upserts. Each corporate tree has its own dedicated importer.

**Concerns:**
- All data is hardcoded in TypeScript files, not fetched from APIs at runtime
- No automated data refresh (offentligdata, SSB APIs could be scheduled)
- No data versioning — if a company's financials change, old values are overwritten
- Import scripts are large (import-company-data.ts = 76K) — maintenance risk

### 8.3 Schema Design

**Health: Excellent.** The 37-model schema is well-normalized with appropriate indexes, GIN for tags/arrays, and flexible JSON metadata fields.

**Missing models/fields that would strengthen the project:**
1. `doi`, `isbn`, `issn`, `accessDate` on Document
2. `AcquisitionEvent` model for M&A history tracking
3. `RegulatoryFiling` model for enforcement action tracking
4. `ESGScore` model for sustainability ratings
5. `PriceDataPoint` for product-level pricing (currently only aggregate CountryMetric)
6. Historical snapshots for CompanyOwnership (effectiveFrom/To exist but rarely populated)

---

## Appendix A: File Inventory Summary

| Category | Files | Size | Location |
|----------|-------|------|----------|
| Source code (src/) | 201 TS/TSX | 4.0 MB | `src/` |
| Import scripts | 42 TS + 5 PY | 752 KB | `scripts/` |
| Research corpus | 294 MD + 79 PDF | 343 MB | `research/` |
| Data files (JSON/CSV) | 133 JSON + 66 CSV | 19 MB | `research/data/` |
| GeoJSON layers | 15+ files | 13 MB | `public/data/` |
| Database schema | 1 file / 617 lines | 20 KB | `prisma/` |
| Project docs | 7 files | — | `.claude/` |
| **Total** | **~850 files** | **~380 MB** | — |

## Appendix B: Database Record Counts (Sprint 6)

| Model | Records | Notes |
|-------|---------|-------|
| Company | 212 | NO 140, SE 13, DK 6, FI 7, IS 6, other 40 |
| CompanyFinancial | 303 | Multi-year, ~80% have 2024 data |
| BoardMember | 614 | Interlocking detection via personKey |
| CompanyOwnership | 150 | 2-4 level depth |
| CompanyProperty | 127 | With selfLeased flag |
| BusinessRelationship | 83 | supplier/buyer/distributor/self-dealing |
| PersonProfile | 165 | Career trajectories |
| Shareholder | 86 | Ownership percentages |
| Actor | 76 | NGO/gov/industry/academic |
| Document | 424 | Research corpus |
| Thesis | 71 | Master + PhD |
| Report | 61 | Policy + institutional |
| SourceDoc | 143 | Tracked with metadata |
| Insight | 86 | Key findings |
| CountryMetric | 243 | 5 countries x multiple metrics/years |
| MediaTheme | — | Narrative tracking |
| ResearchPrompt | — | Research question backlog |

## Appendix C: External Dependencies & Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| External URL rot (gov sites restructure) | High | Medium | Archive critical PDFs locally |
| Nordic partner data unvalidated | Certain | Medium | Execute Mission 2 |
| Google Drive MCP remains broken | Medium | Low-Med | Re-authorize; manual download as fallback |
| Interview targets decline | Medium | High | Prepare alternatives; offer anonymity |
| Prisma/Next.js breaking upgrade | Low | Medium | Pin versions; test before upgrading |
| Database scaling (pgvector + 424 docs) | Low | Low | Current load well within limits |
| Bærekraft SEC-MAT files not imported | Medium | Medium | Schedule import sprint |

---

*This review was generated through automated deep exploration of the project codebase, database schema, research corpus, and project documentation on 2026-03-25.*
