---
source: local
original_path: ~/Documents/Coffee&Forest/docs/fuglen/SOURCES.md
relevance: "MIDDELS (source map for Fuglen implementation docs)"
copied: 2026-03-19
---

# Fuglen Docs - Source Map

Raw source material lives in `Fuglen docs/` (repo root). Filenames are long.
Use the descriptions and filename patterns below to find the right source.

## Sources

1. Next layer (implementation-ready) (`Fuglen docs/Absolutely*`)
   - Logical ERD / table catalog across: `auth`, `core`, `trace`, `eudr`,
     `audit`, `workflow`, `ingest`, `esg`
   - UI blueprints for an internal admin app
   - Automated checks library (views/materialized views) + readiness scoring
   - API surface outline (FastAPI/NestJS style)

2. v1 init migration (SQL) (`Fuglen docs/Below is a single cohesive*`)
   - DDL starter to create schemas:
     `auth`, `core`, `trace`, `eudr`, `audit`, `workflow`, `ingest`, `esg`,
     `integration`, `util`
   - Triggers, enums, helper functions

3. Seed and automation (SQL) (`Fuglen docs/Below is 0002_seed_and_automation*`)
   - Hotfixes/patches for issues in the v1 init migration
   - Seed data (roles/permissions/orgs/sites, etc.)
   - EUDR automation patterns (Article 9 checklist rows, ready score refresh)
   - Task auto-generator patterns (data-quality driven ops)
   - KPI view example (`eudr.v_dossier_kpis_live`)

4. Postgres + PostGIS rationale + minimal spec (`Fuglen docs/Yes*PostgreSQL*`)
   - DB architecture rationale (traceability graph + compliance + audit)
   - Data dictionary (tables + key fields)
   - Constraints + state machines + EUDR checklist template
   - Dashboard wireframes and a solo-backend operating model

5. Sustainability Operating System blueprint (`Fuglen docs/Below is a practical, end*`)
   - Narrative + design principles (deforestation-first, not only)
   - Architecture layers (ingest -> store -> engine -> workflow -> dashboards -> AI)
   - Phased implementation approach (capability-based)
   - Example workflow (one new coffee lot for EU shipment)
   - Suggested scope beyond EUDR (ESG: GHG/waste/packaging/water/social/governance)

## Trust Model

These docs are valuable as an "implementation design spec", but still require:

- Verification of regulatory dates and detailed obligations against official sources
- Validation of assumptions with Fuglen operations (what data sources exist, formats, owners)
- Prioritization (what is MVP vs Phase 2+)
