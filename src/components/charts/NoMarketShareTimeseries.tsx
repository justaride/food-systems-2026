'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NoMarketShareRow } from '@/lib/queries/market-share'

type Props = {
  rows: NoMarketShareRow[]
}

const SERIES = [
  { key: 'norgesgruppen', label: 'NorgesGruppen', color: '#16a34a' },
  { key: 'coop', label: 'Coop', color: '#2563eb' },
  { key: 'rema', label: 'Rema 1000', color: '#dc2626' },
  { key: 'bunnpris', label: 'Bunnpris', color: '#ca8a04' },
] as const

export function NoMarketShareTimeseries({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Ingen markedsandeldata tilgjengelig.
      </p>
    )
  }

  const latest = rows[rows.length - 1]
  const cr3Latest = latest?.cr3
  const hhiLatest = latest?.hhi

  const methodSwitchYear = rows.find(r => r.sourceMethod.toLowerCase().includes('konkurransetilsynet calculated'))?.year

  return (
    <div>
      <ResponsiveContainer width="100%" height={260} initialDimension={{ width: 720, height: 260 }}>
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#78716c' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#78716c' }}
            domain={[0, 50]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === 'number' ? `${value.toFixed(1)}%` : String(value),
              name,
            ]}
            labelFormatter={(label) => `År: ${label}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
          {methodSwitchYear && (
            <ReferenceLine
              x={methodSwitchYear}
              stroke="#a8a29e"
              strokeDasharray="4 4"
              label={{ value: 'Metodeskifte', fontSize: 10, fill: '#78716c', position: 'top' }}
            />
          )}
          {SERIES.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {(cr3Latest != null || hhiLatest != null) && (
        <div className="mt-3 flex flex-wrap gap-4 border-t border-stone-100 pt-3 text-xs text-stone-600">
          {cr3Latest != null && (
            <span>
              <strong>CR3 {latest.year}:</strong> {cr3Latest.toFixed(1)}%
            </span>
          )}
          {hhiLatest != null && (
            <span>
              <strong>HHI {latest.year}:</strong> {hhiLatest}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
