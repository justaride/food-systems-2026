import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ACCEPTANCE_TESTS,
  gateReadinessForLocators,
} from '../../src/lib/citations/citable-acceptance'
import {
  citationReadinessFor,
  citationReadinessSourceFor,
  dybdeanalyseFindings,
} from '../../src/lib/data/dybdeanalyse'

/**
 * Bakgrunn: fram til 2026-08-24 gjentok appen siterbarhetsnivået i sin egen
 * liste, uavhengig av acceptance-gaten. De drev fra hverandre — AP-3, AP-5 og
 * AP-6 sto på `internal_context` i appen mens gaten og hvitboka sa
 * `citable_with_note`, og badgetekstene etterlyste stikkprøver som var gjort.
 *
 * Nivået utledes nå fra gaten. Denne testen håndhever invarianten som gjør at
 * duplikatet ikke kan oppstå på nytt.
 */
describe('dybdeanalyse-funn utleder siterbarhet fra acceptance-gaten', () => {
  it('har nøyaktig én kilde til nivået per funn — aldri begge, aldri ingen', () => {
    for (const finding of dybdeanalyseFindings) {
      const gateLevel = gateReadinessForLocators(finding.docRefs)
      const gated = gateLevel !== null

      if (gated) {
        assert.equal(
          finding.readinessWhenUngated,
          undefined,
          `${finding.id} er dekket av gaten (${gateLevel}) og skal ikke også deklarere readinessWhenUngated — det er nettopp duplikatet som skapte driften`,
        )
      } else {
        assert.ok(
          finding.readinessWhenUngated,
          `${finding.id} er ikke dekket av noen acceptance-test og må derfor deklarere readinessWhenUngated eksplisitt`,
        )
      }
    }
  })

  it('lar gaten vinne for hvert gate-dekket funn', () => {
    for (const finding of dybdeanalyseFindings) {
      const gateLevel = gateReadinessForLocators(finding.docRefs)
      if (gateLevel === null) continue

      assert.equal(
        citationReadinessFor(finding),
        gateLevel,
        `${finding.id} skal vise gatens nivå`,
      )
      assert.equal(citationReadinessSourceFor(finding), 'gate')
    }
  })

  it('faller tilbake på det deklarerte nivået kun for ugatede funn', () => {
    for (const finding of dybdeanalyseFindings) {
      if (gateReadinessForLocators(finding.docRefs) !== null) continue

      assert.equal(citationReadinessFor(finding), finding.readinessWhenUngated)
      assert.equal(citationReadinessSourceFor(finding), 'ungated')
    }
  })

  it('viser aldri blocked_unsourced — det ville betydd at et funn mangler begge kilder', () => {
    for (const finding of dybdeanalyseFindings) {
      assert.notEqual(
        citationReadinessFor(finding),
        'blocked_unsourced',
        `${finding.id} faller gjennom til blocked_unsourced`,
      )
    }
  })

  it('regresjonsvern: de fire funnene som faktisk drev, står på citable_with_note fra gaten', () => {
    // AP-3 (CA-014), AP-5 + AP-2 kryss-node (CL-MAKTKART-001) og AP-6 (CA-017,
    // lagt til 2026-08-24 for å tette hullet der hvitboka omtalte AP-6 som
    // siterbart uten at gaten testet det).
    for (const id of ['ins-ap3-001', 'ins-ap5-001', 'ins-ap2-002', 'ins-ap6-001']) {
      const finding = dybdeanalyseFindings.find(f => f.id === id)
      assert.ok(finding, `fant ikke ${id}`)
      assert.equal(citationReadinessFor(finding), 'citable_with_note', `${id} skal være citable_with_note`)
      assert.equal(citationReadinessSourceFor(finding), 'gate', `${id} skal hente nivået fra gaten`)
      assert.equal(
        finding.readinessWhenUngated,
        undefined,
        `${id} er gate-dekket og skal ikke bære et lokalt nivå`,
      )
    }
  })
})

describe('gateReadinessForLocators', () => {
  it('returnerer null når ingen acceptance-test dekker lokatoren', () => {
    assert.equal(gateReadinessForLocators(['docs/finnes-ikke.md']), null)
    assert.equal(gateReadinessForLocators([]), null)
    assert.equal(gateReadinessForLocators(['']), null)
  })

  it('velger svakeste nivå når flere lokatorer treffer', () => {
    const level = gateReadinessForLocators(['a', 'b'], [
      {
        ...ACCEPTANCE_TESTS[0],
        citations: [
          { ...ACCEPTANCE_TESTS[0].citations[0], locator: 'a', readiness: 'citable_external' },
          { ...ACCEPTANCE_TESTS[0].citations[0], locator: 'b', readiness: 'internal_context' },
        ],
      },
    ])
    assert.equal(level, 'internal_context')
  })

  it('slår sammen treff på tvers av flere acceptance-tester', () => {
    const base = ACCEPTANCE_TESTS[0]
    const level = gateReadinessForLocators(['x', 'y'], [
      { ...base, citations: [{ ...base.citations[0], locator: 'x', readiness: 'citable_with_note' }] },
      { ...base, citations: [{ ...base.citations[0], locator: 'y', readiness: 'blocked_unsourced' }] },
    ])
    assert.equal(level, 'blocked_unsourced')
  })
})
