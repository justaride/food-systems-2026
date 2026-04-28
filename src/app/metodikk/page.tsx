import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StepCard } from '@/components/ui/StepCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { getTenSteps, getKpis, getEvidenceDocs } from '@/lib/queries/project'
import { getResearchPrompts } from '@/lib/queries/research-prompts'
import { CausalLoopDiagram } from '@/components/charts/CausalLoopDiagram'
import { EmergenceVisualization } from '@/components/charts/EmergenceVisualization'
import {
  foodTgMandateSummary,
  foodTgStatusLabels,
  type FoodTgValidationStatus,
} from '@/lib/data/food-tg-mandate'

const statusStyles: Record<FoodTgValidationStatus, string> = {
  'internt-trygt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'needs-primary-check': 'bg-sky-50 text-sky-700 border-sky-200',
  'needs-actor-validation': 'bg-amber-50 text-amber-700 border-amber-200',
  benchmark: 'bg-violet-50 text-violet-700 border-violet-200',
  hypotese: 'bg-stone-100 text-stone-600 border-stone-200',
}

export default async function MetodikkPage() {
  let activePromptsCount = 0
  try {
    const prompts = await getResearchPrompts()
    activePromptsCount = prompts.filter(p => p.status === 'aktiv' || p.status === 'delvis').length
  } catch {
    activePromptsCount = 0
  }

  const [tenSteps, kpis, evidencePack] = await Promise.all([
    getTenSteps(),
    getKpis(),
    getEvidenceDocs(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Metodikk</h1>
        <p className="text-sm text-stone-400 mt-1">Ten Step Start v2.0, mandat og validering, KPIs, Evidence Pack og deep research-prompter</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Deep research-prompter</h3>
            <p className="text-xs text-stone-500 mt-1">
              {activePromptsCount} operative prompt-maler for systematisk kunnskapsinnhenting via ChatGPT, Gemini, Perplexity og Claude deep research.
            </p>
          </div>
          <Link
            href="/metodikk/prompts"
            className="shrink-0 inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          >
            Se alle prompts →
          </Link>
        </div>
      </Card>

      <Card title="Mandat og validering">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.scope}</p>
            <p className="text-sm leading-relaxed text-stone-600">
              <span className="font-semibold text-stone-800">Beslutningsregel:</span> {foodTgMandateSummary.decisionRule}
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-block">
              {foodTgMandateSummary.externalValidation}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Scope-mote</p>
              <p className="text-sm font-semibold text-stone-800">{foodTgMandateSummary.decisionDate}</p>
            </div>
            <Link
              href="/mandat"
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            >
              Apne mandat-flate →
            </Link>
          </div>
        </div>
        <div className="mt-4 border-t border-stone-100 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Statusdisiplin for claims</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(foodTgStatusLabels) as [FoodTgValidationStatus, string][]).map(([status, label]) => (
              <span
                key={status}
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </Card>

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

      <Card title="Systemtenkning">
        <p className="text-sm text-stone-500 mb-4">Konseptuelle modeller og pedagogiske simuleringer for matvaresystemet</p>
        <div className="space-y-4">
          <CausalLoopDiagram />
          <EmergenceVisualization />
        </div>
      </Card>

      <Card title={`Evidence Pack (${evidencePack.length} dokumenter)`}>
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
