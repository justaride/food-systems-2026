'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'

type KonsernIndexRow = {
  slug: string
  rootCompanyId: string
  rootName: string
  qualityScore: number
  treeSize: number
  totalRevenue: number | null
  maEventsCount: number
  daysSinceBrregRefresh: number | null
  controllingOwner: { name: string; pct: number | null } | null
  ownershipType: string | null
  gaps: string[]
}

const SCORE_COLOR = (score: number): string => {
  if (score <= 4) return 'bg-rose-100 text-rose-800 border-rose-200'
  if (score <= 7) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

function fmtRevenue(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mrd`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} mill`
  return n.toString()
}

function fmtDays(n: number | null): string {
  if (n === null) return 'Aldri'
  if (n < 30) return `${n} dager siden`
  if (n < 365) return `${Math.floor(n / 30)} mnd siden`
  return `${Math.floor(n / 365)} år siden`
}

export function EierskapContent({ konserner }: { konserner: KonsernIndexRow[] }) {
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(0)

  const filtered = useMemo(() => {
    return konserner.filter(k => {
      if (k.qualityScore < minScore) return false
      if (search) {
        const s = search.toLowerCase()
        if (!k.rootName.toLowerCase().includes(s) && !(k.controllingOwner?.name.toLowerCase().includes(s) ?? false)) return false
      }
      return true
    })
  }, [konserner, search, minScore])

  const totals = useMemo(() => ({
    konserner: konserner.length,
    selskap: konserner.reduce((sum, k) => sum + k.treeSize, 0),
    gaps: konserner.reduce((sum, k) => sum + k.gaps.length, 0),
  }), [konserner])

  return (
    <div className="space-y-6">
      <InternalBanner note="Eierskap-kartlegging med datakvalitet-score og Brønnøysund-ferskhet — internt arbeidsgrunnlag, ikke en vurdering av selskapene." />
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Eierskap &amp; konsernstrukturer</h1>
        <p className="text-sm text-stone-400 mt-1">
          {totals.konserner} sporede konserner · {totals.selskap} datterselskap kartlagt · {totals.gaps} åpne datakvalitet-gap
        </p>
      </div>

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Siden viser eierstruktur, konsern og maktkonsentrasjon i matsektoren — hvem som eier hva og hvor styreroller krysser.',
          'Den brukes til å forstå strukturell makt og konsentrasjon, ikke som påstand om ulovlig adferd.',
        ]}
        takeaways={[
          'Konserntre og eierandeler kobler selskaper til reelle eiere.',
          'Styrekryss/interlock viser konsentrasjon av innflytelse.',
          'Tallene bygger på offentlige registre med ulik oppdateringsferskhet.',
        ]}
        caveat="Internt kildegrunnlag med forbehold: bygger på register-/Brønnøysund-data med varierende ferskhet, og er ikke ekstern validering."
      />

      <Card>
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk konsern eller eier..."
            className="px-3 py-1.5 border border-stone-200 rounded text-sm flex-1 min-w-[200px]"
          />
          <label className="text-xs text-stone-600 flex items-center gap-2">
            Min. datakvalitet:
            <input type="range" min="0" max="10" value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
            <span className="font-semibold text-stone-800 w-6">{minScore}</span>
          </label>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen konserner matcher filteret" />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
              <tr>
                <th className="text-left px-3 py-2">Konsern</th>
                <th className="text-left px-3 py-2">Kontr. eier</th>
                <th className="text-right px-3 py-2">Selskap i tre</th>
                <th className="text-right px-3 py-2">Omsetning</th>
                <th className="text-right px-3 py-2">M&amp;A</th>
                <th className="text-center px-3 py-2" title="0–10: hvor komplett kartleggingen er, ikke en vurdering av selskapet.">Datakvalitet</th>
                <th className="text-right px-3 py-2">Brreg</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr key={k.slug} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2">
                    <Link href={`/eierskap/${k.slug}`} className="font-semibold text-emerald-700 hover:underline">
                      {k.rootName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    {k.controllingOwner ? `${k.controllingOwner.name}${k.controllingOwner.pct !== null ? ` (${k.controllingOwner.pct}%)` : ''}` : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">{k.treeSize}</td>
                  <td className="px-3 py-2 text-right text-stone-700">{fmtRevenue(k.totalRevenue)}</td>
                  <td className="px-3 py-2 text-right">{k.maEventsCount}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded border ${SCORE_COLOR(k.qualityScore)}`}>{k.qualityScore}</span>
                  </td>
                  <td className="px-3 py-2 text-right text-stone-500 text-xs">{fmtDays(k.daysSinceBrregRefresh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
