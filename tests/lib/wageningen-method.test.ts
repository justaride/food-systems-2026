import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { foodTgWageningenMethod } from '../../src/lib/data/wageningen-method'

const unsafeExternalReadyPattern =
  /(?:eksternt validert|validert eksternt|pilotklar|pilot-ready|source-closed|externally ready|Wageningen validates|WUR score confirms)/i

function assertSafeText(value: string, context: string) {
  assert.doesNotMatch(value, unsafeExternalReadyPattern, context)
}

describe('Food TG Wageningen method overview', () => {
  it('keeps Wageningen as a caveated internal method foundation', () => {
    assert.equal(foodTgWageningenMethod.status, 'klar-med-forbehold')
    assert.equal(foodTgWageningenMethod.source.id, 'SRC-B-035')
    assert.match(foodTgWageningenMethod.decision, /Adopt internt, adapt for nordisk bruk, hold eksternt med caveat/)
    assert.match(foodTgWageningenMethod.boundary, /ikke ekstern validering/i)

    assertSafeText(foodTgWageningenMethod.title, 'title')
    assertSafeText(foodTgWageningenMethod.summary, 'summary')
    assertSafeText(foodTgWageningenMethod.boundary, 'boundary')
  })

  it('exposes the compact cascade, red gates and validation asks required for the dashboard', () => {
    assert.equal(foodTgWageningenMethod.cascade.length, 8)
    assert.deepEqual(
      foodTgWageningenMethod.cascade.map((step) => step.rank),
      [1, 2, 3, 4, 5, 6, 7, 8],
    )
    assert.ok(foodTgWageningenMethod.redGates.length >= 7)
    assert.ok(foodTgWageningenMethod.validationAsks.length >= 8)

    for (const gate of foodTgWageningenMethod.redGates) {
      assert.ok(gate.title)
      assert.ok(gate.state)
      assert.ok(gate.closureEvidence)
      assertSafeText(gate.title, `gate ${gate.title}`)
      assertSafeText(gate.closureEvidence, `gate ${gate.title} evidence`)
    }
  })

  it('covers the Wageningen claim-lock consequences without unsafe status lift', () => {
    assert.deepEqual(
      foodTgWageningenMethod.claimDeltas.map((claim) => claim.claimId),
      ['CL-B-008', 'CL-B-009', 'CL-B-021', 'CL-B-022', 'CL-B-023', 'CL-C-015'],
    )

    for (const claim of foodTgWageningenMethod.claimDeltas) {
      assert.ok(claim.effect)
      assert.ok(claim.decision)
      assertSafeText(claim.effect, `${claim.claimId}.effect`)
      assertSafeText(claim.decision, `${claim.claimId}.decision`)
    }
  })

  it('keeps safe and blocked language explicit for process use', () => {
    assert.ok(foodTgWageningenMethod.safeLanguage.length >= 3)
    assert.ok(foodTgWageningenMethod.blockedLanguage.length >= 4)
    assert.ok(foodTgWageningenMethod.documents.length >= 4)

    assert.ok(
      foodTgWageningenMethod.blockedLanguage.some((line) =>
        /Score betyr effekt|WUR-score dokumenterer klimaeffekt|pilot readiness/i.test(line),
      ),
    )
    assert.ok(
      foodTgWageningenMethod.documents.some((doc) =>
        doc.path === 'docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md',
      ),
    )
  })
})
