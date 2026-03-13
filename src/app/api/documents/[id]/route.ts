import { NextRequest, NextResponse } from 'next/server'
import { getDocumentById } from '@/lib/queries/documents'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const document = await getDocumentById(id)

  if (!document) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(document)
}
