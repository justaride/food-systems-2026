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

const DATA = [
  { name: 'Melk', value: 98 },
  { name: 'Kjøtt', value: 96 },
  { name: 'Poteter', value: 77 },
  { name: 'Grønnsaker', value: 49 },
  { name: 'Kalorier', value: 44 },
  { name: 'Frukt', value: 4 },
]

export function SelfSufficiencyChart() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Selvforsyningsgrad (2023)</h3>
      <p className="text-xs text-stone-400 mb-3">Andel av forbruk dekket av norsk produksjon</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DATA}
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
              {DATA.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 50 ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
