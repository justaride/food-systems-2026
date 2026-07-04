import { isAbsolute, join, resolve } from 'node:path'

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 25
export const DEFAULT_EXCERPT_LENGTH = 500
export const DEFAULT_CONTENT_WINDOW = 4_000

export type CitationLike = {
  id: string
  citationReadiness: string
  verificationStatus: string
  citationText: string
  title: string | null
  url: string | null
  archivedUrl: string | null
  localPath: string | null
  pageRef: string | null
  quote: string | null
  confidence: number | null
  notes: string | null
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
  if (!trimmed) throw new Error('query must not be empty')
  return trimmed
}

export function normalizeLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  const integerLimit = Math.trunc(limit ?? DEFAULT_LIMIT)
  return Math.min(MAX_LIMIT, Math.max(1, integerLimit))
}

export function formatCitation(citation: CitationLike) {
  return {
    id: citation.id,
    readiness: citation.citationReadiness,
    verificationStatus: citation.verificationStatus,
    citationText: citation.citationText,
    title: citation.title,
    locators: {
      url: citation.url,
      archivedUrl: citation.archivedUrl,
      localPath: citation.localPath,
      pageRef: citation.pageRef,
    },
    quote: citation.quote,
    confidence: citation.confidence,
    notes: citation.notes,
  }
}

export function buildDocumentPayload(
  document: DocumentLike,
  options: { includeContent?: boolean; contentWindow?: number } = {},
) {
  const contentWindow = normalizeContentWindow(options.contentWindow)
  const excerptSource = document.summary?.trim() || document.content
  const excerpt = truncateText(excerptSource, DEFAULT_EXCERPT_LENGTH)
  const warnings: string[] = []
  let content: string | undefined

  if (options.includeContent) {
    content = document.content.slice(0, contentWindow)
    if (document.content.length > contentWindow) {
      warnings.push(`content truncated to ${contentWindow} characters`)
    }
  } else if (document.content.length > DEFAULT_EXCERPT_LENGTH) {
    warnings.push('content omitted by default; call with includeContent=true for a capped content window')
  }

  return {
    id: document.id,
    type: 'document' as const,
    slug: document.slug,
    title: document.title,
    summary: document.summary,
    excerpt,
    content,
    tags: document.tags,
    links: {
      appPath: `/bibliotek/${document.slug}`,
      url: document.url,
      localPath: document.filePath,
    },
    citations: document.sourceCitations.map(formatCitation),
    sourceStatus: summarizeCitationReadiness(document.sourceCitations),
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
  if (isAbsolute(resourcePath)) {
    throw new Error('absolute paths are not allowed for Obsidian resources')
  }

  const resolvedRoot = resolve(vaultRoot)
  const resolvedPath = resolve(join(resolvedRoot, resourcePath))

  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}/`)) {
    throw new Error('resource path resolves outside the Obsidian vault')
  }

  return resolvedPath
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`
}

function normalizeContentWindow(contentWindow: number | undefined): number {
  if (!Number.isFinite(contentWindow)) return DEFAULT_CONTENT_WINDOW
  return Math.min(20_000, Math.max(500, Math.trunc(contentWindow ?? DEFAULT_CONTENT_WINDOW)))
}
