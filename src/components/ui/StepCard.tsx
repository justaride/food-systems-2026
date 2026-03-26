import type { TenStep } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

type StepCardProps = {
  step: TenStep
}

export function StepCard({ step }: StepCardProps) {
  return (
    <div className="card flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-bold text-stone-500">
        {step.step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-stone-800">{step.theme}</h4>
          <StatusBadge status={step.status} />
        </div>
        <p className="text-xs text-stone-500 mt-1">{step.output}</p>
        {step.description && (
          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{step.description}</p>
        )}
        {step.methodology && (
          <p className="text-[10px] text-emerald-600/70 mt-1 font-medium">{step.methodology}</p>
        )}
      </div>
    </div>
  )
}
