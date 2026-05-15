'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'

type CompanyMeta = {
  name: string
  color: string
}

type EquityRatioTrendChartProps = {
  data: Record<string, number | null>[]
  companies: CompanyMeta[]
}

export function EquityRatioTrendChart({ data, companies }: EquityRatioTrendChartProps) {
  if (data.length === 0) return null

  return (
    <Card title="Egenkapitalandel">
      <p className="text-xs text-stone-500 mb-3">Egenkapitalandel i prosent over tid</p>
      <ResponsiveContainer width="100%" height={280} initialDimension={{ width: 640, height: 280 }}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#78716c' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#78716c' }}
            tickLine={false}
            axisLine={false}
            unit="%"
            label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#a8a29e' } }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, '']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
          />
          {companies.map(c => (
            <Line
              key={c.name}
              type="monotone"
              dataKey={c.name}
              stroke={c.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartSource source="Bronnoysundregistrene, arsrapporter" />
    </Card>
  )
}
