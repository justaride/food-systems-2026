import { ZipfDistributionChart } from '@/components/charts/ZipfDistributionChart'

const CHART_COMPONENTS: Record<
  string,
  React.ComponentType<{ country?: string }>
> = {
  'zipf-distribution': ZipfDistributionChart,
}

export function EmbeddedChart({ chartId }: { chartId: string }) {
  const Chart = CHART_COMPONENTS[chartId]
  if (!Chart) return null
  return (
    <div className="my-4">
      <Chart country="no" />
    </div>
  )
}
