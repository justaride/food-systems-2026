import { NextRequest, NextResponse } from 'next/server'
import { searchWithDiagnostics, type SearchMode } from '@/lib/queries/search'
import { isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import { externalHttpUrl } from '@/lib/citations/external-citation-policy'

const VALID_MODES: SearchMode[] = ['keyword', 'semantic', 'hybrid']
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parseLimit(value: string | null) {
  const parsed = Number(value ?? DEFAULT_LIMIT)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(parsed)))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const limit = parseLimit(request.nextUrl.searchParams.get('limit'))
  const modeParam = request.nextUrl.searchParams.get('mode') ?? 'keyword'
  const mode = VALID_MODES.includes(modeParam as SearchMode) ? (modeParam as SearchMode) : 'keyword'

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
  }

  try {
    const execution = await searchWithDiagnostics(q, limit, mode)
    return NextResponse.json({
      query: q,
      requestedMode: execution.requestedMode,
      mode: execution.executedMode,
      executedMode: execution.executedMode,
      fallback: execution.fallback,
      warnings: execution.warnings,
      count: execution.results.length,
      results: execution.results.map(result => ({
        ...result,
        sourceUrl: externalHttpUrl(result.sourceUrl ?? null),
      })),
    })
  } catch (error) {
    console.error('[search-api] Search failed', error)
    const status = isPrismaDataUnavailable(error) ? 503 : 500
    return NextResponse.json(
      { error: 'Search is unavailable right now', code: 'SEARCH_UNAVAILABLE' },
      { status },
    )
  }
}
