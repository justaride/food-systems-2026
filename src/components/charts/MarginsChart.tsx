'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/Card'

const DATA = [
  { name: 'NorgesGruppen', margin: 3.3 },
  { name: 'Reitan (Rema)', margin: 3.85 },
  { name: 'Coop Norge', margin: 1.0 },
  { name: 'Leverandører', margin: 6.0 },
]

const INDUSTRY_AVG = 1.9

export function MarginsChart() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Fortjenestemarginer (2024)</h3>
      <p className="text-xs text-stone-400 mb-3">Drifts-/resultatmargin, dagligvare vs. leverandører</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DATA}
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis dataKey="name" fontSize={10} interval={0} tick={{ fill: '#57534e' }} />
            <YAxis unit="%" fontSize={11} tick={{ fill: '#78716c' }} />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <ReferenceLine
              y={INDUSTRY_AVG}
              label={{ value: 'Bransjesn.', fontSize: 10, fill: '#78716c' }}
              stroke="#f43f5e"
              strokeDasharray="3 3"
            />
            <Bar dataKey="margin" name="Margin %" radius={[4, 4, 0, 0]}>
              {DATA.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.margin >= INDUSTRY_AVG ? '#10b981' : '#78716c'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
