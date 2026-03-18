import { getReports } from '@/lib/queries/reports'
import { RapporterContent } from './RapporterContent'

export default async function RapporterPage() {
  const reports = await getReports()
  return <RapporterContent reports={reports} />
}
