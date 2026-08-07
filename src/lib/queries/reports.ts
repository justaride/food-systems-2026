import { prisma } from '@/lib/db'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import {
  evaluateExternalCitationReadiness,
  type ExternalUseExclusionReason,
} from '@/lib/citations/citable-record-filter'
import {
  applyReportProvenanceCitationCeiling,
  reportProvenanceCitationCeiling,
} from '@/lib/citations/report-provenance'
import type { ReportProvenanceType, ReportSupportingSource } from '@/lib/types'
import {
  buildExcerpt,
  buildSentenceList,
  normalizeCountryCode,
  normalizeMergeKey,
} from './document-fallbacks'

type GetReportsOptions = {
  category?: string
  country?: string
  tag?: string
  includeDocumentFallback?: boolean
}

type ReportRow = {
  id: string
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  provenanceType: ReportProvenanceType | null
  supportingSources: ReportSupportingSource[]
  documentSlug: string | null
  origin: 'structured' | 'document'
  citations: ReportCitation[]
  citationReadiness: CitationReadinessLevel | null
  citationNote: string | null
  externalUseAllowed: boolean
  externalUseReason: ExternalUseExclusionReason | null
}

const reportProvenanceTypes = new Set<ReportProvenanceType>([
  'external_report',
  'external_article',
  'internal_synthesis',
  'internal_register',
  'composite_source',
  'blocked_source',
])

const sourceCitationSelect = {
  citationText: true,
  title: true,
  url: true,
  localPath: true,
  pageRef: true,
  accessedAt: true,
  verifiedAt: true,
  citationReadiness: true,
  notes: true,
} as const

type SourceCitationRow = {
  citationText: string
  title: string | null
  url: string | null
  localPath: string | null
  pageRef: string | null
  accessedAt: Date | null
  verifiedAt: Date | null
  citationReadiness: string
  notes: string | null
}

type ReportCitation = {
  citationText?: string | null
  title?: string | null
  label?: string | null
  url?: string | null
  localPath?: string | null
  pageRef?: string | null
  accessedAt?: string | null
  verifiedAt?: string | null
  citationReadiness: CitationReadinessLevel
  note?: string | null
  notes?: string | null
}

type ReportCitationSource = {
  id: string
  title: string
  sourceUrl: string | null
  provenanceType: ReportProvenanceType | null
  supportingSources: ReportSupportingSource[]
  documentSlug: string | null
  documentFilePath?: string | null
  sourceCitations?: SourceCitationRow[]
}

function toIsoDate(value: Date | null) {
  return value ? value.toISOString() : null
}

function mapSourceCitation(citation: SourceCitationRow): ReportCitation {
  return {
    citationText: citation.citationText,
    title: citation.title,
    url: citation.url,
    localPath: citation.localPath,
    pageRef: citation.pageRef,
    accessedAt: toIsoDate(citation.accessedAt),
    verifiedAt: toIsoDate(citation.verifiedAt),
    citationReadiness: citation.citationReadiness as CitationReadinessLevel,
    notes: citation.notes,
  }
}

function buildFallbackCitation(
  source: ReportCitationSource,
  readiness: CitationReadinessLevel,
  note: string | null,
): ReportCitation {
  return {
    citationText: source.title,
    title: source.title,
    url: source.sourceUrl,
    localPath: source.documentFilePath ?? (source.documentSlug ? `/bibliotek/${source.documentSlug}` : null),
    citationReadiness: readiness,
    note,
  }
}

function buildReportCitations(source: ReportCitationSource): ReportCitation[] {
  const provenanceCeiling = reportProvenanceCitationCeiling(source)
  if (provenanceCeiling) {
    const ceilingNote = source.provenanceType === 'blocked_source'
      ? 'Blokkert eller utilstrekkelig kildegrunnlag.'
      : source.provenanceType === 'composite_source'
        ? 'Komposittpost er kun intern kontekst på radnivå; ingen claim-level autorisasjon er koblet til denne visningen.'
        : 'Intern syntese/registerpost, ikke ekstern sitatkilde.'

    if (source.sourceCitations && source.sourceCitations.length > 0) {
      return source.sourceCitations.map(sourceCitation => {
        const citation = mapSourceCitation(sourceCitation)
        return {
          ...citation,
          citationReadiness: applyReportProvenanceCitationCeiling(
            source,
            citation.citationReadiness,
          ),
          note: ceilingNote,
        }
      })
    }

    if (
      source.provenanceType === 'composite_source'
      && source.supportingSources.length > 0
    ) {
      return source.supportingSources.map(supportingSource => ({
        citationText: supportingSource.label,
        title: supportingSource.label,
        url: supportingSource.url ?? null,
        localPath: supportingSource.documentPath ?? null,
        citationReadiness: provenanceCeiling,
        note: ceilingNote,
      }))
    }

    return [buildFallbackCitation(source, provenanceCeiling, ceilingNote)]
  }

  if (source.sourceCitations && source.sourceCitations.length > 0) {
    return source.sourceCitations.map(mapSourceCitation)
  }

  const hasDirectSource = Boolean(source.sourceUrl || source.documentFilePath || source.documentSlug)

  if (hasDirectSource) {
    return [
      buildFallbackCitation(
        source,
        'citable_with_note',
        source.documentSlug
          ? 'Dokumentbasert fallback; kontroller felt-/sidegrunnlag for direkte sitatbruk.'
          : 'Kilde-URL finnes; kontroller felt-/sidegrunnlag for direkte sitatbruk.',
      ),
    ]
  }

  return [buildFallbackCitation(source, 'blocked_unsourced', 'Ingen ekstern kilde eller lokalt dokumentgrunnlag registrert.')]
}

function withExternalUseEvaluation<T extends Omit<ReportRow, 'citations' | 'citationReadiness' | 'citationNote' | 'externalUseAllowed' | 'externalUseReason'>>(
  row: T,
  citations: ReportCitation[],
): ReportRow {
  const evaluation = evaluateExternalCitationReadiness({
    id: row.id,
    provenanceType: row.provenanceType,
    citations,
  })
  const citationNote = citations.find((citation) => citation.note || citation.notes)?.note
    ?? citations.find((citation) => citation.note || citation.notes)?.notes
    ?? null

  return {
    ...row,
    citations,
    citationReadiness: evaluation.readiness ?? citations[0]?.citationReadiness ?? null,
    citationNote,
    externalUseAllowed: evaluation.usable,
    externalUseReason: evaluation.reason ?? null,
  }
}

function parseProvenanceType(value: string | null): ReportProvenanceType | null {
  if (!value) return null
  return reportProvenanceTypes.has(value as ReportProvenanceType) ? (value as ReportProvenanceType) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function parseSupportingSources(value: unknown): ReportSupportingSource[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry) => {
    if (!isRecord(entry)) return []

    const label = optionalString(entry.label)
    if (!label) return []

    const url = optionalString(entry.url)
    const reportId = optionalString(entry.reportId)
    const documentPath = optionalString(entry.documentPath)
    const note = optionalString(entry.note)

    return {
      label,
      ...(url ? { url } : {}),
      ...(reportId ? { reportId } : {}),
      ...(documentPath ? { documentPath } : {}),
      ...(note ? { note } : {}),
    }
  })
}

function isReportLikeTitle(title: string) {
  return /\b(nou|sou|rapport|report|årsrapport|arsrapport|annual report|utredning|review|oversikt|kartlegging|policy|marginstudie)\b/i.test(
    title,
  )
}

function mapDocumentToReportCategory(doc: {
  title: string
  category: string | null
  documentType: string | null
  tags: string[]
}) {
  const haystack = [
    doc.title,
    doc.category ?? '',
    doc.documentType ?? '',
    ...doc.tags,
  ]
    .join(' ')
    .toLowerCase()

  if (/\b(nou|sou)\b/.test(haystack)) return 'nou'
  if (haystack.includes('konkurranse') || haystack.includes('competition')) return 'konkurransetilsyn'
  if (haystack.includes('annual-report') || haystack.includes('annual report') || haystack.includes('årsrapport') || haystack.includes('arsrapport')) {
    return 'bransje'
  }
  if (haystack.includes('menon') || haystack.includes('oslo economics') || haystack.includes('konsulent')) {
    return 'konsulentrapport'
  }
  if (haystack.includes('sirkul') || haystack.includes('matsvinn') || haystack.includes('circular-economy')) {
    return 'sirkularitet'
  }
  if (haystack.includes('beredskap') || haystack.includes('selvforsyning') || haystack.includes('security-of-supply')) {
    return 'beredskap'
  }
  if (
    haystack.includes('jurid') ||
    haystack.includes('regulatory') ||
    haystack.includes('lovverk') ||
    haystack.includes('eudr')
  ) {
    return 'juridisk'
  }
  if (
    haystack.includes('akadem') ||
    haystack.includes('academic') ||
    haystack.includes('university') ||
    haystack.includes('forskn')
  ) {
    return 'akademia'
  }
  if (
    haystack.includes('tenketank') ||
    haystack.includes('civita') ||
    haystack.includes('ellen macarthur') ||
    haystack.includes('stockholm resilience')
  ) {
    return 'tenketank'
  }
  if (doc.category === 'analyse' || doc.category === 'norden') return 'oversikt'

  return 'offentlig'
}

function buildReportRelevance(doc: {
  category: string | null
  summary: string | null
  content: string
}) {
  const summary = buildExcerpt(doc.summary, doc.content, 220)
  const sourceLabel = doc.category ? `Kategori ${doc.category}` : 'dokumentbiblioteket'
  return `${summary} Denne posten er avledet fra ${sourceLabel} og er forelopig ikke promotert til en egen Report-rad.`
}

function buildRecommendations(summary: string | null, content: string) {
  const candidates = buildSentenceList(summary, 4)
  const recommendationish = candidates.filter((sentence) =>
    /\b(anbefal|bør|should|recommend|policy)\b/i.test(sentence),
  )

  if (recommendationish.length > 0) return recommendationish.slice(0, 3)
  return buildSentenceList(content, 2).filter((sentence) => /\b(anbefal|bør|should|recommend)\b/i.test(sentence))
}

export function mapStructuredReport(report: Awaited<ReturnType<typeof prisma.report.findMany>>[number] & {
  document: {
    slug: string
    url: string | null
    filePath: string | null
    summary: string | null
    content: string
    tags: string[]
    sourceCitations: SourceCitationRow[]
  } | null
}): ReportRow {
  const documentSummary = report.document?.summary ?? null
  const documentContent = report.document?.content ?? ''
  const provenanceType = parseProvenanceType(report.provenanceType)
  const sourceUrl = report.sourceUrl ?? report.document?.url ?? null
  const documentSlug = report.document?.slug ?? null
  const supportingSources = parseSupportingSources(report.supportingSources)

  const row = {
    id: report.id,
    title: report.title,
    fullTitle: report.fullTitle ?? null,
    author: report.author ?? null,
    institution: report.institution ?? null,
    date: report.date ?? null,
    year: report.year ?? null,
    sourceUrl,
    reportCategory: report.reportCategory,
    country: normalizeCountryCode(report.country, 'NO'),
    keyFindings:
      report.keyFindings.length > 0 ? report.keyFindings : buildSentenceList(documentSummary ?? documentContent, 3),
    recommendations:
      report.recommendations.length > 0
        ? report.recommendations
        : buildRecommendations(documentSummary, documentContent),
    relevance: report.relevance || buildExcerpt(documentSummary, documentContent, 220),
    tags: report.tags.length > 0 ? report.tags : report.document?.tags ?? [],
    provenanceType,
    supportingSources,
    documentSlug,
    origin: 'structured' as const,
  }

  return withExternalUseEvaluation(
    row,
    buildReportCitations({
      id: row.id,
      title: row.title,
      sourceUrl,
      provenanceType,
      supportingSources,
      documentSlug,
      documentFilePath: report.document?.filePath ?? null,
      sourceCitations: report.document?.sourceCitations ?? [],
    }),
  )
}

function mapFallbackDocument(doc: {
  id: string
  slug: string
  title: string
  author: string | null
  year: number | null
  category: string | null
  documentType: string | null
  country: string | null
  summary: string | null
  content: string
  url: string | null
  filePath: string | null
  tags: string[]
  sourceCitations: SourceCitationRow[]
}): ReportRow {
  const sourceUrl = doc.url ?? null
  const row = {
    id: `doc-${doc.id}`,
    title: doc.title,
    fullTitle: null,
    author: doc.author ?? null,
    institution: doc.author ?? null,
    date: doc.year ? String(doc.year) : null,
    year: doc.year ?? null,
    sourceUrl: doc.url ?? null,
    reportCategory: mapDocumentToReportCategory(doc),
    country: normalizeCountryCode(doc.country, 'NORDIC'),
    keyFindings: buildSentenceList(doc.summary ?? doc.content, 3),
    recommendations: buildRecommendations(doc.summary, doc.content),
    relevance: buildReportRelevance(doc),
    tags: [...new Set([...doc.tags, 'dokumentbasert'])],
    provenanceType: null,
    supportingSources: [],
    documentSlug: doc.slug,
    origin: 'document' as const,
  }

  return withExternalUseEvaluation(
    row,
    buildReportCitations({
      id: row.id,
      title: row.title,
      sourceUrl,
      provenanceType: null,
      supportingSources: [],
      documentSlug: row.documentSlug,
      documentFilePath: doc.filePath,
      sourceCitations: doc.sourceCitations,
    }),
  )
}

function dedupeReports(rows: ReportRow[]) {
  const deduped = new Map<string, ReportRow>()

  for (const row of rows) {
    const key = normalizeMergeKey(row.title, row.year, row.reportCategory)
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, row)
      continue
    }

    if (existing.origin === 'document' && row.origin === 'structured') {
      deduped.set(key, row)
    }
  }

  return [...deduped.values()].sort((a, b) => {
    const yearA = a.year ?? -Infinity
    const yearB = b.year ?? -Infinity
    if (yearA !== yearB) return yearB - yearA
    return a.title.localeCompare(b.title, 'nb')
  })
}

async function loadStructuredReports(opts: GetReportsOptions) {
  const { category, country, tag } = opts
  const where = {
    ...(category && { reportCategory: category }),
    ...(country && { country }),
    ...(tag && { tags: { has: tag } }),
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      document: {
        select: {
          slug: true,
          url: true,
          filePath: true,
          summary: true,
          content: true,
          tags: true,
          sourceCitations: {
            select: sourceCitationSelect,
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
  })

  return reports.map(mapStructuredReport)
}

async function loadFallbackReportDocuments(opts: GetReportsOptions) {
  const docs = await prisma.document.findMany({
    where: {
      report: { is: null },
      documentType: {
        notIn: ['meeting-note', 'transcript', 'application', 'strategy', 'correspondence'],
      },
      OR: [
        { category: { in: ['analyse', 'norden', 'regulatory', 'external', 'rammeverk'] } },
        { documentType: { in: ['annual-report', 'regulatory', 'circular-economy', 'academic'] } },
        { title: { contains: 'rapport', mode: 'insensitive' } },
        { title: { contains: 'report', mode: 'insensitive' } },
        { title: { contains: 'utredning', mode: 'insensitive' } },
        { title: { contains: 'årsrapport', mode: 'insensitive' } },
        { title: { contains: 'annual report', mode: 'insensitive' } },
        { title: { contains: 'review', mode: 'insensitive' } },
        { title: { contains: 'kartlegging', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      year: true,
      category: true,
      documentType: true,
      country: true,
      summary: true,
      content: true,
      url: true,
      filePath: true,
      tags: true,
      sourceCitations: {
        select: sourceCitationSelect,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
    take: 150,
  })

  const mapped = docs
    .filter((doc) => isReportLikeTitle(doc.title) || doc.category === 'analyse' || doc.documentType === 'annual-report')
    .map(mapFallbackDocument)

  return mapped.filter((row) => {
    if (opts.category && row.reportCategory !== opts.category) return false
    if (opts.country && row.country !== normalizeCountryCode(opts.country, opts.country.toUpperCase())) return false
    if (opts.tag && !row.tags.includes(opts.tag)) return false
    return true
  })
}

export async function getReports(opts?: GetReportsOptions) {
  const resolved = opts ?? {}
  const structured = await loadStructuredReports(resolved)

  if (!resolved.includeDocumentFallback) {
    return structured
  }

  const fallback = await loadFallbackReportDocuments(resolved)
  return dedupeReports([...structured, ...fallback])
}
