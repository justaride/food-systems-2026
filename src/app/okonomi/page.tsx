import {
  getFinancialTrends,
  getSubsidySumsByCompany,
  getTotalCompanyCount,
} from '@/lib/queries/financials'
import { getSubsidyAggregates } from '@/lib/queries/subsidies'
import { OkonomiContent } from './OkonomiContent'

export default async function OkonomiPage() {
  const [companies, subsidyAggregates, subsidySumsByCompany, totalCompanyCount] = await Promise.all([
    getFinancialTrends(),
    getSubsidyAggregates(),
    getSubsidySumsByCompany(),
    getTotalCompanyCount(),
  ])
  return (
    <OkonomiContent
      companies={companies}
      subsidyAggregates={subsidyAggregates}
      subsidySumsByCompany={subsidySumsByCompany}
      totalCompanyCount={totalCompanyCount}
    />
  )
}
