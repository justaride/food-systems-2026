# Food Systems 2026

Knowledge base and analysis app for Norwegian and Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

## Essentials

- Package manager: `npm`
- Dev: `npm run dev`
- Test: `npm run test`
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

## Agent Guardrails

For non-trivial work, state assumptions, scope, and verification target before editing. Prefer the smallest change that satisfies the request. Do not refactor adjacent code, rewrite unrelated prose, or clean unrelated files unless explicitly asked.

If a request has multiple plausible interpretations that would change data, claims, code behavior, or deployment impact, ask before editing. Work from current repo state and package scripts, not stale plan notes.

## Verification Defaults

- Code/UI: run focused tests when available, then `npm run test`, `npm run lint`, and `npm run build` when affected
- Data/imports: run the relevant `db:import:*` command or dry-run script, then `npm run db:audit`
- Source, claims, and whitepaper work: read `.claude/source-attribution-policy.md`, then run `npm run audit:citable` or `npm run gate:overclaim` as relevant
- Research binaries/artifacts: run `npm run audit:research-artifacts -- --base=origin/main`

## Behavioral guidelines

Apply to every task — the "why"; linked skills/guides are the "how". Full text + worked TS examples: [.claude/karpathy-guidelines.md](.claude/karpathy-guidelines.md). Bias toward caution on non-trivial work; use judgment on trivial fixes.

1. **Think before coding** — State assumptions; if a request is ambiguous, surface interpretations and ask rather than guess. → brainstorming skill
2. **Simplicity first** — Minimum code that solves the stated problem; no speculative abstraction or unrequested config. → code-conventions.md
3. **Surgical changes** — Every changed line traces to the request; match surrounding style; don't refactor or delete code you weren't asked to touch. → code-conventions.md
4. **Goal-driven execution** — Turn tasks into verifiable success criteria, then loop to green. → test-driven-development + verification-before-completion skills

## Task-Specific Guides

Read only the guide that matches the task.

- [Project Context](.claude/project-context.md)
- [Database Schema](.claude/database.md)
- [Data Imports](.claude/data-imports.md)
- [Research Workflows](.claude/research-workflows.md)
- [Company Registry](.claude/company-registry.md)
- [Code Conventions](.claude/code-conventions.md)
- [Source Attribution Policy](.claude/source-attribution-policy.md)
