import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { collectAssertedScopes } from '../../../src/lib/hvitbok/embeds'
import { DATASETS } from '../../../src/lib/coverage/datasets'
import { auditCoverageClaims } from '../../../src/lib/citations/report-claim-audit'

describe('coverage guard', () => {
  it('every annotated embed references a known datasetId', () => {
    const known = new Set(DATASETS.map((d) => d.id))
    for (const claim of collectAssertedScopes()) {
      assert.ok(
        known.has(claim.assertedScope.datasetId),
        `Unknown datasetId "${claim.assertedScope.datasetId}" in embed ${claim.ref}`,
      )
    }
  })

  it('no claim references a datasetId that cannot be checked (would fail-closed at build)', () => {
    const profilesFromRegistry = DATASETS.map((d) => ({
      datasetId: d.id,
      label: d.label,
      temporal: { kind: 'unknown' } as const,
      geographic: { countries: [], presentedAs: d.presentedAs, noAsNordicProxy: false },
      verification: { total: 0, humanVerified: 0, machineVerified: 0, needsReview: 0, humanVerifiedPct: 0, rollup: 'needs_review' as const },
      computedAt: '1970-01-01T00:00:00.000Z',
      computedEnv: 'local' as const,
    }))
    const missing = auditCoverageClaims(collectAssertedScopes(), profilesFromRegistry).filter(
      (i) => i.code === 'coverage_profile_missing',
    )
    assert.deepEqual(missing, [])
  })
})
