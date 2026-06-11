import { getCommunicationTableCount, getCommunications } from '@/lib/queries/communications'
import { KommunikasjonContent } from './KommunikasjonContent'

export default async function KommunikasjonPage() {
  const [communications, communicationTableCount] = await Promise.all([
    getCommunications(),
    getCommunicationTableCount(),
  ])

  return (
    <KommunikasjonContent
      communications={communications}
      communicationTableCount={communicationTableCount}
    />
  )
}
