import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  OWNER_ATTESTATION,
  buildField08InsightRegister,
  buildOwnerReviewStatus,
  canonicalJson,
  canonicalSha256,
  validateOwnerReviewReceipt,
  validateOwnerReviewReceiptLog,
  type Field08OwnerReviewReceipt,
  type Field08OwnerReviewSource,
} from '../../src/lib/field08-owner-review'

const packageHash = 'sha256:' + 'a'.repeat(64)
const sourceHash = 'sha256:' + 'b'.repeat(64)

const sources: Field08OwnerReviewSource[] = [
  {
    sourceId: 'source.eurostat',
    sourceHash,
    title: 'Eurostat',
    publisher: 'Eurostat',
    geographyIds: ['geo.dk', 'geo.fi'],
    locatorCount: 2,
  },
  {
    sourceId: 'source.luke',
    sourceHash: 'sha256:' + 'c'.repeat(64),
    title: 'Luke',
    publisher: 'Luke',
    geographyIds: ['geo.fi', 'geo.ax'],
    locatorCount: 2,
  },
]

function receipt(
  source = sources[0],
  overrides: Partial<Field08OwnerReviewReceipt> = {},
): Field08OwnerReviewReceipt {
  const payload = {
    documentType: 'field08_owner_review_receipt' as const,
    schemaVersion: '1.0.0' as const,
    receiptId: `owner_review.field08.${source.sourceId}.2026-08-31.1`,
    sequence: 1,
    supersedesReceiptId: null,
    previousReceiptHash: null,
    evidencePackageHash: packageHash,
    sourceId: source.sourceId,
    sourceHash: source.sourceHash,
    signer: {
      personId: 'person.gabriel_freeman' as const,
      signedAt: '2026-08-31T10:00:00.000Z',
      attestation: OWNER_ATTESTATION,
    },
    decision: 'accepted_internal_with_limitations' as const,
    allowedInternalUses: ['Intern analyse av den erklærte kilden innenfor oppgitte grenser.'],
    limitations: ['Ikke sammenlign direkte med andre land.'],
    openQuestions: ['Er systemgrensen fullt harmonisert?'],
    aiAssistance: {
      used: true,
      disclosure: 'AI forberedte beslutningspakken; Gabriel kontrollerte kilden og tok beslutningen.',
    },
    externalUseAllowed: false as const,
    coveragePromotionAllowed: false as const,
  }
  const merged = { ...payload, ...overrides }
  return {
    ...merged,
    contentHash: canonicalSha256(merged),
  } as Field08OwnerReviewReceipt
}

describe('Field 08 owner review receipt', () => {
  it('orders canonical object keys by UTF-8 bytes, independent of locale collation', () => {
    assert.equal(canonicalJson({ 'ä': 1, z: 2 }), '{"z":2,"ä":1}')
  })

  it('accepts the fixed Gabriel signer and exact package/source bindings', () => {
    assert.doesNotThrow(() => validateOwnerReviewReceipt(receipt(), {
      evidencePackageHash: packageHash,
      sources,
      now: new Date('2026-08-31T11:00:00.000Z'),
    }))
  })

  it('rejects another signer or an AI signer', () => {
    for (const personId of ['person.someone_else', 'agent.ai']) {
      const invalid = receipt(sources[0], {
        signer: {
          personId: personId as 'person.gabriel_freeman',
          signedAt: '2026-08-31T10:00:00.000Z',
          attestation: OWNER_ATTESTATION,
        },
      })
      assert.throws(() => validateOwnerReviewReceipt(invalid, {
        evidencePackageHash: packageHash,
        sources,
        now: new Date('2026-08-31T11:00:00.000Z'),
      }), /Gabriel/)
    }
  })

  it('rejects wrong package hash, missing AI disclosure, and future timestamps', () => {
    const cases: Array<[Field08OwnerReviewReceipt, RegExp]> = [
      [receipt(sources[0], { evidencePackageHash: 'sha256:' + 'd'.repeat(64) }), /package hash/i],
      [receipt(sources[0], { aiAssistance: { used: true, disclosure: '' } }), /AI disclosure/i],
      [receipt(sources[0], { signer: { personId: 'person.gabriel_freeman', signedAt: '2026-09-01T10:00:00.000Z', attestation: OWNER_ATTESTATION } }), /future/i],
    ]
    for (const [invalid, pattern] of cases) {
      assert.throws(() => validateOwnerReviewReceipt(invalid, {
        evidencePackageHash: packageHash,
        sources,
        now: new Date('2026-08-31T11:00:00.000Z'),
      }), pattern)
    }
  })

  it('enforces append-only per-source supersession and detects rewritten history', () => {
    const first = receipt()
    const second = receipt(sources[0], {
      receiptId: 'owner_review.field08.source.eurostat.2026-08-31.2',
      sequence: 2,
      supersedesReceiptId: first.receiptId,
      previousReceiptHash: first.contentHash,
      decision: 'returned_for_revision',
    })
    assert.doesNotThrow(() => validateOwnerReviewReceiptLog([first, second], {
      evidencePackageHash: packageHash,
      sources,
      now: new Date('2026-08-31T11:00:00.000Z'),
    }, [first]))
    const rewritten = { ...first, limitations: ['Omskrevet'] }
    rewritten.contentHash = canonicalSha256((({ contentHash: _, ...rest }) => rest)(rewritten))
    assert.throws(() => validateOwnerReviewReceiptLog([rewritten, second], {
      evidencePackageHash: packageHash,
      sources,
      now: new Date('2026-08-31T11:00:00.000Z'),
    }, [first]), /append-only/i)
  })
})

describe('Field 08 status and insight stoplines', () => {
  it('keeps partial review in progress and preserves all non-owner gates', () => {
    const status = buildOwnerReviewStatus(packageHash, sources, [receipt()])
    assert.equal(status.packageStatus, 'owner_review_in_progress')
    assert.equal(status.axes.expertReview, 'unchanged_pending')
    assert.equal(status.axes.coverage, 'unchanged_blocked')
  })

  it('completes when every source has an explicit terminal disposition', () => {
    const all = sources.map((source) => receipt(source, {
      receiptId: `owner_review.field08.${source.sourceId}.2026-08-31.1`,
    }))
    assert.equal(
      buildOwnerReviewStatus(packageHash, sources, all).packageStatus,
      'owner_review_complete_internal_only',
    )
    all[1] = receipt(sources[1], { decision: 'retained_open' })
    assert.equal(
      buildOwnerReviewStatus(packageHash, sources, all).packageStatus,
      'owner_review_complete_internal_only',
    )
  })

  it('emits findings only for accepted sources and blocks forbidden comparisons', () => {
    const accepted = receipt()
    const open = receipt(sources[1], { decision: 'retained_open' })
    const register = buildField08InsightRegister(packageHash, sources, [accepted, open])
    assert.ok(register.insights.every((item) => item.sourceIds.every((id) => id === 'source.eurostat')))
    assert.ok(register.blockedComparisons.some((item) => /Finland.*Åland|Åland.*Finland/.test(item.reason)))
    assert.ok(register.blockedComparisons.some((item) => /nordisk rangering/i.test(item.statement)))
    assert.ok(register.gaps.some((item) => item.sourceIds.includes('source.luke')))
    assert.equal(register.externalUseAllowed, false)
  })
})
