import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const decisionLog = readFileSync('docs/project/mandates/decision-log-food-tg.md', 'utf8')

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
})
