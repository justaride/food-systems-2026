'use client'

import { useState, useMemo } from 'react'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'
import {
  circularLeverages,
  lastUpdated,
  objectiveCoverage,
  type EffectLevel,
  type ObjectiveDimension,
} from '@/lib/data/circular-leverage'
import type { EvidenceStatus } from '@/lib/visualization/types'
import { EffektRow } from './EffektRow'
import { EffektMethodologyCard } from './EffektMethodologyCard'

type SortDim = 'aggregate' | ObjectiveDimension

const LEVEL_RANK: Record<EffectLevel, number> = { high: 3, medium: 2, low: 1 }
const levelRank = (lvl?: EffectLevel): number => (lvl ? LEVEL_RANK[lvl] : 0)

const SORT_LABEL: Record<SortDim, string> = {
  aggregate: 'Aggregat',
  klima: 'Klima',
  natur: 'Natur',
  forurensning: 'Forurensning',
  resiliens: 'Resiliens',
  distrikt: 'Distrikt/bonde',
  helse: 'Helse (fase 2)',
}

type Props = {
  expandedIds: Set<string>
  onToggleRow: (id: string) => void
  onNavigateToTab?: (tab: string, itemId: string) => void
}

export function EffektTab({ expandedIds, onToggleRow, onNavigateToTab }: Props) {
  const [sortDim, setSortDim] = useState<SortDim>('aggregate')

  const sorted = useMemo(() => {
    const list = [...circularLeverages]
    if (sortDim === 'aggregate') {
      return list.sort((a, b) => a.rank - b.rank)
    }
    return list.sort((a, b) => {
      const diff = levelRank(b.effects[sortDim]) - levelRank(a.effects[sortDim])
      return diff !== 0 ? diff : a.rank - b.rank
    })
  }, [sortDim])

  // Dekningsgrad for valgt linse — synliggjør blindsonen ærlig i stedet for å skjule den.
  const coverage = sortDim === 'aggregate' ? null : objectiveCoverage(sortDim)

  // Honest tab-level badge: the dominant evidence grade across rows (each row
  // also shows its own status in EffektRow), instead of a hard-coded weakest tier.
  const dominantEvidence = useMemo<EvidenceStatus>(() => {
    const counts = {} as Record<EvidenceStatus, number>
    for (const l of circularLeverages) counts[l.evidenceStatus] = (counts[l.evidenceStatus] ?? 0) + 1
    return ((Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as EvidenceStatus) ?? 'illustrative')
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Hvor har sirkulære tiltak størst effekt?</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Topp 10 prioriteringer for nordisk matsystem · Kuratert basert på prosjektets research
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EvidenceStatusBadge status={dominantEvidence} detail="Dominerende evidensgrad — varierer per tiltak (se hver rad)" />
            <span className="text-[11px] text-stone-400">Oppdatert {lastUpdated}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2 flex-wrap">
          {(Object.keys(SORT_LABEL) as SortDim[]).map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => setSortDim(dim)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                sortDim === dim
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {SORT_LABEL[dim]}
            </button>
          ))}
        </div>

        {coverage && coverage.scored < coverage.total && (
          <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            {coverage.scored} av {coverage.total} tiltak er scoret på «{SORT_LABEL[sortDim]}». Resten er en bevisst
            dokumentert dekningsblindsone (objektivfunksjon Sett II)
            {sortDim === 'helse' ? ' — helse er fase 2 og åpnes senere' : ''}.
          </p>
        )}
      </div>

      <div className="space-y-1">
        {sorted.map((l) => (
          <EffektRow
            key={l.id}
            leverage={l}
            isExpanded={expandedIds.has(`leverage-${l.id}`)}
            onToggle={() => onToggleRow(`leverage-${l.id}`)}
            onNavigateToTab={onNavigateToTab}
          />
        ))}
      </div>

      <EffektMethodologyCard />
    </div>
  )
}
