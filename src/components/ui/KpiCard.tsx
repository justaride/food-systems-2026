import Link from 'next/link'
import type { KPI } from '@/lib/types'

type KpiCardProps = {
  kpi: KPI
}

function SourceLink({ source }: { source: NonNullable<KPI['source']> }) {
  const label = source.label
  const isExternal = /^https?:\/\//.test(source.href)

  if (isExternal) {
    return (
      <a
        href={source.href}
        target="_blank"
        rel="noreferrer"
        className="text-emerald-700 underline-offset-2 hover:underline"
      >
        {label}
      </a>
    )
  }

  return (
    <Link href={source.href} className="text-emerald-700 underline-offset-2 hover:underline">
      {label}
    </Link>
  )
}

export function KpiCard({ kpi }: KpiCardProps) {
  return (
    <div className="card flex h-full flex-col">
      <div>
        <h4 className="text-sm font-semibold text-stone-800">{kpi.name}</h4>
        <p className="text-xs text-stone-500 mt-1">{kpi.description}</p>
      </div>
      {(kpi.current || kpi.target) && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {kpi.current && (
            <div>
              <span className="text-stone-400">Nå: </span>
              <span className="text-stone-700 font-medium">{kpi.current}</span>
            </div>
          )}
          {kpi.target && (
            <div>
              <span className="text-stone-400">Mål: </span>
              <span className="text-stone-700 font-medium">{kpi.target}</span>
            </div>
          )}
        </div>
      )}
      {kpi.secondary && (
        <p className="mt-1 text-xs font-medium text-stone-600">{kpi.secondary}</p>
      )}
      {(kpi.source || kpi.definition || kpi.caveat) && (
        <div className="mt-auto space-y-1.5 border-t border-stone-100 pt-3 text-[10px] leading-relaxed text-stone-500">
          {kpi.source && (
            <div>
              <p className="font-semibold uppercase tracking-wider text-stone-400">Kildekort</p>
              <p>
                Kilde: <SourceLink source={kpi.source} />
              </p>
              <p>Kildeår: {kpi.source.year} · Sist verifisert: {kpi.source.lastVerified}</p>
              {kpi.systemBoundary && <p>Systemgrense: {kpi.systemBoundary}</p>}
            </div>
          )}
          {kpi.definition && <p className="text-stone-400">{kpi.definition}</p>}
          {kpi.caveat && <p className="text-stone-400">{kpi.caveat}</p>}
        </div>
      )}
    </div>
  )
}
