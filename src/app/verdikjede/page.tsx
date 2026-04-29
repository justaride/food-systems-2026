import { verdikjedeStages } from '@/lib/data/verdikjede'
import { getVerdikjedeEnrichment, getVerdikjedeOverview } from '@/lib/queries/verdikjede'
import { VerdikjedeContent } from './VerdikjedeContent'

export default async function VerdikjedePage() {
  const [enrichment, overview] = await Promise.all([
    getVerdikjedeEnrichment(),
    getVerdikjedeOverview(),
  ])
  return <VerdikjedeContent stages={verdikjedeStages} enrichment={enrichment} overview={overview} />
}
