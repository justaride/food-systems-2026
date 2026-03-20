'use client'

import {
  BarChart,
  Bar,
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

type EmployeeTrendChartProps = {
  data: Record<string, number | null>[]
  companies: CompanyMeta[]
}

export function EmployeeTrendChart({ data, companies }: EmployeeTrendChartProps) {
  if (data.length === 0) return null

  return (
    <Card title="Ansatte">
      <p className="text-xs text-stone-500 mb-3">Antall konsernansatte over tid</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            formatter={(value) => [Number(value).toLocaleString('nb-NO'), '']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
          />
          {companies.map(c => (
            <Bar
              key={c.name}
              dataKey={c.name}
              fill={c.color}
              opacity={0.85}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartSource source="Bronnoysundregistrene, arsrapporter" />
    </Card>
  )
}
