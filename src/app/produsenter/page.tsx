import { getProducers, getProducerCount } from '@/lib/queries/producers'
import { ProdusenterContent } from './ProdusenterContent'
import { parsePage } from '@/lib/pagination'

export const metadata = { title: 'Produsentregister - Food Systems 2026' }
const PAGE_SIZE = 100

export default async function ProdusenterPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams
  const query = (params.q ?? '').trim().slice(0, 200)
  const [total, matches] = await Promise.all([getProducerCount(), getProducerCount(query)])
  const page = Math.min(parsePage(params.page), Math.max(1, Math.ceil(matches / PAGE_SIZE)))
  const producers = await getProducers({ search: query, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE })
  return <ProdusenterContent producers={producers} total={total} matches={matches} page={page} pageSize={PAGE_SIZE} query={query} />
}
