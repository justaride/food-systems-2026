'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/Card'

const DATA = [
  { popShare: 0, storeShare: 0 },
  { popShare: 10, storeShare: 2 },
  { popShare: 20, storeShare: 6 },
  { popShare: 30, storeShare: 12 },
  { popShare: 40, storeShare: 20 },
  { popShare: 50, storeShare: 30 },
  { popShare: 60, storeShare: 42 },
  { popShare: 70, storeShare: 56 },
  { popShare: 80, storeShare: 72 },
  { popShare: 90, storeShare: 86 },
  { popShare: 100, storeShare: 100 },
]

const EQUALITY = [
  { popShare: 0, equal: 0 },
  { popShare: 100, equal: 100 },
]

const GINI = 0.38

export function LorenzCurveChart() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Lorenz-kurve (butikktilgang)</h3>
      <p className="text-xs text-stone-400 mb-3">Gini = {GINI} &middot; Moderat ulikhet i butikktetthet</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="popShare"
              tick={{ fontSize: 10 }}
              tickFormatter={v => `${v}%`}
              label={{ value: 'Befolkning (kum.)', position: 'bottom', fontSize: 10, offset: -2 }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${Number(value)}%`, 'Butikkandel']}
              labelFormatter={l => `${l}% av befolkningen`}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <ReferenceLine
              segment={EQUALITY.map(p => ({ x: p.popShare, y: p.equal })) as [{ x: number; y: number }, { x: number; y: number }]}
              stroke="#a8a29e"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="storeShare"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
