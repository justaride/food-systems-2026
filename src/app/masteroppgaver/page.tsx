import { getTheses } from '@/lib/queries/theses'
import { MasteroppgaverContent } from './MasteroppgaverContent'

export default async function MasteroppgaverPage() {
  const theses = await getTheses()
  return <MasteroppgaverContent theses={theses} />
}
