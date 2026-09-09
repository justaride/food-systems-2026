export const metadata = { title: 'Kommunikasjon — Food Systems 2026' }

import { getCommunications } from '@/lib/queries/communications'
import { KommunikasjonContent } from './KommunikasjonContent'

export default async function KommunikasjonPage() {
  const communications = await getCommunications()
  return <KommunikasjonContent communications={communications} />
}
