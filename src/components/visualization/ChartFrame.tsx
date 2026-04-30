import { Card } from '@/components/ui/Card'
import type { VisualizationDataContract } from '@/lib/visualization/types'
import { EvidenceStatusBadge } from './EvidenceStatusBadge'
import { SourceFootnote } from './SourceFootnote'

type ChartFrameProps = {
  title: string
  contract: VisualizationDataContract
  children: React.ReactNode
  className?: string
}

export function ChartFrame({ title, contract, children, className = '' }: ChartFrameProps) {
  return (
    <Card title={title} className={className}>
      <div className="mb-4 flex flex-col gap-2 border-b border-stone-100 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-800">{contract.question}</p>
          <p className="mt-1 text-xs text-stone-500">
            {contract.unit} · {contract.period}
          </p>
        </div>
        <EvidenceStatusBadge
          status={contract.evidenceStatus}
          detail={contract.coverageNote}
        />
      </div>
      {children}
      {contract.coverageNote && (
        <p className="mt-3 text-xs text-stone-500">{contract.coverageNote}</p>
      )}
      <SourceFootnote sourceRefs={contract.sourceRefs} className="mt-2" />
    </Card>
  )
}
