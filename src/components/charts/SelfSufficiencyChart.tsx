'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'
import { countryChartData } from '@/lib/data/country-chart-data'
import type { CountryCode } from '@/lib/config/countries'

export function SelfSufficiencyChart({ country = 'no' }: { country?: string }) {
  const { data, year, source, subtitle } = countryChartData[country as CountryCode].selfSufficiency

  if (!data.length) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Selvforsyningsgrad</h3>
        <EmptyState message="Selvforsyningsdata ikke tilgjengelig for dette landet" />
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Selvforsyningsgrad ({year})</h3>
      <p className="text-xs text-stone-400 mb-3">{subtitle}</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e7e5e4" />
            <XAxis type="number" unit="%" domain={[0, 100]} fontSize={11} tick={{ fill: '#78716c' }} />
            <YAxis dataKey="name" type="category" fontSize={11} width={72} tick={{ fill: '#57534e' }} />
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Bar dataKey="value" name="Selvforsyning" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 50 ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartSource source={`Kilde: ${source}`} />
    </Card>
  )
}
