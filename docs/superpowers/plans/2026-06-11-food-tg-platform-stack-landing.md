# Food TG Platform Stack Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the 17-goal platform stack safely, make the repo the source of truth again, deploy verified prod data/UI, and prepare the Jan Thomas decision package for week 25.

**Architecture:** Treat the existing `origin/codex/goal-17-coverage-badge-system` branch as one sequential integration stack, not 17 independent PRs. Use a clean worktree based on `origin/main` for merge and CI verification, and keep the JT/H1 delivery lane separate from extra platform work after the stack is landed.

**Tech Stack:** Git/GitHub PR workflow, Node 24, npm, Next.js 16, Prisma 7, GitHub Actions, Coolify, Cloudflare Access tunnel for prod DB imports, Food TG claim-lock/source-governance gates.

---

## Current Verified Baseline

- Current checkout: `/Users/gabrielfreeman/Documents/Food Systems 2026`
- Current branch: `codex/food-tg-research-intake-72h`
- Current remote main: `origin/main` at `4e510dc chore(snapshot): Coolify resource state 2026-06-11`
- Current local branch relation to `origin/main`: 1 commit ahead, 9 commits behind
- Current untracked control docs after this plan is created:
  - `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md`
  - `docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md`
  - `docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md`
  - `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`
  - `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`
  - `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`
  - `docs/superpowers/plans/2026-06-11-food-tg-platform-stack-landing.md`
- Goal branches on origin: `origin/codex/goal-01-konsern-aar` through `origin/codex/goal-17-coverage-badge-system`
- Stack diff against `origin/main`: 139 files, +8,156 / -687, with package changes only in `package.json` and no package-lock change on the goal stack itself.
- `pr-quality-gates.yml` runs on PR, push to non-main branches, and workflow dispatch. It runs `npm ci`, Prisma generate, research-artifact audit, `npm test`, `npm run audit:citable-reports`, and `npm run lint`. It does not run `npm run build`, `db:audit`, `db:audit:strict-sources`, `audit:konsern`, or `graph:audit`, so those remain local/operator gates.

## File Structure

- `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`: current status assessment and phase plan. Must be committed before review can rely on it.
- `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`: original 17-goal plan and status table. Must be updated after integration PR/merge to reflect the actual integration route.
- `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`: H1/H2 delivery plan. Must stay the JT/H1 source of truth after platform stack landing.
- `docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md`: evidence base for the 17 goals.
- `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md`: source for JT status note.
- `docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md`: JT topic/research process mandate.
- `.github/workflows/pr-quality-gates.yml`: PR CI gate.
- `.github/workflows/prod-data-import.yml`: manual prod import workflow. PR #175 landed explicit `verify-only`, `ownership`, `registers`, and `full` target choices on `origin/main`; each target is routed through a shell allowlist.
- `scripts/deploy.sh` and `scripts/coolify-sync-source-commit.sh`: Coolify deploy/sync helpers.
- `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`: operator sequence and citation-readiness control layer.

## Stop Rules

- Do not merge or demo the platform stack before `npm ci` and PR CI are green on the integration result.
- Do not use JT-facing quality numbers until the operator sequence has been re-run after merge/deploy.
- Do not change claim text, KPI values, or external-facing fact language outside claim-lock/source-governance rules.
- Do not run prod DB write workflows unless the target command, branch SHA, and confirmation input are explicit.
- Do not continue platform phase-D work before deck v0.1, minimum decision package, and Port E preparation are moving.

### Task 0: Re-freeze Repo Truth Before Execution

**Files:**
- Read: `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`
- Read: `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`
- Read: `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`
- Read: `.github/workflows/pr-quality-gates.yml`
- Read: `.github/workflows/prod-data-import.yml`

- [ ] **Step 1: Fetch remote state**

Run:

```bash
git fetch --prune origin
```

Expected: command exits 0.

- [ ] **Step 2: Record current checkout status**

Run:

```bash
git status --short --branch
git rev-list --left-right --count HEAD...origin/main
git branch -r --list 'origin/codex/goal-*' --sort=committerdate
```

Expected:

```text
## codex/food-tg-research-intake-72h
```

Expected count shape:

```text
1	9
```

Expected remote goal branches: goal 01 through goal 17 are present.

- [ ] **Step 3: Verify stack shape**

Run:

```bash
git log --oneline --decorate --graph --max-count=30 --all --branches='codex/goal-*' --remotes='origin/codex/goal-*'
git diff --stat origin/main...origin/codex/goal-17-coverage-badge-system
git diff --name-only origin/main...origin/codex/goal-17-coverage-badge-system -- package.json package-lock.json
```

Expected: goal branches are sequentially stacked and the final diff is around 139 files. `package.json` appears in the package diff; `package-lock.json` does not appear from the goal stack side.

- [ ] **Step 4: Stop if baseline changed materially**

Stop and report if any of these are true:

```text
origin/codex/goal-17-coverage-badge-system is missing
origin/main has new deploy/build/lockfile commits after 4e510dc
untracked control docs differ from the seven-file list above
```

### Task 1: Land Control Docs As Source Of Truth

**Files:**
- Add/commit: `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md`
- Add/commit: `docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md`
- Add/commit: `docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md`
- Add/commit: `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`
- Add/commit: `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`
- Add/commit: `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`
- Add/commit: `docs/superpowers/plans/2026-06-11-food-tg-platform-stack-landing.md`

- [ ] **Step 1: Create a docs branch from current main**

Run:

```bash
git switch -c codex/food-tg-platform-control-docs origin/main
```

Expected: new local branch created from `origin/main`.

- [ ] **Step 2: Stage only the six control docs**

Run:

```bash
git add docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md \
  docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md \
  docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md \
  docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md \
  docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md \
  docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md \
  docs/superpowers/plans/2026-06-11-food-tg-platform-stack-landing.md
git diff --cached --name-only
git diff --cached --check
```

Expected staged files: exactly the seven paths above. Expected diff check: no whitespace errors.

- [ ] **Step 3: Commit docs**

Run:

```bash
git commit -m "docs: add Food TG platform landing control plan"
```

Expected: commit succeeds with only the seven docs.

- [ ] **Step 4: Push docs branch**

Run:

```bash
git push -u origin codex/food-tg-platform-control-docs
```

Expected: branch pushed.

- [ ] **Step 5: Open a docs PR or mark for same-day fast merge**

Preferred command:

```bash
gh pr create \
  --base main \
  --head codex/food-tg-platform-control-docs \
  --title "docs: add Food TG platform landing control plan" \
  --body "Adds the 2026-06-11 Food TG platform status, goal plan, H1 development plan, JT review basis, depth analysis, topic mandate, and execution plan so repo state matches the active landing process."
```

Expected: PR URL is returned.

Stop if `gh` is not authenticated; report that GitHub connector/CLI auth is needed.

### Task 2: Build A Clean Integration Branch

**Files:**
- Merge target: all files changed by `origin/codex/goal-17-coverage-badge-system`
- Validate: `package.json`
- Validate: `package-lock.json`

- [ ] **Step 1: Create an isolated worktree**

Run from `/Users/gabrielfreeman/Documents/Food Systems 2026`:

```bash
git worktree add ../food-systems-platform-stack-landing origin/main
```

Expected: worktree created at `/Users/gabrielfreeman/Documents/food-systems-platform-stack-landing`.

- [ ] **Step 2: Create integration branch**

Run:

```bash
cd ../food-systems-platform-stack-landing
git switch -c codex/platform-stack-integration-2026-06-11
```

Expected: new branch created from `origin/main`.

- [ ] **Step 3: Merge the final goal stack**

Run:

```bash
git merge --no-ff origin/codex/goal-17-coverage-badge-system -m "feat: integrate Food TG platform lift stack"
```

Expected: merge exits 0. If conflicts appear, stop and resolve only the conflicted files; do not rewrite unrelated goal work.

- [ ] **Step 4: Confirm package-lock state**

Run:

```bash
git diff --name-only origin/main...HEAD -- package.json package-lock.json
git diff -- package.json package-lock.json
```

Expected: `package.json` may include new scripts from the goal stack. `package-lock.json` should remain the `origin/main` lockfile unless `npm ci` proves it is unsynced.

### Task 3: Reproduce And Fix The `npm ci` Gate

**Files:**
- Validate/possibly modify: `package.json`
- Validate/possibly modify: `package-lock.json`

- [ ] **Step 1: Run install gate exactly as CI does**

Run in `/Users/gabrielfreeman/Documents/food-systems-platform-stack-landing`:

```bash
npm ci
```

Expected: exits 0. If it exits with `EUSAGE`, continue to Step 2.

- [ ] **Step 2: Identify whether the failure is inherited from main or introduced by integration**

Run:

```bash
git worktree add ../food-systems-main-npmci-check origin/main
cd ../food-systems-main-npmci-check
npm ci
```

Expected: exits 0 on `origin/main`. If main also fails, stop and open/fix a lockfile issue before platform integration.

- [ ] **Step 3: Resync lockfile only if integration fails and main passes**

Run:

```bash
cd ../food-systems-platform-stack-landing
npm install --package-lock-only
git diff -- package-lock.json package.json
npm ci
```

Expected: only lockfile metadata required by `package.json` changes; `npm ci` exits 0.

- [ ] **Step 4: Commit lock fix if needed**

Run only if Step 3 changed `package-lock.json`:

```bash
git add package-lock.json package.json
git commit -m "fix(deps): sync lockfile for platform integration"
```

Expected: commit succeeds.

### Task 4: Review The Three Deferred Decision Goals

**Files:**
- Review: `src/lib/data/forside-kpis.ts`
- Review: `src/lib/config/countries/no.ts`
- Review: `src/app/sammenligning/SammenligningContent.tsx`
- Review: `src/app/kommunikasjon/KommunikasjonContent.tsx`
- Review: `src/app/kommunikasjon/page.tsx`
- Review: `src/app/mandat/page.tsx`
- Review: `src/app/metodikk/page.tsx`
- Review: `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`
- Create: `docs/project/reviews/plattformloft-beslutningsreview-2026-06-12.md`

- [ ] **Step 1: Inspect G-06 implementation**

Run:

```bash
git show --stat origin/codex/goal-06-kildede-kpier
git show origin/codex/goal-06-kildede-kpier -- src/lib/data/forside-kpis.ts src/lib/config/countries/no.ts src/app/sammenligning/SammenligningContent.tsx
rg -n "44 %|45 %|41,3|34,9|self-sufficiency|selvforsyn" src docs/project/mandates/food-tg-claim-lock-table-2026-05.md
```

Expected: old hardcoded `44 %`/`45 %` does not remain as live UI truth; NIBIO/claim-lock variant is explicit with caveat and source fields.

- [ ] **Step 2: Inspect G-10 implementation**

Run:

```bash
git show --stat origin/codex/goal-10-tomme-tabeller
git show origin/codex/goal-10-tomme-tabeller -- src/app/kommunikasjon src/app/api/data-status/route.ts
rg -n "communications|fishHealth|landbruksregister|venter på datagrunnlag|fallback" src/app src/lib tests
```

Expected: empty-table handling is explicit and no quiet fallback remains on the affected surfaces.

- [ ] **Step 3: Inspect G-11 implementation**

Run:

```bash
git show --stat origin/codex/goal-11-mandat-metodikk-split
git show origin/codex/goal-11-mandat-metodikk-split -- src/app/mandat/page.tsx src/app/metodikk/page.tsx src/lib/data/food-tg-mandate.ts src/lib/data/nav.ts
rg -n "Claim-board|claim-board|opportunity|Metodikk|Mandat" src/app/mandat src/app/metodikk src/lib/data
```

Expected: claim-board/radar appears on one route only; `/mandat` and `/metodikk` have distinct H1/ingress intent.

- [ ] **Step 4: Write decision review**

Create `docs/project/reviews/plattformloft-beslutningsreview-2026-06-12.md` with this exact decision block:

```markdown
---
tittel: Plattformløft beslutningsreview G-06/G-10/G-11
status: Intern review
eier: Gabriel
dato: 2026-06-12
scope: Eksplisitt review av beslutningspunktene som ble implementert uten forhåndsvedtak i plattformløftet.
---

# Plattformløft beslutningsreview G-06/G-10/G-11

## G-06 Selvforsyningsgrad og KPI-kilder

Vedtak: Ikke avklart ved opprettelse av review. Merge er blokkert til Gabriel velger `godkjent` eller `endres før merge`.

Reviewgrunnlag:
- Claim-lock-rute sjekket mot `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`.
- UI-kilder sjekket i `src/lib/data/forside-kpis.ts`, `src/lib/config/countries/no.ts` og `src/app/sammenligning/SammenligningContent.tsx`.
- Søk etter gamle hardkodede verdier kjørt med `rg -n "44 %|45 %|41,3|34,9|self-sufficiency|selvforsyn" src docs/project/mandates/food-tg-claim-lock-table-2026-05.md`.

Beslutning:
- Merge er blokkert til Gabriel eksplisitt godkjenner NIBIO/claim-lock-varianten eller ber om endring.

## G-10 Tomme tabeller

Vedtak: Ikke avklart ved opprettelse av review. Merge er blokkert til Gabriel velger `godkjent` eller `endres før merge`.

Reviewgrunnlag:
- Kommunikasjon/fiskehelse/landbruksregister sjekket i data-status og relevante UI-flater.
- Søk kjørt med `rg -n "communications|fishHealth|landbruksregister|venter på datagrunnlag|fallback" src/app src/lib tests`.

Beslutning:
- Merge er blokkert til Gabriel eksplisitt godkjenner UI-merking av tomme tabeller eller ber om import/fjerning før merge.

## G-11 Mandat/metodikk-split

Vedtak: Ikke avklart ved opprettelse av review. Merge er blokkert til Gabriel velger `godkjent` eller `endres før merge`.

Reviewgrunnlag:
- `/mandat` og `/metodikk` sjekket for distinkt formål, H1 og claim-board-plassering.
- Søk kjørt med `rg -n "Claim-board|claim-board|opportunity|Metodikk|Mandat" src/app/mandat src/app/metodikk src/lib/data`.

Beslutning:
- Merge er blokkert til Gabriel eksplisitt godkjenner mandat/metodikk-splitten eller ber om endret struktur før merge.
```

Replace each `Vedtak` line with Gabriel's final decision before merge. Stop if Gabriel has not decided all three.

- [ ] **Step 5: Commit decision review**

Run after all three `Vedtak` lines contain Gabriel's final decisions:

```bash
git add docs/project/reviews/plattformloft-beslutningsreview-2026-06-12.md
git diff --cached --check
git commit -m "docs: record platform lift decision review"
```

Expected: commit succeeds.

### Task 5: Run Full Local Verification On Integration Result

**Files:**
- Validate: whole integration branch

- [ ] **Step 1: Run whitespace check**

Run:

```bash
git diff --check origin/main...HEAD
```

Expected: no whitespace errors.

- [ ] **Step 2: Run the consolidated A4 gate**

Run:

```bash
npm run verify:platform-stack-main
```

Expected: the command exits 0. It runs Prisma generate, lint, full tests, build, DB audit, strict-source audit, konsern audit, graph audit and citable audit in the same order the package script defines.

- [ ] **Step 3: If the consolidated gate fails, isolate the failing sub-gate**

Use the package script definition as the source of truth. Run only the failing segment(s), for example:

```bash
npm run db:generate
npm run lint
npm test
npm run build
npm run db:audit
npm run db:audit:strict-sources
npm run audit:konsern
npm run graph:audit
npm run audit:citable
```

Expected: each isolated failing command gives an actionable error. If a command exits 0 with warnings/worklist counts, capture both the pass and the remaining counts in the PR body.

- [ ] **Step 4: Commit any verification-required artifacts**

Run:

```bash
git status --short
```

Expected: no generated tracked artifacts are dirty unless produced by expected commands such as coverage/reconciliation refresh. If generated artifacts changed, stop and report the exact paths before committing them; do not silently include regenerated data in the integration PR.

### Task 6: Open One Integration PR And Let CI Run

**Files:**
- PR body should reference:
  - `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`
  - `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`
  - `docs/project/reviews/plattformloft-beslutningsreview-2026-06-12.md`

- [ ] **Step 1: Push integration branch**

Run:

```bash
git push -u origin codex/platform-stack-integration-2026-06-11
```

Expected: branch pushed.

- [ ] **Step 2: Open PR**

Run:

```bash
gh pr create \
  --base main \
  --head codex/platform-stack-integration-2026-06-11 \
  --title "feat: integrate Food TG platform lift stack" \
  --body-file /tmp/food-tg-platform-stack-pr-body.md
```

Before running, create `/tmp/food-tg-platform-stack-pr-body.md` with:

```markdown
## Summary

Integrates the full sequential platform lift stack G-01 through G-17 as one PR because the goal branches were built cumulatively.

## Goal Coverage

- [ ] G-01 years in konsern coverage
- [ ] G-02 import corpus reconciliation and import chain
- [ ] G-03 internal `/datastatus`
- [ ] G-04 route provenance footer
- [ ] G-05 missing-data semantics
- [ ] G-06 sourced KPI cards and self-sufficiency definition
- [ ] G-07 list column definitions
- [ ] G-08 BRREG financial backfill
- [ ] G-09 accounting-year labels in finance UI
- [ ] G-10 empty-table handling
- [ ] G-11 mandate/methodology split
- [ ] G-12 sibling page purpose framing
- [ ] G-13 homepage context model
- [ ] G-14 list surface selection/segmentation
- [ ] G-15 detail breadcrumbs/related links
- [ ] G-16 Food TG board in DB
- [ ] G-17 coverage badge system

## Deferred Decisions

Decision review recorded in `docs/project/reviews/plattformloft-beslutningsreview-2026-06-12.md`.

## Local Verification

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run db:audit`
- [ ] `npm run db:audit:strict-sources`
- [ ] `npm run audit:konsern`
- [ ] `npm run graph:audit`
- [ ] `npm run audit:citable`

## Notes

`pr-quality-gates.yml` covers install, tests, citable report audit, and lint. Build and DB/operator gates are recorded above because they are not part of PR CI.
```

Expected: PR URL is returned.

- [ ] **Step 3: Monitor PR checks**

Run:

```bash
gh pr checks --watch
```

Expected: all checks pass. If CI fails, fetch logs with:

```bash
gh run list --branch codex/platform-stack-integration-2026-06-11 --limit 5
```

Use the numeric run id printed by `gh run list` to fetch failed logs with `gh run view <numeric-run-id> --log-failed`. Fix failures on the integration branch only.

### Task 7: Merge, Verify Main, And Update Goal Status

**Files:**
- Modify: `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`
- Modify: `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`

- [ ] **Step 1: Merge PR after checks and decisions are green**

Run:

```bash
gh pr merge --squash --delete-branch
```

Expected: PR merged into `main`; integration branch deleted on remote.

- [ ] **Step 2: Sync local main**

Run:

```bash
git switch main
git pull --ff-only origin main
```

Expected: local `main` at new merge commit.

- [ ] **Step 3: Re-run full verification on main**

Run:

```bash
npm ci
npm run lint
npm test
npm run build
npm run db:audit
npm run db:audit:strict-sources
npm run audit:konsern
npm run graph:audit
npm run audit:citable
```

Expected: all commands exit 0.

- [ ] **Step 4: Update goal status table**

In `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`, update each `G-01` through `G-17` status from `åpen` to:

```text
ferdig via integrasjons-PR
```

Set the PR column to the integration PR number and date to the merge date.

- [ ] **Step 5: Update status assessment**

In `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`, add a top update note with the actual integration PR number and verification date:

```markdown
> Oppdatert etter merge: Plattformstacken G-01-G-17 er landet via integrasjons-PR #PR_NUMBER, full main-verifikasjon er kjørt YYYY-MM-DD, og deploy/prod-data-gates gjenstår i Fase B.
```

- [ ] **Step 6: Commit post-merge status update**

Run:

```bash
git add docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md
git diff --cached --check
git commit -m "docs: mark platform lift stack landed"
git push origin main
```

Expected: main pushed with status update.

### Task 8: Prod Data And Deploy Gate

**Files:**
- Validate/possibly modify: `.github/workflows/prod-data-import.yml`
- Validate: `scripts/deploy.sh`
- Validate: `scripts/coolify-sync-source-commit.sh`
- Validate: `src/app/api/data-status/route.ts`

- [ ] **Step 1: Check prod import workflow capabilities**

Run:

```bash
sed -n '1,220p' .github/workflows/prod-data-import.yml
rg -n "verify-only|registers|full|db:prod-sync|db:backfill:financials-brreg|ownership" .github/workflows/prod-data-import.yml package.json .claude/data-imports.md
```

Expected: confirm that PR #175 workflow choices are present and that write targets are routed explicitly (`ownership`, `registers`, `full`) before any prod write.

- [ ] **Step 2: Verify prod data status before writes**

Run:

```bash
curl -sS https://food-systems.naturalstateproject.com/api/data-status | jq .
```

Expected: endpoint responds with current prod status. Capture company/reconciliation-relevant counts.

- [ ] **Step 3: Run sanctioned prod import only after command support is explicit**

Run the workflow from GitHub Actions with the exact target option exposed by the PR #175 workflow:

```text
workflow: Prod Data Import (manual)
target: verify-only | ownership | registers | full
confirm: IMPORT
```

Expected: workflow logs show authenticated tunnel, import command exit 0, and `npm run db:verify` exit 0.

- [ ] **Step 4: Deploy main to Coolify**

Run only after main verification and prod import decision:

```bash
./scripts/coolify-sync-source-commit.sh --redeploy
```

Expected: SOURCE_COMMIT is synced to current `main` and deploy is queued.

- [ ] **Step 5: Verify live deployment**

Run:

```bash
curl -sS https://food-systems.naturalstateproject.com/api/version | jq .
curl -sS https://food-systems.naturalstateproject.com/api/data-status | jq .
```

Expected: `/api/version` reports the new main SHA; `/api/data-status` shows expected company/data counts and no unexplained reconciliation gaps.

- [ ] **Step 6: Browser smoke**

Open these routes in the in-app browser or Playwright:

```text
https://food-systems.naturalstateproject.com/
https://food-systems.naturalstateproject.com/datastatus
https://food-systems.naturalstateproject.com/mandat
https://food-systems.naturalstateproject.com/metodikk
https://food-systems.naturalstateproject.com/selskap
```

Expected: new provenance lines, `/datastatus`, sourced KPI cards, mandate/methodology split, and missing-data semantics are visible.

### Task 9: Operator Sequence For JT Numbers

**Files:**
- Read/update: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`
- Use source: `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md`

- [ ] **Step 1: Run current operator sequence**

Run:

```bash
npm run db:refresh:source-citation-readiness
npm run db:audit:strict-sources
npm run audit:citable
npm run research:citation-readiness-queue
```

Expected: strict source/citation gates exit 0. Capture current `SourceCitation`, `FieldCitation`, `blocked_unsourced`, and queue counts from command output.

- [ ] **Step 2: Update status if numbers changed**

If counts differ from the 10.06 assessment, update `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md` or the JT status note in Task 10 with the new dated numbers. Do not reuse old counts silently.

### Task 10: Prepare JT Week 25 Package

**Files:**
- Source: `docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md`
- Source: `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`
- Source: `docs/project/mandates/food-tg-minimumsvedtak-casekort-2026-06-09.md`
- Source: `docs/project/mandates/food-tg-deck-outline-2026-06-09.md`
- Source: `docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md`
- Create: `docs/project/status/jt-statusnotat-uke-25-2026-06-15.md`
- Create: `docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md`

- [ ] **Step 1: Create JT status note**

Create `docs/project/status/jt-statusnotat-uke-25-2026-06-15.md` with sections:

```markdown
# Statusnotat til Jan Thomas - uke 25

## 1. Hva er gjort siden 26.05

## 2. Hvorfor grunnlaget er tryggere nå

## 3. Hva som fortsatt ikke skal sies eksternt

## 4. Beslutninger vi ber om i møtet

## 5. Neste 14 dager
```

Expected: 2-3 pages, sourced from the assessment and updated operator numbers only.

- [ ] **Step 2: Create JT decision cases**

Create `docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md` with four decisions:

```markdown
# Beslutningssaker JT uke 25

## Sak 1: Minimumsvedtak casekort

## Sak 2: H1/H2-todeling frem mot 31.07.2026

## Sak 3: Port E - offentlig online event

## Sak 4: DASK-0906-001/002 sendes internt nå
```

Expected: each decision has a requested yes/no or choose-one decision, owner, consequence of no decision, and source file.

- [ ] **Step 3: Deck v0.1**

Use `docs/project/mandates/food-tg-deck-outline-2026-06-09.md` and fill only slide areas marked as ready now. Keep immature claims marked as under validation. Create a separate deck artifact only after the status note and decision cases are stable.

- [ ] **Step 4: Meeting booking text**

Draft meeting text:

```text
Tema: Food TG beslutningsmøte uke 25 - minimumsvedtak, H1/H2 og Port E

Formål: Låse de beslutningene som trengs for å levere roadmap v0.1 og offentlig online event innen 31.07.2026.

Agenda:
1. Kort status siden 26.05 og hva plattformløftet har gjort mulig
2. Minimumsvedtak casekort
3. H1/H2-todeling av leveransen
4. Port E: eventdato, format og Thea-aktivering
5. DASK-0906-001/002 og neste 14 dager

Einar bør være med på H1/H2 og Port E.
```

Expected: ready to send for Wednesday-Friday in week 25.

### Task 11: Freeze Extra Platform Work Until H1 Is Moving

**Files:**
- Modify if needed: `docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`
- Modify if needed: `docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md`

- [ ] **Step 1: Mark phase-D platform work as gated**

Add a note only if the current docs do not already make this clear:

```markdown
Plattformarbeid utover casestatus-flaten er frosset til minimumsvedtak, deck v0.1 og Port E er i bevegelse. Ny plattformfunksjonalitet må eksplisitt knyttes til H1-leveransen før uke 25-26.
```

Expected: H1 delivery lane cannot be displaced by non-critical platform work.

- [ ] **Step 2: Commit H1/JT docs**

Run:

```bash
git add docs/project/status/jt-statusnotat-uke-25-2026-06-15.md \
  docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md \
  docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md \
  docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md
git diff --cached --check
git commit -m "docs: prepare JT week 25 decision package"
git push
```

Expected: docs pushed on the active JT/package branch or main, depending on the chosen PR strategy.

## Execution Order

1. Task 0: re-freeze baseline.
2. Task 1: commit control docs so review has a source of truth.
3. Task 2 and Task 3: build clean integration and settle `npm ci`.
4. Task 4: Gabriel decision review for G-06/G-10/G-11.
5. Task 5 and Task 6: local gates, integration PR, CI.
6. Task 7: merge, verify main, update status table.
7. Task 8 and Task 9: prod data/deploy and operator sequence.
8. Task 10 and Task 11: JT package and H1 protection.

## Self-Review

- Spec coverage: covers Fase A lock/PR/merge/docs, Fase B prod-data/deploy/operator sequence, Fase C JT package, and Fase D freeze rule.
- Placeholder scan: the only bracketed text appears inside the decision-review template where Gabriel must write explicit decisions before merge; the task includes a stop rule for this.
- Type/command consistency: commands use existing scripts from current `package.json` and workflows checked in `.github/workflows`.
- Known caveat: PR #175 makes workflow routing explicit, but no prod write has been run yet. Use `verify-only` first, then choose `registers` or `full` only after branch SHA, target, and `confirm=IMPORT` are checked.
