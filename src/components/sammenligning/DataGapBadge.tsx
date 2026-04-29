type DataGapBadgeProps = { missing: number; total: number }

export function DataGapBadge({ missing, total }: DataGapBadgeProps) {
  if (missing === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <span aria-hidden>⚠</span>
      {missing} av {total} land mangler
    </span>
  )
}
