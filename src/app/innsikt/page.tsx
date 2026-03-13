import { getInsights } from '@/lib/queries/insights'
import { InnsiktContent } from './InnsiktContent'

export default async function InnsiktPage() {
  const insights = await getInsights()
  return <InnsiktContent insights={insights} />
}
