import type { CoverageProfile } from '@/lib/coverage/types'
import { coverageBadgeModel, type ChipTone } from '@/lib/coverage/badge-model'

const TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-stone-200 bg-stone-50 text-stone-600',
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  bad: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function CoverageBadge({ profile, className = '' }: { profile: CoverageProfile; className?: string }) {
  const model = coverageBadgeModel(profile)
  const chips = [model.temporal, model.geo, model.verification]
  return (
    <span className={`inline-flex max-w-full flex-wrap items-center gap-1.5 text-xs ${className}`}>
      {chips.map((chip, i) => (
        <span
          key={i}
          title={chip.title}
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${TONE_CLASS[chip.tone]}`}
        >
          {chip.label}
        </span>
      ))}
    </span>
  )
}
