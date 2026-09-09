export const metadata = { title: 'Søk — Food Systems 2026' }

import { SokContent } from './SokContent'
import { getSemanticSearchStatus } from '@/lib/queries/semantic-search'

export const dynamic = 'force-dynamic'
export default async function SokPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const status = await getSemanticSearchStatus()
  return <SokContent semanticAvailable={status.available} initialQuery={typeof params.q === 'string' ? params.q.slice(0, 200) : ''} />
}
