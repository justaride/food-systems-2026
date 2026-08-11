import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { theses } from '../../prisma/seed-data/theses'
import {
  PINNED_THESIS_ACCESS_DATE_MANIFEST_SHA256,
  REVIEWED_THESIS_ACCESS_DATE_TARGETS,
  buildThesisAccessDateRepairPlan,
  thesisAccessDateRepairPlanSha256,
  validateReviewedThesisAccessDateTargets,
  validateThesisAccessDateSeedTargets,
  type ThesisAccessDateSnapshot,
} from '../../scripts/repair-thesis-access-dates'

function snapshots(accessDate: string | null = null): ThesisAccessDateSnapshot[] {
  return REVIEWED_THESIS_ACCESS_DATE_TARGETS.map(target => ({
    id: target.id,
    url: target.url,
    title: target.title,
    institution: target.institution,
    accessDate,
  }))
}

describe('verified Thesis access-date repair', () => {
  it('pins exactly the two manifest-backed Handle identities in seed data', () => {
    validateReviewedThesisAccessDateTargets()
    validateThesisAccessDateSeedTargets(theses)

    assert.equal(PINNED_THESIS_ACCESS_DATE_MANIFEST_SHA256.length, 64)
    assert.deepEqual(
      REVIEWED_THESIS_ACCESS_DATE_TARGETS.map(target => target.id),
      ['jacobsen-jansson-2022', 'nguyen-hartmann-2024'],
    )
    assert.ok(REVIEWED_THESIS_ACCESS_DATE_TARGETS.every(target => (
      target.accessDate === '2026-07-19' && target.url.startsWith('https://hdl.handle.net/')
    )))
  })

  it('builds a deterministic two-row pending plan', () => {
    const plan = buildThesisAccessDateRepairPlan(snapshots())

    assert.deepEqual(plan.summary, {
      total: 2,
      pending: 2,
      alreadyApplied: 0,
      conflicts: 0,
    })
    assert.deepEqual(plan.updates.map(target => target.id), [
      'jacobsen-jansson-2022',
      'nguyen-hartmann-2024',
    ])
    assert.match(thesisAccessDateRepairPlanSha256(plan), /^[a-f0-9]{64}$/)
    assert.equal(thesisAccessDateRepairPlanSha256(plan), thesisAccessDateRepairPlanSha256(plan))
  })

  it('is idempotent after the reviewed access dates are present', () => {
    const plan = buildThesisAccessDateRepairPlan(snapshots('2026-07-19'))

    assert.equal(plan.updates.length, 0)
    assert.deepEqual(plan.alreadyAppliedIds, [
      'jacobsen-jansson-2022',
      'nguyen-hartmann-2024',
    ])
    assert.equal(plan.conflicts.length, 0)
  })

  it('fails closed on missing, drifted, or previously dated rows', () => {
    const missing = buildThesisAccessDateRepairPlan(snapshots().slice(1))
    assert.equal(missing.conflicts.some(conflict => conflict.id === 'jacobsen-jansson-2022'), true)

    const drifted = snapshots()
    drifted[0] = { ...drifted[0]!, title: 'Different work' }
    const driftedPlan = buildThesisAccessDateRepairPlan(drifted)
    assert.match(driftedPlan.conflicts[0]?.detail ?? '', /title/)

    const previouslyDated = snapshots()
    previouslyDated[1] = { ...previouslyDated[1]!, accessDate: '2026-07-18' }
    const previouslyDatedPlan = buildThesisAccessDateRepairPlan(previouslyDated)
    assert.match(previouslyDatedPlan.conflicts[0]?.detail ?? '', /Unexpected accessDate/)
  })

  it('keeps apply behind reviewed-plan, lock, Serializable, and CAS guards', () => {
    const source = readFileSync('scripts/repair-thesis-access-dates.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(
      packageJson.scripts['repair:thesis-access-dates'],
      'tsx scripts/repair-thesis-access-dates.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FOR UPDATE/)
    assert.match(source, /updateMany/)
    assert.match(source, /accessDate: null/)
    assert.match(source, /isolationLevel: 'Serializable'/)
  })
})
