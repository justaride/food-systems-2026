# Food Systems 2026

Knowledge base and analysis app for Norwegian and Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

## Essentials

- Package manager: `npm`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Metrics refresh: `npm run compute-metrics`
- Database import: `npm run db:import`
- Deploy: Coolify on Hetzner via GitHub `justaride`; never Vercel
- Build note: `npm run build` runs Prisma generate and chart metric computation before the Next.js build

## Task-Specific Guides

Read only the guide that matches the task.

- [Project Context](.claude/project-context.md)
- [Database Schema](.claude/database.md)
- [Data Imports](.claude/data-imports.md)
- [Research Workflows](.claude/research-workflows.md)
- [Company Registry](.claude/company-registry.md)
- [Code Conventions](.claude/code-conventions.md)
