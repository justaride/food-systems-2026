'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'
import { countryChartData } from '@/lib/data/country-chart-data'
import type { CountryCode } from '@/lib/config/countries'

const COLORS = ['#10b981', '#57534e', '#a8a29e', '#d6d3d1']

export function MarketShareChart({ country = 'no' }: { country?: string }) {
  const marketShare = countryChartData[country as CountryCode].marketShare

  if (!marketShare) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Markedsandel</h3>
        <EmptyState message="Markedsandelsdata ikke tilgjengelig for dette landet" />
      </Card>
    )
  }

  const { data, year, source } = marketShare

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Markedsandel ({year})</h3>
      <p className="text-xs text-stone-400 mb-3">Omsetning etter konsepttype</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
              fontSize={11}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconSize={10}
              wrapperStyle={{ fontSize: 11, color: '#57534e' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartSource source={`Kilde: ${source}`} />
    </Card>
  )
}
