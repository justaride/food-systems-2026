import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { deliverables } from '@/lib/data/deliverables'
import { tasks } from '@/lib/data/tasks'
import { phases } from '@/lib/data/phases'

export default function LeveranserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Leveranser</h1>
        <p className="text-sm text-neutral-500 mt-1">Leveranser, oppgaver og arbeidsfaser</p>
      </div>

      <Card title="Leveranser (juni 2026)">
        <div className="space-y-2">
          {deliverables.map(d => (
            <div
              key={d.id}
              className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
            >
              <div>
                <span className="text-sm text-neutral-300">{d.name}</span>
                <span className="text-xs text-neutral-600 ml-2">{d.deadline}</span>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Oppgaver (fra 9. mars-motet)">
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                task.status === 'pagar' ? 'bg-amber-400'
                : task.status === 'fullfort' ? 'bg-green-400'
                : 'bg-neutral-600'
              }`} />
              <span className="text-sm text-neutral-300 flex-1">{task.title}</span>
              <StatusBadge status={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Arbeidsfaser">
        <div className="space-y-4">
          {phases.map((phase, i) => (
            <div key={phase.id} className="border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Fase {i + 1}: {phase.name}
                  </h4>
                  <p className="text-xs text-neutral-500">{phase.weeks}</p>
                </div>
                <StatusBadge status={phase.status} />
              </div>
              <ul className="space-y-1">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-neutral-400">
                    <span className="text-neutral-600 mt-0.5">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
