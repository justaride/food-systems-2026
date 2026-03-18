import { verdikjedeStages } from '@/lib/data/verdikjede'
import { VerdikjedeContent } from './VerdikjedeContent'

export default function VerdikjedePage() {
  return <VerdikjedeContent stages={verdikjedeStages} />
}
