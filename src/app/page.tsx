import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Glossary } from '@/components/ui/Glossary'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MatsystemetsSnitt } from '@/components/system/MatsystemetsSnitt'
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
          Kunnskaps- og beslutningssystem for å forstå hvordan innsatsvarer, produksjon,
          foredling, logistikk, marked, forbruk og ressursretur henger sammen i Norge og Norden.
        </p>
      </header>

      <MatsystemetsSnitt />

      <Glossary category="prosjekt" title="Nøkkelbegreper" />

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
            All lesing er intern og statusstyrt; ingen Food TG-claims er eksternt validert.{' '}
            <Link href="/veiledning" className="font-medium text-emerald-700 hover:text-emerald-800">
              Ny her? Start med brukerveiledningen →
            </Link>
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

      <section aria-labelledby="project-status-title" className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400">Intern arbeidsflate</p>
          <h2 id="project-status-title" className="mt-1 text-sm font-semibold text-stone-800">Prosjektstatus</h2>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Aktiv fase</p>
              <h3 className="text-lg font-bold text-emerald-900">
                Fase {activePhaseIndex + 1} — {activePhase.name}
              </h3>
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
      </section>

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
