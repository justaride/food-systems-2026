import { prisma } from '@/lib/db'
import { normalizeInsightCitationFields } from '@/lib/insight-citations'
import {
  buildDocumentDate,
  buildExcerpt,
  normalizeMergeKey,
} from './document-fallbacks'

type GetInsightsOptions = {
  type?: string
  phaseId?: string
  tag?: string
  limit?: number
  includeDocumentFallback?: boolean
}

type InsightRow = {
  id: string
  title: string
  description: string
  insightType: string
  source: string
  sourceLabel: string
  primaryCitationId: string | null
  phaseId: string | null
  tags: string[]
  url: string | null
  date: string
  sourceRefs: Array<{
    id: string
    label: string
    url: string | null
    note: string | null
    sourceDocId: string | null
  }>
  documentSlug: string | null
  origin: 'structured' | 'document'
}

function classifyDocumentInsightType(doc: {
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

  if (haystack.includes('notat')) return 'notat'
  if (haystack.includes('kartlegging') || haystack.includes('mapping') || haystack.includes('oversikt')) {
    return 'kartlegging'
  }
  if (haystack.includes('funn') || haystack.includes('insight')) return 'funn'
  if (haystack.includes('link') || haystack.includes('lenke')) return 'lenke'
  return 'analyse'
}

function mapStructuredInsight(
  insight: {
    id: string
    title: string
    description: string
    insightType: string
    source: string
    sourceLabel: string | null
    primaryCitationId: string | null
    phaseId: string | null
    tags: string[]
    url: string | null
    date: string
    sourceRefs: Array<{
      id: string
      label: string
      url: string | null
      note: string | null
      sourceDocId: string | null
    }>
    documentRefs: Array<{ document: { slug: string; title: string } }>
  },
): InsightRow {
  const primaryDocument = insight.documentRefs[0]?.document ?? null
  const citationFields = normalizeInsightCitationFields(insight)

  return {
    ...insight,
    ...citationFields,
    phaseId: insight.phaseId ?? null,
    url: insight.url ?? null,
    sourceRefs: insight.sourceRefs.map((source) => ({
      ...source,
      url: source.url ?? null,
      note: source.note ?? null,
      sourceDocId: source.sourceDocId ?? null,
    })),
    documentSlug: primaryDocument?.slug ?? null,
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
  summary: string | null
  content: string
  url: string | null
  tags: string[]
  updatedAt: Date
}): InsightRow {
  return {
    id: `doc-${doc.id}`,
    title: doc.title,
    description: buildExcerpt(doc.summary, doc.content, 260),
    insightType: classifyDocumentInsightType(doc),
    source: doc.author ?? doc.category ?? 'Dokumentbibliotek',
    sourceLabel: doc.author ?? doc.category ?? 'Dokumentbibliotek',
    primaryCitationId: null,
    phaseId: null,
    tags: [...new Set([...doc.tags, 'dokumentbasert'])].slice(0, 8),
    url: doc.url ?? null,
    date: buildDocumentDate(doc),
    sourceRefs: doc.url
      ? [
          {
            id: `doc-src-${doc.id}`,
            label: 'Ekstern kilde',
            url: doc.url,
            note: 'Lenke registrert pa dokumentet',
            sourceDocId: null,
          },
        ]
      : [],
    documentSlug: doc.slug,
    origin: 'document',
  }
}

function dedupeInsights(rows: InsightRow[]) {
  const deduped = new Map<string, InsightRow>()

  for (const row of rows) {
    const key = normalizeMergeKey(row.title, row.insightType)
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, row)
      continue
    }

    if (existing.origin === 'document' && row.origin === 'structured') {
      deduped.set(key, row)
    }
  }

  return [...deduped.values()].sort((a, b) => b.date.localeCompare(a.date, 'nb'))
}

async function loadStructuredInsights(opts: GetInsightsOptions) {
  const { type, phaseId, tag } = opts
  const where = {
    ...(type && { insightType: type }),
    ...(phaseId && { phaseId }),
    ...(tag && { tags: { has: tag } }),
  }

  const insights = await prisma.insight.findMany({
    where,
    include: {
      sourceRefs: { select: { id: true, label: true, url: true, note: true, sourceDocId: true } },
      documentRefs: {
        select: {
          document: {
            select: { slug: true, title: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  return insights.map(mapStructuredInsight)
}

async function loadFallbackInsightDocuments(opts: GetInsightsOptions) {
  const docs = await prisma.document.findMany({
    where: {
      insightDocumentRefs: { none: {} },
      documentType: {
        notIn: ['meeting-note', 'transcript', 'application', 'strategy', 'correspondence'],
      },
      OR: [
        { category: { in: ['analyse', 'perplexity-20-04-26', 'norden', 'external', 'regulatory', 'rammeverk'] } },
        { title: { contains: 'analyse', mode: 'insensitive' } },
        { title: { contains: 'kartlegging', mode: 'insensitive' } },
        { title: { contains: 'oversikt', mode: 'insensitive' } },
        { title: { contains: 'review', mode: 'insensitive' } },
        { title: { contains: 'insights', mode: 'insensitive' } },
      ],
      ...(opts.tag && { tags: { has: opts.tag } }),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      year: true,
      category: true,
      documentType: true,
      summary: true,
      content: true,
      url: true,
      tags: true,
      updatedAt: true,
    },
    orderBy: [{ year: 'desc' }, { updatedAt: 'desc' }],
    take: 120,
  })

  const mapped = docs.map(mapFallbackDocument)

  return mapped.filter((row) => {
    if (opts.type && row.insightType !== opts.type) return false
    return true
  })
}

export async function getInsights(opts?: GetInsightsOptions) {
  const resolved = opts ?? {}
  const structured = await loadStructuredInsights(resolved)

  if (!resolved.includeDocumentFallback) {
    return resolved.limit ? structured.slice(0, resolved.limit) : structured
  }

  const fallback = await loadFallbackInsightDocuments(resolved)
  const merged = dedupeInsights([...structured, ...fallback])

  return resolved.limit ? merged.slice(0, resolved.limit) : merged
}
