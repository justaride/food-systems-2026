import { spawnSync } from 'node:child_process'
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import {
  canonicalJson,
  sha256,
  snapshotArtifact,
  type ArtifactSnapshot,
} from './generate-coverage-ledger'
import { validateKnowledgeFoundation } from './validate-knowledge-foundation'

export const GENERATOR_VERSION = '1.1.0'
export const INTAKE_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-intake.v1.json'
export const INTAKE_SCHEMA_PATH = 'knowledge/schema/field08-evidence-intake.schema.v1.json'
export const EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH = 'knowledge/schema/field08-external-capture-manifest.schema.v1.json'
export const KNOWLEDGE_OBJECT_SCHEMA_PATH = 'knowledge/schema/knowledge-object.schema.v1.json'
export const ONTOLOGY_PATH = 'knowledge/schema/nordic-food-system-ontology.v1.json'
export const COVERAGE_LEDGER_PATH = 'knowledge/coverage/coverage-ledger.v1.jsonl'
export const HISTORICAL_ASSESSMENTS_PATH = 'knowledge/coverage/coverage-assessments-baseline.v1.jsonl'
export const COVERAGE_CELLS_PATH = 'knowledge/coverage/coverage-cells.v1.csv'
export const GENERATOR_PATH = 'scripts/knowledge/generate-field08-evidence-intake.ts'
export const COVERAGE_GENERATOR_PATH = 'scripts/knowledge/generate-coverage-ledger.ts'
export const KNOWLEDGE_VALIDATOR_PATH = 'scripts/knowledge/validate-knowledge-foundation.ts'
export const FIELD08_SOURCE_MAP_PATH = 'knowledge/pilots/field08/field08-research-source-map.v1.json'
export const EXTERNAL_CAPTURES_MANIFEST_PATH = 'research/evidence-pack/field08-gate2c-2026-07-28/external-captures.v1.json'

export const ACQUISITION_RECEIPTS_PATH = 'knowledge/pilots/field08/gate2c/field08-acquisition-receipts.v1.jsonl'
export const KNOWLEDGE_OBJECTS_PATH = 'knowledge/objects/field08-gate2c.v1.json'
export const APPRAISAL_REVIEW_MANIFEST_PATH = 'knowledge/pilots/field08/gate2c/field08-appraisal-review-manifest.v1.json'
export const REVIEWER_BRIEF_PATH = 'knowledge/pilots/field08/gate2c/field08-reviewer-brief.v1.md'
export const EVIDENCE_REGISTER_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-register.v1.json'
export const REPORT_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-report.v1.md'
export const GENERATION_MANIFEST_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-generation-manifest.v1.json'

const FIELD_ID = 'legacy_field.f08'
const SAPMI_GEOGRAPHY = 'geo.sapmi'
const POLITICAL_GEOGRAPHIES = ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is', 'geo.fo', 'geo.gl', 'geo.ax'] as const
const FACET_ARRAY_KEYS = [
  'geographyIds',
  'stageIds',
  'domainIds',
  'outcomeIds',
  'actorClassIds',
  'flowClassIds',
  'commodityGroupIds',
  'materialGroupIds',
  'circularStrategyIds',
  'ownershipFormIds',
] as const

type PoliticalGeographyId = typeof POLITICAL_GEOGRAPHIES[number]
type BoundaryState = 'political_direct' | 'finland_including_aland' | 'aland_only' | 'unknown_finland_aland'
type RealizationState = 'realized_measured' | 'realized_estimated' | 'potential_modelled' | 'target_only' | 'unknown'
type ReportedPrecision = null | 'nearest_1_unit' | 'nearest_0_1_unit' | 'nearest_10_units' | 'nearest_100_units' | 'nearest_1000_units' | 'nearest_100_tonnes'

type Facets = Record<typeof FACET_ARRAY_KEYS[number], string[]>
type TimeScope = { kind: 'undated' | 'snapshot' | 'interval' | 'series'; from?: string | null; to?: string | null; asOf: string }
type SystemBoundary = { included: string[]; excluded: string[]; functionalUnit: string | null }

type SourceAcquisition = {
  acquisitionId: string
  sourceId: string
  citationId: string
  sourceCandidateId: string
  title: string
  publisher: string
  sourceClass: 'primary' | 'dataset'
  sourceUrl: string
  citationText: string
  locator: string
  evidenceRole: 'numerator' | 'denominator_universe' | 'method' | 'descriptive_claim' | 'caveat_limitation' | 'counterevidence'
  accessedAt: string
  capturedAt: string
  capturePath: string
  captureSha256: string
  captureSizeBytes: number
  mediaType: string
  acquisitionMethod: 'direct_download' | 'api_query'
  captureStorage: 'git_tracked' | 'local_external'
  archiveDurability: 'git_pinned' | 'local_only_at_risk'
  inspectionNotePath: string | null
  reuseReviewState: 'pending'
  requestReceiptPath: string | null
  geographyIds: PoliticalGeographyId[]
  boundaryState: BoundaryState
  nonAdditiveWithGeographyIds: PoliticalGeographyId[]
  facets: Facets
  limitations: string[]
}

type SubjectDefinition = {
  subjectId: string
  objectTypeId: 'knowledge_object.actor' | 'knowledge_object.place' | 'knowledge_object.infrastructure' | 'knowledge_object.process' | 'knowledge_object.policy'
  title: string
  summary: string
  facets: Facets
  systemBoundary: SystemBoundary
}

type IndicatorDefinition = {
  indicatorId: string
  title: string
  summary: string
  subjectIds: string[]
  facets: Facets
  period: string
  unit: string
  numeratorDefinition: string | null
  denominatorOrUniverse: string | null
  method: string
  universe: string
  unknownReason: string
}

type ClaimCandidate = {
  claimId: string
  claimKind: 'quantitative_measurement_claim' | 'qualitative_boundary_claim' | 'qualitative_method_claim' | 'qualitative_caveat_claim'
  title: string
  summary: string
  claimText: string
  citationIds: string[]
  coverageCellIds: string[]
  facets: Facets
  timeScope: TimeScope
  systemBoundary: SystemBoundary
  boundaryState: BoundaryState
  nonAdditiveWithGeographyIds: PoliticalGeographyId[]
  aggregationAllowed: boolean
  limitations: string[]
}

type MeasurementCandidate = {
  observationId: string
  claimId: string
  indicatorId: string
  subjectIds: string[]
  citationIds: string[]
  title: string
  summary: string
  facets: Facets
  timeScope: TimeScope
  systemBoundary: SystemBoundary
  value: number | null
  unit: string
  numeratorDefinition: string | null
  denominatorOrUniverse: string | null
  method: string
  universe: string
  unknownReason: string | null
  realizationState: RealizationState
  boundaryState: BoundaryState
  nonAdditiveWithGeographyIds: PoliticalGeographyId[]
  calculationKind: 'source_reported' | 'direct_api_value' | 'derived_from_source_rows'
  aggregationAllowed: boolean
  componentObservationIds: string[]
  reportedPrecision: ReportedPrecision
  sourceRowProvenance: string[]
  uncertainty: { level: 'unknown' | 'low' | 'medium' | 'high'; reasons: string[] }
  limitations: string[]
}

type ContradictionSet = {
  contradictionSetId: string
  status: 'open'
  claimIds: string[]
  observationIds: string[]
  observationPairs: Array<{ leftObservationId: string; rightObservationId: string }>
  citationIds: string[]
  description: string
  aggregationAllowed: boolean
  resolution: string | null
}

type DeferredCandidate = {
  deferredCandidateId: string
  sourceCandidateId: string
  geographyIds: string[]
  reasonCode: string
  description: string
  nextAction: string
}

type ChildDimensionRequirement = {
  requirementId: string
  targetId: string
  dimensionId: 'value_chain_stage' | 'domain' | 'outcome' | 'flow_class' | 'material_group' | 'circular_strategy' | 'commodity_group' | 'destination' | 'method'
  requiredValueIds: string[]
  status: 'open'
  rationale: string
}

type AppraisalDraft = {
  appraisalDraftId: string
  targetSourceId: string
  authorityAssessment: string
  scopeFitAssessment: string
  methodAssessment: string
  limitationAssessment: string
  reviewState: 'human_review_pending'
  externalGatePassed: false
}

type ReviewGate = {
  reviewGateId: string
  gateType: 'ordinary_human_review' | 'boundary_reconciliation' | 'contradiction_resolution' | 'method_appraisal'
  targetIds: string[]
  status: 'pending'
  requiredReviewerRole: string
  instructions: string
  externalGatePassed: false
  coveragePromotionAllowed: false
}

export type Field08EvidenceIntake = {
  documentType: 'field08_evidence_intake'
  schemaVersion: '1.0.0'
  intakeId: 'intake.field08_gate2c.v1'
  status: 'machine_checked_human_review_pending'
  observedAt: string
  sourceMapId: 'map.field08_research_candidates.v1'
  semantics: {
    artifactRole: 'evidence_intake'
    coverageImplication: 'none'
    externalUseAllowed: false
    readinessPromotionAllowed: false
    historicalAssessmentMutationAllowed: false
    humanReviewRequired: true
    sapmiSubjectEvidenceAllowed: false
  }
  sourceAcquisitions: SourceAcquisition[]
  subjectDefinitions: SubjectDefinition[]
  indicatorDefinitions: IndicatorDefinition[]
  claimCandidates: ClaimCandidate[]
  measurementCandidates: MeasurementCandidate[]
  contradictionSets: ContradictionSet[]
  deferredCandidates: DeferredCandidate[]
  childDimensionRequirements: ChildDimensionRequirement[]
  appraisalDrafts: AppraisalDraft[]
  reviewGates: ReviewGate[]
}

type Ontology = {
  ontologyVersion: string
  dimensions: Record<string, Array<{ id: string }>> & {
    legacyFields: Array<{ id: string; legacyMappings?: { facetTargets?: Record<string, string[]> } }>
  }
}

type Field08SourceMap = {
  mapId: string
  sources: Array<{ sourceCandidateId: string; title: string; publisher: string; sourceType: string }>
  bindings: Array<{ sourceCandidateId: string; geographyId: string; boundaryFit: string }>
}

type ApiRequestReceipt = {
  documentType: string
  schemaVersion: string
  requests: Array<{
    requestId: string
    method: string
    url: string
    headers: Record<string, string>
    body: unknown
    responsePath: string
  }>
}

type ExternalCaptureManifest = {
  documentType: string
  schemaVersion: string
  manifestId: string
  status: string
  captures: Array<{
    captureId: string
    sourceCandidateId: string
    sourceUrl: string
    accessedAt: string
    capturedAt: string
    localPath: string
    storageClass: string
    archiveDurability: string
    recoveryLocator: string
    sha256: string
    sizeBytes: number
    mediaType: string
    fileMagic: string
    redistributionStatus: string
    license: string | null
    licenseUrl: string | null
    inspectionNote: {
      path: string
      sha256: string
      sizeBytes: number
      mediaType: 'text/markdown'
      authorship: 'project_authored'
      scope: 'bounded_facts_and_locator_metadata'
      preparationMethod: 'manual_factual_locator_note'
      containsFullText: false
      containsVerbatimSourceText: false
      sourcePdfSha256: string
      rightsBoundary: 'does_not_grant_source_redistribution_rights'
      preparedAt: string
    }
  }>
}

type BaselineGuard = {
  historicalAssessmentPath: typeof HISTORICAL_ASSESSMENTS_PATH
  coverageLedgerPath: typeof COVERAGE_LEDGER_PATH
  historicalAssessmentSnapshot: ArtifactSnapshot
  coverageLedgerSnapshot: ArtifactSnapshot
  historicalEventCount: 117
  field08CellCount: 9
  field08ScopeRegistrationCount: 9
  field08SubjectMatterAssessmentCount: 0
  historicalAssessmentWriteCount: 0
}

type KnowledgeObject = Record<string, unknown> & { id: string }

export type Field08EvidenceArtifacts = {
  baseCommit: string
  intake: Field08EvidenceIntake
  inputSnapshots: ArtifactSnapshot[]
  acquisitionReceiptsJsonl: string
  knowledgeObjects: KnowledgeObject[]
  knowledgeObjectsJson: string
  appraisalReviewManifestJson: string
  reviewerBriefMarkdown: string
  evidenceRegister: Record<string, unknown>
  evidenceRegisterJson: string
  reportMarkdown: string
  generationManifestJson: string
  externalCaptureVerification: {
    requiredPaths: string[]
    verifiedPaths: string[]
    allRequiredPresentAndVerified: boolean
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type RepositoryLocation = {
  repository: string
  relativePath: string
  absolutePath: string
}

function isContainedPath(repository: string, candidate: string): boolean {
  const candidateRelative = relative(repository, candidate)
  return candidateRelative === ''
    || (!isAbsolute(candidateRelative) && candidateRelative !== '..' && !candidateRelative.startsWith(`..${sep}`))
}

function repositoryLocation(root: string, path: string, label: string): RepositoryLocation {
  assert(path.length > 0 && !path.startsWith('/'), `${label} must be repository-relative`)
  assert(!path.split('/').includes('..'), `${label} cannot escape the repository`)
  const repository = realpathSync(resolve(root))
  const relativePath = path.replaceAll('\\', '/')
  const absolutePath = resolve(repository, relativePath)
  assert(isContainedPath(repository, absolutePath) && absolutePath !== repository, `${label} cannot escape the repository`)
  return { repository, relativePath, absolutePath }
}

function lstatIfPresent(path: string) {
  try {
    return lstatSync(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

function assertSafeExistingParentChain(location: RepositoryLocation, label: string): boolean {
  const parentRelative = relative(location.repository, dirname(location.absolutePath))
  let current = location.repository
  for (const component of parentRelative.split(sep).filter(Boolean)) {
    current = resolve(current, component)
    const stat = lstatIfPresent(current)
    if (!stat) return false
    assert(!stat.isSymbolicLink(), `${label} parent cannot be a symbolic link: ${current}`)
    assert(stat.isDirectory(), `${label} parent must be a directory: ${current}`)
    assert(isContainedPath(location.repository, realpathSync(current)), `${label} parent cannot escape the repository`)
  }
  return true
}

function regularRepositoryFile(root: string, path: string, label: string): string {
  const location = repositoryLocation(root, path, label)
  assert(assertSafeExistingParentChain(location, label), `${label} is missing: ${location.relativePath}`)
  const stat = lstatIfPresent(location.absolutePath)
  assert(stat, `${label} is missing: ${location.relativePath}`)
  assert(!stat.isSymbolicLink(), `${label} cannot be a symbolic link: ${location.relativePath}`)
  assert(stat.isFile(), `${label} must be a regular file: ${location.relativePath}`)
  assert(isContainedPath(location.repository, realpathSync(location.absolutePath)), `${label} cannot escape the repository`)
  return location.absolutePath
}

function repositoryEntryExists(root: string, path: string, label: string): boolean {
  const location = repositoryLocation(root, path, label)
  if (!assertSafeExistingParentChain(location, label)) return false
  return lstatIfPresent(location.absolutePath) !== null
}

function readRepositoryText(root: string, path: string, label = path): string {
  return readFileSync(regularRepositoryFile(root, path, label), 'utf8')
}

function readRepositoryBytes(root: string, path: string, label = path): Buffer {
  return readFileSync(regularRepositoryFile(root, path, label))
}

function safeOutputTarget(
  root: string,
  path: string,
  options: { createParent: boolean; requireTarget: boolean },
): string {
  const label = `Generated output ${path}`
  const location = repositoryLocation(root, path, label)
  const parentRelative = relative(location.repository, dirname(location.absolutePath))
  let current = location.repository
  let parentExists = true
  for (const component of parentRelative.split(sep).filter(Boolean)) {
    current = resolve(current, component)
    let stat = lstatIfPresent(current)
    if (!stat) {
      if (!options.createParent) {
        parentExists = false
        break
      }
      mkdirSync(current)
      stat = lstatSync(current)
    }
    assert(!stat.isSymbolicLink(), `${label} parent cannot be a symbolic link: ${current}`)
    assert(stat.isDirectory(), `${label} parent must be a directory: ${current}`)
    assert(isContainedPath(location.repository, realpathSync(current)), `${label} parent cannot escape the repository`)
  }
  const targetStat = parentExists ? lstatIfPresent(location.absolutePath) : null
  if (options.requireTarget) assert(targetStat, `Missing generated file: ${path}`)
  if (targetStat) {
    assert(!targetStat.isSymbolicLink(), `${label} cannot be a symbolic link`)
    assert(targetStat.isFile(), `${label} must be a regular file`)
    assert(isContainedPath(location.repository, realpathSync(location.absolutePath)), `${label} cannot escape the repository`)
  }
  return location.absolutePath
}

function readJson<T>(root: string, path: string): T {
  return JSON.parse(readRepositoryText(root, path)) as T
}

function runGit(root: string, args: string[], allowFailure = false): string {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || '').trim()
    throw new Error(`git ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`)
  }
  return result.status === 0 ? result.stdout.trim() : ''
}

function verifyBaseCommit(root: string, baseCommit: string) {
  assert(/^[a-f0-9]{40}$/.test(baseCommit), 'baseCommit must be a full 40-character commit SHA')
  runGit(root, ['cat-file', '-e', `${baseCommit}^{commit}`])
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', baseCommit, 'HEAD'], { cwd: root })
  assert(ancestor.status === 0, `${baseCommit} is not an ancestor of HEAD`)
}

function validateJsonSchema(root: string, schemaPath: string, valuePath: string, value: unknown) {
  const schema = readJson<object>(root, schemaPath)
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  assert(validate(value), `${valuePath} schema validation failed: ${JSON.stringify(validate.errors)}`)
}

function validateWithSchema(root: string, value: unknown) {
  validateJsonSchema(root, INTAKE_SCHEMA_PATH, INTAKE_PATH, value)
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function assertUnique(values: string[], label: string) {
  assert(new Set(values).size === values.length, `${label} must be unique`)
}

function sameSet(left: string[], right: string[]): boolean {
  return canonicalJson(uniqueSorted(left)) === canonicalJson(uniqueSorted(right))
}

function sameFacets(left: Facets, right: Facets): boolean {
  return canonicalJson(normalizeFacets(left)) === canonicalJson(normalizeFacets(right))
}

function hashRecord<T extends Record<string, unknown>>(record: T): T & { contentHash: string } {
  return { ...record, contentHash: sha256(canonicalJson(record)) }
}

function observedDate(intake: Field08EvidenceIntake): string {
  return intake.observedAt.slice(0, 10)
}

function field08CellId(geographyId: string): string {
  const profile = geographyId === SAPMI_GEOGRAPHY ? 'legacy_field_sapmi_overlap' : 'legacy_field_political'
  return `cov.v1.profile=${profile}.geography=${geographyId.replace('geo.', '')}.legacy_fields=f08`
}

function normalizeFacets(facets: Facets): Facets {
  return Object.fromEntries(FACET_ARRAY_KEYS.map((key) => [key, uniqueSorted(facets[key])])) as Facets
}

function mergeFacets(facets: Facets[]): Facets {
  return Object.fromEntries(FACET_ARRAY_KEYS.map((key) => [key, uniqueSorted(facets.flatMap((item) => item[key]))])) as Facets
}

function lensAssessments(note: string) {
  return Object.fromEntries([
    'lens.system_boundary',
    'lens.geography_scale',
    'lens.time_change',
    'lens.value_chain_stage',
    'lens.actor_position_power',
    'lens.commodity_material',
    'lens.flow_circularity_cascade',
    'lens.evidence_uncertainty',
    'lens.distribution_equity_rights',
    'lens.resilience_shock',
    'lens.outcome_tradeoffs',
  ].map((id) => [id, { state: 'unknown', note }]))
}

function internalEvidence(overrides: Record<string, unknown> = {}) {
  return {
    evidenceBasis: 'not_assessed',
    verificationStatus: 'needs_review',
    citationReadiness: 'internal_context',
    appraisalState: 'draft',
    sourceRefs: [],
    uncertainty: { level: 'unknown', reasons: ['Gate 2C human review is pending.'] },
    ...overrides,
  }
}

function baseObject(
  intake: Field08EvidenceIntake,
  ontology: Ontology,
  value: {
    id: string
    objectTypeId: string
    title: string
    summary: string
    facets: Facets
    timeScope?: TimeScope
    systemBoundary: SystemBoundary
    evidence?: Record<string, unknown>
    operationalRoute?: string
    relations?: unknown[]
    payloadKind?: string
  },
): KnowledgeObject {
  const date = observedDate(intake)
  return {
    id: value.id,
    schemaVersion: '1.0.0',
    ontologyVersion: ontology.ontologyVersion,
    objectTypeId: value.objectTypeId,
    title: value.title,
    summary: value.summary,
    facets: normalizeFacets(value.facets),
    timeScope: value.timeScope ?? { kind: 'snapshot', asOf: date },
    systemBoundary: value.systemBoundary,
    evidence: value.evidence ?? internalEvidence(),
    operationalRoute: value.operationalRoute ?? 'human_gated',
    lensAssessments: lensAssessments('Gate 2C intake is machine checked but has not passed human review.'),
    legacyFieldIds: [FIELD_ID],
    relations: value.relations ?? [],
    payloadKind: value.payloadKind ?? 'none',
    createdAt: date,
    updatedAt: date,
  }
}

function field08FacetIds(ontology: Ontology): Set<string> {
  const field = ontology.dimensions.legacyFields.find((candidate) => candidate.id === FIELD_ID)
  assert(field, `Missing ${FIELD_ID} from ontology`)
  const targets = field.legacyMappings?.facetTargets
  assert(targets, `${FIELD_ID} has no facet targets`)
  const ids = new Set(Object.values(targets).flat())
  assert(ids.size === 34, `Expected 34 Field 08 facet targets, found ${ids.size}`)
  return ids
}

function safeRepositoryPath(root: string, path: string, label: string): string {
  return repositoryLocation(root, path, label).relativePath
}

function collectApiReceiptResponsePaths(root: string, intake: Field08EvidenceIntake): string[] {
  const apiAcquisitions = intake.sourceAcquisitions.filter((item) => item.acquisitionMethod === 'api_query')
  const receiptPaths = uniqueSorted(apiAcquisitions.map((item) => {
    assert(item.requestReceiptPath !== null, `${item.acquisitionId} API query requires a request receipt`)
    return safeRepositoryPath(root, item.requestReceiptPath, `${item.acquisitionId}.requestReceiptPath`)
  }))
  const requestsByReceipt = new Map<string, ApiRequestReceipt['requests']>()
  const globalRequestIds: string[] = []
  const responsePaths: string[] = []
  for (const receiptPath of receiptPaths) {
    assert(repositoryEntryExists(root, receiptPath, `API request receipt ${receiptPath}`), `API request receipt is missing: ${receiptPath}`)
    const receipt = readJson<ApiRequestReceipt>(root, receiptPath)
    assert(receipt.documentType === 'field08_gate2c_api_request_receipts', `${receiptPath} has the wrong documentType`)
    assert(receipt.schemaVersion === '1.0.0', `${receiptPath} has the wrong schemaVersion`)
    assert(Array.isArray(receipt.requests) && receipt.requests.length > 0, `${receiptPath} has no requests`)
    assertUnique(receipt.requests.map((request) => request.requestId), `${receiptPath} request IDs`)
    requestsByReceipt.set(receiptPath, receipt.requests)
    for (const request of receipt.requests) {
      globalRequestIds.push(request.requestId)
      assert(/^field08\.request\.[a-z0-9._-]+$/.test(request.requestId), `${request.requestId} has an invalid request ID`)
      assert(request.method === 'GET' || request.method === 'POST', `${request.requestId} method must be GET or POST`)
      const parsed = new URL(request.url)
      assert(parsed.protocol === 'https:' || parsed.protocol === 'http:', `${request.requestId} URL must use HTTP(S)`)
      assert(request.headers && typeof request.headers === 'object' && !Array.isArray(request.headers), `${request.requestId} headers must be an object`)
      assert(Object.values(request.headers).every((value) => typeof value === 'string'), `${request.requestId} headers must contain strings`)
      if (request.method === 'GET') assert(request.body === null, `${request.requestId} GET body must be null`)
      if (request.method === 'POST') assert(request.body !== null && typeof request.body === 'object', `${request.requestId} POST body must be a JSON object or array`)
      const responsePath = safeRepositoryPath(root, request.responsePath, `${request.requestId}.responsePath`)
      regularRepositoryFile(root, responsePath, `${request.requestId} response`)
      responsePaths.push(responsePath)
    }
  }
  assertUnique(globalRequestIds, 'API request IDs across receipts')
  for (const acquisition of apiAcquisitions) {
    const requests = requestsByReceipt.get(acquisition.requestReceiptPath as string) ?? []
    const matching = requests.filter((request) => request.responsePath === acquisition.capturePath && request.url === acquisition.sourceUrl)
    assert(matching.length === 1, `${acquisition.acquisitionId} capturePath/sourceUrl does not match exactly one API request receipt`)
  }
  return uniqueSorted(responsePaths)
}

function validateSourceMap(intake: Field08EvidenceIntake, sourceMap: Field08SourceMap) {
  assert(sourceMap.mapId === intake.sourceMapId, `Gate 2B source map ${sourceMap.mapId} does not match ${intake.sourceMapId}`)
  assertUnique(sourceMap.sources.map((source) => source.sourceCandidateId), 'Gate 2B source-candidate IDs')
  const candidates = new Map(sourceMap.sources.map((source) => [source.sourceCandidateId, source]))
  const boundGeographies = new Map<string, Set<string>>()
  for (const binding of sourceMap.bindings) {
    assert(candidates.has(binding.sourceCandidateId), `Gate 2B binding references unknown candidate ${binding.sourceCandidateId}`)
    const geographies = boundGeographies.get(binding.sourceCandidateId) ?? new Set<string>()
    geographies.add(binding.geographyId)
    boundGeographies.set(binding.sourceCandidateId, geographies)
  }
  for (const acquisition of intake.sourceAcquisitions) {
    const candidate = candidates.get(acquisition.sourceCandidateId)
    assert(candidate, `${acquisition.acquisitionId} references unknown Gate 2B candidate ${acquisition.sourceCandidateId}`)
    assert(acquisition.title === candidate.title, `${acquisition.acquisitionId} title does not match ${acquisition.sourceCandidateId}`)
    assert(acquisition.publisher === candidate.publisher, `${acquisition.acquisitionId} publisher does not match ${acquisition.sourceCandidateId}`)
    const allowedGeographies = boundGeographies.get(acquisition.sourceCandidateId) ?? new Set<string>()
    assert(acquisition.geographyIds.every((id) => allowedGeographies.has(id)), `${acquisition.acquisitionId} geography is outside its Gate 2B bindings`)
    const expectedSourceClass = candidate.sourceType === 'official_dataset' || candidate.sourceType === 'official_statistics'
      ? 'dataset'
      : candidate.sourceType === 'government_report'
        ? 'primary'
        : null
    assert(expectedSourceClass !== null, `${acquisition.sourceCandidateId} has no Gate 2C sourceClass mapping for ${candidate.sourceType}`)
    assert(acquisition.sourceClass === expectedSourceClass, `${acquisition.acquisitionId} sourceClass does not match Gate 2B sourceType ${candidate.sourceType}`)
    for (const geographyId of acquisition.geographyIds) {
      const bindings = sourceMap.bindings.filter((binding) => binding.sourceCandidateId === acquisition.sourceCandidateId && binding.geographyId === geographyId)
      assert(bindings.length > 0, `${acquisition.acquisitionId} has no Gate 2B binding for ${geographyId}`)
      if (bindings.some((binding) => binding.boundaryFit === 'requires_reconciliation')) {
        assert(
          acquisition.boundaryState === 'unknown_finland_aland' || acquisition.boundaryState === 'finland_including_aland',
          `${acquisition.acquisitionId} requires reconciliation but uses ${acquisition.boundaryState}`,
        )
      } else {
        assert(
          acquisition.boundaryState === 'political_direct' || acquisition.boundaryState === 'aland_only',
          `${acquisition.acquisitionId} direct Gate 2B binding cannot use ${acquisition.boundaryState}`,
        )
      }
    }
  }
  for (const deferred of intake.deferredCandidates) {
    assert(candidates.has(deferred.sourceCandidateId), `${deferred.deferredCandidateId} references unknown Gate 2B candidate ${deferred.sourceCandidateId}`)
    const allowedGeographies = boundGeographies.get(deferred.sourceCandidateId) ?? new Set<string>()
    assert(deferred.geographyIds.every((id) => allowedGeographies.has(id)), `${deferred.deferredCandidateId} geography is outside its Gate 2B bindings`)
  }
  const accountedCandidateIds = uniqueSorted([
    ...intake.sourceAcquisitions.map((item) => item.sourceCandidateId),
    ...intake.deferredCandidates.map((item) => item.sourceCandidateId),
  ])
  assert(
    sameSet(accountedCandidateIds, [...candidates.keys()]),
    `Gate 2C acquired/deferred accounting must cover every Gate 2B source candidate; expected ${candidates.size}, found ${accountedCandidateIds.length}`,
  )
  for (const candidateId of candidates.keys()) {
    const acquiredGeographies = intake.sourceAcquisitions
      .filter((item) => item.sourceCandidateId === candidateId)
      .flatMap((item) => item.geographyIds)
    const deferredGeographies = intake.deferredCandidates.filter((item) => item.sourceCandidateId === candidateId).flatMap((item) => item.geographyIds)
    assert(
      sameSet([...acquiredGeographies, ...deferredGeographies], [...(boundGeographies.get(candidateId) ?? [])]),
      `${candidateId} acquired/deferred geography union must equal all Gate 2B bindings`,
    )
  }
}

function verifyCaptureBytes(
  root: string,
  path: string,
  expectedHash: string,
  expectedSize: number,
  label: string,
  required: boolean,
  fileMagic?: string,
): boolean {
  const present = repositoryEntryExists(root, path, label)
  assert(present || !required, `${label} is missing: ${path}`)
  if (!present) return false
  const bytes = readRepositoryBytes(root, path, label)
  assert(sha256(bytes) === expectedHash, `${label} SHA-256 mismatch`)
  assert(bytes.length === expectedSize, `${label} size mismatch`)
  if (fileMagic !== undefined) {
    assert(fileMagic.length > 0, `${label} fileMagic must be non-empty`)
    const actualMagic = bytes.subarray(0, Buffer.byteLength(fileMagic, 'latin1')).toString('latin1')
    assert(actualMagic === fileMagic, `${label} file magic mismatch`)
  }
  return true
}

function validateCapturePolicy(
  root: string,
  intake: Field08EvidenceIntake,
  manifest: ExternalCaptureManifest,
  allowMissingLocalExternalCaptures: boolean,
  baseCommit: string,
): Field08EvidenceArtifacts['externalCaptureVerification'] {
  assert(manifest.documentType === 'field08_gate2c_external_capture_manifest', `${EXTERNAL_CAPTURES_MANIFEST_PATH} has the wrong documentType`)
  assert(manifest.schemaVersion === '1.0.0', `${EXTERNAL_CAPTURES_MANIFEST_PATH} has the wrong schemaVersion`)
  assert(manifest.manifestId === 'external_captures.field08_gate2c.v1', `${EXTERNAL_CAPTURES_MANIFEST_PATH} has the wrong manifestId`)
  assert(manifest.status === 'local_only_human_reuse_review_pending', `${EXTERNAL_CAPTURES_MANIFEST_PATH} has the wrong status`)
  assert(Array.isArray(manifest.captures), `${EXTERNAL_CAPTURES_MANIFEST_PATH} captures must be an array`)
  assertUnique(manifest.captures.map((capture) => capture.captureId), 'External capture IDs')
  assertUnique(manifest.captures.map((capture) => capture.localPath), 'External capture local paths')

  const localAcquisitions = intake.sourceAcquisitions.filter((item) => item.captureStorage === 'local_external')
  const manifestByPath = new Map(manifest.captures.map((capture) => [capture.localPath, capture]))
  const verifiedPaths: string[] = []
  assert(
    sameSet([...manifestByPath.keys()], localAcquisitions.map((item) => item.capturePath)),
    'External capture manifest paths must exactly equal the unique local_external acquisition paths',
  )

  for (const acquisition of intake.sourceAcquisitions) {
    assert(acquisition.reuseReviewState === 'pending', `${acquisition.acquisitionId} reuse review must remain pending`)
    if (acquisition.captureStorage === 'git_tracked') {
      assert(acquisition.archiveDurability === 'git_pinned', `${acquisition.acquisitionId} git-tracked capture must be git_pinned`)
      assert(acquisition.inspectionNotePath === null, `${acquisition.acquisitionId} git-tracked capture cannot substitute an inspection note`)
      verifyCaptureBytes(
        root,
        acquisition.capturePath,
        acquisition.captureSha256,
        acquisition.captureSizeBytes,
        `${acquisition.acquisitionId} capture`,
        true,
      )
      const pinned = spawnSync('git', ['cat-file', '-e', `${baseCommit}:${acquisition.capturePath}`], { cwd: root })
      assert(pinned.status === 0, `${acquisition.acquisitionId} git-tracked capture is absent from source commit ${baseCommit}`)
      continue
    }
    assert(acquisition.archiveDurability === 'local_only_at_risk', `${acquisition.acquisitionId} local-external capture must remain local_only_at_risk`)
    assert(acquisition.inspectionNotePath !== null, `${acquisition.acquisitionId} local-external capture requires an inspection note`)
    assert(acquisition.inspectionNotePath !== acquisition.capturePath, `${acquisition.acquisitionId} inspection note cannot be the external capture`)
    assert(manifestByPath.has(acquisition.capturePath), `${acquisition.acquisitionId} has no external capture manifest artifact`)
    const trackedInIndex = spawnSync('git', ['ls-files', '--error-unmatch', '--', acquisition.capturePath], { cwd: root })
    assert(trackedInIndex.status !== 0, `${acquisition.acquisitionId} local-external capture must not be tracked in the current Git index`)
    const ignored = spawnSync('git', ['check-ignore', '-v', '--', acquisition.capturePath], { cwd: root, encoding: 'utf8' })
    assert(ignored.status === 0, `${acquisition.acquisitionId} local-external capture must match a Git ignore rule`)
    assert(
      ignored.stdout.startsWith('.gitignore:'),
      `${acquisition.acquisitionId} local-external capture must match the pinned root .gitignore`,
    )
    const improperlyPinned = spawnSync('git', ['cat-file', '-e', `${baseCommit}:${acquisition.capturePath}`], { cwd: root })
    assert(improperlyPinned.status !== 0, `${acquisition.acquisitionId} local-external capture must be absent from source commit ${baseCommit}`)
  }

  for (const capture of manifest.captures) {
    assert(/^capture\.field08\.[a-z0-9][a-z0-9._-]*$/.test(capture.captureId), `${capture.captureId} has an invalid capture ID`)
    assert(capture.storageClass === 'local_external', `${capture.captureId} storageClass must be local_external`)
    assert(capture.archiveDurability === 'local_only_at_risk', `${capture.captureId} archive durability must remain local_only_at_risk`)
    assert(capture.redistributionStatus === 'review_pending', `${capture.captureId} redistribution review must remain pending`)
    assert(capture.license === null && capture.licenseUrl === null, `${capture.captureId} cannot assert an unreviewed license`)
    assert(capture.recoveryLocator === capture.sourceUrl, `${capture.captureId} recovery locator must retain the source URL`)
    assert(capture.inspectionNote && typeof capture.inspectionNote === 'object', `${capture.captureId} requires inspection-note metadata`)
    assert(capture.inspectionNote.sourcePdfSha256 === capture.sha256, `${capture.captureId} inspection note must bind the exact PDF hash`)
    assert(capture.inspectionNote.containsFullText === false, `${capture.captureId} inspection note cannot contain full text`)
    assert(capture.inspectionNote.containsVerbatimSourceText === false, `${capture.captureId} inspection note cannot contain verbatim source text`)
    assert(capture.inspectionNote.authorship === 'project_authored', `${capture.captureId} inspection note must be project-authored`)
    assert(capture.inspectionNote.scope === 'bounded_facts_and_locator_metadata', `${capture.captureId} inspection note has an invalid scope`)
    assert(capture.inspectionNote.rightsBoundary === 'does_not_grant_source_redistribution_rights', `${capture.captureId} inspection note cannot grant source rights`)

    const matching = localAcquisitions.filter((item) => item.capturePath === capture.localPath)
    assert(matching.length > 0, `${capture.captureId} is not referenced by a local_external acquisition`)
    for (const acquisition of matching) {
      assert(acquisition.sourceCandidateId === capture.sourceCandidateId, `${acquisition.acquisitionId} source candidate differs from ${capture.captureId}`)
      assert(acquisition.sourceUrl === capture.sourceUrl, `${acquisition.acquisitionId} source URL differs from ${capture.captureId}`)
      assert(acquisition.accessedAt === capture.accessedAt, `${acquisition.acquisitionId} access date differs from ${capture.captureId}`)
      assert(acquisition.capturedAt === capture.capturedAt, `${acquisition.acquisitionId} capture time differs from ${capture.captureId}`)
      assert(acquisition.captureSha256 === capture.sha256, `${acquisition.acquisitionId} capture hash differs from ${capture.captureId}`)
      assert(acquisition.captureSizeBytes === capture.sizeBytes, `${acquisition.acquisitionId} capture size differs from ${capture.captureId}`)
      assert(acquisition.mediaType === capture.mediaType, `${acquisition.acquisitionId} media type differs from ${capture.captureId}`)
      assert(acquisition.inspectionNotePath === capture.inspectionNote.path, `${acquisition.acquisitionId} inspection note differs from ${capture.captureId}`)
    }
    const inspectionBytes = readRepositoryBytes(root, capture.inspectionNote.path, `${capture.captureId} inspection note`)
    assert(sha256(inspectionBytes) === capture.inspectionNote.sha256, `${capture.captureId} inspection-note SHA-256 mismatch`)
    assert(inspectionBytes.length === capture.inspectionNote.sizeBytes, `${capture.captureId} inspection-note size mismatch`)
    const verified = verifyCaptureBytes(
      root,
      capture.localPath,
      capture.sha256,
      capture.sizeBytes,
      `${capture.captureId} local-external capture`,
      !allowMissingLocalExternalCaptures,
      capture.fileMagic,
    )
    if (verified) verifiedPaths.push(capture.localPath)
  }
  const requiredPaths = uniqueSorted(manifest.captures.map((capture) => capture.localPath))
  const uniqueVerifiedPaths = uniqueSorted(verifiedPaths)
  return {
    requiredPaths,
    verifiedPaths: uniqueVerifiedPaths,
    allRequiredPresentAndVerified: sameSet(requiredPaths, uniqueVerifiedPaths),
  }
}

function validateFacets(facets: Facets, label: string, fieldFacetIds: Set<string>, ontology: Ontology) {
  for (const key of FACET_ARRAY_KEYS) assertUnique(facets[key], `${label}.${key}`)
  assert(facets.geographyIds.length > 0, `${label} requires a political geography`)
  assert(!facets.geographyIds.includes(SAPMI_GEOGRAPHY), `${label} cannot encode Sápmi subject evidence`)
  assert(facets.geographyIds.every((id) => (POLITICAL_GEOGRAPHIES as readonly string[]).includes(id)), `${label} has a non-political geography`)
  const controlledDimensions: Record<Exclude<typeof FACET_ARRAY_KEYS[number], 'geographyIds'>, string> = {
    stageIds: 'valueChainStages',
    domainIds: 'domains',
    outcomeIds: 'outcomes',
    actorClassIds: 'actorClasses',
    flowClassIds: 'flowClasses',
    commodityGroupIds: 'commodityGroups',
    materialGroupIds: 'materialGroups',
    circularStrategyIds: 'circularStrategies',
    ownershipFormIds: 'ownershipForms',
  }
  for (const [key, dimension] of Object.entries(controlledDimensions) as Array<[keyof typeof controlledDimensions, string]>) {
    const allowed = new Set((ontology.dimensions[dimension] ?? []).map((item) => item.id))
    assert(facets[key].every((id) => allowed.has(id)), `${label}.${key} contains an ID outside ontology dimension ${dimension}`)
  }
  const mapped = [
    ...facets.stageIds,
    ...facets.domainIds,
    ...facets.outcomeIds,
    ...facets.flowClassIds,
    ...facets.materialGroupIds,
    ...facets.circularStrategyIds,
  ]
  assert(mapped.some((id) => fieldFacetIds.has(id)), `${label} must intersect at least one of the 34 Field 08 mapped facets`)
}

function validateBoundary(
  label: string,
  geographyIds: string[],
  boundaryState: BoundaryState,
  nonAdditiveWithGeographyIds: string[],
  aggregationAllowed?: boolean,
) {
  assertUnique(nonAdditiveWithGeographyIds, `${label}.nonAdditiveWithGeographyIds`)
  if (boundaryState === 'finland_including_aland') {
    assert(sameSet(geographyIds, ['geo.fi']), `${label} Finland-including-Åland record must bind geo.fi only`)
    assert(nonAdditiveWithGeographyIds.includes('geo.ax'), `${label} Finland-including-Åland record must be non-additive with geo.ax`)
  }
  if (boundaryState === 'aland_only') {
    assert(sameSet(geographyIds, ['geo.ax']), `${label} Åland-only record must bind geo.ax only`)
  }
  if (boundaryState === 'unknown_finland_aland') {
    assert(geographyIds.includes('geo.fi'), `${label} unknown Finland–Åland boundary must bind geo.fi`)
    assert(aggregationAllowed !== true, `${label} unknown Finland–Åland boundary cannot aggregate`)
  }
}

function boundaryReviewRequired(record: { boundaryState: BoundaryState; nonAdditiveWithGeographyIds: string[] }): boolean {
  return record.boundaryState === 'unknown_finland_aland'
    || record.boundaryState === 'finland_including_aland'
    || record.nonAdditiveWithGeographyIds.length > 0
}

function precisionStep(precision: Exclude<ReportedPrecision, null>, unit: string): number {
  if (precision === 'nearest_0_1_unit') return 0.1
  if (precision === 'nearest_1_unit') return 1
  if (precision === 'nearest_10_units') return 10
  if (precision === 'nearest_100_units') return 100
  if (precision === 'nearest_1000_units') return 1000
  const normalized = unit.toLowerCase().replaceAll('_', ' ')
  assert(normalized.includes('tonne'), 'nearest_100_tonnes requires a tonne-based unit')
  return normalized.includes('thousand') || normalized.includes('1 000') || normalized.includes('1000') ? 0.1 : 100
}

function validateComponentTotals(measurements: MeasurementCandidate[], citations: Map<string, SourceAcquisition>) {
  const byId = new Map(measurements.map((measurement) => [measurement.observationId, measurement]))
  for (const measurement of measurements) {
    if (measurement.componentObservationIds.length === 0) {
      assert(measurement.reportedPrecision === null, `${measurement.observationId} precision is only valid for a component total`)
      continue
    }
    assert(!measurement.componentObservationIds.includes(measurement.observationId), `${measurement.observationId} cannot contain itself`)
    const components = measurement.componentObservationIds.map((id) => {
      const component = byId.get(id)
      assert(component, `${measurement.observationId} references missing component ${id}`)
      assert(component.componentObservationIds.length === 0, `${measurement.observationId} cannot use a nested total ${id}`)
      assert(component.value !== null, `${measurement.observationId} component ${id} has no numeric value`)
      assert(component.indicatorId === measurement.indicatorId, `${measurement.observationId} component ${id} uses another indicator`)
      assert(sameSet(component.subjectIds, measurement.subjectIds), `${measurement.observationId} component ${id} uses another subject set`)
      assert(sameSet(component.facets.geographyIds, measurement.facets.geographyIds), `${measurement.observationId} component ${id} uses another geography`)
      assert(component.boundaryState === measurement.boundaryState, `${measurement.observationId} component ${id} uses another boundary state`)
      assert(sameSet(component.nonAdditiveWithGeographyIds, measurement.nonAdditiveWithGeographyIds), `${measurement.observationId} component ${id} has different non-additivity`)
      assert(canonicalJson(component.timeScope) === canonicalJson(measurement.timeScope), `${measurement.observationId} component ${id} uses another period`)
      const totalSources = uniqueSorted(measurement.citationIds.map((citationId) => citations.get(citationId)?.sourceId ?? ''))
      const componentSources = uniqueSorted(component.citationIds.map((citationId) => citations.get(citationId)?.sourceId ?? ''))
      assert(canonicalJson(componentSources) === canonicalJson(totalSources), `${measurement.observationId} component ${id} uses another source basis`)
      assert(component.unit === measurement.unit, `${measurement.observationId} component ${id} has a different unit`)
      return component
    })
    assert(measurement.nonAdditiveWithGeographyIds.length === 0, `${measurement.observationId} cannot total non-additive geography records`)
    assert(measurement.value !== null, `${measurement.observationId} total has no numeric value`)
    const sum = components.reduce((total, component) => total + (component.value as number), 0)
    if (measurement.reportedPrecision === null) {
      const tolerance = Math.max(1, Math.abs(sum), Math.abs(measurement.value)) * Number.EPSILON * 8
      assert(Math.abs(sum - measurement.value) <= tolerance, `${measurement.observationId} does not exactly equal its component sum`)
    } else {
      const step = precisionStep(measurement.reportedPrecision, measurement.unit)
      const rounded = Math.round(sum / step) * step
      const tolerance = Math.max(1, Math.abs(rounded)) * Number.EPSILON * 16
      assert(Math.abs(rounded - measurement.value) <= tolerance, `${measurement.observationId} is inconsistent with ${measurement.reportedPrecision} component rounding`)
    }
  }
}

function readBaselineGuard(root: string, inputSnapshots: ArtifactSnapshot[]): BaselineGuard {
  const events = readRepositoryText(root, HISTORICAL_ASSESSMENTS_PATH)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { cellId?: unknown; eventKind?: unknown; workflowStage?: unknown; readinessResult?: unknown; evidenceLinks?: unknown })
  assert(events.length === 117, `Expected 117 historical events, found ${events.length}`)
  const field08Events = events.filter((event) => typeof event.cellId === 'string' && event.cellId.endsWith('.legacy_fields=f08'))
  assert(field08Events.length === 9, `Expected nine Field 08 scope registrations, found ${field08Events.length}`)
  assert(field08Events.every((event) => event.eventKind === 'scope_registration'), 'Field 08 historical events must remain scope registrations')
  assert(field08Events.every((event) => event.workflowStage === 'unassessed'), 'Field 08 historical workflow stages must remain unassessed')
  assert(field08Events.every((event) => event.readinessResult === null), 'Field 08 historical readiness must remain null')
  assert(field08Events.every((event) => Array.isArray(event.evidenceLinks) && event.evidenceLinks.length === 0), 'Field 08 historical evidence links must remain empty')

  const ledger = readRepositoryText(root, COVERAGE_LEDGER_PATH)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { cell?: { cellId?: unknown }; latestAssessment?: { eventKind?: unknown; workflowStage?: unknown; readinessResult?: unknown; evidenceLinks?: unknown } })
  const field08Ledger = ledger.filter((record) => typeof record.cell?.cellId === 'string' && record.cell.cellId.endsWith('.legacy_fields=f08'))
  assert(field08Ledger.length === 9, `Expected nine Field 08 ledger cells, found ${field08Ledger.length}`)
  assert(field08Ledger.every((record) => record.latestAssessment?.eventKind === 'scope_registration'), 'Field 08 ledger projections must remain scope registrations')
  assert(field08Ledger.every((record) => record.latestAssessment?.workflowStage === 'unassessed'), 'Field 08 ledger projections must remain unassessed')
  assert(field08Ledger.every((record) => record.latestAssessment?.readinessResult === null), 'Field 08 ledger readiness must remain null')
  assert(field08Ledger.every((record) => Array.isArray(record.latestAssessment?.evidenceLinks) && record.latestAssessment.evidenceLinks.length === 0), 'Field 08 ledger evidence links must remain empty')

  const historicalAssessmentSnapshot = inputSnapshots.find((snapshot) => snapshot.path === HISTORICAL_ASSESSMENTS_PATH)
  const coverageLedgerSnapshot = inputSnapshots.find((snapshot) => snapshot.path === COVERAGE_LEDGER_PATH)
  assert(historicalAssessmentSnapshot, 'Historical assessment snapshot missing')
  assert(coverageLedgerSnapshot, 'Coverage ledger snapshot missing')
  return {
    historicalAssessmentPath: HISTORICAL_ASSESSMENTS_PATH,
    coverageLedgerPath: COVERAGE_LEDGER_PATH,
    historicalAssessmentSnapshot,
    coverageLedgerSnapshot,
    historicalEventCount: 117,
    field08CellCount: 9,
    field08ScopeRegistrationCount: 9,
    field08SubjectMatterAssessmentCount: 0,
    historicalAssessmentWriteCount: 0,
  }
}

function validateIntake(root: string, intake: Field08EvidenceIntake, ontology: Ontology) {
  const fieldFacetIds = field08FacetIds(ontology)
  assertUnique(intake.sourceAcquisitions.map((item) => item.acquisitionId), 'Acquisition IDs')
  assertUnique(intake.sourceAcquisitions.map((item) => item.citationId), 'Citation IDs')
  assertUnique(intake.subjectDefinitions.map((item) => item.subjectId), 'Subject IDs')
  assertUnique(intake.indicatorDefinitions.map((item) => item.indicatorId), 'Indicator IDs')
  assertUnique(intake.claimCandidates.map((item) => item.claimId), 'Claim IDs')
  assertUnique(intake.measurementCandidates.map((item) => item.observationId), 'Observation IDs')
  assertUnique(intake.contradictionSets.map((item) => item.contradictionSetId), 'Contradiction-set IDs')
  assertUnique(intake.deferredCandidates.map((item) => item.deferredCandidateId), 'Deferred-candidate IDs')
  assertUnique(intake.childDimensionRequirements.map((item) => item.requirementId), 'Child-dimension requirement IDs')
  assertUnique(intake.appraisalDrafts.map((item) => item.appraisalDraftId), 'Appraisal IDs')
  assertUnique(intake.reviewGates.map((item) => item.reviewGateId), 'Review-gate IDs')

  const sourceIds = new Set(intake.sourceAcquisitions.map((item) => item.sourceId))
  const citations = new Map(intake.sourceAcquisitions.map((item) => [item.citationId, item]))
  const subjects = new Map(intake.subjectDefinitions.map((item) => [item.subjectId, item]))
  const indicators = new Map(intake.indicatorDefinitions.map((item) => [item.indicatorId, item]))
  const claims = new Map(intake.claimCandidates.map((item) => [item.claimId, item]))
  const measurements = new Map(intake.measurementCandidates.map((item) => [item.observationId, item]))

  for (const acquisition of intake.sourceAcquisitions) {
    validateFacets(acquisition.facets, acquisition.acquisitionId, fieldFacetIds, ontology)
    assert(sameSet(acquisition.geographyIds, acquisition.facets.geographyIds), `${acquisition.acquisitionId} geographyIds and facets.geographyIds differ`)
    validateBoundary(acquisition.acquisitionId, acquisition.geographyIds, acquisition.boundaryState, acquisition.nonAdditiveWithGeographyIds)
    if (acquisition.acquisitionMethod === 'api_query') {
      assert(acquisition.requestReceiptPath !== null, `${acquisition.acquisitionId} API query requires a request receipt`)
      regularRepositoryFile(root, acquisition.requestReceiptPath, `${acquisition.acquisitionId} request receipt`)
    }
  }

  const acquisitionsBySource = new Map<string, SourceAcquisition[]>()
  for (const acquisition of intake.sourceAcquisitions) {
    acquisitionsBySource.set(acquisition.sourceId, [...(acquisitionsBySource.get(acquisition.sourceId) ?? []), acquisition])
  }
  for (const [sourceId, acquisitions] of acquisitionsBySource) {
    const first = acquisitions[0]
    for (const acquisition of acquisitions.slice(1)) {
      assert(acquisition.sourceCandidateId === first.sourceCandidateId, `${sourceId} uses multiple source-candidate identities`)
      assert(acquisition.title === first.title, `${sourceId} uses multiple titles`)
      assert(acquisition.publisher === first.publisher, `${sourceId} uses multiple publishers`)
      assert(acquisition.sourceClass === first.sourceClass, `${sourceId} uses multiple source classes`)
      assert(acquisition.sourceUrl === first.sourceUrl, `${sourceId} uses multiple source URLs`)
      assert(acquisition.capturePath === first.capturePath, `${sourceId} uses multiple capture paths`)
      assert(acquisition.captureSha256 === first.captureSha256, `${sourceId} uses multiple capture hashes`)
      assert(acquisition.captureStorage === first.captureStorage, `${sourceId} uses multiple capture storage classes`)
      assert(acquisition.archiveDurability === first.archiveDurability, `${sourceId} uses multiple archive durability states`)
      assert(acquisition.inspectionNotePath === first.inspectionNotePath, `${sourceId} uses multiple inspection notes`)
      assert(acquisition.reuseReviewState === first.reuseReviewState, `${sourceId} uses multiple reuse-review states`)
    }
  }

  for (const subject of intake.subjectDefinitions) {
    validateFacets(subject.facets, subject.subjectId, fieldFacetIds, ontology)
    const expectedPrefix = subject.objectTypeId.replace('knowledge_object.', 'fs:') + ':'
    assert(subject.subjectId.startsWith(expectedPrefix), `${subject.subjectId} does not match ${subject.objectTypeId}`)
  }
  for (const indicator of intake.indicatorDefinitions) {
    validateFacets(indicator.facets, indicator.indicatorId, fieldFacetIds, ontology)
    assert(indicator.subjectIds.every((id) => subjects.has(id)), `${indicator.indicatorId} references a missing subject`)
  }
  for (const claim of intake.claimCandidates) {
    validateFacets(claim.facets, claim.claimId, fieldFacetIds, ontology)
    assert(claim.citationIds.every((id) => citations.has(id)), `${claim.claimId} references a missing citation`)
    assert(!claim.aggregationAllowed, `${claim.claimId} cannot aggregate while human review is pending`)
    assert(sameSet(claim.coverageCellIds, claim.facets.geographyIds.map(field08CellId)), `${claim.claimId} coverage cells do not exactly match its political geographies`)
    validateBoundary(claim.claimId, claim.facets.geographyIds, claim.boundaryState, claim.nonAdditiveWithGeographyIds, claim.aggregationAllowed)
  }
  for (const measurement of intake.measurementCandidates) {
    validateFacets(measurement.facets, measurement.observationId, fieldFacetIds, ontology)
    const claim = claims.get(measurement.claimId)
    const indicator = indicators.get(measurement.indicatorId)
    assert(claim, `${measurement.observationId} references a missing claim`)
    assert(claim.claimKind === 'quantitative_measurement_claim', `${measurement.observationId} cannot attach to qualitative claim ${claim.claimId}`)
    assert(indicator, `${measurement.observationId} references a missing indicator`)
    assert(measurement.subjectIds.every((id) => subjects.has(id)), `${measurement.observationId} references a missing subject`)
    assert(measurement.citationIds.every((id) => citations.has(id)), `${measurement.observationId} references a missing citation`)
    assert(!measurement.aggregationAllowed, `${measurement.observationId} cannot aggregate while human review is pending`)
    assert(measurement.boundaryState !== 'unknown_finland_aland', `${measurement.observationId} cannot materialize an unresolved Finland–Åland measurement`)
    assert(sameFacets(measurement.facets, claim.facets), `${measurement.observationId} and ${claim.claimId} facets differ`)
    assert(canonicalJson(measurement.timeScope) === canonicalJson(claim.timeScope), `${measurement.observationId} and ${claim.claimId} time scopes differ`)
    assert(canonicalJson(measurement.systemBoundary) === canonicalJson(claim.systemBoundary), `${measurement.observationId} and ${claim.claimId} system boundaries differ`)
    assert(measurement.boundaryState === claim.boundaryState, `${measurement.observationId} and ${claim.claimId} boundary states differ`)
    assert(sameSet(measurement.nonAdditiveWithGeographyIds, claim.nonAdditiveWithGeographyIds), `${measurement.observationId} and ${claim.claimId} non-additivity differs`)
    assert(measurement.citationIds.every((id) => claim.citationIds.includes(id)), `${measurement.observationId} citation is outside ${claim.claimId}`)
    for (const citationId of measurement.citationIds) {
      const acquisition = citations.get(citationId)!
      assert(sameSet(acquisition.geographyIds, measurement.facets.geographyIds), `${measurement.observationId} citation ${citationId} has an incompatible geography`)
      assert(acquisition.boundaryState === measurement.boundaryState, `${measurement.observationId} citation ${citationId} has an incompatible boundary state`)
    }
    assert(sameSet(measurement.subjectIds, indicator.subjectIds), `${measurement.observationId} and ${indicator.indicatorId} subjects differ`)
    assert(measurement.unit === indicator.unit, `${measurement.observationId} and ${indicator.indicatorId} units differ`)
    if (measurement.calculationKind === 'derived_from_source_rows') {
      assert(measurement.sourceRowProvenance.length > 0, `${measurement.observationId} derived value requires source-row provenance`)
      const perHectareUnit = /\/\s*ha\b|per[_\s-]*hectare|ha[_\s]*[-^]?1\b/i.test(measurement.unit)
      assert(!perHectareUnit, `${measurement.observationId} cannot perform a per-hectare derived subtraction`)
    } else {
      assert(measurement.sourceRowProvenance.length === 0, `${measurement.observationId} source-row provenance requires derived_from_source_rows`)
    }
    validateBoundary(measurement.observationId, measurement.facets.geographyIds, measurement.boundaryState, measurement.nonAdditiveWithGeographyIds, measurement.aggregationAllowed)
  }
  for (const claim of intake.claimCandidates) {
    const claimMeasurements = intake.measurementCandidates.filter((item) => item.claimId === claim.claimId)
    if (claim.claimKind === 'quantitative_measurement_claim') {
      assert(claimMeasurements.length > 0, `${claim.claimId} quantitative claim has no typed measurement`)
      assert(sameSet(claim.citationIds, claimMeasurements.flatMap((item) => item.citationIds)), `${claim.claimId} citation set must equal the union of its measurements`)
    } else {
      assert(claimMeasurements.length === 0, `${claim.claimId} qualitative claim cannot own a typed measurement`)
    }
  }
  validateComponentTotals(intake.measurementCandidates, citations)

  const openClaimIds = new Set<string>()
  const openObservationIds = new Set<string>()
  for (const contradiction of intake.contradictionSets) {
    assert(contradiction.status === 'open', `${contradiction.contradictionSetId} must remain open while human review is pending`)
    assert(contradiction.resolution === null, `${contradiction.contradictionSetId} cannot record a resolution while human review is pending`)
    assert(!contradiction.aggregationAllowed, `${contradiction.contradictionSetId} open contradiction cannot aggregate`)
    assert(contradiction.description.trim().length > 0, `${contradiction.contradictionSetId} requires a non-empty comparison description`)
    assert(contradiction.claimIds.every((id) => claims.has(id)), `${contradiction.contradictionSetId} references a missing claim`)
    assert(contradiction.observationIds.every((id) => measurements.has(id)), `${contradiction.contradictionSetId} references a missing observation`)
    assert(contradiction.citationIds.every((id) => citations.has(id)), `${contradiction.contradictionSetId} references a missing citation`)
    const observationIdSet = new Set(contradiction.observationIds)
    const contradictionCitationIds = new Set(contradiction.citationIds)
    const memberObservations = contradiction.observationIds.map((observationId) => measurements.get(observationId)!)
    for (const observation of memberObservations) {
      assert(
        observation.citationIds.some((citationId) => contradictionCitationIds.has(citationId)),
        `${contradiction.contradictionSetId} member ${observation.observationId} has no citation represented in the contradiction set`,
      )
    }
    for (const citationId of contradiction.citationIds) {
      assert(
        memberObservations.some((observation) => observation.citationIds.includes(citationId)),
        `${contradiction.contradictionSetId} citation ${citationId} is not attached to a member observation`,
      )
    }
    const pairKeys: string[] = []
    const pairedObservationIds = new Set<string>()
    for (const pair of contradiction.observationPairs) {
      assert(observationIdSet.has(pair.leftObservationId), `${contradiction.contradictionSetId} pair left member is outside observationIds`)
      assert(observationIdSet.has(pair.rightObservationId), `${contradiction.contradictionSetId} pair right member is outside observationIds`)
      assert(pair.leftObservationId !== pair.rightObservationId, `${contradiction.contradictionSetId} pair members must be distinct`)
      assert(pair.leftObservationId.localeCompare(pair.rightObservationId) < 0, `${contradiction.contradictionSetId} pair must use canonical lexical left/right order`)
      const left = measurements.get(pair.leftObservationId)!
      const right = measurements.get(pair.rightObservationId)!
      assert(left.indicatorId === right.indicatorId, `${contradiction.contradictionSetId} pair must use the same indicator`)
      assert(left.unit === right.unit, `${contradiction.contradictionSetId} pair must use the same unit`)
      assert(sameSet(left.subjectIds, right.subjectIds), `${contradiction.contradictionSetId} pair must use the same subject set`)
      assert(sameFacets(left.facets, right.facets), `${contradiction.contradictionSetId} pair must use the same exact facets`)
      assert(canonicalJson(left.timeScope) === canonicalJson(right.timeScope), `${contradiction.contradictionSetId} pair must use the same time scope`)
      assert(left.boundaryState === right.boundaryState, `${contradiction.contradictionSetId} pair must use the same boundary state`)
      assert(
        sameSet(left.nonAdditiveWithGeographyIds, right.nonAdditiveWithGeographyIds),
        `${contradiction.contradictionSetId} pair must use the same non-additivity declaration`,
      )
      for (const side of [left, right]) {
        const hasValueBearingSetCitation = side.citationIds.some((citationId) => {
          if (!contradictionCitationIds.has(citationId)) return false
          const role = citations.get(citationId)?.evidenceRole
          return role === 'numerator' || role === 'counterevidence'
        })
        assert(
          hasValueBearingSetCitation,
          `${contradiction.contradictionSetId} pair member ${side.observationId} requires a numerator or counterevidence citation represented in the contradiction set`,
        )
      }
      pairKeys.push(`${pair.leftObservationId}\u0000${pair.rightObservationId}`)
      pairedObservationIds.add(pair.leftObservationId)
      pairedObservationIds.add(pair.rightObservationId)
    }
    assertUnique(pairKeys, `${contradiction.contradictionSetId} observation pairs`)
    assert(sameSet([...pairedObservationIds], contradiction.observationIds), `${contradiction.contradictionSetId} every observation must participate in a declared pair`)
    const memberClaimIds = contradiction.observationIds.map((observationId) => measurements.get(observationId)!.claimId)
    assert(sameSet(contradiction.claimIds, memberClaimIds), `${contradiction.contradictionSetId} claimIds must equal the union of member observation claims`)
    contradiction.claimIds.forEach((id) => openClaimIds.add(id))
    contradiction.observationIds.forEach((id) => openObservationIds.add(id))
  }
  for (const id of openClaimIds) assert(!claims.get(id)!.aggregationAllowed, `${id} has an open contradiction and cannot aggregate`)
  for (const id of openObservationIds) assert(!measurements.get(id)!.aggregationAllowed, `${id} has an open contradiction and cannot aggregate`)

  const appraisedSources = intake.appraisalDrafts.map((item) => item.targetSourceId)
  assertUnique(appraisedSources, 'Appraisal target source IDs')
  assert(sameSet(appraisedSources, [...sourceIds]), 'Every unique acquired source requires exactly one pending appraisal draft')
  const knownGateTargets = new Set([
    ...intake.sourceAcquisitions.map((item) => item.acquisitionId),
    ...sourceIds,
    ...citations.keys(),
    ...subjects.keys(),
    ...indicators.keys(),
    ...claims.keys(),
    ...measurements.keys(),
    ...intake.contradictionSets.map((item) => item.contradictionSetId),
    ...intake.appraisalDrafts.map((item) => item.appraisalDraftId),
    ...intake.childDimensionRequirements.map((item) => item.requirementId),
  ])
  for (const gate of intake.reviewGates) assert(gate.targetIds.every((id) => knownGateTargets.has(id)), `${gate.reviewGateId} references an unknown target`)
  const targetsFor = (gateType: ReviewGate['gateType']) => new Set(intake.reviewGates.filter((gate) => gate.gateType === gateType).flatMap((gate) => gate.targetIds))
  const ordinaryTargets = targetsFor('ordinary_human_review')
  for (const id of [
    ...intake.sourceAcquisitions.map((item) => item.acquisitionId),
    ...sourceIds,
    ...claims.keys(),
    ...measurements.keys(),
  ]) assert(ordinaryTargets.has(id), `${id} has no ordinary_human_review gate`)
  const methodTargets = targetsFor('method_appraisal')
  for (const id of [...sourceIds, ...intake.appraisalDrafts.map((item) => item.appraisalDraftId)]) assert(methodTargets.has(id), `${id} has no method_appraisal gate`)
  const contradictionTargets = targetsFor('contradiction_resolution')
  for (const contradiction of intake.contradictionSets.filter((item) => item.status === 'open')) assert(contradictionTargets.has(contradiction.contradictionSetId), `${contradiction.contradictionSetId} has no contradiction_resolution gate`)
  const boundaryTargets = targetsFor('boundary_reconciliation')
  for (const acquisition of intake.sourceAcquisitions.filter(boundaryReviewRequired)) assert(boundaryTargets.has(acquisition.acquisitionId), `${acquisition.acquisitionId} has no boundary_reconciliation gate`)
  for (const claim of intake.claimCandidates.filter(boundaryReviewRequired)) assert(boundaryTargets.has(claim.claimId), `${claim.claimId} has no boundary_reconciliation gate`)
  for (const measurement of intake.measurementCandidates.filter(boundaryReviewRequired)) assert(boundaryTargets.has(measurement.observationId), `${measurement.observationId} has no boundary_reconciliation gate`)
  for (const requirement of intake.childDimensionRequirements) {
    assert(knownGateTargets.has(requirement.targetId), `${requirement.requirementId} references an unknown target`)
    const mappedDimension: Partial<Record<ChildDimensionRequirement['dimensionId'], string>> = {
      value_chain_stage: 'valueChainStages',
      domain: 'domains',
      outcome: 'outcomes',
      flow_class: 'flowClasses',
      material_group: 'materialGroups',
      circular_strategy: 'circularStrategies',
    }
    const ontologyDimension = mappedDimension[requirement.dimensionId]
    let allowed: Set<string> | null = ontologyDimension
      ? new Set((ontology.dimensions[ontologyDimension] ?? []).map((item) => item.id).filter((id) => fieldFacetIds.has(id)))
      : fieldFacetIds
    if (requirement.dimensionId === 'commodity_group') allowed = new Set((ontology.dimensions.commodityGroups ?? []).map((item) => item.id))
    if (requirement.dimensionId === 'destination') allowed = new Set([
      ...(ontology.dimensions.valueChainStages ?? []).map((item) => item.id),
      ...(ontology.dimensions.circularStrategies ?? []).map((item) => item.id),
      ...(ontology.dimensions.tradeDirections ?? []).map((item) => item.id),
    ])
    if (requirement.dimensionId === 'method') allowed = null
    if (allowed) assert(requirement.requiredValueIds.every((id) => allowed.has(id)), `${requirement.requirementId} has a value outside ${requirement.dimensionId}`)
    else assert(requirement.requiredValueIds.every((id) => /^method_requirement\.[a-z0-9][a-z0-9._-]*$/.test(id)), `${requirement.requirementId} has an invalid method requirement ID`)
  }
}

function sourceRef(citationId: string, citationById: Map<string, SourceAcquisition>) {
  const acquisition = citationById.get(citationId)
  assert(acquisition, `Missing acquisition for ${citationId}`)
  return {
    sourceId: acquisition.sourceId,
    sourceClass: acquisition.sourceClass,
    citationText: acquisition.citationText,
    url: acquisition.sourceUrl,
    localPath: acquisition.capturePath,
    locator: acquisition.locator,
    accessedAt: acquisition.accessedAt,
    evidenceRole: acquisition.evidenceRole,
    supportsOrChallenges: 'supports',
    verificationStatus: 'needs_review',
    fileHash: acquisition.captureSha256,
    captureStorage: acquisition.captureStorage,
    archiveDurability: acquisition.archiveDurability,
    inspectionNotePath: acquisition.inspectionNotePath,
    reuseReviewState: acquisition.reuseReviewState,
  }
}

function evidenceBasis(realizationState: RealizationState): string {
  if (realizationState === 'realized_measured') return 'observed'
  if (realizationState === 'realized_estimated' || realizationState === 'potential_modelled') return 'estimated'
  return 'not_assessed'
}

function buildKnowledgeObjects(intake: Field08EvidenceIntake, ontology: Ontology): KnowledgeObject[] {
  const citationById = new Map(intake.sourceAcquisitions.map((item) => [item.citationId, item]))
  const acquisitionsBySource = new Map<string, SourceAcquisition[]>()
  for (const acquisition of intake.sourceAcquisitions) {
    acquisitionsBySource.set(acquisition.sourceId, [...(acquisitionsBySource.get(acquisition.sourceId) ?? []), acquisition])
  }
  const openClaimIds = new Set(intake.contradictionSets.filter((item) => item.status === 'open').flatMap((item) => item.claimIds))
  const openObservationIds = new Set(intake.contradictionSets.filter((item) => item.status === 'open').flatMap((item) => item.observationIds))
  const measurementById = new Map(intake.measurementCandidates.map((item) => [item.observationId, item]))
  const contradictionRelations = (id: string, kind: 'claim' | 'observation') => intake.contradictionSets
    .filter((item) => item.status === 'open')
    .flatMap((item) => {
      const pairs = kind === 'observation'
        ? item.observationPairs.map((pair) => [pair.leftObservationId, pair.rightObservationId] as const)
        : uniqueSorted(item.observationPairs.flatMap((pair) => {
          const leftClaimId = measurementById.get(pair.leftObservationId)?.claimId
          const rightClaimId = measurementById.get(pair.rightObservationId)?.claimId
          if (!leftClaimId || !rightClaimId || leftClaimId === rightClaimId) return []
          return [uniqueSorted([leftClaimId, rightClaimId]).join('\u0000')]
        })).map((pairKey) => pairKey.split('\u0000') as [string, string])
      return pairs.filter((pair) => pair[1] === id).map((pair) => ({
        relationType: 'contradicts',
        targetId: pair[0],
        note: `Storage-normalized direction for a declared pair in unresolved set ${item.contradictionSetId}; the named pair, not edge direction, is authoritative.`,
      }))
    })
    .sort((left, right) => left.targetId.localeCompare(right.targetId) || left.note.localeCompare(right.note))

  const sources = [...acquisitionsBySource.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, acquisitions]) => {
      const first = acquisitions[0]
      return baseObject(intake, ontology, {
        id: sourceId,
        objectTypeId: 'knowledge_object.source',
        title: first.title,
        summary: `${first.publisher} source recorded with content-addressed capture metadata for Gate 2C; ${acquisitions.length} exact locator-level citation${acquisitions.length === 1 ? '' : 's'} remain human-review pending. Local-only captures are not described as durable archives.`,
        facets: mergeFacets(acquisitions.map((item) => item.facets)),
        systemBoundary: {
          included: uniqueSorted(acquisitions.map((item) => item.locator)),
          excluded: uniqueSorted(acquisitions.flatMap((item) => item.limitations)),
          functionalUnit: null,
        },
        evidence: internalEvidence({
          verificationStatus: 'needs_review',
          citationReadiness: 'internal_context',
          uncertainty: { level: 'medium', reasons: ['Capture integrity passed; method appraisal and human source review remain pending.'] },
        }),
      })
    })

  const subjects = [...intake.subjectDefinitions]
    .sort((left, right) => left.subjectId.localeCompare(right.subjectId))
    .map((subject) => baseObject(intake, ontology, {
      id: subject.subjectId,
      objectTypeId: subject.objectTypeId,
      title: subject.title,
      summary: subject.summary,
      facets: subject.facets,
      systemBoundary: subject.systemBoundary,
    }))

  const indicators = [...intake.indicatorDefinitions]
    .sort((left, right) => left.indicatorId.localeCompare(right.indicatorId))
    .map((indicator) => ({
      ...baseObject(intake, ontology, {
        id: indicator.indicatorId,
        objectTypeId: 'knowledge_object.indicator',
        title: indicator.title,
        summary: indicator.summary,
        facets: indicator.facets,
        systemBoundary: { included: [indicator.universe], excluded: [], functionalUnit: indicator.unit },
        payloadKind: 'metric_indicator',
      }),
      metricIndicator: {
        metricId: indicator.indicatorId,
        subjectIds: uniqueSorted(indicator.subjectIds),
        geographyIds: uniqueSorted(indicator.facets.geographyIds),
        period: indicator.period,
        value: null,
        unit: indicator.unit,
        numerator: indicator.numeratorDefinition,
        denominator: indicator.denominatorOrUniverse,
        universe: indicator.universe,
        method: indicator.method,
        unknownReason: indicator.unknownReason,
      },
    }))

  const claims = [...intake.claimCandidates]
    .sort((left, right) => left.claimId.localeCompare(right.claimId))
    .map((claim) => {
      const disputed = openClaimIds.has(claim.claimId)
      const claimMeasurements = intake.measurementCandidates.filter((item) => item.claimId === claim.claimId)
      const basis = claimMeasurements.some((item) => evidenceBasis(item.realizationState) === 'estimated')
        ? 'estimated'
        : claimMeasurements.some((item) => evidenceBasis(item.realizationState) === 'observed')
          ? 'observed'
          : 'not_assessed'
      return {
        ...baseObject(intake, ontology, {
          id: claim.claimId,
          objectTypeId: 'knowledge_object.claim',
          title: claim.title,
          summary: claim.summary,
          facets: claim.facets,
          timeScope: claim.timeScope,
          systemBoundary: claim.systemBoundary,
          operationalRoute: boundaryReviewRequired(claim) ? 'source_gated' : 'human_gated',
          relations: [
            ...claimMeasurements.map((measurement) => ({
              relationType: 'derived_from',
              targetId: measurement.observationId,
              note: 'Gate 2C claim candidate is derived from this typed measurement candidate.',
            })),
            ...contradictionRelations(claim.claimId, 'claim'),
          ].sort((left, right) => left.targetId.localeCompare(right.targetId) || left.relationType.localeCompare(right.relationType)),
          evidence: internalEvidence({
            evidenceBasis: basis,
            verificationStatus: disputed ? 'disputed' : 'needs_review',
            citationReadiness: 'internal_context',
            sourceRefs: claim.citationIds.map((id) => sourceRef(id, citationById)),
            uncertainty: { level: disputed ? 'high' : 'medium', reasons: uniqueSorted([...claim.limitations, 'Human review remains pending.']) },
          }),
        }),
        claimText: claim.claimText,
        claimStatus: 'internal_candidate',
        coverageCellIds: uniqueSorted(claim.coverageCellIds),
        aggregationAllowed: claim.aggregationAllowed,
      }
    })

  const observations = [...intake.measurementCandidates]
    .sort((left, right) => left.observationId.localeCompare(right.observationId))
    .map((measurement) => {
      const disputed = openObservationIds.has(measurement.observationId)
      return {
        ...baseObject(intake, ontology, {
          id: measurement.observationId,
          objectTypeId: 'knowledge_object.observation',
          title: measurement.title,
          summary: measurement.summary,
          facets: measurement.facets,
          timeScope: measurement.timeScope,
          systemBoundary: measurement.systemBoundary,
          operationalRoute: boundaryReviewRequired(measurement) ? 'source_gated' : 'human_gated',
          evidence: internalEvidence({
            evidenceBasis: evidenceBasis(measurement.realizationState),
            verificationStatus: disputed ? 'disputed' : 'needs_review',
            citationReadiness: 'internal_context',
            sourceRefs: measurement.citationIds.map((id) => sourceRef(id, citationById)),
            uncertainty: {
              level: measurement.uncertainty.level,
              reasons: uniqueSorted([
                ...measurement.uncertainty.reasons,
                ...measurement.limitations,
                'Aggregation is blocked while Gate 2C human review is pending.',
                `Boundary state: ${measurement.boundaryState}.`,
                ...(measurement.nonAdditiveWithGeographyIds.length > 0
                  ? [`Non-additive with ${measurement.nonAdditiveWithGeographyIds.join(', ')}.`]
                  : []),
              ]),
            },
          }),
          relations: [
            { relationType: 'supports', targetId: measurement.claimId, note: 'Typed measurement candidate supporting this Gate 2C claim candidate.' },
            ...measurement.componentObservationIds.map((targetId) => ({
              relationType: 'derived_from',
              targetId,
              note: `Component lineage for this total${measurement.reportedPrecision ? `; reported precision ${measurement.reportedPrecision}` : ''}.`,
            })),
            ...contradictionRelations(measurement.observationId, 'observation'),
          ].sort((left, right) => left.targetId.localeCompare(right.targetId) || left.relationType.localeCompare(right.relationType)),
          payloadKind: 'metric_indicator',
        }),
        metricIndicator: {
          metricId: measurement.indicatorId,
          subjectIds: uniqueSorted(measurement.subjectIds),
          geographyIds: uniqueSorted(measurement.facets.geographyIds),
          period: measurement.timeScope.kind === 'undated'
            ? `undated as of ${measurement.timeScope.asOf}`
            : [measurement.timeScope.from, measurement.timeScope.to].filter(Boolean).join(' to ') || measurement.timeScope.asOf,
          value: measurement.value,
          unit: measurement.unit,
          numerator: measurement.numeratorDefinition,
          denominator: measurement.denominatorOrUniverse,
          universe: measurement.universe,
          method: [
            measurement.method,
            `Calculation kind: ${measurement.calculationKind}.`,
            ...(measurement.sourceRowProvenance.length > 0 ? [`Source-row provenance: ${measurement.sourceRowProvenance.join(' | ')}.`] : []),
            ...(measurement.reportedPrecision ? [`Reported precision: ${measurement.reportedPrecision}.`] : []),
          ].join(' '),
          unknownReason: measurement.unknownReason,
        },
        aggregationAllowed: measurement.aggregationAllowed,
      }
    })

  const objects = [...sources, ...subjects, ...indicators, ...claims, ...observations]
  assertUnique(objects.map((item) => item.id), 'Generated knowledge-object IDs')
  return objects.sort((left, right) => left.id.localeCompare(right.id))
}

function validateGeneratedKnowledgeObjects(root: string, objects: KnowledgeObject[]) {
  for (const object of objects.filter((item) => (
    item.objectTypeId === 'knowledge_object.claim' || item.objectTypeId === 'knowledge_object.observation'
  ))) {
    assert(object.aggregationAllowed === false, `${object.id} generated aggregationAllowed must be false`)
  }
  const result = validateKnowledgeFoundation(objects, { root })
  assert(result.valid, `Generated knowledge objects failed validation: ${result.issues.map((item) => `${item.objectId ?? '<unknown>'}${item.path} [${item.code}] ${item.message}`).join('; ')}`)
}

function buildAcquisitionReceipts(intake: Field08EvidenceIntake, baseCommit: string): string {
  return `${[...intake.sourceAcquisitions]
    .sort((left, right) => left.acquisitionId.localeCompare(right.acquisitionId))
    .map((acquisition) => canonicalJson(hashRecord({
      documentType: 'field08_acquisition_receipt',
      schemaVersion: '1.0.0',
      receiptId: `receipt.${acquisition.acquisitionId}`,
      intakeId: intake.intakeId,
      sourceCommit: baseCommit,
      acquisitionId: acquisition.acquisitionId,
      sourceId: acquisition.sourceId,
      citationId: acquisition.citationId,
      sourceCandidateId: acquisition.sourceCandidateId,
      sourceUrl: acquisition.sourceUrl,
      locator: acquisition.locator,
      capturedAt: acquisition.capturedAt,
      capturePath: acquisition.capturePath,
      captureSha256: acquisition.captureSha256,
      captureSizeBytes: acquisition.captureSizeBytes,
      mediaType: acquisition.mediaType,
      acquisitionMethod: acquisition.acquisitionMethod,
      captureStorage: acquisition.captureStorage,
      archiveDurability: acquisition.archiveDurability,
      inspectionNotePath: acquisition.inspectionNotePath,
      reuseReviewState: acquisition.reuseReviewState,
      requestReceiptPath: acquisition.requestReceiptPath,
      boundaryState: acquisition.boundaryState,
      coverageImplication: 'none',
      humanReviewState: 'pending',
      externalUseAllowed: false,
    }))).join('\n')}\n`
}

function buildAppraisalReviewManifest(intake: Field08EvidenceIntake, baseCommit: string): Record<string, unknown> {
  return hashRecord({
    documentType: 'field08_appraisal_review_manifest',
    schemaVersion: '1.0.0',
    manifestId: 'review_manifest.field08_gate2c.v1',
    status: 'human_review_pending',
    generatedAt: intake.observedAt,
    sourceCommit: baseCommit,
    intakeId: intake.intakeId,
    appraisalDrafts: [...intake.appraisalDrafts].sort((left, right) => left.appraisalDraftId.localeCompare(right.appraisalDraftId)),
    reviewGates: [...intake.reviewGates].sort((left, right) => left.reviewGateId.localeCompare(right.reviewGateId)),
    acceptanceBoundary: {
      externalGatePassed: false,
      coveragePromotionAllowed: false,
      assessmentEventCreationAllowed: false,
      requiredAction: 'A named human reviewer must review each appraisal and applicable boundary or contradiction gate in a later append-only receipt.',
    },
  })
}

function buildReviewerBrief(intake: Field08EvidenceIntake): string {
  const lines = [
    '# Field 08 Gate 2C reviewer brief',
    '',
    `Status: **human review pending**. Intake: \`${intake.intakeId}\`.`,
    '',
    'This bundle verifies Git-pinned inputs, local-external capture hashes when replayed, stable identities, locators, typed measurements and fail-closed boundaries. Local-external redistribution and reuse remain pending. It does not promote coverage, readiness or external use.',
    '',
    '## Appraisal drafts',
    '',
  ]
  for (const appraisal of [...intake.appraisalDrafts].sort((left, right) => left.appraisalDraftId.localeCompare(right.appraisalDraftId))) {
    lines.push(
      `### ${appraisal.appraisalDraftId}`,
      '',
      `- Source: \`${appraisal.targetSourceId}\``,
      `- Authority: ${appraisal.authorityAssessment}`,
      `- Scope fit: ${appraisal.scopeFitAssessment}`,
      `- Method: ${appraisal.methodAssessment}`,
      `- Limitations: ${appraisal.limitationAssessment}`,
      `- State: \`${appraisal.reviewState}\`; external gate: \`${appraisal.externalGatePassed}\``,
      '',
    )
  }
  lines.push('## Pending gates', '')
  for (const gate of [...intake.reviewGates].sort((left, right) => left.reviewGateId.localeCompare(right.reviewGateId))) {
    lines.push(
      `- **${gate.gateType}** (\`${gate.reviewGateId}\`): ${gate.instructions} Reviewer role: ${gate.requiredReviewerRole}. Targets: ${gate.targetIds.map((id) => `\`${id}\``).join(', ')}.`,
    )
  }
  lines.push('', 'No approval is implied by this generated brief.', '')
  return lines.join('\n')
}

function buildEvidenceRegister(
  intake: Field08EvidenceIntake,
  baseCommit: string,
  baselineGuard: BaselineGuard,
  knowledgeObjects: KnowledgeObject[],
): Record<string, unknown> {
  const openContradictions = intake.contradictionSets.filter((item) => item.status === 'open')
  const openClaimIds = new Set(openContradictions.flatMap((item) => item.claimIds))
  const openObservationIds = new Set(openContradictions.flatMap((item) => item.observationIds))
  const claims = [...intake.claimCandidates]
    .sort((left, right) => left.claimId.localeCompare(right.claimId))
    .map((claim) => ({
      ...claim,
      verificationStatus: openClaimIds.has(claim.claimId) ? 'disputed' : 'needs_review',
      contradictionSetIds: openContradictions.filter((item) => item.claimIds.includes(claim.claimId)).map((item) => item.contradictionSetId).sort(),
      externalUseAllowed: false,
      coverageImplication: 'none',
    }))
  const measurements = [...intake.measurementCandidates]
    .sort((left, right) => left.observationId.localeCompare(right.observationId))
    .map((measurement) => ({
      ...measurement,
      verificationStatus: openObservationIds.has(measurement.observationId) ? 'disputed' : 'needs_review',
      contradictionSetIds: openContradictions.filter((item) => item.observationIds.includes(measurement.observationId)).map((item) => item.contradictionSetId).sort(),
      externalUseAllowed: false,
      coverageImplication: 'none',
    }))
  return hashRecord({
    documentType: 'field08_evidence_register',
    schemaVersion: '1.0.0',
    registerId: 'registry.field08_gate2c.v1',
    status: 'machine_checked_human_review_pending',
    generatedAt: intake.observedAt,
    sourceCommit: baseCommit,
    generatorVersion: GENERATOR_VERSION,
    intakeId: intake.intakeId,
    sourceMapId: intake.sourceMapId,
    semantics: intake.semantics,
    baselineGuard,
    sourceAcquisitions: [...intake.sourceAcquisitions].sort((left, right) => left.acquisitionId.localeCompare(right.acquisitionId)),
    claims,
    measurements,
    contradictionSets: [...intake.contradictionSets].sort((left, right) => left.contradictionSetId.localeCompare(right.contradictionSetId)),
    deferredCandidates: [...intake.deferredCandidates].sort((left, right) => left.deferredCandidateId.localeCompare(right.deferredCandidateId)),
    childDimensionRequirements: [...intake.childDimensionRequirements].sort((left, right) => left.requirementId.localeCompare(right.requirementId)),
    pendingReviewGateIds: intake.reviewGates.map((item) => item.reviewGateId).sort(),
    knowledgeObjectIds: knowledgeObjects.map((item) => item.id).sort(),
    recordCounts: {
      acquisitions: intake.sourceAcquisitions.length,
      uniqueSources: new Set(intake.sourceAcquisitions.map((item) => item.sourceId)).size,
      citations: intake.sourceAcquisitions.length,
      claims: intake.claimCandidates.length,
      measurements: intake.measurementCandidates.length,
      openContradictions: openContradictions.length,
      deferredCandidates: intake.deferredCandidates.length,
      childDimensionRequirements: intake.childDimensionRequirements.length,
      appraisalDrafts: intake.appraisalDrafts.length,
      pendingReviewGates: intake.reviewGates.length,
      knowledgeObjects: knowledgeObjects.length,
    },
    safetySummary: {
      coverageAssessmentEventsCreated: 0,
      field08CoverageCellsPromoted: 0,
      readinessResultsCreated: 0,
      externalReadyClaimsCreated: 0,
      sapmiSubjectEvidenceCreated: 0,
      finlandAlandUnknownAggregationsCreated: 0,
      perHectareDerivedSubtractionsCreated: 0,
      historicalCoverageFilesModified: 0,
      gitTrackedCaptureFilesPinned: new Set(intake.sourceAcquisitions
        .filter((item) => item.captureStorage === 'git_tracked')
        .map((item) => item.capturePath)).size,
      localExternalCaptureFilesDetached: new Set(intake.sourceAcquisitions
        .filter((item) => item.captureStorage === 'local_external')
        .map((item) => item.capturePath)).size,
      localExternalCaptureFilesPresentInSourceCommit: 0,
      localExternalReuseReviewsPending: new Set(intake.sourceAcquisitions
        .filter((item) => item.captureStorage === 'local_external' && item.reuseReviewState === 'pending')
        .map((item) => item.capturePath)).size,
    },
  })
}

function buildReport(intake: Field08EvidenceIntake, register: Record<string, unknown>): string {
  const counts = register.recordCounts as Record<string, number>
  const open = intake.contradictionSets.filter((item) => item.status === 'open')
  const lines = [
    '# Field 08 Gate 2C evidence-intake report',
    '',
    `Generated from source commit \`${String(register.sourceCommit)}\`. Status: **machine checked; human review pending**.`,
    '',
    '## Bounded result',
    '',
    `- ${counts.acquisitions} locator-level acquisition receipts across ${counts.uniqueSources} source records`,
    `- ${counts.claims} claim candidates and ${counts.measurements} typed measurement candidates`,
    `- ${counts.openContradictions} open claim-scoped contradiction set${counts.openContradictions === 1 ? '' : 's'}`,
    `- ${counts.childDimensionRequirements} explicit child-dimension requirements`,
    `- ${counts.pendingReviewGates} pending human review gates`,
    '- 117/117 historical coverage events retained; all nine Field 08 cells remain scope registrations and unassessed',
    '- zero coverage promotions, readiness results, external-ready claims, Sápmi subject-evidence records or historical coverage writes',
    '',
    '## Claims',
    '',
  ]
  const registeredClaims = register.claims as Array<ClaimCandidate & { verificationStatus: string; contradictionSetIds: string[] }>
  for (const claim of registeredClaims) {
    lines.push(
      `### ${claim.title}`,
      '',
      `- ID: \`${claim.claimId}\``,
      `- Verification: \`${claim.verificationStatus}\`; aggregation allowed: \`${claim.aggregationAllowed}\``,
      `- Boundary: \`${claim.boundaryState}\`; non-additive with: ${claim.nonAdditiveWithGeographyIds.length ? claim.nonAdditiveWithGeographyIds.map((id) => `\`${id}\``).join(', ') : 'none declared'}`,
      `- Exact facets: ${FACET_ARRAY_KEYS.flatMap((key) => claim.facets[key]).map((id) => `\`${id}\``).join(', ')}`,
      `- Statement: ${claim.claimText}`,
      `- Limitations: ${claim.limitations.join(' ') || 'None recorded.'}`,
      '',
    )
  }
  lines.push('## Open contradictions', '')
  if (open.length === 0) lines.push('- None recorded in this tranche.', '')
  for (const contradiction of open) {
    lines.push(`- \`${contradiction.contradictionSetId}\`: ${contradiction.description} Affected claims only: ${contradiction.claimIds.map((id) => `\`${id}\``).join(', ')}. Aggregation remains blocked.`, '')
  }
  lines.push('## Deferred candidates', '')
  if (intake.deferredCandidates.length === 0) lines.push('- None recorded in this bounded tranche.', '')
  for (const deferred of [...intake.deferredCandidates].sort((left, right) => left.deferredCandidateId.localeCompare(right.deferredCandidateId))) {
    lines.push(
      `- \`${deferred.deferredCandidateId}\` (${deferred.geographyIds.map((id) => `\`${id}\``).join(', ')}; \`${deferred.reasonCode}\`): ${deferred.description} Next action: ${deferred.nextAction}`,
    )
  }
  lines.push('', '## Required child dimensions', '')
  if (intake.childDimensionRequirements.length === 0) lines.push('- None recorded in this bounded tranche.', '')
  for (const requirement of [...intake.childDimensionRequirements].sort((left, right) => left.requirementId.localeCompare(right.requirementId))) {
    lines.push(
      `- \`${requirement.requirementId}\` for \`${requirement.targetId}\`: \`${requirement.dimensionId}\` requires ${requirement.requiredValueIds.map((id) => `\`${id}\``).join(', ')}. ${requirement.rationale}`,
    )
  }
  lines.push('')
  lines.push(
    '## Interpretation boundary',
    '',
    'Git-tracked capture and project-authored inspection-note integrity is pinned in the generation manifest. Local-external capture hashes are verified during initial generation and during full replay; ordinary metadata-only checks may proceed when those bytes are absent. The notes contain bounded facts and locator metadata only and do not grant source-redistribution rights. Method appraisal, boundary acceptance, contradiction resolution and external citation use require later named human receipts. No generated artifact is a coverage assessment event.',
    '',
  )
  return lines.join('\n')
}

export function buildField08EvidenceArtifacts(
  root = process.cwd(),
  options: { baseCommit?: string; allowMissingLocalExternalCaptures?: boolean } = {},
): Field08EvidenceArtifacts {
  const baseCommit = options.baseCommit ?? runGit(root, ['rev-parse', 'HEAD'])
  const allowMissingLocalExternalCaptures = options.allowMissingLocalExternalCaptures ?? false
  verifyBaseCommit(root, baseCommit)
  const intake = readJson<Field08EvidenceIntake>(root, INTAKE_PATH)
  const ontology = readJson<Ontology>(root, ONTOLOGY_PATH)
  const sourceMap = readJson<Field08SourceMap>(root, FIELD08_SOURCE_MAP_PATH)
  const externalCaptureManifest = readJson<ExternalCaptureManifest>(root, EXTERNAL_CAPTURES_MANIFEST_PATH)
  validateWithSchema(root, intake)
  validateJsonSchema(
    root,
    EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH,
    EXTERNAL_CAPTURES_MANIFEST_PATH,
    externalCaptureManifest,
  )
  validateSourceMap(intake, sourceMap)
  const externalCaptureVerification = validateCapturePolicy(
    root,
    intake,
    externalCaptureManifest,
    allowMissingLocalExternalCaptures,
    baseCommit,
  )
  const apiResponsePaths = collectApiReceiptResponsePaths(root, intake)

  const localExternalCapturePaths = new Set(intake.sourceAcquisitions
    .filter((item) => item.captureStorage === 'local_external')
    .map((item) => item.capturePath))
  const staticInputPaths = [
    INTAKE_PATH,
    INTAKE_SCHEMA_PATH,
    EXTERNAL_CAPTURES_MANIFEST_SCHEMA_PATH,
    KNOWLEDGE_OBJECT_SCHEMA_PATH,
    ONTOLOGY_PATH,
    COVERAGE_LEDGER_PATH,
    HISTORICAL_ASSESSMENTS_PATH,
    COVERAGE_CELLS_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
    KNOWLEDGE_VALIDATOR_PATH,
    FIELD08_SOURCE_MAP_PATH,
    EXTERNAL_CAPTURES_MANIFEST_PATH,
    ...(localExternalCapturePaths.size > 0 ? ['.gitignore'] : []),
  ]
  const acquisitionInputPaths = intake.sourceAcquisitions.flatMap((item) => [
    ...(item.captureStorage === 'git_tracked' ? [item.capturePath] : []),
    ...(item.inspectionNotePath ? [item.inspectionNotePath] : []),
    ...(item.requestReceiptPath ? [item.requestReceiptPath] : []),
  ])
  const inputPaths = uniqueSorted([
    ...staticInputPaths,
    ...acquisitionInputPaths,
    ...apiResponsePaths.filter((path) => !localExternalCapturePaths.has(path)),
  ])
  for (const path of inputPaths) regularRepositoryFile(root, path, `Generation input ${path}`)
  const inputSnapshots = inputPaths.map((path) => snapshotArtifact(root, path, baseCommit))
  const baselineGuard = readBaselineGuard(root, inputSnapshots)
  validateIntake(root, intake, ontology)

  const knowledgeObjects = buildKnowledgeObjects(intake, ontology)
  validateGeneratedKnowledgeObjects(root, knowledgeObjects)
  const acquisitionReceiptsJsonl = buildAcquisitionReceipts(intake, baseCommit)
  const knowledgeObjectsJson = `${JSON.stringify(knowledgeObjects, null, 2)}\n`
  const appraisalReviewManifest = buildAppraisalReviewManifest(intake, baseCommit)
  const appraisalReviewManifestJson = `${JSON.stringify(appraisalReviewManifest, null, 2)}\n`
  const reviewerBriefMarkdown = buildReviewerBrief(intake)
  const evidenceRegister = buildEvidenceRegister(intake, baseCommit, baselineGuard, knowledgeObjects)
  const evidenceRegisterJson = `${JSON.stringify(evidenceRegister, null, 2)}\n`
  const reportMarkdown = buildReport(intake, evidenceRegister)

  const outputs = [
    { path: ACQUISITION_RECEIPTS_PATH, content: acquisitionReceiptsJsonl },
    { path: KNOWLEDGE_OBJECTS_PATH, content: knowledgeObjectsJson },
    { path: APPRAISAL_REVIEW_MANIFEST_PATH, content: appraisalReviewManifestJson },
    { path: REVIEWER_BRIEF_PATH, content: reviewerBriefMarkdown },
    { path: EVIDENCE_REGISTER_PATH, content: evidenceRegisterJson },
    { path: REPORT_PATH, content: reportMarkdown },
  ]
  const generationManifest = hashRecord({
    documentType: 'field08_evidence_generation_manifest',
    schemaVersion: '1.0.0',
    manifestId: 'generation_manifest.field08_gate2c.v1',
    generatedAt: intake.observedAt,
    sourceCommit: baseCommit,
    generator: GENERATOR_PATH,
    generatorVersion: GENERATOR_VERSION,
    intakeId: intake.intakeId,
    status: 'machine_checked_human_review_pending',
    commitMarkerSemantics: 'Written last. The pinned source commit, Git-tracked inputs, detached external-capture manifest, bounded project-authored inspection notes and output hashes must reproduce. Local-external bytes are deliberately absent from the source commit and are required only for initial generation or explicit full replay. This is not a human approval, coverage assessment or readiness receipt.',
    capturePolicy: {
      gitTrackedCapturePaths: uniqueSorted(intake.sourceAcquisitions
        .filter((item) => item.captureStorage === 'git_tracked')
        .map((item) => item.capturePath)),
      localExternalCapturePaths: uniqueSorted(intake.sourceAcquisitions
        .filter((item) => item.captureStorage === 'local_external')
        .map((item) => item.capturePath)),
      inspectionNotePaths: uniqueSorted(intake.sourceAcquisitions
        .flatMap((item) => item.inspectionNotePath ? [item.inspectionNotePath] : [])),
      localExternalCapturesExcludedFromGitSnapshots: true,
      initialGenerationRequiresLocalExternalCaptures: true,
      metadataOnlyCheckMayProceedWhenLocalExternalCapturesAreAbsent: true,
      fullReplayFlag: '--check --require-captures',
      redistributionAndReuseReviewState: 'pending',
    },
    inputSnapshots,
    outputs: outputs.map((item) => ({
      path: item.path,
      sha256: sha256(item.content),
      sizeBytes: Buffer.byteLength(item.content),
    })),
    safetySummary: (evidenceRegister.safetySummary as Record<string, unknown>),
  })
  const generationManifestJson = `${JSON.stringify(generationManifest, null, 2)}\n`

  return {
    baseCommit,
    intake,
    inputSnapshots,
    acquisitionReceiptsJsonl,
    knowledgeObjects,
    knowledgeObjectsJson,
    appraisalReviewManifestJson,
    reviewerBriefMarkdown,
    evidenceRegister,
    evidenceRegisterJson,
    reportMarkdown,
    generationManifestJson,
    externalCaptureVerification,
  }
}

function resolveBaseCommit(root: string, check: boolean, explicit?: string): string {
  if (explicit) return runGit(root, ['rev-parse', `${explicit}^{commit}`])
  if (check) {
    const manifest = readJson<{ sourceCommit?: unknown }>(root, GENERATION_MANIFEST_PATH)
    assert(typeof manifest.sourceCommit === 'string', 'Generation manifest has no sourceCommit')
    return manifest.sourceCommit
  }
  return runGit(root, ['rev-parse', 'HEAD'])
}

function outputBundle(artifacts: Field08EvidenceArtifacts) {
  return [
    { path: ACQUISITION_RECEIPTS_PATH, content: artifacts.acquisitionReceiptsJsonl },
    { path: KNOWLEDGE_OBJECTS_PATH, content: artifacts.knowledgeObjectsJson },
    { path: APPRAISAL_REVIEW_MANIFEST_PATH, content: artifacts.appraisalReviewManifestJson },
    { path: REVIEWER_BRIEF_PATH, content: artifacts.reviewerBriefMarkdown },
    { path: EVIDENCE_REGISTER_PATH, content: artifacts.evidenceRegisterJson },
    { path: REPORT_PATH, content: artifacts.reportMarkdown },
    { path: GENERATION_MANIFEST_PATH, content: artifacts.generationManifestJson },
  ]
}

export function writeOrCheckField08Evidence(
  root: string,
  artifacts: Field08EvidenceArtifacts,
  check: boolean,
  options: { failAfterOutputRenames?: number } = {},
) {
  const bundle = outputBundle(artifacts)
  if (check) {
    for (const item of bundle) {
      const target = safeOutputTarget(root, item.path, { createParent: false, requireTarget: true })
      assert(readFileSync(target, 'utf8') === item.content, `Generated file is stale: ${item.path}`)
    }
    return
  }
  assert(
    artifacts.externalCaptureVerification.allRequiredPresentAndVerified
      && sameSet(
        artifacts.externalCaptureVerification.requiredPaths,
        artifacts.externalCaptureVerification.verifiedPaths,
      ),
    'Generation write requires every local-external capture to be present and hash-verified',
  )
  if (options.failAfterOutputRenames !== undefined) {
    assert(
      Number.isInteger(options.failAfterOutputRenames) && options.failAfterOutputRenames >= 0,
      'failAfterOutputRenames must be a non-negative integer',
    )
  }

  const staged: Array<{ path: string; target: string; temporary: string }> = []
  try {
    for (const [index, item] of bundle.entries()) {
      const target = safeOutputTarget(root, item.path, { createParent: true, requireTarget: false })
      const temporary = resolve(dirname(target), `.${basename(target)}.${process.pid}.${index}.tmp`)
      assert(lstatIfPresent(temporary) === null, `Temporary generated file already exists: ${temporary}`)
      writeFileSync(temporary, item.content, { encoding: 'utf8', flag: 'wx' })
      staged.push({ path: item.path, target, temporary })
    }
    const manifest = staged.at(-1)
    assert(manifest, 'Generation manifest was not staged')
    assert(manifest.path === GENERATION_MANIFEST_PATH, 'Generation manifest must be staged last')
    const existingManifestTarget = safeOutputTarget(root, manifest.path, { createParent: false, requireTarget: false })
    if (lstatIfPresent(existingManifestTarget)) unlinkSync(existingManifestTarget)
    let renamedOutputs = 0
    if (options.failAfterOutputRenames === 0) throw new Error('Injected generated-output replacement failure')
    for (const item of staged.slice(0, -1)) {
      safeOutputTarget(root, item.path, { createParent: false, requireTarget: false })
      renameSync(item.temporary, item.target)
      renamedOutputs += 1
      if (options.failAfterOutputRenames === renamedOutputs) {
        throw new Error('Injected generated-output replacement failure')
      }
    }
    safeOutputTarget(root, manifest.path, { createParent: false, requireTarget: false })
    renameSync(manifest.temporary, manifest.target)
  } finally {
    for (const item of staged) if (lstatIfPresent(item.temporary)) unlinkSync(item.temporary)
  }
}

export function parseField08EvidenceCliArgs(args: string[]): { check: boolean; requireCaptures: boolean; baseCommit?: string } {
  let check = false
  let requireCaptures = false
  let baseCommit: string | undefined
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--check') {
      assert(!check, 'Duplicate --check argument')
      check = true
      continue
    }
    if (argument === '--require-captures') {
      assert(!requireCaptures, 'Duplicate --require-captures argument')
      requireCaptures = true
      continue
    }
    if (argument.startsWith('--base-commit=')) {
      assert(baseCommit === undefined, 'Duplicate --base-commit argument')
      const value = argument.slice('--base-commit='.length)
      assert(value.length > 0, '--base-commit requires a value')
      baseCommit = value
      continue
    }
    if (argument === '--base-commit') {
      assert(baseCommit === undefined, 'Duplicate --base-commit argument')
      const value = args[index + 1]
      assert(value && !value.startsWith('--'), '--base-commit requires a value')
      baseCommit = value
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }
  assert(!requireCaptures || check, '--require-captures requires --check')
  return { check, requireCaptures, baseCommit }
}

export function run(root = process.cwd(), args = process.argv.slice(2)) {
  const parsed = parseField08EvidenceCliArgs(args)
  const baseCommit = resolveBaseCommit(root, parsed.check, parsed.baseCommit)
  const artifacts = buildField08EvidenceArtifacts(root, {
    baseCommit,
    allowMissingLocalExternalCaptures: parsed.check && !parsed.requireCaptures,
  })
  writeOrCheckField08Evidence(root, artifacts, parsed.check)
  const counts = artifacts.evidenceRegister.recordCounts as Record<string, number>
  console.log(
    `Field 08 Gate 2C evidence intake ${parsed.check ? 'verified' : 'generated'}: sources=${counts.uniqueSources}; citations=${counts.citations}; claims=${counts.claims}; measurements=${counts.measurements}; open contradictions=${counts.openContradictions}; pending review gates=${counts.pendingReviewGates}; coverage promotions=0`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
