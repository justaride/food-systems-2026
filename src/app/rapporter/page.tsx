export const metadata = { title: 'Rapporter — Food Systems 2026' }

import { getReports } from '@/lib/queries/reports'
import { RapporterContent } from './RapporterContent'

export default async function RapporterPage() {
  const reports = await getReports({ includeDocumentFallback: true })
  return <RapporterContent reports={reports} />
}
