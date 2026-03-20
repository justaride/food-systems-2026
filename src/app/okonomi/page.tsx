import { getFinancialTrends } from '@/lib/queries/financials'
import { OkonomiContent } from './OkonomiContent'

export default async function OkonomiPage() {
  const companies = await getFinancialTrends()
  return <OkonomiContent companies={companies} />
}
