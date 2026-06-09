'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InternalSection } from '@/components/ui/InternalSection'
import type { KonsernDossierData, MaEvent } from '@/lib/queries/ownership'
import { OwnershipTreeDiagram } from '@/components/charts/OwnershipTreeDiagram'
import { Section4Economy } from './sections/Section4Economy'
import { Section5Board } from './sections/Section5Board'
import { Section6Subsidies } from './sections/Section6Subsidies'
import { Section7Properties } from './sections/Section7Properties'
import { Section8Relationships } from './sections/Section8Relationships'
import { Section9DataQuality } from './sections/Section9DataQuality'

const OWNERSHIP_TYPE_LABEL: Record<string, string> = {
  family:      'Familieeid',
  cooperative: 'Samvirke',
  state:       'Statlig',
  foreign:     'Utenlandsk',
  listed:      'Børsnotert',
  subsidiary:  'Datterselskap',
}

const OWNERSHIP_TYPE_CLASS: Record<string, string> = {
  family:      'bg-amber-50 text-amber-800 border-amber-200',
  cooperative: 'bg-teal-50 text-teal-800 border-teal-200',
  state:       'bg-blue-50 text-blue-800 border-blue-200',
  foreign:     'bg-violet-50 text-violet-800 border-violet-200',
  listed:      'bg-emerald-50 text-emerald-800 border-emerald-200',
  subsidiary:  'bg-stone-100 text-stone-700 border-stone-300',
}

const DEAL_TYPE_LABEL: Record<string, string> = {
  acquisition:    'Oppkjøp',
  merger:         'Fusjon',
  divestment:     'Frasalg',
  'partial-sale': 'Delsalg',
}

const DEAL_TYPE_CLASS: Record<string, string> = {
  acquisition:    'bg-emerald-50 text-emerald-800 border-emerald-200',
  merger:         'bg-blue-50 text-blue-800 border-blue-200',
  divestment:     'bg-rose-50 text-rose-800 border-rose-200',
  'partial-sale': 'bg-amber-50 text-amber-800 border-amber-200',
}

function fmtRevenueMNok(nok: number | null): string {
  if (nok === null) return '—'
  const mnok = nok / 1_000_000
  if (mnok >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  return `${mnok.toFixed(0)} MNOK`
}

function fmtEmployees(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('no-NO')
}

function fmtDaysSince(n: number | null): string {
  if (n === null) return 'Aldri'
  if (n === 0) return 'I dag'
  if (n < 30) return `${n} dager siden`
  if (n < 365) return `${Math.floor(n / 30)} mnd siden`
  return `${Math.floor(n / 365)} år siden`
}

function fmtEventDate(iso: string | null): string {
  if (iso === null) return 'Udatert'
  const d = new Date(iso)
  return d.toLocaleDateString('no-NO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://')
}

type StatBoxProps = {
  label: string
  value: string
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="flex flex-col items-start px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg min-w-[120px]">
      <span className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</span>
      <span className="text-lg font-bold text-stone-900 tabular-nums">{value}</span>
    </div>
  )
}

function MaEventCard({ event }: { event: MaEvent }) {
  const dealLabel = event.dealType
    ? (DEAL_TYPE_LABEL[event.dealType] ?? event.dealType)
    : null
  const dealClass = event.dealType
    ? (DEAL_TYPE_CLASS[event.dealType] ?? 'bg-stone-100 text-stone-700 border-stone-300')
    : null

  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-stone-500 tabular-nums">
          {fmtEventDate(event.effectiveFrom)}
        </span>
        {dealLabel && dealClass && (
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${dealClass}`}>
            {dealLabel}
          </span>
        )}
        <span className="text-sm font-semibold text-stone-900">{event.childName}</span>
      </div>
      {event.dealValue && (
        <p className="text-sm text-stone-700">
          <span className="text-stone-500">Verdi: </span>{event.dealValue}
        </p>
      )}
      {event.notes && (
        <p className="text-sm text-stone-600">{event.notes}</p>
      )}
      {event.source && (
        <p className="text-xs text-stone-400 mt-0.5">
          Kilde:{' '}
          {isUrl(event.source) ? (
            <a
              href={event.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline break-all"
            >
              {event.source}
            </a>
          ) : (
            <span className="text-stone-500">{event.source}</span>
          )}
        </p>
      )}
    </div>
  )
}

type Props = {
  dossier: KonsernDossierData
}

export function KonsernDossier({ dossier }: Props) {
  const { root, ownershipType, controllingOwner, metrics, tree, maEvents, financials, board, subsidies, properties, relationships } = dossier
  const [treeView, setTreeView] = useState<'diagram' | 'table'>('diagram')

  const ownershipLabel = ownershipType
    ? (OWNERSHIP_TYPE_LABEL[ownershipType] ?? ownershipType)
    : null
  const ownershipClass = ownershipType
    ? (OWNERSHIP_TYPE_CLASS[ownershipType] ?? 'bg-stone-100 text-stone-700 border-stone-300')
    : null

  const datedEvents = maEvents.filter(e => e.effectiveFrom !== null)
  const undatedEvents = maEvents.filter(e => e.effectiveFrom === null)

  return (
    <div className="space-y-8">
      {/* Section 1: Header */}
      <div>
        <Link
          href="/eierskap"
          className="text-xs text-stone-400 hover:text-stone-600 hover:underline mb-2 inline-block"
        >
          &larr; Tilbake til eierskap
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-900">{root.name}</h1>
          {ownershipLabel && ownershipClass && (
            <span
              className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${ownershipClass}`}
            >
              {ownershipLabel}
            </span>
          )}
        </div>

        {controllingOwner && (
          <p className="text-sm text-stone-600 mt-1">
            Kontrollerende eier:{' '}
            <span className="font-medium text-stone-800">{controllingOwner.name}</span>
            {controllingOwner.pct !== null && (
              <span className="text-stone-500"> ({controllingOwner.pct}%)</span>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <StatBox
            label="Selskap i tre"
            value={metrics.treeSize.toString()}
          />
          <StatBox
            label="Sum omsetning"
            value={fmtRevenueMNok(metrics.totalRevenue)}
          />
          <StatBox
            label="Sum ansatte"
            value={fmtEmployees(metrics.totalEmployees)}
          />
          <StatBox
            label="Sist oppdatert fra Brønnøysund"
            value={fmtDaysSince(metrics.daysSinceBrregRefresh)}
          />
        </div>
      </div>

      {/* Section 2: Konsernstruktur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-900">Konsernstruktur</h2>
          {metrics.treeSize > 30 && (
            <div className="flex gap-1">
              <button
                onClick={() => setTreeView('diagram')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  treeView === 'diagram'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                Diagram
              </button>
              <button
                onClick={() => setTreeView('table')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  treeView === 'table'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                Vis som tabell
              </button>
            </div>
          )}
        </div>

        {treeView === 'diagram' || metrics.treeSize <= 30 ? (
          <OwnershipTreeDiagram tree={tree} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">Morselskap</th>
                  <th className="text-left px-3 py-2">Datterselskap</th>
                  <th className="text-right px-3 py-2">Eierandel</th>
                  <th className="text-left px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {tree.edges
                  .filter(edge => !edge.parentId.startsWith('shareholder-'))
                  .map((edge, i) => {
                    const parent = tree.nodes.find(n => n.id === edge.parentId)
                    const child = tree.nodes.find(n => n.id === edge.childId)
                    return (
                      <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-3 py-2 text-stone-700">{parent?.name ?? edge.parentId}</td>
                        <td className="px-3 py-2">
                          <Link href={`/selskap/${edge.childId}`} className="text-emerald-700 hover:underline">
                            {child?.name ?? edge.childId}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-600">
                          {edge.ownershipPct != null ? `${edge.ownershipPct}%` : '—'}
                        </td>
                        <td className="px-3 py-2 text-stone-500">{edge.ownershipType}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: M&A-historikk */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">M&amp;A-historikk</h2>

        {maEvents.length === 0 ? (
          <p className="text-sm text-stone-400 italic">Ingen M&amp;A-events registrert</p>
        ) : (
          <div className="space-y-6">
            {datedEvents.length > 0 && (
              <div className="space-y-2">
                {datedEvents.map((event, i) => (
                  <MaEventCard key={`dated-${i}`} event={event} />
                ))}
              </div>
            )}

            {undatedEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                  Udatert
                </h3>
                <div className="space-y-2">
                  {undatedEvents.map((event, i) => (
                    <MaEventCard key={`undated-${i}`} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Section4Economy financials={financials} />
      <Section5Board board={board} />
      <Section6Subsidies subsidies={subsidies} slug={dossier.slug} />
      <Section7Properties properties={properties} slug={dossier.slug} />
      <Section8Relationships relationships={relationships} />
      <InternalSection label="Datakvalitet og berikelseskilder">
        <Section9DataQuality coverage={dossier.coverage} />
      </InternalSection>
    </div>
  )
}
