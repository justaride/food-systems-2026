import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import {
  FIELD08_ARCHIVE_RIGHTS_ATTESTATION,
  FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS,
  createField08ArchiveRightsValidationContext,
  createPendingField08ArchiveRightsReceiptDraft,
  sealField08ArchiveRightsReceipt,
  validateField08ArchiveRightsReceipt,
  validateField08ArchiveRightsReceiptLog,
  type Field08ArchiveRightsReceipt,
  type Field08ArchiveRightsReceiptDraft,
  type Field08ArchiveRightsReview,
} from '../../src/lib/field08-archive-rights-receipt'
import {
  FIELD08_ARCHIVE_RIGHTS_SCHEMA_PATH,
  FIELD08_EVIDENCE_GENERATION_MANIFEST_PATH,
  FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH,
  parseField08ArchiveRightsCliArgs,
} from '../../scripts/knowledge/validate-field08-archive-rights-receipts'

const root = process.cwd()
const captureManifestBytes = readFileSync(FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH)
const captureManifest = JSON.parse(captureManifestBytes.toString('utf8')) as {
  captures: Array<{
    captureId: string
    sourceCandidateId: string
    sourceUrl: string
    accessedAt: string
    sha256: string
    sizeBytes: number
    mediaType: 'application/pdf'
  }>
}
const generationManifest = JSON.parse(
  readFileSync(FIELD08_EVIDENCE_GENERATION_MANIFEST_PATH, 'utf8'),
) as { sourceCommit: string }
const context = createField08ArchiveRightsValidationContext({
  captureManifest,
  captureManifestBytes,
  expectedSourceCommit: generationManifest.sourceCommit,
})
const capture = captureManifest.captures[0]
const digest = capture.sha256.slice('sha256:'.length)

function pendingDraft(
  sequence = 1,
  supersedesReceiptId: string | null = null,
  issuedAt = '2026-07-29T10:00:00Z',
  previousReceiptHash: string | null = null,
): Field08ArchiveRightsReceiptDraft {
  return createPendingField08ArchiveRightsReceiptDraft({
    receiptId: `receipt.archive_rights.field08.${capture.captureId.slice('capture.field08.'.length)}.r${sequence}`,
    receiptSequence: sequence,
    supersedesReceiptId,
    previousReceiptHash,
    issuedAt,
    captureIdentity: {
      captureManifestId: 'external_captures.field08_gate2c.v1',
      captureManifestSha256: context.captureManifestSha256,
      captureId: capture.captureId,
      sourceCandidateId: capture.sourceCandidateId,
      artifactSha256: capture.sha256,
      artifactSizeBytes: capture.sizeBytes,
      mediaType: capture.mediaType,
      sourceUrl: capture.sourceUrl,
      accessedAt: capture.accessedAt,
      sourceCommit: generationManifest.sourceCommit,
    },
    archive: {
      storageClass: 'private_content_addressed',
      durabilityState: 'archive_partial_not_durable',
      location: `private-archive://internal/sha256/${digest}`,
      versionId: 'version-primary-1',
      storedAt: '2026-07-29T08:00:00Z',
      verifiedAt: '2026-07-29T09:00:00Z',
      verifiedBy: {
        name: 'Archive Operator',
        role: 'Records custodian',
      },
      integritySha256: capture.sha256,
      sizeBytes: capture.sizeBytes,
      publicAccess: false,
      objectLock: {
        enabled: false,
        mode: null,
        retainUntil: null,
        legalHold: false,
      },
      replicas: [
        {
          replicaId: 'bigbrain',
          provider: 'BigBrain private volume',
          region: 'Local secondary volume',
          location: `private-archive://bigbrain/sha256/${digest}`,
          versionId: 'version-bigbrain-1',
          verifiedAt: '2026-07-29T09:05:00Z',
        },
      ],
    },
  })
}

function mixedReviewedRights(): Field08ArchiveRightsReview {
  const excluded = new Set([
    'cover',
    'pdf_bytes',
    'photographs_illustrations',
    'third_party_material',
  ])
  const components = FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS.map(componentId => {
    const isExcluded = excluded.has(componentId)
    return {
      componentId,
      description: isExcluded
        ? `${componentId} is expressly excluded from the governing license.`
        : `${componentId} is covered by the governing license.`,
      rightsStatus: isExcluded ? 'excluded_from_license' as const : 'license_applies' as const,
      licenseIdentifier: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      redistribution: isExcluded ? 'prohibited' as const : 'permitted_with_conditions' as const,
      conditions: isExcluded ? [] : ['Attribute the publisher and identify modifications.'],
      permissionEvidenceSha256: null,
    }
  })
  return {
    state: 'reviewed',
    overallRightsStatus: 'mixed',
    redistributionStatus: 'component_limited',
    licensedComponents: components
      .filter(component => component.rightsStatus === 'license_applies')
      .map(component => component.componentId),
    excludedComponents: components
      .filter(component => component.rightsStatus === 'excluded_from_license')
      .map(component => component.componentId),
    components,
    reviewer: {
      name: 'Named Rights Reviewer',
      role: 'Rights and reuse reviewer',
      organization: 'Independent review unit',
      conflictOfInterest: 'none_declared',
      conflictNote: null,
    },
    rightsEvidenceAccessedAt: '2026-07-30T09:00:00Z',
    reviewedAt: '2026-07-30T11:00:00Z',
    reviewEvidenceSha256: `sha256:${'a'.repeat(64)}`,
    attestation: FIELD08_ARCHIVE_RIGHTS_ATTESTATION,
  }
}

function reviewedSuccessor(previous: Field08ArchiveRightsReceipt) {
  const draft = pendingDraft(
    previous.receiptSequence + 1,
    previous.receiptId,
    '2026-07-30T12:00:00Z',
    previous.contentHash,
  )
  draft.status = 'archive_verified_rights_reviewed'
  draft.rightsReview = mixedReviewedRights()
  return sealField08ArchiveRightsReceipt(draft)
}

function reseal(receipt: Field08ArchiveRightsReceipt): Field08ArchiveRightsReceipt {
  const clone = structuredClone(receipt)
  const { contentHash: _contentHash, ...draft } = clone
  return sealField08ArchiveRightsReceipt(draft)
}

test('strict schema and runtime contract accept a fail-closed pending receipt', () => {
  const receipt = sealField08ArchiveRightsReceipt(pendingDraft())
  const schema = JSON.parse(readFileSync(FIELD08_ARCHIVE_RIGHTS_SCHEMA_PATH, 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  assert.equal(validate(receipt), true, JSON.stringify(validate.errors))
  assert.equal(receipt.rightsReview.redistributionStatus, 'not_cleared')
  assert.equal(receipt.archive.durabilityState, 'archive_partial_not_durable')
  assert.equal(receipt.archive.objectLock.enabled, false)
  assert.equal(receipt.previousReceiptHash, null)
  assert.equal(receipt.archive.replicas[0].location, `private-archive://bigbrain/sha256/${digest}`)
  assert.deepEqual(receipt.rightsReview.licensedComponents, [])
  assert.deepEqual(
    receipt.rightsReview.excludedComponents,
    FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS,
  )
  assert.equal(validateField08ArchiveRightsReceipt(receipt).contentHash, receipt.contentHash)

  const withUnexpectedProperty = { ...receipt, unexpected: true }
  assert.equal(validate(withUnexpectedProperty), false)
  assert.throws(
    () => validateField08ArchiveRightsReceipt(withUnexpectedProperty),
    /Unrecognized key: "unexpected"/,
  )
})

test('binds immutable capture identity to the untouched historical manifest and source commit', () => {
  const receipt = sealField08ArchiveRightsReceipt(pendingDraft())
  const before = captureManifestBytes.toString('utf8')
  assert.deepEqual(validateField08ArchiveRightsReceiptLog([receipt], context), [receipt])
  assert.equal(readFileSync(FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH, 'utf8'), before)

  const wrongUrl = structuredClone(receipt)
  wrongUrl.captureIdentity.sourceUrl = 'https://example.invalid/replacement.pdf'
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog([reseal(wrongUrl)], context),
    /immutable capture identity does not match/,
  )

  const wrongCommit = structuredClone(receipt)
  wrongCommit.captureIdentity.sourceCommit = 'f'.repeat(40)
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog([reseal(wrongCommit)], context),
    /immutable capture identity does not match/,
  )
})

test('supports an honest private partial archive and reserves durable status for locked replication', () => {
  const publicArchive = pendingDraft()
  Object.assign(publicArchive.archive, { publicAccess: true })
  assert.throws(
    () => sealField08ArchiveRightsReceipt(publicArchive),
    /archive.publicAccess: Invalid input/,
  )

  const wrongDigest = pendingDraft()
  wrongDigest.archive.location = `private-archive://primary/field08/sha256/${'0'.repeat(64)}`
  assert.throws(
    () => sealField08ArchiveRightsReceipt(wrongDigest),
    /archive location is not keyed by the artifact SHA-256/,
  )

  const duplicateReplica = pendingDraft()
  duplicateReplica.archive.replicas.push({
    ...duplicateReplica.archive.replicas[0],
    location: `private-archive://third-copy/sha256/${digest}`,
  })
  assert.throws(
    () => sealField08ArchiveRightsReceipt(duplicateReplica),
    /replica IDs must be unique and lexicographically sorted/,
  )

  const expiredLock = pendingDraft()
  expiredLock.archive.objectLock.enabled = true
  expiredLock.archive.objectLock.mode = 'compliance'
  expiredLock.archive.objectLock.retainUntil = '2026-07-29T08:30:00Z'
  assert.throws(
    () => sealField08ArchiveRightsReceipt(expiredLock),
    /retention must extend beyond archive verification/,
  )

  const overstatedDurability = pendingDraft()
  overstatedDurability.archive.durabilityState = 'archive_complete_durable'
  assert.throws(
    () => sealField08ArchiveRightsReceipt(overstatedDurability),
    /archive without object lock must remain partial and not durable/,
  )

  const completeArchive = pendingDraft()
  completeArchive.archive.durabilityState = 'archive_complete_durable'
  completeArchive.archive.objectLock = {
    enabled: true,
    mode: 'compliance',
    retainUntil: '2036-07-29T09:00:00Z',
    legalHold: false,
  }
  completeArchive.archive.replicas.push({
    replicaId: 'offsite',
    provider: 'Private offsite archive',
    region: 'Nordic offsite region',
    location: `private-archive://offsite/sha256/${digest}`,
    versionId: 'version-offsite-1',
    verifiedAt: '2026-07-29T09:10:00Z',
  })
  assert.equal(
    sealField08ArchiveRightsReceipt(completeArchive).archive.durabilityState,
    'archive_complete_durable',
  )
})

test('derives reviewed clearance from every material component and permission evidence', () => {
  const first = sealField08ArchiveRightsReceipt(pendingDraft())
  const reviewed = reviewedSuccessor(first)
  assert.equal(reviewed.rightsReview.redistributionStatus, 'component_limited')
  assert.equal(reviewed.rightsReview.overallRightsStatus, 'mixed')
  assert.deepEqual(validateField08ArchiveRightsReceiptLog([first, reviewed], context), [first, reviewed])

  const overstated = pendingDraft(2, first.receiptId, '2026-07-30T12:00:00Z', first.contentHash)
  overstated.status = 'archive_verified_rights_reviewed'
  overstated.rightsReview = mixedReviewedRights()
  overstated.rightsReview.redistributionStatus = 'cleared'
  assert.throws(
    () => sealField08ArchiveRightsReceipt(overstated),
    /redistributionStatus overstates or understates component clearance/,
  )

  const noPermissionEvidence = pendingDraft(
    2,
    first.receiptId,
    '2026-07-30T12:00:00Z',
    first.contentHash,
  )
  noPermissionEvidence.status = 'archive_verified_rights_reviewed'
  noPermissionEvidence.rightsReview = mixedReviewedRights()
  const component = noPermissionEvidence.rightsReview.components.find(
    item => item.componentId === 'report_text',
  )!
  component.rightsStatus = 'permission_granted'
  component.licenseIdentifier = null
  component.licenseUrl = null
  component.permissionEvidenceSha256 = null
  assert.throws(
    () => sealField08ArchiveRightsReceipt(noPermissionEvidence),
    /permission clearance requires exact permission evidence/,
  )

  const binaryOverclaim = pendingDraft(
    2,
    first.receiptId,
    '2026-07-30T12:00:00Z',
    first.contentHash,
  )
  binaryOverclaim.status = 'archive_verified_rights_reviewed'
  binaryOverclaim.rightsReview = mixedReviewedRights()
  const pdfBytes = binaryOverclaim.rightsReview.components.find(
    item => item.componentId === 'pdf_bytes',
  )!
  pdfBytes.rightsStatus = 'license_applies'
  pdfBytes.redistribution = 'permitted_with_conditions'
  pdfBytes.conditions = ['Attribute the publisher and identify modifications.']
  binaryOverclaim.rightsReview.licensedComponents = [
    ...binaryOverclaim.rightsReview.licensedComponents,
    'pdf_bytes',
  ].sort() as typeof binaryOverclaim.rightsReview.licensedComponents
  binaryOverclaim.rightsReview.excludedComponents =
    binaryOverclaim.rightsReview.excludedComponents.filter(componentId => componentId !== 'pdf_bytes')
  assert.throws(
    () => sealField08ArchiveRightsReceipt(binaryOverclaim),
    /cannot clear whole PDF bytes while an embedded component is not cleared/,
  )

  const noMaterialPresent = pendingDraft(
    2,
    first.receiptId,
    '2026-07-30T12:00:00Z',
    first.contentHash,
  )
  noMaterialPresent.status = 'archive_verified_rights_reviewed'
  noMaterialPresent.rightsReview = mixedReviewedRights()
  noMaterialPresent.rightsReview.components = FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS.map(
    componentId => ({
      componentId,
      description: `${componentId} is not present in this capture.`,
      rightsStatus: 'not_present',
      licenseIdentifier: null,
      licenseUrl: null,
      redistribution: 'not_applicable',
      conditions: [],
      permissionEvidenceSha256: null,
    }),
  )
  noMaterialPresent.rightsReview.licensedComponents = []
  noMaterialPresent.rightsReview.excludedComponents = []
  noMaterialPresent.rightsReview.overallRightsStatus = 'unknown'
  noMaterialPresent.rightsReview.redistributionStatus = 'not_cleared'
  assert.equal(
    sealField08ArchiveRightsReceipt(noMaterialPresent).rightsReview.overallRightsStatus,
    'unknown',
  )

  noMaterialPresent.rightsReview.overallRightsStatus = 'licensed'
  assert.throws(
    () => sealField08ArchiveRightsReceipt(noMaterialPresent),
    /overallRightsStatus does not match component decisions/,
  )
})

test('enforces unbroken supersession and immutable append-only prefixes', () => {
  const first = sealField08ArchiveRightsReceipt(pendingDraft())
  const second = reviewedSuccessor(first)
  assert.equal(validateField08ArchiveRightsReceiptLog([first, second], context).length, 2)

  const brokenChain = pendingDraft(
    2,
    'receipt.archive_rights.field08.wrong.r1',
    '2026-07-30T12:00:00Z',
    first.contentHash,
  )
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog(
      [first, sealField08ArchiveRightsReceipt(brokenChain)],
      context,
    ),
    /must supersede/,
  )

  const wrongPreviousHash = pendingDraft(
    2,
    first.receiptId,
    '2026-07-30T12:00:00Z',
    `sha256:${'f'.repeat(64)}`,
  )
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog(
      [first, sealField08ArchiveRightsReceipt(wrongPreviousHash)],
      context,
    ),
    /previousReceiptHash does not bind/,
  )

  const mutatedFirst = structuredClone(first)
  mutatedFirst.archive.versionId = 'silently-replaced-version'
  const resealedMutation = reseal(mutatedFirst)
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog(
      [resealedMutation, reviewedSuccessor(resealedMutation)],
      context,
      { previousValues: [first] },
    ),
    /append-only log mutated prior entry 1/,
  )
  assert.throws(
    () => validateField08ArchiveRightsReceiptLog([], context, { previousValues: [first] }),
    /removed one or more prior receipts/,
  )
})

test('detects content tampering even when all semantic fields remain plausible', () => {
  const receipt = sealField08ArchiveRightsReceipt(pendingDraft())
  const tampered = structuredClone(receipt)
  tampered.archive.verifiedBy.role = 'Different role after signing'
  assert.throws(
    () => validateField08ArchiveRightsReceipt(tampered),
    /contentHash mismatch/,
  )
})

test('CLI validates a JSONL log and can compare it with a prior immutable prefix', () => {
  const first = sealField08ArchiveRightsReceipt(pendingDraft())
  const second = reviewedSuccessor(first)
  const directory = mkdtempSync(join(tmpdir(), 'field08-archive-rights-'))
  const priorPath = join(directory, 'prior.jsonl')
  const currentPath = join(directory, 'current.jsonl')
  try {
    writeFileSync(priorPath, `${JSON.stringify(first)}\n`)
    writeFileSync(currentPath, `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`)
    const result = spawnSync(
      process.execPath,
      [
        '--import=tsx',
        'scripts/knowledge/validate-field08-archive-rights-receipts.ts',
        '--receipts',
        currentPath,
        '--previous-log',
        priorPath,
      ],
      { cwd: root, encoding: 'utf8' },
    )
    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.match(result.stdout, /Validated 2 append-only Field 08 archive\/rights receipt/)
    assert.match(result.stdout, /no evidence-readiness promotion was granted/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('CLI parser requires an explicit receipt log and keeps historical inputs as defaults', () => {
  assert.throws(() => parseField08ArchiveRightsCliArgs([]), /Usage:/)
  assert.deepEqual(parseField08ArchiveRightsCliArgs(['--receipts', 'receipts.jsonl']), {
    receiptsPath: 'receipts.jsonl',
    captureManifestPath: FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH,
    generationManifestPath: FIELD08_EVIDENCE_GENERATION_MANIFEST_PATH,
    previousLogPath: null,
  })
})
