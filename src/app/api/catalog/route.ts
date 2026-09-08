import { NextRequest, NextResponse } from 'next/server'
import { getActorCatalogPage, getDocumentCatalogPage, getSourceCatalogPage } from '@/lib/queries/catalog-pages'
export async function GET(request: NextRequest) {
  const filters = Object.fromEntries(request.nextUrl.searchParams)
  const loader = filters.kind === 'actors' ? getActorCatalogPage : filters.kind === 'documents' ? getDocumentCatalogPage : filters.kind === 'sources' ? getSourceCatalogPage : null
  if (!loader) return NextResponse.json({ error: 'Ukjent katalog' }, { status: 400 })
  try { return NextResponse.json(await loader(filters), { headers: { 'Cache-Control': 'private, no-store' } }) }
  catch (error) { console.error('[catalog] Unable to load page', error); return NextResponse.json({ error: 'Kunne ikke hente listen' }, { status: 503 }) }
}
