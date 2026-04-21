import { getInsights } from '@/lib/queries/insights'
import { InnsiktContent } from './InnsiktContent'

export default async function InnsiktPage() {
  const insights = await getInsights({ includeDocumentFallback: true })
  return <InnsiktContent insights={insights} />
}
