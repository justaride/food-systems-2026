import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { buildAcademicLocatorRepairs } from '../../scripts/apply-academic-locator-repairs'
import {
  buildAcademicCitationLocatorReconciliationPlan,
  type AcademicLocatorCitationSnapshot,
  type AcademicLocatorEntitySnapshot,
  type AcademicLocatorRepairContract,
} from '../../src/lib/citations/academic-citation-locator-reconciliation'

const VERIFIED_AT = '2026-07-19T00:00:00.000Z'
const UPDATED_AT = '2026-07-19T12:00:00.000Z'

function fixture(
  kind: 'Report' | 'SourceDoc' = 'SourceDoc',
  id = 'src-test',
): {
  repair: AcademicLocatorRepairContract
  entity: AcademicLocatorEntitySnapshot
} {
  const title = `${kind} pinned title`
  return {
    repair: {
      kind,
      id,
      expected: `https://old.example/${id}`,
      replacement: `https://verified.example/${id}`,
      verifiedAccessDate: '2026-07-19',
    },
    entity: {
      kind,
      id,
      title,
      documentId: `document-${id}`,
      locator: `https://verified.example/${id}`,
      accessedAt: VERIFIED_AT,
    },
  }
}

function citation(
  repair: AcademicLocatorRepairContract,
  options: Partial<AcademicLocatorCitationSnapshot> = {},
): AcademicLocatorCitationSnapshot {
  const title = `${repair.kind} pinned title`
  return {
    id: `citation-${repair.id}`,
    citationText: `${repair.kind}: ${title}`,
    title,
    url: repair.expected,
    accessedAt: null,
    updatedAt: UPDATED_AT,
    sourceDocId: repair.kind === 'SourceDoc' ? repair.id : null,
    documentId: `document-${repair.id}`,
    fieldCitations: [{
      id: `field-${repair.id}`,
      entityType: repair.kind,
      entityId: repair.id,
      fieldPath: repair.kind === 'Report' ? 'sourceUrl' : 'url',
    }],
    ...options,
  }
}

describe('academic SourceCitation locator reconciliation', () => {
  it('uses the reviewed 32-row entity manifest and plans exact old-to-verified changes only', () => {
    const manifest = buildAcademicLocatorRepairs()
    assert.equal(manifest.length, 32)

    const { repair, entity } = fixture()
    const plan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [citation(repair)],
    )

    assert.deepEqual(plan.hardConflicts, [])
    assert.equal(plan.summary.pendingOldToVerified, 1)
    assert.equal(plan.mutations.length, 1)
    assert.deepEqual(plan.mutations[0], {
      citationId: `citation-${repair.id}`,
      targetKey: `SourceDoc:${repair.id}`,
      mode: 'old_to_verified',
      expectedUrl: repair.expected,
      replacementUrl: repair.replacement,
      expectedAccessedAt: null,
      replacementAccessedAt: VERIFIED_AT,
      expectedUpdatedAt: UPDATED_AT,
    })
  })

  it('fills null only for the sole title-matched locator FieldCitation', () => {
    const { repair, entity } = fixture()
    const eligible = citation(repair, { url: null })
    const eligiblePlan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [eligible],
    )
    assert.equal(eligiblePlan.summary.pendingNullToVerified, 1)
    assert.equal(eligiblePlan.mutations[0]?.mode, 'null_to_verified')

    const duplicate = citation(repair, {
      id: 'second-locator-citation',
      url: null,
      fieldCitations: [{
        id: 'second-locator-field',
        entityType: repair.kind,
        entityId: repair.id,
        fieldPath: 'url',
      }],
    })
    const ambiguousPlan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [eligible, duplicate],
    )
    assert.equal(ambiguousPlan.mutations.length, 0)
    assert.equal(ambiguousPlan.summary.uncoveredMissingLocator, 2)
  })

  it('does not normalize other locators or mutate citations shared by multiple entities', () => {
    const first = fixture('SourceDoc', 'src-first')
    const second = fixture('SourceDoc', 'src-second')
    const otherLocator = citation(first.repair, { url: 'https://old.example/' })
    const shared = citation(first.repair, {
      id: 'shared-citation',
      fieldCitations: [
        {
          id: 'shared-first',
          entityType: 'SourceDoc',
          entityId: first.repair.id,
          fieldPath: 'url',
        },
        {
          id: 'shared-second',
          entityType: 'SourceDoc',
          entityId: second.repair.id,
          fieldPath: 'url',
        },
      ],
    })
    const plan = buildAcademicCitationLocatorReconciliationPlan(
      [first.repair, second.repair],
      [first.entity, second.entity],
      [otherLocator, shared],
    )

    assert.equal(plan.mutations.length, 0)
    assert.equal(plan.summary.manualUnreviewedLocator, 1)
    assert.equal(plan.summary.manualAmbiguousEntity, 1)
  })

  it('advances old access metadata without replacing a later access timestamp', () => {
    const { repair, entity } = fixture()
    const older = citation(repair, {
      url: repair.replacement,
      accessedAt: '2026-07-01T00:00:00.000Z',
    })
    const olderPlan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [older],
    )
    assert.equal(olderPlan.mutations[0]?.mode, 'accessed_at_only')
    assert.equal(olderPlan.mutations[0]?.replacementAccessedAt, VERIFIED_AT)

    const later = citation(repair, {
      url: repair.expected,
      accessedAt: '2026-07-20T07:30:00.000Z',
    })
    const laterPlan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [later],
    )
    assert.equal(laterPlan.mutations[0]?.replacementAccessedAt, '2026-07-20T07:30:00.000Z')
  })

  it('keeps exact reviewed citation-level work locators out of the manual queue', () => {
    const { repair, entity } = fixture()
    repair.reviewedCitationLocators = ['https://verified.example/direct-work.pdf']
    const plan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [entity],
      [citation(repair, {
        url: 'https://verified.example/direct-work.pdf',
        accessedAt: VERIFIED_AT,
      })],
    )

    assert.equal(plan.mutations.length, 0)
    assert.equal(plan.summary.reviewedAlternateLocator, 1)
    assert.equal(plan.summary.manualUnreviewedLocator, 0)
  })

  it('fails closed on entity drift and uses transactional locks plus exact CAS updates', () => {
    const { repair, entity } = fixture()
    const driftedPlan = buildAcademicCitationLocatorReconciliationPlan(
      [repair],
      [{ ...entity, locator: 'https://operator.example/change' }],
      [citation(repair)],
    )
    assert.match(driftedPlan.hardConflicts.join('\n'), /target locator drifted/i)

    const source = readFileSync('scripts/reconcile-academic-citation-locators.ts', 'utf8')
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /fieldCitations: \{ some: \{ OR: fieldTargetConditions \} \}/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /"FieldCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /"SourceCitation" WHERE "id" = \$\{citationId\} FOR UPDATE/)
    assert.match(source, /url: mutation\.expectedUrl/)
    assert.match(source, /accessedAt: mutation\.expectedAccessedAt/)
    assert.match(source, /updatedAt: new Date\(mutation\.expectedUpdatedAt\)/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.doesNotMatch(source, /\.create\(|\.delete\(|\.upsert\(/)
  })
})
