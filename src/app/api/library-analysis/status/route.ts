import { NextResponse } from 'next/server'
import { getLibraryAnalysisStatus } from '@/lib/queries/library-analysis'
import { isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import version from '@/generated/version.json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const status = await getLibraryAnalysisStatus()
    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        version,
        ...status,
      },
      { status: status.ok ? 200 : 503 },
    )
  } catch (error) {
    console.error('[library-analysis-status-api] Status failed', error)
    const unavailable = isPrismaDataUnavailable(error)
    return NextResponse.json(
      {
        ok: false,
        checkedAt: new Date().toISOString(),
        version,
        error: unavailable ? 'Library analysis data is unavailable' : 'Library analysis status failed',
      },
      { status: unavailable ? 503 : 500 },
    )
  }
}
