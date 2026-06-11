import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const statusPath = 'docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md'
const reviewPath = 'docs/project/reviews/plattformloft-beslutningsreview-2026-06-11.md'
const portEPath = 'docs/project/status/port-e-event-go-uke-25-2026-06-15.md'

describe('Food TG status after Port E landing', () => {
  it('tracks the landed Port E event-go package and keeps remaining blockers current', () => {
    const status = readFileSync(statusPath, 'utf8')

    for (const term of [
      'PR #167',
      portEPath,
      'Port E event-go-pakken er landet',
      'PR #159 er resynket etter PR #167',
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

  it('tracks the post-171 platform-stack resync as the current review state', () => {
    const status = readFileSync(statusPath, 'utf8')
    const review = readFileSync(reviewPath, 'utf8')

    for (const term of [
      'PR #171',
      '73b8e3b',
      '536 tester / 139 suiter / 0 feil',
      'GitHub CI på head `73b8e3b`: grønn',
    ]) {
      assert.ok(status.includes(term), `${term} missing from ${statusPath}`)
      assert.ok(review.includes(term), `${term} missing from ${reviewPath}`)
    }

    for (const staleTerm of ['PR #159-hodet `224cec7`']) {
      assert.ok(!status.includes(staleTerm), `${staleTerm} should no longer be current in ${statusPath}`)
      assert.ok(!review.includes(staleTerm), `${staleTerm} should no longer be current in ${reviewPath}`)
    }
  })
})
