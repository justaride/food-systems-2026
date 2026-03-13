import { NextRequest, NextResponse } from 'next/server'
import { getDocuments } from '@/lib/queries/documents'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const category = params.get('category') ?? undefined
  const country = params.get('country') ?? undefined
  const documentType = params.get('type') ?? undefined
  const limit = Number(params.get('limit') ?? 50)
  const offset = Number(params.get('offset') ?? 0)

  const result = await getDocuments({ category, country, documentType, limit, offset })
  return NextResponse.json(result)
}
