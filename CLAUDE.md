# Food Systems 2026

Knowledge base and analysis app for Norwegian and Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

## Essentials

- Package manager: `npm`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Metrics refresh: `npm run compute-metrics` (chart metrics only, DB-free; this is what the build runs). For the full refresh incl. konsern-audit + coverage profiles (needs the DB), use `npm run compute-metrics:full` and commit the regenerated `public/data/coverage/profiles.json` + `data/konsern-coverage.json`.
- Database import: `npm run db:import`
- Deploy: Coolify on Hetzner via GitHub `justaride`; never Vercel
- Build note: `npm run build` runs Prisma generate + DB-free chart-metric computation before the Next.js build. The build must NOT depend on a live DB (the build container can't reach prod Postgres) — DB-derived artifacts are committed and refreshed separately via `compute-metrics:full`.

## Operating Discipline

- State assumptions and scope before non-trivial edits; ask when the task can reasonably mean more than one thing.
- Keep changes traceable to the request. Avoid adjacent refactors, speculative flexibility, and new documentation unless explicitly asked.
- For research, report, or public-facing claims, route language through the claim-lock, source-locator, and validation-gate documents before treating it as externally usable.
- Define verification before claiming completion: targeted tests/lint/build for code, the citable sequence in `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` for external knowledge-base status, and `git diff --check` for docs/process edits.

## Task-Specific Guides

Read only the guide that matches the task.

- [Project Context](.claude/project-context.md)
- [Database Schema](.claude/database.md)
- [Data Imports](.claude/data-imports.md)
- [Research Workflows](.claude/research-workflows.md)
- [Company Registry](.claude/company-registry.md)
- [Code Conventions](.claude/code-conventions.md)
