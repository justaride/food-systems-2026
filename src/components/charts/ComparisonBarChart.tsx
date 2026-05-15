'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Card } from '@/components/ui/Card'

type ComparisonBarChartProps = {
  title: string
  data: Array<{ country: string; flag: string; value: number; label?: string }>
  unit?: string
  description?: string
  bare?: boolean
}

export function ComparisonBarChart({ title, data, unit, description, bare }: ComparisonBarChartProps) {
  const chartData = data.map(d => ({
    ...d,
    name: `${d.flag} ${d.country}`,
    displayValue: d.label ?? `${d.value}${unit ? ` ${unit}` : ''}`,
  }))

  const inner = (
    <>
      {title && <h3 className="text-sm font-semibold text-stone-700 mb-0.5">{title}</h3>}
      {description && <p className="text-xs text-stone-400 mb-3">{description}</p>}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 360, height: 200 }}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 80, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#57534e' }}
              width={75}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, _name, props) => {
                const lbl = (props as { payload?: { label?: string } } | undefined)?.payload?.label
                if (lbl === '—' || lbl === '-') return ['Ingen data', title || '']
                return [`${value}${unit ? ` ${unit}` : ''}`, title || '']
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="#10b981" />
              ))}
              <LabelList
                dataKey="displayValue"
                position="right"
                style={{ fontSize: 11, fill: '#57534e' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )

  return bare ? <>{inner}</> : <Card>{inner}</Card>
}
