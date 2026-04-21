import type { Metadata } from 'next'
import {
  getSubsidiesByKommune,
  getSubsidiesByScheme,
  getTopSubsidyRecipients,
  getSubsidyTotals,
} from '@/lib/queries/subsidies-agg'
import { SubsidierContent } from './SubsidierContent'

export const metadata: Metadata = {
  title: 'Subsidier — Food Systems 2026',
  description:
    'Produksjonstilskudd og øvrige jordbrukssubsidier per kommune, ordning og mottaker',
}

export default async function SubsidierPage() {
  const [byKommune, byScheme, topRecipients, totals] = await Promise.all([
    getSubsidiesByKommune('produksjonstilskudd'),
    getSubsidiesByScheme('produksjonstilskudd'),
    getTopSubsidyRecipients('produksjonstilskudd', 100),
    getSubsidyTotals(),
  ])

  return (
    <SubsidierContent
      byKommune={byKommune}
      byScheme={byScheme}
      topRecipients={topRecipients}
      totalNok={totals.totalNok}
      totalRows={totals.totalRows}
      byType={totals.byType}
    />
  )
}
