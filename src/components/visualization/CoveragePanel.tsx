import type { CoverageSummary } from '@/lib/visualization/coverage'
import { coverageLevelClassName } from '@/lib/visualization/coverage'

type CoveragePanelProps = {
  coverage: CoverageSummary[]
}

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  if (coverage.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      {coverage.map(item => (
        <div key={item.label} className={`rounded-md border p-3 ${coverageLevelClassName[item.level]}`}>
          <p className="text-[10px] uppercase tracking-wider opacity-75">{item.label}</p>
          <p className="mt-1 text-xs leading-relaxed">{item.note}</p>
        </div>
      ))}
    </div>
  )
}
