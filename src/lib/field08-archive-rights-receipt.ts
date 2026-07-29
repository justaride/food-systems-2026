import { createHash } from 'node:crypto'
import { z } from 'zod'

export const FIELD08_ARCHIVE_RIGHTS_ATTESTATION =
  'I_REVIEWED_THE_RIGHTS_EVIDENCE_AND_RECORDED_COMPONENT_LEVEL_REDISTRIBUTION_LIMITS' as const

export const FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS = [
  'cover',
  'diagrams_infographics',
  'pdf_bytes',
  'photographs_illustrations',
  'report_text',
  'tables',
  'third_party_material',
] as const

export const FIELD08_ARCHIVE_RIGHTS_SEMANTICS = {
  appendOnly: true,
  historicalCaptureManifestMutationAllowed: false,
  publicArchiveAllowed: false,
  externalUsePromotionAllowed: false,
  coveragePromotionAllowed: false,
} as const

const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/)
const gitCommitSchema = z.string().regex(/^[a-f0-9]{40}$/)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const dateTimeSchema = z.string().refine(
  value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value)),
  'Expected an ISO 8601 date-time with an explicit UTC offset',
)
const privateArchiveLocationSchema = z.string().regex(
  /^private-archive:\/\/[a-z0-9][a-z0-9._/-]*\/sha256\/[a-f0-9]{64}$/,
)
const componentIdSchema = z.enum(FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS)

const captureIdentitySchema = z.object({
  captureManifestId: z.literal('external_captures.field08_gate2c.v1'),
  captureManifestSha256: sha256Schema,
  captureId: z.string().regex(/^capture\.field08\.[a-z0-9][a-z0-9._-]*$/),
  sourceCandidateId: z.string().regex(/^field08\.source\.[a-z0-9][a-z0-9._-]*$/),
  artifactSha256: sha256Schema,
  artifactSizeBytes: z.number().int().positive(),
  mediaType: z.literal('application/pdf'),
  sourceUrl: z.string().url(),
  accessedAt: dateSchema,
  sourceCommit: gitCommitSchema,
}).strict()

const archiveVerifierSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
}).strict()

const objectLockSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(['governance', 'compliance']).nullable(),
  retainUntil: dateTimeSchema.nullable(),
  legalHold: z.boolean(),
}).strict()

const replicaSchema = z.object({
  replicaId: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/),
  provider: z.string().min(2),
  region: z.string().min(2),
  location: privateArchiveLocationSchema,
  versionId: z.string().min(1),
  verifiedAt: dateTimeSchema,
}).strict()

const archiveSchema = z.object({
  storageClass: z.literal('private_content_addressed'),
  durabilityState: z.enum(['archive_partial_not_durable', 'archive_complete_durable']),
  location: privateArchiveLocationSchema,
  versionId: z.string().min(1),
  storedAt: dateTimeSchema,
  verifiedAt: dateTimeSchema,
  verifiedBy: archiveVerifierSchema,
  integritySha256: sha256Schema,
  sizeBytes: z.number().int().positive(),
  publicAccess: z.literal(false),
  objectLock: objectLockSchema,
  replicas: z.array(replicaSchema).min(1),
}).strict()

const reviewerSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  organization: z.string().min(2).nullable(),
  conflictOfInterest: z.enum(['none_declared', 'declared_managed']),
  conflictNote: z.string().min(1).nullable(),
}).strict()

const componentDecisionSchema = z.object({
  componentId: componentIdSchema,
  description: z.string().min(1),
  rightsStatus: z.enum([
    'pending',
    'license_applies',
    'permission_granted',
    'public_domain',
    'excluded_from_license',
    'rights_reserved',
    'unknown',
    'not_present',
  ]),
  licenseIdentifier: z.string().min(1).nullable(),
  licenseUrl: z.string().url().nullable(),
  redistribution: z.enum([
    'prohibited',
    'short_quotation_only',
    'permitted_with_conditions',
    'permitted',
    'not_applicable',
  ]),
  conditions: z.array(z.string().min(1)),
  permissionEvidenceSha256: sha256Schema.nullable(),
}).strict()

const rightsReviewSchema = z.object({
  state: z.enum(['pending', 'reviewed']),
  overallRightsStatus: z.enum([
    'unknown',
    'restricted',
    'licensed',
    'permission_granted',
    'public_domain',
    'mixed',
  ]),
  redistributionStatus: z.enum(['not_cleared', 'component_limited', 'cleared']),
  licensedComponents: z.array(componentIdSchema),
  excludedComponents: z.array(componentIdSchema),
  components: z.array(componentDecisionSchema).length(FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS.length),
  reviewer: reviewerSchema.nullable(),
  rightsEvidenceAccessedAt: dateTimeSchema.nullable(),
  reviewedAt: dateTimeSchema.nullable(),
  reviewEvidenceSha256: sha256Schema.nullable(),
  attestation: z.literal(FIELD08_ARCHIVE_RIGHTS_ATTESTATION).nullable(),
}).strict()

const semanticsSchema = z.object({
  appendOnly: z.literal(true),
  historicalCaptureManifestMutationAllowed: z.literal(false),
  publicArchiveAllowed: z.literal(false),
  externalUsePromotionAllowed: z.literal(false),
  coveragePromotionAllowed: z.literal(false),
}).strict()

export const field08ArchiveRightsReceiptSchema = z.object({
  documentType: z.literal('field08_gate2c_archive_rights_receipt'),
  schemaVersion: z.literal('1.0.0'),
  receiptId: z.string().regex(
    /^receipt\.archive_rights\.field08\.[a-z0-9][a-z0-9._-]*\.r[1-9][0-9]*$/,
  ),
  receiptSequence: z.number().int().positive(),
  status: z.enum([
    'archive_verified_rights_pending',
    'archive_verified_rights_reviewed',
  ]),
  supersedesReceiptId: z.string().regex(
    /^receipt\.archive_rights\.field08\.[a-z0-9][a-z0-9._-]*\.r[1-9][0-9]*$/,
  ).nullable(),
  previousReceiptHash: sha256Schema.nullable(),
  issuedAt: dateTimeSchema,
  captureIdentity: captureIdentitySchema,
  archive: archiveSchema,
  rightsReview: rightsReviewSchema,
  semantics: semanticsSchema,
  contentHash: sha256Schema,
}).strict()

export type Field08ArchiveRightsReceipt = z.infer<typeof field08ArchiveRightsReceiptSchema>
export type Field08ArchiveRightsReceiptDraft = Omit<Field08ArchiveRightsReceipt, 'contentHash'>
export type Field08ArchiveRightsComponentId = (typeof FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS)[number]
export type Field08ArchiveRightsReview = Field08ArchiveRightsReceipt['rightsReview']

export type Field08ExternalCaptureSnapshot = {
  captureId: string
  sourceCandidateId: string
  sourceUrl: string
  accessedAt: string
  sha256: string
  sizeBytes: number
  mediaType: string
}

export type Field08ExternalCaptureManifestSnapshot = {
  documentType: 'field08_gate2c_external_capture_manifest'
  schemaVersion: '1.0.0'
  manifestId: 'external_captures.field08_gate2c.v1'
  captures: readonly Field08ExternalCaptureSnapshot[]
}

export type Field08ArchiveRightsValidationContext = {
  captureManifest: Field08ExternalCaptureManifestSnapshot
  captureManifestSha256: string
  expectedSourceCommit: string
}

const externalCaptureSchema = z.object({
  captureId: z.string().regex(/^capture\.field08\.[a-z0-9][a-z0-9._-]*$/),
  sourceCandidateId: z.string().regex(/^field08\.source\.[a-z0-9][a-z0-9._-]*$/),
  sourceUrl: z.string().url(),
  accessedAt: dateSchema,
  sha256: sha256Schema,
  sizeBytes: z.number().int().positive(),
  mediaType: z.literal('application/pdf'),
}).passthrough()

const externalCaptureManifestSchema = z.object({
  documentType: z.literal('field08_gate2c_external_capture_manifest'),
  schemaVersion: z.literal('1.0.0'),
  manifestId: z.literal('external_captures.field08_gate2c.v1'),
  captures: z.array(externalCaptureSchema),
}).passthrough()

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`
}

export function sha256Field08ArchiveRightsValue(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

export function computeField08ArchiveRightsReceiptContentHash(
  receipt: Field08ArchiveRightsReceipt | Field08ArchiveRightsReceiptDraft,
): string {
  const { contentHash: _contentHash, ...contract } = receipt as Field08ArchiveRightsReceipt
  return sha256Field08ArchiveRightsValue(contract)
}

export function sealField08ArchiveRightsReceipt(
  draft: Field08ArchiveRightsReceiptDraft,
): Field08ArchiveRightsReceipt {
  return validateField08ArchiveRightsReceipt({
    ...draft,
    contentHash: computeField08ArchiveRightsReceiptContentHash(draft),
  })
}

export function createPendingField08ArchiveRightsReview(): Field08ArchiveRightsReview {
  return {
    state: 'pending',
    overallRightsStatus: 'unknown',
    redistributionStatus: 'not_cleared',
    licensedComponents: [],
    excludedComponents: [...FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS],
    components: FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS.map(componentId => ({
      componentId,
      description: `Rights review pending for ${componentId}.`,
      rightsStatus: 'pending',
      licenseIdentifier: null,
      licenseUrl: null,
      redistribution: 'prohibited',
      conditions: [],
      permissionEvidenceSha256: null,
    })),
    reviewer: null,
    rightsEvidenceAccessedAt: null,
    reviewedAt: null,
    reviewEvidenceSha256: null,
    attestation: null,
  }
}

export function createPendingField08ArchiveRightsReceiptDraft(input: {
  receiptId: string
  receiptSequence: number
  supersedesReceiptId: string | null
  previousReceiptHash: string | null
  issuedAt: string
  captureIdentity: Field08ArchiveRightsReceipt['captureIdentity']
  archive: Field08ArchiveRightsReceipt['archive']
}): Field08ArchiveRightsReceiptDraft {
  return {
    documentType: 'field08_gate2c_archive_rights_receipt',
    schemaVersion: '1.0.0',
    receiptId: input.receiptId,
    receiptSequence: input.receiptSequence,
    status: 'archive_verified_rights_pending',
    supersedesReceiptId: input.supersedesReceiptId,
    previousReceiptHash: input.previousReceiptHash,
    issuedAt: input.issuedAt,
    captureIdentity: input.captureIdentity,
    archive: input.archive,
    rightsReview: createPendingField08ArchiveRightsReview(),
    semantics: FIELD08_ARCHIVE_RIGHTS_SEMANTICS,
  }
}

function fail(message: string): never {
  throw new Error(`Field 08 archive/rights receipt invalid: ${message}`)
}

function assertSortedUnique(values: readonly string[], label: string) {
  const sorted = [...new Set(values)].sort()
  if (JSON.stringify(values) !== JSON.stringify(sorted)) {
    fail(`${label} must be unique and lexicographically sorted`)
  }
}

function timestamp(value: string, label: string): number {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) fail(`${label} is not a valid date-time`)
  return parsed
}

function locationDigest(location: string): string {
  return `sha256:${location.slice(location.lastIndexOf('/') + 1)}`
}

function expectedReceiptId(receipt: Field08ArchiveRightsReceipt): string {
  const captureSlug = receipt.captureIdentity.captureId.slice('capture.field08.'.length)
  return `receipt.archive_rights.field08.${captureSlug}.r${receipt.receiptSequence}`
}

function validateArchive(receipt: Field08ArchiveRightsReceipt) {
  const { archive, captureIdentity } = receipt
  if (archive.publicAccess !== false) fail(`${receipt.receiptId} archive must not be public`)
  if (locationDigest(archive.location) !== captureIdentity.artifactSha256) {
    fail(`${receipt.receiptId} archive location is not keyed by the artifact SHA-256`)
  }
  if (archive.integritySha256 !== captureIdentity.artifactSha256) {
    fail(`${receipt.receiptId} archive integrity hash does not match capture identity`)
  }
  if (archive.sizeBytes !== captureIdentity.artifactSizeBytes) {
    fail(`${receipt.receiptId} archive size does not match capture identity`)
  }

  const storedAt = timestamp(archive.storedAt, `${receipt.receiptId} archive.storedAt`)
  const verifiedAt = timestamp(archive.verifiedAt, `${receipt.receiptId} archive.verifiedAt`)
  const issuedAt = timestamp(receipt.issuedAt, `${receipt.receiptId} issuedAt`)
  if (verifiedAt < storedAt) fail(`${receipt.receiptId} archive was verified before it was stored`)
  if (issuedAt < verifiedAt) fail(`${receipt.receiptId} was issued before archive verification`)
  if (archive.objectLock.enabled) {
    if (!archive.objectLock.mode || !archive.objectLock.retainUntil) {
      fail(`${receipt.receiptId} enabled object lock requires a mode and retention timestamp`)
    }
    if (timestamp(archive.objectLock.retainUntil, `${receipt.receiptId} objectLock.retainUntil`) <= verifiedAt) {
      fail(`${receipt.receiptId} object-lock retention must extend beyond archive verification`)
    }
  } else if (archive.objectLock.mode !== null
    || archive.objectLock.retainUntil !== null
    || archive.objectLock.legalHold) {
    fail(`${receipt.receiptId} disabled object lock cannot claim mode, retention, or legal hold`)
  }
  if (!archive.objectLock.enabled
    && archive.durabilityState !== 'archive_partial_not_durable') {
    fail(`${receipt.receiptId} archive without object lock must remain partial and not durable`)
  }
  if (archive.durabilityState === 'archive_complete_durable'
    && (!archive.objectLock.enabled || archive.replicas.length < 2)) {
    fail(`${receipt.receiptId} complete durable archive requires object lock and at least two replicas`)
  }

  assertSortedUnique(archive.replicas.map(replica => replica.replicaId), `${receipt.receiptId} replica IDs`)
  const locations = [archive.location, ...archive.replicas.map(replica => replica.location)]
  if (new Set(locations).size !== locations.length) {
    fail(`${receipt.receiptId} primary and replica archive locations must be distinct`)
  }
  for (const replica of archive.replicas) {
    if (locationDigest(replica.location) !== captureIdentity.artifactSha256) {
      fail(`${receipt.receiptId} replica ${replica.replicaId} is not keyed by the artifact SHA-256`)
    }
    if (timestamp(replica.verifiedAt, `${receipt.receiptId} replica ${replica.replicaId} verifiedAt`) < storedAt) {
      fail(`${receipt.receiptId} replica ${replica.replicaId} was verified before primary storage`)
    }
    if (timestamp(replica.verifiedAt, `${receipt.receiptId} replica ${replica.replicaId} verifiedAt`) > issuedAt) {
      fail(`${receipt.receiptId} replica ${replica.replicaId} was verified after receipt issuance`)
    }
  }
}

const licensedStatuses = new Set(['license_applies', 'permission_granted', 'public_domain'])
const excludedStatuses = new Set([
  'pending',
  'excluded_from_license',
  'rights_reserved',
  'unknown',
])
const permittedRedistribution = new Set(['permitted', 'permitted_with_conditions'])
const restrictedRedistribution = new Set(['prohibited', 'short_quotation_only'])

function expectedOverallRightsStatus(
  components: Field08ArchiveRightsReview['components'],
): Field08ArchiveRightsReview['overallRightsStatus'] {
  const active = components.filter(component => component.rightsStatus !== 'not_present')
  if (active.length === 0) return 'unknown'
  const statuses = new Set(active.map(component => component.rightsStatus))
  if ([...statuses].every(status => status === 'license_applies')) return 'licensed'
  if ([...statuses].every(status => status === 'permission_granted')) return 'permission_granted'
  if ([...statuses].every(status => status === 'public_domain')) return 'public_domain'
  if ([...statuses].every(status => excludedStatuses.has(status))) {
    return statuses.has('unknown') || statuses.has('pending') ? 'unknown' : 'restricted'
  }
  return 'mixed'
}

function validateComponentDecision(
  receiptId: string,
  component: Field08ArchiveRightsReview['components'][number],
) {
  const label = `${receiptId} component ${component.componentId}`
  assertSortedUnique(component.conditions, `${label} conditions`)
  if (component.redistribution === 'permitted_with_conditions' && component.conditions.length === 0) {
    fail(`${label} must state conditions for conditional redistribution`)
  }

  switch (component.rightsStatus) {
    case 'pending':
      if (component.licenseIdentifier !== null || component.licenseUrl !== null
        || component.permissionEvidenceSha256 !== null || component.redistribution !== 'prohibited') {
        fail(`${label} pending rights must remain unlicensed and redistribution-prohibited`)
      }
      break
    case 'license_applies':
      if (!component.licenseIdentifier || !component.licenseUrl
        || component.permissionEvidenceSha256 !== null
        || !permittedRedistribution.has(component.redistribution)) {
        fail(`${label} licensed clearance requires a license identifier, license URL, and permitted redistribution`)
      }
      break
    case 'permission_granted':
      if (component.licenseIdentifier !== null || component.licenseUrl !== null
        || !component.permissionEvidenceSha256
        || !permittedRedistribution.has(component.redistribution)) {
        fail(`${label} permission clearance requires exact permission evidence and permitted redistribution`)
      }
      break
    case 'public_domain':
      if (component.licenseIdentifier !== null || component.licenseUrl !== null
        || component.permissionEvidenceSha256 !== null
        || !permittedRedistribution.has(component.redistribution)) {
        fail(`${label} public-domain clearance cannot carry license or permission fields`)
      }
      break
    case 'excluded_from_license':
      if (!component.licenseIdentifier || !component.licenseUrl
        || component.permissionEvidenceSha256 !== null
        || !restrictedRedistribution.has(component.redistribution)) {
        fail(`${label} license exclusion requires the governing license and restricted redistribution`)
      }
      break
    case 'rights_reserved':
    case 'unknown':
      if (component.licenseIdentifier !== null || component.licenseUrl !== null
        || component.permissionEvidenceSha256 !== null
        || !restrictedRedistribution.has(component.redistribution)) {
        fail(`${label} unresolved or reserved rights cannot claim a license, permission, or broad redistribution`)
      }
      break
    case 'not_present':
      if (component.licenseIdentifier !== null || component.licenseUrl !== null
        || component.permissionEvidenceSha256 !== null
        || component.redistribution !== 'not_applicable'
        || component.conditions.length > 0) {
        fail(`${label} absent material must use not_applicable with no rights metadata`)
      }
      break
  }
}

function validateRightsReview(receipt: Field08ArchiveRightsReceipt) {
  const { rightsReview } = receipt
  assertSortedUnique(rightsReview.licensedComponents, `${receipt.receiptId} licensedComponents`)
  assertSortedUnique(rightsReview.excludedComponents, `${receipt.receiptId} excludedComponents`)
  const componentIds = rightsReview.components.map(component => component.componentId)
  if (JSON.stringify(componentIds) !== JSON.stringify(FIELD08_ARCHIVE_RIGHTS_COMPONENT_IDS)) {
    fail(`${receipt.receiptId} must review every required component exactly once in canonical order`)
  }
  for (const component of rightsReview.components) validateComponentDecision(receipt.receiptId, component)

  const expectedLicensed = rightsReview.components
    .filter(component => licensedStatuses.has(component.rightsStatus))
    .map(component => component.componentId)
  const expectedExcluded = rightsReview.components
    .filter(component => excludedStatuses.has(component.rightsStatus))
    .map(component => component.componentId)
  if (JSON.stringify(rightsReview.licensedComponents) !== JSON.stringify(expectedLicensed)) {
    fail(`${receipt.receiptId} licensedComponents do not match component decisions`)
  }
  if (JSON.stringify(rightsReview.excludedComponents) !== JSON.stringify(expectedExcluded)) {
    fail(`${receipt.receiptId} excludedComponents do not match component decisions`)
  }

  if (rightsReview.state === 'pending') {
    if (receipt.status !== 'archive_verified_rights_pending') {
      fail(`${receipt.receiptId} pending review has an incompatible receipt status`)
    }
    if (rightsReview.overallRightsStatus !== 'unknown'
      || rightsReview.redistributionStatus !== 'not_cleared'
      || rightsReview.licensedComponents.length > 0
      || rightsReview.components.some(component => component.rightsStatus !== 'pending')
      || rightsReview.reviewer !== null
      || rightsReview.rightsEvidenceAccessedAt !== null
      || rightsReview.reviewedAt !== null
      || rightsReview.reviewEvidenceSha256 !== null
      || rightsReview.attestation !== null) {
      fail(`${receipt.receiptId} pending review must be fail-closed and contain no human clearance fields`)
    }
    return
  }

  if (receipt.status !== 'archive_verified_rights_reviewed') {
    fail(`${receipt.receiptId} completed review has an incompatible receipt status`)
  }
  if (rightsReview.components.some(component => component.rightsStatus === 'pending')) {
    fail(`${receipt.receiptId} completed review contains a pending component`)
  }
  if (!rightsReview.reviewer || !rightsReview.rightsEvidenceAccessedAt
    || !rightsReview.reviewedAt || !rightsReview.reviewEvidenceSha256
    || rightsReview.attestation !== FIELD08_ARCHIVE_RIGHTS_ATTESTATION) {
    fail(`${receipt.receiptId} completed review lacks named-reviewer evidence or attestation`)
  }
  if (rightsReview.reviewer.conflictOfInterest === 'none_declared'
    && rightsReview.reviewer.conflictNote !== null) {
    fail(`${receipt.receiptId} no-conflict declaration must not include a conflict note`)
  }
  if (rightsReview.reviewer.conflictOfInterest === 'declared_managed'
    && rightsReview.reviewer.conflictNote === null) {
    fail(`${receipt.receiptId} managed conflict declaration requires a conflict note`)
  }

  const evidenceAt = timestamp(
    rightsReview.rightsEvidenceAccessedAt,
    `${receipt.receiptId} rightsEvidenceAccessedAt`,
  )
  const reviewedAt = timestamp(rightsReview.reviewedAt, `${receipt.receiptId} reviewedAt`)
  if (reviewedAt < evidenceAt) fail(`${receipt.receiptId} review predates access to its rights evidence`)
  if (timestamp(receipt.issuedAt, `${receipt.receiptId} issuedAt`) < reviewedAt) {
    fail(`${receipt.receiptId} was issued before the rights review completed`)
  }

  const activeComponents = rightsReview.components.filter(component => component.rightsStatus !== 'not_present')
  const expectedRedistribution = expectedLicensed.length === 0
    ? 'not_cleared'
    : expectedExcluded.length === 0
      ? 'cleared'
      : 'component_limited'
  if (rightsReview.redistributionStatus !== expectedRedistribution) {
    fail(`${receipt.receiptId} redistributionStatus overstates or understates component clearance`)
  }
  if (activeComponents.length === 0 && rightsReview.redistributionStatus !== 'not_cleared') {
    fail(`${receipt.receiptId} cannot clear redistribution when no material component is present`)
  }
  const expectedOverall = expectedOverallRightsStatus(rightsReview.components)
  if (rightsReview.overallRightsStatus !== expectedOverall) {
    fail(`${receipt.receiptId} overallRightsStatus does not match component decisions`)
  }

  const decisions = new Map(
    rightsReview.components.map(component => [component.componentId, component]),
  )
  const pdfBytes = decisions.get('pdf_bytes')!
  const embeddedPdfComponents = [
    'cover',
    'diagrams_infographics',
    'photographs_illustrations',
    'report_text',
    'tables',
    'third_party_material',
  ] as const
  if (licensedStatuses.has(pdfBytes.rightsStatus)
    && embeddedPdfComponents.some(componentId => {
      const decision = decisions.get(componentId)!
      return decision.rightsStatus !== 'not_present'
        && !licensedStatuses.has(decision.rightsStatus)
    })) {
    fail(`${receipt.receiptId} cannot clear whole PDF bytes while an embedded component is not cleared`)
  }
}

export function validateField08ArchiveRightsReceipt(
  value: unknown,
): Field08ArchiveRightsReceipt {
  const parsed = field08ArchiveRightsReceiptSchema.safeParse(value)
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map(issue => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ')
    fail(detail)
  }
  const receipt = parsed.data
  if (receipt.receiptId !== expectedReceiptId(receipt)) {
    fail(`${receipt.receiptId} does not encode its capture identity and sequence`)
  }
  if (receipt.receiptSequence === 1
    && (receipt.supersedesReceiptId !== null || receipt.previousReceiptHash !== null)) {
    fail(`${receipt.receiptId} sequence 1 must not bind or supersede another receipt`)
  }
  if (receipt.receiptSequence > 1
    && (receipt.supersedesReceiptId === null || receipt.previousReceiptHash === null)) {
    fail(`${receipt.receiptId} sequence ${receipt.receiptSequence} must bind the receipt it supersedes`)
  }
  validateArchive(receipt)
  validateRightsReview(receipt)
  const expectedHash = computeField08ArchiveRightsReceiptContentHash(receipt)
  if (receipt.contentHash !== expectedHash) {
    fail(`${receipt.receiptId} contentHash mismatch: expected ${expectedHash}`)
  }
  return receipt
}

function parseCaptureManifest(value: unknown): Field08ExternalCaptureManifestSnapshot {
  const parsed = externalCaptureManifestSchema.safeParse(value)
  if (!parsed.success) fail(`external-capture manifest is malformed: ${parsed.error.message}`)
  const captureIds = parsed.data.captures.map(capture => capture.captureId)
  if (new Set(captureIds).size !== captureIds.length) fail('external-capture manifest has duplicate capture IDs')
  return parsed.data
}

export function createField08ArchiveRightsValidationContext(input: {
  captureManifest: unknown
  captureManifestBytes: string | Buffer
  expectedSourceCommit: string
}): Field08ArchiveRightsValidationContext {
  const captureManifest = parseCaptureManifest(input.captureManifest)
  const captureManifestSha256 = `sha256:${createHash('sha256')
    .update(input.captureManifestBytes)
    .digest('hex')}`
  const expectedSourceCommit = gitCommitSchema.parse(input.expectedSourceCommit)
  return { captureManifest, captureManifestSha256, expectedSourceCommit }
}

function identityContract(receipt: Field08ArchiveRightsReceipt): string {
  return canonicalJson(receipt.captureIdentity)
}

function assertReceiptMatchesCapture(
  receipt: Field08ArchiveRightsReceipt,
  context: Field08ArchiveRightsValidationContext,
) {
  const capture = context.captureManifest.captures.find(
    candidate => candidate.captureId === receipt.captureIdentity.captureId,
  )
  if (!capture) fail(`${receipt.receiptId} references an unknown captureId`)
  const expected = {
    captureManifestId: context.captureManifest.manifestId,
    captureManifestSha256: context.captureManifestSha256,
    captureId: capture.captureId,
    sourceCandidateId: capture.sourceCandidateId,
    artifactSha256: capture.sha256,
    artifactSizeBytes: capture.sizeBytes,
    mediaType: capture.mediaType,
    sourceUrl: capture.sourceUrl,
    accessedAt: capture.accessedAt,
    sourceCommit: context.expectedSourceCommit,
  }
  if (canonicalJson(receipt.captureIdentity) !== canonicalJson(expected)) {
    fail(`${receipt.receiptId} immutable capture identity does not match the historical manifest and source commit`)
  }
}

function validateLogWithoutPrior(
  values: readonly unknown[],
  context: Field08ArchiveRightsValidationContext,
): Field08ArchiveRightsReceipt[] {
  const receipts = values.map(validateField08ArchiveRightsReceipt)
  const receiptIds = receipts.map(receipt => receipt.receiptId)
  const contentHashes = receipts.map(receipt => receipt.contentHash)
  if (new Set(receiptIds).size !== receiptIds.length) fail('receipt log contains duplicate receipt IDs')
  if (new Set(contentHashes).size !== contentHashes.length) fail('receipt log contains duplicate content hashes')

  const previousByCapture = new Map<string, Field08ArchiveRightsReceipt>()
  for (const receipt of receipts) {
    assertReceiptMatchesCapture(receipt, context)
    const captureId = receipt.captureIdentity.captureId
    const previous = previousByCapture.get(captureId)
    if (!previous) {
      if (receipt.receiptSequence !== 1
        || receipt.supersedesReceiptId !== null
        || receipt.previousReceiptHash !== null) {
        fail(`${receipt.receiptId} is the first log entry for ${captureId} but is not sequence 1`)
      }
    } else {
      if (receipt.receiptSequence !== previous.receiptSequence + 1) {
        fail(`${receipt.receiptId} does not immediately follow ${previous.receiptId}`)
      }
      if (receipt.supersedesReceiptId !== previous.receiptId) {
        fail(`${receipt.receiptId} must supersede ${previous.receiptId}`)
      }
      if (receipt.previousReceiptHash !== previous.contentHash) {
        fail(`${receipt.receiptId} previousReceiptHash does not bind ${previous.receiptId}`)
      }
      if (identityContract(receipt) !== identityContract(previous)) {
        fail(`${receipt.receiptId} mutates immutable capture identity from ${previous.receiptId}`)
      }
      if (timestamp(receipt.issuedAt, `${receipt.receiptId} issuedAt`)
        <= timestamp(previous.issuedAt, `${previous.receiptId} issuedAt`)) {
        fail(`${receipt.receiptId} must be issued after ${previous.receiptId}`)
      }
      if (previous.rightsReview.state === 'reviewed' && receipt.rightsReview.state === 'pending') {
        fail(`${receipt.receiptId} cannot revert a completed rights review to pending`)
      }
    }
    previousByCapture.set(captureId, receipt)
  }
  return receipts
}

export function validateField08ArchiveRightsReceiptLog(
  values: readonly unknown[],
  context: Field08ArchiveRightsValidationContext,
  options: { previousValues?: readonly unknown[] } = {},
): Field08ArchiveRightsReceipt[] {
  const receipts = validateLogWithoutPrior(values, context)
  if (!options.previousValues) return receipts

  const previous = validateLogWithoutPrior(options.previousValues, context)
  if (receipts.length < previous.length) fail('append-only log removed one or more prior receipts')
  for (const [index, priorReceipt] of previous.entries()) {
    if (canonicalJson(receipts[index]) !== canonicalJson(priorReceipt)) {
      fail(`append-only log mutated prior entry ${index + 1} (${priorReceipt.receiptId})`)
    }
  }
  return receipts
}
