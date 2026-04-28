'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { InterlockGraph } from '@/components/charts/InterlockGraph'
import type { InterlockGraphData } from '@/lib/queries/interlocks'
import {
  categorizeRole,
  normalizeRoleLabel,
  ROLE_CATEGORIES,
  ROLE_CATEGORY_ORDER,
  type RoleCategory,
} from '@/lib/role-category'
import { SECTORS, SECTOR_ORDER, type SectorKey } from '@/lib/sector'

type ViewMode = 'graph' | 'table'

function SectorDot({ sector }: { sector: SectorKey }) {
  const meta = SECTORS[sector]
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
      style={{ backgroundColor: meta.nodeColor }}
      title={meta.label}
    />
  )
}

function RoleBadge({ role }: { role: string }) {
  const cat = categorizeRole(role)
  const meta = ROLE_CATEGORIES[cat]
  const pretty = normalizeRoleLabel(role)
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${meta.badgeClass}`}
      title={`${meta.label}${pretty && pretty.toLowerCase() !== meta.label.toLowerCase() ? ` — ${pretty}` : ''}`}
    >
      {pretty || meta.label}
    </span>
  )
}

export function InterlockContent({
  data,
  initialSelection = null,
}: {
  data: InterlockGraphData
  initialSelection?: string | null
}) {
  const [view, setView] = useState<ViewMode>('graph')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialSelection)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<Set<RoleCategory>>(new Set())
  const [sectorFilter, setSectorFilter] = useState<Set<SectorKey>>(new Set())
  const [crossSectorOnly, setCrossSectorOnly] = useState(false)
  const deferredQuery = useDeferredValue(query)

  // Count available role categories in the dataset (used to hide empty
  // checkboxes).
  const roleCounts = useMemo(() => {
    const counts = new Map<RoleCategory, number>()
    for (const p of data.persons) {
      for (const pos of p.positions) {
        const cat = categorizeRole(pos.role)
        counts.set(cat, (counts.get(cat) ?? 0) + 1)
      }
    }
    return counts
  }, [data.persons])

  const availableRoles = useMemo(
    () => ROLE_CATEGORY_ORDER.filter(r => (roleCounts.get(r) ?? 0) > 0),
    [roleCounts]
  )

  // Count available sectors in the dataset (only show sector pills that
  // actually have companies represented in the interlocks).
  const sectorCounts = useMemo(() => {
    const counts = new Map<SectorKey, number>()
    const seenCompaniesPerSector = new Map<SectorKey, Set<string>>()
    for (const p of data.persons) {
      for (const pos of p.positions) {
        const set = seenCompaniesPerSector.get(pos.sector) ?? new Set<string>()
        set.add(pos.companyId)
        seenCompaniesPerSector.set(pos.sector, set)
      }
    }
    for (const [sector, set] of seenCompaniesPerSector) {
      counts.set(sector, set.size)
    }
    return counts
  }, [data.persons])

  const availableSectors = useMemo(
    () => SECTOR_ORDER.filter(s => (sectorCounts.get(s) ?? 0) > 0),
    [sectorCounts]
  )

  // Filter the interlock list.
  const filteredPersons = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim()
    const hasRoleFilter = roleFilter.size > 0
    const hasSectorFilter = sectorFilter.size > 0

    return data.persons.filter(person => {
      const positions = person.positions

      if (crossSectorOnly && person.sectors.length < 2) return false

      // Role filter: person passes if at least one position matches
      if (hasRoleFilter) {
        const anyMatch = positions.some(pos => roleFilter.has(categorizeRole(pos.role)))
        if (!anyMatch) return false
      }

      // Sector filter: person passes if at least one position is in a
      // selected sector.
      if (hasSectorFilter) {
        const anyMatch = positions.some(pos => sectorFilter.has(pos.sector))
        if (!anyMatch) return false
      }

      if (!q) return true

      if (person.personName.toLowerCase().includes(q)) return true
      return positions.some(
        pos =>
          pos.companyName.toLowerCase().includes(q) ||
          pos.role.toLowerCase().includes(q)
      )
    })
  }, [data.persons, deferredQuery, roleFilter, sectorFilter, crossSectorOnly])

  // Stats block — recomputed over the filtered set so the counts respond to
  // the active filters.
  const filteredStats = useMemo(() => {
    const uniquePersons = filteredPersons.length
    const companyIds = new Set<string>()
    let multiRolePersons = 0
    let crossSectorPersons = 0
    for (const p of filteredPersons) {
      if (p.positions.length >= 2) multiRolePersons += 1
      if (p.sectors.length >= 2) crossSectorPersons += 1
      for (const pos of p.positions) companyIds.add(pos.companyId)
    }
    return {
      uniquePersons,
      uniqueCompanies: companyIds.size,
      multiRolePersons,
      crossSectorPersons,
    }
  }, [filteredPersons])

  // Filtered graph: only keep person nodes in filtered set and the companies
  // they touch; drop orphan company nodes.
  const filteredGraph = useMemo(() => {
    const keepPersonIds = new Set(filteredPersons.map(p => `person-${p.personKey}`))
    const keepCompanyIds = new Set<string>()
    for (const p of filteredPersons) {
      for (const pos of p.positions) keepCompanyIds.add(`company-${pos.companyId}`)
    }
    const nodes = data.nodes.filter(n =>
      n.type === 'person' ? keepPersonIds.has(n.id) : keepCompanyIds.has(n.id)
    )
    const edges = data.edges.filter(e => {
      const src = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tgt = typeof e.target === 'string' ? e.target : (e.target as any).id
      return keepPersonIds.has(src) && keepCompanyIds.has(tgt)
    })
    return { nodes, edges }
  }, [data.nodes, data.edges, filteredPersons])

  const selectedPerson = selectedNodeId?.startsWith('person-')
    ? filteredPersons.find(p => `person-${p.personKey}` === selectedNodeId)
    : null

  const selectedCompany = selectedNodeId?.startsWith('company-')
    ? (() => {
        const companyId = selectedNodeId.replace('company-', '')
        const personsAtCompany = filteredPersons.filter(p =>
          p.positions.some(pos => pos.companyId === companyId)
        )
        const companyNode = filteredGraph.nodes.find(n => n.id === selectedNodeId)
        const companyName = companyNode?.label ?? ''
        const sector = companyNode?.sector
        return { companyId, companyName, persons: personsAtCompany, sector }
      })()
    : null

  const toggleRole = (role: RoleCategory) => {
    setRoleFilter(prev => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  const toggleSector = (sector: SectorKey) => {
    setSectorFilter(prev => {
      const next = new Set(prev)
      if (next.has(sector)) next.delete(sector)
      else next.add(sector)
      return next
    })
  }

  const clearAll = () => {
    setQuery('')
    setRoleFilter(new Set())
    setSectorFilter(new Set())
    setCrossSectorOnly(false)
  }

  const hasActiveFilter =
    query.trim().length > 0 ||
    roleFilter.size > 0 ||
    sectorFilter.size > 0 ||
    crossSectorOnly

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
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Unike personer</p>
          <p className="text-xl font-bold text-stone-900 mt-1">
            {filteredStats.uniquePersons.toLocaleString('no')}
          </p>
          {hasActiveFilter && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              av {data.stats.totalInterlocks.toLocaleString('no')}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Unike selskaper</p>
          <p className="text-xl font-bold text-stone-900 mt-1">
            {filteredStats.uniqueCompanies.toLocaleString('no')}
          </p>
          {hasActiveFilter && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              av {data.stats.companiesInvolved.toLocaleString('no')}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Klynger (2+ verv)</p>
          <p className="text-xl font-bold text-stone-900 mt-1">
            {filteredStats.multiRolePersons.toLocaleString('no')}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">personer med 2+ verv</p>
        </Card>
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kryssektor</p>
          <p className="text-xl font-bold text-stone-900 mt-1">
            {filteredStats.crossSectorPersons.toLocaleString('no')}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">verv i 2+ sektorer</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Mest tilkoblet</p>
            <p className="text-base font-semibold text-stone-900 mt-1 truncate">
              {data.stats.mostConnectedPerson?.name ?? '-'}
              {data.stats.mostConnectedPerson && (
                <span className="ml-2 text-xs text-stone-400 font-normal">
                  {data.stats.mostConnectedPerson.count} verv
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk på person, selskap eller rolletittel..."
            className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {hasActiveFilter && (
            <>
              <span className="text-xs text-stone-400">
                {filteredPersons.length} treff
              </span>
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              >
                Nullstill
              </button>
            </>
          )}
        </div>

        <div className="mt-3">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1.5">Rolle</p>
          <div className="flex flex-wrap gap-1.5">
            {availableRoles.map(role => {
              const meta = ROLE_CATEGORIES[role]
              const active = roleFilter.has(role)
              const count = roleCounts.get(role) ?? 0
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                    active
                      ? meta.badgeClass
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>{meta.label}</span>
                  <span className={active ? 'opacity-70' : 'text-stone-400'}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Sektor</p>
            <button
              onClick={() => setCrossSectorOnly(v => !v)}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                crossSectorOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
              title="Vis kun personer med styreverv i 2+ sektorer"
            >
              Kun kryssektor
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSectors.map(sector => {
              const meta = SECTORS[sector]
              const active = sectorFilter.has(sector)
              const count = sectorCounts.get(sector) ?? 0
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                    active
                      ? meta.badgeClass
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.nodeColor }}
                  />
                  <span>{meta.label}</span>
                  <span className={active ? 'opacity-70' : 'text-stone-400'}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

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

      {filteredPersons.length === 0 ? (
        <EmptyState message="Ingen kryssstyrer matcher filteret" />
      ) : view === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <InterlockGraph
            nodes={filteredGraph.nodes}
            edges={filteredGraph.edges}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNodeId}
          />
          <div className="space-y-4">
            {selectedPerson && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/personer/${selectedPerson.personKey}`}
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    {selectedPerson.personName} &rarr;
                  </Link>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Lukk
                  </button>
                </div>
                <p className="text-xs text-stone-400 mb-3">
                  {selectedPerson.positions.length} styreverv
                  {selectedPerson.sectors.length > 1 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-medium">
                      Kryssektor
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {selectedPerson.positions.map((pos, i) => (
                    <div key={i} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                      <p className="text-sm font-medium text-stone-800">
                        <SectorDot sector={pos.sector} />
                        {pos.companyName}
                      </p>
                      <div className="mt-1">
                        <RoleBadge role={pos.role} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {selectedCompany && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {selectedCompany.sector && <SectorDot sector={selectedCompany.sector} />}
                    {selectedCompany.companyName}
                  </h3>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Lukk
                  </button>
                </div>
                {selectedCompany.sector && (
                  <p className="text-[11px] text-stone-500 mb-2">
                    Sektor: {SECTORS[selectedCompany.sector].label}
                  </p>
                )}
                <p className="text-xs text-stone-400 mb-3">
                  {selectedCompany.persons.length} kryssstyremedlemmer
                </p>
                <div className="space-y-2">
                  {selectedCompany.persons.map(person => {
                    const pos = person.positions.find(
                      p => p.companyId === selectedCompany.companyId
                    )
                    return (
                      <div
                        key={person.personKey}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
                      >
                        <p className="text-sm font-medium text-stone-800">
                          {person.personName}
                          {person.sectors.length > 1 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-medium">
                              kryssektor
                            </span>
                          )}
                        </p>
                        {pos && (
                          <div className="mt-1">
                            <RoleBadge role={pos.role} />
                          </div>
                        )}
                      </div>
                    )
                  })}
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
            <div className="px-1 space-y-1.5">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Tegnforklaring</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                  Person
                </span>
                {availableSectors.map(s => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SECTORS[s].nodeColor }}
                    />
                    {SECTORS[s].label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPersons
            .slice()
            .sort((a, b) => b.positions.length - a.positions.length)
            .map(person => (
              <Card key={person.personKey}>
                <Link
                  href={`/personer/${person.personKey}`}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  {person.personName}
                </Link>
                <p className="text-xs text-stone-400 mt-0.5 mb-3">
                  {person.positions.length} styreverv
                  {person.sectors.length > 1 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-medium">
                      {person.sectors.length} sektorer
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {person.positions.map((pos, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-stone-700 flex-1 min-w-0 break-words">
                        <SectorDot sector={pos.sector} />
                        {pos.companyName}
                      </span>
                      <RoleBadge role={pos.role} />
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
