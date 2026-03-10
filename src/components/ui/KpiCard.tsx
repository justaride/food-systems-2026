import type { KPI } from '@/lib/types'

type KpiCardProps = {
  kpi: KPI
}

export function KpiCard({ kpi }: KpiCardProps) {
  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-stone-800">{kpi.name}</h4>
      <p className="text-xs text-stone-500 mt-1">{kpi.description}</p>
      {(kpi.current || kpi.target) && (
        <div className="mt-3 flex gap-3 text-xs">
          {kpi.current && (
            <div>
              <span className="text-stone-400">Na: </span>
              <span className="text-stone-700 font-medium">{kpi.current}</span>
            </div>
          )}
          {kpi.target && (
            <div>
              <span className="text-stone-400">Mal: </span>
              <span className="text-stone-700 font-medium">{kpi.target}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
