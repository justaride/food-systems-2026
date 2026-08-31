import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'

import {
  OWNER_INSIGHT_PATH,
  OWNER_PACKETS_PATH,
  OWNER_RECEIPTS_PATH,
  OWNER_STATUS_PATH,
  buildOwnerReviewArtifacts,
  verifyHistoricalEvidencePackage,
} from '../../scripts/knowledge/field08-owner-review'
import {
  OWNER_ATTESTATION,
  canonicalSha256,
  type Field08OwnerReviewReceipt,
} from '../../src/lib/field08-owner-review'

const root = fileURLToPath(new URL('../../', import.meta.url))

describe('Field 08 owner-review artifacts', () => {
  it('verifies immutable historical inputs from their pinned Git commit', () => {
    const result = verifyHistoricalEvidencePackage(root)
    assert.equal(result.inputSnapshotCount, 21)
    assert.equal(result.outputCount, 6)
    assert.match(result.evidencePackageHash, /^sha256:[a-f0-9]{64}$/)
  })

  it('builds five deterministic decision packets and an in-progress safe projection', () => {
    const first = buildOwnerReviewArtifacts(root, [])
    const second = buildOwnerReviewArtifacts(root, [])
    assert.deepEqual(first, second)
    assert.equal(first.packets.sources.length, 5)
    assert.equal(first.status.packageStatus, 'owner_review_in_progress')
    assert.equal(first.insights.insights.length, 0)
    for (const packet of first.packets.sources) {
      assert.ok(packet.claims.length > 0)
      assert.ok(packet.observations.length > 0)
      assert.ok(packet.locators.length > 0)
      assert.equal(packet.externalUseAllowed, false)
      assert.equal(packet.coveragePromotionAllowed, false)
    }
  })

  it('keeps deployable artifacts free of private paths, archive URIs, and PDF bytes', () => {
    const artifacts = buildOwnerReviewArtifacts(root, [])
    const deployable = JSON.stringify({ status: artifacts.status, insights: artifacts.insights })
    assert.doesNotMatch(deployable, /\.private-archive|BigBrain_StorageBox|file:\/\/|%PDF-/i)
    assert.doesNotMatch(deployable, /research\/evidence-pack\/.*\.pdf/i)
  })

  it('declares stable owner artifact paths', () => {
    assert.equal(OWNER_RECEIPTS_PATH, 'knowledge/pilots/field08/owner/field08-owner-review-receipts.v1.jsonl')
    assert.equal(OWNER_PACKETS_PATH, 'knowledge/pilots/field08/owner/field08-owner-review-packets.v1.json')
    assert.equal(OWNER_STATUS_PATH, 'src/data/field08-owner-review-status.v1.json')
    assert.equal(OWNER_INSIGHT_PATH, 'src/data/field08-internal-insights.v1.json')
    assert.doesNotThrow(() => JSON.parse(readFileSync(`${root}/knowledge/pilots/field08/gate2c/field08-evidence-generation-manifest.v1.json`, 'utf8')))
  })

  it('validates the generated status against the owner status contract', () => {
    const schema = JSON.parse(readFileSync(`${root}/knowledge/schema/field08-owner-review-status.schema.v1.json`, 'utf8'))
    const ajv = new Ajv2020({ allErrors: true, strict: false })
    addFormats(ajv)
    const validate = ajv.compile(schema)
    const status = buildOwnerReviewArtifacts(root, []).status
    assert.equal(validate(status), true, JSON.stringify(validate.errors))
  })

  it('validates every append-only receipt against the strict receipt contract', () => {
    const receipts = readFileSync(`${root}/${OWNER_RECEIPTS_PATH}`, 'utf8')
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line) as Field08OwnerReviewReceipt)
    assert.equal(receipts.length, 5)
    assert.doesNotThrow(() => buildOwnerReviewArtifacts(root, receipts))
    const invalid = { ...receipts[0], unexpectedAuthority: true } as Field08OwnerReviewReceipt
    assert.throws(() => buildOwnerReviewArtifacts(root, [invalid]), /violates.*receipt.*schema/i)
  })

  it('binds every possible insight to observations that exist in its source packet', () => {
    const baseline = buildOwnerReviewArtifacts(root, [])
    const receipts = baseline.sources.map((source, index) => {
      const payload = {
        documentType: 'field08_owner_review_receipt' as const,
        schemaVersion: '1.0.0' as const,
        receiptId: `owner_review.field08.fixture.${index + 1}`,
        sequence: 1,
        supersedesReceiptId: null,
        previousReceiptHash: null,
        evidencePackageHash: baseline.status.evidencePackageHash,
        sourceId: source.sourceId,
        sourceHash: source.sourceHash,
        signer: {
          personId: 'person.gabriel_freeman' as const,
          signedAt: '2026-08-31T10:00:00.000Z',
          attestation: OWNER_ATTESTATION,
        },
        decision: 'accepted_internal_with_limitations' as const,
        allowedInternalUses: ['Intern fixturebruk.'],
        limitations: ['Kun intern fixturebruk.'],
        openQuestions: [],
        aiAssistance: { used: true, disclosure: 'AI-test med eksplisitt disclosure.' },
        externalUseAllowed: false as const,
        coveragePromotionAllowed: false as const,
      }
      return { ...payload, contentHash: canonicalSha256(payload) } as Field08OwnerReviewReceipt
    })
    const accepted = buildOwnerReviewArtifacts(root, receipts)
    const observationIds = new Set(accepted.packets.sources.flatMap((packet) =>
      packet.observations.map((observation) => observation.observationId),
    ))
    for (const insight of accepted.insights.insights) {
      for (const observationId of insight.observationIds) {
        assert.ok(observationIds.has(observationId), `${insight.insightId} references unknown ${observationId}`)
      }
    }
  })
})
