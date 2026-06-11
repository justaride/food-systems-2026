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
      '542 tester / 139 suiter / 0 feil',
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
      '540 tester / 139 suiter / 0 feil',
      '537 tester / 139 suiter / 0 feil',
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
})
