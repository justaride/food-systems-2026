import type { ReactNode } from 'react'

export type MissingValueReason =
  | 'not_collected'
  | 'not_reported'
  | 'no_financial_row'
  | 'not_applicable'
  | 'no_matching_record'

const missingTitles: Record<MissingValueReason, string> = {
  not_collected: 'Ikke innhentet',
  not_reported: 'Ikke rapportert i kilden',
  no_financial_row: 'Ingen regnskapsrad er innhentet',
  not_applicable: 'Ikke relevant for raden',
  no_matching_record: 'Ingen matchende rad i datagrunnlaget',
}

export function getMissingValueTitle(reason: MissingValueReason): string {
  return missingTitles[reason]
}

export function sortNullableNumberDesc(a: number | null | undefined, b: number | null | undefined): number {
  const aMissing = a == null
  const bMissing = b == null

  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1
  return b - a
}

export function formatCoverageFootnote(
  subject: string,
  covered: number,
  total: number,
  denominatorLabel: string,
): string {
  return `${subject} basert på ${covered.toLocaleString('nb-NO')} av ${total.toLocaleString('nb-NO')} ${denominatorLabel} med data.`
}

export function MissingValue({
  reason = 'not_collected',
  label = '—',
  className = '',
}: {
  reason?: MissingValueReason
  label?: ReactNode
  className?: string
}) {
  const title = getMissingValueTitle(reason)

  return (
    <span
      className={`text-stone-400 underline decoration-dotted underline-offset-2 ${className}`}
      title={title}
      aria-label={title}
      data-missing-value={reason}
    >
      {label}
    </span>
  )
}
