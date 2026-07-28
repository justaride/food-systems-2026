import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const GENERATOR_VERSION = '1.1.0'
const ONTOLOGY_PATH = 'knowledge/schema/nordic-food-system-ontology.v1.json'
const BASELINE_PATH = 'knowledge/coverage/baseline-manifest.v1.json'
const CELLS_PATH = 'knowledge/coverage/coverage-cells.v1.csv'
const ASSESSMENTS_PATH = 'knowledge/coverage/coverage-assessments-baseline.v1.jsonl'
const LEDGER_JSONL_PATH = 'knowledge/coverage/coverage-ledger.v1.jsonl'
const LEDGER_CSV_PATH = 'knowledge/coverage/coverage-ledger.v1.csv'
const SUMMARY_PATH = 'knowledge/coverage/coverage-summary.v1.json'
const SOURCE_SNAPSHOTS_PATH = 'knowledge/coverage/coverage-source-snapshots.v1.json'
const GENERATION_MANIFEST_PATH = 'knowledge/coverage/coverage-generation-manifest.v1.json'

type JsonScalar = string | number | boolean | null
type JsonValue = JsonScalar | JsonValue[] | { [key: string]: JsonValue }

export type Term = {
  id: string
  labelNb: string
  labelEn: string
  definition: string
  parentId?: string
  deprecated?: boolean
  coverageUnit?: boolean
  nodeKind?: string
  mapsTo?: string[]
  legacyMappings?: JsonValue
  [key: string]: unknown
}

export type Axis = {
  dimension: string
  ids: string[]
}

export type CoverageProfile = {
  id: string
  label: string
  purpose: string
  aggregationClass?: string
  coverageTier?: number
  requiredReadinessProfile: 'internal_navigation' | 'internal_analysis' | 'external_claim' | 'monitored_indicator'
  geographyIds: string[]
  axes: Axis[]
  requiredChildDimensions?: string[]
  systemBoundaryQuestion?: string
  populationDefinition?: string
  [key: string]: unknown
}

export type Ontology = {
  schemaVersion: string
  ontologyId: string
  ontologyVersion: string
  effectiveDate: string
  dimensions: Record<string, Term[]>
  statusModel: Record<string, string[]>
  coverageProfiles: CoverageProfile[]
}

export type ProjectionState = {
  workflowStage: string
  scopeState: string
  inventoryState: string
  knowledgeDepth: string
  verificationStatus: string
  citationReadiness: string
  appraisalState: string
  freshnessState: string
  temporalDepth: string
  archiveState: string
  confidence: string
  gapRoute: string
  assessmentWorkflowState: string
  evidenceBasis: string
  nextAction: string
  owner: string
  nextReviewAt: string
  cadence: string
}

type AssessmentStatusState = Omit<
  ProjectionState,
  'gapRoute' | 'nextAction' | 'owner' | 'nextReviewAt' | 'cadence'
>

type CoverageEvidenceLink = {
  evidenceLinkId: string
  role: string
  sourceCitationId: string | null
  fieldCitationId: string | null
  evidenceAppraisalId: string | null
  artifactRef: {
    path: string
    baseCommit: string
    gitBlobId: string
  } | null
  locator: string
  supportsOrChallenges: string
  accessedAt: string
}

type CoverageReviewReceipt = {
  receiptId: string
  reviewType: string
  reviewMethod: string
  reviewerType: string
  reviewerId: string
  reviewedAt: string
  decision: string
  receiptPath: string
  notes: string[]
}

type SubjectMatterPeriod = {
  kind: 'undated' | 'snapshot' | 'interval' | 'series_window'
  from: string | null
  to: string | null
  asOf: string | null
  label: string
}

type SystemBoundary = {
  state: 'unknown' | 'draft' | 'frozen' | 'not_applicable'
  included: string[]
  excluded: string[]
  functionalUnit: string | null
  answer: string | null
  limitations: string[]
  notApplicableReason: string | null
}

type UniverseDefinition = {
  state: 'unknown' | 'estimated' | 'frozen' | 'not_applicable'
  population: string | null
  estimate: number | null
  minimum: number | null
  maximum: number | null
  asOf: string | null
  methodNote: string | null
  notApplicableReason: string | null
}

type AssessmentMethod = {
  methodId: string
  methodType: 'inventory_audit' | 'negative_search' | 'enumeration' | 'estimation' | 'measurement' | 'synthesis_mapping' | 'mixed'
  name: string
  version: string
  description: string
  searchBoundary: string | null
  sourcesChecked: string[]
  limitations: string[]
}

type FacetSet = {
  assessmentState: 'unknown' | 'assessed' | 'not_applicable'
  representedIds: string[]
  missingIds: string[]
  notApplicableIds: string[]
  notApplicableReason: string | null
}

type FacetCoverage = {
  geographies: FacetSet
  commodities: FacetSet
  actorClasses: FacetSet
  flowClasses: FacetSet
  outcomes: FacetSet
  childDimensions: FacetSet
}

type BaselineRule = {
  id: string
  selector: {
    profileId: string
    geographyIds?: string[]
    dimensionFilters?: Record<string, string[]>
  }
  assessment: Partial<ProjectionState> & {
    eventKind?: string
    artifactPaths?: string[]
    limitations?: string[]
    periods?: SubjectMatterPeriod[]
    sourceCount?: number | null
    claimCount?: number | null
    measurementCount?: number | null
    systemBoundary?: SystemBoundary | null
    universeDefinition?: UniverseDefinition | null
    unit?: string | null
    method?: AssessmentMethod | null
    evidenceLinks?: CoverageEvidenceLink[]
    reviewReceipts?: CoverageReviewReceipt[]
    navigationIntegration?: JsonValue | null
    supersedesId?: string | null
    representedCommodityIds?: string[]
    missingCommodityIds?: string[]
    notApplicableCommodityIds?: string[]
    representedActorClassIds?: string[]
    missingActorClassIds?: string[]
    notApplicableActorClassIds?: string[]
    representedFlowClassIds?: string[]
    missingFlowClassIds?: string[]
    notApplicableFlowClassIds?: string[]
    representedOutcomeIds?: string[]
    missingOutcomeIds?: string[]
    notApplicableOutcomeIds?: string[]
    representedGeographyIds?: string[]
    missingGeographyIds?: string[]
    notApplicableGeographyIds?: string[]
  }
}

type BaselineManifest = {
  schemaVersion: string
  baselineId?: string
  adoptionStatus: 'proposed' | 'adopted'
  snapshotDate: string
  baseCommit: string
  purpose: string
  defaultProjection: ProjectionState
  sourceArtifacts: string[]
  unmigratedInputs: Array<{
    path: string
    recordCount: number
    [key: string]: unknown
  }>
  rules: BaselineRule[]
}

export type CoverageCell = {
  cellId: string
  schemaVersion: string
  taxonomyVersion: string
  profileId: string
  aggregationClass: string
  geographyId: string
  axisBindings: Array<{ dimension: string; valueId: string }>
  valueChainStageId: string | null
  domainId: string | null
  legacyFieldId: string | null
  cellTier: 'tier_1_macro' | 'tier_2_child' | 'tier_3_evidence'
  parentCellId: string | null
  childDimensionBindings: Array<{ dimension: string; value: string }>
  childSpecificationState: 'unknown' | 'draft' | 'frozen'
  requiredChildDimensions: string[]
  requiredChildCellIds: string[]
  requiredUnits: string[]
  systemBoundaryQuestion: string
  populationDefinition: {
    state: 'unknown' | 'draft' | 'frozen' | 'not_applicable'
    definition: string | null
    notApplicableReason: string | null
  }
  requiredReadinessProfile: CoverageProfile['requiredReadinessProfile']
  active: true
}

export type ArtifactSnapshotEntry = {
  path: string
  kind: 'file' | 'symlink'
  sha256: string
  sizeBytes: number
  symlinkTarget?: string
}

export type ArtifactSnapshot = {
  artifactSnapshotId: string
  path: string
  kind: 'file' | 'directory' | 'symlink'
  baseCommit: string
  gitObjectId: string
  gitObjectType: string
  sha256: string
  sizeBytes: number
  fileCount: number
  entries: ArtifactSnapshotEntry[]
}

export type SourceSnapshotSet = {
  schemaVersion: string
  baselineId: string
  snapshotDate: string
  baseCommit: string
  generatorVersion: string
  snapshots: ArtifactSnapshot[]
  sourceSnapshotSetHash: string
}

export type ReadinessResult = {
  profileId: CoverageProfile['requiredReadinessProfile']
  thresholdsVersion: 'coverage-readiness-v1'
  completeForProfile: boolean
  computedAt: string
  computedBy: string
  reasons: string[]
  checks: Array<{
    checkId: string
    status: 'pass' | 'fail' | 'unknown' | 'not_applicable'
    reason: string
  }>
}

export type CoverageAssessment = AssessmentStatusState & {
  assessmentId: string
  eventKind: string
  baselineId: string
  baselineAdoptionStatus: BaselineManifest['adoptionStatus']
  baselineSnapshotId: string
  baseCommit: string
  cellId: string
  schemaVersion: string
  taxonomyVersion: string
  auditObservedAt: string
  recordedAt: string
  assessmentValidFrom: string
  assessmentValidTo: string | null
  retrievedAt: string
  assessedAt: string
  sourceLastModified: string | null
  sourceUpdatedThrough: string | null
  subjectMatterPeriods: SubjectMatterPeriod[]
  systemBoundary: SystemBoundary
  universeDefinition: UniverseDefinition
  unit: string | null
  method: AssessmentMethod | null
  evidenceLinks: CoverageEvidenceLink[]
  reviewReceipts: CoverageReviewReceipt[]
  artifactSnapshotIds: string[]
  limitations: string[]
  facetCoverage: FacetCoverage
  readinessResult: ReadinessResult | null
  operationalGap: {
    route: string
    status: 'unknown' | 'open' | 'blocked' | 'closed' | 'not_applicable'
    controlRefs: string[]
    nextAction: string
    owner: string
  }
  monitoring: {
    cadence: string
    nextReviewAt: string | null
    trigger: string | null
    stalenessThresholdDays: number | null
  }
  supersedesId: string | null
  contentHash: string
}

export type CoverageLedgerRecord = {
  cell: CoverageCell
  stateOrigin: 'baseline_default' | 'explicit_event'
  latestAssessment: CoverageAssessment | null
  currentState: ProjectionState
  projectedReadinessResult: {
    profileId: CoverageProfile['requiredReadinessProfile']
    thresholdsVersion: 'coverage-readiness-v1'
    completeForProfile: boolean
    nonPassingCheckIds: string[]
  }
}

export type CoverageArtifacts = {
  ontology: Ontology
  baseline: BaselineManifest
  cells: CoverageCell[]
  assessments: CoverageAssessment[]
  ledgerRecords: CoverageLedgerRecord[]
  sourceSnapshotSet: SourceSnapshotSet
  cellsCsv: string
  assessmentsJsonl: string
  ledgerJsonl: string
  ledgerCsv: string
  summaryJson: string
  sourceSnapshotsJson: string
  generationManifestJson: string
}

const STATUS_FIELDS: Record<keyof Pick<
  ProjectionState,
  | 'workflowStage'
  | 'scopeState'
  | 'inventoryState'
  | 'knowledgeDepth'
  | 'verificationStatus'
  | 'citationReadiness'
  | 'appraisalState'
  | 'freshnessState'
  | 'temporalDepth'
  | 'archiveState'
  | 'confidence'
  | 'gapRoute'
  | 'assessmentWorkflowState'
  | 'evidenceBasis'
>, string> = {
  workflowStage: 'workflowStages',
  scopeState: 'scopeStates',
  inventoryState: 'inventoryStates',
  knowledgeDepth: 'knowledgeDepths',
  verificationStatus: 'verificationStatuses',
  citationReadiness: 'citationReadiness',
  appraisalState: 'appraisalStates',
  freshnessState: 'freshnessStates',
  temporalDepth: 'temporalDepths',
  archiveState: 'archiveStates',
  confidence: 'confidenceStates',
  gapRoute: 'gapRoutes',
  assessmentWorkflowState: 'assessmentWorkflowStates',
  evidenceBasis: 'evidenceBasis',
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function readJson<T>(root: string, relativePath: string): T {
  return JSON.parse(readFileSync(resolve(root, relativePath), 'utf8')) as T
}

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalize)
  assert(typeof value === 'object' && value !== undefined, 'Cannot canonicalize non-JSON value')
  const result: Record<string, JsonValue> = {}
  for (const key of Object.keys(value).sort()) {
    const item = (value as Record<string, unknown>)[key]
    if (item !== undefined) result[key] = canonicalize(item)
  }
  return result
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function sha256(value: string | Buffer): string {
  return 'sha256:' + createHash('sha256').update(value).digest('hex')
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length
}

function validateDate(value: string, field: string) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), field + ' must use YYYY-MM-DD: ' + value)
}

function compactId(id: string): string {
  return id.replace(/^[^.]+\./, '')
}

function dimensionToken(dimension: string): string {
  return dimension.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

function safeRelativePath(root: string, relativePath: string): string {
  assert(relativePath.length > 0, 'Artifact path cannot be empty')
  const absoluteRoot = resolve(root)
  const absolutePath = resolve(root, relativePath)
  assert(
    absolutePath === absoluteRoot || absolutePath.startsWith(absoluteRoot + sep),
    'Artifact path escapes repository root: ' + relativePath,
  )
  assert(absolutePath !== absoluteRoot, 'Repository root cannot be used as an artifact snapshot')
  return relativePath.replaceAll('\\', '/')
}

function runGit(root: string, args: string[], allowFailure = false): string {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || '').trim()
    throw new Error('git ' + args.join(' ') + ' failed' + (detail ? ': ' + detail : ''))
  }
  return result.status === 0 ? result.stdout.trim() : ''
}

function verifyBaseCommit(root: string, baseCommit: string) {
  assert(/^[0-9a-f]{40}$/.test(baseCommit), 'baseline.baseCommit must be a full 40-character commit SHA')
  runGit(root, ['cat-file', '-e', baseCommit + '^{commit}'])
}

function collectSnapshotEntries(root: string, absolutePath: string): ArtifactSnapshotEntry[] {
  const stat = lstatSync(absolutePath)
  const workspacePath = relative(resolve(root), absolutePath).replaceAll('\\', '/')
  if (stat.isSymbolicLink()) {
    const target = readlinkSync(absolutePath)
    return [{
      path: workspacePath,
      kind: 'symlink',
      sha256: sha256(target),
      sizeBytes: Buffer.byteLength(target),
      symlinkTarget: target,
    }]
  }
  if (stat.isFile()) {
    const bytes = readFileSync(absolutePath)
    return [{
      path: workspacePath,
      kind: 'file',
      sha256: sha256(bytes),
      sizeBytes: bytes.length,
    }]
  }
  assert(stat.isDirectory(), 'Unsupported artifact type: ' + workspacePath)
  return readdirSync(absolutePath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => collectSnapshotEntries(root, resolve(absolutePath, entry.name)))
}

export function snapshotArtifact(root: string, relativePath: string, baseCommit: string): ArtifactSnapshot {
  const normalizedPath = safeRelativePath(root, relativePath)
  const absolutePath = resolve(root, normalizedPath)
  assert(existsSync(absolutePath), 'Baseline artifact does not exist: ' + normalizedPath)

  const diff = spawnSync('git', ['diff', '--quiet', baseCommit, '--', normalizedPath], {
    cwd: root,
    stdio: 'ignore',
  })
  assert(diff.status === 0, 'Baseline artifact differs from declared base commit: ' + normalizedPath)
  const untracked = runGit(root, ['ls-files', '--others', '--exclude-standard', '--', normalizedPath])
  assert(untracked.length === 0, 'Baseline artifact contains untracked files: ' + normalizedPath)

  const gitObjectId = runGit(root, ['rev-parse', baseCommit + ':' + normalizedPath])
  assert(/^[0-9a-f]{40}$/.test(gitObjectId), 'No Git object at base commit for ' + normalizedPath)
  const gitObjectType = runGit(root, ['cat-file', '-t', gitObjectId])
  const topStat = lstatSync(absolutePath)
  const kind: ArtifactSnapshot['kind'] = topStat.isDirectory()
    ? 'directory'
    : topStat.isSymbolicLink()
      ? 'symlink'
      : 'file'
  const entries = collectSnapshotEntries(root, absolutePath)
  assert(entries.length > 0, 'Artifact snapshot is empty: ' + normalizedPath)
  const snapshotPayload = {
    path: normalizedPath,
    kind,
    baseCommit,
    gitObjectId,
    gitObjectType,
    entries,
  }
  const aggregateHash = sha256(canonicalJson(snapshotPayload))
  return {
    artifactSnapshotId: 'artifact.v1.' + aggregateHash.slice('sha256:'.length, 'sha256:'.length + 20),
    path: normalizedPath,
    kind,
    baseCommit,
    gitObjectId,
    gitObjectType,
    sha256: aggregateHash,
    sizeBytes: entries.reduce((total, entry) => total + entry.sizeBytes, 0),
    fileCount: entries.length,
    entries,
  }
}

function validateProjectionState(ontology: Ontology, state: ProjectionState, context: string) {
  for (const [field, vocabulary] of Object.entries(STATUS_FIELDS)) {
    const allowed = ontology.statusModel[vocabulary]
    assert(Array.isArray(allowed), 'Missing ontology status vocabulary ' + vocabulary)
    const value = state[field as keyof ProjectionState]
    assert(allowed.includes(value), context + '.' + field + ' is not in ' + vocabulary + ': ' + value)
  }
  validateDate(state.nextReviewAt, context + '.nextReviewAt')
  assert(state.nextAction.trim().length > 0, context + '.nextAction is required')
  assert(state.owner.trim().length > 0, context + '.owner is required')
  assert(state.cadence.trim().length > 0, context + '.cadence is required')
}

function collectControlledIds(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string' && /^[a-z_]+\.[a-z0-9_.-]+$/.test(value)) found.push(value)
  if (Array.isArray(value)) for (const item of value) collectControlledIds(item, found)
  if (value && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) collectControlledIds(item, found)
  }
  return found
}

export function validateOntology(ontology: Ontology) {
  assert(ontology.schemaVersion === '1.0.0', 'Unexpected ontology schemaVersion')
  assert(ontology.ontologyId === 'fs26.nordic_food_system', 'Unexpected ontologyId')
  assert(/^\d+\.\d+\.\d+$/.test(ontology.ontologyVersion), 'ontologyVersion must be semantic')

  const termEntries = Object.entries(ontology.dimensions)
    .flatMap(([dimension, terms]) => terms.map((term) => ({ dimension, term })))
  assert(termEntries.length > 0, 'Ontology must contain terms')
  assert(unique(termEntries.map(({ term }) => term.id)), 'Ontology term IDs must be globally unique')
  const termById = new Map(termEntries.map(({ dimension, term }) => [term.id, { dimension, term }]))

  for (const { dimension, term } of termEntries) {
    assert(term.id && term.labelNb && term.labelEn && term.definition, 'Incomplete ontology term ' + term.id)
    if (term.parentId) {
      const parent = termById.get(term.parentId)
      assert(parent, 'Unknown parent ' + term.parentId + ' for ' + term.id)
      assert(parent.dimension === dimension, 'Cross-dimension parent ' + term.parentId + ' for ' + term.id)
    }
    for (const mappedId of term.mapsTo ?? []) {
      assert(termById.has(mappedId), 'Unknown mapsTo ' + mappedId + ' for ' + term.id)
    }
    for (const controlledId of collectControlledIds(term.legacyMappings)) {
      assert(termById.has(controlledId), 'Unknown legacy mapping ' + controlledId + ' for ' + term.id)
    }

    const visited = new Set<string>([term.id])
    let parentId = term.parentId
    while (parentId) {
      assert(!visited.has(parentId), 'Ontology parent cycle includes ' + term.id + ' and ' + parentId)
      visited.add(parentId)
      parentId = termById.get(parentId)?.term.parentId
    }
  }

  const stageTerms = ontology.dimensions.valueChainStages ?? []
  for (const stage of stageTerms.filter((term) => term.coverageUnit === true)) {
    assert(
      !stageTerms.some((candidate) => candidate.parentId === stage.id),
      'Coverage stage must be a structural leaf: ' + stage.id,
    )
    assert(stage.nodeKind && stage.nodeKind !== 'aggregate', 'Coverage stage needs a non-aggregate nodeKind: ' + stage.id)
  }

  const profileIds = ontology.coverageProfiles.map((profile) => profile.id)
  assert(unique(profileIds), 'Coverage profile IDs must be unique')
  for (const profile of ontology.coverageProfiles) {
    assert(profile.axes.length > 0, profile.id + ' must declare axes')
    assert(unique(profile.axes.map((axis) => axis.dimension)), profile.id + ' axes must be unique')
    assert(unique(profile.geographyIds), profile.id + ' geographyIds must be unique')
    const hasSapmi = profile.geographyIds.includes('geo.sapmi')
    assert(!hasSapmi || profile.geographyIds.length === 1, profile.id + ' cannot aggregate Sápmi with political geographies')
    for (const geographyId of profile.geographyIds) {
      assert(
        ontology.dimensions.geographies.some((term) => term.id === geographyId && !term.deprecated),
        profile.id + ' has unknown or deprecated geography ' + geographyId,
      )
    }
    for (const axis of profile.axes) {
      const vocabulary = ontology.dimensions[axis.dimension]
      assert(Array.isArray(vocabulary), profile.id + ' has unknown dimension ' + axis.dimension)
      assert(axis.ids.length > 0 && unique(axis.ids), profile.id + '.' + axis.dimension + ' IDs must be non-empty and unique')
      for (const id of axis.ids) {
        const term = vocabulary.find((candidate) => candidate.id === id)
        assert(term && !term.deprecated, profile.id + ' has unknown or deprecated ' + axis.dimension + ' ID ' + id)
        if (axis.dimension === 'valueChainStages') {
          assert(term.coverageUnit === true, profile.id + ' uses non-coverage stage ' + id)
        }
      }
    }
  }

  const lenses = ontology.dimensions.crossCuttingLenses ?? []
  assert(lenses.length === 11, 'Expected 11 mandatory cross-cutting lenses, found ' + lenses.length)
}

function cartesian(axes: Axis[]): Array<Record<string, string>> {
  return axes.reduce<Array<Record<string, string>>>(
    (rows, axis) => rows.flatMap((row) => axis.ids.map((id) => ({ ...row, [axis.dimension]: id }))),
    [{}],
  )
}

function stableCellId(profileId: string, geographyId: string, dimensions: Record<string, string>): string {
  const tokens = [
    'profile=' + compactId(profileId),
    'geography=' + compactId(geographyId),
    ...Object.entries(dimensions)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dimension, id]) => dimensionToken(dimension) + '=' + compactId(id)),
  ]
  return 'cov.v1.' + tokens.join('.')
}

export function buildCoverageCells(ontology: Ontology): CoverageCell[] {
  validateOntology(ontology)
  const cells: CoverageCell[] = []
  for (const profile of ontology.coverageProfiles) {
    const hasSapmi = profile.geographyIds.includes('geo.sapmi')
    const aggregationClass = profile.aggregationClass ?? (hasSapmi ? 'sapmi_overlapping' : 'political_nordic')
    for (const geographyId of profile.geographyIds) {
      for (const dimensions of cartesian(profile.axes)) {
        cells.push({
          cellId: stableCellId(profile.id, geographyId, dimensions),
          schemaVersion: '1.0.0',
          taxonomyVersion: ontology.ontologyVersion,
          profileId: profile.id,
          aggregationClass,
          geographyId,
          axisBindings: Object.entries(dimensions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dimension, valueId]) => ({ dimension, valueId })),
          valueChainStageId: dimensions.valueChainStages ?? null,
          domainId: dimensions.domains ?? null,
          legacyFieldId: dimensions.legacyFields ?? null,
          cellTier: profile.coverageTier === 2
            ? 'tier_2_child'
            : profile.coverageTier === 3
              ? 'tier_3_evidence'
              : 'tier_1_macro',
          parentCellId: null,
          childDimensionBindings: [],
          childSpecificationState: 'unknown',
          requiredChildDimensions: profile.requiredChildDimensions ?? [
            'subnational_geography',
            'commodity',
            'actor',
            'flow',
            'outcome',
            'period',
            'metric',
            'relationship',
            'knowledge_object',
          ],
          requiredChildCellIds: [],
          requiredUnits: [],
          systemBoundaryQuestion: profile.systemBoundaryQuestion
            ?? 'What is included, excluded and crossing this cell boundary?',
          populationDefinition: {
            state: profile.populationDefinition ? 'draft' : 'unknown',
            definition: profile.populationDefinition ?? null,
            notApplicableReason: null,
          },
          requiredReadinessProfile: profile.requiredReadinessProfile,
          active: true,
        })
      }
    }
  }
  cells.sort((a, b) => a.cellId.localeCompare(b.cellId))
  assert(unique(cells.map((cell) => cell.cellId)), 'Generated coverage cell IDs must be unique')
  return cells
}

function cellMatchesRule(cell: CoverageCell, rule: BaselineRule): boolean {
  if (cell.profileId !== rule.selector.profileId) return false
  if (rule.selector.geographyIds && !rule.selector.geographyIds.includes(cell.geographyId)) return false
  const dimensionValues = Object.fromEntries(cell.axisBindings.map((binding) => [binding.dimension, binding.valueId]))
  for (const [dimension, ids] of Object.entries(rule.selector.dimensionFilters ?? {})) {
    const value = dimensionValues[dimension]
    if (!value || !ids.includes(value)) return false
  }
  return true
}

function exactLocatorPresent(link: CoverageEvidenceLink): boolean {
  return Boolean(link.locator?.trim())
}

function computeReadiness(
  profile: CoverageProfile['requiredReadinessProfile'],
  computedAt: string,
  subject: Partial<CoverageAssessment> & AssessmentStatusState,
): ReadinessResult {
  const evidenceLinks = subject.evidenceLinks ?? []
  const reviewReceipts = subject.reviewReceipts ?? []
  const facetSets = subject.facetCoverage ? Object.values(subject.facetCoverage) : []
  const allFacetsAccounted = facetSets.length === 6
    && facetSets.every((facet) => ['assessed', 'not_applicable'].includes(facet.assessmentState))
  const boundaryReady = subject.systemBoundary?.state === 'frozen'
  const universeReady = ['frozen', 'not_applicable'].includes(subject.universeDefinition?.state ?? 'unknown')
  const hasLocatedEvidence = evidenceLinks.length > 0 && evidenceLinks.every(exactLocatorPresent)
  const hasCitedEvidence = evidenceLinks.some(
    (link) => Boolean(link.sourceCitationId) && link.supportsOrChallenges === 'supports' && exactLocatorPresent(link),
  )
  const methodReady = Boolean(subject.method)
  const completenessReview = reviewReceipts.some(
    (receipt) => ['human', 'partner', 'rights_holder'].includes(receipt.reviewerType)
      && receipt.reviewType === 'completeness_review'
      && receipt.decision === 'approved',
  )
  const profileSpecificReview = profile === 'external_claim'
    ? reviewReceipts.some((receipt) => receipt.reviewType === 'external_readiness_review'
      && ['human', 'partner', 'rights_holder'].includes(receipt.reviewerType)
      && receipt.decision === 'approved')
    : profile === 'monitored_indicator'
      ? reviewReceipts.some((receipt) => receipt.reviewType === 'indicator_review'
        && receipt.reviewerType === 'human'
        && receipt.decision === 'approved')
      : true
  const reviewReady = completenessReview && profileSpecificReview
  const workflowReady = profile === 'internal_navigation'
    ? ['compiled', 'reviewed', 'claim_ready', 'monitored'].includes(subject.workflowStage)
    : profile === 'monitored_indicator'
      ? subject.workflowStage === 'monitored'
      : ['reviewed', 'claim_ready', 'monitored'].includes(subject.workflowStage)
  const assessmentWorkflowReady = ['audited', 'published'].includes(subject.assessmentWorkflowState)
  const verificationReady = profile === 'internal_navigation'
    ? ['needs_review', 'machine_verified', 'human_verified'].includes(subject.verificationStatus)
    : profile === 'external_claim' || profile === 'monitored_indicator'
      ? subject.verificationStatus === 'human_verified'
      : ['machine_verified', 'human_verified'].includes(subject.verificationStatus)
  const citationReady = profile === 'external_claim'
    ? subject.citationReadiness === 'citable_external'
    : profile === 'monitored_indicator'
      ? ['citable_with_note', 'citable_external'].includes(subject.citationReadiness)
      : subject.citationReadiness !== 'not_assessed' && subject.citationReadiness !== 'blocked_unsourced'
  const appraisalReady = profile === 'external_claim' || profile === 'monitored_indicator'
    ? ['reviewed', 'excluded_not_applicable'].includes(subject.appraisalState)
    : subject.appraisalState !== 'none'
  const freshnessReady = profile === 'external_claim' || profile === 'monitored_indicator'
    ? subject.freshnessState === 'current'
    : subject.freshnessState !== 'unknown'
  const temporalReady = profile === 'monitored_indicator'
    ? (subject.subjectMatterPeriods?.length ?? 0) > 0
      && ['dated_series', 'bitemporal'].includes(subject.temporalDepth)
    : (subject.subjectMatterPeriods?.length ?? 0) > 0
  const archiveReady = profile === 'external_claim' || profile === 'monitored_indicator'
    ? ['durable_copy', 'hash_verified'].includes(subject.archiveState)
    : subject.archiveState !== 'unknown'
  const monitoringReady = profile === 'monitored_indicator'
    ? Boolean(subject.unit?.trim()
      && subject.monitoring?.cadence
      && subject.monitoring.cadence !== 'unassigned'
      && subject.monitoring.nextReviewAt
      && subject.monitoring.stalenessThresholdDays)
    : true
  const inventoryReady = ['partial', 'run_floor', 'exhaustive', 'not_applicable'].includes(subject.inventoryState)
  const scopeReady = subject.scopeState === 'frozen'
    && boundaryReady
    && universeReady
    && workflowReady
    && assessmentWorkflowReady
  const childCoverageReady = subject.facetCoverage?.childDimensions.assessmentState === 'not_applicable'
    || subject.facetCoverage?.childDimensions.assessmentState === 'assessed'
  const evidenceReady = methodReady
    && hasLocatedEvidence
    && (profile === 'external_claim' ? hasCitedEvidence : true)

  const rawChecks: Array<ReadinessResult['checks'][number]> = [
    { checkId: 'scope', status: scopeReady ? 'pass' : 'unknown', reason: scopeReady ? 'Scope, boundary, universe and workflow are frozen and reviewed.' : 'Scope, boundary, universe or workflow remains below the profile gate.' },
    { checkId: 'inventory', status: inventoryReady ? 'pass' : 'unknown', reason: inventoryReady ? 'Inventory state is explicitly assessed.' : 'Inventory state remains unknown or lacks a qualifying negative search.' },
    { checkId: 'evidence', status: evidenceReady ? 'pass' : 'unknown', reason: evidenceReady ? 'A method and typed evidence links with exact locators meet the profile gate.' : 'The method or qualifying evidence links with exact locators are absent.' },
    { checkId: 'verification', status: verificationReady ? 'pass' : 'unknown', reason: verificationReady ? 'Verification meets the profile threshold.' : 'Verification does not meet the profile threshold.' },
    { checkId: 'citation', status: citationReady ? 'pass' : 'unknown', reason: citationReady ? 'Citation readiness meets the profile threshold.' : 'Citation readiness has not passed for this profile.' },
    { checkId: 'appraisal', status: appraisalReady ? 'pass' : 'unknown', reason: appraisalReady ? 'Appraisal meets the profile threshold.' : 'Appraisal has not passed for this profile.' },
    { checkId: 'freshness', status: freshnessReady ? 'pass' : 'unknown', reason: freshnessReady ? 'Freshness is explicitly assessed.' : 'Freshness remains unknown or stale for this profile.' },
    { checkId: 'temporal', status: temporalReady ? 'pass' : 'unknown', reason: temporalReady ? 'Subject-matter period is explicit.' : 'Subject-matter period is not assessed.' },
    { checkId: 'archive', status: archiveReady ? 'pass' : 'unknown', reason: archiveReady ? 'Archive durability meets the profile threshold.' : 'Archive durability has not passed for this profile.' },
    { checkId: 'facets', status: allFacetsAccounted ? 'pass' : 'unknown', reason: allFacetsAccounted ? 'Every mandatory facet is assessed or not applicable.' : 'One or more mandatory facets remain unknown.' },
    { checkId: 'review', status: reviewReady ? 'pass' : 'unknown', reason: reviewReady ? 'Completeness and profile-specific review receipts have passed.' : 'Required completeness or profile-specific review receipts are absent.' },
    { checkId: 'monitoring', status: monitoringReady ? 'pass' : 'unknown', reason: monitoringReady ? 'Monitoring meets the profile threshold.' : 'Monitoring is not configured for the profile.' },
    { checkId: 'child_coverage', status: childCoverageReady ? 'pass' : 'unknown', reason: childCoverageReady ? 'Required child coverage is assessed or not applicable.' : 'Required child coverage remains implicit or unknown.' },
  ]
  const requiredCheckIds = profile === 'internal_navigation'
    ? new Set(['scope', 'inventory', 'evidence', 'facets', 'review', 'child_coverage'])
    : profile === 'internal_analysis'
      ? new Set(['scope', 'inventory', 'evidence', 'verification', 'citation', 'temporal', 'facets', 'review', 'child_coverage'])
      : profile === 'external_claim'
        ? new Set(['scope', 'inventory', 'evidence', 'verification', 'citation', 'appraisal', 'freshness', 'temporal', 'archive', 'facets', 'review', 'child_coverage'])
        : new Set(rawChecks.map((check) => check.checkId))
  const checks = rawChecks.filter((check) => requiredCheckIds.has(check.checkId))
  const failingChecks = checks.filter((check) => check.status !== 'pass')
  return {
    profileId: profile,
    thresholdsVersion: 'coverage-readiness-v1',
    computedAt,
    computedBy: 'scripts/knowledge/generate-coverage-ledger.ts@' + GENERATOR_VERSION,
    completeForProfile: failingChecks.length === 0,
    reasons: failingChecks.map((check) => check.reason),
    checks,
  }
}

function validateAssessmentSemantics(assessment: CoverageAssessment) {
  if (assessment.workflowStage === 'unassessed') {
    assert(assessment.inventoryState === 'unknown', assessment.assessmentId + ' unassessed inventory must remain unknown')
    assert(assessment.knowledgeDepth === 'unknown', assessment.assessmentId + ' unassessed knowledge depth must remain unknown')
    assert(assessment.verificationStatus === 'unverified', assessment.assessmentId + ' unassessed verification must remain unverified')
    assert(assessment.citationReadiness === 'not_assessed', assessment.assessmentId + ' unassessed citation readiness must be not_assessed')
    assert(assessment.method === null, assessment.assessmentId + ' unassessed method must remain null')
    assert(assessment.evidenceLinks.length === 0, assessment.assessmentId + ' unassessed evidence links must remain empty')
    assert(assessment.reviewReceipts.length === 0, assessment.assessmentId + ' unassessed review receipts must remain empty')
    assert(assessment.readinessResult === null, assessment.assessmentId + ' scope registration cannot carry computed readiness')
  }
  if (assessment.inventoryState === 'none_observed') {
    assert(assessment.method?.methodType === 'negative_search', assessment.assessmentId + ' none_observed requires a negative search method')
    assert(assessment.method.searchBoundary, assessment.assessmentId + ' none_observed requires a search boundary')
    assert(assessment.method.sourcesChecked.length > 0, assessment.assessmentId + ' none_observed requires sources checked')
    assert(assessment.evidenceLinks.length > 0, assessment.assessmentId + ' none_observed requires evidence links')
    assert(assessment.reviewReceipts.length > 0, assessment.assessmentId + ' none_observed requires a review receipt')
  }
  if (assessment.assessmentWorkflowState === 'audited') {
    assert(assessment.method, assessment.assessmentId + ' audited requires an assessment method')
    assert(assessment.evidenceLinks.length > 0, assessment.assessmentId + ' audited requires evidence links')
    assert(assessment.reviewReceipts.length > 0, assessment.assessmentId + ' audited requires review receipts')
  }
  if (assessment.citationReadiness === 'citable_external') {
    assert(assessment.verificationStatus === 'human_verified', assessment.assessmentId + ' external citation readiness requires human verification')
    assert(assessment.evidenceLinks.some((link) => Boolean(link.sourceCitationId) && exactLocatorPresent(link)), assessment.assessmentId + ' external citation readiness requires exact cited evidence')
    assert(assessment.reviewReceipts.some((receipt) => receipt.reviewType === 'external_readiness_review' && receipt.decision === 'approved'), assessment.assessmentId + ' external citation readiness requires an approved review')
  }
}

function buildSourceSnapshotSet(root: string, baseline: BaselineManifest): SourceSnapshotSet {
  verifyBaseCommit(root, baseline.baseCommit)
  const paths = [
    ...baseline.sourceArtifacts,
    ...baseline.unmigratedInputs.map((item) => item.path),
    ...baseline.rules.flatMap((rule) => rule.assessment.artifactPaths ?? []),
  ]
  const normalizedPaths = [...new Set(paths.map((item) => safeRelativePath(root, item)))].sort()
  const snapshots = normalizedPaths.map((item) => snapshotArtifact(root, item, baseline.baseCommit))
  assert(unique(snapshots.map((item) => item.artifactSnapshotId)), 'Artifact snapshot IDs must be unique')
  const baselineId = baseline.baselineId ?? 'baseline.nordic_knowledge_foundation.v1'
  const withoutHash = {
    schemaVersion: '1.0.0',
    baselineId,
    snapshotDate: baseline.snapshotDate,
    baseCommit: baseline.baseCommit,
    generatorVersion: GENERATOR_VERSION,
    snapshots,
  }
  return {
    ...withoutHash,
    sourceSnapshotSetHash: sha256(canonicalJson(withoutHash)),
  }
}

function assertControlledIds(
  ontology: Ontology,
  dimension: string,
  ids: string[],
  context: string,
) {
  const allowed = new Set((ontology.dimensions[dimension] ?? []).filter((term) => !term.deprecated).map((term) => term.id))
  for (const id of ids) assert(allowed.has(id), context + ' has unknown or deprecated ' + dimension + ' ID ' + id)
}

function buildFacetSet(
  representedIds: string[],
  missingIds: string[],
  notApplicableIds: string[],
): FacetSet {
  const hasAssessment = representedIds.length + missingIds.length + notApplicableIds.length > 0
  return {
    assessmentState: hasAssessment ? 'assessed' : 'unknown',
    representedIds: [...new Set(representedIds)].sort(),
    missingIds: [...new Set(missingIds)].sort(),
    notApplicableIds: [...new Set(notApplicableIds)].sort(),
    notApplicableReason: null,
  }
}

function unknownSystemBoundary(): SystemBoundary {
  return {
    state: 'unknown',
    included: [],
    excluded: [],
    functionalUnit: null,
    answer: null,
    limitations: [],
    notApplicableReason: null,
  }
}

function unknownUniverseDefinition(): UniverseDefinition {
  return {
    state: 'unknown',
    population: null,
    estimate: null,
    minimum: null,
    maximum: null,
    asOf: null,
    methodNote: null,
    notApplicableReason: null,
  }
}

function buildAssessments(
  ontology: Ontology,
  baseline: BaselineManifest,
  cells: CoverageCell[],
  sourceSnapshotSet: SourceSnapshotSet,
): CoverageAssessment[] {
  validateDate(baseline.snapshotDate, 'baseline.snapshotDate')
  assert(['proposed', 'adopted'].includes(baseline.adoptionStatus), 'baseline.adoptionStatus must be proposed or adopted')
  validateProjectionState(ontology, baseline.defaultProjection, 'baseline.defaultProjection')

  const profileIds = new Set(ontology.coverageProfiles.map((profile) => profile.id))
  const snapshotByPath = new Map(sourceSnapshotSet.snapshots.map((snapshot) => [snapshot.path, snapshot]))
  const registeredCells = new Set<string>()
  const assessmentIds = new Set<string>()
  const ruleIds = baseline.rules.map((rule) => rule.id)
  assert(unique(ruleIds), 'Baseline rule IDs must be unique')
  const assessments: CoverageAssessment[] = []
  const baselineId = baseline.baselineId ?? 'baseline.nordic_knowledge_foundation.v1'
  const baselineSnapshotId = 'snapshot.v1.' + sourceSnapshotSet.sourceSnapshotSetHash.slice('sha256:'.length, 'sha256:'.length + 20)

  for (const rule of baseline.rules) {
    assert(profileIds.has(rule.selector.profileId), rule.id + ' uses unknown profile ' + rule.selector.profileId)
    const merged = { ...baseline.defaultProjection, ...rule.assessment } as ProjectionState
    validateProjectionState(ontology, merged, rule.id)
    const matches = cells.filter((cell) => cellMatchesRule(cell, rule))
    assert(matches.length > 0, rule.id + ' matched no cells')

    for (const cell of matches) {
      assert(!registeredCells.has(cell.cellId), 'Multiple baseline rules matched ' + cell.cellId)
      registeredCells.add(cell.cellId)
      const artifactPaths = [...new Set(rule.assessment.artifactPaths ?? [])].sort()
      const artifactSnapshotIds = artifactPaths.map((path) => {
        const snapshot = snapshotByPath.get(path.replaceAll('\\', '/'))
        assert(snapshot, rule.id + ' artifact is missing from source snapshot set: ' + path)
        return snapshot.artifactSnapshotId
      })

      const eventKind = rule.assessment.eventKind ?? 'scope_registration'
      const representedCommodityIds = rule.assessment.representedCommodityIds ?? []
      const missingCommodityIds = rule.assessment.missingCommodityIds ?? []
      const notApplicableCommodityIds = rule.assessment.notApplicableCommodityIds ?? []
      const representedActorClassIds = rule.assessment.representedActorClassIds ?? []
      const missingActorClassIds = rule.assessment.missingActorClassIds ?? []
      const notApplicableActorClassIds = rule.assessment.notApplicableActorClassIds ?? []
      const representedFlowClassIds = rule.assessment.representedFlowClassIds ?? []
      const missingFlowClassIds = rule.assessment.missingFlowClassIds ?? []
      const notApplicableFlowClassIds = rule.assessment.notApplicableFlowClassIds ?? []
      const representedOutcomeIds = rule.assessment.representedOutcomeIds ?? []
      const missingOutcomeIds = rule.assessment.missingOutcomeIds ?? []
      const notApplicableOutcomeIds = rule.assessment.notApplicableOutcomeIds ?? []
      const representedGeographyIds = rule.assessment.representedGeographyIds ?? []
      const missingGeographyIds = rule.assessment.missingGeographyIds ?? []
      const notApplicableGeographyIds = rule.assessment.notApplicableGeographyIds ?? []

      assertControlledIds(ontology, 'commodityMaterialGroups', [
        ...representedCommodityIds,
        ...missingCommodityIds,
        ...notApplicableCommodityIds,
      ], rule.id)
      assertControlledIds(ontology, 'actorClasses', [
        ...representedActorClassIds,
        ...missingActorClassIds,
        ...notApplicableActorClassIds,
      ], rule.id)
      assertControlledIds(ontology, 'flowClasses', [
        ...representedFlowClassIds,
        ...missingFlowClassIds,
        ...notApplicableFlowClassIds,
      ], rule.id)
      assertControlledIds(ontology, 'outcomes', [
        ...representedOutcomeIds,
        ...missingOutcomeIds,
        ...notApplicableOutcomeIds,
      ], rule.id)
      assertControlledIds(ontology, 'geographies', [
        ...representedGeographyIds,
        ...missingGeographyIds,
        ...notApplicableGeographyIds,
      ], rule.id)

      const facetCoverage: FacetCoverage = {
        geographies: buildFacetSet(representedGeographyIds, missingGeographyIds, notApplicableGeographyIds),
        commodities: buildFacetSet(representedCommodityIds, missingCommodityIds, notApplicableCommodityIds),
        actorClasses: buildFacetSet(representedActorClassIds, missingActorClassIds, notApplicableActorClassIds),
        flowClasses: buildFacetSet(representedFlowClassIds, missingFlowClassIds, notApplicableFlowClassIds),
        outcomes: buildFacetSet(representedOutcomeIds, missingOutcomeIds, notApplicableOutcomeIds),
        childDimensions: buildFacetSet([], [], []),
      }
      const semanticWithoutReadiness = {
        eventKind,
        baselineId,
        baselineAdoptionStatus: baseline.adoptionStatus,
        baselineSnapshotId,
        baseCommit: baseline.baseCommit,
        cellId: cell.cellId,
        schemaVersion: '1.0.0',
        taxonomyVersion: ontology.ontologyVersion,
        artifactSnapshotIds,
        auditObservedAt: baseline.snapshotDate,
        recordedAt: baseline.snapshotDate,
        retrievedAt: baseline.snapshotDate,
        assessedAt: baseline.snapshotDate,
        sourceLastModified: null,
        sourceUpdatedThrough: null,
        assessmentValidFrom: baseline.snapshotDate,
        assessmentValidTo: null,
        workflowStage: merged.workflowStage,
        scopeState: merged.scopeState,
        inventoryState: merged.inventoryState,
        knowledgeDepth: merged.knowledgeDepth,
        verificationStatus: merged.verificationStatus,
        citationReadiness: merged.citationReadiness,
        appraisalState: merged.appraisalState,
        freshnessState: merged.freshnessState,
        temporalDepth: merged.temporalDepth,
        archiveState: merged.archiveState,
        confidence: merged.confidence,
        assessmentWorkflowState: merged.assessmentWorkflowState,
        evidenceBasis: merged.evidenceBasis,
        subjectMatterPeriods: rule.assessment.periods ?? [],
        systemBoundary: rule.assessment.systemBoundary ?? unknownSystemBoundary(),
        universeDefinition: rule.assessment.universeDefinition ?? unknownUniverseDefinition(),
        unit: rule.assessment.unit ?? null,
        method: rule.assessment.method ?? null,
        evidenceLinks: rule.assessment.evidenceLinks ?? [],
        reviewReceipts: rule.assessment.reviewReceipts ?? [],
        facetCoverage,
        limitations: rule.assessment.limitations ?? [],
        operationalGap: {
          route: merged.gapRoute,
          status: merged.gapRoute === 'none' ? 'closed' as const : merged.workflowStage === 'unassessed' ? 'unknown' as const : 'open' as const,
          controlRefs: [],
          nextAction: merged.nextAction,
          owner: merged.owner,
        },
        monitoring: {
          cadence: merged.cadence,
          nextReviewAt: merged.nextReviewAt || null,
          trigger: null,
          stalenessThresholdDays: null,
        },
        supersedesId: rule.assessment.supersedesId ?? null,
      }
      const readinessSubject = semanticWithoutReadiness as unknown as Partial<CoverageAssessment> & AssessmentStatusState
      const readinessResult = eventKind === 'scope_registration'
        ? null
        : computeReadiness(cell.requiredReadinessProfile, baseline.snapshotDate, readinessSubject)
      const semanticWithReadiness = { ...semanticWithoutReadiness, readinessResult }
      const semanticHash = sha256(canonicalJson(semanticWithReadiness))
      const assessmentId = 'assess.v1.' + baseline.snapshotDate + '.' + semanticHash.slice('sha256:'.length, 'sha256:'.length + 20)
      assert(!assessmentIds.has(assessmentId), 'Assessment ID collision: ' + assessmentId)
      assessmentIds.add(assessmentId)
      const withoutHash = { assessmentId, ...semanticWithReadiness }
      const assessment: CoverageAssessment = {
        ...withoutHash,
        contentHash: sha256(canonicalJson(withoutHash)),
      }
      validateAssessmentSemantics(assessment)
      assessments.push(assessment)
    }
  }

  assessments.sort((a, b) => a.cellId.localeCompare(b.cellId) || a.assessmentId.localeCompare(b.assessmentId))
  const knownIds = new Set(assessments.map((assessment) => assessment.assessmentId))
  for (const assessment of assessments) {
    if (assessment.supersedesId) {
      assert(knownIds.has(assessment.supersedesId), assessment.assessmentId + ' supersedes an unknown assessment')
      assert(assessment.supersedesId !== assessment.assessmentId, assessment.assessmentId + ' cannot supersede itself')
    }
  }
  return assessments
}

function projectionStateFrom(value: ProjectionState | CoverageAssessment): ProjectionState {
  const operationalGap = 'operationalGap' in value ? value.operationalGap : null
  const monitoring = 'monitoring' in value ? value.monitoring : null
  return {
    workflowStage: value.workflowStage,
    scopeState: value.scopeState,
    inventoryState: value.inventoryState,
    knowledgeDepth: value.knowledgeDepth,
    verificationStatus: value.verificationStatus,
    citationReadiness: value.citationReadiness,
    appraisalState: value.appraisalState,
    freshnessState: value.freshnessState,
    temporalDepth: value.temporalDepth,
    archiveState: value.archiveState,
    confidence: value.confidence,
    gapRoute: operationalGap?.route ?? (value as ProjectionState).gapRoute,
    assessmentWorkflowState: value.assessmentWorkflowState,
    evidenceBasis: value.evidenceBasis,
    nextAction: operationalGap?.nextAction ?? (value as ProjectionState).nextAction,
    owner: operationalGap?.owner ?? (value as ProjectionState).owner,
    nextReviewAt: monitoring
      ? monitoring.nextReviewAt ?? '9999-12-31'
      : (value as ProjectionState).nextReviewAt,
    cadence: monitoring ? monitoring.cadence : (value as ProjectionState).cadence,
  }
}

function buildLedgerRecords(
  ontology: Ontology,
  baseline: BaselineManifest,
  cells: CoverageCell[],
  assessments: CoverageAssessment[],
): CoverageLedgerRecord[] {
  const latestByCell = new Map<string, CoverageAssessment>()
  for (const assessment of assessments) {
    const previous = latestByCell.get(assessment.cellId)
    if (!previous || assessment.recordedAt > previous.recordedAt || (
      assessment.recordedAt === previous.recordedAt && assessment.assessmentId > previous.assessmentId
    )) latestByCell.set(assessment.cellId, assessment)
  }
  const profiles = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  return cells.map((cell) => {
    const assessment = latestByCell.get(cell.cellId) ?? null
    const currentState = projectionStateFrom(assessment ?? baseline.defaultProjection)
    const detailedReadinessResult = assessment?.readinessResult
      ?? computeReadiness(cell.requiredReadinessProfile, baseline.snapshotDate, {
        ...currentState,
        systemBoundary: unknownSystemBoundary(),
        universeDefinition: unknownUniverseDefinition(),
        subjectMatterPeriods: [],
        method: null,
        evidenceLinks: [],
        reviewReceipts: [],
        facetCoverage: {
          geographies: buildFacetSet([], [], []),
          commodities: buildFacetSet([], [], []),
          actorClasses: buildFacetSet([], [], []),
          flowClasses: buildFacetSet([], [], []),
          outcomes: buildFacetSet([], [], []),
          childDimensions: buildFacetSet([], [], []),
        },
        monitoring: {
          cadence: currentState.cadence,
          nextReviewAt: currentState.nextReviewAt,
          trigger: null,
          stalenessThresholdDays: null,
        },
      })
    const projectedReadinessResult = {
      profileId: detailedReadinessResult.profileId,
      thresholdsVersion: detailedReadinessResult.thresholdsVersion,
      completeForProfile: detailedReadinessResult.completeForProfile,
      nonPassingCheckIds: detailedReadinessResult.checks
        .filter((check) => check.status !== 'pass' && check.status !== 'not_applicable')
        .map((check) => check.checkId),
    }
    assert(profiles.has(cell.profileId), 'Unknown profile for ledger cell ' + cell.cellId)
    return {
      cell,
      stateOrigin: assessment ? 'explicit_event' : 'baseline_default',
      latestAssessment: assessment,
      currentState,
      projectedReadinessResult,
    }
  })
}

function csvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

function csv(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvValue).join(',')).join('\n') + '\n'
}

function termLabel(ontology: Ontology, dimension: string, id: string | null): string {
  if (!id) return ''
  return ontology.dimensions[dimension]?.find((term) => term.id === id)?.labelEn ?? ''
}

function buildCellsCsv(ontology: Ontology, cells: CoverageCell[]): string {
  const rows: unknown[][] = [[
    'cell_id',
    'profile_id',
    'aggregation_class',
    'geography_id',
    'geography_label',
    'axis_bindings_json',
    'value_chain_stage_id',
    'value_chain_stage_label',
    'domain_id',
    'domain_label',
    'legacy_field_id',
    'legacy_field_label',
    'cell_tier',
    'parent_cell_id',
    'child_dimension_bindings_json',
    'child_specification_state',
    'required_child_dimensions_json',
    'required_child_cell_ids_json',
    'required_units_json',
    'system_boundary_question',
    'population_definition_json',
    'required_readiness_profile',
    'taxonomy_version',
    'active',
  ]]
  for (const cell of cells) {
    rows.push([
      cell.cellId,
      cell.profileId,
      cell.aggregationClass,
      cell.geographyId,
      termLabel(ontology, 'geographies', cell.geographyId),
      canonicalJson(cell.axisBindings),
      cell.valueChainStageId,
      termLabel(ontology, 'valueChainStages', cell.valueChainStageId),
      cell.domainId,
      termLabel(ontology, 'domains', cell.domainId),
      cell.legacyFieldId,
      termLabel(ontology, 'legacyFields', cell.legacyFieldId),
      cell.cellTier,
      cell.parentCellId,
      canonicalJson(cell.childDimensionBindings),
      cell.childSpecificationState,
      canonicalJson(cell.requiredChildDimensions),
      canonicalJson(cell.requiredChildCellIds),
      canonicalJson(cell.requiredUnits),
      cell.systemBoundaryQuestion,
      canonicalJson(cell.populationDefinition),
      cell.requiredReadinessProfile,
      cell.taxonomyVersion,
      cell.active,
    ])
  }
  return csv(rows)
}

function buildLedgerCsv(records: CoverageLedgerRecord[]): string {
  const rows: unknown[][] = [[
    'cell_id',
    'profile_id',
    'aggregation_class',
    'geography_id',
    'axis_bindings_json',
    'cell_tier',
    'parent_cell_id',
    'child_dimension_bindings_json',
    'child_specification_state',
    'required_child_dimensions_json',
    'required_child_cell_ids_json',
    'required_units_json',
    'system_boundary_question',
    'population_definition_json',
    'required_readiness_profile',
    'state_origin',
    'assessment_id',
    'event_kind',
    'baseline_id',
    'baseline_adoption_status',
    'baseline_snapshot_id',
    'base_commit',
    'audit_observed_at',
    'recorded_at',
    'retrieved_at',
    'assessed_at',
    'source_last_modified',
    'source_updated_through',
    'assessment_valid_from',
    'assessment_valid_to',
    'workflow_stage',
    'scope_state',
    'inventory_state',
    'knowledge_depth',
    'verification_status',
    'citation_readiness',
    'appraisal_state',
    'freshness_state',
    'temporal_depth',
    'archive_state',
    'confidence',
    'assessment_workflow_state',
    'evidence_basis',
    'subject_matter_periods_json',
    'system_boundary_json',
    'universe_definition_json',
    'unit',
    'method_json',
    'evidence_links_json',
    'review_receipts_json',
    'facet_coverage_json',
    'artifact_snapshot_ids_json',
    'readiness_result_json',
    'projected_readiness_result_json',
    'operational_gap_json',
    'monitoring_json',
    'limitations_json',
    'supersedes_id',
    'content_hash',
    'latest_assessment_json',
  ]]

  for (const record of records) {
    const assessment = record.latestAssessment
    const state = record.currentState
    rows.push([
      record.cell.cellId,
      record.cell.profileId,
      record.cell.aggregationClass,
      record.cell.geographyId,
      canonicalJson(record.cell.axisBindings),
      record.cell.cellTier,
      record.cell.parentCellId,
      canonicalJson(record.cell.childDimensionBindings),
      record.cell.childSpecificationState,
      canonicalJson(record.cell.requiredChildDimensions),
      canonicalJson(record.cell.requiredChildCellIds),
      canonicalJson(record.cell.requiredUnits),
      record.cell.systemBoundaryQuestion,
      canonicalJson(record.cell.populationDefinition),
      record.cell.requiredReadinessProfile,
      record.stateOrigin,
      assessment?.assessmentId,
      assessment?.eventKind,
      assessment?.baselineId,
      assessment?.baselineAdoptionStatus,
      assessment?.baselineSnapshotId,
      assessment?.baseCommit,
      assessment?.auditObservedAt,
      assessment?.recordedAt,
      assessment?.retrievedAt,
      assessment?.assessedAt,
      assessment?.sourceLastModified,
      assessment?.sourceUpdatedThrough,
      assessment?.assessmentValidFrom,
      assessment?.assessmentValidTo,
      state.workflowStage,
      state.scopeState,
      state.inventoryState,
      state.knowledgeDepth,
      state.verificationStatus,
      state.citationReadiness,
      state.appraisalState,
      state.freshnessState,
      state.temporalDepth,
      state.archiveState,
      state.confidence,
      state.assessmentWorkflowState,
      state.evidenceBasis,
      canonicalJson(assessment?.subjectMatterPeriods ?? []),
      canonicalJson(assessment?.systemBoundary ?? null),
      canonicalJson(assessment?.universeDefinition ?? null),
      assessment?.unit,
      canonicalJson(assessment?.method ?? null),
      canonicalJson(assessment?.evidenceLinks ?? []),
      canonicalJson(assessment?.reviewReceipts ?? []),
      canonicalJson(assessment?.facetCoverage ?? null),
      canonicalJson(assessment?.artifactSnapshotIds ?? []),
      canonicalJson(assessment?.readinessResult ?? null),
      canonicalJson(record.projectedReadinessResult),
      canonicalJson(assessment?.operationalGap ?? null),
      canonicalJson(assessment?.monitoring ?? null),
      canonicalJson(assessment?.limitations ?? []),
      assessment?.supersedesId,
      assessment?.contentHash,
      canonicalJson(assessment),
    ])
  }
  return csv(rows)
}

function increment(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1
}

function buildSummary(
  ontology: Ontology,
  baseline: BaselineManifest,
  records: CoverageLedgerRecord[],
  sourceSnapshotSet: SourceSnapshotSet,
) {
  const summary = {
    schemaVersion: '1.0.0',
    generatedAt: baseline.snapshotDate,
    generator: 'scripts/knowledge/generate-coverage-ledger.ts',
    generatorVersion: GENERATOR_VERSION,
    baselineId: baseline.baselineId ?? 'baseline.nordic_knowledge_foundation.v1',
    baselineAdoptionStatus: baseline.adoptionStatus,
    baseCommit: baseline.baseCommit,
    sourceSnapshotSetHash: sourceSnapshotSet.sourceSnapshotSetHash,
    ontologyId: ontology.ontologyId,
    taxonomyVersion: ontology.ontologyVersion,
    profileCount: ontology.coverageProfiles.length,
    semantics: {
      definedCell: 'A unit required by a named scope profile; it is not proof that the subject has been researched.',
      explicitEvent: 'A recorded baseline event, including scope-registration events that intentionally leave subject matter unassessed.',
      evidenceBackedAssessment: 'An event with a stated method, typed evidence link and review receipt.',
      noCrossProfileAggregation: 'Political-Nordic, Sápmi and legacy migration profiles are reported separately and must never be summed as a completeness score.',
    },
    byProfile: {} as Record<string, {
      aggregationClass: string
      requiredReadinessProfile: string
      definedCellCount: number
      explicitEventCount: number
      evidenceBackedAssessmentEventCount: number
      cellsWithoutExplicitEventCount: number
      completeForRequiredProfileCount: number
      currentStateCounts: Record<string, Record<string, number>>
      byGeography: Record<string, {
        definedCellCount: number
        explicitEventCount: number
        evidenceBackedAssessmentEventCount: number
        completeForRequiredProfileCount: number
        currentStateCounts: Record<string, Record<string, number>>
      }>
    }>,
  }

  const profileById = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  for (const record of records) {
    const profileDefinition = profileById.get(record.cell.profileId)
    assert(profileDefinition, 'Unknown summary profile ' + record.cell.profileId)
    const profile = summary.byProfile[record.cell.profileId] ?? {
      aggregationClass: record.cell.aggregationClass,
      requiredReadinessProfile: record.cell.requiredReadinessProfile,
      definedCellCount: 0,
      explicitEventCount: 0,
      evidenceBackedAssessmentEventCount: 0,
      cellsWithoutExplicitEventCount: 0,
      completeForRequiredProfileCount: 0,
      currentStateCounts: {},
      byGeography: {},
    }
    const geography = profile.byGeography[record.cell.geographyId] ?? {
      definedCellCount: 0,
      explicitEventCount: 0,
      evidenceBackedAssessmentEventCount: 0,
      completeForRequiredProfileCount: 0,
      currentStateCounts: {},
    }
    profile.definedCellCount++
    geography.definedCellCount++
    if (record.latestAssessment) {
      profile.explicitEventCount++
      geography.explicitEventCount++
      if (
        record.latestAssessment.eventKind !== 'scope_registration'
        && record.latestAssessment.method
        && record.latestAssessment.evidenceLinks.length > 0
        && record.latestAssessment.reviewReceipts.length > 0
      ) {
        profile.evidenceBackedAssessmentEventCount++
        geography.evidenceBackedAssessmentEventCount++
      }
    } else {
      profile.cellsWithoutExplicitEventCount++
    }
    if (record.projectedReadinessResult.completeForProfile) {
      profile.completeForRequiredProfileCount++
      geography.completeForRequiredProfileCount++
    }
    for (const field of Object.keys(STATUS_FIELDS) as Array<keyof typeof STATUS_FIELDS>) {
      const profileCounts = profile.currentStateCounts[field] ?? {}
      const geographyCounts = geography.currentStateCounts[field] ?? {}
      increment(profileCounts, record.currentState[field])
      increment(geographyCounts, record.currentState[field])
      profile.currentStateCounts[field] = profileCounts
      geography.currentStateCounts[field] = geographyCounts
    }
    profile.byGeography[record.cell.geographyId] = geography
    summary.byProfile[record.cell.profileId] = profile
  }
  return summary
}

function jsonLines(values: unknown[]): string {
  return values.map((value) => canonicalJson(value)).join('\n') + '\n'
}

function buildGenerationManifest(
  baseline: BaselineManifest,
  ontology: Ontology,
  outputs: Array<{ path: string; content: string }>,
) {
  return {
    schemaVersion: '1.0.0',
    generator: 'scripts/knowledge/generate-coverage-ledger.ts',
    generatorVersion: GENERATOR_VERSION,
    baselineId: baseline.baselineId ?? 'baseline.nordic_knowledge_foundation.v1',
    baselineAdoptionStatus: baseline.adoptionStatus,
    baseCommit: baseline.baseCommit,
    taxonomyVersion: ontology.ontologyVersion,
    generatedAt: baseline.snapshotDate,
    commitMarkerSemantics: 'This manifest is renamed last after every sibling artifact is staged. Consumers must verify every listed hash.',
    outputs: outputs.map(({ path, content }) => ({
      path,
      sha256: sha256(content),
      sizeBytes: Buffer.byteLength(content),
    })),
  }
}

export function buildCoverageArtifacts(root: string): CoverageArtifacts {
  const ontology = readJson<Ontology>(root, ONTOLOGY_PATH)
  const baseline = readJson<BaselineManifest>(root, BASELINE_PATH)
  validateOntology(ontology)
  const cells = buildCoverageCells(ontology)
  const sourceSnapshotSet = buildSourceSnapshotSet(root, baseline)
  const assessments = buildAssessments(ontology, baseline, cells, sourceSnapshotSet)
  const ledgerRecords = buildLedgerRecords(ontology, baseline, cells, assessments)

  const cellsCsv = buildCellsCsv(ontology, cells)
  const assessmentsJsonl = jsonLines(assessments)
  const ledgerJsonl = jsonLines(ledgerRecords)
  const ledgerCsv = buildLedgerCsv(ledgerRecords)
  const summaryJson = JSON.stringify(buildSummary(ontology, baseline, ledgerRecords, sourceSnapshotSet), null, 2) + '\n'
  const sourceSnapshotsJson = JSON.stringify(sourceSnapshotSet, null, 2) + '\n'
  const generatedOutputs = [
    { path: CELLS_PATH, content: cellsCsv },
    { path: ASSESSMENTS_PATH, content: assessmentsJsonl },
    { path: LEDGER_JSONL_PATH, content: ledgerJsonl },
    { path: LEDGER_CSV_PATH, content: ledgerCsv },
    { path: SUMMARY_PATH, content: summaryJson },
    { path: SOURCE_SNAPSHOTS_PATH, content: sourceSnapshotsJson },
  ]
  const generationManifestJson = JSON.stringify(
    buildGenerationManifest(baseline, ontology, generatedOutputs),
    null,
    2,
  ) + '\n'

  return {
    ontology,
    baseline,
    cells,
    assessments,
    ledgerRecords,
    sourceSnapshotSet,
    cellsCsv,
    assessmentsJsonl,
    ledgerJsonl,
    ledgerCsv,
    summaryJson,
    sourceSnapshotsJson,
    generationManifestJson,
  }
}

function parseJsonLines(content: string): CoverageAssessment[] {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as CoverageAssessment)
}

function protectAssessmentHistory(root: string, baseline: BaselineManifest, expected: string) {
  const absolutePath = resolve(root, ASSESSMENTS_PATH)
  if (!existsSync(absolutePath)) return
  const current = readFileSync(absolutePath, 'utf8')
  const currentById = new Map(parseJsonLines(current).map((assessment) => [assessment.assessmentId, assessment]))
  const expectedAssessments = parseJsonLines(expected)
  for (const assessment of expectedAssessments) {
    const existing = currentById.get(assessment.assessmentId)
    if (existing) {
      assert(
        existing.contentHash === assessment.contentHash && canonicalJson(existing) === canonicalJson(assessment),
        'Assessment ID mutation detected: ' + assessment.assessmentId,
      )
    }
  }
  if (baseline.adoptionStatus === 'adopted') {
    assert(current === expected, 'Adopted baseline assessment history is immutable; append a superseding event in a new version')
  }
}

function artifactBundle(artifacts: CoverageArtifacts): Array<{ path: string; content: string }> {
  return [
    { path: CELLS_PATH, content: artifacts.cellsCsv },
    { path: ASSESSMENTS_PATH, content: artifacts.assessmentsJsonl },
    { path: LEDGER_JSONL_PATH, content: artifacts.ledgerJsonl },
    { path: LEDGER_CSV_PATH, content: artifacts.ledgerCsv },
    { path: SUMMARY_PATH, content: artifacts.summaryJson },
    { path: SOURCE_SNAPSHOTS_PATH, content: artifacts.sourceSnapshotsJson },
    { path: GENERATION_MANIFEST_PATH, content: artifacts.generationManifestJson },
  ]
}

function writeOrCheckBundle(root: string, artifacts: CoverageArtifacts, check: boolean) {
  const bundle = artifactBundle(artifacts)
  if (check) {
    for (const item of bundle) {
      const absolutePath = resolve(root, item.path)
      assert(existsSync(absolutePath), 'Missing generated file: ' + item.path)
      assert(readFileSync(absolutePath, 'utf8') === item.content, 'Generated file is stale: ' + item.path)
    }
    return
  }

  protectAssessmentHistory(root, artifacts.baseline, artifacts.assessmentsJsonl)
  const staged: Array<{ target: string; temporary: string }> = []
  try {
    for (const [index, item] of bundle.entries()) {
      const target = resolve(root, item.path)
      mkdirSync(dirname(target), { recursive: true })
      const temporary = resolve(dirname(target), '.' + basename(target) + '.' + process.pid + '.' + index + '.tmp')
      if (existsSync(temporary)) unlinkSync(temporary)
      writeFileSync(temporary, item.content, { encoding: 'utf8', flag: 'wx' })
      staged.push({ target, temporary })
    }
    const manifest = staged.pop()
    assert(manifest, 'Generation manifest was not staged')
    for (const item of staged) renameSync(item.temporary, item.target)
    renameSync(manifest.temporary, manifest.target)
  } finally {
    for (const item of staged) if (existsSync(item.temporary)) unlinkSync(item.temporary)
  }
}

export function run(root = process.cwd(), check = process.argv.includes('--check')) {
  const artifacts = buildCoverageArtifacts(root)
  writeOrCheckBundle(root, artifacts, check)
  const verb = check ? 'verified' : 'generated'
  const profileCounts = Object.entries(
    artifacts.cells.reduce<Record<string, number>>((counts, cell) => {
      counts[cell.profileId] = (counts[cell.profileId] ?? 0) + 1
      return counts
    }, {}),
  ).map(([profile, count]) => profile + '=' + count).join(', ')
  const evidenceBackedEvents = artifacts.assessments.filter((assessment) => (
    assessment.eventKind !== 'scope_registration'
    && assessment.method
    && assessment.evidenceLinks.length > 0
    && assessment.reviewReceipts.length > 0
  )).length
  console.log(
    'Knowledge coverage ' + verb + ': ' + profileCounts
    + '; explicit events=' + artifacts.assessments.length
    + '; evidence-backed events=' + evidenceBackedEvents,
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
