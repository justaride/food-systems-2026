'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterChips } from '@/components/ui/FilterChips'
type TaskRow = {
  id: string
  title: string
  source: string
  status: string
  priority: string
  phaseId?: string | null
  phase?: string | null
}

const statusFilters = [
  { label: 'Alle', value: 'alle' },
  { label: 'Ikke startet', value: 'ikke-startet' },
  { label: 'Pagar', value: 'pagar' },
  { label: 'Fullfort', value: 'fullfort' },
]

const phaseFilters = [
  { label: 'Alle faser', value: 'alle' },
  { label: 'Fase 1', value: 'fase-1' },
  { label: 'Fase 2', value: 'fase-2' },
  { label: 'Fase 3', value: 'fase-3' },
  { label: 'Fase 4', value: 'fase-4' },
]

const getPhase = (t: TaskRow) => t.phaseId ?? t.phase ?? null

export function OppgaverContent({ tasks }: { tasks: TaskRow[] }) {
  const [statusFilter, setStatusFilter] = useState('alle')
  const [phaseFilter, setPhaseFilter] = useState('alle')

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'alle' && t.status !== statusFilter) return false
    if (phaseFilter !== 'alle' && getPhase(t) !== phaseFilter) return false
    return true
  })

  const completed = tasks.filter(t => t.status === 'fullfort').length
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, t) => {
    const key = t.priority
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Oppgaver</h1>
        <p className="text-sm text-stone-400 mt-1">{tasks.length} oppgaver · {completed} fullfort</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterChips items={statusFilters} defaultValue="alle" onChange={setStatusFilter} />
        <div className="w-px h-4 bg-stone-200" />
        <FilterChips items={phaseFilters} defaultValue="alle" onChange={setPhaseFilter} />
      </div>

      <div className="space-y-6">
        {(['hoy', 'middels', 'lav'] as const).map(priority => {
          const group = grouped[priority]
          if (!group?.length) return null
          return (
            <div key={priority}>
              <p className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                {priority === 'hoy' ? 'Hoy prioritet' : priority === 'middels' ? 'Middels prioritet' : 'Lav prioritet'}
              </p>
              <div className="space-y-1.5">
                {group.map(task => (
                  <Card key={task.id} className="!p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        task.status === 'pagar' ? 'bg-amber-400'
                        : task.status === 'fullfort' ? 'bg-emerald-400'
                        : 'bg-stone-300'
                      }`} />
                      <span className="text-sm text-stone-700 flex-1">{task.title}</span>
                      {getPhase(task) && (
                        <span className="text-xs text-stone-400">
                          Fase {getPhase(task)!.replace('fase-', '')}
                        </span>
                      )}
                      <StatusBadge status={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
