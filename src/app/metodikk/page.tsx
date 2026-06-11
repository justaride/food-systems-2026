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
        <p className="text-sm text-stone-500 mt-1">
          Metodeflate for Ten-Step, modellforklaringer, Evidence Pack, KPIs og deep research-prompter.
          Claim-/statusarbeid styres på mandatflaten.
        </p>
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

      <Card title="Claim/status-cockpit ligger på mandatet">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm leading-relaxed text-stone-600">
              Denne metode-siden forklarer hvordan arbeidet kjøres. Claim-board, opportunity-radar,
              status-tellere og beslutningsporter ligger samlet på /mandat, slik at metode og
              styringsstatus ikke blandes.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Bruk /metodikk for prosess, modeller og prompts. Bruk /mandat når du skal se hva som
              er klart, hva som må bekreftes og hvilke claims som holdes tilbake.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            <Link
              href="/mandat"
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            >
              Åpne claim/status-cockpit →
            </Link>
          </div>
        </div>
      </Card>

      <Card title="Ten-Step Methodology v2.1">
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
