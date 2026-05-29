'use client'

import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'

type InsightTagBarProps = {
  insights: Array<{ tags: string[] }>
  activeTags?: Set<string>
  onToggle?: (tag: string) => void
  topN?: number
}

const NORMALIZE_MAP: Record<string, string> = {
  norge: 'Norge',
  sverige: 'Sverige',
  danmark: 'Danmark',
  finland: 'Finland',
  island: 'Island',
  sirkulaer: 'sirkulær',
  oekologisk: 'økologisk',
  sjoemat: 'sjømat',
  sjomatfor: 'sjømatfôr',
  matsvinn: 'matsvinn',
  matsikkerhet: 'matsikkerhet',
  selvforsyning: 'selvforsyning',
  dagligvare: 'dagligvare',
  nordisk: 'nordisk',
  benchmark: 'benchmark',
  maktkonsentrasjon: 'maktkonsentrasjon',
}

function normalize(tag: string) {
  const lower = tag.toLowerCase()
  return NORMALIZE_MAP[lower] ?? lower
}

export function InsightTagBar({ insights, activeTags, onToggle, topN = 15 }: InsightTagBarProps) {
  const counts = new Map<string, number>()
  for (const ins of insights) {
    for (const raw of ins.tags) {
      const tag = normalize(raw)
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN)

  if (!sorted.length) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Toppemner</h3>
        <EmptyState message="Ingen tagger registrert" />
      </Card>
    )
  }

  const max = sorted[0][1]

  return (
    <Card>
      <div className="flex items-baseline justify-between mb-0.5">
        <h3 className="text-sm font-semibold text-stone-700">Toppemner ({topN} mest brukte)</h3>
        <span className="text-xs text-stone-400">{counts.size} unike tagger</span>
      </div>
      <p className="text-xs text-stone-400 mb-3">Klikk for å filtrere innsiktslisten</p>
      <div className="space-y-1.5">
        {sorted.map(([tag, count]) => {
          const pct = (count / max) * 100
          const isActive = activeTags?.has(tag) ?? false
          return (
            <button
              key={tag}
              onClick={() => onToggle?.(tag)}
              className={`w-full text-left group ${onToggle ? 'cursor-pointer' : 'cursor-default'}`}
              disabled={!onToggle}
            >
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span
                  className={`truncate ${
                    isActive ? 'text-emerald-700 font-medium' : 'text-stone-700 group-hover:text-stone-900'
                  }`}
                >
                  {tag}
                </span>
                <span className="text-stone-400 tabular-nums shrink-0 ml-2">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isActive ? 'bg-emerald-500' : 'bg-stone-400 group-hover:bg-stone-500'
                  }`}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
      <ChartSource source="Aggregerte tagger fra alle innsiktsposter (case-normalisert)" />
    </Card>
  )
}
