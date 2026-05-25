'use client'

import type { CircularLeverage } from '@/lib/data/circular-leverage'
import { EffectBar } from './EffectBar'

const COUNTRY_LABEL: Record<string, string> = {
  NO: 'NO',
  SE: 'SE',
  DK: 'DK',
  FI: 'FI',
  IS: 'IS',
  nordic: 'Norden',
}

type Props = {
  leverage: CircularLeverage
  isExpanded: boolean
  onToggle: () => void
  onNavigateToTab?: (tab: string, itemId: string) => void
}

export function EffektRow({ leverage: l, isExpanded, onToggle, onNavigateToTab }: Props) {
  return (
    <div
      id={`leverage-${l.id}`}
      className="bg-white border border-stone-200 rounded-lg overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isExpanded ? 'bg-stone-50' : ''}`}
      >
        <svg
          className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>

        <div className="text-xs font-bold text-stone-400 w-6 text-right">#{l.rank}</div>

        <span className="text-xs font-semibold px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-700">
          {COUNTRY_LABEL[l.country] ?? l.country}
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-stone-900">{l.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">{l.headline}</div>
        </div>

        <div className="flex gap-3 items-center shrink-0">
          <EffectBar dim="klima" level={l.effects.klima} />
          <EffectBar dim="natur" level={l.effects.natur} />
          <EffectBar dim="forurensning" level={l.effects.forurensning} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pl-14 border-t border-stone-100 text-sm text-stone-700">
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Begrunnelse</p>
            <p className="leading-relaxed">{l.justification}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Barrierer</p>
              <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                {l.barriers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Policy-løftestenger</p>
              <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                {l.policyLevers.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-3 mt-3 border-t border-dashed border-stone-200">
            {(l.relatedActorCases?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Suksesshistorier å lære fra</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedActorCases!.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onNavigateToTab?.('actors', name)}
                      className="text-[11px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      {name} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {l.sourceRefs.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Kilder</p>
                <div className="flex flex-wrap gap-2">
                  {l.sourceRefs.map((s) => (
                    s.href ? (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-700 hover:underline"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span
                        key={s.label}
                        className="text-xs text-stone-600 font-mono"
                        title={s.path}
                      >
                        {s.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {(l.relatedGapIds?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Relaterte gap</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedGapIds!.map((gapId) => (
                    <button
                      key={gapId}
                      type="button"
                      onClick={() => onNavigateToTab?.('gaps', gapId)}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      → {gapId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(l.relatedLoopIds?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Relaterte looper</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedLoopIds!.map((loopId) => (
                    <button
                      key={loopId}
                      type="button"
                      onClick={() => onNavigateToTab?.('loops', loopId)}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      → {loopId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
