'use client'

import { ResponsivePie } from '@nivo/pie'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { useChartMetrics } from '@/lib/hooks/useChartMetrics'

export function ParentCompanyChart({ country = 'no' }: { country?: string }) {
  const { data, isLoading } = useChartMetrics(country as 'no')

  if (isLoading || !data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Eierkonsentrasjon (2024)</h3>
        <div className="h-[220px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    )
  }

  const { data: chartData, parentHHI } = data.parentCompany

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Eierkonsentrasjon (2024)</h3>
      <p className="text-xs text-stone-400 mb-1">Butikkandel etter morselskap &middot; HHI &asymp; {parentHHI.toLocaleString()}</p>
      <p className="text-[10px] text-stone-400 mb-3">Omsetningsandel: NG ~44%, Coop ~29%, Reitan ~23%, Bunnpris ~4% (Dagligvarerapporten 2024)</p>
      <div className="h-[220px]">
        <ResponsivePie
          data={chartData}
          colors={chartData.map(d => d.color)}
          margin={{ top: 10, right: 80, bottom: 10, left: 10 }}
          innerRadius={0.55}
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
          valueFormat={v => `${v}%`}
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
              data: chartData.map(d => ({
                id: d.id,
                label: d.id,
                color: d.color,
              })),
            },
          ]}
          theme={{
            text: { fontSize: 11 },
            legends: { text: { fontSize: 10 } },
          }}
        />
      </div>
      <ChartSource source="Kilde: OSM/Overpass butikkdata 2024 (n=3 849)" />
    </Card>
  )
}
