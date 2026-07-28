import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import {
  PINNED_REPORT_ACCESS_DATE_MANIFEST_SHA256,
  REVIEWED_REPORT_ACCESS_DATE_TARGETS,
  buildReportAccessDateRepairPlan,
  reportAccessDateRepairPlanSha256,
  validateReportAccessDateSeedTargets,
  validateReviewedReportAccessDateTargets,
  type ReportAccessDateSnapshot,
} from '../../scripts/repair-report-access-dates'

function snapshots(state: 'pending' | 'applied' = 'pending'): ReportAccessDateSnapshot[] {
  return REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => ({
    id: target.id,
    title: target.title,
    institution: target.institution,
    year: target.year,
    sourceUrl: state === 'pending' ? target.expectedSourceUrl : target.targetSourceUrl,
    accessedAt: state === 'pending' ? null : target.accessedAt,
  }))
}

describe('verified Report access-date and locator repair', () => {
  it('pins exactly 25 reviewed Report identities and the single dead-locator repair', () => {
    validateReviewedReportAccessDateTargets()
    validateReportAccessDateSeedTargets(reports)

    assert.equal(REVIEWED_REPORT_ACCESS_DATE_TARGETS.length, 25)
    assert.equal(PINNED_REPORT_ACCESS_DATE_MANIFEST_SHA256.length, 64)
    assert.deepEqual(
      Object.fromEntries(
        (['http_200', 'browser_verified_bot_blocked', 'repaired_404'] as const)
          .map(method => [
            method,
            REVIEWED_REPORT_ACCESS_DATE_TARGETS.filter(target => (
              target.verificationMethod === method
            )).length,
          ]),
      ),
      {
        http_200: 19,
        browser_verified_bot_blocked: 5,
        repaired_404: 1,
      },
    )

    const locatorRepairs = REVIEWED_REPORT_ACCESS_DATE_TARGETS.filter(target => (
      target.expectedSourceUrl !== target.targetSourceUrl
    ))
    assert.deepEqual(locatorRepairs.map(target => target.id), [
      'danmark-groent-danmark-co2-avgift-2024',
    ])
    assert.equal(
      locatorRepairs[0]?.targetSourceUrl,
      'https://regeringen.dk/aktuelt/tidligere-publikationer/aftale-om-et-groent-danmark/',
    )
    assert.ok(REVIEWED_REPORT_ACCESS_DATE_TARGETS.every(target => (
      target.accessedAt === '2026-07-19'
    )))
  })

  it('builds a deterministic 25-row pending plan from exact old snapshots', () => {
    const plan = buildReportAccessDateRepairPlan(snapshots())

    assert.deepEqual(plan.summary, {
      total: 25,
      pending: 25,
      alreadyApplied: 0,
      conflicts: 0,
    })
    assert.deepEqual(
      plan.updates.map(target => target.id),
      REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => target.id),
    )
    assert.match(reportAccessDateRepairPlanSha256(plan), /^[a-f0-9]{64}$/)
    assert.equal(reportAccessDateRepairPlanSha256(plan), reportAccessDateRepairPlanSha256(plan))
  })

  it('is idempotent after all reviewed dates and the repaired locator are present', () => {
    const plan = buildReportAccessDateRepairPlan(snapshots('applied'))

    assert.deepEqual(plan.summary, {
      total: 25,
      pending: 0,
      alreadyApplied: 25,
      conflicts: 0,
    })
    assert.equal(plan.updates.length, 0)
    assert.deepEqual(
      plan.alreadyAppliedIds,
      REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => target.id),
    )
  })

  it('fails closed on missing, identity-drifted, previously dated, or partial locator states', () => {
    const missing = buildReportAccessDateRepairPlan(snapshots().slice(1))
    assert.equal(
      missing.conflicts.some(conflict => conflict.id === 'beredskap-island-melmolle-2025'),
      true,
    )

    const drifted = snapshots()
    drifted[0] = { ...drifted[0]!, institution: 'Different institution' }
    const driftedPlan = buildReportAccessDateRepairPlan(drifted)
    assert.match(driftedPlan.conflicts[0]?.detail ?? '', /institution/)

    const previouslyDated = snapshots()
    previouslyDated[1] = { ...previouslyDated[1]!, accessedAt: '2026-07-18' }
    const previouslyDatedPlan = buildReportAccessDateRepairPlan(previouslyDated)
    assert.match(previouslyDatedPlan.conflicts[0]?.detail ?? '', /Unexpected sourceUrl\/accessedAt state/)

    const partial = snapshots()
    const repairIndex = REVIEWED_REPORT_ACCESS_DATE_TARGETS.findIndex(target => (
      target.id === 'danmark-groent-danmark-co2-avgift-2024'
    ))
    partial[repairIndex] = {
      ...partial[repairIndex]!,
      sourceUrl: REVIEWED_REPORT_ACCESS_DATE_TARGETS[repairIndex]!.targetSourceUrl,
    }
    const partialPlan = buildReportAccessDateRepairPlan(partial)
    assert.equal(
      partialPlan.conflicts.some(conflict => (
        conflict.id === 'danmark-groent-danmark-co2-avgift-2024'
      )),
      true,
    )
  })

  it('keeps apply behind reviewed-plan, advisory-lock, row-lock, Serializable, and exact CAS guards', () => {
    const source = readFileSync('scripts/repair-report-access-dates.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(
      packageJson.scripts['repair:report-access-dates'],
      'tsx scripts/repair-report-access-dates.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FOR UPDATE/)
    assert.match(source, /updateMany/)
    assert.match(source, /sourceUrl: target\.expectedSourceUrl/)
    assert.match(source, /accessedAt: null/)
    assert.match(source, /isolationLevel: 'Serializable'/)
  })

  it('tracks all 25 rows, the read-only verification boundary, and the controlled local apply receipt', () => {
    const receipt = readFileSync(
      'research/_status/academic-report-access-date-verification-2026-07-19.md',
      'utf8',
    )
    const receiptRows = receipt.split('\n').filter(line => line.startsWith('| `'))

    assert.equal(receiptRows.length, 25)
    assert.equal(receiptRows.filter(line => line.includes('| `http_200` |')).length, 19)
    assert.equal(
      receiptRows.filter(line => line.includes('| `browser_verified_bot_blocked` |')).length,
      5,
    )
    assert.equal(receiptRows.filter(line => line.includes('| `repaired_404` |')).length, 1)
    for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
      assert.match(receipt, new RegExp(`\\| \`${target.id}\` \\|`))
    }
    assert.match(receipt, /HTTP 403 or 406/)
    assert.match(receipt, /returned HTTP 404/)
    assert.match(receipt, /publication date `24\.06\.2024`/)
    assert.match(receipt, /The locator checks were read-only/)
    assert.match(receipt, /Applied plan SHA-256: `aad08ca103c627c24de1cf8db80a96b606320a614fc7f33267fec8cc402e1954`/)
    assert.match(receipt, /Result: \*\*PASS\*\*, 25 rows updated atomically/)
    assert.match(receipt, /Post-state: 0 pending, 25 already applied, 0 conflicts/)
    assert.match(receipt, /does not prove a canonical-checkout integration/)
  })
})
