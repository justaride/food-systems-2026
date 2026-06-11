'use client'

import { useEffect, useMemo, useState } from 'react'
import { CoverageBadge } from '@/components/coverage/CoverageBadge'
import type { CoverageProfile } from '@/lib/coverage/types'

type ProfilesFile = { computedAt: string; computedEnv: string; profiles: CoverageProfile[] }

export function CoverageBadgeStrip({
  datasetIds,
  title = 'Beregnet datadekning',
  note,
  compact = false,
  className = '',
}: {
  datasetIds: string[]
  title?: string
  note?: string
  compact?: boolean
  className?: string
}) {
  const [data, setData] = useState<ProfilesFile | null>(null)

  useEffect(() => {
    fetch('/data/coverage/profiles.json')
      .then((response) => response.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const profiles = useMemo(() => {
    if (!data) return []
    const byId = new Map(data.profiles.map((profile) => [profile.datasetId, profile]))
    return datasetIds.map((id) => byId.get(id)).filter((profile): profile is CoverageProfile => Boolean(profile))
  }, [data, datasetIds])

  if (!data || profiles.length === 0) return null

  return (
    <section
      aria-label="Beregnet datadekning"
      className={`rounded-lg border border-stone-200 bg-white/95 px-3 py-2 shadow-sm shadow-stone-900/[0.03] backdrop-blur ${className}`}
    >
      <div className={`flex gap-3 ${compact ? 'flex-col' : 'flex-col md:flex-row md:items-center md:justify-between'}`}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{title}</p>
          {note && <p className="mt-0.5 text-xs leading-snug text-stone-500">{note}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <div key={profile.datasetId} className="min-w-0">
              <p className="mb-1 truncate text-[10px] font-medium text-stone-500">{profile.label}</p>
              <CoverageBadge profile={profile} />
            </div>
          ))}
        </div>
      </div>
      {!compact && (
        <p className="mt-2 text-[10px] leading-snug text-stone-400">
          Beregnet {data.computedAt.slice(0, 10)} ({data.computedEnv})
        </p>
      )}
    </section>
  )
}
