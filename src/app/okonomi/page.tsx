import {
  getFinancialTrends,
  getSubsidySumsByCompany,
  getSubsidySumsByCompanyYear,
  getTotalCompanyCount,
} from '@/lib/queries/financials'
import { getSubsidyAggregates } from '@/lib/queries/subsidies'
import { OkonomiContent } from './OkonomiContent'

export default async function OkonomiPage() {
  const [
    companies,
    subsidyAggregates,
    subsidySumsByCompany,
    subsidySumsByCompanyYear,
    totalCompanyCount,
  ] = await Promise.all([
    getFinancialTrends(),
    getSubsidyAggregates(),
    getSubsidySumsByCompany(),
    getSubsidySumsByCompanyYear(),
    getTotalCompanyCount(),
  ])
  return (
    <OkonomiContent
      companies={companies}
      subsidyAggregates={subsidyAggregates}
      subsidySumsByCompany={subsidySumsByCompany}
      subsidySumsByCompanyYear={subsidySumsByCompanyYear}
      totalCompanyCount={totalCompanyCount}
    />
  )
}
