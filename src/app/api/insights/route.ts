import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const phase = params.get('phase') ?? undefined
  const type = params.get('type') ?? undefined
  const tag = params.get('tag') ?? undefined

  const where = {
    ...(phase && { phaseId: phase }),
    ...(type && { insightType: type }),
    ...(tag && { tags: { has: tag } }),
  }

  const insights = await prisma.insight.findMany({
    where,
    include: {
      sourceRefs: { select: { id: true, label: true, url: true, note: true, sourceDocId: true } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ count: insights.length, insights })
}
