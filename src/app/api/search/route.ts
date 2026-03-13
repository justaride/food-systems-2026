import { NextRequest, NextResponse } from 'next/server'
import { unifiedSearch, type SearchMode } from '@/lib/queries/search'

const VALID_MODES: SearchMode[] = ['keyword', 'semantic', 'hybrid']

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 20)
  const modeParam = request.nextUrl.searchParams.get('mode') ?? 'keyword'
  const mode = VALID_MODES.includes(modeParam as SearchMode) ? (modeParam as SearchMode) : 'keyword'

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
  }

  const results = await unifiedSearch(q, limit, mode)
  return NextResponse.json({ query: q, mode, count: results.length, results })
}
