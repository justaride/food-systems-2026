'use client'

import { ResponsivePie } from '@nivo/pie'
import { Card } from '@/components/ui/Card'

const DATA = [
  { id: 'NorgesGruppen', label: 'NorgesGruppen', value: 43.5, color: '#1565C0' },
  { id: 'Coop Norge', label: 'Coop Norge', value: 29.3, color: '#E30613' },
  { id: 'Reitangruppen', label: 'Reitangruppen', value: 23.4, color: '#4CAF50' },
  { id: 'Bunnpris AS', label: 'Bunnpris AS', value: 3.8, color: '#E91E63' },
]

export function ParentCompanyChart() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Eierkonsentrasjon (2024)</h3>
      <p className="text-xs text-stone-400 mb-3">Markedsandel etter morselskap &middot; HHI &asymp; 3 200</p>
      <div className="h-[220px]">
        <ResponsivePie
          data={DATA}
          colors={DATA.map(d => d.color)}
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
              data: DATA.map(d => ({
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
    </Card>
  )
}
