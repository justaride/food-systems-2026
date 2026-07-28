import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  MAX_OBSIDIAN_RESOURCE_BYTES,
  McpInputError,
  assessCitationUse,
  buildDocumentPayload,
  externalAppPath,
  externalHttpUrl,
  formatCitation,
  formatSearchResultForMcp,
  normalizeLimit,
  parseNonEmptyQuery,
  resolveObsidianVaultPath,
  redactAbsoluteFilePaths,
  redactExternalText,
  redactUnsafeHttpUrls,
  summarizeCitationReadiness,
  truncateText,
  type Audience,
  type CitationLike,
} from './formatters'
import {
  assessLibraryAnalysisExternalApproval,
  requiresLibraryAnalysisReview,
} from '../../src/lib/library-analysis'
import { computeLibraryContentHash } from '../../src/lib/library-analysis-inventory'
import {
  assessLibraryAnalysisExternalCitationPolicy,
  readLibraryAnalysisExternalCitationPolicyHash,
  type LibraryAnalysisCitationPolicyInput,
} from '../../src/lib/library-analysis-external-citations'
import {
  assessMcpEvidenceAppraisal,
  formatEvidenceAppraisalForAudience,
  type McpEvidenceAppraisalRecord,
  type McpEvidenceAppraisalTarget,
} from './evidence-appraisal'

export type EntityType = 'company' | 'actor' | 'person'
export type SearchMode = 'keyword' | 'semantic' | 'hybrid'
export type CitationReadinessFilter = 'citable_external' | 'citable_with_note' | 'internal_context' | 'blocked_unsourced'
export type EvidenceGapIssue =
  | 'readiness'
  | 'needs_review'
  | 'missing_locator'
  | 'missing_appraisal'
  | 'stale_appraisal'
  | 'incomplete_appraisal'

type PrismaClientLike = Awaited<ReturnType<typeof getPrisma>>

export const MIN_TRACE_CLAIM_QUERY_LENGTH = 12

const SERVICE_DIRECTORY = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(SERVICE_DIRECTORY, '../..')
export const OBSIDIAN_VAULT_ROOT = join(REPO_ROOT, 'Food Systems Obsidian')

const EVIDENCE_APPRAISAL_INCLUDE = {
  include: {
    reviewBasisCitation: {
      include: {
        document: {
          select: {
            report: { select: { id: true } },
            thesis: { select: { id: true } },
            sourceDoc: { select: { id: true } },
          },
        },
      },
    },
  },
} as const

const CITATION_EVIDENCE_CONTEXT_INCLUDE = {
  sourceDoc: {
    include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
  },
  document: {
    include: {
      sourceDoc: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
      report: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
      thesis: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
    },
  },
} as const

export type McpLibraryAnalysisRecord = {
  sourceKind: string
  sourceKey: string
  documentId: string | null
  status: string
  usageRule: string
  reviewStatus: string
  reviewedAt: Date | string | null
  reviewer: string | null
  citationReadiness: string | null
  contentHash: string | null
  aiCard: unknown
  claimCandidates: unknown
  riskFlags: string[]
}

export function buildMcpLibraryAnalysis(
  record: McpLibraryAnalysisRecord,
  document: {
    summary: string | null
    content: string
    sourceCitations?: LibraryAnalysisCitationPolicyInput[]
  },
  currentSourceCitations: LibraryAnalysisCitationPolicyInput[],
) {
  const claimCandidateCount = Array.isArray(record.claimCandidates)
    ? record.claimCandidates.length
    : 0
  const currentContentHash = computeLibraryContentHash(
    [document.summary, document.content].filter(Boolean).join('\n\n'),
  )
  const currentExternalCitationPolicy = assessLibraryAnalysisExternalCitationPolicy(
    currentSourceCitations,
  )
  const approvalInput = {
    ...record,
    currentContentHash,
    externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(record.aiCard),
    currentExternalCitationPolicyHash: currentExternalCitationPolicy.policyHash,
    claimCandidateCount,
  }

  return {
    status: record.status,
    usageRule: record.usageRule,
    reviewRequired: requiresLibraryAnalysisReview(approvalInput),
    claimCandidateCount,
    riskFlags: record.riskFlags,
    externalClaimEligible: assessLibraryAnalysisExternalApproval(approvalInput).eligible,
  }
}

export async function kbStatus() {
  const vaultExists = existsSync(OBSIDIAN_VAULT_ROOT)
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim())
  const semanticEnabled = isExplicitOptIn(process.env.FOODSYSTEMS_MCP_ENABLE_SEMANTIC)
  const obsidianEnabled = isExplicitOptIn(process.env.FOODSYSTEMS_MCP_ENABLE_OBSIDIAN)
  const status = {
    database: {
      configured: hasDatabaseUrl,
      connected: false,
      error: null as string | null,
      counts: {} as Record<string, number>,
    },
    citationPolicy: {
      requiresPublicHttpLocator: true,
      citableExternalLabelled: null as number | null,
      citationGateEligible: null as number | null,
      externalAnswerEligible: null as number | null,
      externalAnswerBlocked: null as number | null,
      blockedMissingPublicLocator: null as number | null,
    },
    appraisalPolicy: {
      modeled: true,
      totalEvidenceRecords: null as number | null,
      appraisals: null as number | null,
      missing: null as number | null,
      draft: null as number | null,
      reviewedCurrent: null as number | null,
      stale: null as number | null,
      incomplete: null as number | null,
      excluded: null as number | null,
      externalGateEligible: null as number | null,
    },
    semanticSearch: semanticEnabled
      ? { enabled: true, ...await safeSemanticStatus() }
      : {
          enabled: false,
          available: false,
          hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
          totalDocuments: null,
          embeddedDocuments: null,
          reason: 'mcp-semantic-search-disabled',
        },
    obsidianVault: {
      enabled: obsidianEnabled,
      exists: vaultExists,
      resourceRoot: 'foodsystems://obsidian/',
    },
  }

  if (!hasDatabaseUrl) return status

  try {
    const prisma = await getPrisma()
    const [
      documents,
      sourceCitations,
      insights,
      reports,
      theses,
      sourceDocs,
      companies,
      actors,
      people,
      externalLabelledCitations,
      appraisals,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.sourceCitation.count(),
      prisma.insight.count(),
      prisma.report.count(),
      prisma.thesis.count(),
      prisma.sourceDoc.count(),
      prisma.company.count(),
      prisma.actor.count().catch(() => 0),
      prisma.personProfile.count().catch(() => 0),
      prisma.sourceCitation.findMany({
        where: { citationReadiness: 'citable_external' },
        include: CITATION_EVIDENCE_CONTEXT_INCLUDE,
      }),
      prisma.evidenceAppraisal.findMany(EVIDENCE_APPRAISAL_INCLUDE),
    ])

    const externalAssessments = externalLabelledCitations.map(citation => (
      assessCitationUse(citation, 'external')
    ))
    const citationGateEligible = externalAssessments.filter(assessment => (
      assessment.allowedForAnswer
    )).length
    const externalAnswerEligible = externalLabelledCitations.filter((citation, index) => (
      externalAssessments[index]?.allowedForAnswer === true
      && assessMcpEvidenceAppraisal(resolveCitationEvidenceAppraisal(citation)).externalGateSatisfied
    )).length
    const appraisalAssessments = appraisals.map(appraisal => ({
      appraisal,
      assessment: assessMcpEvidenceAppraisal(appraisal),
    }))
    const totalEvidenceRecords = reports + theses + sourceDocs

    status.database.connected = true
    status.database.counts = {
      documents,
      sourceCitations,
      insights,
      reports,
      theses,
      sourceDocs,
      companies,
      actors,
      people,
    }
    status.citationPolicy.citableExternalLabelled = externalLabelledCitations.length
    status.citationPolicy.citationGateEligible = citationGateEligible
    status.citationPolicy.externalAnswerEligible = externalAnswerEligible
    status.citationPolicy.externalAnswerBlocked = (
      externalLabelledCitations.length - externalAnswerEligible
    )
    status.citationPolicy.blockedMissingPublicLocator = externalAssessments.filter(assessment => (
      assessment.blockingReasons.includes('missing_public_locator')
    )).length
    status.appraisalPolicy.totalEvidenceRecords = totalEvidenceRecords
    status.appraisalPolicy.appraisals = appraisals.length
    status.appraisalPolicy.missing = Math.max(0, totalEvidenceRecords - appraisals.length)
    status.appraisalPolicy.draft = appraisals.filter(appraisal => appraisal.status === 'draft').length
    status.appraisalPolicy.reviewedCurrent = appraisalAssessments.filter(({ appraisal, assessment }) => (
      appraisal.status === 'reviewed'
      && assessment.structurallyComplete
      && assessment.current
    )).length
    status.appraisalPolicy.stale = appraisalAssessments.filter(({ assessment }) => (
      assessment.blockingReasons.includes('appraisal_source_hash_stale')
    )).length
    status.appraisalPolicy.incomplete = appraisalAssessments.filter(({ assessment }) => (
      assessment.blockingReasons.includes('appraisal_incomplete')
    )).length
    status.appraisalPolicy.excluded = appraisals.filter(appraisal => (
      appraisal.status === 'excluded_not_applicable'
    )).length
    status.appraisalPolicy.externalGateEligible = appraisalAssessments.filter(({ assessment }) => (
      assessment.externalGateSatisfied
    )).length
  } catch {
    status.database.error = 'database_connection_failed'
  }

  return status
}

export async function kbSearch(input: {
  query: string
  limit?: number
  mode?: SearchMode
  types?: string[]
  audience?: Audience
}) {
  const query = parseNonEmptyQuery(input.query)
  const limit = normalizeLimit(input.limit)
  const mode = input.mode ?? 'keyword'
  const audience = input.audience ?? 'external'
  const semanticEnabled = isExplicitOptIn(process.env.FOODSYSTEMS_MCP_ENABLE_SEMANTIC)
  const executedRequestMode = mode === 'keyword' || semanticEnabled ? mode : 'keyword'
  const { searchWithDiagnostics } = await import('../../src/lib/queries/search')
  const execution = await searchWithDiagnostics(query, limit, executedRequestMode, input.types)
  const allowedTypes = new Set(input.types ?? [])
  const results = allowedTypes.size > 0
    ? execution.results.filter((result) => allowedTypes.has(result.type))
    : execution.results

  const mappedResults = results
    .slice(0, limit)
    .map((result) => formatSearchResultForMcp(result, audience))
  const restrictedResults = mappedResults.filter((result) => result.usePolicy.blockingReasons.length > 0).length
  const warnings: Array<{ code: string; message: string }> = [
    ...execution.warnings,
    ...(mode !== 'keyword' && !semanticEnabled
      ? [{
          code: 'mcp-semantic-search-disabled',
          message: 'Semantic search is disabled for MCP; keyword search was used. Set FOODSYSTEMS_MCP_ENABLE_SEMANTIC=true only after approving external query processing.',
        }]
      : []),
    {
      code: 'search-results-discovery-only',
      message: 'Search results are discovery-only and cannot support an external claim without kb_trace_claim.',
    },
  ]
  if (restrictedResults > 0) {
    warnings.push({
      code: 'library-analysis-restrictions-present',
      message: `${restrictedResults} result(s) have library-analysis restrictions; inspect each result before internal use.`,
    })
  }

  return {
    query,
    audience,
    requestedMode: mode,
    executedMode: execution.executedMode,
    fallback: execution.fallback,
    warnings,
    results: mappedResults,
  }
}

export async function kbGetDocument(input: {
  slug?: string
  id?: string
  includeContent?: boolean
  contentWindow?: number
  audience?: Audience
}) {
  if (!input.slug && !input.id) throw new McpInputError('Provide either slug or id')
  const prisma = await getPrisma()
  const document = await prisma.document.findFirst({
    where: input.slug ? { slug: input.slug } : { id: input.id },
    include: {
      sourceCitations: {
        orderBy: { updatedAt: 'desc' },
        take: 20,
      },
      sourceDoc: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
      report: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
      thesis: {
        include: { evidenceAppraisal: EVIDENCE_APPRAISAL_INCLUDE },
      },
    },
  })

  if (!document) {
    return {
      found: false,
      warnings: [`Document not found for ${input.slug ? `slug=${input.slug}` : `id=${input.id}`}`],
    }
  }

  const libraryAnalysisRecord = await prisma.libraryAnalysisRecord.findFirst({
    where: {
      documentId: document.id,
      sourceKind: 'document',
      sourceKey: `document:${document.id}`,
    },
    select: {
      sourceKind: true,
      sourceKey: true,
      documentId: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      reviewedAt: true,
      reviewer: true,
      citationReadiness: true,
      contentHash: true,
      aiCard: true,
      claimCandidates: true,
      riskFlags: true,
    },
    orderBy: { updatedAt: 'desc' },
  }).catch(() => null)
  // The response keeps its 20-citation cap, but approval must be checked
  // against the complete current set used by review, status, and ledger.
  const currentSourceCitations = libraryAnalysisRecord
    ? await prisma.sourceCitation.findMany({
        where: { documentId: document.id },
        select: {
          id: true,
          sourceClass: true,
          citationReadiness: true,
          verificationStatus: true,
          url: true,
          archivedUrl: true,
          accessedAt: true,
        },
      }).catch(() => [])
    : []
  const libraryAnalysis = libraryAnalysisRecord
    ? buildMcpLibraryAnalysis(libraryAnalysisRecord, document, currentSourceCitations)
    : null
  const audience = input.audience ?? 'external'
  const evidenceAppraisal = resolveDocumentEvidenceAppraisal(document)

  return {
    found: true,
    ...buildDocumentPayload(document, {
      includeContent: input.includeContent,
      contentWindow: input.contentWindow,
      audience,
      libraryAnalysis,
      evidenceAppraisal: assessMcpEvidenceAppraisal(evidenceAppraisal),
    }),
    sourceDoc: document.sourceDoc
      ? formatSourceDocForAudience(document.sourceDoc, audience)
      : null,
    evidenceAppraisal: formatEvidenceAppraisalForAudience(
      evidenceAppraisal,
      audience,
      documentEvidenceTarget(document),
    ),
  }
}

export function formatSourceDocForAudience(
  sourceDoc: { id: string; title: string | null; filename: string; url: string | null },
  audience: Audience,
) {
  return {
    id: sourceDoc.id,
    title: audience === 'external'
      ? redactNullableDocumentText(sourceDoc.title)
      : sourceDoc.title,
    ...(audience === 'internal' ? { filename: sourceDoc.filename } : {}),
    url: audience === 'external'
      ? externalHttpUrl(sourceDoc.url)
      : sourceDoc.url,
  }
}

export async function kbGetEntity(input: { type: EntityType; id: string; audience?: Audience }) {
  const prisma = await getPrisma()
  const audience = input.audience ?? 'external'

  const result = input.type === 'company'
    ? await getCompany(prisma, input.id)
    : input.type === 'actor'
      ? await getActor(prisma, input.id)
      : await getPerson(prisma, input.id)

  if (!result.found) return result
  const audienceView = redactEntityPayloadForAudience(result, audience)
  return {
    ...audienceView.payload,
    audience,
    usePolicy: {
      audience,
      discoveryOnly: true,
      externalClaimAllowed: false,
      requiresCitationTrace: true,
    },
    redactedFields: audienceView.redactedFields,
    warnings: [
      'Entity fields are discovery context; trace factual claims with kb_trace_claim before answer use.',
      ...(audienceView.redactedFields.length > 0
        ? ['Audience-sensitive entity fields were redacted from this response.']
        : []),
    ],
  }
}

export function redactEntityPayloadForAudience(input: unknown, audience: Audience) {
  const payload = isRecord(input) ? { ...input } : {}
  if (audience === 'internal' || !isRecord(payload.entity)) {
    return { payload, redactedFields: [] as string[] }
  }

  const entity = { ...payload.entity }
  const redactedFields: string[] = []

  if (entity.type === 'person') {
    if ('summary' in entity) {
      delete entity.summary
      redactedFields.push('entity.summary')
    }
    if (isRecord(entity.links)) {
      entity.links = omitFields(entity.links, ['linkedInUrl', 'photoUrl'])
      redactedFields.push('entity.links.linkedInUrl', 'entity.links.photoUrl')
    }
    if (isRecord(entity.relationships)) {
      entity.relationships = omitFields(entity.relationships, ['roles'])
      redactedFields.push('entity.relationships.roles')
    }
  }

  if (entity.type === 'actor' && isRecord(entity.fields)) {
    entity.fields = omitFields(entity.fields, ['currentStance', 'desiredStance', 'priorityTier'])
    redactedFields.push(
      'entity.fields.currentStance',
      'entity.fields.desiredStance',
      'entity.fields.priorityTier',
    )
  }

  const sanitizedEntity = sanitizeExternalEntityLocators(
    entity,
    'entity',
    redactedFields,
  ) as Record<string, unknown>

  return {
    payload: { ...payload, entity: sanitizedEntity },
    redactedFields: Array.from(new Set(redactedFields)),
  }
}

function sanitizeExternalEntityLocators(
  value: unknown,
  path: string,
  redactedFields: string[],
  fieldName = '',
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeExternalEntityLocators(
      item,
      `${path}.${index}`,
      redactedFields,
      fieldName,
    ))
  }
  if (value instanceof Date) return value
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      sanitizeExternalEntityLocators(item, `${path}.${key}`, redactedFields, key),
    ]))
  }
  if (typeof value !== 'string') return value

  let sanitized = redactUnsafeHttpUrls(value)
  const normalizedFieldName = fieldName.toLowerCase()
  if (/path$/iu.test(fieldName)) {
    sanitized = externalAppPath(sanitized) ?? ''
  } else if (
    /(?:url|uri|website|homepage|href|link)$/iu.test(fieldName)
  ) {
    sanitized = externalHttpUrl(sanitized) ?? ''
  } else if (
    ['source', 'registrysource'].includes(normalizedFieldName)
    && /^(?:[A-Za-z][A-Za-z0-9+.-]*:|\/\/|\/|[A-Za-z]:[\\/])/u.test(value.trim())
  ) {
    sanitized = externalHttpUrl(sanitized) ?? ''
  } else {
    sanitized = redactAbsoluteFilePaths(sanitized)
  }

  if (sanitized === value) return value
  redactedFields.push(path)
  return sanitized || null
}

type EvidenceAppraisalLink = {
  evidenceAppraisal?: McpEvidenceAppraisalRecord | null
}

type DocumentEvidenceContext = {
  sourceDoc?: (EvidenceAppraisalLink & {
    id: string
    title: string | null
    filename: string
  }) | null
  report?: (EvidenceAppraisalLink & {
    id: string
    title: string
  }) | null
  thesis?: (EvidenceAppraisalLink & {
    id: string
    title: string
  }) | null
}

type CitationEvidenceContext = CitationLike & {
  sourceDoc?: EvidenceAppraisalLink | null
  document?: DocumentEvidenceContext | null
}

function resolveDocumentEvidenceAppraisal(
  document: DocumentEvidenceContext,
): McpEvidenceAppraisalRecord | null {
  return document.sourceDoc?.evidenceAppraisal
    ?? document.report?.evidenceAppraisal
    ?? document.thesis?.evidenceAppraisal
    ?? null
}

function documentEvidenceTarget(
  document: DocumentEvidenceContext,
): McpEvidenceAppraisalTarget | null {
  if (document.sourceDoc) {
    return {
      type: 'source_doc',
      id: document.sourceDoc.id,
      title: document.sourceDoc.title ?? document.sourceDoc.filename,
    }
  }
  if (document.report) {
    return { type: 'report', id: document.report.id, title: document.report.title }
  }
  if (document.thesis) {
    return { type: 'thesis', id: document.thesis.id, title: document.thesis.title }
  }
  return null
}

function resolveCitationEvidenceAppraisal(
  citation: CitationEvidenceContext,
): McpEvidenceAppraisalRecord | null {
  return citation.sourceDoc?.evidenceAppraisal
    ?? (citation.document ? resolveDocumentEvidenceAppraisal(citation.document) : null)
}

function claimEvidenceAllowedForAudience(
  citation: CitationLike,
  appraisal: McpEvidenceAppraisalRecord | null,
  audience: Audience,
) {
  if (!assessCitationUse(citation, audience).allowedForAnswer) return false
  return audience === 'internal'
    || assessMcpEvidenceAppraisal(appraisal).externalGateSatisfied
}

export async function kbTraceClaim(input: {
  query: string
  entityType?: string
  entityId?: string
  limit?: number
  audience?: Audience
}) {
  const query = parseTraceClaimQuery(input.query)
  const limit = normalizeLimit(input.limit)
  const audience = input.audience ?? 'external'
  const scanLimit = Math.min(100, limit * 4)
  const prisma = await getPrisma()

  const fieldCitations = await prisma.fieldCitation.findMany({
    where: {
      ...(input.entityType ? { entityType: input.entityType } : {}),
      ...(input.entityId ? { entityId: input.entityId } : {}),
      OR: [
        { claimText: { contains: query, mode: 'insensitive' } },
        { fieldPath: { contains: query, mode: 'insensitive' } },
        { citation: { citationText: { contains: query, mode: 'insensitive' } } },
        { citation: { title: { contains: query, mode: 'insensitive' } } },
        { citation: { quote: { contains: query, mode: 'insensitive' } } },
        { citation: { notes: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      citation: { include: CITATION_EVIDENCE_CONTEXT_INCLUDE },
    },
    take: scanLimit,
    orderBy: { createdAt: 'desc' },
  })

  const mappedFieldClaims = fieldCitations.map((fieldCitation) => ({
    id: fieldCitation.id,
    entityType: fieldCitation.entityType,
    entityId: fieldCitation.entityId,
    fieldPath: fieldCitation.fieldPath,
    claimText: fieldCitation.claimText,
    confidence: fieldCitation.confidence,
    citation: fieldCitation.citation,
    evidenceAppraisal: resolveCitationEvidenceAppraisal(fieldCitation.citation),
    matchProvenance: traceClaimMatchProvenance(query, {
      claimText: fieldCitation.claimText,
      fieldPath: fieldCitation.fieldPath,
      citation: fieldCitation.citation,
    }),
  }))
  const supportingFieldClaims = mappedFieldClaims.filter((claim) => (
    claim.matchProvenance.supportScope === 'claim_support' &&
    claimEvidenceAllowedForAudience(claim.citation, claim.evidenceAppraisal, audience)
  ))

  const sourceCitations = supportingFieldClaims.length > 0
    ? []
    : await prisma.sourceCitation.findMany({
        where: {
          OR: [
            { citationText: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { quote: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: CITATION_EVIDENCE_CONTEXT_INCLUDE,
        take: scanLimit,
        orderBy: { updatedAt: 'desc' },
      })

  const mappedSourceClaims = sourceCitations.map((citation) => ({
      id: citation.id,
      entityType: null,
      entityId: null,
      fieldPath: null,
      claimText: citation.citationText,
      confidence: citation.confidence,
      citation,
      evidenceAppraisal: resolveCitationEvidenceAppraisal(citation),
      matchProvenance: traceClaimMatchProvenance(query, {
        claimText: null,
        fieldPath: null,
        citation,
      }),
    }))
  const rawMatches = supportingFieldClaims.length > 0
    ? mappedFieldClaims
    : [...mappedFieldClaims, ...mappedSourceClaims]
  const policyEligibleMatches = rawMatches.filter((claim) => (
    claimEvidenceAllowedForAudience(claim.citation, claim.evidenceAppraisal, audience)
  ))
  const appraisalBlockedMatches = audience === 'external'
    ? rawMatches.filter((claim) => (
        assessCitationUse(claim.citation, 'external').allowedForAnswer
        && !assessMcpEvidenceAppraisal(claim.evidenceAppraisal).externalGateSatisfied
      ))
    : []
  const eligibleClaims = policyEligibleMatches.filter((claim) => (
    claim.matchProvenance.supportScope === 'claim_support'
  ))
  const eligibleLexical = policyEligibleMatches.filter((claim) => (
    claim.matchProvenance.supportScope === 'lexical_candidate'
  ))
  const eligibleMetadata = policyEligibleMatches.filter((claim) => (
    claim.matchProvenance.supportScope === 'discovery_only'
  ))
  const eligibleDiscovery = [...eligibleLexical, ...eligibleMetadata]
  const claims = eligibleClaims.slice(0, limit).map((claim) => ({
    id: claim.id,
    entityType: claim.entityType,
    entityId: claim.entityId,
    fieldPath: audience === 'external' && claim.fieldPath
      ? redactExternalText(claim.fieldPath)
      : claim.fieldPath,
    claimText: audience === 'external' && claim.claimText
      ? redactExternalText(claim.claimText)
      : claim.claimText,
    confidence: claim.confidence,
    matchProvenance: claim.matchProvenance,
    citation: formatCitation(claim.citation, audience),
    evidenceAppraisal: formatEvidenceAppraisalForAudience(
      claim.evidenceAppraisal,
      audience,
    ),
  }))
  const discoveryMatches = eligibleDiscovery.slice(0, limit).map((claim) => ({
    id: claim.id,
    entityType: claim.entityType,
    entityId: claim.entityId,
    matchProvenance: claim.matchProvenance,
    discoveryOnly: true,
    citation: formatCitation(claim.citation, audience),
    evidenceAppraisal: formatEvidenceAppraisalForAudience(
      claim.evidenceAppraisal,
      audience,
    ),
  }))
  const scannedMatchCount = mappedFieldClaims.length + mappedSourceClaims.length
  const withheldMatchCount = Math.max(
    0,
    scannedMatchCount - claims.length - discoveryMatches.length,
  )
  const warnings: string[] = []

  if (withheldMatchCount > 0) {
    warnings.push(`${withheldMatchCount} matching citation(s) withheld by the ${audience} audience policy or result cap.`)
  }
  if (appraisalBlockedMatches.length > 0) {
    warnings.push(`${appraisalBlockedMatches.length} citation-eligible match(es) withheld because evidence appraisal is missing, incomplete, stale, or not externally gateable.`)
  }
  if (claims.length === 0) {
    warnings.push(audience === 'external'
      ? 'No externally citable claim found; do not use matching internal or weak material in an external answer.'
      : 'No matching claim or citation found; treat as uncited/internal until verified.')
  }
  if (eligibleLexical.length > 0) {
    warnings.push(`${eligibleLexical.length} lexical candidate(s) require human comparison with the complete claim and citation; substring overlap is not claim support.`)
  }
  if (eligibleMetadata.length > 0) {
    warnings.push(`${eligibleMetadata.length} metadata-only match(es) are discovery context, not claim support.`)
  }

  return {
    query,
    audience,
    found: claims.length > 0,
    claims,
    discoveryMatches,
    matchSummary: {
      scanned: scannedMatchCount,
      directSupportCandidates: eligibleClaims.length,
      lexicalCandidates: eligibleLexical.length,
      metadataCandidates: eligibleMetadata.length,
      discoveryCandidates: eligibleDiscovery.length,
      returned: claims.length,
      returnedDiscovery: discoveryMatches.length,
      withheld: withheldMatchCount,
    },
    warnings,
  }
}

export type TraceClaimMatchInput = {
  claimText: string | null
  fieldPath: string | null
  citation: Pick<
    CitationLike,
    'quote' | 'citationText' | 'title' | 'notes'
  >
}

export function traceClaimMatchProvenance(
  query: string,
  input: TraceClaimMatchInput,
) {
  const claimTextMatch = claimTextMatchKind(input.claimText, query)
  const citationQuoteMatch = claimTextMatchKind(input.citation.quote, query)
  const matchedBy = [
    claimTextMatch === 'exact' ? 'claim_text_exact' : null,
    citationQuoteMatch === 'exact' ? 'citation_quote_exact' : null,
    claimTextMatch === 'lexical' ? 'claim_text_lexical' : null,
    citationQuoteMatch === 'lexical' ? 'citation_quote_lexical' : null,
    textContains(input.fieldPath, query) ? 'field_path' : null,
    textContains(input.citation.citationText, query) ? 'citation_text' : null,
    textContains(input.citation.title, query) ? 'citation_title' : null,
    textContains(input.citation.notes, query) ? 'citation_notes' : null,
  ].filter((value): value is string => Boolean(value))
  const directSupport = claimTextMatch === 'exact' || citationQuoteMatch === 'exact'
  const lexicalCandidate = claimTextMatch === 'lexical' || citationQuoteMatch === 'lexical'

  return {
    matchedBy,
    supportScope: directSupport
      ? 'claim_support' as const
      : lexicalCandidate
        ? 'lexical_candidate' as const
        : 'discovery_only' as const,
  }
}

export function parseTraceClaimQuery(value: string): string {
  const query = parseNonEmptyQuery(value)
  if (query.length < MIN_TRACE_CLAIM_QUERY_LENGTH) {
    throw new McpInputError(
      `claim query must contain at least ${MIN_TRACE_CLAIM_QUERY_LENGTH} characters`,
    )
  }
  if (query.split(/\s+/u).length < 2) {
    throw new McpInputError('claim query must contain at least two words')
  }
  return query
}

function claimTextMatchKind(value: string | null, query: string): 'exact' | 'lexical' | null {
  const normalizedValue = normalizeClaimText(value)
  const normalizedQuery = normalizeClaimText(query)
  if (!normalizedValue || !normalizedQuery) return null
  if (normalizedValue === normalizedQuery) return 'exact'
  return normalizedValue.includes(normalizedQuery) ? 'lexical' : null
}

function normalizeClaimText(value: string | null): string {
  return value
    ?.normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .trim() ?? ''
}

function textContains(value: string | null, query: string): boolean {
  return Boolean(value?.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
}

export function buildGapWhere(input: {
  issue?: EvidenceGapIssue
  readiness?: CitationReadinessFilter
}) {
  const issue = input.issue ?? 'readiness'
  if (isAppraisalGapIssue(issue)) {
    throw new McpInputError('appraisal gap issues use the EvidenceAppraisal contract')
  }
  if (issue === 'needs_review') return { verificationStatus: 'needs_review' }
  if (issue === 'missing_locator') {
    return {
      AND: [
        { url: null },
        { archivedUrl: null },
        { localPath: null },
        { documentId: null },
        { sourceDocId: null },
      ],
    }
  }

  return { citationReadiness: input.readiness ?? 'blocked_unsourced' }
}

export async function kbListGaps(input: {
  limit?: number
  readiness?: CitationReadinessFilter
  issue?: EvidenceGapIssue
  audience?: Audience
}) {
  const limit = normalizeLimit(input.limit)
  const issue = input.issue ?? 'readiness'
  const readiness = input.readiness ?? 'blocked_unsourced'
  const audience = input.audience ?? 'external'
  const prisma = await getPrisma()
  if (isAppraisalGapIssue(issue)) {
    return listEvidenceAppraisalGaps(prisma, {
      issue,
      limit,
      audience,
    })
  }
  const citations = await prisma.sourceCitation.findMany({
    where: buildGapWhere({ issue, readiness }) as never,
    include: { fieldCitations: true },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  })

  return {
    audience,
    issue,
    readiness: issue === 'readiness' ? readiness : null,
    filters: {
      contract: 'exact_match',
      citationReadiness: issue === 'readiness' ? readiness : null,
      verificationStatus: issue === 'needs_review' ? 'needs_review' : null,
      missingLocator: issue === 'missing_locator',
    },
    count: citations.length,
    gaps: citations.map((citation) => ({
      citation: formatGapCitationForAudience(citation, audience),
      fieldCitations: citation.fieldCitations.map((fieldCitation) => ({
        id: fieldCitation.id,
        entityType: fieldCitation.entityType,
        entityId: fieldCitation.entityId,
        fieldPath: fieldCitation.fieldPath,
        ...(audience === 'internal' ? { claimText: fieldCitation.claimText } : {}),
      })),
      sourceStatus: summarizeCitationReadiness([citation]),
    })),
  }
}

function isAppraisalGapIssue(
  issue: EvidenceGapIssue,
): issue is 'missing_appraisal' | 'stale_appraisal' | 'incomplete_appraisal' {
  return [
    'missing_appraisal',
    'stale_appraisal',
    'incomplete_appraisal',
  ].includes(issue)
}

async function listEvidenceAppraisalGaps(
  prisma: PrismaClientLike,
  input: {
    issue: 'missing_appraisal' | 'stale_appraisal' | 'incomplete_appraisal'
    limit: number
    audience: Audience
  },
) {
  if (input.issue === 'missing_appraisal') {
    const [reports, theses, sourceDocs] = await Promise.all([
      prisma.report.findMany({
        where: { evidenceAppraisal: { is: null } },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
        take: input.limit,
      }),
      prisma.thesis.findMany({
        where: { evidenceAppraisal: { is: null } },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
        take: input.limit,
      }),
      prisma.sourceDoc.findMany({
        where: { evidenceAppraisal: { is: null } },
        select: { id: true, title: true, filename: true },
        orderBy: { id: 'asc' },
        take: input.limit,
      }),
    ])
    const targets: McpEvidenceAppraisalTarget[] = [
      ...reports.map(report => ({
        type: 'report' as const,
        id: report.id,
        title: report.title,
      })),
      ...theses.map(thesis => ({
        type: 'thesis' as const,
        id: thesis.id,
        title: thesis.title,
      })),
      ...sourceDocs.map(sourceDoc => ({
        type: 'source_doc' as const,
        id: sourceDoc.id,
        title: sourceDoc.title ?? sourceDoc.filename,
      })),
    ].slice(0, input.limit)

    return {
      audience: input.audience,
      issue: input.issue,
      readiness: null,
      filters: appraisalGapFilters(input.issue),
      count: targets.length,
      gaps: targets.map(target => ({
        target: formatEvidenceAppraisalForAudience(
          null,
          input.audience,
          target,
        ).target,
        evidenceAppraisal: formatEvidenceAppraisalForAudience(
          null,
          input.audience,
          target,
        ),
      })),
    }
  }

  const appraisals = await prisma.evidenceAppraisal.findMany({
    include: {
      reviewBasisCitation: true,
      report: { select: { id: true, title: true } },
      thesis: { select: { id: true, title: true } },
      sourceDoc: { select: { id: true, title: true, filename: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  const matching = appraisals.filter((appraisal) => {
    const assessment = assessMcpEvidenceAppraisal(appraisal)
    return input.issue === 'stale_appraisal'
      ? assessment.blockingReasons.includes('appraisal_source_hash_stale')
      : appraisal.status === 'draft'
        || assessment.blockingReasons.includes('appraisal_incomplete')
  }).slice(0, input.limit)

  return {
    audience: input.audience,
    issue: input.issue,
    readiness: null,
    filters: appraisalGapFilters(input.issue),
    count: matching.length,
    gaps: matching.map((appraisal) => ({
      target: formatEvidenceAppraisalForAudience(
        appraisal,
        input.audience,
        appraisalTargetFromIncludedRecord(appraisal),
      ).target,
      evidenceAppraisal: formatEvidenceAppraisalForAudience(
        appraisal,
        input.audience,
        appraisalTargetFromIncludedRecord(appraisal),
      ),
    })),
  }
}

function appraisalGapFilters(
  issue: 'missing_appraisal' | 'stale_appraisal' | 'incomplete_appraisal',
) {
  return {
    contract: 'exact_match',
    citationReadiness: null,
    verificationStatus: null,
    missingLocator: false,
    missingAppraisal: issue === 'missing_appraisal',
    staleAppraisal: issue === 'stale_appraisal',
    incompleteAppraisal: issue === 'incomplete_appraisal',
  }
}

function appraisalTargetFromIncludedRecord(
  appraisal: McpEvidenceAppraisalRecord & {
    report?: { id: string; title: string } | null
    thesis?: { id: string; title: string } | null
    sourceDoc?: { id: string; title: string | null; filename: string } | null
  },
): McpEvidenceAppraisalTarget {
  if (appraisal.report) {
    return { type: 'report', id: appraisal.report.id, title: appraisal.report.title }
  }
  if (appraisal.thesis) {
    return { type: 'thesis', id: appraisal.thesis.id, title: appraisal.thesis.title }
  }
  if (appraisal.sourceDoc) {
    return {
      type: 'source_doc',
      id: appraisal.sourceDoc.id,
      title: appraisal.sourceDoc.title ?? appraisal.sourceDoc.filename,
    }
  }
  if (appraisal.reportId) return { type: 'report', id: appraisal.reportId, title: null }
  if (appraisal.thesisId) return { type: 'thesis', id: appraisal.thesisId, title: null }
  return { type: 'source_doc', id: appraisal.sourceDocId ?? 'missing-target', title: null }
}

export async function readSchemaResource() {
  const schemaPath = join(REPO_ROOT, 'prisma/schema.prisma')
  return readFileSync(schemaPath, 'utf8')
}

export async function readObsidianResource(resourcePath: string) {
  if (!isExplicitOptIn(process.env.FOODSYSTEMS_MCP_ENABLE_OBSIDIAN)) {
    throw new McpInputError('Obsidian resource access is disabled for this MCP server')
  }
  return readObsidianFile(OBSIDIAN_VAULT_ROOT, resourcePath)
}

export function readObsidianFile(vaultRoot: string, resourcePath: string) {
  const filePath = resolveObsidianVaultPath(vaultRoot, resourcePath)
  if (!existsSync(vaultRoot) || !lstatSync(vaultRoot).isDirectory()) {
    throw new McpInputError('Obsidian vault is unavailable')
  }
  if (lstatSync(vaultRoot).isSymbolicLink()) {
    throw new McpInputError('symbolic links are not allowed for the Obsidian vault')
  }
  if (!existsSync(filePath)) {
    throw new McpInputError('Obsidian resource not found')
  }

  let currentPath = vaultRoot
  for (const segment of resourcePath.split('/')) {
    currentPath = join(currentPath, segment)
    const stats = lstatSync(currentPath)
    if (stats.isSymbolicLink()) {
      throw new McpInputError('symbolic links are not allowed for Obsidian resources')
    }
  }

  const stats = lstatSync(filePath)
  if (!stats.isFile()) {
    throw new McpInputError('Obsidian resource must be a regular file')
  }
  if (stats.size > MAX_OBSIDIAN_RESOURCE_BYTES) {
    throw new McpInputError(`Obsidian resource exceeds the ${MAX_OBSIDIAN_RESOURCE_BYTES}-byte limit`)
  }

  return readFileSync(filePath, 'utf8')
}

async function getCompany(prisma: PrismaClientLike, id: string) {
  const company = await prisma.company.findFirst({
    where: { OR: [{ id }, { orgNr: id }, { name: { equals: id, mode: 'insensitive' } }] },
    include: {
      boardMembers: { take: 10, orderBy: { personName: 'asc' } },
      shareholders: { take: 10, orderBy: { ownershipPct: 'desc' } },
      documentRefs: { include: { document: true }, take: 10 },
      actor: true,
      parentOf: { include: { childCompany: true }, take: 10 },
      childOf: { include: { parentCompany: true }, take: 10 },
      relationshipsFrom: { include: { toCompany: true }, take: 10 },
      relationshipsTo: { include: { fromCompany: true }, take: 10 },
    },
  })

  if (!company) return notFound('company', id)

  return {
    found: true,
    entity: {
      id: company.id,
      type: 'company',
      title: company.name,
      summary: [company.naceDescription, company.valueChainStage, company.hqCity].filter(Boolean).join(' — '),
      fields: {
        orgNr: company.orgNr,
        country: company.country,
        legalForm: company.legalForm,
        valueChainStage: company.valueChainStage,
        ownershipType: company.ownershipType,
        registrySource: company.registrySource,
        registryVerifiedAt: company.registryVerifiedAt,
      },
      links: {
        appPath: `/selskap/${company.id}`,
        actorPath: company.actor ? `/aktorer/${company.actor.slug}` : null,
      },
      relationships: {
        boardMembers: company.boardMembers.map((member) => ({
          personName: member.personName,
          role: member.role,
          personKey: member.personKey,
          sourceUrl: member.sourceUrl,
          verificationStatus: member.verificationStatus,
        })),
        shareholders: company.shareholders.map((shareholder) => ({
          name: shareholder.name,
          ownershipPct: shareholder.ownershipPct?.toString() ?? null,
          sourceUrl: shareholder.sourceUrl,
          verificationStatus: shareholder.verificationStatus,
        })),
        children: company.parentOf.map((edge) => ({
          id: edge.childCompany.id,
          name: edge.childCompany.name,
          ownershipPct: edge.ownershipPct,
          source: edge.source,
        })),
        parents: company.childOf.map((edge) => ({
          id: edge.parentCompany.id,
          name: edge.parentCompany.name,
          ownershipPct: edge.ownershipPct,
          source: edge.source,
        })),
        businessRelationships: [
          ...company.relationshipsFrom.map((edge) => ({
            direction: 'out',
            company: edge.toCompany.name,
            relationshipType: edge.relationshipType,
            source: edge.source,
            verificationStatus: edge.verificationStatus,
          })),
          ...company.relationshipsTo.map((edge) => ({
            direction: 'in',
            company: edge.fromCompany.name,
            relationshipType: edge.relationshipType,
            source: edge.source,
            verificationStatus: edge.verificationStatus,
          })),
        ],
      },
      documents: company.documentRefs.map((ref) => ({
        id: ref.document.id,
        title: ref.document.title,
        slug: ref.document.slug,
        context: ref.context,
      })),
    },
  }
}

async function getActor(prisma: PrismaClientLike, id: string) {
  const actor = await prisma.actor.findFirst({
    where: { OR: [{ id }, { slug: id }, { name: { equals: id, mode: 'insensitive' } }] },
    include: {
      company: true,
      documentRefs: { include: { document: true }, take: 10 },
      relationshipsFrom: { include: { toActor: true }, take: 10 },
      relationshipsTo: { include: { fromActor: true }, take: 10 },
    },
  })

  if (!actor) return notFound('actor', id)

  return {
    found: true,
    entity: {
      id: actor.id,
      type: 'actor',
      title: actor.name,
      summary: actor.roleSummary,
      tags: actor.themeTags,
      fields: {
        actorType: actor.actorType,
        country: actor.country,
        currentStance: actor.currentStance,
        desiredStance: actor.desiredStance,
        priorityTier: actor.priorityTier,
        verificationStatus: actor.verificationStatus,
        lastVerifiedAt: actor.lastVerifiedAt,
      },
      links: {
        appPath: `/aktorer/${actor.slug}`,
        website: actor.website,
        companyPath: actor.company ? `/selskap/${actor.company.id}` : null,
      },
      relationships: [
        ...actor.relationshipsFrom.map((edge) => ({
          direction: 'out',
          actor: edge.toActor.name,
          relationType: edge.relationType,
          sourceUrl: edge.sourceUrl,
        })),
        ...actor.relationshipsTo.map((edge) => ({
          direction: 'in',
          actor: edge.fromActor.name,
          relationType: edge.relationType,
          sourceUrl: edge.sourceUrl,
        })),
      ],
      documents: actor.documentRefs.map((ref) => ({
        id: ref.document.id,
        title: ref.document.title,
        slug: ref.document.slug,
        context: ref.context,
      })),
    },
  }
}

async function getPerson(prisma: PrismaClientLike, id: string) {
  const person = await prisma.personProfile.findFirst({
    where: { OR: [{ personKey: id }, { id }, { name: { equals: id, mode: 'insensitive' } }] },
  })

  if (!person) return notFound('person', id)

  return {
    found: true,
    entity: {
      id: person.personKey,
      type: 'person',
      title: person.name,
      summary: truncateText(person.biography ?? person.affiliations.join(', '), 500),
      tags: person.tags,
      fields: {
        affiliations: person.affiliations,
        lastVerifiedAt: person.lastVerifiedAt,
      },
      links: {
        appPath: `/personer/${encodeURIComponent(person.personKey)}`,
        linkedInUrl: person.linkedInUrl,
        photoUrl: person.photoUrl,
      },
      relationships: {
        roles: person.roles,
      },
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function redactNullableDocumentText(value: string | null): string | null {
  return value === null ? null : redactExternalText(value)
}

function omitFields(record: Record<string, unknown>, fields: string[]) {
  const blocked = new Set(fields)
  return Object.fromEntries(Object.entries(record).filter(([key]) => !blocked.has(key)))
}

export function formatGapCitationForAudience(
  citation: Parameters<typeof formatCitation>[0],
  audience: Audience,
) {
  const formatted = formatCitation(citation, audience)
  if (audience === 'internal') return formatted

  return {
    id: formatted.id,
    sourceClass: formatted.sourceClass,
    readiness: formatted.readiness,
    verificationStatus: formatted.verificationStatus,
    usePolicy: formatted.usePolicy,
  }
}

export function isExplicitOptIn(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function notFound(type: EntityType, id: string) {
  return {
    found: false,
    warnings: [`${type} not found for id=${id}`],
  }
}

async function safeSemanticStatus() {
  try {
    const { getSemanticSearchStatus } = await import('../../src/lib/queries/semantic-search')
    return await getSemanticSearchStatus()
  } catch {
    return {
      available: false,
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
      totalDocuments: null,
      embeddedDocuments: null,
      reason: 'status-check-failed',
    }
  }
}

async function getPrisma() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is not configured')
  }
  const { prisma } = await import('../../src/lib/db')
  return prisma
}
