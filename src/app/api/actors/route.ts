import { NextRequest, NextResponse } from 'next/server'
import { getActors } from '@/lib/queries/actors'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const actors = await getActors({
    actorType: params.get('type') ?? undefined,
    priorityTier: params.get('priority') ?? undefined,
    stance: params.get('stance') ?? undefined,
    country: params.get('country') ?? undefined,
    query: params.get('q') ?? undefined,
  })

  return NextResponse.json({ count: actors.length, actors })
}
