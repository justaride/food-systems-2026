import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'

type PolicyEntry = {
  country: CountryCode
  name: string
  year: number
  type: string
  target?: string | null
}

const TYPE_COLORS: Record<string, string> = {
  law: 'bg-rose-500',
  forskrift: 'bg-rose-400',
  voluntary: 'bg-amber-500',
  avtale: 'bg-amber-500',
  target: 'bg-sky-500',
  mål: 'bg-sky-500',
}

const YEAR_FROM = 2015
const YEAR_TO = 2030

export function PolicyTimeline({ policies }: { policies: PolicyEntry[] }) {
  const span = YEAR_TO - YEAR_FROM
  const ticks = Array.from({ length: span / 5 + 1 }, (_, i) => YEAR_FROM + i * 5)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px] text-stone-500">
        {Object.entries(TYPE_COLORS).slice(0, 3).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${c}`} />{k}
          </span>
        ))}
      </div>

      {COUNTRY_LIST.map(c => {
        const rows = policies.filter(p => p.country === c.code).sort((a, b) => a.year - b.year)
        return (
          <div key={c.code} className="flex items-center gap-3">
            <div className="w-24 text-xs text-stone-700 shrink-0">
              <span className="mr-1">{c.flag}</span>{c.name}
            </div>
            <div className="relative flex-1 h-8 bg-stone-50 rounded">
              {ticks.map(t => (
                <span
                  key={t}
                  className="absolute top-0 bottom-0 border-l border-stone-200 text-[9px] text-stone-400 pl-0.5"
                  style={{ left: `${((t - YEAR_FROM) / span) * 100}%` }}
                >{t}</span>
              ))}
              {rows.map((p, i) => {
                const left = Math.min(99, Math.max(0, ((p.year - YEAR_FROM) / span) * 100))
                const color = TYPE_COLORS[p.type] ?? 'bg-stone-400'
                return (
                  <span
                    key={i}
                    title={`${p.name} (${p.year})${p.target ? ` — ${p.target}` : ''}`}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${color}`}
                    style={{ left: `${left}%` }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
