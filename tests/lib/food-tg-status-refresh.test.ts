import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const statusPath = 'docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md'
const reviewPath = 'docs/project/reviews/plattformloft-beslutningsreview-2026-06-11.md'
const portEPath = 'docs/project/status/port-e-event-go-uke-25-2026-06-15.md'
const executionPlanPath = 'docs/superpowers/plans/2026-06-11-food-tg-platform-stack-landing.md'

describe('Food TG status after Port E landing', () => {
  it('tracks the landed Port E event-go package and keeps remaining blockers current', () => {
    const status = readFileSync(statusPath, 'utf8')

    for (const term of [
      'PR #167',
      portEPath,
      'Port E event-go-pakken er landet',
      'PR #159 er resynket gjennom seneste status-sync',
      'G-06, G-10 og G-11',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
    }

    for (const staleTerm of [
      'event-go er fortsatt ikke utført',
      'Port E-sak',
      'JT uke 25-pakken er landet via PR #160',
    ]) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should no longer be current in ${statusPath}`)
    }
  })

  it('keeps volatile PR #159 head/check state on the PR instead of pinning old SHAs in docs', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')

    for (const term of [
      'seneste status-sync',
      'PR #159 er live kilde for siste head/check-status',
      'PR #159-kommentaren er live kilde for siste test-/suite-tall',
      'GitHub CI er grønn på PR #159',
      'PR #177',
      'npm run verify:platform-stack-main',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    for (const staleTerm of [
      '73b8e3b',
      'PR #172',
      'post-#171 status-sync via PR',
      'GitHub CI på head `',
      'PR #159-head `',
      'PR #159-hodet `',
      '550 tester / 140 suiter / 0 feil',
      '543 tester / 139 suiter / 0 feil',
      '540 tester / 139 suiter / 0 feil',
      '537 tester / 139 suiter / 0 feil',
    ]) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should no longer be current in ${statusPath}`)
      assert.ok(!review.includes(staleTerm), `${staleTerm} should no longer be current in ${reviewPath}`)
    }
  })

  it('records the landed JT package QA guard without reopening the platform decision gate', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')

    for (const term of [
      'PR #182',
      'JT uke 25-pakken har egen QA-guard',
      'tests/lib/jt-uke25-package.test.ts',
      'PR #159-kommentaren er live kilde for siste test-/suite-tall',
      'G-06, G-10 og G-11',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    for (const staleTerm of [
      'JT uke 25-pakken mangler QA-guard',
      'PR #182 er ikke landet',
    ]) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should no longer be current in ${statusPath}`)
      assert.ok(!review.includes(staleTerm), `${staleTerm} should no longer be current in ${reviewPath}`)
    }
  })

  it('records the landed #175 prod-data workflow readiness update', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')
    const executionPlan = readFileSync(executionPlanPath, 'utf8')

    for (const term of [
      'PR #175',
      'prod-data-import-workflowen',
      '`verify-only`',
      '`registers`',
      '`full`',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    assert.ok(
      executionPlan.includes('PR #175') && executionPlan.includes('verify-only') && executionPlan.includes('registers'),
      `${executionPlanPath} must reflect that prod-data-import workflow readiness is landed`,
    )
    assert.ok(
      executionPlan.includes('npm run verify:platform-stack-main'),
      `${executionPlanPath} must use the consolidated A4 verification command`,
    )

    for (const staleTerm of [
      'Currently only exposes `ownership`',
      'currently exposes only `ownership`',
      'do not assume it can run `db:import:full` until updated or documented',
    ]) {
      assert.ok(!executionPlan.includes(staleTerm), `${staleTerm} should no longer be current in ${executionPlanPath}`)
    }
  })

  it('keeps the execution plan restartable after #182 and #183 landed', () => {
    const executionPlan = readFileSync(executionPlanPath, 'utf8')

    for (const term of [
      '## Execution Checkpoint 2026-06-11 After PR #183',
      'PR #182',
      'PR #183',
      'JT uke 25-pakken er repo-landet',
      'draft-PR #159 er fortsatt beslutningsgated',
      'live `/api/version` svarer `10e1ab1`',
      'Ikke start på Task 0 som om planen er urørt',
    ]) {
      assert.ok(executionPlan.includes(term), `${term} missing from ${executionPlanPath}`)
    }

    for (const staleTerm of [
      '## Current Verified Baseline',
      'Current branch: `codex/food-tg-research-intake-72h`',
      'Current remote main: `origin/main` at `4e510dc',
      'Current local branch relation to `origin/main`: 1 commit ahead, 9 commits behind',
      'Current untracked control docs after this plan is created',
    ]) {
      assert.ok(!executionPlan.includes(staleTerm), `${staleTerm} should no longer be current in ${executionPlanPath}`)
    }
  })

  it('keeps volatile prod deploy SHA on live /api/version instead of pinning it in docs', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')

    for (const term of [
      'PR #179',
      'Read-only prod-baseline 2026-06-11',
      'live `/api/version` er fasit for gjeldende deploy-SHA',
      '`/api/data-status` returnerte HTTP 200',
      'Coolify SHA Sync',
      'companies: 185',
      'landbruksregisterCompanies: 4',
      'PR #159-stackens nye `/api/data-status`-dekning',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    for (const staleTerm of [
      '9cf7c60',
      '45e21a5',
      '471335a',
      'Prod-versjon var `9cf7c60`',
      'Prod-API-et hadde fortsatt pre-G-01-formen',
      'matchet `main` etter PR #178',
    ]) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should no longer be current in ${statusPath}`)
      assert.ok(!review.includes(staleTerm), `${staleTerm} should no longer be current in ${reviewPath}`)
    }
  })

  it('records the successful prod verify-only preflight without claiming prod import is done', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')

    for (const term of [
      'prod-data-import `verify-only`',
      'run 27366094787',
      'Authenticated DB connection ready',
      '`db:verify`',
      'Result: OK',
      'Document: 990',
      'SourceDoc: 193',
      'Company: 185',
      'CompanyOwnership: 75',
      'Deliverable: 12',
      'ingen prod-write-target',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    for (const staleTerm of [
      'prod-data-import, PR #159-stackens nye `/api/data-status`-dekning og full operatorsekvens er ikke kjørt',
      'Ingen prod import, PR #159-stackdeploy eller operator-sekvens er kjort',
    ]) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should be updated in ${statusPath}`)
      assert.ok(!review.includes(staleTerm), `${staleTerm} should be updated in ${reviewPath}`)
    }
  })
})
