import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const HUMAN_REVIEW_RECEIPT_SCHEMA_PATH =
  'knowledge/schema/field08-human-review-receipt.schema.v1.json'
export const HUMAN_REVIEW_TEMPLATE_SCHEMA_PATH =
  'knowledge/schema/field08-human-review-pending-template.schema.v1.json'
export const HUMAN_REVIEW_STATUS_SCHEMA_PATH =
  'knowledge/schema/field08-human-review-status.schema.v1.json'
export const FIELD08_INTAKE_PATH =
  'knowledge/pilots/field08/gate2c/field08-evidence-intake.v1.json'
export const FIELD08_GENERATION_MANIFEST_PATH =
  'knowledge/pilots/field08/gate2c/field08-evidence-generation-manifest.v1.json'
export const FIELD08_REVIEW_MANIFEST_PATH =
  'knowledge/pilots/field08/gate2c/field08-appraisal-review-manifest.v1.json'
export const FIELD08_HUMAN_REVIEW_RECEIPTS_PATH =
  'knowledge/pilots/field08/gate2c/review/field08-human-review-receipts.v1.jsonl'
export const FIELD08_HUMAN_REVIEW_PACKET_PATH =
  'knowledge/pilots/field08/gate2c/review/field08-human-review-packet.v1.md'
export const FIELD08_HUMAN_REVIEW_STATUS_PATH =
  'knowledge/pilots/field08/gate2c/review/field08-human-review-status.v1.json'

export const FIELD08_HUMAN_REVIEW_TEMPLATE_PATHS = {
  boundary_reconciliation:
    'knowledge/pilots/field08/gate2c/review/field08-boundary-reconciliation.pending.v1.json',
  contradiction_resolution:
    'knowledge/pilots/field08/gate2c/review/field08-contradiction-resolution.pending.v1.json',
  method_appraisal:
    'knowledge/pilots/field08/gate2c/review/field08-method-appraisal.pending.v1.json',
  ordinary_human_review:
    'knowledge/pilots/field08/gate2c/review/field08-ordinary-human-review.pending.v1.json',
} as const

export const HUMAN_REVIEW_ATTESTATION =
  'I_AM_A_NAMED_HUMAN_REVIEWER_AND_ATTEST_THAT_THE_DECISIONS_IN_THIS_RECEIPT_FAITHFULLY_RECORD_MY_REVIEW'

export const GATE_TYPES = [
  'boundary_reconciliation',
  'contradiction_resolution',
  'method_appraisal',
  'ordinary_human_review',
] as const

export type GateType = (typeof GATE_TYPES)[number]
export type TargetKind =
  | 'source'
  | 'acquisition'
  | 'claim'
  | 'observation'
  | 'contradiction_set'
  | 'appraisal_draft'

type JsonScalar = string | number | boolean | null
type JsonValue = JsonScalar | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

type SourceAcquisition = JsonObject & {
  acquisitionId: string
  sourceId: string
  citationId: string
  citationText: string
  sourceUrl: string
  locator: string
  evidenceRole: string
  accessedAt: string
  captureSha256: string
}

type AppraisalDraft = JsonObject & {
  appraisalDraftId: string
  targetSourceId: string
}

type ReviewGate = {
  reviewGateId: string
  gateType: GateType
  targetIds: string[]
  status: string
  requiredReviewerRole: string
  instructions: string
  externalGatePassed: false
  coveragePromotionAllowed: false
}

type EvidencePackage = {
  hashSemantics: 'canonical_json_sorted_keys_v1'
  bindingContract: 'field08_gate2c_source_acquisition_citation_v1'
  sourceCommit: string
  generationManifest: ArtifactBinding
  reviewManifest: ArtifactBinding
  intake: {
    path: typeof FIELD08_INTAKE_PATH
    fileSha256: string
  }
  sourceBindings: Array<{
    sourceId: string
    sourceSha256: string
  }>
  locatorBindings: Array<Omit<LocatorBinding, 'locator'>>
}

type ArtifactBinding = {
  path: string
  fileSha256: string
  contentHash: string
}

export type TargetBinding = {
  targetId: string
  targetKind: TargetKind
  targetSha256: string
}

export type LocatorBinding = {
  sourceId: string
  sourceSha256: string
  acquisitionId: string
  acquisitionSha256: string
  citationId: string
  citationSha256: string
  captureSha256: string
  locator: string
}

export type SourceAppraisalBinding = {
  sourceId: string
  sourceSha256: string
  appraisalDraftId: string
  appraisalDraftSha256: string
}

export type PendingReviewTemplate = {
  documentType: 'field08_human_review_pending_template'
  schemaVersion: '1.0.0'
  templateId: string
  status: 'pending_human_review'
  sourceCommit: string
  evidencePackage: EvidencePackage
  evidencePackageHash: string
  reviewGateId: string
  gateType: GateType
  requiredReviewerRole: string
  instructions: string
  allowedDispositions: string[]
  targetBindings: TargetBinding[]
  locatorBindings: LocatorBinding[]
  sourceAppraisalBindings: SourceAppraisalBinding[]
  receiptRequirements: {
    appendOnlyJsonl: true
    fullSnapshotPerReceipt: true
    namedHumanRequired: true
    utcTimestampRequired: true
    attestationRequired: true
    supersessionChainRequired: true
    exactBindingsRequired: true
  }
  externalGatePassed: false
  coveragePromotionAllowed: false
  contentHash: string
}

type Reviewer = {
  name: string
  role: string
  qualifications: string[]
  affiliation: string
  conflictOfInterest: {
    status: 'none_declared' | 'declared_managed' | 'declared_unmanaged'
    details: string | null
  }
  reviewedAt: string
  attestation: typeof HUMAN_REVIEW_ATTESTATION
}

type TargetDecision = TargetBinding & {
  disposition: string
  rationale: string
  resolution: string | null
  amendments: string[]
  newSourceRequirements: string[]
}

type LocatorDecision = Omit<LocatorBinding, 'locator'> & {
  disposition: string
  exactLocatorInspected: boolean
  definitionPeriodUnitChecked: boolean
  methodUniverseBoundaryChecked: boolean
  uncertaintyLimitationsChecked: boolean
  rationale: string
  amendments: string[]
  newSourceRequirements: string[]
}

type MethodDecision = SourceAppraisalBinding & {
  disposition: string
  rationale: string
  amendments: string[]
  newSourceRequirements: string[]
  appraisal: {
    basis: string
    studyDesign: string
    methodologySummary: string
    sampleOrCoverage: string
    applicability: string
    applicabilityNotes: string
    limitations: string[]
    riskOfBias: string
    riskOfBiasNotes: string
    reviewMethod: string
  }
}

type ReceiptReview =
  | { gateType: 'boundary_reconciliation'; targetDecisions: TargetDecision[] }
  | { gateType: 'contradiction_resolution'; targetDecisions: TargetDecision[] }
  | { gateType: 'method_appraisal'; sourceAppraisalDecisions: MethodDecision[] }
  | {
    gateType: 'ordinary_human_review'
    targetDecisions: TargetDecision[]
    locatorDecisions: LocatorDecision[]
  }

export type HumanReviewReceipt = {
  documentType: 'field08_human_review_receipt'
  schemaVersion: '1.0.0'
  receiptId: string
  sequence: number
  supersedesReceiptId: string | null
  previousReceiptHash: string | null
  status: 'human_review_recorded'
  sourceCommit: string
  evidencePackage: EvidencePackage
  evidencePackageHash: string
  reviewGateId: string
  gateType: GateType
  reviewer: Reviewer
  review: ReceiptReview
  externalGatePassed: false
  coveragePromotionAllowed: false
  contentHash: string
}

export type GateStatus = {
  reviewGateId: string
  gateType: GateType
  status: 'pending' | 'reviewed_resolved' | 'reviewed_open' | 'reviewed_action_required'
  latestReceiptId: string | null
  latestReceiptHash: string | null
  receiptSequence: number
  decisionCounts: Record<string, number>
  openTargetIds: string[]
  actionRequiredTargetIds: string[]
}

export type HumanReviewStatusProjection = {
  documentType: 'field08_human_review_status_projection'
  schemaVersion: '1.0.0'
  generatedAt: string
  sourceCommit: string
  evidencePackageHash: string
  receiptCount: number
  packageStatus:
    | 'human_review_pending'
    | 'human_review_recorded_open'
    | 'human_review_recorded_action_required'
    | 'human_review_complete_internal_only'
  gateStatuses: GateStatus[]
  outstandingReviewGateIds: string[]
  externalGatePassed: false
  coveragePromotionAllowed: false
  contentHash: string
}

type IntakeDocument = {
  sourceAcquisitions: SourceAcquisition[]
  claimCandidates: JsonObject[]
  measurementCandidates: JsonObject[]
  contradictionSets: JsonObject[]
  appraisalDrafts: AppraisalDraft[]
  reviewGates: ReviewGate[]
}

type ReviewManifest = JsonObject & {
  sourceCommit: string
  appraisalDrafts: AppraisalDraft[]
  reviewGates: ReviewGate[]
  contentHash: string
}

type GenerationManifest = JsonObject & {
  generatedAt: string
  sourceCommit: string
  inputSnapshots: Array<{
    path: string
    entries: Array<{ path: string; sha256: string }>
  }>
  outputs: Array<{ path: string; sha256: string }>
  contentHash: string
}

type ReviewContext = {
  generatedAt: string
  evidencePackage: EvidencePackage
  evidencePackageHash: string
  intake: IntakeDocument
  reviewGates: ReviewGate[]
  targetBindings: Map<string, TargetBinding>
  locatorBindings: LocatorBinding[]
  sourceAppraisalBindings: SourceAppraisalBinding[]
}

const GATE_SLUGS: Record<GateType, string> = {
  boundary_reconciliation: 'boundary-reconciliation',
  contradiction_resolution: 'contradiction-resolution',
  method_appraisal: 'method-appraisal',
  ordinary_human_review: 'ordinary-human-review',
}

const ALLOWED_DISPOSITIONS: Record<GateType, string[]> = {
  boundary_reconciliation: [
    'verified_as_scoped',
    'resolved',
    'amendments_required',
    'rejected',
    'retain_open',
    'needs_new_source',
    'deferred_insufficient_evidence',
  ],
  contradiction_resolution: [
    'resolved',
    'amendments_required',
    'rejected',
    'retain_open',
    'needs_new_source',
    'deferred_insufficient_evidence',
  ],
  method_appraisal: [
    'verified_as_scoped',
    'amendments_required',
    'rejected',
    'deferred_insufficient_evidence',
  ],
  ordinary_human_review: [
    'verified_as_scoped',
    'amendments_required',
    'rejected',
    'needs_new_source',
    'deferred_insufficient_evidence',
  ],
}

const OPEN_DISPOSITIONS = new Set([
  'retain_open',
  'needs_new_source',
  'deferred_insufficient_evidence',
])
const ACTION_DISPOSITIONS = new Set(['amendments_required', 'rejected'])
const AUTOMATION_NAME_PATTERN = /\b(codex|chatgpt|openai|automation|automated|bot|agent|machine|model|ai)\b/i
const SUBSTANTIVE_PLACEHOLDER_PATTERN = /^(?:tbd|todo|n\/a|none|unknown|placeholder|pending)[.!]?$/i

function fail(message: string): never {
  throw new Error(message)
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`)
  return value as Record<string, unknown>
}

function asString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`)
  return value
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) fail(`${label} must be an array`)
  return value
}

function readJson<T>(root: string, path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
}

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('Cannot hash a non-finite number')
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalize)
  const object = asObject(value, 'canonical JSON value')
  const result: { [key: string]: JsonValue } = {}
  for (const key of Object.keys(object).sort()) {
    const item = object[key]
    if (item !== undefined) result[key] = canonicalize(item)
  }
  return result
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalSha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

export function fileSha256(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

export function withoutContentHash<T extends Record<string, unknown>>(value: T): Omit<T, 'contentHash'> {
  const { contentHash: _contentHash, ...payload } = value
  return payload
}

function withContentHash<T extends Record<string, unknown>>(value: T): T & { contentHash: string } {
  return { ...value, contentHash: canonicalSha256(value) }
}

function assertCanonicalContentHash(value: unknown, label: string) {
  const object = asObject(value, label)
  const contentHash = asString(object.contentHash, `${label}.contentHash`)
  const expected = canonicalSha256(withoutContentHash(object))
  if (contentHash !== expected) fail(`${label} contentHash mismatch: expected ${expected}, received ${contentHash}`)
}

function validateSchema(root: string, schemaPath: string, value: unknown, label: string) {
  const schema = readJson<object>(root, schemaPath)
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  if (!validate(value)) fail(`${label} schema validation failed: ${JSON.stringify(validate.errors)}`)
}

function sameJson(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right)
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function assertExactIds(actual: string[], expected: string[], label: string) {
  if (actual.length !== new Set(actual).size) fail(`${label} contains duplicate IDs`)
  if (!sameJson(sortedUnique(actual), sortedUnique(expected))) {
    const missing = expected.filter((id) => !actual.includes(id))
    const extra = actual.filter((id) => !expected.includes(id))
    fail(`${label} does not exactly cover its template; missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)}`)
  }
}

function targetId(record: JsonObject, key: string, label: string): string {
  return asString(record[key], `${label}.${key}`)
}

function targetBinding(record: JsonObject, idKey: string, kind: TargetKind, label: string): TargetBinding {
  return {
    targetId: targetId(record, idKey, label),
    targetKind: kind,
    targetSha256: canonicalSha256(record),
  }
}

function citationHash(acquisition: SourceAcquisition): string {
  return canonicalSha256({
    citationId: acquisition.citationId,
    sourceId: acquisition.sourceId,
    citationText: acquisition.citationText,
    sourceUrl: acquisition.sourceUrl,
    locator: acquisition.locator,
    evidenceRole: acquisition.evidenceRole,
    accessedAt: acquisition.accessedAt,
    captureSha256: acquisition.captureSha256,
  })
}

function sourceHash(sourceId: string, acquisitions: SourceAcquisition[]): string {
  const sourceAcquisitions = acquisitions
    .filter((item) => item.sourceId === sourceId)
    .sort((left, right) => left.acquisitionId.localeCompare(right.acquisitionId))
  if (sourceAcquisitions.length === 0) fail(`Source ${sourceId} has no acquisitions`)
  return canonicalSha256({ sourceId, sourceAcquisitions })
}

function readFileBinding(root: string, path: string, contentHash: string): ArtifactBinding {
  return {
    path,
    fileSha256: fileSha256(readFileSync(resolve(root, path))),
    contentHash,
  }
}

function findPinnedInputHash(manifest: GenerationManifest, path: string): string {
  const snapshot = manifest.inputSnapshots.find((item) => item.path === path)
  const entry = snapshot?.entries.find((item) => item.path === path)
  if (!entry) fail(`Generation manifest does not pin input ${path}`)
  return entry.sha256
}

function findPinnedOutputHash(manifest: GenerationManifest, path: string): string {
  const output = manifest.outputs.find((item) => item.path === path)
  if (!output) fail(`Generation manifest does not pin output ${path}`)
  return output.sha256
}

function putTarget(index: Map<string, TargetBinding>, binding: TargetBinding) {
  if (index.has(binding.targetId)) fail(`Duplicate review target ID ${binding.targetId}`)
  index.set(binding.targetId, binding)
}

function buildReviewContext(root: string): ReviewContext {
  const generationManifest = readJson<GenerationManifest>(root, FIELD08_GENERATION_MANIFEST_PATH)
  const reviewManifest = readJson<ReviewManifest>(root, FIELD08_REVIEW_MANIFEST_PATH)
  const intake = readJson<IntakeDocument>(root, FIELD08_INTAKE_PATH)

  assertCanonicalContentHash(generationManifest, FIELD08_GENERATION_MANIFEST_PATH)
  assertCanonicalContentHash(reviewManifest, FIELD08_REVIEW_MANIFEST_PATH)
  if (!Number.isFinite(Date.parse(generationManifest.generatedAt))) {
    fail('Generation manifest generatedAt is not a valid date-time')
  }
  if (generationManifest.sourceCommit !== reviewManifest.sourceCommit) {
    fail('Generation and review manifests have different sourceCommit values')
  }
  if (!/^[a-f0-9]{40}$/.test(generationManifest.sourceCommit)) fail('sourceCommit is not a full Git SHA')

  const intakeBytesHash = fileSha256(readFileSync(resolve(root, FIELD08_INTAKE_PATH)))
  if (findPinnedInputHash(generationManifest, FIELD08_INTAKE_PATH) !== intakeBytesHash) {
    fail('Current evidence intake bytes do not match the generation-manifest input snapshot')
  }
  const reviewBytesHash = fileSha256(readFileSync(resolve(root, FIELD08_REVIEW_MANIFEST_PATH)))
  if (findPinnedOutputHash(generationManifest, FIELD08_REVIEW_MANIFEST_PATH) !== reviewBytesHash) {
    fail('Current review-manifest bytes do not match the generation-manifest output snapshot')
  }

  const targetBindings = new Map<string, TargetBinding>()
  const sourceIds = sortedUnique(intake.sourceAcquisitions.map((item) => item.sourceId))
  const sourceHashes = new Map(sourceIds.map((id) => [id, sourceHash(id, intake.sourceAcquisitions)]))
  for (const sourceIdValue of sourceIds) {
    putTarget(targetBindings, {
      targetId: sourceIdValue,
      targetKind: 'source',
      targetSha256: sourceHashes.get(sourceIdValue)!,
    })
  }
  for (const acquisition of intake.sourceAcquisitions) {
    putTarget(targetBindings, targetBinding(acquisition, 'acquisitionId', 'acquisition', 'sourceAcquisition'))
  }
  for (const claim of intake.claimCandidates) {
    putTarget(targetBindings, targetBinding(claim, 'claimId', 'claim', 'claimCandidate'))
  }
  for (const observation of intake.measurementCandidates) {
    putTarget(targetBindings, targetBinding(observation, 'observationId', 'observation', 'measurementCandidate'))
  }
  for (const contradictionSet of intake.contradictionSets) {
    putTarget(
      targetBindings,
      targetBinding(contradictionSet, 'contradictionSetId', 'contradiction_set', 'contradictionSet'),
    )
  }

  const appraisalDrafts = [...reviewManifest.appraisalDrafts]
    .sort((left, right) => left.appraisalDraftId.localeCompare(right.appraisalDraftId))
  const intakeAppraisalDrafts = [...intake.appraisalDrafts]
    .sort((left, right) => left.appraisalDraftId.localeCompare(right.appraisalDraftId))
  if (!sameJson(appraisalDrafts, intakeAppraisalDrafts)) {
    fail('Review-manifest appraisal drafts do not exactly match the evidence intake')
  }
  const reviewManifestGates = [...reviewManifest.reviewGates]
    .sort((left, right) => left.gateType.localeCompare(right.gateType))
  const intakeReviewGates = [...intake.reviewGates]
    .sort((left, right) => left.gateType.localeCompare(right.gateType))
  if (!sameJson(reviewManifestGates, intakeReviewGates)) {
    fail('Review-manifest review gates do not exactly match the evidence intake')
  }
  for (const appraisal of appraisalDrafts) {
    putTarget(targetBindings, targetBinding(appraisal, 'appraisalDraftId', 'appraisal_draft', 'appraisalDraft'))
  }

  const locatorBindings = intake.sourceAcquisitions
    .map((acquisition) => ({
      sourceId: acquisition.sourceId,
      sourceSha256: sourceHashes.get(acquisition.sourceId)!,
      acquisitionId: acquisition.acquisitionId,
      acquisitionSha256: canonicalSha256(acquisition),
      citationId: acquisition.citationId,
      citationSha256: citationHash(acquisition),
      captureSha256: acquisition.captureSha256,
      locator: acquisition.locator,
    }))
    .sort((left, right) => left.acquisitionId.localeCompare(right.acquisitionId))
  if (locatorBindings.length !== 17) fail(`Expected 17 Gate 2C locators, found ${locatorBindings.length}`)
  assertExactIds(
    locatorBindings.map((item) => item.citationId),
    sortedUnique(locatorBindings.map((item) => item.citationId)),
    'Gate 2C citation bindings',
  )

  const evidencePackage: EvidencePackage = {
    hashSemantics: 'canonical_json_sorted_keys_v1',
    bindingContract: 'field08_gate2c_source_acquisition_citation_v1',
    sourceCommit: generationManifest.sourceCommit,
    generationManifest: readFileBinding(
      root,
      FIELD08_GENERATION_MANIFEST_PATH,
      generationManifest.contentHash,
    ),
    reviewManifest: readFileBinding(root, FIELD08_REVIEW_MANIFEST_PATH, reviewManifest.contentHash),
    intake: {
      path: FIELD08_INTAKE_PATH,
      fileSha256: intakeBytesHash,
    },
    sourceBindings: sourceIds.map((sourceIdValue) => ({
      sourceId: sourceIdValue,
      sourceSha256: sourceHashes.get(sourceIdValue)!,
    })),
    locatorBindings: locatorBindings.map(({ locator: _locator, ...binding }) => binding),
  }
  const evidencePackageHash = canonicalSha256(evidencePackage)

  const sourceAppraisalBindings = appraisalDrafts
    .map((appraisal) => ({
      sourceId: appraisal.targetSourceId,
      sourceSha256: sourceHashes.get(appraisal.targetSourceId) ?? fail(`Unknown source ${appraisal.targetSourceId}`),
      appraisalDraftId: appraisal.appraisalDraftId,
      appraisalDraftSha256: canonicalSha256(appraisal),
    }))
    .sort((left, right) => left.sourceId.localeCompare(right.sourceId))
  if (sourceAppraisalBindings.length !== 5) {
    fail(`Expected five source/appraisal pairs, found ${sourceAppraisalBindings.length}`)
  }

  const reviewGates = reviewManifestGates
  assertExactIds(reviewGates.map((gate) => gate.gateType), [...GATE_TYPES], 'Gate 2C review gate types')
  for (const gate of reviewGates) {
    if (gate.status !== 'pending') fail(`${gate.reviewGateId} is not pending`)
    if (gate.externalGatePassed !== false || gate.coveragePromotionAllowed !== false) {
      fail(`${gate.reviewGateId} violates the fail-closed acceptance boundary`)
    }
    for (const id of gate.targetIds) {
      if (!targetBindings.has(id)) fail(`${gate.reviewGateId} contains unknown target ${id}`)
    }
  }

  const methodGate = reviewGates.find((gate) => gate.gateType === 'method_appraisal')!
  const pairedMethodIds = sourceAppraisalBindings.flatMap((item) => [item.sourceId, item.appraisalDraftId])
  assertExactIds(methodGate.targetIds, pairedMethodIds, 'Method-appraisal source/draft pairs')

  return {
    generatedAt: generationManifest.generatedAt,
    evidencePackage,
    evidencePackageHash,
    intake,
    reviewGates,
    targetBindings,
    locatorBindings,
    sourceAppraisalBindings,
  }
}

export function buildPendingReviewTemplates(root: string): PendingReviewTemplate[] {
  const context = buildReviewContext(root)
  return context.reviewGates
    .map((gate) => {
      const slug = GATE_SLUGS[gate.gateType]
      const payload = {
        documentType: 'field08_human_review_pending_template' as const,
        schemaVersion: '1.0.0' as const,
        templateId: `review_template.field08.${slug}.v1`,
        status: 'pending_human_review' as const,
        sourceCommit: context.evidencePackage.sourceCommit,
        evidencePackage: context.evidencePackage,
        evidencePackageHash: context.evidencePackageHash,
        reviewGateId: gate.reviewGateId,
        gateType: gate.gateType,
        requiredReviewerRole: gate.requiredReviewerRole,
        instructions: gate.instructions,
        allowedDispositions: ALLOWED_DISPOSITIONS[gate.gateType],
        targetBindings: gate.targetIds.map((id) => context.targetBindings.get(id)!),
        locatorBindings: gate.gateType === 'ordinary_human_review' ? context.locatorBindings : [],
        sourceAppraisalBindings:
          gate.gateType === 'method_appraisal' ? context.sourceAppraisalBindings : [],
        receiptRequirements: {
          appendOnlyJsonl: true as const,
          fullSnapshotPerReceipt: true as const,
          namedHumanRequired: true as const,
          utcTimestampRequired: true as const,
          attestationRequired: true as const,
          supersessionChainRequired: true as const,
          exactBindingsRequired: true as const,
        },
        externalGatePassed: false as const,
        coveragePromotionAllowed: false as const,
      }
      const template = withContentHash(payload) as PendingReviewTemplate
      validateSchema(root, HUMAN_REVIEW_TEMPLATE_SCHEMA_PATH, template, template.templateId)
      return template
    })
    .sort((left, right) => GATE_TYPES.indexOf(left.gateType) - GATE_TYPES.indexOf(right.gateType))
}

function templateJson(template: PendingReviewTemplate): string {
  return `${JSON.stringify(template, null, 2)}\n`
}

export function writePendingReviewTemplates(root: string): string[] {
  const templates = buildPendingReviewTemplates(root)
  const written: string[] = []
  for (const template of templates) {
    const path = FIELD08_HUMAN_REVIEW_TEMPLATE_PATHS[template.gateType]
    mkdirSync(resolve(root, dirname(path)), { recursive: true })
    writeFileSync(resolve(root, path), templateJson(template))
    written.push(path)
  }
  return written
}

export function checkPendingReviewTemplates(root: string): string[] {
  const templates = buildPendingReviewTemplates(root)
  const checked: string[] = []
  for (const template of templates) {
    const path = FIELD08_HUMAN_REVIEW_TEMPLATE_PATHS[template.gateType]
    if (!existsSync(resolve(root, path))) fail(`Missing pending review template ${path}`)
    const actual = readFileSync(resolve(root, path), 'utf8')
    const expected = templateJson(template)
    if (actual !== expected) fail(`${path} is stale; regenerate pending review templates`)
    checked.push(path)
  }
  return checked
}

function markdownCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const rendered = typeof value === 'string'
    ? value
    : Array.isArray(value)
      ? value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('<br>')
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)
  return rendered
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '\\|')
    .replace(/\r?\n/g, '<br>')
}

function markdownList(values: unknown): string {
  if (!Array.isArray(values) || values.length === 0) return '—'
  return values.map((value) => markdownCell(value)).join('<br>')
}

function sourceIdsForCitations(
  citationIds: unknown,
  sourceIdByCitation: Map<string, string>,
): string[] {
  if (!Array.isArray(citationIds)) return []
  return sortedUnique(
    citationIds
      .filter((citationId): citationId is string => typeof citationId === 'string')
      .map((citationId) => sourceIdByCitation.get(citationId))
      .filter((sourceId): sourceId is string => sourceId !== undefined),
  )
}

function observationValue(observation: JsonObject): string {
  const value = observation.value
  const unit = observation.unit
  if (value === null || value === undefined) return markdownCell(observation.unknownReason)
  return `${markdownCell(value)} ${markdownCell(unit)}`.trim()
}

function appraisalFields(appraisal: AppraisalDraft): string[] {
  return Object.entries(appraisal).map(
    ([field, value]) => `| ${markdownCell(field)} | ${markdownCell(value)} |`,
  )
}

/**
 * Builds the reviewer-facing companion to the immutable JSON work templates.
 * Every reviewable source, acquisition locator, claim, observation,
 * contradiction and appraisal draft is rendered from the hash-bound intake.
 */
export function buildHumanReviewPacket(root: string): string {
  const context = buildReviewContext(root)
  const templates = buildPendingReviewTemplates(root)
  const { intake } = context
  const acquisitions = [...intake.sourceAcquisitions]
    .sort((left, right) => left.acquisitionId.localeCompare(right.acquisitionId))
  const claims = [...intake.claimCandidates]
    .sort((left, right) => targetId(left, 'claimId', 'claimCandidate')
      .localeCompare(targetId(right, 'claimId', 'claimCandidate')))
  const observations = [...intake.measurementCandidates]
    .sort((left, right) => targetId(left, 'observationId', 'measurementCandidate')
      .localeCompare(targetId(right, 'observationId', 'measurementCandidate')))
  const contradictions = [...intake.contradictionSets]
    .sort((left, right) => targetId(left, 'contradictionSetId', 'contradictionSet')
      .localeCompare(targetId(right, 'contradictionSetId', 'contradictionSet')))
  const appraisals = [...intake.appraisalDrafts]
    .sort((left, right) => left.appraisalDraftId.localeCompare(right.appraisalDraftId))
  const sourceIdByCitation = new Map(acquisitions.map((item) => [item.citationId, item.sourceId]))
  const sourceIds = sortedUnique(acquisitions.map((item) => item.sourceId))

  const lines: string[] = [
    '# Field 08 Gate 2C human-review packet',
    '',
    '> Fail-closed review surface. This packet does not record a review, authorize external use, or permit coverage promotion.',
    '',
    '## Package binding',
    '',
    '| Field | Bound value |',
    '| --- | --- |',
    `| Source commit | ${markdownCell(context.evidencePackage.sourceCommit)} |`,
    `| Evidence package hash | ${markdownCell(context.evidencePackageHash)} |`,
    `| Generation manifest | ${markdownCell(context.evidencePackage.generationManifest.path)} (${markdownCell(context.evidencePackage.generationManifest.fileSha256)}) |`,
    `| Review manifest | ${markdownCell(context.evidencePackage.reviewManifest.path)} (${markdownCell(context.evidencePackage.reviewManifest.fileSha256)}) |`,
    `| Evidence intake | ${markdownCell(context.evidencePackage.intake.path)} (${markdownCell(context.evidencePackage.intake.fileSha256)}) |`,
    `| Generated from frozen package | ${markdownCell(context.generatedAt)} |`,
    `| Scope | ${sourceIds.length} sources; ${acquisitions.length} exact locators; ${claims.length} claims; ${observations.length} observations; ${contradictions.length} contradiction sets; ${appraisals.length} appraisal drafts |`,
    '',
    '## Review gates',
    '',
    '| Gate | Required reviewer | Targets | Locator decisions | Source/appraisal pairs | Allowed dispositions |',
    '| --- | --- | ---: | ---: | ---: | --- |',
  ]

  for (const template of templates) {
    lines.push(
      `| ${markdownCell(template.gateType)} | ${markdownCell(template.requiredReviewerRole)} | ${template.targetBindings.length} | ${template.locatorBindings.length} | ${template.sourceAppraisalBindings.length} | ${markdownList(template.allowedDispositions)} |`,
    )
  }
  lines.push('', '### Gate instructions', '')
  for (const template of templates) {
    lines.push(
      `- **${markdownCell(template.gateType)}:** ${markdownCell(template.instructions)}`,
    )
  }

  sourceIds.forEach((sourceId, sourceIndex) => {
    const sourceAcquisitions = acquisitions.filter((item) => item.sourceId === sourceId)
    const sourceClaims = claims.filter((claim) =>
      sourceIdsForCitations(claim.citationIds, sourceIdByCitation).includes(sourceId))
    const sourceObservations = observations.filter((observation) =>
      sourceIdsForCitations(observation.citationIds, sourceIdByCitation).includes(sourceId))
    const sourceAppraisal = appraisals.find((appraisal) => appraisal.targetSourceId === sourceId)
    const headingAcquisition = sourceAcquisitions[0]!

    lines.push(
      '',
      `## Source ${sourceIndex + 1} of ${sourceIds.length}: ${markdownCell(headingAcquisition.title)}`,
      '',
      `- Source ID: ${markdownCell(sourceId)}`,
      `- Publisher: ${markdownCell(headingAcquisition.publisher)}`,
      `- Immutable source hash: ${markdownCell(context.evidencePackage.sourceBindings.find((item) => item.sourceId === sourceId)?.sourceSha256)}`,
      '',
      `### Acquisitions and exact locators (${sourceAcquisitions.length})`,
      '',
      '| Acquisition ID | Citation ID | Evidence role | Exact locator | Source URL | Capture hash |',
      '| --- | --- | --- | --- | --- | --- |',
    )
    for (const acquisition of sourceAcquisitions) {
      lines.push(
        `| ${markdownCell(acquisition.acquisitionId)} | ${markdownCell(acquisition.citationId)} | ${markdownCell(acquisition.evidenceRole)} | ${markdownCell(acquisition.locator)} | ${markdownCell(acquisition.sourceUrl)} | ${markdownCell(acquisition.captureSha256)} |`,
      )
    }

    lines.push(
      '',
      `### Claims (${sourceClaims.length})`,
      '',
      '| Claim ID | Claim text | Citation IDs | Time scope | Functional unit | Aggregation allowed | Limitations |',
      '| --- | --- | --- | --- | --- | --- | --- |',
    )
    for (const claim of sourceClaims) {
      const boundary = asObject(claim.systemBoundary ?? {}, 'claim.systemBoundary')
      lines.push(
        `| ${markdownCell(claim.claimId)} | ${markdownCell(claim.claimText)} | ${markdownList(claim.citationIds)} | ${markdownCell(claim.timeScope)} | ${markdownCell(boundary.functionalUnit)} | ${markdownCell(claim.aggregationAllowed)} | ${markdownList(claim.limitations)} |`,
      )
    }

    lines.push(
      '',
      `### Observations (${sourceObservations.length})`,
      '',
      '| Observation ID | Claim ID | Value | Indicator ID | Citation IDs | Method and universe | Uncertainty | Limitations |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
    )
    for (const observation of sourceObservations) {
      const methodAndUniverse = [observation.method, observation.universe]
        .filter((value) => value !== null && value !== undefined)
      lines.push(
        `| ${markdownCell(observation.observationId)} | ${markdownCell(observation.claimId)} | ${observationValue(observation)} | ${markdownCell(observation.indicatorId)} | ${markdownList(observation.citationIds)} | ${markdownList(methodAndUniverse)} | ${markdownCell(observation.uncertainty)} | ${markdownList(observation.limitations)} |`,
      )
    }

    lines.push('', '### Appraisal draft', '')
    if (!sourceAppraisal) {
      lines.push('_No appraisal draft is bound to this source._')
    } else {
      lines.push('| Field | Draft value |', '| --- | --- |', ...appraisalFields(sourceAppraisal))
    }
  })

  lines.push(
    '',
    `## Contradiction sets (${contradictions.length})`,
    '',
    '| Contradiction set ID | Status | Description | Claim IDs | Observation IDs | Observation pairs | Citation IDs | Aggregation allowed | Resolution |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )
  for (const contradiction of contradictions) {
    lines.push(
      `| ${markdownCell(contradiction.contradictionSetId)} | ${markdownCell(contradiction.status)} | ${markdownCell(contradiction.description)} | ${markdownList(contradiction.claimIds)} | ${markdownList(contradiction.observationIds)} | ${markdownList(contradiction.observationPairs)} | ${markdownList(contradiction.citationIds)} | ${markdownCell(contradiction.aggregationAllowed)} | ${markdownCell(contradiction.resolution)} |`,
    )
  }

  lines.push(
    '',
    '## Recording a review',
    '',
    `Record full-snapshot receipts append-only at \`${FIELD08_HUMAN_REVIEW_RECEIPTS_PATH}\`. Use the immutable JSON template for each gate; this Markdown packet is a reading surface, not a receipt.`,
    '',
    'Every accepted receipt must identify a named qualified human, declare conflicts of interest, bind every target exactly, include UTC review time and the required attestation, and retain `externalGatePassed: false` and `coveragePromotionAllowed: false`.',
  )
  return `${lines.join('\n')}\n`
}

export function writeHumanReviewPacket(root: string): string {
  const packet = buildHumanReviewPacket(root)
  mkdirSync(resolve(root, dirname(FIELD08_HUMAN_REVIEW_PACKET_PATH)), { recursive: true })
  writeFileSync(resolve(root, FIELD08_HUMAN_REVIEW_PACKET_PATH), packet)
  return FIELD08_HUMAN_REVIEW_PACKET_PATH
}

export function checkHumanReviewPacket(root: string): string {
  const absolute = resolve(root, FIELD08_HUMAN_REVIEW_PACKET_PATH)
  if (!existsSync(absolute)) fail(`Missing human-review packet ${FIELD08_HUMAN_REVIEW_PACKET_PATH}`)
  if (readFileSync(absolute, 'utf8') !== buildHumanReviewPacket(root)) {
    fail(`${FIELD08_HUMAN_REVIEW_PACKET_PATH} is stale; regenerate the human-review packet`)
  }
  return FIELD08_HUMAN_REVIEW_PACKET_PATH
}

function requireSubstantive(value: string, label: string) {
  const trimmed = value.trim()
  if (trimmed.length < 20 || SUBSTANTIVE_PLACEHOLDER_PATTERN.test(trimmed)) {
    fail(`${label} must contain a substantive human-review explanation`)
  }
}

function validateDecisionNarrative(
  decision: {
    disposition: string
    rationale: string
    amendments: string[]
    newSourceRequirements: string[]
    resolution?: string | null
  },
  label: string,
) {
  requireSubstantive(decision.rationale, `${label}.rationale`)
  if (decision.disposition === 'resolved') {
    if (!decision.resolution) fail(`${label}.resolution is required for a resolved disposition`)
    requireSubstantive(decision.resolution, `${label}.resolution`)
  }
  if (decision.disposition === 'amendments_required' && decision.amendments.length === 0) {
    fail(`${label}.amendments must describe at least one required amendment`)
  }
  if (
    ['needs_new_source', 'deferred_insufficient_evidence'].includes(decision.disposition) &&
    decision.newSourceRequirements.length === 0
  ) {
    fail(`${label}.newSourceRequirements must describe the missing evidence`)
  }
  for (const [index, amendment] of decision.amendments.entries()) {
    requireSubstantive(amendment, `${label}.amendments[${index}]`)
  }
  for (const [index, requirement] of decision.newSourceRequirements.entries()) {
    requireSubstantive(requirement, `${label}.newSourceRequirements[${index}]`)
  }
}

function validateReviewer(receipt: HumanReviewReceipt, template: PendingReviewTemplate, now: Date) {
  const reviewer = receipt.reviewer
  if (AUTOMATION_NAME_PATTERN.test(reviewer.name)) {
    fail(`${receipt.receiptId} reviewer.name must identify a named human, not automation`)
  }
  if (reviewer.name.trim().split(/\s+/).length < 2) {
    fail(`${receipt.receiptId} reviewer.name must include at least two name components`)
  }
  if (reviewer.role !== template.requiredReviewerRole) {
    fail(`${receipt.receiptId} reviewer.role must match the gate's required reviewer role`)
  }
  if (reviewer.qualifications.some((item) => SUBSTANTIVE_PLACEHOLDER_PATTERN.test(item.trim()))) {
    fail(`${receipt.receiptId} reviewer qualifications contain a placeholder`)
  }
  const reviewedAt = Date.parse(reviewer.reviewedAt)
  if (!Number.isFinite(reviewedAt)) fail(`${receipt.receiptId} reviewer.reviewedAt is invalid`)
  if (reviewedAt > now.getTime()) fail(`${receipt.receiptId} reviewer.reviewedAt cannot be in the future`)
  if (reviewer.attestation !== HUMAN_REVIEW_ATTESTATION) {
    fail(`${receipt.receiptId} reviewer attestation is missing or invalid`)
  }
}

function validateTargetDecisions(
  decisions: TargetDecision[],
  template: PendingReviewTemplate,
  label: string,
) {
  assertExactIds(
    decisions.map((item) => item.targetId),
    template.targetBindings.map((item) => item.targetId),
    `${label} target decisions`,
  )
  const expected = new Map(template.targetBindings.map((item) => [item.targetId, item]))
  for (const decision of decisions) {
    const binding = expected.get(decision.targetId)!
    if (decision.targetKind !== binding.targetKind || decision.targetSha256 !== binding.targetSha256) {
      fail(`${label} target decision ${decision.targetId} does not match its immutable binding`)
    }
    if (!template.allowedDispositions.includes(decision.disposition)) {
      fail(`${label} target decision ${decision.targetId} has an invalid disposition`)
    }
    validateDecisionNarrative(decision, `${label}.${decision.targetId}`)
  }
}

function validateLocatorDecisions(decisions: LocatorDecision[], template: PendingReviewTemplate, label: string) {
  assertExactIds(
    decisions.map((item) => item.acquisitionId),
    template.locatorBindings.map((item) => item.acquisitionId),
    `${label} locator decisions`,
  )
  const expected = new Map(template.locatorBindings.map((item) => [item.acquisitionId, item]))
  for (const decision of decisions) {
    const binding = expected.get(decision.acquisitionId)!
    const immutableDecisionBinding = {
      sourceId: decision.sourceId,
      sourceSha256: decision.sourceSha256,
      acquisitionId: decision.acquisitionId,
      acquisitionSha256: decision.acquisitionSha256,
      citationId: decision.citationId,
      citationSha256: decision.citationSha256,
      captureSha256: decision.captureSha256,
    }
    const immutableTemplateBinding = {
      sourceId: binding.sourceId,
      sourceSha256: binding.sourceSha256,
      acquisitionId: binding.acquisitionId,
      acquisitionSha256: binding.acquisitionSha256,
      citationId: binding.citationId,
      citationSha256: binding.citationSha256,
      captureSha256: binding.captureSha256,
    }
    if (!sameJson(immutableDecisionBinding, immutableTemplateBinding)) {
      fail(`${label} locator decision ${decision.acquisitionId} does not match its immutable binding`)
    }
    if (!template.allowedDispositions.includes(decision.disposition)) {
      fail(`${label} locator decision ${decision.acquisitionId} has an invalid disposition`)
    }
    validateDecisionNarrative(decision, `${label}.${decision.acquisitionId}`)
    if (!OPEN_DISPOSITIONS.has(decision.disposition)) {
      const checks = [
        decision.exactLocatorInspected,
        decision.definitionPeriodUnitChecked,
        decision.methodUniverseBoundaryChecked,
        decision.uncertaintyLimitationsChecked,
      ]
      if (checks.some((item) => item !== true)) {
        fail(`${label} locator decision ${decision.acquisitionId} cannot be ${decision.disposition} without all locator checks`)
      }
    }
  }
}

function validateMethodDecisions(decisions: MethodDecision[], template: PendingReviewTemplate, label: string) {
  assertExactIds(
    decisions.map((item) => item.sourceId),
    template.sourceAppraisalBindings.map((item) => item.sourceId),
    `${label} source/appraisal decisions`,
  )
  assertExactIds(
    decisions.map((item) => item.appraisalDraftId),
    template.sourceAppraisalBindings.map((item) => item.appraisalDraftId),
    `${label} appraisal-draft decisions`,
  )
  const expected = new Map(template.sourceAppraisalBindings.map((item) => [item.sourceId, item]))
  for (const decision of decisions) {
    const binding = expected.get(decision.sourceId)!
    const immutableDecisionBinding: SourceAppraisalBinding = {
      sourceId: decision.sourceId,
      sourceSha256: decision.sourceSha256,
      appraisalDraftId: decision.appraisalDraftId,
      appraisalDraftSha256: decision.appraisalDraftSha256,
    }
    if (!sameJson(immutableDecisionBinding, binding)) {
      fail(`${label} source/appraisal decision ${decision.sourceId} does not match its immutable pair`)
    }
    if (!template.allowedDispositions.includes(decision.disposition)) {
      fail(`${label} source/appraisal decision ${decision.sourceId} has an invalid disposition`)
    }
    validateDecisionNarrative(decision, `${label}.${decision.sourceId}`)
    requireSubstantive(decision.appraisal.methodologySummary, `${label}.${decision.sourceId}.methodologySummary`)
    requireSubstantive(decision.appraisal.sampleOrCoverage, `${label}.${decision.sourceId}.sampleOrCoverage`)
    requireSubstantive(decision.appraisal.applicabilityNotes, `${label}.${decision.sourceId}.applicabilityNotes`)
    requireSubstantive(decision.appraisal.riskOfBiasNotes, `${label}.${decision.sourceId}.riskOfBiasNotes`)
    for (const [index, limitation] of decision.appraisal.limitations.entries()) {
      requireSubstantive(limitation, `${label}.${decision.sourceId}.limitations[${index}]`)
    }
  }
}

export function validateHumanReviewReceipt(
  root: string,
  receipt: HumanReviewReceipt,
  now = new Date(),
): HumanReviewReceipt {
  validateSchema(root, HUMAN_REVIEW_RECEIPT_SCHEMA_PATH, receipt, receipt.receiptId || 'human-review receipt')
  assertCanonicalContentHash(receipt, receipt.receiptId)

  const templates = buildPendingReviewTemplates(root)
  const template = templates.find((item) => item.gateType === receipt.gateType)
  if (!template) fail(`${receipt.receiptId} has an unknown gateType`)
  if (receipt.reviewGateId !== template.reviewGateId) fail(`${receipt.receiptId} reviewGateId mismatch`)
  if (receipt.review.gateType !== receipt.gateType) fail(`${receipt.receiptId} review gateType mismatch`)
  if (receipt.sourceCommit !== template.sourceCommit) fail(`${receipt.receiptId} sourceCommit mismatch`)
  if (!sameJson(receipt.evidencePackage, template.evidencePackage)) {
    fail(`${receipt.receiptId} evidencePackage does not match the pending template`)
  }
  if (receipt.evidencePackageHash !== template.evidencePackageHash) {
    fail(`${receipt.receiptId} evidencePackageHash mismatch`)
  }
  if (receipt.externalGatePassed !== false || receipt.coveragePromotionAllowed !== false) {
    fail(`${receipt.receiptId} must remain fail-closed for external use and coverage promotion`)
  }
  const expectedReceiptPrefix = `review_receipt.field08.${GATE_SLUGS[receipt.gateType]}.${receipt.reviewer.reviewedAt.slice(0, 10)}.`
  if (!receipt.receiptId.startsWith(expectedReceiptPrefix)) {
    fail(`${receipt.receiptId} must encode its gate type and review date`)
  }
  validateReviewer(receipt, template, now)

  switch (receipt.review.gateType) {
    case 'boundary_reconciliation':
    case 'contradiction_resolution':
      validateTargetDecisions(receipt.review.targetDecisions, template, receipt.receiptId)
      break
    case 'method_appraisal':
      validateMethodDecisions(receipt.review.sourceAppraisalDecisions, template, receipt.receiptId)
      break
    case 'ordinary_human_review':
      validateTargetDecisions(receipt.review.targetDecisions, template, receipt.receiptId)
      validateLocatorDecisions(receipt.review.locatorDecisions, template, receipt.receiptId)
      break
  }

  return receipt
}

export function parseHumanReviewReceiptJsonl(content: string, label = 'human-review receipts'): HumanReviewReceipt[] {
  const lines = content.split(/\r?\n/)
  const receipts: HumanReviewReceipt[] = []
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue
    try {
      receipts.push(JSON.parse(line) as HumanReviewReceipt)
    } catch (error) {
      fail(`${label} line ${index + 1} is invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return receipts
}

export function readHumanReviewReceipts(
  root: string,
  path = FIELD08_HUMAN_REVIEW_RECEIPTS_PATH,
): HumanReviewReceipt[] {
  const absolute = resolve(root, path)
  if (!existsSync(absolute)) return []
  return parseHumanReviewReceiptJsonl(readFileSync(absolute, 'utf8'), path)
}

export function validateHumanReviewReceiptLog(
  root: string,
  receipts: HumanReviewReceipt[],
  now = new Date(),
  options: { previousReceipts?: HumanReviewReceipt[] } = {},
): HumanReviewReceipt[] {
  const receiptIds = new Set<string>()
  const latestByGate = new Map<GateType, HumanReviewReceipt>()
  for (const receipt of receipts) {
    validateHumanReviewReceipt(root, receipt, now)
    if (receiptIds.has(receipt.receiptId)) fail(`Duplicate human-review receipt ID ${receipt.receiptId}`)
    receiptIds.add(receipt.receiptId)

    const previous = latestByGate.get(receipt.gateType)
    if (!previous) {
      if (receipt.sequence !== 1 || receipt.supersedesReceiptId !== null || receipt.previousReceiptHash !== null) {
        fail(`${receipt.receiptId} must start its gate chain at sequence 1 without a predecessor`)
      }
    } else {
      if (receipt.sequence !== previous.sequence + 1) {
        fail(`${receipt.receiptId} sequence must be ${previous.sequence + 1}`)
      }
      if (receipt.supersedesReceiptId !== previous.receiptId) {
        fail(`${receipt.receiptId} must supersede the latest receipt ${previous.receiptId}`)
      }
      if (receipt.previousReceiptHash !== previous.contentHash) {
        fail(`${receipt.receiptId} previousReceiptHash does not bind ${previous.receiptId}`)
      }
      if (Date.parse(receipt.reviewer.reviewedAt) <= Date.parse(previous.reviewer.reviewedAt)) {
        fail(`${receipt.receiptId} reviewedAt must be later than its predecessor`)
      }
    }
    latestByGate.set(receipt.gateType, receipt)
  }
  if (options.previousReceipts) {
    const previous = validateHumanReviewReceiptLog(root, options.previousReceipts, now)
    if (receipts.length < previous.length) fail('Append-only human-review log removed prior receipts')
    for (const [index, priorReceipt] of previous.entries()) {
      if (canonicalJson(receipts[index]) !== canonicalJson(priorReceipt)) {
        fail(`Append-only human-review log mutated prior entry ${index + 1} (${priorReceipt.receiptId})`)
      }
    }
  }
  return receipts
}

function receiptDecisions(receipt: HumanReviewReceipt): Array<{ id: string; disposition: string }> {
  switch (receipt.review.gateType) {
    case 'boundary_reconciliation':
    case 'contradiction_resolution':
      return receipt.review.targetDecisions.map((item) => ({ id: item.targetId, disposition: item.disposition }))
    case 'method_appraisal':
      return receipt.review.sourceAppraisalDecisions.map((item) => ({
        id: `${item.sourceId}::${item.appraisalDraftId}`,
        disposition: item.disposition,
      }))
    case 'ordinary_human_review':
      return [
        ...receipt.review.targetDecisions.map((item) => ({ id: item.targetId, disposition: item.disposition })),
        ...receipt.review.locatorDecisions.map((item) => ({
          id: `${item.acquisitionId}::${item.citationId}`,
          disposition: item.disposition,
        })),
      ]
  }
}

function gateStatus(gate: ReviewGate, receipt: HumanReviewReceipt | undefined): GateStatus {
  if (!receipt) {
    return {
      reviewGateId: gate.reviewGateId,
      gateType: gate.gateType,
      status: 'pending',
      latestReceiptId: null,
      latestReceiptHash: null,
      receiptSequence: 0,
      decisionCounts: {},
      openTargetIds: [],
      actionRequiredTargetIds: [],
    }
  }
  const decisions = receiptDecisions(receipt)
  const decisionCounts: Record<string, number> = {}
  const openTargetIds: string[] = []
  const actionRequiredTargetIds: string[] = []
  for (const decision of decisions) {
    decisionCounts[decision.disposition] = (decisionCounts[decision.disposition] ?? 0) + 1
    if (OPEN_DISPOSITIONS.has(decision.disposition)) openTargetIds.push(decision.id)
    if (ACTION_DISPOSITIONS.has(decision.disposition)) actionRequiredTargetIds.push(decision.id)
  }
  if (receipt.reviewer.conflictOfInterest.status === 'declared_unmanaged') {
    actionRequiredTargetIds.push(`${receipt.reviewGateId}::unmanaged_conflict_of_interest`)
  }
  const status = actionRequiredTargetIds.length > 0
    ? 'reviewed_action_required'
    : openTargetIds.length > 0
      ? 'reviewed_open'
      : 'reviewed_resolved'
  return {
    reviewGateId: gate.reviewGateId,
    gateType: gate.gateType,
    status,
    latestReceiptId: receipt.receiptId,
    latestReceiptHash: receipt.contentHash,
    receiptSequence: receipt.sequence,
    decisionCounts: Object.fromEntries(Object.entries(decisionCounts).sort(([left], [right]) => left.localeCompare(right))),
    openTargetIds: sortedUnique(openTargetIds),
    actionRequiredTargetIds: sortedUnique(actionRequiredTargetIds),
  }
}

export function buildHumanReviewStatusProjection(
  root: string,
  receipts: HumanReviewReceipt[],
  generatedAt?: Date,
): HumanReviewStatusProjection {
  const context = buildReviewContext(root)
  const timestamps = [
    Date.parse(context.generatedAt),
    ...receipts.map((receipt) => Date.parse(receipt.reviewer.reviewedAt)),
  ]
  if (timestamps.some((timestamp) => !Number.isFinite(timestamp))) {
    fail('Cannot derive deterministic status timestamp from the bound package or receipts')
  }
  const minimumGeneratedAt = Math.max(...timestamps)
  const deterministicGeneratedAt = generatedAt ?? new Date(minimumGeneratedAt)
  if (!Number.isFinite(deterministicGeneratedAt.getTime())
    || deterministicGeneratedAt.getTime() < minimumGeneratedAt) {
    fail('Human-review status timestamp cannot predate the bound package or any receipt')
  }
  validateHumanReviewReceiptLog(root, receipts, deterministicGeneratedAt)
  const latestByGate = new Map<GateType, HumanReviewReceipt>()
  for (const receipt of receipts) latestByGate.set(receipt.gateType, receipt)
  const gateStatuses = context.reviewGates
    .map((gate) => gateStatus(gate, latestByGate.get(gate.gateType)))
    .sort((left, right) => GATE_TYPES.indexOf(left.gateType) - GATE_TYPES.indexOf(right.gateType))
  const outstandingReviewGateIds = gateStatuses
    .filter((gate) => gate.status !== 'reviewed_resolved')
    .map((gate) => gate.reviewGateId)
  const hasPending = gateStatuses.some((gate) => gate.status === 'pending')
  const hasAction = gateStatuses.some((gate) => gate.status === 'reviewed_action_required')
  const hasOpen = gateStatuses.some((gate) => gate.status === 'reviewed_open')
  const packageStatus = hasAction
    ? 'human_review_recorded_action_required'
    : hasOpen
      ? 'human_review_recorded_open'
      : hasPending
        ? 'human_review_pending'
        : 'human_review_complete_internal_only'
  const payload = {
    documentType: 'field08_human_review_status_projection' as const,
    schemaVersion: '1.0.0' as const,
    generatedAt: deterministicGeneratedAt.toISOString(),
    sourceCommit: context.evidencePackage.sourceCommit,
    evidencePackageHash: context.evidencePackageHash,
    receiptCount: receipts.length,
    packageStatus,
    gateStatuses,
    outstandingReviewGateIds,
    externalGatePassed: false as const,
    coveragePromotionAllowed: false as const,
  }
  const projection = withContentHash(payload) as HumanReviewStatusProjection
  validateSchema(root, HUMAN_REVIEW_STATUS_SCHEMA_PATH, projection, 'human-review status projection')
  return projection
}

function statusJson(projection: HumanReviewStatusProjection): string {
  return `${JSON.stringify(projection, null, 2)}\n`
}

export function writeHumanReviewStatus(
  root: string,
  receipts = readHumanReviewReceipts(root),
): string {
  const projection = buildHumanReviewStatusProjection(root, receipts)
  mkdirSync(resolve(root, dirname(FIELD08_HUMAN_REVIEW_STATUS_PATH)), { recursive: true })
  writeFileSync(resolve(root, FIELD08_HUMAN_REVIEW_STATUS_PATH), statusJson(projection))
  return FIELD08_HUMAN_REVIEW_STATUS_PATH
}

export function checkHumanReviewStatus(
  root: string,
  receipts = readHumanReviewReceipts(root),
): string {
  const absolute = resolve(root, FIELD08_HUMAN_REVIEW_STATUS_PATH)
  if (!existsSync(absolute)) fail(`Missing human-review status ${FIELD08_HUMAN_REVIEW_STATUS_PATH}`)
  const expected = statusJson(buildHumanReviewStatusProjection(root, receipts))
  if (readFileSync(absolute, 'utf8') !== expected) {
    fail(`${FIELD08_HUMAN_REVIEW_STATUS_PATH} is stale; regenerate the human-review status`)
  }
  return FIELD08_HUMAN_REVIEW_STATUS_PATH
}

function usage(): string {
  return [
    'Usage: tsx scripts/knowledge/field08-human-review.ts <command> [--receipts <path>] [--previous-log <path>]',
    'Commands:',
    '  --write-templates    Generate four immutable templates and the Markdown review packet.',
    '  --check-templates    Verify the four templates and Markdown packet against Gate 2C.',
    '  --validate-receipts  Validate the append-only receipt log (missing file is empty).',
    '  --write-status       Persist the deterministic fail-closed status projection.',
    '  --check-status       Verify the persisted deterministic status projection.',
    '  --status             Print the derived fail-closed status projection.',
  ].join('\n')
}

function parseCliArgs(args: string[]): {
  command: string
  receiptsPath: string
  previousLogPath: string | null
} {
  let command = ''
  let receiptsPath = FIELD08_HUMAN_REVIEW_RECEIPTS_PATH
  let previousLogPath: string | null = null
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!
    if (arg === '--receipts') {
      const next = args[index + 1]
      if (!next) fail('--receipts requires a path')
      receiptsPath = next
      index += 1
    } else if (arg === '--previous-log') {
      const next = args[index + 1]
      if (!next) fail('--previous-log requires a path')
      previousLogPath = next
      index += 1
    } else if ([
      '--write-templates',
      '--check-templates',
      '--validate-receipts',
      '--write-status',
      '--check-status',
      '--status',
    ].includes(arg)) {
      if (command) fail('Specify exactly one command')
      command = arg
    } else {
      fail(`Unknown argument ${arg}`)
    }
  }
  if (!command) fail(usage())
  if (previousLogPath && command !== '--validate-receipts') {
    fail('--previous-log is only valid with --validate-receipts')
  }
  return { command, receiptsPath, previousLogPath }
}

export function runHumanReviewCli(root: string, args: string[]) {
  const { command, receiptsPath, previousLogPath } = parseCliArgs(args)
  if (command === '--write-templates') {
    const paths = [...writePendingReviewTemplates(root), writeHumanReviewPacket(root)]
    process.stdout.write(`${JSON.stringify({ command, written: paths }, null, 2)}\n`)
    return
  }
  if (command === '--check-templates') {
    const paths = [...checkPendingReviewTemplates(root), checkHumanReviewPacket(root)]
    process.stdout.write(`${JSON.stringify({ command, checked: paths }, null, 2)}\n`)
    return
  }
  const receipts = readHumanReviewReceipts(root, receiptsPath)
  if (command === '--validate-receipts') {
    const previousReceipts = previousLogPath
      ? readHumanReviewReceipts(root, previousLogPath)
      : undefined
    validateHumanReviewReceiptLog(root, receipts, new Date(), { previousReceipts })
    process.stdout.write(`${JSON.stringify({ command, receiptsPath, receiptCount: receipts.length }, null, 2)}\n`)
    return
  }
  if (command === '--write-status') {
    const path = writeHumanReviewStatus(root, receipts)
    process.stdout.write(`${JSON.stringify({ command, receiptsPath, written: [path] }, null, 2)}\n`)
    return
  }
  if (command === '--check-status') {
    const path = checkHumanReviewStatus(root, receipts)
    process.stdout.write(`${JSON.stringify({ command, receiptsPath, checked: [path] }, null, 2)}\n`)
    return
  }
  const projection = buildHumanReviewStatusProjection(root, receipts)
  process.stdout.write(`${JSON.stringify(projection, null, 2)}\n`)
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (invokedPath === import.meta.url) {
  try {
    runHumanReviewCli(process.cwd(), process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
