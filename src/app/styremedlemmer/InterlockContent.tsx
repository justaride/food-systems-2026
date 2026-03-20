'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { InterlockGraph } from '@/components/charts/InterlockGraph'
import type { InterlockGraphData } from '@/lib/queries/interlocks'

type ViewMode = 'graph' | 'table'

export function InterlockContent({ data }: { data: InterlockGraphData }) {
  const [view, setView] = useState<ViewMode>('graph')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedPerson = selectedNodeId?.startsWith('person-')
    ? data.persons.find(p => `person-${p.personKey}` === selectedNodeId)
    : null

  const selectedCompany = selectedNodeId?.startsWith('company-')
    ? (() => {
        const companyId = selectedNodeId.replace('company-', '')
        const personsAtCompany = data.persons.filter(p =>
          p.positions.some(pos => pos.companyId === companyId)
        )
        const companyName = data.nodes.find(n => n.id === selectedNodeId)?.label ?? ''
        return { companyId, companyName, persons: personsAtCompany }
      })()
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Kryssstyrer</h1>
        <p className="text-sm text-stone-500 mt-1">
          Personer med styreverv i flere selskaper
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kryssstyrer</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{data.stats.totalInterlocks}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Selskaper</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{data.stats.companiesInvolved}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Mest tilkoblet person</p>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {data.stats.mostConnectedPerson?.name ?? '-'}
          </p>
          <p className="text-xs text-stone-400">
            {data.stats.mostConnectedPerson ? `${data.stats.mostConnectedPerson.count} verv` : ''}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Mest tilkoblet selskap</p>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {data.stats.mostConnectedCompany?.name ?? '-'}
          </p>
          <p className="text-xs text-stone-400">
            {data.stats.mostConnectedCompany ? `${data.stats.mostConnectedCompany.count} koblinger` : ''}
          </p>
        </Card>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('graph')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            view === 'graph'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Graf
        </button>
        <button
          onClick={() => setView('table')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            view === 'table'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Tabell
        </button>
      </div>

      {view === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <InterlockGraph
            nodes={data.nodes}
            edges={data.edges}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNodeId}
          />
          <div className="space-y-4">
            {selectedPerson && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {selectedPerson.personName}
                  </h3>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Lukk
                  </button>
                </div>
                <p className="text-xs text-stone-400 mb-3">
                  {selectedPerson.positions.length} styreverv
                </p>
                <div className="space-y-2">
                  {selectedPerson.positions.map((pos, i) => (
                    <div key={i} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                      <p className="text-sm font-medium text-stone-800">{pos.companyName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{pos.role}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {selectedCompany && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {selectedCompany.companyName}
                  </h3>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Lukk
                  </button>
                </div>
                <p className="text-xs text-stone-400 mb-3">
                  {selectedCompany.persons.length} kryssstyremedlemmer
                </p>
                <div className="space-y-2">
                  {selectedCompany.persons.map(person => (
                    <div key={person.personKey} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                      <p className="text-sm font-medium text-stone-800">{person.personName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {person.positions.find(p => p.companyId === selectedCompany.companyId)?.role}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {!selectedPerson && !selectedCompany && (
              <Card>
                <p className="text-sm text-stone-400">
                  Klikk en node i grafen for detaljer
                </p>
              </Card>
            )}
            <div className="flex gap-4 text-xs text-stone-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#e11d48' }} />
                Selskap
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                Person
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.persons
            .sort((a, b) => b.positions.length - a.positions.length)
            .map(person => (
              <Card key={person.personKey}>
                <h3 className="text-sm font-semibold text-stone-900">{person.personName}</h3>
                <p className="text-xs text-stone-400 mt-0.5 mb-3">
                  {person.positions.length} styreverv
                </p>
                <div className="space-y-1.5">
                  {person.positions.map((pos, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-stone-700">{pos.companyName}</span>
                      <span className="text-xs text-stone-400">{pos.role}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
