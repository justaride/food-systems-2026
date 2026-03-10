import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StepCard } from '@/components/ui/StepCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { tenSteps } from '@/lib/data/ten-step-start'
import { kpis } from '@/lib/data/kpis'
import { evidencePack } from '@/lib/data/evidence-pack'

export default function MetodikkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Metodikk</h1>
        <p className="text-sm text-stone-400 mt-1">Ten Step Start v2.0, KPIs og Evidence Pack</p>
      </div>

      <Card title="Ten Step Start v2.0">
        <div className="space-y-2">
          {tenSteps.map(step => (
            <StepCard key={step.step} step={step} />
          ))}
        </div>
      </Card>

      <Card title="Core KPIs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpis.map(kpi => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </Card>

      <Card title="Evidence Pack (8 dokumenter)">
        <div className="space-y-2">
          {evidencePack.map((doc, i) => (
            <div
              key={doc.id}
              className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-stone-400 w-4">{i + 1}</span>
                <span className="text-sm text-stone-700">{doc.name}</span>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
