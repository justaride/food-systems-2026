import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const type = params.get('type') ?? undefined
  const excludeDuplicates = params.get('duplicates') !== 'true'

  const where = {
    ...(type && { sourceType: type }),
    ...(excludeDuplicates && { isDuplicate: false }),
  }

  const sources = await prisma.sourceDoc.findMany({
    where,
    include: {
      document: { select: { id: true, slug: true, title: true } },
      _count: { select: { sourceRefs: true } },
    },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({ count: sources.length, sources })
}
