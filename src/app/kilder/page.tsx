import { getSources } from '@/lib/queries/sources'
import { KilderContent } from './KilderContent'

export default async function KilderPage() {
  const sources = await getSources()
  return <KilderContent sources={sources} />
}
