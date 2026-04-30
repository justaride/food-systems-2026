import type { Metadata } from 'next'
import {
  getSubsidiesByKommune,
  getSubsidiesByScheme,
  getSubsidiesBySchemeAndStage,
  getSubsidyDistribution,
  getSubsidyStageCoverage,
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
  const [byKommune, byScheme, schemeStageHeatmap, stageCoverage, topRecipients, totals, distribution] = await Promise.all([
    getSubsidiesByKommune('produksjonstilskudd'),
    getSubsidiesByScheme('produksjonstilskudd'),
    getSubsidiesBySchemeAndStage('produksjonstilskudd'),
    getSubsidyStageCoverage('produksjonstilskudd'),
    getTopSubsidyRecipients('produksjonstilskudd', 100),
    getSubsidyTotals(),
    getSubsidyDistribution('produksjonstilskudd'),
  ])

  return (
    <SubsidierContent
      byKommune={byKommune}
      byScheme={byScheme}
      schemeStageHeatmap={schemeStageHeatmap}
      stageCoverage={stageCoverage}
      topRecipients={topRecipients}
      totalNok={totals.totalNok}
      totalRows={totals.totalRows}
      byType={totals.byType}
      distribution={distribution}
    />
  )
}
