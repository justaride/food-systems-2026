import { prisma } from '@/lib/db'

export async function getDocuments(opts?: {
  category?: string
  country?: string
  documentType?: string
  limit?: number
  offset?: number
}) {
  const { category, country, documentType, limit = 50, offset = 0 } = opts ?? {}

  const where = {
    ...(category && { category }),
    ...(country && { country }),
    ...(documentType && { documentType }),
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        year: true,
        category: true,
        subcategory: true,
        country: true,
        documentType: true,
        wordCount: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { title: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.document.count({ where }),
  ])

  return { documents, total }
}

export async function getDocumentBySlug(slug: string) {
  return prisma.document.findUnique({
    where: { slug },
    include: {
      sourceDoc: true,
      thesis: true,
      refsFrom: { include: { to: { select: { id: true, title: true, slug: true } } } },
      refsTo: { include: { from: { select: { id: true, title: true, slug: true } } } },
    },
  })
}
