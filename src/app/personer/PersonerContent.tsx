'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type PersonRole = {
  companyId: string | null
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
}

type PersonProfileRow = {
  id: string
  name: string
  personKey: string
  roles: PersonRole[]
  biography: string | null
  linkedInUrl: string | null
  affiliations: string[]
  tags: string[]
}

export function PersonerContent({ persons }: { persons: PersonProfileRow[] }) {
  const [query, setQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)

  const allTags = [...new Set(persons.flatMap(p => p.tags))].sort()
  const totalRoles = persons.reduce((sum, p) => sum + p.roles.length, 0)
  const interlockingCount = persons.filter(p => p.roles.length > 1).length

  const filtered = persons.filter(person => {
    if (tagFilter && !person.tags.includes(tagFilter)) return false

    if (!deferredQuery.trim()) return true

    const haystack = [
      person.name,
      ...person.roles.map(r => r.companyName),
      ...person.roles.map(r => r.role),
      ...person.tags,
      ...person.affiliations,
    ].join(' ').toLowerCase()

    return haystack.includes(deferredQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Nokkelpersoner</h1>
          <p className="text-sm text-stone-500 mt-1">Profiler, roller og tilknytninger pa tvers av selskaper</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Personer</div>
            <div className="text-2xl font-bold text-stone-900">{persons.length}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Roller</div>
            <div className="text-2xl font-bold text-stone-900">{totalRoles}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Interlocking</div>
            <div className="text-2xl font-bold text-stone-900">{interlockingCount}</div>
          </div>
        </div>
      </div>

      <Card>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sok etter person, selskap eller tag..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                  tagFilter === tag
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen personer matcher soket" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  )
}

function PersonCard({ person }: { person: PersonProfileRow }) {
  const initials = person.name.split(' ').map(n => n[0]).join('')

  return (
    <Card className="!p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-bold text-stone-500 shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/personer/${person.personKey}`} className="text-base font-semibold text-stone-900 hover:text-emerald-700">
            {person.name}
          </Link>
          <p className="text-xs text-stone-400 mt-0.5">
            {person.roles.length} roller
            {person.roles.length > 1 && ' \u00b7 Kryssstyremedlem'}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {person.roles.slice(0, 3).map((role, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-stone-700 truncate mr-2">{role.companyName}</span>
            <span className="text-stone-400 shrink-0">{role.role}</span>
          </div>
        ))}
        {person.roles.length > 3 && (
          <p className="text-xs text-stone-400">+{person.roles.length - 3} flere</p>
        )}
      </div>

      {person.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {person.tags.map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
