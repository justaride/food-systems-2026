import { NextRequest, NextResponse } from 'next/server'
import { unifiedSearch } from '@/lib/queries/search'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 20)

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
  }

  const results = await unifiedSearch(q, limit)
  return NextResponse.json({ query: q, count: results.length, results })
}
