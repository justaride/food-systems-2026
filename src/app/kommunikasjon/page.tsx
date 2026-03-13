import { getCommunications } from '@/lib/queries/communications'
import { KommunikasjonContent } from './KommunikasjonContent'

export default async function KommunikasjonPage() {
  const communications = await getCommunications()
  return <KommunikasjonContent communications={communications} />
}
