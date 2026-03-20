# Deep Research Pipeline -- Food Systems 2026

## Overview

10-session systematic research pipeline to map Norwegian/Nordic food system corporate structures, stakeholders, supply chains, and policy landscape. Each session uses parallel subagents via the Agent tool.

**Session 1 is complete.** Schema migration done, import infrastructure ready.

---

## Execution Batches

```
Batch 1:  S1 (schema + scripts)           -- COMPLETE
Batch 2:  S2 + S4 + S7  (parallel)        -- COMPLETE (corporate NO + Nordic + academic)
Batch 3:  S3 + S5 + S8  (parallel)        -- COMPLETE (verification + supply chain + circular)
Batch 4:  S6 + S9       (parallel)        -- COMPLETE (people + financials)
Batch 5:  S10           (verification)     -- PENDING
```

---

## Session 1 -- Schema Migration & Import Infrastructure [COMPLETE]

**Output delivered:**
- 4 new Prisma models: CompanyOwnership, CompanyProperty, BusinessRelationship, PersonProfile
- Extended graph.ts with person/property nodes and ownership/relationship edges
- Import scripts: import-company-ownership.ts, import-person-profiles.ts
- Extended import-company-data.ts with property support
- Seed data: 1 ownership (NorgesGruppen->ASKO), 1 relationship, 2 person profiles

---

## Session 2 -- Norwegian Corporate Deep Structure

**Goal**: Map the Big 3 Norwegian grocery retailers down to subsidiaries, property ownership, and self-dealing patterns.

**Subagents**: 3 parallel

### Subagent 2.1: NorgesGruppen
Full corporate tree: NorgesGruppen ASA -> ASKO -> Kiwi -> Meny -> Joker -> Spar -> all subsidiaries.
- Property ownership patterns, self-dealing flags
- Distribution infrastructure (ASKO warehouses)
- BAMA relationship (46% ownership)
- Key orgNrs to look up: 911856655 (NorgesGruppen), 929094636 (ASKO)

### Subagent 2.2: Coop Norge
Coop Norge SA -> Coop Norge Handel -> Extra -> Obs -> Prix -> regional samvirkelag.
- Cooperative ownership model details
- Property holdings and logistics
- Key orgNr: 879469062

### Subagent 2.3: Reitan Retail
Reitan AS -> REMA 1000 -> Reitan Distribution -> Reitan Convenience -> Uno-X.
- Family ownership structure
- Franchise model details
- Key orgNr: 935174627

**Data sources**: Bronnoysund API (`data.brreg.no/enhetsregisteret/api/enheter/{orgNr}`), offentligdata MCP, web research

**Output**: For each company group:
- New Company records (with orgNr, financials, board)
- CompanyOwnership records (parent->child trees)
- CompanyProperty records (warehouses, retail, offices)
- BusinessRelationship records (distributor, self-dealing, franchise)
- Write data into `scripts/import-company-data.ts` (extend companies array) and `scripts/import-company-ownership.ts` (extend ownership/relationship arrays)

---

## Session 3 -- Registry Verification & Property/Infrastructure Mapping

**Goal**: Cross-check all corporate data against official sources. Map physical infrastructure.

**Subagents**: 2 parallel

### Subagent 3.1: Bronnoysund verification
- Cross-check all corporate data against official registry
- Verify org numbers, board compositions, sub-unit registrations
- API: `data.brreg.no/enhetsregisteret/api/enheter/{orgNr}` and `/underenheter`
- Check all companies in the database + any new ones from Session 2

### Subagent 3.2: Property & infrastructure mapping
- Map warehouses, distribution centers, retail locations for top 5 companies
- Identify self-leasing patterns (company owns property, leases to own subsidiary)
- Geocode key locations (lat/lng) for map visualization
- Focus: ASKO distribution network, Coop logistics centers, REMA distribution

**Output**: Verified corporate data, CompanyProperty records with coordinates, self-dealing flags

---

## Session 4 -- Nordic Corporate Structure Comparison

**Goal**: Map equivalent food retail structures in Sweden, Denmark, Finland, Iceland for comparative analysis.

**Subagents**: 4 parallel (1 per country)

### Subagent 4.1: Sweden
- ICA Gruppen, Axfood (Willys, Hemkop), Bergendahls
- Swedish market concentration, ownership models
- Use `country: 'SE'` for all companies

### Subagent 4.2: Denmark
- Salling Group (Netto, Fotex, Bilka), Coop Danmark, REMA 1000 DK
- Danish retail consolidation
- Use `country: 'DK'`

### Subagent 4.3: Finland
- S Group, K Group (Kesko), Lidl Finland
- Finnish cooperative model
- Use `country: 'FI'`

### Subagent 4.4: Iceland
- Hagar (Bonus, Kronan), Samkaup
- Small-market dynamics, import dependency
- Use `country: 'IS'`

**Output**: New Company records with `country` set to SE/DK/FI/IS. Ownership trees, market share data, cross-border relationships.

**Important**: Nordic companies should be added to `import-company-data.ts` in a separate array (e.g., `nordicCompanies`). Use web search for company registry data since Bronnoysund only covers Norway.

---

## Session 5 -- Supply Chain & Logistics Infrastructure

**Goal**: Map the full farm-to-retail supply chain for key product categories.

**Subagents**: 3 parallel

### Subagent 5.1: Distribution & logistics
- ASKO distribution network (14 regional warehouses)
- Coop logistics infrastructure
- Bama Group fruit/veg supply chain
- Nortura meat distribution
- Focus on CompanyProperty records with propertyType 'warehouse' | 'logistics'

### Subagent 5.2: Primary production
- Tine (dairy cooperative), Nortura (meat cooperative)
- Marine Harvest/Mowi, SalMar, Leroy (seafood)
- Felleskjopet (grain/feed)
- Map cooperative structures and farm-to-retail chains

### Subagent 5.3: Import/export
- Fresh produce import chains (Bama, other importers)
- Grain imports (Felleskjopet, Lantmannen)
- Seafood exports (Mowi, SalMar, Leroy, Norwegian Seafood Council)
- Trade flow data, key trading partners, port infrastructure

**Output**: BusinessRelationship records (supplier chains), CompanyProperty records (logistics facilities), new Company records for supply chain actors not yet in DB

---

## Session 6 -- Individual Stakeholder & Board Interlock Mapping

**Goal**: Build comprehensive PersonProfile records and detect board interlock networks.

**Subagents**: 3 parallel

### Subagent 6.1: Board interlocks
- Map all board members across all mapped companies
- Detect shared directors using personKey normalization
- Build interlock network data
- Extend import-person-profiles.ts with comprehensive profiles

### Subagent 6.2: Executive profiles
- CEO/CFO/COO profiles for top 20 companies
- Career histories, cross-company movements
- Public positions on food policy
- PersonProfile records with detailed roles arrays

### Subagent 6.3: Policy & advocacy
- NHO Mat og Drikke leadership
- Virke Dagligvare representatives
- Norsk Landbrukssamvirke leaders
- Consumer org leaders (Forbrukerradet)
- Map individual influence networks

**Output**: PersonProfile records, board interlock edges for graph, influence network data

---

## Session 7 -- Academic & Regulatory Research Deep-Dive

**Goal**: Gather academic research, policy documents, and regulatory data.

**Subagents**: 4 parallel

### Subagent 7.1: Norwegian academic
- NHH food research (extend existing nhh-food/ corpus)
- NMBU agricultural economics
- SIFO consumer research
- Use PubMed MCP + web search

### Subagent 7.2: Nordic policy
- Nordic Council of Ministers food reports
- NordForsk projects
- OECD Nordic food system reviews

### Subagent 7.3: EU regulatory
- Farm to Fork Strategy implementation status
- EU food supply chain directive
- Competition law cases applicable to Nordic food retail

### Subagent 7.4: Sustainability research
- EAT-Lancet updates
- Planetary boundaries research relevant to food
- Circular food economy papers
- Food waste data (extend existing corpus)

**Output**: New Document records with full metadata. Write research findings into research/ directory as markdown files, then import via import-research-docs.ts.

**Important**: Documents go in `research/` subdirectories by topic. The import script reads markdown files from there.

---

## Session 8 -- Circular Economy & Sustainability Data

**Goal**: Map circular economy initiatives and sustainability metrics.

**Subagents**: 3 parallel

### Subagent 8.1: Food waste data
- Matvett/ForMat data
- Nordic food waste statistics
- Company-level waste reporting
- Time-series where available

### Subagent 8.2: Circular initiatives
- Too Good To Go, Holdbart, Oda (online grocery)
- Alternative protein companies in Norway
- Map as new Company records + BusinessRelationship records

### Subagent 8.3: Climate & environmental
- Food system emissions data (Norway, Nordic)
- Land use statistics, water footprint data
- SSB agricultural statistics
- Milj0direktoratet reports

**Output**: New Company records for circular economy actors, CountryMetric records for environmental data, Document records for reports

---

## Session 9 -- Financial Time-Series & Market Dynamics

**Goal**: Extend financial data from single-year to multi-year, plus market concentration analysis.

**Subagents**: 3 parallel

### Subagent 9.1: Financial data
- Extend existing 2024-only financials to 2020-2025 where available
- Revenue, profit margins, employee counts
- Sources: Proff.no, annual reports
- Add CompanyFinancial records for each year

### Subagent 9.2: Market concentration
- HHI calculations for Norwegian grocery market
- Market share time-series (NorgesGruppen/Coop/Reitan/others)
- Price comparison data
- Konkurransetilsynet reports and decisions
- CountryMetric records for market data

### Subagent 9.3: Investment & M&A
- Recent acquisitions in Nordic food sector
- Investment rounds, new market entries
- Private equity in Nordic food (EQT, Summa Equity)
- Map as CompanyOwnership + BusinessRelationship records

**Output**: Extended CompanyFinancial records, CountryMetric records, M&A ownership/relationship records

---

## Session 10 -- Verification, Cross-Check & Integration

**Goal**: Final data quality pass and integration verification.

### Phase A (parallel):

#### Subagent 10.1: Data integrity
- Cross-check all new records against official sources
- Verify org numbers, ownership percentages, board compositions
- Flag inconsistencies

#### Subagent 10.2: Completeness audit
- Identify gaps: companies without ownership trees, people without profiles, missing relationships
- Generate gap report

### Phase B (after Phase A):

#### Subagent 10.3: Database integration
- Run all import scripts in order
- Verify record counts
- Check referential integrity (no dangling foreign keys)
- Generate coverage report

#### Subagent 10.4: Visualization & export
- Test knowledge graph with new data (all node types render)
- Verify map coordinates for CompanyProperty records
- Validate all visual models render correctly

**Verification criteria:**
- All company ownership trees verified against Bronnoysund
- All PersonProfile records have at least 1 verified role
- All CompanyProperty records have municipality + type
- All BusinessRelationship records have source attribution
- Knowledge graph renders without orphan nodes
- Map view shows all geocoded properties
- Database referential integrity: 0 dangling foreign keys

---

## Data Source Reference

| Session | Primary Sources |
|---------|----------------|
| S2 | Bronnoysund API, offentligdata MCP, web |
| S3 | Bronnoysund API, Kartverket, web |
| S4 | Swedish/Danish/Finnish/Icelandic company registries, web |
| S5 | Company annual reports, SSB, web |
| S6 | Bronnoysund board data, LinkedIn (public), web |
| S7 | PubMed MCP, Google Scholar, institutional repos |
| S8 | Matvett, SSB, Milj0direktoratet, web |
| S9 | Proff.no, annual reports, Konkurransetilsynet |
| S10 | All previous session outputs |

---

## How to Run a Session

1. Open a new Claude Code window in the project directory
2. Tell Claude which session you're running: "Run Session N from DEEP-RESEARCH-PLAN.md"
3. Claude will read this file + CLAUDE.md for full context
4. Use subagents as specified (parallel where indicated)
5. Write data into the appropriate import scripts
6. Run `npx tsx scripts/<script>.ts` to import
7. Verify with record counts

### Subagent prompt template

When spawning research subagents, include:
- Which company/topic to research
- What data models to populate (refer to CLAUDE.md schema)
- What data sources to use
- Expected output format (TypeScript data arrays matching import script types)
- Existing orgNrs from CLAUDE.md so they can link to existing companies
