import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Glossary } from '@/components/ui/Glossary'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FOOD_SYSTEM_KPIS } from '@/lib/data/forside-kpis'
import { getPhases, getTenSteps, getEvidenceDocs, getRecentInsights } from '@/lib/queries/project'

const READER_JOURNEY = [
  {
    label: 'Forstå prosjektet',
    href: '/mandat',
    status: 'Intern styring',
    description: 'Mandat, beslutningsporter og hva som fortsatt må avklares før sterkere språk.',
  },
  {
    label: 'Se hovedfunn',
    href: '/innsikt',
    status: 'Med forbehold',
    description: 'Hovedmønstre i marked, selvforsyning og verdikjede med claim- og kildechips.',
  },
  {
    label: 'Kontroller kilder',
    href: '/bibliotek',
    status: 'Kildekontroll',
    description: 'Dokumenter, rapporter og lokatorer som må bære hvert funn videre.',
  },
  {
    label: 'Forbered whitepaper',
    href: '/hvitbok',
    status: 'Utkastgrunnlag',
    description: 'Rapportstruktur og kapitler som skal holde intern analyse adskilt fra ekstern validering.',
  },
]

const SYSTEM_MODEL_STEPS = [
  {
    label: 'Verdikjedeledd',
    href: '/verdikjede',
    detail: 'Jord-til-bord-strukturen som gir hvert funn riktig plass.',
  },
  {
    label: 'Forsyningsdata',
    href: '/forsyningskjede',
    detail: 'Leveranser, relasjoner og vareflyt der datagrunnlaget finnes.',
  },
  {
    label: 'Kildekontroll',
    href: '/kilder',
    detail: 'Kilder, status og forbehold som avgjør om språk kan skjerpes.',
  },
]

function formatInsightDate(date: string | null | undefined) {
  if (!date) return 'Udatert'
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('no-NO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

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
        <Glossary category="prosjekt" title="Nøkkelbegreper" defaultOpen />
      </header>

      <section
        aria-labelledby="reader-journey-title"
        className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400">Leserreise</p>
            <h2 id="reader-journey-title" className="text-sm font-semibold text-stone-800">
              Startpunkt etter rolle og modenhet
            </h2>
          </div>
          <p className="max-w-lg text-xs text-stone-500">
            All lesing er intern og statusstyrt; ingen Food TG-claims er eksternt validert.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {READER_JOURNEY.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex min-h-32 flex-col justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                {entry.status}
              </span>
              <span className="mt-2 text-sm font-semibold text-stone-900 group-hover:text-emerald-900">
                {entry.label}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-stone-600">
                {entry.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

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

      <Card className="border-sky-200 bg-gradient-to-br from-white via-sky-50/50 to-emerald-50/60">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sky-700">Systemmodell</p>
            <h2 className="mt-1 text-base font-semibold text-stone-900">Slik henger systemet sammen</h2>
            <p className="mt-1 text-sm text-stone-600">
              Verdikjedeleddene gir strukturen, forsyningsdata viser relasjonene, og kildekontroll avgjør hva som kan brukes videre.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/metodikk"
                className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
              >
                Åpne full modell
              </Link>
              <Link
                href="/verdikjede"
                className="inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Se verdikjede
              </Link>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {SYSTEM_MODEL_STEPS.map((step, index) => (
              <Link
                key={step.href}
                href={step.href}
                className="group min-h-28 rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm transition-colors hover:border-sky-300 hover:bg-white"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="mt-2 block text-sm font-semibold text-stone-900 group-hover:text-sky-900">
                  {step.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-stone-600">
                  {step.detail}
                </span>
              </Link>
            ))}
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
                  Dato: {formatInsightDate(item.date)} · Kilde: {item.source} · {item.insightType}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Ten-Step Methodology v2.1</h3>
        <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
          {tenSteps.map(step => (
            <div
              key={step.step}
              className={`min-w-0 text-center py-2 px-1 rounded-lg ${
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
