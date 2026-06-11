import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const portEPath = 'docs/project/status/port-e-event-go-uke-25-2026-06-15.md'

function readPortE() {
  assert.ok(existsSync(portEPath), `${portEPath} must exist`)
  return readFileSync(portEPath, 'utf8')
}

describe('Food TG Port E event-go pack', () => {
  it('turns the public online event decision into an executable internal package', () => {
    const portE = readPortE()

    for (const term of [
      'Port E',
      'offentlig online event',
      'H1/H2',
      'roadmap v0.1',
      'uke 29',
      'uke 30',
      '60-90 min',
      'NCH',
      'Thea',
      'JT/Einar',
      'påmelding',
      'opptak',
      'generalprøve',
      'fallback',
      'kort innspilt presentasjon + publisert oppsummering',
    ]) {
      assert.ok(portE.includes(term), `${term} missing from Port E pack`)
    }
  })

  it('keeps event content behind claim-lock, citable gates, and operator verification', () => {
    const portE = readPortE()

    for (const term of [
      'Q&A-stoppliste',
      'trygg språkbank',
      'claim-lock',
      'citable_external',
      'operatorsekvens',
      'Port F',
      'publiseringsmodus',
      'ikke ekstern publisering',
      'ikke MOU-claim',
      'ikke partnerrolle',
      'ikke importfritt fôr',
      'ikke norsk pilotbevis',
    ]) {
      assert.ok(portE.includes(term), `${term} missing from Port E safety gates`)
    }
  })

  it('is linked from the Week 25 JT decision and status package', () => {
    readPortE()

    for (const path of [
      'docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md',
      'docs/project/status/jt-statusnotat-uke-25-2026-06-15.md',
      'docs/project/status/jt-uke25-sendepakke-2026-06-15.md',
      'docs/project/status/food-tg-start-her-2026-06-15.md',
    ]) {
      const doc = readFileSync(path, 'utf8')
      assert.ok(doc.includes(portEPath), `${portEPath} missing from ${path}`)
    }
  })
})
