import { prisma } from '@/lib/db'

type SelfSufficiencyEntry = { name: string; value: number }
type MarginEntry = { name: string; margin: number }
type MarketShareEntry = { name: string; value: number }

export type CountryChartDataSet = {
  selfSufficiency: {
    data: SelfSufficiencyEntry[]
    year: string
    source: string
    subtitle: string
  }
  margins: {
    data: MarginEntry[]
    industryAvg: number
    year: string
    source: string
  } | null
  marketShare: {
    data: MarketShareEntry[]
    year: string
    source: string
  } | null
}

export async function getCountryChartData(country: string): Promise<CountryChartDataSet> {
  const metrics = await prisma.countryMetric.findMany({
    where: { country },
    orderBy: { category: 'asc' },
  })

  const selfSuffMetrics = metrics.filter(m => m.metricType === 'selfSufficiency')
  const marginMetrics = metrics.filter(m => m.metricType === 'margin')
  const shareMetrics = metrics.filter(m => m.metricType === 'marketShare')

  const selfSufficiency = {
    data: selfSuffMetrics.map(m => ({ name: m.category, value: Number(m.value) })),
    year: selfSuffMetrics[0]?.year ?? '',
    source: selfSuffMetrics[0]?.source ?? '',
    subtitle: selfSuffMetrics[0]?.subtitle ?? '',
  }

  const margins = marginMetrics.length > 0 ? {
    data: marginMetrics.filter(m => m.category !== '_avg').map(m => ({ name: m.category, margin: Number(m.value) })),
    industryAvg: Number(marginMetrics.find(m => m.category === '_avg')?.value ?? 0),
    year: marginMetrics[0]?.year ?? '',
    source: marginMetrics[0]?.source ?? '',
  } : null

  const marketShare = shareMetrics.length > 0 ? {
    data: shareMetrics.map(m => ({ name: m.category, value: Number(m.value) })),
    year: shareMetrics[0]?.year ?? '',
    source: shareMetrics[0]?.source ?? '',
  } : null

  return { selfSufficiency, margins, marketShare }
}
