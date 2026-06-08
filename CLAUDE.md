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
