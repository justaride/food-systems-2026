# Project Context

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

## Operational Context

- `PROJECT-OVERVIEW.md` is the delivery brief for the June 2026 whitepaper and transition-group work
- `DEEP-RESEARCH-PLAN.md` is the 10-session research sequencing document
- Treat those project notes as source context, not as agent-instruction files

## Workspace Map

- `src/app`: route segments and page-level UI
- `src/components`: charts, map widgets, layout, and shared UI
- `src/lib`: queries, helpers, and data access
- `scripts`: typed import and maintenance scripts
- `prisma`: schema and Prisma config
- `research`: source corpus, evidence pack, analysis, and visualizations
- `public`: static assets

## Read Next

- Use [Database Schema](database.md) for model-level work
- Use [Data Imports](data-imports.md) for import scripts and data-loading tasks
- Use [Research Workflows](research-workflows.md) for graph queries and external-source research
