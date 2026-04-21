import { prisma } from '@/lib/db'
import { communications as fallbackCommunications } from '@/lib/data/communications'
import { isPrismaDataUnavailable } from './prisma-errors'

type CommunicationRow = {
  id: string
  title: string
  summary: string
  commType: string
  sender: string
  recipients: string[]
  date: string
  tags: string[]
  documentSlug?: string | null
}

function formatFallbackSummary(summary: string | null, title: string) {
  if (summary && summary.trim()) return summary.trim()
  return `${title}. Korrespondansen er forelopig kun strukturert som dokument.`
}

function mapFallbackDocumentsToCommunications(
  docs: Array<{
    id: string
    slug: string
    title: string
    author: string | null
    summary: string | null
    year: number | null
    tags: string[]
  }>,
): CommunicationRow[] {
  return docs.map((doc) => ({
    id: `doc-${doc.id}`,
    title: doc.title,
    summary: formatFallbackSummary(doc.summary, doc.title),
    commType: doc.tags.includes('brev') ? 'brev' : 'epost',
    sender: doc.author ?? 'Ukjent avsender',
    recipients: [],
    date: doc.year ? String(doc.year) : 'Udatert',
    tags: [...new Set([...doc.tags, 'fra-dokument'])],
    documentSlug: doc.slug,
  }))
}

function dedupeCommunications(rows: CommunicationRow[]) {
  const deduped = new Map<string, CommunicationRow>()

  for (const row of rows) {
    const key = `${row.title.trim().toLowerCase()}::${row.date.trim().toLowerCase()}`
    if (!deduped.has(key)) deduped.set(key, row)
  }

  return [...deduped.values()].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date, 'nb')
    if (byDate !== 0) return byDate
    return a.title.localeCompare(b.title, 'nb')
  })
}

async function loadCommunicationsFromTable(type?: string): Promise<CommunicationRow[]> {
  try {
    const where = {
      ...(type && { commType: type }),
    }

    return await prisma.communication.findMany({
      where,
      orderBy: { date: 'desc' },
    })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    return []
  }
}

async function loadCommunicationsFromDocuments(type?: string): Promise<CommunicationRow[]> {
  if (type && type !== 'epost' && type !== 'brev') return []

  try {
    const docs = await prisma.document.findMany({
      where: {
        OR: [
          { documentType: 'correspondence' },
          { tags: { has: 'epost' } },
          { tags: { has: 'brev' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        summary: true,
        year: true,
        tags: true,
      },
      orderBy: [{ year: 'desc' }, { title: 'asc' }],
    })

    return mapFallbackDocumentsToCommunications(docs).filter((row) => !type || row.commType === type)
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    return []
  }
}

export async function getCommunications(opts?: { type?: string }) {
  const { type } = opts ?? {}
  const [tableRows, documentRows] = await Promise.all([
    loadCommunicationsFromTable(type),
    loadCommunicationsFromDocuments(type),
  ])

  if (tableRows.length > 0 || documentRows.length > 0) {
    return dedupeCommunications([...tableRows, ...documentRows])
  }

  return fallbackCommunications
    .filter(item => !type || item.type === type)
    .map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      commType: item.type,
      sender: item.from,
      recipients: Array.isArray(item.to) ? item.to : [item.to],
      date: item.date,
      tags: item.tags ?? [],
      documentSlug: null,
    }))
}
