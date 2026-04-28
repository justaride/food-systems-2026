import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StepCard } from '@/components/ui/StepCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { getTenSteps, getKpis, getEvidenceDocs } from '@/lib/queries/project'
import { getResearchPrompts } from '@/lib/queries/research-prompts'
import { CausalLoopDiagram } from '@/components/charts/CausalLoopDiagram'
import { EmergenceVisualization } from '@/components/charts/EmergenceVisualization'

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
        <p className="text-sm text-stone-400 mt-1">Ten Step Start v2.0, KPIs, Evidence Pack og deep research-prompter</p>
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
