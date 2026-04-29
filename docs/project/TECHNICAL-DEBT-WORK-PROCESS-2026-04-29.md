# Technical Debt Work Process - 2026-04-29

## Purpose

This note captures the technical-debt review from 2026-04-29 as a later work process. It is not a refactor implementation plan by itself. Use it as the starting backlog and operating model when the project moves from review into cleanup work.

## Current Baseline

Read-only checks performed during the review:

- `npx tsc --noEmit --pretty false` passed.
- `npm run lint -- --max-warnings=0` passed.
- `npx prisma validate` passed.
- `npm run db:verify` passed.
- `npm run db:audit` passed.
- `npm audit --omit=dev` reported 2 moderate vulnerabilities through Next's nested `postcss@8.4.31`.

Important boundary:

- `npm run build` was not run in the review because this repo's build command also runs `write-version`, `prisma generate`, and `compute-metrics`, which can refresh generated files under `public/data/food-systems/*/chart-metrics.json`.
- The worktree already had unrelated active changes. This note was added without reverting or normalizing those changes.

## Quantitative Signals

- Code surface reviewed: about 308 code files / 87k lines across `src`, `scripts`, and `prisma`.
- `src`: 211 TypeScript/React files, about 46k lines.
- `scripts`: 96 TypeScript files, about 40.6k lines.
- App surface: 39 app pages and 11 API routes.
- Test surface found: no `test` / `spec` files and no `test` script in `package.json`.
- Large files to treat as refactor candidates:
  - `src/lib/data/actors.ts` (~3.8k lines)
  - `src/lib/data/reports.ts` (~2.7k lines)
  - `scripts/promote-food-process-typed-records.ts` (~2.2k lines)
  - `src/lib/data/theses.ts` (~1.9k lines)
  - `src/lib/data/insights.ts` (~1.8k lines)
  - `src/lib/data/sources.ts` (~1.7k lines)
  - `src/components/map/FoodFlowMap.tsx` (~826 lines)

## Debt Register

| ID | Area | Severity | Why It Matters | First Fix |
|---|---|---:|---|---|
| TD-01 | Automated tests | High | Data-heavy routes and imports have no regression harness. Type/lint passing does not prove behavior. | Add a minimal test runner and smoke tests for query/data helpers. |
| TD-02 | Script type coverage | High | `scripts/**/*` is excluded from `tsconfig`, while scripts hold much of the import and data promotion logic. | Add `tsconfig.scripts.json` and a `typecheck:scripts` command. |
| TD-03 | Dependency security | Medium | `npm audit --omit=dev` reports moderate `postcss` vulnerability via `next/node_modules/postcss@8.4.31`. | Resolve via compatible Next/package-lock update, then rerun audit and build. |
| TD-04 | Deploy/schema/data drift | High | A green deploy does not guarantee matching production schema or data. Import failures may be first signal. | Convert deploy runbook checks into a repeatable preflight/postflight command path. |
| TD-05 | Large mixed modules | Medium | Large data/UI/script files slow review and make localized changes risky. | Split only around stable workflow boundaries; avoid broad rewrites. |
| TD-06 | CSV/import parsing | Medium | Some importers use simple delimiter splitting; quoted fields can corrupt data silently. | Replace importer-local CSV parsing with one shared parser utility and fixtures. |
| TD-07 | Loose domain typing | Medium | Several stable concepts live as strings or JSON, making invalid states easy. | Introduce typed constants or lightweight validators before Prisma enum/schema migrations. |

## Work Process

### Gate 0 - Freeze Scope

Start by choosing one lane only:

1. Reliability lane: tests, typecheck, lint, audit.
2. Data pipeline lane: import scripts, CSV parsing, dry-run/preflight behavior.
3. Deploy operations lane: schema/data drift checks and production preflight.
4. Module-splitting lane: one large file or route at a time.

Do not mix lanes in the same commit unless the changes are mechanically coupled.

### Gate 1 - Establish Repeatable Verification

Minimum command bundle before refactor work:

```bash
npx prisma validate
npm run db:verify
npm run db:audit
npm run lint -- --max-warnings=0
npx tsc --noEmit --pretty false
npm audit --omit=dev
```

Use `npm run build` only when ready to inspect generated diffs afterward.

### Gate 2 - Add Missing Safety Nets

First implementation package should be small:

- Add a test runner.
- Add 3-5 smoke tests for pure helpers or query fallback behavior.
- Add script typechecking separately from app typechecking.
- Document which commands are required before merge.

Recommended first targets:

- CSV/parser helper behavior.
- Prisma unavailable fallback behavior.
- Data-quality metric helpers.
- Source/provenance classification helpers.

### Gate 3 - Fix Highest-Interest Debt

Suggested order:

1. Resolve the nested `postcss` audit finding.
2. Add `typecheck:scripts`.
3. Replace fragile CSV parsing in the most active importers.
4. Add dry-run/preflight output to destructive or high-volume import scripts.
5. Split one large file per work package, starting with the file most likely to be edited next.

### Gate 4 - Preserve Data Discipline

For any importer or corpus workflow:

- Keep preview, human review, and import as separate stages.
- Do not promote research/navigation material into canonical evidence without the existing review gates.
- Preserve provenance fields even when source URLs are missing by design.
- Keep local generated output distinct from committed source data.

### Gate 5 - Closeout

Each debt-reduction package should end with:

- Commands run and result.
- Files changed.
- Data or schema migrations, if any.
- Remaining debt moved back into this register or a follow-up note.
- Explicit statement if `npm run build` was not run.

## Later Backlog

Good follow-up packages:

- `TD-01/TD-02`: create test + script-typecheck baseline.
- `TD-03`: dependency/security cleanup for Next/PostCSS.
- `TD-06`: shared CSV parser utility with fixtures.
- `TD-04`: deploy preflight script that checks schema compatibility and row-count baselines.
- `TD-05`: split `FoodFlowMap.tsx` into layout/projection/helpers and interaction components.
- `TD-07`: typed constants for status fields before considering Prisma enums.

