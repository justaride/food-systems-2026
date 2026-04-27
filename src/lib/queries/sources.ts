import path from 'node:path'
import { prisma } from '@/lib/db'
import { buildExcerpt } from './document-fallbacks'

type SourceFallbackDocument = {
  id: string
  slug: string
  filePath: string | null
  title: string
  author: string | null
  year: number | null
  documentType: string | null
  category: string | null
  content: string
  summary: string | null
  url: string | null
  tags: string[]
}

function classifyDocumentSourceType(doc: SourceFallbackDocument) {
  const haystack = [
    doc.documentType,
    doc.category,
    doc.title,
    ...doc.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes('nou')) return 'nou'
  if (
    haystack.includes('annual-report') ||
    haystack.includes('annual report') ||
    haystack.includes('årsrapport') ||
    haystack.includes('arsrapport')
  ) {
    return 'årsrapport'
  }
  if (haystack.includes('thesis') || haystack.includes('masteroppgave') || haystack.includes('master thesis')) {
    return 'masteroppgave'
  }
  if (haystack.includes('pubmed') || haystack.includes('academic') || haystack.includes('forskning')) {
    return 'forskning'
  }
  if (
    haystack.includes('regulatory') ||
    haystack.includes('lov') ||
    haystack.includes('directive') ||
    haystack.includes('forordning') ||
    haystack.includes('forskrift') ||
    haystack.includes('policy') ||
    haystack.includes('utp')
  ) {
    return 'lovverk'
  }
  if (
    haystack.includes('transcript') ||
    haystack.includes('interview') ||
    haystack.includes('intervju')
  ) {
    return 'transkripsjon'
  }
  if (
    haystack.includes('correspondence') ||
    haystack.includes('email') ||
    haystack.includes('epost')
  ) {
    return 'epost'
  }
  if (
    haystack.includes('meeting-note') ||
    haystack.includes('meeting-summary') ||
    haystack.includes('meeting') ||
    haystack.includes('møte') ||
    haystack.includes('moete') ||
    haystack.includes('minutes') ||
    haystack.includes('notat')
  ) {
    return 'notat'
  }
  if (haystack.includes('application') || haystack.includes('søknad') || haystack.includes('soknad')) {
    return 'soknad'
  }
  if (haystack.includes('strategy') || haystack.includes('strategi')) {
    return 'strategi'
  }
  if (haystack.includes('dataset') || haystack.includes('datasett') || haystack.includes('statistikk')) {
    return haystack.includes('statistikk') ? 'statistikk' : 'datasett'
  }
  if (
    haystack.includes('whitepaper') ||
    haystack.includes('report') ||
    haystack.includes('rapport') ||
    haystack.includes('review') ||
    haystack.includes('kartlegging') ||
    haystack.includes('brief')
  ) {
    return 'rapport'
  }
  if (
    haystack.includes('_plans') ||
    haystack.includes('_status') ||
    haystack.includes('intake') ||
    haystack.includes('arkiv-sortert') ||
    haystack.includes('arbeids')
  ) {
    return 'arbeidsdok'
  }
  if (
    haystack.includes('analyse') ||
    haystack.includes('analysis') ||
    haystack.includes('research') ||
    haystack.includes('rammeverk') ||
    haystack.includes('norden') ||
    haystack.includes('external') ||
    haystack.includes('perplexity') ||
    haystack.includes('bibliotek')
  ) {
    return 'analyse'
  }

  return 'rapport'
}

function buildDocumentRelevance(doc: SourceFallbackDocument) {
  const parts = [
    doc.category ? `Kategori ${doc.category}` : null,
    doc.documentType ? `type ${doc.documentType}` : null,
    doc.tags.length ? `tagger ${doc.tags.slice(0, 3).join(', ')}` : null,
    'Avledet fra dokumentbiblioteket og ikke promotert til en egen SourceDoc ennå.',
  ]

  return parts.filter(Boolean).join(' · ')
}

export async function getSources(opts?: {
  type?: string
  excludeDuplicates?: boolean
}) {
  const { type, excludeDuplicates = true } = opts ?? {}
  const where = {
    ...(type && { sourceType: type }),
    ...(excludeDuplicates && { isDuplicate: false }),
  }
  return prisma.sourceDoc.findMany({
    where,
    include: {
      document: { select: { id: true, slug: true, title: true } },
    },
    orderBy: { id: 'asc' },
  })
}

export async function getSourceDocumentFallbacks() {
  const documents = await prisma.document.findMany({
    where: {
      sourceDoc: { is: null },
      report: { is: null },
      thesis: { is: null },
    },
    select: {
      id: true,
      slug: true,
      filePath: true,
      title: true,
      author: true,
      year: true,
      documentType: true,
      category: true,
      content: true,
      summary: true,
      url: true,
      tags: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
  })

  return documents.map((doc) => ({
    id: `doc-${doc.id}`,
    filename: doc.filePath ? path.basename(doc.filePath) : doc.slug,
    title: doc.title,
    author: doc.author,
    year: doc.year ?? null,
    sourceType: classifyDocumentSourceType(doc),
    description: buildExcerpt(
      doc.summary,
      [doc.category, doc.documentType, buildExcerpt(null, doc.content, 180)]
        .filter(Boolean)
        .join(' · '),
      220,
    ),
    relevance: buildDocumentRelevance(doc),
    url: doc.url,
    isDuplicate: false,
    document: {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
    },
  }))
}
