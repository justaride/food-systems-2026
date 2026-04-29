'use client'

import { ResponsivePie } from '@nivo/pie'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'

const TYPE_COLORS: Record<string, string> = {
  funn: '#10b981',
  analyse: '#3b82f6',
  kartlegging: '#a855f7',
  notat: '#f59e0b',
  lenke: '#64748b',
}

const TYPE_LABELS: Record<string, string> = {
  funn: 'Funn',
  analyse: 'Analyse',
  kartlegging: 'Kartlegging',
  notat: 'Notat',
  lenke: 'Lenke',
}

type InsightTypeDonutProps = {
  insights: Array<{ insightType: string }>
  onSelect?: (type: string) => void
  activeType?: string
}

export function InsightTypeDonut({ insights, onSelect, activeType }: InsightTypeDonutProps) {
  const counts = insights.reduce<Record<string, number>>((acc, ins) => {
    acc[ins.insightType] = (acc[ins.insightType] ?? 0) + 1
    return acc
  }, {})

  const data = Object.entries(counts)
    .map(([type, count]) => ({
      id: TYPE_LABELS[type] ?? type,
      label: TYPE_LABELS[type] ?? type,
      value: count,
      color: TYPE_COLORS[type] ?? '#a8a29e',
      type,
    }))
    .sort((a, b) => b.value - a.value)

  const total = insights.length

  if (!data.length) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Innsikt etter type</h3>
        <EmptyState message="Ingen innsikt registrert" />
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between mb-0.5">
        <h3 className="text-sm font-semibold text-stone-700">Innsikt etter type</h3>
        <span className="text-xs text-stone-400">{total} totalt</span>
      </div>
      <p className="text-xs text-stone-400 mb-3">Klikk en sektor for å filtrere listen</p>
      <div className="h-[220px]">
        <ResponsivePie
          data={data}
          colors={data.map((d) => d.color)}
          margin={{ top: 10, right: 80, bottom: 10, left: 10 }}
          innerRadius={0.6}
          padAngle={2}
          cornerRadius={3}
          activeOuterRadiusOffset={4}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#57534e"
          arcLinkLabelsThickness={1}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLinkLabelsDiagonalLength={10}
          arcLinkLabelsStraightLength={8}
          arcLabelsSkipAngle={15}
          arcLabelsTextColor="#fff"
          valueFormat={(v) => `${v}`}
          onClick={(d) => onSelect?.((d.data as { type: string }).type)}
          legends={[
            {
              anchor: 'right',
              direction: 'column',
              translateX: 70,
              itemWidth: 60,
              itemHeight: 18,
              symbolSize: 10,
              symbolShape: 'circle',
              itemTextColor: '#57534e',
              data: data.map((d) => ({
                id: d.id,
                label: d.label,
                color: activeType && activeType !== d.type && activeType !== 'alle' ? '#d6d3d1' : d.color,
              })),
            },
          ]}
          theme={{
            text: { fontSize: 11 },
            legends: { text: { fontSize: 10 } },
          }}
        />
      </div>
      <ChartSource source="Aggregert fra Insight-tabell + dokumentbasert fallback" />
    </Card>
  )
}
