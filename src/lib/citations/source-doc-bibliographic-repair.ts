import { createHash } from 'node:crypto'

export const SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS = ['src-88', 'src-89'] as const

export const SOURCE_DOC_BIBLIOGRAPHIC_MUTABLE_FIELDS = [
  'title',
  'author',
  'url',
  'publisher',
  'provenanceType',
  'accessedAt',
] as const

export const SOURCE_CITATION_BIBLIOGRAPHIC_MUTABLE_FIELDS = [
  'sourceClass',
  'citationReadiness',
  'citationText',
  'title',
  'publisher',
  'author',
  'year',
  'url',
  'accessedAt',
] as const

export type SourceDocBibliographicSnapshot = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  doi: string | null
  publisher: string | null
  provenanceType: string
  accessedAt: Date | string | null
  archivedUrl: string | null
  documentId: string | null
}

export type SourceDocBibliographicSeedInput = {
  id: string
  filename: string
  title?: string | null
  author?: string | null
  year?: string | number | null
  type: string
  description: string
  relevance: string
  url?: string | null
  isDuplicate?: boolean
  doi?: string | null
  publisher?: string | null
  provenanceType?: string | null
  accessedAt?: Date | string | null
  archivedUrl?: string | null
}

export type SourceDocFieldCitationSnapshot = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
  createdAt: Date | string
}

export type SourceCitationBibliographicSnapshot = {
  id: string
  sourceClass: string
  citationReadiness: string
  verificationStatus: string
  citationText: string
  title: string | null
  publisher: string | null
  author: string | null
  year: number | null
  url: string | null
  archivedUrl: string | null
  localPath: string | null
  fileHash: string | null
  contentHash: string | null
  hashAlgorithm: string
  pageRef: string | null
  quote: string | null
  accessedAt: Date | string | null
  captureMethod: string
  verifiedAt: Date | string | null
  verifiedBy: string | null
  confidence: number | null
  notes: string | null
  documentId: string | null
  sourceDocId: string | null
  createdAt: Date | string
  updatedAt: Date | string
  fieldCitations: SourceDocFieldCitationSnapshot[]
}

export type NormalizedSourceDocBibliographicSnapshot = Omit<
  SourceDocBibliographicSnapshot,
  'accessedAt'
> & { accessedAt: string | null }

export type NormalizedSourceCitationBibliographicSnapshot = Omit<
  SourceCitationBibliographicSnapshot,
  'accessedAt' | 'verifiedAt' | 'createdAt' | 'updatedAt' | 'fieldCitations'
> & {
  accessedAt: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  fieldCitations: Array<Omit<SourceDocFieldCitationSnapshot, 'createdAt'> & { createdAt: string }>
}

export type SourceCitationBibliographicTarget = Omit<
  NormalizedSourceCitationBibliographicSnapshot,
  'updatedAt'
>

export type ReviewedSourceDocBibliographicRepair = {
  sourceDocId: string
  citationId: string
  before: {
    sourceDoc: NormalizedSourceDocBibliographicSnapshot
    citation: NormalizedSourceCitationBibliographicSnapshot
  }
  after: {
    sourceDoc: NormalizedSourceDocBibliographicSnapshot
    citation: SourceCitationBibliographicTarget
  }
}

const ACCESSED_AT = '2026-07-19T00:00:00.000Z'
const CITATION_UPDATED_AT = '2026-07-19T19:37:35.477Z'
const FIELD_CITATION_CREATED_AT = '2026-05-19T23:52:33.709Z'
const PUBLISHER = 'Swedish University of Agricultural Sciences'

const src88Before: NormalizedSourceDocBibliographicSnapshot = {
  id: 'src-88',
  filename: 'eriksson-phd-2015.md',
  title: 'Supermarket food waste: Prevention and management at the retail stage',
  author: 'Mattias Eriksson (SLU)',
  year: '2015',
  sourceType: 'forskning',
  description: 'PhD SLU: 6-butikk studie av matsvinn i svensk dagligvare, 1.2% av omsetning.',
  relevance: 'Pionerarbeid paa matsvinnkvantifisering i svensk dagligvare.',
  url: null,
  isDuplicate: false,
  doi: null,
  publisher: null,
  provenanceType: 'unknown',
  accessedAt: null,
  archivedUrl: null,
  documentId: 'cmp8xyj7y004hvvvmram9fkx1',
}

const src88Title = 'Supermarket food waste: prevention and management with the focus on reduced waste for reduced carbon footprint'

const src88CitationBefore: NormalizedSourceCitationBibliographicSnapshot = {
  id: 'cmpdafm1z01cmsxvmdhwn2upo',
  sourceClass: 'unknown',
  citationReadiness: 'blocked_unsourced',
  verificationStatus: 'needs_review',
  citationText: 'SourceDoc linked document: Supermarket food waste: Prevention and management at the retail stage',
  title: src88Before.title,
  publisher: null,
  author: src88Before.author,
  year: 2015,
  url: null,
  archivedUrl: null,
  localPath: null,
  fileHash: null,
  contentHash: null,
  hashAlgorithm: 'sha256',
  pageRef: null,
  quote: null,
  accessedAt: null,
  captureMethod: 'backfill-existing-locators',
  verifiedAt: null,
  verifiedBy: null,
  confidence: null,
  notes: null,
  documentId: src88Before.documentId,
  sourceDocId: src88Before.id,
  createdAt: '2026-05-19T23:52:33.383Z',
  updatedAt: CITATION_UPDATED_AT,
  fieldCitations: [{
    id: 'cmpdafmb303bvsxvmu4rowxkp',
    citationId: 'cmpdafm1z01cmsxvmdhwn2upo',
    entityType: 'SourceDoc',
    entityId: 'src-88',
    fieldPath: 'documentId',
    claimText: null,
    confidence: null,
    createdAt: FIELD_CITATION_CREATED_AT,
  }],
}

const src89Before: NormalizedSourceDocBibliographicSnapshot = {
  id: 'src-89',
  filename: 'sundin-phd-2024.md',
  title: 'Sustainability of food waste prevention',
  author: 'Nils Sundin (SLU)',
  year: '2024',
  sourceType: 'forskning',
  description: 'PhD SLU: 32% husholdningsavfall forebyggbart, men kun 0.5% av nasjonale utslipp.',
  relevance: 'Nyanserer matsvinndebatt med faktisk klimaeffekt.',
  url: null,
  isDuplicate: false,
  doi: '10.54612/a.2fjqatdg6h',
  publisher: null,
  provenanceType: 'unknown',
  accessedAt: null,
  archivedUrl: null,
  documentId: 'cmp8xyjmw005yvvvmoci2eok9',
}

const src89Title = 'Sustainability of food waste prevention through food consumption'

const src89CitationBefore: NormalizedSourceCitationBibliographicSnapshot = {
  id: 'cmpdafm1g01b6sxvm06xgy98z',
  sourceClass: 'unknown',
  citationReadiness: 'blocked_unsourced',
  verificationStatus: 'needs_review',
  citationText: 'SourceDoc linked document: Sustainability of food waste prevention',
  title: src89Before.title,
  publisher: null,
  author: src89Before.author,
  year: 2024,
  url: null,
  archivedUrl: null,
  localPath: null,
  fileHash: null,
  contentHash: null,
  hashAlgorithm: 'sha256',
  pageRef: null,
  quote: null,
  accessedAt: null,
  captureMethod: 'backfill-existing-locators',
  verifiedAt: null,
  verifiedBy: null,
  confidence: null,
  notes: null,
  documentId: src89Before.documentId,
  sourceDocId: src89Before.id,
  createdAt: '2026-05-19T23:52:33.364Z',
  updatedAt: CITATION_UPDATED_AT,
  fieldCitations: [{
    id: 'cmpdafmb303afsxvmglzxyz4c',
    citationId: 'cmpdafm1g01b6sxvm06xgy98z',
    entityType: 'SourceDoc',
    entityId: 'src-89',
    fieldPath: 'documentId',
    claimText: null,
    confidence: null,
    createdAt: FIELD_CITATION_CREATED_AT,
  }],
}

function citationTarget(
  before: NormalizedSourceCitationBibliographicSnapshot,
  values: Pick<
    SourceCitationBibliographicTarget,
    'sourceClass' | 'citationReadiness' | 'citationText' | 'title' | 'publisher' |
      'author' | 'year' | 'url' | 'accessedAt'
  >,
): SourceCitationBibliographicTarget {
  const { updatedAt: _updatedAt, ...stableBefore } = before
  return { ...stableBefore, ...values }
}

export const REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS: readonly ReviewedSourceDocBibliographicRepair[] = [
  {
    sourceDocId: 'src-88',
    citationId: src88CitationBefore.id,
    before: { sourceDoc: src88Before, citation: src88CitationBefore },
    after: {
      sourceDoc: {
        ...src88Before,
        title: src88Title,
        author: 'Mattias Eriksson',
        url: 'https://res.slu.se/id/publ/68633',
        publisher: PUBLISHER,
        provenanceType: 'external_publication',
        accessedAt: ACCESSED_AT,
      },
      citation: citationTarget(src88CitationBefore, {
        sourceClass: 'secondary',
        citationReadiness: 'citable_with_note',
        citationText: `SourceDoc linked document: ${src88Title}`,
        title: src88Title,
        publisher: PUBLISHER,
        author: 'Mattias Eriksson',
        year: 2015,
        url: 'https://res.slu.se/id/publ/68633',
        accessedAt: ACCESSED_AT,
      }),
    },
  },
  {
    sourceDocId: 'src-89',
    citationId: src89CitationBefore.id,
    before: { sourceDoc: src89Before, citation: src89CitationBefore },
    after: {
      sourceDoc: {
        ...src89Before,
        title: src89Title,
        author: 'Niina Sundin',
        url: 'https://res.slu.se/id/publ/128772',
        publisher: PUBLISHER,
        provenanceType: 'external_publication',
        accessedAt: ACCESSED_AT,
      },
      citation: citationTarget(src89CitationBefore, {
        sourceClass: 'secondary',
        citationReadiness: 'citable_with_note',
        citationText: `SourceDoc linked document: ${src89Title}`,
        title: src89Title,
        publisher: PUBLISHER,
        author: 'Niina Sundin',
        year: 2024,
        url: 'https://res.slu.se/id/publ/128772',
        accessedAt: ACCESSED_AT,
      }),
    },
  },
]

export const PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256 =
  '8dcf53a4a30a19e3e09055445349c9e44fa268ac500ec0b515a7da01d439f821'

export type SourceDocBibliographicRepairConflict = {
  sourceDocId: string
  code:
    | 'duplicate_source_doc'
    | 'missing_source_doc'
    | 'ambiguous_source_citation'
    | 'missing_source_citation'
    | 'unexpected_source_citation'
    | 'source_doc_snapshot_drift'
    | 'source_citation_snapshot_drift'
    | 'partial_application'
  detail: string
}

export type SourceDocBibliographicRepairUpdate = {
  sourceDocId: string
  citationId: string
  expectedSourceDoc: NormalizedSourceDocBibliographicSnapshot
  targetSourceDoc: NormalizedSourceDocBibliographicSnapshot
  expectedCitation: NormalizedSourceCitationBibliographicSnapshot
  targetCitation: SourceCitationBibliographicTarget
}

export type SourceDocBibliographicRepairPlan = {
  version: 1
  reviewedManifestSha256: string
  updates: SourceDocBibliographicRepairUpdate[]
  alreadyAppliedIds: string[]
  conflicts: SourceDocBibliographicRepairConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
  }
}

function instant(value: Date | string | null, field: string) {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Invalid ${field} timestamp`)
  return parsed.toISOString()
}

function requiredInstant(value: Date | string, field: string) {
  const normalized = instant(value, field)
  if (!normalized) throw new Error(`Missing ${field} timestamp`)
  return normalized
}

export function normalizeSourceDocBibliographicSnapshot(
  row: SourceDocBibliographicSnapshot,
): NormalizedSourceDocBibliographicSnapshot {
  return {
    ...row,
    accessedAt: instant(row.accessedAt, `${row.id}.accessedAt`),
  }
}

export function normalizeSourceCitationBibliographicSnapshot(
  row: SourceCitationBibliographicSnapshot,
): NormalizedSourceCitationBibliographicSnapshot {
  return {
    ...row,
    accessedAt: instant(row.accessedAt, `${row.id}.accessedAt`),
    verifiedAt: instant(row.verifiedAt, `${row.id}.verifiedAt`),
    createdAt: requiredInstant(row.createdAt, `${row.id}.createdAt`),
    updatedAt: requiredInstant(row.updatedAt, `${row.id}.updatedAt`),
    fieldCitations: row.fieldCitations.map(field => ({
      ...field,
      createdAt: requiredInstant(field.createdAt, `${field.id}.createdAt`),
    })).sort((left, right) => left.id.localeCompare(right.id)),
  }
}

export function sha256SourceDocBibliographicJson(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function sourceDocBibliographicManifestContract() {
  return REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => ({
    sourceDocId: repair.sourceDocId,
    citationId: repair.citationId,
    before: repair.before,
    after: repair.after,
  }))
}

function changedKeys(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(before).filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort()
}

export function validateReviewedSourceDocBibliographicRepairs() {
  const repairs = REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS
  if (
    repairs.length !== SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS.length ||
    new Set(repairs.map(repair => repair.sourceDocId)).size !== repairs.length ||
    new Set(repairs.map(repair => repair.citationId)).size !== repairs.length
  ) {
    throw new Error('Reviewed SourceDoc bibliographic repair contract must contain two unique source/citation pairs')
  }
  if (JSON.stringify(repairs.map(repair => repair.sourceDocId)) !== JSON.stringify(SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS)) {
    throw new Error('Reviewed SourceDoc bibliographic ids drifted from the pinned contract')
  }

  for (const repair of repairs) {
    const sourceChanges = changedKeys(repair.before.sourceDoc, repair.after.sourceDoc)
    if (JSON.stringify(sourceChanges) !== JSON.stringify([...SOURCE_DOC_BIBLIOGRAPHIC_MUTABLE_FIELDS].sort())) {
      throw new Error(`Reviewed SourceDoc mutable-field boundary drifted for ${repair.sourceDocId}`)
    }
    const { updatedAt: _updatedAt, ...beforeCitation } = repair.before.citation
    const citationChanges = changedKeys(beforeCitation, repair.after.citation)
    const expectedCitationChanges = SOURCE_CITATION_BIBLIOGRAPHIC_MUTABLE_FIELDS
      .filter(field => field !== 'year')
      .sort()
    if (JSON.stringify(citationChanges) !== JSON.stringify(expectedCitationChanges)) {
      throw new Error(`Reviewed SourceCitation mutable-field boundary drifted for ${repair.citationId}`)
    }
    if (
      repair.after.sourceDoc.id !== repair.sourceDocId ||
      repair.after.citation.id !== repair.citationId ||
      repair.after.citation.sourceDocId !== repair.sourceDocId ||
      repair.after.citation.sourceClass !== 'secondary' ||
      repair.after.citation.citationReadiness !== 'citable_with_note' ||
      repair.after.citation.verificationStatus !== repair.before.citation.verificationStatus ||
      JSON.stringify(repair.after.citation.fieldCitations) !== JSON.stringify(repair.before.citation.fieldCitations)
    ) {
      throw new Error(`Reviewed SourceDoc bibliographic binding or evidence boundary drifted for ${repair.sourceDocId}`)
    }
  }

  const digest = sha256SourceDocBibliographicJson(sourceDocBibliographicManifestContract())
  if (digest !== PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256) {
    throw new Error('Reviewed SourceDoc bibliographic manifest drifted from its pinned SHA-256')
  }
  return repairs
}

export function validateSourceDocBibliographicSeedTargets(
  seedSources: SourceDocBibliographicSeedInput[],
) {
  const repairs = validateReviewedSourceDocBibliographicRepairs()
  for (const repair of repairs) {
    const matches = seedSources.filter(source => source.id === repair.sourceDocId)
    if (matches.length !== 1) {
      throw new Error(`Reviewed seed must contain exactly one SourceDoc ${repair.sourceDocId}`)
    }
    const seed = matches[0]!
    const normalizedSeed = {
      id: seed.id,
      filename: seed.filename,
      title: seed.title ?? null,
      author: seed.author ?? null,
      year: seed.year == null ? null : String(seed.year),
      sourceType: seed.type,
      description: seed.description,
      relevance: seed.relevance,
      url: seed.url ?? null,
      isDuplicate: seed.isDuplicate ?? false,
      doi: seed.doi ?? null,
      publisher: seed.publisher ?? null,
      provenanceType: seed.provenanceType ?? 'unknown',
      accessedAt: instant(seed.accessedAt ?? null, `${seed.id}.seed.accessedAt`),
      archivedUrl: seed.archivedUrl ?? null,
    }
    const { documentId: _documentId, ...reviewedTarget } = repair.after.sourceDoc
    if (JSON.stringify(normalizedSeed) !== JSON.stringify(reviewedTarget)) {
      throw new Error(`Reviewed seed bibliographic target drifted for ${repair.sourceDocId}`)
    }
  }
  return true
}

function citationWithoutUpdatedAt(current: NormalizedSourceCitationBibliographicSnapshot) {
  const { updatedAt: _updatedAt, ...stable } = current
  return stable
}

export function classifySourceDocBibliographicSnapshot(
  current: NormalizedSourceDocBibliographicSnapshot,
  repair: ReviewedSourceDocBibliographicRepair,
): 'pending' | 'applied' | 'conflict' {
  if (JSON.stringify(current) === JSON.stringify(repair.before.sourceDoc)) return 'pending'
  if (JSON.stringify(current) === JSON.stringify(repair.after.sourceDoc)) return 'applied'
  return 'conflict'
}

export function classifySourceCitationBibliographicSnapshot(
  current: NormalizedSourceCitationBibliographicSnapshot,
  repair: ReviewedSourceDocBibliographicRepair,
): 'pending' | 'applied' | 'conflict' {
  if (JSON.stringify(current) === JSON.stringify(repair.before.citation)) return 'pending'
  if (JSON.stringify(citationWithoutUpdatedAt(current)) === JSON.stringify(repair.after.citation)) return 'applied'
  return 'conflict'
}

export function buildSourceDocBibliographicRepairPlan(
  sourceDocs: SourceDocBibliographicSnapshot[],
  citations: SourceCitationBibliographicSnapshot[],
): SourceDocBibliographicRepairPlan {
  const repairs = validateReviewedSourceDocBibliographicRepairs()
  const conflicts: SourceDocBibliographicRepairConflict[] = []
  const updates: SourceDocBibliographicRepairUpdate[] = []
  const alreadyAppliedIds: string[] = []

  for (const repair of repairs) {
    const sourceMatches = sourceDocs.filter(row => row.id === repair.sourceDocId)
    if (sourceMatches.length === 0) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'missing_source_doc',
        detail: `SourceDoc is missing: ${repair.sourceDocId}`,
      })
      continue
    }
    if (sourceMatches.length > 1) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'duplicate_source_doc',
        detail: `SourceDoc snapshot repeats ${repair.sourceDocId}`,
      })
      continue
    }

    const citationMatches = citations.filter(row =>
      row.sourceDocId === repair.sourceDocId ||
      row.fieldCitations.some(field =>
        field.entityType === 'SourceDoc' && field.entityId === repair.sourceDocId,
      ),
    )
    if (citationMatches.length === 0) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'missing_source_citation',
        detail: `The reviewed SourceDoc has no relation- or FieldCitation-linked SourceCitation: ${repair.sourceDocId}`,
      })
      continue
    }
    if (citationMatches.length > 1) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'ambiguous_source_citation',
        detail: `The reviewed SourceDoc has ${citationMatches.length} relation- or FieldCitation-linked SourceCitations: ${repair.sourceDocId}`,
      })
      continue
    }
    if (citationMatches[0]!.id !== repair.citationId) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'unexpected_source_citation',
        detail: `Expected ${repair.citationId}, observed ${citationMatches[0]!.id}`,
      })
      continue
    }

    const currentSource = normalizeSourceDocBibliographicSnapshot(sourceMatches[0]!)
    const currentCitation = normalizeSourceCitationBibliographicSnapshot(citationMatches[0]!)
    const sourceStatus = classifySourceDocBibliographicSnapshot(currentSource, repair)
    const citationStatus = classifySourceCitationBibliographicSnapshot(currentCitation, repair)
    if (sourceStatus === 'conflict') {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'source_doc_snapshot_drift',
        detail: `SourceDoc matches neither the exact reviewed before nor after snapshot: ${repair.sourceDocId}`,
      })
    }
    if (citationStatus === 'conflict') {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'source_citation_snapshot_drift',
        detail: `SourceCitation matches neither the exact reviewed before nor after snapshot: ${repair.citationId}`,
      })
    }
    if (sourceStatus === 'conflict' || citationStatus === 'conflict') continue
    if (sourceStatus !== citationStatus) {
      conflicts.push({
        sourceDocId: repair.sourceDocId,
        code: 'partial_application',
        detail: `SourceDoc and SourceCitation are in different reviewed states for ${repair.sourceDocId}`,
      })
      continue
    }
    if (sourceStatus === 'applied') {
      alreadyAppliedIds.push(repair.sourceDocId)
      continue
    }
    updates.push({
      sourceDocId: repair.sourceDocId,
      citationId: repair.citationId,
      expectedSourceDoc: currentSource,
      targetSourceDoc: repair.after.sourceDoc,
      expectedCitation: currentCitation,
      targetCitation: repair.after.citation,
    })
  }

  updates.sort((left, right) => left.sourceDocId.localeCompare(right.sourceDocId))
  alreadyAppliedIds.sort()
  conflicts.sort((left, right) =>
    left.sourceDocId.localeCompare(right.sourceDocId) || left.code.localeCompare(right.code),
  )
  return {
    version: 1,
    reviewedManifestSha256: PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: repairs.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function sourceDocBibliographicRepairPlanContract(
  plan: SourceDocBibliographicRepairPlan,
) {
  return {
    version: plan.version,
    reviewedManifestSha256: plan.reviewedManifestSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
  }
}
