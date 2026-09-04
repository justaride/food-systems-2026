export interface EstateBackupReceiptVerificationOptions {
  expectedAssetKey: string
  expectedDatabaseUuid: string
  maxAgeHours: number
  now: Date
}

export interface VerifiedEstateBackupReceipt {
  artifactRef: string
  artifactSha256: string
  sourceCommit: string
  oldestProofAgeHours: number
}

type JsonRecord = Record<string, unknown>
type ProofKind = 'backup' | 'offsite' | 'restore'

const TOP_LEVEL_FIELDS = [
  'schemaVersion',
  'authority',
  'assetKey',
  'databaseUuid',
  'source',
  'artifact',
  'proofs',
  'capturedAt',
] as const
const SOURCE_FIELDS = ['repository', 'commit', 'manifest', 'manifestLine'] as const
const ARTIFACT_FIELDS = ['ref', 'sha256', 'bytes', 'icloudStatus', 's3Status'] as const
const PROOF_FIELDS = ['kind', 'artifactRef', 'artifactSha256', 'provenAt'] as const
const REQUIRED_PROOF_KINDS: ProofKind[] = ['backup', 'offsite', 'restore']
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u
const SHA256 = /^[a-f0-9]{64}$/u
const SOURCE_COMMIT = /^[a-f0-9]{40}$/u
const ARTIFACT_REF = /^coolify-food-systems-pgvector-db-\d{8}-\d{6}-[a-f0-9]+\.dump\.age$/u

function requireRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as JsonRecord
}

function requireExactFields(
  record: JsonRecord,
  expectedFields: readonly string[],
  label: string,
): void {
  const expected = new Set(expectedFields)
  const unknown = Object.keys(record).filter(field => !expected.has(field))
  if (unknown.length > 0) {
    throw new Error(`${label} has unknown field: ${unknown.join(', ')}`)
  }
  const missing = expectedFields.filter(field => !(field in record))
  if (missing.length > 0) {
    throw new Error(`${label} is missing field: ${missing.join(', ')}`)
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}

function parseUtcTimestamp(value: unknown, label: string): number {
  const timestamp = requireString(value, label)
  if (!UTC_TIMESTAMP.test(timestamp)) {
    throw new Error(`${label} must be a canonical UTC timestamp`)
  }
  const milliseconds = Date.parse(timestamp)
  if (!Number.isFinite(milliseconds)) {
    throw new Error(`${label} must be a valid UTC timestamp`)
  }
  return milliseconds
}

export function verifyEstateBackupReceipt(
  input: unknown,
  options: EstateBackupReceiptVerificationOptions,
): VerifiedEstateBackupReceipt {
  if (!Number.isFinite(options.maxAgeHours) || options.maxAgeHours <= 0) {
    throw new Error('maxAgeHours must be a positive finite number')
  }
  const nowMilliseconds = options.now.getTime()
  if (!Number.isFinite(nowMilliseconds)) {
    throw new Error('now must be a valid Date')
  }

  const receipt = requireRecord(input, 'receipt')
  requireExactFields(receipt, TOP_LEVEL_FIELDS, 'receipt')
  if (receipt.schemaVersion !== 1) {
    throw new Error('receipt.schemaVersion must equal 1')
  }
  if (receipt.authority !== 'gabibfree-estate-data-asset-proofs') {
    throw new Error('receipt.authority is not the approved Estate authority')
  }
  if (receipt.assetKey !== options.expectedAssetKey) {
    throw new Error('receipt.assetKey does not match the expected production asset')
  }
  if (receipt.databaseUuid !== options.expectedDatabaseUuid) {
    throw new Error('receipt.databaseUuid does not match the expected production database')
  }

  const source = requireRecord(receipt.source, 'receipt.source')
  requireExactFields(source, SOURCE_FIELDS, 'receipt.source')
  if (source.repository !== 'justaride/gabibfree-dashboard') {
    throw new Error('receipt.source.repository is not the approved Estate repository')
  }
  const sourceCommit = requireString(source.commit, 'receipt.source.commit')
  if (!SOURCE_COMMIT.test(sourceCommit)) {
    throw new Error('receipt.source.commit must be a full lowercase Git SHA')
  }
  if (source.manifest !== 'MANIFEST-COOLIFY-v1.tsv') {
    throw new Error('receipt.source.manifest is not the approved Estate manifest')
  }
  if (!Number.isSafeInteger(source.manifestLine) || Number(source.manifestLine) <= 0) {
    throw new Error('receipt.source.manifestLine must be a positive integer')
  }

  const artifact = requireRecord(receipt.artifact, 'receipt.artifact')
  requireExactFields(artifact, ARTIFACT_FIELDS, 'receipt.artifact')
  const artifactRef = requireString(artifact.ref, 'receipt.artifact.ref')
  if (!ARTIFACT_REF.test(artifactRef)) {
    throw new Error('receipt.artifact.ref is not a Food Systems encrypted database dump')
  }
  const artifactSha256 = requireString(artifact.sha256, 'receipt.artifact.sha256')
  if (!SHA256.test(artifactSha256)) {
    throw new Error('receipt.artifact.sha256 must be a lowercase SHA-256 digest')
  }
  if (!Number.isSafeInteger(artifact.bytes) || Number(artifact.bytes) <= 0) {
    throw new Error('receipt.artifact.bytes must be a positive integer')
  }
  if (artifact.icloudStatus !== 'verified') {
    throw new Error('receipt.artifact.icloudStatus must equal verified')
  }
  if (artifact.s3Status !== 'verified') {
    throw new Error('receipt.artifact.s3Status must equal verified')
  }

  if (!Array.isArray(receipt.proofs)) {
    throw new Error('receipt.proofs must be an array')
  }
  const proofTimes = new Map<ProofKind, number>()
  for (const [index, rawProof] of receipt.proofs.entries()) {
    const proof = requireRecord(rawProof, `receipt.proofs[${index}]`)
    requireExactFields(proof, PROOF_FIELDS, `receipt.proofs[${index}]`)
    if (!REQUIRED_PROOF_KINDS.includes(proof.kind as ProofKind)) {
      throw new Error(`receipt.proofs[${index}].kind is not supported`)
    }
    const kind = proof.kind as ProofKind
    if (proofTimes.has(kind)) {
      throw new Error(`receipt must contain exactly one ${kind} proof`)
    }
    if (proof.artifactRef !== artifactRef || proof.artifactSha256 !== artifactSha256) {
      throw new Error(`receipt ${kind} proof artifact binding does not match the receipt artifact`)
    }
    proofTimes.set(kind, parseUtcTimestamp(proof.provenAt, `receipt ${kind} proof provenAt`))
  }

  for (const kind of REQUIRED_PROOF_KINDS) {
    if (!proofTimes.has(kind)) {
      throw new Error(`receipt must contain exactly one ${kind} proof`)
    }
  }

  const capturedAt = parseUtcTimestamp(receipt.capturedAt, 'receipt.capturedAt')
  if (capturedAt > nowMilliseconds) {
    throw new Error('receipt.capturedAt cannot be in the future')
  }

  let oldestProofAgeHours = 0
  for (const [kind, provenAt] of proofTimes) {
    if (provenAt > nowMilliseconds) {
      throw new Error(`receipt ${kind} proof cannot be in the future`)
    }
    if (provenAt > capturedAt) {
      throw new Error(`receipt ${kind} proof cannot postdate receipt.capturedAt`)
    }
    const ageHours = (nowMilliseconds - provenAt) / 3_600_000
    if (ageHours > options.maxAgeHours) {
      throw new Error(`receipt ${kind} proof is older than ${options.maxAgeHours} hours`)
    }
    oldestProofAgeHours = Math.max(oldestProofAgeHours, ageHours)
  }

  return {
    artifactRef,
    artifactSha256,
    sourceCommit,
    oldestProofAgeHours,
  }
}
