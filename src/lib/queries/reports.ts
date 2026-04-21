import { prisma } from '@/lib/db'
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
  documentSlug: string | null
  origin: 'structured' | 'document'
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

function mapStructuredReport(report: Awaited<ReturnType<typeof prisma.report.findMany>>[number] & {
  document: { slug: string; url: string | null; summary: string | null; content: string; tags: string[] } | null
}): ReportRow {
  const documentSummary = report.document?.summary ?? null
  const documentContent = report.document?.content ?? ''

  return {
    id: report.id,
    title: report.title,
    fullTitle: report.fullTitle ?? null,
    author: report.author ?? null,
    institution: report.institution ?? null,
    date: report.date ?? null,
    year: report.year ?? null,
    sourceUrl: report.sourceUrl ?? report.document?.url ?? null,
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
    documentSlug: report.document?.slug ?? null,
    origin: 'structured',
  }
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
  tags: string[]
}): ReportRow {
  return {
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
    documentSlug: doc.slug,
    origin: 'document',
  }
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
          summary: true,
          content: true,
          tags: true,
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
      tags: true,
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
