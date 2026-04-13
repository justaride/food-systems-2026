import { getTheses } from '@/lib/queries/theses'
import { MasteroppgaverContent } from './MasteroppgaverContent'

export default async function MasteroppgaverPage() {
  let theses: Awaited<ReturnType<typeof getTheses>> = []
  try {
    theses = await getTheses()
  } catch (e) {
    console.error('[masteroppgaver] DB query failed:', e)
  }
  return <MasteroppgaverContent theses={theses} />
}
