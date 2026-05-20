import type { EvidenceStatus } from '@/lib/visualization/types'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import { EvidenceStatusBadge } from './EvidenceStatusBadge'

type DataQualityStripItem = {
  label: string
  value: string | number
  status: EvidenceStatus
  detail?: string
  description?: string
  citationReadiness?: CitationReadinessLevel
  citationNote?: string
}

type DataQualityStripProps = {
  items: DataQualityStripItem[]
}

export function DataQualityStrip({ items }: DataQualityStripProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map(item => (
        <div key={item.label} className="rounded-md border border-stone-200 bg-white p-3">
          <EvidenceStatusBadge
            status={item.status}
            prefix={item.label}
            detail={item.detail}
            citationReadiness={item.citationReadiness}
            citationNote={item.citationNote}
          />
          <p className="mt-2 text-xl font-semibold text-stone-900 tabular-nums">{item.value}</p>
          {item.description && (
            <p className="mt-1 text-xs text-stone-500">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
