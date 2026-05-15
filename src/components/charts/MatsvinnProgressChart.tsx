'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from 'recharts'

type NorwayPoint = {
  year: number
  total: number
  household: number
  industry: number
  retail: number
  horeca: number
  agriculture: number
}

type SectorReduction = {
  sector: string
  y2020: number
  y2022: number
  y2024: number
  y2025_target: number | null
}

type Props = {
  norwayTotal: {
    target_2030_baseline_2015_pct: number
    data: NorwayPoint[]
  }
  reductions: {
    target_2030_pct: number
    interim_2025_pct_industry_horeca: number
    data: SectorReduction[]
  }
}

export function MatsvinnProgressChart({ norwayTotal, reductions }: Props) {
  const baseline2015 = norwayTotal.data.find(p => p.year === 2015)?.total ?? 355000
  const targetTotal2030 = baseline2015 * (1 - norwayTotal.target_2030_baseline_2015_pct / 100)

  const lineData = norwayTotal.data.map(p => ({
    year: p.year,
    Totalt: p.total,
    Husholdning: p.household,
    Matindustri: p.industry,
    Dagligvare: p.retail,
    Storhusholdning: p.horeca,
    Jordbruk: p.agriculture,
  }))

  const barData = reductions.data.map(r => ({
    sector: r.sector,
    'Reduksjon 2024 (%)': r.y2024,
    target: r.y2025_target,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div className="text-xs font-semibold text-stone-700 mb-1">
          Norsk matsvinn 2015–2024 (tonn/år)
        </div>
        <div className="text-[11px] text-stone-500 mb-2">
          Stiplet linje = mål 2030 (50% reduksjon fra 2015-baseline). Totalvolumet har økt;
          per-capita har sunket 24%.
        </div>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 260 }}>
            <LineChart data={lineData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="year" fontSize={11} tick={{ fill: '#78716c' }} />
              <YAxis
                fontSize={11}
                tick={{ fill: '#78716c' }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => `${Number(v).toLocaleString('no-NO')} t`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }}
              />
              <ReferenceLine
                y={targetTotal2030}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: 'Mål 2030', position: 'right', fontSize: 10, fill: '#059669' }}
              />
              <Line type="monotone" dataKey="Totalt" stroke="#1e293b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Husholdning" stroke="#dc2626" strokeWidth={1.2} dot={false} />
              <Line type="monotone" dataKey="Matindustri" stroke="#2563eb" strokeWidth={1.2} dot={false} />
              <Line type="monotone" dataKey="Dagligvare" stroke="#7c3aed" strokeWidth={1.2} dot={false} />
              <Line type="monotone" dataKey="Storhusholdning" stroke="#f59e0b" strokeWidth={1.2} dot={false} />
              <Line type="monotone" dataKey="Jordbruk" stroke="#65a30d" strokeWidth={1.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-stone-500 mt-1">
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#1e293b' }} />Totalt</span>
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#dc2626' }} />Husholdning</span>
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#2563eb' }} />Matindustri</span>
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#7c3aed' }} />Dagligvare</span>
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#f59e0b' }} />Storhusholdning</span>
          <span><span className="inline-block w-2 h-2 mr-1" style={{ background: '#65a30d' }} />Jordbruk</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-stone-700 mb-1">
          Reduksjon per sektor (% per capita fra 2015-baseline)
        </div>
        <div className="text-[11px] text-stone-500 mb-2">
          Stiplet linje = -50% (2030-mål). Dagligvare og industri har nådd interim-mål -30% (2025).
        </div>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 360 }}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 8, right: 56, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
              <XAxis
                type="number"
                domain={[-50, 0]}
                tickFormatter={(v: number) => `${v}%`}
                fontSize={11}
                tick={{ fill: '#78716c' }}
              />
              <YAxis
                type="category"
                dataKey="sector"
                fontSize={11}
                width={110}
                tick={{ fill: '#57534e' }}
              />
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }}
              />
              <ReferenceLine
                x={-50}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: 'Mål 2030', position: 'top', fontSize: 10, fill: '#059669' }}
              />
              <Bar dataKey="Reduksjon 2024 (%)" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry['Reduksjon 2024 (%)'] <= -30
                        ? '#10b981'
                        : entry['Reduksjon 2024 (%)'] <= -15
                          ? '#f59e0b'
                          : '#dc2626'
                    }
                  />
                ))}
                <LabelList
                  dataKey="Reduksjon 2024 (%)"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 10, fill: '#57534e' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
