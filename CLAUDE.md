# Food Systems 2026

Knowledge base and analysis app for Norwegian and Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

## Essentials

- Package manager: `npm`
- Dev: `npm run dev`
- Test: `npm run test`
- Build: `npm run build`
- Lint: `npm run lint`
- Metrics refresh: `npm run compute-metrics`
- Database import: `npm run db:import`
- Deploy: Coolify on Hetzner via GitHub `justaride`; never Vercel
- Build note: `npm run build` runs Prisma generate and chart metric computation before the Next.js build

## Agent Guardrails

For non-trivial work, state assumptions, scope, and verification target before editing. Prefer the smallest change that satisfies the request. Do not refactor adjacent code, rewrite unrelated prose, or clean unrelated files unless explicitly asked.

If a request has multiple plausible interpretations that would change data, claims, code behavior, or deployment impact, ask before editing. Work from current repo state and package scripts, not stale plan notes.

## Verification Defaults

- Code/UI: run focused tests when available, then `npm run test`, `npm run lint`, and `npm run build` when affected
- Data/imports: run the relevant `db:import:*` command or dry-run script, then `npm run db:audit`
- Source, claims, and whitepaper work: read `.claude/source-attribution-policy.md`, then run `npm run audit:citable` or `npm run gate:overclaim` as relevant
- Research binaries/artifacts: run `npm run audit:research-artifacts -- --base=origin/main`

## Task-Specific Guides

Read only the guide that matches the task.

- [Project Context](.claude/project-context.md)
- [Database Schema](.claude/database.md)
- [Data Imports](.claude/data-imports.md)
- [Research Workflows](.claude/research-workflows.md)
- [Company Registry](.claude/company-registry.md)
- [Code Conventions](.claude/code-conventions.md)
- [Source Attribution Policy](.claude/source-attribution-policy.md)
