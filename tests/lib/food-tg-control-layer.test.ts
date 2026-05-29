import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  foodTgCandidateCards,
  foodTgControlDocuments,
  foodTgDecisionGates,
  foodTgReaderJourneySurfaces,
  isExternallyValidatedFoodTgStatus,
} from '../../src/lib/data/food-tg-control-layer'
import { foodTgMandateSummary, foodTgValidationLanes } from '../../src/lib/data/food-tg-mandate'

const nonValidatedStatuses = new Set([
  'klar',
  'klar-med-forbehold',
  'krever-bekreftelse',
  'maa-harmoniseres',
  'hold-tilbake',
  'venter-minimumsvedtak',
  'ikke-startet',
  'benchmark',
  'hypotese',
  'pilotkandidat',
  'sekundaerspor',
])

const unsafePositivePattern =
  /(?:pilot\s*-?\s*klar|eksternt\s+validert|validert\s+eksternt|ekstern\s+validering|validert\s+av\s+eksterne|scope\s+er\s+besluttet|aktørene\s+er\s+med)/i

const blockingPattern = /(?:stopper|blokkerer|uten|før|ikke|mangler|holdes tilbake|brukes som)/i

function assertNoUnsafePositiveLanguage(value: string, context: string) {
  assert.ok(!unsafePositivePattern.test(value), `${context} contains unsafe positive language`)
}

function assertNonValidatedStatus(status: string, context: string) {
  assert.ok(nonValidatedStatuses.has(status), `${context} has unsupported status: ${status}`)
  assertNoUnsafePositiveLanguage(status, context)
}

describe('Food TG control layer', () => {
  it('keeps mandate status aligned with the 2026-05-21 decision package', () => {
    assert.equal(foodTgMandateSummary.date, '2026-05-21')
    assert.equal(foodTgMandateSummary.decisionDate, '2026-05-21')
    assert.equal(foodTgMandateSummary.decisionStatus, 'Venter scope- eller minimumsvedtak')
    assert.doesNotThrow(() => new Date(foodTgMandateSummary.decisionDate).toISOString())
    assert.match(foodTgMandateSummary.externalValidation, /Ingen claims er validert eksternt per 2026-05-21/)

    const externalLane = foodTgValidationLanes.find((lane) => lane.id === 'validert-eksternt')
    assert.ok(externalLane)
    assert.equal(externalLane.items.length, 0)
    assert.match(externalLane.description, /Ingen claims er validert eksternt per 2026-05-21/)
  })

  it('defines the required control document package with blocking rules', () => {
    const expectedIds = [
      'decision-pack-v01',
      'insight-pack-outline-v03',
      'claim-lock-2026-05',
      'figure-model-note-audit-2026-05',
      'case-to-claim-index-2026-05',
      'source-locator-risk-audit-2026-05',
      'scope-decision-request-2026-05-21',
      'validation-sprint-log-2026-05',
      'baseline-freeze-2026-05-21',
      'wageningen-method-transfer-2026-05-26',
    ]

    assert.deepEqual(foodTgControlDocuments.map((doc) => doc.id), expectedIds)

    for (const doc of foodTgControlDocuments) {
      assert.ok(doc.title)
      assert.ok(doc.kind)
      assert.ok(doc.status)
      assertNonValidatedStatus(doc.status, `${doc.id}.status`)
      assertNoUnsafePositiveLanguage(doc.title, `${doc.id}.title`)
      assertNoUnsafePositiveLanguage(doc.kind, `${doc.id}.kind`)
      assertNoUnsafePositiveLanguage(doc.use, `${doc.id}.use`)
      assert.ok(doc.path.startsWith('docs/project/mandates/'))
      assert.ok(doc.path.endsWith('.md'))
      assert.ok(doc.use)
      assert.ok(Array.isArray(doc.blocks), `${doc.id}.blocks must be an array`)
      assert.ok(doc.blocks.length > 0)
      for (const block of doc.blocks) {
        assert.ok(block.trim().length > 0)
        assertNoUnsafePositiveLanguage(block, `${doc.id}.blocks`)
      }
    }
  })

  it('defines six decision gates with governing documents and stop logic', () => {
    assert.deepEqual(foodTgDecisionGates.map((gate) => gate.id), [
      'scope',
      'claim',
      'figure',
      'case',
      'source',
      'validation',
    ])

    for (const gate of foodTgDecisionGates) {
      assert.ok(gate.title)
      assert.ok(gate.status)
      assertNonValidatedStatus(gate.status, `${gate.id}.status`)
      assertNoUnsafePositiveLanguage(gate.title, `${gate.id}.title`)
      assertNoUnsafePositiveLanguage(gate.mustBeTrue, `${gate.id}.mustBeTrue`)
      assertNoUnsafePositiveLanguage(gate.nextAction, `${gate.id}.nextAction`)
      assert.ok(gate.governingDocument.startsWith('docs/project/mandates/'))
      assert.ok(gate.mustBeTrue)
      assert.ok(gate.blocks.trim().length > 0)
      assertNoUnsafePositiveLanguage(gate.blocks, `${gate.id}.blocks`)
      assert.ok(blockingPattern.test(gate.blocks), `${gate.id}.blocks does not describe blocking logic`)
      assert.ok(gate.nextAction)
      assert.equal(isExternallyValidatedFoodTgStatus(gate.status), false)
    }
  })

  it('defines candidate cards with minimum data, gates, stop signals, and no unsafe status lift', () => {
    assert.deepEqual(foodTgCandidateCards.map((card) => card.id), ['A1', 'A/B', 'B1', 'B2', 'B3', 'C-gate'])

    const expectedCandidateTitles = new Map([
      ['A1', /Alternative fôrproteiner/],
      ['A/B', /Insektprotein/],
      ['B1', /Okara\/BSG|Okara og BSG/],
      ['B2', /Matsvinnkvalitet/],
      ['B3', /Nutrient-loop/],
      ['C-gate', /Adoption og marked/],
    ])

    const expectedCandidateAnchors = new Map([
      [
        'A/B',
        {
          claimIds: ['CL-A-021', 'CL-A-011', 'CL-B-009'],
          evidenceIds: ['EV-A-003', 'EV-A-013', 'EV-A-014', 'EV-A-015', 'EV-A-016'],
          sourceIds: [
            'SRC-A-003',
            'SRC-REG-001',
            'SRC-REG-002',
            'SRC-REG-003',
            'SRC-REG-004',
            'SRC-REG-005',
            'SRC-REG-006',
          ],
        },
      ],
      [
        'B1',
        {
          claimIds: ['CL-B-014', 'CL-B-021', 'CL-B-009'],
          evidenceIds: ['EV-B-011', 'EV-B-018', 'EV-B-019'],
          sourceIds: ['SRC-B-024', 'SRC-B-025', 'SRC-B-026'],
        },
      ],
      [
        'B2',
        {
          claimIds: ['CL-B-022', 'CL-C-012', 'CL-C-014', 'CL-C-015'],
          evidenceIds: ['EV-B-002', 'EV-B-004', 'EV-B-014', 'EV-C-010', 'EV-C-026'],
          sourceIds: ['SRC-B-002', 'SRC-B-004', 'SRC-B-014', 'SRC-C-010', 'SRC-C-031'],
        },
      ],
      [
        'B3',
        {
          claimIds: ['CL-B-023', 'CL-C-015'],
          evidenceIds: ['EV-B-008', 'EV-B-010', 'EV-B-016', 'EV-B-017', 'EV-B-024'],
          sourceIds: [
            'SRC-B-008',
            'SRC-B-010',
            'SRC-B-018',
            'SRC-B-019',
            'SRC-B-020',
            'SRC-B-021',
            'SRC-B-022',
            'SRC-B-023',
            'SRC-B-031',
          ],
        },
      ],
    ])

    for (const card of foodTgCandidateCards) {
      const expectedTitle = expectedCandidateTitles.get(card.id)
      assert.ok(expectedTitle, `${card.id} is not in the case-to-claim index candidate set`)
      assert.match(card.title, expectedTitle, `${card.id}.title does not match case-to-claim index`)
      const expectedAnchors = expectedCandidateAnchors.get(card.id)
      if (expectedAnchors) {
        assert.deepEqual(card.claimIds, expectedAnchors.claimIds, `${card.id}.claimIds do not match case-to-claim index`)
        assert.deepEqual(
          card.evidenceIds,
          expectedAnchors.evidenceIds,
          `${card.id}.evidenceIds do not match case-to-claim index`,
        )
        assert.deepEqual(card.sourceIds, expectedAnchors.sourceIds, `${card.id}.sourceIds do not match case-to-claim index`)
      }
      assert.ok(card.title)
      assert.ok(card.role)
      assert.ok(card.canSay)
      assert.ok(card.cannotSay)
      assert.ok(card.minimumData.length >= 4)
      assert.ok(card.sourceGate)
      assert.ok(card.actorGate)
      assert.ok(card.cGate)
      assert.ok(card.stopSignal)
      assert.ok(card.nextAction)
      assert.ok(card.claimIds.length > 0)
      assertNonValidatedStatus(card.status, `${card.id}.status`)
      assert.equal(isExternallyValidatedFoodTgStatus(card.status), false)

      assertNoUnsafePositiveLanguage(card.title, `${card.id}.title`)
      assertNoUnsafePositiveLanguage(card.role, `${card.id}.role`)
      assertNoUnsafePositiveLanguage(card.canSay, `${card.id}.canSay`)
      assertNoUnsafePositiveLanguage(card.sourceGate, `${card.id}.sourceGate`)
      assertNoUnsafePositiveLanguage(card.actorGate, `${card.id}.actorGate`)
      assertNoUnsafePositiveLanguage(card.cGate, `${card.id}.cGate`)
      assertNoUnsafePositiveLanguage(card.stopSignal, `${card.id}.stopSignal`)
      assertNoUnsafePositiveLanguage(card.nextAction, `${card.id}.nextAction`)
    }
  })

  it('maps reader journey surfaces to existing routes with figure or risk notes', () => {
    assert.deepEqual(foodTgReaderJourneySurfaces.map((surface) => surface.route), [
      '/mandat',
      '/innsikt',
      '/forsyningskjede',
      '/verdikjede',
      '/sirkularitet',
      '/graf',
      '/sammenligning',
    ])

    for (const surface of foodTgReaderJourneySurfaces) {
      assert.ok(surface.title)
      assert.ok(surface.use)
      assert.ok(surface.readiness)
      assert.ok(surface.figureNote)
      assert.ok(surface.risk)
      assert.ok(surface.nextAction)
      assertNonValidatedStatus(surface.readiness, `${surface.route}.readiness`)
      assertNoUnsafePositiveLanguage(surface.title, `${surface.route}.title`)
      assertNoUnsafePositiveLanguage(surface.use, `${surface.route}.use`)
      assertNoUnsafePositiveLanguage(surface.figureNote, `${surface.route}.figureNote`)
      assertNoUnsafePositiveLanguage(surface.risk, `${surface.route}.risk`)
      assertNoUnsafePositiveLanguage(surface.nextAction, `${surface.route}.nextAction`)
      assert.equal(isExternallyValidatedFoodTgStatus(surface.readiness), false)
    }
  })
})
