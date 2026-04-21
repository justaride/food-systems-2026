import { getFinancialTrends } from '@/lib/queries/financials'
import { getSubsidyAggregates } from '@/lib/queries/subsidies'
import { OkonomiContent } from './OkonomiContent'

export default async function OkonomiPage() {
  const [companies, subsidyAggregates] = await Promise.all([
    getFinancialTrends(),
    getSubsidyAggregates(),
  ])
  return <OkonomiContent companies={companies} subsidyAggregates={subsidyAggregates} />
}
