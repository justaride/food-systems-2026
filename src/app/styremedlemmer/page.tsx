import { getInterlockGraph } from '@/lib/queries/interlocks'
import { InterlockContent } from './InterlockContent'

export default async function StyremedlemmerPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; person?: string }>
}) {
  const [data, params] = await Promise.all([getInterlockGraph(), searchParams])
  const initialSelection = params.person
    ? `person-${params.person}`
    : params.company
      ? `company-${params.company}`
      : null
  return <InterlockContent data={data} initialSelection={initialSelection} />
}
