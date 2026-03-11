import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { phases } from '@/lib/data/phases'
import { deliverables } from '@/lib/data/deliverables'
import { evidencePack } from '@/lib/data/evidence-pack'
import { tenSteps } from '@/lib/data/ten-step-start'
import { tasks } from '@/lib/data/tasks'
import { insights } from '@/lib/data/insights'

export default function OversiktPage() {
  const completedDeliverables = deliverables.filter(d => d.status === 'fullfort').length
  const completedEvidence = evidencePack.filter(d => d.status === 'ferdig').length
  const completedSteps = tenSteps.filter(s => s.status === 'fullfort').length
  const currentStep = completedSteps + 1
  const completedTasks = tasks.filter(t => t.status === 'fullfort').length
  const activePhaseIndex = phases.findIndex(p => p.status === 'pagar')
  const activePhase = activePhaseIndex >= 0 ? phases[activePhaseIndex] : phases[0]
  const openTasks = tasks.filter(t => t.status !== 'fullfort').slice(0, 5)
  const recentInsights = insights.slice(0, 3)

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Aktiv fase</p>
            <h1 className="text-lg font-bold text-emerald-900">
              Fase {activePhaseIndex + 1} — {activePhase.name}
            </h1>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Leveranser</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{completedDeliverables} / {deliverables.length}</p>
          <ProgressBar value={completedDeliverables} max={deliverables.length} className="mt-2" />
        </Card>
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
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Oppgaver</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{completedTasks} / {tasks.length}</p>
          <ProgressBar value={completedTasks} max={tasks.length} className="mt-2" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-stone-700">Aktive oppgaver</h3>
            <Link href="/oppgaver" className="text-xs text-emerald-600 hover:text-emerald-700">Alle →</Link>
          </div>
          <div className="space-y-2">
            {openTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg bg-stone-50">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  task.status === 'pagar' ? 'bg-amber-400' : 'bg-stone-300'
                }`} />
                <span className="text-xs text-stone-700 flex-1 truncate">{task.title}</span>
                <StatusBadge status={task.priority} />
              </div>
            ))}
            {tasks.filter(t => t.status !== 'fullfort').length > 5 && (
              <p className="text-xs text-stone-400 px-2">
                + {tasks.filter(t => t.status !== 'fullfort').length - 5} oppgaver
              </p>
            )}
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
                    Kilde: {item.source} · {item.type}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Ten Step Start v2.0</h3>
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
