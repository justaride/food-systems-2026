import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const decisionLog = readFileSync('docs/project/mandates/decision-log-food-tg.md', 'utf8')
const platformReview = readFileSync('docs/project/reviews/plattformloft-beslutningsreview-2026-06-11.md', 'utf8')

function sectionBetween(start: string, end: string) {
  const [, afterStart = ''] = decisionLog.split(start)
  return afterStart.split(end)[0] ?? ''
}

describe('Food TG decision log', () => {
  it('tracks Week 25 decisions as pending requests before they are logged as decisions', () => {
    const requestSection = sectionBetween('## Beslutningsforespørsler', '## Åpne mandatfelt')
    const actualDecisionSection = sectionBetween('## Beslutningslogg', '## Beslutningsforespørsler')

    for (const required of [
      'Minimumsvedtak casekort',
      'H1/H2-todeling',
      'Port E',
      'DASK-0906-001/002',
      'G-06/G-10/G-11',
    ]) {
      assert.ok(requestSection.includes(required), `${required} missing from pending decision requests`)
    }

    for (const source of [
      'jt-beslutningssaker-uke-25-2026-06-15.md',
      'jt-uke25-sendepakke-2026-06-15.md',
      'plattformloft-beslutningsreview-2026-06-11.md',
    ]) {
      assert.ok(decisionLog.includes(source), `${source} missing from decision log references`)
    }

    assert.doesNotMatch(actualDecisionSection, /2026-06-15/)
  })

  it('gives Gabriel copy-ready PR #159 review wording without turning it into a logged decision', () => {
    for (const required of [
      '## Kopierbar PR-review',
      'G-06: godkjent',
      'G-10: godkjent',
      'G-11: godkjent',
      'G-06: endres for merge:',
      'G-10: endres for merge:',
      'G-11: endres for merge:',
      'PR #159 skal forbli draft',
      'A4-verifikasjon på main',
    ]) {
      assert.ok(platformReview.includes(required), `${required} missing from platform decision review`)
    }

    const actualDecisionSection = sectionBetween('## Beslutningslogg', '## Beslutningsforespørsler')
    assert.doesNotMatch(actualDecisionSection, /G-06/)
  })
})
