import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { phases } from '@/lib/data/phases'
import { deliverables } from '@/lib/data/deliverables'
import { evidencePack } from '@/lib/data/evidence-pack'
import { tenSteps } from '@/lib/data/ten-step-start'
import { tasks } from '@/lib/data/tasks'

export default function OversiktPage() {
  const completedDeliverables = deliverables.filter(d => d.status === 'fullfort').length
  const completedEvidence = evidencePack.filter(d => d.status === 'ferdig').length
  const currentStep = tenSteps.filter(s => s.status === 'fullfort').length + 1
  const currentPhase = phases.findIndex(p => p.status === 'pagar') + 1
  const openTasks = tasks.filter(t => t.status !== 'fullfort').slice(0, 7)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Food Systems 2026</h1>
        <p className="text-sm text-neutral-500 mt-1">NCH Transition Group - Forprosjekt</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Fase</p>
          <p className="text-2xl font-bold text-neutral-100 mt-1">{currentPhase} / 4</p>
          <p className="text-xs text-neutral-500 mt-1">{phases[currentPhase - 1]?.name}</p>
        </Card>
        <Card>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Leveranser</p>
          <p className="text-2xl font-bold text-neutral-100 mt-1">{completedDeliverables} / {deliverables.length}</p>
          <ProgressBar value={completedDeliverables} max={deliverables.length} className="mt-2" />
        </Card>
        <Card>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Evidence Pack</p>
          <p className="text-2xl font-bold text-neutral-100 mt-1">{completedEvidence} / {evidencePack.length}</p>
          <ProgressBar value={completedEvidence} max={evidencePack.length} className="mt-2" />
        </Card>
        <Card>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Ten Step</p>
          <p className="text-2xl font-bold text-neutral-100 mt-1">Steg {currentStep} / 10</p>
          <ProgressBar value={currentStep - 1} max={10} className="mt-2" />
        </Card>
      </div>

      <Card title="Arbeidsfaser">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((phase, i) => (
            <div
              key={phase.id}
              className={`rounded-lg border p-3 ${
                phase.status === 'pagar'
                  ? 'border-amber-700 bg-amber-950/20'
                  : phase.status === 'fullfort'
                    ? 'border-green-700 bg-green-950/20'
                    : 'border-neutral-800 bg-neutral-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-neutral-500">Fase {i + 1}</span>
                <StatusBadge status={phase.status} />
              </div>
              <h4 className="text-sm font-medium text-neutral-200">{phase.name}</h4>
              <p className="text-xs text-neutral-500 mt-0.5">{phase.weeks}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Apne oppgaver">
        <div className="space-y-2">
          {openTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                task.status === 'pagar' ? 'bg-amber-400' : 'bg-neutral-600'
              }`} />
              <span className="text-sm text-neutral-300 flex-1">{task.title}</span>
              <StatusBadge status={task.priority} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
