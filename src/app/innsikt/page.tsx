import { getInsights } from '@/lib/queries/insights'
import { InnsiktContent } from './InnsiktContent'
import { DybdeanalyseSection } from './DybdeanalyseSection'

export default async function InnsiktPage() {
  const insights = await getInsights({ includeDocumentFallback: true })
  return (
    <div className="space-y-8">
      <DybdeanalyseSection />
      <InnsiktContent insights={insights} />
    </div>
  )
}
