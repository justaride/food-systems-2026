# Source Provenance Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the current source/provenance work package to a clean, reviewable branch state without hiding the remaining strict source-audit debt.

**Architecture:** Keep this as a closeout pass, not a broad data-research sprint. Fix low-risk repository hygiene, verify the package with the repo's own gates, commit the coherent source/provenance implementation if standard gates pass, and leave strict source-audit failures documented as known remaining data-quality work.

**Tech Stack:** Next.js 16, TypeScript, Prisma 7, Node test runner, ESLint, npm.

---

## File Structure

- Modify: `package-lock.json` only if `npm audit fix` updates the transitive `brace-expansion` package.
- Modify: `.git/worktrees/*` metadata only through `git worktree prune` to remove the stale missing worktree reference.
- Add/keep: this plan at `docs/superpowers/plans/2026-05-19-source-provenance-closeout.md`.
- Commit package already present in the working tree:
  - `prisma/schema.prisma`
  - `package.json`
  - `scripts/backfill-shareholder-provenance.ts`
  - `scripts/verify-data-integrity.ts`
  - source/provenance helper modules under `src/lib/`
  - tests under `tests/lib/`
  - research coverage, URL inventory, backlog, and academic source-handling docs under `research/`

## Task 1: Branch And Worktree Hygiene

- [x] **Step 1: Move dirty state off `main`**

Run:

```bash
git switch -c chore/source-provenance-closeout-2026-05-19
```

Expected: branch switches successfully while preserving the existing dirty working tree.

- [x] **Step 2: Remove stale worktree metadata**

Run:

```bash
git worktree prune
git worktree list --porcelain
```

Expected: no `prunable gitdir file points to non-existent location` entry remains.

## Task 2: Dependency Audit Hygiene

- [x] **Step 1: Apply the npm audit fix**

Run:

```bash
npm audit fix
```

Expected: `package-lock.json` updates `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion` from `5.0.5` to a non-vulnerable patched version.

- [x] **Step 2: Verify dependency audit**

Run:

```bash
npm audit --audit-level=moderate
```

Expected: exit 0 and no moderate-or-higher vulnerability report.

## Task 3: Source/Provenance Package Review

- [x] **Step 1: Review changed file scope**

Run:

```bash
git diff --stat
git status --short --branch
```

Expected: changes are limited to the source/provenance package, generated research audit artifacts, this plan, and the dependency lockfile update if Task 2 changed it.

- [x] **Step 2: Check whitespace and patch sanity**

Run:

```bash
git diff --check
```

Expected: exit 0.

## Task 4: Verification Gates

- [x] **Step 1: Run unit tests**

Run:

```bash
npm test
```

Expected: all tests pass. Current baseline before this plan was 63 passing, 0 failing.

- [x] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: exit 0.

- [x] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: exit 0. If this rewrites only `public/data/food-systems/*/chart-metrics.json` generated timestamps, restore those timestamp-only diffs before commit unless the actual metric content changes.

- [x] **Step 4: Run standard DB audit**

Run:

```bash
npm run db:audit
```

Expected: exit 0. Warnings in `Source Quality Coverage` are allowed in this closeout pass if they match the known strict-source debt.

- [x] **Step 5: Run strict source audit and record blocker**

Run:

```bash
npm run db:audit:strict-sources
```

Expected for this closeout: exit 1 until the remaining label-only and missing source rows are fully resolved. Treat this as a documented blocker, not as a reason to hide the current validated improvements.

## Task 5: Commit Criteria

- [x] **Step 1: Commit if standard gates are green**

Commit only if:

- `npm test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `npm run db:audit` passes.
- `git diff --check` passes.
- `npm audit --audit-level=moderate` passes after the lockfile fix.
- `npm run db:audit:strict-sources` is the only remaining failing gate, and its failures are source/provenance debt already described in `research/AKADEMISK-KILDEHANDTERING-PLAN.md`.

Run:

```bash
git add package.json package-lock.json prisma/schema.prisma scripts src tests research docs/superpowers/plans/2026-05-19-source-provenance-closeout.md
git commit -m "chore(sources): harden provenance audit and coverage"
```

Expected: one coherent commit on `chore/source-provenance-closeout-2026-05-19`.

- [x] **Step 2: Leave branch ready for PR**

Run:

```bash
git status --short --branch
git log --oneline --decorate -3
```

Expected: clean working tree on the closeout branch with the new commit at HEAD.
