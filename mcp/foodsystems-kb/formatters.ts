import { extname, isAbsolute, join, resolve } from 'node:path'
import {
  AUDIENCES,
  assessCitationUse,
  externalHttpUrl,
  type Audience,
  type CitationPolicyInput,
} from '../../src/lib/citations/external-citation-policy'

export {
  AUDIENCES,
  assessCitationUse,
  externalHttpUrl,
}
export type { Audience, CitationPolicyInput }

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 25
export const DEFAULT_EXCERPT_LENGTH = 500
export const DEFAULT_CONTENT_WINDOW = 4_000
export const MAX_CONTENT_WINDOW = 20_000
export const MAX_QUERY_LENGTH = 500
export const MAX_RESOURCE_PATH_LENGTH = 500
export const MAX_OBSIDIAN_RESOURCE_BYTES = 256 * 1024

export type CitationLike = {
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
}

export type LibraryAnalysisLike = {
  status: string
  usageRule: string
  reviewRequired: boolean
  claimCandidateCount: number
  riskFlags: string[]
  externalClaimEligible?: boolean
}

export type EvidenceAppraisalUseLike = {
  externalGateSatisfied: boolean
  blockingReasons: string[]
}

export type SearchResultLike = {
  id: string
  type: string
  title: string
  excerpt: string
  tags?: string[]
  url?: string | null
  sourceUrl?: string | null
  relevance?: number
  libraryAnalysis?: LibraryAnalysisLike | null
}

export type DocumentLike = {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string
  tags: string[]
  url: string | null
  filePath: string | null
  sourceCitations: CitationLike[]
}

export function parseNonEmptyQuery(query: string): string {
  const trimmed = query.trim()
  if (!trimmed) throw new McpInputError('query must not be empty')
  if (trimmed.length > MAX_QUERY_LENGTH) {
    throw new McpInputError(`query must not exceed ${MAX_QUERY_LENGTH} characters`)
  }
  return trimmed
}

export function normalizeLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  const integerLimit = Math.trunc(limit ?? DEFAULT_LIMIT)
  return Math.min(MAX_LIMIT, Math.max(1, integerLimit))
}

export function formatCitation(citation: CitationLike, audience: Audience = 'external') {
  const usePolicy = assessCitationUse(citation, audience)
  const external = audience === 'external'

  return {
    id: citation.id,
    sourceClass: citation.sourceClass,
    readiness: citation.citationReadiness,
    verificationStatus: citation.verificationStatus,
    citationText: external ? redactExternalText(citation.citationText) : citation.citationText,
    title: external ? redactNullableExternalText(citation.title) : citation.title,
    author: external ? redactNullableExternalText(citation.author) : citation.author,
    publisher: external ? redactNullableExternalText(citation.publisher) : citation.publisher,
    year: citation.year,
    accessedAt: formatDate(citation.accessedAt),
    verifiedAt: formatDate(citation.verifiedAt),
    ...(external ? {} : { verifier: citation.verifiedBy }),
    captureMethod: external
      ? redactExternalText(citation.captureMethod)
      : citation.captureMethod,
    locators: {
      url: external ? externalHttpUrl(citation.url) : citation.url,
      archivedUrl: external ? externalHttpUrl(citation.archivedUrl) : citation.archivedUrl,
      ...(audience === 'internal' ? { localPath: citation.localPath } : {}),
      pageRef: external ? redactNullableExternalText(citation.pageRef) : citation.pageRef,
    },
    hashes: {
      file: citation.fileHash,
      content: citation.contentHash,
      algorithm: citation.hashAlgorithm,
    },
    sourceIds: {
      documentId: citation.documentId,
      sourceDocId: citation.sourceDocId,
    },
    quote: external ? redactNullableExternalText(citation.quote) : citation.quote,
    confidence: citation.confidence,
    ...(external ? {} : { notes: citation.notes }),
    usePolicy,
  }
}

export function assessLibraryAnalysisUse(
  analysis: LibraryAnalysisLike | null | undefined,
  audience: Audience = 'external',
) {
  const blockingReasons: string[] = []

  if (!analysis) {
    blockingReasons.push('library_analysis_missing')
  } else {
    if (analysis.status === 'blocked' || analysis.status === 'superseded') {
      blockingReasons.push(`library_status_${analysis.status}`)
    }
    if (['do_not_use_for_claims', 'type_c_gap', 'requires_actor_gate'].includes(analysis.usageRule)) {
      blockingReasons.push(`usage_rule_${analysis.usageRule}`)
    }
    if (analysis.reviewRequired) blockingReasons.push('library_review_required')
    for (const riskFlag of analysis.riskFlags) {
      blockingReasons.push(`risk_${riskFlag}`)
    }
  }

  const contextAllowed = audience === 'internal'
    && Boolean(analysis)
    && blockingReasons.length === 0

  return {
    audience,
    discoveryOnly: true,
    contextAllowed,
    externalClaimAllowed: false,
    requiresCitationTrace: true,
    blockingReasons,
  }
}

export function formatSearchResultForMcp(
  result: SearchResultLike,
  audience: Audience = 'external',
) {
  const libraryAnalysis = formatLibraryAnalysisForAudience(result.libraryAnalysis, audience)
  const usePolicy = assessLibraryAnalysisUse(libraryAnalysis, audience)
  const summaryAllowed = audience === 'internal'
  const warnings: Array<{ code: string; message: string }> = []

  if (!libraryAnalysis && result.type === 'document') {
    warnings.push({
      code: 'library-analysis-missing',
      message: 'Document has no library-analysis classification; use it only for discovery.',
    })
  }
  if (usePolicy.blockingReasons.length > 0 && libraryAnalysis) {
    warnings.push({
      code: 'library-analysis-restriction',
      message: `Library-analysis restrictions: ${usePolicy.blockingReasons.join(', ')}.`,
    })
  }
  if (!summaryAllowed) {
    warnings.push({
      code: 'external-summary-withheld',
      message: 'Search summary withheld because search results are discovery-only and carry no external citation trace.',
    })
  }

  return {
    id: result.id,
    type: result.type,
    title: truncateText(
      audience === 'external' ? redactExternalText(result.title) : result.title,
      300,
    ),
    ...(summaryAllowed
      ? { summary: truncateText(
          result.excerpt,
          500,
        ) }
      : {}),
    tags: summaryAllowed
      ? (result.tags ?? []).slice(0, 20).map((tag) => truncateText(
          tag,
          100,
        ))
      : [],
    links: formatSearchResultLinks(result, audience),
    relevance: result.relevance ?? null,
    libraryAnalysis,
    usePolicy,
    warnings,
  }
}

export function buildDocumentPayload(
  document: DocumentLike,
  options: {
    includeContent?: boolean
    contentWindow?: number
    audience?: Audience
    libraryAnalysis?: LibraryAnalysisLike | null
    evidenceAppraisal?: EvidenceAppraisalUseLike | null
  } = {},
) {
  const contentWindow = normalizeContentWindow(options.contentWindow)
  const audience = options.audience ?? 'external'
  const warnings: string[] = []

  const citationAssessments = document.sourceCitations.map((citation) => ({
    citation,
    policy: assessCitationUse(citation, audience),
  }))
  const visibleCitations = audience === 'external'
    ? citationAssessments.filter(({ policy }) => policy.allowedForAnswer)
    : citationAssessments

  const withheldCitationCount = citationAssessments.length - visibleCitations.length
  if (withheldCitationCount > 0) {
    warnings.push(`${withheldCitationCount} citation(s) withheld by the ${audience} audience policy`)
  }
  if (audience === 'external' && visibleCitations.length === 0) {
    warnings.push('no citation is currently eligible for an external answer')
  }

  const libraryApproved = isExternallyApprovedLibraryAnalysis(options.libraryAnalysis)
  const appraisalApproved = options.evidenceAppraisal?.externalGateSatisfied === true
  if (audience === 'external' && !appraisalApproved) {
    warnings.push(options.evidenceAppraisal
      ? `evidence appraisal blocks external document text: ${options.evidenceAppraisal.blockingReasons.join(', ') || 'not externally gateable'}`
      : 'evidence appraisal is missing; external document text remains blocked')
  }
  const externalContentAllowed = visibleCitations.length > 0 && libraryApproved && appraisalApproved
  const contentAllowed = audience === 'internal' || externalContentAllowed
  let summary: string | null | undefined = document.summary
  let excerpt: string | undefined
  let content: string | undefined

  if (contentAllowed) {
    const excerptSource = document.summary?.trim() || document.content
    summary = audience === 'external'
      ? redactNullableExternalText(document.summary)
      : document.summary
    excerpt = truncateText(
      audience === 'external' ? redactExternalText(excerptSource) : excerptSource,
      DEFAULT_EXCERPT_LENGTH,
    )

    if (options.includeContent) {
      const contentSource = audience === 'external'
        ? redactExternalText(document.content)
        : document.content
      content = contentSource.slice(0, contentWindow)
      if (contentSource.length > contentWindow) {
        warnings.push(`content truncated to ${contentWindow} characters`)
      }
    } else if (document.content.length > DEFAULT_EXCERPT_LENGTH) {
      warnings.push('content omitted by default; call with includeContent=true for a capped content window')
    }
  } else {
    summary = undefined
    warnings.push('summary, excerpt, and content withheld by the external audience policy')
  }

  const documentAppPath = `/bibliotek/${document.slug}`

  return {
    id: document.id,
    type: 'document' as const,
    audience,
    slug: document.slug,
    title: audience === 'external' ? redactExternalText(document.title) : document.title,
    ...(summary === undefined ? {} : { summary }),
    ...(excerpt === undefined ? {} : { excerpt }),
    ...(content === undefined ? {} : { content }),
    tags: audience === 'external'
      ? document.tags.map(redactExternalText)
      : document.tags,
    links: {
      appPath: audience === 'external'
        ? externalAppPath(documentAppPath)
        : documentAppPath,
      url: audience === 'external' ? externalHttpUrl(document.url) : document.url,
      ...(audience === 'internal' ? { localPath: document.filePath } : {}),
    },
    citations: visibleCitations.map(({ citation }) => formatCitation(citation, audience)),
    citationSummary: {
      total: citationAssessments.length,
      returned: visibleCitations.length,
      withheld: withheldCitationCount,
      externalCitable: citationAssessments.filter(({ policy }) => policy.externalCitable).length,
    },
    libraryAnalysis: formatLibraryAnalysisForAudience(options.libraryAnalysis, audience),
    contentPolicy: {
      audience,
      allowed: contentAllowed,
      requiresExternalCitation: audience === 'external',
      requiresLibraryApproval: audience === 'external',
      requiresEvidenceAppraisal: audience === 'external',
      externalCitationPresent: visibleCitations.length > 0,
      libraryApproved,
      evidenceAppraisalApproved: appraisalApproved,
    },
    sourceStatus: summarizeCitationReadiness(visibleCitations.map(({ citation }) => citation)),
    warnings,
  }
}

export function summarizeCitationReadiness(citations: CitationLike[]): string {
  if (citations.length === 0) return 'no_citations'
  if (citations.some((citation) => citation.citationReadiness === 'citable_external')) return 'has_citable_external'
  if (citations.some((citation) => citation.citationReadiness === 'citable_with_note')) return 'has_citable_with_note'
  if (citations.some((citation) => citation.citationReadiness === 'internal_context')) return 'internal_context_only'
  return 'blocked_or_unknown'
}

export function resolveObsidianVaultPath(vaultRoot: string, resourcePath: string): string {
  if (!resourcePath.trim()) {
    throw new McpInputError('Obsidian resource path must not be empty')
  }
  if (resourcePath.length > MAX_RESOURCE_PATH_LENGTH) {
    throw new McpInputError(`Obsidian resource path must not exceed ${MAX_RESOURCE_PATH_LENGTH} characters`)
  }
  if (resourcePath.includes('\0') || resourcePath.includes('\\')) {
    throw new McpInputError('Obsidian resource path contains unsupported characters')
  }
  if (isAbsolute(resourcePath)) {
    throw new McpInputError('absolute paths are not allowed for Obsidian resources')
  }

  const segments = resourcePath.split('/')
  if (segments.some((segment) => !segment || segment === '.' || segment === '..' || segment.startsWith('.'))) {
    throw new McpInputError('hidden, empty, and traversal path segments are not allowed for Obsidian resources')
  }
  if (!['.md', '.markdown'].includes(extname(resourcePath).toLowerCase())) {
    throw new McpInputError('only Markdown Obsidian resources are allowed')
  }

  const resolvedRoot = resolve(vaultRoot)
  const resolvedPath = resolve(join(resolvedRoot, resourcePath))

  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}/`)) {
    throw new McpInputError('resource path resolves outside the Obsidian vault')
  }

  return resolvedPath
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`
}

function normalizeContentWindow(contentWindow: number | undefined): number {
  if (!Number.isFinite(contentWindow)) return DEFAULT_CONTENT_WINDOW
  return Math.min(MAX_CONTENT_WINDOW, Math.max(500, Math.trunc(contentWindow ?? DEFAULT_CONTENT_WINDOW)))
}

function formatSearchResultLinks(
  result: Pick<SearchResultLike, 'url' | 'sourceUrl'>,
  audience: Audience,
): { appPath: string | null; url: string | null } {
  const appPath = externalAppPath(result.url)
  const legacySourceUrl = !appPath ? result.url : null
  const sourceUrl = result.sourceUrl ?? legacySourceUrl

  return {
    appPath,
    url: audience === 'external'
      ? externalHttpUrl(sourceUrl ?? null)
      : sourceUrl ?? null,
  }
}

const EXTERNAL_APP_DETAIL_ROUTES = new Set([
  'aktorer',
  'personer',
  'selskap',
])

const LOCAL_PATH_ROOT_SEGMENTS = new Set([
  'app', 'applications', 'bin', 'boot', 'dev', 'etc', 'home', 'library',
  'media', 'mnt', 'nix', 'opt', 'private', 'proc', 'root', 'run', 'sbin',
  'secrets', 'srv', 'sys', 'system', 'tmp', 'users', 'usr', 'var', 'volumes',
  'workspace',
])

const EXTERNAL_APP_ANCHOR_ROUTES = new Set([
  'eiendommer',
  'innsikt',
  'masteroppgaver',
])

const EXTERNAL_APP_SIMPLE_ROUTES = new Set([
  'kilder',
  'rapporter',
])

/**
 * Return only an application route that the knowledge search can legitimately
 * emit. A positive route contract avoids mistaking an arbitrary absolute local
 * filesystem path for an application link.
 */
export function externalAppPath(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized || normalized.length > 2_048 || /[\\\r\n\0]/u.test(normalized)) return null
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return null
  if ((normalized.match(/\?/gu)?.length ?? 0) > 1) return null
  if ((normalized.match(/#/gu)?.length ?? 0) > 1) return null

  const [pathAndQuery, rawFragment] = normalized.split('#', 2)
  const [rawPathname, rawQuery] = pathAndQuery!.split('?', 2)
  const pathname = fullyDecodeUriComponent(rawPathname!)
  if (pathname === null) return null
  if (!pathname.startsWith('/') || /[\\\r\n\0]/u.test(pathname)) return null
  const segments = pathname.slice(1).split('/')
  if (segments.some(segment => !isSafeAppToken(segment))) return null

  const [route, ...detailSegments] = segments
  if (!route) return null
  if (route === 'bibliotek') {
    const firstDetail = detailSegments[0]?.toLowerCase()
    return detailSegments.length > 0
      && firstDetail !== undefined
      && !LOCAL_PATH_ROOT_SEGMENTS.has(firstDetail)
      && rawQuery === undefined
      && rawFragment === undefined
      ? normalized
      : null
  }
  if (EXTERNAL_APP_DETAIL_ROUTES.has(route)) {
    return detailSegments.length === 1 && rawQuery === undefined && rawFragment === undefined
      ? normalized
      : null
  }
  if (detailSegments.length > 0) return null

  if (EXTERNAL_APP_SIMPLE_ROUTES.has(route)) {
    return rawQuery === undefined && rawFragment === undefined ? normalized : null
  }
  if (EXTERNAL_APP_ANCHOR_ROUTES.has(route)) {
    if (rawQuery !== undefined) return null
    if (rawFragment === undefined) return normalized
    const fragment = fullyDecodeUriComponent(rawFragment)
    return fragment !== null && isSafeAppToken(fragment) ? normalized : null
  }
  if (route === 'forsyningskjede') {
    if (rawFragment !== undefined) return null
    if (rawQuery === undefined) return normalized
    const [pair, ...extraPairs] = rawQuery.split('&')
    if (extraPairs.length > 0) return null
    const [rawKey, rawValue, ...extraValues] = pair!.split('=')
    if (extraValues.length > 0 || rawValue === undefined) return null
    const key = fullyDecodeUriComponent(rawKey!)
    const queryValue = fullyDecodeUriComponent(rawValue)
    return key === 'relationship' && queryValue !== null && isSafeAppToken(queryValue)
      ? normalized
      : null
  }
  return null
}

function fullyDecodeUriComponent(value: string): string | null {
  let decoded = value
  for (let depth = 0; depth < 32; depth += 1) {
    if (!/%[0-9a-f]{2}/iu.test(decoded)) return decoded
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      return null
    }
  }
  return null
}

function isSafeAppToken(value: string): boolean {
  return /^[\p{L}\p{N}._~-]+$/u.test(value) && value !== '.' && value !== '..'
}

export class McpInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'McpInputError'
  }
}

export function redactAbsoluteFilePaths(value: string): string {
  return value
    .replace(/file:(?:\/+|[A-Za-z]:[\\/])[^\n\r)\]}>,'"`]+/gi, '[redacted-local-path]')
    .replace(
      /(^|[\s([{"'`=])\\\\[^\\\s\n\r)\]}>,'"`]+\\[^\s\n\r)\]}>,'"`]*/gm,
      '$1[redacted-local-path]',
    )
    .replace(
      /(^|[\s([{"'`=])\/(?:Users|Volumes|home|private|tmp|var|opt|app|workspace|srv|mnt|root|etc|usr|bin|sbin|dev|proc|sys|run|nix|secrets|boot|media|Library|System|Applications)\/[^\n\r)\]}>,'"`]*/gm,
      '$1[redacted-local-path]',
    )
    .replace(
      /(^|[\s([{"'`=])\/(?!\/)[^\s\n\r)\]}>,'"`]*/gm,
      '$1[redacted-local-path]',
    )
    .replace(
      /(^|[\s([{"'`=])[A-Za-z]:[\\/][^\n\r)\]}>,'"`]*/gm,
      '$1[redacted-local-path]',
    )
}

/**
 * Redact HTTP(S) locators that are unsafe for an external audience wherever
 * they occur in narrative text. Locator-shaped fields are still normalized by
 * their callers, but this field-name-independent pass prevents private hosts or
 * embedded credentials from leaking through arbitrary database fields.
 */
export function redactUnsafeHttpUrls(value: string): string {
  return value.replace(/https?:\/\/(?:(?!https?:\/\/)[^\s<>"'`])+/giu, candidate => (
    externalHttpUrl(candidate) ?? '[redacted-unsafe-url]'
  ))
}

export function redactExternalText(value: string): string {
  let redacted = ''
  let cursor = 0

  for (const match of value.matchAll(/https?:\/\/(?:(?!https?:\/\/)[^\s<>"'`])+/giu)) {
    const index = match.index
    redacted += redactAbsoluteFilePaths(value.slice(cursor, index))
    redacted += externalHttpUrl(match[0]) ?? '[redacted-unsafe-url]'
    cursor = index + match[0].length
  }

  return redacted + redactAbsoluteFilePaths(value.slice(cursor))
}

function redactNullableExternalText(value: string | null): string | null {
  return value === null ? null : redactExternalText(value)
}

function formatLibraryAnalysisForAudience(
  analysis: LibraryAnalysisLike | null | undefined,
  audience: Audience,
): LibraryAnalysisLike | null {
  if (!analysis) return null
  if (audience === 'internal') return analysis

  return {
    ...analysis,
    status: redactExternalText(analysis.status),
    usageRule: redactExternalText(analysis.usageRule),
    riskFlags: analysis.riskFlags.map(redactExternalText),
  }
}

export function isExternallyApprovedLibraryAnalysis(
  analysis: LibraryAnalysisLike | null | undefined,
): boolean {
  return Boolean(
    analysis
    && analysis.status === 'validated'
    && analysis.usageRule === 'safe_for_external_claims'
    && analysis.externalClaimEligible === true
    && !analysis.reviewRequired
    && analysis.riskFlags.length === 0,
  )
}

function formatDate(value: Date | string | null): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}
