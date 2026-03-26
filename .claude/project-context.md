# Project Context

## Overview

Food Systems 2026 is a knowledge base and analysis app for Norwegian and Nordic food systems. The project tracks corporate structures, ownership, supply chains, policy, and market power across food retail, production, and related sectors.

## Stack

- Next.js 16 with App Router
- TypeScript
- Prisma 7 with PostgreSQL and `pgvector`
- Tailwind CSS
- Leaflet and Turf for mapping
- Recharts and Nivo for charts
- `react-force-graph-2d` for graph views

## Deployment

- Deploy with Coolify on Hetzner
- Source of truth is GitHub repo `justaride/food-systems-2026`
- Auto-deploy from GitHub is expected
- Never target Vercel for this project

## Workspace Map

- `src/app`: route segments and page-level UI
- `src/components`: charts, map widgets, layout, and shared UI
- `src/lib`: queries, helpers, and data access
- `scripts`: typed import and maintenance scripts
- `prisma`: schema and Prisma config
- `research`: source corpus, evidence pack, analysis, and visualizations
- `public`: static assets

## Supporting Docs

- `PROJECT-OVERVIEW.md`: broader project and delivery context
- `DEEP-RESEARCH-PLAN.md`: 10-session research plan and sequencing

## Research Tooling

- Prefer `offentligdata` first for Norwegian company and person registry lookups
- Use PubMed for academic source discovery when relevant
- Notion, Figma, and Google Drive are useful project context sources when those connectors are available in the current session
