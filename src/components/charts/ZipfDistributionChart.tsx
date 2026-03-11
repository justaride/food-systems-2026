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
import { ChartSource } from '@/components/ui/ChartSource'
import { useChartMetrics } from '@/lib/hooks/useChartMetrics'

export function ZipfDistributionChart() {
  const { data: metrics, isLoading } = useChartMetrics()

  if (isLoading || !metrics) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Zipf-fordeling (butikker per kommune)</h3>
        <div className="h-[220px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    )
  }

  const { data, slope, intercept, rSquared, isZipf } = metrics.zipf
  const maxLogRank = Math.max(...data.map(d => d.logRank))

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Zipf-fordeling (butikker per kommune)</h3>
      <p className="text-xs text-stone-400 mb-3">
        R&sup2; = {rSquared} &middot; Helling = {slope} &middot; {isZipf ? 'Støtter' : 'Avviker fra'} Zipfs lov
      </p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 5 }}>
            <XAxis
              dataKey="logRank"
              type="number"
              tick={{ fontSize: 10 }}
              label={{ value: 'log(rang)', position: 'bottom', fontSize: 10, offset: 0 }}
              domain={[0, Math.ceil(maxLogRank * 10) / 10 + 0.1]}
            />
            <YAxis
              dataKey="logCount"
              type="number"
              tick={{ fontSize: 10 }}
              label={{ value: 'log(antall)', angle: -90, position: 'insideLeft', fontSize: 10 }}
              domain={[-0.1, Math.ceil(Math.max(...data.map(d => d.logCount)) * 10) / 10 + 0.1]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-stone-500">Rang: {d.rank} &middot; Butikker: {d.storeCount}</p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              segment={[
                { x: 0, y: intercept },
                { x: maxLogRank, y: intercept + slope * maxLogRank },
              ]}
              stroke="#a8a29e"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Scatter data={data} fill="#10b981" r={3} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ChartSource source="Kilde: OSM butikkdata 2024, kommunevis aggregering" />
    </Card>
  )
}
