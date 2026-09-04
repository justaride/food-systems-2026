import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { verifyEstateBackupReceipt } from '../../scripts/lib/estate-backup-receipt'

const ARTIFACT = 'coolify-food-systems-pgvector-db-20260904-013008-8cb16d.dump.age'
const SHA256 = '63f6d3c6158824b71d65d2eda465e5eb5a5ab528962fe95edcc0ff89f4fb9f9e'
const ASSET_KEY = 'coolify:l0s8o8oo00c8gossw0gksswk'
const DATABASE_UUID = 'l0s8o8oo00c8gossw0gksswk'

function validReceipt(): unknown {
  return {
    schemaVersion: 1,
    authority: 'gabibfree-estate-data-asset-proofs',
    assetKey: ASSET_KEY,
    databaseUuid: DATABASE_UUID,
    source: {
      repository: 'justaride/gabibfree-dashboard',
      commit: '8e346e8329b948f326d6ffe3a3935b74a829d85d',
      manifest: 'MANIFEST-COOLIFY-v1.tsv',
      manifestLine: 748,
    },
    artifact: {
      ref: ARTIFACT,
      sha256: SHA256,
      bytes: 21_475_773,
      icloudStatus: 'verified',
      s3Status: 'verified',
    },
    proofs: [
      {
        kind: 'backup',
        artifactRef: ARTIFACT,
        artifactSha256: SHA256,
        provenAt: '2026-09-04T01:30:28Z',
      },
      {
        kind: 'offsite',
        artifactRef: ARTIFACT,
        artifactSha256: SHA256,
        provenAt: '2026-09-04T01:30:28Z',
      },
      {
        kind: 'restore',
        artifactRef: ARTIFACT,
        artifactSha256: SHA256,
        provenAt: '2026-09-04T01:30:25Z',
      },
    ],
    capturedAt: '2026-09-04T14:24:18Z',
  }
}

const options = {
  expectedAssetKey: ASSET_KEY,
  expectedDatabaseUuid: DATABASE_UUID,
  maxAgeHours: 36,
  now: new Date('2026-09-04T14:30:00Z'),
}

describe('Estate backup receipt verifier', () => {
  it('validates the reviewed production receipt at its capture time', () => {
    const receipt = JSON.parse(
      readFileSync(
        'config/production-backup-receipts/food-systems-pgvector-db-2026-09-04.json',
        'utf8',
      ),
    ) as unknown

    const verified = verifyEstateBackupReceipt(receipt, options)
    assert.equal(verified.artifactSha256, SHA256)
  })

  it('accepts a fresh receipt with backup, offsite, and restore proofs bound to one artifact', () => {
    const verified = verifyEstateBackupReceipt(validReceipt(), options)

    assert.equal(verified.artifactRef, ARTIFACT)
    assert.equal(verified.artifactSha256, SHA256)
    assert.equal(verified.sourceCommit, '8e346e8329b948f326d6ffe3a3935b74a829d85d')
    assert.ok(verified.oldestProofAgeHours > 12 && verified.oldestProofAgeHours < 14)
  })

  it('rejects a receipt when any required proof is older than the maximum age', () => {
    assert.throws(
      () =>
        verifyEstateBackupReceipt(validReceipt(), {
          ...options,
          now: new Date('2026-09-05T14:30:26Z'),
        }),
      /older than 36 hours/,
    )
  })

  it('rejects the wrong asset or database identity', () => {
    assert.throws(
      () => verifyEstateBackupReceipt(validReceipt(), { ...options, expectedAssetKey: 'coolify:other' }),
      /assetKey/,
    )
    assert.throws(
      () =>
        verifyEstateBackupReceipt(validReceipt(), {
          ...options,
          expectedDatabaseUuid: 'other-database',
        }),
      /databaseUuid/,
    )
  })

  it('rejects a proof whose artifact or hash differs from the receipt artifact', () => {
    const receipt = validReceipt() as {
      proofs: Array<{ artifactSha256: string }>
    }
    receipt.proofs[1].artifactSha256 = '0'.repeat(64)

    assert.throws(() => verifyEstateBackupReceipt(receipt, options), /proof artifact binding/)
  })

  it('rejects missing, duplicate, or future-dated required proofs', () => {
    const missing = validReceipt() as { proofs: Array<{ kind: string }> }
    missing.proofs = missing.proofs.filter(proof => proof.kind !== 'restore')
    assert.throws(() => verifyEstateBackupReceipt(missing, options), /exactly one .*restore/)

    const duplicate = validReceipt() as { proofs: Array<Record<string, unknown>> }
    duplicate.proofs.push({ ...duplicate.proofs[0] })
    assert.throws(() => verifyEstateBackupReceipt(duplicate, options), /exactly one .*backup/)

    const future = validReceipt() as { proofs: Array<{ provenAt: string }> }
    future.proofs[0].provenAt = '2026-09-04T14:31:00Z'
    assert.throws(() => verifyEstateBackupReceipt(future, options), /future/)
  })

  it('rejects unverified offsite copies and malformed or extended receipts', () => {
    const unverified = validReceipt() as { artifact: { s3Status: string } }
    unverified.artifact.s3Status = 'missing'
    assert.throws(() => verifyEstateBackupReceipt(unverified, options), /s3Status/)

    const extended = validReceipt() as Record<string, unknown>
    extended.bypass = true
    assert.throws(() => verifyEstateBackupReceipt(extended, options), /unknown field/)

    assert.throws(() => verifyEstateBackupReceipt('not an object', options), /receipt must be an object/)
  })

  it('rejects invalid verifier configuration', () => {
    assert.throws(
      () => verifyEstateBackupReceipt(validReceipt(), { ...options, maxAgeHours: 0 }),
      /maxAgeHours/,
    )
    assert.throws(
      () => verifyEstateBackupReceipt(validReceipt(), { ...options, now: new Date('invalid') }),
      /now/,
    )
  })
})
