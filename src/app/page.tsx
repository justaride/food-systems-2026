import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getPhases, getTenSteps, getEvidenceDocs, getRecentInsights } from '@/lib/queries/project'
import type { KPI } from '@/lib/types'

const FOOD_SYSTEM_KPIS: KPI[] = [
  { id: 'butikker', name: 'Butikker kartlagt', description: 'OSM-data, 14 kjeder', current: '3 849' },
  { id: 'konsentrasjon', name: 'Markedskonsentrasjon', description: 'Tre kjeder dominerer', current: '96%', target: '<80%' },
  { id: 'selvforsyning', name: 'Selvforsyningsgrad', description: 'Meld. St. 11-mål innen 2030', current: '44%', target: '50%' },
  { id: 'matsvinn', name: 'Matsvinn', description: 'Årlig spiselig mat kastet', current: '390 000 t' },
]

export default async function OversiktPage() {
  const [phases, evidencePack, tenSteps, recentInsights] = await Promise.all([
    getPhases(),
    getEvidenceDocs(),
    getTenSteps(),
    getRecentInsights(3),
  ])

  const completedEvidence = evidencePack.filter(d => d.status === 'ferdig').length
  const completedSteps = tenSteps.filter(s => s.status === 'fullfort').length
  const currentStep = completedSteps + 1
  const activePhaseIndex = phases.findIndex(p => p.status === 'pagar')
  const activePhase = activePhaseIndex >= 0 ? phases[activePhaseIndex] : phases[0]

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <h1 className="text-xl font-bold text-stone-900">Food Systems 2026</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Kunnskapsbase som kartlegger selskapsstrukturer, eierskap, makt og forsyningskjeder
          i den norske og nordiske matsektoren — underlaget for NCH-transisjonsgruppens
          leveranse mot juni 2026.
        </p>
        <p className="text-sm text-stone-500">
          Ny her?{' '}
          <Link href="/innsikt" className="text-emerald-700 underline hover:text-emerald-800">
            Begynn med Innsikt
          </Link>{' '}
          — datadrevet status på markedsstruktur, selvforsyning og funn.
        </p>
        <details className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-stone-700">Nøkkelbegreper</summary>
          <dl className="mt-2 space-y-1.5 text-stone-600">
            <div><dt className="inline font-medium text-stone-800">Food TG</dt>
              <dd className="inline"> — Food Transition Group, prosjektets arbeidsgruppe.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Ten Step</dt>
              <dd className="inline"> — ti-stegs metodikk for å drive transisjonsgruppen.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Evidence Pack</dt>
              <dd className="inline"> — standardsettet av leveransedokumenter.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Spor A/B/C</dt>
              <dd className="inline"> — de tre scope-sporene: fôr/import, sidestrømmer, governance.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Claim-koder</dt>
              <dd className="inline"> — CL = claim, EV = evidence, SRC = kilde, med spor og nummer.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Forskningsrunder</dt>
              <dd className="inline"> — avgrensede runder med kunnskapsinnhenting.</dd></div>
          </dl>
        </details>
      </header>

      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Aktiv fase</p>
            <h2 className="text-lg font-bold text-emerald-900">
              Fase {activePhaseIndex + 1} — {activePhase.name}
            </h2>
            <p className="text-sm text-emerald-700 mt-1">
              {activePhase.weeks} · {activePhase.items.slice(0, 2).join(', ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-900">{activePhaseIndex + 1} / 4</p>
            <p className="text-[10px] text-emerald-600">faser</p>
          </div>
        </div>
        <div className="flex gap-1.5 mt-4">
          {phases.map((p) => (
            <div
              key={p.id}
              className={`flex-1 h-1 rounded-full ${
                p.status === 'fullfort' ? 'bg-emerald-500'
                : p.status === 'pagar' ? 'bg-emerald-400'
                : 'bg-emerald-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Evidence Pack</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{completedEvidence} / {evidencePack.length}</p>
          <ProgressBar value={completedEvidence} max={evidencePack.length} className="mt-2" />
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Ten Step</p>
          <p className="text-xl font-bold text-stone-900 mt-1">Steg {currentStep} / 10</p>
          <ProgressBar value={currentStep - 1} max={10} className="mt-2" />
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Matsystemdata</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FOOD_SYSTEM_KPIS.map(kpi => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>

      <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-700">Ny prototype</p>
            <h2 className="mt-1 text-base font-semibold text-stone-900">Matflyt Norge</h2>
            <p className="mt-1 text-sm text-stone-600">
              Egen flow-visning med kuraterte forbindelser mellom norske havner og logistikkhub-er.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1">Norge-only</span>
              <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1">15 forbindelser</span>
              <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1">Kartprototype</span>
            </div>
          </div>
          <div className="flex shrink-0">
            <Link
              href="/kart/no/flow"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Åpne flow prototype →
            </Link>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-stone-700">Siste innsikt</h3>
          <Link href="/innsikt" className="text-xs text-emerald-600 hover:text-emerald-700">Alle →</Link>
        </div>
        {recentInsights.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">Ingen innsikt enna</p>
        ) : (
          <div className="space-y-2">
            {recentInsights.map(item => (
              <div key={item.id} className="py-1.5 px-2 rounded-lg bg-stone-50">
                <p className="text-xs text-stone-700">{item.title}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Kilde: {item.source} · {item.insightType}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Ten-Step Methodology v2.1</h3>
        <div className="flex gap-1">
          {tenSteps.map(step => (
            <div
              key={step.step}
              className={`flex-1 text-center py-2 px-1 rounded-lg ${
                step.status === 'fullfort'
                  ? 'bg-emerald-100 border border-emerald-300'
                  : step.status === 'pagar'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-stone-50 border border-stone-200'
              }`}
            >
              <p className={`text-xs font-semibold ${
                step.status !== 'ikke-startet' ? 'text-emerald-700' : 'text-stone-400'
              }`}>
                {step.step}
              </p>
              <p className={`text-[9px] mt-0.5 truncate ${
                step.status !== 'ikke-startet' ? 'text-emerald-600' : 'text-stone-400'
              }`}>
                {step.theme.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
