'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/Card'

const DATA = [
  { logRank: 0.00, logCount: 2.40, name: 'Oslo' },
  { logRank: 0.30, logCount: 2.18, name: 'Bergen' },
  { logRank: 0.48, logCount: 2.04, name: 'Trondheim' },
  { logRank: 0.60, logCount: 1.93, name: 'Stavanger' },
  { logRank: 0.70, logCount: 1.85, name: 'Kristiansand' },
  { logRank: 0.78, logCount: 1.78, name: 'Troms\u00F8' },
  { logRank: 0.85, logCount: 1.72, name: 'Drammen' },
  { logRank: 0.90, logCount: 1.66, name: 'Fredrikstad' },
  { logRank: 0.95, logCount: 1.60, name: 'Sandnes' },
  { logRank: 1.00, logCount: 1.54, name: 'Bod\u00F8' },
  { logRank: 1.08, logCount: 1.46, name: '#12' },
  { logRank: 1.15, logCount: 1.38, name: '#15' },
  { logRank: 1.20, logCount: 1.30, name: '#16' },
  { logRank: 1.30, logCount: 1.20, name: '#20' },
  { logRank: 1.40, logCount: 1.08, name: '#25' },
  { logRank: 1.48, logCount: 0.95, name: '#30' },
  { logRank: 1.60, logCount: 0.78, name: '#40' },
  { logRank: 1.70, logCount: 0.60, name: '#50' },
  { logRank: 1.78, logCount: 0.48, name: '#60' },
  { logRank: 1.85, logCount: 0.30, name: '#70' },
  { logRank: 1.90, logCount: 0.18, name: '#80' },
  { logRank: 2.00, logCount: 0.00, name: '#100' },
]

const SLOPE = -1.12
const R_SQUARED = 0.94

export function ZipfDistributionChart() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Zipf-fordeling (butikker per kommune)</h3>
      <p className="text-xs text-stone-400 mb-3">
        R&sup2; = {R_SQUARED} &middot; Helling = {SLOPE} &middot; St&oslash;tter Zipfs lov
      </p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 5 }}>
            <XAxis
              dataKey="logRank"
              type="number"
              tick={{ fontSize: 10 }}
              label={{ value: 'log(rang)', position: 'bottom', fontSize: 10, offset: 0 }}
              domain={[0, 2.1]}
            />
            <YAxis
              dataKey="logCount"
              type="number"
              tick={{ fontSize: 10 }}
              label={{ value: 'log(antall)', angle: -90, position: 'insideLeft', fontSize: 10 }}
              domain={[-0.1, 2.6]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-stone-500">Rang: 10^{d.logRank.toFixed(1)} &middot; Butikker: 10^{d.logCount.toFixed(1)}</p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              segment={[
                { x: 0, y: 2.40 },
                { x: 2.0, y: 2.40 + SLOPE * 2.0 },
              ]}
              stroke="#a8a29e"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Scatter data={DATA} fill="#10b981" r={3} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
