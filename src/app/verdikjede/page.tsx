import { verdikjedeStages } from '@/lib/data/verdikjede'
import { getVerdikjedeEnrichment } from '@/lib/queries/verdikjede'
import { VerdikjedeContent } from './VerdikjedeContent'

export default async function VerdikjedePage() {
  const enrichment = await getVerdikjedeEnrichment()
  return <VerdikjedeContent stages={verdikjedeStages} enrichment={enrichment} />
}
