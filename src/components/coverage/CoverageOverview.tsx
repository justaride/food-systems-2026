'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CoverageBadge } from '@/components/coverage/CoverageBadge'
import type { CoverageProfile } from '@/lib/coverage/types'

type ProfilesFile = { computedAt: string; computedEnv: string; profiles: CoverageProfile[] }

export function CoverageOverview() {
  const [data, setData] = useState<ProfilesFile | null>(null)

  useEffect(() => {
    fetch('/data/coverage/profiles.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data || data.profiles.length === 0) return null

  return (
    <Card className="border-stone-200">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Datagrunnlag</p>
          <h2 className="text-sm font-semibold text-stone-800">Dekningsoversikt</h2>
        </div>
        <span className="text-[10px] text-stone-400">
          Beregnet {data.computedAt.slice(0, 10)} ({data.computedEnv})
        </span>
      </div>
      <div className="space-y-2">
        {data.profiles.map((p) => (
          <div key={p.datasetId} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 last:border-0">
            <span className="text-sm text-stone-700">{p.label}</span>
            <CoverageBadge profile={p} />
          </div>
        ))}
      </div>
      <details className="mt-3 border-t border-stone-100 pt-2">
        <summary className="cursor-pointer text-xs text-stone-500">Hva betyr merkene?</summary>
        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-stone-500">
          <p><strong>Tid:</strong> øyeblikksbilde = ett enkelt år · flere år = spredte år · tidsserie = minst fem sammenhengende år.</p>
          <p><strong>Geografi:</strong> NO/DK = ett land · Norden (5) = alle fem · «NO → nordisk ⚠» = kun norske data bak en nordisk-presentert figur.</p>
          <p><strong>Verifisering:</strong> andel poster en person har kvalitetssjekket manuelt. «ikke sporet» = datasettet har ingen verifiseringsdata (0 rader).</p>
          <p><strong>«Beregnet … (local)»</strong> = beregnet mot lokal database, ikke produksjon.</p>
        </div>
      </details>
    </Card>
  )
}
