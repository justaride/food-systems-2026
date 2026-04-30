import { getEvidenceStatusConfig } from '@/lib/visualization/status'
import type { EvidenceStatus } from '@/lib/visualization/types'

type EvidenceStatusBadgeProps = {
  status: EvidenceStatus
  prefix?: string
  detail?: string
  className?: string
}

export function EvidenceStatusBadge({ status, prefix = 'Datastatus', detail, className = '' }: EvidenceStatusBadgeProps) {
  const config = getEvidenceStatusConfig(status)
  const accessibleText = `${prefix}: ${config.label}. ${detail ?? config.description}`

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className} ${className}`}
      aria-label={accessibleText}
      title={detail ?? config.description}
    >
      <span className="text-[10px] uppercase tracking-wide opacity-75">{prefix}</span>
      <span>{config.label}</span>
    </span>
  )
}
