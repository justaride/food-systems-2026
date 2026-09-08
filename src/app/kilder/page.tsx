import { getSourceCatalogPage } from '@/lib/queries/catalog-pages'
import { KilderContent } from './KilderContent'
export default async function KilderPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams
  const round = typeof p?.round === 'string' ? p.round : 'all'
  return <KilderContent initial={await getSourceCatalogPage({ round })} initialRoundFilter={round} />
}
