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
import { orgNrForSlug, KONSERN_REGISTRY } from '@/lib/queries/ownership'
import { SubsidierContent } from './SubsidierContent'

export const metadata: Metadata = {
  title: 'Subsidier — Food Systems 2026',
  description:
    'Produksjonstilskudd og øvrige jordbrukssubsidier per kommune, ordning og mottaker',
}

export default async function SubsidierPage({
  searchParams,
}: {
  searchParams: Promise<{ konsern?: string }>
}) {
  const params = await searchParams
  const konsernSlug = params.konsern ?? null

  const [byKommune, byScheme, schemeStageHeatmap, stageCoverage, topRecipients, totals, distribution] = await Promise.all([
    getSubsidiesByKommune('produksjonstilskudd'),
    getSubsidiesByScheme('produksjonstilskudd'),
    getSubsidiesBySchemeAndStage('produksjonstilskudd'),
    getSubsidyStageCoverage('produksjonstilskudd'),
    getTopSubsidyRecipients('produksjonstilskudd', 100),
    getSubsidyTotals(),
    getSubsidyDistribution('produksjonstilskudd'),
  ])

  // Resolve konsern filter — subsidies are producer-based so we show a note
  let konsernFilter: { slug: string; name: string } | null = null
  let konsernNotFound = false
  if (konsernSlug) {
    const orgNr = orgNrForSlug(konsernSlug)
    if (!orgNr) {
      konsernNotFound = true
    } else {
      const displayName = konsernSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      konsernFilter = { slug: konsernSlug, name: displayName }
    }
  }

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
      konsernFilter={konsernFilter}
      konsernNotFound={konsernNotFound}
    />
  )
}
