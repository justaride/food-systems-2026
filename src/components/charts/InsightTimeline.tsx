'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'

type InsightRow = {
  date: string
  phaseId: string | null
}

const PHASE_COLORS: Record<string, string> = {
  'fase-1': '#10b981',
  'fase-2': '#3b82f6',
  'fase-3': '#a855f7',
  'fase-4': '#f59e0b',
  ukjent: '#a8a29e',
}

function buildMonthBuckets(insights: InsightRow[]) {
  if (!insights.length) return []
  const dates = insights
    .map((i) => i.date)
    .filter((d): d is string => Boolean(d))
    .sort()

  if (!dates.length) return []
  const first = dates[0]!.slice(0, 7)
  const last = dates[dates.length - 1]!.slice(0, 7)

  const months: string[] = []
  let [y, m] = first.split('-').map(Number)
  const [endY, endM] = last.split('-').map(Number)
  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  const phaseSet = new Set<string>()
  for (const ins of insights) phaseSet.add(ins.phaseId ?? 'ukjent')
  const phases = [...phaseSet].sort()

  return months.map((month) => {
    const row: Record<string, number | string> = { month }
    for (const phase of phases) row[phase] = 0
    for (const ins of insights) {
      if (ins.date.slice(0, 7) === month) {
        const key = ins.phaseId ?? 'ukjent'
        row[key] = ((row[key] as number) ?? 0) + 1
      }
    }
    return row
  })
}

function formatMonthLabel(month: string) {
  const [y, m] = month.split('-')
  const labels = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']
  return `${labels[Number(m) - 1]} ${y!.slice(2)}`
}

function phaseLabel(key: string) {
  if (key === 'ukjent') return 'Ukjent fase'
  return `Fase ${key.replace('fase-', '')}`
}

export function InsightTimeline({ insights }: { insights: InsightRow[] }) {
  const data = buildMonthBuckets(insights)

  if (!data.length) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Innsikt over tid</h3>
        <EmptyState message="Ingen datert innsikt" />
      </Card>
    )
  }

  const phaseKeys = Object.keys(data[0]).filter((k) => k !== 'month')

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Innsikt over tid</h3>
      <p className="text-xs text-stone-400 mb-3">Antall registrerte innsikter per måned, fordelt på fase</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 640, height: 220 }}>
          <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthLabel}
              fontSize={10}
              tick={{ fill: '#78716c' }}
            />
            <YAxis fontSize={10} tick={{ fill: '#78716c' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }}
              labelFormatter={(label) => formatMonthLabel(String(label))}
              formatter={(value, name) => [value, phaseLabel(String(name))]}
            />
            <Legend
              verticalAlign="bottom"
              height={20}
              iconSize={8}
              wrapperStyle={{ fontSize: 10, color: '#57534e' }}
              formatter={(name) => phaseLabel(String(name))}
            />
            {phaseKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="phase"
                fill={PHASE_COLORS[key] ?? '#a8a29e'}
                radius={idx === phaseKeys.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartSource source="Aggregert per måned fra registreringsdato · dokumenter uten eksakt dato plasseres i desember" />
    </Card>
  )
}
